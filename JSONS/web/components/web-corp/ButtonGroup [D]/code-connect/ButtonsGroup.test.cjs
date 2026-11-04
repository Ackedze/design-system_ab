const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');const {test}=require('node:test');
const {root,context,render,code}=require('./template-fixture.cjs');const {checkSnippets}=require('./check-source-api.cjs');
const sourceRoot=process.env.ARUI_SOURCE_ROOT,sdkModules=process.env.ARUI_SDK_NODE_MODULES;const snippets=[];
function collect(r){const s={imports:r.imports,code:code(r.example.sections)};snippets.push(s);return s.code;}
test('strict parserless types; glob scope discovers exactly two files despite brackets in folder',()=>{
 const files=context.files.map(f=>path.join(root,f));const types=path.resolve(path.dirname(require.resolve('@figma/code-connect')),'../../figma-types.d.ts');
 const p=ts.createProgram([...files,types],{noEmit:true,strict:true,skipLibCheck:true,esModuleInterop:true,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Node10,types:[]});const errors=ts.getPreEmitDiagnostics(p);assert.equal(errors.length,0,errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'));
 const repo=path.resolve(root,'../../../../..'),cfg=JSON.parse(fs.readFileSync(path.join(root,'figma.config.json')));const glob=require('glob');const actual=glob.globSync(cfg.codeConnect.include.map(f=>repo+'/'+f),{absolute:true,nodir:true});assert.deepEqual(actual.sort(),files.sort());
 const sources=files.map(f=>fs.readFileSync(f,'utf8').split('\n').slice(3).join('\n').replace(/const isDesktop = (true|false);/,'const isDesktop = PLATFORM;'));assert.equal(sources[0],sources[1]);
});
for(const platform of ['desktop','mobile']){
 const index=platform==='desktop'?0:1;
 test(`${platform}: all eight native variants map source API and preserve warnings`,()=>{
  assert.equal(context.roots[index].variants.length,8);
  for(let i=0;i<8;i++){
   const v=context.roots[index].variants[i],r=render(platform,{},i),out=collect(r),overflow=v.properties.Overflow==='true';
   assert.ok(out.includes(`size={${v.properties.Size}}`));assert.match(out,/primaryFirst=\{true\}/);assert.ok(out.includes(`maxVisibleButtons={${index?2:4}}`));assert.ok(out.includes('breakpoint: 768, footer: undefined'));
   assert.equal((out.match(/children: "Label"/g)||[]).length,(index?2:4)-Number(overflow));assert.equal(out.includes('...hiddenElements'),overflow);
   assert.equal(r.metadata.props.sourceParity==='known-mobile-visibility-gap',!!index&&!overflow);assert.match(out,/mapElementToPickerOption=/);assert.match(out,/onChange: NonNullable/);assert.match(out,/label: NonNullable/);
   assert.doesNotMatch(out,/\boverflow=|\bplatform=|\bmobile=|figma\.batch|onClick:\s*\(\)\s*=>|\[object Object\]/);
  }
 });
 test(`${platform}: disabled/addons and escaping use actual element props`,()=>{
  const label='" <>& }\nЮникод \\';const out=collect(render(platform,{labels:Array(index?2:4).fill(label),buttons:{0:{DisabledState:'True',LeftAddon:true,RightAddon:true}}}));
  assert.ok(out.includes(JSON.stringify(label)));assert.match(out,/disabled: true/);assert.match(out,/leftAddons: NonNullable/);assert.match(out,/rightAddons: NonNullable/);
  const allSecondary=Object.fromEntries(Array.from({length:index?2:4},(_,i)=>[i,{View:'Secondary'}]));assert.match(collect(render(platform,{buttons:allSecondary})),/primaryFirst=\{false\}/);
 });
 test(`${platform}: unsupported and inconsistent states refuse`,()=>{
  for(const key of ['Size','Overflow'])assert.throws(()=>render(platform,{root:{[key]:'unknown'}}),/Неизвестный/);
  for(const changes of [{Hint:true},{Label:false},{Shape:'Rounded'},{Size:'64'},{SingleIcon:'True'}])assert.throws(()=>render(platform,{buttons:{0:changes}}));
  assert.throws(()=>render(platform,{buttons:{1:{View:'Primary'}}}),/Primary/);assert.throws(()=>render(platform,{buttons:{0:{Hint:'False'}}}),/BOOLEAN/);
  assert.throws(()=>render(platform,{buttons:{[index?1:3]:{SingleIcon:'True'}}}),/Overflow/);
 });
}
test('hidden middle desktop slots preserve original order without custom occurrence ports',()=>{
 let count=0;
 for(let mask=0;mask<16;mask++){
  const keep=[0,1,2,3].filter(i=>mask&(1<<i));if(keep.length<2)continue;
  const out=collect(render('desktop',{hidden:[0,1,2,3].filter(i=>!keep.includes(i)),labels:['a0','a1','a2','a3']}));
  assert.deepEqual([...out.matchAll(/children: "(a\d)"/g)].map(m=>m[1]),keep.map(i=>'a'+i));count++;
 }
 assert.equal(count,11);
});
test('real source reproduces mobile visibility and default option callback/identity gaps',{skip:!sourceRoot&&'set ARUI_SOURCE_ROOT'},()=>{
 function load(file,imports={}){const source=fs.readFileSync(path.join(sourceRoot,'src/button-group',file),'utf8'),exports={};const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(js,{exports,require(name){assert.ok(imports[name],name);return imports[name];}});return exports;}
 const calc=load('utils/calculate-hidden-elements.ts').calculateHiddenElements;
 assert.deepEqual(Array.from(calc({elements:[{clientWidth:100},{clientWidth:100}],margin:16,isMobile:true,limitWidth:335,maxVisibleButtons:2}).hiddenIndexes),[1]);
 assert.deepEqual(Array.from(calc({elements:Array.from({length:4},()=>({clientWidth:100})),margin:16,isMobile:false,limitWidth:1000,maxVisibleButtons:4}).hiddenIndexes),[]);
 assert.deepEqual(Array.from(calc({elements:Array.from({length:5},()=>({clientWidth:100})),margin:16,isMobile:false,limitWidth:1000,maxVisibleButtons:4}).hiddenIndexes),[3,4]);
 const types=load('typings.ts');const mapper=load('utils/get-picker-button-options.ts',{'../typings':types}).getPickerButtonOptions;
 const elems=[{children:'Same',onClick(){},leftAddons:'icon'},{children:'Same',disabled:true,onClick(){}}];
 const opts=mapper({hiddenIndexes:[0,1],elements:elems});assert.equal(opts[0].key,opts[1].key);assert.equal(opts[0].onClick,undefined);assert.equal(opts[0].leftAddons,undefined);assert.equal(opts[1].disabled,true);
 const custom=mapper({hiddenIndexes:[0,1],elements:elems,mapElementToPickerOption:(p,i)=>({key:String(i),content:p.children,disabled:p.disabled})});assert.deepEqual(Array.from(custom,o=>o.key),['0','1']);
});
test('generated examples match actual public source API; invented group props fail',{skip:(!sourceRoot||!sdkModules)&&'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES'},()=>{
 assert.deepEqual(checkSnippets(snippets,{sourceRoot,sdkModules}),[]);
 const imports=["import { ButtonGroup } from 'arui-private/button-group';"];
 for(const prop of ['overflow={true}','platform="mobile"','size={64}','primaryFirst="true"'])assert.ok(checkSnippets([{imports,code:`const bad=<ButtonGroup elements={[]} ${prop}/>;`}],{sourceRoot,sdkModules}).length>0,prop);
 const published=path.join(__dirname,'publication/2026-11-04.snippets.json');if(fs.existsSync(published)){
  const evidence=JSON.parse(fs.readFileSync(published)),rows=evidence.readbacks;assert.equal(rows.length,16);assert.ok(rows.every(r=>r.componentName==='ButtonGroup'&&r.hasTemplate&&r.snippet.trim()));
  assert.equal(evidence.setQueries.length,2);for(const q of evidence.setQueries){assert.equal(q.kind,'component-set-subtree');assert.equal(q.variants.length,8);for(const v of q.variants){const r=rows.find(r=>r.queryNodeId===v.nodeId);assert.ok(r);assert.ok(v.hasTemplate&&v.exactMatchToVariantReadback);assert.equal(require('node:crypto').createHash('sha256').update(r.snippet).digest('hex'),v.snippetSha256);}}
  assert.deepEqual(checkSnippets(rows.map(r=>({imports:r.snippetImports,code:r.snippet})),{sourceRoot,sdkModules}),[]);
 }
});
