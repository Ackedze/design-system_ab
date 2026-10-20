const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',root=__dirname;
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const grantPath=W+'/.local/apollo-general-2026-10-17/benefitcard-private-prototype309/GRANT.json';
assert.equal(pin(grantPath).sha256,'764b9b34d5e9ae5d34d7e2fb35aeb74ff35b129bdb476e1c4546bde8f401aea0');
const grant=JSON.parse(fs.readFileSync(grantPath));
const proposal=JSON.parse(fs.readFileSync(root+'/PROPOSAL.json'));
const inputs=[...proposal.inputs,...JSON.parse(fs.readFileSync(root+'/SUPPLEMENTAL-INPUTS.json')).inputs,...JSON.parse(fs.readFileSync(root+'/TOOLCHAIN-INPUTS.json')).inputs];
function guard(phase){
 try{
  assert.deepEqual(pin(grant.proposal.path),grant.proposal);assert.deepEqual(pin(grant.currentRuntimeDescriptor.path),grant.currentRuntimeDescriptor);
  if(fs.existsSync(root+'/HISTORICAL-MODE.json')){
   const materialized=JSON.parse(fs.readFileSync(root+'/MATERIALIZATION.json'));
   for(const item of materialized.files){const p=pin(path.join(root,'workspace/baseline',item.relative));assert.equal(p.sha256,item.input.sha256);assert.equal(p.bytes,item.input.bytes);}
   const frozen=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;for(const item of frozen)assert.deepEqual(pin(item.copy.path),item.copy);
   const toolchain=inputs.filter(p=>p.path.includes('/node_modules/')||p.path==='/usr/local/bin/node');for(const p of toolchain)assert.deepEqual(pin(p.path),p);
   return {phase,at:new Date().toISOString(),mode:'HISTORICAL_FROZEN_308_ONLY',baselineInputsExact:materialized.files.length,frozenDataExact:frozen.length,toolchainExact:toolchain.length,currentAcceptance:false};
  }
  const runtime=JSON.parse(fs.readFileSync(grant.currentRuntimeDescriptor.path)).runtimeInputs;assert.equal(runtime.length,512);
  for(const p of [...inputs,...runtime])assert.deepEqual(pin(p.path),p,p.path);
  return {phase,at:new Date().toISOString(),acceptedInputs:164,additionalInputs:inputs.length-164,currentRuntimeInputs:512,exact:true};
 }catch(error){const p=root+'/FIRST-INPUT-DRIFT.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({phase,error:error.stack})+'\n');throw error;}
}
module.exports={W,root,inputs,pin,guard};
