const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Spinner');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const acceptance = read('qa/layout-live-acceptance.2026-09-27.json');
const reports = acceptance.reportResults.map(item => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  return { item, bytes, report: JSON.parse(bytes) };
});
const clone = value => JSON.parse(JSON.stringify(value));
const violations = out => out.engine.evaluations.filter(e => e.classification === 'violation');
function run(r, snapshot = r.snapshot) {
  const engine = core.evaluateCompiledContract(snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine,
    { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, snapshot);
  return { engine, editor };
}

// Pin embedded r7 evidence. Later manual revisions must not rewrite this acceptance.
for (const { item, bytes, report: r } of reports) test(`${item.caseId}: exact live replay, identity, grouping and complete coverage`, () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
  assert.equal(r.snapshot.source.rootNodeId, item.nodeId);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.33');
  assert.equal(r.run.manualRevision, 7);
  assert.equal(core.stableHash(r.sources.manual), acceptance.manualSourceHash);
  assert.equal(r.run.manualSourceHash, acceptance.manualSourceHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.deepEqual(r.sources.manual, reports[0].report.sources.manual);
  assert.deepEqual(r.sources.compiledContract, reports[0].report.sources.compiledContract);
  assert.equal(r.run.context.product, 'ab');
  assert.equal(r.snapshot.source.truncated, false);
  assert.equal(r.snapshot.source.componentKey, '99b713358a7c689c30efa80e679ce4afc2d02406');
  assert.equal(r.snapshot.variantReference.complete, true);
  assert.deepEqual(r.snapshot.variantReference.properties, { Size: '48', Static: 'False', Inverted: 'False' });
  assert.equal(r.run.capture.matchedBaselineNodes, 6);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  assert.deepEqual(r.sources.compilerIssues, []);
  const out = run(r);
  assert.deepEqual(out.engine, r.results.engine);
  assert.deepEqual(out.editor, r.results.editor);
  const details = clone(core.buildEvaluationDetails(out.editor, r.runtime.evaluatedContract, r.anatomy));
  assert.deepEqual(details, r.results.details);
  const found = details.filter(d => d.classification === 'violation');
  const groups = core.groupEvaluationDetails(found);
  assert.equal(found.length, item.atomicViolations);
  assert.equal(groups.length, item.uiCards);
  if (item.caseId === 'L04') assert.equal(groups[0].evaluations.length, 2);
  assert.equal(out.engine.evaluations.length, 168);
  assert.equal(out.engine.coverage.byClassification['not-applicable'], 68);
  assert.equal(out.editor.scenarioCoverage.complete, true);
  for (const field of ['notExecuted', 'inconclusive', 'excludedRules', 'unknownApplicabilityRules']) {
    assert.equal(out.editor.scenarioCoverage[field], 0);
  }
  assert.equal(out.editor.contractReadiness.status, 'draft');
  assert.deepEqual(out.editor.contractReadiness.unreviewedRuleIds, acceptance.unreviewedRuleIds);
});

test('L01–L06: exact authored layout deltas, independent reference, unchanged paints and intrinsic bounds', () => {
  const pristine = reports[0].report.snapshot;
  for (const { item, report: r } of reports) for (const n of r.snapshot.nodes) {
    const original = pristine.nodes.find(p => p.id === n.id);
    assert.ok(original);
    assert.deepEqual(n.baseline.effective.layout, original.baseline.effective.layout);
    assert.deepEqual(n.baseline.effective.appearance, original.baseline.effective.appearance);
    assert.deepEqual(n.appearance, original.appearance);
    assert.equal(n.bounds.width, original.bounds.width);
    assert.equal(n.bounds.height, original.bounds.height);
    const expected = clone(original.layout);
    if (item.caseId === 'L02' && n.name === 'Fixer') {
      expected.padding = { top: 12, right: 16, bottom: 20, left: 24, horizontal: 40, vertical: 32 };
    }
    if (item.caseId === 'L03' && n.name === 'Fixer') {
      expected.primaryAxisAlignItems = expected.counterAxisAlignItems = 'MAX';
    }
    if (item.caseId === 'L04' && n.id === 'preview:0') {
      expected.padding.top = expected.padding.vertical = 12;
    }
    if (item.caseId === 'L05' && n.id === 'preview:0') expected.primaryAxisAlignItems = 'MAX';
    if (item.caseId === 'L06' && n.id === 'preview:0') expected.counterAxisAlignItems = 'MAX';
    assert.deepEqual(n.layout, expected);
  }
});

test('L02/L03: changed inactive facts are explicitly not-applicable, never silent passes or violations', () => {
  for (const [index, field, count] of [[1, 'paddingApplicable', 8], [2, 'axisAlignmentApplicable', 2]]) {
    const r = reports[index].report;
    const n = r.snapshot.nodes.find(n => n.name === 'Fixer');
    assert.equal(n.layout.mode, 'NONE');
    assert.equal(n.propertyActivityV1[field], false);
    assert.equal(n.baseline.effective.propertyActivityV1[field], false);
    const details = r.results.details.filter(d => d.nodeId === n.id && d.factPath === `propertyActivityV1.${field}`);
    assert.equal(details.length, count);
    for (const d of details) {
      assert.equal(d.classification, 'not-applicable');
      assert.match(d.reasonLabel, /по условию контракта/);
    }
  }
});

test('missing activity on either inactive side makes a copied live scenario incomplete', () => {
  // Counterfactual snapshots only, not additional reachable Figma instance configurations.
  for (const [index, field] of [[1, 'paddingApplicable'], [2, 'axisAlignmentApplicable']]) {
    const r = reports[index].report;
    for (const reference of [false, true]) {
      const s = clone(r.snapshot), n = s.nodes.find(n => n.name === 'Fixer');
      delete (reference ? n.baseline.effective : n).propertyActivityV1[field];
      const out = run(r, s);
      assert.equal(out.editor.scenarioCoverage.complete, false);
      assert.ok(out.editor.scenarioCoverage.inconclusive > 0);
      assert.equal(violations(out).length, 0);
    }
  }
});

test('an independently known active side still checks padding when the other side is unknown', () => {
  const r = reports[3].report;
  for (const reference of [false, true]) {
    const s = clone(r.snapshot), n = s.nodes[0];
    delete (reference ? n.baseline.effective : n).propertyActivityV1.paddingApplicable;
    const out = run(r, s);
    assert.equal(out.editor.scenarioCoverage.complete, true);
    assert.equal(violations(out).length, 2);
  }
});

test('restoring only the changed fact removes the negative finding in replay', () => {
  // No claim about a Figma reset action: this verifies the diagnostic counterfactual.
  for (const [index, field] of [[3, 'padding'], [4, 'primaryAxisAlignItems'], [5, 'counterAxisAlignItems']]) {
    const r = reports[index].report, s = clone(r.snapshot), n = s.nodes[0];
    n.layout[field] = clone(n.baseline.effective.layout[field]);
    const out = run(r, s);
    assert.equal(violations(out).length, 0);
    assert.equal(out.editor.scenarioCoverage.complete, true);
  }
});
