// Read-only acceptance replay; --record preserves QA evidence, never normative artifacts.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../experiments/web-core/core/Amount/authoring');
const coreFile = path.resolve(__dirname, '../../../projects/ComponentContractEditor/dist/core.cjs');
const core = require(coreFile);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const prefix = 'component:web-core.amount.';
const placeholder = 'b95166da66ad15ecad14244d670ab1b66db66f80';
const cases = [
  ['13-04-23-316', 'visible-placeholder', '13129:64641', ['addon-content-is-configurable.1.2']],
  ['13-04-50-809', 'different-tokens-and-typography', '13129:64580', []],
  ['13-05-38-184', 'custom-text', '13129:64734', []],
  ['13-06-02-132', 'standard-usd-wrong-text', '13129:64751', ['currency-standard-text-matches-type.1.1']],
  ['13-06-41-096', 'external-addon-swap', '13129:64641', []],
  ['13-06-58-937', 'root-gap', '13129:64783', ['layer-properties-use-effective-baseline.1.6']],
  ['13-07-07-337', 'hidden-major', '13129:64798', ['fixed-part-order.visibility-011.1.1', 'major-required.1.1']],
  ['13-07-37-413', 'currency-unbound-color', '13129:64610', ['currency-colors-use-tokens.1.1']],
];
const artifactFiles = ['contract.manual.json', 'compiled/component-contract.v2.json', 'editor/Amount.editor-input.zip'];
const historical = path.resolve(root, '../history/r3-editor-0.2.56');
const artifactHashes = () => Object.fromEntries(artifactFiles.map(f => [f, sha(fs.readFileSync(path.join(historical, f)))]));
const artifactsBefore = artifactHashes();
const manual = JSON.parse(fs.readFileSync(path.join(historical,'contract.manual.json'))), compiled = JSON.parse(fs.readFileSync(path.join(historical,'compiled/component-contract.v2.json')));
const records = [], archives = [];
const role = (snapshot, name) => {
  const matches = snapshot.nodes.filter(n => n.semantic?.role === name);
  assert.equal(matches.length, 1, `Expected exactly one ${name} target`);
  return matches[0];
};
const textChild = (snapshot, parent) => {
  const matches = snapshot.nodes.filter(n => n.parentId === parent.id && n.type === 'TEXT');
  assert.equal(matches.length, 1);
  return matches[0];
};
for (const [time, caseId, rootNodeId, expectedRuleIds] of cases) {
  const name = `amount.validation-report.2026-09-29T${time}Z.json`;
  const originalFile = `editor/${name}`, fixtureFile = `reports/fixtures/r3-editor-0.2.56/${name}.gz`;
  const original = path.join(root, originalFile), archive = path.join(root, fixtureFile);
  const bytes = fs.existsSync(original) ? fs.readFileSync(original) : zlib.gunzipSync(fs.readFileSync(archive));
  if (fs.existsSync(archive)) assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  const r = JSON.parse(bytes), snapshot = r.snapshot, snapshotBefore = JSON.stringify(snapshot);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.56');
  assert.equal(r.run.manualRevision, 3);
  assert.equal(r.run.trigger, 'selected-instance');
  assert.equal(snapshot.source.rootNodeId, rootNodeId);
  assert.equal(snapshot.source.propertyReferenceIdentityVersion, 1);
  assert.equal(snapshot.source.truncated, false);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract), core.stableHash(compiled));
  assert.equal(core.stableHash(snapshot), r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), r.run.evaluatedContractHash);
  assert.equal(core.stableHash(core.prepareAuthoringPreviewContract(compiled)), r.run.evaluatedContractHash);
  assert.deepEqual(r.sources.compilerIssues, []);
  const engine = core.evaluateCompiledContract(snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine, { contract: compiled, issues: [] }, manual, snapshot);
  const details = core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy);
  for (const [kind, result] of Object.entries({ engine, editor, details })) {
    assert.equal(core.stableHash(result), core.stableHash(r.results[kind]), `${caseId}: ${kind} replay differs`);
  }
  assert.equal(JSON.stringify(snapshot), snapshotBefore, 'Replay must not mutate raw capture');
  assert.equal(r.summary.complete, true);
  assert.equal(editor.scenarioCoverage.complete, true);
  assert.equal(editor.scenarioCoverage.inconclusive, 0);
  assert.equal(editor.scenarioCoverage.notExecuted, 0);
  assert.equal(editor.scenarioCoverage.unknownApplicabilityRules, 0);
  assert.equal(r.summary.contractReadiness.status, 'draft');
  const violations = engine.evaluations.filter(e => e.classification === 'violation');
  assert.deepEqual(violations.map(e => e.ruleId).sort(), expectedRuleIds.map(id => prefix + id).sort());
  const rootNode = role(snapshot, 'root'), addon = role(snapshot, 'addon');
  let facts;
  switch (caseId) {
    case 'visible-placeholder':
      assert.equal(addon.visibility.effective, true);
      assert.equal(addon.component.identity.componentKey, placeholder);
      facts = { addonKey: placeholder, addonVisible: true };
      break;
    case 'different-tokens-and-typography': {
      const major = textChild(snapshot, role(snapshot, 'major'));
      const minor = textChild(snapshot, role(snapshot, 'minor'));
      assert(major.appearance.fill[0].tokenId && minor.appearance.fill[0].tokenId);
      assert.notEqual(major.appearance.fill[0].tokenId, minor.appearance.fill[0].tokenId);
      assert.equal(major.text.fontSize, 14); assert.equal(minor.text.fontSize, 16);
      assert.equal(addon.visibility.effective, false);
      facts = { majorFontSize: 14, minorFontSize: 16, differentTokenIds: true, hiddenPlaceholderAllowed: true };
      break;
    }
    case 'custom-text':
    case 'standard-usd-wrong-text': {
      const currency = role(snapshot, 'currency'), text = textChild(snapshot, currency);
      const custom = caseId === 'custom-text';
      assert.equal(currency.component.properties.Type, custom ? 'Custom' : 'USD');
      assert.equal(text.text.characters.trim(), custom ? 'баллов' : 'UD');
      assert.equal(text.libraryTextV1.trimmedCharacters, custom ? 'Custom' : 'USD');
      facts = { type: currency.component.properties.Type, actual: text.text.characters,
        libraryText: text.libraryTextV1.characters, standardTextRuleApplicable: !custom };
      break;
    }
    case 'external-addon-swap': {
      assert.equal(addon.visibility.effective, true);
      assert.notEqual(addon.component.identity.componentKey, placeholder);
      assert.equal(addon.component.propertyReferenceBindings.visible, 'Addon#100902:0');
      assert.equal(addon.slotBoundaryV1.contentOwnership, 'external');
      assert.equal(addon.slotBoundaryV1.evidence, 'native-slot-reference');
      assert.equal(addon.baselineProvenance.status, 'unresolved');
      assert.equal(snapshot.nodes.length, 28);
      assert.equal(r.run.capture.matchedBaselineNodes, 7);
      assert.equal(r.run.capture.warnings.length, 1);
      const ownedNodes = new Set();
      for (const n of snapshot.nodes) {
        if (n.id === addon.id || ownedNodes.has(n.parentId)) ownedNodes.add(n.id);
      }
      assert.equal(ownedNodes.size, 21);
      assert(!engine.evaluations.some(e => ownedNodes.has(e.subjectNodeId) && e.subjectNodeId !== addon.id),
        'Amount must not claim validation of external slot descendants');
      facts = { addonKey: addon.component.identity.componentKey, slotAnchor: 'Addon#100902:0',
        contentOwnership: 'external', externalBoundaryNodes: 21, placeholderBaselineInherited: false,
        externalDescendantChecks: 0, captureWarningIsNotAnAmountViolation: true };
      break;
    }
    case 'root-gap':
      assert.equal(rootNode.layout.itemSpacing, 8);
      assert.equal(rootNode.baseline.effective.layout.itemSpacing, 0);
      facts = { actualGap: 8, baselineGap: 0 };
      break;
    case 'hidden-major':
      assert.equal(role(snapshot, 'major').visibility.effective, false);
      facts = { majorVisible: false, twoRuleEvaluationsForOneDefect: true };
      break;
    case 'currency-unbound-color': {
      const text = textChild(snapshot, role(snapshot, 'currency'));
      const paint = text.appearance.fill[0], baseline = text.baseline.effective.appearance.fill[0];
      assert(!paint.tokenId); assert(baseline.tokenId);
      assert.deepEqual(paint.color, baseline.color);
      assert.equal(paint.opacity, baseline.opacity);
      facts = { bindingRemoved: true, rgbAndOpacityUnchanged: true };
      break;
    }
  }
  if (caseId !== 'external-addon-swap') {
    assert.equal(r.run.capture.matchedBaselineNodes, 9);
    assert.deepEqual(r.run.capture.warnings, []);
  }
  archives.push({ archive, bytes });
  records.push({ caseId, originalFile, fixtureFile, sha256: sha(bytes), rootNodeId,
    complete: true, notExecuted: 0, inconclusive: 0, engineEvaluations: engine.evaluations.length,
    classifications: r.summary.classifications, facts,
    violations: violations.map(e => ({ ruleId: e.ruleId, subjectNodeId: e.subjectNodeId, trace: e.trace })),
    capturedNodes: snapshot.nodes.length, matchedNodes: r.run.capture.matchedBaselineNodes,
    captureWarnings: r.run.capture.warnings, exactReplay: { engine: true, editor: true, details: true } });
}
const output = {
  schemaVersion: 'amount.live-review.v1', date: '2026-09-29', componentId: 'core.web.amount',
  status: 'all-eight-submitted-scenarios-accepted-boundary-matrix-partial',
  editorVersion: '0.2.56', manualRevision: 3, manualSourceHash: core.stableHash(manual),
  coreByteSha256: sha(fs.readFileSync(coreFile)), artifactSha256: artifactsBefore,
  normativeArtifactsChanged: false, contractReady: false,
  counts: { reports: 8, complete: 8, positive: 3, negative: 5, violationEvaluations: 6,
    engineEvaluations: records.reduce((sum, r) => sum + r.engineEvaluations, 0), inconclusive: 0, notExecuted: 0 },
  allReplayExact: true, reportResults: records,
  remainingLiveEvidence: [
    'R02: detached Major/Minor color (Currency is confirmed).',
    'R04: Custom empty string and standard-looking RUB text (arbitrary word is confirmed).',
    'R05: correct visible USD positive counterpart (UD negative is confirmed).',
    'R07: local renamed native swap (library swap is confirmed).',
    'R08: visible original placeholder after recolor/rename.',
    'R11: non-Amount identity rejection, screenshot/text suffices; no JSON required.',
  ],
  followUps: [{ priority: 'P2', kind: 'diagnostic-wording',
    finding: 'External Addon correctly passes, but raw capture warning still calls its 21 boundary nodes unmatched.',
    recommendation: 'Explain external ownership in diagnostics without hiding unrelated unmatched nodes or widening Amount validation.' }],
};
assert.equal(output.counts.engineEvaluations, 392);
if (process.argv.includes('--record')) {
  for (const { archive, bytes } of archives) {
    if (!fs.existsSync(archive)) {
      fs.mkdirSync(path.dirname(archive), { recursive: true });
      fs.writeFileSync(archive, zlib.gzipSync(bytes), { flag: 'wx' });
    }
    assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))), sha(bytes));
  }
  fs.writeFileSync(path.join(root, 'reports/live-review-r3.2026-09-29.json'), JSON.stringify(output, null, 2) + '\n');
}
assert.deepEqual(artifactHashes(), artifactsBefore);
console.log(JSON.stringify({ status: output.status, ...output.counts, allReplayExact: true,
  normativeArtifactsChanged: false, recorded: process.argv.includes('--record') }, null, 2));
