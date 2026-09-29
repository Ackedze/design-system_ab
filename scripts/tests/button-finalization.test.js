const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const core = require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const { candidate, compiled, prior, priorCompiled, evidence } = require('../review_button_finalization');
const root = path.resolve(__dirname, '../../experiments/web-core/core/Button');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const m = read('contract.manual.json'), c = read('compiled/component-contract.v2.json');
test('r31 finalizes only individually evidenced rules; no new component or usage norm', () => {
  assert.deepEqual(m, candidate());
  assert.equal(m.rules.length, 22);
  assert.equal(prior.rules.filter(r => r.status === 'draft').length, 16);
  assert.ok(m.rules.every(r => r.status === 'reviewed' && evidence[r.id] && r.ownership.kind === 'component'));
  assert.deepEqual(m.rules.map(r => r.id).sort(), Object.keys(evidence).sort());
  for (const r of m.rules) assert.deepEqual(core.validateRuleEdit(m, r, r.id), []);
  assert.deepEqual(m.rules.map(r => ({ ...r, status: null, rationale: null })), prior.rules.map(r => ({ ...r, status: null, rationale: null })));
});
test('obsolete Spinner target has no references; bindings, generated facts and child pin remain exact', () => {
  assert.equal(JSON.stringify({ ...prior, targets: [] }).includes('target.spinner'), false);
  assert.deepEqual(m.targets, prior.targets.filter(t => t.id !== 'target.spinner'));
  assert.deepEqual(m.componentDependencies, prior.componentDependencies);
  assert.deepEqual(c.componentDependencies, priorCompiled.componentDependencies);
  assert.equal(c.package.generatedFactsHash, priorCompiled.package.generatedFactsHash);
  assert.deepEqual(c.facts.variantEvidence, priorCompiled.facts.variantEvidence);
});
test('shared compiler produces Ready with no exclusions, warning, unresolved or unreviewed rule', () => {
  const built = compiled(m);
  assert.deepEqual(built.contract, c);
  assert.deepEqual(built.issues, []);
  const r = core.buildContractReadiness(built, m);
  assert.equal(r.status, 'ready');
  for (const key of ['unimplementedRules', 'contextOnlyRules', 'delegatedRules', 'compilerExcludedRules', 'validationErrors']) assert.equal(r[key], 0);
  assert.deepEqual(r.unreviewedRuleIds, []); assert.deepEqual(r.unresolvedTargetIds, []);
  assert.deepEqual(c.coverage.byExecutionRoute, { 'policy-only': 3, predicate: 19 });
  assert.equal(c.rules.length, 60); assert.equal(r.ownership.usage.status, 'not-included');
  assert.equal(read('runtime/component-contract.index.json').published, false);
  assert.ok(m.representations.filter(r => r.kind === 'code').every(r => r.status === 'draft'));
});
test('final Editor input ZIP roundtrips exactly and all projections come from the reviewed manual', async () => {
  const zip = await core.readZip(new Uint8Array(fs.readFileSync(path.join(root, 'editor/Button.editor-input.zip'))));
  const w = core.importWorkspace(zip.map(e => ({ name: e.name, text: core.zipEntryText(e) })));
  assert.deepEqual(w.manual, m);
  const built = core.buildExportBundle(w.manual, w.variantEvidence, w.dependencyContracts);
  assert.equal(core.stableHash(built.compiled), core.stableHash(c)); assert.deepEqual(built.validation.issues, []);
  assert.deepEqual(read('projections/athena/manual-overlay.json').rules, m.rules);
  assert.deepEqual(read('projections/ds-ai-hub/component.json').semanticApi, m.semanticApi);
  assert.deepEqual(read('reports/rule-crosswalk.json').missingAthenaRuleIds, []);
});
test('Ready never converts missing captured facts into compliant or a complete scenario', () => {
  const review = read('qa/control-blur-r30-live-review.2026-09-29.json');
  const r = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, review.reportResults[0].fixtureFile))));
  const snapshot = structuredClone(r.snapshot), node = snapshot.nodes.find(n => snapshot.selection.includes(n.id));
  node.unknownFacts.push('appearance.effectDetailsV1'); delete node.appearance.effectDetailsV1;
  const e = core.evaluateCompiledContract(snapshot, c);
  assert.equal(e.evaluations.find(e => e.ruleId === 'component:web-core.button.backdrop-blur-maps-to-control-blur.1.1').classification, 'human-review');
  const report = core.buildEditorValidationReport(e, { contract: c, issues: [] }, m, snapshot);
  assert.equal(report.contractReadiness.status, 'ready'); assert.equal(report.scenarioCoverage.complete, false);
});
test('r31 manual and compiled JSON satisfy public schemas', async () => {
  const { validateJsonSchema } = await import('../../../../ds-ai-hub/tools/lib/json-schema-lite.mjs');
  const schema = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../experiments/schemas/apollo-component-contract-${name}.schema.json`)));
  const ms = schema('manual-v2'), cs = schema('v2.1');
  cs.properties.customizationPolicy.items.properties.ownership = ms.$defs.ruleOwnership;
  cs.$defs = { ...cs.$defs, self: structuredClone(cs), nonEmptyString: ms.$defs.nonEmptyString };
  const bundled = JSON.parse(JSON.stringify(cs).replaceAll('"$ref":"#"', '"$ref":"#/$defs/self"'));
  assert.deepEqual(validateJsonSchema(m, ms), []); assert.deepEqual(validateJsonSchema(c, bundled), []);
});
