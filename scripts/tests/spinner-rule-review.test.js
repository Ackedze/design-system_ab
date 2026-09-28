const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Spinner');
const editor = path.resolve(repo, '../../projects/ComponentContractEditor');
const core = require(path.join(editor, 'dist/core.cjs'));
const { capture } = require(path.join(editor, 'tests/helpers/spinner-geometry'));
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const clone = x => JSON.parse(JSON.stringify(x));
// Historical r6 review; later manual revisions have separate regression suites.
const manual = read('history/r6-editor-0.2.32/contract.manual.json');
const previous = read('history/r5/contract.manual.json');
const evidence = core.extractVariantEvidence(read('evidence/contract.generated.json').contracts);
const compiled = core.compileManualSource(manual, evidence);
const runtime = core.prepareAuthoringPreviewContract(compiled.contract);
const acceptance = read('qa/live-acceptance.2026-09-27.json');
const baseline = read(acceptance.reportResults.find(r => r.caseId === 'A01').file);
function run(snapshot) {
  const engine = core.evaluateCompiledContract(snapshot, runtime);
  return { engine, report: core.buildEditorValidationReport(engine, compiled, manual, snapshot) };
}
const violations = result => result.engine.evaluations.filter(e => e.classification === 'violation');

test('r6 changes only three review statuses and revision metadata; r5 preserved', () => {
  const reviewed = ['component-properties-are-first-class', 'intrinsic-size-required', 'library-instance-required'];
  const normalized = clone(manual);
  normalized.metadata = previous.metadata;
  for (const rule of normalized.rules) {
    const old = previous.rules.find(r => r.id === rule.id);
    assert.ok(old);
    assert.equal(rule.status, reviewed.some(id => rule.id.endsWith(id)) ? 'reviewed' : old.status);
    rule.status = old.status;
  }
  assert.deepEqual(normalized, previous);
  assert.equal(manual.metadata.revision, 6);
  assert.equal(core.stableHash(previous), acceptance.manualSourceHash);
  assert.equal(core.buildContractReadiness(compiled, manual).unreviewedRuleIds.length, 2);
});

test('all 24 immutable reports replay exactly; archived r6/0.2.31 parity holds, new compiler exposes missing paints', () => {
  const archived = read('history/r6-editor-0.2.31/compiled/component-contract.v2.json');
  const archivedRuntime = core.prepareAuthoringPreviewContract(archived);
  const oldIR = baseline.sources.compiledContract.rules;
  const logic = rules => rules.map(({ revision, source, authority, ...r }) => r);
  assert.deepEqual(logic(archived.rules), logic(oldIR));
  let count = 0;
  for (const item of acceptance.reportResults) {
    const bytes = fs.readFileSync(path.join(root, item.file));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
    const r = JSON.parse(bytes), engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
    assert.deepEqual(engine, r.results.engine);
    assert.deepEqual(core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot), r.results.editor);
    assert.deepEqual(clone(core.buildEvaluationDetails(r.results.editor, r.runtime.evaluatedContract, r.anatomy)), r.results.details);
    const historical = core.evaluateCompiledContract(r.snapshot, archivedRuntime);
    // Revision-derived evaluation IDs change; all verdicts, subjects and traces
    // must remain byte-equivalent after excluding those two provenance fields.
    const outcome = evaluations => evaluations.map(({ evaluationId, ruleRevision, ...e }) => e);
    assert.deepEqual(outcome(historical.evaluations), outcome(engine.evaluations));
    assert.deepEqual(core.buildEditorValidationReport(historical, {contract:archived,issues:[]}, manual, r.snapshot).scenarioCoverage, r.results.editor.scenarioCoverage);
    const current = run(r.snapshot);
    assert.equal(current.report.scenarioCoverage.complete, false);
    assert.ok(current.report.evaluations.some(e=>e.evidenceIssues?.some(p=>p.includes('gradientTransform'))));
    assert.equal(current.report.contractReadiness.status, 'draft');
    count += engine.evaluations.length;
  }
  assert.equal(count, 3312);
});

test('public API stays policy-only, bounded to generated variants; no fabricated assertions', () => {
  const policy = manual.rules.find(r => r.id.endsWith('component-properties-are-first-class'));
  assert.equal(policy.execution.route, 'policy-only');
  assert.deepEqual(policy.controlPaths.map(p => p.property), ['Size', 'Inverted', 'Static']);
  assert.ok(!compiled.contract.rules.some(r => r.source.anchor === policy.id));
  assert.equal(evidence.variants.length, 12);
  assert.ok(manual.rules.every(r => !r.applicability.products?.length && !r.applicability.channels?.length));
});

