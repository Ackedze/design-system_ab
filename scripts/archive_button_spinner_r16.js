#!/usr/bin/env node
// Preserve accepted inputs before the explicit ownership-policy opt-in.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
const qa=JSON.parse(fs.readFileSync(path.join(root,'qa/spinner-integration.2026-09-27.json')));
for(const [source,name,key,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','manual',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','compiled',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','compilerCore',true],
]) {
 const destination=path.join(root,'history/r16-editor-0.2.34',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==qa.artifacts[key].sha256)throw Error(`Hash mismatch: ${source}`);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log(`${exists?'Verified':'Archived'} ${name}`);
}
