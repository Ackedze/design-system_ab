const fs=require('node:fs'),assert=require('node:assert/strict');
 const {root,guard}=require('./guard.cjs');
const core=require(root+'/workspace/candidate/projects/ComponentContractEditor/dist/core.cjs');
const clone=v=>JSON.parse(JSON.stringify(v));
const copies=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;
async function opened(name){
 const file=copies.find(x=>x.original.path.includes(name)).copy.path;
 return core.importWorkspace((await core.readZip(fs.readFileSync(file))).filter(x=>x.name.endsWith('.json')).map(x=>({name:x.name,text:core.zipEntryText(x)})));
}
(async()=>{
 const before=guard('before-historical-retained-probes'),legacy=[];
 for(const name of ['BenefitCard.r7','BenefitCard.r8']){
  const o=await opened(name),compiled=core.compileManualSource(o.manual,o.variantEvidence,o.dependencyContracts);
  assert.equal(compiled.issues.filter(x=>x.level==='error').length,0,JSON.stringify(compiled.issues));
  assert.equal(core.stableHash(compiled.contract),core.stableHash(o.compiledInput));
  legacy.push({name,compiledHash:core.stableHash(compiled.contract),exact:true});
 }
 const o=await opened('BenefitCard.r8'),bg=await opened('BackgroundPlate.r6'),child=bg.compiledInput,manual=clone(o.manual);
 const bindings=manual.representations.filter(r=>r.kind==='figma').map(r=>({
  kind:'fixed-nested-scoped',id:'background-plate-'+r.platform,targetRole:'root',relativePath:'',
  ownerComponentSetKeys:[r.locator.componentSetKey],activeVariant:{property:'Background',values:['True']},
  childPath:'BackgroundPlate / ['+(r.platform==='desktop'?'D':'M')+'][Promo] BackgroundPlate',representationIds:[r.id],
 }));
 manual.componentDependencies.push({id:'background-plate',componentId:child.package.componentId,revision:child.package.manualRevision,
  manualSourceHash:child.package.manualSourceHash,compiledHash:core.stableHash(child),bindings});
 // The package field is schema-specific; use the exact pinned manual revision.
 manual.componentDependencies.at(-1).revision=bg.manual.metadata.revision;
 const compiled=core.compileManualSource(manual,o.variantEvidence,[...o.dependencyContracts,child]);
 assert.equal(compiled.issues.filter(x=>x.level==='error').length,0,JSON.stringify(compiled.issues));
 const contract=core.prepareAuthoringPreviewContract(compiled.contract),base=core.prepareAuthoringPreviewContract(o.compiledInput),probes=[];
 for(const input of copies.filter(x=>x.original.path.includes('benefit-card.validation-report.'))){
  const report=JSON.parse(fs.readFileSync(input.copy.path)),snapshot=clone(report.snapshot);
  const prepared=core.prepareValidationSnapshot(snapshot,contract),dep=contract.componentDependencies.find(d=>d.id==='background-plate');
  const resolved=dep.bindings.map(b=>({bindingId:b.id,...core.resolveFixedNestedBinding(prepared,dep,b,false,contract)})).map(({node,...r})=>r);
  assert.equal(resolved.filter(x=>x.status==='active'&&x.identityValid).length,1,JSON.stringify(resolved));
  assert.equal(resolved.filter(x=>x.reason==='binding-outside-representation').length,1);
  const old=core.evaluateCompiledContract(snapshot,base),next=core.evaluateCompiledContract(snapshot,contract);
  const oldUnknown=old.evaluations.filter(e=>e.classification==='human-review'),newUnknown=next.evaluations.filter(e=>e.classification==='human-review');
  for(const e of oldUnknown){const match=next.evaluations.find(x=>x.ruleId===e.ruleId&&x.subjectNodeId===e.subjectNodeId&&x.focusNodeId===e.focusNodeId);assert.ok(match&&match.classification==='human-review',e.ruleId);}
  const bgRun=next.dependencyRuns.filter(r=>r.dependencyId==='background-plate');
  assert.equal(bgRun.filter(r=>r.status==='not-executed'&&r.reason==='dependency-reference-not-captured').length,1,JSON.stringify(bgRun));
  const prior=new Map(old.evaluations.map(e=>[e.ruleId+'|'+e.subjectNodeId+'|'+e.focusNodeId,e]));
  const changes=next.evaluations.flatMap(e=>{const p=prior.get(e.ruleId+'|'+e.subjectNodeId+'|'+e.focusNodeId);return p&&p.classification!==e.classification?[{ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,focusNodeId:e.focusNodeId,before:p.classification,after:e.classification}]:[];});
  assert.ok(changes.every(e=>e.after==='human-review'),JSON.stringify(changes.slice(0,5)));
  probes.push({input:input.original,capturedAt:report.generatedAt,platform:snapshot.context.platform,resolved,backgroundRuns:bgRun,
   oldUnknown:oldUnknown.length,newUnknown:newUnknown.length,classificationChanges:changes.length,changes,
   nativeAcceptance:'NOT_RUN: historical captures contain no BackgroundPlate child capture; no synthetic child evidence inserted'});
 }
 const result={status:'HISTORICAL_ONLY',before,after:guard('after-historical-retained-probes'),legacy,prototypeHash:core.stableHash(compiled.contract),
  dependencyPin:manual.componentDependencies.at(-1),probes,sharedWrites:0,nativeModelCalls:0,Ready:false};
 fs.writeFileSync(root+'/RETAINED-PROBES.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({legacyExact:legacy.length,probes:probes.length,bgNativeAcceptance:'NOT_RUN',unknownPreserved:true}));
})().catch(error=>{const p=root+'/FIRST-RETAINED-PROBES-FAILURE.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
