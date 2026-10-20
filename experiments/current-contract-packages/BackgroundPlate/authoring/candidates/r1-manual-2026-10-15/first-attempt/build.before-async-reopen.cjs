const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const W = '/Users/alexkukhta/Desktop/workplace';
const P = path.join(W, 'shared/design-system_ab/experiments/current-contract-packages');
const A = path.join(P, 'BackgroundPlate/authoring/candidates/r1-2026-10-15');
const B = __dirname;
const corePath = path.join(W, '.local/apollo-general-2026-10-15/coordination271/core.cjs');
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const pin = p => { const b = fs.readFileSync(p); return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}; };
const write = (name, value) => fs.writeFileSync(path.join(B, name), JSON.stringify(value, null, 2) + '\n');
function verify(p) { const actual = pin(p.path); assert.equal(actual.sha256, p.sha256, p.path); if(p.bytes !== undefined) assert.equal(actual.bytes,p.bytes,p.path); }
assert.equal(pin(corePath).sha256, '11c1e30cea4a19d4d1f8693a4ee3326df552d76c6359bad453767c1ec4eb9a48');
const c = require(corePath);
const grantPath = path.join(W, '.local/apollo-general-2026-10-15/backgroundplate-phase-a/B-TECHNICAL-GRANT.json');
const grant = json(grantPath);
assert.equal(grant.allowedOutputRoot, B);
for (const p of [grant.core,grant.proposal,grant.inputs,grant.phaseAAcceptance,grant.ownerAuthority,grant.currentRuntimeDescriptor]) verify(p);
const descriptor = json(grant.currentRuntimeDescriptor.path);
assert.equal(descriptor.runtimeInputs.length,500);
descriptor.runtimeInputs.forEach(verify);
const aSeal = json(path.join(A,'SEAL.json'));
[...aSeal.pins,...aSeal.externalInputs].forEach(verify);
const sourceDir = path.join(W,'shared/design-system_ab/JSONS/web/components/web-corp/BackgroundPlate');
const sourceRules = json(path.join(sourceDir,'rules.json')).manual.rules;
assert.equal(sourceRules.length,30);
const allSets = [1,2,3].flatMap(n => json(path.join(A,`native-api-${n}.json`)).sets);
const publicSets = allSets.filter(s => /BackgroundPlate/.test(s.name));
assert.equal(publicSets.length,6);
const captureFiles = json(path.join(A,'native-facts.capture-index.json')).captures.map(v => path.join(A,v.file));
const captures = captureFiles.map(json);
const rawNodes = new Map(captures.flatMap(x => x.nodes).map(n => [n.id,n]));
const roots = captures.flatMap(x=>x.roots);
assert.equal(roots.length,146);
assert.equal(rawNodes.size,218);
const importFiles = ['rules.json','contract.overrides.json','composition-contract.json','contract.generated.json','agent-context.json'].map(name=>({name,text:fs.readFileSync(path.join(sourceDir,name),'utf8')}));
importFiles.push({name:'Web _ Corp Components -- BackgroundPlate.json',text:fs.readFileSync(path.join(path.dirname(sourceDir),'Web _ Corp Components -- BackgroundPlate.json'),'utf8')});
const intake = c.importWorkspace(importFiles,'web-corp.background-plate');
write('input-inventory.json',{schemaVersion:'apollo.backgroundplate-technical-inputs.v1',grant:pin(grantPath),core:pin(corePath),phaseASeal:pin(path.join(A,'SEAL.json')),runtime:grant.currentRuntimeDescriptor,runtimeInputsVerified:500,rootPackages:fs.readdirSync(P).filter(n=>n.endsWith('.zip')).map(n=>pin(path.join(P,n))),sourceInputs:json(path.join(A,'phase-a-inventory.json')).sourceInputs});
write('legacy-import-intake.json',{status:'OBSERVED_INCOMPLETE_LEGACY_IMPORT_NOT_USED_AS_FRESH_EVIDENCE',inputFiles:importFiles.map(f=>f.name),variantCount:intake.variantEvidence.variants.length,structureCount:Object.keys(intake.variantEvidence.structures).length,manualTargets:intake.manual.targets.length,manualRules:intake.manual.rules.length,currentNativeVariants:146,currentPublicVariants:18,reason:'The legacy source catalog is older than the captured native API; its importer seed is not the new contract.'});

