// Read-only by default. --record archives immutable reports and writes QA evidence.
// Does not edit manual/compiled contracts, the runtime, or source Figma fixtures.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const core = require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const times = [
  '06-08-18-186', '06-08-28-255', '06-08-33-800', '06-08-42-357',
  '06-08-51-177', '06-08-58-047', '06-09-04-571', '06-09-11-799',
  '06-09-18-770', '06-09-25-481', '06-09-31-771', '06-09-38-844',
  '06-09-46-429', '06-09-52-445', '06-09-59-453', '06-10-06-327',
];
const sourceRuleId = 'component:web-core.button.backdrop-blur-maps-to-control-blur';
const compiledRuleId = sourceRuleId + '.1.1';
const generalRuleId = 'component:core.web.button.root.visual-style-1.5.1';
const dualFindingCases = ['CB08', 'CB09', 'CB12'];
const fixture = read('qa/control-blur-test-cases.2026-09-29.json');
const history = 'history/r30-editor-0.2.52';
const manual = read(`${history}/contract.manual.json`);
const compiled = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, history, 'component-contract.v2.json.gz'))));
const artifactFiles = ['contract.manual.json', 'compiled/component-contract.v2.json', 'editor/Button.editor-input.zip'];
const currentArtifactsBefore = Object.fromEntries(artifactFiles.map(file => [file, sha(fs.readFileSync(path.join(root, file)))]));
const artifactsBefore = Object.fromEntries(read(`${history}/manifest.json`).map(entry => [entry.source, entry.sha256]));
for (const entry of read(`${history}/manifest.json`)) {
  const bytes = fs.readFileSync(path.join(root, history, entry.file));
  assert.equal(sha(entry.file.endsWith('.gz') ? zlib.gunzipSync(bytes) : bytes), entry.sha256);
}
assert.equal(artifactsBefore[artifactFiles[0]], fixture.artifacts.manualByteSha256);
assert.equal(artifactsBefore[artifactFiles[1]], fixture.artifacts.compiledByteSha256);
assert.equal(artifactsBefore[artifactFiles[2]], fixture.artifacts.zipSha256);
const archives = [];
const reportResults = [];
const seen = new Set();
for (const time of times) {
  const name = `button.validation-report.2026-09-29T${time}Z.json`;
  const originalFile = `editor/${name}`;
  const fixtureFile = `qa/fixtures/control-blur-r30/${name}.gz`;
  const original = path.join(root, originalFile);
  const archive = path.join(root, fixtureFile);
  const bytes = fs.existsSync(original) ? fs.readFileSync(original) : zlib.gunzipSync(fs.readFileSync(archive));
  const r = JSON.parse(bytes), s = r.snapshot;
  const testCase = fixture.cases.find(c => c.instanceId === s.source.rootNodeId);
  assert(testCase, `Unexpected root in ${name}`);
  assert(!seen.has(testCase.id), `Duplicate case ${testCase.id}`);
  seen.add(testCase.id);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.52');
  assert.equal(r.run.manualRevision, 30);
  assert.equal(r.run.trigger, 'selected-instance');
  assert.equal(r.summary.validationMode, 'component-audit');
  assert.equal(core.stableHash(r.sources.manual), core.stableHash(manual));
  assert.equal(core.stableHash(r.sources.compiledContract), core.stableHash(compiled));
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(s), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.equal(s.source.componentKey, testCase.key);
  assert.equal(r.run.capture.componentKey, testCase.key);
  assert.equal(r.run.capture.matchedBaselineNodes, s.nodes.length);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.equal(r.summary.complete, true);
  for (const key of ['notExecuted', 'inconclusive', 'excludedRules', 'unknownApplicabilityRules']) assert.equal(r.summary[key], 0);
  const engine = core.evaluateCompiledContract(s, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, s);
  const details = core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy);
  for (const [actual, expected] of [[engine, r.results.engine], [editor, r.results.editor], [details, r.results.details]]) {
    assert.equal(core.stableHash(actual), core.stableHash(expected), `${testCase.id}: exact replay`);
  }
  const blur = engine.evaluations.filter(e => e.ruleId === compiledRuleId);
  assert.equal(blur.length, 1);
  assert.equal(blur[0].classification, testCase.expected);
  assert.equal(blur[0].subjectNodeId, s.selection[0]);
  assert.deepEqual(blur[0].trace.actual, core.captureEffectDetails(testCase.actual.effects, testCase.actual.effectStyleId));
  assert.deepEqual(blur[0].trace.expected, core.captureEffectDetails(testCase.baseline.effects, testCase.baseline.effectStyleId));
  const failures = engine.evaluations.filter(e => !['compliant', 'not-applicable'].includes(e.classification));
  const expectedFailureIds = testCase.expected === 'compliant' ? [] : [compiledRuleId, ...(dualFindingCases.includes(testCase.id) ? [generalRuleId] : [])];
  assert.deepEqual(failures.map(e => e.ruleId).sort(), expectedFailureIds.sort());
  assert(failures.every(e => e.classification === 'violation' && e.subjectNodeId === s.selection[0]));
  const uiFailures = core.groupEvaluationDetails(details).filter(e => e.classification === 'violation');
  assert.equal(uiFailures.length, expectedFailureIds.length);
  assert.deepEqual(r.sources.compilerIssues, [{ level: 'warning', code: 'TARGET_UNRESOLVED', path: '/targets/6', message: 'Target resolution is missing.' }]);
  assert.equal(r.summary.contractReadiness.status, 'draft');
  assert.equal(r.summary.contractReadiness.unreviewedRuleIds.length, 16);
  if (fs.existsSync(archive)) assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  archives.push({ archive, bytes });
  reportResults.push({
    caseId: testCase.id, originalFile, fixtureFile, sha256: sha(bytes),
    rootNodeId: s.source.rootNodeId, componentKey: s.source.componentKey,
    capturedAt: r.run.snapshotCapturedAt, expected: testCase.expected,
    actual: blur[0].classification, effectComparison: blur[0].trace,
    complete: true, notExecuted: 0, inconclusive: 0,
    capturedNodes: s.nodes.length, matchedNodes: r.run.capture.matchedBaselineNodes,
    engineEvaluations: engine.evaluations.length, classifications: r.summary.classifications,
    failures: failures.map(e => ({ ruleId: e.ruleId, severity: e.severity, nodeId: e.subjectNodeId, factPaths: e.trace.factPaths })),
    uiViolationCards: uiFailures.length,
    replay: { engine: true, editor: true, details: true },
  });
}
assert.deepEqual([...seen].sort(), fixture.cases.map(c => c.id).sort());
assert.deepEqual(reportResults.filter(r => r.actual === 'violation').map(r => r.caseId), ['CB08', 'CB09', 'CB10', 'CB11', 'CB12']);
const result = {
  schemaVersion: 'apollo.button-control-blur-live-review.v1',
  date: '2026-09-29', status: 'control-blur-functional-p0-live-verified',
  componentId: 'core.web.button', sourceRuleId, editorVersion: '0.2.52', manualRevision: 30,
  manualSourceHash: core.stableHash(manual), compiledStableHash: core.stableHash(compiled),
  artifacts: artifactsBefore, normativeArtifactsChanged: false,
  reports: reportResults.length, expectedCompliant: 11, expectedViolation: 5,
  totalEngineEvaluations: reportResults.reduce((n, r) => n + r.engineEvaluations, 0),
  matchedNodes: reportResults.reduce((n, r) => n + r.matchedNodes, 0),
  captureWarnings: 0, notExecuted: 0, inconclusive: 0, allReplayExact: true,
  reportResults,
  followUps: [
    { priority: 'P1', kind: 'duplicate-diagnostics', cases: dualFindingCases, ruleIds: [generalRuleId, compiledRuleId],
      reason: 'Same root effect edit yields two UI cards: appearance.effects and appearance.effectDetailsV1. Keep engine evidence; group semantically equivalent UI findings without suppressing unrelated effects. Severity is error vs warning and must remain traceable.' },
    { kind: 'readiness-review', targetId: 'target.spinner', warning: 'TARGET_UNRESOLVED /targets/6',
      reason: 'Pre-existing missing source target resolution; all 247 live nodes match. These nonloading cases do not verify Spinner dependency execution. Resolve readiness semantics separately; do not silently mark the source target resolved.' },
    { kind: 'manual-rule-review', unreviewedSourceRules: 16,
      reason: 'Complete scenarios do not mean the entire Draft manual is reviewed or Ready.' },
  ],
  contractReady: false,
  limitations: [
    'Live verification concerns the sixteen CB cases, not every variant/mode combination.',
    'CB10 tests radius change plus detached binding; CB11 separately isolates style identity with identical effects.',
    'No new Spinner Loading or transition tests; Spinner matrix owner acceptance is recorded separately.',
    'Production Hub, runtime index, Figma library, manual and compiled JSON were not changed.',
  ],
};
if (process.argv.includes('--record')) {
  for (const { archive, bytes } of archives) {
    if (!fs.existsSync(archive)) {
      fs.mkdirSync(path.dirname(archive), { recursive: true });
      fs.writeFileSync(archive, zlib.gzipSync(bytes), { flag: 'wx' });
    }
    assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  }
  fs.writeFileSync(path.join(root, 'qa/control-blur-r30-live-review.2026-09-29.json'), JSON.stringify(result, null, 2) + '\n');
}
assert.deepEqual(Object.fromEntries(artifactFiles.map(file => [file, sha(fs.readFileSync(path.join(root, file)))])), currentArtifactsBefore);
console.log(JSON.stringify({ status: result.status, reports: result.reports, compliant: 11, violation: 5,
  engineEvaluations: result.totalEngineEvaluations, matchedNodes: result.matchedNodes,
  exactReplay: true, duplicateUiCases: dualFindingCases, contractReady: false,
  archivesRecorded: process.argv.includes('--record') }, null, 2));
