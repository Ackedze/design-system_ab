// These green reports exercise TL10A (SingleIcon), not the pending TL10B Loading fix.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fixture=read('qa/text-layout-test-cases.2026-09-29.json').cases.find(c=>c.caseId==='TL10A');
const manual=read('history/r28-editor-0.2.49/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r28-editor-0.2.49/component-contract.v2.json.gz'))));
const results=[];
for(const [time,mode] of [['23-36-32-504','component-audit'],['23-36-54-065','specification']]) {
 const name=`button.validation-report.2026-09-28T${time}Z.json`;
 const original=path.join(root,'editor',name),relative=`qa/fixtures/single-icon-r28-editor-0.2.49/${name}.gz`,archive=path.join(root,relative);
 const bytes=fs.existsSync(original)?fs.readFileSync(original):zlib.gunzipSync(fs.readFileSync(archive));
 const r=JSON.parse(bytes),s=r.snapshot;
 assert.equal(r.editorVersion,'component-contract-editor@0.2.49');assert.equal(r.run.manualRevision,28);
 assert.equal(core.stableHash(r.sources.manual),core.stableHash(manual));
 assert.equal(core.stableHash(r.sources.compiledContract),core.stableHash(compiled));
 assert.equal(core.stableHash(s),r.run.snapshotHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 assert.equal(s.source.rootNodeId,fixture.instanceId);assert.equal(s.source.componentKey,fixture.componentKey);
 assert.equal(s.nodes[0].component.properties.SingleIcon,'True');
 assert.equal(s.nodes.find(n=>n.id==='preview:2').component.properties.Type,'Icon-24');
 assert.equal(s.nodes.length,7);assert.equal(r.run.capture.matchedBaselineNodes,7);
 assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);assert.deepEqual(r.run.capture.warnings,[]);
 assert.equal(r.summary.validationMode,mode);assert.equal(r.summary.complete,true);
 assert.equal(r.summary.notExecuted,0);assert.equal(r.summary.inconclusive,0);
 assert.deepEqual(r.summary.classifications,{compliant:115,'not-applicable':42});
 if(mode==='specification')assert.deepEqual(s.validationIntent.values,{block:false});
 const engine=core.evaluateCompiledContract(s,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,s);
 const details=core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy);
 for(const [actual,expected] of [[engine,r.results.engine],[editor,r.results.editor],[details,r.results.details]])
  assert.equal(core.stableHash(actual),core.stableHash(expected));
 assert.equal(engine.evaluations.length,155);
 for(const e of engine.evaluations.filter(e=>e.ruleId.startsWith('component:web-core.button.text-resizing-maps-to-figma-layout.')))
  assert.equal(e.classification,'not-applicable');
 assert.equal(engine.dependencyRuns.length,2);
 assert.ok(engine.dependencyRuns.every(d=>d.status==='not-applicable'));
 if(fs.existsSync(archive))assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))),sha(bytes));
 else {fs.mkdirSync(path.dirname(archive),{recursive:true});fs.writeFileSync(archive,zlib.gzipSync(bytes),{flag:'wx'});}
 results.push({caseId:fixture.caseId,mode,rootNodeId:s.source.rootNodeId,componentKey:s.source.componentKey,
  originalFile:`editor/${name}`,fixtureFile:relative,sha256:sha(bytes),capturedAt:r.run.snapshotCapturedAt,
  engineEvaluations:155,capturedNodes:7,complete:true,classifications:r.summary.classifications,
  spinnerExecuted:false,replay:{engine:true,editor:true,details:true}});
}
const result={status:'single-icon-retest-accepted-loading-retest-still-pending',reviewedAt:'2026-09-29',
 editorVersion:'component-contract-editor@0.2.49',manualRevision:28,manualSourceHash:core.stableHash(manual),compiledStableHash:core.stableHash(compiled),
 engineEvaluations:310,matchedNodes:14,captureWarnings:0,reportResults:results,contractReady:false,
 acceptance:{singleIcon:true,loading:false},
 pending:{caseId:'TL10B',instanceId:'13100:90813',url:'https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13100-90813',
  reason:'Both submitted reports capture TL10A SingleIcon (7 nodes, Icon-24), not TL10B Loading (nested Spinner). They cannot prove the roleless Loading baseline fix live.',
  modes:['component-audit','specification'],specificationIntent:{block:false},textExpectation:'unset'}};
fs.writeFileSync(path.join(root,'qa/single-icon-r28-editor-0.2.49-live-review.2026-09-29.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,reports:results.length,engineEvaluations:result.engineEvaluations,matchedNodes:result.matchedNodes,oldReportReplayExact:true},null,2));
