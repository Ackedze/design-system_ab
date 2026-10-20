const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,pin,guard,grant}=require('./guard.cjs');
const before=guard('before-final-private312-handoff'),candidate=root+'/workspace/candidate/';
const history={
 'BUILD-candidate.json':'candidate01','BUILD-candidate-02.json':'candidate02','BUILD-candidate-03.json':'candidate02','BUILD-candidate-04.json':'candidate04',
 'BUILD-CORE-REGRESSION.json':'candidate01','BUILD-CORE-REGRESSION-02.json':'candidate02','BUILD-CORE-REGRESSION-03.json':'candidate04',
};
const buildReadback=[];
for(const name of fs.readdirSync(root).filter(n=>/^BUILD-.*\.json$/.test(n)).sort()){
 const d=JSON.parse(fs.readFileSync(root+'/'+name)),jobs=d.metafiles||d.jobs;
 for(const job of jobs){
  for(const p of [...job.closure,job.output]){
   const actual=history[name]&&p.path.startsWith(candidate)?root+'/workspace/build-attempts/'+history[name]+'/'+p.path.slice(candidate.length):p.path;
   const observed=pin(actual);assert.equal(observed.sha256,p.sha256,actual);assert.equal(observed.bytes,p.bytes,actual);
  }
 }
 if(d.html){const actual=history[name]?root+'/workspace/build-attempts/'+history[name]+'/'+d.html.path.slice(candidate.length):d.html.path;const observed=pin(actual);assert.equal(observed.sha256,d.html.sha256);assert.equal(observed.bytes,d.html.bytes);}
 buildReadback.push({receipt:pin(root+'/'+name),historicalSnapshot:history[name]||null,jobs:jobs.length});
}
const delta=JSON.parse(fs.readFileSync(root+'/SOURCE-DELTA.json'));assert.equal(delta.files.length,19);
for(const p of delta.files){assert.deepEqual(pin(p.candidate.path),p.candidate);if(p.before)assert.deepEqual(pin(p.path),p.before);else assert.equal(fs.existsSync(p.path),false);}
const changed=new Set(delta.files.map(x=>x.relative));
for(const p of JSON.parse(fs.readFileSync(root+'/MATERIALIZATION.json')).files)if(!changed.has(p.relative)){
 const observed=pin(candidate+p.relative);assert.equal(observed.sha256,p.input.sha256);assert.equal(observed.bytes,p.input.bytes);
}
const E=candidate+'projects/ComponentContractEditor',C=candidate+'projects/Apollo-v3/packages/component-contract-core';
assert.equal(JSON.parse(fs.readFileSync(C+'/package.json')).version,'0.1.19');
assert.equal(JSON.parse(fs.readFileSync(E+'/package.json')).version,'0.2.106');
const lock=JSON.parse(fs.readFileSync(E+'/package-lock.json'));assert.equal(lock.version,'0.2.106');assert.equal(lock.packages[''].version,'0.2.106');
assert.match(fs.readFileSync(E+'/src/version.ts','utf8'),/@0\.2\.106/);assert.match(fs.readFileSync(E+'/src/ui.html','utf8'),/v0\.2\.106/);
assert.equal(JSON.parse(fs.readFileSync(root+'/RELEASE-PREPARATION.json')).versions.editor,'0.2.106');
const final=JSON.parse(fs.readFileSync(root+'/FINAL-CHECKS-02.json'));assert.equal(final.checks.length,7);assert.ok(final.checks.every(x=>x.status==='PASS'));
const regression=JSON.parse(fs.readFileSync(root+'/REGRESSION-04.json'));assert.equal(regression.passed,35);assert.equal(regression.failed,0);
const portable=JSON.parse(fs.readFileSync(root+'/workspace/portable-ui-02/UI-ADMISSION-candidate-01.json'));assert.equal(portable.checks.length,8);assert.ok(portable.checks.every(x=>x.status==='PASS'));
const oldUI=JSON.parse(fs.readFileSync(root+'/UI-ADMISSION-baseline.json'));assert.equal(oldUI.outcomes[0].status,'REPRODUCED_UNSAFE_BASELINE');
const Eold=JSON.parse(fs.readFileSync(root+'/TEST-REVISION-BASELINE.json'));const oldScript=pin(Eold.preservedAt);assert.equal(oldScript.sha256,Eold.original.sha256);
const after=guard('after-final-private312-handoff');
const closure={before,after,buildReadback,delta:pin(root+'/SOURCE-DELTA.json'),patch:pin(root+'/candidate.patch'),finalChecks:pin(root+'/FINAL-CHECKS-02.json'),sharedWrites:0,Ready:false};
fs.writeFileSync(root+'/CLOSURE-READBACK.json',JSON.stringify(closure,null,2)+'\n',{flag:'wx'});
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 if(['tmp','browser-cache'].includes(e.name))return [];
 const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Unexpected symlink in final owned output: '+p);
 return e.isDirectory()?walk(p):[p];
});}
const files=walk(root).filter(p=>!['INVENTORY.json','HANDOFF.json','SEAL.json'].includes(path.basename(p))).sort().map(pin);
fs.writeFileSync(root+'/INVENTORY.json',JSON.stringify({status:'CLOSED_PRIVATE312_INVENTORY',files,excluded:'Transient browser cache/tmp only; retained reports, downloads, source and build snapshots are pinned'})+'\n',{flag:'wx'});
const handoff={status:'CLOSED_PRIVATE_UPDATED_EDITOR_ADOPTION_BOUNDARY',writesClosed:true,writerThreadId:'01a0f77a-11c9-7c10-bd21-e3e5d100feae',
 grant:pin(W+'/.local/apollo-general-2026-10-18/benefitcard-private-admission312/GRANT.json'),currentRuntimeDescriptor:grant.currentRuntimeDescriptor,
 freshCatalog:grant.freshCatalog,inventory:pin(root+'/INVENTORY.json'),closure:pin(root+'/CLOSURE-READBACK.json'),patch:pin(root+'/candidate.patch'),sourceDelta:pin(root+'/SOURCE-DELTA.json'),
 versions:{core:'0.1.19',editor:'0.2.106'},checks:{actualUIController:8,portableNode:25,privateCompatibility:35,typecheck:'PASS',legacyImport:'exact controlled clock',legacyBenefitCardHashes:2},
 oldAuthoring:'DID_NOT_REFUSE is preserved; frozen old binaries are not repaired. No universal old-authoring refusal claim.',
 adoptionBoundary:'Accept and install the exact reviewed Editor 0.2.106 UI/core pair with Core 0.1.19 before using scoped authoring packages. Single-core replacement is insufficient.',
 notes:pin(root+'/REVIEW-NOTES.json'),processNote:pin(root+'/PROCESS-NOTE.json'),stageBProposal:pin(root+'/STAGE-B-PROPOSAL.json'),stageBAuthority:'NOT_GRANTED',
 currentSharedAcceptance:'NOT_CLAIMED; current310 inputs stayed exact, but candidate is private and uninstalled',
 fullRepositoryValidate:'NOT_RUN in private bounded scope; Core/Editor full validate and V4/consumer verification are required in coordinated shared stages',
 sourceIntake:'Accepted fresh Athena input; no owner re-upload/update action is needed',
 next:'General independent private review, then a separate exact shared source/build writer window. BenefitCard package refresh and current native tests follow reader adoption.',
 sharedSourceWrites:0,sharedBuilds:0,contractZipWrites:0,manifestHubSheetsWrites:0,proxyChanges:0,nativeModelCalls:0,generationPilotExpanded:false,Ready:false};
fs.writeFileSync(root+'/HANDOFF.json',JSON.stringify(handoff,null,2)+'\n',{flag:'wx'});
const seal={status:'CLOSED',writesClosed:true,at:new Date().toISOString(),handoff:pin(root+'/HANDOFF.json'),inventory:pin(root+'/INVENTORY.json'),scope:'Private authoring-admission candidate only; no shared apply/adoption authority',Ready:false};
fs.writeFileSync(root+'/SEAL.json',JSON.stringify(seal,null,2)+'\n',{flag:'wx'});
for(const p of files)assert.deepEqual(pin(p.path),p);assert.deepEqual(pin(handoff.inventory.path),handoff.inventory);assert.deepEqual(pin(seal.handoff.path),seal.handoff);
console.log(JSON.stringify({status:handoff.status,files:files.length,patchFiles:delta.files.length,handoff:pin(root+'/HANDOFF.json'),seal:pin(root+'/SEAL.json'),stageBProposal:handoff.stageBProposal,sharedWrites:0,Ready:false}));
