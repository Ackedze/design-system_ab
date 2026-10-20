const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,pin,guard}=require('./guard.cjs');
const phase=process.argv[2];assert.ok(['baseline','candidate'].includes(phase));
const repo=root+'/workspace/'+phase,E=repo+'/projects/ComponentContractEditor',C=repo+'/projects/Apollo-v3/packages/component-contract-core';
(async()=>{
 const before=guard('before-'+phase+'-build'),metafiles=[],esbuild=require(W+'/projects/ComponentContractEditor/node_modules/esbuild');
 for(const job of [{name:'core',entry:E+'/src/core/index.ts',out:E+'/dist/core.cjs',platform:'node',format:'cjs'},
  {name:'ui',entry:E+'/src/ui.ts',out:E+'/dist/ui.js',platform:'browser',format:'iife'},
  {name:'controller',entry:E+'/src/code.ts',out:E+'/dist/code.js',platform:'browser',format:'iife'}]){
  fs.mkdirSync(path.dirname(job.out),{recursive:true});
  const result=await esbuild.build({absWorkingDir:repo,entryPoints:[job.entry],outfile:job.out,bundle:true,platform:job.platform,format:job.format,target:['es2019'],metafile:true});
  const closure=Object.keys(result.metafile.inputs).map(p=>{const actual=path.resolve(repo,p);assert.ok(actual.startsWith(repo+'/'),actual);return pin(actual);});
  metafiles.push({name:job.name,closure,metafile:result.metafile,output:pin(job.out)});
 }
 const html=fs.readFileSync(E+'/src/ui.html','utf8').replace('/*__COMPONENT_CONTRACT_EDITOR_CSS__*/',fs.readFileSync(E+'/src/ui.css','utf8')).replace('/*__COMPONENT_CONTRACT_EDITOR_JS__*/',fs.readFileSync(E+'/dist/ui.js','utf8').replace(/<\/script/gi,'<\\/script'));
 fs.writeFileSync(E+'/dist/ui.html',html);
 const after=guard('after-'+phase+'-build');
 const attempt=process.argv[3]||'01';assert.match(attempt,/^\d{2}$/);
 fs.writeFileSync(root+'/BUILD-'+phase+'-'+attempt+'.json',JSON.stringify({before,after,metafiles,html:pin(E+'/dist/ui.html')})+'\n',{flag:'wx'});
 console.log(JSON.stringify({phase,closure:metafiles.map(j=>({name:j.name,inputs:j.closure.length})),sharedWrites:0}));
})().catch(error=>{const p=root+'/FIRST-BUILD-FAILURE.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({phase,error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
