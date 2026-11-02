const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {hash} = require('../registry/source-inventory.cjs');
const cwd = path.join(__dirname, '.work/source');
const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts/source-snapshot.json')));
for (const pin of snapshot.files) if (hash(fs.readFileSync(path.join(cwd, pin.path))) !== pin.sha256) throw new Error('STALE_SNAPSHOT: ' + pin.path);
const tsc = require.resolve('typescript/bin/tsc');
for (const [module, dir] of [['ESNext', 'esm'], ['commonjs', 'cjs']]) {
    cp.execFileSync(process.execPath, [tsc, '-p', 'tsconfig.pilot.json', '--module', module, '--outDir', 'dist/' + dir], {cwd, stdio: 'inherit'});
}
process.env.CORP_THEME = 'true';
const postcss = require('postcss');
const config = require(path.join(cwd, 'postcss.config.js'));
(async () => {
    const cssWarnings = [];
    for (const relative of snapshot.css) {
        const filename = path.join(cwd, relative);
        const result = await postcss(config.plugins).process(fs.readFileSync(filename, 'utf8'), {from: filename});
        cssWarnings.push(...result.warnings().map(w => ({path: relative, message: w.text, plugin: w.plugin})));
        for (const dir of ['esm', 'cjs']) {
            const target = path.join(cwd, 'dist', dir, path.relative('src', relative));
            fs.mkdirSync(path.dirname(target), {recursive: true});
            fs.writeFileSync(target, result.css);
        }
    }
    cp.execFileSync(process.execPath, ['tools/build/copy-package-json.mjs'], {cwd, stdio: 'inherit', env: {...process.env, BUILD_FORMAT: 'esm'}});
    const distribution = path.join(cwd, 'dist');
    const link = path.join(__dirname, 'node_modules/arui-private');
    if (fs.existsSync(link)) {
        if (!fs.lstatSync(link).isSymbolicLink() || fs.realpathSync(link) !== distribution) throw new Error('UNEXPECTED_ARUI_PRIVATE_INSTALL');
    } else fs.symlinkSync(distribution, link, 'dir');
    const publicImports = ['arui-private/button-group', 'arui-private/corporate-content'].map(specifier => ({specifier, cjsResolvedPath: require.resolve(specifier), typesPath: path.join(distribution, 'esm', specifier.split('/')[1], 'index.d.ts')}));
    const pins = [];
    function visit(dir) {for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {const p = path.join(dir, entry.name); if (entry.isDirectory()) visit(p); else pins.push({path: path.relative(distribution, p), sha256: hash(fs.readFileSync(p))});}}
    visit(distribution);
    const receipt = {status: 'local-subpath-build-pass', source: snapshot, publicImports, files: pins, declarationEmit: 'pass', sourceTypecheck: 'pass', styles: 'real-source-postcss-config',
        distributionKind: 'local build of two source subpaths, not published/private full distribution', completeLibraryBuild: 'blocked-by-private-package-source', mocksOrStubs: false, cssWarnings};
    fs.writeFileSync(path.join(__dirname, 'artifacts/subpath-build.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify({status: receipt.status, publicImports, fileCount: pins.length, cssWarnings}));
})().catch(error => {console.error(error.message); process.exitCode = 1;});
