const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const read = n => JSON.parse(fs.readFileSync(path.join(__dirname,n)));
const wire = x => JSON.parse(JSON.stringify(x));
const pin = n => {const b=fs.readFileSync(path.join(__dirname,n));return {path:n,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
for(const x of read('dependencies.json').files) assert.deepEqual(pin(x.path),x);
const prior='../live-review-r3-2026-10-10T14-47-17Z/';
const core=require(prior+'runtime/core-after.cjs'), editor=require(prior+'runtime/editor-after.cjs');
const manual=read(prior+'package/manual.json'),compiled=read(prior+'package/compiled.json'),preview=core.prepareAuthoringPreviewContract(compiled);
assert.equal(core.stableHash(manual),'a85dd33420356ff1e2ab0de4e6064ddeb1c6ea9cf943accbacef40ef396a7402');
assert.equal(core.stableHash(compiled),'38c2a8bc107b51f5adcbc086430fb051af2a4e2fbe8f2161d76d87a8e88ad3a5');
const contexts=['component:web-core.link.view-token-mapping','component:web-core.link.underline-none-context','component:web-core.link.inline-link-addons'].sort();
const specs=[['19-06-57-725','13666:68109','root-fill',true,'component:web-core.link.root-fill-baseline.1.1'],['19-07-05-465','13666:68109','root-fill',false,'component:web-core.link.root-fill-baseline.1.1'],['19-07-12-793','13666:68149','letter-spacing',true,'component:web-core.link.label-typography.1.4'],['19-07-21-732','13666:68149','letter-spacing',false,'component:web-core.link.label-typography.1.4']];
const nativeFill=[{type:'SOLID',visible:false,opacity:1,color:{r:255,g:255,b:255}}], nativeSpacing={unit:'PIXELS',value:-0.23999999463558197};
const cases=[],states=[];
for(const [time,instanceId,property,negative,ruleId] of specs){
 const file='inputs/link.validation-report.2026-10-10T'+time+'Z.json',d=read(file),s=d.snapshot;
 assert.equal(d.editorVersion,'component-contract-editor@0.2.100');assert.equal(d.run.manualRevision,3);
 assert.deepEqual(d.sources.manual,manual);assert.deepEqual(d.sources.compiledContract,compiled);assert.deepEqual(d.runtime.evaluatedContract,wire(preview));
 assert.equal(d.run.manualSourceHash,core.stableHash(manual));assert.equal(d.run.snapshotHash,core.stableHash(s));assert.equal(d.run.engineSnapshotHash,core.validationSnapshotHash(s,preview));assert.equal(d.run.evaluatedContractHash,core.stableHash(preview));
 assert.equal(s.source.rootNodeId,instanceId);assert.equal(s.source.representationId,'core.web.link.figma.universal');assert.equal(s.source.truncated,false);assert.deepEqual(s.source.captureTopology,{version:1,complete:true,limitReached:false,issues:[]});assert.deepEqual(d.run.capture.warnings,[]);assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds,[]);assert.equal(s.nodes.length,17);
 const root=s.nodes.find(n=>n.parentId===null),label=s.nodes.find(n=>n.semantic.role==='label');assert(label);
 assert.equal(root.component.properties.Size,'M (16-24)');assert.equal(root.component.properties['Left Addon#60204:0'],true);assert.equal(root.component.properties['Right Addon#60204:4'],true);assert.equal(root.component.properties['\u270e Label#493:29'],'Label');assert.equal(s.nodes.find(n=>n.semantic.role==='underline').component.properties.Line,'Solid');
 const focus=property==='root-fill'?root:label,actual=property==='root-fill'?root.appearance.fill:label.text.letterSpacing,expected=property==='root-fill'?nativeFill:nativeSpacing;
 if(property==='root-fill'){assert.equal(actual[0].visible,negative);if(!negative)assert.deepEqual(actual,nativeFill);}else assert.deepEqual(actual,negative?{unit:'PIXELS',value:0}:nativeSpacing);
 const prepared=core.prepareValidationSnapshot(s,preview);assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1),s.declaredTargetIdentitiesV1);const targets=prepared.declaredTargetIdentitiesV1.targets;assert.equal(targets.length,8);assert(targets.every(t=>t.status==='resolved'&&t.present&&t.effectiveVisible));
 const engine=core.evaluateCompiledContract(s,preview);assert.deepEqual(wire(engine),d.results.engine);assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),d.results.engine);
 const args=[engine,{contract:compiled,issues:d.sources.compilerIssues},manual,s,{hiddenTargetCoverageVersion:1}],report=core.buildEditorValidationReport(...args);assert.deepEqual(wire(report),d.results.editor);assert.deepEqual(wire(editor.buildEditorValidationReport(...args)),d.results.editor);assert.deepEqual(wire(core.buildEvaluationDetails(report,preview,d.anatomy)),d.results.details);assert.deepEqual(report.scenarioCoverage,d.summary.scenarioCoverage);assert.equal(report.scenarioCoverage.inconclusive,0);assert.equal(report.scenarioCoverage.notExecuted,3);assert(!report.evaluations.some(e=>e.classification==='human-review'));assert.deepEqual(report.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId).sort(),contexts);
 const findings=report.evaluations.filter(e=>e.classification==='violation');assert.deepEqual(findings.map(e=>e.ruleId),negative?[ruleId]:[]);
 const target=engine.evaluations.filter(e=>e.ruleId===ruleId&&e.applicability==='applicable'&&e.focusNodeId===focus.id);assert.equal(target.length,1);assert.equal(target[0].classification,negative?'violation':'compliant');assert.deepEqual(target[0].trace.actual,actual);assert.deepEqual(target[0].trace.expected,expected);
 cases.push({input:pin(file),instanceId,generatedAt:d.generatedAt,property,actual,expected,expectedViolation:negative,violations:findings.length,inconclusive:0,resolvedTargets:8,notExecuted:3,targetEvaluation:target[0],exactEngineEditorDetailsReplay:true,editorCoreParity:true});states.push({s,root,label});
}
for(const [a,b,property] of [[states[0],states[1],'root-fill'],[states[2],states[3],'letter-spacing']]){
 assert.equal(a.s.source.rootNodeId,b.s.source.rootNodeId);
 const resetContext=wire(b.s.context);
 if(property==='letter-spacing')for(const key of ['VariableCollectionId:53996e6ec8e570a59836a070ff538095db175f84/22:0','VariableCollectionId:81f41861ab1d5eb41eb9e8fb2be58b23324f4bfc/2012:61']){assert.equal(a.s.context.modes[key],undefined);assert.equal(resetContext.modes[key],'1:0');delete resetContext.modes[key];}
 assert.deepEqual(a.s.context,resetContext);assert.deepEqual(a.root.component,b.root.component);assert.deepEqual(a.root.layout,b.root.layout);
 const appearance=wire(a.root.appearance);if(property==='root-fill')appearance.fill=nativeFill;assert.deepEqual(appearance,b.root.appearance);
 for(const n of a.s.nodes){const m=b.s.nodes.find(m=>m.id===n.id);assert(m);assert.equal(n.type,m.type);assert.equal(n.parentId,m.parentId);assert.deepEqual(n.component?.identity,m.component?.identity);assert.deepEqual(n.component?.sourceIdentity,m.component?.sourceIdentity);if(n.type==='TEXT'){const text=wire(n.text);if(property==='letter-spacing'&&n.id===a.label.id)text.letterSpacing=nativeSpacing;assert.deepEqual(text,m.text);}}
}
const receipt={schemaVersion:'link.installed-fill-tracking-replay.v1',editorVersion:'0.2.100',coreVersion:'0.1.16',revision:3,cases,acceptedCaptureCount:4,expectedViolationSequence:[1,0,1,0],samePhysicalInstanceResets:2,baselineCycles:'PASS_ROOT_FILL_LABEL_TRACKING_INSTALLED_SCOPED',captureNotes:['fill RESET restores original disabled paint and variable binding','tracking RESET restores original typography style/variable bindings; the capture additionally reports two typography-related collection modes as 1:0, retaining all previous mode values; text metrics change','same physical roots, native identity, public fields, text characters, platform/product and shared mode values are preserved; capture context is retained without asserting byte identity'],contextBeforeAfter:states.map(x=>x.s.context),wholeReady:false};
if(fs.existsSync(path.join(__dirname,'technical-replay.json')))assert.deepEqual(read('technical-replay.json'),receipt);
if(fs.existsSync(path.join(__dirname,'seal.json')))for(const x of read('seal.json').files)assert.deepEqual(pin(x.path),x);
console.log(JSON.stringify(receipt));
