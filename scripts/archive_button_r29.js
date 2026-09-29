// Immutable replay inputs before the accepted Spinner/ControlBlur r30 changes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
const dest=path.join(root,'history/r29-editor-0.2.51');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sources=[['contract.manual.json','contract.manual.json',false],['compiled/component-contract.v2.json','component-contract.v2.json.gz',true],['editor/Button.editor-input.zip','Button.editor-input.zip',false]];
if(!fs.existsSync(dest)&&JSON.parse(fs.readFileSync(path.join(root,sources[0][0]))).metadata.revision!==29)throw Error('Expected r29');
fs.mkdirSync(dest,{recursive:true});
const entries=sources.map(([source,name,gzip])=>{
 const target=path.join(dest,name),b=fs.existsSync(target)?(gzip?zlib.gunzipSync(fs.readFileSync(target)):fs.readFileSync(target)):fs.readFileSync(path.join(root,source));
 if(!fs.existsSync(target))fs.writeFileSync(target,gzip?zlib.gzipSync(b):b,{flag:'wx'});
 return {source,file:name,sha256:hash(b)};
});
const manifest=path.join(dest,'manifest.json');
if(fs.existsSync(manifest)){if(JSON.stringify(JSON.parse(fs.readFileSync(manifest)))!==JSON.stringify(entries))throw Error('Archive mismatch');}
else fs.writeFileSync(manifest,JSON.stringify(entries,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(entries));
