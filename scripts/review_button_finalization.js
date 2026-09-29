// Read-only readiness review. --record writes QA evidence only, never the contract.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const core = require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
const load = p => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, p))));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const prior = read('history/r30-editor-0.2.52/contract.manual.json');
const priorCompiled = load('history/r30-editor-0.2.52/component-contract.v2.json.gz');
const evidence = {
  'component:core.web.button.root.auto-layout-1': ['instance-identity-live-review.2026-09-28.json', 'button-root-sizing.test.js'],
  'component:core.web.button.root.visual-style-1': ['control-blur-r30-live-review.2026-09-29.json', 'button-ownership-live-review.test.js'],
  'component:web-core.button.addon-size-follows-button-size': ['ownership-scope-live-review.2026-09-27.json', 'button-spinner-integration.test.js'],
  'component:web-core.button.addon-type-is-component-property': ['spinner-integration-live-review.2026-09-27.json', 'button-spinner-integration.test.js'],
  'component:web-core.button.addon-uses-glyph-26': ['ownership-scope-live-review.2026-09-27.json', 'button-spinner-integration.test.js'],
  'component:web-core.button.backdrop-blur-maps-to-control-blur': ['control-blur-r30-live-review.2026-09-29.json', 'button-final-blockers.test.js'],
  'component:web-core.button.block-maps-to-fill': ['block-live-review.2026-09-28.json', 'button-validation-mode.test.js'],
  'component:web-core.button.hint-requires-large-size': ['effective-hint-visibility-live-review.2026-09-28.json', 'button-effective-visibility.test.js'],
  'component:web-core.button.label-and-hint-color-locked': ['ownership-scope-live-review.2026-09-27.json', 'button-text-layout.test.js'],
  'component:web-core.button.label-content-is-editable': ['text-layout-live-review.2026-09-29.json', 'button-text-layout.test.js'],
  'component:web-core.button.label-text-style-locked': ['text-layout-live-review.2026-09-29.json', 'button-text-layout.test.js'],
  'component:web-core.button.loading-preserves-width': ['width-transition-live-review.2026-09-28.json', 'button-width-transition.test.js'],
  'component:web-core.button.loading-spinner-style-follows-view': ['spinner-matrix-r30-owner-acceptance.2026-09-29.json', 'button-final-blockers.test.js'],
  'component:web-core.button.loading-uses-addon-spinner': ['loading-composition-live-review.2026-09-28.json', 'button-loading-composition.test.js'],
  'component:web-core.button.manual-fill-is-layer-property': ['ownership-scope-live-review.2026-09-27.json', 'button-usage-transfer.test.js'],
  'component:web-core.button.manual-layout-and-appearance-overrides-prohibited': ['ownership-scope-live-review.2026-09-27.json', 'button-text-layout.test.js'],
  'component:web-core.button.internal-sizing-locked': ['loading-r28-editor-0.2.49-live-review.2026-09-29.json', 'button-configuration-exception.test.js'],
  'component:web-core.button.nowrap-maps-to-figma-layout': ['nowrap-r29-owner-acceptance.2026-09-29.json', 'button-nowrap.test.js'],
  'component:web-core.button.single-icon-content-shape': ['single-icon-r28-editor-0.2.49-live-review.2026-09-29.json', 'button-loading-composition.test.js'],
  'component:web-core.button.text-resizing-maps-to-figma-layout': ['text-layout-live-review.2026-09-29.json', 'button-text-layout.test.js'],
  'component:web-core.button.variant-state-is-component-property': ['usage-transfer-live-review.2026-09-28.json', 'button-usage-transfer.test.js'],
  'component:web-core.button.view-text-requires-rectangular-shape': ['usage-transfer-live-review.2026-09-28.json', 'button-usage-transfer.test.js'],
};
function candidate() {
  const m = structuredClone(prior);
  m.metadata.revision = 31;
  m.metadata.updatedAt = '2026-09-29T12:00:00.000Z';
  // This obsolete authoring placeholder is not a dependency binding or a rule target.
  assert.equal(JSON.stringify({ ...m, targets: [] }).includes('target.spinner'), false);
  m.targets = m.targets.filter(t => t.id !== 'target.spinner');
  for (const r of m.rules) {
    assert(evidence[r.id], `Missing review evidence: ${r.id}`);
    r.status = 'reviewed';
    if (r.id.endsWith('addon-size-follows-button-size')) r.rationale = r.rationale.replace('Live-приёмка вложения ожидается.', 'Вложение принято по live-проверкам; неизменяемые отчёты сохранены в QA.');
    if (r.id.endsWith('text-resizing-maps-to-figma-layout')) r.rationale = r.rationale.replace('отдельная ещё не реализованная проверка.', 'отдельная проверка nowrap-maps-to-figma-layout.');
    assert.deepEqual(core.validateRuleEdit(m, r, r.id), []);
  }
  const d = m.decisions.find(d => d.id === 'decision.button.spinner-palette-scope');
  d.rationale = d.rationale.replace('прежний gap закрыт нормативно, требуется live-приёмка.', 'матрица принята владельцем, отдельный повтор live-кейсов не требуется. Приёмка и границы свидетельств сохранены в QA.');
  return m;
}
function compiled(m) { return JSON.parse(JSON.stringify(core.compileManualSource(m, priorCompiled.facts.variantEvidence, [priorCompiled.componentDependencies[0].contract]))); }
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
function comparableRule(r) { const v = structuredClone(r); delete v.revision; delete v.source.checksum; delete v.authority.status; return v; }
function comparableEvaluation({ evaluationId, ruleRevision, ...e }) { return e; }
function review() {
  const m = candidate(), c = compiled(m);
  assert.deepEqual(c.issues, []);
  assert.deepEqual(c.contract.rules.map(comparableRule), priorCompiled.rules.map(comparableRule));
  assert.deepEqual(c.contract.componentDependencies, priorCompiled.componentDependencies);
  assert.equal(c.contract.package.generatedFactsHash, priorCompiled.package.generatedFactsHash);
  assert.deepEqual(c.contract.runtimePolicy, priorCompiled.runtimePolicy);
  assert.deepEqual(c.contract.coverage, priorCompiled.coverage);
  assert.equal(c.contract.status, 'ready');
  const ready = core.buildContractReadiness(c, m);
  assert.equal(ready.status, 'ready');
  assert.equal(ready.ownership.usage.status, 'not-included');
  const a = core.prepareAuthoringPreviewContract(priorCompiled);
  const rows = [], sourceEvidence = new Map(m.rules.map(r => [r.id, []]));
  for (const file of files(path.join(root, 'qa/fixtures')).filter(f => f.endsWith('.json.gz')).sort()) {
    const bytes = zlib.gunzipSync(fs.readFileSync(file)), r = JSON.parse(bytes);
    if (!r.sources?.manual || !r.snapshot) continue;
    const left = structuredClone(r.snapshot), right = structuredClone(r.snapshot);
    // This is an explicit offline re-evaluation, not permission to reuse stale UI inputs.
    for (const [s, contract] of [[left, a], [right, c.contract]]) if (s.validationIntent) s.validationIntent = core.createValidationIntent(s, contract, s.validationIntent.values);
    const oldRun = core.evaluateCompiledContract(left, a), newRun = core.evaluateCompiledContract(right, c.contract);
    assert.equal(core.stableHash(oldRun.evaluations.map(comparableEvaluation)), core.stableHash(newRun.evaluations.map(comparableEvaluation)), `Behavior changed: ${file}`);
    assert.deepEqual(newRun.dependencyRuns, oldRun.dependencyRuns);
    rows.push({ file: path.relative(root, file), sha256: hash(bytes), evaluations: newRun.evaluations.length, behaviorParity: true });
    for (const e of newRun.evaluations) {
      const id = c.contract.rules.find(rule => rule.ruleId === e.ruleId)?.source.anchor;
      if (id) sourceEvidence.get(id).push(e.classification);
    }
  }
  const rules = m.rules.map(rule => {
    const [qa, test] = evidence[rule.id], q = read('qa/' + qa);
    assert(fs.existsSync(path.join(__dirname, 'tests', test)));
    const count = sourceEvidence.get(rule.id).reduce((a, k) => ({ ...a, [k]: (a[k] || 0) + 1 }), {});
    return { ruleId: rule.id, previousStatus: prior.rules.find(r => r.id === rule.id).status, reviewedStatus: rule.status,
      permission: rule.permission, route: c.contract.customizationPolicy.find(r => r.id === rule.id).execution.route,
      evidence: `qa/${qa}`, evidenceStatus: q.status || q.decision, regression: `scripts/tests/${test}`,
      reevaluationClassifications: count, interpretation: rule.execution?.route === 'policy-only' ? 'Permission, not a skipped predicate.' :
        qa.includes('owner-acceptance') ? 'Owner acceptance and offline regression; no new per-case live acceptance claimed.' : 'Accepted live evidence plus regression. Historical limitations remain in original QA; later fixes are checked separately.' };
  });
  return { schemaVersion: 'apollo.button-final-readiness-review.v1', date: '2026-09-29', componentId: m.component.componentId,
    status: 'candidate-verified-not-published', sourceRevision: 30, targetRevision: 31,
    editorVersion: '0.2.52', previousManualHash: core.stableHash(prior), candidateManualHash: core.stableHash(m), candidateCompiledHash: core.stableHash(c.contract),
    ruleIRUnchangedExceptRevisionChecksumAuthority: true, rules, removedTarget: { id: 'target.spinner', externalReferences: 0, replacement: 'Existing componentDependencies.spinner bindings left/right, pinned r8; no child rule or dependency removed.' },
    compilerIssues: c.issues, readiness: ready, coverage: c.contract.coverage,
    generatedFactsHash: c.contract.package.generatedFactsHash, dependencyHash: c.contract.componentDependencies[0].compiledHash,
    historicalSnapshots: rows.length, comparedEvaluations: rows.reduce((n, r) => n + r.evaluations, 0), snapshotComparisons: rows,
    limitations: ['Ready is component-scoped Figma validation, not frontend readiness or production publication.',
      'A ready contract can still produce an incomplete scenario without required facts, expectation inputs, or a before snapshot.',
      'Old snapshots lack some newer facts; parity retains unknown results rather than inventing evidence.',
      'Product/channel/editorial pattern rules remain with their separate owner and are not connected.',
      'Production ds-ai-hub prose drift and duplicate ControlBlur UI cards remain explicit follow-ups.',
      'Spinner matrix and nowrap owner acceptance are not represented as newly executed live test suites.'],
    regressionCommands: ['npm run validate (ComponentContractEditor)', 'node --test scripts/tests/button-*.test.js', 'node scripts/review_button_control_blur_reports.js'],
  };
}
if (require.main === module) {
  const result = review();
  if (read('contract.manual.json').metadata.revision === 31) {
    assert.equal(core.stableHash(read('contract.manual.json')), result.candidateManualHash);
    assert.equal(core.stableHash(read('compiled/component-contract.v2.json')), result.candidateCompiledHash);
    assert.equal(read('runtime/component-contract.index.json').published, false);
    result.status = 'ready-figma-component-unpublished';
    result.artifacts = Object.fromEntries(['contract.manual.json', 'compiled/component-contract.v2.json', 'editor/Button.editor-input.zip'].map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
  }
  if (process.argv.includes('--record')) fs.writeFileSync(path.join(root, 'qa/final-readiness-r31.2026-09-29.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...result, rules: result.rules.map(r => ({ ruleId: r.ruleId, previousStatus: r.previousStatus, evidence: r.evidence })), snapshotComparisons: undefined }, null, 2));
}
module.exports = { candidate, compiled, review, prior, priorCompiled, evidence };
