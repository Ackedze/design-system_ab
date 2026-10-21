'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=__dirname,W='/Users/alexkukhta/Desktop/workplace',host=path.join(W,'arui-private/tools/code-connect/frontend-host');
if(fs.existsSync(path.join(root,'FINAL-SEAL.json')))throw Error('MAPPING_OUTPUT_CLOSED: use a new output directory');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const write=(n,v)=>fs.writeFileSync(path.join(root,n),JSON.stringify(v,null,2)+'\n');
const stable=x=>x&&typeof x==='object'?(Array.isArray(x)?x.map(stable):Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])]))):x;
const hash=x=>sha(Buffer.from(JSON.stringify(stable(x))));
const pin=f=>{const p=fs.realpathSync(f),b=fs.readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length};};
const checks=[],inputs=read('INPUT-PINS.json');
function current(){
 for(const p of inputs.files){const b=fs.readFileSync(p.path);assert.equal(sha(b),p.sha256,'INPUT_DRIFT:'+p.path);assert.equal(b.length,p.bytes);}
 for(const [p,expected]of Object.entries(inputs.absenceAssertions))assert.equal(fs.existsSync(p),expected,'DISTRIBUTION_CHANGED:'+p);
 for(const s of inputs.symlinks)assert.equal(fs.realpathSync(s.path),s.target);
}
async function check(name,fn){try{await fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',message:e.message});if(!fs.existsSync(path.join(root,'FIRST-CHECK-FAILURE.json')))write('FIRST-CHECK-FAILURE.json',{name,message:e.message,stack:e.stack,checks});throw e;}}
const reject=(fn,code)=>assert.throws(fn,e=>e.message===code);
const rejectAsync=(fn,code)=>assert.rejects(fn,e=>e.message===code);
(async()=>{
 current();
 const manual=read('contract.manual.json'),figma=read('payment-masked-number.figma-mapping.json'),front=read('payment-masked-number.frontend-mapping.json'),live=read('evidence/native-evidence.json'),mid=front.bindings[0].mappingId;
 await check('r4 manifest-selected identity, universal platform and four Draft rules',()=>{assert.equal(manual.metadata.revision,4);assert.equal(manual.component.platform,'universal');assert.equal(manual.rules.length,4);assert(manual.rules.every(r=>r.status==='draft'));assert.deepEqual(manual.component.platforms,['desktop','mobile-web']);});
 await check('all twelve source norms and four exact compiled RuleID links retained',()=>{assert.equal(read('coverage-map.json').sourceNorms.length,12);assert.deepEqual(figma.ruleLinks.links.map(r=>r.RuleID),manual.rules.map(r=>r.id));});
 await check('fresh read-only Figma source, standalone COMPONENT key (no COMPONENT_SET)',()=>{assert(live.freshReadOnly);assert.equal(live.root.sourceRoot.componentSetKey,null);assert.equal(live.root.sourceRoot.key,manual.component.componentKey);assert.deepEqual(live.root.mutatedNodeIds,[]);assert.deepEqual(live.parts.mutatedNodeIds,[]);});
 await check('Mask Number True owns fixed literal and has no custom characters property reference',()=>{const part=live.parts.rows.find(x=>x.name==='Mask Number=True');assert.equal(part.children[0].characters,'··\u2009');assert.deepEqual(part.children[0].componentPropertyReferences,{});});
 await check('composed text style is retained despite bare part empty textStyleId',()=>{assert(live.root.rows.filter(n=>n.type==='TEXT').every(n=>n.textStyleId.startsWith('S:')));assert(live.parts.rows.find(n=>n.name==='Mask Number=False').children[0].textStyleId==='');});
 const {createMappingAdapter}=require('./evidence/consumer/mapping.js'),adapter=createMappingAdapter(figma);
 for(const platform of ['desktop','mobile-web'])await check('real adapter selects universal source for '+platform,()=>assert.equal(adapter.select({mappingId:mid,props:{}},platform).choice.id,'paymentmaskednumber.universal'));
 await check('real adapter rejects iOS platform',()=>reject(()=>adapter.select({mappingId:mid,props:{}},'ios'),'FIGMA_PLATFORM_UNSUPPORTED'));
 await check('native BOOLEAN rejects string True',()=>reject(()=>adapter.select({mappingId:mid,props:{addonVisible:'True'}},'desktop'),'FIGMA_PROPERTY_NOT_ADMITTED'));
 await check('native VARIANT rejects boolean true',()=>reject(()=>adapter.select({mappingId:mid,props:{maskNumber:true}},'desktop'),'FIGMA_PROPERTY_NOT_ADMITTED'));
 await check('unmapped/loading semantic port rejected',()=>reject(()=>adapter.select({mappingId:mid,props:{loading:true}},'desktop'),'FIGMA_PORT_UNAVAILABLE'));
 await check('SwapMe cannot escape as final Addon',()=>reject(()=>adapter.select({mappingId:mid,props:{addonPreset:'SwapMe'}},'desktop'),'FIGMA_PROPERTY_NOT_ADMITTED'));
 let counter=0;
 function tree(masked=false){
  const owners=live.root.owners;
  const main=(name,variant)=>{
   const o=owners.find(n=>n.name===name),v=o.variants?.find(x=>x.name===variant);
   return {type:'COMPONENT',id:v?.id||o.id,key:v?.key||o.key,parent:o.type==='COMPONENT_SET'?{type:'COMPONENT_SET',key:o.key,componentPropertyDefinitions:o.definitions}:null,componentPropertyDefinitions:o.definitions,variantProperties:variant?Object.fromEntries([variant.split('=')]):{}};
  };
  const node=(name,definition,props,children=[])=>({id:'fixture-'+(++counter),type:'INSTANCE',name,componentProperties:props,children,getMainComponentAsync:async()=>definition});
  const text=(name,property,characters)=>({id:'fixture-'+(++counter),type:'TEXT',name,characters,componentPropertyReferences:property?{characters:property}:{}});
  const major=node('Major',main('Major','Mask Number='+(masked?'True':'False')),{'Mask Number':{type:'VARIANT',value:masked?'True':'False'},'✎ Major#26906:0':{type:'TEXT',value:'40802\u205f810\u205f0\u205f0000\u205f000'}},[text('✎ Major',masked?null:'✎ Major#26906:0',masked?'··\u2009':'40802\u205f810\u205f0\u205f0000\u205f000')]);
  const minor=node('Minor',main('Minor'),{'✎ Minor#26906:4':{type:'TEXT',value:'1234'}},[text('✎ Minor','✎ Minor#26906:4','1234')]);
  const addon=node('Addon',main('RightAddon','Presets=StatusBadge'),{Presets:{type:'VARIANT',value:'StatusBadge'}});
  return node('PaymentMaskedNumber',{type:'COMPONENT',key:manual.component.componentKey,componentPropertyDefinitions:live.root.sourceRoot.definitions,parent:null},{'RightAddon#22225:1':{type:'BOOLEAN',value:false}},[major,minor,addon]);
 }
 const selected=adapter.select({mappingId:mid,props:{}},'desktop');
 for(const port of ['addonVisible','maskNumber','major','minor','addonPreset'])await check('real resolver confirms exact native property '+port,async()=>{const resolved=await adapter.resolve(tree(),selected,port,()=>{});assert.equal(resolved.property,figma.semantic.mappings[0].ports[port].property);assert.equal(resolved.type,figma.semantic.mappings[0].ports[port].type);});
 await check('real resolver rejects custom Major write for masked fixed-text source',()=>rejectAsync(()=>adapter.resolve(tree(true),selected,'major',()=>{}),'FIGMA_TEXT_REFERENCE_UNKNOWN'));
 await check('real resolver rejects foreign root key',async()=>{const r=tree();r.getMainComponentAsync=async()=>({type:'COMPONENT',key:'foreign',parent:null});await rejectAsync(()=>adapter.resolve(r,selected,'minor',()=>{}),'FIGMA_MAIN_COMPONENT_MISMATCH');});
 await check('real resolver rejects incorrect child ancestry',async()=>{const r=tree();r.children.reverse();await rejectAsync(()=>adapter.resolve(r,selected,'maskNumber',()=>{}),'FIGMA_MAIN_COMPONENT_MISMATCH');});
 const {projectFrontendAuthoring,admitFrontendComponent}=require('./evidence/consumer/agent-run-inputs.cjs');
 let packet;
 for(const platform of ['desktop','mobile-web'])await check('real frontend projector accepts source-only proposal for '+platform,()=>{packet=projectFrontendAuthoring({platform,mappings:[],contracts:[]},front,{hash});assert.equal(packet.mappings[0].id,mid);assert.equal(packet.contracts[0].pin.revision,4);});
 await check('frontend admission accepts string mask enum',()=>assert.equal(admitFrontendComponent({mappingId:mid,props:{maskNumber:'True'}},packet).ports[0].codePath,'props.hideNumber'));
 await check('frontend admission rejects boolean native-to-code confusion',()=>reject(()=>admitFrontendComponent({mappingId:mid,props:{maskNumber:true}},packet),'AGENT_MAPPING_VALUE_UNSUPPORTED'));
 await check('frontend admission rejects invented major prop',()=>reject(()=>admitFrontendComponent({mappingId:mid,props:{major:'1234'}},packet),'AGENT_MAPPING_PORT_INVALID'));
 await check('rightAddon cannot masquerade as children SLOT',()=>reject(()=>admitFrontendComponent({mappingId:mid,slots:{addonPreset:[]}},packet),'AGENT_MAPPING_PORT_INVALID'));
 await check('real frontend projector rejects stale archive before dependent use',()=>{const x=structuredClone(front);x.context.contracts.PaymentMaskedNumber.archive.sha256='0'.repeat(64);x.bindings[0].contract.archive.sha256='0'.repeat(64);reject(()=>projectFrontendAuthoring({platform:'desktop',mappings:[],contracts:[]},x,{hash}),'AGENT_MAPPING_SOURCE_STALE');});
 await check('real frontend projector rejects foreign semantic port',()=>{const x=structuredClone(front);x.bindings[0].ports[0].logical='loading';reject(()=>projectFrontendAuthoring({platform:'desktop',mappings:[],contracts:[]},x,{hash}),'AGENT_MAPPING_PORT_INVALID');});
 const tsFile=require.resolve('typescript',{paths:[host]});const ts=require(tsFile);
 function transpile(filename){const source=fs.readFileSync(filename,'utf8');const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const module={exports:{}};new Function('module','exports',output)(module,module.exports);return module.exports;}
 const helper=transpile(path.join(root,'bindings.ts')),format=transpile(path.join(root,'fixtures/source/payment-masked-number/utils.ts')).formatNumber;
 await check('enum transform False/True maps to actual boolean',()=>{assert.equal(helper.mapMaskNumber('False'),false);assert.equal(helper.mapMaskNumber('True'),true);});
 await check('enum helper rejects boolean and unknown spelling',()=>{reject(()=>helper.mapMaskNumber(true),'PMN_MASK_VALUE_UNSUPPORTED');reject(()=>helper.mapMaskNumber('true'),'PMN_MASK_VALUE_UNSUPPORTED');});
 await check('real source formatter account prefix5-3-1-4-3 plus last four',()=>{const s=format('40802810000000001234','xxxxx xxx x xxxx xxxxxxx');assert.equal(s,'40802\u205f810\u205f0\u205f0000\u205f0001234');assert.equal(s.slice(-4),'1234');});
 await check('real source formatter card uses U+205F and preserves last four',()=>{const s=format('5555444433332222','xxxx xxxx xxxx xxxx');assert.equal(s,'5555\u205f4444\u205f3333\u205f2222');assert.equal(s.slice(-4),'2222');});
 await check('source formatter behavior does not prove normative input validation',()=>{assert.equal(format('','xxxx xxxx xxxx xxxx'),'');assert(format('abc','xxxx xxxx xxxx xxxx').includes('abc'));assert.equal(format('5555444433332222999','xxxx xxxx xxxx xxxx'),format('5555444433332222','xxxx xxxx xxxx xxxx'));});
 await check('source addon gap is observed4 while contract requires6',()=>{assert.equal(read('PUBLIC-API-EVIDENCE.json').addonGap.observedTokenPx,4);assert.equal(manual.rules[3].constraints[0].value,6);});
 // This compile resolves the public import to exact current source, never claims installed distribution.
 const compilerReads=new Map([[fs.realpathSync(tsFile),pin(tsFile)]]);
 const options={target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,jsx:ts.JsxEmit.ReactJSX,strict:true,skipLibCheck:true,esModuleInterop:true,noEmit:true,baseUrl:W,typeRoots:[path.join(host,'node_modules/@types')],types:['react','react-dom'],paths:{'bem-react-classname':[path.join(host,'node_modules/bem-react-classname/index.d.ts')],'react':[path.join(host,'node_modules/@types/react/index.d.ts')],'react/*':[path.join(host,'node_modules/@types/react/*')],'arui-private/payment-masked-number':[path.join(W,'arui-private/src/payment-masked-number/index.ts')],'*':[path.join(host,'node_modules/*'),path.join(host,'node_modules/@types/*')]}};
 const compilerHost=ts.createCompilerHost(options),originalRead=compilerHost.readFile.bind(compilerHost);
 compilerHost.readFile=f=>{const content=originalRead(f);if(content!==undefined&&fs.existsSync(f)){const p=pin(f);const old=compilerReads.get(p.path);if(old)assert.deepEqual(p,old,'COMPILER_INPUT_DRIFT');compilerReads.set(p.path,p);}return content;};
 const program=ts.createProgram([path.join(root,'type-probe.tsx')],options,compilerHost);
 const diagnostics=ts.getPreEmitDiagnostics(program);
 write('TYPECHECK.json',{scope:'actual source typecheck via explicit public-import-to-source path; no installed distribution/browser acceptance',typescript:ts.version,status:diagnostics.length?'FAIL':'PASS',diagnostics:diagnostics.map(d=>({code:d.code,file:d.file?.fileName,start:d.start,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')})),filesRead:compilerReads.size,sourceAlias:options.paths['arui-private/payment-masked-number']});
 write('TYPECHECK-INPUT-PINS.json',{files:Array.from(compilerReads.values())});
 await check('actual source typecheck: positive public API and five negative assignments',()=>assert.equal(diagnostics.length,0,JSON.stringify(read('TYPECHECK.json').diagnostics)));
 await check('compiler-read source/dependency pins unchanged after typecheck',()=>{for(const p of compilerReads.values())assert.deepEqual(pin(p.path),p);});
 await check('mapping scope preserves Draft/external code representation/no adoption',()=>{assert.equal(front.Ready,false);assert.equal(front.accepted,false);assert.equal(front.bindings[0].declaredInContract,false);assert.equal(front.bindings[0].runtimeAdmission,false);assert.equal(front.bindings[0].unmappedSemanticPorts.length,4);});
 current();
 write('CHECKS.json',{schemaVersion:'apollo.mapping-checks.v1',status:'PASS_SCOPED',checks,pass:checks.length,fail:0,scope:{actualReadOnlyFigmaCalls:2,syntheticAdapterChecks:true,actualFrontendProjector:true,sourceTypecheck:true,installedDistribution:false,browser:false,nativeGeneration:false,runtimeAdoption:false,Ready:false}});
 console.log(JSON.stringify({pass:checks.length,fail:0,typecheck:read('TYPECHECK.json').status,compilerPins:compilerReads.size}));
})().catch(e=>{if(!fs.existsSync(path.join(root,'FIRST-CHECK-FAILURE.json')))write('FIRST-CHECK-FAILURE.json',{message:e.message,stack:e.stack});console.error(e.stack);process.exitCode=1;});

