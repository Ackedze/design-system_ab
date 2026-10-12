const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const out = __dirname, packages = path.resolve(out, '../../..'), workspace = path.resolve(packages, '../../../..');
const corePath = path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs');
const core = require(corePath), read = p => JSON.parse(fs.readFileSync(p)), clone = x => JSON.parse(JSON.stringify(x));
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pin = p => ({ path: path.relative(packages, p), sha256: sha(p), bytes: fs.statSync(p).size });
const manual = read(path.join(packages, 'Link/authoring/contract.manual.json'));
const compiled = read(path.join(packages, 'Link/authoring/compiled/component-contract.v2.json'));
const preview = core.prepareAuthoringPreviewContract(compiled);
const matrix = read(path.join(packages, 'Link/authoring/case-matrix.json'));
assert.equal(manual.metadata.revision, 2);
const specs = [
  ['09-05-05-298', 'LINK-01', 0], ['09-05-15-066', 'LINK-02', 0], ['09-05-23-762', 'LINK-04', 0],
  ['09-05-30-652', 'LINK-05', 31], ['09-05-38-393', 'LINK-06', 31],
];
const counts = result => result.evaluations.reduce((r, e) => (r[e.classification] = (r[e.classification] || 0) + 1, r), {});
const signatures = result => result.evaluations.map(e => JSON.stringify([e.ruleId, e.subjectNodeId, e.classification, e.trace])).sort();
const portable = reference => {
  const result = clone(reference);
  for (const p of Object.values(result.nodeProperties)) {
    if (p.identity) delete p.identity.mainComponentId;
    if (p.sourceIdentity) delete p.sourceIdentity.ownerMainComponentId;
  }
  return result;
};
const native = read(path.join(packages, 'Link/authoring/sources/native/Link.M.native-facts.2026-10-10.json')).reference;
native.nodes.sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
const nativePin = manual.targets[0].identityBindingsV1.find(b => b.componentKey === native.componentKey).portableReferenceHash;
assert.equal(core.portableDeclaredTargetReferenceHash(native), nativePin);
const rows = [];
for (const [time, caseId, inconclusive] of specs) {
  const file = `link.validation-report.2026-10-10T${time}Z.json`, original = path.join(packages, 'Link', file);
  const retained = path.join(out, 'inputs', file);
  fs.mkdirSync(path.dirname(retained), { recursive: true });
  if (!fs.existsSync(retained)) fs.copyFileSync(original, retained, fs.constants.COPYFILE_EXCL);
  if (fs.existsSync(original)) assert.equal(sha(original), sha(retained));
  const d = read(retained), s = d.snapshot, spec = matrix.cases.find(c => c.caseId === caseId), root = s.nodes[0];
  assert.equal(d.editorVersion, 'component-contract-editor@0.2.98');
  assert.equal(d.run.manualSourceHash, core.stableHash(manual));
  assert.equal(core.stableHash(d.sources.manual), core.stableHash(manual));
  assert.equal(core.stableHash(d.sources.compiledContract), core.stableHash(compiled));
  assert.equal(core.stableHash(d.runtime.evaluatedContract), core.stableHash(preview));
  assert.equal(s.source.rootNodeId, spec.instanceId);
  assert.equal(root.component.properties.Size, spec.conditions.Size);
  assert.equal(root.component.properties['Left Addon#60204:0'], spec.conditions['Left Addon']);
  assert.equal(root.component.properties['Right Addon#60204:4'], spec.conditions['Right Addon']);
  assert.equal(d.summary.inconclusive, inconclusive);
  assert.equal(s.source.captureTopology.complete, true);
  assert.deepEqual(d.run.capture.warnings, []);
  const label = s.nodes.find(n => n.type === 'TEXT' && n.name === 'Label');
  const underline = s.nodes.find(n => n.semantic.path.endsWith(' / Content / Underline'));
  assert.equal(underline.component.properties.Line, 'Solid');
  if (caseId === 'LINK-05') assert.equal(root.component.properties['✎ Label#493:29'], 'Открыть подробные условия обслуживания');
  const replay = core.evaluateCompiledContract(s, preview);
  assert.deepEqual(signatures(replay), signatures(d.results.engine));
  assert.equal(replay.evaluations.filter(e => e.classification === 'violation').length, 0);
  const targets = core.prepareValidationSnapshot(s, preview).declaredTargetIdentitiesV1.targets;
  assert.equal(targets.length, 8);
  assert.equal(targets.filter(t => t.status === 'resolved').length, inconclusive ? 0 : 8);
  const row = { caseId, instanceId: spec.instanceId, url: spec.url, input: pin(retained),
    originalInput: { path: path.relative(packages, original), sha256: sha(retained), bytes: fs.statSync(retained).size },
    editorVersion: d.editorVersion, generatedAt: d.generatedAt, conditions: spec.conditions,
    facts: { properties: root.component.properties, gap: root.layout.itemSpacing, fontSize: label.text.fontSize, underline: underline.component.properties.Line },
    classifications: counts(replay), contextNotExecuted: d.summary.notExecuted, inconclusive, targets,
    installedResult: inconclusive ? 'FAIL_EXPECTED_CONCLUSIVE_PUBLIC_API' : 'PASS', exactLocalReplay: true };
  if (inconclusive) {
    const keys = caseId === 'LINK-05' ? ['✎ Label#493:29'] : ['Left Addon#60204:0', 'Right Addon#60204:4'];
    const test = clone(s), changes = [];
    for (const name of keys) for (const properties of [test.variantReference.properties, test.variantReference.nodeProperties[''].properties]) {
      changes.push({ property: name, actual: properties[name], nativeDefault: native.properties[name] });
      properties[name] = native.properties[name];
    }
    assert.deepEqual(portable(test.variantReference), portable(native), 'Only public root values may differ from native identity reference');
    assert.equal(core.portableDeclaredTargetReferenceHash(test.variantReference), nativePin);
    const diagnostic = core.evaluateCompiledContract(test, preview);
    assert.equal(diagnostic.evaluations.filter(e => ['human-review', 'violation'].includes(e.classification)).length, 0);
    assert(core.prepareValidationSnapshot(test, preview).declaredTargetIdentitiesV1.targets.every(t => t.status === 'resolved'));
    // Counterfactual isolation only: no product, package, baseline or observed report is changed.
    const fontNegative = clone(test); fontNegative.nodes.find(n => n.id === label.id).text.fontSize = 18;
    assert(core.evaluateCompiledContract(fontNegative, preview).evaluations.some(e => e.ruleId === 'component:web-core.link.label-typography.1.2' && e.classification === 'violation'));
    const stale = clone(test); stale.variantReference.nodes.push({ path: 'Unproven extra node', type: 'FRAME' });
    assert(core.prepareValidationSnapshot(stale, preview).declaredTargetIdentitiesV1.targets.every(t => t.reason === 'reference-pin-stale'));
    row.diagnostic = { kind: 'COUNTERFACTUAL_CAUSE_ISOLATION_ONLY_NOT_FIX_OR_LIVE_PASS', changedReferenceValues: changes,
      actualSnapshotAndEffectiveBaselineUnchanged: true, referenceMatchesNativeAfterValueRestoration: true,
      resolvedTargets: 8, classifications: counts(diagnostic), fontNegativeGuard: 'PASS', staleStructureGuard: 'PASS' };
  }
  rows.push(row);
}
const receipt = { schemaVersion: 'link.scoped-live-review.v2', revision: 2, date: '2026-10-10',
  manualSourceHash: core.stableHash(manual), compiledHash: core.stableHash(compiled), zip: pin(path.join(packages, 'Link.component-contract.zip')),
  coreRuntime: { path: corePath, sha256: sha(corePath), version: '0.1.14' }, review: { independent: false, reviewer: 'contract-authoring agent' },
  evidenceKind: 'Five installed Editor reports; local exact replay; counterfactual diagnosis separated from actual verdict',
  cases: rows, acceptedScope: ['LINK-01 S native baseline', 'LINK-02 S Size-20 icons native baseline', 'LINK-04 L native baseline'],
  acceptedRuns: 3, failedRuns: 2, allExpectedRunsPassed: false,
  defect: { id: 'EDITOR-DECLARED-TARGET-CONFIGURATION-001', pairedApolloId: 'CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04',
    reason: 'Whole portable reference pin includes configured public root property values; allowed text/BOOLEAN changes invalidate all declared targets',
    normativeChangeNeeded: false, productFixImplemented: false },
  normativeChanges: false, ruleStatusesChanged: false, wholeReady: false, fullAcceptance: false };
const output = path.join(out, 'review.json');
const bytes = JSON.stringify(receipt, null, 2) + '\n';
if (fs.existsSync(output)) assert.equal(fs.readFileSync(output, 'utf8'), bytes); else fs.writeFileSync(output, bytes, { flag: 'wx' });
console.log(JSON.stringify({ accepted: 3, failed: 2, exactReplay: 5, causeIsolated: 2, productFixImplemented: false }));
