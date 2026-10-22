// Standalone repository integrity check. Semantic compilation is a separate Apollo integration gate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
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
 const mappingIds=new Set();
 const records=index.entries.concat(index.dependencySources).map(entry=>{
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
   assert.equal(pin.kind,'figma-generic');assert.equal(path.posix.dirname(pin.path),path.posix.join(path.posix.dirname(entry.manual.path),'mapping'));
   const mapping=JSON.parse(read(pin.path,pin));assert(Array.isArray(mapping.semantic?.mappings)&&mapping.semantic.mappings.length>0,'Empty mapping');
   for(const row of mapping.semantic.mappings)assert.equal(row.componentId,entry.componentId,'Foreign mapping owner');
   assert.deepEqual(mapping.manuals?.find(r=>r.manual?.component?.contractId===entry.contractId)?.manual,manual,'Mapping manual differs from canonical source');
   if(pin.provenance)read(pin.provenance.path,pin.provenance);
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
