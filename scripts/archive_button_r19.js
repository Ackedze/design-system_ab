#!/usr/bin/env node
// Immutable source before the owner's Spinner-only Loading clarification.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','76ef8821ecc3a3ee547bc6eef4a2a317fcecfc8aa8a934de6bc594df883e6f0d',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','d032b13cfb436f45270026980b4ffc60b405a9e3ab078a9e85fda02727afff75',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','4803de9b2ccabfac7c479575fb4b1178eb7bea8640450d009b74b7a2e2b68dae',true],
]) {
 const destination=path.join(root,'history/r19-editor-0.2.39',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error(`Acceptance hash mismatch: ${source}`);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log(`${exists?'Verified':'Archived'} ${name}`);
}
