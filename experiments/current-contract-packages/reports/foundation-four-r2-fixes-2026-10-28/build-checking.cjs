const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const R = __dirname, A = path.resolve(R, '../../../..'), B = path.resolve(A, '../../.local/apollo-main');
const esbuild = require(B + '/node_modules/esbuild');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const pin = p => {const bytes = fs.readFileSync(p); return {path: p, sha256: sha(bytes), bytes: bytes.length};};
(async () => {
  const base = pin(B + '/dist/build-inputs.json'), config = read(base.path);
  assert.equal(config.agentNativeScopeInput, null);
  const before = ['dist/runtime.cjs', 'dist/build-inputs.json', 'dist/code.js'].map(p => pin(B + '/' + p));
  const diagnosticPath = B + '/dist/native-diagnostic-inputs.json', diagnostics = read(diagnosticPath);
  const output = R + '/checking-build'; fs.mkdirSync(output, {recursive: true});
  const options = require(B + '/build.js').runtimeBuildOptions();
  const runtime = await esbuild.build(Object.assign({}, options, {outfile: output + '/runtime.cjs'}));
  const define = {__APOLLO_AGENT_NATIVE_SCOPE__: 'null', __APOLLO_NATIVE_DIAGNOSTIC_INPUTS__: JSON.stringify(diagnostics),
    __APOLLO_NATIVE_BUILD_INPUTS_SHA__: JSON.stringify('pending')};
  const mainOptions = {absWorkingDir: B, entryPoints: ['src/code.ts'], outfile: output + '/code.js', bundle: true,
    platform: 'browser', format: 'iife', target: ['es2017'], supported: {'object-rest-spread': false}, alias: options.alias,
    metafile: true, define, write: false};
  const first = await esbuild.build(mainOptions);
  const inputPaths = [...new Set([...Object.keys(runtime.metafile.inputs), ...Object.keys(first.metafile.inputs)])]
    .filter(p => !p.startsWith('<')).map(p => path.resolve(B, p));
  inputPaths.push(B + '/build.js', B + '/tsconfig.json', B + '/package.json', diagnosticPath);
  const inputs = [...new Set(inputPaths)].sort().map(pin), inputHash = sha(Buffer.from(JSON.stringify(inputs)));
  define.__APOLLO_NATIVE_BUILD_INPUTS_SHA__ = JSON.stringify(inputHash);
  await esbuild.build(Object.assign({}, mainOptions, {write: true}));
  for (const p of inputs) assert.deepEqual(pin(p.path), p, 'Source drift during checking build');
  for (const p of before) assert.deepEqual(pin(p.path), p, 'Shared dist changed');
  const inventory = {status: 'PRIVATE_CONFIGURED_CHECKING_BUILD', profileVersion: '0.4.1', agentNativeScopeInput: null,
    configBase: base, diagnosticInput: pin(diagnosticPath), inputHash, inputs,
    outputs: ['runtime.cjs', 'code.js'].map(p => pin(output + '/' + p)), preservedSharedDist: before,
    generatorBuild: 'NOT_RUN', installed: false};
  fs.writeFileSync(R + '/checking-build-inventory.json', JSON.stringify(inventory, null, 2) + '\n');
  console.log(JSON.stringify({inputs: inputs.length, outputs: inventory.outputs.map(p => ({path: p.path, bytes: p.bytes})), sharedDistUnchanged: true}));
})().catch(e => {console.error(e); process.exitCode = 1;});
