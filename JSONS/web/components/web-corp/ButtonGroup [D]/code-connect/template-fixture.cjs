const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');const ts=require('typescript');
const root=path.resolve(__dirname,'..');const context=JSON.parse(fs.readFileSync(path.join(__dirname,'figma-context.json')));const compiled=new Map();
function render(platform,changes={},variantIndex=0){
 const index=platform==='desktop'?0:1,family=context.roots[index],v=family.variants[variantIndex];
 const values={...v.properties,...changes.root};const rows=structuredClone(v.children);
 for(const [i,r]of rows.entries()){
  const changed=changes.buttons?.[i]??{};for(const[k,value]of Object.entries(changed))r.properties[Object.keys(r.properties).find(x=>x.split('#')[0]===k)??k]=value;
  if(changes.hidden?.includes(i))r.visible=false;
  if(changes.labels)r.properties[Object.keys(r.properties).find(k=>k.startsWith('✎ Label'))]=changes.labels[i];
 }
 const calls=[];
 function handle(name,values){return{type:'INSTANCE',name,value(key){const k=Object.keys(values).find(k=>k===key||k.split('#')[0]===key);if(!k)throw new Error('Unknown fixture property: '+key);return values[k];},getEnum(k,map){return map[this.value(k)];},getBoolean(k){return this.value(k);},getPropertyValue(k){return this.value(k);},getString(k){return this.value(k);},findLayers(fn,opts){assert.equal(opts.traverseInstances,false);assert.equal(opts.path.length,0);calls.push({method:'findLayers',opts});return rows.filter(r=>r.visible&&r.type==='INSTANCE').map(r=>handle(r.name,r.properties)).filter(fn);}};}
 const figma={selectedInstance:handle(family.name,values),code(strings,...values){const sections=[];strings.forEach((s,i)=>{if(s)sections.push({type:'CODE',code:s});const v=values[i];if(Array.isArray(v))sections.push(...v.flatMap(p=>p?.sections??p));else if(v?.sections)sections.push(...v.sections);else if(v!==undefined&&v!=='')sections.push({type:'CODE',code:String(v)});});return{sections};}};
 const source=fs.readFileSync(path.join(root,context.files[index]),'utf8');if(!compiled.has(source))compiled.set(source,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText);const exports={};vm.runInNewContext(compiled.get(source),{exports,require(name){assert.equal(name,'figma');return figma;}});return{...exports.default,calls};
}
function code(sections){return sections.map(s=>(assert.equal(s.type,'CODE'),s.code)).join('');}
module.exports={root,context,render,code};
