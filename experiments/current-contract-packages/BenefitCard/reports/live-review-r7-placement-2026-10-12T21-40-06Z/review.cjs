const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',c=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const rows=[];
for(const name of ['benefit-card.validation-report.2026-10-12T21-40-06-703Z.json','benefit-card.validation-report.2026-10-12T21-40-28-740Z.json']){
 const path=P+'/BenefitCard/'+name,r=JSON.parse(fs.readFileSync(path)),engine=c.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 assert.deepEqual(JSON.parse(JSON.stringify(engine)),r.results.engine);
 assert.equal(r.snapshot.validationIntent.values.CardPlacement,'single');
 const hug=engine.evaluations.find(e=>e.ruleId==='component:web.benefit-card.vertical-resizing-policy.1.1');assert.equal(hug.classification,'compliant');
 const usage=engine.evaluations.filter(e=>['component:web.benefit-card-bottom-link-text-only.1.1','component:web.benefit-card-link-content-limit.1.1','component:web.benefit-card-link-line-limit.1.1'].includes(e.ruleId));
 assert.equal(usage.length,3);assert(usage.every(e=>e.classification==='human-review'));
 const d=r.runtime.evaluatedContract.componentDependencies.find(d=>d.id==='link'),cap=c.validatedDependencyCapture(r.snapshot,r.snapshot.componentDependencyCaptures[0].nodeId,d.contract);
 assert(cap.snapshot);const child=c.prepareValidationSnapshot(cap.snapshot,d.contract),label=child.declaredTargetIdentitiesV1.targets.find(t=>t.targetId==='target.label');assert.equal(label.reason,'reference-pin-stale');
 rows.push({input:pin(path),rootNodeId:r.snapshot.source.rootNodeId,platform:r.snapshot.context.platform,editorVersion:r.editorVersion,revision:r.run.manualRevision,
  scenario:r.snapshot.validationIntent.values,exactEngineReplay:true,acceptedScope:{ruleId:hug.ruleId,classification:hug.classification,actual:hug.trace.actual,expected:hug.trace.expected},
  usage:usage.map(e=>({ruleId:e.ruleId,classification:e.classification,truth:e.trace.truth})),childLabel:label,wholeReady:false});
}
fs.writeFileSync(__dirname+'/review.json',JSON.stringify({status:'PASS_PLACEMENT_HUG_SCOPED_DEPENDENCY_UNRESOLVED',reader:pin(W+'/projects/ComponentContractEditor/dist/core.cjs'),cases:rows,
 supersedesMissingPlacementOnly:P+'/BenefitCard/reports/live-review-r7-2026-10-12T21-20-33Z/HANDOFF.json',sourceChoice:'PENDING_OWNER_DECISION',sourceBuildWrites:0,canvasWrites:0,Ready:false,v4Integration:'HELD_UNTIL_CONTRACT_ACCEPTANCE'})+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:2,Hug:'PASS_D_M_SCOPED',LinkUsage:'3 UNKNOWN each',sourceChoice:'pending'}));
