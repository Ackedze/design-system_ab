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
const prefix='component:web-core.link.layer-properties-use-effective-baseline.';
const contexts=['component:web-core.link.view-token-mapping','component:web-core.link.underline-none-context','component:web-core.link.inline-link-addons'].sort();
const specs=[['18-36-23-789','13666:68029','padding-left',7,'1.5'],['18-36-34-707','13666:68029','padding-left',0,'1.5'],['18-36-43-486','13666:68049','opacity',0.5,'1.12'],['18-36-58-056','13666:68049','opacity',1,'1.12']];
const cases=[],states=[];
for(const [time,instanceId,property,value,suffix] of specs){
 const file='inputs/link.validation-report.2026-10-10T'+time+'Z.json',d=read(file),s=d.snapshot,negative=(property==='padding-left'?value!==0:value!==1);
 assert.equal(d.editorVersion,'component-contract-editor@0.2.100');assert.equal(d.run.manualRevision,3);
 assert.deepEqual(d.sources.manual,manual);assert.deepEqual(d.sources.compiledContract,compiled);assert.deepEqual(d.runtime.evaluatedContract,wire(preview));
 assert.equal(d.run.manualSourceHash,core.stableHash(manual));assert.equal(d.run.snapshotHash,core.stableHash(s));assert.equal(d.run.engineSnapshotHash,core.validationSnapshotHash(s,preview));assert.equal(d.run.evaluatedContractHash,core.stableHash(preview));
 assert.equal(s.source.rootNodeId,instanceId);assert.equal(s.source.representationId,'core.web.link.figma.universal');assert.equal(s.source.truncated,false);assert.deepEqual(s.source.captureTopology,{version:1,complete:true,limitReached:false,issues:[]});assert.deepEqual(d.run.capture.warnings,[]);assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds,[]);assert.equal(s.nodes.length,17);
 const root=s.nodes.find(n=>n.parentId===null);assert.equal(root.component.properties.Size,'M (16-24)');assert.equal(root.component.properties['Left Addon#60204:0'],true);assert.equal(root.component.properties['Right Addon#60204:4'],true);assert.equal(root.component.properties['✎ Label#493:29'],'Label');assert.equal(s.nodes.find(n=>n.semantic.role==='underline').component.properties.Line,'Solid');
 assert.equal(property==='padding-left'?root.layout.padding.left:root.appearance.opacity,value);
 const prepared=core.prepareValidationSnapshot(s,preview);assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1),s.declaredTargetIdentitiesV1);const targets=prepared.declaredTargetIdentitiesV1.targets;assert.equal(targets.length,8);assert(targets.every(t=>t.status==='resolved'&&t.present&&t.effectiveVisible));
 const engine=core.evaluateCompiledContract(s,preview);assert.deepEqual(wire(engine),d.results.engine);assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),d.results.engine);
 const args=[engine,{contract:compiled,issues:d.sources.compilerIssues},manual,s,{hiddenTargetCoverageVersion:1}],report=core.buildEditorValidationReport(...args);assert.deepEqual(wire(report),d.results.editor);assert.deepEqual(wire(editor.buildEditorValidationReport(...args)),d.results.editor);assert.deepEqual(wire(core.buildEvaluationDetails(report,preview,d.anatomy)),d.results.details);assert.deepEqual(report.scenarioCoverage,d.summary.scenarioCoverage);assert.equal(report.scenarioCoverage.inconclusive,0);assert.equal(report.scenarioCoverage.notExecuted,3);assert(!report.evaluations.some(e=>e.classification==='human-review'));assert.deepEqual(report.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId).sort(),contexts);
 const findings=report.evaluations.filter(e=>e.classification==='violation');assert.deepEqual(findings.map(e=>e.ruleId),negative?[prefix+suffix]:[]);
 const target=engine.evaluations.filter(e=>e.ruleId===prefix+suffix&&e.applicability==='applicable'&&e.focusNodeId===root.id);assert.equal(target.length,1);assert.equal(target[0].focusNodeId,root.id);assert.equal(target[0].classification,negative?'violation':'compliant');assert.equal(target[0].trace.actual,value);assert.equal(target[0].trace.expected,property==='padding-left'?0:1);
 cases.push({input:pin(file),instanceId,generatedAt:d.generatedAt,property,value,expectedViolation:negative,violations:findings.length,inconclusive:0,resolvedTargets:8,notExecuted:3,targetEvaluation:target[0],exactEngineEditorDetailsReplay:true,editorCoreParity:true});states.push({s,root});
}
for(const [a,b,property] of [[states[0],states[1],'padding-left'],[states[2],states[3],'opacity']]){
 assert.equal(a.s.source.rootNodeId,b.s.source.rootNodeId);assert.deepEqual(a.s.context,b.s.context);assert.deepEqual(a.root.component,b.root.component);
 const layout=wire(a.root.layout),appearance=wire(a.root.appearance);
 if(property==='padding-left'){layout.padding.left=0;layout.padding.horizontal=0;}else appearance.opacity=1;
 assert.deepEqual(layout,b.root.layout);assert.deepEqual(appearance,b.root.appearance);
 for(const n of a.s.nodes){const m=b.s.nodes.find(m=>m.id===n.id);assert(m);assert.deepEqual(n.component?.identity,m.component?.identity);assert.deepEqual(n.component?.sourceIdentity,m.component?.sourceIdentity);if(n.type==='TEXT')assert.deepEqual(n.text,m.text);}
}
const receipt={schemaVersion:'link.installed-root-baseline-replay.v1',editorVersion:'0.2.100',coreVersion:'0.1.16',revision:3,cases,acceptedCaptureCount:4,expectedViolationSequence:[1,0,1,0],samePhysicalInstanceResets:2,rootBaselineCycles:'PASS_PADDING_LEFT_AND_OPACITY_INSTALLED_SCOPED',wholeReady:false};
if(fs.existsSync(path.join(__dirname,'technical-replay.json')))assert.deepEqual(read('technical-replay.json'),receipt);
if(fs.existsSync(path.join(__dirname,'seal.json')))for(const x of read('seal.json').files)assert.deepEqual(pin(x.path),x);
console.log(JSON.stringify(receipt));
