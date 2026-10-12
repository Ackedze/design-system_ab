const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const D = __dirname, W = path.resolve(D, '../../../../../../../..');
const P = path.join(W, 'shared/design-system_ab/experiments/current-contract-packages');
const E = path.join(P, 'Link/reports/skill-evals/link-r4-public-swap-2026-10-11');
const read = f => JSON.parse(fs.readFileSync(f));
const pin = f => { const b = fs.readFileSync(f); return {path: f, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length}; };
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const wire = v => JSON.parse(JSON.stringify(v));
const files = root => fs.readdirSync(root, {withFileTypes: true}).flatMap(e => {
  const f = path.join(root, e.name); assert(!e.isSymbolicLink(), f);
  return e.isDirectory() ? files(f) : [f];
}).sort();
const seal = root => {
  const records = files(root).filter(f => f !== path.join(root, 'seal.json')).map(f => ({...pin(f), path: path.relative(root, f)}));
  const value = {schemaVersion: 'apollo.physical-receipt-seal.v1', writesClosed: true, continuedWritesAllowed: false,
    independentAcceptance: false, closedAt: new Date().toISOString(), files: records};
  write(path.join(root, 'seal.json'), value); return value;
};
const verifySeal = root => {
  const s = read(path.join(root, 'seal.json'));
  assert.deepEqual(files(root).filter(f => f !== path.join(root, 'seal.json')).map(f => path.relative(root, f)), s.files.map(f => f.path));
  for (const item of s.files) assert.deepEqual({...pin(path.join(root, item.path)), path: item.path}, item);
  return s.files.length;
};
(async () => {
  assert(!fs.existsSync(path.join(D, 'seal.json')) && !fs.existsSync(path.join(E, 'seal.json')), 'Writer already closed');
  const core = require(path.join(D, 'runtime/core-after.cjs'));
  const handoff = read(path.join(D, 'HANDOFF.json'));
  for (const name of ['currentPackage', 'manual', 'compiled', 'checks', 'eval']) assert.deepEqual(pin(handoff[name].path), handoff[name]);
  const manual = read(handoff.manual.path), compiled = read(handoff.compiled.path);
  const evidence = read(path.join(D, 'candidate/variant-evidence.json'));
  assert.deepEqual(manual.rules, read(path.join(D, 'before/manual.json')).rules);
  assert.deepEqual(manual.semanticApi, read(path.join(D, 'before/manual.json')).semanticApi);
  const bundle = core.buildExportBundle(manual, evidence); assert(bundle.validation.valid);
  assert.deepEqual(wire(bundle.compiled), compiled);
  const zipFiles = await core.readZip(fs.readFileSync(handoff.currentPackage.path));
  const reopened = core.importWorkspace(zipFiles.filter(f => f.name.endsWith('.json')).map(f => ({name: f.name, text: new TextDecoder().decode(f.data)})), manual.component.contractId);
  assert.deepEqual(reopened.manual, manual); assert.deepEqual(reopened.variantEvidence, evidence);
  assert.deepEqual(wire(core.buildExportBundle(reopened.manual, reopened.variantEvidence).compiled), compiled);
  const checks = read(path.join(D, 'package-checks.json'));
  for (const name of ['manifest.json', 'draft-manifest.json']) {
    const current = read(path.join(P, name)), preimage = read(path.join(D, 'before', name + '.publication-preimage.json'));
    const entry = current.packages.find(p => p.componentId === 'core.web.link');
    assert.equal(entry.revision, 4); assert.equal(entry.status, 'draft'); assert.equal(entry.wholeReady, false);
    assert.equal(entry.zipSha256, handoff.currentPackage.sha256);
    assert.equal(entry.manualSourceHash, checks.manualHash); assert.equal(entry.compiledHash, checks.compiledHash);
    assert.deepEqual(current.packages.filter(p => p.componentId !== 'core.web.link'), preimage.packages.filter(p => p.componentId !== 'core.web.link'));
  }
  const build = read(path.join(W, 'projects/Apollo-v3/apps/apollo-v4/dist/build-inputs.json'));
  assert.deepEqual(build, read(path.join(D, 'runtime/apollo-v4-build-inputs.json')));
  assert.equal(pin(build.agentNativeScopeInput.path).sha256, build.agentNativeScopeInput.sha256);
  const sourceFiles = [
    'projects/Apollo-v3/packages/component-contract-core/package.json',
    ...['public-swap-reference.ts', 'declared-target-identity.ts', 'types.ts', 'compiler.ts', 'text-content-facts.ts', 'variant-facts.ts', 'index.ts'].map(n => 'projects/Apollo-v3/packages/component-contract-core/src/' + n),
    ...['declared-public-swap.test.js', 'helpers/declared-public-swap.cjs'].map(n => 'projects/Apollo-v3/packages/component-contract-core/tests/' + n),
    ...['package.json', 'package-lock.json', 'src/version.ts', 'src/ui.html', 'tests/declared-target.test.js', 'tests/hidden-target-coverage.test.js', 'README.md', 'docs/BACKLOG.ru.md'].map(n => 'projects/ComponentContractEditor/' + n),
    ...['apps/apollo-v4/src/contract-profile.js', 'apps/apollo-v4/tests/declared-target.test.js', 'apps/apollo-v4/dist/build-inputs.json', 'README.md', 'docs/ARCHITECTURE_BACKLOG.md'].map(n => 'projects/Apollo-v3/' + n),
    'shared/design-system_ab/experiments/current-contract-packages/CONTRACT_AUTHORING_GUIDE.ru.md'
  ];
  const inputFiles = ['manifest.json', 'draft-manifest.json', 'Link.component-contract.zip',
    'Link/authoring/contract.manual.json', 'Link/authoring/compiled/component-contract.v2.json',
    'Link/authoring/coverage-map.r4.json', 'Link/authoring/case-matrix.r4.json', 'Link/authoring/TEST_CASES.r4.ru.md'];
  const inventory = {schemaVersion: 'apollo.public-swap-final-inputs.v1', observedAt: new Date().toISOString(),
    source: sourceFiles.map(f => pin(path.join(W, f))), canonical: inputFiles.map(f => pin(path.join(P, f))),
    readonlyCallback: pin(build.agentNativeScopeInput.path), independentAcceptance: false, workingConsumerRefreshRequired: true};
  write(path.join(D, 'final-inputs.json'), inventory);
  const eSeal = seal(E); handoff.evalSeal = pin(path.join(E, 'seal.json'));
  handoff.finalInputs = pin(path.join(D, 'final-inputs.json')); handoff.closedAt = new Date().toISOString();
  handoff.finalPackageReadback = {zipRoundtrip: true, normsUnchanged: true, otherManifestEntriesUnchanged: true, readonlyCallbackPreserved: true};
  write(path.join(D, 'HANDOFF.json'), handoff); const dSeal = seal(D);
  const readback = {schemaVersion: 'apollo.public-swap-final-readback.v1', observedAt: new Date().toISOString(),
    receipt: pin(path.join(D, 'seal.json')), skillEval: pin(path.join(E, 'seal.json')),
    receiptFilesVerified: verifySeal(D), skillEvalFilesVerified: verifySeal(E),
    package: pin(handoff.currentPackage.path), freshNativeAcceptance: false, independentAcceptance: false, wholeReady: false};
  write(path.join(path.dirname(D), 'public-instance-swap-final-readback-2026-10-11.json'), readback);
  console.log(JSON.stringify({receiptFiles: dSeal.files.length, skillEvalFiles: eSeal.files.length, sealed: true, zipRoundtrip: true, wholeReady: false}));
})().catch(e => {console.error(e); process.exitCode = 1;});
