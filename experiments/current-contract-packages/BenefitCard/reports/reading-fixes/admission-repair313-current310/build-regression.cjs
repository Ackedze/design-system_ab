const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,pin,guard}=require('./guard.cjs');
(async()=>{
 const before=guard('before-private-core-regression-builds'),esbuild=require(W+'/projects/ComponentContractEditor/node_modules/esbuild'),jobs=[];
 for(const phase of ['baseline','candidate']){
  const repo=root+'/workspace/'+phase,C=repo+'/projects/Apollo-v3/packages/component-contract-core';
  for(const [name,entry,out,alias]of [
   ['bare-core',C+'/src/index.ts',C+'/dist/core.cjs'],['predicate',C+'/predicate/index.js',C+'/dist/predicate.cjs'],
   ['v4-profile',repo+'/projects/Apollo-v3/apps/apollo-v4/src/contract-profile.js',repo+'/projects/Apollo-v3/apps/apollo-v4/dist/profile.cjs',{
    '@apollo/representation-evidence':C+'/src/representation-evidence.ts','@apollo/component-contract-dependencies':C+'/src/component-dependencies.ts',
    '@apollo/member-collections':C+'/src/member-collections.ts','@apollo/component-contract-compiler':C+'/src/compiler.ts'}]]){
   fs.mkdirSync(path.dirname(out),{recursive:true});const result=await esbuild.build({absWorkingDir:repo,entryPoints:[entry],outfile:out,bundle:true,platform:'node',format:'cjs',target:['node18'],metafile:true,...(alias?{alias}:{})});
   const closure=Object.keys(result.metafile.inputs).map(p=>{const actual=path.resolve(repo,p);assert.ok(actual.startsWith(repo+'/'));return pin(actual);});
   jobs.push({phase,name,closure,metafile:result.metafile,output:pin(out)});
  }
 }
 const attempt=process.argv[2]||'01';assert.match(attempt,/^\d{2}$/);
 fs.writeFileSync(root+'/BUILD-CORE-REGRESSION-'+attempt+'.json',JSON.stringify({before,after:guard('after-private-core-regression-builds'),jobs})+'\n',{flag:'wx'});
 console.log(JSON.stringify({jobs:jobs.map(x=>({phase:x.phase,name:x.name,inputs:x.closure.length})),sharedWrites:0}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
