// Re-evaluate immutable 0.2.54 captures with the corrected shared core.
// --record writes QA only; manual/compiled/input ZIP stay byte-identical.
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const crypto = require('node:crypto'), assert = require('node:assert/strict');
const corePath = path.resolve(__dirname, '../../../projects/ComponentContractEditor/dist/core.cjs');
const core = require(corePath);
const editorVersion = require('../../../projects/ComponentContractEditor/package.json').version;
const root = path.resolve(__dirname, '../experiments/web-core/core/Amount/authoring');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const original = read('reports/live-review-r2.2026-09-29.json');
const artifacts = Object.fromEntries(Object.keys(original.artifacts).map(file => [file, sha(fs.readFileSync(path.join(root, file)))]));
assert.deepEqual(artifacts, original.artifacts);
const reportResults = original.reportResults.map(item => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  assert.equal(sha(bytes), item.sha256);
  const r = JSON.parse(bytes), before = JSON.stringify(r);
  assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  const prepared = core.prepareValidationSnapshot(r.snapshot, r.runtime.evaluatedContract);
  const engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
  assert.deepEqual(core.prepareValidationSnapshot(prepared, r.runtime.evaluatedContract), prepared);
  assert.deepEqual(core.evaluateCompiledContract(prepared, r.runtime.evaluatedContract), engine);
  assert.equal(JSON.stringify(r), before);
  const violations = engine.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId);
  const expected = item.caseId === 'A15' ? ['component:web-core.amount.layer-properties-use-effective-baseline.1.6']
    : item.caseId === 'A16' ? ['component:web-core.amount.fixed-part-order.visibility-011.1.1', 'component:web-core.amount.major-required.1.1'] : [];
  const swapped = item.caseId.startsWith('A17');
  assert.deepEqual(violations.sort(), expected.sort());
  assert.equal(editor.scenarioCoverage.complete, !swapped);
  assert.equal(editor.scenarioCoverage.inconclusive, swapped ? 28 : 0);
  assert.equal(editor.scenarioCoverage.notExecuted, 0);
  assert.equal(editor.contractReadiness.status, 'draft');
  return { caseId: item.caseId, fixtureFile: item.fixtureFile, sourceSha256: item.sha256,
    sourceEditorVersion: r.editorVersion, manualRevision: r.run.manualRevision,
    originalCoverage: { complete: r.summary.complete, inconclusive: r.summary.inconclusive },
    currentCoverage: editor.scenarioCoverage, violationRuleIds: violations,
    currentSnapshotHash: engine.snapshotHash, evaluations: engine.evaluations.length,
    semanticBindingEvidence: prepared.nodes[0].semanticBindingEvidence,
    sourceCaptureMatchedNodes: r.run.capture.matchedBaselineNodes,
    reEvaluationOnly: true, idempotent: true };
});
const result = {
  schemaVersion: 'apollo.amount-binding-fix-review.v1', date: '2026-09-29',
  status: 'shared-core-fix-offline-verified-live-smoke-pending', editorVersion,
  sourceEditorVersion: '0.2.54', manualRevision: 2, coreByteSha256: sha(fs.readFileSync(corePath)),
  artifacts, normativeArtifactsChanged: false, contractReady: false,
  reports: reportResults.length, completePositiveCases: 14, completeNegativeCases: 2,
  intentionalSafeIncompleteCases: ['A17A', 'A17B'], unreportedIdentityGates: ['A18A', 'A18B'],
  historicalInconclusive: original.inconclusive,
  currentInconclusive: reportResults.reduce((n, r) => n + r.currentCoverage.inconclusive, 0),
  reportResults,
  limitations: [
    'Re-evaluation of saved live facts, not fresh Figma execution with Editor 0.2.55.',
    'A16 now executes its order/composition requirement too: hidden Major violates both required presence and the expected visible sequence.',
    'A17 duplicate Major correspondence remains an explicit P1 gap; no name/order fallback was introduced.',
    'No normative rules, compiled contract, package bytes, product policies, Hub projections or production routes changed.',
  ],
};
if (process.argv.includes('--record')) fs.writeFileSync(path.join(root, 'reports/binding-fix-0.2.55.2026-09-29.json'), JSON.stringify(result, null, 2) + '\n');
for (const [file, hash] of Object.entries(artifacts)) assert.equal(sha(fs.readFileSync(path.join(root, file))), hash);
console.log(JSON.stringify({ status: result.status, editorVersion, reports: result.reports,
  completePositiveCases: 14, completeNegativeCases: 2, intentionalSafeIncompleteCases: result.intentionalSafeIncompleteCases,
  inconclusiveBefore: result.historicalInconclusive, inconclusiveAfter: result.currentInconclusive,
  normativeArtifactsChanged: false, recorded: process.argv.includes('--record') }, null, 2));
