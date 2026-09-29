const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../experiments/web-core/core/Button');
const core = require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const clone = value => JSON.parse(JSON.stringify(value));
const manual = read('contract.manual.json'), contract = read('compiled/component-contract.v2.json');
const manifest = read('qa/width-transition-live-review.2026-09-28.json');
const load = item => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile))));
const rootId = 'component:core.web.button.root.auto-layout-1';
const innerId = 'component:web-core.button.internal-sizing-locked';
const widthId = 'component:web-core.button.loading-preserves-width';
function evaluate(snapshot) { return core.evaluateCompiledContract(snapshot, core.prepareAuthoringPreviewContract(contract)); }
function synthetic(index = 0) {
  const s = clone(load(manifest.reportResults[index]).snapshot);
  s.nodes[0].layout.sizingVertical = 'HUG';
  // Explicit synthetic re-pairing, never overwrite or relabel archived live reports.
  s.transitionCapture.manualSourceHash = contract.package.manualSourceHash;
  if (s.transitionBefore) {
    s.transitionBefore.transitionCapture.manualSourceHash = contract.package.manualSourceHash;
    s.transitionBefore.nodes[0].layout.sizingVertical = 'HUG';
  }
  return s;
}
function violations(es) { return es.filter(e => e.classification === 'violation'); }

for (const item of manifest.reportResults) test(`${item.caseId}: immutable r22 bytes and exact engine/editor/details replay`, () => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
  const r = JSON.parse(bytes), engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.deepEqual(clone(engine), r.results.engine);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
  assert.deepEqual(clone(editor), r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy)), r.results.details);
  const w = editor.evaluations.find(e => e.ruleId === widthId + '.1.1' || e.ruleId === widthId);
  assert.equal(w.classification, item.widthExpected);
  assert.equal(r.run.capture.warnings.length, 0);
  assert.equal(r.run.capture.matchedBaselineNodes, 18);
});

test('r23 changes only sizing ownership, retains stable IDs, generated evidence and pinned Spinner', () => {
  // Historical migration assertion is pinned; behavioural tests below use the current package.
  const manual = read('history/r23-editor-0.2.44/contract.manual.json');
  const contract = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'history/r23-editor-0.2.44/component-contract.v2.json.gz'))));
  const old = read('history/r22-editor-0.2.41/contract.manual.json');
  const oldCompiled = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'history/r22-editor-0.2.41/component-contract.v2.json.gz'))));
  assert.equal(manual.metadata.revision, 23);
  assert.equal(manual.rules.length, 27); assert.equal(contract.rules.length, 54);
  assert.deepEqual(manual.rules.filter(r => r.id !== innerId).map(r => r.id), old.rules.map(r => r.id));
  for (const r of manual.rules) if (![rootId, innerId, 'component:web-core.button.manual-layout-and-appearance-overrides-prohibited'].includes(r.id)) assert.deepEqual(r, old.rules.find(p => p.id === r.id));
  assert.deepEqual(contract.facts.variantEvidence, oldCompiled.facts.variantEvidence);
  assert.deepEqual(contract.componentDependencies, oldCompiled.componentDependencies);
  assert.equal(core.buildContractReadiness({contract, issues: []}, manual).unimplementedRules, 8);
  assert.equal(manual.rules.find(r => r.id === innerId).targetScope, 'descendants');
});

for (const index of [0, 3]) for (const mode of ['HUG', 'FILL', 'FIXED']) test(`${index === 0 ? 'D' : 'M'}: root width ${mode} and height HUG are allowed`, () => {
  const s = synthetic(index); s.nodes[0].layout.sizingHorizontal = mode;
  const es = evaluate(s).evaluations;
  assert.deepEqual(violations(es), []);
  const own = es.filter(e => e.ruleId.startsWith(rootId + '.'));
  assert.equal(own.length, 2); assert.ok(own.every(e => e.classification === 'compliant'));
  assert.ok(!es.some(e => e.ruleId.startsWith(innerId + '.') && e.subjectNodeId === 'preview:0'));
});
for (const mode of ['FIXED', 'FILL']) test(`root height ${mode} has one sizing finding, not duplicate baseline findings`, () => {
  const s = synthetic(); s.nodes[0].layout.sizingVertical = mode;
  const v = violations(evaluate(s).evaluations);
  assert.equal(v.length, 1); assert.equal(v[0].ruleId, rootId + '.1.2');
});
test('capture-declared unknown root sizing is inconclusive, never pass', () => {
  const s = synthetic(); delete s.nodes[0].layout.sizingVertical;
  s.nodes[0].unknownFacts.push('layout.sizingVertical');
  const e = evaluate(s), own = e.evaluations.find(e => e.ruleId === rootId + '.1.2');
  assert.equal(own.classification, 'human-review');
  assert.equal(core.buildEditorValidationReport(e, {contract, issues: []}, manual, s).scenarioCoverage.complete, false);
});
test('internal sizing and root padding/alignment/mode remain protected exactly once', () => {
  for (const [nodeId, field, value, owner] of [
    ['preview:1', 'sizingHorizontal', 'FIXED', innerId],
    ['preview:0', 'primaryAxisAlignItems', 'MIN', 'component:web-core.button.manual-layout-and-appearance-overrides-prohibited'],
    ['preview:0', 'mode', 'VERTICAL', 'component:web-core.button.manual-layout-and-appearance-overrides-prohibited'],
  ]) {
    const s = synthetic(), n = s.nodes.find(n => n.id === nodeId); n.layout[field] = value;
    const v = violations(evaluate(s).evaluations); assert.equal(v.length, 1); assert.ok(v[0].ruleId.startsWith(owner + '.')); assert.equal(v[0].subjectNodeId, nodeId);
  }
  const s = synthetic(); s.nodes[0].layout.padding.left += 8;
  const v = violations(evaluate(s).evaluations); assert.equal(v.length, 1); assert.deepEqual([...v[0].trace.factPaths].sort(), ['baseline.effective.layout.padding.left', 'layout.padding.left']);
});
test('descendants scope preserves Spinner ownership boundary', () => {
  const s = synthetic(), owned = evaluate(s).evaluations.filter(e => e.ruleId.startsWith(innerId + '.') && e.subjectNodeId === 'preview:3');
  assert.equal(owned.length, 2); assert.ok(owned.every(e => e.classification === 'not-applicable'));
  // Changing parent evidence without the matching child capture breaks parity, not ownership.
  s.nodes.find(n => n.id === 'preview:3').layout.sizingHorizontal = 'FIXED';
  const es = evaluate(s).evaluations.filter(e => e.ruleId.startsWith(innerId + '.') && e.subjectNodeId === 'preview:3');
  assert.equal(es.length, 2); assert.ok(es.every(e => e.classification === 'human-review'));
});
test('new source invalidates old transition evidence, while synthetic re-pairing preserves all six width verdicts', () => {
  const stale = evaluate(load(manifest.reportResults[0]).snapshot);
  assert.equal(stale.evaluations.find(e => e.ruleId === widthId + '.1.1').classification, 'human-review');
  for (const [i, item] of manifest.reportResults.entries()) {
    const s = synthetic(i), engine = evaluate(s);
    const editor = core.buildEditorValidationReport(engine, {contract, issues: []}, manual, s);
    const w = editor.evaluations.find(e => e.ruleId === widthId + '.1.1' || e.ruleId === widthId);
    assert.equal(w.classification, item.widthExpected, item.caseId);
    assert.equal(violations(engine.evaluations).length, item.widthExpected === 'violation' ? 1 : 0, item.caseId);
  }
});
