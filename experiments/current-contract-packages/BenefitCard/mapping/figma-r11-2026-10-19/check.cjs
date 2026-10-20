'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),T=__dirname,W='/Users/alexkukhta/Desktop/workplace',V=W+'/projects/Apollo-v3/apps/apollo-v4';
if(fs.existsSync(T+'/SEAL.json'))throw Error('CLOSED candidate');
const load=f=>JSON.parse(fs.readFileSync(f)),clone=structuredClone,save=(n,x)=>fs.writeFileSync(T+'/'+n,JSON.stringify(x,null,2)+'\n');
const pin=f=>{const b=fs.readFileSync(f);return{path:fs.realpathSync(f),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const pins=[...load(T+'/PRIVATE-READSET.json').pins,...load(T+'/INPUT-PINS.json').pins,pin(T+'/PRIVATE-READSET.json'),pin(T+'/INPUT-PINS.json')],assertPins=(expected=pins)=>{for(const p of expected)assert.deepEqual(pin(p.path),p,'INPUT_STALE '+p.path);};
const checks=[];function pass(id,proof){checks.push({id,status:'PASS',proofScope:proof});}
(async()=>{
 assertPins();const stale=clone(pins);stale[0].sha256='0'.repeat(64);assert.throws(()=>assertPins(stale),/INPUT_STALE/);pass('exact-data-only-readset','Full declared actual r11 inputs, immutable r10 outputs and existing transitive code closure; before/after guard plus stale-pin negative. No broad runtime preflight.');
 const {createMappingAdapter}=require(V+'/src/generation-agent-figma-mapping.js'),data=load(T+'/benefit-card.figma-mapping.candidate.json'),adapter=createMappingAdapter(data),manual=load(T+'/contract.manual.json'),identity=load(T+'/native-identity.r9.json');
 for(const b of data.typed.bindings)assert.equal(adapter.port(b.mappingId,b.port),b);assert.equal(data.typed.bindings.length,22);
 for(const choice of data.profiles.choices){
  const mapping=data.semantic.mappings.find(m=>m.platform===choice.platform),node={mappingId:mapping.mappingId,props:clone(choice.properties)};
  assert.equal(adapter.select(node,choice.platform).choice.key,choice.key);
  assert.throws(()=>adapter.select(node,choice.platform==='desktop'?'mobile-web':'desktop'),/FIGMA_PLATFORM_UNSUPPORTED/);
  const native=identity.captures.find(c=>c.componentKey===choice.key);
  const definition={type:'COMPONENT',key:native.componentKey,variantProperties:native.properties,parent:{type:'COMPONENT_SET',key:native.componentSetKey,componentPropertyDefinitions:Object.fromEntries(Object.keys(native.properties).map(k=>[k,{type:'VARIANT',variantOptions:adapter.port(mapping.mappingId,k).writeDomain.enum}]))}};
  const instance={id:'synthetic:'+choice.id,type:'INSTANCE',componentProperties:Object.fromEntries(Object.entries(native.properties).map(([k,value])=>[k,{type:native.propertyTypes[k],value}])),getMainComponentAsync:async()=>definition};
  const port=await adapter.resolve(instance,{mapping,choice},'Compact',()=>{});assert.equal(port.type,'VARIANT');assert.equal(port.node,instance);
  definition.key='foreign-key';await assert.rejects(()=>adapter.resolve(instance,{mapping,choice},'Compact',()=>{}),/FIGMA_MAIN_COMPONENT_MISMATCH/);definition.key=native.componentKey;
 }
 pass('all32-root-choice-domains-and-owning-platforms','Existing generic selector and synthetic resolver on exact native root properties, keys and enums; not native execution');
 for(const mapping of data.semantic.mappings){
  const base={mappingId:mapping.mappingId,props:clone(mapping.defaults[0].properties)};
  for(const value of [true,false,'true','FALSE'])assert.throws(()=>adapter.select({...base,props:{...base.props,Compact:value}},mapping.platform),/FIGMA_PROPERTY_NOT_ADMITTED/);
  assert.throws(()=>adapter.select({...base,props:{...base.props,GraphicPosition:'Centre'}},mapping.platform),/FIGMA_PROPERTY_NOT_ADMITTED/);
  assert.throws(()=>adapter.select({...base,slots:{body:[]}},mapping.platform),/FIGMA_PORT_UNAVAILABLE/);
  assert.throws(()=>adapter.select({...base,props:{...base.props,BottomEnabled:true}},mapping.platform),/FIGMA_CAPABILITY_UNAVAILABLE/);
  for(const value of ['Icon','IconView'])assert.throws(()=>adapter.select({...base,props:{...base.props,GraphicPreset:value}},mapping.platform),/FIGMA_CAPABILITY_UNAVAILABLE/);
  assert.throws(()=>adapter.select({...base,props:{...base.props,TitleText:'test'}},mapping.platform),/FIGMA_CAPABILITY_UNAVAILABLE/);
  assert.throws(()=>adapter.select({...base,props:{...base.props,Compact:'True',ContentTitle:'Primary'}},mapping.platform),/FIGMA_CAPABILITY_UNAVAILABLE/);
  assert(adapter.select({...base,props:{...base.props,Compact:'True',ContentTitle:'Secondary'}},mapping.platform));
  assert.throws(()=>adapter.select({...base,props:{...base.props,Background:'False',BackgroundType:'Colored'}},mapping.platform),/FIGMA_PORT_CONDITION_UNSATISFIED/);
  assert.throws(()=>adapter.port(mapping.mappingId,'BackgroundColor'),/FIGMA_PORT_UNAVAILABLE/);for(const name of ['Size','LinkSize','BottomLinkSize'])assert.throws(()=>adapter.port(mapping.mappingId,name),/FIGMA_PORT_UNAVAILABLE/);
 }
 pass('wrong-types-swap-slots-condition-and-unavailable-operations','Existing adapter rejects unsupported scalar/structure/nested paths; source allowance is not runtime permission');
 let bad=clone(data);bad.profiles.sourceDependencies[1].revision++;assert.throws(()=>createMappingAdapter(bad),/FIGMA_DEPENDENCY_STALE/);
 bad=clone(data);bad.profiles.sourceDependencies[1].manualSemanticHash='0'.repeat(64);assert.throws(()=>createMappingAdapter(bad),/FIGMA_DEPENDENCY_STALE/);
 bad=clone(data);bad.typed.bindings[0].normativeSource.sha256='0'.repeat(64);assert.throws(()=>createMappingAdapter(bad).port(bad.typed.bindings[0].mappingId,bad.typed.bindings[0].port),/FIGMA_PORT_AUTHORITY_UNAVAILABLE/);
 bad=clone(data);bad.profiles.choices.push(clone(bad.profiles.choices[0]));assert.throws(()=>createMappingAdapter(bad),/FIGMA_MAPPING_DUPLICATE/);
 pass('stale-dependency-authority-and-duplicate-rejection','Existing dependency/authority/schema guards; no freshness bypass');
 assert.deepEqual(data.ruleLinks.links.filter(r=>r.source.path===T+'/contract.manual.json').map(r=>r.rule),manual.rules);assert.equal(manual.rules.filter(r=>r.id.endsWith('bottom-link-text-only'))[0].status,'deprecated');assert.equal(data.profiles.choices.filter(c=>c.platform==='desktop').length,16);assert.equal(load(T+'/target-correspondence.json').count,256);
 assert.equal(manual.rules.length,24);assert.equal(data.ruleLinks.links.length,141);const old=load(T+'/../figma-r10-2026-10-18/benefit-card.figma-mapping.candidate.json');assert.deepEqual(data.denials,old.denials);assert.deepEqual(manual.targets,old.manuals[0].manual.targets);assert.deepEqual(manual.componentDependencies,old.manuals[0].manual.componentDependencies);assert.deepEqual(data.profiles.choices,old.profiles.choices);
 pass('full-r11-rule-and-source-retention','24 complete parent rules including deprecated statuses,141 full links,256 unchanged targets,32 unchanged published choices,3 exact child contracts and unchanged denials.');
 const core=require(W+'/projects/ComponentContractEditor/dist/core.cjs'),predicate=require(W+'/projects/Apollo-v3/packages/component-contract-core/dist/predicate.cjs');
 const normRoot=T+'/../../authoring/link-size-r11-2026-10-19',normFile=normRoot+'/eval.json',prior=load(normFile),review=load(normRoot+'/fresh-r10-report-review.json');
 const entries=await core.readZip(fs.readFileSync(load(T+'/ZIP-ENTRY-PINS.json').archive.path)),serializedCompiled=JSON.parse(Buffer.from(entries.find(e=>e.name==='compiled/component-contract.v2.json').data).toString()),workspace=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),'benefit-card.desktop'),bundle=core.buildExportBundle(workspace.manual,workspace.variantEvidence,workspace.dependencyContracts),compiled=bundle.compiled;
 assert.equal(core.stableHash(compiled),'7dc5803e57396be35fa0da74288a79b6684d03c6b588a2ce19e76e48b5949bfe');assert.equal(core.stableHash(compiled),core.stableHash(serializedCompiled));assert.equal(compiled.package.manualSourceHash,'b13e27922b624a1fe51668f5f325d1b33b89cf18aea185559db29e23771ab53e');
 const policy=load(T+'/dependency-correspondence.json').bottom;assert(!Object.hasOwn(policy,'Size'));const view=core.prepareAuthoringPreviewContract(compiled),sizeRules=view.rules.filter(r=>Object.values(policy.SizeByPlatform).some(p=>p.compiledRuleId===r.ruleId)),domain=[],retained=[];assert.equal(sizeRules.length,2);
 for(const platform of ['desktop','mobile-web']){
  const p=policy.SizeByPlatform[platform],rule=sizeRules.find(r=>r.ruleId===p.compiledRuleId),manualRule=manual.rules.find(r=>r.id===p.manualRuleId);
  assert.deepEqual(p.compiledRule,JSON.parse(JSON.stringify(compiled.rules.find(r=>r.ruleId===p.compiledRuleId))));assert.deepEqual(rule.scope.platform,[platform]);assert.deepEqual(p.values,rule.assert.expected.literal);assert.deepEqual(manualRule.applicability.platforms,[platform]);assert.equal(manualRule.id,rule.source.anchor);assert.equal(p.normativeSource.pointer,'/rules/'+manual.rules.indexOf(manualRule));assert.deepEqual(p.normativeSource,{...pin(T+'/contract.manual.json'),pointer:p.normativeSource.pointer});
  const row=review.cases.find(r=>r.platform===platform),report=load(row.report.path);assert.deepEqual(pin(row.report.path),row.report);const prepared=core.prepareValidationSnapshot(report.snapshot,view),binding=rule.presentation.dependency.bindingId;retained.push(row.report);
  for(const value of ['S (14-20)','S (14-20) (Size-20 icons)','M (16-24)','L (18-24)']){
   const snapshot=clone(prepared),root=snapshot.nodes.find(n=>snapshot.selection.includes(n.id));root.dependencies[binding].variantProperty=value;
   const result=predicate.evaluateRules({snapshot,rules:sizeRules,ruleRelease:compiled.package.manualSourceHash}),actual=result.evaluations.find(e=>e.ruleId===rule.ruleId).classification,other=result.evaluations.find(e=>e.ruleId!==rule.ruleId).classification,expected=p.values.includes(value)?'compliant':'violation';assert.equal(actual,expected);assert.equal(other,'not-applicable');domain.push({platform,value,actual,expected,otherPlatform:other});
  }
  for(const scenario of ['missing-size','hidden-bottom']){
   const snapshot=clone(prepared),root=snapshot.nodes.find(n=>snapshot.selection.includes(n.id));if(scenario==='missing-size')delete root.dependencies[binding].variantProperty;else root.semanticApi.BottomEnabled=false;
   const result=predicate.evaluateRules({snapshot,rules:[rule],ruleRelease:compiled.package.manualSourceHash}),actual=result.evaluations[0].classification,expected=scenario==='missing-size'?'human-review':'not-applicable';assert.equal(actual,expected);domain.push({platform,scenario,actual,expected});
  }
 }
 assert.deepEqual(domain,prior.checks);assert.equal(prior.retainedR11.length,8);assert.equal(prior.freshR11Native,false);assert.equal(prior.parentChildCompletionAccepted,false);
 pass('canonical-Editor-opener-and-platform-size-matrix','Existing canonical authored ZIP opener exactly matches accepted r11 hashes. Existing predicate IR on2 retained r10 snapshots:2platforms x4Size,8foreign-inactive assertions,2missing and2hidden cases. Exact correspondence to accepted norm receipt; no fresh r11 native acceptance.');
 save('R11-SCOPED-NORM-EVAL.json',{status:'PASS_EXISTING_IR_ON_RETAINED_PROJECTIONS',reusedNormEval:pin(normFile),retainedInputs:retained,domainChecks:domain,policy:policy.SizeByPlatform,freshOwnerReports:'8 accepted target-parent r10 reports referenced;2 consumed snapshots replayed under r11',freshR11Native:false,fullParentCompletion:false,Ready:false});
 const declared=new Set(pins.map(p=>p.path));for(const file of Object.keys(require.cache))if(file.startsWith(W+'/projects/'))assert(declared.has(file),'UNDECLARED_CODE_DEPENDENCY '+file);
 pass('declared-existing-code-closure','All actual required project modules belong to the declared full loader/Core closure; no new implementation, build or runtime consumer.');
 assertPins();save('SCOPED-CHECKS.json',{status:'PASS_PRIVATE_ONLY',checks,checkCount:checks.length,uniqueDeclaredReadset:new Set(pins.map(p=>p.path)).size,originalFailurePreserved:true,sourceBuildWrites:0,nativeCalls:0,modelCalls:0,runtimeAdopted:false,Ready:false});console.log(JSON.stringify({status:'PASS',checkGroups:checks.length,choices:32,targetBindings:256,typedPorts:data.typed.bindings.length,Ready:false}));
})().catch(e=>{const name=fs.existsSync(T+'/CHECK-FIRST-FAILURE.json')?'CHECK-LATER-FAILURE.json':'CHECK-FIRST-FAILURE.json';save(name,{message:e.message,stack:e.stack});console.error(e.stack);process.exitCode=1;});
