const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../experiments/web-core/core/Button');
const core = require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const clone = x => JSON.parse(JSON.stringify(x));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const manifest = read('qa/root-sizing-live-review.2026-09-28.json');
const previous = read('qa/width-transition-live-review.2026-09-28.json');
const fixture = item => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile))));
const width = 'component:web-core.button.loading-preserves-width';
const rootSizing = 'component:core.web.button.root.auto-layout-1';
const unaffected = r => r.results.engine.evaluations
  .filter(e => !/^component:(core.web.button.root.auto-layout-1|web-core.button.(manual-layout-and-appearance-overrides-prohibited|internal-sizing-locked))\./.test(e.ruleId))
  .map(e => ({ ruleId: e.ruleId, node: e.subjectNodeId, classification: e.classification, trace: e.trace }));

for (const [i, item] of manifest.reportResults.entries()) test(`${item.caseId}: live r23 exact replay; expected width result and no sizing false positives`, () => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  assert.equal(sha(bytes), item.sha256);
  const r = JSON.parse(bytes), s = r.snapshot;
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.42');
  assert.equal(r.run.manualRevision, 23);
  assert.equal(core.stableHash(r.sources.manual), manifest.manualSourceHash);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(s), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.equal(s.source.rootNodeId, item.rootNodeId);
  assert.equal(r.run.context.platform, item.platform);
  const engine = core.evaluateCompiledContract(s, r.runtime.evaluatedContract);
  assert.equal(engine.snapshotHash, r.run.engineSnapshotHash);
  assert.deepEqual(clone(engine), r.results.engine);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, s);
  assert.deepEqual(clone(editor), r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy)), r.results.details);
  const w = editor.evaluations.find(e => e.ruleId === width || e.ruleId === width + '.1.1');
  assert.equal(w.classification, item.widthExpected);
  assert.equal(s.transitionBefore?.nodes[0].bounds.width ?? null, item.beforeWidth);
  assert.equal(s.nodes[0].bounds.width, item.afterWidth);
  if (item.widthUnavailableReason) assert.equal(Object.values(s.nodes[0].transitionsV1)[0].reason, item.widthUnavailableReason);
  const violations = engine.evaluations.filter(e => e.classification === 'violation');
  assert.equal(violations.length, item.expectedViolationCount);
  assert.ok(violations.every(e => e.ruleId === width + '.1.1'));
  const sizing = engine.evaluations.filter(e => e.ruleId.startsWith(rootSizing + '.'));
  assert.equal(sizing.length, 2); assert.ok(sizing.every(e => e.classification === 'compliant'));
  assert.equal(s.nodes[0].layout.sizingHorizontal, 'FIXED');
  assert.equal(s.nodes[0].layout.sizingVertical, 'HUG');
  assert.equal(editor.scenarioCoverage.notExecuted, item.expectedNotExecuted);
  assert.equal(editor.scenarioCoverage.inconclusive, 0);
  assert.equal(editor.scenarioCoverage.complete, false);
  assert.equal(engine.evaluations.length, item.engineEvaluations);
  assert.equal(engine.evaluations.filter(e => e.dependency).length, item.childEvaluations);
  assert.equal(r.run.capture.matchedBaselineNodes, 18);
  assert.deepEqual(r.run.capture.warnings, []); assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  assert.deepEqual(unaffected(r), unaffected(fixture(previous.reportResults[i])));
  const active = engine.dependencyRuns.filter(d => d.status === 'executed');
  assert.equal(active.length, 1); assert.equal(active[0].revision, 8);
  assert.equal(active[0].componentId, 'core.web.spinner');
});

test('r23 live evidence proves only the supplied cases, not whole-contract readiness', () => {
  assert.equal(manifest.status, 'accepted-bw01-bw06-only');
  assert.equal(manifest.reportResults.reduce((n, r) => n + r.engineEvaluations, 0), 2066);
  assert.equal(manifest.reportResults.reduce((n, r) => n + r.childEvaluations, 0), 1008);
  assert.equal(manifest.reportResults.reduce((n, r) => n + r.matchedNodes, 0), 108);
  for (const item of manifest.reportResults) {
    const r = fixture(item);
    assert.equal(r.summary.contractReadiness.status, 'draft');
    assert.equal(r.summary.contractReadiness.unimplementedRules, 8);
    assert.equal(r.sources.manual.rules.length, 27);
    assert.equal(r.sources.compiledContract.rules.length, 54);
  }
});
test('archived reports all use the accepted manual/compiled/pin; no export-folder dependency', () => {
  for (const item of manifest.reportResults) {
    const r = fixture(item);
    assert.equal(core.stableHash(r.sources.manual), manifest.manualSourceHash);
    assert.deepEqual(r.sources.compiledContract, fixture(manifest.reportResults[0]).sources.compiledContract);
    assert.equal(r.sources.compiledContract.componentDependencies[0].revision, 8);
  }
  assert.ok(manifest.normativeArtifactsUnchanged.some(a => a.file === 'editor/Button.editor-input.zip'));
});
