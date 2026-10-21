// Retained native snapshots; no recapture or product build.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const [proxyRoot,dataRoot,reportFile]=process.argv.slice(2);
assert(proxyRoot&&dataRoot&&reportFile,'Usage: node replay.cjs <proxy-root> <contracts-root> <owner-report.json>');
const receipt=JSON.parse(fs.readFileSync(path.join(__dirname,'REPLAY.json'))),bytes=fs.readFileSync(reportFile);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),receipt.input.sha256);
const data=require(path.join(proxyRoot,'src/data-packages')).readGenerationData({root:dataRoot,apolloRoot:path.join(proxyRoot,'runtime/apollo')});
const item=data.contracts.find(c=>c.entry.componentId==='web-corp.payment-masked-number');assert(item);
assert.equal(item.source.manual.metadata.revision,2);
for(const r of item.source.manual.rules)assert.deepEqual(r.applicability.platforms,['desktop','mobile-web','universal']);
const cases=JSON.parse(bytes).components,expected=[0,0,1,1,0,1,1,1];assert.equal(cases.length,8);
for(const [i,c]of cases.entries()){
 assert.equal(c.snapshot.context.platform,'universal');
 const audit=data.runtime.auditContractSnapshot(c.snapshot,item.contract,{evaluationMode:'authoring-preview'}),evaluations=audit.engine.evaluations;
 assert.equal(evaluations.length,6);
 assert.deepEqual(evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId),receipt.cases[i].violations);
 assert.equal(evaluations.filter(e=>e.classification==='violation').length,expected[i]);
 assert(!evaluations.some(e=>e.trace?.reason==='rule platform scope does not apply'));
}
const excluded=structuredClone(cases[0].snapshot);excluded.context.platform='ios';
assert(data.runtime.auditContractSnapshot(excluded,item.contract,{evaluationMode:'authoring-preview'}).engine.evaluations.every(e=>e.trace?.reason==='rule platform scope does not apply'));
// Relabeling captured representation context must retain UNKNOWN, not fabricate bindings.
for(const platform of ['desktop','mobile-web']){
 const mismatch=structuredClone(cases[2].snapshot);mismatch.context.platform=platform;
 assert(data.runtime.auditContractSnapshot(mismatch,item.contract,{evaluationMode:'authoring-preview'}).engine.evaluations.every(e=>e.classification==='human-review'));
}
data.assertCurrent();console.log(JSON.stringify({status:'PASS',nativeReplayCases:8,unsupportedPlatformRefusal:'PASS',representationMismatchUnknown:'PASS',counts:expected}));