function paints(list) { return list.map(p=>({type:p.type,visible:p.visible!==false,opacity:p.opacity ?? 1,...(p.boundVariables?.color?.id?{tokenId:p.boundVariables.color.id}:{}),...(p.color?{color:Object.fromEntries(Object.entries(p.color).map(([k,v])=>[k,k==='a'?v:Math.round(v*255)]))}:{}),...c.captureGradientPaintDetails(p)})); }
function projection(set, variant) {
  const rootRaw = rawNodes.get(variant.id), rows = [];
  const visit = n => { rows.push(n); (n.children||[]).forEach(id=>visit(rawNodes.get(id))); };
  visit(rootRaw);
  const rootName = set.name;
  const syntheticIds = new Map(rows.map((n,i)=>[n.id,`synthetic:${variant.id}:${i}`]));
  const refNames = new Map([[rootRaw.id,rootName]]);
  for(const n of rows.slice(1))refNames.set(n.id,refNames.get(n.parentId)+' / '+n.name);
  const snapshot = {schemaVersion:'apollo.preview-snapshot.v1',selection:[syntheticIds.get(rootRaw.id)],context:{platform:set.name.startsWith('[D]')?'desktop':'mobile-web'},source:{truncated:false,componentKey:variant.key,componentSetKey:set.key,instanceIdentityVersion:1,instanceSourceIdentityVersion:1,occurrenceAddressVersion:1,captureTopology:{version:1,complete:true,limitReached:false,issues:[]}},nodes:rows.map(n=>{
    const root = n===rootRaw;
    const props = root ? Object.fromEntries(Object.entries(set.propertyDefinitions).map(([k,d])=>[k,{type:d.type,value:variant.variantProperties[k]??d.defaultValue}])) : n.componentProperties||{};
    const component = {properties:Object.fromEntries(Object.entries(props).map(([k,p])=>[k,p.value])),propertyTypes:Object.fromEntries(Object.entries(props).map(([k,p])=>[k,p.type])),propertyReferences:Object.values(n.componentPropertyReferences||{}),propertyReferenceBindings:n.componentPropertyReferences||{}};
    if(root)component.identity={componentKey:variant.key,componentSetKey:set.key,mainComponentId:variant.id};
    else if(n.mainComponent)component.identity={componentKey:n.mainComponent.key,componentSetKey:n.mainComponent.setKey||'',mainComponentId:n.mainComponent.id};
    // A proves native source addresses only for direct children of the captured public definition.
    if(!root && n.parentId===rootRaw.id)component.sourceIdentity={version:1,sourceNodeId:n.id,ownerComponentKey:variant.key,ownerMainComponentId:variant.id};
    const appearance={fill:paints(n.fills||[]),stroke:paints(n.strokes||[]),fillStyleId:n.fillStyleId||'',strokeStyleId:n.strokeStyleId||'',strokeWeight:n.strokeWeight,strokeAlign:n.strokeAlign,dashPattern:n.dashPattern,opacity:n.opacity,radius:n.cornerRadius,effects:(n.effects||[]).map(e=>({type:e.type,visible:e.visible!==false})),effectStyleId:n.effectStyleId||'',effectDetailsV1:c.captureEffectDetails(n.effects||[],n.effectStyleId||'')};
    return {id:syntheticIds.get(n.id),parentId:root?null:syntheticIds.get(n.parentId),childIds:(n.children||[]).map(id=>syntheticIds.get(id)),name:root?rootName:n.name,type:root?'INSTANCE':n.type,visible:n.visible,visibility:{effective:n.visible!==false},semantic:{role:root?'root':'unassigned',path:refNames.get(n.id)},geometry:{x:n.x,y:n.y,width:n.width,height:n.height},layout:{mode:n.layoutMode,itemSpacing:n.itemSpacing,padding:{top:n.paddingTop,right:n.paddingRight,bottom:n.paddingBottom,left:n.paddingLeft,horizontal:n.paddingLeft,vertical:n.paddingTop},primaryAxisAlignItems:n.primaryAxisAlignItems,counterAxisAlignItems:n.counterAxisAlignItems,sizingHorizontal:n.layoutSizingHorizontal,sizingVertical:n.layoutSizingVertical,clipsContent:n.clipsContent,gridStyleId:n.gridStyleId||''},appearance,component,unknownFacts:[]};
  })};
  snapshot.variantReference=c.captureVariantReference(snapshot,variant.key,set.key,Object.keys(set.propertyDefinitions));
  // This is a definition-derived synthetic fixture; it is not an independent installed Editor capture.
  for(const n of snapshot.nodes)n.baseline={effective:{appearance:JSON.parse(JSON.stringify(n.appearance)),layout:JSON.parse(JSON.stringify(n.layout))}};
  return snapshot;
}
const snapshots = publicSets.flatMap(set=>set.variants.map(variant=>({set,variant,snapshot:projection(set,variant)})));
assert.equal(snapshots.length,18);
const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:c.stableHash(captureFiles.map(pin)),occurrenceAddressVersion:1,structures:{},variants:[],occurrences:[]};
for(const {set,variant,snapshot} of snapshots){
  const shape=c.snapshotShape(snapshot);assert(shape);const structureId=c.stableHash(shape);evidence.structures[structureId]=shape;
  evidence.variants.push({componentKey:variant.key,componentSetKey:set.key,structureId,properties:variant.variantProperties});
  const paths=c.snapshotPaths(snapshot);evidence.occurrences.push({componentKey:variant.key,componentSetKey:set.key,namesByPath:Object.fromEntries(snapshot.nodes.map(n=>[paths.get(n.id),n.name]))});
}
write('variant-evidence.json',evidence);
write('synthetic-fixtures.json',{status:'DEFINITION_DERIVED_SYNTHETIC_NOT_NATIVE_ACCEPTANCE',fixtures:snapshots.map(({set,variant,snapshot})=>({setId:set.id,variantId:variant.id,snapshot}))});

