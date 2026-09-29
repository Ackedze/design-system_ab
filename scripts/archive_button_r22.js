// Immutable baseline before separating root sizing from internal geometry.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Button');
for(const [source,name,sha,gzip] of [
 [path.join(root,'contract.manual.json'),'contract.manual.json','674b2826e734a4b52439616b7d13f4e33287771b4f493e6bf491b20b736872f5',false],
 [path.join(root,'compiled/component-contract.v2.json'),'component-contract.v2.json.gz','fba5506bfa6f34b988f10746415845ce62c6249796c809633bb47ac58c1d8c85',true],
 [path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),'core.cjs.gz','fd8ab7e0a8670668c1786e5ffb383f770c5a9a8f3e7bfb245000b7a3ccfb36c5',true],
]) {
 const destination=path.join(root,'history/r22-editor-0.2.41',name),exists=fs.existsSync(destination);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(destination)):fs.readFileSync(destination)):fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha)throw Error('Baseline hash mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log((exists?'Verified ':'Archived ')+name);
}
