const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json'),old=read('history/r21-editor-0.2.40/contract.manual.json');
const prior=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r21-editor-0.2.40/component-contract.v2.json.gz'))));
const id='component:web-core.button.loading-preserves-width';
test('r22 changes exactly the existing width rule; no new IDs, copied Spinner rules or generated facts',()=>{
 assert.equal(manual.metadata.revision,22);assert.deepEqual(manual.rules.map(r=>r.id),old.rules.map(r=>r.id));
 assert.deepEqual(manual.rules.filter(r=>r.id!==id),old.rules.filter(r=>r.id!==id));
 const n=clone(manual);n.metadata=old.metadata;n.rules=old.rules;assert.deepEqual(n,old);
 const r=manual.rules.find(r=>r.id===id);assert.equal(r.status,'draft');assert.equal(r.execution.route,'predicate');
 assert.equal(r.constraints[0].type,'transitionInvariant');assert.equal(r.constraints[0].transition.tolerance,.01);
 assert.deepEqual(compiled.facts.variantEvidence,prior.facts.variantEvidence);assert.deepEqual(compiled.componentDependencies,prior.componentDependencies);
 assert.equal(compiled.rules.length,59);assert.equal(compiled.runtimePolicy.transitionFactsVersion,1);
 assert.equal(compiled.rules.find(r=>r.ruleId===id+'.1.1').assert.predicate,'approximately-equals');
 assert.equal(core.buildContractReadiness({contract:compiled,issues:[]},manual).unimplementedRules,8);
});
test('archived single-state reports cannot prove temporal width; all unrelated verdicts remain unchanged',()=>{
 const manifest=read('qa/effective-hint-visibility-live-review.2026-09-28.json');
 for(const item of manifest.reportResults){const r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
  const runtime=core.prepareAuthoringPreviewContract(compiled),engine=core.evaluateCompiledContract(r.snapshot,runtime);
  const trace=es=>es.filter(e=>!e.ruleId.startsWith(id+'.')).map(e=>({id:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace}));
  assert.deepEqual(trace(engine.evaluations),trace(r.results.engine.evaluations));
  assert.equal(engine.evaluations.find(e=>e.ruleId===id+'.1.1').classification,'human-review');
  const report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,r.snapshot);
  assert.equal(report.evaluations.find(e=>e.ruleId===id).classification,'not-executed');assert.equal(report.scenarioCoverage.complete,false);
 }
});
test('ZIP/projections remain derived from one manual and the independent Spinner pin',async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/Button.editor-input.zip')));
 const ws=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(ws.manual,manual);const bundle=core.buildExportBundle(ws.manual,ws.variantEvidence,ws.dependencyContracts);
 assert.equal(bundle.validation.valid,true);assert.deepEqual(clone(bundle.compiled),compiled);
 for(const p of ['projections/athena/manual-overlay.json','projections/ds-ai-hub/component.json'])assert.deepEqual(read(p).componentDependencies,manual.componentDependencies);
 assert.equal(read('runtime/component-contract.index.json').published,false);
});
