const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const core = require('./runtime/core-after.cjs');
const editor = require('./runtime/editor-after.cjs');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name)));
const wire = value => JSON.parse(JSON.stringify(value));
const pin = name => {
  const bytes = fs.readFileSync(path.join(__dirname, name));
  return { path: name, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
};
const manual = read('package/manual.json');
const compiled = read('package/compiled.json');
const preview = core.prepareAuthoringPreviewContract(compiled);
assert.equal(core.stableHash(manual), 'a85dd33420356ff1e2ab0de4e6064ddeb1c6ea9cf943accbacef40ef396a7402');
assert.equal(core.stableHash(compiled), '38c2a8bc107b51f5adcbc086430fb051af2a4e2fbe8f2161d76d87a8e88ad3a5');
assert.equal(pin('package/Link.component-contract.zip').sha256, '5bf00497bd8236ba283c0be8b1c8e1135b05c007efdf15d04812ae1c0bc01a02');
const contextOnly = [
  'component:web-core.link.inline-link-addons',
  'component:web-core.link.underline-none-context',
  'component:web-core.link.view-token-mapping'
].sort();
const hiddenRules = [
  'component:web-core.link.left-addon-visibility.1.1',
  'component:web-core.link.left-icon-height.1.1',
  'component:web-core.link.right-addon-visibility.1.1',
  'component:web-core.link.right-icon-height.1.1'
].sort();
const specs = [
  ['14-47-17-223', 'LINK-06 ADDON_FALSE', '13666:67948', false, 'Label'],
  ['14-47-27-805', 'LINK-06 ADDON_RESET', '13666:67948', true, 'Label'],
  ['14-48-24-281', 'LINK-05 LABEL_POSITIVE', '13666:67928', true, 'Открыть подробные условия']
];
const rows = [], captures = [];
for (const [time, caseId, rootId, addons, text] of specs) {
  const file = 'inputs/link.validation-report.2026-10-10T' + time + 'Z.json';
  const d = read(file), s = d.snapshot;
  assert.equal(d.editorVersion, 'component-contract-editor@0.2.100');
  assert.equal(d.run.manualRevision, 3);
  assert.equal(d.run.manualSourceHash, core.stableHash(manual));
  assert.deepEqual(d.sources.manual, manual);
  assert.deepEqual(d.sources.compiledContract, compiled);
  assert.deepEqual(d.runtime.evaluatedContract, wire(preview));
  assert.equal(core.stableHash(s), d.run.snapshotHash);
  assert.equal(core.stableHash(preview), d.run.evaluatedContractHash);
  assert.equal(s.source.rootNodeId, rootId);
  assert.equal(s.source.representationId, 'core.web.link.figma.universal');
  assert.equal(s.source.truncated, false);
  assert.equal(s.source.captureTopology.complete, true);
  assert.equal(s.source.captureTopology.limitReached, false);
  assert.deepEqual(s.source.captureTopology.issues, []);
  assert.deepEqual(d.run.capture.warnings, []);
  assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds, []);
  assert.equal(s.nodes.length, 17);
  const root = s.nodes.find(n => n.parentId === null);
  const label = s.nodes.find(n => n.semantic.role === 'label');
  const underline = s.nodes.find(n => n.semantic.role === 'underline');
  assert.equal(root.component.properties.Size, 'M (16-24)');
  assert.equal(root.component.properties['Left Addon#60204:0'], addons);
  assert.equal(root.component.properties['Right Addon#60204:4'], addons);
  assert.equal(root.component.propertyTypes['Left Addon#60204:0'], 'BOOLEAN');
  assert.equal(root.component.propertyTypes['Right Addon#60204:4'], 'BOOLEAN');
  assert.equal(root.component.properties['✎ Label#493:29'], text);
  assert.equal(label.text.characters, text);
  assert.equal(label.text.fontSize, 16);
  assert.deepEqual(label.text.lineHeight, {unit: 'PIXELS', value: 24});
  assert(Math.abs(label.text.letterSpacing.value + 0.24) < 0.00001);
  assert.equal(underline.component.properties.Line, 'Solid');
  const prepared = core.prepareValidationSnapshot(s, preview);
  assert.equal(core.validationSnapshotHash(s, preview), d.run.engineSnapshotHash);
  assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1), s.declaredTargetIdentitiesV1);
  const targets = prepared.declaredTargetIdentitiesV1.targets;
  assert.equal(targets.length, 8);
  assert(targets.every(t => t.status === 'resolved' && t.present === true));
  const governed = targets.filter(t => ['left-addon', 'right-addon', 'left-icon', 'right-icon'].includes(t.semanticRole));
  assert.equal(governed.length, 4);
  assert(governed.every(t => t.effectiveVisible === addons));
  const engine = core.evaluateCompiledContract(s, preview);
  assert.deepEqual(wire(engine), d.results.engine);
  assert.deepEqual(wire(editor.evaluateCompiledContract(s, preview)), d.results.engine);
  const args = [engine, {contract: compiled, issues: d.sources.compilerIssues}, manual, s, {hiddenTargetCoverageVersion: 1}];
  const report = core.buildEditorValidationReport(...args);
  assert.deepEqual(wire(report), d.results.editor);
  assert.deepEqual(wire(editor.buildEditorValidationReport(...args)), d.results.editor);
  const details = core.buildEvaluationDetails(report, preview, d.anatomy);
  assert.deepEqual(wire(details), d.results.details);
  assert.equal(report.scenarioCoverage.hiddenTargetCoverageVersion, 1);
  assert.equal(report.scenarioCoverage.inconclusive, 0);
  assert.equal(report.scenarioCoverage.notExecuted, 3);
  assert.deepEqual(d.summary.scenarioCoverage, report.scenarioCoverage);
  assert.equal(report.evaluations.filter(e => e.classification === 'violation').length, 0);
  assert.equal(report.evaluations.filter(e => e.classification === 'human-review').length, 0);
  assert.deepEqual(report.evaluations.filter(e => e.classification === 'not-executed').map(e => e.ruleId).sort(), contextOnly);
  const hidden = report.evaluations.filter(e => e.origin === 'editor-hidden-target-scope');
  assert.deepEqual(hidden.map(e => e.ruleId).sort(), addons ? [] : hiddenRules);
  for (const e of hidden) {
    assert.equal(e.classification, 'not-applicable');
    const detail = details.find(x => x.id === e.evaluationId);
    assert.equal(detail.reasonLabel, 'Слой найден и подтверждён, но скрыт. Эта проверка не применяется.');
    assert.equal(detail.showComparison, false);
  }
  assert(!details.some(e => e.classification === 'not-executed' && e.reason.includes('Целевой слой не найден')));
  rows.push({caseId, input: pin(file), instanceId: rootId, generatedAt: d.generatedAt,
    exactEngineEditorDetailsReplay: true, editorCoreParity: true, resolvedTargets: 8,
    violations: 0, inconclusive: 0, notExecuted: 3, hiddenRuleIds: hidden.map(e => e.ruleId).sort(),
    properties: root.component.properties, textFacts: label.text, context: s.context});
  captures.push({s, root, label});
}
assert.equal(captures[0].s.source.rootNodeId, captures[1].s.source.rootNodeId);
assert.deepEqual(captures[0].s.context, captures[1].s.context);
assert.deepEqual(captures[0].root.layout, captures[1].root.layout);
assert.deepEqual(captures[0].root.appearance, captures[1].root.appearance);
assert.deepEqual(captures[0].label.text, captures[1].label.text);
const restoredProperties = wire(captures[0].root.component.properties);
restoredProperties['Left Addon#60204:0'] = true;
restoredProperties['Right Addon#60204:4'] = true;
assert.deepEqual(restoredProperties, captures[1].root.component.properties);
for (const n of captures[0].s.nodes.filter(n => n.component?.identity)) {
  assert.deepEqual(n.component.identity, captures[1].s.nodes.find(m => m.id === n.id).component.identity);
}
const result = {schemaVersion: 'link.installed-hidden-target-and-label-replay.v1',
  editorVersion: '0.2.100', coreVersion: '0.1.16', revision: 3, cases: rows,
  requestedCaptureCount: 3, acceptedCaptureCount: 3, hiddenAddonCycle: 'PASS_INSTALLED_LINK_SCOPED',
  samePhysicalInstanceReset: true, cleanConfiguredLabel: 'PASS_INSTALLED_SCOPED',
  cleanLongLabelPreservingNegativeResetCycle: 'NOT_RUN',
  benefitCardHiddenTitleNewEditor: 'NOT_RUN_USER_ONLY', wholeReady: false};
if (fs.existsSync(path.join(__dirname, 'technical-replay.json'))) assert.deepEqual(read('technical-replay.json'), result);
if (fs.existsSync(path.join(__dirname, 'seal.json'))) {
  for (const x of read('seal.json').files) assert.deepEqual(pin(x.path), x);
}
console.log(JSON.stringify(result));
