const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),context=JSON.parse(fs.readFileSync(path.join(__dirname,'figma-context.json'))),compiled=new Map();
function code(sections){return sections.map(s=>(assert.equal(s.type,'CODE'),s.code)).join('');}
function render(entry,changes={},variantIndex=0){
 const file=typeof entry==='string'?context.files.find(f=>f.path===entry):context.files[entry],native=context.roots.find(r=>r.id===file.id);const selected=structuredClone(file.isItem?native.tree.children[variantIndex]:native.tree);
 const normalize=n=>{n.properties=Object.fromEntries(Object.entries(n.properties||{}).map(([k,v])=>[k,v&&typeof v==='object'&&'value'in v?v.value:v]));for(const child of n.children||[])normalize(child);};normalize(selected);
 function setProps(node,props){for(const[k,v]of Object.entries(props||{})){const key=Object.keys(node.properties||{}).find(n=>n.split('#')[0]===k)||k;(node.properties??={})[key]=v;}}
 function alter(node,ch){setProps(node,ch.props);if(ch.hidden)node.visible=false;
  const walk=n=>{if(n.type==='TEXT'&&n.name==='Title'&&ch.question!==undefined)n.text=ch.question;if(n.type==='TEXT'&&n.name==='Subtitle'&&ch.answer!==undefined)n.text=ch.answer;if(n.name.includes('Style Level 1'))setProps(n,ch.style);for(const c of n.children||[])walk(c);};walk(node);
  if(ch.plateVisible!==undefined)for(const c of node.children||[])if(c.name.includes('BackgroundPlate'))c.visible=ch.plateVisible;
 }
 if(file.isItem)alter(selected,changes);else for(let i=0;i<selected.children.length;i++){
  const ch=changes.items?.[i]||{};if(ch.open!==undefined){const itemRoot=context.roots.find(r=>r.name===(file.family==='regular'?'FAQItem':file.family==='promo-desktop'?'[D][Promo] FAQItem':'[M][Promo] FAQItem'));const item=structuredClone(itemRoot.tree.children[Number(ch.open)]);normalize(item);selected.children[i].children=item.children;setProps(selected.children[i],{Open:ch.open?'True':'False'});if(file.family!=='regular')for(const c of selected.children[i].children||[])if(c.name.includes('BackgroundPlate'))c.visible=true;}
  alter(selected.children[i],ch);
 }
 if(file.isItem)for(const[k,d]of Object.entries(native.definitions))if(d.type==='BOOLEAN'&&!(k in selected.properties))selected.properties[k]=d.defaultValue;
 const calls=[];
 const figma={code(strings,...values){const sections=[];strings.forEach((s,i)=>{if(s)sections.push({type:'CODE',code:s});const v=values[i];if(Array.isArray(v))sections.push(...v.flatMap(p=>p?.sections??p));else if(v?.sections)sections.push(...v.sections);else if(v!==undefined&&v!=='')sections.push({type:'CODE',code:String(v)});});return{sections};}};
 function handle(n,ownerFile){return{type:n.type,name:n.name,textContent:n.text,symbolId:changes.wrongFamily?'foreign':context.roots.find(r=>r.name===(ownerFile.family==='regular'?'FAQItem':ownerFile.family==='promo-desktop'?'[D][Promo] FAQItem':'[M][Promo] FAQItem')).tree.children[n.properties?.Open==='True'?1:0].id,properties:Object.fromEntries(Object.entries(n.properties||{}).map(([k,value])=>[k,{value}])),
  getPropertyValue(name){const key=Object.keys(n.properties||{}).find(k=>k===name||k.split('#')[0]===name);if(!key)throw new Error('Unknown property '+name);return n.properties[key];},getEnum(name,map){return map[this.getPropertyValue(name)];},getBoolean(name){return this.getPropertyValue(name);},
  codeConnectId(){return changes.disconnected?null:'corp-faq-item-'+(changes.wrongFamily?'wrong':ownerFile.family);},
  hasCodeConnect(){return !changes.disconnected;},
  executeTemplate(){if(changes.nestedError)return{example:[{type:'ERROR',message:'leaf execution failed'}]};if(changes.nativePill)return{example:[{type:'INSTANCE',guid:n.id,symbolId:this.symbolId}]};const childFile=context.files.find(f=>f.isItem&&f.family===ownerFile.family),r=run(n,childFile);return{example:r.example.sections,metadata:r.metadata};},
  findLayers(fn,opts){assert.ok(Array.isArray(opts.path));calls.push({method:'findLayers',opts});const found=[];function walk(node,parents){for(const child of node.children||[]){if(child.visible===false)continue;let pos=0;for(const p of parents)if(opts.path[pos]===p)pos++;const matches=pos===opts.path.length;if((child.type==='TEXT'||child.type==='INSTANCE')&&matches){const h=handle(child,ownerFile);if(fn(h))found.push(h);}if(child.type!=='INSTANCE'||opts.traverseInstances)walk(child,[...parents,child.name]);}}walk(n,[]);return found;},
  findInstance(name,opts){return this.findLayers(node=>node.type==='INSTANCE'&&node.name===name,opts)[0]||{type:'ERROR'};}
 };}
 function run(n,f){const source=fs.readFileSync(path.join(root,f.path),'utf8');if(!compiled.has(source))compiled.set(source,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText);const exports={};vm.runInNewContext(compiled.get(source),{exports,require(name){assert.equal(name,'figma');return{...figma,selectedInstance:handle(n,f)};}});return exports.default;}
 return{...run(selected,file),calls};
}
module.exports={root,context,render,code};
