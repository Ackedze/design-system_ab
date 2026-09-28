const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const review=JSON.parse(fs.readFileSync(path.join(root,'qa/selection-key-live-review.2026-09-28.json')));
const previous=JSON.parse(fs.readFileSync(path.join(root,'qa/spinner-palette-live-review.2026-09-28.json')));
const clone=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const load=item=>{const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));return {item,bytes,r:JSON.parse(bytes)};};
const reports=review.reportResults.map(load),get=id=>reports.find(x=>x.item.caseId===id).r;
const palette=r=>r.results.engine.evaluations.filter(e=>e.ruleId.includes('loading-spinner-style-follows-view.')).map(e=>e.classification);

for(const {item,bytes,r}of reports)test(`${item.caseId}: live 0.2.38 identity/platform, exact replay and child execution`,()=>{
 assert.equal(sha(bytes),item.sha256);assert.equal(r.editorVersion,'component-contract-editor@0.2.38');
 assert.equal(r.run.manualRevision,18);assert.equal(r.run.context.product,'ab');assert.equal(r.run.context.platform,item.platform);
 assert.equal(r.snapshot.source.rootNodeId,item.nodeId);assert.equal(r.snapshot.source.representationId,item.representationId);
 const rep=core.resolveCaptureRepresentation(r.sources.manual.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey);
 assert.equal(rep.id,item.representationId);assert.equal(rep.platform,item.platform);
 assert.equal(core.stableHash(r.sources.manual),review.manualSourceHash);assert.equal(r.run.manualSourceHash,review.manualSourceHash);
 assert.equal(core.stableHash(r.sources.compiledContract),review.compiledHash);assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 assert.equal(core.stableHash(r.sources.compiledContract.componentDependencies[0].contract),review.dependencyCompiledHash);
 assert.equal(r.sources.compiledContract.componentDependencies[0].revision,8);
 assert.equal(r.snapshot.source.truncated,false);assert.equal(r.run.capture.matchedBaselineNodes,18);
 assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
 const platforms=[];const walk=x=>{if(x&&typeof x==='object'){if(x.context?.platform)platforms.push(x.context.platform);Object.values(x).forEach(walk);}};
 walk(r.snapshot);assert.ok(platforms.length>2);assert.ok(platforms.every(p=>p===item.platform));
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 assert.deepEqual(clone(engine),r.results.engine);assert.deepEqual(clone(editor),r.results.editor);
 assert.deepEqual(clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
 assert.equal(engine.snapshotHash,r.run.engineSnapshotHash);assert.equal(engine.evaluations.length,item.engineEvaluations);
 assert.equal(engine.evaluations.filter(e=>e.dependency).length,168);assert.deepEqual(palette(r),item.palette);
 assert.equal(engine.evaluations.filter(e=>['violation','human-review','not-evaluable'].includes(e.classification)).length,0);
 assert.equal(editor.scenarioCoverage.notExecuted,item.notExecuted);assert.equal(editor.scenarioCoverage.inconclusive,0);
 assert.equal(editor.scenarioCoverage.complete,false);assert.equal(editor.contractReadiness.status,'draft');
});

test('BP08 live result resolves the original mobile capture bug without changing the normative contract',()=>{
 const old=load(previous.reportResults.find(x=>x.caseId==='BP08')).r,current=get('BP08');
 assert.deepEqual(current.sources.manual,old.sources.manual);assert.deepEqual(current.sources.compiledContract,old.sources.compiledContract);
 assert.equal(current.component.platform,'desktop','canonical manual metadata is not the captured platform');
 assert.equal(current.run.context.platform,'mobile-web');assert.equal(current.snapshot.source.representationId,'core.web.button.figma.mobile');
 assert.equal(old.summary.classifications['human-review'],53);assert.equal(current.summary.classifications['human-review'],undefined);
 assert.equal(old.results.engine.evaluations.filter(e=>e.dependency).length,0);
 assert.equal(current.results.engine.evaluations.filter(e=>e.dependency).length,168);
 assert.deepEqual(palette(current),['compliant','not-applicable','compliant','not-applicable']);
});

test('Desktop and Inverted retain earlier verdicts and traces under the same r18 rules',()=>{
 const normalized=r=>r.results.engine.evaluations.map(e=>({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,classification:e.classification,applicability:e.applicability,trace:e.trace}));
 for(const caseId of ['BP01','BP13'])assert.deepEqual(normalized(get(caseId)),normalized(load(previous.reportResults.find(x=>x.caseId===caseId)).r));
 assert.ok(palette(get('BP13')).every(c=>c==='not-applicable'));
});

test('four submitted filenames contain only three unique runs; duplicate cannot satisfy reverse-routing acceptance',()=>{
 assert.equal(review.verification.submittedFiles,4);assert.equal(review.reportResults.length,3);assert.equal(review.duplicateSubmissions.length,1);
 const duplicate=review.duplicateSubmissions[0],original=reports.find(x=>x.item.file===duplicate.duplicateOf);
 assert.equal(duplicate.sha256,sha(original.bytes));assert.equal(duplicate.fixtureFile,original.item.fixtureFile);
 assert.equal(original.item.caseId,'BP13');assert.equal(review.nextLiveCheck.selectedInstance,'BP01 [D] Button');
 assert.equal(review.nextLiveCheck.authoring,'[M] Button');assert.equal(review.nextLiveCheck.status,'pending-independent-report');
});

test('accepted runtime scenarios are not a Ready contract or a completed Loading implementation',()=>{
 assert.equal(review.contractStatus,'draft');assert.equal(review.normativeChanges,false);assert.equal(review.runtimeChanges,false);
 assert.deepEqual(reports.map(x=>x.r.summary.notExecuted),[8,8,9]);
 for(const {r}of reports)for(const id of ['loading-preserves-width','loading-uses-addon-spinner'])
  assert.ok(r.results.editor.evaluations.some(e=>e.ruleId===`component:web-core.button.${id}`&&e.classification==='not-executed'));
 assert.equal(reports.reduce((n,x)=>n+x.r.results.engine.evaluations.length,0),1095);
});

const finalReview=JSON.parse(fs.readFileSync(path.join(root,'qa/selection-key-final-review.2026-09-28.json')));
const finalReport=load(finalReview.reportResults[0]);

test('final independent BP01 capture: actual desktop identity, exact replay and all 168 child checks',()=>{
 const {item,bytes,r}=finalReport;
 assert.equal(sha(bytes),item.sha256);assert.notEqual(item.sha256,review.reportResults.find(x=>x.caseId==='BP01').sha256);
 assert.equal(r.editorVersion,'component-contract-editor@0.2.38');assert.equal(r.run.trigger,'selected-instance');
 assert.equal(r.run.manualRevision,18);assert.equal(r.run.context.product,'ab');assert.equal(r.snapshot.source.rootNodeId,'13038:67738');
 const rep=core.resolveCaptureRepresentation(r.sources.manual.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey);
 assert.equal(rep.id,'core.web.button.figma.desktop');assert.equal(r.snapshot.source.representationId,rep.id);
 assert.equal(rep.platform,'desktop');assert.equal(r.run.context.platform,rep.platform);
 assert.equal(core.stableHash(r.sources.manual),finalReview.manualSourceHash);assert.equal(r.run.manualSourceHash,finalReview.manualSourceHash);
 assert.equal(core.stableHash(r.sources.compiledContract),finalReview.compiledHash);assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 assert.deepEqual(clone(engine),r.results.engine);assert.deepEqual(clone(editor),r.results.editor);
 assert.deepEqual(clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
 assert.equal(engine.snapshotHash,r.run.engineSnapshotHash);assert.equal(engine.evaluations.length,398);
 assert.equal(engine.evaluations.filter(e=>e.dependency).length,168);
 assert.equal(engine.evaluations.filter(e=>['violation','human-review','not-evaluable'].includes(e.classification)).length,0);
 assert.deepEqual(palette(r),['compliant','not-applicable','compliant','not-applicable']);
 assert.equal(r.run.capture.matchedBaselineNodes,18);assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
 assert.equal(editor.scenarioCoverage.notExecuted,8);assert.equal(editor.scenarioCoverage.complete,false);
});

test('final key-routing acceptance leaves manual, Spinner pin and all existing BP01 verdicts/traces unchanged',()=>{
 const r=finalReport.r,old=get('BP01');
 assert.deepEqual(r.sources.manual,old.sources.manual);assert.deepEqual(r.sources.compiledContract,old.sources.compiledContract);
 assert.deepEqual(r.runtime.evaluatedContract,old.runtime.evaluatedContract);
 const normalized=x=>x.results.engine.evaluations.map(e=>({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,classification:e.classification,applicability:e.applicability,trace:e.trace}));
 assert.deepEqual(normalized(r),normalized(old));assert.equal(r.sources.compiledContract.componentDependencies[0].revision,8);
 assert.equal(finalReview.status,'accepted');assert.equal(finalReview.contractStatus,'draft');
 assert.equal(finalReview.normativeChanges,false);assert.equal(finalReview.runtimeChanges,false);
 assert.equal(finalReview.testContext.requestedAuthoringRepresentation,'[M] Button');
 assert.match(finalReview.testContext.authoringEvidence,/dropdown-is-not-serialized/);
 assert.equal(finalReview.nextTask,'component:web-core.button.loading-uses-addon-spinner');
});
