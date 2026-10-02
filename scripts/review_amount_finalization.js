// Amount release evidence. Default is read-only; --archive preserves originals,
// --record regenerates QA only. The manual source is never written by this script.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '..');
const root = path.join(repo, 'experiments/web-core/core/Amount/authoring');
const history = path.resolve(root, '../history/r4-editor-0.2.57');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(file));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const prefix = 'component:web-core.amount.';
const liveCases = [
  ['14-11-44-937', ['major-text-style-binding-required.1.1', 'currency-colors-use-tokens.1.1']],
  ['14-12-17-533', ['major-text-style-binding-required.1.1', 'minor-colors-use-tokens.1.1', 'currency-colors-use-tokens.1.1']],
  ['14-16-55-444', []],
  ['14-20-37-219', []],
  ['14-22-30-475', ['major-text-style-binding-required.1.1']],
  ['14-24-10-650', ['major-text-style-binding-required.1.1']],
];
const fixtureName = time => `amount.validation-report.2026-09-29T${time}Z.json`;
const fixtureFile = time => `reports/fixtures/r4-editor-0.2.57/${fixtureName(time)}.gz`;
function immutable(file, bytes) {
  if (fs.existsSync(file)) assert(fs.readFileSync(file).equals(bytes), `History conflict: ${file}`);
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes, { flag: 'wx' }); }
}
function archive() {
  for (const file of ['contract.manual.json', 'compiled/component-contract.v2.json', 'editor/Amount.editor-input.zip',
    'README.md', 'BACKLOG.md', 'TESTCASES.md', 'reports/readiness.json', 'runtime/component-contract.index.json']) {
    const target = path.join(history, file);
    if (!fs.existsSync(target)) {
      assert.equal(read(path.join(root, 'contract.manual.json')).metadata.revision, 4);
      immutable(target, fs.readFileSync(path.join(root, file)));
    }
  }
  for (const [time] of liveCases) {
    const target = path.join(root, fixtureFile(time)), source = path.join(root, 'editor', fixtureName(time));
    if (fs.existsSync(target)) {
      if (fs.existsSync(source)) assert(zlib.gunzipSync(fs.readFileSync(target)).equals(fs.readFileSync(source)));
    } else immutable(target, zlib.gzipSync(fs.readFileSync(source), { level: 9 }));
  }
}
function candidate() {
  const m = read(path.join(history, 'contract.manual.json'));
  assert.equal(m.metadata.revision, 4);
  m.metadata.revision = 5;
  m.metadata.updatedAt = '2026-09-29';
  for (const rule of m.rules) {
    rule.status = 'reviewed';
    assert.deepEqual(core.validateRuleEdit(m, rule, rule.id), []);
  }
  return m;
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function semanticRule(rule) {
  const r = structuredClone(rule);
  delete r.revision; delete r.source.checksum; delete r.authority.status;
  return r;
}
function comparableEvaluation({ evaluationId, ruleRevision, ...evaluation }) { return evaluation; }
function review() {
  const prior = read(path.join(history, 'compiled/component-contract.v2.json'));
  const manual = candidate(), compiled = JSON.parse(JSON.stringify(core.compileManualSource(manual, prior.facts.variantEvidence)));
  assert.deepEqual(compiled.issues, []);
  assert.deepEqual(compiled.contract.rules.map(semanticRule), prior.rules.map(semanticRule));
  assert.deepEqual(compiled.contract.runtimePolicy, prior.runtimePolicy);
  assert.deepEqual(compiled.contract.coverage, prior.coverage);
  assert.deepEqual(compiled.contract.facts, prior.facts);
  const readiness = core.buildContractReadiness(compiled, manual);
  assert.equal(readiness.status, 'ready');
  assert.equal(readiness.unimplementedRules, 0);
  const reportResults = [];
  for (const [time, expected] of liveCases) {
    const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, fixtureFile(time)))), r = JSON.parse(bytes);
    assert.equal(core.stableHash(r.sources.manual), prior.package.manualSourceHash);
    assert.equal(core.stableHash(r.sources.compiledContract), core.stableHash(prior));
    assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
    assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
    const before = JSON.stringify(r.snapshot), engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
    const editor = core.buildEditorValidationReport(engine, { contract: prior, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
    assert.equal(core.stableHash(engine), core.stableHash(r.results.engine));
    assert.equal(core.stableHash(editor), core.stableHash(r.results.editor));
    assert.equal(core.stableHash(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy)), core.stableHash(r.results.details));
    assert.equal(JSON.stringify(r.snapshot), before);
    assert.deepEqual(engine.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort(), expected.map(id => prefix + id).sort());
    assert.equal(editor.scenarioCoverage.complete, true);
    const major = r.snapshot.nodes.find(n => n.type === 'TEXT' && n.name === 'Major');
    if (time === '14-24-10-650') assert.equal(Object.values(major.textStyleBindingsV1)[0].state, 'outside-catalog');
    if (time === '14-22-30-475') assert.equal(Object.values(major.textStyleBindingsV1)[0].state, 'detached');
    reportResults.push({ file: 'editor/' + fixtureName(time), fixtureFile: fixtureFile(time), sha256: sha(bytes),
      rootNodeId: r.snapshot.source.rootNodeId, complete: true, exactEngineEditorDetailsReplay: true,
      violations: expected.map(id => prefix + id), evaluations: engine.evaluations.length,
      matchedNodes: r.run.capture.matchedBaselineNodes, warnings: r.run.capture.warnings });
  }
  const previous = core.prepareAuthoringPreviewContract(prior), snapshotComparisons = [];
  const counts = new Map(manual.rules.map(r => [r.id, {}]));
  for (const file of files(path.join(root, 'reports/fixtures')).filter(f => f.endsWith('.json.gz')).sort()) {
    const bytes = zlib.gunzipSync(fs.readFileSync(file)), r = JSON.parse(bytes), raw = JSON.stringify(r.snapshot);
    const oldRun = core.evaluateCompiledContract(r.snapshot, previous), newRun = core.evaluateCompiledContract(r.snapshot, compiled.contract);
    assert.deepEqual(newRun.evaluations.map(comparableEvaluation), oldRun.evaluations.map(comparableEvaluation), file);
    assert.deepEqual(newRun.coverage, oldRun.coverage);
    assert.equal(JSON.stringify(r.snapshot), raw);
    for (const e of newRun.evaluations) {
      const id = compiled.contract.rules.find(rule => rule.ruleId === e.ruleId)?.source.anchor;
      if (counts.has(id)) counts.get(id)[e.classification] = (counts.get(id)[e.classification] || 0) + 1;
    }
    snapshotComparisons.push({ file: path.relative(root, file), sha256: sha(bytes), evaluations: newRun.evaluations.length, behaviorParity: true });
  }
  const current = read(path.join(root, 'contract.manual.json'));
  if (current.metadata.revision === 5) {
    assert.deepEqual(current, manual);
    assert.equal(core.stableHash(read(path.join(root, 'compiled/component-contract.v2.json'))), core.stableHash(compiled.contract));
  }
  return {
    schemaVersion: 'apollo.component-contract.acceptance.v1', componentId: manual.component.componentId,
    date: '2026-09-29', status: 'accepted', scope: 'figma-component', published: false,
    manualRevision: 5, manualSourceHash: core.stableHash(manual), compiledHash: core.stableHash(compiled.contract),
    priorRevision: 4, priorManualSourceHash: prior.package.manualSourceHash,
    generatedFactsHash: compiled.contract.package.generatedFactsHash,
    sourceBundleHash: manual.source.sourceHash, editorVersion: '0.2.57',
    ownerAcceptance: { source: 'user-message', quote: 'отлично, закрываем контракт', date: '2026-09-29' },
    liveAcceptance: 'accepted-with-offline-boundaries', reportResults,
    ruleIRUnchangedExceptRevisionChecksumAuthority: true, readiness, coverage: compiled.contract.coverage,
    rules: manual.rules.map(r => ({ ruleId: r.id, status: r.status, route: r.execution.route,
      reevaluationClassifications: counts.get(r.id),
      automatedEvidence: ['scripts/tests/amount-contract.test.js', 'ComponentContractEditor/tests/amount-owner-boundaries.test.js',
        'ComponentContractEditor/tests/text-style-bindings.test.js'],
      historicalEvidence: ['reports/live-review-r3.2026-09-29.json', 'reports/owner-boundaries-r3.2026-09-29.json'] })),
    historicalSnapshots: snapshotComparisons.length,
    comparedEvaluations: snapshotComparisons.reduce((n, r) => n + r.evaluations, 0), snapshotComparisons,
    offlineOnlyBoundaries: ['Major color detach; Minor Text Style detach; Currency Text Style detach after r4 (old raw capture replay plus automatic tests)',
      'Custom empty/RUB; correct USD with bound Text Style; renamed/recolored placeholder; local renamed native swap',
      'FRAME/foreign root identity rejection: automated gate, not a new live screenshot',
      'Mixed-range/partial-detach snapshot defense: synthetic runtime test, NOT a confirmed manual Figma action or acceptance blocker'],
    limitations: ['Ready applies to the declared Figma component scope, not frontend/code mapping or production publication.',
      'Live report completeness is scenario-scoped. Missing/ambiguous identity still gives incomplete, never a full pass.',
      'A17 destructive internal swaps remain fail-closed; localized diagnostics are a P1 follow-up.',
      'Product/channel/editorial policies remain in the separate pattern handoff. AmountStyles uniformity is not an Amount rule.',
      'External Addon descendants are not validated by Amount. Their contracts are separate.',
      'Hub drift remains open; no Hub normative documents or production routes were silently changed.',
      'r2/r3 snapshots are re-evaluated offline, not represented as new r5 Figma captures.'],
  };
}
if (require.main === module) {
  if (process.argv.includes('--archive')) archive();
  const result = review();
  if (process.argv.includes('--record')) fs.writeFileSync(path.join(root, 'reports/acceptance.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...result, rules: result.rules.map(r => ({ ruleId: r.ruleId, status: r.status })), snapshotComparisons: undefined }, null, 2));
}
module.exports = { archive, candidate, review, semanticRule, comparableEvaluation };
