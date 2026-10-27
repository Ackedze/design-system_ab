const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.dirname(path.dirname(A)),B=W+'/.local/apollo-main';
const payload=require('os').tmpdir()+'/apollo-input-source-'+process.pid;fs.mkdirSync(payload);const delivery=JSON.parse(fs.readFileSync(R+'/DELIVERY.json'));require(W+'/.local/apollo-proxy-main/scripts/git-data-cli').extractSnapshot(delivery.archive,payload);
const read=p=>JSON.parse(fs.readFileSync(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const {fixture}=require(B+'/tests/document-audit.test.js');
const f=fixture(),bytes=fs.readFileSync(W+'/projects/Apollo/dist/code.js'),code=bytes.toString(),at=code.lastIndexOf('\n})();'),ctx={figma:f.api,__html__:'',TextEncoder,setTimeout,clearTimeout};
assert(at>0);vm.runInNewContext(code.slice(0,at)+'\nglobalThis.__runtime=runtime;'+code.slice(at),ctx);
try{
 const manifest=read(payload+'/manifest.json'),rows=[];
 for(const cid of ['web-core.input','web-core.number-input','web-core.amount-input','web-core.select']){
  const entry=manifest.contracts.find(c=>c.componentId===cid);assert(entry);const source=read(payload+'/'+entry.file);
  const loaded=ctx.__runtime.loadAuthoringSource(source,{evaluationMode:'authoring-preview'});assert.equal(ctx.__runtime.contractHash(loaded.contract),entry.contractHash);
  const bad=structuredClone(source);bad.projectionStamp.compiledHash='0'.repeat(64);assert.throws(()=>ctx.__runtime.loadAuthoringSource(bad,{evaluationMode:'authoring-preview'}),/не воспроизводят/);
  rows.push({componentId:cid,revision:entry.revision,sourceLoad:'PASS_ACTUAL_INSTALLED_MAIN_IN_VM',contractHash:entry.contractHash,tamperRejected:true});
 }
 const out={status:'PASS_SCOPED',installedCodeSha256:sha(bytes),checkingCount:32,rows,nativeApollo:'NOT_RUN_USER_ONLY',newDataInstalled:false,sourceOrRuntimeWrites:false};fs.writeFileSync(R+'/SOURCE-LOAD.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
}finally{f.emit('close');fs.rmSync(payload,{recursive:true});}
