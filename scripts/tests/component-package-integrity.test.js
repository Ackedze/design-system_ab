const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {validate}=require('../validate_current_contract_packages.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
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
