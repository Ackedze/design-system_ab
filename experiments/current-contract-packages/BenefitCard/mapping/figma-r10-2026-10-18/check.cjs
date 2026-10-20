'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),T=__dirname,W='/Users/alexkukhta/Desktop/workplace',V=W+'/projects/Apollo-v3/apps/apollo-v4';
if(fs.existsSync(T+'/SEAL.json'))throw Error('CLOSED candidate');
const load=f=>JSON.parse(fs.readFileSync(f)),clone=structuredClone,save=(n,x)=>fs.writeFileSync(T+'/'+n,JSON.stringify(x,null,2)+'\n');
const pin=f=>{const b=fs.readFileSync(f);return{path:fs.realpathSync(f),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const pins=[...load(T+'/PRIVATE-READSET.json').pins,...load(T+'/INPUT-PINS.json').pins],assertPins=()=>{for(const p of pins)assert.deepEqual(pin(p.path),p,'INPUT_STALE '+p.path);};
const checks=[];function pass(id,proof){checks.push({id,status:'PASS',proofScope:proof});}
(async()=>{
 assertPins();pass('exact-doc-addendum-readset','656 source/current physical pins; original failure remains immutable');
 const {createMappingAdapter}=require(V+'/src/generation-agent-figma-mapping.js'),data=load(T+'/benefit-card.figma-mapping.candidate.json'),adapter=createMappingAdapter(data),manual=load(T+'/contract.manual.json'),identity=load(T+'/native-identity.r9.json');
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
  assert.throws(()=>adapter.port(mapping.mappingId,'BackgroundColor'),/FIGMA_PORT_UNAVAILABLE/);
 }
 pass('wrong-types-swap-slots-condition-and-unavailable-operations','Existing adapter rejects unsupported scalar/structure/nested paths; source allowance is not runtime permission');
 let bad=clone(data);bad.profiles.sourceDependencies[1].revision++;assert.throws(()=>createMappingAdapter(bad),/FIGMA_DEPENDENCY_STALE/);
 bad=clone(data);bad.profiles.sourceDependencies[1].manualSemanticHash='0'.repeat(64);assert.throws(()=>createMappingAdapter(bad),/FIGMA_DEPENDENCY_STALE/);
 bad=clone(data);bad.typed.bindings[0].normativeSource.sha256='0'.repeat(64);assert.throws(()=>createMappingAdapter(bad).port(bad.typed.bindings[0].mappingId,bad.typed.bindings[0].port),/FIGMA_PORT_AUTHORITY_UNAVAILABLE/);
 bad=clone(data);bad.profiles.choices.push(clone(bad.profiles.choices[0]));assert.throws(()=>createMappingAdapter(bad),/FIGMA_MAPPING_DUPLICATE/);
 pass('stale-dependency-authority-and-duplicate-rejection','Existing dependency/authority/schema guards; no freshness bypass');
 assert.deepEqual(data.ruleLinks.links.filter(r=>r.source.path===T+'/contract.manual.json').map(r=>r.rule),manual.rules);assert.equal(manual.rules.filter(r=>r.id.endsWith('bottom-link-text-only'))[0].status,'deprecated');assert.equal(data.profiles.choices.filter(c=>c.platform==='desktop').length,16);assert.equal(load(T+'/target-correspondence.json').count,256);
 pass('full-r10-rule-and-target-retention','23 parent rules, including deprecated statuses, and exactly256 conditional target identities; no new norms');
 const core=require(W+'/projects/ComponentContractEditor/dist/core.cjs'),predicate=require(W+'/projects/Apollo-v3/packages/component-contract-core/dist/predicate.cjs');
 const normFile=T+'/../../authoring/link-size-r10-2026-10-18/eval.json',prior=load(normFile),reportPin=prior.native[0].report;assert.deepEqual(pin(reportPin.path),reportPin);
 const report=load(reportPin.path),entries=await core.readZip(fs.readFileSync(load(T+'/ZIP-ENTRY-PINS.json').archive.path)),serializedCompiled=JSON.parse(Buffer.from(entries.find(e=>e.name==='compiled/component-contract.v2.json').data).toString()),workspace=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),'web.benefit-card'),bundle=core.buildExportBundle(workspace.manual,workspace.variantEvidence,workspace.dependencyContracts),compiled=bundle.compiled,view=core.prepareAuthoringPreviewContract(compiled),prepared=core.prepareValidationSnapshot(report.snapshot,view),rule=view.rules.find(r=>r.ruleId===prior.native[0].ruleId);assert(rule);assert.equal(core.stableHash(compiled),core.stableHash(serializedCompiled));
 const subject=prepared.nodes.find(n=>prepared.selection.includes(n.id)),binding=rule.presentation.dependency.bindingId,domain=[];
 for(const value of ['S (14-20)','S (14-20) (Size-20 icons)','M (16-24)','L (18-24)']){const s=clone(prepared),n=s.nodes.find(n=>s.selection.includes(n.id));n.dependencies[binding].variantProperty=value;const result=predicate.evaluateRules({snapshot:s,rules:[rule],ruleRelease:compiled.package.manualSourceHash}),actual=result.evaluations[0].classification,expected=value.startsWith('S (14-20)')?'compliant':'violation';assert.equal(actual,expected);domain.push({value,actual,expected});}
 assert.equal(prior.native.length,8);assert.equal(prior.freshNative,false);assert.equal(prior.childParentRunsAccepted,false);
 pass('existing-r10-size-IR-two-positive-two-negative','Existing predicate checker on one retained authoring projection. References eight prior retained reports; not eight new owner reports, not full parent/child acceptance');
 save('R10-SCOPED-NORM-EVAL.json',{status:'PASS_EXISTING_IR_ON_RETAINED_PROJECTION',reusedNormEval:pin(fs.realpathSync(normFile)),retainedInput:reportPin,ruleId:rule.ruleId,domainChecks:domain,freshOwnerReports:'NOT_RUN_USER_ONLY',fullParentCompletion:false,Ready:false});
 assertPins();save('SCOPED-CHECKS.json',{status:'PASS_PRIVATE_ONLY',checks,checkCount:checks.length,uniqueDeclaredReadset:656,originalFailurePreserved:true,sourceBuildWrites:0,nativeCalls:0,modelCalls:0,runtimeAdopted:false,Ready:false});console.log(JSON.stringify({status:'PASS',checkGroups:checks.length,choices:32,targetBindings:256,typedPorts:data.typed.bindings.length,Ready:false}));
})().catch(e=>{const name=fs.existsSync(T+'/CHECK-FIRST-FAILURE.json')?'CHECK-LATER-FAILURE.json':'CHECK-FIRST-FAILURE.json';save(name,{message:e.message,stack:e.stack});console.error(e.stack);process.exitCode=1;});
