const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const workspace=path.resolve(__dirname,'../../../../../../../..'),packages=path.join(workspace,'shared/design-system_ab/experiments/current-contract-packages');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p)),wire=v=>JSON.parse(JSON.stringify(v));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
(async()=>{
 assert(!fs.existsSync(path.join(__dirname,'seal.json')),'Closed writer');
 const authoring=path.join(packages,'Link/authoring'),oldManual=read(path.join(__dirname,'before/manual.json'));
 const manual=read(path.join(__dirname,'candidate/manual.json')),evidence=read(path.join(__dirname,'candidate/variant-evidence.json'));
 assert.deepEqual(read(path.join(authoring,'contract.manual.json')),oldManual);
 assert.deepEqual(manual.rules,oldManual.rules);assert.deepEqual(manual.semanticApi,oldManual.semanticApi);
 const oldBytes=fs.readFileSync(path.join(packages,'Link.component-contract.zip'));
 assert.equal(sha(oldBytes),'5bf00497bd8236ba283c0be8b1c8e1135b05c007efdf15d04812ae1c0bc01a02');
 const bundle=core.buildExportBundle(manual,evidence);assert(bundle.validation.valid);
 assert.deepEqual(wire(bundle.compiled),read(path.join(__dirname,'candidate/compiled.json')));
 for(const name of ['manifest.json','draft-manifest.json']) {
  const m=read(path.join(packages,name)),entry=m.packages.find(p=>p.componentId==='core.web.link');
  assert(entry&&entry.revision===3&&entry.zipSha256===sha(oldBytes)&&entry.publicIconReview);
 }
 const files=await core.readZip(oldBytes),replacements={
  'contract.manual.json':manual,'compiled/component-contract.v2.json':bundle.compiled,
  'coverage.json':bundle.coverage,'validation-report.json':bundle.validation};
 const newFiles=files.map(f=>({name:f.name,data:replacements[f.name]?new TextEncoder().encode(JSON.stringify(replacements[f.name])):f.data}));
 const zip=core.createZip(newFiles),reopened=core.importWorkspace((await core.readZip(zip)).filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)})),manual.component.contractId);
 assert.deepEqual(reopened.manual,manual);assert.deepEqual(reopened.variantEvidence,evidence);
 assert.deepEqual(wire(core.buildExportBundle(reopened.manual,reopened.variantEvidence).compiled),wire(bundle.compiled));
 for(const f of newFiles)if(!replacements[f.name])assert.equal(sha(f.data),sha(files.find(x=>x.name===f.name).data));
 const coverage=read(path.join(authoring,'coverage-map.r3.json'));
 coverage.revision=4;coverage.manualSourceHash=core.stableHash(manual);coverage.compiledHash=core.stableHash(bundle.compiled);
 for(const entry of coverage.entries)if(entry.nativeBindings){const t=manual.targets.find(t=>t.id===entry.semanticTarget);assert(t);entry.nativeBindings=wire(t.identityBindingsV1);}
 coverage.technicalChange={configurationVersion:2,normsUnchanged:true,readerFix:'EDITOR-DECLARED-TARGET-CONFIGURATION-001',receipt:'Link/reports/reading-fixes/public-instance-swap-2026-10-11/HANDOFF.json',freshNativeAcceptance:false};
 const matrix=read(path.join(authoring,'case-matrix.r3.json'));matrix.revision=4;matrix.manualSourceHash=core.stableHash(manual);
 matrix.technicalChange=wire(coverage.technicalChange);matrix.newReaderTests='TEST_CASES.r4.ru.md';
 const history=path.join(packages,'history/Link.r3.before-public-swap-fix.2026-10-11.component-contract.zip');
 assert(!fs.existsSync(history));fs.mkdirSync(path.dirname(history),{recursive:true});fs.writeFileSync(history,oldBytes);
 assert.equal(sha(fs.readFileSync(history)),sha(oldBytes));
 write(path.join(authoring,'contract.manual.json'),manual);write(path.join(authoring,'compiled/component-contract.v2.json'),bundle.compiled);
 write(path.join(authoring,'coverage-map.r4.json'),coverage);write(path.join(authoring,'coverage-map.json'),coverage);
 write(path.join(authoring,'case-matrix.r4.json'),matrix);write(path.join(authoring,'case-matrix.json'),matrix);
 const temporary=path.join(packages,'Link.component-contract.zip.tmp');fs.writeFileSync(temporary,zip);fs.renameSync(temporary,path.join(packages,'Link.component-contract.zip'));
 const checks={schemaVersion:'link.public-swap-package-checks.v1',revision:4,coreVersion:'0.1.17',editorVersion:'0.2.103',
  manualHash:core.stableHash(manual),compiledHash:core.stableHash(bundle.compiled),zipSha256:sha(zip),bytes:zip.length,
  zipRoundtrip:true,normsUnchanged:true,sourceEntriesByteIdentical:true,sourceRules:manual.rules.length,ruleIR:bundle.compiled.rules.length,
  validation:bundle.validation,history,wholeReady:false,freshNativeAcceptance:false};
 write(path.join(authoring,'reports/package-checks.r4.json'),checks);write(path.join(__dirname,'package-checks.json'),checks);
 for(const name of ['manifest.json','draft-manifest.json']){
  const file=path.join(packages,name),m=read(file),before=wire(m),entry=m.packages.find(p=>p.componentId==='core.web.link');
  assert(entry&&entry.revision===3&&entry.zipSha256===sha(oldBytes));
  entry.previousPackage={revision:3,file:path.relative(packages,history),zipSha256:sha(oldBytes)};
  Object.assign(entry,{revision:4,sharedAuthoringRevision:4,zipSha256:sha(zip),bytes:zip.length,manualSourceHash:checks.manualHash,
   manualEntrySha256:sha(newFiles.find(f=>f.name==='contract.manual.json').data),compiledHash:checks.compiledHash,
   sourceReadme:'experiments/current-contract-packages/Link/authoring/README.r4.md',coverageMap:'Link/authoring/coverage-map.r4.json',caseMatrix:'Link/authoring/case-matrix.r4.json',
   packageChecks:'Link/authoring/reports/package-checks.r4.json',coreVersion:'0.1.17',editorVersion:'0.2.103',
   readingFixReceipt:'Link/reports/reading-fixes/public-instance-swap-2026-10-11/HANDOFF.json',nextTestCases:'Link/authoring/TEST_CASES.r4.ru.md',
   statusScope:'Draft: public INSTANCE_SWAP reader fixed locally by explicit configuration policy v2; 27 exact historical replays, retained swap/RESET and guarded counterfactual checks pass. Fresh Editor 0.2.103 / r4 native cycle and independent acceptance remain open.',
   nativeLive:'R4_NOT_RUN_USER_ONLY; historical R3 scoped receipts retained, candidate R4 checked offline on the same retained captures.',
   blockingDefects:['EDITOR-DECLARED-TARGET-CONFIGURATION-001: public INSTANCE_SWAP code fix and local core/Editor/Apollo gates pass; fresh native cycle and independent technical acceptance pending.']});
  entry.publicIconReview.previousStatus=entry.publicIconReview.status;
  Object.assign(entry.publicIconReview,{status:'FIX_IMPLEMENTED_LOCAL_REPLAY_PASS_NATIVE_PENDING',fixImplemented:true,fixReceipt:entry.readingFixReceipt,
   candidateRevision:4,candidateResolvedTargets:[8,8],candidateInconclusive:[0,0],freshNativeAcceptance:false});
  entry.status='draft';entry.wholeReady=false;entry.fullAcceptance=false;entry.preparationAccepted=false;
  for(let i=0;i<m.packages.length;i++)if(m.packages[i].componentId!=='core.web.link')assert.deepEqual(m.packages[i],before.packages[i]);
  m.updatedAt=new Date().toISOString();write(path.join(__dirname,'before/'+name+'.publication-preimage.json'),before);write(file,m);
 }
 assert.deepEqual(read(path.join(authoring,'contract.manual.json')),manual);
 assert.equal(sha(fs.readFileSync(path.join(packages,'Link.component-contract.zip'))),sha(zip));
 console.log(JSON.stringify(checks));
})().catch(e=>{console.error(e);process.exitCode=1;});
