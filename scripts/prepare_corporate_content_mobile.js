// Prepare the mobile manual package from the owner's r5 and the accepted desktop r11.
// No production publication or live-instance acceptance is performed by this script.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const core = require('../../../projects/ComponentContractEditor/dist/core.cjs');
const repo = path.resolve(__dirname, '..');
const root = path.join(repo, 'experiments/web-corp/CorporateContent/mobile-web/authoring');
const collection = path.join(repo, 'experiments/current-contract-packages');
const input = path.join(collection, 'corporate-content.component-contract.zip');
const history = path.join(root, '../history/r5-owner-export/corporate-content.component-contract.zip');
const outputName = 'CorporateContent.mobile-web.component-contract.zip';
const clone = x => JSON.parse(JSON.stringify(x));
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const json = x => JSON.stringify(x, null, 2) + '\n';
function write(name, content) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, typeof content === 'string' || Buffer.isBuffer(content) || content instanceof Uint8Array ? content : json(content));
}
async function prepare(record = false) {
  const bytes = fs.readFileSync(fs.existsSync(history) ? history : input);
  const entries = await core.readZip(bytes);
  const files = entries.map(e => ({name:e.name, text:core.zipEntryText(e)}));
  const workspace = core.importWorkspace(files);
  const authored = workspace.manual;
  assert.equal(authored.metadata.revision, 5);
  assert.equal(authored.component.contractId, 'corporate-content.mobile-web');
  assert.equal(authored.rules.length, 3);
  const desktop = JSON.parse(fs.readFileSync(path.join(repo, 'experiments/web-corp/CorporateContent/authoring/contract.manual.json')));
  assert.equal(desktop.metadata.revision, 11);
  const facts = JSON.parse(fs.readFileSync(path.join(root, 'reports/figma-source-facts.2026-10-01.json')));
  assert.equal(facts.componentKey, authored.component.componentKey);
  const slot = facts.children.find(n => n.type === 'SLOT' && n.name === '[M] Body');
  const property = slot.componentPropertyReferences.slotContentId;
  assert.equal(facts.componentPropertyDefinitions[property].type, 'SLOT');
  const collectionKey = '22d83aeb0d0d643a5359f63464a2ab81838fbe9f';
  const modes = facts.collections.find(c => c.key === collectionKey).modes;
  const desktopBackground = desktop.rules.find(r => r.capability.startsWith('variable.modes.'));
  const pageModes = desktopBackground.constraints[0].values;
  assert.deepEqual(pageModes.map(id => modes.find(m => m.modeId === id).name), ['base-bg-alt (grey)', 'base-bg (white)']);
  const mobile = clone(authored);
  mobile.metadata.revision = 6;
  mobile.metadata.updatedAt = '2026-10-01T12:55:09.000Z';
  const anatomyBody = workspace.anatomy.find(n => n.type === 'SLOT' && n.name === '[M] Body');
  mobile.targets.push({id:'target.body',semanticRole:'body',label:anatomyBody.name,
    componentFamily:mobile.component.family,lineage:['corporate-content'],
    structuralFingerprint:core.stableHash({type:anatomyBody.type,path:anatomyBody.path,order:anatomyBody.order}).slice(0,16),
    nameHint:anatomyBody.name,pathHint:anatomyBody.path,nodeIdHint:anatomyBody.id,resolution:'resolved'});
  const transfer = r => {
    const next = clone(r);
    next.id = r.id.replace('corporate-content.desktop', 'corporate-content.mobile-web');
    next.applicability.platforms = ['mobile-web'];
    next.ownership.ownerId = mobile.component.componentId;
    if (next.capability === 'composition.content') next.controlPaths[0].property = property;
    return next;
  };
  const body = transfer(desktop.rules.find(r => r.capability === 'composition.content'));
  const clipping = transfer(desktop.rules.find(r => r.capability === 'layout.clipsContent'));
  const grid = transfer(desktop.rules.find(r => r.capability === 'layout.gridStyleId'));
  const layout = mobile.rules.find(r => r.capabilitySet === 'auto-layout@1');
  const visual = mobile.rules.find(r => r.capabilitySet === 'visual-style@1');
  const background = mobile.rules.find(r => r.capability.startsWith('variable.modes.'));
  assert.deepEqual(layout.capabilitySelection, desktop.rules.find(r => r.capabilitySet === 'auto-layout@1').capabilitySelection);
  assert.deepEqual(visual.capabilitySelection, desktop.rules.find(r => r.capabilitySet === 'visual-style@1').capabilitySelection);
  background.constraints[0].values = clone(pageModes);
  background.rationale = desktopBackground.rationale;
  mobile.rules = [body, layout, clipping, grid, background, visual];
  assert.equal(facts.root.clipsContent, false);
  assert(facts.root.gridStyleId);
  const bundle = clone(core.buildExportBundle(mobile, workspace.variantEvidence, workspace.dependencyContracts));
  assert.equal(bundle.validation.valid, true);
  assert.equal(bundle.compiled.rules.length, 17);
  const zip = core.buildAuthoringZip(bundle, files);
  const reopenedFiles = (await core.readZip(zip)).map(e => ({name:e.name,text:core.zipEntryText(e)}));
  const reopened = core.importWorkspace(reopenedFiles);
  assert.deepEqual(reopened.manual, mobile);
  assert.deepEqual(reopened.anatomy, workspace.anatomy);
  assert.deepEqual(reopened.compiledInput, bundle.compiled);
  for (const f of files.filter(f => f.name.includes('/source/'))) {
    assert.equal(reopenedFiles.find(n => n.name === f.name).text, f.text);
  }
  assert.equal(core.nativeSlotCapturePlan(bundle.compiled).boundaries[0].property, property);
  assert(!layout.capabilitySelection.includes('layout.sizingVertical'));
  const outcomes = offlineScenarios(mobile, bundle.compiled, workspace, facts, property, collectionKey);
  const report = {
    schemaVersion:'apollo.component-contract.preparation.v1',componentId:mobile.component.componentId,
    contractId:mobile.component.contractId,date:'2026-10-01',manualRevision:6,status:'draft',
    compilerStatus:bundle.compiled.status,validation:bundle.validation,
    manualSourceHash:core.stableHash(mobile),compiledHash:core.stableHash(bundle.compiled),zipSha256:sha(zip),
    sourceZipSha256:sha(bytes),sourceRevision:5,sourceRules:6,ruleIRCount:17,
    accepted:false,published:false,liveInstanceValidation:false,
    baselineFacts:'reports/figma-source-facts.2026-10-01.json',
    desktopReference:{revision:11,manualSourceHash:core.stableHash(desktop)},
    changes:{addedRuleIds:[body.id,clipping.id,grid.id],preservedRuleIds:[layout.id,visual.id],
      correctedBackground:{ruleId:background.id,previous:authored.rules.find(r => r.capability.startsWith('variable.modes.')).constraints[0].values,current:pageModes}},
    sourceFilesPreserved:true,zipReopenVerified:true,offlineScenarios:outcomes.scenarios,
    selectionVerificationBlocker:outcomes.blocker,
    limitations:['Compiler ready is not live-instance acceptance.', 'TopMargin/BottomMargin have no separate authored checks in this desktop-equivalent scope.',
      'Vertical sizing is unrestricted.', 'External Body payload, Section, page patterns and frontend parity are outside this package.']
  };
  if (record) {
    const existingCollection = path.join(collection,outputName);
    if (fs.existsSync(existingCollection)) assert(fs.readFileSync(existingCollection).equals(Buffer.from(zip)),
      'The collection contains a newer owner export; --record must not overwrite it.');
    const currentManual=path.join(root,'contract.manual.json');
    if (fs.existsSync(currentManual)) {
      const current=JSON.parse(fs.readFileSync(currentManual));
      assert.deepEqual(current,mobile,'Canonical manual has changed; import the new owner export instead of recreating r6.');
    }
    fs.mkdirSync(path.dirname(history),{recursive:true});
    if (fs.existsSync(history)) assert(fs.readFileSync(history).equals(bytes));
    else fs.writeFileSync(history,bytes,{flag:'wx'});
    write('contract.manual.json',mobile);
    for (const f of files.filter(f => f.name.includes('/source/'))) write('src/'+path.basename(f.name),f.text);
    write('compiled/component-contract.v2.json',bundle.compiled);
    write('reports/readiness.json',bundle.validation);
    write('reports/coverage.json',bundle.coverage);
    write('reports/preparation-r6.json',report);
    write('editor/'+outputName,zip);
    fs.writeFileSync(path.join(collection,outputName),zip);
    fs.writeFileSync(path.join(collection,'draft-manifest.json'),json({schemaVersion:'component-contract-package-drafts.v1',normative:false,
      packages:[{name:'[M] CorporateContent',componentId:mobile.component.componentId,revision:6,status:'draft',file:outputName,
        sourceManual:'experiments/web-corp/CorporateContent/mobile-web/authoring/contract.manual.json',
        sourceZip:'experiments/web-corp/CorporateContent/mobile-web/authoring/editor/'+outputName,
        preparationReport:'experiments/web-corp/CorporateContent/mobile-web/authoring/reports/preparation-r6.json',
        manualSourceHash:report.manualSourceHash,zipSha256:report.zipSha256,accepted:false}],
      inputArchives:[{file:'corporate-content.component-contract.zip',revision:5,current:false,sha256:report.sourceZipSha256}]}));
  } else {
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))),mobile);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'compiled/component-contract.v2.json'))),bundle.compiled);
    assert(fs.readFileSync(path.join(root,'editor',outputName)).equals(Buffer.from(zip)));
    const collectionBytes = fs.readFileSync(path.join(collection,outputName));
    if (!collectionBytes.equals(Buffer.from(zip))) {
      const ownerFiles = (await core.readZip(collectionBytes)).map(e=>({name:e.name,text:core.zipEntryText(e)}));
      const owner = core.importWorkspace(ownerFiles), normalized = clone(owner.manual);
      assert(owner.manual.metadata.revision > mobile.metadata.revision,'Collection archive differs without a newer owner revision.');
      normalized.metadata.revision = mobile.metadata.revision; normalized.metadata.updatedAt = mobile.metadata.updatedAt;
      assert.deepEqual(normalized,mobile,'Collection owner export contains normative edits; review it before using the r6 preparation check.');
      assert.deepEqual(owner.anatomy,reopened.anatomy);
      assert.deepEqual(owner.compiledInput,clone(core.buildExportBundle(owner.manual,owner.variantEvidence,owner.dependencyContracts)).compiled);
      for (const f of reopenedFiles.filter(f=>f.name.includes('/source/'))) assert.equal(ownerFiles.find(n=>n.name===f.name)?.text,f.text);
      report.collectionOwnerExport = {revision:owner.manual.metadata.revision,manualSourceHash:core.stableHash(owner.manual),
        zipSha256:sha(collectionBytes),normativeSemanticsUnchanged:true,preserved:true};
    }
  }
  return {report,bundle,zip};
}
function offlineScenarios(manual, compiled, workspace, facts, property, collectionKey) {
  const rootName = '[M] CorporateContent';
  const snapshot = {schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-10-01T12:55:09.000Z',selection:['1'],
    source:{rootNodeId:'offline-mobile-fixture',pageId:'offline',componentKey:manual.component.componentKey,truncated:false,instanceIdentityVersion:1,propertyReferenceIdentityVersion:1},
    context:{platform:'mobile-web',modes:{},unknownFacts:[]},
    nodes:workspace.anatomy.map(n => ({id:n.id,parentId:n.parentId,childIds:n.childIds,order:n.order,name:n.name,type:n.type==='COMPONENT'?'INSTANCE':n.type,visible:true,
      semantic:{role:n.semanticRole,path:n.path},component:{propertyReferences:[],propertyReferenceBindings:{}},
      appearance:{fill:[],stroke:[],opacity:1,radius:0,effects:[]},
      baseline:{effective:{appearance:{fill:[],stroke:[],opacity:1,radius:0,effects:[]}}},unknownFacts:[]}))};
  const root = snapshot.nodes[0], body = snapshot.nodes.find(n => n.type === 'SLOT');
  root.component={identity:{componentKey:manual.component.componentKey},properties:{},propertyTypes:{[property]:'SLOT'},propertyReferences:[property],propertyReferenceBindings:{}};
  body.component={propertyReferences:[property],propertyReferenceBindings:{slotContentId:property}};
  for (const spacer of facts.spacerIdentities) {
    const n=snapshot.nodes.find(n=>n.name===spacer.name);
    n.component={identity:{componentKey:spacer.componentKey,componentSetKey:spacer.componentSetKey},properties:{Size:'24'},propertyTypes:{Size:'VARIANT'},propertyReferences:[],propertyReferenceBindings:{}};
    n.baseline.effective.component=clone(n.component);
  }
  root.layout={mode:facts.root.layoutMode,padding:{top:0,right:20,bottom:0,left:20},itemSpacing:0,primaryAxisAlignItems:'MIN',counterAxisAlignItems:'MIN',sizingHorizontal:'FIXED',sizingVertical:'FIXED',gridStyleId:facts.root.gridStyleId,clipsContent:false};
  root.baseline.effective.layout=clone(root.layout);
  root.variable={modes:{[collectionKey]:'136853:1'}};
  snapshot.variantReference=core.captureVariantReference(snapshot,manual.component.componentKey,'');
  const blockedEngine=core.evaluateCompiledContract(snapshot,compiled);
  const blockedReport=core.buildEditorValidationReport(blockedEngine,core.compileManualSource(manual,workspace.variantEvidence),manual,snapshot);
  assert.equal(blockedReport.editorCoverage.complete,false);
  assert.equal(core.prepareValidationSnapshot(snapshot,compiled).nodes[0].variantAvailability.reason,'instance-structure-needs-remap');
  const blocker={kind:'synthetic-reproduction-grounded-in-live-spacer-identities',
    reason:'TopMargin and BottomMargin are sibling instances with the same component/set keys; modern correspondence rejects ambiguous equal-key siblings.',
    instanceIdentityVersion:1,spacerComponentKey:facts.spacerIdentities[0].componentKey,
    editorCoverage:blockedReport.editorCoverage,liveValidationReport:false};
  // Isolate rule semantics with a synthetic host/Body anatomy. This is not
  // evidence that the actual eight-node mobile component passes an Editor audit.
  snapshot.nodes=snapshot.nodes.filter(n=>!['2','3','7','8'].includes(n.id));
  root.childIds=['4'];
  snapshot.variantReference=core.captureVariantReference(snapshot,manual.component.componentKey,'');
  const evidence=clone(workspace.variantEvidence);
  const variant=evidence.variants.find(v=>v.componentKey===manual.component.componentKey);
  evidence.structures[variant.structureId]=snapshot.variantReference.nodes;
  const isolatedCompiled=core.compileManualSource(manual,evidence);
  compiled=isolatedCompiled.contract;
  const cases=[];
  function run(name,change,expectedViolations) {
    const s=clone(snapshot);change(s);
    const engine=core.evaluateCompiledContract(s,compiled);
    const violations=engine.evaluations.filter(e=>e.classification==='violation');
    assert.equal(violations.length,expectedViolations,name+': '+JSON.stringify(engine.evaluations.map(e=>({id:e.ruleId,c:e.classification,trace:e.trace}))));
    const report=core.buildEditorValidationReport(engine,isolatedCompiled,manual,s);
    assert.equal(report.editorCoverage.complete,true,name+': '+JSON.stringify(report.editorCoverage));
    cases.push({name,kind:'synthetic-isolated-rule-semantics',violations:violations.length,complete:report.editorCoverage.complete});
  }
  run('baseline',()=>{},0);
  run('HUG height',s=>s.nodes[0].layout.sizingVertical='HUG',0);
  run('page grey',s=>s.nodes[0].variable.modes[collectionKey]='136853:0',0);
  for (const mode of ['136941:0','136941:1']) run('reject modal '+mode,s=>s.nodes[0].variable.modes[collectionKey]=mode,1);
  run('padding right override',s=>s.nodes[0].layout.padding.right=30,1);
  run('clipping override',s=>s.nodes[0].layout.clipsContent=true,1);
  run('grid detached',s=>s.nodes[0].layout.gridStyleId='',1);
  run('root opacity override',s=>s.nodes[0].appearance.opacity=.5,1);
  run('arbitrary Body payload',s=>{const payload=s.nodes.find(n=>n.name==='SwapMe');payload.name='User content';payload.semantic.path=rootName+' / [M] Body / User content';payload.appearance.opacity=.2;},0);
  const missing=clone(snapshot);delete missing.nodes.find(n=>n.type==='SLOT').component.propertyReferenceBindings.slotContentId;
  const result=core.buildEditorValidationReport(core.evaluateCompiledContract(missing,compiled),isolatedCompiled,manual,missing);
  assert.equal(result.editorCoverage.complete,false);
  cases.push({name:'missing native slot anchor',kind:'synthetic-isolated-rule-semantics',complete:false});
  return {scenarios:cases,blocker};
}
if (require.main === module) prepare(process.argv.includes('--record')).then(({report}) => console.log(JSON.stringify(report,null,2))).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={prepare};
