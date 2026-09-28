// Immutable baseline before paired transition evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','b26c3b9b472edb947bb3dc2b469da4b1d6f94f248c867b696eff4891e44b2829',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','c8fd38622faeb80a744fe7a1156a67da3af1bd686c783dff3d9fb38cde9ea285',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','427f9819f341d4789c3decfe185ea958afa7f741277fbe21c7e20641180ee21f',true],
]) {
 const destination=path.join(root,'history/r21-editor-0.2.40',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error('Baseline hash mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log((exists?'Verified ':'Archived ')+name);
}
