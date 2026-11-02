const fs = require('node:fs');
const path = require('node:path');
const {hash} = require('../registry/source-inventory.cjs');
const repo = path.resolve(__dirname, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const sourceManifest = JSON.parse(fs.readFileSync(path.join(repo, 'package.json')));
const rawLock = fs.readFileSync(path.join(__dirname, 'package-lock.json'));
const lock = JSON.parse(rawLock);
const installed = [];
for (const [relative, pin] of Object.entries(lock.packages)) {
    if (!relative) continue;
    const filename = path.join(__dirname, relative, 'package.json');
    if (!fs.existsSync(filename)) continue; // non-host optional platforms remain locked
    const raw = fs.readFileSync(filename), actual = JSON.parse(raw);
    if (actual.version !== pin.version) throw new Error('INSTALLED_LOCK_MISMATCH: ' + relative);
    installed.push({path: relative, name: actual.name, version: actual.version, packageJsonSha256: hash(raw), integrity: pin.integrity, resolved: pin.resolved, peerDependencies: actual.peerDependencies});
}
const direct = Object.entries({...manifest.dependencies, ...manifest.devDependencies}).map(([name, expected]) => {
    const actual = installed.find(p => p.path === 'node_modules/' + name);
    if (!actual || actual.version !== expected) throw new Error('DIRECT_DEPENDENCY_MISMATCH: ' + name);
    return {name, expected, installed: actual.version};
});
const core = installed.find(p => p.name === '@alfalab/core-components');
if (core.version !== sourceManifest.peerDependencies['@alfalab/core-components']) throw new Error('CORE_PEER_MISMATCH');
const receipt = {status: 'installed-lock-pins-pass-with-declared-peer-gap', node: {version: process.version, executable: process.execPath, executableSha256: hash(fs.readFileSync(process.execPath)), platform: process.platform, arch: process.arch},
    manifestSha256: hash(fs.readFileSync(path.join(__dirname, 'package.json'))), npmLockSha256: hash(rawLock), lockfileVersion: lock.lockfileVersion,
    sourcePackageJsonSha256: hash(fs.readFileSync(path.join(repo, 'package.json'))), sourceYarnLockSha256: hash(fs.readFileSync(path.join(repo, 'yarn.lock'))), sourceResolutions: sourceManifest.resolutions,
    parentTooling: {manifestSha256: hash(fs.readFileSync(path.join(__dirname, '../package.json'))), lockSha256: hash(fs.readFileSync(path.join(__dirname, '../package-lock.json'))), typescript: require('../node_modules/typescript/package.json').version},
    rootYarnTopologyReplayed: false, sourceDeclaredPeers: sourceManifest.peerDependencies, corePeer: {expected: sourceManifest.peerDependencies['@alfalab/core-components'], actual: core.version, integrity: core.integrity},
    installPolicy: {registry: 'https://registry.npmjs.org/', ignoreScripts: true, legacyPeerDeps: true, osApplicationsInstalled: false},
    peerGap: {dependency: 'bem-react-classname@1.3.2', requiresReact: '16.*', actualReact: manifest.dependencies.react, status: 'unresolved-declared-peer-conflict'},
    untestedFullLibraryPeers: ['dompurify', 'lodash'], direct, installed, lockedPackageEntries: Object.keys(lock.packages).length, installedPackageEntries: installed.length};
fs.writeFileSync(path.join(__dirname, 'artifacts/environment-pins.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({status: receipt.status, npmLockSha256: receipt.npmLockSha256, sourceYarnLockSha256: receipt.sourceYarnLockSha256, installedPackages: installed.length, core: core.version}));
