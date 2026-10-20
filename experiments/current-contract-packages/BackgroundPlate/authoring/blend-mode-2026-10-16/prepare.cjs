const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',C=path.join(W,'projects/Apollo-v3/packages/component-contract-core'),R=__dirname;
const B=path.join(R,'../owner-scope-2026-10-16');
assert(!fs.existsSync(path.join(R,'SEAL.json')),'Closed packet: prepare in a new directory.');
const esbuild=require(require.resolve('esbuild',{paths:[C]}));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(n,v)=>fs.writeFileSync(path.join(R,n),JSON.stringify(v,null,2)+'\n');
const pin=p=>{const data=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:data.length};};
const sourceTexts=new Map(),changes=new Map();
const change=(relative,before,after)=>{
  const p=path.join(C,relative),text=fs.readFileSync(p,'utf8');assert.equal(text.split(before).length,2,p);
  sourceTexts.set(p,text);changes.set(p,text.replace(before,after));
};
change('src/figma-capture.ts',
  "  if ('opacity' in node) appearance.opacity = finite(node.opacity) ?? 1;",
  "  if ('opacity' in node) appearance.opacity = finite(node.opacity) ?? 1;\n  if ('blendMode' in node && typeof node.blendMode === 'string') appearance.blendMode = node.blendMode;");
change('src/compiler.ts',
  '/^(bounds\\.(width|height)|appearance.effectDetailsV1|layout\\.(gridStyleId|clipsContent))$/',
  '/^(bounds\\.(width|height)|appearance\\.(effectDetailsV1|blendMode)|layout\\.(gridStyleId|clipsContent))$/');
const compiler=path.join(C,'src/compiler.ts');
const missingBefore='/^(bounds\\.(width|height)|appearance\\.(fill|stroke|effectDetailsV1)|layout\\.(gridStyleId|clipsContent))$/';
assert.equal(changes.get(compiler).split(missingBefore).length,2);
changes.set(compiler,changes.get(compiler).replace(missingBefore,
  '/^(bounds\\.(width|height)|appearance\\.(fill|stroke|effectDetailsV1|blendMode)|layout\\.(gridStyleId|clipsContent))$/'));
