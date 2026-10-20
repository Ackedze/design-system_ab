const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {collect}=require('../collect_current_contract_packages');
test('the current component collection verifies all manifest-selected archives and derived indexes',async()=>{
 const root=path.resolve(__dirname,'../../experiments/current-contract-packages'),before=fs.readFileSync(path.join(root,'manifest.json'));
 const manifest=await collect(true);
 assert.equal(manifest.normative,false);assert.equal(manifest.canonicalSourcesRemainInPlace,true);
 assert.equal(manifest.packages.length,14);
 for(const entry of manifest.packages){assert(entry.file.startsWith(entry.name.split('.')[0]+'/'));assert(fs.existsSync(path.join(root,entry.file)));}
 assert.equal(manifest.packages.find(p=>p.name==='CorporateContent.mobile-web').file,'CorporateContent/mobile-web/CorporateContent.mobile-web.component-contract.zip');
 assert.equal(fs.readdirSync(root).filter(n=>n.endsWith('.zip')).length,0);
 assert.deepEqual(fs.readFileSync(path.join(root,'manifest.json')),before,'Verification must not replace the current index.');
});
