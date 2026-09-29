// Live acceptance of the compiler-only target exclusion fix; never marks the full contract Ready.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fixture=read('qa/text-layout-test-cases.2026-09-29.json').cases.find(c=>c.caseId==='TL10B');
const manual=read('history/r28-editor-0.2.49/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r28-editor-0.2.49/component-contract.v2.json.gz'))));
const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r28-editor-0.2.48/component-contract.v2.json.gz'))));
const baseline='component:web-core.button.internal-sizing-locked.1.1';
const width='component:web-core.button.loading-preserves-width',nowrap='component:web-core.button.nowrap-maps-to-figma-layout';
const results=[];
for(const [time,mode] of [['23-40-40-795','specification'],['23-40-55-094','component-audit']]) {
 const name=`button.validation-report.2026-09-28T${time}Z.json`;
 const original=path.join(root,'editor',name),relative=`qa/fixtures/loading-r28-editor-0.2.49/${name}.gz`,archive=path.join(root,relative);
 const bytes=fs.existsSync(original)?fs.readFileSync(original):zlib.gunzipSync(fs.readFileSync(archive));
 const r=JSON.parse(bytes),s=r.snapshot;
 assert.equal(r.editorVersion,'component-contract-editor@0.2.49');assert.equal(r.run.manualRevision,28);
 assert.equal(core.stableHash(r.sources.manual),core.stableHash(manual));
 assert.equal(core.stableHash(r.sources.compiledContract),core.stableHash(compiled));
 assert.equal(core.stableHash(s),r.run.snapshotHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 assert.equal(s.source.rootNodeId,fixture.instanceId);assert.equal(s.source.componentKey,fixture.componentKey);
 const addon=s.nodes.find(n=>n.id==='preview:2');
 assert.equal(addon.semantic.role,undefined);assert.equal(addon.component.properties.Type,'Spinner');
 assert.equal(addon.layout.sizingHorizontal,'HUG');assert.equal(addon.baseline.effective.layout.sizingHorizontal,'HUG');
 assert.equal(s.nodes.length,18);assert.equal(r.run.capture.matchedBaselineNodes,18);
 assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);assert.deepEqual(r.run.capture.warnings,[]);
 assert.equal(r.summary.validationMode,mode);assert.equal(r.summary.complete,false);assert.equal(r.summary.inconclusive,0);
 assert.equal(r.summary.notExecuted,mode==='specification'?2:1);
 if(mode==='specification')assert.deepEqual(s.validationIntent.values,{block:false});
 const engine=core.evaluateCompiledContract(s,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,s);
 const details=core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy);
 for(const [actual,expected] of [[engine,r.results.engine],[editor,r.results.editor],[details,r.results.details]])
  assert.equal(core.stableHash(actual),core.stableHash(expected));
 assert.equal(engine.evaluations.length,354);
 // Engine's missing temporal evidence is explicitly surfaced as not-executed by Editor coverage.
 assert.deepEqual(engine.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification))
  .map(e=>({ruleId:e.ruleId,classification:e.classification})),[{ruleId:width+'.1.1',classification:'human-review'}]);
 const childCounts=engine.evaluations.filter(e=>e.dependency).reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{});
 assert.deepEqual(childCounts,{compliant:100,'not-applicable':68});
 assert.equal(engine.evaluations.find(e=>e.ruleId===baseline&&e.subjectNodeId===addon.id).classification,'compliant');
 const text=engine.evaluations.filter(e=>e.ruleId.startsWith('component:web-core.button.text-resizing-maps-to-figma-layout.'));
 assert.equal(text.length,2);assert.ok(text.every(e=>e.classification==='not-applicable'));
 const left=engine.dependencyRuns.find(d=>d.bindingId==='left'),right=engine.dependencyRuns.find(d=>d.bindingId==='right');
 assert.equal(left.status,'executed');assert.equal(left.evaluations,168);assert.equal(left.revision,8);
 assert.equal(right.status,'not-applicable');assert.equal(right.reason,'target-hidden');
 const exceptions=editor.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification));
 assert.deepEqual(exceptions.map(e=>e.ruleId).sort(),(mode==='specification'?[width,nowrap]:[width]).sort());
 assert.ok(exceptions.every(e=>e.classification==='not-executed'));
 const before=core.evaluateCompiledContract(s,core.prepareAuthoringPreviewContract(old)),delta=[];
 assert.equal(before.evaluations.length,engine.evaluations.length);
 for(let i=0;i<engine.evaluations.length;i++) {
  const a=engine.evaluations[i],b=before.evaluations[i];assert.equal(a.ruleId,b.ruleId);assert.equal(a.subjectNodeId,b.subjectNodeId);
  if(a.classification!==b.classification)delta.push({ruleId:a.ruleId,node:a.subjectNodeId,before:b.classification,after:a.classification});
 }
 assert.deepEqual(delta,[{ruleId:baseline,node:addon.id,before:'human-review',after:'compliant'}]);
 if(fs.existsSync(archive))assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))),sha(bytes));
 else {fs.mkdirSync(path.dirname(archive),{recursive:true});fs.writeFileSync(archive,zlib.gzipSync(bytes),{flag:'wx'});}
 results.push({caseId:fixture.caseId,mode,rootNodeId:s.source.rootNodeId,componentKey:s.source.componentKey,
  originalFile:`editor/${name}`,fixtureFile:relative,sha256:sha(bytes),capturedAt:r.run.snapshotCapturedAt,
  engineEvaluations:354,capturedNodes:18,complete:false,inconclusive:0,notExecuted:r.summary.notExecuted,
  classifications:r.summary.classifications,spinner:{revision:8,status:left.status,evaluations:left.evaluations,classifications:childCounts},
  exceptions:exceptions.map(e=>({ruleId:e.ruleId,classification:e.classification,reason:e.trace.reason})),
  comparisonWithOldCompiler:delta,replay:{engine:true,editor:true,details:true}});
}
const result={status:'loading-baseline-exclusion-live-accepted',reviewedAt:'2026-09-29',
 editorVersion:'component-contract-editor@0.2.49',manualRevision:28,manualSourceHash:core.stableHash(manual),compiledStableHash:core.stableHash(compiled),
 engineEvaluations:708,matchedNodes:36,captureWarnings:0,reportResults:results,contractReady:false,
 acceptance:{loadingBaselineFix:true,hiddenTextApplicability:true,spinnerDependencyExecution:true},
 limits:['No before-state: width transition not executed, not accepted by this retest.','Specification nowrap is still context-only with unknown applicability; separate P0.','Full Button contract remains Draft/unpublished. No manual, compiled or runtime changes in this acceptance.']};
fs.writeFileSync(path.join(root,'qa/loading-r28-editor-0.2.49-live-review.2026-09-29.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,reports:results.length,engineEvaluations:result.engineEvaluations,matchedNodes:result.matchedNodes,replayExact:true,contractReady:false},null,2));
