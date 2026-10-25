const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {collect}=require('../collect_current_contract_packages');
test('the current component collection verifies all manifest-selected archives and derived indexes',async()=>{
 const root=path.resolve(__dirname,'../../experiments/current-contract-packages'),before=fs.readFileSync(path.join(root,'manifest.json'));
 const manifest=await collect(true);
 assert.equal(manifest.normative,false);assert.equal(manifest.canonicalSourcesRemainInPlace,true);
 assert.equal(manifest.packages.length,31);assert.equal(manifest.archivePathBase,'design-system_ab');
 const repo=path.resolve(root,'../..'),index=JSON.parse(fs.readFileSync(path.join(repo,'JSONS/indexes/component-contracts.index.json')));
 for(const entry of manifest.packages){const source=index.entries.find(e=>e.contractId===entry.contractId);assert(source);assert.equal(path.posix.dirname(entry.file),path.posix.join(path.posix.dirname(source.manual.path),'packages'));assert(fs.existsSync(path.join(repo,entry.file)));}
 assert.equal(manifest.packages.find(p=>p.name==='CorporateContent.mobile-web').file,'JSONS/web/components/web-corp/CorporateContent/mobile-web/packages/CorporateContent.mobile-web.component-contract.zip');
 assert.equal(index.dependencySources.length,3);
 assert.equal(fs.readdirSync(root).filter(n=>n.endsWith('.zip')).length,0);
 assert.deepEqual(fs.readFileSync(path.join(root,'manifest.json')),before,'Verification must not replace the current index.');
});
