const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), zlib = require('node:zlib');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Spinner');
const editor = path.resolve(repo, '../../projects/ComponentContractEditor');
const core = require(path.join(editor, 'dist/core.cjs'));
const { capture } = require(path.join(editor, 'tests/helpers/spinner-geometry'));
const read = name => JSON.parse(fs.readFileSync(path.join(root, name)));
const clone = value => JSON.parse(JSON.stringify(value));
const manual = read('contract.manual.json');
const previous = read('history/r7-editor-0.2.33/contract.manual.json');
const oldCompiled = read('history/r7-editor-0.2.33/compiled/component-contract.v2.json');
const evidence = core.extractVariantEvidence(read('evidence/contract.generated.json').contracts);
const compiled = core.compileManualSource(manual, evidence);
const runtime = core.prepareAuthoringPreviewContract(compiled.contract);
const acceptance = read('qa/layout-live-acceptance.2026-09-27.json');
const reports = acceptance.reportResults.map(item => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
  return JSON.parse(bytes);
});
const violations = out => out.engine.evaluations.filter(e => e.classification === 'violation');
function run(snapshot) {
  const engine = core.evaluateCompiledContract(snapshot, runtime);
  return { engine, report: core.buildEditorValidationReport(engine, compiled, manual, snapshot) };
}

test('final review pins Spinner artifacts and immutable pre-integration core/Button acceptance by hash', () => {
  const qa = read('qa/final-review.2026-09-27.json');
  const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  for (const [key, file] of Object.entries({ manual: 'contract.manual.json', compiled: 'compiled/component-contract.v2.json', generatedFacts: 'evidence/contract.generated.json', editorZip: 'editor/Spinner.editor-input.zip' })) {
    assert.equal(sha(path.join(root, file)), qa.sha256[key]);
  }
  assert.equal(crypto.createHash('sha256').update(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r8-editor-0.2.33/core.cjs.gz')))).digest('hex'), qa.sha256.compilerCore);
  assert.equal(sha(path.join(root, '../Button/history/r15-editor-0.2.33/contract.manual.json')), qa.sha256.buttonManual);
  assert.equal(core.stableHash(manual), qa.manualSourceHash);
  const prior = read('qa/layout-applicability.2026-09-27.json').sha256;
  assert.equal(sha(path.join(root, 'history/r7-editor-0.2.33/contract.manual.json')), prior.manual);
  assert.equal(sha(path.join(root, 'history/r7-editor-0.2.33/compiled/component-contract.v2.json')), prior.compiled);
});

test('r8 changes exactly two review statuses and revision/date; no parallel normative source', () => {
  const changed = ['component:core.web.spinner.root.auto-layout-1', 'component:web-core.spinner.layer-properties-use-effective-baseline'];
  const normalized = clone(manual);
  normalized.metadata = previous.metadata;
  for (const r of normalized.rules) {
    const old = previous.rules.find(p => p.id === r.id);
    assert.ok(old);
    assert.equal(r.status, changed.includes(r.id) ? 'reviewed' : old.status);
    r.status = old.status;
  }
  assert.deepEqual(normalized, previous);
  assert.deepEqual({ ...manual.metadata, revision: previous.metadata.revision, updatedAt: previous.metadata.updatedAt }, previous.metadata);
  assert.equal(manual.metadata.revision, 8);
  assert.equal(core.stableHash(previous), acceptance.manualSourceHash);
  assert.equal(manual.rules.filter(r => r.status === 'reviewed').length, 6);
});

test('compiled RuleIR logic and runtime policy stay identical; readiness is rule-authoring only', () => {
  const logic = rules => clone(rules.map(({ revision, source, authority, ...r }) => r));
  assert.deepEqual(logic(compiled.contract.rules), logic(oldCompiled.rules));
  assert.deepEqual(compiled.contract.runtimePolicy, oldCompiled.runtimePolicy);
  assert.equal(compiled.contract.rules.length, 31);
  assert.deepEqual(compiled.issues, []);
  assert.deepEqual(compiled.contract.nonExecutableRules, []);
  const ready = core.buildContractReadiness(compiled, manual);
  assert.equal(ready.status, 'ready');
  assert.deepEqual(ready.unreviewedRuleIds, []);
  assert.equal(ready.unimplementedRules, 0);
  // Reviewed predicates are not permission to claim code generation or production activation.
  assert.ok(manual.decisions.some(d => d.id === 'spinner.code-mapping-pending' && d.status === 'needs-confirmation'));
  assert.equal(read('runtime/component-contract.index.json').published, false);
  assert.equal(read('runtime/component-contract.index.json').status, 'draft');
});

test('all six archived r7 reports keep 1008 verdicts/traces/coverage under r8; IDs alone change', () => {
  const normalize = evaluations => evaluations.map(({ evaluationId, ruleRevision, ...e }) => e);
  let total = 0;
  for (const r of reports) {
    assert.deepEqual(core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract), r.results.engine);
    const out = run(r.snapshot);
    assert.deepEqual(normalize(out.engine.evaluations), normalize(r.results.engine.evaluations));
    assert.deepEqual(out.engine.coverage, r.results.engine.coverage);
    assert.deepEqual(out.report.scenarioCoverage, r.results.editor.scenarioCoverage);
    assert.equal(out.report.contractReadiness.status, 'ready');
    const details = clone(core.buildEvaluationDetails(out.report, runtime, r.anatomy));
    assert.deepEqual(details.map(({ id, ...d }) => d), r.results.details.map(({ id, ...d }) => d));
    total += out.engine.evaluations.length;
  }
  assert.equal(total, 1008);
});

test('every declared layout/style fact stays explicit, preserving all gates and both overlap rule IDs', () => {
  const auto = manual.rules.find(r => r.id.endsWith('auto-layout-1'));
  const base = manual.rules.find(r => r.id.endsWith('layer-properties-use-effective-baseline'));
  assert.equal(core.baselineFactsForRule(auto).length, 10);
  assert.equal(core.baselineFactsForRule(base).length, 13);
  assert.equal(core.baselineFactsForRule(auto).filter(f => core.baselineFactsForRule(base).includes(f)).length, 7);
  for (const f of ['layout.mode', 'layout.sizingHorizontal', 'layout.sizingVertical']) assert.equal(auto.propertyApplicability[f], undefined);
  for (const r of [auto, base]) assert.deepEqual(r.propertyApplicability, previous.rules.find(p => p.id === r.id).propertyApplicability);
  const out = run(reports[3].snapshot);
  const groups = core.groupEvaluationDetails(core.buildEvaluationDetails(out.report, runtime, reports[3].anatomy).filter(d => d.classification === 'violation'));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].evaluations.length, 2);
});

