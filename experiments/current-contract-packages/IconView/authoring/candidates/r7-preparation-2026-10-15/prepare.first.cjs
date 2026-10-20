const fs = require('node:fs'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const W = '/Users/alexkukhta/Desktop/workplace', P = W + '/shared/design-system_ab/experiments/current-contract-packages';
const D = __dirname, S = P + '/IconView/authoring/candidates/r6-2026-10-14';
const R = W + '/.local/iconview-addon-owner-chain-2026-10-14';
const read = f => JSON.parse(fs.readFileSync(f)), clone = x => JSON.parse(JSON.stringify(x));
const pin = f => { const b = fs.readFileSync(f); return { path: f, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length }; };
const check = p => assert.deepEqual(pin(p.path), p, p.path);
const save = (n, x) => fs.writeFileSync(D + '/' + n, JSON.stringify(x) + '\n', { flag: 'wx' });

async function main() {
  const sourceSeal = read(S + '/seal.json'), readerSeal = read(R + '/SEAL.json');
  assert.equal(sourceSeal.writerStatus, 'CLOSED');
  assert.equal(read(R + '/HANDOFF.json').writerStatus, 'CLOSED_PRIVATE_CANDIDATE');
  sourceSeal.files.forEach(check);
  // No current shared source/dist is read or rebuilt during the reader hold.
  const privatePins = readerSeal.outputs.filter(p => [R + '/candidate-core.cjs', R + '/predicate-core.cjs'].includes(p.path));
  assert.equal(privatePins.length, 2); privatePins.forEach(check);
  const c = require(R + '/candidate-core.cjs'), engine = require(R + '/predicate-core.cjs');
  const zipPin = read(S + '/candidate-manifest.json');
  check({ path: zipPin.zip, sha256: zipPin.sha256, bytes: zipPin.bytes });
  const entries = await c.readZip(new Uint8Array(fs.readFileSync(zipPin.zip)));
  const files = entries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: c.zipEntryText(e) }));
  const prior = read(S + '/contract.manual.json'), evidence = read(S + '/variant-evidence.json');
  const imported = c.importWorkspace(files, prior.component.contractId);
  assert.deepEqual(imported.manual, prior); assert.deepEqual(imported.variantEvidence, evidence);
  const probeFile = P + '/IconView/reports/addon-preflight-2026-10-14/part-identity-probe.json';
  const probe = read(probeFile), m = clone(prior), coverage = read(S + '/coverage-map.json');
  const norm = {
    source: 'Existing Hub norm; no normative change',
    text: 'В слотах TopAddon / BottomAddon у вложенного IconView всегда Form=Circle на Shape и Border; Form родителя не копируется.',
    references: [W + '/ds-ai-hub/core/web/components/icon-view/guidelines.md', W + '/ds-ai-hub/core/web/components/icon-view/figma/adapter.md'],
    exception: 'TopAddon may contain Indicator. Type/swap, preserved slot Size and no nested mini-IconView indicator remain a separate unresolved route.',
    scope: 'Four native-bound parts of the ordinary nested IconView; visible root addon BOOLEAN enables each pair. Hidden Border is still a configured part.'
  };
  save('source-norm.json', norm);
  const template = prior.rules.find(r => r.id === 'component:web-core.icon-view.shape-form-domain');
  const added = [];
  for (const original of probe.targets) {
    const part = original.id.replace('probe.', ''), target = { ...clone(original), id: 'target.' + part, semanticRole: part, label: part };
    m.targets.push(target);
    const rule = {
      ...clone(template), id: 'component:web-core.icon-view.' + part + '-circle', targetId: target.id,
      constraints: [{ type: 'propertyDomain', fact: 'component.properties.Form', values: ['Circle'] }],
      applicability: { variants: 'all', modes: 'all', platforms: [], scopeStatus: 'confirmed', conditionSubject: 'component-root', context: { ['semanticApi.' + (part.startsWith('top-') ? 'topaddon' : 'bottomaddon')]: true } },
      rationale: norm.text, sourceRefs: ['hub.guidelines', 'hub.figma.adapter']
    };
    m.rules.push(rule); added.push({ target, rule, compiledRuleId: rule.id + '.1.1' });
    coverage.rules.push({ id: rule.id, status: 'draft', norm: norm.text, target: target.id, route: 'auto', applicability: rule.applicability, constraints: rule.constraints, sourceRefs: rule.sourceRefs, compiledRuleIds: [rule.id + '.1.1'], admission: 'Private reader candidate only; shared implementation not installed' });
  }
  const remainder = m.rules.find(r => r.id.endsWith('addons-smaller-and-circle'));
  remainder.execution.missingFacts = [norm.exception, 'Circle checks require the separately queued Reader owner-chain implementation and native applicability acceptance; no installed Reader PASS is claimed.'];
  const oldCoverage = coverage.rules.find(r => r.id === remainder.id);
  oldCoverage.remainingFacts = clone(remainder.execution.missingFacts);
  coverage.addonFormScope = { sourceNorm: pin(D + '/source-norm.json'), rules: added.map(a => a.rule.id), preservedContextRule: remainder.id, ordinaryAddonBindings: '4 parts × 7 captured root variants', verifiedNativeIdentity: 'Retained Size64 only; not fresh native', exceptionStatus: 'UNRESOLVED_INDICATOR_ROUTE', installedReader: false, Ready: false };
  m.metadata.revision = 7; m.metadata.updatedAt = new Date().toISOString();
  const report = P + '/IconView/icon-view.validation-report.2026-10-14T13-43-34-139Z.json';
  const inputs = [pin(S + '/seal.json'), pin(zipPin.zip), pin(S + '/contract.manual.json'), pin(S + '/variant-evidence.json'), pin(S + '/component-contract.v2.json'), pin(probeFile), pin(report), pin(R + '/SEAL.json'), pin(R + '/HANDOFF.json'), ...privatePins, ...norm.references.map(pin)];
  m.source = { ...m.source, importedAt: m.metadata.updatedAt, importedFiles: [...new Set([...m.source.importedFiles, D + '/source-norm.json'])], sourceHash: c.stableHash(inputs) };
  const bundle = c.buildExportBundle(m, evidence, imported.dependencyContracts);
  save('validation-report.json', bundle.validation); assert(bundle.validation.valid, JSON.stringify(bundle.validation));
  save('contract.manual.json', m); save('component-contract.v2.json', bundle.compiled); save('coverage-map.json', coverage);
  assert.equal(m.rules.length, 58); assert.equal(m.targets.length, 16); assert.equal(bundle.compiled.rules.length, 77);
  assert.equal(bundle.compiled.nonExecutableRules.length, 6);
  for (const rule of prior.rules) {
    if (rule.id === remainder.id) continue;
    assert.deepEqual(m.rules.find(r => r.id === rule.id), rule, rule.id);
  }
  for (const key of ['semanticApi', 'controlPorts', 'generation', 'representations', 'examples']) assert.deepEqual(m[key], prior[key], key);
  const comparable = r => { const x = clone(r); delete x.revision; delete x.source.checksum; return x; };
  for (const old of read(S + '/component-contract.v2.json').rules) assert.deepEqual(comparable(bundle.compiled.rules.find(r => r.ruleId === old.ruleId)), comparable(old), old.ruleId);
  const nextFiles = files.filter(f => !['contract.manual.json', 'component-contract.v2.json'].includes(f.name));
  nextFiles.push({ name: 'contract.manual.json', text: JSON.stringify(m) }, { name: 'component-contract.v2.json', text: JSON.stringify(bundle.compiled) });
  const zip = c.buildAuthoringZip(bundle, nextFiles), reopenedEntries = await c.readZip(zip);
  const reopened = c.importWorkspace(reopenedEntries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: c.zipEntryText(e) })), m.component.contractId);
  assert.deepEqual(reopened.manual, m); assert.deepEqual(reopened.variantEvidence, evidence);
  assert.deepEqual(c.buildExportBundle(reopened.manual, reopened.variantEvidence, reopened.dependencyContracts).compiled, bundle.compiled);
  save('technical-report.json', { status: 'PASS_PRIVATE_SCOPED', compiler: 'Pinned private candidate-core, not current installed core', manualHash: c.stableHash(m), compiledHash: c.stableHash(bundle.compiled), roundtrip: 'PASS_IN_MEMORY_FULL_FACTS', zipBytes: zip.length, zipPersisted: false, installedReader: false, freshNative: 'NOT_RUN', Ready: false });
  const ec = c.prepareAuthoringPreviewContract(bundle.compiled), raw = read(report).snapshot, prepared = c.prepareValidationSnapshot(raw, ec);
  const certificates = prepared.declaredTargetIdentitiesV1.targets.filter(t => added.some(a => a.target.id === t.targetId));
  assert.equal(certificates.length, 4); assert(certificates.every(t => t.status === 'resolved')); assert.equal(new Set(certificates.map(t => t.nodeId)).size, 4);
  const rules = ec.rules.filter(r => added.some(a => a.compiledRuleId === r.ruleId)); assert.equal(rules.length, 4);
  const cases = [];
  function run(id, mutate, expected) {
    const s = clone(prepared); mutate(s);
    const result = engine.evaluateRules({ snapshot: s, rules, ruleRelease: ec.package.manualSourceHash });
    const actual = Object.fromEntries(result.evaluations.map(e => [e.ruleId, e.classification]));
    const want = Object.fromEntries(added.map(a => [a.compiledRuleId, expected[a.compiledRuleId] || 'compliant']));
    assert.deepEqual(actual, want, id);
    cases.push({ id, kind: 'Engine-only prepared-fact decision; not native changed-variant/capture/UI PASS', expected: want, actual });
  }
  run('all-four-Circle', () => {}, {});
  for (const a of added) {
    const nodeId = certificates.find(t => t.targetId === a.target.id).nodeId;
    for (const form of ['Rectangle', 'Superellipse']) run(a.target.id + '-' + form, s => { s.nodes.find(n => n.id === nodeId).component.properties.Form = form; }, { [a.compiledRuleId]: 'violation' });
    run(a.target.id + '-unknown-Form', s => { s.nodes.find(n => n.id === nodeId).unknownFacts.push('component.properties.Form'); }, { [a.compiledRuleId]: 'human-review' });
  }
  for (const slot of ['topaddon', 'bottomaddon']) {
    const expected = Object.fromEntries(added.filter(a => a.rule.applicability.context['semanticApi.' + slot]).map(a => [a.compiledRuleId, 'not-applicable']));
    run(slot + '-inactive', s => { s.nodes[0].semanticApi[slot] = false; for (const n of s.nodes) if (n.host?.semanticApi) n.host.semanticApi[slot] = false; }, expected);
  }
  save('controlled-cases.json', { status: 'PASS_PRIVATE_SCOPED', cases, nativeCertificates: certificates, nativeInput: pin(report), ReaderCandidate: pin(R + '/SEAL.json'), ordinaryIconViewOnly: true, IndicatorException: 'NOT_RUN_UNRESOLVED', freshNative: 'NOT_RUN', Ready: false });
  save('diff-summary.json', { fromRevision: 6, toRevision: 7, addedTargets: added.map(a => a.target.id), addedRules: added.map(a => a.rule.id), priorManualRulesPreserved: 53, contextMetadataOnlyUpdated: remainder.id, priorIRPreserved: 73, semanticApiAndGenerationUnchanged: true, canonicalZipWrites: 0, workingManifestChanges: false, sharedSourceBuildWrites: 0, registryWrites: 0, pilotChanges: false });
  save('case.json', { caseId: 'iconview-addon-circle-private-r7-2026-10-15', request: 'Continue contracts; next IconView existing addon Circle norm', inputs, sourceNorm: pin(D + '/source-norm.json'), admission: 'PRIVATE_PREPARATION_ONLY', ruleIds: added.map(a => a.compiledRuleId), nativeMutationFeasibility: 'UNVERIFIED; no user task assigned', pending: ['General shared Reader window and latest-source preimage check', 'Installed Reader and current capture validation', 'Indicator exception applicability/type/swap', 'Registry synchronization before package promotion'], Ready: false });
  save('eval.json', { schemaVersion: 'apollo.contract-authoring-eval.v1', review: { author: 'Contract Creation', independent: false }, overall: 'PARTIAL', acceptedScope: ['Private schema/compiler', 'Exact preservation of 73 prior IR assertions', 'Core memory ZIP/reopen including full facts', 'Four retained Size64 native identity certificates', '15 Engine-only Form decision cases'], gaps: ['Reader not installed', 'No fresh native case', 'Native Form editability not verified', 'Indicator special scenario unresolved', 'Registry synchronization and canonical promotion not performed'], Ready: false });
  inputs.forEach(check); sourceSeal.files.forEach(check); privatePins.forEach(check);
  save('HANDOFF.json', { writerStatus: 'CLOSED_PRIVATE_PREPARATION', component: 'IconView', revision: 7, installed: false, packagePromoted: false, zipPersisted: false, manual: pin(D + '/contract.manual.json'), compiled: pin(D + '/component-contract.v2.json'), results: pin(D + '/controlled-cases.json'), readerDependency: pin(R + '/SEAL.json'), checks: { rules: 58, assertions: 77, priorIRPreserved: 73, newTargets: 4, variantBindings: 28, resolvedRetainedSize64: 4, engineOnlyCases: cases.length, inMemoryRoundtrip: 'PASS' }, sourceBuildWrites: 0, workingManifestChanges: false, registryWrites: 0, pilotChanges: false, Ready: false });
  save('SEAL.json', { writerStatus: 'CLOSED_PRIVATE_PREPARATION', closedAt: new Date().toISOString(), inputs, outputs: fs.readdirSync(D).filter(n => n !== 'SEAL.json').map(n => pin(D + '/' + n)), Ready: false });
  console.log(JSON.stringify({ status: 'CLOSED_PRIVATE_PREPARATION', rules: m.rules.length, assertions: bundle.compiled.rules.length, engineOnlyCases: cases.length, nativeTargetsResolved: certificates.length, roundtrip: 'PASS_IN_MEMORY', installed: false, Ready: false }));
}
main().catch(e => { save('FIRST-FAILURE.json', { error: e.message, stack: e.stack, sourceBuildWrites: 0, canonicalWrites: 0 }); console.error(e.stack); process.exitCode = 1; });
