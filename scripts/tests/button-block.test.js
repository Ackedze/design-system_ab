const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('history/r26-editor-0.2.46/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r26-editor-0.2.46/component-contract.v2.json.gz')))),prior=read('history/r25-editor-0.2.45/contract.manual.json');
const oldCompiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r25-editor-0.2.45/component-contract.v2.json.gz'))));
const review=read('qa/usage-transfer-live-review.2026-09-28.json'),item=review.reportResults[0];
const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
const id='component:web-core.button.block-maps-to-fill',contract=core.prepareAuthoringPreviewContract(compiled);
test('r26 retains 22 IDs; only block rule changes; facts and child pin remain exact',()=>{
 assert.equal(manual.metadata.revision,26);assert.equal(manual.rules.length,22);assert.equal(compiled.rules.length,55);assert.equal(compiled.nonExecutableRules.length,3);
 assert.deepEqual(manual.rules.map(r=>r.id),prior.rules.map(r=>r.id));assert.deepEqual(manual.rules.filter(r=>r.id!==id),prior.rules.filter(r=>r.id!==id));
 assert.equal(compiled.package.generatedFactsHash,oldCompiled.package.generatedFactsHash);assert.deepEqual(compiled.componentDependencies,oldCompiled.componentDependencies);
 assert.equal(compiled.runtimePolicy.validationIntentVersion,1);assert.equal(compiled.package.manualSourceHash,core.stableHash(manual));
 assert.equal(manual.rules.find(r=>r.id===id).execution.route,'predicate');assert.equal(compiled.status,'draft');
 assert.equal(read('runtime/component-contract.index.json').published,false);
});
test('r26 import/export uses shared compiler; no usage rules resurrect and projected manual matches',async()=>{
 const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r26-editor-0.2.46/Button.editor-input.zip'))));
 const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const bundle=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);
 assert.deepEqual(w.manual,manual);assert.equal(bundle.validation.valid,true);assert.equal(core.stableHash(bundle.compiled),core.stableHash(compiled));
 assert.deepEqual(compiled.coverage.byOwnership,{component:22,usage:0,unclassified:0});
});
function run({expected,sizing='FILL',mode='HORIZONTAL'}={}) {
 const snapshot=clone(report.snapshot),root=snapshot.nodes[0];root.layout.sizingHorizontal=sizing;root.parent={layout:{mode}};root.unknownFacts=root.unknownFacts.filter(f=>f!=='parent'&&!f.startsWith('parent.'));
 snapshot.validationIntent=core.createValidationIntent(snapshot,contract,expected===undefined?{}:{block:expected});
 const engine=core.evaluateCompiledContract(snapshot,contract),rows=engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
 return{snapshot,engine,rows,classes:rows.map(e=>e.classification)};
}
test('actual archived Button with synthetic block intent: true vs Fill/Hug/Fixed and parent NONE',()=>{
 assert.deepEqual(run({expected:true}).classes,['compliant','compliant']);
 for(const sizing of ['HUG','FIXED'])assert.deepEqual(run({expected:true,sizing}).classes,['violation','compliant']);
 assert.deepEqual(run({expected:true,sizing:'FIXED',mode:'NONE'}).classes,['violation','violation']);
});
test('unset is incomplete, false excludes only the block implication; other 93 evaluations remain unchanged',()=>{
 const snapshot=clone(report.snapshot);snapshot.validationIntent=core.createValidationIntent(snapshot,contract,{block:false});
 const engine=core.evaluateCompiledContract(snapshot,contract),comparable=({evaluationId,ruleRevision,...e})=>e;
 assert.equal(engine.evaluations.length,95);
 assert.deepEqual(engine.evaluations.filter(e=>!e.ruleId.startsWith(id+'.')).map(comparable),report.results.engine.evaluations.map(comparable));
 assert.deepEqual(run({expected:false}).classes,['not-applicable','not-applicable']);
 const unknown=run();assert.deepEqual(unknown.classes,['human-review','human-review']);
 const result=core.buildEditorValidationReport(unknown.engine,{contract:compiled,issues:[]},manual,core.prepareValidationSnapshot(unknown.snapshot,contract));
 assert.equal(result.scenarioCoverage.complete,false);
});
test('Button_Inverted gap is explicit and unconfirmed; ordinary palette is unchanged',()=>{
 assert.equal(manual.decisions.find(d=>d.id==='decision:core.web.button.inverted-loading-palette').status,'needs-confirmation');
 const palette=manual.rules.find(r=>r.id.endsWith('loading-spinner-style-follows-view'));
 assert.deepEqual(palette,prior.rules.find(r=>r.id===palette.id));assert.deepEqual(palette.applicability.context,{'semanticApi.colors':'default'});
 assert.ok(compiled.facts.decisions.some(d=>d.id==='decision:core.web.button.inverted-loading-palette'&&d.status==='needs-confirmation'));
});
test('r25 immutable compiled/report replay remains exact with new core',()=>{
 assert.deepEqual(core.evaluateCompiledContract(report.snapshot,report.sources.evaluatedContract||core.prepareAuthoringPreviewContract(report.sources.compiledContract)),report.results.engine);
});
