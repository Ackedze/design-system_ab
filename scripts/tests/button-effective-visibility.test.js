const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button'),core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('history/r21-editor-0.2.40/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r21-editor-0.2.40/component-contract.v2.json.gz')))),runtime=core.prepareAuthoringPreviewContract(compiled);
const prior=read('history/r20-editor-0.2.39/contract.manual.json'),review=read('qa/loading-composition-live-review.2026-09-28.json');
const changed=['component:web-core.button.desktop-hint-restricted','component:web-core.button.hint-requires-large-size'];
const reports=review.reportResults.map(item=>({item,r:JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))))}));
const get=id=>reports.find(x=>x.item.caseId===id).r;
const findings=e=>e.evaluations.filter(x=>x.classification==='violation').map(x=>x.ruleId);

test('r21 preserves 26 RuleIDs, generated evidence and Spinner; changes two existing Hint rules and explicit semantic bindings',()=>{
 assert.equal(manual.metadata.revision,21);assert.deepEqual(manual.rules.map(r=>r.id),prior.rules.map(r=>r.id));
 assert.deepEqual(manual.rules.filter(r=>!changed.includes(r.id)),prior.rules.filter(r=>!changed.includes(r.id)));
 assert.ok(manual.rules.filter(r=>changed.includes(r.id)).every(r=>r.status==='draft'));
 const previous=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r20-editor-0.2.39/component-contract.v2.json.gz'))));
 assert.deepEqual(compiled.facts.variantEvidence,previous.facts.variantEvidence);assert.deepEqual(compiled.componentDependencies,previous.componentDependencies);
 assert.equal(compiled.rules.length,58);assert.equal(compiled.runtimePolicy.semanticTargetVisibilityVersion,1);
 const configured=manual.semanticApi.find(p=>p.id==='hintEnabled'),effective=manual.semanticApi.find(p=>p.id==='hintVisible');
 assert.deepEqual(configured.bindings,prior.semanticApi.find(p=>p.id==='hintVisible').bindings);
 assert.ok(effective.bindings.every(b=>b.targetId==='target.hint'&&b.path==='visibility.effective'));
 assert.ok(manual.generation.profiles.every(p=>!Object.hasOwn(p.properties,'hintVisible')));
 assert.equal(core.validateManualSource(manual).filter(i=>i.level==='error').length,0);
});

for(const {item,r}of reports)test(`${item.caseId}: r21 recomputes effective visibility, preserves all unrelated verdicts`,()=>{
 const snapshot=core.prepareValidationSnapshot(r.snapshot,runtime),engine=core.evaluateCompiledContract(snapshot,runtime);
 const classify=es=>es.filter(e=>!changed.some(id=>e.ruleId.startsWith(id+'.'))).map(e=>({id:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace}));
 assert.deepEqual(classify(engine.evaluations),classify(r.results.engine.evaluations));
 const expected=item.violationRuleIds.filter(id=>item.caseId!=='BL11'||!id.startsWith(changed[0]+'.'));
 assert.deepEqual(findings(engine),expected);
 assert.deepEqual(core.evaluateCompiledContract(JSON.parse(JSON.stringify(snapshot)),runtime),engine);
 assert.ok(!engine.evaluations.some(e=>['human-review','not-evaluable'].includes(e.classification)));
 const report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,snapshot);
 assert.equal(report.scenarioCoverage.complete,false);
});

test('BL11 and BL12 preserve configured true but differ in effective visibility; actual parent ancestry is authoritative',()=>{
 for(const [id,value,verdict]of [['BL11',false,'compliant'],['BL12',true,'violation']]){
  const s=core.prepareValidationSnapshot(get(id).snapshot,runtime),root=s.nodes[0];
  assert.equal(root.semanticApi.hintEnabled,true);assert.equal(root.semanticApi.hintVisible,value);
  assert.equal(root.semanticBindingEvidence.hintVisible.readOnly,true);
  assert.equal(core.evaluateCompiledContract(s,runtime).evaluations.find(e=>e.ruleId.startsWith(changed[0]+'.')).classification,verdict);
 }
 const single=core.prepareValidationSnapshot(get('BL10').snapshot,runtime);
 assert.equal(single.nodes[0].semanticApi.hintVisible,false);assert.equal(single.nodes[0].semanticBindingEvidence.hintVisible.confirmedAbsent,true);
});

test('unknown visibility or remap never inherits a stale false from exported semanticApi',()=>{
 for(const mutate of [
  s=>s.nodes.find(n=>n.name==='Hint').unknownFacts.push('visible'),
  s=>s.nodes.find(n=>n.name==='Text').unknownFacts.push('visible'),
  s=>{s.nodes.find(n=>n.name==='Hint').name='Renamed';},
  s=>{s.source.truncated=true;},
 ]){
  const s=clone(get('BL12').snapshot);s.nodes[0].semanticApi.hintVisible=false;mutate(s);
  const prepared=core.prepareValidationSnapshot(s,runtime);assert.equal(prepared.nodes[0].semanticApi.hintVisible,undefined);
  const engine=core.evaluateCompiledContract(prepared,runtime),report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,prepared);
  assert.notEqual(engine.evaluations.find(e=>e.ruleId.startsWith(changed[0]+'.'))?.classification,'compliant');
  assert.equal(report.scenarioCoverage.complete,false);
 }
});
