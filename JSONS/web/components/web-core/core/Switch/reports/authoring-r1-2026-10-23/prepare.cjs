'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const R=__dirname,C=path.resolve(R,'../..'),A=path.resolve(C,'../../../../../..'),W=path.resolve(A,'../..');
const F=W+'/.local/apollo-general-2026-10-16/mcp-pilot276/indicator-2026-10-23/runtime-input';
const core=require(F+'/packages/component-contract-core/dist/core.cjs'),rt=require(F+'/dist/runtime.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v)+'\n');
const pin=p=>({path:path.relative(A,p),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
async function main(){
 assert(!fs.existsSync(C+'/contract.manual.json'),'NEW_COMPONENT_REQUIRED');
 const native=read(R+'/native-source.json'),old=read(C+'/contract.generated.json'),rules=read(C+'/rules.json');
 assert.equal(native.sets.length,12);assert.equal(native.sets.reduce((n,s)=>n+s.variants.length,0),40);
 assert.deepEqual(old.contracts.map(c=>c.componentKey).sort(),native.sets.map(s=>s.key).sort());
 const names=['contract.generated.json','rules.json','composition-contract.json','contract.overrides.json','agent-context.json','audit-mapping.json'];
 const seed=core.importWorkspace(names.map(name=>({name,text:fs.readFileSync(C+'/'+name,'utf8')}))).manual;
 const anatomy=structuredClone(old);
 for(const g of anatomy.contracts){
  const s=native.sets.find(s=>s.key===g.componentKey),defaultVariant=s.variants.find(v=>v.key===g.figma.defaultVariantKey);assert(defaultVariant);
  assert.deepEqual(g.figma.variants.variantKeys.map(v=>v.key).sort(),s.variants.map(v=>v.key).sort());
  const signature=v=>v.nodes.map(n=>({nodeId:n.id,parentId:n.path===''?null:v.nodes.find(p=>p.path===n.path.split(' / ').slice(0,-1).join(' / ')).id,type:n.type,name:n.name,path:n.path,visible:n.visible,...n.type==='TEXT'?{text:{characters:n.characters}}:{}}));
  const base=signature(defaultVariant);g.figma.structureSignature=base;g.figma.variantStructures={};
  for(const v of s.variants)g.figma.variantStructures[v.key]=v.key===defaultVariant.key?[]:[...base.map(n=>({op:'remove',id:n.nodeId})),...signature(v).map(n=>({op:'add',id:n.nodeId,value:n}))];
 }
 const m=seed,id='web-core.switch',slug=s=>s.toLowerCase().replaceAll('_','-'),rep=s=>id+'.figma.'+slug(s.name);
 Object.assign(m.component,{componentId:id,familyId:id,contractId:id,family:'Switch',platforms:['desktop','mobile-web']});
 m.metadata.publicRepresentationBoundaryVersion=1;
 m.representations=native.sets.map(s=>({id:rep(s),kind:'figma',platform:'universal',surface:s.name.startsWith('SwitchLabel')?'label':'control',status:'draft',locator:{fileKey:'lGWq8DtnUcSkRasagBuwq6',nodeId:s.id,componentKey:s.key,name:s.name}}));
 m.targets=[{id:'target.root',semanticRole:'root',label:'Switch',lineage:[id],nameHint:'Switch',pathHint:'Switch',resolution:'resolved',representationHints:native.sets.map(s=>({representationId:rep(s),nameHint:s.name,pathHint:s.name}))},...['Label','HintMessage'].map(name=>({id:'target.'+(name==='Label'?'label':'hint'),semanticRole:name==='Label'?'label':'hintmessage',label:name,lineage:[id,'Content',name],nameHint:name,pathHint:'Switch / Content / '+name,resolution:'resolved'})),{id:'target.switch',semanticRole:'switch-control',label:'Switch control',lineage:[id,'Switch'],nameHint:'Switch',pathHint:'Switch / Switch',resolution:'resolved',representationHints:native.sets.filter(s=>s.name.startsWith('SwitchLabel')).map(s=>({representationId:rep(s),pathHint:'Switch / '+s.variants[0].nodes.find(n=>n.type==='INSTANCE').path}))}];
 m.semanticApi=[];
 m.semanticApi.push({id:'representation',kind:'variant',valueType:'enum',domain:['control','label'],description:'Read-only тип публичного представления; существующий representation.surface с native identity proof.',bindings:native.sets.map(s=>({representationId:rep(s),path:'representation.surface',transform:'identity'}))});
 for(const prop of ['SelectedState','DisabledState','Hint','CompactLabel']){
  const sets=native.sets.filter(s=>s.properties[prop]);
  m.semanticApi.push({id:prop.toLowerCase(),kind:'state',valueType:'enum',domain:['False','True'],bindings:sets.map(s=>({representationId:rep(s),path:'component.properties.'+prop,transform:'identity'}))});
 }
 for(const [name,api]of [['Label','label'],['Hint Message','hint-text']])m.semanticApi.push({id:api,kind:'content',valueType:'string',bindings:native.sets.filter(s=>s.name.startsWith('SwitchLabel')).map(s=>({representationId:rep(s),path:'component.properties.'+Object.keys(s.properties).find(p=>p.startsWith('✎ '+name+'#')),transform:'identity'}))});
 const app={variants:'all',modes:'all',platforms:['desktop','mobile-web','universal'],scopeStatus:'confirmed'};
 const make=(ruleId,permission,capability,constraints,message)=>({id:ruleId,targetId:'target.root',targetScope:permission==='forbidden'?'self-and-descendants':'self',capability,permission,controlPaths:[],constraints,applicability:{...app},severity:permission==='allowed'?'info':'error',rationale:message,message,status:'draft',owner:'design-system-authors',ownership:{kind:'component',ownerId:id},execution:{route:permission==='allowed'?'policy-only':'predicate'},sourceRefs:[]});
 const policy=make(rules.generated.rules[0].ruleId,'allowed','component-properties',[],'Состояние, Hint, CompactLabel и тексты меняются штатными параметрами; Reverse и Inverted выбираются публичным представлением.');
 policy.controlPaths=[...new Set(native.sets.flatMap(s=>Object.keys(s.properties)))].map(property=>({kind:'host-property',property}));
 policy.controlPaths.push(...['SelectedState','DisabledState'].map(property=>({kind:'nested-property',target:'target.switch',property})));
 policy.sourceRefs=['rules.json#'+rules.generated.rules[0].ruleId,'rules.json#'+rules.manual.rules[0].ruleId];
 const baseline=make(rules.generated.rules[1].ruleId,'forbidden','component.baseline',['layout.mode','layout.padding.top','layout.padding.right','layout.padding.bottom','layout.padding.left','layout.itemSpacing','layout.primaryAxisAlignItems','layout.counterAxisAlignItems','layout.sizingHorizontal','layout.sizingVertical','appearance.fill','appearance.stroke','appearance.opacity','appearance.radius'].map(fact=>({type:'propertyForbidden',fact})),'Оформление и Auto Layout сохраняют эталон выбранного состояния Switch и вложенного Switch в SwitchLabel.');
 baseline.remediationIntent='restore-effective-baseline';baseline.sourceRefs=['rules.json#'+rules.generated.rules[1].ruleId,...rules.manual.rules.slice(1).map(r=>'rules.json#'+r.ruleId)];
 baseline.propertyApplicability={'layout.itemSpacing':'flow-gap-either@1',...Object.fromEntries(['top','right','bottom','left'].map(s=>['layout.padding.'+s,'auto-layout-padding-either@1'])),'layout.primaryAxisAlignItems':'flow-alignment-either@1','layout.counterAxisAlignItems':'flow-alignment-either@1'};
 const typography=make('component:'+id+'.label-typography-baseline','constrained','text.typography',['text.fontName','text.fontSize','text.lineHeight','text.letterSpacing','text.case','text.decoration','text.textAutoResize','text.textAlignHorizontal','text.textAlignVertical'].map(fact=>({type:'propertyForbidden',fact,targetRoles:['label','hintmessage'],visibleOnly:true})),'Типографика Label и HintMessage сохраняет эталон выбранных Hint и CompactLabel; текстовое содержимое можно менять.');
 typography.sourceRefs=['rules.json#'+rules.generated.rules[1].ruleId,'rules.json#'+rules.manual.rules[2].ruleId];typography.remediationIntent='restore-effective-baseline';
 typography.applicability={...app,conditionSubject:'component-root',contextDomains:{'semanticApi.representation':['label']}};
 m.rules=[policy,baseline,typography];m.documentation=[{id:'source-rules',kind:'guideline',path:'rules.json',status:'verified',projection:'source'}];
 m.semantics={purpose:'Бинарное управление Switch и SwitchLabel в публичных размерах 20/24, обычном/Inverted и прямом/Reverse представлении.',useWhen:['Публичный Switch либо SwitchLabel из Web _ Core.'],doNotUseWhen:[],relatedComponentIds:[],keywords:['switch','переключатель']};
 m.decisions=[{id:'existing-engine-only',status:'accepted',summary:'Draft на существующих правилах и runtime.',rationale:'Без доработок движка; сначала native тест владельца.',sourceRefs:['owner:2026-10-23']},{id:'reverse-is-representation',status:'accepted',summary:'Reverse — отдельное публичное представление, а не выдуманный native VARIANT.',rationale:'Native API 12 component sets; Reverse выбирается компонентом.',sourceRefs:['native-source.json','rules.json']},{id:'same-family-owned-controls',status:'accepted',summary:'Switch_20/24 внутри SwitchLabel остаются частью той же контрактной family.',rationale:'Все их exact component keys покрыты 12 публичными representations этого manual; self-dependency не создаётся.',sourceRefs:['composition-contract.json','native-source.json']}];
 m.generation={profiles:[],instructions:['Draft предназначен для проверки Figma. Generation mapping не заявлен.','Вложенный Switch может менять SelectedState/DisabledState штатно; эталон внутренних слоёв должен соответствовать выбранному вложенному состоянию.']};
 const context=names.filter(n=>n!=='contract.generated.json').map(name=>({name,text:fs.readFileSync(C+'/'+name,'utf8')}));context.push({name:'variant-anatomy.source.json',text:JSON.stringify(anatomy)});
 const facts=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(m)},...context],id).variantEvidence;
 assert.equal(facts.variants.length,40);
 for(const s of native.sets)for(const v of s.variants){const f=facts.variants.find(f=>f.componentKey===v.key);assert(f);assert.deepEqual(f.properties,v.properties);assert.deepEqual(facts.structures[f.structureId].map(n=>[n.path,n.type]).sort(),v.nodes.map(n=>[n.path,n.path===''?'ROOT':n.type]).sort());}
 const bundle=core.buildExportBundle(m,facts,[]);write(R+'/validation.json',bundle.validation);assert(bundle.validation.valid,JSON.stringify(bundle.validation));assert.equal(bundle.compiled.rules.length,32);
 const zip=core.buildAuthoringZip(bundle,context),pkg=C+'/packages/Switch.r1.draft.component-contract.zip';fs.mkdirSync(path.dirname(pkg),{recursive:true});fs.writeFileSync(pkg,zip);
 const entries=await core.readZip(zip),reopened=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),id),again=core.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
 for(const [a,b]of [[m,reopened.manual],[facts,reopened.variantEvidence],[bundle.compiled,again.compiled]])assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
 fs.writeFileSync(C+'/contract.manual.json',JSON.stringify(m,null,2)+'\n');write(C+'/variant-evidence.json',facts);write(C+'/variant-anatomy.source.json',anatomy);write(R+'/compiled.json',bundle.compiled);
 write(R+'/technical.json',{valid:true,roundtrip:'PASS',manual:pin(C+'/contract.manual.json'),facts:pin(C+'/variant-evidence.json'),package:pin(pkg),core:pin(F+'/packages/component-contract-core/dist/core.cjs'),representations:12,variants:40,manualRules:3,ruleIR:32,normsChanged:false,engineChanged:false});
 write(R+'/coverage-map.json',{entries:[...rules.generated.rules,...rules.manual.rules].map(r=>({sourceRuleId:r.ruleId,norm:r.ruleText,manualRuleIds:m.rules.filter(x=>x.sourceRefs.includes('rules.json#'+r.ruleId)).map(x=>x.id),compiledRuleIds:bundle.compiled.rules.filter(x=>m.rules.find(y=>y.id===x.source.anchor)?.sourceRefs.includes('rules.json#'+r.ruleId)).map(x=>x.ruleId)})),normsChanged:false,gaps:['Fresh Apollo native run pending; not Ready.','Style identity with unchanged metrics is not separately checked.'],anatomySource:pin(C+'/variant-anatomy.source.json')});
 const internal=native.sets.flatMap(s=>s.variants.flatMap(v=>v.nodes.filter(n=>n.type==='INSTANCE').map(n=>({hostSetKey:s.key,hostVariantKey:v.key,path:n.path,childSetKey:n.mainSetKey,kind:native.sets.some(s=>s.key===n.mainSetKey)?'same-family-owned':'external'}))));assert(internal.every(n=>n.kind==='same-family-owned'));
 write(R+'/dependency-inventory.json',{familyId:id,internalOccurrences:internal,externalDependencies:[],note:'SwitchLabel owns its Switch20/24 in this same manual; no duplicated child contract or self-cycle.'});
 console.log(JSON.stringify({valid:true,roundtrip:'PASS',representations:12,variants:40,ruleIR:32,package:pin(pkg)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
