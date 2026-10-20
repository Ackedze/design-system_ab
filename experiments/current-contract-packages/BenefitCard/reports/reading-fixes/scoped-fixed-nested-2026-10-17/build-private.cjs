const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {W,root,guard,pin}=require('./guard.cjs');
const phase=process.argv[2];assert.ok(['baseline','candidate'].includes(phase));
const repo=path.join(root,'workspace',phase),core=repo+'/projects/Apollo-v3/packages/component-contract-core';
const esbuild=require(W+'/projects/ComponentContractEditor/node_modules/esbuild');
(async()=>{
 const before=guard('before-'+phase+'-build'),metafiles=[];
 let jobs=[{name:'core',entry:core+'/src/index.ts',out:core+'/dist/core.cjs'},
  {name:'predicate',entry:core+'/predicate/index.js',out:core+'/dist/predicate.cjs'},
  {name:'capture',entry:core+'/src/figma-capture.ts',out:core+'/dist/capture.cjs'},
  {name:'editor',entry:repo+'/projects/ComponentContractEditor/src/core/index.ts',out:repo+'/projects/ComponentContractEditor/dist/core.cjs'},
  {name:'v4-profile',entry:repo+'/projects/Apollo-v3/apps/apollo-v4/src/contract-profile.js',out:repo+'/projects/Apollo-v3/apps/apollo-v4/dist/profile.cjs',alias:{
   '@apollo/representation-evidence':core+'/src/representation-evidence.ts','@apollo/component-contract-dependencies':core+'/src/component-dependencies.ts',
   '@apollo/member-collections':core+'/src/member-collections.ts','@apollo/component-contract-compiler':core+'/src/compiler.ts'}}];
 const selection=process.argv[3]||'all';assert.ok(['all','predicate','capture'].includes(selection));
 if(selection!=='all')jobs=jobs.filter(job=>job.name===selection);
 for(const job of jobs){
  fs.mkdirSync(path.dirname(job.out),{recursive:true});
  const result=await esbuild.build({absWorkingDir:repo,entryPoints:[job.entry],outfile:job.out,bundle:true,platform:'node',format:'cjs',target:['node18'],metafile:true,...(job.alias?{alias:job.alias}:{})});
  const closure=Object.keys(result.metafile.inputs).map(p=>{const absolute=path.resolve(repo,p);assert.ok(absolute.startsWith(repo+'/'),absolute);return pin(absolute);});
  metafiles.push({name:job.name,metafile:result.metafile,closure,output:pin(job.out)});
 }
 const after=guard('after-'+phase+'-build');fs.writeFileSync(root+'/BUILD-'+phase+(selection==='all'?'':'-'+selection)+'.json',JSON.stringify({before,after,toolchain:'pinned existing esbuild, no installation/network',metafiles})+'\n',{flag:'wx'});
 console.log(JSON.stringify({phase,inputs:metafiles.map(m=>({name:m.name,count:m.closure.length})),sharedWrites:0}));
})().catch(error=>{const f=root+'/FIRST-BUILD-FAILURE.json';if(!fs.existsSync(f))fs.writeFileSync(f,JSON.stringify({phase,error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
