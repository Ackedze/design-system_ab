// Preserve the accepted r27 package before introducing coordinated text layout.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
for(const [source,name,hash,gzip] of [
 ['contract.manual.json','contract.manual.json','8e8eea9606d0b4cffc8160b1c83b785c930a286cde5198ea5e3f3898c3cda973',false],
 ['compiled/component-contract.v2.json','component-contract.v2.json.gz','617a28ec5c3b8b377a67e4a0c8ea4ecd73d5695b3bb87a34c7a21982d92e6143',true],
 ['editor/Button.editor-input.zip','Button.editor-input.zip','976e99b4c60d5d9fa717709701b1e3e30e80e9b7beb2851b3ea099bdce38c091',false],
]) {
 const target=path.join(root,'history/r27-editor-0.2.47',name),exists=fs.existsSync(target);
 const bytes=exists?(gzip?zlib.gunzipSync(fs.readFileSync(target)):fs.readFileSync(target)):fs.readFileSync(path.join(root,source));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Baseline mismatch: '+source);
 if(!exists){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'});}
 console.log('Verified r27 '+name);
}
