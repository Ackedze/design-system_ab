#!/usr/bin/env node
// Immutable pre-integration acceptance artifacts. Re-running verifies bytes; never overwrites.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),workspace=path.resolve(repo,'../..');
const root=path.join(repo,'experiments/web-core/core');
const qa=JSON.parse(fs.readFileSync(path.join(root,'Spinner/qa/final-review.2026-09-27.json')));
for(const [source,destination,expected,gzip] of [
  [path.join(workspace,'projects/ComponentContractEditor/dist/core.cjs'),path.join(root,'Spinner/history/r8-editor-0.2.33/core.cjs.gz'),qa.sha256.compilerCore,true],
  [path.join(root,'Button/contract.manual.json'),path.join(root,'Button/history/r15-editor-0.2.33/contract.manual.json'),qa.sha256.buttonManual,false],
]){
  const exists=fs.existsSync(destination);
  const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error(`Acceptance hash mismatch: ${source}`);
  if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
  console.log(`${exists?'Verified':'Archived'} ${path.relative(repo,destination)}`);
}
