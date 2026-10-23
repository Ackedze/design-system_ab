const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {validate}=require('../validate_current_contract_packages.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const {projectComponentMapping}=require('../component-figma-mapping.cjs'),cp=require('node:child_process');
function fixture(t){
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'component-integrity-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 function put(file,value){const bytes=Buffer.isBuffer(value)?value:Buffer.from(JSON.stringify(value)+'\n'),target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);return{path:file,sha256:sha(bytes),bytes:bytes.length};}
 const index={schemaVersion:'apollo.component-contract-sources.v1',pathBase:'design-system_ab',entries:[],dependencySources:[]};
 const manifest={schemaVersion:'component-contract-package-collection.v1',archivePathBase:'design-system_ab',updatedAt:'2026-10-22',packages:[]};
 for(const platform of ['desktop','mobile-web']){
  const dir='JSONS/web/components/Корпоративная библиотека/ButtonGroup [D]'+(platform==='mobile-web'?'/mobile-web':''),id='buttons.'+platform;
  const manual={component:{contractId:id,componentId:'shared-button-group'},metadata:{revision:3,createdAt:'2026-09-01',updatedAt:'2026-10-01T12:00:00.000Z'}};
  const zip=put(dir+'/packages/ButtonsGroup.'+platform+'.zip',Buffer.from('synthetic archive '+platform));
  const entry={contractId:id,componentId:'shared-button-group',platform,revision:3,manualSourceHash:'a'.repeat(64),archiveSha256:zip.sha256,manual:put(dir+'/contract.manual.json',manual),facts:put(dir+'/variant-evidence.json',{synthetic:true})};
  index.entries.push(entry);manifest.packages.push({contractId:id,componentId:entry.componentId,revision:3,manualSourceHash:entry.manualSourceHash,file:zip.path,zipSha256:zip.sha256,bytes:zip.bytes,status:'draft'});
 }
 function publish(){const pin=put('JSONS/indexes/component-contracts.index.json',index);manifest.authoringIndex={file:'../../JSONS/indexes/component-contracts.index.json',sha256:pin.sha256,bytes:pin.bytes};put('experiments/current-contract-packages/manifest.json',manifest);put('experiments/current-contract-packages/draft-manifest.json',{updatedAt:manifest.updatedAt,archivePathBase:manifest.archivePathBase,authoringIndex:manifest.authoringIndex,packages:manifest.packages.filter(e=>e.status!=='ready')});}
 publish();return{root,put,index,manifest,publish};
}
test('standalone check preserves both platforms sharing componentId and performs no writes',t=>{
 const f=fixture(t),before=fs.readFileSync(path.join(f.root,'experiments/current-contract-packages/manifest.json'));
 const r=validate(f.root);assert.equal(r.records.length,2);assert.deepEqual(r.records.map(r=>r.entry.platform),['desktop','mobile-web']);
 assert.deepEqual(fs.readFileSync(path.join(f.root,'experiments/current-contract-packages/manifest.json')),before);
});
test('wrong archive identity, stale facts, unsafe path, misplaced ZIP and index drift refuse intake',t=>{
 for(const kind of ['zip','facts','path','location','index']){
  const f=fixture(t);
  if(kind==='zip')fs.appendFileSync(path.join(f.root,f.manifest.packages[0].file),'tampered');
  if(kind==='facts')fs.appendFileSync(path.join(f.root,f.index.entries[0].facts.path),' ');
  if(kind==='path'){f.manifest.packages[0].file='../outside.zip';f.publish();}
  if(kind==='location'){f.manifest.packages[0].file='JSONS/web/components/Other/packages/current.zip';f.publish();}
  if(kind==='index')fs.appendFileSync(path.join(f.root,'JSONS/indexes/component-contracts.index.json'),' ');
  assert.throws(()=>validate(f.root),kind);
 }
});
test('source symlink, missing timestamp, duplicate identity and stale Draft refuse intake',t=>{
 for(const kind of ['symlink','date','duplicate','draft']){
  const f=fixture(t),entry=f.index.entries[0],manualFile=path.join(f.root,entry.manual.path);
  if(kind==='symlink'){fs.renameSync(manualFile,manualFile+'.moved');fs.symlinkSync(manualFile+'.moved',manualFile);}
  if(kind==='date'){const manual=JSON.parse(fs.readFileSync(manualFile));delete manual.metadata.updatedAt;entry.manual=f.put(entry.manual.path,manual);f.publish();}
  if(kind==='duplicate'){f.index.entries.push(f.index.entries[0]);f.manifest.packages.push(f.manifest.packages[0]);f.publish();}
  if(kind==='draft')f.put('experiments/current-contract-packages/draft-manifest.json',{});
  assert.throws(()=>validate(f.root),kind);
 }
});
test('standalone mapping is pinned to its owner/source/provenance; shared seed remains one exact input',t=>{
 const f=fixture(t),entry=f.index.entries[0],dir=path.posix.dirname(entry.manual.path)+'/mapping',manual=JSON.parse(fs.readFileSync(path.join(f.root,entry.manual.path)));
 const mapping={semantic:{mappings:[{mappingId:'synthetic.desktop',componentId:entry.componentId}]},manuals:[{manual}]};
 const provenance=f.put(dir+'/acceptance.json',{synthetic:true}),file=dir+'/figma-mapping.json';
 const pin=f.put(file,mapping);entry.mappings=[Object.assign({kind:'figma-generic',provenance},pin)];
 const id='b'.repeat(64),seed=f.put(`apollo/data-packages/${id}/contracts.tgz`,Buffer.from('synthetic shared archive pin'));
 f.index.mappingSeed=Object.assign({dataId:id},seed);entry.mappingSeedRecords={dataId:id,mappingIds:['synthetic.desktop'],relationship:'component-mapping'};f.publish();assert.equal(validate(f.root).records.length,2);
 mapping.semantic.mappings[0].componentId='foreign';Object.assign(entry.mappings[0],f.put(file,mapping));f.publish();assert.throws(()=>validate(f.root),/Foreign mapping owner/);
 mapping.semantic.mappings[0].componentId=entry.componentId;Object.assign(entry.mappings[0],f.put(file,mapping));f.publish();
 fs.appendFileSync(path.join(f.root,provenance.path),' ');assert.throws(()=>validate(f.root),/Stale repository file/);f.put(provenance.path,{synthetic:true});
 entry.mappingSeedRecords.dataId='c'.repeat(64);f.publish();assert.throws(()=>validate(f.root),/Mapping seed mismatch/);
 entry.mappingSeedRecords.dataId=id;f.publish();fs.appendFileSync(path.join(f.root,seed.path),' ');assert.throws(()=>validate(f.root),/Stale repository file/);
});
function retainedArtifact(f,entry,{kind='frontend',relationship='current-contract-candidate',revision=3,owners=[entry.componentId],mapping={bindings:[{componentId:entry.componentId}]},folder='r3'}={}){
 const dir=path.posix.dirname(entry.manual.path)+'/mapping/'+folder,file=dir+'/mapping.json';
 const pin=f.put(file,mapping),originPath='/historical/closed/mapping.json';
 const provenance=f.put(dir+'/SEAL.json',{writesClosed:true,files:[{...pin,path:originPath}]});
 const artifact={...pin,kind,owners,sourceRevision:revision,relationship,runtimeAdoption:false,originPath,provenance,companions:[]};
 entry.mappingArtifacts=[artifact];return artifact;
}
test('retained current candidates and historical files keep exact producer provenance without runtime admission',t=>{
 const f=fixture(t),entry=f.index.entries[0],manual=JSON.parse(fs.readFileSync(path.join(f.root,entry.manual.path)));
 retainedArtifact(f,entry,{kind:'figma-generic',mapping:{semantic:{mappings:[{componentId:entry.componentId}]},manuals:[{manual}]}});
 f.publish();assert.equal(validate(f.root).records.length,2);assert.equal(entry.mappingArtifacts[0].runtimeAdoption,false);
 const old=JSON.parse(JSON.stringify(manual));old.metadata.revision=2;
 retainedArtifact(f,entry,{kind:'figma-generic',relationship:'historical-contract',revision:2,folder:'history/r2',mapping:{semantic:{mappings:[{componentId:entry.componentId}]},manuals:[{manual:old}]}});
 f.publish();assert.equal(validate(f.root).records.length,2);assert.equal(validate(f.root).records[0].manual.metadata.revision,3);
});
test('a shared mapping is stored once and referenced by both actual owners',t=>{
 const f=fixture(t),first=f.index.entries[0],second=f.index.entries[1];second.componentId='sibling-owner';f.manifest.packages[1].componentId=second.componentId;
 const manual=JSON.parse(fs.readFileSync(path.join(f.root,second.manual.path)));manual.component.componentId=second.componentId;second.manual=f.put(second.manual.path,manual);
 const owners=[first.componentId,second.componentId],artifact=retainedArtifact(f,first,{relationship:'retained-shared-evidence',revision:null,owners,mapping:{bindings:owners.map(componentId=>({componentId}))}});
 second.mappingArtifacts=[artifact];f.publish();assert.equal(validate(f.root).records.length,2);
 assert.equal(first.mappingArtifacts[0].path,second.mappingArtifacts[0].path);
});
test('relocation refuses foreign owners, invented admission, stale provenance and false revision labels',t=>{
 for(const kind of ['foreign','unbound-owner','admission','proof','missing-pin','historical','revision','manual','companion','location']){
  const f=fixture(t),entry=f.index.entries[0],artifact=retainedArtifact(f,entry);
  if(kind==='foreign')Object.assign(artifact,f.put(artifact.path,{bindings:[{componentId:'foreign'}]}));
  if(kind==='unbound-owner'){
   const other=f.index.entries[1];other.componentId='known-but-unbound';f.manifest.packages[1].componentId=other.componentId;
   const manual=JSON.parse(fs.readFileSync(path.join(f.root,other.manual.path)));manual.component.componentId=other.componentId;other.manual=f.put(other.manual.path,manual);artifact.owners.push(other.componentId);
  }
  if(kind==='admission')artifact.runtimeAdoption=true;
  if(kind==='proof')fs.appendFileSync(path.join(f.root,artifact.provenance.path),' ');
  if(kind==='missing-pin')artifact.provenance=f.put(artifact.provenance.path,{writesClosed:true,files:[]});
  if(kind==='historical')artifact.relationship='historical-contract';
  if(kind==='revision')artifact.sourceRevision=4;
  if(kind==='manual'){
   const manual=JSON.parse(fs.readFileSync(path.join(f.root,entry.manual.path)));manual.metadata.updatedAt='2026-10-02';
   retainedArtifact(f,entry,{kind:'figma-generic',mapping:{semantic:{mappings:[{componentId:entry.componentId}]},manuals:[{manual}]}});
  }
  if(kind==='companion')artifact.companions=[f.put('elsewhere/support.json',{})];
  if(kind==='location')Object.assign(artifact,f.put('elsewhere/mapping.json',{bindings:[{componentId:entry.componentId}]}));
  f.publish();assert.throws(()=>validate(f.root),kind);
 }
});
function acceptedFixture(t,{legacy=false}={}){
 const f=fixture(t),first=f.index.entries[0],child=f.index.entries[1];child.componentId='sibling-owner';f.manifest.packages[1].componentId=child.componentId;
 const manuals=[first,child].map(entry=>{const manual=JSON.parse(fs.readFileSync(path.join(f.root,entry.manual.path)));manual.component.componentId=entry.componentId;entry.manual=f.put(entry.manual.path,manual);return{pin:{path:'shared/'+entry.componentId+'.json',sha256:entry.manual.sha256,bytes:entry.manual.bytes},manual};});
 const dependency=(entry,pins)=>({componentId:entry.componentId,revision:3,manualSemanticHash:entry.manualSourceHash,compiledSemanticHash:'c'.repeat(64),dependencyPins:pins});
 const source={semantic:{schemaVersion:'apollo.agent-figma-semantic-mapping.v1',Ready:false,mappings:[first,child].map((e,i)=>({mappingId:'map'+i,componentId:e.componentId,platform:'desktop',choices:['choice'+i]}))},typed:{schemaVersion:'apollo.agent-figma-typed-native-binding-input.v1',Ready:false,portCount:2,nativeSLOTCount:1,bindings:manuals.map((m,i)=>({mappingId:'map'+i,port:'body',type:i?'TEXT':'SLOT',normativeSource:{...m.pin,pointer:'/rules/0',RuleIDs:['rule'+i]}}))},profiles:{choices:[{id:'choice0'},{id:'choice1'}],profiles:[{choiceId:'choice0'},{mappingId:'map1',sourceChoices:['choice1']}],sourceDependencies:[dependency(first,[{componentId:child.componentId,revision:3,manualSourceHash:child.manualSourceHash,compiledHash:'c'.repeat(64)}]),dependency(child,[])],actualPartDefinitions:[]},targets:{profiles:[{choiceId:'choice0',targets:[]},{choiceId:'choice1',targets:[]}]},manuals,ruleLinks:{links:manuals.map((m,i)=>({RuleID:'rule'+i,rule:{ownership:{ownerId:m.manual.component.componentId}},source:{...m.pin,pointer:'/rules/0'}})).concat([{RuleID:'common',rule:{ownership:{ownerId:'common-policy'}},source:{path:'shared/common.json'}}])},denials:[{mappingId:'map0',port:'body',gap:'SYNTHETIC_KEEP_DENIAL'}]};
 const stage=path.join(f.root,'seed-stage');fs.mkdirSync(stage);
 const seedManifest={id:'b'.repeat(64),generation:{},contracts:[]},native={writesClosed:true,Ready:false,mappings:[{id:'legacy-choice'}],genericMapping:legacy?projectComponentMapping(source,child.componentId):source};
 const docs={native,semantic:source.semantic,mappings:[],ruleLinks:source.ruleLinks};
 for(const [key,value]of Object.entries(docs)){const file='generation/'+key+'.json',bytes=Buffer.from(JSON.stringify(value)+'\n');fs.mkdirSync(path.join(stage,'generation'),{recursive:true});fs.writeFileSync(path.join(stage,file),bytes);seedManifest.generation[key]={file,sha256:sha(bytes),bytes:bytes.length};}
 if(legacy){const file='components/parent.json';fs.mkdirSync(path.join(stage,'components'));fs.writeFileSync(path.join(stage,file),JSON.stringify({manual:manuals[0].manual}));seedManifest.contracts=[{componentId:first.componentId,revision:3,manualSourceHash:first.manualSourceHash,file}];}
 fs.writeFileSync(path.join(stage,'manifest.json'),JSON.stringify(seedManifest));const archive=path.join(f.root,'seed.tgz');cp.execFileSync('tar',['-czf',archive,'-C',stage,'.']);
 const seed=f.put('apollo/data-packages/'+seedManifest.id+'/contracts.tgz',fs.readFileSync(archive));
 f.index.mappingSeed={...seed,dataId:seedManifest.id,generation:{}};
 for(const [key,ref]of Object.entries(seedManifest.generation)){const local=f.put(path.posix.dirname(first.manual.path)+'/mapping/shared/'+key+'.json',fs.readFileSync(path.join(stage,ref.file)));f.index.mappingSeed.generation[key]={...ref,path:local.path};}
 const projected=projectComponentMapping(source,first.componentId),file=path.posix.dirname(first.manual.path)+'/mapping/figma-mapping.current.json';
 const pin=legacy?f.index.mappingSeed.generation.native:f.put(file,projected);
 first.mappings=[{kind:legacy?'figma-legacy':'figma-generic',path:pin.path,sha256:pin.sha256,bytes:pin.bytes,source:{dataId:seedManifest.id,artifact:'native',projection:legacy?'legacy-shared':'component',...(legacy?{mappingIds:['map0']}:{})}}];
 f.publish();return{...f,first,child,source,projected};
}
test('component projection preserves ownerless authority links, both profile shapes and dependency closure',t=>{
 const f=acceptedFixture(t),before=JSON.stringify(f.source),parent=projectComponentMapping(f.source,f.first.componentId),child=projectComponentMapping(f.source,f.child.componentId);
 assert.equal(parent.manuals.length,2);assert.equal(parent.profiles.sourceDependencies.length,2);assert.equal(parent.ruleLinks.links.length,2);assert.equal(parent.denials.length,1);
 assert.equal(child.profiles.profiles[0].mappingId,'map1');assert.equal(parent.typed.portCount,1);assert.equal(parent.typed.nativeSLOTCount,1);assert.equal(JSON.stringify(f.source),before);
 f.source.profiles.sourceDependencies.pop();assert.throws(()=>projectComponentMapping(f.source,f.first.componentId),/Stale mapping dependency/);
});
test('effective component files must match the accepted archive, even after repinning altered output',t=>{
 const f=acceptedFixture(t);assert.equal(validate(f.root).records.length,2);
 const mapping=f.first.mappings[0];f.projected.semantic.mappings[0].inventedProp=true;Object.assign(mapping,f.put(mapping.path,f.projected));f.publish();assert.throws(()=>validate(f.root),/accepted component projection/);
 delete f.projected.semantic.mappings[0].inventedProp;Object.assign(mapping,f.put(mapping.path,f.projected));f.publish();
 const ref=f.index.mappingSeed.generation.native;const bytes=Buffer.from(JSON.stringify({invented:true}));Object.assign(ref,{sha256:sha(bytes),bytes:bytes.length});fs.writeFileSync(path.join(f.root,ref.path),bytes);f.publish();assert.throws(()=>validate(f.root),/artifact pin mismatch/);
});
test('legacy references retain one exact shared wrapper and reject selection of another owner',t=>{
 const f=acceptedFixture(t,{legacy:true});assert.equal(validate(f.root).records.length,2);
 f.first.mappings[0].source.mappingIds=['map1'];f.publish();assert.throws(()=>validate(f.root),/Legacy mapping IDs differ/);
});
