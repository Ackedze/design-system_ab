const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',core=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const ids=['component:web.benefit-card-bottom-link-text-only.1.1','component:web.benefit-card-link-content-limit.1.1','component:web.benefit-card-link-line-limit.1.1'];
const expectedPath=P+'/Link/authoring/sources/native/Link.S.native-facts.2026-10-10.json',expected=JSON.parse(fs.readFileSync(expectedPath));
const rows=[];
for(const name of ['benefit-card.validation-report.2026-10-12T21-20-33-199Z.json','benefit-card.validation-report.2026-10-12T21-21-00-801Z.json']){
 const path=P+'/BenefitCard/'+name,r=JSON.parse(fs.readFileSync(path));assert.equal(r.editorVersion,'component-contract-editor@0.2.104');assert.equal(r.run.manualRevision,7);
 const replay=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);assert.deepEqual(JSON.parse(JSON.stringify(replay)),r.results.engine);
 const usage=replay.evaluations.filter(e=>ids.includes(e.ruleId));assert.equal(usage.length,3);assert(usage.every(e=>e.classification==='human-review'));
 const dep=r.runtime.evaluatedContract.componentDependencies.find(d=>d.id==='link'),capture=r.snapshot.componentDependencyCaptures[0];
 const valid=core.validatedDependencyCapture(r.snapshot,capture.nodeId,dep.contract);assert(valid.snapshot);
 const child=core.prepareValidationSnapshot(valid.snapshot,dep.contract),target=child.declaredTargetIdentitiesV1.targets.find(t=>t.targetId==='target.label');
 assert.equal(target.reason,'reference-pin-stale');
 const ref=capture.snapshot.variantReference,shape={targets:dep.contract.facts.targets,policies:dep.contract.customizationPolicy,representations:dep.contract.facts.representations};
 const expectedPin=core.publicSwapDeclaredTargetReferenceHash(expected.reference,shape),actualPin=core.publicSwapDeclaredTargetReferenceHash(ref,shape);
 assert.notEqual(expectedPin,actualPin);
 rows.push({input:pin(path),platform:r.snapshot.context.platform,rootNodeId:r.snapshot.source.rootNodeId,label:child.nodes.find(n=>n.id==='preview:8').text.characters,
  readerReplayExact:true,manualRevision:7,manualHash:r.run.manualSourceHash,compiledHash:core.stableHash(r.sources.compiledContract),
  newUsage:usage.map(e=>({ruleId:e.ruleId,classification:e.classification,truth:e.trace.truth,factPaths:e.trace.factPaths})),
  rootCause:{usageDiagnostic:r.snapshot.nodes[0].editorDependencyUsageV1['bottom-link'].reason,childDeclaredTarget:target,expectedConfigurationHash:expectedPin,actualConfigurationHash:actualPin,
   missingNativePorts:expected.reference.definedProperties.filter(p=>!ref.definedProperties.includes(p)),expectedSizeDomain:expected.definitions.Size.variantOptions},
  missingScenarioInput:'CardPlacement',actualScenarioInputs:r.snapshot.validationIntent.values,
  classifications:Object.fromEntries([...new Set(replay.evaluations.map(e=>e.classification))].map(c=>[c,replay.evaluations.filter(e=>e.classification===c).length])),
  dependencyDraftAuthority:'preserved; 38 child checks not-evaluable',status:'FAIL_NATIVE_DEPENDENCY_REFERENCE',wholeReady:false});
}
fs.writeFileSync(__dirname+'/review.json',JSON.stringify({schemaVersion:'apollo.contract-native-review.v1',status:'FAIL_NATIVE_DEPENDENCY_REFERENCE',reader:pin(W+'/projects/ComponentContractEditor/dist/core.cjs'),
 expectedNativeSource:pin(expectedPath),cases:rows,sourceChoice:'PENDING_OWNER_DECISION',editorWrites:0,sharedCoreWrites:0,v4Writes:0,canvasWrites:0,ready:false})+'\n',{flag:'wx'});
console.log(JSON.stringify(rows.map(r=>({platform:r.platform,status:r.status,unknownUsage:3,missingPorts:r.rootCause.missingNativePorts,missingInput:r.missingScenarioInput}))));
