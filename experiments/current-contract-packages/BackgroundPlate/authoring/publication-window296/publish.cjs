const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const O=__dirname,W='/Users/alexkukhta/Desktop/workplace',P=path.resolve(O,'../../..');
const gp=path.join(W,'.local/apollo-general-2026-10-16/backgroundplate-publication296/ROOT-PUBLICATION-GRANT.json');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const check=p=>assert.deepEqual(pin(p.path),p);
const write=(n,d)=>fs.writeFileSync(path.join(O,n),JSON.stringify(d)+'\n');
assert(!fs.existsSync(path.join(O,'ROOT-APPLIED.json'))&&!fs.existsSync(path.join(O,'SEAL.json')),'Run once in an open root');
assert.deepEqual(pin(gp),{path:gp,sha256:'f13376a839417f98b1e14d3210a79e6c389b90df04ea1b4c10c497a7992fd94c',bytes:8342});
const g=read(gp);assert.equal(g.authoringOutputRoot,O);
for(const k of ['phaseBAcceptance','coordinationAck','baseline','currentManifest','currentDraftManifest','oldRoot','privateR6'])check(g[k]);
for(const p of Object.values(g.frozenSourceBuild).filter(v=>v?.path))check(p);
const frozen=read(g.frozenSourceBuild.seal.path);
for(const p of frozen.files.concat(frozen.sourceOutputs,frozen.completeBuildOutputs))check(p);
const baseline=read(g.baseline.path);for(const p of baseline.packages)check(p.pin);
const resume=fs.existsSync(path.join(O,'FIRST-ROOT-FAILURE.json'));
const physicalBefore=resume?read(path.join(O,'PREFLIGHT.json')).physicalRootBefore:fs.readdirSync(P).filter(n=>n.endsWith('.zip')).sort().map(n=>pin(path.join(P,n)));
const before=[read(g.currentManifest.path),read(g.currentDraftManifest.path)];
assert.equal(before[0].packages.length,14);assert.equal(before[1].packages.length,7);
let history;
if(resume){
 history=read(path.join(O,'PREFLIGHT.json')).history;for(const h of history)check(h.to);
 assert.deepEqual(read(path.join(g.historyRoot,'inventory.json')).files,history);
 for(const p of physicalBefore)check(p);
}else{
 assert(!fs.existsSync(g.newRootPath)&&!fs.existsSync(g.historyRoot),'New publication/history paths must be absent');
 fs.mkdirSync(g.historyRoot,{recursive:true});history=[];
 for(const p of [g.oldRoot,g.currentManifest,g.currentDraftManifest]){const dest=path.join(g.historyRoot,path.basename(p.path));fs.copyFileSync(p.path,dest);assert.equal(pin(dest).sha256,p.sha256);assert.equal(pin(dest).bytes,p.bytes);history.push({from:p,to:pin(dest)});}
 fs.writeFileSync(path.join(g.historyRoot,'inventory.json'),JSON.stringify({status:'BYTE_EXACT_PRE_R6_BACKUP',files:history},null,2)+'\n');
 write('PREFLIGHT.json',{status:'PASS_ROOT_PUBLICATION296_PREFLIGHT',grant:pin(gp),physicalRootBefore:physicalBefore,baseline:g.baseline,frozenSourceBuild:g.frozenSourceBuild,history});
 fs.copyFileSync(g.privateR6.path,g.newRootPath);
}
assert.equal(pin(g.newRootPath).sha256,g.privateR6.sha256);assert.equal(pin(g.newRootPath).bytes,g.privateR6.bytes);
(async()=>{
 const core=require(path.join(W,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
 assert.equal(read(path.join(W,'projects/Apollo-v3/packages/component-contract-core/package.json')).version,'0.1.18');
 const entries=await core.readZip(fs.readFileSync(g.newRootPath)),json=entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)}));
 const reopened=core.importWorkspace(json,'web-corp.background-plate'),bundle=core.buildExportBundle(reopened.manual,reopened.variantEvidence,[]);
 assert(bundle.validation.valid);assert.equal(reopened.manual.metadata.revision,6);assert.equal(bundle.compiled.rules.length,25);assert.equal(bundle.compiled.nonExecutableRules.length,1);
 const stored=entries.find(e=>e.name==='compiled/component-contract.v2.json');assert(stored);
 assert.deepEqual(JSON.parse(JSON.stringify(bundle.compiled)),JSON.parse(core.zipEntryText(stored)));
 const manualEntry=entries.find(e=>e.name==='contract.manual.json');assert(manualEntry);
 const statuses={};for(const r of reopened.manual.rules)statuses[r.status]=(statuses[r.status]||0)+1;
 assert.deepEqual(statuses,{draft:31});assert.equal(reopened.manual.representations.length,6);
 const rel='BackgroundPlate/authoring/publication-window296',zip=pin(g.newRootPath);
 const updates={revision:6,file:path.basename(g.newRootPath),status:'draft',statusScope:'Draft r6:19 canonical norms;31 manual records;25 IR/1 contextual warning. Core353/Editor852/configuredApollo1084 PASS. Native R6 and code mapping not accepted.',sourceRules:31,canonicalSourceRules:19,ruleIR:25,nonExecutableRules:1,ruleStatuses:statuses,zipSha256:zip.sha256,bytes:zip.bytes,manualSourceHash:bundle.compiled.package.manualSourceHash,manualEntrySha256:crypto.createHash('sha256').update(core.zipEntryText(manualEntry)).digest('hex'),compiledHash:core.stableHash(bundle.compiled),representations:reopened.manual.representations.map(({id,kind,platform,status})=>({id,kind,platform,status})),currentEvidence:rel+'/eval.json',sourceBuildEvidence:'BackgroundPlate/authoring/phase-b-window295/FINAL-HANDOFF.json',publicationEvidence:rel+'/FINAL-HANDOFF.json',wholeReady:false,fullAcceptance:false,productionPublication:false,authoringRoot:'BackgroundPlate/authoring/phase-b-window295',testPlan:rel+'/NATIVE-EDITOR-TEST-PLAN.ru.md',freshNative:'NOT_RUN_USER_ONLY_R6',codeMapping:'NOT_VERIFIED'};
 const now=new Date().toISOString();
 for(let i=0;i<before.length;i++){
  const manifest=structuredClone(before[i]),rows=manifest.packages.filter(r=>r.componentId==='web-corp.background-plate');assert.equal(rows.length,1);Object.assign(rows[0],updates);manifest.updatedAt=now;
  assert.deepEqual(manifest.packages.filter(r=>r.componentId!=='web-corp.background-plate'),before[i].packages.filter(r=>r.componentId!=='web-corp.background-plate'));
  const file=i?g.currentDraftManifest.path:g.currentManifest.path,temp=file+'.publication296.tmp';fs.writeFileSync(temp,JSON.stringify(manifest,null,2)+'\n');fs.renameSync(temp,file);assert.deepEqual(read(file),manifest);
 }
 for(const h of history)check(h.to);check(g.oldRoot);assert.equal(pin(g.newRootPath).sha256,g.privateR6.sha256);
 for(const p of baseline.packages.filter(p=>p.componentId!=='web-corp.background-plate'))check(p.pin);
 fs.unlinkSync(g.oldRoot.path);
 const physicalAfter=fs.readdirSync(P).filter(n=>n.endsWith('.zip')).sort().map(n=>pin(path.join(P,n)));
 assert.deepEqual(physicalAfter.map(p=>p.path).sort(),physicalBefore.filter(p=>p.path!==g.oldRoot.path).map(p=>p.path).concat(g.newRootPath).sort());
 for(const p of physicalBefore.filter(p=>p.path!==g.oldRoot.path))check(p);
 for(const p of frozen.sourceOutputs.concat(frozen.completeBuildOutputs))check(p);
 write('ROOT-APPLIED.json',{status:'PASS_ROOT_R6_DRAFT_PUBLICATION',grant:pin(gp),rootPackage:pin(g.newRootPath),manifests:[pin(g.currentManifest.path),pin(g.currentDraftManifest.path)],history,historyInventory:pin(path.join(g.historyRoot,'inventory.json')),oldRootRemoved:true,physicalRootAfter:physicalAfter,declaredPackages:14,otherDeclaredPackagesUnchanged:13,otherDraftRowsUnchanged:6,unlistedExistingRootZIPs:physicalAfter.filter(p=>!read(g.currentManifest.path).packages.some(r=>r.file===path.basename(p.path))),actualRootLastWriteAt: new Date().toISOString(),row:updates,roundtrip:'PASS',Ready:false});
 console.log(JSON.stringify({status:'ROOT_R6_DRAFT_PUBLISHED',zip:pin(g.newRootPath),manifestPackages:14,physicalRootZIPs:physicalAfter.length,oldR1:'BYTE_EXACT_HISTORY'}));
})().catch(e=>{if(!fs.existsSync(path.join(O,'FIRST-ROOT-FAILURE.json')))write('FIRST-ROOT-FAILURE.json',{message:e.message,stack:e.stack});console.error(e.stack);process.exitCode=1;});
