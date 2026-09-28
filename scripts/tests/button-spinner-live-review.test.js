const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const review=JSON.parse(fs.readFileSync(path.join(root,'qa/spinner-integration-live-review.2026-09-27.json')));
const reports=review.reportResults.map(item=>{const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));return {item,bytes,r:JSON.parse(bytes)};});
const clone=x=>JSON.parse(JSON.stringify(x)),get=id=>reports.find(x=>x.item.caseId===id).r;
const failures=r=>r.results.engine.evaluations.filter(e=>e.classification==='violation');

// These are immutable r16 observations, including known open defects. They do
// not approve those defects or change current manual policies automatically.
for(const {item,bytes,r}of reports)test(`${item.caseId}: pinned live integration report, exact replay and child provenance`,()=>{
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
 assert.equal(r.snapshot.source.rootNodeId,item.nodeId);assert.equal(r.run.manualRevision,16);
 assert.equal(r.editorVersion,'component-contract-editor@0.2.34');assert.equal(r.run.context.product,'ab');
 assert.equal(core.stableHash(r.sources.manual),review.manualSourceHash);assert.equal(r.run.manualSourceHash,review.manualSourceHash);
 assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 assert.deepEqual(r.sources.manual,reports[0].r.sources.manual);assert.deepEqual(r.sources.compiledContract,reports[0].r.sources.compiledContract);
 const child=r.sources.compiledContract.componentDependencies[0];assert.equal(child.revision,8);assert.equal(core.stableHash(child.contract),review.dependency.compiledHash);
 assert.equal(r.snapshot.source.truncated,false);assert.equal(r.run.capture.matchedBaselineNodes,r.snapshot.nodes.length);
 assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 const details=clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy));
 assert.deepEqual(engine,r.results.engine);assert.deepEqual(editor,r.results.editor);assert.deepEqual(details,r.results.details);
 assert.equal(engine.evaluations.length,item.engineEvaluations);
 const nested=engine.evaluations.filter(e=>e.dependency);assert.equal(nested.length,item.dependencyEvaluations);
 assert.ok(nested.every(e=>e.ruleId.includes('.spinner.')&&e.dependency.compiledHash===review.dependency.compiledHash));
 assert.ok(nested.every(e=>r.anatomy.some(n=>n.id===e.subjectNodeId)));
 const found=details.filter(d=>d.classification==='violation');assert.equal(found.length,item.atomicViolations);assert.equal(core.groupEvaluationDetails(found).length,item.uiCards);
 assert.equal(editor.scenarioCoverage.complete,false);assert.equal(editor.scenarioCoverage.notExecuted,item.notExecuted);assert.equal(editor.scenarioCoverage.inconclusive,0);
 assert.equal(editor.contractReadiness.status,'draft');
});

test('BS03: Button constrains nominal Size, independently valid Spinner24 is not a child violation',()=>{
 const r=get('BS03'),found=failures(r);assert.equal(found.length,1);assert.equal(found[0].dependency,undefined);
 assert.equal(found[0].ruleId,'component:web-core.button.addon-size-follows-button-size.1.8.1');
 const detail=r.results.details.find(d=>d.classification==='violation');assert.equal(detail.actual,'24');assert.deepEqual(detail.expected,['16']);
 const n=r.snapshot.nodes.find(n=>n.name==='Spinner');assert.equal(n.component.properties.Size,'24');assert.equal(n.bounds.width,24);assert.equal(n.bounds.height,24);
});
test('BS04: correct child intrinsic findings, but legacy parent reports two proven inactive gaps (open P0)',()=>{
 const r=get('BS04'),found=failures(r),child=found.filter(e=>e.dependency);assert.equal(child.length,2);
 assert.ok(child.every(e=>e.ruleId.includes('spinner.intrinsic-size-required')));
 const spinner=r.snapshot.nodes.find(n=>n.name==='Spinner');assert.equal(spinner.bounds.width,30);assert.equal(spinner.bounds.height,30);assert.equal(spinner.component.properties.Size,'24');
 assert.equal(spinner.baseline.effective.bounds.width,24);assert.equal(spinner.baseline.effective.bounds.height,24);
 for(const id of ['preview:2','preview:3']){
  const n=r.snapshot.nodes.find(n=>n.id===id);assert.equal(n.propertyActivityV1.gapApplicable,false);assert.equal(n.baseline.effective.propertyActivityV1.gapApplicable,false);
  const gaps=r.results.details.filter(e=>e.nodeId===id&&e.classification==='violation'&&e.factPath==='layout.itemSpacing');assert.equal(gaps.length,2);
  assert.ok(gaps.every(e=>e.actual===12.5&&e.expected===10&&e.ruleId.includes('.button.')));
 }
});
test('BS05: both owners report opacity, one card retains all four original source checks',()=>{
 const r=get('BS05'),found=failures(r);assert.equal(found.filter(e=>e.dependency).length,2);assert.equal(found.filter(e=>!e.dependency).length,2);
 const groups=core.groupEvaluationDetails(r.results.details.filter(e=>e.classification==='violation'));assert.equal(groups.length,1);assert.equal(groups[0].evaluations.length,4);
 assert.ok(groups[0].evaluations.every(e=>e.actual===.5&&e.expected===1));
 const capture=r.snapshot.componentDependencyCaptures[0],child=capture.snapshot.nodes.find(n=>capture.snapshot.selection.includes(n.id));
 assert.equal(child.appearance.opacity,.5);assert.equal(child.baseline.effective.appearance.opacity,1);
});
test('visible-label control skips child; known hidden text produces two extra parent coverage gaps (open P0)',()=>{
 const plain=get('BS07');assert.equal(plain.results.engine.evaluations.filter(e=>e.dependency).length,0);assert.equal(failures(plain).length,0);
 assert.deepEqual(plain.results.engine.dependencyRuns.map(d=>d.reason),['owner-variant-inactive','target-hidden']);
 for(const {r,item}of reports.filter(x=>x.item.caseId!=='BS07')){
  const text=r.snapshot.nodes.find(n=>n.semantic.role==='text');assert.ok(text);assert.equal(text.visibility.effective,false);
  const pending=r.results.editor.evaluations.filter(e=>e.classification==='not-executed'&&['component:web-core.button.label-and-hint-color-locked','component:web-core.button.label-text-style-locked'].includes(e.ruleId));
  assert.equal(pending.length,2,item.caseId);assert.equal(r.summary.notExecuted,plain.summary.notExecuted+2);
 }
});
test('missing child capture or wrong pinned bytes remains explicit not-executed under real live topology',()=>{
 for(const kind of ['capture','pin']){const r=clone(get('BS01'));if(kind==='capture')r.snapshot.componentDependencyCaptures=[];else r.runtime.evaluatedContract.componentDependencies[0].contract.rules[0].severity='tampered';
  const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);assert.equal(engine.dependencyRuns[0].status,'not-executed');
  assert.equal(engine.dependencyRuns[0].reason,kind==='capture'?'dependency-reference-not-captured':'dependency-pin-mismatch');
  assert.equal(engine.evaluations.filter(e=>e.dependency).length,0);
 }
});