const componentId='web-corp.background-plate';
const identity={componentId,familyId:componentId,contractId:componentId,family:'BackgroundPlate',layer:'arui-private',library:'Web _ Corp Components',platform:'desktop',platforms:['desktop','mobile-web'],lifecycle:'active',componentKey:publicSets[0].key};
const manual=c.createWorkspaceFromPreview(identity,[]).manual;
manual.metadata={...manual.metadata,declaredTargetIdentityVersion:3,declaredTargetConfigurationVersion:1,revision:1,createdAt:'2026-10-15T00:00:00.000Z',updatedAt:'2026-10-15T00:00:00.000Z'};
manual.source={kind:'manual-source',importedFiles:['variant-evidence.json','rules.json'],sourceHash:c.stableHash([pin(path.join(sourceDir,'rules.json')),pin(path.join(A,'SEAL.json'))]),importedAt:'2026-10-15T00:00:00.000Z'};
manual.semantics={purpose:'Контекстная подложка и контейнер контента Arui-Private с уровнями поверхности и типами оформления.',useWhen:['Подложка под контентом или контейнер Slot в согласованном контексте поверхности.'],doNotUseWhen:['Служебные Style Level размещаются самостоятельно.'],relatedComponentIds:['web-corp.benefit-card'],keywords:['background','surface','slot','arui-private']};
const familyOf=s=>s.name.includes('Slot')?'slot':s.name.includes('[Promo]')?'promo':'legacy';
const repId=s=>`${componentId}.figma.${s.name.startsWith('[D]')?'desktop':'mobile-web'}.${familyOf(s)}`;
manual.representations=publicSets.map(s=>({id:repId(s),kind:'figma',platform:s.name.startsWith('[D]')?'desktop':'mobile-web',surface:familyOf(s),status:'draft',locator:{fileKey:'NrzEFUSTXgzOUmsfYym0xD',nodeId:s.id,componentSetKey:s.key}}));
const rootTarget={id:'target.root',semanticRole:'root',label:'BackgroundPlate: публичный корень',lineage:[],resolution:'resolved',representationHints:[],variantHints:[],identityBindingsV1:[]};
const surfaceTarget={id:'target.surface',semanticRole:'surface',label:'Вложенный Style Level',lineage:['root'],resolution:'resolved',representationHints:[],variantHints:[],identityBindingsV1:[]};
const slotTarget={id:'target.slot',semanticRole:'slot',label:'Native Slot: граница внешнего контента',lineage:['root'],resolution:'resolved',representationHints:[],variantHints:[],identityBindingsV1:[]};
for(const {set,variant,snapshot} of snapshots){
  const ref=snapshot.variantReference;
  const binding={representationId:repId(set),componentKey:variant.key,componentSetKey:set.key,referenceHash:c.stableHash(ref),portableReferenceHash:c.portableDeclaredTargetReferenceHash(ref),configurationReferenceHash:c.configurationDeclaredTargetReferenceHash(ref),referencePath:'',nodeType:'INSTANCE'};
  rootTarget.identityBindingsV1.push(binding);rootTarget.variantHints.push({representationId:repId(set),componentKey:variant.key,pathHint:set.name});
  const direct=snapshot.nodes.filter(n=>n.parentId===snapshot.selection[0]);
  const node=direct.find(n=>familyOf(set)==='slot'?n.type==='SLOT':n.type==='INSTANCE');assert(node);
  const target=familyOf(set)==='slot'?slotTarget:surfaceTarget;
  const p=c.snapshotPaths(snapshot).get(node.id);
  target.identityBindingsV1.push({...binding,referencePath:p,nodeType:node.type,nativeSource:{sourceNodeId:node.component.sourceIdentity.sourceNodeId,ownerComponentKey:variant.key,ownerMainComponentId:variant.id}});
  target.variantHints.push({representationId:repId(set),componentKey:variant.key,pathHint:set.name+' / '+p});
}
manual.targets=[rootTarget,surfaceTarget,slotTarget];
manual.semanticApi=[{id:'family',kind:'variant',valueType:'enum',domain:['legacy','promo','slot'],description:'Read-only identity-proven Figma representation family; not a native property.',bindings:manual.representations.map(r=>({representationId:r.id,path:'representation.surface',transform:'identity'}))},
  ...['Type','Skeleton','BackgroundColor'].map(property=>({id:property,kind:property==='Skeleton'?'state':'variant',valueType:'enum',domain:[...new Set(allSets.flatMap(s=>s.propertyDefinitions[property]?.variantOptions||[]))],description:property==='Skeleton'?'Native VARIANT string False/True; not BOOLEAN.':`Native ${property}; nested Style Level is read-only semantic API binding.`,bindings:publicSets.filter(s=>property!=='BackgroundColor'||familyOf(s)!=='slot').map(s=>({representationId:repId(s),path:'component.properties.'+property,transform:'identity',...(familyOf(s)!=='slot'?{targetId:surfaceTarget.id}:{})}))})),
  {id:'Position',kind:'variant',valueType:'enum',domain:['Level 1 (outer)','Level 2 (inner)'],bindings:publicSets.filter(s=>familyOf(s)!=='slot').map(s=>({representationId:repId(s),path:'component.properties.Position',transform:'identity'}))},
  {id:'Slot',kind:'slot',valueType:'content',description:'Native SLOT property Slot#136328:0; open content is externally owned, with contextual level restrictions recorded separately.',bindings:publicSets.filter(s=>familyOf(s)==='slot').map(s=>({representationId:repId(s),path:'component.properties.Slot#136328:0',transform:'identity'}))}];
