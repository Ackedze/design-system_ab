// QA evidence only: preserves original reports and diagnoses r28; no runtime/contract edits.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const core = require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fixtures = read('qa/text-layout-test-cases.2026-09-29.json');
const textId = 'component:web-core.button.text-resizing-maps-to-figma-layout.1.1';
const innerId = 'component:web-core.button.internal-sizing-locked.1.1';
const times = ['23-03-56-341','23-04-07-554','23-04-15-838','23-04-24-155','23-04-30-981',
  '23-04-38-251','23-04-49-821','23-04-56-466','23-05-33-758','23-05-52-854',
  '23-06-26-429','23-06-44-470','23-06-57-614','23-07-13-597','23-07-26-118'];
const results = [];
let engineEvaluations = 0, matchedNodes = 0;
for (const time of times) {
  const name = `button.validation-report.2026-09-28T${time}Z.json`;
  const relative = `qa/fixtures/text-layout-r28/${name}.gz`;
  const target = path.join(root, relative), original = path.join(root, 'editor', name);
  const bytes = fs.existsSync(original) ? fs.readFileSync(original) : zlib.gunzipSync(fs.readFileSync(target));
  const r = JSON.parse(bytes), fx = fixtures.cases.find(c => c.instanceId === r.snapshot.source.rootNodeId);
  assert.ok(fx, name);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.48');
  assert.equal(r.run.manualRevision, 28);
  assert.equal(core.stableHash(r.sources.manual), fixtures.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract), fixtures.compiledStableHash);
  assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.equal(r.run.capture.componentKey, fx.componentKey);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  assert.equal(r.run.capture.matchedBaselineNodes, r.snapshot.nodes.length);
  const engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine,
    { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
  const details = core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy);
  for (const [actual, expected] of [[engine,r.results.engine],[editor,r.results.editor],[details,r.results.details]])
    assert.equal(core.stableHash(actual), core.stableHash(expected), `Replay: ${name}`);
  const intrinsic = editor.evaluations.find(e => e.ruleId === textId);
  const specification = editor.evaluations.find(e => e.ruleId === `${textId}.specification`);
  assert.ok(intrinsic && specification);
  const hidden = fx.caseId.startsWith('TL10');
  assert.equal(intrinsic.classification, hidden ? 'not-applicable'
    : ['TL03','TL04','TL07B'].includes(fx.caseId) ? 'violation' : 'compliant');
  assert.equal(specification.classification, hidden || r.summary.validationMode === 'component-audit'
    ? 'not-applicable' : fx.caseId === 'TL08A' ? 'violation' : fx.caseId === 'TL08B' ? 'compliant' : 'human-review');
  const violations = editor.evaluations.filter(e => e.classification === 'violation');
  assert.equal(violations.length, ['TL03','TL04','TL06','TL07B','TL08A'].includes(fx.caseId) ? 1 : 0);
  if (fx.caseId === 'TL06') {
    assert.equal(violations[0].subjectNodeName, 'Text');
    assert.equal(violations[0].trace.actual, 12);
    assert.equal(violations[0].trace.expected, 4);
  }
  const regression = editor.evaluations.find(e => e.ruleId === innerId && e.classification === 'human-review');
  if (fx.caseId === 'TL10B') {
    assert.ok(regression);
    const n = r.snapshot.nodes.find(n => n.id === regression.subjectNodeId);
    assert.equal(n.semantic.role, undefined);
    assert.equal(n.layout.sizingHorizontal, 'HUG');
    assert.equal(n.baseline.effective.layout.sizingHorizontal, 'HUG');
    assert.ok(regression.trace.children.some(t => t.predicate === 'none-of' && t.truth === 'unknown'
      && t.factPaths.includes('semantic.role')));
    // Diagnostic counterfactual only. NEVER publish this relaxed rule as a fix.
    const diagnostic = JSON.parse(JSON.stringify(r.runtime.evaluatedContract));
    diagnostic.rules.find(rule => rule.ruleId === innerId).when.args =
      diagnostic.rules.find(rule => rule.ruleId === innerId).when.args.filter(a => a.actual?.fact !== 'semantic.role');
    const rerun = core.evaluateCompiledContract(r.snapshot, diagnostic);
    assert.equal(rerun.evaluations.find(e => e.ruleId === innerId && e.subjectNodeId === n.id).classification, 'compliant');
  } else assert.equal(regression, undefined);
  if (fs.existsSync(target)) assert.equal(sha(zlib.gunzipSync(fs.readFileSync(target))), sha(bytes));
  else { fs.mkdirSync(path.dirname(target), { recursive:true }); fs.writeFileSync(target,zlib.gzipSync(bytes),{flag:'wx'}); }
  results.push({ caseId:fx.caseId, mode:r.summary.validationMode, fixtureFile:relative, originalFile:`editor/${name}`,
    sha256:sha(bytes), rootNodeId:fx.instanceId, capturedAt:r.run.snapshotCapturedAt,
    intent:r.snapshot.validationIntent?.values ?? null, platform:r.run.context.platform,
    engineEvaluations:engine.evaluations.length, matchedNodes:r.run.capture.matchedBaselineNodes,
    complete:r.summary.complete, notExecuted:r.summary.notExecuted, inconclusive:r.summary.inconclusive,
    textResult:intrinsic.classification, textSpecificationResult:specification.classification,
    groupedViolationCards:core.groupEvaluationDetails(details).filter(d=>d.classification==='violation').length,
    exceptions:editor.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification))
      .map(e=>({ruleId:e.ruleId,node:e.subjectNodeName,classification:e.classification,reason:e.trace.reason})),
    dependencyRuns:engine.dependencyRuns.map(d=>({componentId:d.componentId,revision:d.revision,status:d.status,evaluations:typeof d.evaluations==='number'?d.evaluations:0})),
    replay:{engine:true,editor:true,details:true,provenance:true} });
  engineEvaluations += engine.evaluations.length;
  matchedNodes += r.run.capture.matchedBaselineNodes;
}
assert.equal(results.length,15);
assert.equal(new Set(results.map(r=>`${r.caseId}/${r.mode}`)).size,15);
// This review describes the original 0.2.48 compilation, not later compiler fixes.
for (const [file,hash] of Object.entries(fixtures.fileSha256)) {
  const archived=path.join(root,'history/r28-editor-0.2.48/component-contract.v2.json.gz');
  const bytes=file==='compiled/component-contract.v2.json'&&fs.existsSync(archived)
    ? zlib.gunzipSync(fs.readFileSync(archived)) : fs.readFileSync(path.join(root,file));
  assert.equal(sha(bytes),hash);
}
const review = {
  status:'text-scenarios-accepted-loading-integration-p0-open', reviewedAt:'2026-09-29',
  editorVersion:'component-contract-editor@0.2.48', manualRevision:28,
  manualSourceHash:fixtures.manualSourceHash, compiledStableHash:fixtures.compiledStableHash,
  reportCount:15, fixtureCount:13, engineEvaluations, matchedNodes, captureWarnings:0,
  normativeArtifactsChanged:false, contractReady:false, reportResults:results,
  accepted:['Coordinated Hug/Fill desktop and mobile', 'Mixed sizing and incorrect Fill alignment rejected without duplicate baseline violation',
    'Hidden Hint ignored', 'Padding remains protected independently', 'Independent specification hug/fill and missing input distinguished',
    'Text is not applicable for SingleIcon and Loading in both modes'],
  openP0:{id:'configuration-exception-missing-role', layer:'shared compiler / applicability of baseline exception',
    source:'projects/ComponentContractEditor/src/core/compiler.ts:606', affectedCases:['TL10B/component-audit','TL10B/specification'],
    cause:'exceptConfiguration uses none-of semantic.role for every descendant. Nested LeftAddon lacks that optional semantic role; the condition becomes unknown despite actual HUG matching effective baseline HUG.',
    requiredFix:'Exclude only proven resolved Text/Label/Hint target identities. Other owned nodes retain baseline checks even without a semantic role. Ambiguous targets must remain incomplete; never default unknown to pass or infer role from display name.',
    evidence:'Removing only the semantic.role guard in an in-memory diagnostic copy makes LeftAddon HUG vs HUG compliant. This relaxed copy is neither saved nor a production fix.'},
  limits:['Full series not accepted until the Loading baseline-exception regression is fixed and retested.',
    'TL10A/B specification captures have empty intent: block is unset, not false. Two block human-review results are expected. Retest with block=false to isolate text; do not change Figma width.',
    'Loading has no before snapshot, so loading-preserves-width is legitimately not-executed.',
    'nowrap remains context-only. In Loading specification its applicability is unknown, producing a pending item despite hidden text; address hidden/absent target applicability in the separate nowrap task.',
    'TL09 proves that the report contains no text expectation and no false pass; reports alone cannot prove the exact UI auto-reset interaction.',
    'Package remains Draft/unpublished. Pattern usage and code mappings are not made Ready by these tests.'],
  originals:'All15 input reports copied as immutable gzip/SHA fixtures; originals in editor/ left untouched.'
};
fs.writeFileSync(path.join(root,'qa/text-layout-live-review.2026-09-29.json'),JSON.stringify(review,null,2)+'\n');
console.log(JSON.stringify({reports:results.length,engineEvaluations,matchedNodes,status:review.status,archiveVerified:true},null,2));
