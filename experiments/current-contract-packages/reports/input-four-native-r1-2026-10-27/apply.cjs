const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const R = __dirname, A = path.resolve(R, '../../../..'), W = path.resolve(A, '../..');
const core = require(W + '/.local/apollo-main/packages/component-contract-core/dist/core.cjs');
const read = p => JSON.parse(fs.readFileSync(p)), write = (p,v) => { fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'); };
const pin = p => { const b=fs.readFileSync(p); return {path:path.relative(A,p),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}; };
const window = read(W + '/.local/apollo-general-coordination-2026-10-25/input-four-native-bindings-window-2026-10-27.json');
assert.equal(window.status,'SINGLE_WRITER_DATA_ONLY_NATIVE_BINDING_REPAIR');
for (const p of [...window.inputPins,...window.componentBeforePins,...window.sharedRegistryBeforePins]) {
  assert.equal(pin(p.path).sha256,p.sha256,'Preimage drift: '+p.path);
}
const proof = read(R+'/INSTALLED-MAIN-REPLAY.json'); assert.equal(proof.matchedCases,25); assert.equal(proof.uncertain,0);
assert.equal(pin(proof.installedMain.path).sha256,proof.installedMain.sha256);
const ip = A+'/JSONS/indexes/component-contracts.index.json', mp = A+'/experiments/current-contract-packages/manifest.json';
const index = read(ip), manifest = read(mp); write(R+'/BEFORE.json',{index,manifest});
const originalIndex = structuredClone(index), originalManifest = structuredClone(manifest), rows = [];
const sourceNames=['contract.generated.json','contract.overrides.json','rules.json','composition-contract.json','agent-context.json','examples.json','audit-mapping.json'];
(async()=>{
  for (const name of ['Input','NumberInput','AmountInput','Select']) {
    const d = A+'/JSONS/web/components/web-core/core/'+name, m = read(R+'/'+name+'/candidate-manual.json');
    const previous = read(d+'/contract.manual.json'), facts = read(d+'/variant-evidence.json'), b = core.buildExportBundle(m,facts,[]);
    assert(b.validation.valid); assert.equal(m.metadata.revision,2);
    const exact = proof.packages.find(p => p.name===name); assert.equal(core.stableHash(b.compiled),exact.compiledHash);
    for (const old of previous.rules) {
      const next = structuredClone(m.rules.find(r=>r.id===old.id)); assert(next);
      if (next.id.endsWith('.layer-properties-use-effective-baseline')) { assert.equal(next.boundaryPolicy,'component-owned@1'); delete next.boundaryPolicy; }
      assert.deepEqual(next,old,'Norm changed: '+old.id);
    }
    const files = sourceNames.map(n=>({name:n,text:fs.readFileSync(d+'/'+n,'utf8')}));
    let zip = core.buildAuthoringZip(b,[...files,{name:'contract.manual.json',text:JSON.stringify(m)+'\n'},
      {name:'contract.compiled.json',text:JSON.stringify(b.compiled)+'\n'}]);
    zip = core.createZip((await core.readZip(zip)).map(e=>e.name==='contract.manual.json'
      ? {...e,data:new TextEncoder().encode(JSON.stringify(m)+'\n')} : e));
    const reopened = core.importWorkspace((await core.readZip(zip)).filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),m.component.contractId);
    assert.deepEqual(reopened.manual,m); assert.deepEqual(reopened.variantEvidence,facts);
    assert.equal(core.stableHash(core.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled),exact.compiledHash);
    const archivePath = d+'/packages/'+name+'.r2.draft.component-contract.zip'; assert(!fs.existsSync(archivePath)); fs.writeFileSync(archivePath,zip);
    fs.writeFileSync(d+'/contract.manual.json',JSON.stringify(m)+'\n');
    const archive = pin(archivePath), manual = pin(d+'/contract.manual.json'), fp = pin(d+'/variant-evidence.json');
    const entry = index.entries.find(e=>e.componentId===m.component.componentId); assert.equal(entry.revision,1);
    Object.assign(entry,{revision:2,archiveSha256:archive.sha256,manualSourceHash:b.compiled.package.manualSourceHash,compiledHash:exact.compiledHash,
      sourceExportVersion:b.compiled.package.sourceExportVersion,manual,facts:fp});
    const pkg = manifest.packages.find(e=>e.componentId===m.component.componentId); assert.equal(pkg.revision,1);
    const report = d+'/reports/draft-r2-2026-10-27'; fs.mkdirSync(report,{recursive:true});
    Object.assign(pkg,{revision:2,file:archive.path,status:'draft',statusScope:'Draft r2: exact installed-main replay of 25 retained captures; fresh native run pending.',
      sourceRules:m.rules.length,ruleIR:b.compiled.rules.length,nonExecutableRules:b.compiled.nonExecutableRules.length,ruleStatuses:{draft:m.rules.length},
      zipSha256:archive.sha256,bytes:archive.bytes,manualSourceHash:b.compiled.package.manualSourceHash,manualEntrySha256:manual.sha256,
      compiledHash:exact.compiledHash,currentEvidence:'../../'+path.relative(A,report+'/eval.json')});
    const evalReport={schemaVersion:'apollo.contract-authoring-eval.v1',runId:'input-four-native-r1-2026-10-27',caseId:m.component.componentId,
      skill:{version:'0.1.9',priorSnapshot:'../../../../../../../experiments/current-contract-packages/reports/input-four-drafts-2026-10-26/skill-snapshot'},
      review:{author:'Contract Creation',independent:false},overall:'PARTIAL',evidenceKind:'user-native-r1-failure-and-installed-main-retained-capture-r2-replay',
      firstFailure:path.relative(A,R+'/native-eval.json'),replay:path.relative(A,R+'/INSTALLED-MAIN-REPLAY.json'),
      nativeFreshR2:'NOT_RUN_USER_ONLY',ready:false,runtimeChanged:false,normsChanged:false,roundtrip:'PASS',
      cases:proof.cases.filter(c=>c.component===name),controls:proof.controls.filter(c=>c.id.startsWith(name+'-')),
      areaNotChecked:proof.areaNotChecked,changes:['exact per-variant target bindings where occurrence addressing is required','typed owned SLOT declarations and component-owned baseline boundary']};
    write(report+'/eval.json',evalReport); write(report+'/validation.json',b.validation);
    const oldCoverage=read(d+'/reports/draft-r1-2026-10-26/coverage-map.json');
    oldCoverage.revision=2;oldCoverage.technicalBindingRepair=path.relative(A,R+'/INSTALLED-MAIN-REPLAY.json');
    for(const row of oldCoverage.entries) row.compiledRuleIds=b.compiled.rules.filter(r=>row.manualRuleIds.includes(r.source?.anchor)).map(r=>r.ruleId);
    write(report+'/coverage-map.json',oldCoverage);
    const cases=read(d+'/reports/draft-r1-2026-10-26/test-cases.json');cases.status='REPLAY_PASS_FRESH_NATIVE_PENDING';
    for(const c of cases.cases)c.status='REPLAY_PASS_FRESH_NATIVE_PENDING';write(report+'/test-cases.json',cases);
    const summary={name,componentId:m.component.componentId,revision:2,status:'draft',manualRules:m.rules.length,ruleIR:b.compiled.rules.length,
      nonExecutableRules:b.compiled.nonExecutableRules.length,manualSourceHash:b.compiled.package.manualSourceHash,compiledHash:exact.compiledHash,
      archive,roundtrip:'PASS',freshNativeR2:'NOT_RUN_USER_ONLY',unchangedNorms:previous.rules.length};
    write(report+'/summary.json',summary);fs.writeFileSync(report+'/README.md','# '+name+' r2 — Draft\n\nИсправлены технические привязки и границы Slot. Нормы r1 сохранены.\n\n[Проверка и общие результаты](../../../../../../../experiments/current-contract-packages/reports/input-four-native-r1-2026-10-27/README.md)\n');
    rows.push({name,componentId:m.component.componentId,manual,facts:fp,archive,report:path.relative(A,report),rules:m.rules.length,IR:b.compiled.rules.length,roundtrip:'PASS'});
  }
  assert.equal(index.entries.length,35);assert.equal(manifest.packages.length,35);
  const touched=new Set(rows.map(r=>r.componentId));
  assert.deepEqual(index.entries.filter(e=>!touched.has(e.componentId)),originalIndex.entries.filter(e=>!touched.has(e.componentId)));
  assert.deepEqual(index.dependencySources,originalIndex.dependencySources);
  assert.deepEqual(manifest.packages.filter(e=>!touched.has(e.componentId)),originalManifest.packages.filter(e=>!touched.has(e.componentId)));
  write(ip,index);manifest.authoringIndex={file:'../../JSONS/indexes/component-contracts.index.json',sha256:pin(ip).sha256,bytes:pin(ip).bytes};manifest.updatedAt=new Date().toISOString();write(mp,manifest);
  write(R+'/APPLIED.json',{status:'APPLIED_DATA_ONLY',rows,otherPackagesPreserved:31,factsUnchanged:true,normsUnchanged:true,installed:false,pushed:false});
  console.log(JSON.stringify({updated:rows.map(r=>r.name),otherPackagesPreserved:31}));
})().catch(e=>{console.error(e);process.exitCode=1;});
