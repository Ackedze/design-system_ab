#!/usr/bin/env node
// Immutable inputs before Loading composition. Existing archives are verified, never replaced.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','c5063d576ad657d1cafe54b83fc1fa4eeddf2c7d0267cc7aec21a025f884ef07',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','4fbec3317cad2c4138a50a084095d033eeb24eed0c8a75972d2e6fe1f276d13f',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','2d2c51dc86c6bd7f1ed1dadcbee677b7f1df62f63d668a283d370cab7ed22a45',true],
]) {
 const destination=path.join(root,'history/r18-editor-0.2.38',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error(`Acceptance hash mismatch: ${source}`);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log(`${exists?'Verified':'Archived'} ${name}`);
}