manual.documentation=[{id:'source-rules',kind:'rules',path:path.join(sourceDir,'rules.json'),status:'verified',projection:'source'},{id:'hub',kind:'instructions',path:path.join(W,'ds-ai-hub/products/ab/components/background-plate/instructions.md'),status:'verified',projection:'reference-only'}];
manual.decisions=[{id:'owner-arui-private',status:'accepted',summary:'Компонент относится к Arui-Private; возможны Figma и code mapping.',rationale:'Подтверждено владельцем. В этой ревизии только шесть Figma representations; code source/types/parity ещё не проверены.',sourceRefs:['owner-message:01a1402b-68bb-79b0-bae2-ea716ce7c999']}];
manual.generation.instructions=['Draft для проверки контракта; генерация и Ready не приняты.','Служебные Style Level не размещать отдельно.','Сохранять native VARIANT строки False/True и отдельный SLOT тип.'];

const mapping=new Map(sourceRules.map(r=>[r.ruleId,[]]));
const sourceBySuffix=s=>sourceRules.find(r=>r.ruleId.endsWith('.'+s));
const applies=(family,types)=>({variants:'all',modes:'all',platforms:['desktop','mobile-web'],conditionSubject:'component-root',...(family||types?{contextDomains:{...(family?{'semanticApi.family':family}:{}),...(types?{'semanticApi.Type':types}:{})}}:{})});
function add(suffix,target,capability,permission,constraints=[],options={}){
  const src=sourceBySuffix(suffix);assert(src,suffix);
  const id=src.ruleId+(options.part?'.'+options.part:'');
  const rule={id,targetId:target.id,targetScope:'self',capability,permission,controlPaths:[],constraints,applicability:applies(),severity:'error',rationale:src.ruleText,status:'draft',owner:'design-system-authors',ownership:{kind:'component',ownerId:componentId},sourceRefs:[src.ruleId],...options};delete rule.part;
  manual.rules.push(rule);mapping.get(src.ruleId).push(id);return rule;
}
function deferred(suffix,facts,reason,route='context-only') {const r=add(suffix,rootTarget,'composition.context',route==='policy-only'?'allowed':'forbidden',[],{execution:{route,missingFacts:facts},severity:'warning'});r.rationale+=' '+reason;return r;}
const policySources=[1,2,3];
for(const i of policySources)deferred(sourceRules[i-1].ruleId.split('.').pop(),['accepted.mapping-and-baseline-policy'],'Классификация и требования к mapping/reader; не отдельное дублирующее visual assertion.','policy-only');
for(const [suffix,fact] of [['radius-is-fixed-by-component-baseline','appearance.radius'],['opacity-is-fixed','appearance.opacity']]){
  add(suffix,rootTarget,fact,'forbidden',[],{part:'root'});
  add(suffix,surfaceTarget,fact,'forbidden',[],{part:'surface',applicability:applies(['legacy','promo'])});
}
add('padding-is-designer-controlled',rootTarget,'layout.padding','allowed',[],{applicability:applies(['slot']),controlPaths:[{kind:'direct'}]});
add('slot-auto-layout-is-context-controlled',rootTarget,'layout.mode','allowed',[],{capabilitySet:'auto-layout@1',capabilitySelection:['layout.mode','layout.itemSpacing','layout.primaryAxisAlignItems','layout.counterAxisAlignItems'],applicability:applies(['slot']),controlPaths:[{kind:'direct'}]});
add('slot-clipping-is-context-controlled',rootTarget,'layout.clipsContent','allowed',[],{applicability:applies(['slot']),controlPaths:[{kind:'direct'}]});
for(const [suffix,facts,reason] of [
  ['level-2-requires-level-1',['host.autoLayoutBranches','host.absoluteUnderlay','host.coverageBounds','host.sourceOrder'],'Требуется внешний контекст Auto/absolute веток и покрытия.'],
  ['slot-content-levels',['externalSlot.contentSurfaceLevels'],'Обычный контент разрешён; нормы уровней внутри Slot требуют внешней композиции.'],
  ['root-surface-requires-level-0',['host.mainSurface.variableLevel'],'Главная поверхность вне корня компонента.'],
  ['background-color-by-surface-context',['host.surfaceKind','host.surfaceColor'],'Контекст page/modal и gray/white не угадывается.'],
  ['single-background-color-per-page',['host.pageBackgroundColor','host.allBackgroundPlates'],'Нужен полный контекст страницы.'],
  ['manual-shadows-are-prohibited',['appearance.visibleShadowTypes'],'Current typed constraints do not filter effect arrays by shadow type while allowing arbitrary blur.'],
  ['blend-mode-is-fixed',['appearance.blendMode','baseline.effective.appearance.blendMode'],'Native A содержит blendMode, но текущий Editor/core capture его не выдаёт.'],
  ['border-is-not-clickable',['interaction.surfaceClickHandler'],'Code/interactive mapping не проверен; статичный Figma снимок не доказывает кликабельность.'],
  ['public-roots-only',['placement.publicRootIdentity'],'Выбор root является правилом размещения/генерации; внутренние Style Level сохранены auxiliary evidence.'],
  ['platform-version-must-match',['placement.requestedPlatform'],'Нужно независимое ожидаемое platform; его нельзя выводить из имени D/M.'],
  ['promo-slot-radius-collection',['host.isPromoPage','radius.boundCollection'],'Нужна конкретная Promo collection и контекст применения; обычную collection не выдаём за Promo.'],
  ['adaptive-remove-inner-32-padding',['host.adaptiveComposition','host.contentCompression'],'Контекстная рекомендация адаптива, не универсальный запрет 32 px.'],
])deferred(suffix,facts,reason);
const empty={required:true,tokenIds:[]};
for(const [target,families,part] of [[rootTarget,['slot'],'slot'],[surfaceTarget,['legacy','promo'],'surface']]){
  for(const [kind,types] of [['fill',['Colored']],['stroke',['Border']]])add('colored-and-border-use-color-tokens',target,`appearance.${kind}`,'constrained',[{type:'tokenBinding',fact:`paintBindingsV1.${kind}`,bindingRequired:true}],{part:part+'.'+kind,applicability:applies(families,types),controlPaths:[{kind:'variable-binding'}]});
  add('border-has-no-visible-fill',target,'appearance.fill','constrained',[{type:'propertyDomain',fact:'paintBindingsV1.fill',values:[empty]}],{part,applicability:applies(families,['Border'])});
  // Fill binding is source14; this unique assertion adds presence and absence of stroke.
  add('colored-uses-fill-without-stroke',target,'appearance.fill','constrained',[{type:'propertyExclusion',fact:'paintBindingsV1.fill',values:[empty]},{type:'propertyDomain',fact:'paintBindingsV1.stroke',values:[empty]}],{part,applicability:applies(families,['Colored'])});
  add('primary-secondary-paint-is-fixed',target,'appearance.fill','forbidden',[],{part,capabilitySet:'visual-style@1',capabilitySelection:['appearance.fill','appearance.stroke'],applicability:applies(families,['Primary','Secondary'])});
  add('border-stroke-is-designer-controlled',target,'appearance.stroke','allowed',[],{part,capabilitySet:'stroke@1',applicability:applies(families,['Border']),controlPaths:[{kind:'direct'},{kind:'variable-binding'}],sourceRefs:[sourceBySuffix('border-stroke-is-designer-controlled').ruleId,sourceBySuffix('border-stroke-weight-is-context-controlled').ruleId]});
}
mapping.set(sourceBySuffix('border-stroke-weight-is-context-controlled').ruleId,mapping.get(sourceBySuffix('border-stroke-is-designer-controlled').ruleId));
add('no-secondary-for-level-2',surfaceTarget,'component.properties.Type','constrained',[{type:'propertyDomain',fact:'component.properties.Type',values:['Primary','Colored','Border']}],{applicability:{...applies(['legacy','promo']),contextDomains:{'semanticApi.family':['legacy','promo'],'semanticApi.Position':['Level 2 (inner)']}}});
add('blur-is-context-controlled',rootTarget,'appearance.effects','allowed',[],{controlPaths:[{kind:'direct'}],execution:{route:'policy-only',missingFacts:['appearance.effectTypeFilter']}});
const skeleton=add('skeleton-is-component-property',rootTarget,'component.properties.Skeleton','allowed',[],{controlPaths:[{kind:'host-property',property:'Skeleton'}],execution:{route:'policy-only',missingFacts:['manualPlaceholder.intent','explicitPattern.exception']}});
deferred('adaptive-level-2-becomes-level-1-without-outer',['host.adaptiveComposition'],'Рецепт исправления нормы level-2-requires-level-1; не создаёт второе нарушение.','policy-only');
const slotPermission=add('slot-content-levels',slotTarget,'composition.content','allowed',[],{part:'external-content',applicability:applies(['slot']),controlPaths:[{kind:'slot-api',target:slotTarget.id,property:'Slot#136328:0',contentOwnership:'external'}]});
const coverage=sourceRules.map((r,i)=>({sourceIndex:i+1,sourceRuleId:r.ruleId,sourceText:r.ruleText,sourcePath:path.join(sourceDir,'rules.json'),manualRuleIds:mapping.get(r.ruleId),classification:[1,2,3].includes(i+1)?'reader-or-mapping-policy':i+1===22?'merged-permission':i+1===29?'recipe-remediation':manual.rules.filter(m=>mapping.get(r.ruleId).includes(m.id)).every(m=>m.execution?.route==='context-only')?'context-or-reader-gap':'component-policy',nativeEvidence:'Phase A: 146 definitions / 18 public variants; definition-derived synthetic projections are not installed Editor acceptance.',dependencies:[],remainingQuestions:[]}));
assert(coverage.every(r=>r.manualRuleIds.length));
write('contract.manual.json',manual);
const bundle=c.buildExportBundle(manual,evidence,[]);
write('validation-report.json',bundle.validation);write('component-contract.v2.json',bundle.compiled);write('coverage.json',bundle.coverage);
for(const row of coverage){row.compiledRuleIds=bundle.compiled.rules.filter(r=>row.manualRuleIds.includes(r.source.anchor)).map(r=>r.ruleId);row.policies=bundle.compiled.customizationPolicy.filter(p=>row.manualRuleIds.includes(p.id)).map(p=>({id:p.id,permission:p.permission,route:p.execution?.route||'auto'}));row.nonExecutable=bundle.compiled.nonExecutableRules.filter(p=>row.manualRuleIds.includes(p.sourceRuleId));}
write('coverage-map.json',coverage);
assert(bundle.validation.valid,JSON.stringify(bundle.validation.issues.filter(i=>i.level==='error')));
const zip=c.buildAuthoringZip(bundle,[{name:'variant-evidence.json',text:JSON.stringify(evidence)},{name:'rules.json',text:fs.readFileSync(path.join(sourceDir,'rules.json'),'utf8')}]);
fs.writeFileSync(path.join(B,'BackgroundPlate.r1.candidate.component-contract.zip'),zip);
const entries=c.readZip(zip);const reopened=c.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:c.zipEntryText(e)})),componentId);
assert.equal(c.stableHash(reopened.manual),c.stableHash(manual));assert.equal(c.stableHash(reopened.variantEvidence),c.stableHash(evidence));assert.equal(c.stableHash(c.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled),c.stableHash(bundle.compiled));
write('roundtrip.json',{status:'PASS',manual:c.stableHash(manual),compiled:c.stableHash(bundle.compiled),variantEvidence:c.stableHash(evidence),publicVariants:18,nativeDefinitionsRetainedByPin:146,representations:6,errors:0,manualRules:manual.rules.length,compiledRules:bundle.compiled.rules.length,nonExecutable:bundle.compiled.nonExecutableRules.length,wholeReady:false,nativeLive:'NOT_RUN'});
console.log(JSON.stringify({valid:bundle.validation.valid,issues:bundle.validation.issues,manualRules:manual.rules.length,IR:bundle.compiled.rules.length,nonExecutable:bundle.compiled.nonExecutableRules.length,roundtrip:'PASS'}));
