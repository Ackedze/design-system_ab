
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const out=__dirname,W=path.resolve(out,'../../../../../../..');
const coreRoot=path.join(W,'projects/Apollo-v3/packages/component-contract-core');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:digest(b),bytes:b.length}};
const runtimeFiles=fs.readdirSync(path.join(coreRoot,'dist')).filter(n=>n.endsWith('.cjs')).map(n=>path.join(coreRoot,'dist',n));
const before=runtimeFiles.map(pin),core=require(path.join(coreRoot,'dist/core.cjs'));
for(const k of ['validatedDependencyCapture','prepareAuthoringPreviewContract','evaluateCompiledContract','prepareValidationSnapshot','dependencyPinIssue'])assert.equal(typeof core[k],'function',k);
const analysis=JSON.parse(fs.readFileSync(path.join(out,'analysis.json'))),runs=[];
for(const row of analysis.cases){
 const b=fs.readFileSync(row.report.path);assert.equal(digest(b),row.report.sha256);
 const j=JSON.parse(b),parent=j.runtime.evaluatedContract;
 assert.equal(j.run.manualSourceHash,'59cbba7c46c98be40e49769e18bde426fdd83e9166a12c4ba0a2f3318c22bc83');
 const prepared=core.prepareValidationSnapshot(j.snapshot,parent);
 for(const prior of j.results.editor.dependencyRuns.filter(r=>r.status!=='not-applicable')){
  assert(runs.length<24);
  const d=parent.componentDependencies.find(d=>d.id===prior.dependencyId);assert(d&&d.contract);assert.equal(d.compiledHash,prior.compiledHash);
  const entry={caseId:row.caseId,dependencyId:d.id,bindingId:prior.bindingId,componentId:d.componentId,revision:d.revision,compiledHash:d.compiledHash,sourceReport:row.report,sourceParentRunStatus:prior.status,scope:'retained-native standalone child authoring replay; not parent integration acceptance'};
  const issue=core.dependencyPinIssue(d,d.contract);assert.equal(issue,undefined);
  const capture=core.validatedDependencyCapture(prepared,prior.nodeId,d.contract);
  if(!capture.snapshot){entry.status='NAMED_CAPTURE_GAP';entry.reason=capture.reason;runs.push(entry);continue;}
  const original=digest(JSON.stringify(d.contract)),view=core.prepareAuthoringPreviewContract(d.contract);
  const result=core.evaluateCompiledContract(capture.snapshot,view);
  assert.equal(digest(JSON.stringify(d.contract)),original);
  const counts={};for(const e of result.evaluations)counts[e.classification]=(counts[e.classification]||0)+1;
  entry.status='REPLAYED';entry.captureValidation='PASS';entry.snapshotHash=result.snapshotHash;entry.counts=counts;
  entry.nonCompliant=result.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification)).map(e=>({ruleId:e.ruleId,classification:e.classification,nodeId:e.focusNodeId,trace:e.trace}));
  entry.nonExecutableSourceRules=d.contract.nonExecutableRules.length;
  entry.contextOrDelegatedPolicies=d.contract.customizationPolicy.filter(p=>p.status!=='deprecated'&&['delegated','context-only'].includes(p.execution.route)).map(p=>p.ruleId||p.id);
  runs.push(entry);
 }
}
assert.deepEqual(runtimeFiles.map(pin),before);
const result={status:'RETAINED_NATIVE_STANDALONE_CHILD_AUTHORING_REPLAY',runtimePins:before,reportCount:analysis.cases.length,childRuns:runs.length,runs,persistedContractsUnchanged:true,parentDependencyRunsStillIncomplete:true,Ready:false,freshNativeRun:false};
fs.writeFileSync(path.join(out,'child-authoring-replay.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,childRuns:runs.length,counts:runs.map(r=>({case:r.caseId,child:r.dependencyId,status:r.status,reason:r.reason,counts:r.counts,nonCompliant:r.nonCompliant,nonExecutable:r.nonExecutableSourceRules,contextPolicies:r.contextOrDelegatedPolicies}))}));

