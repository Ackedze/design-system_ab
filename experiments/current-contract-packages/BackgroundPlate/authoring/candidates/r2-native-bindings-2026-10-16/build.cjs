const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages'),B=path.join(P,'BackgroundPlate/authoring/candidates/r1-manual-2026-10-15'),C=path.join(P,'BackgroundPlate/authoring/candidates/r1-native-2026-10-16'),R=__dirname;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),copy=x=>JSON.parse(JSON.stringify(x)),write=(n,v)=>fs.writeFileSync(path.join(R,n),JSON.stringify(v)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const verify=p=>{const a=pin(p.path);assert.equal(a.sha256,p.sha256,p.path);assert.equal(a.bytes,p.bytes,p.path);};
const protectedInputs=read(path.join(W,'.local/apollo-general-2026-10-16/mcp-pilot276/BACKGROUNDPLATE-C-PROTECTED-INPUTS.json'));
const guard=()=>[protectedInputs.core271,protectedInputs.descriptor,...protectedInputs.runtimeInputs,...protectedInputs.rootPackages].forEach(verify);guard();
const c=require(protectedInputs.core271.path),oldManual=read(path.join(B,'contract.manual.json')),oldCompiled=read(path.join(B,'component-contract.v2.json')),evidence=read(path.join(B,'variant-evidence.json'));
const batches=[1,2,3,4,5,6].map(i=>read(path.join(C,`pristine-batch-${i}.json`))),first=read(path.join(C,'pristine-01.json'));
const captures=[{componentKey:first.componentKey,reference:first.reference},...batches.flatMap(b=>b.results)];assert.equal(captures.length,18);assert.equal(new Set(captures.map(a=>a.componentKey)).size,18);
const oldFixtures=read(path.join(B,'synthetic-fixtures.json')),manual=copy(oldManual),changed=[];
for(const a of captures){
 const prior=oldFixtures.fixtures.find(f=>f.snapshot.source.componentKey===a.componentKey).snapshot.variantReference;
 assert(a.reference.complete);assert.deepEqual(a.reference.nodes,prior.nodes);assert.deepEqual(a.reference.propertyTypes,prior.propertyTypes);assert.deepEqual(a.reference.properties,prior.properties);
 const portable=c.portableDeclaredTargetReferenceHash(a.reference),configuration=c.configurationDeclaredTargetReferenceHash(a.reference);
 const baseline=oldManual.targets[0].identityBindingsV1.find(b=>b.componentKey===a.componentKey);
 if(portable!==baseline.portableReferenceHash){
  assert.equal(a.reference.properties.Skeleton,'True');
  const expected=copy(prior);
  delete expected.nodeProperties.Skeleton.identity.componentSetKey;
  for(const p of ['Skeleton / SkeletonBody','Skeleton / SkeletonBody / Fixer']){
   assert.equal(expected.nodeProperties[p].sourceIdentity,undefined);const observed=a.reference.nodeProperties[p].sourceIdentity;
   assert(observed&&observed.ownerComponentKey===a.reference.nodeProperties.Skeleton.identity.componentKey);
   expected.nodeProperties[p].sourceIdentity=copy(observed);
  }
  assert.equal(c.portableDeclaredTargetReferenceHash(expected),portable,'Unexpected difference beyond independently captured Skeleton identities');
  for(const target of manual.targets)for(const b of target.identityBindingsV1||[])if(b.componentKey===a.componentKey){
   const before=copy(b);b.referenceHash=c.stableHash(a.reference);b.portableReferenceHash=portable;b.configurationReferenceHash=configuration;changed.push({targetId:target.id,before,after:copy(b)});
  }
 }
}
assert.equal(changed.length,4);manual.metadata.revision=2;manual.metadata.updatedAt=fs.existsSync(path.join(R,'contract.manual.json'))?read(path.join(R,'contract.manual.json')).metadata.updatedAt:new Date().toISOString();
assert.deepEqual(manual.rules,oldManual.rules);assert.deepEqual(manual.semanticApi,oldManual.semanticApi);assert.deepEqual(manual.representations,oldManual.representations);
const bundle=c.buildExportBundle(manual,evidence,[]);assert(bundle.validation.valid,JSON.stringify(bundle.validation.issues));assert.equal(bundle.compiled.rules.length,23);assert.equal(bundle.compiled.nonExecutableRules.length,14);
const semanticIR=r=>copy(r).map(({revision,source,...x})=>({...x,source:{path:source.path,anchor:source.anchor}}));assert.deepEqual(semanticIR(bundle.compiled.rules),semanticIR(oldCompiled.rules));
write('contract.manual.json',manual);write('component-contract.v2.json',bundle.compiled);write('variant-evidence.json',evidence);write('binding-delta.json',{status:'EVIDENCE_ONLY_BINDING_UPDATE',changed,canonicalNormsChanged:0,ruleRecordsChanged:0,guardChanges:0,firstFailure:pin(path.join(C,'FIRST-REFERENCE-DRIFT.json'))});
const requalification=captures.map(a=>({componentKey:a.componentKey,reference:c.stableHash(a.reference),bindings:manual.targets.flatMap(t=>(t.identityBindingsV1||[]).filter(b=>b.componentKey===a.componentKey).map(b=>{assert.equal(b.portableReferenceHash,c.portableDeclaredTargetReferenceHash(a.reference));assert.equal(b.configurationReferenceHash,c.configurationDeclaredTargetReferenceHash(a.reference));return {targetId:t.id,status:'PASS'};}))}));
write('pristine-requalification.json',{status:'PASS_ALL_18_SAVED_ACTUAL_CAPTURES',captures:requalification,scope:'Native pristine binding proof only; not Editor user validation or whole-contract acceptance.'});
const fixtures=copy(oldFixtures);fixtures.status='DEFINITION_DERIVED_FIXTURES_WITH_ACTUAL_PRISTINE_IDENTITIES_NOT_NATIVE_ACTUAL';
for(const f of fixtures.fixtures){const ref=captures.find(a=>a.componentKey===f.snapshot.source.componentKey).reference,paths=c.snapshotPaths(f.snapshot);for(const n of f.snapshot.nodes){const observed=ref.nodeProperties[paths.get(n.id)];assert(observed);if(observed.identity)n.component.identity=copy(observed.identity);if(observed.sourceIdentity)n.component.sourceIdentity=copy(observed.sourceIdentity);}f.snapshot.variantReference=copy(ref);assert.equal(c.stableHash(c.captureVariantReference(f.snapshot,ref.componentKey,ref.componentSetKey,ref.definedProperties)),c.stableHash(ref));}
write('synthetic-fixtures.json',fixtures);
fs.copyFileSync(path.join(B,'evaluate.cjs'),path.join(R,'evaluate.cjs'));
(async()=>{
 const oldZip=path.join(P,'BackgroundPlate.r1.candidate.component-contract.zip'),entries=await c.readZip(fs.readFileSync(oldZip));
 const carried=entries.filter(e=>e.name.includes('/source/')).map(e=>({name:path.basename(e.name),text:c.zipEntryText(e)}));assert.equal(carried.length,41);
 const fresh=['pristine-01.json',...batches.map((_,i)=>`pristine-batch-${i+1}.json`),'FIRST-REFERENCE-DRIFT.json'].map(n=>({name:'native-'+n,text:fs.readFileSync(path.join(C,n),'utf8')}));
 const zip=c.buildAuthoringZip(bundle,[...carried,...fresh,{name:'native-binding-delta-r2.json',text:JSON.stringify(read(path.join(R,'binding-delta.json')))}]);
 const zipPath=path.join(R,'BackgroundPlate.r2.candidate.component-contract.zip');fs.writeFileSync(zipPath,zip);
 const reopenedEntries=await c.readZip(zip),reopened=c.importWorkspace(reopenedEntries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:c.zipEntryText(e)})),manual.component.componentId);
 assert.deepEqual(reopened.manual,manual);assert.deepEqual(reopened.variantEvidence,evidence);assert.deepEqual(JSON.parse(JSON.stringify(c.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled)),JSON.parse(JSON.stringify(bundle.compiled)));
 for(const e of carried){const matches=reopenedEntries.filter(x=>x.name.endsWith('/source/'+e.name));assert.equal(matches.length,1);assert.equal(c.zipEntryText(matches[0]),e.text);}
 write('roundtrip.json',{status:'PASS',manualSourceHash:bundle.compiled.package.manualSourceHash,oldSourceFilesPreserved:carried.length,newNativeEvidenceFiles:fresh.length+1,norms:30,manualRecords:42,IR:23,contextRecords:14,revision:2,zip:pin(zipPath),wholeReady:false});
 guard();console.log(JSON.stringify({status:'R2_COMPILE_ROUNDTRIP_PASS',bindingsUpdated:changed.length,variantsQualified:requalification.length,manualSourceHash:bundle.compiled.package.manualSourceHash,zip:pin(zipPath)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
