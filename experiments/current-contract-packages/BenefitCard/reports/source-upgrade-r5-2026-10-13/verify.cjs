const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',D=__dirname;
const read=n=>JSON.parse(fs.readFileSync(D+'/'+n));
const pin=p=>{const bytes=fs.readFileSync(p);return{path:p,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};};
const c=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const linkPath=P+'/Link/authoring/candidates/icon-native-size-r5-2026-10-12/compiled/component-contract.v2.json',link=JSON.parse(fs.readFileSync(linkPath));
const shape={targets:link.facts.targets,policies:link.customizationPolicy,representations:link.facts.representations};
const expected='03e123c8e49794fafbd515175a102a28409297f46bd948087909ab7a111ce444';
const workshop=read('workshop-pristine-reference.json'),publisher=read('pristine-source-reference.json');
assert(workshop.reference.complete&&workshop.temporaryNodesRemoved);
assert.equal(c.publicSwapDeclaredTargetReferenceHash(workshop.reference,shape),expected);
const publisherHash=c.publicSwapDeclaredTargetReferenceHash(publisher.reference,shape);
assert.equal(publisherHash,read('exact-reference-first-refusal.json').actual);
assert.notEqual(publisherHash,expected);
const receipt=read('source-upgrade-receipt.json'),live=read('library-source-readback.json');
assert.deepEqual(receipt.mutatedNodeIds,['17:12838','17:12843']);assert.equal(receipt.published,false);
for(const r of receipt.results){
 assert(Object.values(r.checks).every(v=>v===true));
 const after=live.rows.find(n=>n.id===r.after.id);assert(after);
 assert.equal(after.mainKey,workshop.reference.componentKey);assert.equal(after.ownerKey,workshop.reference.componentSetKey);
 assert.equal(after.definitionNames.length,10);assert.equal(after.sizeValues.length,4);
 for(const [name,old] of Object.entries(r.before.properties)){assert.equal(after.properties[name].type,old.type);assert.equal(after.properties[name].value,old.value);}
}
const inputs=[pin(linkPath),pin(P+'/BenefitCard.r7.editor-candidate.component-contract.zip'),pin(P+'/Link.r5.candidate.component-contract.zip'),pin(P+'/BenefitCard.component-contract.zip'),pin(W+'/projects/ComponentContractEditor/dist/core.cjs'),pin(W+'/projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'),pin(W+'/projects/Apollo-v3/packages/component-contract-core/dist/capture.cjs')];
const result={status:'PASS_DRAFT_SOURCE_UPGRADE_AND_WORKSHOP_PRISTINE_PIN',sourceInstances:receipt.mutatedNodeIds,rootSettingsPreserved:8,domainSizes:4,declaredProperties:10,consumerFileKey:'I3MsagXR8Tz2eZcGtIgUk8',consumerReferenceHash:expected,publisherReferenceHash:publisherHash,crossFilePortability:'NOT_ACCEPTED_LOCAL_SWAP_IDS_DIFFER',published:false,parentNativeLive:'NOT_RUN_USER_ONLY_AFTER_PUBLISH_UPDATE',Ready:false,v4Integration:'HELD_UNTIL_CONTRACT_ACCEPTANCE',sharedSourceBuildWrites:0,inputs};
fs.writeFileSync(D+'/verification.json',JSON.stringify(result)+'\n');
console.log(JSON.stringify({status:result.status,instances:2,publication:false,freshParentLive:false}));
