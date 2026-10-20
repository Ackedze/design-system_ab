const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const D = __dirname, P = path.resolve(D, '../../../..'), id = 'component:web-core.icon-view.shape-false-disables-addons-and-indicator';
const read = f => JSON.parse(fs.readFileSync(f)), clone = x => JSON.parse(JSON.stringify(x));
const pin = f => { const b = fs.readFileSync(f); return { path: f, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length }; };
const save = (n, x) => { const f = path.join(D, n); if (fs.existsSync(f)) assert.deepEqual(read(f), clone(x)); else fs.writeFileSync(f, JSON.stringify(x) + '\n', { flag: 'wx' }); };
async function main() {
  const [corePath, coreSha] = process.argv.slice(2); assert(corePath && /^[a-f0-9]{64}$/.test(coreSha || ''));
  const corePin = pin(corePath); assert.equal(corePin.sha256, coreSha); const c = require(corePath);
  const input = path.join(P, 'IconView.r7.candidate.component-contract.zip');
  assert.equal(pin(input).sha256, '83d4566d4d35e974e51b38869a3dff0457d7a7e95cdccd11f2734ae99c57c1c4');
  const entries = await c.readZip(new Uint8Array(fs.readFileSync(input)));
  const files = entries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: c.zipEntryText(e) }));
  const m = read(path.join(D, 'contract.manual.json')), old = c.importWorkspace(files, m.component.contractId);
  const prior = c.buildExportBundle(old.manual, old.variantEvidence, old.dependencyContracts).compiled;
  const bundle = c.buildExportBundle(m, old.variantEvidence, old.dependencyContracts); save('validation-report.json', bundle.validation);
  assert(bundle.validation.valid); assert.equal(bundle.compiled.rules.length, 80); assert.equal(bundle.compiled.nonExecutableRules.length, 8);
  const normalize = r => { const x = clone(r); delete x.revision; delete x.source.checksum; return x; };
  assert.deepEqual(bundle.compiled.rules.filter(r => r.source.anchor !== id).map(normalize), prior.rules.map(normalize));
  for (const k of Object.keys(prior.facts)) if (k !== 'documentation') assert.deepEqual(clone(bundle.compiled.facts[k]), clone(prior.facts[k]), k);
  assert.deepEqual(m.documentation.slice(0, -1), old.manual.documentation);
  const newRules = bundle.compiled.rules.filter(r => r.source.anchor === id); assert.equal(newRules.length, 3);
  assert.deepEqual(newRules.map(r => r.assert.actual.fact), ['semanticApi.topaddon', 'semanticApi.bottomaddon', 'semanticApi.indicator']);
  assert(newRules.every(r => JSON.stringify(r.assert.expected) === JSON.stringify({ literal: [false] })));
  const ep = c.prepareAuthoringPreviewContract(bundle.compiled), reports = fs.readdirSync(path.join(P, 'IconView')).filter(n => /^icon-view.validation-report.2026-10-15T14-.*\.json$/.test(n)).sort();
  assert.equal(reports.length, 8); const replay = [], raw = reports.map(n => read(path.join(P, 'IconView', n)));
  for (let i = 0; i < raw.length; i++) {
    const result = c.evaluateCompiledContract(raw[i].snapshot, ep), actual = result.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
    const expected = i === 7 ? newRules.slice(0, 2).map(r => r.ruleId).sort() : raw[i].results.details.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
    assert.deepEqual(actual, expected, reports[i]); assert(!result.evaluations.some(e => ['human-review', 'not-evaluable'].includes(e.classification)), reports[i]);
    replay.push({ input: pin(path.join(P, 'IconView', reports[i])), kind: 'REPLAY_OF_R7_OBSERVED_SNAPSHOT_NOT_FRESH_R8_NATIVE', violations: actual, unknown: 0 });
  }
  const units = [], names = ['topaddon', 'bottomaddon', 'indicator'], display = ['TopAddon', 'BottomAddon', 'Indicator'];
  for (const flags of [[false,false,false],[true,false,false],[false,true,false],[false,false,true],[true,true,false]]) {
    const snapshot = clone(raw[7].snapshot), root = snapshot.nodes.find(n => n.id === snapshot.selection[0]);
    assert.equal(root.semanticApi.shape, false);
    flags.forEach((v, i) => { const key = Object.keys(root.component.properties).find(k => k.split('#')[0] === display[i]); assert(key); root.component.properties[key] = v; root.semanticApi[names[i]] = v; });
    const result = c.evaluateCompiledContract(snapshot, { ...ep, rules: ep.rules.filter(r => r.source.anchor === id) });
    const actual = result.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
    assert.deepEqual(actual, newRules.filter((_, i) => flags[i]).map(r => r.ruleId).sort());
    assert(!result.evaluations.some(e => ['human-review', 'not-evaluable'].includes(e.classification)));
    units.push({ kind: 'SYNTHETIC_NEW_RULE_ONLY_NOT_NATIVE', flags: Object.fromEntries(names.map((n,i) => [n, flags[i]])), violations: actual, unknown: 0 });
  }
  const isolated = { ...ep, rules: ep.rules.filter(r => r.source.anchor === id) };
  const inactive = c.evaluateCompiledContract(raw[0].snapshot, isolated);
  assert(inactive.evaluations.every(e => e.classification === 'not-applicable'));
  units.push({ kind:'SYNTHETIC_RULE_SCOPE_ONLY', case:'Shape=true inactive', violations:[], unknown:0 });
  for (const [alias, label] of [['shape','Shape'], ...names.map((n,i) => [n,display[i]])]) {
    const snapshot = clone(raw[7].snapshot), root = snapshot.nodes.find(n => n.id === snapshot.selection[0]);
    names.forEach((n,i) => { const key=Object.keys(root.component.properties).find(k => k.split('#')[0]===display[i]); root.component.properties[key]=false; });
    const key=Object.keys(root.component.properties).find(k => k.split('#')[0]===label); assert(key);
    delete root.component.properties[key]; delete root.semanticApi[alias];
    root.unknownFacts=[...(root.unknownFacts || []), 'component.properties.'+key];
    const result=c.evaluateCompiledContract(snapshot,isolated), unknown=result.evaluations.filter(e => e.classification==='human-review');
    assert.equal(unknown.length,alias==='shape'?3:1,alias);
    assert(!result.evaluations.some(e => e.classification==='violation'||e.classification==='not-evaluable'));
    units.push({ kind:'SYNTHETIC_MISSING_FACT_UNKNOWN', fact:'semanticApi.'+alias, violations:[], unknown:unknown.map(e=>({ruleId:e.ruleId,classification:e.classification,reason:e.trace.reason})) });
  }
  save('replay.json', { status: 'PASS_REPLAY_AND_SYNTHETIC', replay, units, freshNativeR8: 'NOT_RUN_USER_ONLY', Ready: false });
  save('component-contract.v2.json', bundle.compiled);
  const zip = c.buildAuthoringZip(bundle, files), reopenedEntries = await c.readZip(zip);
  const reopened = c.importWorkspace(reopenedEntries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: c.zipEntryText(e) })), m.component.contractId);
  assert.deepEqual(reopened.manual, m); assert.deepEqual(reopened.variantEvidence, old.variantEvidence);
  assert.deepEqual(c.buildExportBundle(reopened.manual, reopened.variantEvidence, reopened.dependencyContracts).compiled, bundle.compiled);
  const out = path.join(D, 'IconView.r8.candidate.component-contract.zip'); fs.writeFileSync(out, zip, { flag: 'wx' });
  const signatures = bundle.compiled.rules.map(r => JSON.stringify({ effect:r.effect, scope:r.scope, select:r.select, when:r.when, assert:r.assert })); assert.equal(new Set(signatures).size, 80);
  assert.deepEqual(pin(corePath), corePin);
  save('technical-report.json', { status: 'PASS_DRAFT_AUTHORING_REPLAY_ROUNDTRIP', core: corePin, sourceZip: pin(input), manual: pin(path.join(D, 'contract.manual.json')), compiled: pin(path.join(D, 'component-contract.v2.json')), zip: pin(out), manualSourceHash:c.stableHash(m), compiledHash:c.stableHash(bundle.compiled), manualRules:62, active:58, deprecated:4, assertions:80, nonExecutableRules:8, previous77PredicatesPreserved:true, newIR:newRules.map(r => ({ ruleId:r.ruleId, fact:r.assert.actual.fact })), nativeR7:7, invalidR7Oracle:1, replayR8:8, syntheticRuleCases:units.length, roundtrip:'PASS', freshNativeR8:'NOT_RUN_USER_ONLY', Ready:false });
  console.log(JSON.stringify({ status:'PASS', assertions:80, replay:8, synthetic:units.length, zip:out }));
}
main().catch(e => { save('FAILURE-'+Date.now()+'.json', { message:e.message, stack:e.stack, sharedWrites:0 }); console.error(e.stack); process.exitCode=1; });
