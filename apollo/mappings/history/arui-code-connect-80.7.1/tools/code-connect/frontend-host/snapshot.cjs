const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const ts = require('typescript');
const {hash} = require('../registry/source-inventory.cjs');
const bridge = require('../registry/consumer.cjs');
const repo = path.resolve(__dirname, '../../..');
const registry = bridge.loadRegistry();
const lock = require('../registry/lock.v1.json');
bridge.verifyLock(registry, lock);
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim();
if (head !== registry.source.commit || JSON.parse(fs.readFileSync(path.join(repo, 'package.json'))).version !== registry.source.version) throw new Error('STALE_CODE_CHECKOUT');
for (const pin of [...registry.source.files, ...registry.mappingArtifacts]) {
    if (hash(fs.readFileSync(path.join(repo, pin.path))) !== pin.sha256) throw new Error('STALE_CODE_OR_MAPPING: ' + pin.path);
}
const files = new Set(), css = new Set(), external = new Set();
function visitCss(relative) {
    if (css.has(relative)) return;
    css.add(relative);
    const filename = path.join(repo, relative);
    const source = fs.readFileSync(filename, 'utf8');
    for (const match of source.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
        const spec = match[1];
        if (spec.startsWith('.')) visitCss(path.relative(repo, path.resolve(path.dirname(filename), spec)));
        else external.add(spec);
    }
}
function visit(relative) {
    if (files.has(relative)) return;
    files.add(relative);
    const filename = path.join(repo, relative);
    const source = ts.createSourceFile(relative, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
        if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) continue;
        const spec = statement.moduleSpecifier.text;
        if (!spec.startsWith('.')) { external.add(spec); continue; }
        const base = path.resolve(path.dirname(filename), spec);
        if (base.endsWith('.css')) { visitCss(path.relative(repo, base)); continue; }
        const found = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map(e => base + e).find(fs.existsSync);
        if (!found) throw new Error('UNRESOLVED_SOURCE_IMPORT: ' + relative + '/' + spec);
        visit(path.relative(repo, found));
    }
}
visit('src/button-group/index.ts');
visit('src/corporate-content/index.ts');
visitCss('src/vars.css');
for (const f of [...css, 'src/vars.css', 'src/module.d.ts', 'src/lib/mq/custom-media-queries.css', 'package.json', 'tsconfig.json', 'postcss.config.js', 'tools/build/copy-package-json.mjs', 'tools/build/utils.mjs']) files.add(f);
const destination = path.join(__dirname, '.work/source');
fs.mkdirSync(destination, {recursive: true});
const pins = [...files].sort().map(relative => {
    const raw = fs.readFileSync(path.join(repo, relative));
    const target = path.join(destination, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, raw);
    return {path: relative, sha256: hash(raw)};
});
const modules = path.join(destination, 'node_modules');
if (!fs.existsSync(modules)) fs.symlinkSync(path.join(__dirname, 'node_modules'), modules, 'dir');
const buildConfig = {extends: './tsconfig.json', compilerOptions: {module: 'ESNext', declaration: true, emitDeclarationOnly: false, noEmitOnError: true, rootDir: 'src', outDir: 'dist/esm', incremental: false, types: ['react', 'react-dom']},
    files: ['src/module.d.ts', 'src/button-group/index.ts', 'src/corporate-content/index.ts'], include: [], exclude: []};
fs.writeFileSync(path.join(destination, 'tsconfig.pilot.json'), JSON.stringify(buildConfig, null, 2) + '\n');
let currentInputFreshness;
try { bridge.verifySource(registry, repo, path.dirname(repo)); currentInputFreshness = {status: 'pass'}; }
catch (error) { currentInputFreshness = {status: 'blocked', diagnostic: error.code || error.name, message: error.message}; }
const receipt = {status: 'source-snapshot-pass', sourcePackage: registry.source.package, sourceVersion: registry.source.version, sourceCommit: head,
    registryDigest: registry.registryDigest, lock, currentInputFreshness, coverage: 'two public subpath source closures; not a complete library build',
    files: pins, css: [...css].sort(), externalImports: [...external].sort(), buildConfigSha256: hash(JSON.stringify(buildConfig)), sourceImplementationEdits: false};
const example = fs.readFileSync(path.join(__dirname, '../examples/PilotDesktop.generated.tsx'));
fs.mkdirSync(path.join(__dirname, 'src'), {recursive: true});
fs.writeFileSync(path.join(__dirname, 'src/PilotDesktop.generated.tsx'), example);
receipt.exampleSha256 = hash(example);
receipt.environmentManifestSha256 = hash(fs.readFileSync(path.join(__dirname, 'package.json')));
receipt.environmentLockSha256 = hash(fs.readFileSync(path.join(__dirname, 'package-lock.json')));
fs.mkdirSync(path.join(__dirname, 'artifacts'), {recursive: true});
fs.writeFileSync(path.join(__dirname, 'artifacts/source-snapshot.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({status: receipt.status, sourceVersion: receipt.sourceVersion, fileCount: pins.length, currentInputFreshness}));
