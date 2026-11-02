const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const h=require('./review-harness.cjs'),p=require('./producer.cjs'),{digest,hash}=require('../../registry/source-inventory.cjs');
const gen=require(path.join(h.generation,'packages/generation-core/dist/index.cjs'));
const clone=v=>JSON.parse(JSON.stringify(v));
const names=['synthetic.supported.review.json','synthetic.unsupported-view.review.json','synthetic.unsupported-priority.review.json'];
const inputs=Object.fromEntries(names.map(n=>[n,JSON.parse(fs.readFileSync(path.join(__dirname,n)))]));
const currentResults={},historicalResults={},receipt={schemaVersion:'code-connect.exact-rebind-probes.v1-draft',accepted:false,executionAllowed:false,generationPlanHash:null,current:[],historical:[],faults:[]};
function summary(result,c){const i=result.inspection;return {callerPins:{manifest:c.manifestPin,report:c.reportPin},reviewPath:c.reviewPath,
    importStatus:i.importStatus,apiExpressibility:i.apiExpressibility,accepted:i.accepted,executionAllowed:i.executionAllowed,generationPlanHash:i.generationPlanHash,
    targets:i.targets,producerPlanHash:i.producerPlanHash,producerContentHash:i.producerContentHash,producerObservationHash:i.producerObservationHash,
    inspectionDigest:digest(i),sourceReviewHash:i.sourceReview?.reviewHash,strictRuntimeProbe:result.strictRuntimeProbe,reviewPortPins:result.reviewPortPins,
    consumerMismatches:i.consumerMismatches,diagnosticCodes:i.diagnostics.map(d=>d.code),sourceCoverage:i.sourceReview?.sources.map(s=>({componentId:s.metadata.componentId,
        revision:s.metadata.revision,compiledStatus:s.metadata.compiledStatus,errors:s.metadata.issues.filter(i=>i.level==='error').length,
        warnings:s.metadata.issues.filter(i=>i.level==='warning').length,predicates:s.metadata.coverage.predicateRuleIds.length,pending:s.metadata.coverage.pendingRoutes.length,
        nonExecutable:s.metadata.coverage.nonExecutableRuleIds.length,coverageDigest:digest(s.metadata.coverage)}))};}
