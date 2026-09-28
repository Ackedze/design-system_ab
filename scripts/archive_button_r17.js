#!/usr/bin/env node
// Immutable accepted inputs before palette authoring. Existing destinations are verified, never replaced.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','7e0248ed1ae1df9f261a189d1836021f664e7628696f0315a46d4db1190eb58f',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','bf84e102cec0dba3e7ca11004dc9b0c88fd22b52e98172735b94cc762633ecb4',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','f0efb642374da8ac71e1ec063ea57d08a3be1a13e397da28cb200a6b2389e2d7',true],
]) {
 const destination=path.join(root,'history/r17-editor-0.2.36',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error(`Acceptance hash mismatch: ${source}`);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log(`${exists?'Verified':'Archived'} ${name}`);
}
