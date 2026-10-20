const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const W = '/Users/alexkukhta/Desktop/workplace';
const P = path.join(W, 'shared/design-system_ab/experiments/current-contract-packages');
const R = __dirname;
const B = path.join(P, 'BackgroundPlate/authoring/candidates/r2-native-bindings-2026-10-16');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(R, name), JSON.stringify(value) + '\n');
const pin = p => { const b = fs.readFileSync(p); return {path:p, sha256:crypto.createHash('sha256').update(b).digest('hex'), bytes:b.length}; };
const corePin = read(path.join(W, '.local/apollo-general-2026-10-16/mcp-pilot276/BACKGROUNDPLATE-C-PROTECTED-INPUTS.json')).core271;
assert.deepEqual(pin(corePin.path), corePin);
const c = require(corePin.path);
const decisions = read(path.join(R, 'owner-decisions.json'));
const previous = read(path.join(B, 'contract.manual.json'));
const manual = structuredClone(previous);
const evidence = read(path.join(B, 'variant-evidence.json'));
const prefix = 'component:web-corp.background-plate.';
const removed = decisions.decisions.filter(d => d.action !== 'keep').flatMap(d => d.sourceSuffixes.map(s => prefix+s));
assert.equal(removed.length, 12);
assert.equal(new Set(removed).size, 12);
manual.rules = manual.rules.filter(r => !removed.includes(r.id));
assert.equal(previous.rules.length - manual.rules.length, 12);
const blend = manual.rules.find(r => r.id === prefix+'blend-mode-is-fixed');
blend.severity = 'error';
blend.rationale = decisions.decisions.find(d => d.annotation === 5).norm;
blend.status = 'draft';
manual.metadata.revision = 3;
manual.metadata.updatedAt = fs.existsSync(path.join(R,'contract.manual.json')) ? read(path.join(R,'contract.manual.json')).metadata.updatedAt : new Date().toISOString();
manual.metadata.publicRepresentationBoundaryVersion = 1;
manual.semantics.doNotUseWhen = [];
manual.generation.instructions = manual.generation.instructions.filter(s => !s.includes('Style Level'));
for (const d of decisions.decisions) {
  manual.decisions.push({id:'owner-scope-2026-10-16-'+d.annotation, status:'accepted', summary:d.norm,
    rationale:'Решение владельца. Внешние нормы учитываются по новому владельцу, без дублирования component rule. Shared source/Hub sync ещё не применён.',
    sourceRefs:d.sourceSuffixes.map(s => prefix+s), ...(d.action !== 'keep' ? {retiredRuleIds:d.sourceSuffixes.map(s => prefix+s)} : {})});
}
manual.documentation.push({id:'owner-scope-2026-10-16', kind:'normative-routing', path:path.join(R,'owner-decisions.json'), status:'verified', projection:'source'});
manual.documentation.push({id:'passport-public-boundary', kind:'passport', path:path.join(R,'passport.json'), status:'verified', projection:'source'});
const sourceRoot = path.join(W,'shared/design-system_ab/JSONS/web/components/web-corp/BackgroundPlate');
const sourceRules = read(path.join(sourceRoot,'rules.json'));
const api = read(path.join(sourceRoot,'contract.overrides.json')).manual.publicApi.components;
const passport = {schemaVersion:1, componentId:manual.component.componentId, status:'draft',
  publicRepresentationBoundaryVersion:1,
  public:manual.representations.map(r => ({representationId:r.id, canonicalKey:r.locator.componentSetKey, platform:r.platform})),
  auxiliary:api.filter(r => r.role === 'internal-style').map(r => ({name:r.name, canonicalKey:r.key, platform:r.platform, role:'auxiliary', standalone:false})),
  policyRefs:decisions.decisions.filter(d => d.destination && !['component','passport-public-boundary'].includes(d.destination)).map(d => ({owner:d.destination, ruleIds:d.ruleIds, sharedStatus:'SYNC_PENDING'})),
  codeMapping:'NOT_VERIFIED', generationPilotScope:'UNCHANGED'};
