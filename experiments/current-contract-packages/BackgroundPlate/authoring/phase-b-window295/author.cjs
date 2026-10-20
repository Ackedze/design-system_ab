const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const O=__dirname,A=path.join(O,'../phase-a-window294'),B=path.join(O,'../blend-mode-2026-10-16');
const W='/Users/alexkukhta/Desktop/workplace',C=path.join(W,'projects/Apollo-v3/packages/component-contract-core');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(n,d)=>fs.writeFileSync(path.join(O,n),JSON.stringify(d)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
assert(!fs.existsSync(path.join(O,'SEAL.json')),'Closed outputs are immutable');
assert.equal(read(path.join(O,'VALIDATION.json')).status,'PASS_ALL_CONFIGURED_GATES');
const core=require(path.join(C,'dist/core.cjs')),manual=read(path.join(A,'contract.manual.json')),evidence=read(path.join(A,'variant-evidence.json'));
const prior=structuredClone(manual),newRules=read(path.join(B,'contract.manual.json')).rules.filter(r=>r.id.includes('.blend-mode-is-fixed.'));
assert.equal(newRules.length,2);
const oldIndex=manual.rules.findIndex(r=>r.id==='component:web-corp.background-plate.blend-mode-is-fixed');assert(oldIndex>=0);
manual.rules.splice(oldIndex,1,...newRules);manual.metadata.revision=6;manual.metadata.updatedAt=new Date().toISOString();
manual.decisions.push({id:'phase-b295-blend-mode-implementation',status:'accepted',summary:'Shared core0.1.18 captures and compares blend mode to the independent effective baseline.',rationale:'Source/build configured gates passed. This implementation state does not approve Draft rules, native behaviour, release or generation admission.',sourceRefs:[path.join(O,'VALIDATION.json')]});
for(const doc of manual.documentation)if(doc.id==='passport-public-boundary')doc.path=path.join(O,'passport.json');
manual.documentation.push({id:'phase-b295-source-provenance',kind:'source-provenance',path:path.join(O,'source-provenance.json'),status:'verified',projection:'source'});
write('passport.json',read(path.join(A,'passport.json')));write('variant-evidence.json',evidence);
const provenance={status:'PRIVATE_R6_SHARED_SOURCE_BUILD_VERIFIED_NOT_RELEASED',core:pin(path.join(C,'dist/core.cjs')),priorR5:pin(path.join(A,'contract.manual.json')),sourceEdits:[...read(path.join(O,'APPLIED.json')).outputs,...read(path.join(O,'EXTENSION-APPLIED.json')).outputs],validation:pin(path.join(O,'VALIDATION.json')),rawNativeSourceHash:manual.source.sourceHash,nativeEvidence:'HISTORICAL_R2_BINDINGS_UNCHANGED; NOT_FRESH_R6_NATIVE',rootPublication:'NOT_DONE'};
for(const p of provenance.sourceEdits)assert.deepEqual(pin(p.path),p);
write('source-provenance.json',provenance);
const bundle=core.buildExportBundle(manual,evidence,[]);if(!bundle.validation.valid){write('AUTHORING-FIRST-FAILURE.json',bundle.validation);throw Error(JSON.stringify(bundle.validation.issues));}
assert.equal(bundle.compiled.rules.length,25);assert.equal(bundle.compiled.nonExecutableRules.length,1);
const semantic=rules=>JSON.parse(JSON.stringify(rules)).map(({revision,source,...r})=>({...r,source:{path:source.path,anchor:source.anchor}}));
const oldIds=new Set(read(path.join(A,'component-contract.v2.json')).rules.map(r=>r.ruleId));
assert.deepEqual(semantic(bundle.compiled.rules.filter(r=>oldIds.has(r.ruleId))),semantic(read(path.join(A,'component-contract.v2.json')).rules));
assert.deepEqual(manual.targets,prior.targets);assert.deepEqual(manual.controlPorts,prior.controlPorts);assert.deepEqual(manual.representations,prior.representations);
write('contract.manual.json',manual);write('component-contract.v2.json',bundle.compiled);
const coverage=read(path.join(A,'coverage-map.json')),blend=read(path.join(B,'coverage-map.json')).rules.find(r=>r.sourceRuleId.endsWith('.blend-mode-is-fixed'));
for(const row of coverage.rules){row.nativeStatus='HISTORICAL_R2_ONLY_NOT_FRESH_R6';if(row.sourceRuleId===blend.sourceRuleId){row.manualRuleIds=blend.manualRuleIds;row.compiledRuleIds=blend.compiledRuleIds;row.runtimeStatus='SHARED_CORE_0.1.18_CONFIGURED_GATES_PASS_NATIVE_PENDING';}}
write('coverage-map.json',coverage);
(async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(A,'BackgroundPlate.r5.phase-a.candidate.component-contract.zip')));
 const sources=entries.filter(e=>e.name.includes('/source/')).map(e=>({name:path.basename(e.name),text:core.zipEntryText(e)}));
 for(const n of ['source-provenance.json','coverage-map.json','passport.json']){const s=sources.find(s=>s.name===n);assert(s);s.text=fs.readFileSync(path.join(O,n),'utf8');}
 const zip=core.buildAuthoringZip(bundle,sources),zipPath=path.join(O,'BackgroundPlate.r6.phase-b.candidate.component-contract.zip');fs.writeFileSync(zipPath,zip);
 const roundtrip=await core.readZip(zip),reopened=core.importWorkspace(roundtrip.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),manual.component.componentId);
 assert.deepEqual(reopened.manual,manual);assert.deepEqual(reopened.variantEvidence,evidence);
 assert.deepEqual(JSON.parse(JSON.stringify(core.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled)),JSON.parse(JSON.stringify(bundle.compiled)));
 write('authoring-check.json',{status:'PASS_PRIVATE_R6_COMPILE_EXPORT_REOPEN',revision:6,manualRecords:manual.rules.length,IR:25,nonExecutable:1,old23IR:'UNCHANGED',zip:pin(zipPath),manualSourceHash:bundle.compiled.package.manualSourceHash,native:'NOT_RUN_USER_ONLY_R6',rootPublication:'NOT_DONE',Ready:false});
 console.log(JSON.stringify({status:'PRIVATE_R6_PASS',IR:25,nonExecutable:1,zip:pin(zipPath)}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