test.before(async()=>{const c=h.config();currentResults[names[0]]=await h.read(c);assert.equal(currentResults[names[0]].inspection.importStatus,'inspected');});
for(const name of names)test('actual current review import: '+name,async()=>{
    const c=h.config(name),r=currentResults[name]||await h.read(c),i=r.inspection;currentResults[name]=r;receipt.current.push(summary(r,c));
    assert.equal(i.importStatus,'inspected');assert.equal(i.consumerMismatches.length,0);assert.equal(i.producerPlanHash,inputs[name].planHash);
    assert.equal(i.producerContentHash,inputs[name].contentHash);assert.equal(i.producerObservationHash,inputs[name].observation.observationHash);
    assert.deepEqual(i.historicalContent,inputs[name].content);assert.deepEqual(i.historicalApiIntent,inputs[name].apiIntent);
    assert.equal(i.apiExpressibility,name===names[0]?'bounded-content-expressible':'not-supported');
    assert.equal(i.accepted,false);assert.equal(i.executionAllowed,false);assert.equal(i.generationPlanHash,null);
    assert.deepEqual(i.targets,{figma:'blocked',frontend:'blocked'});assert.equal(r.strictRuntimeProbe.code,'SOURCE_COMPILE');
    const bg=i.sourceReview.sources.find(s=>s.metadata.componentId==='web-corp.buttons-group');
    assert.equal(bg.metadata.revision,59);assert.equal(bg.metadata.compiledStatus,'draft');assert.equal(bg.metadata.coverage.nonExecutableRuleIds.length,9);
    assert.equal(i.sourceReview.sources.length,5);assert.equal(i.sourceReview.accepted,false);assert.equal(i.sourceReview.executionAllowed,false);
});
for(const name of names)test('unchanged historical snapshot stays stale: '+name,async()=>{
    const c=h.config(name,true),r=await h.read(c),old=JSON.parse(fs.readFileSync(c.reviewPath)),i=r.inspection;
    historicalResults[name]=r;receipt.historical.push(summary(r,c));assert.equal(i.importStatus,'stale');assert.equal(i.consumerMismatches.length,13);
    assert.deepEqual(i.historicalContent,old.content);assert.deepEqual(i.historicalApiIntent,old.apiIntent);
    assert.equal(i.producerObservationHash,old.observation.observationHash);assert.equal(i.generationPlanHash,null);
    assert.equal(i.executionAllowed,false);assert.equal(r.strictRuntimeProbe.code,'SOURCE_COMPILE');
});
test('historical producer cannot prepare a current observation',()=>{
    assert.throws(()=>require('../v1-draft/producer.cjs').verifyFresh(),{code:'STALE_STATIC_CONSUMER'});
});
test('missing current source/dependency pins and changed mains cannot be promoted by redigesting review',()=>{
    const b=h.basis(currentResults[names[0]]);
    for(const mutate of [v=>v.inputPackages.pop(),v=>v.sourceReview.sources.pop(),
        v=>{v.inputPackages.find(p=>p.componentId==='web-corp.buttons-group').dependencyPins=[];},
        v=>{v.sourceReview.sources[0].mainSha256='0'.repeat(64);},v=>{v.sourceReview.sources[0].metadata.compiledHash='0'.repeat(64);}]){
        const c=clone(b);mutate(c);delete c.sourceReview.reviewHash;c.sourceReview.reviewHash=digest(c.sourceReview);
        const r=gen.inspectStaticProducerReview(inputs[names[0]],c,digest);assert.equal(r.importStatus,'rejected');assert.equal(r.diagnostics[0].code,'REVIEW_SOURCE_STALE');
        assert.equal(r.historicalContent,null);assert.equal(r.generationPlanHash,null);
    }
});
test('consumer and build identity drift reject freshness independently from API expressibility',()=>{
    const b=h.basis(currentResults[names[0]]),c=clone(b);
    c.consumerMismatches=[{path:'synthetic/consumer.ts',expectedSha256:hash('old'),actualSha256:hash('new')}];
    let r=gen.inspectStaticProducerReview(inputs[names[0]],c,digest);assert.equal(r.importStatus,'stale');assert.equal(r.apiExpressibility,'bounded-content-expressible');
    c.consumerMismatches=[];c.sourceReview.identity.buildInputsSha256=hash('changed-build');delete c.sourceReview.reviewHash;c.sourceReview.reviewHash=digest(c.sourceReview);
    r=gen.inspectStaticProducerReview(inputs[names[0]],c,digest);assert.equal(r.importStatus,'stale');assert.equal(r.executionAllowed,false);assert.equal(r.generationPlanHash,null);
});
test('intent/provenance/content/authority mutations are rejected by independent reconstruction',()=>{
    const b=h.basis(currentResults[names[0]]);
    for(const mutate of [v=>{v.apiIntent.root.props.onClick='invented';},v=>{v.apiIntent.group.props.elements[0].loading=true;},
        v=>{v.apiIntent.businessPriorityOrder.reverse();},v=>{v.content.provenance[0].canonicalOccurrenceId='invented';},
        v=>{v.content.provenance[0].symbolId='invented';},v=>{v.observation.mappings[0].profileAcceptance='accepted';},
        v=>{v.plan.requirements.deleteSourceOccurrences=true;},v=>{v.targetSupport.frontend='supported';},
        v=>{v.executionAllowed=true;},v=>{v.accepted=true;},v=>{v.plan.generationPlanHash=v.planHash;},v=>{v.extra='unrecognized';}]){
        const input=clone(inputs[names[0]]);mutate(input);input.contentHash=digest(input.content);input.planHash=digest(input.plan);
        const r=gen.inspectStaticProducerReview(input,b,digest);assert.equal(r.importStatus,'rejected');assert.equal(r.historicalContent,null);assert.equal(r.generationPlanHash,null);
    }
});
test('caller-pinned manifest/report/output bytes cannot be replaced by imported assertions',async()=>{
    for(const key of ['manifestPin','reportPin']){const c=clone(h.config());c[key].sha256='0'.repeat(64);
        await assert.rejects(h.read(c),{code:key==='manifestPin'?'REVIEW_MANIFEST_STALE':'REVIEW_REPORT_STALE'});}
    const c=clone(h.config());c.reviewPath=path.join(__dirname,'unlisted.review.json');await assert.rejects(h.read(c),{code:'REVIEW_OUTPUT_UNPINNED'});
});
async function changedAfterRead(target,expectedCode){
    // In-memory I/O fault only. No source, consumer or historical file is edited.
    const original=fs.readFileSync;let reads=0;
    fs.readFileSync=function(file,...args){const bytes=original.call(this,file,...args);
        if(String(file)===target&&++reads>=2)return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);return bytes;};
    try{await assert.rejects(h.read(h.config()),{code:expectedCode});assert.ok(reads>=2);receipt.faults.push({kind:'in-memory-read-drift',file:target,rejectedWith:expectedCode,reads,filesystemWrites:0});}
    finally{fs.readFileSync=original;}
}
test('producer drift after async source reads is rejected',()=>changedAfterRead(path.join(__dirname,'producer.cjs'),'REVIEW_PRODUCER_STALE'));
test('consumer drift after async source reads is rejected',()=>changedAfterRead(path.join(h.generation,'README.md'),'REVIEW_READ_CHANGED'));
test('complete current closure, historical files and copied producer source stay exact',()=>{
    const a=p.loadArtifact();p.verifyFresh();assert.equal(a.consumerFiles.length,165);assert.equal(a.workspaceConsumerFiles.length,1);assert.equal(a.buildInputs.length,95);
    for(const pin of a.historicalSnapshotFiles)assert.equal(hash(fs.readFileSync(path.join(h.repo,pin.path))),pin.sha256);
    assert.equal(hash(fs.readFileSync(path.join(__dirname,'producer.cjs'))),hash(fs.readFileSync(path.join(__dirname,'../v1-draft/producer.cjs'))));
});
test.after(()=>{const dir='/private/tmp/next03-static-rebind';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'reader-probes.json'),JSON.stringify(receipt,null,2)+'\n');});
