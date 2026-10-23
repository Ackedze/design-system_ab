// Standalone repository integrity check. Semantic compilation is a separate Apollo integration gate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {projectComponentMapping}=require('./component-figma-mapping.cjs');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function validate(root=path.resolve(__dirname,'..')){
 root=fs.realpathSync(root);const pins=[];
 function read(file,pin){
  assert(typeof file==='string'&&!path.isAbsolute(file)&&!file.includes('\\')&&!file.split('/').some(s=>!s||s==='.'||s==='..'||/[<>:"|?*\x00-\x1f\x7f]/.test(s)),'Unsafe repository path');
  const target=path.join(root,file),stat=fs.lstatSync(target);assert(stat.isFile()&&!stat.isSymbolicLink()&&fs.realpathSync(target)===target&&stat.size<=64*1024*1024,'Unsafe repository file');
  const bytes=fs.readFileSync(target),digest=sha(bytes);
  if(pin)assert(digest===pin.sha256&&bytes.length===pin.bytes,'Stale repository file: '+file);
  pins.push({path:file,sha256:digest,bytes:bytes.length});return bytes;
 }
 const collection='experiments/current-contract-packages/',manifest=JSON.parse(read(collection+'manifest.json'));
 assert.equal(manifest.schemaVersion,'component-contract-package-collection.v1');
 assert(manifest.archivePathBase===undefined||manifest.archivePathBase==='design-system_ab','Unknown archive path base');
 assert.equal(manifest.authoringIndex?.file,'../../JSONS/indexes/component-contracts.index.json');
 const index=JSON.parse(read('JSONS/indexes/component-contracts.index.json',manifest.authoringIndex));
 assert.equal(index.schemaVersion,'apollo.component-contract-sources.v1');assert.equal(index.pathBase,'design-system_ab');
 assert(Array.isArray(manifest.packages)&&manifest.packages.length>0&&manifest.packages.length<=32);
 assert(Array.isArray(index.entries)&&Array.isArray(index.dependencySources)&&index.entries.length+index.dependencySources.length<=32);
 assert.equal(manifest.packages.length,index.entries.length);
 if(index.mappingSeed){
  const seed=index.mappingSeed;assert(/^[a-f0-9]{64}$/.test(seed.dataId),'Invalid mapping seed identity');
  assert.equal(seed.path,`apollo/data-packages/${seed.dataId}/contracts.tgz`);read(seed.path,seed);
 }
 const mappingIds=new Set(),sources=index.entries.concat(index.dependencySources);let acceptedSource;
 function acceptedMappingSource(){
  if(acceptedSource)return acceptedSource;
  const seed=index.mappingSeed;assert(seed?.generation?.native?.path,'Missing accepted mapping source');
  const member=file=>{
   assert(typeof file==='string'&&!path.isAbsolute(file)&&!file.includes('\\')&&!file.split('/').some(s=>!s||s==='.'||s==='..'||/[<>:"|?*\x00-\x1f\x7f]/.test(s)),'Unsafe archive member');
   return cp.execFileSync('tar',['-xzOf',path.join(root,seed.path),'./'+file],{maxBuffer:64*1024*1024});
  };
  const manifest=JSON.parse(member('manifest.json')),data={};assert.equal(manifest.id,seed.dataId,'Mapping source package identity mismatch');
  assert.deepEqual(Object.keys(seed.generation).sort(),Object.keys(manifest.generation).sort(),'Mapping source artifacts differ');
  for(const [key,pin]of Object.entries(seed.generation)){
   const {path:local,...original}=pin;assert.deepEqual(original,manifest.generation[key],'Mapping source artifact pin mismatch');
   const bytes=read(local,pin);assert.deepEqual(bytes,member(pin.file),'Mapping source bytes differ from accepted package');data[key]=JSON.parse(bytes);
  }
  acceptedSource={...data,manifest,member};return acceptedSource;
 }
 // Relocation evidence is separate from runtime mappings; never infer admission from its presence.
 function hasProducerPin(value,pin){
  if(!value||typeof value!=='object')return false;
  if(value.sha256===pin.sha256&&value.bytes===pin.bytes&&path.posix.basename(value.path||value.file||'')===path.posix.basename(pin.originPath))return true;
  return Object.values(value).some(v=>hasProducerPin(v,pin));
 }
 const records=sources.map(entry=>{
  for(const pin of [entry.manual,entry.facts])assert(pin?.path?.startsWith('JSONS/web/components/'),'Source outside component tree');
  const manual=JSON.parse(read(entry.manual.path,entry.manual));JSON.parse(read(entry.facts.path,entry.facts));
  assert.equal(manual.component?.contractId,entry.contractId);assert.equal(manual.component?.componentId,entry.componentId);assert.equal(manual.metadata?.revision,entry.revision);
  for(const key of ['createdAt','updatedAt'])assert(typeof manual.metadata[key]==='string'&&/^\d{4}-\d{2}-\d{2}(?:T.+)?$/.test(manual.metadata[key])&&Number.isFinite(Date.parse(manual.metadata[key])),'Missing/invalid manual '+key);
  if(entry.mappingSeedRecords){
   assert.equal(entry.mappingSeedRecords.dataId,index.mappingSeed?.dataId,'Mapping seed mismatch');
   assert(Array.isArray(entry.mappingSeedRecords.mappingIds));
   for(const id of entry.mappingSeedRecords.mappingIds){assert(typeof id==='string'&&id&&!mappingIds.has(id),'Duplicate mapping identity');mappingIds.add(id);}
  }
  for(const pin of entry.mappings||[]){
   assert(['figma-generic','figma-legacy'].includes(pin.kind),'Unknown current mapping kind');
   const mapping=JSON.parse(read(pin.path,pin));
   if(pin.kind==='figma-generic'){
    assert.equal(path.posix.dirname(pin.path),path.posix.join(path.posix.dirname(entry.manual.path),'mapping'));
    assert(Array.isArray(mapping.semantic?.mappings)&&mapping.semantic.mappings.length>0,'Empty mapping');
    for(const row of mapping.semantic.mappings)assert.equal(row.componentId,entry.componentId,'Foreign mapping owner');
    assert.deepEqual(mapping.manuals?.find(r=>r.manual?.component?.contractId===entry.contractId)?.manual,manual,'Mapping manual differs from canonical source');
   }
   if(pin.source||pin.kind==='figma-legacy'){
    assert.equal(pin.source?.dataId,index.mappingSeed?.dataId,'Current mapping source identity mismatch');assert.equal(pin.source.artifact,'native');
    const source=acceptedMappingSource();
    if(pin.kind==='figma-generic'){
     assert.equal(pin.source.projection,'component');
     assert.deepEqual(mapping,projectComponentMapping(source.native.genericMapping,entry.componentId),'Current mapping differs from accepted component projection');
    }else{
     assert.equal(pin.source.projection,'legacy-shared');assert.equal(pin.path,index.mappingSeed.generation.native.path,'Legacy wrapper must remain one shared copy');
     assert.deepEqual(mapping,source.native,'Legacy wrapper changed');
     const ids=source.semantic.mappings.filter(m=>m.componentId===entry.componentId).map(m=>m.mappingId);
     assert(ids.length>0&&!ids.some(id=>source.native.genericMapping.semantic.mappings.some(m=>m.mappingId===id)),'Legacy mapping selection invalid');
     assert.deepEqual(pin.source.mappingIds,ids,'Legacy mapping IDs differ');
     const contract=source.manifest.contracts.find(c=>c.componentId===entry.componentId);assert(contract&&contract.revision===entry.revision&&contract.manualSourceHash===entry.manualSourceHash,'Legacy contract source stale');
     assert.deepEqual(JSON.parse(source.member(contract.file)).manual,manual,'Legacy manual differs from canonical source');
    }
   }
   if(pin.provenance)read(pin.provenance.path,pin.provenance);
  }
  for(const pin of entry.mappingArtifacts||[]){
   assert(['figma-generic','frontend','figma-semantic','figma-typed','figma-targets'].includes(pin.kind),'Unknown mapping artifact kind');
   assert.equal(pin.runtimeAdoption,false,'Relocated evidence cannot admit runtime mappings');
   assert(['current-contract-candidate','historical-contract','retained-shared-evidence','superseded-evidence'].includes(pin.relationship),'Unknown mapping artifact relationship');
   assert(Array.isArray(pin.owners)&&pin.owners.includes(entry.componentId)&&new Set(pin.owners).size===pin.owners.length,'Wrong mapping artifact owners');
   assert(pin.owners.every(id=>sources.some(e=>e.componentId===id)),'Unknown mapping artifact owner');
   assert(sources.some(e=>pin.owners.includes(e.componentId)&&pin.path.startsWith(path.posix.dirname(e.manual.path)+'/mapping/')),'Mapping artifact outside owner folders');
   if(pin.relationship==='retained-shared-evidence')assert.equal(pin.sourceRevision,null);
   else{
    assert(Number.isInteger(pin.sourceRevision)&&pin.sourceRevision>0,'Missing mapping source revision');
    if(pin.relationship==='superseded-evidence')assert(pin.sourceRevision<=entry.revision&&pin.path.includes('/mapping/history/'),'Superseded mapping must stay in history');
    else if(pin.relationship==='historical-contract')assert(pin.sourceRevision<entry.revision&&pin.path.includes('/mapping/history/'),'Historical mapping must stay historical');
    else assert.equal(pin.sourceRevision,entry.revision,'Candidate revision differs from canonical source');
   }
   assert(typeof pin.originPath==='string'&&pin.originPath,'Missing mapping artifact origin');
   const mapping=JSON.parse(read(pin.path,pin));
   const rows=pin.kind==='figma-generic'?mapping.semantic?.mappings:pin.kind==='frontend'?mapping.bindings:pin.kind==='figma-semantic'?mapping.mappings:pin.kind==='figma-typed'?mapping.bindings:mapping.profiles;
   assert(Array.isArray(rows)&&rows.length>0,'Empty mapping artifact');
   if(['figma-generic','frontend','figma-semantic'].includes(pin.kind)){
    for(const row of rows)assert(pin.owners.includes(row.componentId),'Foreign mapping artifact owner');
    assert(pin.owners.every(id=>rows.some(row=>row.componentId===id)),'Mapping artifact owner has no binding');
   }
   if(pin.kind==='figma-generic'&&pin.sourceRevision!==null){
    const sourceManual=mapping.manuals?.find(r=>r.manual?.component?.contractId===entry.contractId)?.manual;
    assert.equal(sourceManual?.metadata?.revision,pin.sourceRevision,'Mapping source revision mismatch');
    if(pin.relationship==='current-contract-candidate')assert.deepEqual(sourceManual,manual,'Mapping candidate manual differs from canonical source');
   }
   const proof=JSON.parse(read(pin.provenance?.path,pin.provenance));assert(hasProducerPin(proof,pin),'Missing exact producer mapping pin');
   for(const companion of pin.companions||[]){assert.equal(path.posix.dirname(companion.path),path.posix.dirname(pin.path),'Mapping companion outside bundle');read(companion.path,companion);}
  }
  return{entry,manual};
 });
 const identities=new Set(),basenames=new Set(),files=new Set();
 for(const pkg of manifest.packages){
  const matches=records.slice(0,index.entries.length).filter(r=>r.entry.contractId===pkg.contractId&&r.entry.componentId===pkg.componentId&&r.entry.revision===pkg.revision&&r.entry.manualSourceHash===pkg.manualSourceHash&&r.entry.archiveSha256===pkg.zipSha256);
  assert.equal(matches.length,1,'Package/source identity mismatch');const {entry}=matches[0],id=JSON.stringify([entry.contractId,entry.platform]);
  assert(!identities.has(id),'Duplicate contract/platform');identities.add(id);
  assert(typeof pkg.file==='string'&&pkg.file.endsWith('.zip'),'Invalid ZIP path');
  if(manifest.archivePathBase)assert.equal(path.posix.dirname(pkg.file),path.posix.join(path.posix.dirname(entry.manual.path),'packages'),'ZIP must be beside canonical manual');
  const file=(manifest.archivePathBase?'':collection)+pkg.file,name=path.posix.basename(file);
  assert(!basenames.has(name)&&!files.has(file),'Duplicate ZIP');basenames.add(name);files.add(file);
  read(file,{sha256:pkg.zipSha256,bytes:pkg.bytes});
 }
 const draft=JSON.parse(read(collection+'draft-manifest.json'));
 assert.deepEqual(draft.packages,manifest.packages.filter(e=>e.status!=='ready'),'Draft index differs');
 assert.deepEqual(draft.authoringIndex,manifest.authoringIndex);assert.equal(draft.updatedAt,manifest.updatedAt);assert.equal(draft.archivePathBase,manifest.archivePathBase);
 return{manifest,index,records,pins};
}
if(require.main===module){try{const r=validate();console.log(JSON.stringify({packages:r.manifest.packages.length,dependencySources:r.index.dependencySources.length,scope:'repository-integrity',semanticCompilation:'separate Apollo integration gate'}));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={validate};
