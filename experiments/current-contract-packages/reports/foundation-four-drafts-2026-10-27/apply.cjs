const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return{path:path.relative(A,p),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const window=read(R+'/input-inventory.json');for(const p of [...window.inputPins,...window.sharedRegistryBeforePins])assert.equal(pin(p.path).sha256,p.sha256,'Preimage drift '+p.path);
const proof=read(R+'/VERIFICATION.json');assert.equal(proof.status,'PASS_SCOPED');assert.equal(proof.rows.length,4);
const ip=A+'/JSONS/indexes/component-contracts.index.json',mp=A+'/experiments/current-contract-packages/manifest.json',index=read(ip),manifest=read(mp),before=structuredClone({index,manifest});
assert.equal(index.entries.length,35);assert.equal(manifest.packages.length,35);const rows=[];
for(const name of ['Text','List','SegmentedControl','Slider']){
 const out=R+'/'+name,dir=A+'/JSONS/web/components/web-core/core/'+name,s=read(out+'/summary.json'),m=read(out+'/contract.manual.json'),c=read(out+'/compiled.json'),report=dir+'/reports/draft-r1-2026-10-27';
 assert(!fs.existsSync(dir+'/contract.manual.json'),'Existing canonical manual '+name);assert(read(out+'/skill-technical/technical-report.json').valid);
 fs.mkdirSync(report,{recursive:true});fs.mkdirSync(dir+'/packages',{recursive:true});
 for(const n of ['contract.manual.json','variant-evidence.json'])fs.writeFileSync(dir+'/'+n,JSON.stringify(read(out+'/'+n))+'\n');
 for(const n of ['coverage-map.json','validation.json','eval.json','test-cases.json','summary.json','verification.json','README.md'])fs.copyFileSync(out+'/'+n,report+'/'+n);
 const zip=dir+'/packages/'+name+'.r1.draft.component-contract.zip';fs.copyFileSync(s.archive.path,zip);const archive=pin(zip),manual=pin(dir+'/contract.manual.json'),facts=pin(dir+'/variant-evidence.json');
 index.entries.push({name,componentId:s.componentId,contractId:s.componentId,revision:1,platform:'universal',archiveSha256:archive.sha256,manualSourceHash:s.manualSourceHash,compiledHash:s.compiledHash,sourceExportVersion:c.package.sourceExportVersion,manual,facts});
 manifest.packages.push({name,componentId:s.componentId,contractId:s.componentId,revision:1,file:archive.path,status:'draft',statusScope:name==='SegmentedControl'?'Bounded Draft: root baseline/public API/count/single Selected; nested Segment contract pending; fresh Apollo UI pending.':'Draft: current-core ZIP-reopen, native SDK capture and installed-main VM checks; fresh Apollo UI pending.',sourceRules:m.rules.length,ruleIR:c.rules.length,nonExecutableRules:c.nonExecutableRules.length,ruleStatuses:{draft:m.rules.length},zipSha256:archive.sha256,bytes:archive.bytes,manualSourceHash:s.manualSourceHash,manualEntrySha256:manual.sha256,compiledHash:s.compiledHash,zipIncludesHostCompiled:true,representations:m.representations.map(({id,kind,platform,status})=>({id,kind,platform,status})),dependencies:[],currentEvidence:'../../'+path.relative(A,report+'/eval.json')});
 rows.push({name,componentId:s.componentId,manual,facts,archive,report:path.relative(A,report)});
}
assert.deepEqual(index.entries.slice(0,35),before.index.entries);assert.deepEqual(index.dependencySources,before.index.dependencySources);assert.deepEqual(manifest.packages.slice(0,35),before.manifest.packages);
write(ip,index);manifest.authoringIndex={file:'../../JSONS/indexes/component-contracts.index.json',sha256:pin(ip).sha256,bytes:pin(ip).bytes};manifest.updatedAt=new Date().toISOString();write(mp,manifest);
write(R+'/APPLIED.json',{status:'CANONICAL_DRAFTS_WRITTEN',rows,existingPackagesPreserved:35,dependencySourcesUnchanged:true,delivery:'PENDING_CAPACITY',installed:false,pushed:false,coreChanged:false,proxyChanged:false});console.log({packages:39,newContracts:rows.map(r=>r.componentId)});
