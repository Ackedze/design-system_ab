const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.resolve(A,'../..'),B=W+'/.local/apollo-main';
const core=require(B+'/packages/component-contract-core/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length};},slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const names=['Text','List','SegmentedControl','Slider'],ids={Text:'text',List:'list',SegmentedControl:'segmented-control',Slider:'slider'};
const sourceNames=['contract.generated.json','contract.overrides.json','rules.json','composition-contract.json','agent-context.json','examples.json','audit-mapping.json'];
const visual=['layout.mode','layout.padding.top','layout.padding.right','layout.padding.bottom','layout.padding.left','layout.itemSpacing','layout.primaryAxisAlignItems','layout.counterAxisAlignItems','layout.sizingHorizontal','layout.sizingVertical','appearance.fill','appearance.stroke','appearance.opacity','appearance.radius','appearance.fillStyleId','appearance.strokeStyleId','appearance.strokeWeight','appearance.strokeAlign','appearance.dashPattern','appearance.effects','appearance.effectStyleId','appearance.blendMode'];
const typography=['text.fontName','text.fontSize','text.lineHeight','text.letterSpacing','text.case','text.decoration','text.textAlignHorizontal','text.textAlignVertical','appearance.typography.styleId'];
const native=read(R+'/native-root-api.json').roots,bindings=read(R+'/source-target-bindings.json'),sg=read(R+'/segmented-logical-structure.json');
for(const p of read(R+'/input-inventory.json').inputPins)assert.equal(pin(p.path).sha256,p.sha256,'Athena drift '+p.path);
const summary=[];
(async()=>{for(const name of names){
 const dir=A+'/JSONS/web/components/web-core/core/'+name,out=R+'/'+name,id='web-core.'+ids[name];
 const files=sourceNames.map(n=>({name:n,text:fs.readFileSync(dir+'/'+n,'utf8')}));
 if(name==='Text')files.push({name:'Web _ Typography.json',text:fs.readFileSync(A+'/JSONS/styles/Web _ Typography.json','utf8')});
 const imp=core.importWorkspace(files),g=read(dir+'/contract.generated.json'),m=imp.manual,evidence=imp.variantEvidence;
 assert.equal(g.source.generatedAt,'2026-10-27T08:51:34.896Z');
 const roots=g.contracts.filter(c=>c.role==='main'&&c.status==='active'),keys=new Set(roots.map(c=>c.componentKey)),src=bindings.filter(b=>b.family===name);
 assert.equal(roots.length,{Text:1,List:1,SegmentedControl:6,Slider:2}[name]);
 assert.deepEqual([...keys].sort(),src.map(b=>b.key).sort());
 m.component={...m.component,componentId:id,familyId:id,contractId:id,family:name,platform:'universal',platforms:['desktop','mobile-web'],componentKey:roots[0].componentKey};
 m.representations=roots.map(c=>({id:id+'.figma.'+slug(c.name),kind:'figma',platform:'universal',status:'draft',surface:name==='Text'?'text':name==='List'?'content':'control',locator:{componentKey:c.componentKey,name:c.name,fileKey:'lGWq8DtnUcSkRasagBuwq6'}}));
 const repFor=k=>m.representations.find(r=>r.locator.componentKey===k);
 m.targets=[{id:'target.root',semanticRole:'root',label:name,lineage:[id],nameHint:name,pathHint:name,resolution:'resolved',representationHints:m.representations.map(r=>({representationId:r.id,pathHint:r.locator.name,nameHint:r.locator.name}))}];
 const target=(role,label)=>{let t=m.targets.find(t=>t.semanticRole===role);if(!t){t={id:'target.'+role,semanticRole:role,label,lineage:[id,...label.split(' / ')],nameHint:label.split(' / ').at(-1),pathHint:name+' / '+label,resolution:'resolved',representationHints:[],variantHints:[]};m.targets.push(t);}return t;};
 const bind=(t,rep,v,p)=>{t.variantHints.push({representationId:rep.id,componentKey:v,pathHint:rep.locator.name+' / '+p});if(!t.representationHints.some(h=>h.representationId===rep.id))t.representationHints.push({representationId:rep.id,pathHint:rep.locator.name+' / '+p});};
 const capacities=new Map(),types=new Map();
 if(name==='SegmentedControl'){
  assert(sg.slotTypesProven);assert.equal(sg.variants.length,96);
  for(const root of src)for(const v of root.variants){
   const shape=sg.shapes[sg.variants.find(x=>x[0]===v.key)[1]],rep=repFor(root.key),prefixes=new Map();let sn=0,dn=0;
   for(const [p,type]of v.targets)prefixes.set(type==='INSTANCE'?'segment-'+(++sn):'divider-'+(++dn),p);
   assert.equal(sn,Number(v.properties.Capacity));
   for(const [logical,type]of shape.filter(n=>n[0])){
    const parts=logical.split(' / '),p=[prefixes.get(parts[0]),...parts.slice(1)].join(' / '),role=slug(logical),t=target(role,logical);bind(t,rep,v.key,p);
    if(!capacities.has(role))capacities.set(role,new Set());capacities.get(role).add(v.properties.Capacity);types.set(role,type);
   }
  }
 }else if(name==='Text'){
  const rep=m.representations[0],v=src[0].variants[0].key;bind(target('content','Content'),rep,v,'Content');bind(target('text','Content / Text'),rep,v,'Content / Text');
 }else{
  for(const root of src)for(const v of root.variants)for(const [p,type]of v.targets){
   const t=target(slug((type==='TEXT'?'text-':'part-')+p),p);bind(t,repFor(root.key),v.key,p);types.set(t.semanticRole,type);
  }
 }
 // Non-occurrence optional paths retain reviewed representation locators. Occurrence
 // targets always have one source address for each variant in which they exist.
 const domain=new Map();for(const root of roots){const rep=repFor(root.componentKey),api=native.find(r=>r.key===root.componentKey);assert(api);
  for(const [property,d]of Object.entries(api.definitions)){if(d.type==='SLOT')continue;const e=domain.get(property)||{id:slug(property),kind:d.type==='BOOLEAN'?'visibility':'state',valueType:d.type==='BOOLEAN'?'boolean':d.type==='TEXT'?'string':'enum',domain:d.type==='BOOLEAN'?[false,true]:d.type==='VARIANT'?d.variantOptions:[],bindings:[]};e.bindings.push({representationId:rep.id,path:'component.properties.'+property,transform:'identity'});domain.set(property,e);}
 }
 m.semanticApi=[...domain.values()];m.controlPorts=[];m.componentDependencies=[];
 const app={variants:'all',modes:'all',platforms:['desktop','mobile-web','universal'],scopeStatus:'confirmed',conditionSubject:'component-root'};
 const rule=(suffix,targetId,capability,permission,constraints,text,refs)=>({id:'component:'+id+'.'+suffix,targetId,targetScope:'self',capability,permission,controlPaths:[],constraints,applicability:structuredClone(app),severity:permission==='allowed'?'info':'error',rationale:text,message:text,status:'draft',owner:'design-system-authors',ownership:{kind:'component',ownerId:id},execution:{route:permission==='allowed'?'policy-only':'predicate'},sourceRefs:refs});
 const ref=s=>'rules.json#component:'+id+'.'+s,baselineRef=[ref('layer-properties-use-effective-baseline')],hub='core/web/components/'+ids[name];
 const props=rule('component-properties-are-first-class','target.root','component-properties','allowed',[],name+': используйте опубликованные свойства выбранной активной версии; текстовое содержимое разрешено менять.',[ref('component-properties-are-first-class')]);props.controlPaths=[...domain.keys()].map(property=>({kind:'host-property',property}));
 m.rules=[props];
 const baseline=(suffix,t,facts=visual)=>{const r=rule(suffix,t.id,'component.baseline','forbidden',facts.map(fact=>({type:'propertyForbidden',fact})),name+': собственный слой «'+t.label+'» сохраняет оформление и Auto Layout независимого эталона выбранного варианта и вложенного состояния.',baselineRef);r.remediationIntent='restore-effective-baseline';r.propertyApplicability={'appearance.strokeWeight':'stroke-present-either@1','layout.itemSpacing':'flow-gap-either@1',...Object.fromEntries(['top','right','bottom','left'].map(k=>['layout.padding.'+k,'auto-layout-padding-either@1'])),'layout.primaryAxisAlignItems':'flow-alignment-either@1','layout.counterAxisAlignItems':'flow-alignment-either@1'};return r;};
 if(name==='SegmentedControl'){
  m.rules.push(baseline('layer-properties-use-effective-baseline',m.targets[0]));
  // Nested Segment norms remain an explicit child-contract gap; see FIRST-ATTEMPT.json.
  for(const cap of ['2','3','4','5']){const collection={version:1,ownerTargetRole:'root',memberTargetRoles:Array.from({length:Number(cap)},(_,i)=>'segment-'+(i+1)),representationIds:m.representations.map(r=>r.id),visibleOnly:true,assertion:{kind:'count',min:2,max:5}};
   const count=rule('segment-count.capacity-'+cap,'target.root','composition.members','constrained',[{type:'memberCollection',collection}], 'При Capacity='+cap+' SegmentedControl содержит от 2 до 5 видимых сегментов.',[hub+'/guidelines.md#Основные правила']);
   const selected=rule('single-selected.capacity-'+cap,'target.root','component.configuration','constrained',[{type:'memberCollection',collection:{...structuredClone(collection),filter:{property:'Selected',propertyType:'VARIANT',values:['True']},assertion:{kind:'count',min:1,max:1}}}], 'При Capacity='+cap+' ровно один видимый сегмент должен иметь Selected=True.',[hub+'/guidelines.md#Основные правила']);
   count.applicability.variants={Capacity:[cap]};selected.applicability.variants={Capacity:[cap]};m.rules.push(count,selected);
  }
  m.targets=m.targets.filter(t=>t.semanticRole==='root'||/^segment-[1-5]$/.test(t.semanticRole));
 }else if(name==='Text'){
  m.rules.push(baseline('layer-properties-use-effective-baseline',m.targets[0]));
  for(const [role,excluded]of [['content',['appearance.fill','appearance.fillStyleId']],['text',['appearance.fill','appearance.fillStyleId','layout.sizingHorizontal','layout.sizingVertical']]]){
   const t=m.targets.find(t=>t.semanticRole===role);m.rules.push(baseline('owned-'+role,t,visual.filter(f=>!excluded.includes(f))));
   const q=rule(role+'-color-token',t.id,'appearance.fill','constrained',[{type:'tokenBinding',fact:'paintBindingsV1.fill',bindingRequired:true}],role==='content'?'Фон под текстом задаётся токеном цвета; несвязанный RGB запрещён.':'Цвет текста задаётся токеном цвета; несвязанный RGB запрещён.',[hub+'/guidelines.md#Цвет текста (`color`)',hub+'/guidelines.md#Фон под текстом (`textBackgroundColor`)']);m.rules.push(q);
  }
  const style=rule('text-library-style','target.text','text.style','constrained',[{type:'styleBinding',styleCatalog:'Web _ Typography.json'}], 'Типографика Text выбирается библиотечным Text Style Web _ Typography. Разрешена смена библиотечного стиля; detach и локальный стиль запрещены.',[hub+'/guidelines.md#Основные правила',hub+'/adapter.figma.md#Оверрайды на инстансе']);m.rules.push(style);
 }else{
  const b=baseline('layer-properties-use-effective-baseline',m.targets[0]);b.targetScope='self-and-descendants';m.rules.push(b);
  const t=rule('visible-text-typography','target.root','text.typography','constrained',typography.map(fact=>({type:'propertyForbidden',fact})),name+': типографика собственных текстовых слоёв соответствует независимому эталону выбранного варианта; содержимое текста разрешено менять.',baselineRef);t.targetScope='self-and-descendants';t.remediationIntent='restore-effective-baseline';m.rules.push(t);
 }
 m.semantics={purpose:{Text:'Текстовый компонент с фоном под строкой; обычный текст оформляется библиотечным Text Style.',List:'Элемент списка с маркером и необязательной подписью.',SegmentedControl:'Переключение одного из 2–5 взаимоисключающих режимов.',Slider:'Визуальный контрол выбора значения либо диапазона.'}[name],useWhen:[],doNotUseWhen:[],relatedComponentIds:[],keywords:[ids[name]]};
 m.documentation=[{id:'source-rules',kind:'guideline',path:'rules.json',status:'verified',projection:'source'},...(['Text','SegmentedControl'].includes(name)?[{id:'hub-guidelines',kind:'guideline',path:hub+'/guidelines.md',status:'draft',projection:'reference-only'}]:[])];
 m.examples=[];m.decisions=[];m.generation={profiles:[],instructions:['Draft для проверки Figma на существующем Core. Интерактивность и выбор компонента по контексту находятся вне локального predicate.']};
 const authoredAt=read(R+'/input-inventory.json').date;
 m.metadata={...m.metadata,revision:1,createdAt:authoredAt,updatedAt:authoredAt,publicRepresentationBoundaryVersion:1};m.source={kind:'athena-package',importedFiles:files.map(f=>f.name),sourceHash:core.stableHash(files),importedAt:authoredAt};
 if(name==='Slider')m.targets=m.targets.filter(t=>t.semanticRole==='root');
 const b=core.buildExportBundle(m,evidence,[]);write(out+'/validation.json',b.validation);if(!b.validation.valid){write(out+'/first-validation-failure.json',b.validation);throw Error(JSON.stringify(b.validation));}assert.equal(b.compiled.nonExecutableRules.length,0);
 const c=b.compiled,hashes=c.rules.map(r=>core.stableHash({select:r.select,when:r.when,assert:r.assert,effect:r.effect,scope:r.scope}));assert.equal(new Set(hashes).size,hashes.length,'Duplicate executable assertion '+name);
 const effective=new Map(),rules=read(dir+'/rules.json');for(const branch of ['generated','manual'])for(const r of rules[branch]?.rules||[])effective.set(r.ruleId,r);
 const entries=[...effective.values()].map(r=>({sourceRuleId:r.ruleId,sourceNorm:r.ruleText,source:'rules.json',route:/lifecycle|scheduled/.test(r.ruleId)?'metadata':'authored',manualRuleIds:m.rules.filter(x=>x.sourceRefs.includes('rules.json#'+r.ruleId)).map(x=>x.id)}));
 const normpaths=['Text','SegmentedControl'].includes(name)?[hub+'/guidelines.md',hub+'/adapter.figma.md']:[];
 for(const hp of normpaths){let section='';for(const [i,line]of fs.readFileSync(W+'/ds-ai-hub/'+hp,'utf8').split('\n').entries()){if(/^#{1,4} /.test(line))section=line.replace(/^#+ /,'');if(!/^[-*] /.test(line))continue;const linked=m.rules.filter(r=>r.sourceRefs.includes(hp+'#'+section));entries.push({sourceRuleId:id+'.hub.'+slug(hp)+'.'+(i+1),sourceNorm:line.slice(2),source:hp+':'+(i+1),section,route:linked.length?'authored-or-guidance':/нет component properties|component properties.*нет|Variant properties.*нет|Inverted=True|Размер:/.test(line)?'source-conflict':'context-or-guidance',manualRuleIds:linked.map(r=>r.id)});}}
 for(const row of entries){row.compiledRuleIds=c.rules.filter(r=>row.manualRuleIds.includes(r.source?.anchor)).map(r=>r.ruleId);if(name==='SegmentedControl'&&row.sourceRuleId.endsWith('.layer-properties-use-effective-baseline')){row.route='partially-authored';row.gap='Root baseline executable; nested Segment layout/typography/style await a separate child contract. The failed expanded-target capture is preserved in FIRST-ATTEMPT.json.';}if(name==='SegmentedControl'&&/Подписи — короткие/.test(row.sourceNorm)){row.route='unresolved-child-contract';row.gap='Maximum2words preserved; not claimed executable. SG-09 is a known-gap fixture, not an acceptance test.';}}
 const sourcePins=[...sourceNames.map(n=>pin(dir+'/'+n)),pin(path.dirname(dir)+'/Web _ Core -- '+name+'.json'),pin(R+'/native-root-api.json'),pin(R+'/source-target-bindings.json'),...(name==='SegmentedControl'?[pin(R+'/segmented-logical-structure.json')]:[]),...normpaths.map(p=>pin(W+'/ds-ai-hub/'+p)),...(name==='Text'?[pin(A+'/JSONS/styles/Web _ Typography.json')]:[])];
 const gaps=[{id:'NATIVE_APOLLO_TRIAL',status:'NOT_RUN_USER_ONLY',detail:'Новые привязки и отличающиеся нормы требуют пользовательского прогона Apollo.'},{id:'PROXY_CAPACITY',status:'PENDING_CAPACITY',detail:'36-package candidate превышает текущий предел manifest reader32. Старые32 записи не удаляются; runtime и reader в этой задаче не меняются.'}];
 if(name==='SegmentedControl')gaps.push({id:'HUB_API_DRIFT',status:'RECORDED_FOR_LEDGER',detail:'Документация описывает прежние Size32/40 и Inverted. Свежая Athena и native API имеют6активных root32/40/48+Muted, Shape/Capacity/Resize; прежний root scheduled.'},{id:'SEGMENT_CHILD_CONTRACT',status:'UNRESOLVED_NOT_CLAIMED_EXECUTABLE',detail:'Внутренние layout/типографика/стили и максимум2слова подписи Segment сохраняются в coverage. Expanded first attempt failed real SDK capture:1014human-review. Без изменений Core выпускается ограниченный Draft: root baseline, API,2–5сегментов и единственный Selected. Нужен отдельный контракт вложенного Segment; SG-09 демонстрирует пробел и исключён из приёмки.'});
 if(name==='Text')gaps.push({id:'HUB_API_DRIFT',status:'RECORDED_FOR_LEDGER',detail:'Документация утверждает отсутствие component properties; текущий native API имеет TEXT ✎ Value#86982:0. Принадлежность цветовых токенов библиотеке проверяется сквозным контуром; локальная норма проверяет наличие привязки.'});
 if(['List','Slider'].includes(name))gaps.push({id:'SOURCE_RULE_SCOPE',status:'EXPLICIT_SCOPE',detail:'В Athena только2общие нормы. Дополнительные продуктовые, числовые и интерактивные ограничения не выдумывались. Неподтверждённые API и контекст остаются вне локальной проверки.'});
 let zip=core.buildAuthoringZip(b,[...files,{name:'contract.manual.json',text:JSON.stringify(m)+'\n'},{name:'contract.compiled.json',text:JSON.stringify(c)+'\n'}]);zip=core.createZip((await core.readZip(zip)).map(e=>e.name==='contract.manual.json'?{...e,data:new TextEncoder().encode(JSON.stringify(m)+'\n')}:e));
 const reopened=core.importWorkspace((await core.readZip(zip)).filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),id);assert.deepEqual(reopened.manual,m);assert.deepEqual(reopened.variantEvidence,evidence);assert.equal(core.stableHash(core.buildExportBundle(reopened.manual,reopened.variantEvidence,[]).compiled),core.stableHash(c));
 write(out+'/contract.manual.json',m);write(out+'/variant-evidence.json',evidence);write(out+'/compiled.json',c);write(out+'/coverage-map.json',{componentId:id,revision:1,sourcePins,entries,gaps});const zp=out+'/'+name+'.r1.draft.component-contract.zip';fs.writeFileSync(zp,zip);
 const s={name,componentId:id,revision:1,status:'draft',manualRules:m.rules.length,ruleIR:c.rules.length,targets:m.targets.length,publicRepresentations:roots.length,publicVariants:evidence.variants.filter(v=>keys.has(v.componentSetKey)).length,preservedSourceVariants:evidence.variants.length,nonExecutableRules:c.nonExecutableRules.length,manualSourceHash:c.package.manualSourceHash,compiledHash:core.stableHash(c),archive:pin(zp),roundtrip:'PASS',gaps};write(out+'/summary.json',s);summary.push(s);console.log(JSON.stringify({name,rules:m.rules.length,IR:c.rules.length,targets:m.targets.length,zipBytes:zip.length}));
}write(R+'/SUMMARY.json',summary);})().catch(e=>{console.error(e);process.exitCode=1;});
