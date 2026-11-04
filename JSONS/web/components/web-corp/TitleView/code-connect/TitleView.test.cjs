const fs=require('node:fs'); const path=require('node:path'); const assert=require('node:assert/strict'); const {test}=require('node:test'); const ts=require('typescript');
const {root,context,render,code}=require('./template-fixture.cjs');const {checkSnippets}=require('./check-source-api.cjs');
const sourceRoot=process.env.ARUI_SOURCE_ROOT, sdkModules=process.env.ARUI_SDK_NODE_MODULES;const snippets=[];
function collect(r){const s={imports:r.imports,code:code(r.example.sections)};snippets.push(s);return s.code;}
test('two parserless files strictly typecheck, use exact config and identical logic',()=>{
 assert.ok(fs.existsSync(path.resolve(__dirname,context.provenance.rawCatalog)));
 const files=context.files.map(f=>path.join(root,f));const figmaTypes=path.resolve(path.dirname(require.resolve('@figma/code-connect')),'../../figma-types.d.ts');
 const p=ts.createProgram([...files,figmaTypes],{noEmit:true,strict:true,skipLibCheck:true,esModuleInterop:true,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Node10,types:[]});const d=ts.getPreEmitDiagnostics(p);assert.equal(d.length,0,d.map(x=>ts.flattenDiagnosticMessageText(x.messageText,'\n')).join('\n'));
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'figma.config.json'))).codeConnect.include,context.files);
 assert.equal(...files.map(f=>fs.readFileSync(f,'utf8').split('\n').slice(10).join('\n')));
});
for(const platform of ['desktop','mobile']){
 const index=platform==='desktop'?0:1;
 test(`${platform}: eight native variants, hidden flags and Skeleton data`,()=>{
  assert.equal(context.roots[index].variants.length,8);
  for(let i=0;i<8;i++){
   const v=context.roots[index].variants[i],r=render(platform,{},i),out=collect(r);const xl=v.properties.View==='xLarge',sk=v.properties.Skeleton==='True';
   assert.match(r.imports[0],new RegExp('arui-private/title-view/'+platform));assert.ok(out.includes(`view={VIEWS.${v.properties.View==='xLarge'?'XLARGE':v.properties.View.toUpperCase()}}`));assert.ok(out.includes(`showSkeleton={${sk}}`));
   assert.equal(out.includes('statusProps='),xl);assert.equal(out.includes('buttonsGroup='),xl);assert.equal(out.includes('filterCompanySelectProps='),xl);assert.ok(out.includes('subtitle='));
   assert.equal(out.includes('title: NonNullable'),sk);assert.equal(out.includes('subtitle: NonNullable'),sk);
   if(!xl)assert.deepEqual(Array.from(r.metadata.props.requiredContext),sk?['tag','title','subtitle']:['tag']);
   if(index)assert.match(out,/rowLimit=\{2\}/);else assert.doesNotMatch(out,/rowLimit=/);
   assert.doesNotMatch(out,/header=|getSlot|https?:|\[object Object\]/);
   if(xl&&!sk)assert.equal(r.metadata.props.visibleActions.length,index?1:3);
  }
 });
 test(`${platform}: all 128 Boolean combinations preserve only admitted public props`,()=>{
  const keys=['Status','Holding','Button group','TitleStatus','TitleAddon','RightAddon','Subtitle'];
  for(let mask=0;mask<128;mask++){
   const flags=Object.fromEntries(keys.map((k,i)=>[k,!!(mask&(1<<i))]));const r=render(platform,{root:flags}),out=collect(r);
   for(const [flag,prop] of [['Status','statusProps'],['Holding','filterCompanySelectProps'],['Button group','buttonsGroup'],['TitleStatus','titleStatusProps'],['TitleAddon','titleAddon'],['RightAddon','rightAddon'],['Subtitle','subtitle']])assert.equal(out.includes(prop+'='),flags[flag],flag);
  }
 });
 test(`${platform}: TitleStatus six semantic types, escaping and missing/unknown data`,()=>{
  for(const type of ['Approved','Attention','Error / Risk','Action','Processing','Neutral'])collect(render(platform,{root:{TitleStatus:true},titleStatusType:type}));
  const text='" <>& }\nЮникод \\',out=collect(render(platform,{text:{Title:text,Subtitle:text}}));assert.ok(out.includes(JSON.stringify(text)));
  for(const prop of ['View','Skeleton'])assert.throws(()=>render(platform,{root:{[prop]:'Unknown'}}),/Неизвестный/);
  assert.throws(()=>render(platform,{root:{Subtitle:'False'}}),/BOOLEAN/);assert.throws(()=>render(platform,{missing:'Title'}),/Не найден/);
  assert.throws(()=>render(platform,{StatusPreset:{Type:'Unknown'}}),/Неизвестный/);assert.throws(()=>render(platform,{StatusPreset:{Size:'20'}}),/Size=24/);
  assert.doesNotThrow(()=>render(platform,{root:{Status:false},missing:'StatusPreset'}));
  if(index)assert.match(collect(render(platform,{root:{'2 line':false}})),/rowLimit=\{1\}/);
 });
}
test('generated code uses actual source public props and rejects old mobile/invented API', {skip:(!sourceRoot||!sdkModules)&&'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES'},()=>{
 assert.deepEqual(checkSnippets(snippets,{sourceRoot,sdkModules}),[]);
 const imports=["import { TitleViewDesktop } from 'arui-private/title-view/desktop';","import { VIEWS } from 'arui-private/title-view';"];
 for(const prop of ['header="Old"','size="large"','status="green"','platform="desktop"','view="xlarge"']){
  const props=prop.startsWith('view=')?prop:`view={VIEWS.XLARGE} ${prop}`;
  assert.ok(checkSnippets([{imports,code:`const bad=<TitleViewDesktop tag="h1" ${props}>Title</TitleViewDesktop>;`}],{sourceRoot,sdkModules}).length>0,prop);
 }
 const published=path.join(__dirname,'publication/2026-11-04.snippets.json');
 if(fs.existsSync(published)){
  const rows=JSON.parse(fs.readFileSync(published)).readbacks;assert.equal(rows.length,18);for(const r of rows){assert.equal(r.hasTemplate,true);assert.ok(r.snippet.trim());}
  assert.deepEqual(checkSnippets(rows.map(r=>({imports:r.snippetImports,code:r.snippet})),{sourceRoot,sdkModules}),[]);
 }
});
