const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.dirname(path.dirname(A)),read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return{path:path.relative(A,p),sha256:sha(b),bytes:b.length}};
const window=read(W+'/.local/apollo-general-coordination-2026-10-25/input-four-drafts-window-2026-10-26.json');
for(const p of [...window.inputPins,...window.sharedRegistryPins])assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'Input drift '+p.path);
const ip=A+'/JSONS/indexes/component-contracts.index.json',mp=A+'/experiments/current-contract-packages/manifest.json',index=read(ip),manifest=read(mp),before=structuredClone({index,manifest});
assert.equal(index.entries.length,31);assert.equal(manifest.packages.length,31);write(R+'/BEFORE.json',before);
const rows=[];
for(const name of ['Input','NumberInput','AmountInput','Select']){
 const o=path.join(R,name),s=read(o+'/summary.json'),m=read(o+'/contract.manual.json'),c=read(o+'/compiled.json'),d=A+'/JSONS/web/components/web-core/core/'+name,report=d+'/reports/draft-r1-2026-10-26';
 assert(!fs.existsSync(d+'/contract.manual.json'),'Do not replace an existing contract');fs.mkdirSync(report,{recursive:true});fs.mkdirSync(d+'/packages',{recursive:true});
 for(const f of ['contract.manual.json','variant-evidence.json'])fs.copyFileSync(o+'/'+f,d+'/'+f);
 for(const f of ['coverage-map.json','validation.json','eval.json','test-cases.json','summary.json'])fs.copyFileSync(o+'/'+f,report+'/'+f);
 const zip=d+'/packages/'+name+'.r1.draft.component-contract.zip';fs.renameSync(s.archive.path,zip);
 const archive=pin(zip),manual=pin(d+'/contract.manual.json'),facts=pin(d+'/variant-evidence.json');
 index.entries.push({name,componentId:s.componentId,contractId:s.componentId,revision:1,platform:'universal',archiveSha256:archive.sha256,manualSourceHash:s.manualSourceHash,compiledHash:s.compiledHash,sourceExportVersion:c.package.sourceExportVersion,manual,facts});
 manifest.packages.push({name,componentId:s.componentId,contractId:s.componentId,revision:1,file:archive.path,status:'draft',statusScope:'Draft: current-core compile/ZIP-reopen/targeted synthetic checks; fresh Apollo acceptance pending.',sourceRules:m.rules.length,ruleIR:c.rules.length,nonExecutableRules:c.nonExecutableRules.length,ruleStatuses:{draft:m.rules.length},zipSha256:archive.sha256,bytes:archive.bytes,manualSourceHash:s.manualSourceHash,manualEntrySha256:manual.sha256,compiledHash:s.compiledHash,zipIncludesHostCompiled:true,representations:m.representations.map(({id,kind,platform,status})=>({id,kind,platform,status})),dependencies:[],currentEvidence:'../../'+path.relative(A,report+'/eval.json')});
 const cases=read(report+'/test-cases.json').cases;fs.writeFileSync(report+'/README.md',['# '+name+' r1 — Draft','','Существующий Core 0.1.24. Новые Figma-экземпляры подготовлены, пользовательская проверка Apollo ожидается.','','| Компонент | Параметры | Ожидаем |','| --- | --- | --- |',...cases.map(t=>'| ['+t.caseId+']('+t.url+') | '+JSON.stringify(Object.fromEntries(Object.entries(t.properties).filter(([,v])=>v.type==='VARIANT').map(([k,v])=>[k,v.value])))+'; '+t.mutation+' | '+t.expectedViolations+' |'),'','[Coverage](coverage-map.json) · [Eval](eval.json)',''].join('\n'));
 rows.push({name,componentId:s.componentId,manual,archive,report:path.relative(A,report),tests:cases.length});
}
assert.deepEqual(index.entries.slice(0,31),before.index.entries);assert.deepEqual(index.dependencySources,before.index.dependencySources);assert.deepEqual(manifest.packages.slice(0,31),before.manifest.packages);
write(ip,index);manifest.authoringIndex={file:'../../JSONS/indexes/component-contracts.index.json',sha256:pin(ip).sha256,bytes:pin(ip).bytes};manifest.updatedAt=new Date().toISOString();write(mp,manifest);
write(R+'/APPLIED.json',{rows,existingPackagesPreserved:31,dependencySourcesPreserved:index.dependencySources.length,installed:false,pushed:false,coreChanged:false,proxyChanged:false});console.log(JSON.stringify({packages:35,newContracts:rows.map(r=>r.componentId)}));
