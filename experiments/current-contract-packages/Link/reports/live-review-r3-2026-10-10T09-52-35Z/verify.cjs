const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const core = require('./runtime/core.cjs');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name)));
const wire = value => JSON.parse(JSON.stringify(value));
const sha = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, name))).digest('hex');
const manual = read('package/manual.json'), compiled = read('package/compiled.json');
const preview = core.prepareAuthoringPreviewContract(compiled);
assert.equal(manual.metadata.revision, 3);
assert.equal(core.stableHash(manual), 'a85dd33420356ff1e2ab0de4e6064ddeb1c6ea9cf943accbacef40ef396a7402');
assert.equal(core.stableHash(compiled), '38c2a8bc107b51f5adcbc086430fb051af2a4e2fbe8f2161d76d87a8e88ad3a5');
assert.equal(sha('package/Link.component-contract.zip'), '5bf00497bd8236ba283c0be8b1c8e1135b05c007efdf15d04812ae1c0bc01a02');
const specs = [
  ['09-52-35-564', '13666:67928', 18, 'Открыть подробные условия обслуживания', true, 2, 3],
  ['09-52-45-528', '13666:67928', 16, 'Label', true, 0, 3],
  ['09-52-51-002', '13666:67948', 16, 'Label', false, 0, 7],
  ['09-52-56-816', '13666:67928', 16, 'Label', true, 0, 3],
];
for (const [time, rootId, fontSize, text, addons, violations, notExecuted] of specs) {
  const d = read(`inputs/link.validation-report.2026-10-10T${time}Z.json`), s = d.snapshot;
  assert.equal(d.editorVersion, 'component-contract-editor@0.2.99');
  assert.deepEqual(d.sources.manual, manual); assert.deepEqual(d.sources.compiledContract, compiled);
  assert.deepEqual(d.runtime.evaluatedContract, wire(preview));
  assert.equal(s.source.rootNodeId, rootId); assert.equal(s.source.captureTopology.complete, true);
  assert.deepEqual(d.run.capture.warnings, []); assert.equal(d.summary.inconclusive, 0);
  const root = s.nodes.find(n => n.parentId === null), label = s.nodes.find(n => n.type === 'TEXT' && n.name === 'Label');
  assert.equal(root.component.properties.Size, 'M (16-24)');
  assert.equal(root.component.properties['✎ Label#493:29'], text); assert.equal(label.text.characters, text);
  assert.equal(label.text.fontSize, fontSize);
  assert.equal(root.component.properties['Left Addon#60204:0'], addons);
  assert.equal(root.component.properties['Right Addon#60204:4'], addons);
  assert.equal(s.nodes.find(n => n.name === 'Underline' && n.type === 'INSTANCE').component.properties.Line, 'Solid');
  const engine = core.evaluateCompiledContract(s, preview);
  assert.deepEqual(wire(engine), d.results.engine);
  assert.deepEqual(wire(core.buildEditorValidationReport(engine, { contract: compiled, issues: d.sources.compilerIssues }, manual, s)), d.results.editor);
  const targets = core.prepareValidationSnapshot(s, preview).declaredTargetIdentitiesV1.targets;
  assert.equal(targets.length, 8); assert(targets.every(t => t.status === 'resolved' && t.present === true));
  const findings = engine.evaluations.filter(e => e.classification === 'violation');
  assert.equal(findings.length, violations); assert.equal(d.summary.notExecuted, notExecuted);
  if (violations) assert.deepEqual(findings.map(e => e.ruleId).sort(), ['component:web-core.link.label-typography.1.2', 'component:web-core.link.label-typography.1.4']);
  if (!addons) {
    assert(targets.filter(t => ['left-addon', 'right-addon', 'left-icon', 'right-icon'].includes(t.semanticRole)).every(t => t.effectiveVisible === false));
    const gaps = d.results.details.filter(e => e.classification === 'not-executed' && e.reason.includes('Целевой слой не найден'));
    assert.deepEqual(gaps.map(e => e.ruleId).sort(), ['component:web-core.link.left-addon-visibility', 'component:web-core.link.left-icon-height', 'component:web-core.link.right-addon-visibility', 'component:web-core.link.right-icon-height']);
  }
}
if (fs.existsSync(path.join(__dirname, 'seal.json'))) for (const pin of read('seal.json').files) {
  assert.equal(sha(pin.path), pin.sha256); assert.equal(fs.statSync(path.join(__dirname, pin.path)).size, pin.bytes);
}
console.log(JSON.stringify({ exactEngineEditorReplay: 4, resolvedTargetsPerRun: 8, rootConfigurationIdentity: 'PASS_SCOPED', hiddenCoverage: 'KNOWN_GAP_REPRODUCED', cleanLongLabelAndPreservingReset: 'NOT_RUN', wholeReady: false }));
