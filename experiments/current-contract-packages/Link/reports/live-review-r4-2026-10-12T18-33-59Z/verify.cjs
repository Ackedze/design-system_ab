const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const D=__dirname,W=path.resolve(D,'../../../../../../..'),P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages');
const read=f=>JSON.parse(fs.readFileSync(f)),wire=v=>JSON.parse(JSON.stringify(v));
const pin=f=>{const b=fs.readFileSync(f);return {path:f,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const relativePin=f=>({...pin(path.join(D,f)),path:f});
const sealed=fs.existsSync(path.join(D,'seal.json'));
const write=(name,value)=>{const text=JSON.stringify(value,null,2)+'\n',f=path.join(D,name);if(sealed)assert.equal(fs.readFileSync(f,'utf8'),text);else fs.writeFileSync(f,text);};
const fix=path.join(P,'Link/reports/reading-fixes/public-instance-swap-2026-10-11');
let dependencies;
if(sealed){dependencies=read(path.join(D,'dependencies.json'));for(const item of dependencies.files)assert.deepEqual(pin(item.path),item);}
else{
 const scope=read(path.join(P,'Link/reports/resume-2026-10-12T16-26-02-757Z/scope.json'));
 const unique=new Map();for(const item of scope.pilotPins)unique.set(item.path,item);
 dependencies={files:[...unique.values(),pin(path.join(fix,'runtime/core-after.cjs')),pin(path.join(fix,'runtime/editor-after.cjs'))],purpose:'Frozen readers plus pilot preservation check; no shared writes'};
 for(const item of dependencies.files)assert.deepEqual(pin(item.path),item);
 write('dependencies.json',dependencies);
 const live=path.join(P,'Link'),authoring=path.join(live,'authoring');
 fs.mkdirSync(path.join(D,'inputs'),{recursive:true});fs.mkdirSync(path.join(D,'package'),{recursive:true});
 for(const time of ['18-33-59-039','18-34-57-754','18-35-17-374','18-35-27-955']){
  const name='link.validation-report.2026-10-12T'+time+'Z.json';fs.copyFileSync(path.join(live,name),path.join(D,'inputs',name));
 }
 for(const [source,target] of [['contract.manual.json','manual.json'],['compiled/component-contract.v2.json','compiled.json']])fs.copyFileSync(path.join(authoring,source),path.join(D,'package',target));
 const rootZip=pin(path.join(P,'Link.component-contract.zip'));
 assert.equal(rootZip.sha256,'d1c71d8b9e92acf49582ee9b25290c87e29c56e1791f15944697f24550548abd');
 write('source-package.json',{rootZip,manual:relativePin('package/manual.json'),compiled:relativePin('package/compiled.json'),canonicalWrites:0,pilotWrites:0});
}
const core=require(path.join(fix,'runtime/core-after.cjs')),editor=require(path.join(fix,'runtime/editor-after.cjs'));
const manual=read(path.join(D,'package/manual.json')),compiled=read(path.join(D,'package/compiled.json')),preview=core.prepareAuthoringPreviewContract(compiled);
assert.equal(core.stableHash(manual),'8b53c160bec53a90148bb468272964d249c2478ec637ef5d0c1abc2ca6eeeac1');
assert.equal(core.stableHash(compiled),'4650fd9f3bd2779ffdf8429cea5255056fe5511efa2444a3ade1df5cd41e6146');
const rootId='13666:68129',port='Left icon 24#493:25',rightPort='Right icon 24#493:21';
const heightRule='component:web-core.link.left-icon-height.1.1';
const contexts=['component:web-core.link.inline-link-addons','component:web-core.link.underline-none-context','component:web-core.link.view-token-mapping'].sort();
const cases=[],states=[];
for(const time of ['18-33-59-039','18-34-57-754','18-35-17-374','18-35-27-955']){
 const name='inputs/link.validation-report.2026-10-12T'+time+'Z.json',d=read(path.join(D,name)),s=d.snapshot;
 assert.equal(d.editorVersion,'component-contract-editor@0.2.103');assert.equal(d.run.manualRevision,4);
 assert.deepEqual(d.sources.manual,manual);assert.deepEqual(d.sources.compiledContract,compiled);assert.deepEqual(d.runtime.evaluatedContract,wire(preview));
 assert.equal(d.run.manualSourceHash,core.stableHash(manual));assert.equal(d.run.snapshotHash,core.stableHash(s));assert.equal(d.run.engineSnapshotHash,core.validationSnapshotHash(s,preview));assert.equal(d.run.evaluatedContractHash,core.stableHash(preview));
 assert.equal(s.source.rootNodeId,rootId);assert.equal(s.source.truncated,false);assert.deepEqual(s.source.captureTopology,{version:1,complete:true,limitReached:false,issues:[]});assert.deepEqual(d.run.capture.warnings,[]);assert.deepEqual(d.run.capture.unmatchedBaselineNodeIds,[]);
 const root=s.nodes.find(n=>n.parentId===null),left=s.nodes.find(n=>n.component?.propertyReferenceBindings?.mainComponent===port),right=s.nodes.find(n=>n.component?.propertyReferenceBindings?.mainComponent===rightPort);
 assert(root&&left&&right);assert.equal(root.component.properties.Size,'M (16-24)');assert.equal(root.component.properties['Left Addon#60204:0'],true);assert.equal(root.component.properties['Right Addon#60204:4'],true);
 const prepared=core.prepareValidationSnapshot(s,preview);assert.deepEqual(wire(prepared.declaredTargetIdentitiesV1),s.declaredTargetIdentitiesV1);assert.equal(prepared.declaredTargetIdentitiesV1.targets.length,8);assert(prepared.declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'&&t.present&&t.effectiveVisible));
 const engine=core.evaluateCompiledContract(s,preview);assert.deepEqual(wire(engine),d.results.engine);assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),d.results.engine);
 const args=[engine,{contract:compiled,issues:d.sources.compilerIssues},manual,s,{hiddenTargetCoverageVersion:1}],report=core.buildEditorValidationReport(...args);
 assert.deepEqual(wire(report),d.results.editor);assert.deepEqual(wire(editor.buildEditorValidationReport(...args)),d.results.editor);assert.deepEqual(wire(core.buildEvaluationDetails(report,preview,d.anatomy)),d.results.details);
 assert.equal(report.scenarioCoverage.inconclusive,0);assert.equal(report.scenarioCoverage.notExecuted,3);
 assert(!report.evaluations.some(e=>['violation','human-review','not-evaluable'].includes(e.classification)));
 assert.deepEqual(report.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId).sort(),contexts);
 const height=engine.evaluations.filter(e=>e.ruleId===heightRule&&e.applicability==='applicable'&&e.focusNodeId===left.id);assert.equal(height.length,1);assert.equal(height[0].classification,'compliant');assert.equal(height[0].trace.actual,24);assert.deepEqual(height[0].trace.expected,{operator:'lte',value:24});
 cases.push({input:relativePin(name),instanceId:rootId,generatedAt:d.generatedAt,left:{name:left.name,bounds:left.bounds,properties:left.component.properties,identity:left.component.identity},right:{name:right.name,bounds:right.bounds,identity:right.component.identity},violations:0,inconclusive:0,resolvedTargets:8,notExecuted:3,heightEvaluation:height[0],exactEngineEditorDetailsReplay:true,editorCoreParity:true});
 states.push({s,root,left,right});
}
assert.deepEqual(states[0].s.context,states[2].s.context);assert.deepEqual(states[0].root.component,states[2].root.component);
assert.deepEqual(states[0].root.layout,states[2].root.layout);assert.deepEqual(states[0].root.appearance,states[2].root.appearance);
assert.deepEqual(states[0].left,states[2].left);assert.deepEqual(states[0].right,states[2].right);
assert.equal(states[0].left.name,'rocket');assert.equal(states[0].left.component.properties.Size,'24');
assert.equal(states[1].left.name,'rocket');assert.equal(states[1].left.component.properties.Size,'20');assert.notDeepEqual(states[0].left.component.identity,states[1].left.component.identity);
assert.equal(states[3].left.name,'diamonds');assert.equal(states[3].right.name,'diamonds');
for(const item of dependencies.files)assert.deepEqual(pin(item.path),item);
const review={schemaVersion:'link.public-swap-installed-review.v1',status:'PASS_PUBLIC_SWAP_AND_ASSET_RESET_HEIGHT_NEGATIVE_NOT_RUN',editorVersion:'0.2.103',coreVersion:'0.1.17',revision:4,cases,
 requestedViolationSequence:[0,1,0,0],actualViolationSequence:[0,0,0,0],samePhysicalInstance:true,
 publicSwap:'PASS_SCOPED_M_LEFT_ROCKET_RIGHT_FLAG',alternateRocketVariant:'PASS_ALLOWED_ASSET_SIZE20_WITH_ACTUAL_HEIGHT24',sameAssetRestoration:'PASS_ROCKET24_FLAG24',publicIconReset:'PASS_BOTH_DIAMONDS24',
 heightNegative:'NOT_RUN_INPUT_DIFFERS',heightReset:'NOT_RUN_NO_PRIOR_HEIGHT_MUTATION',
 testInputDifference:'Second report changes rocket asset Size 24 to 20; selected icon INSTANCE bounds.height stays 24 in every capture. No native height 40 capture exists.',
 freshNativeAcceptanceScope:'Public swap and restoration only; native height predicate remains pending',independentAcceptance:false,pilotWrites:0,canonicalWrites:0,wholeReady:false};
write('review.json',review);
if(sealed)for(const item of read(path.join(D,'seal.json')).files)assert.deepEqual(relativePin(item.path),item);
console.log(JSON.stringify({exactReports:cases.length,violationSequence:review.actualViolationSequence,resolvedTargets:[8,8,8,8],inconclusive:[0,0,0,0],publicSwapReset:'PASS',heightNegative:review.heightNegative,pilotWrites:0}));
