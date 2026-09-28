const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Spinner');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const acceptance = read('qa/gradient-live-acceptance.2026-09-27.json');
const reports = acceptance.reportResults.map(item => ({ item, report: read(item.file) }));
const clone = value => JSON.parse(JSON.stringify(value));
const gradient = snapshot => snapshot.nodes.find(n => n.appearance?.fill?.some(p => p.type === 'GRADIENT_ANGULAR'));
const violations = result => result.engine.evaluations.filter(e => e.classification === 'violation');
function run(r, snapshot = r.snapshot) {
  const engine = core.evaluateCompiledContract(snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine,
    { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, snapshot);
  return { engine, editor };
}

// Replay the accepted embedded release, not whatever manual revision comes next.
for (const { item, report: r } of reports) test(`${item.caseId}: immutable live report, exact replay and declared coverage`, () => {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, item.file))).digest('hex');
  assert.equal(sha, item.sha256);
  assert.equal(r.snapshot.source.rootNodeId, item.nodeId);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.32');
  assert.equal(r.run.manualRevision, 6);
  assert.equal(core.stableHash(r.sources.manual), acceptance.manualSourceHash);
  assert.equal(r.run.context.product, 'ab');
  assert.equal(r.snapshot.source.gradientPaintCaptureVersion, 1);
  assert.equal(r.runtime.evaluatedContract.runtimePolicy.gradientPaintFactsVersion, 1);
  assert.equal(r.run.capture.matchedBaselineNodes, 6);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  assert.deepEqual(r.sources.compilerIssues, []);
  const out = run(r);
  assert.deepEqual(out.engine, r.results.engine);
  assert.deepEqual(out.editor, r.results.editor);
  const details = core.buildEvaluationDetails(out.editor, r.runtime.evaluatedContract, r.anatomy);
  assert.deepEqual(clone(details), r.results.details);
  const found = details.filter(d => d.classification === 'violation');
  const groups = core.groupEvaluationDetails(found);
  assert.equal(found.length, item.atomicViolations);
  assert.equal(groups.length, item.uiCards);
  if (groups.length) assert.equal(groups[0].evaluations.length, 2);
  assert.equal(out.engine.evaluations.length, 138);
  assert.equal(out.engine.coverage.byClassification['not-applicable'], 18);
  assert.equal(out.editor.scenarioCoverage.complete, true);
  for (const k of ['notExecuted', 'inconclusive', 'excludedRules', 'unknownApplicabilityRules']) assert.equal(out.editor.scenarioCoverage[k], 0);
  assert.equal(out.editor.contractReadiness.status, 'draft');
});

test('G01–G04: independent reference stays unchanged; exact alpha, transform and binding deltas', () => {
  const pristine = reports[0].report;
  const expected = gradient(pristine.snapshot).appearance.fill;
  for (const { report: r } of reports) {
    const n = gradient(r.snapshot);
    assert.deepEqual(n.baseline.effective.appearance.fill, expected);
    assert.deepEqual(core.gradientPaintIssues(n.appearance.fill), []);
    assert.deepEqual(core.gradientPaintIssues(n.baseline.effective.appearance.fill), []);
    assert.deepEqual(r.snapshot.variantReference.properties, { Size: '48', Static: 'False', Inverted: 'False' });
  }
  const g02 = clone(gradient(reports[1].report.snapshot).appearance.fill);
  assert.ok(Math.abs(g02[0].gradientStops[2].color.a - 0.45) < 1e-6);
  g02[0].gradientStops[2].color.a = 1;
  assert.deepEqual(g02, expected);
  const g03 = clone(gradient(reports[2].report.snapshot).appearance.fill);
  assert.ok(Math.abs(g03[0].gradientTransform[0][2] - expected[0].gradientTransform[0][2] - 0.18) < 1e-6);
  g03[0].gradientTransform[0][2] = expected[0].gradientTransform[0][2];
  assert.deepEqual(g03, expected);
  const ellipse = reports[3].report.snapshot.nodes.find(n => n.name === 'Ellipse 1');
  assert.ok(ellipse.baseline.effective.appearance.fill[0].tokenId);
  assert.equal(ellipse.appearance.fill[0].tokenId, undefined);
  const unbound = clone(ellipse.baseline.effective.appearance.fill);
  delete unbound[0].tokenId;
  assert.deepEqual(ellipse.appearance.fill, unbound);
});

test('accepted live capture loses completeness if actual OR reference gradient facts are removed', () => {
  const r = reports[0].report;
  for (const reference of [false, true]) for (const field of ['gradientStops', 'gradientTransform']) {
    const snapshot = clone(r.snapshot), n = gradient(snapshot);
    delete (reference ? n.baseline.effective : n).appearance.fill[0][field];
    const out = run(r, snapshot);
    assert.equal(out.editor.scenarioCoverage.complete, false);
    assert.ok(out.editor.scenarioCoverage.inconclusive > 0);
    assert.equal(violations(out).length, 0);
    assert.ok(out.editor.evaluations.some(e => e.evidenceIssues?.some(p => p.endsWith(field))));
  }
});

test('restoring the changed paint in a copy of each negative report removes its finding', () => {
  // Counterfactual replay only; this does not implement or test Figma reset UI.
  for (const { report: r } of reports.slice(1)) {
    const snapshot = clone(r.snapshot);
    const ids = new Set(r.results.engine.evaluations.filter(e => e.classification === 'violation').map(e => e.subjectNodeId));
    assert.equal(ids.size, 1);
    for (const n of snapshot.nodes) if (ids.has(n.id)) n.appearance.fill = clone(n.baseline.effective.appearance.fill);
    const out = run(r, snapshot);
    assert.equal(violations(out).length, 0);
    assert.equal(out.editor.scenarioCoverage.complete, true);
  }
});