const pins=new Map();
async function build(name,patched){
  const out=path.join(R,name);fs.mkdirSync(out,{recursive:true});
  await esbuild.build({absWorkingDir:C,entryPoints:{core:'src/index.ts',capture:'src/figma-capture.ts',runtime:'src/runtime.ts',predicate:'predicate/index.js'},
    outdir:out,outExtension:{'.js':'.cjs'},bundle:true,platform:'node',format:'cjs',target:'node18',metafile:true,
    plugins:[{name:'private-immutable-source-overlay',setup(b){b.onLoad({filter:/\.(ts|js|json)$/},args=>{
      if(!args.path.startsWith(C+path.sep))return;
      const actual=fs.readFileSync(args.path,'utf8');
      if(sourceTexts.has(args.path))assert.equal(actual,sourceTexts.get(args.path),args.path);
      else sourceTexts.set(args.path,actual);
      const p=pin(args.path);if(pins.has(args.path))assert.deepEqual(p,pins.get(args.path));else pins.set(args.path,p);
      return {contents:patched&&changes.has(args.path)?changes.get(args.path):actual,loader:args.path.endsWith('.ts')?'ts':args.path.endsWith('.json')?'json':'js'};
    });}}]});
  return {core:require(path.join(out,'core.cjs')),capture:require(path.join(out,'capture.cjs'))};
}
function fixture(core){
  const f=require(path.join(C,'tests/helpers/declared-target.cjs')).fixture(core);
  const original=f.manual.rules[0];
  f.manual.rules=[['root','root'],['child','title.target']].map(([name,targetId])=>({...structuredClone(original),
    id:'synthetic.blend-'+name,targetId,capability:'appearance.blendMode',permission:'forbidden',
    constraints:[{type:'propertyForbidden',fact:'appearance.blendMode'}],status:'reviewed'}));
  for(const n of f.snapshot.nodes)n.appearance={blendMode:n.id==='root'?'PASS_THROUGH':'NORMAL'};
  const reference=structuredClone(f.snapshot);
  f.snapshot=core.materializeEffectiveBaseline(f.snapshot,reference,true).snapshot;
  const compile=()=>core.compileManualSource(f.manual,f.evidence);
  return {f,reference,run:()=>{const compiled=compile();assert(!compiled.issues.some(i=>i.level==='error'));return core.evaluateCompiledContract(f.snapshot,compiled.contract);}};
}
function verdict(result,name){const rows=result.evaluations.filter(e=>e.ruleId==='synthetic.blend-'+name+'.1.1');assert.equal(rows.length,1);return rows[0].classification;}
async function capture(captureApi){
  const main={id:'synthetic-main',key:'synthetic-variant',parent:{type:'COMPONENT_SET',key:'synthetic-set',componentPropertyDefinitions:{}}};
  const page={type:'PAGE',id:'page'};let reference,temporary;
  const make=(id,actual)=>({id,type:'INSTANCE',name:'Plate',parent:page,visible:true,width:100,height:56,opacity:1,
    blendMode:actual?'MULTIPLY':'PASS_THROUGH',children:[],resolvedVariableModes:{},componentProperties:{},
    getMainComponentAsync:async()=>main,exportAsync:async()=>new Uint8Array([1]),remove(){this.removed=true;}});
  main.createInstance=()=>reference=make('reference',false);
  const subject=make('actual',true);
  global.figma={mixed:Symbol('mixed'),fileKey:'synthetic-file',root:{name:'Synthetic'},currentPage:page,
    base64Encode:b=>Buffer.from(b).toString('base64'),
    createPage(){return temporary={id:'temporary',type:'PAGE',appendChild(n){n.parent=this;},remove(){this.removed=true;}};}};
  try{const result=await captureApi.captureInstanceAudit(subject,{componentKey:'synthetic-set',acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:'synthetic'});
    assert.equal(reference.removed,true);assert.equal(temporary.removed,true);assert.equal(subject.removed,undefined);return result;
  }finally{delete global.figma;}
}
(async()=>{
  const baseline=await build('baseline',false);
  const oldCapture=await capture(baseline.capture),oldFixture=fixture(baseline.core);
  delete oldFixture.f.snapshot.nodes[0].baseline.effective.appearance.blendMode;
  const firstFailure={status:'REPRODUCED_BEFORE_FIX',actualBlendMode:oldCapture.snapshot.nodes[0].appearance.blendMode??null,
    independentBaselineBlendMode:oldCapture.snapshot.nodes[0].baseline.effective.appearance.blendMode??null,
    missingBaselineVerdict:verdict(oldFixture.run(),'root'),expectedCapture:['MULTIPLY','PASS_THROUGH'],expectedMissingBaseline:'unknown',native:'NOT_RUN'};
  assert.equal(firstFailure.actualBlendMode,null);assert.notEqual(firstFailure.missingBaselineVerdict,'unknown');write('FIRST-FAILURE.json',firstFailure);
  const candidate=await build('candidate',true),actual=await capture(candidate.capture);
  assert.equal(actual.snapshot.nodes[0].appearance.blendMode,'MULTIPLY');
  assert.equal(actual.snapshot.nodes[0].baseline.effective.appearance.blendMode,'PASS_THROUGH');
  assert.deepEqual(actual.snapshot.variantReference,oldCapture.snapshot.variantReference);
  const f=fixture(candidate.core),results=[];
  const check=(name,root,child,truth)=>{const result=f.run();assert.equal(verdict(result,'root'),root,name);assert.equal(verdict(result,'child'),child,name);
    if(truth)assert.equal(result.evaluations.find(e=>e.ruleId==='synthetic.blend-root.1.1').trace.truth,truth,name);
    results.push({name,root,child,...(truth?{truth}:{})});};
  check('pristine','compliant','compliant');
  f.f.snapshot.nodes[0].appearance.blendMode='MULTIPLY';check('root override','violation','compliant');
  f.f.snapshot.nodes[0].appearance.blendMode='PASS_THROUGH';check('root reset','compliant','compliant');
  f.f.snapshot.nodes[2].appearance.blendMode='SCREEN';check('nested override','compliant','violation');
  f.f.snapshot.nodes[2].appearance.blendMode='NORMAL';check('nested reset','compliant','compliant');
  delete f.f.snapshot.nodes[0].baseline.effective.appearance.blendMode;check('missing baseline','human-review','compliant','unknown');
  f.f.snapshot.nodes[0].baseline.effective.appearance.blendMode='PASS_THROUGH';
  delete f.f.snapshot.nodes[0].appearance.blendMode;check('missing actual','human-review','compliant','unknown');
  const manual=read(path.join(B,'contract.manual.json')),evidence=read(path.join(B,'variant-evidence.json'));
  const oldCompiled=candidate.core.compileManualSource(manual,evidence).contract;
  const normalize=rules=>JSON.parse(JSON.stringify(rules)).map(({revision,source,...rest})=>({...rest,source:{path:source.path,anchor:source.anchor}}));
  assert.deepEqual(normalize(oldCompiled.rules),normalize(read(path.join(B,'component-contract.v2.json')).rules));
  manual.rules=manual.rules.filter(r=>r.id!=='component:web-corp.background-plate.blend-mode-is-fixed');
  const blendRules=manual.rules.filter(r=>r.id.includes('.opacity-is-fixed.')).map(r=>({...structuredClone(r),
    id:r.id.replace('.opacity-is-fixed.','.blend-mode-is-fixed.'),capability:'appearance.blendMode',
    sourceRefs:['component:web-corp.background-plate.blend-mode-is-fixed'],
    rationale:'Blend mode корня и внутренних surface-слоёв совпадает с effective baseline выбранного слоя и варианта.',status:'draft'}));
  assert.equal(blendRules.length,2);manual.rules.push(...blendRules);manual.metadata.revision=4;manual.metadata.updatedAt=new Date().toISOString();
  const bundle=candidate.core.buildExportBundle(manual,evidence,[]);assert(bundle.validation.valid);
  assert.equal(bundle.compiled.rules.length,25);assert.equal(bundle.compiled.nonExecutableRules.length,1);
  write('contract.manual.json',manual);write('component-contract.v2.json',bundle.compiled);
  const sourceChanges=[];
  for(const [p,text] of changes){const target=path.join(R,'source',path.relative(C,p));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);sourceChanges.push({target:p,before:pin(p),candidate:pin(target)});}
  const self=fs.readFileSync(__filename,'utf8'),definitions=self.slice(self.indexOf('function fixture(core)'),self.indexOf('(async()=>'));
  const testHeader="const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');\nconst C=path.resolve(__dirname,'..'),core=require('../dist/core.cjs'),captureApi=require('../dist/capture.cjs');\n";
  const testBody=`
test('blend mode capture retains independent actual and reference values',async()=>{
 const result=await capture(captureApi);assert.equal(result.snapshot.nodes[0].appearance.blendMode,'MULTIPLY');
 assert.equal(result.snapshot.nodes[0].baseline.effective.appearance.blendMode,'PASS_THROUGH');
});
for(const [name,mutate,root,child,truth] of [
 ['pristine',()=>{},'compliant','compliant'],
 ['root override',s=>s.nodes[0].appearance.blendMode='MULTIPLY','violation','compliant'],
 ['nested override',s=>s.nodes[2].appearance.blendMode='SCREEN','compliant','violation'],
 ['root reset',s=>{s.nodes[0].appearance.blendMode='MULTIPLY';s.nodes[0].appearance.blendMode='PASS_THROUGH';},'compliant','compliant'],
 ['nested reset',s=>{s.nodes[2].appearance.blendMode='SCREEN';s.nodes[2].appearance.blendMode='NORMAL';},'compliant','compliant'],
 ['missing baseline',s=>delete s.nodes[0].baseline.effective.appearance.blendMode,'human-review','compliant','unknown'],
 ['missing actual',s=>delete s.nodes[0].appearance.blendMode,'human-review','compliant','unknown']
])test('blend mode '+name,()=>{const x=fixture(core);mutate(x.f.snapshot);const r=x.run();
 assert.equal(verdict(r,'root'),root);assert.equal(verdict(r,'child'),child);
 if(truth)assert.equal(r.evaluations.find(e=>e.ruleId==='synthetic.blend-root.1.1').trace.truth,truth);
});
`;
  const testPath=path.join(R,'source/tests/blend-mode.test.js');fs.mkdirSync(path.dirname(testPath),{recursive:true});fs.writeFileSync(testPath,testHeader+definitions+testBody);
  const testTarget=path.join(C,'tests/blend-mode.test.js');assert(!fs.existsSync(testTarget));sourceChanges.push({target:testTarget,before:null,candidate:pin(testPath)});
  for(const p of pins.values())assert.deepEqual(pin(p.path),p);
  write('SOURCE-MANIFEST.json',{status:'PRIVATE_PATCH_NOT_APPLIED',sourceInputs:[...pins.values()],changes:sourceChanges,
    coreVersion:'0.1.17 baseline; next release/version integration not assigned',sharedWrites:0,generationPilotScope:'UNCHANGED'});
  write('eval.json',{status:'PASS_PRIVATE_SYNTHETIC_ONLY',regressions:results,capture:'actual MULTIPLY / independent PASS_THROUGH',
    variantReference:'UNCHANGED',legacy23IR:'UNCHANGED',candidateIR:25,manualRecords:31,nonExecutable:1,
    sourceFiles:sourceChanges.length,zip:'NOT_BUILT_BEFORE_SOURCE_INTEGRATION',native:'NOT_RUN',EditorUi:'NOT_RUN',ApolloConsumer:'NOT_VERIFIED',Ready:false});
  console.log(JSON.stringify({status:'PRIVATE_BLEND_FIX_PASS',checks:results.length,sourceFiles:sourceChanges.length,IR:25,nonExecutable:1,sharedWrites:0}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
