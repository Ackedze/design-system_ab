// Immutable inputs before the compiler-only 0.2.49 correction; manual remains r28.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
for(const [source,name,hash,gzip] of [
 ['contract.manual.json','contract.manual.json','23e325ded61aadf2a9c9c4132b381195f3ddfe358a14dc2c860da72d07fef301',false],
 ['compiled/component-contract.v2.json','component-contract.v2.json.gz','0c8bcdb9e362244b1d0bcdb05c23bc827821026c37b90c0afd9e45a8a2f46f7c',true],
 ['editor/Button.editor-input.zip','Button.editor-input.zip','d5ac53f011c93123f82ce83e5bb28ae4d4930b6a43170794b86de44a1e527b52',false],
]) {
 const target=path.join(root,'history/r28-editor-0.2.48',name),exists=fs.existsSync(target);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(target)):fs.readFileSync(target)):fs.readFileSync(path.join(root,source));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Baseline mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log('Verified r28 '+name);
}
