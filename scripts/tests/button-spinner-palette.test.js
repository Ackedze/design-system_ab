const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
// Historical r18 acceptance is immutable; later rules must not rewrite these expectations.
const manual=read('history/r18-editor-0.2.38/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r18-editor-0.2.38/component-contract.v2.json.gz')))),before=read('history/r17-editor-0.2.36/contract.manual.json');
const ruleId='component:web-core.button.loading-spinner-style-follows-view';
test('r18 changes exactly one existing rule, surface bindings, explicit scope decision and revision; child/facts and remaining rules preserved',()=>{
 assert.equal(manual.metadata.revision,18);assert.equal(manual.rules.length,26);
 assert.deepEqual(manual.rules.map(r=>r.id),before.rules.map(r=>r.id));
 assert.deepEqual(manual.rules.filter(r=>r.id!==ruleId),before.rules.filter(r=>r.id!==ruleId));
 assert.equal(manual.rules.find(r=>r.id===ruleId).status,'draft');
 const normalized=clone(manual);normalized.rules=before.rules;normalized.metadata=before.metadata;normalized.decisions=before.decisions;
 normalized.semanticApi.find(p=>p.id==='colors').bindings=before.semanticApi.find(p=>p.id==='colors').bindings;
 assert.deepEqual(normalized,before);
 assert.equal(manual.decisions.length,before.decisions.length+1);
 const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r17-editor-0.2.36/component-contract.v2.json.gz'))));
 assert.deepEqual(compiled.facts.variantEvidence,old.facts.variantEvidence);
 assert.deepEqual(compiled.componentDependencies,old.componentDependencies);
 assert.equal(compiled.rules.length,55);assert.equal(compiled.rules.filter(r=>r.ruleId.startsWith(ruleId+'.')).length,4);
 assert.equal(compiled.nonExecutableRules.some(r=>r.sourceRuleId===ruleId),false);
});
const review=read('qa/ownership-scope-live-review.2026-09-27.json');
for(const item of review.reportResults)test(`${item.caseId}: r18 adds only palette evaluations; prior parent/child verdicts and traces unchanged`,()=>{
 const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
 const r=JSON.parse(bytes),contract=core.prepareAuthoringPreviewContract(compiled),engine=core.evaluateCompiledContract(r.snapshot,contract);
 const report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,r.snapshot);
 const palette=engine.evaluations.filter(e=>e.ruleId.startsWith(ruleId+'.'));
 assert.equal(palette.length,4);
 assert.equal(palette.filter(e=>e.classification==='compliant').length,item.caseId==='BS07'?0:2);
 assert.equal(palette.filter(e=>e.classification==='not-applicable').length,item.caseId==='BS07'?4:2);
 const project=entries=>entries.map(e=>({ruleId:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace,dependency:e.dependency}));
 assert.deepEqual(project(engine.evaluations.filter(e=>!e.ruleId.startsWith(ruleId+'.'))),project(r.results.engine.evaluations));
 assert.equal(report.scenarioCoverage.notExecuted,9);assert.equal(report.scenarioCoverage.complete,false);
});
test('Figma palette cases retain real instances and precise negative expectations, not impossible Spinner states',()=>{
 const qa=read('qa/spinner-palette-test-cases.2026-09-28.json');
 assert.equal(qa.status,'prepared-not-accepted');assert.equal(qa.cases.length,13);
 assert.equal(qa.sectionId,'12877:55696');assert.equal(qa.cases[6].spinnerProperties.Size.value,'16');
 assert.equal(qa.cases[8].spinnerProperties.Inverted.value,'False');assert.equal(qa.cases[9].spinnerProperties.Static.value,'False');
 assert.equal(qa.cases[10].spinnerProperties.Static.value,'True');assert.equal(qa.cases[11].side,'right');assert.equal(qa.cases[12].inverted,true);
 assert.ok(qa.cases.every(c=>c.buttonId&&c.spinnerId));
});
