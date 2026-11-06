#!/usr/bin/env node
'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {createRequire}=require('node:module');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const clone=value=>JSON.parse(JSON.stringify(value));
const baselineProperties=['radius','opacity','layout.width','layout.height','layout.itemSpacing','layout.padding.top','layout.padding.right','layout.padding.bottom','layout.padding.left','styles.text','fill','stroke'];
const rangeProperties=['layout.width','layout.height','layout.minWidth','layout.maxWidth','layout.minHeight','layout.maxHeight'];
const kinds=[{id:'countBetween',label:'Количество вложенных компонентов'},{id:'propertyBaseline',label:'Свойство слоя совпадает с библиотечным эталоном'},{id:'propertyRange',label:'Размер находится в числовом диапазоне'}];
async function loadRuntime(apolloRoot){
 if(!apolloRoot)throw Error('Укажи --apollo-root или APOLLO_ROOT: checkout Apollo с установленными npm-зависимостями.');
 apolloRoot=fs.realpathSync(apolloRoot);const req=createRequire(path.join(apolloRoot,'package.json')),esbuild=req('esbuild');
 const modules={prep:'data-preparation.ts',references:'reference/referenceList.ts',registry:'rules/runtimeContractRegistry.ts',engine:'rules/compositionContractEngine.ts',evaluator:'rules/compositionContractRegistry.ts',propertyRules:'rules/componentRules.ts',diff:'structure/diff.ts',assessment:'assessment/customizationAssessment.ts',contractDiffs:'rules/contractAwareDiffs.ts',stats:'stats/report.ts'};
 const entry='module.exports={'+Object.entries(modules).map(([name,file])=>JSON.stringify(name)+':require('+JSON.stringify(path.join(apolloRoot,'src/v3-audit',file))+')').join(',')+'};';
 const captured=new Map();
 const built=await esbuild.build({absWorkingDir:apolloRoot,tsconfigRaw:{compilerOptions:{}},stdin:{contents:entry,resolveDir:apolloRoot,sourcefile:'v3-rule-author-memory.cjs'},bundle:true,write:false,metafile:true,platform:'node',format:'cjs',logLevel:'silent',plugins:[{name:'capture-v3-source',setup(build){build.onLoad({filter:/\.(?:[cm]?js|ts|json)$/},args=>{
  if(args.namespace!=='file')return;const bytes=fs.readFileSync(args.path);captured.set(args.path,sha(bytes));
  return{contents:bytes.toString('utf8'),loader:args.path.endsWith('.ts')?'ts':args.path.endsWith('.json')?'json':'js'};
 });}}]});
 const inputs=Object.keys(built.metafile.inputs).map(file=>path.resolve(apolloRoot,file)).filter(file=>fs.existsSync(file));
 if(inputs.some(file=>/\/v3-audit\/(entry|bridge|native-port)\.ts$|\/component-contract-core\//.test(file)))throw Error('Неподходящий runtime: авторинг должен использовать только чистые исполнители V3.');
 const pins=inputs.map(file=>{if(!captured.has(file))throw Error('Незакреплённый вход компилятора: '+file);return{file,sha256:captured.get(file)};});
 for(const pin of pins)if(sha(fs.readFileSync(pin.file))!==pin.sha256)throw Error('Исходники Apollo изменились во время чтения.');
 const module={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(req,module,module.exports);
 return Object.assign(module.exports,{sourceRoot:apolloRoot,assertCurrent(){for(const pin of pins)if(sha(fs.readFileSync(pin.file))!==pin.sha256)throw Error('Исходники Apollo изменились во время проверки. Повтори подготовку.');},pins});
}
function changes(before,after,prefix=''){
 if(JSON.stringify(before)===JSON.stringify(after))return[];
 if(before&&after&&typeof before==='object'&&typeof after==='object')return Array.from(new Set([...Object.keys(before),...Object.keys(after)])).flatMap(key=>changes(before[key],after[key],prefix+'/'+key.replace(/~/g,'~0').replace(/\//g,'~1')));
 return[{path:prefix,before,after}];
}
function readFile(root,file,pins){
 const target=path.resolve(root,file);
 if(!target.startsWith(root+path.sep)||fs.realpathSync(target)!==target||!fs.lstatSync(target).isFile())throw Error('Источник должен быть обычным файлом внутри репозитория.');
 const bytes=fs.readFileSync(target),digest=sha(bytes);if(pins.has(target)&&pins.get(target)!==digest)throw Error('Исходные данные изменились во время повторного чтения.');pins.set(target,digest);return JSON.parse(bytes);
}
function readComponentPackage(dsRoot,component,runtime,pins){
 const index=readFile(dsRoot,'JSONS/apollo/indexes/componentContractIndex.json',pins),entries=index.packages.filter(entry=>entry.componentKey===component);
 if(entries.length!==1)throw Error('Нужен один точный componentKey из индекса. Команда list покажет доступные компоненты.');
 const entry=entries[0],paths=runtime.prep.policyArtifactPaths(entry),payloads=new Map(),jsonRoot=path.join(dsRoot,'JSONS');
 for(const [role,file]of Object.entries(paths))if(file){
  if(/^https?:\/\//i.test(file))throw Error('Этот инструмент читает объявленные локальные sidecars; сетевой fallback запрещён.');
  payloads.set(runtime.references.resolveCatalogUrl(entry.baseUrl||index.baseUrl||'',file),{role,file,body:readFile(jsonRoot,file,pins)});
 }
 return{index,entry,paths,payloads,jsonRoot};
}
function propertyKind(rule){
 if(!rule||rule.conditions&&Object.keys(rule.conditions).length||['requiredValues','requiredVariant','forbiddenVariant','requiredVariantByContext','requiredTokenBinding','requiredTokenSource','requiredConfiguration','requiredPaintState','sharedValueConstraint'].some(k=>rule[k]!==undefined))return null;
 if(rule.numericConstraint)return rangeProperties.includes(rule.appliesTo)&&Object.keys(rule.numericConstraint).every(k=>['minimum','maximum'].includes(k))?'propertyRange':null;
 return baselineProperties.includes(rule.appliesTo)?'propertyBaseline':null;
}
async function inspectComponent(options){
 if(options.output)throw Error('inspect только читает данные и печатает JSON; папку результата создаёт create/interview.');
 const dsRoot=fs.realpathSync(options.dsRoot||path.resolve(__dirname,'../..')),runtime=await loadRuntime(options.apolloRoot||process.env.APOLLO_ROOT),pins=new Map();
 const {index,entry,payloads}=readComponentPackage(dsRoot,options.component,runtime,pins);
 const normalized=await runtime.prep.preparePolicies({...index,packages:[entry]},async url=>{const data=payloads.get(url);if(!data)throw Error('Необъявленный локальный источник: '+url);return clone(data.body);},index.baseUrl||'');
 const declarations=[];
 for(const item of payloads.values())if(['rules','composition'].includes(item.role)){
  for(const block of ['','generated','manual','runtime']){
   const body=block?item.body[block]:item.body,prefix=block?'/'+block:'';
   if(item.role==='rules')for(const [i,rule]of (Array.isArray(body?.rules)?body.rules:[]).entries())declarations.push({format:'rules',ruleId:rule.ruleId,sourceFile:'JSONS/'+item.file,pointer:prefix+'/rules/'+i,definition:rule});
   else for(const [i,contract]of (Array.isArray(body?.contracts)?body.contracts:[]).entries())for(const [j,rule]of (contract.constraints||[]).entries())declarations.push({format:'composition',ruleId:contract.id+'.'+rule.id,sourceFile:'JSONS/'+item.file,pointer:prefix+'/contracts/'+i+'/constraints/'+j,definition:rule});
  }
 }
 const row=normalized.packages[0],rules=[];
 function add(format,ruleId,rule,selector){
  rules.push({format,ruleId,text:rule.ruleText||rule.message,condition:format==='composition'?clone(rule):{appliesTo:rule.appliesTo,checkType:rule.checkType||null,severity:rule.severity,ruleKind:rule.ruleKind||null,authority:rule.authority||null,numericConstraint:rule.numericConstraint||null},selector,
   sources:declarations.filter(d=>d.format===format&&d.ruleId===ruleId).map(d=>({file:d.sourceFile,pointer:d.pointer,equalsEffective:changes(d.definition,rule).length===0})),
   normReferences:{source:rule.source||null,patternRuleIds:[rule.patternRuleId,...(rule.patternRuleIds||[])].filter(Boolean)},
   authoringKind:format==='composition'?(rule.op==='countBetween'?'countBetween':null):propertyKind(rule),authoringKindSupported:format==='composition'?rule.op==='countBetween':propertyKind(rule)!==null,examplesVerified:false});
 }
 for(const rule of row.rulesEntry?.rulesFile.rules||[])add('rules',rule.ruleId,rule,{target:rule.target||null,conditions:rule.conditions||null});
 for(const contract of row.compositionEntry?.contract.contracts||[])for(const rule of contract.constraints)add('composition',contract.id+'.'+rule.id,rule,{match:contract.match,select:contract.select});
 const outsideProjection=declarations.filter(d=>!rules.some(rule=>rule.format===d.format&&rule.ruleId===d.ruleId)).map(d=>({format:d.format,ruleId:d.ruleId,file:d.sourceFile,pointer:d.pointer}));
 runtime.assertCurrent();for(const [file,digest]of pins)if(sha(fs.readFileSync(file))!==digest)throw Error('Исходные данные изменились во время просмотра. Повтори inspect.');
 return{status:'COMPONENT_RULES_INSPECTED',component:entry.componentKey,name:entry.packageName,rules,outsideProjection,sourcePins:Array.from(pins,([file,sha256])=>({file:path.relative(dsRoot,file),sha256})),runtimeInputs:runtime.pins.map(pin=>({file:path.relative(runtime.sourceRoot,pin.file),sha256:pin.sha256})),
  limitations:['Показана фактическая проекция V3 из файлов пакета; это не проверка макета и не подтверждение применимости нормы к любому узлу.','authoringKindSupported относится только к типу условия: create отдельно проверяет формат, manual/runtime overlay, селектор и примеры.','Ссылки на паттерны перечислены, но внешние нормы и семантические дубликаты ещё должен сверить автор. Никакие исходники не изменены.']};
}
function propertyValue(property,value,label){
 if(value===undefined||value===null||String(value).trim()==='')throw Error('Нужен подтверждённый '+label+' для '+property+'. Отсутствие факта не является PASS.');
 if(['fill','stroke','styles.text'].includes(property)){if(typeof value!=='string')throw Error(label+' должен быть непустым строковым идентификатором стиля/токена.');return value.trim();}
 if(typeof value!=='string'&&typeof value!=='number')throw Error(label+' должен быть числом или числовой строкой, без преобразования BOOL/объектов.');
 const number=Number(value);if(!Number.isFinite(number)||number<0||property==='opacity'&&number>1)throw Error(label+' должен быть допустимым конечным числом для '+property+'.');return number;
}
function propertyTree(key,name,layer,property,value){
 const root={id:0,parentId:null,nodeId:'author-owner',name,path:name,type:'INSTANCE',visible:true,radius:0,componentInstance:{componentKey:key,variantProperties:{}}},nodes=[root];let node=root;
 if(layer.toLowerCase()!=='root')for(const part of layer.split('/').map(s=>s.trim()).filter(Boolean)){const child={id:nodes.length,parentId:node.id,nodeId:'author-layer-'+nodes.length,name:part,path:node.path+' / '+part,type:'FRAME',visible:true,radius:0};nodes.push(child);node=child;}
 if(property==='styles.text'){if(node===root)throw Error('Текстовый стиль проверяется на TEXT-слое; укажи --layer.');node.type='TEXT';node.styles={text:{styleKey:value}};}
 else if(property==='fill'||property==='stroke')node[property]={token:value,color:'#000000',paintTypes:['SOLID']};
 else if(property.startsWith('layout.padding.'))node.layout={padding:{[property.split('.').at(-1)]:value}};
 else if(property.startsWith('layout.')){node.layout={[property.slice(7)]:value};if(['layout.width','layout.height'].includes(property))node.layout.sizing={horizontal:'FIXED',vertical:'FIXED'};}
 else node[property]=value;
 if(property==='layout.itemSpacing')for(let i=0;i<2;i++)nodes.push({id:nodes.length,parentId:node.id,nodeId:'author-member-'+i,name:'Member '+i,path:node.path+' / Member '+i,type:'FRAME',visible:true,radius:0});
 return nodes;
}
function propertyReport(runtime,diffs,key,name){
 const views=Object.fromEntries(['deprecatedComponents','deprecatedStyles','customStyles','updates','customizations','localComponents','detachedComponents','presets','technicalComponents','currentComponents','wrongChannel','themization'].map(k=>[k,[]]));
 if(diffs.length)views.customizations=[{id:'author-owner',name,nodeType:'INSTANCE',pageName:'Synthetic authoring',pathSegments:[],fullPath:name,relevance:'current',librarySource:'Synthetic authoring',isLocal:false,reference:{key,name},componentKey:key,diffs}];
 const date=new Date('2000-01-01T00:00:00Z');return runtime.stats.buildApolloStatsReport({pluginVersion:'rule-author-synthetic',user:{id:null,name:'Author'},figma:{fileKey:null,fileName:null,editorType:'figma'},scan:{channel:'Desktop',startedAt:date,finishedAt:date,selection:[],settings:{shellAuditEnabled:false,experimentalContractV2Enabled:false},scannedComponents:1},views,resolveStyleResource:()=>null,resolveTokenResource:()=>null}).categories.customizations.items.flatMap(item=>item.changes);
}
function verifyPropertyRule(runtime,normalized,entry,rule,kind,good,bad){
 const key=rule.target?.componentKeys?.find(k=>entry.figmaKeys?.includes(k))||entry.figmaKeys?.[0];if(!key)throw Error('Для примеров нужен наблюдаемый Figma key компонента из индекса.');
 const target=rule.target||{},layers=target.layers||[target.layer||'root'];
 if(Object.keys(target).some(k=>!['component','components','componentKeys','componentNames','layer','layers'].includes(k))||!Array.isArray(layers)||!layers.length||layers.some(x=>typeof x!=='string'||!x.trim()))throw Error('Сценарий поддерживает конкретный root/слой без slot-селекторов.');
 const name=entry.packageName;if(typeof name!=='string'||!name.trim())throw Error('Для примеров нужно независимое имя компонента из индекса.');
 const examples=[],previousNames=globalThis.__APOLLO_TEST_COMPONENT_NAME_BY_KEY__;
 const run=(actual,reference,ownerKey)=>{
  const raw=runtime.diff.diffStructures(actual,reference,{strict:true,isPaintToken:()=>true});if(raw.issues.length)throw Error('Пример невычислим: '+raw.issues.join('; '));
  const collected=raw.diffs.concat(kind==='propertyRange'?runtime.propertyRules.createNumericConstraintRuleDiffs(actual,raw.diffs):[]).map(runtime.propertyRules.applyVariableBindingAssessment).map(runtime.propertyRules.applyStructuredComponentRuleAssessment);
  const rebased=runtime.contractDiffs.applyContractAwareDiffs(collected,{enabled:true,hostComponentKey:ownerKey,hostComponentName:name,actualStructure:actual,hostReference:reference}).diffs;
  const assessed=runtime.assessment.assessCustomizationDiffs(rebased,{hostDiffs:raw.diffs,hostReference:reference}).map(runtime.propertyRules.applyContextualComponentRuleAssessment).map(runtime.propertyRules.finalizeComponentRuleAssessment);
  return{raw,changes:propertyReport(runtime,assessed,ownerKey,name)};
 };
 try{
  globalThis.__APOLLO_TEST_COMPONENT_NAME_BY_KEY__={...previousNames,[key]:name};runtime.registry.setNormalizedAuditPolicies(normalized);
  for(const layer of layers){
   const reference=propertyTree(key,name,layer,rule.appliesTo,good),actualGood=clone(reference),actualBad=propertyTree(key,name,layer,rule.appliesTo,bad);
   const positive=run(actualGood,reference,key),negative=run(actualBad,reference,key);
   if(positive.changes.some(x=>x.assessment?.verdict==='violation'||x.assessment?.verdict==='unknown')||positive.changes.length)throw Error('Правильный пример не подтвердил отсутствие нарушения.');
   const matching=negative.changes.find(x=>x.property===rule.appliesTo&&x.assessment?.verdict==='violation'&&x.assessment.ruleId===rule.ruleId);
   if(!matching)throw Error('Ошибочный пример не выполнил выбранное правило/селектор ('+rule.appliesTo+', '+layer+'); возможно, правило перекрыто или условие не поддержано V3.');
   examples.push({kind:'property-positive',layer,actual:good,result:'NO_VIOLATION',factsPresent:true},{kind:'property-negative',layer,actual:bad,result:'VIOLATION',ruleId:rule.ruleId,change:matching});
   if(kind==='propertyBaseline'&&['layout.width','layout.height'].includes(rule.appliesTo))for(const sizing of ['HUG','FILL']){
    const a=propertyTree(key,name,layer,rule.appliesTo,bad),b=propertyTree(key,name,layer,rule.appliesTo,good);for(const tree of [a,b])tree.find(n=>n.layout?.sizing).layout.sizing={horizontal:sizing,vertical:sizing};
    if(run(a,b,key).changes.some(x=>x.assessment?.ruleId===rule.ruleId))throw Error('Производный размер неожиданно считается ручным изменением.');examples.push({kind:'derived-sizing',layer,sizing,result:'NOT_APPLICABLE'});
   }
   if(kind==='propertyBaseline'&&rule.appliesTo==='layout.itemSpacing'){
    const a=propertyTree(key,name,layer,rule.appliesTo,bad),b=propertyTree(key,name,layer,rule.appliesTo,good),owner=a.find(n=>n.layout?.itemSpacing!==undefined).id;
    if(run(a.filter(n=>n.parentId!==owner),b.filter(n=>n.parentId!==owner),key).changes.some(x=>x.assessment?.ruleId===rule.ruleId))throw Error('Интервал пустого контейнера неожиданно сравнивается.');examples.push({kind:'empty-spacing',layer,result:'NOT_APPLICABLE'});
   }
   const foreignKey=sha('foreign-'+key).slice(0,40);if(entry.figmaKeys.includes(foreignKey))throw Error('Не удалось выбрать чужой key для контроля.');
   const foreign=run(propertyTree(foreignKey,'Foreign Owner',layer,rule.appliesTo,bad),propertyTree(foreignKey,'Foreign Owner',layer,rule.appliesTo,good),foreignKey);
   if(foreign.changes.some(x=>x.assessment?.ruleId===rule.ruleId))throw Error('Правило применяется к чужому компоненту.');examples.push({kind:'foreign-owner',layer,result:'NOT_APPLICABLE'});
  }
 }finally{runtime.registry.clearNormalizedAuditPolicies();if(previousNames===undefined)delete globalThis.__APOLLO_TEST_COMPONENT_NAME_BY_KEY__;else globalThis.__APOLLO_TEST_COMPONENT_NAME_BY_KEY__=previousNames;}
 return examples;
}
async function createPropertyCandidate(options){
 const dsRoot=fs.realpathSync(options.dsRoot||path.resolve(__dirname,'../..')),runtime=await loadRuntime(options.apolloRoot||process.env.APOLLO_ROOT),pins=new Map();
 const {index,entry,payloads,jsonRoot}=readComponentPackage(dsRoot,options.component,runtime,pins),artifact=Array.from(payloads.values()).find(x=>x.role==='rules');
 if(!artifact)throw Error('У компонента не объявлен rules.json.');
 for(const [file,digest]of options.interviewPins||[])if(pins.get(file)!==digest)throw Error('Исходные данные изменились после анкеты.');
 const source=artifact.body,candidate=clone(source);if(candidate.schemaVersion!==2||candidate.documentType!=='component-rules'||candidate.metadata?.ownershipSchema!=='apollo.artifact-ownership.v2')throw Error('Поддержан ownership-v2 rules.json; другой формат не преобразуется.');
 if(!options.id?.trim()||options.id!==options.id.trim()||!options.message?.trim()||!options.source?.trim())throw Error('Нужны стабильный полный RuleID, полная норма и её источник.');
 for(const block of ['generated','manual','runtime'])if((candidate[block]?.rules||[]).filter(r=>r.ruleId===options.id).length>1)throw Error('Неоднозначный RuleID в '+block+'.');
 if(candidate.runtime?.rules?.some(r=>r.ruleId===options.id))throw Error('Выбранное правило перекрыто runtime; manual-кандидат не будет исполняться.');
 candidate.manual=candidate.manual||{};candidate.manual.rules=candidate.manual.rules||[];
 let rule=candidate.manual.rules.find(r=>r.ruleId===options.id);const observed=rule||candidate.generated?.rules?.find(r=>r.ruleId===options.id),prior=observed?clone(observed):null;
 const property=options.property||prior?.appliesTo,kind=options.kind;
 if(!(kind==='propertyRange'?rangeProperties:baselineProperties).includes(property))throw Error('Свойство не поддержано этим сценарием: '+property);
 if(prior){
  if(propertyKind(prior)!==kind||prior.severity!=='error'||!runtime.propertyRules.isActiveComponentDesignRule(prior)||prior.checkType!=='deterministic')throw Error('Существующее правило другого/неподдержанного типа или не является активной детерминированной нормой.');
  if(property!==prior.appliesTo||options.layer!==undefined)throw Error('При изменении сохраняются свойство и селектор существующего правила.');
 }
 if(!rule){rule=prior?clone(prior):{ruleId:options.id,source:'component-contract',ruleKind:'design-rule',authority:{status:'active',provenance:'design-system-author',revision:1},severity:'error',checkType:'deterministic',matchKind:'exact_component_rule',appliesTo:property,target:{component:entry.componentKey,layers:[options.layer||'root']},classification:{treatAsViolation:true,resetSurface:'layer'}};candidate.manual.rules.push(rule);}
 rule.ruleText=options.message.trim();let good,bad;
 if(kind==='propertyRange'){
  const min=propertyValue(property,options.min,'минимум'),max=propertyValue(property,options.max,'максимум');if(min>max)throw Error('Минимум не может превышать максимум.');
  rule.numericConstraint={minimum:min,maximum:max};good=propertyValue(property,options.valid===undefined?min:options.valid,'правильное значение');bad=propertyValue(property,options.invalid===undefined?max+1:options.invalid,'ошибочное значение');
  if(good<min||good>max||bad>=min&&bad<=max)throw Error('Правильный пример должен быть внутри диапазона, ошибочный — снаружи.');
 }else{good=propertyValue(property,options.baseline,'эталон');bad=propertyValue(property,options.invalid,'ошибочное значение');if(good===bad)throw Error('Правильный и ошибочный примеры должны различаться.');}
 if(prior&&changes(prior,rule).length)rule.authority.revision=prior.authority.revision+1;
 const peers=[...(candidate.generated?.rules||[]),...candidate.manual.rules];if(peers.some(r=>r.ruleId!==rule.ruleId&&r.appliesTo===rule.appliesTo&&changes(r.target,rule.target).length===0&&changes(r.numericConstraint,rule.numericConstraint).length===0&&r.severity==='error'&&runtime.propertyRules.isActiveComponentDesignRule(r)))throw Error('Такая норма уже существует под другим RuleID; измени существующее правило.');
 const normalized=await runtime.prep.preparePolicies({...index,packages:[entry]},async url=>{const data=payloads.get(url);if(!data)throw Error('Необъявленный локальный источник: '+url);return clone(data===artifact?candidate:data.body);},index.baseUrl||'');
 const effective=normalized.packages[0].rulesEntry?.rulesFile.rules.find(r=>r.ruleId===rule.ruleId);if(!effective||changes(effective,rule).length)throw Error('Правило не попало в исполняемую проекцию V3.');
 const examples=verifyPropertyRule(runtime,normalized,entry,effective,kind,good,bad),delta=changes(source,candidate);
 runtime.assertCurrent();for(const [file,digest]of pins)if(sha(fs.readFileSync(file))!==digest)throw Error('Исходные данные изменились; кандидат не сохранён.');
 const output=path.resolve(options.output||'');if(!options.output||output===jsonRoot||output.startsWith(jsonRoot+path.sep)||fs.realpathSync(path.dirname(output))!==path.dirname(output))throw Error('Укажи новый output вне JSONS с существующей обычной родительской папкой.');
 const report={status:'DRAFT_PROPERTY_CANDIDATE_VERIFIED',kind,component:entry.componentKey,ruleId:rule.ruleId,sourceReference:options.source,sourceFile:'JSONS/'+artifact.file,sourceSha256:pins.get(path.join(jsonRoot,artifact.file)),candidateSha256:sha(JSON.stringify(candidate,null,2)+'\n'),normalizedRule:effective,delta,examples,runtimeInputs:runtime.pins.map(p=>({file:path.relative(runtime.sourceRoot,p.file),sha256:p.sha256})),limitations:['Синтетические полные факты проверяют выбранную норму и селекторы действующим V3; это не приёмка макета или реального библиотечного baseline.','Физическая ширина/высота в baseline-сценарии сравнивается только при Fixed; itemSpacing — при двух видимых детях. Hug/Fill и пустой контейнер проверены как неприменимые случаи, не PASS.','Неподдержанные свойства/условия не преобразуются. Отсутствующие факты и неприменимость не являются PASS.','Кандидат не применён к рабочим нормам, Ready/таблицы/индексы/публикация не менялись.']};
 fs.mkdirSync(output,{mode:0o700});try{
  for(const [file,value]of [['rules.candidate.json',candidate],['report.json',report]])fs.writeFileSync(path.join(output,file),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
  const condition=kind==='propertyRange'?'Число от '+rule.numericConstraint.minimum+' до '+rule.numericConstraint.maximum+' включительно.':'Совпадение с библиотечным эталоном выбранного варианта. Значение примера не зашивается в правило.';
  fs.writeFileSync(path.join(output,'preview.md'),'# Кандидат правила свойства V3\n\n'+rule.ruleText+'\n\nRuleID: `'+rule.ruleId+'`\n\nИсточник: '+options.source+'\n\nУсловие: '+condition+'\n\nСвойство: `'+property+'`. Селектор:\n\n```json\n'+JSON.stringify(rule.target,null,2)+'\n```\n\nПравильный пример: `'+good+'` — нет нарушения. Ошибочный: `'+bad+'` — нарушение выбранного RuleID. Примеры синтетические; неприменимость к чужому компоненту проверена отдельно.\n\n'+report.limitations.join('\n\n')+'\n\nИзменения:\n\n```json\n'+JSON.stringify(delta,null,2)+'\n```\n\nРабочий исходник не изменён. Это не Ready и не публикация.\n',{flag:'wx',mode:0o600});
 }catch(error){fs.rmSync(output,{recursive:true,force:true});throw error;}
 return{...report,output};
}
function verifyRule(runtime,normalized,contract,rule){
 const cases=[],counts=Array.from(new Set([rule.min,rule.max,rule.max+1,...(rule.min>0?[rule.min-1]:[])]));
 for(const count of counts){
  // countBetween consumes the count fact only; do not allocate millions of fake nodes.
  const decisions=runtime.evaluator.evaluateCompositionConstraint(rule,{contract,members:{length:count}});
  const expected=count<rule.min||count>rule.max;
  if(decisions.some(d=>d.verdict==='violation')!==expected)throw Error('Исполнитель не подтвердил граничный пример.');
  cases.push({kind:'count-fact',count,result:expected?'VIOLATION':'NO_VIOLATION',ruleId:contract.id+'.'+rule.id,decisions});
 }
 const hostKey=contract.match.hostComponentKeys?.[0]||'author-host',hostName=contract.match.hostComponentNames?.[0]||'Author Host';
 const memberKey=contract.select.nestedComponentKeys?.[0]||'author-member',memberName=contract.select.nestedComponentNames?.[0]||'Author Member';
 const selected=contract.select.visibility==='all'?2:1;
 const probe=clone(normalized),probeContract=clone(contract);probeContract.constraints=[Object.assign({},rule,{min:selected+1,max:selected+1})];
 probe.packages[0].compositionEntry.contract.contracts=[probeContract];
 const actual=[{id:0,parentId:null,nodeId:'host',name:hostName,path:hostName,type:'INSTANCE',visible:true,componentInstance:{componentKey:hostKey,variantProperties:{}}},
  ...[1,2].map(id=>({id,parentId:0,nodeId:'member-'+id,name:memberName,path:hostName+'/'+id,type:'INSTANCE',visible:id===1,componentInstance:{componentKey:memberKey,variantProperties:{}}})),
  {id:3,parentId:1,nodeId:'grandchild',name:memberName,path:hostName+'/1/inner',type:'INSTANCE',visible:true,componentInstance:{componentKey:memberKey,variantProperties:{}}}];
 try{
  runtime.registry.setNormalizedAuditPolicies(probe);
  const options={actualStructure:actual,hostReference:clone(actual),hostComponentKey:hostKey,hostComponentName:hostName,resolveComponent:key=>({key,name:key===memberKey?memberName:hostName})};
  const result=runtime.engine.applyCompositionContracts([],options);
  const decision=result.diffs.find(d=>d.assessment?.constraintId===rule.id);
  if(!result.matchedContractIds.includes(contract.id)||decision?.assessment?.evidence?.actualCount!==selected)throw Error('Селектор не подтвердил выбор непосредственных вложенных компонентов.');
  cases.push({kind:'selector-control',result:'MATCH_CONFIRMED',actualCount:selected,hidden:contract.select.visibility!=='all',grandchildExcluded:true,ruleId:contract.id+'.'+rule.id});
  const foreign=runtime.engine.applyCompositionContracts([],Object.assign({},options,{hostComponentKey:'outside-'+crypto.randomUUID(),hostComponentName:'outside-'+crypto.randomUUID()}));
  if(foreign.matchedContractIds.length)throw Error('Правило неожиданно применяется к чужому владельцу.');
  cases.push({kind:'foreign-host',result:'NOT_APPLICABLE',ruleId:contract.id+'.'+rule.id});
 }finally{runtime.registry.clearNormalizedAuditPolicies();}
 return cases;
}
async function createCandidate(options){
 if(options.kind!==undefined&&!kinds.some(row=>row.id===options.kind))throw Error('Условие не поддержано сценарием авторинга. Доступно: '+kinds.map(k=>k.id).join(', ')+'.');
 if(options.kind==='propertyBaseline'||options.kind==='propertyRange')return createPropertyCandidate(options);
 const dsRoot=fs.realpathSync(options.dsRoot||path.resolve(__dirname,'../..')),runtime=await loadRuntime(options.apolloRoot||process.env.APOLLO_ROOT),pins=new Map();
 const {index,entry,paths,payloads,jsonRoot}=readComponentPackage(dsRoot,options.component,runtime,pins);
 if(!paths.composition)throw Error('У компонента не объявлен composition-contract.json. Сначала нужен его source/index authoring.');
 for(const [file,digest]of options.interviewPins||[])if(pins.get(file)!==digest)throw Error('Исходные данные изменились после анкеты. Повтори выбор компонента и правила.');
 const composition=Array.from(payloads.values()).find(item=>item.role==='composition'),source=composition.body,candidate=clone(source);
 if(candidate.schemaVersion!==2||candidate.documentType!=='composition-contract'||candidate.metadata?.ownershipSchema!=='apollo.artifact-ownership.v2')throw Error('Первый срез поддерживает существующий ownership-v2 composition-contract.');
 if(!options.contract||!options.id||!options.message?.trim()||!options.source?.trim())throw Error('Нужны contract ID, ID правила, полная норма и ссылка на её источник.');
 const min=Number(options.min),max=Number(options.max);
 if(options.min===undefined||options.max===undefined||String(options.min).trim()===''||String(options.max).trim()===''||!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min<0||max<min||max===Number.MAX_SAFE_INTEGER)throw Error('Минимум и максимум должны быть целыми неотрицательными числами, min ≤ max; нужен представимый отрицательный пример.');
 candidate.manual=candidate.manual||{};candidate.manual.contracts=candidate.manual.contracts||[];
 let contract=candidate.manual.contracts.find(item=>item.id===options.contract);
 if(contract&&['hostKey','hostName','memberKey','memberName','visibility'].some(key=>options[key]!==undefined))throw Error('У существующей группы сохраняется её селектор; параметры владельца/вложений задаются только для новой группы.');
 if(!contract){
  if(!(options.hostKey||options.hostName)||!(options.memberKey||options.memberName))throw Error('Для нового контракта укажи владельца и вложенный компонент по Figma key или точному имени.');
  contract={id:options.contract,match:options.hostKey?{hostComponentKeys:[options.hostKey]}:{hostComponentNames:[options.hostName]},select:Object.assign(options.memberKey?{nestedComponentKeys:[options.memberKey]}:{nestedComponentNames:[options.memberName]},{visibility:options.visibility||'visible',order:'document'}),constraints:[]};candidate.manual.contracts.push(contract);
 }
 if(candidate.manual.contracts.filter(item=>item.id===options.contract).length!==1)throw Error('Неоднозначный contract ID.');
 let rule=contract.constraints.find(item=>item.id===options.id);
 if(contract.constraints.filter(item=>item.id===options.id).length>1)throw Error('Неоднозначный ID правила; исходник требует исправления до авторинга.');
 if(rule&&rule.op!=='countBetween')throw Error('Выбранное правило другого типа; первый срез не преобразует его в countBetween.');
 if(rule&&Object.keys(rule).some(key=>!['id','op','min','max','message','ruleId','presentation'].includes(key)))throw Error('У правила есть дополнительные параметры, ещё не поддержанные этим сценарием авторинга.');
 const normChanged=!rule||rule.min!==min||rule.max!==max||rule.message!==options.message.trim();
 if(!rule){rule={id:options.id,op:'countBetween'};contract.constraints.push(rule);}
 Object.assign(rule,{min,max,message:options.message.trim()});
 if(rule.presentation){if(normChanged){rule.presentation.expectation=rule.message;rule.presentation.action=options.action||rule.message;}else if(options.action)rule.presentation.action=options.action;}
 const normalized=await runtime.prep.preparePolicies({schemaVersion:2,documentType:'component-contract-index',coverage:index.coverage,baseUrl:index.baseUrl,packages:[entry]},async url=>{
  const data=payloads.get(url);if(!data)throw Error('Необъявленный локальный источник: '+url);return clone(data===composition?candidate:data.body);
 },index.baseUrl||'');
 const effective=normalized.packages[0].compositionEntry?.contract.contracts?.find(item=>item.id===options.contract),effectiveRule=effective?.constraints.find(item=>item.id===options.id);
 if(!effectiveRule||changes(rule,effectiveRule).length)throw Error('Ручное правило не попало в исполняемую проекцию; возможно, его перекрывает runtime.');
 const examples=verifyRule(runtime,normalized,effective,effectiveRule),delta=changes(source,candidate);
 runtime.assertCurrent();for(const [file,digest]of pins)if(sha(fs.readFileSync(file))!==digest)throw Error('Исходные данные изменились; кандидат не сохранён.');
 const output=path.resolve(options.output||'');
 if(!options.output||output===jsonRoot||output.startsWith(jsonRoot+path.sep)||fs.realpathSync(path.dirname(output))!==path.dirname(output))throw Error('Укажи новый output вне JSONS, с существующей обычной родительской папкой.');
 const report={status:'DRAFT_CANDIDATE_VERIFIED',kind:'countBetween',component:entry.componentKey,ruleId:effective.id+'.'+effectiveRule.id,sourceReference:options.source,sourceFile:path.posix.join('JSONS',composition.file),sourceSha256:pins.get(path.join(jsonRoot,composition.file)),candidateSha256:sha(JSON.stringify(candidate,null,2)+'\n'),runtimeInputs:runtime.pins.map(pin=>({file:path.relative(runtime.sourceRoot,pin.file),sha256:pin.sha256})),delta,normalizedRule:effectiveRule,examples,checks:{normalizer:'preparePolicies',evaluator:'V3 evaluateCompositionConstraint + applyCompositionContracts selector control',sourceUnchanged:true},limitations:['Проверено только выбранное countBetween, не все нормы компонента.','Граничные примеры используют факт количества; отдельный selector-control проверяет настоящий comparator на маленьком синтетическом дереве.','Норма и её ссылка заданы автором; семантическая сверка источника и реальные кейсы Figma остаются отдельными.','Кандидат не применён к source; индексы, Ready, таблица Правила и выпуск не изменены.']};
 fs.mkdirSync(output,{mode:0o700});
 try{
  for(const [file,value]of [['composition-contract.candidate.json',candidate],['report.json',report]])fs.writeFileSync(path.join(output,file),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
  const positive=examples.find(row=>row.kind==='count-fact'&&row.result==='NO_VIOLATION'),negative=examples.find(row=>row.kind==='count-fact'&&row.result==='VIOLATION');
  fs.writeFileSync(path.join(output,'preview.md'),'# Черновик правила V3\n\n'+rule.message+'\n\nRuleID: `'+report.ruleId+'`\n\nИсточник: '+options.source+'\n\nГраницы: '+min+'…'+max+'. Проверено '+examples.length+' контрольных примеров.\n\n'+
   '- Положительный пример: '+positive.count+' вложенных компонентов — нет нарушения выбранного правила.\n- Отрицательный пример: '+negative.count+' вложенных компонентов — нарушение `'+report.ruleId+'`.\n\n'+
   'Селектор владельца и вложений:\n\n```json\n'+JSON.stringify({match:effective.match,select:effective.select},null,2)+'\n```\n\nИзменения исходника:\n\n```json\n'+JSON.stringify(delta,null,2)+'\n```\n\n'+
   'Исходник не изменён. Полные результаты — в report.json. Это не Ready и не публикация.\n',{flag:'wx',mode:0o600});
 }catch(error){fs.rmSync(output,{recursive:true,force:true});throw error;}
 return Object.assign({},report,{output});
}
async function interview(input,{ask,write}){
 const options={...input},pins=new Map(),dsRoot=fs.realpathSync(options.dsRoot||path.resolve(__dirname,'../..'));
 const runtime=await loadRuntime(options.apolloRoot||process.env.APOLLO_ROOT);
 const index=readFile(dsRoot,'JSONS/apollo/indexes/componentContractIndex.json',pins);
 const entries=index.packages.filter(entry=>{const p=runtime.prep.policyArtifactPaths(entry);return p.composition||p.rules;});
 async function question(label,fallback){
  for(;;){const value=(await ask(label+(fallback===undefined?'':' ['+fallback+']')+': ')).trim();if(value)return value;if(fallback!==undefined)return fallback;write('Значение обязательно.');}
 }
 async function choose(label,rows){
  rows.forEach((row,i)=>write((i+1)+'. '+row.label+' — '+row.id));
  for(;;){const value=await question(label),row=rows.find(row=>row.id===value)||(/^\d+$/.test(value)?rows[Number(value)-1]:null);if(row)return row.id;write('Выбери номер из списка или точный ID.');}
 }
 function finish(){runtime.assertCurrent();for(const [file,digest]of pins)if(sha(fs.readFileSync(file))!==digest)throw Error('Исходные данные изменились во время анкеты. Повтори выбор.');return{...options,interviewPins:Array.from(pins)};}
 if(!options.component){
  for(;;){
   const query=(await question('Компонент — имя или componentKey')).toLocaleLowerCase();
   const exact=entries.filter(entry=>entry.componentKey.toLocaleLowerCase()===query),found=exact.length?exact:entries.filter(entry=>(entry.packageName+' '+entry.componentKey).toLocaleLowerCase().includes(query));
   if(!found.length){write('Компонент с файлами правил не найден. Уточни имя.');continue;}
   options.component=found.length===1?found[0].componentKey:await choose('Компонент (номер или componentKey)',found.map(entry=>({id:entry.componentKey,label:entry.packageName})));break;
  }
 }
 const matches=entries.filter(entry=>entry.componentKey===options.component);if(matches.length!==1)throw Error('Нужен один точный componentKey из индекса.');
 const entry=matches[0];write('Компонент: '+entry.packageName+' — '+entry.componentKey);
 if(options.kind===undefined)options.kind=await choose('Условие (номер или ID)',kinds);
 if(!kinds.some(row=>row.id===options.kind))throw Error('Условие не поддержано сценарием авторинга. Доступно: '+kinds.map(k=>k.id).join(', ')+'.');
 if(options.kind!=='countBetween'){
  const {payloads}=readComponentPackage(dsRoot,options.component,runtime,pins);
  const normalized=await runtime.prep.preparePolicies({...index,packages:[entry]},async url=>clone(payloads.get(url).body),index.baseUrl||'');
  const existing=normalized.packages[0].rulesEntry?.rulesFile.rules||[];
  if(!options.id){const supported=existing.filter(r=>propertyKind(r)===options.kind&&r.severity==='error'&&runtime.propertyRules.isActiveComponentDesignRule(r)&&r.checkType==='deterministic');
   const selected=await choose('Правило свойства (номер или полный RuleID)',[...supported.map(r=>({id:r.ruleId,label:r.ruleText})),{id:'+new',label:'Добавить правило свойства'}]);
   options.id=selected==='+new'?await question('Новый полный стабильный RuleID','component:'+entry.componentKey+'.property'):selected;
   if(selected==='+new'&&existing.some(r=>r.ruleId===options.id))throw Error('Этот RuleID уже существует. Выбери его для изменения.');
  }
  const prior=existing.find(r=>r.ruleId===options.id);
  if(prior){if(propertyKind(prior)!==options.kind)throw Error('Выбранное правило другого/неподдержанного типа.');write('Сохраняется селектор: '+JSON.stringify(prior.target));options.property=options.property||prior.appliesTo;}
  else{
   if(options.property===undefined)options.property=await choose('Свойство (номер или имя)',(options.kind==='propertyRange'?rangeProperties:baselineProperties).map(id=>({id,label:id})));
   if(options.layer===undefined)options.layer=await question('Слой: root или точное имя/путь',options.property==='styles.text'?'Label':'root');
  }
  if(options.kind==='propertyRange'){
   for(const [key,label,fallback]of [['min','Минимальное значение',prior?.numericConstraint?.minimum],['max','Максимальное значение',prior?.numericConstraint?.maximum],['valid','Правильный пример',options.min]])if(options[key]===undefined)options[key]=await question(label,fallback);
  }else if(options.baseline===undefined)options.baseline=await question('Эталон для синтетического примера (значение или ID стиля/токена)');
  if(options.invalid===undefined)options.invalid=await question('Ошибочный пример',options.kind==='propertyRange'?Number(options.max)+1:undefined);
  write('RuleID V3: '+options.id);
  for(const [key,label,fallback]of [['message','Полная формулировка нормы',prior?.ruleText],['source','Ссылка на источник нормы'],['output','Новая папка результата']])if(options[key]===undefined)options[key]=await question(label,fallback);
  return finish();
 }
 const file=runtime.prep.policyArtifactPaths(entry).composition;if(/^https?:\/\//i.test(file))throw Error('Анкета читает только объявленные локальные sidecars.');
 const body=readFile(path.join(dsRoot,'JSONS'),file,pins),contracts=body.manual?.contracts||[];
 if(!options.contract){
  const selected=await choose('Группа правил (номер или ID)',[...contracts.map(row=>({id:row.id,label:'Существующая группа'})),{id:'+new',label:'Добавить группу'}]);
  options.contract=selected==='+new'?await question('Новый стабильный ID группы',entry.componentKey+'.composition'):selected;
  if(selected==='+new'&&contracts.some(row=>row.id===options.contract))throw Error('Этот ID группы уже существует. Выбери существующую группу.');
 }
 const contract=contracts.find(row=>row.id===options.contract);
 if(contract){write('Сохраняется селектор: '+JSON.stringify({match:contract.match,select:contract.select}));}
 else{
  if(!options.hostKey&&!options.hostName)options.hostName=await question('Точное имя компонента-владельца в Figma');
  if(!options.memberKey&&!options.memberName)options.memberName=await question('Точное имя вложенного компонента в Figma');
  if(options.visibility===undefined)options.visibility=await choose('Видимость (номер или ID)',[{id:'visible',label:'Только видимые'},{id:'all',label:'Все, включая скрытые'}]);
 }
 if(!options.id){
  const supported=(contract?.constraints||[]).filter(row=>row.op===options.kind);
  const unsupported=(contract?.constraints||[]).filter(row=>row.op!==options.kind);
  if(unsupported.length)write('Другие условия сохраняются без изменения: '+unsupported.map(row=>row.id+' ('+row.op+')').join(', '));
  const selected=await choose('Правило (номер или ID)',[...supported.map(row=>({id:row.id,label:row.message})),{id:'+new',label:'Добавить правило'}]);
  options.id=selected==='+new'?await question('Новый стабильный ID правила (например button-count)','member-count'):selected;
  if(selected==='+new'&&contract?.constraints.some(row=>row.id===options.id))throw Error('Этот ID правила уже существует. Выбери его для изменения.');
 }
 const rule=contract?.constraints.find(row=>row.id===options.id);
 if(rule&&rule.op!==options.kind)throw Error('Выбранное правило другого типа; сценарий не преобразует его в countBetween.');
 write('RuleID V3: '+options.contract+'.'+options.id);
 for(const [key,label,fallback]of [['min','Минимальное количество',rule?.min],['max','Максимальное количество',rule?.max],['message','Полная формулировка нормы',rule?.message],['source','Ссылка на источник нормы'],['output','Новая папка результата']])if(options[key]===undefined)options[key]=await question(label,fallback);
 return finish();
}
async function main(argv){
 const command=argv.shift(),keys={'--apollo-root':'apolloRoot','--component':'component','--kind':'kind','--contract':'contract','--id':'id','--min':'min','--max':'max','--message':'message','--source':'source','--output':'output','--host-name':'hostName','--host-key':'hostKey','--member-name':'memberName','--member-key':'memberKey','--visibility':'visibility','--action':'action','--property':'property','--layer':'layer','--baseline':'baseline','--valid-value':'valid','--invalid-value':'invalid'};let options={dsRoot:path.resolve(__dirname,'../..')};
 for(let i=0;i<argv.length;i+=2){const key=keys[argv[i]];if(!key||argv[i+1]===undefined||Object.hasOwn(options,key))throw Error('Неизвестный или повторный параметр: '+argv[i]);options[key]=argv[i+1];}
 if(command==='list'){const index=JSON.parse(fs.readFileSync(path.join(options.dsRoot,'JSONS/apollo/indexes/componentContractIndex.json')));for(const row of index.packages)if(row.artifacts.composition||row.artifacts.rules||row.rulesPath||row.rulesFile)console.log(row.componentKey+' — '+row.packageName);return;}
 if(command==='kinds'){for(const row of kinds)console.log(row.id+' — '+row.label);return;}
 if(command==='inspect'){console.log(JSON.stringify(await inspectComponent(options),null,2));return;}
 if(command==='interview'){
  if(!options.apolloRoot&&!process.env.APOLLO_ROOT)throw Error('Сначала укажи --apollo-root или APOLLO_ROOT.');
  const rl=require('node:readline/promises').createInterface({input:process.stdin,output:process.stdout});
  try{options=await interview(options,{ask:label=>rl.question(label),write:line=>console.log(line)});}finally{rl.close();}
 }else if(command!=='create')throw Error('Команды: list, kinds, inspect, interview, create. Инструкция: apollo/V3_RULE_AUTHORING.md');
 const report=await createCandidate(options);console.log(JSON.stringify({status:report.status,ruleId:report.ruleId,examples:report.examples.length,output:report.output},null,2));
}
if(require.main===module)main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={createCandidate,loadRuntime,changes,inspectComponent,interview,main};
