const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),plain=x=>JSON.parse(JSON.stringify(x));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const review=read('qa/effective-hint-visibility-live-review.2026-09-28.json');
const reports=review.reportResults.map(item=>{const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));return{item,bytes,r:JSON.parse(bytes)};});
const get=id=>reports.find(x=>x.item.caseId===id).r,rootNode=r=>r.snapshot.nodes.find(n=>r.snapshot.selection.includes(n.id));
const hint='component:web-core.button.desktop-hint-restricted',size='component:web-core.button.hint-requires-large-size',loading='component:web-core.button.loading-uses-addon-spinner';

for(const {item,bytes,r}of reports)test(`${item.caseId}: immutable live r21 report, exact replay and expected Hint/Loading verdicts`,()=>{
 assert.equal(sha(bytes),item.sha256);assert.equal(r.editorVersion,'component-contract-editor@0.2.40');
 assert.equal(r.run.manualRevision,21);assert.equal(r.run.trigger,'selected-instance');assert.equal(r.run.context.product,'ab');
 assert.equal(r.run.context.platform,'desktop');assert.equal(r.snapshot.source.rootNodeId,item.nodeId);assert.equal(r.snapshot.source.truncated,false);
 assert.equal(core.resolveCaptureRepresentation(r.sources.manual.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey).id,'core.web.button.figma.desktop');
 assert.equal(core.stableHash(r.sources.manual),review.manualSourceHash);assert.equal(r.run.manualSourceHash,review.manualSourceHash);
 assert.equal(core.stableHash(r.sources.compiledContract),review.compiledHash);assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 assert.equal(r.sources.compiledContract.componentDependencies[0].revision,8);
 assert.equal(core.stableHash(r.sources.compiledContract.componentDependencies[0].contract),review.dependencyCompiledHash);
 assert.equal(r.run.capture.matchedBaselineNodes,item.matchedNodes);assert.equal(r.snapshot.nodes.length,item.matchedNodes);
 assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);assert.deepEqual(r.run.capture.warnings,[]);
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 assert.deepEqual(plain(engine),r.results.engine);assert.deepEqual(plain(editor),r.results.editor);
 assert.deepEqual(plain(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
 assert.equal(engine.snapshotHash,r.run.engineSnapshotHash);assert.equal(engine.evaluations.length,item.engineEvaluations);
 assert.equal(engine.evaluations.filter(e=>e.dependency).length,item.dependencyEvaluations);
 assert.deepEqual(engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId),item.violationRuleIds);
 assert.equal(engine.evaluations.find(e=>e.ruleId===hint+'.1.1').classification,item.productHintClassification);
 assert.equal(engine.evaluations.find(e=>e.ruleId===size+'.1.1').classification,item.sizeHintClassification);
 const composition=engine.evaluations.filter(e=>e.ruleId.startsWith(loading+'.'));
 assert.deepEqual(composition.map(e=>e.classification),item.loading);assert.deepEqual(composition.map(e=>e.trace.actual),item.loadingActual);
 const node=rootNode(r);assert.equal(node.semanticApi.hintEnabled,item.hintEnabled);assert.equal(node.semanticApi.hintVisible,item.hintVisible);
 assert.equal(node.semanticBindingEvidence.hintVisible.confirmedAbsent,item.confirmedAbsent);assert.equal(node.semanticBindingEvidence.hintVisible.readOnly,true);
 assert.equal(editor.scenarioCoverage.notExecuted,item.notExecuted);assert.equal(editor.scenarioCoverage.inconclusive,0);assert.equal(editor.scenarioCoverage.complete,false);
 assert.equal(editor.contractReadiness.status,'draft');assert.equal(engine.evaluations.filter(e=>['human-review','not-evaluable'].includes(e.classification)).length,0);
});

test('BL11 configured true remains true; hidden Text suppresses effective Hint while BL12 retains both real findings',()=>{
 for(const [id,visible]of [['BL11',false],['BL12',true]]){
  const r=get(id),node=rootNode(r),hintNode=r.snapshot.nodes.find(n=>n.name==='Hint'),text=r.snapshot.nodes.find(n=>n.name==='Text');
  assert.equal(node.semanticApi.hintEnabled,true);assert.equal(node.semanticApi.hintVisible,visible);
  assert.equal(hintNode.visible,true);assert.equal(hintNode.parentId,text.id);assert.equal(text.visible,visible);
  assert.equal(node.semanticBindingEvidence.hintVisible.targetId,'target.hint');assert.equal(node.semanticBindingEvidence.hintVisible.path,'visibility.effective');
 }
 const details=get('BL12').results.details.filter(d=>d.classification==='violation');assert.equal(details.length,2);
 assert.deepEqual(details.map(d=>d.actual),[true,2]);
});

test('BL10 has no Hint/Label anatomy; confirmed absence is a known false, not an unresolved target',()=>{
 const r=get('BL10'),node=rootNode(r);assert.equal(node.semanticApi.singleIcon,true);
 assert.equal(r.snapshot.nodes.some(n=>['Hint','Label'].includes(n.name)),false);
 assert.equal(node.semanticBindingEvidence.hintVisible.confirmedAbsent,true);assert.equal(node.semanticApi.hintVisible,false);
 assert.ok(!node.unknownFacts.includes('semanticApi.hintVisible'));
});

test('new live reports preserve every unrelated r20 verdict and trace, including all child evaluations',()=>{
 const old=read('qa/loading-composition-live-review.2026-09-28.json');
 const normalized=es=>es.filter(e=>![hint,size].some(id=>e.ruleId.startsWith(id+'.'))).map(e=>({id:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace}));
 for(const{item,r}of reports){const prior=old.reportResults.find(x=>x.caseId===item.caseId),p=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,prior.fixtureFile))));
  assert.deepEqual(normalized(r.results.engine.evaluations),normalized(p.results.engine.evaluations));
 }
});

test('acceptance totals and incomplete coverage are explicit; normative artifacts remain unchanged',()=>{
 assert.equal(new Set(reports.map(x=>x.item.sha256)).size,3);assert.equal(new Set(reports.map(x=>x.item.nodeId)).size,3);
 assert.equal(reports.reduce((n,x)=>n+x.item.engineEvaluations,0),1258);assert.equal(reports.reduce((n,x)=>n+x.item.dependencyEvaluations,0),504);
 assert.equal(reports.reduce((n,x)=>n+x.item.matchedNodes,0),45);assert.deepEqual(reports.map(x=>x.item.notExecuted),[7,7,4]);
 assert.equal(review.status,'live-accepted');assert.equal(review.normativeChanges,false);assert.equal(review.runtimeChanges,false);
 const implementation=read(review.implementation);
 assert.equal(sha(fs.readFileSync(path.join(root,'history/r21-editor-0.2.40/contract.manual.json'))),implementation.hashes.manualFileSha256);
 assert.equal(sha(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r21-editor-0.2.40/component-contract.v2.json.gz')))),implementation.hashes.compiledFileSha256);
 // The mutable installation ZIP is r22 now; r21 normative artifacts and exact live JSON stay pinned above.
 for(const{r}of reports){assert.equal(r.summary.complete,false);assert.equal(r.results.editor.contractReadiness.unimplementedRules,9);
  assert.ok(r.results.editor.evaluations.some(e=>e.ruleId==='component:web-core.button.loading-preserves-width'&&e.classification==='not-executed'));
 }
});