for (const axis of ['width', 'height']) test(`intrinsic ${axis}: independent reference, negative and missing evidence`, () => {
  const snapshot = clone(baseline.snapshot);
  snapshot.nodes[0].bounds[axis] += 7;
  const actual = run(snapshot);
  assert.equal(violations(actual).length, 1);
  assert.ok(violations(actual)[0].ruleId.includes('intrinsic-size-required'));
  assert.equal(actual.report.scenarioCoverage.complete, false); // Old report lacks gradient data; size check itself executed.
  assert.ok(actual.report.evaluations.some(e=>e.evidenceIssues?.length));
  delete snapshot.nodes[0].baseline.effective.bounds[axis];
  const unknown = run(snapshot);
  assert.equal(unknown.report.scenarioCoverage.complete, false);
  assert.ok(unknown.engine.evaluations.some(e => e.classification === 'human-review' && e.ruleId.includes('intrinsic-size-required')));
});

test('library-instance rule checks type; detached, foreign and missing identity fail closed independently', () => {
  const wrongType = clone(baseline.snapshot);
  wrongType.nodes[0].type = 'FRAME';
  assert.ok(violations(run(wrongType)).some(e => e.ruleId.includes('library-instance-required')));
  for (const kind of ['foreign', 'missing', 'detached']) {
    const snapshot = clone(baseline.snapshot);
    if (kind === 'foreign') {
      snapshot.source.componentKey = 'foreign'; snapshot.source.componentSetKey = 'foreign';
      snapshot.nodes[0].component.identity = { componentKey: 'foreign', componentSetKey: 'foreign' };
    } else {
      delete snapshot.source.componentKey; delete snapshot.source.componentSetKey;
      delete snapshot.nodes[0].component.identity;
      if (kind === 'detached') { snapshot.nodes[0].type = 'FRAME'; delete snapshot.variantReference; }
    }
    const out = run(snapshot);
    assert.equal(out.report.scenarioCoverage.complete, false, kind);
    assert.ok(out.report.scenarioCoverage.inconclusive > 0, kind);
  }
});

test('overlap is explicit: 7 layout + 5 visual paths; token detach groups to one finding without dropping IDs', () => {
  const paths = suffix => core.baselineFactsForRule(manual.rules.find(r => r.id.endsWith(suffix)));
  const baselinePaths = paths('layer-properties-use-effective-baseline');
  assert.equal(paths('auto-layout-1').filter(p => baselinePaths.includes(p)).length, 7);
  assert.equal(paths('visual-style-1').filter(p => baselinePaths.includes(p)).length, 5);
  const r = read(acceptance.reportResults.find(r => r.caseId === 'C01').file);
  const out = run(r.snapshot);
  const details = core.buildEvaluationDetails(out.report, runtime, r.anatomy).filter(d => d.classification === 'violation');
  assert.equal(details.length, 2);
  const groups = core.groupEvaluationDetails(details);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].evaluations.length, 2);
});

// Diagnostic reproductions, not acceptance tests for desired behaviour. Keeping
// these explicit prevents a green replay suite from being called full coverage.
test('KNOWN GAP: inactive padding/alignment with layout NONE still produce violations', () => {
  for (const [field, value] of [['padding', { top: 12, right: 0, bottom: 0, left: 0 }], ['primaryAxisAlignItems', 'CENTER']]) {
    const s = clone(baseline.snapshot), node = s.nodes.find(n => n.name === 'Fixer');
    assert.equal(node.layout.mode, 'NONE');
    assert.equal(node.baseline.effective.layout.mode, 'NONE');
    node.layout[field] = value;
    const found = violations(run(s)).filter(e => e.subjectNodeId === node.id);
    assert.ok(found.some(e => e.ruleId.includes('auto-layout-1')));
    if (field === 'padding') assert.ok(found.some(e => e.ruleId.includes('layer-properties-use-effective-baseline')));
  }
});

test('FIXED: real bundled capture distinguishes gradient stops and transform against independent reference', async () => {
  const findGradient = node => node.fills?.some(p => p.type === 'GRADIENT_ANGULAR') ? node
    : (node.children || []).map(findGradient).find(Boolean);
  const install = (root, offset) => {
    const n = findGradient(root); assert.ok(n);
    n.fills = n.fills.map(p => ({ ...p,
      gradientStops: [{ position: 0, color: { r: offset, g: 0, b: 0, a: 1 } }, { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } }],
      gradientTransform: [[1, 0, offset], [0, 1, 0]],
    }));
  };
  const make = async offset => capture(baseline, { mutateActual: root=>install(root,offset), mutateReference: root=>install(root,0) });
  const first = (await make(0)).output, second = (await make(1)).output;
  const paint = o => o.snapshot.nodes.find(n => n.appearance.fill.some(p => p.type === 'GRADIENT_ANGULAR')).appearance.fill;
  assert.notDeepEqual(paint(first), paint(second));
  assert.ok(paint(first)[0].gradientStops);
  assert.ok(paint(first)[0].gradientTransform);
  assert.equal(violations(run(second.snapshot)).length, 2);
  const fills = run(second.snapshot).engine.evaluations.filter(e => e.trace.factPaths.includes('appearance.fill'));
  assert.equal(fills.filter(e=>e.classification === 'violation').length, 2);
});