test('r8 bundled capture still detects independent gradient alpha/transform and solid token detach', async () => {
  // Controller simulations based on preserved L01, not replacement live G01–G04 reports.
  const find = (node, check) => check(node) ? node : (node.children || []).map(n => find(n, check)).find(Boolean);
  for (const kind of ['alpha', 'transform', 'token']) {
    const { output } = await capture(reports[0], { mutateActual(root) {
      if (kind === 'token') {
        const n = find(root, n => n.name === 'Ellipse 1');
        assert.ok(n.fills[0].boundVariables?.color);
        delete n.fills[0].boundVariables;
      } else {
        const n = find(root, n => n.fills?.some(p => p.type === 'GRADIENT_ANGULAR'));
        assert.ok(n);
        if (kind === 'alpha') n.fills[0].gradientStops[0].color.a = 0.33;
        else n.fills[0].gradientTransform[0][2] += 0.18;
      }
    } });
    const out = run(output.snapshot);
    assert.equal(out.report.scenarioCoverage.complete, true, kind);
    assert.equal(violations(out).length, 2, kind);
    assert.ok(violations(out).every(e => e.trace.factPaths.includes('appearance.fill')));
  }
});

test('reviewed does not turn missing gradient/activity/baseline evidence into a complete check', () => {
  for (const mutate of [
    s => delete s.nodes.find(n => n.appearance.fill.some(p => p.type === 'GRADIENT_ANGULAR')).appearance.fill[0].gradientTransform,
    s => delete s.nodes.find(n => n.appearance.fill.some(p => p.type === 'GRADIENT_ANGULAR')).baseline.effective.appearance.fill[0].gradientStops,
    s => delete s.nodes.find(n => n.name === 'Fixer').propertyActivityV1.paddingApplicable,
    s => delete s.nodes[0].baseline,
    s => delete s.variantReference,
  ]) {
    const snapshot = clone(reports[0].snapshot); mutate(snapshot);
    const out = run(snapshot);
    assert.equal(out.report.contractReadiness.status, 'ready');
    assert.equal(out.report.scenarioCoverage.complete, false);
    assert.ok(out.report.scenarioCoverage.inconclusive > 0);
  }
});

test('compiled, projections and ZIP derive from the same r8 manual without hand-edited rules', async () => {
  assert.deepEqual(read('projections/athena/manual-overlay.json').rules, manual.rules);
  assert.equal(read('reports/readiness.json').status, 'ready');
  const entries = await core.readZip(fs.readFileSync(path.join(root, 'editor/Spinner.editor-input.zip')));
  const imported = core.importWorkspace(entries.map(e => ({ name: e.name, text: core.zipEntryText(e) })));
  assert.deepEqual(imported.manual, manual);
  assert.equal(imported.variants.length, 12);
  const fresh=clone(core.buildExportBundle(imported.manual, imported.variantEvidence).compiled),accepted=read('compiled/component-contract.v2.json');
  assert.equal(accepted.package.sourceExportVersion,'component-contract-editor@0.2.33');
  // Only provenance advances; accepted child and its normative fields remain unchanged.
  assert.equal(fresh.package.sourceExportVersion,'component-contract-editor@0.2.37');
  fresh.package.sourceExportVersion=accepted.package.sourceExportVersion;
  assert.deepEqual(fresh,accepted);
});
