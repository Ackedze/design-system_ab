const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name)));
const pin = name => {
  const b = fs.readFileSync(path.join(__dirname, name));
  return {path: name, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length};
};
for (const x of read('dependencies.json').files) assert.deepEqual(pin(x.path), x);
const previous = '../live-review-r3-2026-10-10T14-47-17Z/';
const core = require(previous + 'runtime/core-after.cjs');
const editor = require(previous + 'runtime/editor-after.cjs');
const manual = read(previous + 'package/manual.json');
const compiled = read(previous + 'package/compiled.json');
const preview = core.prepareAuthoringPreviewContract(compiled);
const wire = x => JSON.parse(JSON.stringify(x));
assert.equal(core.stableHash(manual), 'a85dd33420356ff1e2ab0de4e6064ddeb1c6ea9cf943accbacef40ef396a7402');
assert.equal(core.stableHash(compiled), '38c2a8bc107b51f5adcbc086430fb051af2a4e2fbe8f2161d76d87a8e88ad3a5');
const contextRules = ['component:web-core.link.view-token-mapping', 'component:web-core.link.underline-none-context', 'component:web-core.link.inline-link-addons'].sort();
const targetRule = 'component:web-core.link.underline-domain.1.1';
const cases = [], states = [];
for (const [time, line] of [['17-56-33-858', 'Pseudo'], ['17-56-46-335', 'Solid']]) {
  const file = 'inputs/link.validation-report.2026-10-10T' + time + 'Z.json';
  const d = read(file), s = d.snapshot;
  assert.equal(d.editorVersion, 'component-contract-editor@0.2.100');
  assert.equal(d.run.manualRevision, 3);
  assert.deepEqual(d.sources.manual, manual);
  assert.deepEqual(d.sources.compiledContract, compiled);
  assert.deepEqual(d.runtime.evaluatedContract, wire(preview));
  assert.equal(d.run.manualSourceHash, core.stableHash(manual));
  assert.equal(d.run.snapshotHash, core.stableHash(s));
  assert.equal(d.run.evaluatedContractHash, core.stableHash(preview));
  assert.equal(d.run.engineSnapshotHash, core.validationSnapshotHash(s, preview));
  assert.equal(s.source.rootNodeId, '13666:67968');
  assert.equal(s.source.representationId, 'core.web.link.figma.universal');
  assert.equal(s.source.truncated, false);
  assert.deepEqual(s.source.captureTopology, {version: 1, complete: true, limitReached: false, issues: []});
  assert.deepEqual(d.run.capture.warnings, []);
  assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds, []);
  const root = s.nodes.find(n => n.parentId === null);
  const underline = s.nodes.find(n => n.semantic.role === 'underline');
  assert.equal(root.component.properties.Size, 'M (16-24)');
  assert.equal(root.component.properties['Left Addon#60204:0'], true);
  assert.equal(root.component.properties['Right Addon#60204:4'], true);
  assert.equal(root.component.properties['✎ Label#493:29'], 'Label');
  assert.equal(underline.component.properties.Line, line);
  assert.equal(underline.component.propertyTypes.Line, 'VARIANT');
  const prepared = core.prepareValidationSnapshot(s, preview);
  assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1), s.declaredTargetIdentitiesV1);
  const targets = prepared.declaredTargetIdentitiesV1.targets;
  assert.equal(targets.length, 8);
  assert(targets.every(t => t.status === 'resolved' && t.present && t.effectiveVisible));
  const engine = core.evaluateCompiledContract(s, preview);
  assert.deepEqual(wire(engine), d.results.engine);
  assert.deepEqual(wire(editor.evaluateCompiledContract(s, preview)), d.results.engine);
  const args = [engine, {contract: compiled, issues: d.sources.compilerIssues}, manual, s, {hiddenTargetCoverageVersion: 1}];
  const report = core.buildEditorValidationReport(...args);
  assert.deepEqual(wire(report), d.results.editor);
  assert.deepEqual(wire(editor.buildEditorValidationReport(...args)), d.results.editor);
  assert.deepEqual(wire(core.buildEvaluationDetails(report, preview, d.anatomy)), d.results.details);
  assert.deepEqual(report.scenarioCoverage, d.summary.scenarioCoverage);
  assert.equal(report.scenarioCoverage.inconclusive, 0);
  assert.equal(report.scenarioCoverage.notExecuted, 3);
  assert(!report.evaluations.some(e => ['violation', 'human-review'].includes(e.classification)));
  assert.deepEqual(report.evaluations.filter(e => e.classification === 'not-executed').map(e => e.ruleId).sort(), contextRules);
  const target = engine.evaluations.filter(e => e.ruleId === targetRule && e.applicability === 'applicable');
  assert.equal(target.length, 1);
  assert.equal(target[0].classification, 'compliant');
  assert.equal(target[0].focusNodeId, underline.id);
  assert.equal(target[0].trace.actual, line);
  assert.deepEqual(target[0].trace.expected, ['Solid', 'Pseudo', 'None']);
  cases.push({input: pin(file), instanceId: s.source.rootNodeId, generatedAt: d.generatedAt, line,
    exactEngineEditorDetailsReplay: true, editorCoreParity: true, resolvedTargets: 8,
    violations: 0, inconclusive: 0, notExecuted: 3, targetEvaluation: target[0],
    rootProperties: root.component.properties, underlineIdentity: underline.component.identity,
    underlineSourceIdentity: underline.component.sourceIdentity});
  states.push({s, root, underline});
}
assert.deepEqual(states[0].root.component, states[1].root.component);
assert.deepEqual(states[0].root.layout, states[1].root.layout);
assert.deepEqual(states[0].root.appearance, states[1].root.appearance);
assert.deepEqual(states[0].s.context, states[1].s.context);
assert.deepEqual(states[0].underline.component.sourceIdentity, states[1].underline.component.sourceIdentity);
assert.equal(states[0].underline.component.identity.componentSetKey, states[1].underline.component.identity.componentSetKey);
assert.notEqual(states[0].underline.component.identity.componentKey, states[1].underline.component.identity.componentKey);
for (const n of states[0].s.nodes.filter(n => n.semantic.role !== 'underline')) {
  const m = states[1].s.nodes.find(m => m.id === n.id);
  if (n.component?.identity) assert.deepEqual(n.component.identity, m.component.identity);
  if (n.type === 'TEXT') assert.deepEqual(n.text, m.text);
}
const receipt = {schemaVersion: 'link.installed-line-variant-replay.v1', editorVersion: '0.2.100', coreVersion: '0.1.16', revision: 3,
  cases, acceptedCaptureCount: 2, nativeNestedLineCycle: 'PASS_PSEUDO_SOLID_INSTALLED_SCOPED',
  samePhysicalInstanceReset: true, stableHostAndUnderlineSource: true,
  lineNoneContextAndIconPorts: 'NOT_RUN_USER_ONLY', wholeReady: false};
if (fs.existsSync(path.join(__dirname, 'technical-replay.json'))) assert.deepEqual(read('technical-replay.json'), receipt);
if (fs.existsSync(path.join(__dirname, 'seal.json'))) for (const x of read('seal.json').files) assert.deepEqual(pin(x.path), x);
console.log(JSON.stringify(receipt));
