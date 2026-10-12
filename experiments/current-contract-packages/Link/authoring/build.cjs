const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
(async () => {
const workspace = path.resolve(root, '../../../../../..');
const ds = path.join(workspace, 'shared/design-system_ab');
const core = require(path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name)));
const write = (name, value) => {
  const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const captureFiles = ['S', 'S20', 'M', 'L'].map(size => `sources/native/Link.${size}.native-facts.2026-10-10.json`);
const native = captureFiles.map(read);
if (native.some(d => !d.complete || !d.reference.complete || !d.temporaryNodesRemoved)) throw Error('Incomplete native source');
// Figma's capture host and Editor can collate mixed-case paths differently.
// Build the pinned projection in the same JS runtime as the shared core.
for (const d of native) d.reference.nodes.sort((a,b)=>a.path.localeCompare(b.path)||a.type.localeCompare(b.type));
const id = 'core.web.link', repr = `${id}.figma.universal`, setKey = native[0].set.key;
const sourcePaths = [
  ...['agent-context.json','rules.json','composition-contract.json','contract.generated.json','contract.overrides.json','examples.json','audit-mapping.json'].map(n => `design-system_ab/JSONS/web/components/web-core/core/Link/${n}`),
  'design-system_ab/JSONS/web/components/web-core/core/Web _ Core -- Link.json',
  'design-system_ab/patterns/p_link.md',
  ...['guidelines.md','adapter.figma.md','adapter.code.md','bridge.md','cookbook.md','figma-keys.json'].map(n => `ds-ai-hub/core/web/components/link/${n}`),
];
const inventory = sourcePaths.map(p => {
  const [repo, ...rest] = p.split('/');
  const source = path.join(repo === 'design-system_ab' ? ds : path.join(workspace, repo), ...rest);
  const data = fs.readFileSync(source);
  // Preserve the old generated export as reference text: importing it as active
  // Athena evidence would replace the independently captured native anatomy.
  const stored = p.endsWith('/contract.generated.json') ? p + '.reference.txt' : p;
  const dest = path.join(root, 'sources', stored);
  if(fs.existsSync(dest) && sha(fs.readFileSync(dest))!==sha(data)) throw Error(`Pinned source changed: ${p}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true }); if(!fs.existsSync(dest)) fs.writeFileSync(dest, data);
  return {path:`sources/${stored}`, originalPath:p, sha256:sha(data), bytes:data.length};
}).concat([...captureFiles,'sources/native/Link.property-activity.native-facts.2026-10-10.json'].map(p => ({path:p,sha256:sha(fs.readFileSync(path.join(root,p))),bytes:fs.statSync(path.join(root,p)).size})));
const evidence = {schemaVersion:'apollo.variant-anatomy.v1', sourceHash:core.stableHash(native),
  occurrenceAddressVersion:1, structures:{}, variants:[], occurrences:[]};
for (const d of native) {
  const structureId = core.stableHash(d.reference.nodes);
  evidence.structures[structureId] = d.reference.nodes;
  evidence.variants.push({componentKey:d.master.key,componentSetKey:setKey,structureId,properties:d.master.properties});
  evidence.occurrences.push({componentKey:d.master.key,componentSetKey:setKey,
    namesByPath:Object.fromEntries(d.nodes.map(row => [row[7],row[4]]))});
}
const pathFor = (role, d) => {
  if(role==='root') return '';
  if(role==='label') return 'Content / Label';
  if(role==='content') return 'Content';
  if(role==='underline') return 'Content / Underline';
  if(role==='left-addon') return 'AddonLeft';
  if(role==='right-addon') return 'AddonRight';
  const side = role==='left-icon' ? 'AddonLeft' : 'AddonRight';
  const matches = d.reference.nodes.filter(n => n.type==='INSTANCE' && n.path.startsWith(side+' / ') && d.reference.nodeProperties[n.path]?.propertyReferenceBindings?.mainComponent);
  if(matches.length!==1) throw Error(`Ambiguous ${role}`);
  return matches[0].path;
};
const roles = ['root','content','label','underline','left-addon','right-addon','left-icon','right-icon'];
const targets = roles.map(role => ({id:`target.${role}`,semanticRole:role,label:role,componentFamily:'Link',
  lineage:role==='root'?[id]:[id,'root'],resolution:'resolved',nameHint:role==='root'?'Link':native[0].reference.nodeProperties[pathFor(role,native[0])].diagnosticName,
  pathHint:'Link'+(pathFor(role,native[0])?' / '+pathFor(role,native[0]):''),
  representationHints:[{representationId:repr,pathHint:'Link'+(pathFor(role,native[0])?' / '+pathFor(role,native[0]):'')}],
  variantHints:native.map(d=>({representationId:repr,componentKey:d.master.key,pathHint:'Link'+(pathFor(role,d)?' / '+pathFor(role,d):'')})),
  identityBindingsV1:native.map(d=>{
    const p=pathFor(role,d),n=d.reference.nodeProperties[p], row=d.nodes.find(n=>n[7]===p);
    return {representationId:repr,componentKey:d.master.key,componentSetKey:setKey,
      referenceHash:core.stableHash(d.reference),portableReferenceHash:core.portableDeclaredTargetReferenceHash(d.reference),referencePath:p,nodeType:row[5],
      ...(n.sourceIdentity?{nativeSource:{sourceNodeId:n.sourceIdentity.sourceNodeId,ownerComponentKey:n.sourceIdentity.ownerComponentKey,ownerMainComponentId:n.sourceIdentity.ownerMainComponentId}}:{})};
  })}));
const documentation = sourcePaths.filter(p=>/rules.json|guidelines.md|adapter.figma.md|adapter.code.md|bridge.md|cookbook.md/.test(p)).map(p=>({
  id:p.endsWith('rules.json')?'athena.link.rules':`hub.link.${path.basename(p,'.md')}`,kind:path.basename(p,'.md'),path:`sources/${p}`,status:'draft',projection:'reference-only'}));
const property = {label:'✎ Label#493:29',left:'Left Addon#60204:0',right:'Right Addon#60204:4'};
const api = (name, kind, valueType, nativePath, extra={}) => ({id:name,kind,valueType,...extra,bindings:[{representationId:repr,path:nativePath}]});
const semanticApi = [
  api('size','variant','enum','component.properties.Size',{domain:native.map(d=>d.master.properties.Size),defaultValue:'S (14-20)'}),
  api('label','content','string',`component.properties.${property.label}`,{defaultValue:'Label'}),
  api('left-addon','visibility','boolean',`component.properties.${property.left}`,{defaultValue:true}),
  api('right-addon','visibility','boolean',`component.properties.${property.right}`,{defaultValue:true}),
  ...Object.keys(native[0].definitions).filter(p=>native[0].definitions[p].type==='INSTANCE_SWAP').map(p=>api(p.split('#')[0].toLowerCase().replaceAll(' ','-'),'slot','node',`component.properties.${p}`)),
  {id:'underline',kind:'variant',valueType:'enum',domain:['Solid','Pseudo','None'],defaultValue:'Solid',description:'Публичный VARIANT Line вложенного Underline; whole-instance swap не является выбором типа подчёркивания.',bindings:[{representationId:repr,targetId:'target.underline',path:'component.properties.Line'}]},
  {id:'view',kind:'appearance',valueType:'enum',domain:['default','primary','secondary'],description:'Figma: override текста/токена, нативного свойства View нет. Точная матрица токенов требует отдельного подтверждения; executable mapping пока отсутствует.',bindings:[{representationId:`${id}.code.web`,path:'props.view'}]},
];
const baseRule = (suffix,target,capability,permission,rationale,constraints=[],controls=[],route='predicate',extra={}) => ({
  id:suffix.startsWith('component:')?suffix:`component:web-core.link.${suffix}`,targetId:`target.${target}`,targetScope:'self',capability,permission,
  constraints,controlPaths:controls,applicability:{variants:'all',modes:'all',platforms:[],scopeStatus:'confirmed'},
  severity:permission==='allowed'?'info':'error',rationale,status:'draft',owner:'design-system-authors',ownership:{kind:'component',ownerId:id},
  sourceRefs:['hub.link.adapter.figma'],execution:{route},...extra});
const domain = (fact,values)=>({type:'propertyDomain',fact,values});
const rules = [
  baseRule('component-properties-are-first-class','root','component-properties','allowed','Публичные variant/component properties редактируются через API Link; их производные изменения не являются ручной правкой слоя.',[],Object.keys(native[0].definitions).map(property=>({kind:'host-property',property})), 'policy-only',{sourceRefs:['athena.link.rules','hub.link.adapter.figma']}),
  baseRule('layer-properties-use-effective-baseline','root','component.baseline','constrained','Внутренний автолейаут и визуальные свойства сохраняют независимый эталон выбранного Size и вложенного состояния. Публичные текст, BOOL аддонов, icon swap и Line не блокируются. Цвет/view проверяется отдельным правилом; незавершённая матрица цвета не выдаётся за полный baseline.',
    [...core.capabilitiesForSet('auto-layout@1'),...core.capabilitiesForSet('visual-style@1').filter(f=>f!=='appearance.fill'),'appearance.strokeWeight'].map(fact=>({type:'propertyForbidden',fact})),[], 'predicate',
    {targetScope:'self-and-descendants',boundaryPolicy:'component-owned@1',sourceRefs:['athena.link.rules','hub.link.adapter.figma'],propertyApplicability:{'layout.itemSpacing':'flow-gap-either@1','layout.padding.top':'auto-layout-padding-either@1','layout.padding.right':'auto-layout-padding-either@1','layout.padding.bottom':'auto-layout-padding-either@1','layout.padding.left':'auto-layout-padding-either@1','appearance.strokeWeight':'stroke-present-either@1'}}),
  baseRule('size-domain','root','component.configuration','constrained','Выбор Size ограничен четырьмя опубликованными вариантами; Custom в текущем нативном API отсутствует.',[domain('component.properties.Size',native.map(d=>d.master.properties.Size))],[], 'predicate',{propertyConformance:'configured-native@1'}),
  baseRule('label-content','label','text.characters','allowed','Текст Link меняется через публичное поле Label. Глобального лимита 32 символа у Link нет.',[],[{kind:'host-property',property:property.label,required:true,exclusive:true}],'policy-only'),
  baseRule('label-typography','label','text.typography','constrained','Типографика Label соответствует выбранному Size; текстовое содержимое меняется через Label.',
    ['text.fontName','text.fontSize','text.lineHeight','text.letterSpacing','text.case','text.decoration','text.textAutoResize','text.textAlignHorizontal','text.textAlignVertical'].map(fact=>({type:'propertyForbidden',fact}))),
  ...['root','content'].map(role=>baseRule(`${role}-fill-baseline`,role,'appearance.fill','forbidden','Поверхности корня Link и контейнера Content не перекрашиваются вручную. Выбор View относится к содержимому ссылки.')),
  baseRule('underline-domain','underline','component-property.Line','constrained','Тип подчёркивания задаётся вложенным Line: Solid, Pseudo или None.',[domain('component.properties.Line',['Solid','Pseudo','None'])]),
  ...['left-icon','right-icon'].map(role=>baseRule(`${role}-swap`,role,'component.swap','allowed','Иконка выбирается через публичный swap-порт соответствующей стороны и размера; содержимое выбранного asset проверяется сквозным контрактом иконок.',[],[16,20,24].map(size=>({kind:'slot-api',target:`target.${role}`,property:Object.keys(native[0].definitions).find(p=>p.startsWith((role==='left-icon'?'Left':'Right')+' icon '+size+'#')),contentOwnership:'external',exclusive:true})),'policy-only')),
  ...[['left-addon',property.left],['right-addon',property.right]].map(([role,p])=>baseRule(`${role}-visibility` ,role,'visibility','constrained','Видимость аддона определяется публичным BOOLEAN Link; прямой override видимости не заменяет этот параметр.',[{type:'propertyForbidden',fact:'visible'}],[{kind:'host-property',property:p,required:true,exclusive:true}])),
  ...['left-icon','right-icon'].map(role=>baseRule(`${role}-height`,role,'bounds.height','constrained','Высота видимой иконки не превышает line-height выбранного размера Link.',[{type:'layoutConstraint',fact:'bounds.height',operator:'at-most-line-height',targetRole:'label'}])),
  baseRule('view-token-mapping','label','appearance.fill','constrained','View выбирается из default/primary/secondary через цветовой токен; произвольный цвет не является новым View. Точные token IDs и единая окраска Label/Underline/addons требуют подтверждения.',[domain('semanticApi.view',['default','primary','secondary'])],[],'context-only',{sourceRefs:['hub.link.guidelines','hub.link.bridge'],execution:{route:'context-only',missingFacts:['link.viewTokenMapping','link.viewContext']}}),
  baseRule('underline-none-context','underline','usage.underline-none','forbidden','Line=None допустим только для синего view=default вне блока текста.',[],[],'context-only',{sourceRefs:['hub.link.guidelines'],execution:{route:'context-only',missingFacts:['context.inlineParagraph','link.viewContext']}}),
  baseRule('inline-link-addons','root','usage.inline-addons','forbidden','Встроенная в абзац ссылка оформляется по контексту текста; аддоны используются у отдельной ссылки.',[],[],'context-only',{sourceRefs:['hub.link.guidelines'],execution:{route:'context-only',missingFacts:['context.inlineParagraph']}}),
  baseRule('destination-label','label','usage.ambiguous-label','forbidden','Текст однозначно объясняет назначение ссылки; проверяется редакционной политикой и контекстом назначения.',[],[],'policy-only',{ownership:{kind:'editorial-policy',ownerId:'core.common.editorial-policy'},sourceRefs:['hub.link.guidelines']}),
];
const manual = {schemaVersion:'apollo.component-contract.manual.v2-experimental',documentType:'component-contract-manual',
  component:{componentId:id,familyId:id,contractId:id,family:'Link',layer:'core',library:'Web _ Core',platform:'universal',platforms:['universal'],lifecycle:'active',componentKey:setKey},
  semantics:{purpose:'Переход или вспомогательное действие с текстовым акцентом.',useWhen:['Нужна навигация или переход.','Нужно вспомогательное раскрытие без основного CTA.'],doNotUseWhen:[{condition:'Основное действие экрана.',useComponentId:'core.web.button'}],relatedComponentIds:['core.web.button','web.benefit-card'],keywords:['link','ссылка','навигация']},
  representations:[{id:repr,kind:'figma',platform:'universal',status:'draft',locator:{fileKey:'lGWq8DtnUcSkRasagBuwq6',nodeId:'493:7843',componentSetKey:setKey,componentKey:setKey,name:'Link'}},{id:`${id}.code.web`,kind:'code',platform:'web',status:'draft',locator:{package:'@alfalab/core-components/link',export:'Link'}}],
  semanticApi,documentation,targets,controlPorts:[],rules,examples:[],decisions:[
    {id:'link.native-api.2026-10-10',status:'proposed',summary:'Один универсальный Figma set, 4 Size, BOOL defaults=true.',rationale:'Нативное наблюдение; противоречия документации сохранены в source-drift. Норма Custom не восстановлена вручную.',sourceRefs:['hub.link.adapter.figma']},
    {id:'link.parent-limits.2026-10-10',status:'accepted',summary:'Лимит BenefitCard не переносится в общий Link.',rationale:'32 символа / одна строка — требование владельца BenefitCard; глобальный Link не имеет такого лимита.',sourceRefs:[]}
  ],generation:{profiles:[],instructions:['Используй нативный Link выбранного Size; публичные свойства типизированы.','Не публикуй Draft как принятый контракт.']},
  source:{kind:'manual-source',importedFiles:inventory.map(s=>s.path),sourceHash:sha(inventory.map(s=>`${s.path}\0${s.sha256}`).sort().join('\n')),importedAt:'2026-10-10T00:00:00+03:00'},
  metadata:{revision:1,owners:{manual:'design-system-authors',generated:'component-contract-core'},createdAt:'2026-10-10T00:00:00+03:00',updatedAt:'2026-10-10T00:00:00+03:00',declaredTargetIdentityVersion:3,ruleOwnershipVersion:1}};
if (!fs.existsSync(path.join(root,'contract.manual.json'))) write('contract.manual.json',manual);
const authored = read('contract.manual.json');
if (authored.source.sourceHash !== manual.source.sourceHash) throw Error('Source inventory differs from the authored pin');
const bundle = core.buildExportBundle(authored,evidence);
if(!bundle.validation.valid) throw Error(JSON.stringify(bundle.validation));
const athena = JSON.parse(fs.readFileSync(path.join(root,'sources/design-system_ab/JSONS/web/components/web-core/core/Link/rules.json')));
const originalIds = [...(athena.generated?.rules||[]),...(athena.manual?.rules||[])].map(r=>r.ruleId);
if(originalIds.some(id=>!authored.rules.some(r=>r.id===id)))throw Error('Lost source RuleID');
const compactZip = core.buildAuthoringZip(bundle, captureFiles.map(name=>({name,text:fs.readFileSync(path.join(root,name),'utf8')})));
const sourceEntries=inventory.map(s=>({name:s.path,data:fs.readFileSync(path.join(root,s.path))}));
const zip=core.createZip([...(await core.readZip(compactZip)),...sourceEntries]);
const zipFiles = (await core.readZip(zip)).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)}));
const reopened = core.importWorkspace(zipFiles.filter(f=>f.name.endsWith('.json')),id);
const rebuilt=core.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
if(core.stableHash(reopened.manual)!==core.stableHash(authored)||core.stableHash(reopened.variantEvidence)!==core.stableHash(evidence)||core.stableHash(rebuilt.compiled)!==core.stableHash(bundle.compiled))throw Error('ZIP roundtrip mismatch '+JSON.stringify({manual:core.stableHash(reopened.manual)===core.stableHash(authored),facts:core.stableHash(reopened.variantEvidence)===core.stableHash(evidence),compiled:core.stableHash(rebuilt.compiled)===core.stableHash(bundle.compiled)}));
write('compiled/component-contract.v2.json',bundle.compiled);
write('evidence/variant-evidence.json',evidence);
write('reports/source-inventory.json',{schemaVersion:'apollo.component-contract.source-inventory.v1',componentId:id,sources:inventory});
write(`reports/package-checks.r${authored.metadata.revision}.json`,{valid:true,coreVersion:JSON.parse(fs.readFileSync(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/package.json'))).version,manualHash:core.stableHash(authored),compiledHash:core.stableHash(bundle.compiled),zipSha256:sha(zip),zipRoundtrip:true,variantCount:4,targetCount:8,sourceRules:authored.rules.length,coverage:bundle.coverage,issues:bundle.validation.issues,liveAcceptance:'pending',wholeReady:false,omittedNativeFacts:native[0].omittedFacts});
write('reports/rule-crosswalk.json',{componentId:id,missingAthenaRuleIds:[],entries:authored.rules.map(r=>({ruleId:r.id,route:r.execution.route,status:r.status,compiledRuleIds:bundle.compiled.rules.filter(ir=>ir.source.anchor===r.id).map(ir=>ir.ruleId),policyIds:bundle.compiled.customizationPolicy.filter(p=>p.id===r.id).map(p=>p.id),sourceRefs:r.sourceRefs,hubEvidence:r.sourceRefs.filter(s=>s.startsWith('hub.')).map(s=>({kind:'section',path:documentation.find(d=>d.id===s).path,relation:'supports'}))}))});
write('reports/source-drift.json',{status:'found',ownerDecision:'pending',items:[
  {id:'drift:link.figma-size-custom',hub:'Custom присутствует в adapter.figma',native:'4 Size; Custom отсутствует'},
  {id:'drift:link.figma-size-default',hub:'Default M (16-24)',native:'Default S (14-20)'},
  {id:'drift:link.figma-addon-defaults',hub:'Left/Right Addon=false',native:'Оба BOOLEAN=true'},
  {id:'drift:link.underline-none-pattern',hub:'Line=None допустим для view=default вне текста',pattern:'rule:components.link.no-underline-exception: без подчёркивания только кликабельный телефон',scope:'Desktop pattern versus component usage guideline; no precedence decision',ownerDecision:'pending'}]});
fs.writeFileSync(path.join(root,'../..','Link.component-contract.zip'),Buffer.from(zip));
console.log(JSON.stringify({sourceRules:authored.rules.length,coverage:bundle.coverage,issues:bundle.validation.issues,zipBytes:zip.length,zipSha256:sha(zip)},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
