const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const W = '/Users/alexkukhta/Desktop/workplace', P = W + '/shared/design-system_ab/experiments/current-contract-packages';
const out = __dirname, editorPath = W + '/projects/ComponentContractEditor/dist/core.cjs';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const pin = p => { const b = fs.readFileSync(p); return {path:p,sha256:sha(b),bytes:b.length}; };
const wire = v => JSON.parse(JSON.stringify(v));
const save = (name, value) => { const file=path.join(out,name); if(fs.existsSync(file)) assert.deepEqual(JSON.parse(fs.readFileSync(file)),wire(value)); else fs.writeFileSync(file,JSON.stringify(value)+'\n',{flag:'wx'}); };
const files = entries => entries.filter(e => e.name.endsWith('.json')).map(e => ({name:e.name,text:Buffer.from(e.data).toString()}));
const inventory = JSON.parse(fs.readFileSync(path.join(out, 'input-inventory.json')));
function assertInputs() {
  for (const e of [...inventory.accepted,...inventory.additionalReadonly]) assert.deepEqual(pin(e.path),e);
  for (const e of inventory.durableNativeCopies) assert.deepEqual(pin(e.copy.path),e.copy);
}
async function load(name, editor) {
  const entries = await editor.readZip(fs.readFileSync(P + '/' + name));
  return {entries,workspace:editor.importWorkspace(files(entries)),compiled:JSON.parse(Buffer.from(entries.find(e => e.name === 'compiled/component-contract.v2.json').data))};
}
(async () => {
  assertInputs();
  const editor = require(editorPath);
  const base = await load('BenefitCard.r7.editor-candidate.component-contract.zip',editor);
  const icon = await load('IconView.r8.candidate.component-contract.zip',editor);
  const bg = await load('BackgroundPlate.r6.candidate.component-contract.zip',editor);
  const previous = editor.buildExportBundle(base.workspace.manual,base.workspace.variantEvidence,base.workspace.dependencyContracts);
  assert.equal(previous.validation.valid,true,JSON.stringify(previous.validation.issues));
  const unchanged = {compileValid:true,originalHash:editor.stableHash(base.compiled),rebuiltHash:editor.stableHash(previous.compiled),equal:JSON.stringify(wire(previous.compiled))===JSON.stringify(wire(base.compiled)),engine:pin(editorPath),nodeVersion:process.version};
  save('checks/r7-unchanged-compile.json',unchanged);
  assert.deepEqual(wire(previous.compiled),wire(base.compiled));
  const manual = wire(base.workspace.manual);
  manual.metadata.revision = 8;
  manual.metadata.updatedAt = inventory.recordedAt;
  const iconPin = {id:'icon-view',componentId:icon.compiled.package.componentId,revision:icon.workspace.manual.metadata.revision,manualSourceHash:icon.compiled.package.manualSourceHash,compiledHash:editor.stableHash(icon.compiled),bindings:[{kind:'fixed-nested',id:'graphic-icon-view',targetRole:'graphic',relativePath:'',ownerComponentSetKeys:['b221a157df3d0f2a3ea77e5ddb2e0481825850c0','8e6f3ac5782b25a3155f43992a467717e158fcce'],activeVariant:{property:'Presets',values:['IconView']},childPath:'IconView'}]};
  manual.componentDependencies.push(iconPin);
  const delegatedId = 'component:web.benefit-card-icon-view-public-settings-allowed';
  const admissionId = 'component:web.benefit-card.public-roots-only';
  const visualId = 'component:web.benefit-card.visuals-follow-effective-baseline';
  for (const id of [delegatedId,admissionId]) {
    const r = manual.rules.find(r => r.id === id); assert.ok(r,id); r.status = 'deprecated';
  }
  // The norm is retained by dependency ownership and the existing explicit public boundary.
  const visuals = manual.rules.find(r => r.id === visualId); assert.ok(visuals); visuals.boundaryPolicy = 'component-owned@1';
  const children = [...base.workspace.dependencyContracts,icon.compiled];
  const bundle = editor.buildExportBundle(manual,base.workspace.variantEvidence,children);
  save('checks/r8-compile.json',bundle.validation);
  assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
  assert.equal(bundle.compiled.nonExecutableRules.length,0);
  const active = manual.rules.filter(r => r.status !== 'deprecated');
  assert.equal(new Set(active.map(r => r.id)).size,active.length);
  const normKey = r => JSON.stringify([r.targetId,r.targetScope,r.capability,r.permission,r.controlPaths,r.constraints,r.applicability]);
  assert.equal(new Set(active.map(normKey)).size,active.length);
  const coverage = {revision:8,status:'private Draft; dependency integration incomplete',manualHash:editor.stableHash(manual),compiledHash:editor.stableHash(bundle.compiled),entries:manual.rules.map(r => ({sourceRuleId:r.id,norm:r.rationale,sourceRefs:r.sourceRefs,targetId:r.targetId,targetScope:r.targetScope,ownership:r.ownership,applicability:r.applicability,controlPaths:r.controlPaths,constraints:r.constraints,execution:r.execution,status:r.status,compiledRuleIds:bundle.compiled.rules.filter(x => x.source.anchor === r.id).map(x => x.ruleId),route:r.id===delegatedId?'delegated:icon-view/graphic-icon-view':r.id===admissionId?'passport:publicRepresentationBoundaryVersion=1':'component',...(r.boundaryPolicy?{boundaryPolicy:r.boundaryPolicy}:{})})),unchangedSourceNorms:true,activeClaims:active.length,syntacticDuplicateNorms:0,semanticReview:{parentUsageVsChildIntrinsic:'Distinct owners; no copied child intrinsic rules.',paintBindingVsBaseline:'Retained as distinct requirements: binding presence versus forbidden visual change. Token library membership is separate cross-component scope.'},Ready:false};
  const gap = {id:'BG-OWNED-DESCENDANT-BINDING',status:'unresolved',norm:'BenefitCard permits only Type customization of BackgroundPlate; intrinsic child rules belong to BackgroundPlate r6.',currentSchema:'direct-child requires immediate child INSTANCE; fixed-nested requires child of typed variant owner',observedPath:{desktop:'BackgroundPlate / [D][Promo] BackgroundPlate',mobileWeb:'BackgroundPlate / [M][Promo] BackgroundPlate'},owner:'BenefitCard INSTANCE',intermediate:'BackgroundPlate FRAME',expectedChild:'public BackgroundPlate INSTANCE',dependencySource:{package:pin(P+'/BackgroundPlate.r6.candidate.component-contract.zip'),componentId:bg.compiled.package.componentId,revision:bg.workspace.manual.metadata.revision,manualSourceHash:bg.compiled.package.manualSourceHash,compiledHash:editor.stableHash(bg.compiled)},candidateDecision:'Do not claim a direct-child binding works. No executable BackgroundPlate dependency added until supported exact lineage binding is accepted.',Ready:false};
  const replays = [], diagnostics = [];
  const reports = inventory.accepted.filter(e => /benefit-card\.validation-report/.test(e.path));
  for (const input of reports) {
    assertInputs();
    const report = JSON.parse(fs.readFileSync(input.path)), snapshot = wire(report.snapshot);
    if (snapshot.validationIntent) snapshot.validationIntent = editor.createValidationIntent(snapshot,bundle.compiled,report.snapshot.validationIntent.values);
    const oldResult = editor.evaluateCompiledContract(report.snapshot,editor.prepareAuthoringPreviewContract(previous.compiled));
    const result = editor.evaluateCompiledContract(snapshot,editor.prepareAuthoringPreviewContract(bundle.compiled));
    const key = e => JSON.stringify([e.ruleId,e.subjectNodeId]);
    const prior = new Map(oldResult.evaluations.map(e => [key(e),e]));
    const changes = result.evaluations.filter(e => prior.has(key(e)) && (e.classification !== prior.get(key(e)).classification || JSON.stringify(e.trace)!==JSON.stringify(prior.get(key(e)).trace))).map(e => ({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,before:prior.get(key(e)).classification,after:e.classification,reason:e.trace.reason}));
    const link = result.evaluations.filter(e => /bottom-link-text-only|link-content-limit|link-line-limit/.test(e.ruleId)).map(e => ({ruleId:e.ruleId,classification:e.classification,truth:e.trace.truth,reason:e.trace.reason}));
    assert.equal(link.length,3);assert.ok(link.every(e => e.truth==='unknown' && e.classification==='human-review'));
    const d = bundle.compiled.componentDependencies.find(d => d.id==='icon-view');
    const iconResolution = editor.resolveFixedNestedBinding(snapshot,d,d.bindings[0],false,bundle.compiled);
    const bgBinding = {kind:'direct-child',id:'background-plate',targetRole:'surface-owner',relativePath:'',ownerTargetRole:'root',ownerComponentKeys:['61cba21130d5adfd36b798bb4a41f6ccd148c1aa','88ade0c593a37cf9805f43be9eb82c84d07a56f6'],representationIds:['web.benefit-card.figma.desktop','web.benefit-card.figma.mobile-web']};
    const diagnosticHost = {...bundle.compiled,runtimePolicy:{...bundle.compiled.runtimePolicy,directChildDependenciesVersion:1}};
    const bgResolution = editor.resolveDirectChildBinding(snapshot,{...gap.dependencySource,id:'background-plate',bindings:[bgBinding],contract:bg.compiled},bgBinding,diagnosticHost);
    diagnostics.push({input,platform:snapshot.context.platform,binding:bgBinding,resolution:bgResolution});
    replays.push({input,kind:'retained native facts; r8 contract with explicitly reissued validation intent',originalGeneratedAt:report.generatedAt,summary:result.summary,linkUsage:link,iconResolution,changes,nativeLive:'NOT_RUN',Ready:false});
  }
  save('checks/backgroundplate-direct-child-reproduction.json',diagnostics);
  assert.ok(diagnostics.every(d => d.resolution.status==='unknown' && d.resolution.reason==='dependency-direct-binding-unresolved'));
  save('checks/retained-replay.json',replays);
  const oldRequirements = JSON.parse(Buffer.from(base.entries.find(e=>e.name==='context/dependency-requirements.json').data));
  const requirements = {...oldRequirements,status:'partial-exact-draft-dependency-closure',requirements:oldRequirements.requirements.map(r=>r.component==='IconView'?{...r,status:'exact-draft-pin-linked; native acceptance pending',...iconPin}:r.component==='BackgroundPlate'?{...r,status:'blocked-existing-binding-schema',gapId:gap.id,source:gap.dependencySource}:r)};
  const passport = {status:'Draft',publicBoundaryVersion:1,publicRepresentations:manual.representations.filter(r=>r.kind==='figma'),auxiliary:{status:'not independently admitted by public boundary',components:['BottomContent','ContentWrapper','Graphic'],evidence:'Historical api-and-public-roots report; precise D/M owner keys retained by dependency bindings.'},norm:manual.rules.find(r=>r.id===admissionId).rationale,admissionScope:'importer candidate boundary; does not claim universal native standalone gate',Ready:false};
  const entries = new Map(base.entries.map(e=>[e.name,e]));
  const replacements = {'contract.manual.json':manual,'compiled/component-contract.v2.json':bundle.compiled,'coverage.json':bundle.coverage,'validation-report.json':bundle.validation,'context/dependency-requirements.json':requirements,['dependencies/'+icon.compiled.package.componentId+'/component-contract.v2.json']:icon.compiled,'reports/rule-coverage.r8.json':coverage,'reports/completion-gaps.r8.json':{gaps:[gap]},'reports/passport.r8.json':passport};
  for (const [name,value] of Object.entries(replacements)) entries.set(name,editor.textZipEntry(name,value));
  const bytes = editor.createZip([...entries.values()]), zipPath = path.join(out,'BenefitCard.r8.private-candidate.component-contract.zip');
  fs.writeFileSync(zipPath,bytes,{flag:'wx'});
  const reopened = editor.importWorkspace(files(await editor.readZip(bytes)),manual.component.contractId);
  const rebuilt = editor.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
  assert.deepEqual(wire(rebuilt.compiled),wire(bundle.compiled));
  assert.deepEqual(reopened.variantEvidence,base.workspace.variantEvidence);
  assert.deepEqual(reopened.dependencyContracts,children);
  save('contract.manual.json',manual);save('compiled.json',bundle.compiled);save('coverage-map.json',coverage);save('dependency-gaps.json',[gap]);save('passport.json',passport);
  save('eval.json',{status:'PASS_PRIVATE_AUTHORING_WITH_UNRESOLVED_DEPENDENCY',candidate:pin(zipPath),revision:8,claims:manual.rules.length,activeClaims:active.length,IR:bundle.compiled.rules.length,nonExecutable:bundle.compiled.nonExecutableRules.length,dependencyCount:children.length,compiler:pin(editorPath),r7UnchangedCompile:true,roundtrip:true,variantEvidenceExact:true,dependencyClosureExact:true,replays:replays.length,bgDirectChildReproductions:diagnostics.length,ruleUniqueness:'no duplicate active normative signatures; child intrinsic norms delegated; parent usage retained',unresolved:[gap.id,'WORKSHOP_LINK_3_SIZE_CACHE','FRESH_NATIVE_DEPENDENCY_ACCEPTANCE','CANONICAL_HUB_AND_REGISTRY_SYNC'],nativeLive:'NOT_RUN_USER_ONLY',Ready:false,pilotChanged:false,sharedWrites:0});
  assertInputs();
  save('checks/final-input-readback.json',{checkedAt:new Date().toISOString(),acceptedExact:inventory.accepted.length,additionalReadonlyExact:inventory.additionalReadonly.length,Ready:false});
  console.log(JSON.stringify({candidate:zipPath,activeClaims:active.length,IR:bundle.compiled.rules.length,replays:replays.length,gaps:[gap.id],Ready:false}));
})().catch(error => { const failure={at:new Date().toISOString(),error:error.stack,sharedWrites:0,Ready:false};const file=path.join(out,'checks/FIRST-PREPARATION-FAILURE.json');if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify(failure)+'\n');console.error(error.stack);process.exitCode=1; });
