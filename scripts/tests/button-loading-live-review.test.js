const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Button');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const review = JSON.parse(fs.readFileSync(path.join(root, 'qa/loading-composition-live-review.2026-09-28.json')));
const clone = value => JSON.parse(JSON.stringify(value));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const reports = review.reportResults.map(item => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  return { item, bytes, r: JSON.parse(bytes) };
});
const get = id => reports.find(x => x.item.caseId === id).r;
const loading = r => r.results.engine.evaluations.filter(e => e.ruleId.startsWith(review.ruleId + '.'));
const C = 'compliant', V = 'violation', N = 'not-applicable';
const expected = {
  BL01: [C,C,C], BL02: [C,C,C], BL03: [C,C,C], BL04: [C,C,C],
  BL05: [C,V,C], BL06: [V,C,V], BL07: [V,C,C], BL08: [N,N,N],
  BL09: [C,C,C], BL10: [C,C,C], BL11: [C,C,C], BL12: [C,V,C],
  BL13: [C,C,V], BL14: [C,C,V],
};

for (const { item, bytes, r } of reports) test(`${item.caseId}: immutable live r20 capture, Loading expectations and exact replay`, () => {
  assert.equal(sha(bytes), item.sha256);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.39');
  assert.equal(r.run.manualRevision, 20);
  assert.equal(r.run.trigger, 'selected-instance');
  assert.equal(r.run.context.product, 'ab');
  assert.equal(r.run.context.platform, item.platform);
  assert.equal(r.snapshot.source.rootNodeId, item.nodeId);
  assert.equal(r.snapshot.source.truncated, false);
  const representation = core.resolveCaptureRepresentation(r.sources.manual.representations,
    r.snapshot.source.componentKey, r.snapshot.source.componentSetKey);
  assert.equal(representation.id, item.representationId);
  assert.equal(representation.platform, item.platform);
  assert.equal(core.stableHash(r.sources.manual), review.manualSourceHash);
  assert.equal(r.run.manualSourceHash, review.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract), review.compiledHash);
  assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  const dependency = r.sources.compiledContract.componentDependencies[0];
  assert.equal(dependency.revision, 8);
  assert.equal(core.stableHash(dependency.contract), review.dependencyCompiledHash);
  assert.equal(r.run.capture.matchedBaselineNodes, item.matchedNodes);
  assert.equal(r.snapshot.nodes.length, item.matchedNodes);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  const engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine,
    { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
  assert.deepEqual(clone(engine), r.results.engine);
  assert.deepEqual(clone(editor), r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy)), r.results.details);
  assert.equal(engine.snapshotHash, r.run.engineSnapshotHash);
  assert.equal(engine.evaluations.length, item.engineEvaluations);
  assert.equal(engine.evaluations.filter(e => e.dependency).length, item.dependencyEvaluations);
  assert.deepEqual(loading(r).map(e => e.classification), expected[item.caseId]);
  assert.deepEqual(loading(r).map(e => e.classification === N ? null : e.trace.actual), item.loadingActual);
  assert.deepEqual(engine.evaluations.filter(e => e.classification === V).map(e => e.ruleId), item.violationRuleIds);
  assert.equal(engine.evaluations.filter(e => ['human-review', 'not-evaluable'].includes(e.classification)).length, 0);
  assert.equal(editor.scenarioCoverage.notExecuted, item.notExecuted);
  assert.equal(editor.scenarioCoverage.inconclusive, 0);
  assert.equal(editor.scenarioCoverage.complete, false);
  assert.equal(editor.contractReadiness.status, 'draft');
});

test('14 distinct live cases cover both sides, platforms, size16, hidden/multiple Spinner and no-Loading', () => {
  assert.deepEqual(reports.map(x => x.item.caseId), Object.keys(expected));
  assert.equal(new Set(reports.map(x => x.item.sha256)).size, 14);
  assert.equal(new Set(reports.map(x => x.item.nodeId)).size, 14);
  assert.equal(reports.reduce((n,x) => n + x.r.results.engine.evaluations.length, 0), 5792);
  assert.equal(reports.reduce((n,x) => n + x.item.dependencyEvaluations, 0), 2215);
  assert.equal(reports.reduce((n,x) => n + x.r.snapshot.nodes.length, 0), 244);
  assert.equal(reports.flatMap(x => loading(x.r)).filter(e => e.classification === V).length, 7);
  assert.deepEqual(loading(get('BL06')).map(e => e.trace.actual), [2,0,2]);
  assert.deepEqual(loading(get('BL07')).map(e => e.trace.actual), [0,0,1]);
  assert.deepEqual(loading(get('BL12')).map(e => e.trace.actual), [1,2,1]);
  for (const id of ['BL13', 'BL14']) assert.deepEqual(loading(get(id)).map(e => e.trace.actual), [1,0,2]);
});

test('BL11 documents separate configured-Hint policy finding, not a Loading false positive', () => {
  const r = get('BL11'), rootNode = r.snapshot.nodes.find(n => r.snapshot.selection.includes(n.id));
  const hint = r.snapshot.nodes.find(n => n.name === 'Hint');
  const text = r.snapshot.nodes.find(n => n.name === 'Text');
  assert.equal(rootNode.semanticApi.hintVisible, true);
  assert.equal(rootNode.semanticBindingEvidence.hintVisible.path, 'component.properties.Hint#4:8');
  assert.equal(hint.visible, true); assert.equal(text.visible, false); assert.equal(hint.parentId, text.id);
  assert.deepEqual(loading(r).map(e => e.classification), [C,C,C]);
  assert.deepEqual(r.results.engine.evaluations.filter(e => e.classification === V).map(e => e.ruleId),
    ['component:web-core.button.desktop-hint-restricted.1.1']);
  assert.equal(review.knownFindings[0].status, 'open');
  assert.equal(get('BL12').results.engine.evaluations.filter(e => e.classification === V).length, 2);
});

test('SingleIcon confirmed absence is accepted; hidden dependency remains explicitly incomplete', () => {
  const single = get('BL10'), hidden = get('BL07');
  assert.equal(single.snapshot.nodes.some(n => ['Label','Hint'].includes(n.name)), false);
  assert.deepEqual(loading(single).map(e => e.classification), [C,C,C]);
  assert.equal(single.summary.notExecuted, 4);
  assert.equal(hidden.summary.notExecuted, 8);
  assert.ok(hidden.results.editor.evaluations.some(e => e.ruleId === 'component-dependency:spinner:left'
    && e.classification === 'not-executed'));
});

test('Loading acceptance is not whole-contract readiness and does not prove width preservation', () => {
  assert.equal(review.contractStatus, 'draft');
  assert.equal(review.normativeChanges, false); assert.equal(review.runtimeChanges, false);
  for (const { r } of reports) {
    assert.ok(r.results.editor.evaluations.some(e => e.ruleId === 'component:web-core.button.loading-preserves-width'
      && e.classification === 'not-executed'));
    assert.equal(r.summary.complete, false);
  }
});
