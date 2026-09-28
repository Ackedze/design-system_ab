const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('history/r20-editor-0.2.39/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r20-editor-0.2.39/component-contract.v2.json.gz'))));
const before=read('history/r18-editor-0.2.38/contract.manual.json');
const id='component:web-core.button.loading-uses-addon-spinner';
test('r20 changes one existing Loading RuleID, preserves other normative rules, child pin and generated evidence',()=>{
 assert.equal(manual.metadata.revision,20);assert.equal(manual.rules.length,26);
 const normalized=clone(manual);normalized.rules=before.rules;normalized.metadata=before.metadata;assert.deepEqual(normalized,before);
 assert.deepEqual(manual.rules.filter(r=>r.id!==id),before.rules.filter(r=>r.id!==id));
 const r=manual.rules.find(r=>r.id===id);assert.equal(r.status,'draft');assert.equal(r.execution.route,'predicate');assert.equal(r.applicability.activeDependency,'spinner');
 assert.deepEqual(r.constraints,[{type:'quantity',contractDependencyId:'spinner',min:1,max:1},{type:'quantity',targetRoles:['label','hint'],visibleOnly:true,min:0,max:0},{type:'quantity',targetRoles:['left-addon','right-addon'],visibleOnly:true,min:1,max:1}]);
 const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r18-editor-0.2.38/component-contract.v2.json.gz'))));
 assert.deepEqual(compiled.facts.variantEvidence,old.facts.variantEvidence);assert.deepEqual(compiled.componentDependencies,old.componentDependencies);
 assert.equal(compiled.rules.length,58);assert.equal(compiled.status,'draft');
 assert.equal(manual.rules.find(r=>r.id.endsWith('loading-preserves-width')).execution.route,'context-only');
});
const prior=read('qa/selection-key-live-review.2026-09-28.json');
for(const item of prior.reportResults)test(`${item.caseId}: r20 adds three composition checks, prior verdicts/traces preserved`,()=>{
 const r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
 const c=core.prepareAuthoringPreviewContract(compiled),engine=core.evaluateCompiledContract(r.snapshot,c);
 const own=engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));assert.deepEqual(own.map(e=>e.classification),['compliant','compliant','compliant']);
 const project=es=>clone(es.map(e=>({ruleId:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace,dependency:e.dependency})));
 assert.deepEqual(project(engine.evaluations.filter(e=>!e.ruleId.startsWith(id+'.'))),project(r.results.engine.evaluations));
 const report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,r.snapshot);
 assert.equal(report.scenarioCoverage.notExecuted,r.results.editor.scenarioCoverage.notExecuted-1);
 assert.equal(report.scenarioCoverage.complete,false);
});
test('visible Label is a composition violation; unused family values and hidden text are not',()=>{
 const item=prior.reportResults.find(i=>i.caseId==='BP01'),r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
 const c=core.prepareAuthoringPreviewContract(compiled),snap=clone(r.snapshot);
 const label=snap.nodes.find(n=>n.name==='Label'),text=snap.nodes.find(n=>n.name==='Text');
 label.visible=true;text.visible=true;
 let e=core.evaluateCompiledContract(snap,c).evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
 assert.deepEqual(e.map(v=>v.classification),['compliant','violation','compliant']);
 text.visible=false;e=core.evaluateCompiledContract(snap,c).evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
 assert.deepEqual(e.map(v=>v.classification),['compliant','compliant','compliant']);
});

function fixture(){
 const item=prior.reportResults.find(i=>i.caseId==='BP01');
 const snap=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)))).snapshot;
 const c=core.prepareAuthoringPreviewContract(compiled);
 return {snap,run:()=>core.evaluateCompiledContract(snap,c).evaluations.filter(e=>e.ruleId.startsWith(id+'.')).map(e=>e.classification)};
}
test('r20 extends r19 only through manual constraints; no parallel rule or child override',()=>{
 const old=read('history/r19-editor-0.2.39/contract.manual.json'),normalized=clone(manual);
 normalized.rules=old.rules;normalized.metadata=old.metadata;assert.deepEqual(normalized,old);
 assert.deepEqual(manual.rules.filter(r=>r.id!==id),old.rules.filter(r=>r.id!==id));
 assert.match(manual.rules.find(r=>r.id===id).rationale,/Владелец подтвердил 2026-09-28/);
 assert.equal(core.stableHash(compiled.componentDependencies[0].contract),'909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221');
});
test('visible Hint fails without visible Label; hidden Hint text is not additional content',()=>{
 const f=fixture(),hint=f.snap.nodes.find(n=>n.name==='Hint'),text=f.snap.nodes.find(n=>n.name==='Text');
 assert.ok(hint);text.visible=true;hint.visible=true;
 assert.deepEqual(f.run(),['compliant','violation','compliant']);
 hint.visible=false;assert.deepEqual(f.run(),['compliant','compliant','compliant']);
 hint.visible=true;text.visible=false;assert.deepEqual(f.run(),['compliant','compliant','compliant']);
});
test('a second visible Icon addon fails the sole-addon count even though Spinner count remains one',()=>{
 const f=fixture(),right=f.snap.nodes.find(n=>n.name==='RightAddon'&&n.type==='FRAME');
 right.visible=true;assert.deepEqual(f.run(),['compliant','compliant','violation']);
 right.visible=false;assert.deepEqual(f.run(),['compliant','compliant','compliant']);
});
test('unknown text or addon visibility cannot be accepted as hidden',()=>{
 for(const name of ['Hint','RightAddon']){
  const f=fixture(),node=f.snap.nodes.find(n=>n.name===name&&(name==='Hint'||n.type==='FRAME'));
  if(name==='Hint')f.snap.nodes.find(n=>n.name==='Text').visible=true;
  node.unknownFacts.push('visible');
  assert.ok(f.run().includes('human-review'));
 }
});
