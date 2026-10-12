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
const customText='\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u044b\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f',fontRule='component:web-core.link.label-typography.1.2',spacingRule='component:web-core.link.label-typography.1.4';
const specs=[['19-13-14-021',customText,16,-0.23999999463558197,[]],['19-13-26-219',customText,18,-0.36000001430511475,[fontRule,spacingRule]],['19-13-34-271','Label',16,-0.23999999463558197,[]],['19-13-50-635',customText,16,-0.23999999463558197,[]]];
const cases=[],states=[];
for(const [time,characters,fontSize,spacing,expectedRules] of specs){
 const file='inputs/link.validation-report.2026-10-10T'+time+'Z.json',d=read(file),s=d.snapshot;
 assert.equal(d.editorVersion,'component-contract-editor@0.2.100');assert.equal(d.run.manualRevision,3);
 assert.deepEqual(d.sources.manual,manual);assert.deepEqual(d.sources.compiledContract,compiled);assert.deepEqual(d.runtime.evaluatedContract,wire(preview));
 assert.equal(d.run.manualSourceHash,core.stableHash(manual));assert.equal(d.run.snapshotHash,core.stableHash(s));assert.equal(d.run.engineSnapshotHash,core.validationSnapshotHash(s,preview));assert.equal(d.run.evaluatedContractHash,core.stableHash(preview));
 assert.equal(s.source.rootNodeId,'13666:67928');assert.equal(s.source.representationId,'core.web.link.figma.universal');assert.equal(s.source.truncated,false);assert.deepEqual(s.source.captureTopology,{version:1,complete:true,limitReached:false,issues:[]});assert.deepEqual(d.run.capture.warnings,[]);assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds,[]);assert.equal(s.nodes.length,17);
 const root=s.nodes.find(n=>n.parentId===null),label=s.nodes.find(n=>n.semantic.role==='label');assert(label);
 assert.equal(root.component.properties.Size,'M (16-24)');assert.equal(root.component.properties['Left Addon#60204:0'],true);assert.equal(root.component.properties['Right Addon#60204:4'],true);assert.equal(root.component.properties['\u270e Label#493:29'],characters);assert.equal(label.text.characters,characters);assert.equal(label.text.fontSize,fontSize);assert.deepEqual(label.text.letterSpacing,{unit:'PIXELS',value:spacing});assert.deepEqual(label.text.lineHeight,{unit:'PIXELS',value:24});assert.equal(s.nodes.find(n=>n.semantic.role==='underline').component.properties.Line,'Solid');
 const prepared=core.prepareValidationSnapshot(s,preview);assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1),s.declaredTargetIdentitiesV1);const targets=prepared.declaredTargetIdentitiesV1.targets;assert.equal(targets.length,8);assert(targets.every(t=>t.status==='resolved'&&t.present&&t.effectiveVisible));
 const engine=core.evaluateCompiledContract(s,preview);assert.deepEqual(wire(engine),d.results.engine);assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),d.results.engine);
 const args=[engine,{contract:compiled,issues:d.sources.compilerIssues},manual,s,{hiddenTargetCoverageVersion:1}],report=core.buildEditorValidationReport(...args);assert.deepEqual(wire(report),d.results.editor);assert.deepEqual(wire(editor.buildEditorValidationReport(...args)),d.results.editor);assert.deepEqual(wire(core.buildEvaluationDetails(report,preview,d.anatomy)),d.results.details);assert.deepEqual(report.scenarioCoverage,d.summary.scenarioCoverage);assert.equal(report.scenarioCoverage.inconclusive,0);assert.equal(report.scenarioCoverage.notExecuted,3);assert(!report.evaluations.some(e=>e.classification==='human-review'));assert.deepEqual(report.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId).sort(),contexts);
 const findings=report.evaluations.filter(e=>e.classification==='violation');assert.deepEqual(findings.map(e=>e.ruleId),expectedRules);
 const evaluations=[];
 for(const [ruleId,actual,expected] of [[fontRule,fontSize,16],[spacingRule,{unit:'PIXELS',value:spacing},{unit:'PIXELS',value:-0.23999999463558197}]]){
  const target=engine.evaluations.filter(e=>e.ruleId===ruleId&&e.applicability==='applicable'&&e.focusNodeId===label.id);assert.equal(target.length,1);assert.equal(target[0].classification,expectedRules.includes(ruleId)?'violation':'compliant');assert.deepEqual(target[0].trace.actual,actual);assert.deepEqual(target[0].trace.expected,expected);evaluations.push(target[0]);
 }
 cases.push({input:pin(file),instanceId:s.source.rootNodeId,generatedAt:d.generatedAt,actualText:characters,textLength:characters.length,fontSize,letterSpacing:spacing,violations:findings.length,inconclusive:0,resolvedTargets:8,notExecuted:3,targetEvaluations:evaluations,exactEngineEditorDetailsReplay:true,editorCoreParity:true});states.push({s,root,label});
}
for(const b of states.slice(1)){
 const a=states[0],properties=wire(b.root.component.properties);properties['\u270e Label#493:29']=customText;assert.deepEqual(properties,a.root.component.properties);assert.deepEqual(b.root.layout,a.root.layout);assert.deepEqual(b.root.appearance,a.root.appearance);
 for(const n of a.s.nodes){const m=b.s.nodes.find(m=>m.id===n.id);assert(m);assert.equal(n.type,m.type);assert.equal(n.parentId,m.parentId);assert.deepEqual(n.component?.identity,m.component?.identity);assert.deepEqual(n.component?.sourceIdentity,m.component?.sourceIdentity);}
}
assert.notEqual(states[1].label.text.characters,states[2].label.text.characters);assert.equal(states[3].label.text.characters,states[0].label.text.characters);assert.deepEqual(states[3].label.text,states[0].label.text);
const receipt={schemaVersion:'link.installed-configured-label-replay.v1',editorVersion:'0.2.100',coreVersion:'0.1.16',revision:3,cases,exactCaptureCount:4,actualViolationSequence:[0,2,0,0],requestedViolationSequence:[0,1,0],requestedTextLength:38,actualCustomText:customText,actualCustomTextLength:24,testInputDifferences:['negative capture changes fontSize and letterSpacing, correctly producing two distinct violations','third capture resets public text to Label; fourth restores custom text in another step','the requested 38-character Label was not used; actual 24-character custom value is permitted by the contract'],configuredNegativeDetection:'PASS_FONT_SIZE_AND_TRACKING_WITH_CUSTOM_TEXT',configuredCleanAndReconfiguration:'PASS_24_CHARACTER_CUSTOM_TEXT',samePhysicalInstance:true,resetPreservingConfiguredText:'NOT_PROVEN_RESET_CAPTURE_CHANGED_LABEL',longerThan32Text:'NOT_RUN_USER_ONLY',wholeReady:false};
if(fs.existsSync(path.join(__dirname,'technical-replay.json')))assert.deepEqual(read('technical-replay.json'),receipt);
if(fs.existsSync(path.join(__dirname,'seal.json')))for(const x of read('seal.json').files)assert.deepEqual(pin(x.path),x);
console.log(JSON.stringify(receipt));
