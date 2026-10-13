const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages';
const editor=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const shared=require(P+'/Link/reports/reading-fixes/public-instance-swap-2026-10-11/runtime/core-after.cjs');
const wire=v=>JSON.parse(JSON.stringify(v)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const textFiles=z=>z.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:Buffer.from(f.data).toString()}));
(async()=>{
 const input=P+'/BenefitCard.r6.candidate.component-contract.zip';
 assert.equal(pin(input).sha256,'3d44e509bc50a68a512965388f7079818a0d5dc6984fa24d7bed73f85099ce27');
 const original=await editor.readZip(fs.readFileSync(input)),workspace=editor.importWorkspace(textFiles(original),'benefit-card.desktop');
 const manual=wire(workspace.manual);manual.metadata.revision=7;manual.metadata.updatedAt=new Date().toISOString();
 manual.editorDependencyUsages={version:1,bindings:[{id:'bottom-link',dependencyId:'link',bindingId:'bottom-link',childTargetId:'target.label',textProperty:'✎ Label#493:29'}]};
 const only=manual.rules.find(r=>r.id==='component:web.benefit-card-bottom-link-text-only');
 only.capability='component.configuration';only.permission='constrained';
 only.constraints=[{type:'propertyDomain',fact:'editorDependencyUsageV1.bottom-link.nonTextChanged',values:[false]}];
 const characters=manual.rules.find(r=>r.id==='component:web.benefit-card-link-content-limit');
 const lines=manual.rules.find(r=>r.id==='component:web.benefit-card-link-line-limit');
 characters.constraints[0].fact='editorDependencyUsageV1.bottom-link.characterCount';
 lines.constraints[0].fact='editorDependencyUsageV1.bottom-link.lineCount';
 for(const r of [only,characters,lines])r.execution={route:'auto'};
 const bundle=editor.buildExportBundle(manual,workspace.variantEvidence,workspace.dependencyContracts);
 assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
 assert.equal(bundle.compiled.rules.length,40);assert.equal(bundle.compiled.nonExecutableRules.length,2);
 const oldCompiled=JSON.parse(textFiles(original).find(f=>f.name==='compiled/component-contract.v2.json').text);
 const body=r=>{const v=wire(r);delete v.revision;delete v.source.checksum;return v;};
 for(const r of oldCompiled.rules)assert.deepEqual(body(bundle.compiled.rules.find(n=>n.ruleId===r.ruleId)),body(r));
 const requirementsName=original.find(f=>f.name.endsWith('context/dependency-requirements.json')).name;
 const requirements=JSON.parse(Buffer.from(original.find(f=>f.name===requirementsName).data));
 const requirement=requirements.requirements.find(r=>r.component==='Link');
 requirement.parentUsageExecution='editor-local-predicate';requirement.editorVersion='0.2.104';requirement.v4Integration='HELD_UNTIL_CONTRACT_ACCEPTANCE';
 const replacement=new Map([['contract.manual.json',manual],['compiled/component-contract.v2.json',bundle.compiled],
  ['coverage.json',bundle.coverage],['validation-report.json',bundle.validation],[requirementsName,requirements]]);
 const entries=original.filter(f=>!replacement.has(f.name));for(const [name,data]of replacement)entries.push(editor.textZipEntry(name,data));
 const bytes=editor.createZip(entries),file=P+'/BenefitCard.r7.editor-candidate.component-contract.zip';
 fs.writeFileSync(file,bytes,{flag:'wx'});
 const reopened=editor.importWorkspace(textFiles(await editor.readZip(bytes)),'benefit-card.desktop');
 const rebuilt=editor.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
 assert.deepEqual(wire(rebuilt.compiled),wire(bundle.compiled));assert.deepEqual(reopened.variantEvidence,workspace.variantEvidence);
 assert.deepEqual(reopened.dependencyContracts,workspace.dependencyContracts);
 assert.throws(()=>shared.prepareValidationSnapshot({selection:[],nodes:[]},bundle.compiled),/UNSUPPORTED/);
 const historical=P+'/BenefitCard/reports/live-captures/2026-10-09',replays=[];
 for(const name of fs.readdirSync(historical).filter(n=>n.endsWith('.json'))){
  const r=JSON.parse(fs.readFileSync(historical+'/'+name));if(!r.runtime?.evaluatedContract)continue;
  const old=r.runtime.evaluatedContract;if((old.package.manualRevision??old.rules[0]?.revision)!==5)continue;
  const snapshot=wire(r.snapshot);if(snapshot.validationIntent)snapshot.validationIntent=editor.createValidationIntent(snapshot,bundle.compiled,r.snapshot.validationIntent.values);
  const result=editor.evaluateCompiledContract(snapshot,editor.prepareAuthoringPreviewContract(bundle.compiled));
  const previous=shared.evaluateCompiledContract(r.snapshot,old),key=e=>JSON.stringify([e.ruleId,e.subjectNodeId]),map=new Map(previous.evaluations.map(e=>[key(e),e]));
  assert.equal(map.size,previous.evaluations.length);
  for(const e of result.evaluations.filter(e=>map.has(key(e)))){const p=map.get(key(e));assert.equal(e.classification,p.classification,name);assert.deepEqual(e.trace,p.trace,name);}
  const parent=result.evaluations.filter(e=>[only.id,characters.id,lines.id].some(id=>e.ruleId.startsWith(id+'.')));
  replays.push({input:pin(historical+'/'+name),kind:'retained-native-facts-with-new-synthetic-explicit-scenario',previousEvaluations:previous.evaluations.length,
   parentUsage:parent.map(e=>({ruleId:e.ruleId,classification:e.classification,reason:e.trace.reason})),unchanged:true});
 }
 assert.equal(replays.length,57);
 const record={input:pin(input),candidate:pin(file),editorCore:pin(W+'/projects/ComponentContractEditor/dist/core.cjs'),manualHash:editor.stableHash(manual),compiledHash:editor.stableHash(bundle.compiled),
  claims:22,IR:40,deferred:2,validation:bundle.validation,roundtrip:true,closureUnchanged:true,oldIRPreserved:37,oldResultsPreserved:57,replays,
  newRuleIds:[only.id,characters.id,lines.id].map(id=>bundle.compiled.rules.find(r=>r.source.anchor===id).ruleId),
  childAuthority:'Draft preserved; separate dependency report may remain incomplete',nativeLive:'NOT_RUN_USER_ONLY',ready:false,v4Integration:'HELD_UNTIL_CONTRACT_ACCEPTANCE'};
 fs.writeFileSync(__dirname+'/candidate-r7.json',JSON.stringify(record)+'\n',{flag:'wx'});
 fs.writeFileSync(__dirname+'/manual-r7.patch.json',JSON.stringify({base:pin(input),metadata:manual.metadata,editorDependencyUsages:manual.editorDependencyUsages,rules:[only,characters,lines]})+'\n',{flag:'wx'});
 console.log(JSON.stringify({candidate:file,revision:7,IR:40,deferred:2,replays:57,rules:record.newRuleIds,ready:false}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
