const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const R = __dirname, A = path.resolve(R, '../../../..'), W = path.resolve(A, '../..');
const corePath = W + '/.local/apollo-main/packages/component-contract-core/dist/core.cjs', core = require(corePath);
const prior = path.join(R, '../input-four-drafts-2026-10-26');
const input = '/Users/alexkukhta/Downloads/apollo-v4-75ec3e5937ef.json';
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p, v) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const pin = p => { const b = fs.readFileSync(p); return {path:p, bytes:b.length, sha256:crypto.createHash('sha256').update(b).digest('hex')}; };
const report = read(input), names = ['Input', 'NumberInput', 'AmountInput', 'Select'];
const counts = es => Object.fromEntries([...new Set(es.map(e => e.classification))].sort().map(k => [k, es.filter(e => e.classification === k).length]));
const failures = [], rows = [], candidates = [], counter = {};
for (const name of names) {
  const manual = read(prior + '/' + name + '/contract.manual.json'), compiled = read(prior + '/' + name + '/compiled.json');
  const facts = read(prior + '/' + name + '/variant-evidence.json'), cases = read(prior + '/' + name + '/test-cases.json').cases;
  const scopes = report.components.filter(c => c.release.contractId === manual.component.componentId);
  assert.equal(core.stableHash(compiled), scopes[0].release.contractHash);
  assert.deepEqual(manual, read(A + '/JSONS/web/components/web-core/core/' + name + '/contract.manual.json'));
  for (const c of scopes) {
    const expected = cases.find(t => t.nodeId === c.scopeId); assert(expected);
    const replay = core.evaluateCompiledContract(c.snapshot, core.prepareAuthoringPreviewContract(compiled));
    assert.deepEqual(counts(replay.evaluations), counts(c.result.engine.evaluations));
    const violations = replay.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
    const uncertain = replay.evaluations.filter(e => e.classification === 'human-review');
    const row = {component:name, caseId:expected.caseId, nodeId:c.scopeId, url:expected.url,
      expectedRuleIds:expected.expectedRuleIds, actualRuleIds:violations,
      expectedVerdictMatches:JSON.stringify(violations) === JSON.stringify([...expected.expectedRuleIds].sort()),
      classifications:counts(replay.evaluations), executionComplete:c.result.coverage.executionComplete};
    rows.push(row);
    for (const e of uncertain) {
      const group = e.subjectNodeName === 'Fixer' ? 'undeclared-slot-payload-baseline' : 'number-input-variant-bindings';
      counter[group] = (counter[group] || 0) + 1;
      if (!failures.some(f => f.component === name && f.group === group && f.ruleId === e.ruleId)) {
        failures.push({component:name, caseId:expected.caseId, group, ruleId:e.ruleId, subject:e.subjectNodeName, trace:e.trace});
      }
    }
  }
}
const firstFailure = {schemaVersion:'apollo.contract-authoring-eval.v1', runId:'input-four-native-r1-2026-10-27',
  review:{author:'Contract Creation', independent:false}, evidenceKind:'user-native-report-and-exact-replay', overall:'FAIL',
  report:pin(input), core:pin(corePath), release:report.release, selection:report.selection.roots,
  coverage:report.result.coverage, classifications:counts(report.result.engine.evaluations),
  expectedCases:25, verdictMatches:rows.filter(r => r.expectedVerdictMatches).length, cases:rows,
  unknownGroups:counter, representativeFailures:failures,
  ready:false, runtimeWrites:false, canonicalContractWrites:false, skillChanged:false};
write(R + '/native-eval.json', firstFailure);

// An isolated probe changes policy/bindings only; it never writes the published packages.
for (const name of names) {
  const m = read(prior + '/' + name + '/contract.manual.json'), facts = read(prior + '/' + name + '/variant-evidence.json');
  const scopes = report.components.filter(c => c.release.contractId === m.component.componentId);
  m.rules.find(r => r.id.endsWith('.layer-properties-use-effective-baseline')).boundaryPolicy = 'component-owned@1';
  if (facts.occurrenceAddressVersion === 1) {
    for (const t of m.targets.filter(t => t.semanticRole !== 'root' && !t.label.includes('@catalog:'))) {
      t.variantHints = m.representations.flatMap(rep => facts.variants.filter(v => v.componentSetKey === rep.locator.componentKey)
        .map(v => ({representationId:rep.id, componentKey:v.componentKey, pathHint:rep.locator.name + ' / ' + t.label})));
    }
  }
  const slotTargets = m.targets.filter(t => t.label.endsWith(' / Slot'));
  for (const t of slotTargets) {
    const owner = m.targets.find(o => o.label === t.label.split(' / ').slice(0, -1).join(' / ')); assert(owner);
    const properties = new Set();
    for (const c of scopes) for (const n of c.snapshot.nodes.filter(n => n.type === 'SLOT')) {
      const p = core.snapshotPaths(c.snapshot).get(n.id);
      if (p === t.label) properties.add(n.component.propertyReferenceBindings.slotContentId);
    }
    assert(properties.size);
    const base = structuredClone(m.rules.find(r => r.permission === 'allowed'));
    Object.assign(base, {id:'component:' + m.component.componentId + '.open-' + t.semanticRole, targetId:t.id,
      capability:'composition.content', controlPaths:[...properties].sort().map(property => ({kind:'slot-api',target:t.id,
        property, ownerTargetId:owner.id, contentOwnership:'external'})),
      rationale:'Содержимое native Slot принадлежит потребителю; эталон поля проверяет сам контейнер.',
      message:'Содержимое native Slot принадлежит потребителю.'});
    m.rules.push(base);
  }
  const bundle = core.buildExportBundle(m, facts, []); write(R + '/' + name + '/probe-validation.json', bundle.validation);
  assert(bundle.validation.valid, JSON.stringify(bundle.validation));
  const result = scopes.map(c => {
    const e = core.evaluateCompiledContract(c.snapshot, core.prepareAuthoringPreviewContract(bundle.compiled));
    const v = e.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
    const expected = rows.find(r => r.nodeId === c.scopeId);
    return {caseId:expected.caseId, actualRuleIds:v, expectedRuleIds:expected.expectedRuleIds,
      verdictMatches:JSON.stringify(v) === JSON.stringify([...expected.expectedRuleIds].sort()), classifications:counts(e.evaluations)};
  });
  fs.writeFileSync(R + '/' + name + '/probe-manual.json', JSON.stringify(m) + '\n');
  candidates.push({component:name, slotTargets:slotTargets.length, variantHints:m.targets.reduce((n,t) => n + (t.variantHints?.length || 0),0), cases:result});
}
write(R + '/data-only-probe.json', {status:'DIAGNOSTIC_ONLY', nativeRun:'NOT_RUN', core:pin(corePath),
  sourceReport:pin(input), canonicalContractWrites:false, runtimeWrites:false, results:candidates});
console.log(JSON.stringify({native:{groups:counter, matched:rows.filter(r => r.expectedVerdictMatches).length},
  probe:candidates.map(c => ({component:c.component, slotTargets:c.slotTargets, variantHints:c.variantHints,
    cases:c.cases.map(r => ({caseId:r.caseId, matches:r.verdictMatches, counts:r.classifications}))}))}));
