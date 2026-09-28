// Immutable baseline before configured/effective visibility separation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','a05314227d3efa630a78ba999543fed5a33fdd4d7008cbb96662d3b2aaec2e62',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','08d5039171d7ce7f2d8939a73a1f07bdc981f7d7bf1eb36c73eb1d9e643fbce1',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','4803de9b2ccabfac7c479575fb4b1178eb7bea8640450d009b74b7a2e2b68dae',true],
]) {
 const destination=path.join(root,'history/r20-editor-0.2.39',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error('Baseline hash mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log((exists?'Verified ':'Archived ')+name);
}
