'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const report=__dirname,DS=path.resolve(report,'../../../../..');
assert.equal(path.basename(DS),'design-system_ab');
if(fs.existsSync(path.join(report,'FINAL-SEAL.json')))throw Error('OUTPUT_CLOSED');
const installed='/Users/alexkukhta/Library/Application Support/ApolloProxyControl/proxy',runtimeRoot=path.join(installed,'runtime/apollo');
const canonical=path.join(DS,'JSONS/web/components/web-corp/PaymentMaskedNumber/mapping/figma-mapping.json');
const sourceReport=path.join(DS,'experiments/current-contract-packages/PaymentMaskedNumber/reports/mapping-r4-2026-10-22');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(name,x)=>fs.writeFileSync(path.join(report,name),JSON.stringify(x,null,2)+'\n'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=file=>{file=fs.realpathSync(file);const b=fs.readFileSync(file);return{path:file,sha256:sha(b),bytes:b.length};};
const pins=new Map(),remember=p=>{const item=pin(p);if(pins.has(item.path))assert.deepEqual(item,pins.get(item.path),'INPUT_DRIFT');pins.set(item.path,item);return item;};
const assertPins=()=>{for(const p of pins.values())assert.deepEqual(pin(p.path),p,'INPUT_DRIFT:'+p.path);};
const check=(name,fn)=>{fn();checks.push({name,status:'PASS'});},checks=[];
const dataDir=path.join(DS,'apollo/data-packages'),pointerFile=path.join(dataDir,'current.json'),beforePointer=read(pointerFile),pointerPin=pin(pointerFile),baseArchive=path.join(DS,beforePointer.snapshot.path),basePin=remember(baseArchive);
const selected=read(path.join(DS,'experiments/current-contract-packages/manifest.json')).packages.find(x=>x.componentId==='web-corp.payment-masked-number');
remember(path.join(DS,'experiments/current-contract-packages/manifest.json'));remember(canonical);remember(path.join(DS,'JSONS/web/components/web-corp/PaymentMaskedNumber/contract.manual.json'));
const runtimeManifest=read(path.join(runtimeRoot,'portable-runtime.json'));remember(path.join(runtimeRoot,'portable-runtime.json'));
for(const p of runtimeManifest.files){const item=remember(path.join(runtimeRoot,p.file));assert.equal(item.sha256,p.sha256,p.file);assert.equal(item.bytes,p.bytes,p.file);}
const {importDataPackage}=require(path.join(installed,'src/data-packages/import'));
const {readGenerationData}=require(path.join(installed,'src/data-packages'));
const {projectPortableData}=require(path.join(installed,'scripts/build-data-release'));
const {readRuntime,idOf}=require(path.join(installed,'src/data-release'));
const {projectFigmaAuthoring,admitFigmaComponent}=require(path.join(runtimeRoot,'src/generation/agent/figma/projection'));
const {createMappingAdapter}=require(path.join(runtimeRoot,'src/generation/agent/figma/mapping'));
for(const file of Object.keys(require.cache))if(file.startsWith(installed+'/'))remember(file);
const stateFile=path.join(path.dirname(installed),'data-releases/state.json'),stateBefore=pin(stateFile),state=read(stateFile);
let stage;
(async()=>{
 check('same installed runtime6c6, no code build required',()=>assert.equal(readRuntime(runtimeRoot).id,beforePointer.runtimeId));
 check('base archive checksum and size match Git index',()=>{assert.equal(basePin.sha256,beforePointer.snapshot.sha256);assert.equal(basePin.bytes,beforePointer.snapshot.bytes);});
 check('source revision4 and installed current base match',()=>{assert.equal(selected.revision,4);assert.equal(state.current.dataId,beforePointer.snapshot.dataId);});
 const sourceSeal=read(path.join(sourceReport,'FINAL-SEAL.json'));
 for(const name of ['payment-masked-number.figma-mapping.json','contract.manual.json','rule-links.json','evidence/native-evidence.json']){
  const p=sourceSeal.files.find(p=>p.path===path.join(sourceReport,name));const actual=remember(p.path);assert.deepEqual(actual,p);
 }
 check('closed Figma source evidence pins and current canonical manual match',()=>{const x=read(canonical);assert.deepEqual(x.manuals[0].manual,read(path.join(DS,'JSONS/web/components/web-corp/PaymentMaskedNumber/contract.manual.json')));assert.equal(x.profiles.sourceDependencies[0].revision,4);});
 stage=fs.mkdtempSync(path.join(report,'.stage-'));
 // Stage only the existing public contract snapshot, never installed knowledge or SDK.
 const input=path.join(stage,'input');fs.mkdirSync(input);
 const unpack=String.raw`import pathlib,tarfile,sys
archive,dest=sys.argv[1:];root=pathlib.Path(dest)
with tarfile.open(archive,'r:gz') as t:
 members=t.getmembers()
 assert len(members)<2000
 assert sum(m.size for m in members)<128*1024*1024
 for m in members:
  if m.name in ('.','./'):continue
  name=m.name.removeprefix('./');p=pathlib.PurePosixPath(name)
  assert not p.is_absolute() and '..' not in p.parts
  assert not any(q.startswith('._') for q in p.parts)
  assert m.isfile() or m.isdir()
  f=root/p
  if m.isdir():f.mkdir(parents=True,exist_ok=True)
  else:
   f.parent.mkdir(parents=True,exist_ok=True)
   with open(f,'xb') as out:out.write(t.extractfile(m).read())
`;
 cp.execFileSync('python3',['-c',unpack,baseArchive,input]);
 const old=readGenerationData({root:input,apolloRoot:runtimeRoot}),oldIndex=structuredClone(old.index),mappingId='arui-private.payment-masked-number.universal';
 check('base package read by actual installed consumer',()=>{assert.equal(old.index.id,beforePointer.snapshot.dataId);assert.equal(old.contracts.length,12);old.assertCurrent();});
 write('INPUT-PINS.json',{files:Array.from(pins.values()),basePointer:pointerPin,installedStateBefore:stateBefore,installedRuntimeId:readRuntime(runtimeRoot).id,canonicalMapping:pin(canonical)});
 // Validate the PMN delta with the existing importer, then preserve the accepted
 // baseline verbatim. This avoids reimporting unused historical provenance.
 assertPins();
 const deltaRoot=path.join(stage,'delta'),empty={
  semantic:{schemaVersion:'apollo.agent-figma-semantic-mapping.v1',mappings:[],Ready:false},
  typed:{schemaVersion:'apollo.agent-figma-typed-native-binding-input.v1',bindings:[],Ready:false},
  profiles:{sourceDependencies:[],profiles:[],choices:[],actualPartDefinitions:[],Ready:false},
  targets:{profiles:[],Ready:false},manuals:[],ruleLinks:{schemaVersion:'apollo.agent-rule-links.v1',links:[]},denials:[]
 };
 const seed={native:{schemaVersion:old.native.schemaVersion,sourceHash:old.native.sourceHash,writesClosed:true,Ready:false,status:'DATA_DELTA',mappings:[],ports:{},genericMapping:empty},semantic:empty.semantic,mappings:[],ruleLinks:empty.ruleLinks};
 const archivePath=path.join(DS,'experiments/current-contract-packages',selected.file);remember(archivePath);
 const result=await importDataPackage({root:deltaRoot,apolloRoot:runtimeRoot,packages:[archivePath],figma:[canonical],seed});
 const delta=readGenerationData({root:deltaRoot,apolloRoot:runtimeRoot});
 check('standalone PMN delta accepted by existing importer',()=>{assert.equal(delta.contracts.length,1);assert.equal(delta.contracts[0].entry.revision,4);});
 function copyData(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())copyData(file);else if(e.name!=='manifest.json'&&['.json','.zip'].includes(path.extname(file))){const dest=path.join(input,path.relative(deltaRoot,file));if(fs.existsSync(dest))assert(fs.readFileSync(dest).equals(fs.readFileSync(file)));else{fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);}}}}
 copyData(deltaRoot);
 const raw=(base,index,key)=>read(path.join(base,index.generation[key].file)),native=raw(input,oldIndex,'native'),semantic=raw(input,oldIndex,'semantic'),deltaNative=raw(deltaRoot,delta.index,'native'),incoming=deltaNative.genericMapping,current=native.genericMapping;
 assert(!semantic.mappings.some(m=>m.mappingId===mappingId),'PMN_ALREADY_MAPPED');
 current.semantic.mappings.push(...incoming.semantic.mappings);current.typed.bindings.push(...incoming.typed.bindings);
 if('portCount' in current.typed)current.typed.portCount=current.typed.bindings.length;
 for(const key of ['choices','profiles','sourceDependencies'])current.profiles[key].push(...incoming.profiles[key]);
 for(const part of incoming.profiles.actualPartDefinitions){const prev=current.profiles.actualPartDefinitions.find(v=>v.key===part.key);if(prev)assert.deepEqual(prev,part,'SHARED_PART_CONFLICT');else current.profiles.actualPartDefinitions.push(part);}
 current.targets.profiles.push(...incoming.targets.profiles);current.manuals.push(...incoming.manuals);current.ruleLinks.links.push(...incoming.ruleLinks.links);current.denials.push(...incoming.denials);
 native.mappings.push(...deltaNative.mappings);semantic.mappings.push(...incoming.semantic.mappings);
 const putJSON=value=>{const bytes=Buffer.from(JSON.stringify(value)+'\n'),digest=sha(bytes),relative='generation/'+digest+'.json';fs.writeFileSync(path.join(input,relative),bytes,{flag:'wx'});return{file:relative,sha256:digest,bytes:bytes.length};};
 const combined=structuredClone(oldIndex);combined.generation.native=putJSON(native);combined.generation.semantic=putJSON(semantic);
 combined.catalog.find(c=>c.componentId==='web-corp.payment-masked-number').figma=delta.index.catalog[0].figma;
 combined.id=idOf(combined);fs.writeFileSync(path.join(input,'manifest.json'),JSON.stringify(combined,null,2)+'\n');
 write('DELTA-IMPORT.json',{status:'PASS',standaloneDataId:result.dataId,existingContractsPreserved:true,unchangedLegacyRuleLinksPin:oldIndex.generation.ruleLinks,method:'Existing importer validates the single-component delta. Data-only merge preserves every baseline contract and unchanged legacy provenance byte-for-byte; actual reader validates the combined package.'});
 const portable=path.join(stage,'portable'),projected=await projectPortableData({dataRoot:input,runtimeRoot,output:portable});
 const data=readGenerationData({root:portable,apolloRoot:runtimeRoot});
 check('new portable package actual reader accepts Figma mapping',()=>{assert.equal(data.index.id,projected.index.id);assert.equal(data.contracts.length,12);assert(data.semantic.mappings.some(m=>m.mappingId===mappingId));});
 check('all12 contract pins, RuleIR and revisions unchanged',()=>assert.deepEqual(data.index.contracts,oldIndex.contracts));
 check('PMN4 catalog Figma connected, checking retained',()=>{const row=data.index.catalog.find(r=>r.componentId==='web-corp.payment-masked-number');assert.equal(row.figma.status,'connected');assert.equal(row.checking.status,oldIndex.catalog.find(r=>r.componentId===row.componentId).checking.status);});
 check('all11 other catalog records unchanged',()=>{for(const row of oldIndex.catalog)if(row.componentId!=='web-corp.payment-masked-number')assert.deepEqual(data.index.catalog.find(x=>x.componentId===row.componentId),row);});
 check('frontend excluded and portable delivery capability gates retained',()=>{assert.equal(data.frontend,null);assert(!data.index.generation.frontend);assert(!data.index.generation.bindings);assert.equal(data.index.capabilities.frontend,false);assert.equal(data.index.capabilities.figmaMcp,true);assert.equal(data.index.Ready,false);});
 check('legacy prompt index and global RuleID pins unchanged',()=>{assert.deepEqual(data.index.generation.mappings,oldIndex.generation.mappings);assert.deepEqual(data.index.generation.ruleLinks,oldIndex.generation.ruleLinks);});
 
 check('semantic delta adds exactly one PMN mapping',()=>{assert.equal(data.semantic.mappings.length,old.semantic.mappings.length+1);assert.deepEqual(data.semantic.mappings.filter(m=>m.mappingId!==mappingId),old.semantic.mappings);});
 check('all previous native choices unchanged; exactly one public PMN root added',()=>{assert.equal(data.native.mappings.length,old.native.mappings.length+1);assert.deepEqual(data.native.mappings.filter(c=>c.id!=='paymentmaskednumber.universal'),old.native.mappings);});
 const records=data.native.genericMapping,adapter=createMappingAdapter(records),pmn=records.semantic.mappings.find(m=>m.mappingId===mappingId);
 check('all five typed PMN ports carried with exact authority',()=>{assert.equal(records.typed.bindings.filter(b=>b.mappingId===mappingId).length,5);for(const p of Object.keys(pmn.ports))assert.equal(adapter.port(mappingId,p).port,p);});
 for(const platform of ['desktop','mobile-web']){
  const packet=projectFigmaAuthoring(data.prompt(platform),records,{manualReferences:true});
  check('actual authoring projection exposes PMN to MCP on '+platform,()=>{assert(packet.mappings.some(m=>m.id===mappingId&&m.target==='figma'));assert.equal(packet.contracts.find(c=>c.pin.componentId===pmn.componentId).pin.revision,4);});
  check('actual MCP target and admission accept PMN on '+platform,()=>{const n={id:'pmn-test',kind:'component',mappingId,props:{maskNumber:'False',addonVisible:false,addonPreset:'StatusBadge'},slots:{}};assert.equal(admitFigmaComponent(n,packet,platform).choice.id,'paymentmaskednumber.universal');assert.deepEqual(data.owned.targets.componentTarget(n,platform).issues,[]);data.owned.targets.assertMcpComposition({platform,nodes:[n]});});
 }
 check('actual admission rejects BOOLEAN/VARIANT type confusion and placeholder',()=>{for(const props of [{maskNumber:true},{addonVisible:'True'},{addonPreset:'SwapMe'}])assert.throws(()=>adapter.select({mappingId,props},'desktop'),/FIGMA_PROPERTY_NOT_ADMITTED/);});
 check('actual data reader rejects stale checksum before use',()=>{const bad=structuredClone(data.index);bad.generation.native.sha256='0'.repeat(64);bad.id=idOf(bad);assert.throws(()=>readGenerationData({root:portable,apolloRoot:runtimeRoot,index:bad}),e=>e.code==='DATA_PACKAGE_STALE');});
 data.assertCurrent();assertPins();
 const listed=[];
 function walk(p){for(const item of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,item.name);if(item.isDirectory())walk(f);else{assert(item.isFile()&&!item.isSymbolicLink());assert(['.json','.zip'].includes(path.extname(f)));listed.push(path.relative(portable,f));}}}
 walk(portable);
 check('delivery contains contract JSON/ZIP only, no frontend or executable SDK',()=>{assert(listed.includes('manifest.json'));assert(!listed.some(p=>p.startsWith('knowledge/')||/\.(js|cjs|ts|tsx)$/.test(p)));});
 const stagedArchive=path.join(stage,'contracts.tgz');
 cp.execFileSync('/usr/bin/tar',['-czf',stagedArchive,'-C',portable,'.'],{env:Object.assign({},process.env,{COPYFILE_DISABLE:'1'})});
 const verifyRoot=path.join(stage,'verify');fs.mkdirSync(verifyRoot);cp.execFileSync('python3',['-c',unpack,stagedArchive,verifyRoot]);
 const fresh=readGenerationData({root:verifyRoot,apolloRoot:runtimeRoot});
 check('packed archive reopen passes actual installed reader and PMN catalog',()=>{assert.equal(fresh.index.id,data.index.id);assert.equal(fresh.index.catalog.find(r=>r.componentId===pmn.componentId).figma.status,'connected');fresh.assertCurrent();});
 check('installed data state and runtime remain untouched during preparation',()=>{assert.deepEqual(pin(stateFile),stateBefore);assert.equal(readRuntime(runtimeRoot).id,beforePointer.runtimeId);});
 assertPins();assert.deepEqual(pin(pointerFile),pointerPin,'GIT_POINTER_DRIFT');
 const output=path.join(dataDir,data.index.id);
 fs.mkdirSync(output,{recursive:false});const finalArchive=path.join(output,'contracts.tgz');fs.copyFileSync(stagedArchive,finalArchive);
 const packedPin=pin(finalArchive);fs.writeFileSync(path.join(output,'SHA256SUMS'),packedPin.sha256+'  contracts.tgz\n',{flag:'wx'});
 const next={schemaVersion:beforePointer.schemaVersion,runtimeId:beforePointer.runtimeId,snapshot:{path:path.relative(DS,finalArchive),sha256:packedPin.sha256,dataId:data.index.id,bytes:packedPin.bytes}};
 write('BASE-INDEX.json',beforePointer);write('NEXT-INDEX.json',next);
 // Current pointer is the last shared write; the archive is immutable and already read back.
 const pending=pointerFile+'.pmn-next';fs.writeFileSync(pending,JSON.stringify(next,null,2)+'\n',{flag:'wx'});fs.renameSync(pending,pointerFile);
 check('Git pointer readback selects new immutable verified archive',()=>assert.deepEqual(read(pointerFile),next));
 assertPins();
 write('CHECKS.json',{status:'PASS_SCOPED',pass:checks.length,fail:0,checks,nativeGeneration:false,modelCalls:0,proxyCodeWrites:0,runtimeChanged:false,installedDataChanged:false,Ready:false});
 write('RESULT.json',{status:'PREPARED_FOR_GIT',baseCommit:'e80f53c3f2bbf7c0bc3febc5df1392ec799045ae',baseDataId:beforePointer.snapshot.dataId,dataId:data.index.id,runtimeId:beforePointer.runtimeId,revision:4,contracts:12,unchangedContracts:12,mappingId,canonicalMapping:pin(canonical),archive:packedPin,pointer:pin(pointerFile),beforeGeneration:oldIndex.generation,afterGeneration:data.index.generation,figmaConnection:'connected',frontendEnabled:false,deliveryProfile:data.index.deliveryProfile,files:listed.length,checks:checks.length,sourceReaderPins:Array.from(pins.values()),installedStateUnchanged:true,liveNativeAcceptance:false,Ready:false});
 write('FINAL-PACKAGE-MANIFEST.json',fresh.index);
 fs.rmSync(stage,{recursive:true});stage=null;
 console.log(JSON.stringify({dataId:data.index.id,archive:path.relative(DS,finalArchive),bytes:packedPin.bytes,checks:checks.length,contracts:12,figma:'connected',runtimeUnchanged:true}));

})().catch(e=>{if(!fs.existsSync(path.join(report,'FIRST-FAILURE.json')))write('FIRST-FAILURE.json',{message:e.message,code:e.code,stack:e.stack,checks,stage});console.error(e.stack);process.exitCode=1;});

