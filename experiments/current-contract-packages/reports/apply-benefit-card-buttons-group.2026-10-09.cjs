// Local contract migration and evidence replay. Private native reports stay in this working folder.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),workspace=path.resolve(root,'../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const clone=v=>JSON.parse(JSON.stringify(v));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const date='2026-10-09',now=new Date().toISOString();
const history=path.join(root,'history',now.replace(/[:.]/g,'-'));
fs.mkdirSync(history,{recursive:true});
const jobs=[['BenefitCard','BenefitCard.component-contract.zip'],['ButtonsGroup','ButtonsGroup.component-contract.zip'],['ButtonsGroup/mobile-web','ButtonsGroup.mobile-web.component-contract.zip']];
for(const file of ['manifest.json','draft-manifest.json','README.md',...jobs.map(j=>j[1])])fs.copyFileSync(path.join(root,file),path.join(history,file));
const classifications=read(path.join(root,'ButtonsGroup/reports/owner-layer-classification.2026-10-09.json')).classification;
const receipts=[];
for(const [folder,zipName]of jobs){
 const dir=path.join(root,folder,'authoring'),manualPath=path.join(dir,'contract.manual.json');
 const oldManual=read(manualPath),oldCompiled=read(path.join(dir,'compiled/component-contract.v2.json')),manual=clone(oldManual);
 assert.equal(manual.metadata.revision,folder==='BenefitCard'?2:folder==='ButtonsGroup'?59:2);
 const receipt={date,component:folder,previousRevision:manual.metadata.revision,originalManualHash:core.stableHash(oldManual),normsDeleted:false,fullAcceptance:false};
 manual.metadata.revision++;manual.metadata.updatedAt=now;
 if(folder==='BenefitCard'){
  manual.metadata.declaredTargetIdentityVersion=2;
  const refs=new Map(),reports=fs.readdirSync(path.join(root,'BenefitCard')).filter(n=>/^benefit-card\.validation-report\..*\.json$/.test(n)).sort();
  for(const file of reports){const r=read(path.join(root,'BenefitCard',file)),ref=r.snapshot.variantReference;
   assert.equal(r.run.manualSourceHash,core.stableHash(oldManual));assert.equal(ref.complete,true);
   const previous=refs.get(ref.componentKey);if(previous)assert.equal(core.stableHash(previous),core.stableHash(ref));else refs.set(ref.componentKey,ref);
  }
  assert.equal(refs.size,2);let migrated=0;
  for(const target of manual.targets)for(const binding of target.identityBindingsV1||[]){
   const ref=refs.get(binding.componentKey);if(!ref)continue;
   assert.equal(binding.componentSetKey,ref.componentSetKey);
   assert(ref.nodes.some(n=>n.path===binding.referencePath&&n.type===(binding.referencePath?'TEXT'===binding.nodeType?'TEXT':binding.nodeType:'ROOT')));
   const referenceSource=ref.nodeProperties[binding.referencePath]?.sourceIdentity;
   if(binding.nativeSource){assert.equal(binding.nativeSource.sourceNodeId,referenceSource.sourceNodeId);assert.equal(binding.nativeSource.ownerComponentKey,referenceSource.ownerComponentKey);}
   binding.portableReferenceHash=core.portableDeclaredTargetReferenceHash(ref);migrated++;
  }
  assert.equal(migrated,6);
  const evidencePath='reports/portable-reference-bindings.r3.json';
  const evidence={date,policy:2,migratedBindings:migrated,portableVariants:2,totalVariants:32,exactOtherVariantsPreserved:true,independentReferences:Object.fromEntries(refs),normativeRulesUnchanged:true,freshEditorRunPending:true};
  write(path.join(dir,evidencePath),evidence);
  manual.documentation.push({id:'evidence.portable-targets.r3',kind:'authoring-evidence',path:evidencePath,status:'verified',projection:'reference-only'});
  manual.decisions.push({id:'benefit-card.portable-target-identity.r3',status:'accepted',summary:'Переносимая привязка Title и Graphic по published componentKey/sourceNodeId для двух проверенных вариантов лаборатории.',rationale:'File-local mainComponentId исключён только из portable hash; текущие actual/reference владельцы проверяются точно. Остальные 30 вариантов сохраняют прежние exact pins. Все нормы и ограничения остаются прежними.',sourceRefs:['evidence.portable-targets.r3']});
  Object.assign(receipt,{portableVariants:2,totalVariants:32,migratedBindings:6,freshEditorRunPending:true,remainingContextRules:oldCompiled.nonExecutableRules.length});
 }else{
  const moved=manual.rules.filter(r=>r.execution.route==='context-only');assert.equal(moved.length,9);
  const movedIds=new Set(moved.map(r=>r.id));
  const recipe={schemaVersion:'apollo.component-recipe-context.v1',documentType:'component-recipe-context',componentId:manual.component.componentId,platform:manual.component.platform,date,status:'draft',runtimeAcceptance:'not-run',frontendImplementationVerified:false,normsDeleted:false,rules:moved.map(sourceRule=>({ruleId:sourceRule.id,sourceRule,ownerDecision:classifications.find(c=>sourceRule.id.endsWith('.'+c.rule))})),examples:manual.examples.filter(e=>e.ruleIds?.some(id=>movedIds.has(id))),loading:{componentState:'Checked by pinned Button r31 direct-child dependencies; no group Loading state is introduced.',buttonRuleIds:classifications[8].existingButtonRules,widthEvidence:classifications[8].widthEvidence,triggerAfterClick:'recipe/interactive-code',optionListCell:'No Loading state: separate OptionListCell API/contract; no invented group predicate.'}};
  assert(recipe.rules.every(r=>r.ownerDecision));
  const recipePath='context/recipe-rules.json';write(path.join(dir,recipePath),recipe);
  manual.rules=manual.rules.filter(r=>!movedIds.has(r.id));manual.examples=manual.examples.filter(e=>!e.ruleIds?.some(id=>movedIds.has(id)));
  manual.documentation.push({id:'docs.buttons-group.recipe-context',kind:'recipe-context',path:recipePath,status:'draft',projection:'reference-only'});
  manual.decisions.push({id:'buttons-group.owner-layer-separation.'+date,status:'accepted',summary:'Контекст действий, рецепт Overflow и интерактивное поведение вынесены из локального Figma-гейта группы.',rationale:'Все девять текстов и RuleID сохранены в context/recipe-rules.json. Loading дочерней Button исполняется по закреплённой зависимости Button. Уникальность действий остаётся в рецепте; норма не удалена. Frontend/live приёмка не подтверждена.',sourceRefs:['docs.buttons-group.recipe-context']});
  assert.deepEqual(manual.rules,oldManual.rules.filter(r=>!movedIds.has(r.id)));
  Object.assign(receipt,{movedRuleIds:[...movedIds],recipePath,remainingSourceRules:manual.rules.length,sourceStatusesPreserved:true,frontendImplementationVerified:false,loadingDelegatedToExistingButton:true});
 }
 const bundle=core.buildExportBundle(manual,oldCompiled.facts.variantEvidence,(oldCompiled.componentDependencies||[]).map(d=>d.contract));
 assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
 if(folder==='BenefitCard')assert.deepEqual(manual.rules,oldManual.rules);
 const bodies=c=>c.rules.map(r=>{const v=clone(r);delete v.revision;delete v.source.checksum;return v;});
 assert.deepEqual(bodies(bundle.compiled),bodies(oldCompiled));
 const imported=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(manual)},{name:'compiled/component-contract.v2.json',text:JSON.stringify(bundle.compiled)}],manual.component.contractId);
 assert.deepEqual(imported.manual,manual);
 assert.deepEqual(core.compileManualSource(imported.manual,imported.variantEvidence,(bundle.compiled.componentDependencies||[]).map(d=>d.contract)).contract,bundle.compiled);
 if(folder==='BenefitCard'){
  receipt.replays=[];
  for(const file of fs.readdirSync(path.join(root,'BenefitCard')).filter(n=>/^benefit-card\.validation-report\..*\.json$/.test(n)).sort()){
   const r=read(path.join(root,'BenefitCard',file)),snapshot=r.snapshot;
   const previewContract=core.prepareAuthoringPreviewContract(bundle.compiled);
   const prepared=core.prepareValidationSnapshot(snapshot,previewContract),result=core.evaluateCompiledContract(snapshot,previewContract);
   assert(prepared.declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'));
   assert(result.evaluations.every(e=>e.classification!=='human-review'));
   const violated=prepared.declaredTargetIdentitiesV1.targets.filter(t=>t.semanticRole!=='root'&&t.effectiveVisible===false).length;
   assert.equal(result.evaluations.filter(e=>e.classification==='violation').length,violated);
   receipt.replays.push({file,platform:snapshot.context.platform,targets:prepared.declaredTargetIdentitiesV1.targets,classifications:result.evaluations.map(e=>({ruleId:e.ruleId,classification:e.classification}))});
  }
  assert.equal(receipt.replays.length,10);
  assert.equal(receipt.replays.flatMap(r=>r.classifications).filter(c=>c.classification==='violation').length,4);
 }
 write(manualPath,manual);write(path.join(dir,'compiled/component-contract.v2.json'),bundle.compiled);write(path.join(dir,'coverage.json'),bundle.coverage);write(path.join(dir,'validation-report.json'),bundle.validation);
 Object.assign(receipt,{revision:manual.metadata.revision,manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(bundle.compiled),compiledStatus:bundle.compiled.status,compiledRules:bundle.compiled.rules.length,nonExecutableRules:bundle.compiled.nonExecutableRules.length,checks:'compile/validation/roundtrip/predicate-body-preservation PASS'});
 write(path.join(dir,'reports/update.'+date+'.json'),receipt);receipts.push(receipt);
}
write(path.join(root,'reports/contract-update.'+date+'.json'),{date,history:history.replace(root+'/',''),editorVersion:'0.2.93',coreVersion:'0.1.12',receipts,packaging:'pending',registrySync:'pending'});
console.log(JSON.stringify(receipts.map(r=>({component:r.component,revision:r.revision,status:r.compiledStatus,IR:r.compiledRules,nonExecutable:r.nonExecutableRules,replays:r.replays?.length})),null,2));
