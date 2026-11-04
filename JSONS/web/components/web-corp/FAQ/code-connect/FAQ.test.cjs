const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');const {test}=require('node:test');
const {root,context,render,code}=require('./template-fixture.cjs'),{checkSnippets}=require('./check-source-api.cjs');const sourceRoot=process.env.ARUI_SOURCE_ROOT,sdkModules=process.env.ARUI_SDK_NODE_MODULES,snippets=[];
function collect(r){const s={imports:r.imports,code:code(r.example.sections)};snippets.push(s);return s.code;}
function example(r){const js=ts.transpileModule(code(r.example.sections),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,exports={};vm.runInNewContext(js+'\nexports.Example=Example;',{exports,React:{createElement:(_,props)=>props},FAQ(){},Set,Error});return exports.Example;}
test('six strict parserless files, identical body, separate dependency publish scopes',()=>{
 const files=context.files.map(f=>path.join(root,f.path)),types=path.resolve(path.dirname(require.resolve('@figma/code-connect')),'../../figma-types.d.ts');const p=ts.createProgram([...files,types],{noEmit:true,strict:true,skipLibCheck:true,esModuleInterop:true,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Node10,types:[]});assert.equal(ts.getPreEmitDiagnostics(p).length,0,ts.getPreEmitDiagnostics(p).map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'));
 const normalize=s=>s.split('\n').slice(3).join('\n').replace(/const (family|platform): string = "[^"]+";/g,'CONST;').replace(/const isItem = (true|false);/,'ITEM;').replace(/id: "corp-faq[^"]+",/,'ID,').replace(/nestable: (true|false),/,'NESTABLE,');assert.equal(new Set(files.map(f=>normalize(fs.readFileSync(f,'utf8')))).size,1);
 for(const[name,count]of [['figma.config.json',6],['figma.items.config.json',3],['figma.roots.config.json',3]])assert.equal(JSON.parse(fs.readFileSync(path.join(root,name))).codeConnect.include.length,count);
});
for(const f of context.files){
 test(f.path+': actual native default(s) preserve API/content/state',()=>{
  for(let i=0;i<(f.isItem?2:1);i++){
   const r=render(f.path,{},i),out=collect(r),props=example(r)({content:Array.from({length:r.metadata.props.itemCount},(_,i)=>({id:'id-'+i,answer:'real answer'})),isAccordion:true});
   assert.equal(props.items.length,f.isItem?1:4);assert.equal(props.preExpanded.length,f.isItem&&i?1:0);assert.equal(props.items[0].question,'Title');assert.equal(props.items[0].answer,'real answer');assert.equal(props.isAccordion,true);
   assert.equal(props.promo===true,f.family!=='regular');if(f.family!=='regular')assert.equal(props.promoBackground,f.platform==='desktop'?'base-bg-alt':'base-bg');
   assert.ok(out.includes('arui-private')===false);assert.doesNotMatch(out,/\[object Object\]|\bplatform=|\bexpanded=|<FAQItem\b|figma\.batch/);
   if(f.isItem){assert.equal(r.metadata.nestable,true);if(i)assert.match(out,/Subtitle/);else assert.doesNotMatch(out,/Subtitle/);}
  }
 });
}
test('root combines dynamic leaf metadata, visibility, order, borders and multiple open states',()=>{
 for(const entry of [0,2,4])for(const nativePill of [false,true]){
  const r=render(entry,{nativePill,items:{0:{question:'First "<&>\n',open:true,answer:'Visible answer'},1:{hidden:true},2:{open:true,props:{Border:false}},3:{question:'Last'}}});const out=collect(r),content=Array.from({length:3},(_,i)=>({id:'stable-'+i,answer:'App answer'}));const props=example(r)({content,isAccordion:false});
  assert.equal(props.items.length,3);assert.equal(props.items[0].question,'First "<&>\n');assert.equal(props.items[2].question,'Last');assert.deepEqual(Array.from(props.preExpanded),['stable-0','stable-1']);if(entry===0)assert.deepEqual(Array.from(props.hideBorderForItems),['stable-1']);assert.equal(props.isAccordion,false);assert.doesNotMatch(out,/\[object Object\]/);
 }
});
test('native INSTANCE pill fallback preserves exactly the same mapped data',()=>{
 for(const entry of [0,2,4]){const normal=render(entry),native=render(entry,{nativePill:true});assert.equal(collect(native),code(normal.example.sections));assert.deepEqual(JSON.parse(JSON.stringify(native.metadata.props.observedContent)),JSON.parse(JSON.stringify(normal.metadata.props.observedContent)));}
});
test('ReactNode overrides retain structured content; ids nonempty/unique; initial state uses real ids',()=>{
 const r=render(1,{},1);collect(r);const fn=example(r),rich={kind:'link',href:'/real',children:'answer'};const props=fn({content:[{id:'real-id',question:rich,answer:rich}],isAccordion:true});assert.equal(props.items[0].question,rich);assert.equal(props.items[0].answer,rich);assert.deepEqual(Array.from(props.preExpanded),['real-id']);
 const rootFn=example(render(0));assert.throws(()=>rootFn({content:Array.from({length:8},()=>({id:'same',answer:'answer'})),isAccordion:true}),/unique/);assert.throws(()=>fn({content:[{id:' ',answer:'answer'}],isAccordion:true}),/nonempty/);
});
test('unsupported enum, foreign/missing child, mixed backgrounds and empty group fail explicitly',()=>{
 assert.throws(()=>render(1,{props:{Open:'unknown'}}),/Неизвестный/);assert.throws(()=>render(1,{props:{Border:'True'}}),/BOOLEAN/);
 assert.throws(()=>render(0,{nestedError:true}),/execution failed/);
 for(const change of [{disconnected:true},{wrongFamily:true}])assert.throws(()=>render(0,change),/неподдерживаемый/);
 assert.throws(()=>render(0,{items:Object.fromEntries(Array.from({length:8},(_,i)=>[i,{hidden:true}]))}),/не содержит/);
 assert.throws(()=>render(2,{items:{0:{style:{BackgroundColor:'modal-bg'}}}}),/Неизвестный/);
 assert.throws(()=>render(2,{items:{0:{style:{BackgroundColor:'base-bg (white)'}}}}),/разные фоны/);
});
test('actual FAQ source preserves independent/accordion toggles, borders, ReactNode and Promo defaults',{skip:!sourceRoot&&'set ARUI_SOURCE_ROOT'},()=>{
 let state;const clicked=[];const React={useState(initial){if(state===undefined)state=initial;return[state,update=>{state=update(state);}];},createElement(type,props,...children){return{type,props:props||{},children};}};
 function load(file,imports){const js=ts.transpileModule(fs.readFileSync(path.join(sourceRoot,'src/faq',file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,exports={};vm.runInNewContext(js,{exports,require(name){if(name==='react')return React;if(name==='classnames')return()=>'';if(name.endsWith('.css'))return{};assert.ok(name in imports,name);return imports[name];}});return exports;}
 const {FAQ}=load('faq.tsx',{'../utils/use-corp-is-desktop':{useCorpIsDesktop:()=>false},'./faq-item':{FAQItem:'item'}}),items=[{id:'a',question:'A',answer:'one'},{id:'b',question:'B',answer:'two'}];
 for(const isAccordion of [false,true]){state=undefined;const props={items,isAccordion,preExpanded:['a'],hideBorderForItems:['b'],onItemClick:id=>clicked.push(id)};let rows=FAQ(props).children[0];assert.equal(rows[0].props.isExpanded,true);assert.equal(rows[0].props.border,true);assert.equal(rows[1].props.border,false);rows[1].props.onClick('b');assert.deepEqual(Array.from(state),isAccordion?['b']:['a','b']);rows=FAQ(props).children[0];rows[1].props.onClick('b');assert.deepEqual(Array.from(state),isAccordion?[]:['a']);}
 assert.deepEqual(clicked,['b','b','b','b']);state=undefined;assert.ok(FAQ({items,promo:true}).children[0].every(n=>n.props.border===false));
 const {FAQItem}=load('faq-item/faq-item.tsx',{'@alfalab/core-components/accordion':{Accordion:'accordion'},'@alfalab/core-components/typography':{Typography:{Text:'text'}},'../../background-plate':{BackgroundPlate:'plate'}});
 const rich={kind:'rich',children:'real link'},regular=FAQItem({id:'r',question:rich,answer:rich,onClick(){}});assert.equal(regular.props.header,rich);assert.equal(regular.children[0],rich);
 for(const isDesktop of [true,false]){const promo=FAQItem({id:'r',question:'Q',answer:'A',onClick(){},promo:true,isDesktop});assert.equal(promo.type,'plate');assert.equal(promo.props.backgroundColor,isDesktop?'base-bg-alt':'base-bg');assert.equal(promo.props.hasHover,false);assert.equal(promo.props.withoutBorder,true);}
});

test('source API types include every returned import; invented exports/props fail',{skip:(!sourceRoot||!sdkModules)&&'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES'},()=>{
 assert.deepEqual(checkSnippets(snippets,{sourceRoot,sdkModules}),[]);
 for(const prop of ['platform="mobile"','expanded={true}','showSkeleton={true}','promoBackground="modal-bg"'])assert.ok(checkSnippets([{imports:["import { FAQ } from 'arui-private/faq';"],code:`const bad=<FAQ items={[]} ${prop}/>;`}],{sourceRoot,sdkModules}).length,prop);
 assert.ok(checkSnippets([{imports:["import { FAQItem } from 'arui-private/faq';"],code:'const item=FAQItem;'}],{sourceRoot,sdkModules}).length);
 const file=path.join(__dirname,'publication/2026-11-04.snippets.json');if(fs.existsSync(file)){const evidence=JSON.parse(fs.readFileSync(file));assert.equal(evidence.readbacks.length,9);assert.ok(evidence.readbacks.every(r=>r.hasTemplate&&r.componentName==='FAQ'&&r.snippet.trim()));assert.deepEqual(checkSnippets(evidence.readbacks.map(r=>({imports:r.snippetImports,code:r.snippet})),{sourceRoot,sdkModules}),[]);}
});
