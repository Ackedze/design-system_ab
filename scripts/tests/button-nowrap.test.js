const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const m=read('history/r29-editor-0.2.51/contract.manual.json'),c=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r29-editor-0.2.51/component-contract.v2.json.gz')))),id='component:web-core.button.nowrap-maps-to-figma-layout';
const prior=read('history/r28-editor-0.2.49/contract.manual.json');
const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r28-editor-0.2.49/component-contract.v2.json.gz'))));
test('public schemas accept r29 manual/compiled and reject invalid context/mapping shapes',async()=>{
 const {validateJsonSchema}=await import('../../../../ds-ai-hub/tools/lib/json-schema-lite.mjs');
 const schema=name=>JSON.parse(fs.readFileSync(path.resolve(__dirname,`../../experiments/schemas/apollo-component-contract-${name}.schema.json`)));
 const manualSchema=schema('manual-v2'),compiledSchema=schema('v2.1');
 // Bundle the two explicit references for the existing local-only schema checker.
 compiledSchema.properties.customizationPolicy.items.properties.ownership=manualSchema.$defs.ruleOwnership;
 const self=clone(compiledSchema);compiledSchema.$defs={...compiledSchema.$defs,self,nonEmptyString:manualSchema.$defs.nonEmptyString};
 const bundled=JSON.parse(JSON.stringify(compiledSchema).replaceAll('"$ref":"#"','"$ref":"#/$defs/self"'));
 assert.deepEqual(validateJsonSchema(m,manualSchema),[]);
 assert.deepEqual(validateJsonSchema(c,bundled),[]);
 assert.deepEqual(manualSchema.properties.validationContext,compiledSchema.properties.facts.properties.validationContext);
 for(const patch of [x=>x.validationContext[0].default=false,x=>x.validationContext[0].valueType='number',x=>delete x.rules.find(r=>r.id===id).constraints[0].mapping]){
  const bad=clone(m);patch(bad);assert.ok(validateJsonSchema(bad,manualSchema).length>0);
 }
});
const load=p=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,p))));
function fixture(mobile=false){const review=read(mobile?'qa/width-transition-live-review.2026-09-28.json':'qa/block-live-review.2026-09-28.json');const r=load(review.reportResults[mobile?3:0].fixtureFile);const s=clone(mobile?r.snapshot.transitionBefore:r.snapshot);s.validationRequest={version:1,mode:'specification'};return s;}
function layout(s,mode){const n=name=>s.nodes.find(n=>n.name===name);n('Hint').visible=false;
 const r=s.nodes.find(n=>s.selection.includes(n.id));r.layout.sizingHorizontal=mode.toUpperCase();r.parent={layout:{mode:'VERTICAL'}};
 for(const name of ['Text','Label']){const t=n(name);t.visible=true;t.layout.sizingHorizontal=mode.toUpperCase();t.layout.sizingVertical='HUG';if(t.type==='TEXT'){t.text.textAutoResize=mode==='hug'?'WIDTH_AND_HEIGHT':'HEIGHT';t.text.textAlignHorizontal=mode==='hug'?t.baseline.effective.text.textAlignHorizontal:'CENTER';}}
}
function run(s,values){if(values!==undefined)s.validationIntent=core.createValidationIntent(s,c,values);const e=core.evaluateCompiledContract(s,core.prepareAuthoringPreviewContract(c));const own=e.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));return {e,own,verdicts:own.map(e=>e.classification),report:core.buildEditorValidationReport(e,{contract:c,issues:[]},m,s)};}
test('r29 changes one existing rule, preserves other norms/IDs/Spinner/facts and remains unpublished',()=>{
 assert.equal(m.metadata.revision,29);assert.equal(m.rules.length,22);assert.equal(c.rules.length,59);assert.equal(c.nonExecutableRules.length,1);
 assert.deepEqual(m.rules.map(r=>r.id),prior.rules.map(r=>r.id));assert.deepEqual(m.rules.filter(r=>r.id!==id),prior.rules.filter(r=>r.id!==id));
 assert.deepEqual(c.facts.variantEvidence,old.facts.variantEvidence);assert.deepEqual(c.componentDependencies,old.componentDependencies);
 assert.equal(c.status,'draft');assert.equal(read('runtime/component-contract.index.json').published,false);
 assert.ok(!m.semanticApi.some(p=>p.id==='constrainedWidth'));assert.deepEqual(c.facts.validationContext,m.validationContext);
 assert.equal(core.stableHash(core.compileManualSource(m,c.facts.variantEvidence,[c.componentDependencies[0].contract]).contract),core.stableHash(c));
 assert.equal(core.stableHash(core.compileManualSource(prior,old.facts.variantEvidence,[old.componentDependencies[0].contract]).contract),core.stableHash(old));
});
for(const mobile of [false,true]){
 for(const [mode,values,expected]of [
  ['hug',{nowrap:true},['compliant','not-applicable']],
  ['fill',{nowrap:true},['violation','not-applicable']],
  ['fill',{nowrap:false,constrainedWidth:true},['not-applicable','compliant']],
  ['hug',{nowrap:false,constrainedWidth:true},['not-applicable','violation']],
  ['hug',{nowrap:false,constrainedWidth:false},['not-applicable','not-applicable']],
  ['fill',{nowrap:false,constrainedWidth:false},['not-applicable','not-applicable']],
  ['hug',{nowrap:false},['not-applicable','human-review']],
  ['hug',{},['human-review','human-review']],
 ])test(`${mobile?'mobile':'desktop'} ${mode} ${JSON.stringify(values)}`,()=>{
  const s=fixture(mobile);layout(s,mode);const r=run(s,{block:false,textResizing:mode,...values});assert.deepEqual(r.verdicts,expected);
  if(expected.includes('human-review'))assert.equal(r.report.scenarioCoverage.complete,false);
 });
}
test('ordinary audit does not require expectations, while intrinsic text/padding remain enforced',()=>{
 const s=fixture();layout(s,'hug');s.validationRequest.mode='component-audit';assert.deepEqual(run(s).verdicts,['not-applicable','not-applicable']);
 s.nodes.find(n=>n.name==='Text').layout.padding.left+=10;assert.ok(run(s).e.evaluations.some(e=>e.classification==='violation'&&!e.ruleId.startsWith(id)));
});
test('Loading/SingleIcon require neither nowrap nor context; Spinner verdicts unaffected',()=>{
 for(const series of ['loading','single-icon']){const review=read(`qa/${series}-r28-editor-0.2.49-live-review.2026-09-29.json`);
  for(const item of review.reportResults){const r=load(item.fixtureFile),s=clone(r.snapshot),out=run(s,{block:false});assert.deepEqual(out.verdicts,['not-applicable','not-applicable']);
   assert.deepEqual(out.e.evaluations.filter(e=>e.dependency),r.results.engine.evaluations.filter(e=>e.dependency));
   assert.equal(out.report.scenarioCoverage.notExecuted,series==='loading'?1:0);
  }
 }
});
test('visible Hint alone activates mapping; unknown visibility is not hidden; parent evidence is required',()=>{
 let s=fixture();layout(s,'hug');s.nodes.find(n=>n.name==='Label').visible=false;const hint=s.nodes.find(n=>n.name==='Hint');hint.visible=true;hint.layout.sizingHorizontal='HUG';hint.text.textAutoResize='WIDTH_AND_HEIGHT';
 assert.equal(run(s,{nowrap:true}).verdicts[0],'compliant');hint.text.textAutoResize='HEIGHT';assert.equal(run(s,{nowrap:true}).verdicts[0],'violation');
 s=fixture();layout(s,'hug');s.nodes.find(n=>n.name==='Label').unknownFacts.push('visible');assert.equal(run(s,{nowrap:true}).verdicts[0],'human-review');
 s=fixture();layout(s,'fill');const rootNode=s.nodes.find(n=>s.selection.includes(n.id));rootNode.parent.layout.mode='NONE';assert.equal(run(s,{nowrap:false,constrainedWidth:true}).verdicts[1],'violation');
 delete rootNode.parent;assert.equal(run(s,{nowrap:false,constrainedWidth:true}).verdicts[1],'human-review');
});
test('conflicting block/textResizing expectations do not silently override nowrap',()=>{
 const s=fixture();layout(s,'fill');const r=run(s,{block:true,textResizing:'fill',nowrap:true});assert.equal(r.verdicts[0],'violation');
 layout(s,'hug');const other=run(s,{block:true,textResizing:'fill',nowrap:true});assert.equal(other.verdicts[0],'compliant');
 assert.ok(other.e.evaluations.some(e=>e.ruleId.includes('block-maps-to-fill')&&e.classification==='violation'));
 assert.ok(other.e.evaluations.some(e=>e.ruleId.includes('text-resizing')&&e.classification==='violation'));
});
test('canonical ZIP roundtrip and generated projections preserve validation context and mapping',async()=>{
 const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r29-editor-0.2.51/Button.editor-input.zip'))));
 const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)}))),bundle=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);
 assert.deepEqual(w.manual,m);assert.equal(core.stableHash(bundle.compiled),core.stableHash(c));
 assert.deepEqual(read('projections/athena/manual-overlay.json').validationContext,m.validationContext);
 assert.deepEqual(read('projections/ds-ai-hub/component.json').validationContext,m.validationContext);
});
