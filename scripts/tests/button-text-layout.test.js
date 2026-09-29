const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const m=read('history/r29-editor-0.2.51/contract.manual.json'),c=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r29-editor-0.2.51/component-contract.v2.json.gz')))),active=core.prepareAuthoringPreviewContract(c);
const id='component:web-core.button.text-resizing-maps-to-figma-layout',inner='component:web-core.button.internal-sizing-locked';
const prior=read('history/r27-editor-0.2.47/contract.manual.json');
const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r27-editor-0.2.47/component-contract.v2.json.gz'))));
const review=read('qa/block-live-review.2026-09-28.json'),load=i=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,i.fixtureFile))));
function fixture(){const s=clone(load(review.reportResults[0]).snapshot);s.validationRequest={version:1,mode:'component-audit'};return s;}
const node=(s,name)=>s.nodes.find(n=>n.name===name);
function layout(s,mode,showHint=false){node(s,'Hint').visible=showHint;for(const name of ['Text','Label',...(showHint?['Hint']:[])]){
 const n=node(s,name);n.visible=true;n.layout.sizingHorizontal=mode.toUpperCase();n.layout.sizingVertical='HUG';
 if(n.type==='TEXT'){n.text.textAutoResize=mode==='fill'?'HEIGHT':'WIDTH_AND_HEIGHT';n.text.textAlignHorizontal=mode==='fill'?'CENTER':n.baseline.effective.text.textAlignHorizontal;}
}}
function run(s,contract=c,manual=m){const e=core.evaluateCompiledContract(s,core.prepareAuthoringPreviewContract(contract));return {e,own:e.evaluations.filter(e=>e.ruleId.startsWith(id+'.')),report:core.buildEditorValidationReport(e,{contract,issues:[]},manual,s)};}
const violations=r=>r.e.evaluations.filter(e=>e.classification==='violation');
test('r28 text profiles persist in r29; only the separate nowrap mapping advances beyond those two rules',()=>{
 assert.equal(m.metadata.revision,29);assert.equal(m.rules.length,22);assert.equal(c.rules.length,59);assert.equal(c.nonExecutableRules.length,1);
 const changed=[id,inner,'component:web-core.button.nowrap-maps-to-figma-layout'];
 assert.deepEqual(m.rules.map(r=>r.id),prior.rules.map(r=>r.id));assert.deepEqual(m.rules.filter(r=>!changed.includes(r.id)),prior.rules.filter(r=>!changed.includes(r.id)));
 assert.deepEqual(c.componentDependencies,old.componentDependencies);assert.deepEqual(c.facts.variantEvidence,old.facts.variantEvidence);
 assert.equal(c.runtimePolicy.validationIntentVersion,2);assert.equal(c.status,'draft');assert.equal(read('runtime/component-contract.index.json').published,false);
});
for(const mode of ['hug','fill'])for(const hint of [false,true])test(`coordinated ${mode}, Hint visible=${hint}: allowed without baseline duplicate`,()=>{
 const s=fixture();layout(s,mode,hint);const r=run(s);assert.deepEqual(violations(r),[]);assert.equal(r.own[0].classification,'compliant');assert.equal(r.own[1].classification,'not-applicable');assert.equal(r.report.scenarioCoverage.complete,true);
});
test('mixed modes, fixed width, wrong resize and off-centre Fill are violations, not broadened permission',()=>{
 for(const edit of [s=>node(s,'Label').layout.sizingHorizontal='HUG',s=>node(s,'Text').layout.sizingHorizontal='FIXED',s=>node(s,'Hint').layout.sizingHorizontal='HUG',s=>node(s,'Label').text.textAutoResize='NONE',s=>node(s,'Label').text.textAlignHorizontal='LEFT']){
  const s=fixture();layout(s,'fill',true);edit(s);const r=run(s);assert.equal(r.own[0].classification,'violation');assert.ok(!violations(r).some(e=>e.ruleId===inner+'.1.1'&&['Text','Label','Hint'].includes(e.subjectNodeName)));
 }
});
test('Hug retains baseline alignment; vertical sizing, padding, opacity and styles are still protected',()=>{
 const s=fixture();layout(s,'hug');node(s,'Label').text.textAlignHorizontal='RIGHT';assert.equal(run(s).own[0].classification,'violation');
 for(const edit of [s=>node(s,'Label').layout.sizingVertical='FIXED',s=>node(s,'Text').layout.padding.left+=7,s=>node(s,'Label').appearance.opacity=.5,s=>node(s,'Label').appearance.typography.styleId='custom',s=>{node(s,'LeftAddon').visible=true;node(s,'LeftAddon').layout.sizingHorizontal='FIXED';}]){
  const s=fixture();layout(s,'fill');edit(s);assert.ok(violations(run(s)).length>0);
 }
});
test('hidden content does not constrain layout; unknown visibility/facts/identity remain incomplete',()=>{
 const s=fixture();layout(s,'fill');node(s,'Hint').layout.sizingHorizontal='FIXED';assert.equal(run(s).own[0].classification,'compliant');
 node(s,'Text').visible=false;assert.ok(run(s).own.every(e=>e.classification==='not-applicable'));
 for(const edit of [s=>node(s,'Label').unknownFacts.push('text.textAutoResize'),s=>node(s,'Label').unknownFacts.push('visible'),s=>delete node(s,'Label').text.textAutoResize,s=>s.source.truncated=true,s=>s.nodes.push(clone(node(s,'Label')))]){
  const s=fixture();layout(s,'fill');edit(s);const r=run(s);assert.notEqual(r.own[0].classification,'compliant');assert.equal(r.report.scenarioCoverage.complete,false);
 }
});
test('specification enum is independent, required, typed and pinned; audit never requires it',()=>{
 const s=fixture();layout(s,'fill');s.validationRequest.mode='specification';
 for(const value of [undefined,true,'other','hug','fill']){
  s.validationIntent=core.createValidationIntent(s,c,{block:false,...(value===undefined?{}:{textResizing:value})});
  const r=run(s);assert.equal(r.own[0].classification,'compliant');assert.equal(r.own[1].classification,value==='fill'?'compliant':value==='hug'?'violation':'human-review');
 }
 s.validationIntent.subject.rootNodeId='other';assert.equal(run(s).own[1].classification,'human-review');
 s.validationRequest.mode='component-audit';assert.equal(run(s).own[1].classification,'not-applicable');
});
test('invalid config/exclusion cannot silently disable the baseline rule',()=>{
 for(const edit of [m=>m.rules.find(r=>r.id===id).status='deprecated',m=>m.rules.find(r=>r.id===id).execution.route='context-only',m=>m.rules.find(r=>r.id===id).constraints[0].configuration.profiles[0].requirements.pop(),m=>m.rules.find(r=>r.id===inner).constraints[0].exceptConfiguration.targetRoles=['left-addon'],m=>m.rules.find(r=>r.id===id).applicability.validationMode='specification',m=>m.semanticApi.find(p=>p.id==='textResizing').domain=['fill']]){
  const n=clone(m);edit(n);const compiled=core.compileManualSource(n,c.facts.variantEvidence,[c.componentDependencies[0].contract]);assert.ok(compiled.issues.some(i=>i.level==='error'));assert.ok(compiled.contract.nonExecutableRules.some(r=>r.id===inner));
 }
});
test('r27 old compilation and archived engine/editor reports preserve exact semantics',()=>{
 assert.equal(core.stableHash(core.compileManualSource(prior,old.facts.variantEvidence,[old.componentDependencies[0].contract]).contract),core.stableHash(old));
 for(const item of review.reportResults){const r=load(item),e=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);assert.deepEqual(e,r.results.engine);assert.deepEqual(clone(core.buildEditorValidationReport(e,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot)),r.results.editor);}
});
test('ZIP reimport/recompile preserves configurations, exclusions and enum input',async()=>{
 const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r29-editor-0.2.51/Button.editor-input.zip'))));const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(w.manual,m);const b=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);assert.equal(b.validation.valid,true);assert.equal(core.stableHash(b.compiled),core.stableHash(c));
 assert.deepEqual(read('projections/athena/manual-overlay.json').rules.filter(r=>[id,inner].includes(r.id)),read('contract.manual.json').rules.filter(r=>[id,inner].includes(r.id)));
 assert.deepEqual(read('contract.manual.json').rules.filter(r=>[id,inner].includes(r.id)).map(r=>r.constraints),m.rules.filter(r=>[id,inner].includes(r.id)).map(r=>r.constraints));
});
test('mobile observed topology supports both text profiles without depending on desktop authoring selection',()=>{
 const manifest=read('qa/width-transition-live-review.2026-09-28.json');
 for(const mode of ['hug','fill'])for(const hint of [false,true]){
  const s=clone(load(manifest.reportResults[3]).snapshot.transitionBefore);s.validationRequest={version:1,mode:'component-audit'};layout(s,mode,hint);
  assert.equal(s.context.platform,'mobile-web');assert.equal(run(s).own[0].classification,'compliant');
  node(s,'Label').layout.sizingHorizontal='FIXED';assert.equal(run(s).own[0].classification,'violation');
 }
});
test('real Loading-hidden text and confirmed SingleIcon absence require neither profile nor specification input',()=>{
 const manifest=read('qa/effective-hint-visibility-live-review.2026-09-28.json');
 for(const item of [manifest.reportResults[0],manifest.reportResults[2]])for(const mode of ['component-audit','specification']){
  const s=clone(load(item).snapshot);s.validationRequest={version:1,mode};const r=run(s);
  assert.equal(r.own.length,2);assert.ok(r.own.every(e=>e.classification==='not-applicable'));
 }
});
