const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=__dirname,W='/Users/alexkukhta/Desktop/workplace';
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const grantPath=W+'/.local/apollo-general-2026-10-18/benefitcard-private-admission312/GRANT.json';
assert.equal(pin(grantPath).sha256,'aadb98117e83b613716cfb15ff94742d335c7c812ec26ef4d1020caaac416cf2');
const grant=JSON.parse(fs.readFileSync(grantPath)),inventory=JSON.parse(fs.readFileSync(grant.inputInventory.path));
function guard(phase){try{
 for(const p of [grant.proposal,grant.inputInventory,grant.currentRuntimeDescriptor,...grant.currentAcceptance,grant.freshCatalog,...inventory.inputs,...inventory.runtimeInputs,...JSON.parse(fs.readFileSync(root+'/ADDITIONAL-INPUTS.json')).inputs])assert.deepEqual(pin(p.path),p,p.path);
 const material=JSON.parse(fs.readFileSync(root+'/MATERIALIZATION.json')).files;
 for(const p of material){const actual=pin(path.join(root,'workspace/baseline',p.relative));assert.equal(actual.sha256,p.input.sha256);assert.equal(actual.bytes,p.input.bytes);}
 return {phase,at:new Date().toISOString(),sourceInputsExact:166,currentRuntimeExact:509,baselineFilesExact:material.length,additionalInputsExact:JSON.parse(fs.readFileSync(root+'/ADDITIONAL-INPUTS.json')).inputs.length};
}catch(error){const p=root+'/FIRST-INPUT-DRIFT.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({phase,error:error.stack})+'\n');throw error;}}
module.exports={root,W,pin,guard,grant};
