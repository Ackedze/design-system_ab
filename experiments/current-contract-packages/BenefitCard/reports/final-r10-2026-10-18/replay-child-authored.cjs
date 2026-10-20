const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages'),out=__dirname;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex'),pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:digest(b),bytes:b.length}},save=(n,x)=>fs.writeFileSync(path.join(out,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const coreFile=path.join(W,'projects/ComponentContractEditor/dist/core.cjs'),runtimePin=pin(coreFile),core=require(coreFile),runs=[];
async function canonical(name,expectedZip,expectedCompiled){
 const file=path.join(P,name),p=pin(file);assert.equal(p.sha256,expectedZip);
 const e=await core.readZip(fs.readFileSync(file)),root=e.find(x=>x.name==='contract.compiled.json');assert(root,'canonical compiled entry');
 const original=JSON.parse(Buffer.from(root.data).toString()),w=core.importWorkspace(e.filter(x=>x.name.endsWith('.json')).map(x=>({name:x.name,text:Buffer.from(x.data).toString()})),original.package.id);
 const b=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);
 assert.equal(core.stableHash(b.compiled),expectedCompiled,name+' exact authored build correspondence');
 return{pin:p,compiled:b.compiled,workspace:w};
}
(async()=>{
 try{
 assert.equal(runtimePin.sha256,'0559e9210660a775eb75670198c271fdf05c8f887d70407400353f5b25b69cb0');
 const parent=await canonical('BenefitCard.r10.candidate.component-contract.zip','0f43d88103b797d763ea629541f99e8f04a861ee71b22f17a2b4e69785ef632c','795876f09d5acb4d3e056a55fb6d498bb93aa30e5e87d7535eb7cc4028122723');
 const specs=[['link','Link.r5.candidate.component-contract.zip','d219318aedb7b634117da62a93aacb6c60071215e1e045315c57862d63501051'],['icon-view','IconView.r8.candidate.component-contract.zip','eb64b583f64aa99879ffc01576df383e3406d7e190b2e0980509410d50c1749f'],['background-plate','BackgroundPlate.r6.candidate.component-contract.zip','cade9e1b3684ba8ab670d11e93667621d6b9c4613af6cbfe8f11c41cbb4da830']];
 const children=new Map();
 for(const[id,name,zipHash]of specs){const dep=parent.compiled.componentDependencies.find(x=>x.id===id),c=await canonical(name,zipHash,dep.compiledHash);assert.deepEqual(JSON.parse(JSON.stringify(c.compiled)),JSON.parse(JSON.stringify(dep.contract)));assert.equal(core.dependencyPinIssue(dep,c.compiled),undefined);children.set(id,c);}
 const analysis=JSON.parse(fs.readFileSync(path.join(out,'../owner-dependencies-2026-10-18/analysis.json')));
 for(const row of analysis.cases){const reportBytes=fs.readFileSync(row.report.path);assert.equal(digest(reportBytes),row.report.sha256);const report=JSON.parse(reportBytes),prepared=core.prepareValidationSnapshot(report.snapshot,parent.compiled);
 for(const prior of report.results.editor.dependencyRuns.filter(x=>x.status!=='not-applicable')){
 assert(runs.length<24);const child=children.get(prior.dependencyId),dep=parent.compiled.componentDependencies.find(x=>x.id===prior.dependencyId);assert.equal(prior.compiledHash,dep.compiledHash);
 const capture=core.validatedDependencyCapture(prepared,prior.nodeId,child.compiled);
 if(!capture.snapshot||!capture.nodeMap)throw Error('NAMED_CAPTURE_GAP '+row.caseId+'/'+dep.id+': '+capture.reason);
 const hashBefore=core.stableHash(child.compiled),view=core.prepareAuthoringPreviewContract(child.compiled),result=core.evaluateCompiledContract(capture.snapshot,view,[],parent.compiled.runtimePolicy.instanceMainComponentAliasesVersion===1?1:undefined);
 assert.equal(core.stableHash(child.compiled),hashBefore);
 const counts={};for(const e of result.evaluations)counts[e.classification]=(counts[e.classification]||0)+1;
 const exceptional=result.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification)).map(e=>({ruleId:e.ruleId,classification:e.classification,nodeId:e.focusNodeId,trace:e.trace}));
 runs.push({sourceCaseId:row.caseId,sourceReport:row.report,dependencyId:dep.id,componentId:dep.componentId,revision:dep.revision,compiledHash:dep.compiledHash,childZip:child.pin,validatedCapture:'PASS',counts,exceptional,nonExecutableRules:(child.compiled.nonExecutableRules||[]).map(x=>x.ruleId||x.id),contextPolicies:(child.compiled.customizationPolicy||[]).filter(x=>x.status!=='deprecated'&&['delegated','context-only'].includes(x.execution.route)).map(x=>x.ruleId||x.id)});
 }}
 assert.deepEqual(pin(coreFile),runtimePin);
 save('child-authoring-replay.json',{status:'RETAINED_NATIVE_CHILD_AUTHORING_REPLAY',runtimePin,parent:parent.pin,reportCount:analysis.cases.length,childRuns:runs.length,runs,persistedContractsUnchanged:true,freshNative:false,parentDependencyCompletionAccepted:false,Ready:false});
 console.log(JSON.stringify({status:'REPLAYED',childRuns:runs.length,runs:runs.map(x=>({case:x.sourceCaseId,child:x.dependencyId,counts:x.counts,exceptional:x.exceptional,nonExecutable:x.nonExecutableRules,contextPolicies:x.contextPolicies}))}));
 }catch(e){const gap={status:'NAMED_REPLAY_GAP',error:String(e),stack:e.stack,runtimePin,completedRuns:runs,Ready:false,freshNative:false};save('child-replay-gap.json',gap);console.log(JSON.stringify({status:gap.status,error:gap.error,completedRuns:runs.length}));process.exitCode=1;}
})();
