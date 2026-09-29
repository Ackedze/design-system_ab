const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto');
const core = require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root = path.resolve(__dirname, '../../experiments/web-core/core/Button');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'qa/instance-identity-live-review.2026-09-28.json')));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const read = item => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile))));

for (const item of manifest.reportResults) test(`live renamed Addon ${path.basename(item.file)}: exact replay and pinned Spinner`, () => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  assert.equal(sha(bytes), item.sha256);
  const r = JSON.parse(bytes), s = r.snapshot;
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.44');
  assert.equal(r.run.manualRevision, 23);
  assert.equal(s.source.instanceIdentityVersion, 1);
  assert.equal(s.source.rootNodeId, item.rootNodeId);
  assert.equal(core.stableHash(r.sources.manual), manifest.manualSourceHash);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(s), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.equal(s.nodes[0].layout.sizingHorizontal, item.widthMode);
  assert.equal(s.nodes[0].layout.sizingVertical, 'HUG');
  assert.equal(s.nodes[0].bounds.width, item.width);
  const addon = s.nodes.find(n => n.id === item.renamedNode.id);
  assert.equal(addon.name, '🔩 Addon');
  assert.equal(addon.baselineProvenance.referencePath, 'LeftAddon / LeftAddon');
  assert.equal(addon.baselineProvenance.kind, 'independent-host-variant');
  assert.equal(r.run.capture.matchedBaselineNodes, 18);
  assert.equal(s.nodes.length, 18);
  assert.ok(s.nodes.every(n => n.baselineProvenance.status === 'matched'));
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  const engine = core.evaluateCompiledContract(s, r.runtime.evaluatedContract);
  assert.equal(engine.snapshotHash, r.run.engineSnapshotHash);
  assert.deepEqual(clone(engine), r.results.engine);
  const editor = core.buildEditorValidationReport(engine,
    { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, s);
  assert.deepEqual(clone(editor), r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy)), r.results.details);
  assert.equal(engine.evaluations.length, 351);
  assert.equal(engine.evaluations.filter(e => e.dependency).length, 168);
  assert.equal(engine.evaluations.filter(e => e.classification === 'violation').length, 0);
  const active = engine.dependencyRuns.filter(d => d.status === 'executed');
  assert.equal(active.length, 1);
  assert.equal(active[0].componentId, 'core.web.spinner');
  assert.equal(active[0].revision, 8);
  assert.equal(active[0].compiledHash, '909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221');
  assert.equal(editor.scenarioCoverage.inconclusive, 0);
  assert.equal(editor.scenarioCoverage.notExecuted, 7);
  assert.equal(editor.scenarioCoverage.complete, false);
  assert.equal(r.summary.contractReadiness.status, 'draft');
  const width = editor.evaluations.find(e => e.ruleId === 'component:web-core.button.loading-preserves-width');
  assert.equal(width.classification, 'not-executed');
  assert.equal(width.trace.reason, 'Сначала запомните состояние до перехода у этого же instance.');
});

test('live evidence covers all three widths, without promoting the whole contract or inventing Spinner renaming', () => {
  assert.equal(manifest.status, 'accepted-renamed-addon-hug-fill-fixed');
  assert.deepEqual(manifest.reportResults.map(i => i.widthMode), ['HUG', 'HUG', 'FILL', 'FIXED']);
  assert.deepEqual(manifest.pending, []);
  assert.equal(manifest.reportResults.reduce((n, i) => n + i.engineEvaluations, 0), 1404);
  assert.equal(manifest.reportResults.reduce((n, i) => n + i.childEvaluations, 0), 672);
  assert.equal(manifest.reportResults.reduce((n, i) => n + i.matchedNodes, 0), 72);
  for (const item of manifest.reportResults) {
    const r = read(item);
    assert.equal(r.snapshot.nodes.find(n => n.id === 'preview:3').name, 'Spinner');
    assert.equal(r.summary.contractReadiness.unimplementedRules, 8);
  }
});

test('all acceptance captures pin the same immutable manual/compiled sources and package hashes are recorded', () => {
  const first = read(manifest.reportResults[0]);
  for (const item of manifest.reportResults) {
    const r = read(item);
    assert.deepEqual(r.sources.manual, first.sources.manual);
    assert.deepEqual(r.sources.compiledContract, first.sources.compiledContract);
    assert.equal(r.sources.manual.rules.length, 27);
    assert.equal(r.sources.compiledContract.rules.length, 54);
  }
  const previous = JSON.parse(fs.readFileSync(path.join(root, 'qa/sizing-probes-live-review.2026-09-28.json')));
  assert.deepEqual(manifest.normativeArtifactsUnchanged, previous.normativeArtifactsUnchanged);
});
