const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',R=__dirname,B=path.join(R,'../owner-scope-2026-10-16');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,data)=>fs.writeFileSync(path.join(R,name),JSON.stringify(data)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const grant=read(path.join(W,'.local/apollo-general-2026-10-16/backgroundplate-window294/SOURCE-WRITER-GRANT.json'));
const inputs=grant.targets.map(t=>{const p=pin(t.writePath);assert.equal(p.sha256,t.payload.sha256);assert.equal(p.bytes,t.payload.bytes);return p;});
const corePin=read(path.join(B,'eval.json')).core;assert.deepEqual(pin(corePin.path),corePin);const core=require(corePin.path);
const manual=read(path.join(B,'contract.manual.json')),evidence=read(path.join(B,'variant-evidence.json'));
manual.metadata.revision=5;manual.metadata.updatedAt=new Date().toISOString();
const superseded=manual.decisions.filter(d=>d.id.startsWith('owner-scope-2026-10-16-'));
for(const d of superseded)d.rationale='Решение владельца; нормативная синхронизация применена в phase A294. Реализация внешних reader-ов, native и release приёмка остаются отдельными.';
manual.decisions.push({id:'phase-a294-applied-normative-scope',status:'accepted',
  summary:'Решения владельца о границах норм применены к каноническим DS-файлам и принятому изолированному Hub checkout.',
  rationale:'Phase A: только нормы и паспорт. Core blendMode, root ZIP/manifest, native и release приёмка остаются отдельными.',
  sourceRefs:[path.join(R,'APPLIED.json'),...superseded.map(d=>d.id)]});
for(const doc of manual.documentation){
 if(doc.id==='hub'){doc.path=path.join(grant.acceptedHubCheckout,'products/ab/components/background-plate/instructions.md');doc.status='draft';}
 if(doc.id==='passport-public-boundary')doc.path=path.join(R,'passport.json');
}
const passport=read(path.join(B,'passport.json'));for(const ref of passport.policyRefs)ref.sharedStatus='TEXT_APPLIED_PHASE_A294_RUNTIME_SEPARATE';write('passport.json',passport);
manual.documentation.push({id:'phase-a294-source-provenance',kind:'source-provenance',path:path.join(R,'source-provenance.json'),status:'verified',projection:'source'});
const provenance={status:'PHASE_A_NORMATIVE_SOURCE_APPLIED_NOT_RELEASED',grant:pin(path.join(W,'.local/apollo-general-2026-10-16/backgroundplate-window294/SOURCE-WRITER-GRANT.json')),
  inputs,hubCheckout:grant.acceptedHubCheckout,core:corePin,priorR3:pin(path.join(B,'contract.manual.json')),
  rawNativeSourceHash:manual.source.sourceHash,nativeEvidence:'HISTORICAL_R2_BINDINGS_UNCHANGED; NOT_FRESH_R5_NATIVE',rootPublication:'NOT_DONE'};
write('source-provenance.json',provenance);
const bundle=core.buildExportBundle(manual,evidence,[]);if(!bundle.validation.valid){write('AUTHORING-FIRST-FAILURE.json',bundle.validation);throw new Error(JSON.stringify(bundle.validation.issues));}assert.equal(bundle.compiled.rules.length,23);assert.equal(bundle.compiled.nonExecutableRules.length,2);
const semantic=rules=>JSON.parse(JSON.stringify(rules)).map(({revision,source,...r})=>({...r,source:{path:source.path,anchor:source.anchor}}));
assert.deepEqual(semantic(bundle.compiled.rules),semantic(read(path.join(B,'component-contract.v2.json')).rules));
assert.deepEqual(manual.targets,read(path.join(B,'contract.manual.json')).targets);
write('contract.manual.json',manual);write('component-contract.v2.json',bundle.compiled);write('variant-evidence.json',evidence);
const coverage=read(path.join(B,'coverage-map.json'));
for(const row of coverage.rules){row.sharedSourceStatus='APPLIED_PHASE_A294';row.nativeStatus='HISTORICAL_R2_ONLY_NOT_FRESH_R5';}
write('coverage-map.json',coverage);
(async()=>{
 const oldEntries=await core.readZip(fs.readFileSync(path.join(B,'BackgroundPlate.r3.candidate.component-contract.zip')));
 const sources=oldEntries.filter(e=>e.name.includes('/source/')).map(e=>({name:path.basename(e.name),text:core.zipEntryText(e)}));
 const canonicalRules=path.join(W,'shared/design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json');
 const oldRules=sources.find(s=>s.name==='rules.json');assert(oldRules);oldRules.text=fs.readFileSync(canonicalRules,'utf8');
 for(const name of ['source-provenance.json','coverage-map.json','passport.json']){const s=sources.find(s=>s.name===name);if(s)s.text=fs.readFileSync(path.join(R,name),'utf8');else sources.push({name,text:fs.readFileSync(path.join(R,name),'utf8')});}
 const zip=core.buildAuthoringZip(bundle,sources),zipPath=path.join(R,'BackgroundPlate.r5.phase-a.candidate.component-contract.zip');fs.writeFileSync(zipPath,zip);
 const entries=await core.readZip(zip);const reopened=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),manual.component.componentId);
 assert.deepEqual(reopened.manual,manual);assert.deepEqual(reopened.variantEvidence,evidence);
 const again=core.buildExportBundle(reopened.manual,reopened.variantEvidence,[]);assert.deepEqual(JSON.parse(JSON.stringify(again.compiled)),JSON.parse(JSON.stringify(bundle.compiled)));
 assert.deepEqual(pin(corePin.path),corePin);for(const p of inputs)assert.deepEqual(pin(p.path),p);
 write('authoring-check.json',{status:'PASS_PRIVATE_R5_COMPILE_EXPORT_REOPEN',revision:5,manualRecords:30,IR:23,nonExecutable:2,
   zip:pin(zipPath),manualSourceHash:bundle.compiled.package.manualSourceHash,sourceProvenance:pin(path.join(R,'source-provenance.json')),
   actualSourceRules:19,old23IR:'UNCHANGED',native:'NOT_RUN_R5',rootPublication:'NOT_DONE',Ready:false});
 console.log(JSON.stringify({status:'R5_PHASE_A_PRIVATE_PASS',IR:23,nonExecutable:2,zip:pin(zipPath)}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
