'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const T=__dirname,W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',V=W+'/projects/Apollo-v3/apps/apollo-v4',core=require(W+'/projects/Apollo-v3/packages/component-contract-core/dist/core.cjs');
const load=f=>JSON.parse(fs.readFileSync(f)),clone=v=>JSON.parse(JSON.stringify(v)),save=(n,v)=>fs.writeFileSync(T+'/'+n,JSON.stringify(v,null,2)+'\n');
const pin=f=>{const b=fs.readFileSync(f);return{path:fs.realpathSync(f),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
if(fs.existsSync(T+'/SEAL.json'))throw Error('CLOSED: create a new version');
const inputs=new Map();function check(p){assert.deepEqual(pin(p.path),p,'INPUT_STALE '+p.path);inputs.set(p.path,p);}
const readset=load(T+'/PRIVATE-READSET.json');for(const p of [...readset.historicalBaseInventories,...readset.pins])check(p);
(async()=>{
 const archive=load(T+'/ZIP-ENTRY-PINS.json').archive;check(archive);
 const entries=await core.readZip(fs.readFileSync(archive.path)),entry=n=>{const e=entries.find(e=>e.name===n);assert(e,n);return JSON.parse(Buffer.from(e.data).toString());};
 const manual=load(T+'/contract.manual.json'),compiled=entry('compiled/component-contract.v2.json'),identity=load(T+'/native-identity.r9.json'),raw=entry('benefit-card/source/Web _ Сorp Promo Components -- BenefitCard.json');
 assert.equal(core.stableHash(manual),'b13e27922b624a1fe51668f5f325d1b33b89cf18aea185559db29e23771ab53e');assert.equal(core.stableHash(compiled),'7dc5803e57396be35fa0da74288a79b6684d03c6b588a2ce19e76e48b5949bfe');assert.equal(manual.metadata.revision,11);
 const workspace=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),'web.benefit-card');
 const mp=pin(T+'/contract.manual.json'),deps=[],manuals=[{pin:mp,manual}],links=manual.rules.map((rule,i)=>({RuleID:rule.id,source:{...mp,pointer:'/rules/'+i},rule}));
 const dependencyRows=[];
 for(const d of manual.componentDependencies){
  const prefix={link:'Link.r5', 'icon-view':'IconView.r8','background-plate':'BackgroundPlate.r6'}[d.id],file=P+'/'+prefix+'.candidate.component-contract.zip',expected={link:'d219318aedb7b634117da62a93aacb6c60071215e1e045315c57862d63501051','icon-view':'eb64b583f64aa99879ffc01576df383e3406d7e190b2e0980509410d50c1749f','background-plate':'cade9e1b3684ba8ab670d11e93667621d6b9c4613af6cbfe8f11c41cbb4da830'}[d.id];
  const ap=pin(file);assert.equal(ap.sha256,expected);inputs.set(ap.path,ap);
  const es=await core.readZip(fs.readFileSync(file)),get=n=>JSON.parse(Buffer.from(es.find(e=>e.name===n).data).toString()),dm=get('contract.manual.json'),dc=get('compiled/component-contract.v2.json');
  assert.equal(dm.metadata.revision,d.revision);assert.equal(core.stableHash(dm),d.manualSourceHash);assert.equal(core.stableHash(dc),d.compiledHash);assert.equal(core.stableHash(entry('dependencies/'+d.componentId+'/component-contract.v2.json')),d.compiledHash);
  save('dependency-'+d.id+'.manual.json',dm);const dp=pin(T+'/dependency-'+d.id+'.manual.json');manuals.push({pin:dp,manual:dm});deps.push({componentId:d.componentId,revision:d.revision,manual:dp,archive:ap,manualSemanticHash:d.manualSourceHash,compiledSemanticHash:d.compiledHash,dependencyPins:[]});
  links.push(...dm.rules.map((rule,i)=>({RuleID:rule.id,source:{...dp,pointer:'/rules/'+i},rule})));
  dependencyRows.push({contractDependencyId:d.id,componentId:d.componentId,revision:d.revision,archive:ap,manual:dp,manualSourceHash:d.manualSourceHash,compiledHash:d.compiledHash,bindings:d.bindings,authority:'Draft child contracts; not fresh parent completion',runtimeAdmission:'NOT_GRANTED'});
 }
 const parentDependency={componentId:manual.component.componentId,revision:11,manual:mp,archive,manualSemanticHash:core.stableHash(manual),compiledSemanticHash:core.stableHash(compiled),dependencyPins:manual.componentDependencies.map(d=>({componentId:d.componentId,revision:d.revision,manualSourceHash:d.manualSourceHash,compiledHash:d.compiledHash}))};
 // Reuse accepted capture requests, verifying their exact published shape, not layer names alone.
 const requests=new Map();
 for(const p of identity.receipts){check(p);const accepted=load(p.path);check(accepted.request);check(accepted.toolResult);assert.equal(accepted.status,'PASS_SOURCE_IDENTITY_AND_CLEANUP');const request=load(accepted.request.path);for(const row of request.variants){assert.equal(core.stableHash(row.expectedShape),row.expectedShapeHash);requests.set(row.componentKey,row);}}
 const baseline={};for(const platform of ['desktop','mobile-web'])baseline[platform]=entry('reports/native-baseline.r4.'+platform+'.json');
 const profiles=[],targets=[],choices=[],correspondence=[],parts=new Map();
 const keyFamilies=new Map(raw.components.map(c=>[c.key,c]));for(const c of raw.components)for(const v of c.variants)parts.set(v.key,{set:c.key,component:c});
 function materialize(component,key){
  const tree=new Map(component.structure.map(n=>[String(n.id),{...n,nodeId:n.id}]));
  for(const p of key===component.defaultVariant?[]:component.variantStructures[key]){const id=String(p.id);if(p.op==='remove'){assert(tree.delete(id));}else if(p.op==='update'){assert(tree.has(id));tree.set(id,{...tree.get(id),...p.value});}else{assert(p.op==='add'&&!tree.has(id)&&p.value);tree.set(id,{...p.value,nodeId:p.id});}}
  const paths=core.catalogOccurrencePaths(tree);assert(paths,'CATALOG_TOPOLOGY_UNAVAILABLE');
  const ordered=[...tree],findPath=p=>{const rows=ordered.filter(([id])=>paths.get(id)===p);assert.equal(rows.length,1,'CATALOG_PATH_AMBIGUOUS '+p);return rows[0];};
  function indices(id){const n=tree.get(id);if(n.parentId===null)return[];const parent=String(n.parentId),siblings=ordered.filter(([,s])=>String(s.parentId)===parent);return indices(parent).concat(siblings.findIndex(([s])=>s===id));}
  return{tree,paths,ordered,findPath,indices};
 }
 const defs={GraphicPosition:{type:'VARIANT',variantOptions:['Left','Right']},CardAxis:{type:'VARIANT',variantOptions:['Vertical','Horizontal']},Background:{type:'VARIANT',variantOptions:['True','False']},Compact:{type:'VARIANT',variantOptions:['False','True']}};
 for(const capture of identity.captures){
  assert(capture.complete&&capture.captureTopology.complete&&!capture.captureTopology.limitReached);const request=requests.get(capture.componentKey);assert(request);assert.deepEqual(request.expectedRootProperties,capture.properties);assert.equal(capture.shapeHash,request.expectedShapeHash);
  const component=keyFamilies.get(capture.componentSetKey);assert(component);const graph=materialize(component,capture.componentKey),shape=graph.ordered.map(([id,n])=>({path:graph.paths.get(id),type:graph.paths.get(id)===''?'ROOT':n.type})).sort((a,b)=>a.path.localeCompare(b.path)||a.type.localeCompare(b.type));
  assert.equal(core.stableHash(shape),capture.shapeHash,'ACCEPTED_SHAPE_MISMATCH '+capture.componentKey);
  const currentContent=graph.findPath(capture.freshness.path)[1];assert.equal(currentContent.componentInstance.componentKey,capture.freshness.contentComponentKey);assert.equal(currentContent.componentInstance.variantProperties.Title,capture.freshness.value);
  const mappingId='arui-private.benefit-card.'+capture.platform,id='benefitcard.'+capture.platform+'.'+capture.componentKey;
  choices.push({id,key:capture.componentKey,setKey:capture.componentSetKey,properties:capture.properties,definitions:Object.fromEntries(Object.entries(defs).map(([k,v])=>[k,{type:v.type,options:v.variantOptions}])),generic:true,representationId:capture.representationId,platform:capture.platform});
  const records=[];
  for(const t of capture.targets){
   const declared=manual.targets.find(x=>x.id===t.targetId),declaredBinding=declared.identityBindingsV1.find(x=>x.componentKey===capture.componentKey);assert(declaredBinding);assert.equal(declaredBinding.referencePath,t.referencePath);assert.equal(declaredBinding.referenceHash,capture.referenceHash);assert.equal(declaredBinding.nodeType,t.nodeType);
   const [local,n]=graph.findPath(t.referencePath),route=graph.indices(local),physical=t.targetId==='target.root'?'COMPONENT':n.type;assert.equal(t.nodeType,t.targetId==='target.root'?'INSTANCE':physical);
   const record={targetId:t.targetId,sourceNodeId:t.source?.sourceNodeId||capture.sourceVariantId,sourceTemplatePath:route,sourceType:physical,runtimeType:t.nodeType,cardinality:1,nativeRefs:{},nativeSourceIdentity:t.source||null,referencePath:t.referencePath,acceptedNativeReferenceHash:capture.referenceHash};
   if(t.nodeType==='INSTANCE'){
    const ownKey=t.targetId==='target.root'?capture.componentKey:n.componentInstance?.componentKey;assert(ownKey,'OWN_MAIN_KEY_UNAVAILABLE '+t.targetId);const oldNode=baseline[capture.platform].nodes.find(s=>s.semantic?.path.split(' / ').slice(1).join(' / ')===t.referencePath);
    record.requiredMainKey=ownKey;record.requiredSetKey=t.targetId==='target.root'?capture.componentSetKey:parts.get(ownKey)?.set||oldNode?.component?.identity?.componentSetKey;assert(record.requiredSetKey,'OWN_SET_KEY_UNAVAILABLE '+t.targetId);
    const props=t.targetId==='target.root'?capture.properties:n.componentInstance.variantProperties||{};
    record.nativeProperties=Object.fromEntries(Object.entries(props).map(([k,v])=>[k,{type:typeof v==='boolean'?'BOOLEAN':'VARIANT',value:v}]));
    record.ownMainEvidence=t.targetId==='target.content'?'r9 freshness provenance plus current catalog':'r11 ZIP catalog (unchanged from r10) plus retained r4 own-main/set evidence; runtime must reprove';
   }
   records.push(record);correspondence.push({choiceId:id,componentKey:capture.componentKey,representationId:capture.representationId,targetId:t.targetId,manualBinding:declaredBinding,acceptedTarget:t,catalogLocalId:local,sourceTemplatePath:route,localIdIsRuntimeHandle:false});
  }
  targets.push({choiceId:id,targets:records,runtimeResolution:'Fresh selected root, exact source ancestry/property/type and per-profile target re-resolution; accepted source IDs never reused as run handles.'});
 }
 assert.equal(choices.length,32);assert.equal(correspondence.length,256);
 const mappings=[],bindings=[],denials=[];
 function binding(mappingId,port,type,targetId,property,domain,pointer,RuleIDs,extra={}){const b={mappingId,port,kind:'property',type,targetId,componentProperty:property,writeDomain:domain,normativeSource:{...mp,pointer,RuleIDs},runtimeAdmission:'NOT_GRANTED',requiredConditions:['fresh-owned-root-and-current-version','exact-selected-published-variant','resolve-after-variant-switch','preserve-style-token-and-source-baseline'],...extra};bindings.push(b);return b;}
 for(const platform of ['desktop','mobile-web']){
  const mappingId='arui-private.benefit-card.'+platform,representationId='web.benefit-card.figma.'+platform,rows=choices.filter(c=>c.platform===platform),defaultChoice=rows.find(c=>c.key===keyFamilies.get(rows[0].setKey).defaultVariant);assert(defaultChoice);
  const ports={};for(const [name,def]of Object.entries(defs)){const index=manual.semanticApi.findIndex(p=>p.id===name),b=binding(mappingId,name,'VARIANT','target.root',name,{type:'string',enum:def.variantOptions},'/semanticApi/'+index,[]);ports[name]={nativePort:name,type:b.type,property:name,targetId:b.targetId,writeDomain:b.writeDomain};}
  for(const [port,type,target,property,domain,index]of [['BottomEnabled','BOOLEAN','target.content','Bottom#1110:27',{type:'boolean',enum:[false,true]},5],['GraphicPreset','VARIANT','target.graphic','Presets',{type:'string',enum:['Image','Icon','IconView']},6]]){const b=binding(mappingId,port,type,target,property,domain,'/semanticApi/'+index,[]);ports[port]={nativePort:port,type,targetId:target,property,writeDomain:b.writeDomain};}
  for(const [port,target,max,index]of [['TitleText','target.title',60,5],['SubtitleText','target.subtitle',120,6]]){const b=binding(mappingId,port,'TEXT',target,null,{type:'string',nativeTransportMaxLength:8192},'/rules/'+index,[manual.rules[index].id],{normativeMaxCharacters:max,implementationGap:'Physical TEXT has no public component TEXT property; no direct characters operation or accepted parent Figma scalar alias.'});ports[port]={nativePort:port,type:'TEXT',targetId:target,property:null,writeDomain:b.writeDomain};denials.push({mappingId,port,reason:'PHYSICAL_TEXT_WRITER_AND_ALIAS_UNAVAILABLE'});}
  for(const [port,target,prop,values,index]of [['BottomPreset','target.bottom','Presets',['Link'],3],['ContentTitle','target.content','Title',['Primary','Secondary'],9],['BackgroundType','target.surface','Type',['Primary','Secondary','Colored','Border'],13]]){
   const b=binding(mappingId,port,'VARIANT',target,prop,{type:'string',enum:values},'/rules/'+index,[manual.rules[index].id],port==='BackgroundType'?{condition:{Background:'True'}}:{});ports[port]={nativePort:port,type:'VARIANT',targetId:target,property:prop,writeDomain:b.writeDomain};
  }
  for(const c of rows)if(c.properties.Compact==='True')denials.push({mappingId,port:'ContentTitle',value:'Primary',choiceId:c.id,reason:manual.rules[9].id});
  denials.push({mappingId,port:'BottomEnabled',value:true,reason:'CHILD_LINK_FRESH_PROFILE_AND_DEPENDENCY_AUTHORITY_PENDING'});
  for(const value of ['Icon','IconView'])denials.push({mappingId,port:'GraphicPreset',value,reason:'NESTED_PROFILE_TARGET_REFRESH_NOT_ADMITTED'});
  mappings.push({mappingId,componentId:manual.component.componentId,representationId,platform,choices:rows.map(c=>c.id),ports,defaults:[{id:mappingId+'.default',platform,representationId,properties:defaultChoice.properties}],aliasAdmission:'Only four root ports, BottomEnabled and GraphicPreset declared in parent semanticApi; remaining aliases are prospective and guarded, not runtime-admitted.'});
  profiles.push({mappingId,platform,representationId,sourceChoices:rows.map(c=>c.id),default:mappings.at(-1).defaults[0],preserveSourceBaseline:true});
 }
 const actualParts=[...new Set(choices.map(c=>c.setKey))].map(setKey=>({key:setKey,type:'COMPONENT_SET',componentPropertyDefinitions:defs,variants:choices.filter(c=>c.setKey===setKey).map(c=>({key:c.key,properties:c.properties}))}));
 for(const c of raw.components.filter(c=>!actualParts.some(p=>p.key===c.key)))actualParts.push({key:c.key,type:'COMPONENT_SET',componentPropertyDefinitions:{},variants:c.variants.map(v=>({key:v.key,properties:Object.fromEntries(v.name.split(', ').map(p=>p.split('=')))}))});
 const sizeByPlatform={};
 for(const platform of ['desktop','mobile-web']){
  const rules=manual.rules.filter(r=>r.status!=='deprecated'&&r.applicability.platforms.includes(platform)&&r.constraints.some(c=>c.type==='dependencyDomain'&&c.dependency?.contractDependencyId==='link'&&c.dependency.property==='Size'));
  assert.equal(rules.length,1);const rule=rules[0],constraint=rule.constraints.find(c=>c.dependency?.property==='Size'),ir=compiled.rules.filter(r=>r.source.anchor===rule.id);
  assert.equal(ir.length,1);assert.deepEqual(ir[0].scope.platform,[platform]);assert.deepEqual(ir[0].assert.expected.literal,constraint.values);
  sizeByPlatform[platform]={values:constraint.values,manualRuleId:rule.id,normativeSource:{...mp,pointer:'/rules/'+manual.rules.indexOf(rule)},compiledRuleId:ir[0].ruleId,compiledRule:ir[0]};
 }
 assert.deepEqual(sizeByPlatform.desktop.values,['M (16-24)']);assert.deepEqual(sizeByPlatform['mobile-web'].values,['S (14-20)','S (14-20) (Size-20 icons)']);
 const output={semantic:{schemaVersion:'apollo.agent-figma-semantic-mapping.v1',status:'PRIVATE_DRAFT_R11_NOT_ADOPTED',mappings,Ready:false},typed:{schemaVersion:'apollo.agent-figma-typed-native-binding-input.v1',bindings,Ready:false},profiles:{sourceDependencies:[parentDependency,...deps],profiles,choices,actualPartDefinitions:actualParts,actualNativeGeneration:false,Ready:false},targets:{schemaVersion:'apollo.agent-figma-target-binding-evidence.v1',profiles:targets,Ready:false},manuals,ruleLinks:{schemaVersion:'apollo.agent-rule-links.v1',links,normsCopiedExactly:true,Ready:false},denials};
 save('benefit-card.figma-mapping.candidate.json',output);save('target-correspondence.json',{count:correspondence.length,rows:correspondence,rootIdentityCount:32,descendantCount:correspondence.length-32,conditionalBackgroundTargets:true,Ready:false});save('dependency-correspondence.json',{rows:dependencyRows,bottom:{when:'BottomEnabled=true',Presets:'Link',SizeByPlatform:sizeByPlatform,maxCharacters:32,maxLines:1,otherSettings:'Delegate to exact Link r5; old text-only rule remains deprecated.'},surface:'Only Type; BackgroundColor, Skeleton and wrapper Position excluded; child contract remains exact.',graphic:'IconView public settings delegate to exact r8, not unconstrained parent writes; source profile change requires fresh target resolution.',freshOwnerReports:'Eight r10 reports accepted for target-parent under r10; r11 retained replay separate, not fresh r11 or full child acceptance',Ready:false});save('rule-links.json',output.ruleLinks);
 for(const name of ['benefit-card.figma-mapping.candidate.json','target-correspondence.json','dependency-correspondence.json','rule-links.json','dependency-link.manual.json','dependency-icon-view.manual.json','dependency-background-plate.manual.json']){const p=pin(T+'/'+name);inputs.set(p.path,p);}
 save('INPUT-PINS.json',{pins:[...inputs.values()],historicalCapturesReused:true,newNativeCalls:0,Ready:false});
 console.log(JSON.stringify({status:'PREPARED',choices:choices.length,targetBindings:correspondence.length,typedPorts:bindings.length,fullRuleLinks:links.length,Ready:false}));
})().catch(e=>{save('PREPARATION-FIRST-FAILURE.json',{message:e.message,stack:e.stack});console.error(e.message);process.exitCode=1;});
