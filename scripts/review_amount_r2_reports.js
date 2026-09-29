// Historical reproduction of the first Amount live run, not a desired-behavior test.
// Read-only by default; --record preserves reports and writes diagnostic evidence.
// Does not modify contracts, packages, production catalogs, or Editor code.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const coreFile = path.resolve(__dirname, '../../../projects/ComponentContractEditor/dist/core.cjs');
const core = require(coreFile);
const root = path.resolve(__dirname, '../experiments/web-core/core/Amount/authoring');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const times = [
  '09-40-19-671', '09-40-48-265', '09-40-56-368', '09-41-03-934',
  '09-41-19-939', '09-41-29-577', '09-41-36-226', '09-41-43-289',
  '09-41-53-637', '09-42-02-072', '09-42-09-914', '09-42-17-082',
  '09-42-27-512', '09-42-34-793', '09-42-40-810', '09-42-47-560',
  '09-42-55-415', '09-43-09-355',
];
const matrix = read('reports/testcases-r2.2026-09-29.json');
const manual = read('contract.manual.json'), compiled = read('compiled/component-contract.v2.json');
const artifactFiles = ['contract.manual.json', 'compiled/component-contract.v2.json', 'editor/Amount.editor-input.zip'];
const artifactHashes = () => Object.fromEntries(artifactFiles.map(file => [file, sha(fs.readFileSync(path.join(root, file)))]));
const artifactsBefore = artifactHashes();
const archives = [], reports = [], seen = new Set();
for (const time of times) {
  const name = `amount.validation-report.2026-09-29T${time}Z.json`;
  const originalFile = `editor/${name}`, fixtureFile = `reports/fixtures/r2-editor-0.2.54/${name}.gz`;
  const original = path.join(root, originalFile), archive = path.join(root, fixtureFile);
  const bytes = fs.existsSync(original) ? fs.readFileSync(original) : zlib.gunzipSync(fs.readFileSync(archive));
  const r = JSON.parse(bytes), s = r.snapshot;
  const testCase = matrix.cases.find(c => c.nodeId === s.source.rootNodeId);
  assert(testCase && !seen.has(testCase.id), `Unknown or repeated case: ${name}`);
  seen.add(testCase.id);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.54');
  assert.equal(r.run.manualRevision, 2);
  assert.equal(r.run.trigger, 'selected-instance');
  assert.equal(s.source.instanceIdentityVersion, 1);
  assert.equal(s.source.componentKey, testCase.key);
  assert.equal(core.stableHash(r.sources.manual), core.stableHash(manual));
  assert.equal(core.stableHash(r.sources.compiledContract), core.stableHash(compiled));
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(s), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.deepEqual(r.sources.compilerIssues, []);
  const engine = core.evaluateCompiledContract(s, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, s);
  const details = core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy);
  for (const [actual, expected] of [[engine, r.results.engine], [editor, r.results.editor], [details, r.results.details]]) {
    assert.equal(core.stableHash(actual), core.stableHash(expected), `${testCase.id}: historical replay differs`);
  }
  const swapped = testCase.id.startsWith('A17');
  const expectedUnknown = swapped ? 35 : testCase.id === 'A12' ? 18
    : ['A13', 'A14B', 'A14C'].includes(testCase.id) ? 16 : 14;
  assert.equal(r.summary.complete, false);
  assert.equal(r.summary.inconclusive, expectedUnknown);
  assert.equal(r.summary.notExecuted, 0);
  assert.equal(r.summary.contractReadiness.status, 'draft');
  assert.equal(r.run.capture.matchedBaselineNodes, swapped ? 0 : 9);
  assert.equal(r.run.capture.warnings.length, swapped ? 1 : 0);
  const violations = engine.evaluations.filter(e => e.classification === 'violation');
  const expectedIds = testCase.id === 'A15' ? ['component:web-core.amount.layer-properties-use-effective-baseline.1.6']
    : testCase.id === 'A16' ? ['component:web-core.amount.major-required.1.1'] : [];
  assert.deepEqual(violations.map(e => e.ruleId), expectedIds);
  const n = s.nodes.find(n => s.selection.includes(n.id));
  const bindingEvidence = Object.fromEntries(['minorEnabled', 'currencyEnabled', 'addonEnabled'].map(id => [id, n.semanticBindingEvidence[id]]));
  assert(Object.values(bindingEvidence).every(e => e.reason === 'source-missing-unknown-or-incompatible'));
  const changedParts = testCase.id === 'A12' ? 2 : ['A13', 'A14B', 'A14C'].includes(testCase.id) ? 1 : 0;
  if (changedParts) {
    assert.equal(s.instanceContentResults.length, changedParts);
    assert(s.instanceContentResults.every(e => e.status === 'matched' && e.lineageProven && e.reason === 'independent-host-variant-reference'));
    assert.equal(n.variantAvailability.targets.currency, undefined);
  }
  if (swapped) assert.equal(n.variantAvailability.reason, 'instance-structure-needs-remap');
  if (fs.existsSync(archive)) assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  archives.push({ archive, bytes });
  reports.push({
    caseId: testCase.id, originalFile, fixtureFile, sha256: sha(bytes), rootNodeId: s.source.rootNodeId,
    expected: testCase.expected, complete: false, notExecuted: 0, inconclusive: r.summary.inconclusive,
    classifications: r.summary.classifications, engineEvaluations: engine.evaluations.length,
    capturedNodes: s.nodes.length, matchedNodes: r.run.capture.matchedBaselineNodes, warnings: r.run.capture.warnings,
    violations: violations.map(e => ({ ruleId: e.ruleId, subjectNodeId: e.subjectNodeId, trace: e.trace })),
    rootPropertyFacts: n.component.properties, bindingEvidence,
    variantAvailability: { status: n.variantAvailability.status, reason: n.variantAvailability.reason, targets: n.variantAvailability.targets },
    instanceBoundaries: s.instanceBoundaries, instanceContentResults: s.instanceContentResults,
    unresolvedRuleIds: [...new Set(engine.evaluations.filter(e => e.classification === 'human-review').map(e => e.ruleId))],
    exactReplay: { engine: true, editor: true, details: true },
    acceptance: swapped ? 'safe-incomplete-fallback-confirmed-not-a-detected-violation'
      : expectedIds.length ? 'intended-violation-detected-but-scenario-incomplete' : 'positive-case-incomplete',
  });
}
assert.deepEqual([...seen].sort(), matrix.cases.filter(c => !c.id.startsWith('A18')).map(c => c.id).sort());
const sum = key => reports.reduce((n, r) => n + r[key], 0);
const result = {
  schemaVersion: 'apollo.amount-live-review.v1', date: '2026-09-29',
  status: 'live-matrix-incomplete-editor-defects-confirmed', componentId: 'core.web.amount',
  editorVersion: '0.2.54', manualRevision: 2, coreByteSha256: sha(fs.readFileSync(coreFile)),
  manualSourceHash: core.stableHash(manual), compiledStableHash: core.stableHash(compiled),
  artifacts: artifactsBefore, normativeArtifactsChanged: false, contractReady: false,
  reports: reports.length, allReplayExact: true, completeScenarios: 0,
  totalEngineEvaluations: sum('engineEvaluations'), capturedNodes: sum('capturedNodes'), matchedNodes: sum('matchedNodes'),
  inconclusive: sum('inconclusive'), notExecuted: sum('notExecuted'),
  violationEvaluations: reports.reduce((n, r) => n + r.violations.length, 0),
  captureWarnings: reports.reduce((n, r) => n + r.warnings.length, 0),
  importIdentityFix: 'confirmed-for-18-Amount-instances', unreportedCases: ['A18A', 'A18B'],
  findings: [
    { id: 'amount-public-property-binding', priority: 'P0',
      cause: 'Manual semantic paths use Minor/Currency/Addon; live capture preserves the #propertyId suffix. Exact lookups in semantic-facts.ts and variant-facts.ts cannot resolve these public properties.',
      effect: 'Six visibility checks and eight order checks are human-review even in unchanged Amount.',
      next: 'Use shared evidence-backed property identity resolution, prefer exact IDs, accept an unsuffixed alias only when unique and type-compatible; collisions/missing facts stay unknown. Do not rewrite raw snapshot facts.' },
    { id: 'amount-nested-variant-target', priority: 'P0',
      cases: ['A12', 'A13', 'A14B', 'A14C'],
      cause: 'variantAvailability isolates all targets within component-variant-changed boundaries, including the boundary root. Independent host reference and lineage are proven but semantic target presence/visibility remains unknown.',
      next: 'Separate proven target identity/visibility from interior baseline permissions. Restore only evidence-proven targets; same-set is not blanket permission to edit descendants.' },
    { id: 'amount-fixture-fidelity', priority: 'P0',
      cause: 'Synthetic Amount fixtures strip property #IDs and omit instanceIdentityVersion=1; existing green tests do not represent the current live capture path.',
      next: 'Use these preserved snapshots for desired-behavior regression tests after the fix, including raw property IDs, current capture profile, ambiguous aliases and nested variants; retain Button/Spinner parity gates.' },
    { id: 'amount-replacement-remap', priority: 'P1', cases: ['A17A', 'A17B'],
      cause: 'Replacement creates two sibling Major identities without an INSTANCE_SWAP port. compareInstanceCorrespondence rejects non-unique identity correspondence; variantAvailability becomes globally unknown.',
      result: 'Safe incomplete fallback satisfies the no-full-pass test. It does not establish a precise identity violation; 0/9 baseline nodes match.',
      next: 'Improve scoped diagnostics only with proven anchors; do not guess by name or sibling order and do not grant an unrelated component the original baseline.' },
  ],
  limitations: [
    'A15 gap and A16 Major visibility violations are confirmed; every scenario is still incomplete.',
    'The fourteen positive cases have no violation findings, but this is not acceptance while checks remain inconclusive.',
    'A18A/B are rejected-before-evaluation cases; no user evidence of their outcome was supplied.',
    'Internal style/token policy, Currency text boundary and Addon boundary remain separate unresolved contract scope.',
    'This is historical replay of Editor 0.2.54, not an assertion that these defective outcomes must persist after fixes.',
  ],
  reportResults: reports,
};
assert.equal(result.totalEngineEvaluations, 630);
assert.equal(result.inconclusive, 304);
if (process.argv.includes('--record')) {
  for (const { archive, bytes } of archives) {
    if (!fs.existsSync(archive)) {
      fs.mkdirSync(path.dirname(archive), { recursive: true });
      fs.writeFileSync(archive, zlib.gzipSync(bytes), { flag: 'wx' });
    }
    assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  }
  fs.writeFileSync(path.join(root, 'reports/live-review-r2.2026-09-29.json'), JSON.stringify(result, null, 2) + '\n');
}
assert.deepEqual(artifactHashes(), artifactsBefore);
console.log(JSON.stringify({ status: result.status, reports: result.reports, exactReplay: true,
  completeScenarios: result.completeScenarios, evaluations: result.totalEngineEvaluations,
  inconclusive: result.inconclusive, violations: result.violationEvaluations,
  matchedNodes: result.matchedNodes, capturedNodes: result.capturedNodes,
  unreportedCases: result.unreportedCases, normativeArtifactsChanged: false,
  recorded: process.argv.includes('--record') }, null, 2));