assert.equal(passport.public.length, 6); assert.equal(passport.auxiliary.length, 8);
write('passport.json',passport);
const bundle = c.buildExportBundle(manual,evidence,[]);
assert(bundle.validation.valid,JSON.stringify(bundle.validation.issues));
assert.equal(bundle.compiled.rules.length,23); assert.equal(bundle.compiled.nonExecutableRules.length,2);
const semanticIR = rules => JSON.parse(JSON.stringify(rules)).map(({revision,source,...r}) => ({...r,source:{path:source.path,anchor:source.anchor}}));
assert.deepEqual(semanticIR(bundle.compiled.rules),semanticIR(read(path.join(B,'component-contract.v2.json')).rules));
assert.deepEqual(manual.targets,previous.targets); assert.deepEqual(manual.semanticApi,previous.semanticApi);
assert.deepEqual(manual.representations,previous.representations); assert.deepEqual(manual.generation.profiles,previous.generation.profiles);
const coverage = sourceRules.manual.rules.map(r => {
  const decision = decisions.decisions.find(d => d.sourceSuffixes.includes(r.ruleId.slice(prefix.length)));
  const records = manual.rules.filter(m => m.sourceRefs.includes(r.ruleId));
  return {sourceRuleId:r.ruleId, sourceText:r.ruleText, sourcePath:path.join(sourceRoot,'rules.json'),
    action:decision?.action||'unchanged', owner:decision?.destination||'component',
    manualRuleIds:records.map(x=>x.id), externalRuleIds:decision?.ruleIds||[],
    compiledRuleIds:bundle.compiled.rules.filter(ir=>records.some(m=>ir.ruleId.startsWith(m.id+'.'))).map(ir=>ir.ruleId),
    sharedSourceStatus:'NOT_APPLIED', nativeStatus:'HISTORICAL_R2_ONLY_NO_FRESH_R3_RUN'};
});
write('coverage-map.json',{schemaVersion:1,rules:coverage}); write('contract.manual.json',manual);
write('component-contract.v2.json',bundle.compiled); write('variant-evidence.json',evidence);
(async () => {
  const entries = await c.readZip(fs.readFileSync(path.join(B,'BackgroundPlate.r2.candidate.component-contract.zip')));
  const carried = entries.filter(e=>e.name.includes('/source/')).map(e=>({name:path.basename(e.name),text:c.zipEntryText(e)}));
  const zip = c.buildAuthoringZip(bundle,[...carried,...['owner-decisions.json','passport.json','coverage-map.json'].map(name=>({name,text:fs.readFileSync(path.join(R,name),'utf8')}))]);
  const zipPath=path.join(R,'BackgroundPlate.r3.candidate.component-contract.zip'); fs.writeFileSync(zipPath,zip);
  const reopenedEntries=await c.readZip(zip);
  const reopened=c.importWorkspace(reopenedEntries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:c.zipEntryText(e)})),manual.component.componentId);
  assert.deepEqual(reopened.manual,manual); assert.deepEqual(reopened.variantEvidence,evidence);
  assert.deepEqual(JSON.parse(JSON.stringify(c.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled)),JSON.parse(JSON.stringify(bundle.compiled)));
  const result={status:'PASS_PRIVATE_CANDIDATE_ONLY',revision:3,manualRecords:manual.rules.length,IR:23,nonExecutable:2,
    manualSourceHash:bundle.compiled.package.manualSourceHash,zip:pin(zipPath),core:corePin,
    publicRoots:6,auxiliarySets:8,existingIRSemantics:'UNCHANGED',native:'NOT_RUN_R3',sourceHubSync:'NOT_APPLIED',rootManifestZip:'UNCHANGED',Ready:false};
  write('eval.json',result); assert.deepEqual(pin(corePin.path),corePin); console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
