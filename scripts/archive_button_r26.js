// Immutable r26 evidence before audit/specification scopes are introduced.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [source,name,hash,gzip] of [
 ['contract.manual.json','contract.manual.json','73efb7ab1866ddfddbb5184f898de54e18a08ac3dc374ea7d2e5ac746bfbf72b',false],
 ['compiled/component-contract.v2.json','component-contract.v2.json.gz','8813cedb754399a65ec27e64b85368eea06cf163016754f96e88ddde2933b33b',true],
 ['editor/Button.editor-input.zip','Button.editor-input.zip','5720dac220de725e828d074187491cd4f2f9e852166fe65b50df449c4f50a646',false],
]) {
 const target=path.join(root,'history/r26-editor-0.2.46',name),exists=fs.existsSync(target);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(target)):fs.readFileSync(target)):fs.readFileSync(path.join(root,source));
 if(digest(bytes)!==hash)throw Error('Baseline mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log('Verified r26 '+name);
}
