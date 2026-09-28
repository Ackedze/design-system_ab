const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const review=JSON.parse(fs.readFileSync(path.join(root,'qa/spinner-palette-live-review.2026-09-28.json')));
const clone=x=>JSON.parse(JSON.stringify(x)),rule='component:web-core.button.loading-spinner-style-follows-view';
const reports=review.reportResults.map(item=>{const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));return {item,bytes,r:JSON.parse(bytes)};});

for(const {item,bytes,r}of reports)test(`${item.caseId}: immutable r18 live report preserves exact JSON engine/coverage/details replay`,()=>{
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
 assert.equal(r.snapshot.source.rootNodeId,item.nodeId);assert.equal(r.run.manualRevision,18);
 assert.equal(r.editorVersion,'component-contract-editor@0.2.37');assert.equal(r.run.context.product,'ab');
 assert.equal(core.stableHash(r.sources.manual),review.manualSourceHash);assert.equal(core.stableHash(r.sources.compiledContract),review.compiledHash);
 assert.equal(r.run.manualSourceHash,review.manualSourceHash);assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
 const child=r.sources.compiledContract.componentDependencies[0];assert.equal(child.revision,8);assert.equal(core.stableHash(child.contract),review.dependency.compiledHash);
 assert.equal(r.snapshot.source.truncated,false);assert.equal(r.run.capture.matchedBaselineNodes,item.matchedNodes);
 assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 assert.deepEqual(clone(engine),r.results.engine);assert.deepEqual(clone(editor),r.results.editor);
 assert.deepEqual(clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
 assert.equal(engine.evaluations.length,item.engineEvaluations);assert.equal(engine.evaluations.filter(e=>e.dependency).length,item.dependencyEvaluations);
 assert.equal(engine.evaluations.filter(e=>e.classification==='violation').length,item.atomicViolations);
 assert.deepEqual(engine.evaluations.filter(e=>e.ruleId.startsWith(rule+'.')).map(e=>e.classification),item.palette);
 assert.equal(editor.scenarioCoverage.notExecuted,item.notExecuted);assert.equal(editor.scenarioCoverage.complete,false);assert.equal(editor.contractReadiness.status,'draft');
});

test('four live negative palette cases identify the exact property and direction, without extra child violations',()=>{
 const expected={BP09:['Inverted','False','True'],BP10:['Static','False','True'],BP11:['Static','True','False'],BP12:['Inverted','True','False']};
 for(const {item,r}of reports.filter(x=>expected[x.item.caseId])){
  const [property,actual,value]=expected[item.caseId],found=r.results.details.filter(d=>d.classification==='violation');
  assert.equal(found.length,1);assert.match(found[0].capability,new RegExp(property));assert.equal(found[0].actual,actual);assert.deepEqual(found[0].expected,[value]);
  assert.ok(found[0].ruleId.startsWith(rule+'.'));assert.ok(r.results.engine.evaluations.filter(e=>e.dependency).every(e=>e.classification!=='violation'));
 }
});

test('BP08 documents the original desktop-context defect, not mobile palette acceptance',()=>{
 const r=reports.find(x=>x.item.caseId==='BP08').r;
 const rep=core.resolveCaptureRepresentation(r.sources.manual.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey);
 assert.equal(rep.platform,'mobile-web');assert.equal(r.run.context.platform,'desktop');assert.equal(r.summary.classifications['human-review'],53);
 assert.ok(r.results.engine.dependencyRuns.every(d=>d.status==='not-executed'));
 assert.equal(review.status,'12-cases-accepted-mobile-capture-retest-required');
});

test('BP08 simulation: corrected capture context for root AND independent references restores palette and child execution',()=>{
 const original=reports.find(x=>x.item.caseId==='BP08').r,r=clone(original);
 const rep=core.resolveCaptureRepresentation(r.sources.manual.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey);
 // Simulation only. New plugin applies this platform at collectNodes time to
 // every independent reference; never rewrite the archived report as a pass.
 const setPlatform=value=>{if(value&&typeof value==='object'){if(value.context?.platform)value.context.platform=rep.platform;Object.values(value).forEach(setPlatform);}};
 setPlatform(r.snapshot);r.snapshot.source.representationId=rep.id;
 const s=core.prepareValidationSnapshot(r.snapshot,r.runtime.evaluatedContract),engine=core.evaluateCompiledContract(s,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,s);
 assert.deepEqual(engine.evaluations.filter(e=>e.ruleId.startsWith(rule+'.')).map(e=>e.classification),['compliant','not-applicable','compliant','not-applicable']);
 assert.equal(engine.evaluations.filter(e=>['human-review','not-evaluable','violation'].includes(e.classification)).length,0);
 assert.equal(engine.evaluations.filter(e=>e.dependency).length,168);assert.equal(editor.scenarioCoverage.notExecuted,8);
 assert.equal(editor.scenarioCoverage.complete,false);assert.equal(original.snapshot.context.platform,'desktop');
});
