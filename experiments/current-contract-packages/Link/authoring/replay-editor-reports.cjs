const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=__dirname,packages=path.resolve(root,'../..'),workspace=path.resolve(root,'../../../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p)),copy=x=>JSON.parse(JSON.stringify(x));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const compiled=read(path.join(root,'compiled/component-contract.v2.json'));
const manual=read(path.join(root,'contract.manual.json'));
const contract=core.prepareAuthoringPreviewContract(compiled);
assert.equal(manual.metadata.revision,2);
const previous=read(path.join(packages,'history/Link/r1-before-reference-order-fix-2026-10-10/contract.manual.json'));
assert.deepEqual(manual.rules,previous.rules,'Normative rules must stay unchanged');
const specs=[
 ['link.validation-report.2026-10-10T06-55-51-851Z.json','LINK-03','13666:67888',8,16,null],
 ['link.validation-report.2026-10-10T06-56-07-238Z.json','LINK-09','13666:68009',11,16,'component:web-core.link.layer-properties-use-effective-baseline.1.6'],
 ['link.validation-report.2026-10-10T06-56-32-252Z.json','LINK-12','13666:68069',8,18,'component:web-core.link.label-typography.1.2'],
];
const classify=r=>r.evaluations.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{});
const rows=[];
for(const [file,caseId,instanceId,gap,fontSize,expectedRuleId] of specs){
 const input=path.join(root,'..',file),d=read(input),s=d.snapshot;
 assert.equal(d.run.manualSourceHash,core.stableHash(previous));
 assert.equal(s.source.rootNodeId,instanceId);
 const label=s.nodes.find(n=>n.type==='TEXT'&&n.name==='Label');
 assert.equal(s.nodes[0].layout.itemSpacing,gap);assert.equal(label.text.fontSize,fontSize);
 const before=core.evaluateCompiledContract(s,d.runtime.evaluatedContract);
 assert.deepEqual(classify(before),{'human-review':31,compliant:1});
 const prepared=core.prepareValidationSnapshot(s,contract);
 assert(prepared.declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'));
 const after=core.evaluateCompiledContract(s,contract),violations=after.evaluations.filter(e=>e.classification==='violation');
 assert.equal(after.evaluations.filter(e=>e.classification==='human-review').length,0);
 assert.deepEqual(violations.map(e=>e.ruleId),expectedRuleId?[expectedRuleId]:[]);
 let restoration=null;
 if(expectedRuleId){
  const restored=copy(s);restored.nodes[0].layout.itemSpacing=8;
  restored.nodes.find(n=>n.id===label.id).text.fontSize=16;
  const rr=core.evaluateCompiledContract(restored,contract);
  assert.equal(rr.evaluations.filter(e=>e.classification==='violation'||e.classification==='human-review').length,0);
  restoration={kind:'counterfactual restoration of reported snapshot; NOT user RESET',classifications:classify(rr),liveReset:'NOT_RUN'};
 }
 const stale=copy(s);stale.variantReference.nodes.push({path:'Unproven extra node',type:'FRAME'});
 const guard=core.prepareValidationSnapshot(stale,contract).declaredTargetIdentitiesV1;
 assert(guard.targets.every(t=>t.reason==='reference-pin-stale'));
 const uncertain=copy(s);uncertain.nodes.find(n=>n.id===label.id).unknownFacts.push('text.fontSize');
 const unknown=core.evaluateCompiledContract(uncertain,contract).evaluations;
 assert(unknown.some(e=>e.ruleId==='component:web-core.link.label-typography.1.2'&&e.classification==='human-review'));
 rows.push({caseId,instanceId,input:{path:input,sha256:sha(input)},originalManualSourceHash:d.run.manualSourceHash,
  observed:{gap,fontSize,classifications:d.summary.classifications,targetReasons:d.snapshot.declaredTargetIdentitiesV1.targets},
  replayBefore:classify(before),replayAfter:classify(after),resolvedTargets:8,expectedRuleId,
  targetEvaluations:violations.map(e=>({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,classification:e.classification,trace:e.trace})),
  restoration,staleReferenceGuard:'PASS',missingFontFactGuard:'PASS',installedEditorR2:'NOT_RUN_USER_ONLY'});
}
const receipt={schemaVersion:'link.editor-report-replay.v1',revision:2,manualSourceHash:compiled.package.manualSourceHash,
 compiledHash:core.stableHash(compiled),allChecksPassed:true,normativeChanges:false,guardBypass:false,
 evidenceKind:'actual installed Editor r1 snapshots replayed locally with r2; restoration/UNKNOWN cases are counterfactual',
 cases:rows,liveAcceptance:false,liveReset:'NOT_RUN',wholeReady:false};
fs.writeFileSync(path.join(root,'reports/editor-report-replay.r2.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({passed:rows.length,violations:rows.map(r=>({caseId:r.caseId,result:r.replayAfter})),installedEditorR2:'NOT_RUN_USER_ONLY',reset:'NOT_RUN'}));
