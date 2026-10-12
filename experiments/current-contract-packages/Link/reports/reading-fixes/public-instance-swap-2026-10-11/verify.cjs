const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const workspace = path.resolve(__dirname, '../../../../../../../..');
const packages = path.join(workspace, 'shared/design-system_ab/experiments/current-contract-packages');
const core = require(path.join(__dirname, 'runtime/core-after.cjs'));
const save = (file, value) => { const bytes = JSON.stringify(value, null, 2) + '\n'; if (fs.existsSync(path.join(__dirname, 'seal.json'))) assert.equal(fs.readFileSync(file, 'utf8'), bytes); else fs.writeFileSync(file, bytes); };
for (const item of readInputs()) { const bytes = fs.readFileSync(item.file); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256); assert.equal(bytes.length, item.bytes); }
function readInputs() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'prior-inputs.json'))); }
const read = p => JSON.parse(fs.readFileSync(p)), wire = v => JSON.parse(JSON.stringify(v));
const authoring = path.join(packages, 'Link/authoring');
const oldManual = read(path.join(__dirname, 'before/manual.json'));
assert.equal(oldManual.metadata.revision, 3);
const manual = wire(oldManual), evidence = read(path.join(__dirname, 'before/variant-evidence.json'));
manual.metadata.revision = 4;
manual.metadata.declaredTargetConfigurationVersion = 2;
manual.metadata.updatedAt = '2026-10-11T10:30:00+03:00';
for (const size of ['S','S20','M','L']) {
  const d = read(path.join(__dirname, `before/native/Link.${size}.json`));
  d.reference.nodes.sort((a,b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
  const hash = core.publicSwapDeclaredTargetReferenceHash(d.reference, {targets: manual.targets, policies: manual.rules, representations: manual.representations});
  for (const target of manual.targets) for (const b of target.identityBindingsV1) if (b.componentKey === d.reference.componentKey) {
    assert.equal(b.configurationReferenceHash, core.configurationDeclaredTargetReferenceHash(d.reference));
    b.configurationReferenceHash = hash;
  }
}
assert.deepEqual(manual.rules, oldManual.rules);
assert.deepEqual(manual.semanticApi, oldManual.semanticApi);
const bundle = core.buildExportBundle(manual, evidence);
assert(bundle.validation.valid, JSON.stringify(bundle.validation));
const preview = core.prepareAuthoringPreviewContract(bundle.compiled);
const results = [];
for (const time of ['07-00-25-744','07-00-47-535']) {
  const file = path.join(packages, `Link/link.validation-report.2026-10-11T${time}Z.json`), report = read(file);
  const original = core.prepareAuthoringPreviewContract(report.sources.compiledContract);
  assert.deepEqual(wire(core.evaluateCompiledContract(report.snapshot, original)), report.results.engine);
  const prepared = core.prepareValidationSnapshot(report.snapshot, preview);
  assert(prepared.declaredTargetIdentitiesV1.targets.every(t => t.status === 'resolved'), JSON.stringify(prepared.declaredTargetIdentitiesV1));
  const engine = core.evaluateCompiledContract(report.snapshot, preview);
  const editor = core.buildEditorValidationReport(engine, {contract: bundle.compiled, issues: bundle.validation.issues}, manual, report.snapshot, {hiddenTargetCoverageVersion: 1});
  const unknown = editor.evaluations.filter(e => e.classification === 'human-review');
  assert.equal(unknown.length, 0, JSON.stringify(unknown));
  assert.equal(editor.evaluations.filter(e => e.classification === 'violation').length, 0);
  const negative = [];
  for (const [name, mutate, anchor, fact] of [
    ['left-icon-height', s => {s.nodes.find(n => n.component?.propertyReferenceBindings?.mainComponent === 'Left icon 24#493:25').bounds.height = 40;}, 'component:web-core.link.left-icon-height', 'bounds.height'],
    ['right-icon-height', s => {s.nodes.find(n => n.component?.propertyReferenceBindings?.mainComponent === 'Right icon 24#493:21').bounds.height = 40;}, 'component:web-core.link.right-icon-height', 'bounds.height'],
    ['font-size', s => {s.nodes.find(n => n.type === 'TEXT' && n.name === 'Label').text.fontSize += 2;}, 'component:web-core.link.label-typography', 'text.fontSize'],
    ['gap', s => {s.nodes.find(n => n.parentId === null).layout.itemSpacing += 3;}, 'component:web-core.link.layer-properties-use-effective-baseline', 'layout.itemSpacing'],
  ]) {
    const ids = bundle.compiled.rules.filter(r => r.source.anchor === anchor && r.assert.actual?.fact === fact).map(r => r.ruleId);
    assert.equal(ids.length, 1); const expected = ids[0];
    const s = wire(report.snapshot); mutate(s);
    const r = core.evaluateCompiledContract(s, preview), fail = r.evaluations.filter(e => e.ruleId === expected && e.classification === 'violation');
    assert(fail.length, JSON.stringify({name,expected,evaluations:r.evaluations.filter(e => e.classification === 'violation')}));
    negative.push({name, expectedRuleId: expected, violations: fail.length, kind: 'counterfactual-on-retained-native-capture'});
  }
  results.push({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    resolvedTargets: prepared.declaredTargetIdentitiesV1.targets.length, violations: 0, inconclusive: 0,
    legacyR3EngineReplayExact: true, candidateR4Replay: true, freshNativeAcceptance: false, negative});
}
fs.mkdirSync(path.join(__dirname, 'candidate'), {recursive: true});
for (const [name,value] of [['manual.json',manual],['compiled.json',bundle.compiled],['variant-evidence.json',evidence]])
  save(path.join(__dirname, 'candidate',name), value);
save(path.join(__dirname,'technical-replay.json'),{schemaVersion:'link.public-swap-fix-replay.v1',coreVersion:read(path.join(__dirname,'runtime/versions.json')).core,
  manualHash:core.stableHash(manual),compiledHash:core.stableHash(bundle.compiled),normsUnchanged:true,results,freshNativeAcceptance:false,wholeReady:false});
console.log(JSON.stringify({results:results.map(r=>({resolved:r.resolvedTargets,unknown:r.inconclusive,violations:r.violations})),negativeChecks:8,legacyR3ReplayExact:true}));
