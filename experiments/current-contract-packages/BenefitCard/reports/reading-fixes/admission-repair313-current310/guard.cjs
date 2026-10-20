const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=__dirname,W='/Users/alexkukhta/Desktop/workplace';
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const grantPath=W+'/.local/apollo-general-2026-10-18/benefitcard-private-repair314/GRANT.json';
assert.equal(pin(grantPath).sha256,'9338ba9a748fa5f08a6b33c7ef2ffee12d8f6043f3f414e8982f8cda5eb11929');
const grant=JSON.parse(fs.readFileSync(grantPath)),inventory=JSON.parse(fs.readFileSync(grant.inputInventory.path));
function guard(phase){try{
 const extraPath=root+'/ADDITIONAL-AUDIT-INPUTS.json';assert.equal(pin(extraPath).sha256,'5d1435619c2ae3173072275e948f9765c1fe973edc86d3ff49a8af78313781be');
 for(const p of JSON.parse(fs.readFileSync(extraPath)).inputs)assert.deepEqual(pin(p.path),p,p.path);
 for(const p of [grant.proposal,grant.inputInventory,grant.readback,grant.review,grant.closedCandidate,grant.currentRuntimeDescriptor,...grant.currentAcceptance,grant.freshCatalog,...inventory.inputs,...inventory.runtimeInputs])assert.deepEqual(pin(p.path),p,p.path);
 for(const row of inventory.baselineFiles){const actual=pin(path.join(root,'workspace/baseline',row.relative));assert.equal(actual.sha256,row.input.sha256);assert.equal(actual.bytes,row.input.bytes);}
 return {phase,at:new Date().toISOString(),inputsExact:inventory.inputs.length,additionalAuditInputsExact:2,currentRuntimeExact:inventory.runtimeInputs.length,baselineFilesExact:inventory.baselineFiles.length,frozenCandidateFilesExact:inventory.candidateFiles.length};
}catch(error){const p=root+'/FIRST-INPUT-DRIFT.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({phase,error:error.stack})+'\n');throw error;}}
module.exports={root,W,pin,guard,grant};
