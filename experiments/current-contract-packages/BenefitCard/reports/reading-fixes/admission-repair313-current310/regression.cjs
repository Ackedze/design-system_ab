const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,guard}=require('./guard.cjs'),{fixture,clone}=require('./scoped-fixture.cjs');
const frozen=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;
const checks=[],check=(name,fn)=>{try{fn();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:error.stack});}};
guard('before-private-regressions');
for(const platform of ['desktop','mobile-web']){
 check('combined scoped dependency executes exactly once through FRAME: '+platform,()=>{
  const f=fixture('candidate',platform),r=f.run();assert.equal(r.compiled.issues.filter(i=>i.level==='error').length,0,JSON.stringify(r.compiled.issues));
  assert.equal(r.contract.runtimePolicy.crossRepresentationBindingsVersion,2);
  assert.equal(r.engine.dependencyRuns.filter(x=>x.status==='executed').length,1,JSON.stringify(r.engine.dependencyRuns));
  assert.equal(r.engine.dependencyRuns.filter(x=>x.reason==='binding-outside-representation').length,1);
  assert.ok(r.engine.evaluations.every(e=>['compliant','not-applicable'].includes(e.classification)),JSON.stringify(r.engine.evaluations));
 });
 check('parent-owned boundary delegates only the captured child: '+platform,()=>{
  const f=fixture('candidate',platform);f.snapshot.componentDependencyCaptures[0].snapshot.nodes[0].appearance.opacity=.4;f.sync();const r=f.run();
  const failures=r.engine.evaluations.filter(e=>e.classification==='violation');assert.equal(failures.length,1);assert.ok(failures[0].dependency);assert.equal(failures[0].focusNodeId,'member-0');
  assert.ok(r.engine.evaluations.some(e=>!e.dependency&&e.subjectNodeId==='root'&&e.classification==='compliant'));
 });
 check('inactive typed owner variant: '+platform,()=>{
  const r=fixture('candidate',platform,'False').run();assert.ok(r.engine.dependencyRuns.every(r=>r.status==='not-applicable'));assert.ok(r.engine.dependencyRuns.some(r=>r.reason==='owner-variant-inactive'));
 });
}
for(const [label,mutate]of [
 ['empty',b=>b.representationIds=[]],['invalid',b=>b.representationIds=['unknown']],['duplicate',b=>b.representationIds=['desktop','desktop']],
 ['not array',b=>b.representationIds='desktop'],['missing',b=>delete b.representationIds],['overlap',b=>b.representationIds=['desktop','mobile-web']],
 ['legacy scope field',b=>b.kind='fixed-nested'],
])check('manual rejects scope '+label,()=>{const f=fixture();mutate(f.manual.componentDependencies[0].bindings[0]);assert.ok(f.compile().issues.some(i=>i.level==='error'&&i.code==='COMPONENT_DEPENDENCY'));});
check('unscoped binding overlaps scoped binding',()=>{const f=fixture();const b=clone(f.manual.componentDependencies[0].bindings[0]);b.id='legacy';b.kind='fixed-nested';delete b.representationIds;f.manual.componentDependencies[0].bindings.push(b);assert.ok(f.compile().issues.some(i=>i.message==='Fixed nested bindings may not overlap in the same representation.'));});
check('deprecated or code representations cannot select a Figma binding',()=>{for(const change of [r=>r.status='deprecated',r=>r.kind='code']){const f=fixture();change(f.manual.representations[0]);assert.ok(f.compile().issues.some(i=>i.code==='COMPONENT_DEPENDENCY'));}});
for(const [label,mutate]of [
 ['stale actual identity',s=>s.nodes[0].component.identity.componentKey='stale'],
 ['stale source',s=>s.source.componentKey='stale'],['missing root proof',s=>delete s.variantReference],
 ['unknown identity',s=>s.nodes[0].unknownFacts.push('component.identity')],
 ['wrong channel',s=>s.context.platform='mobile-web'],['unknown channel',s=>s.context.unknownFacts.push('platform')],
])check('unknown host never becomes out-of-scope inactive: '+label,()=>{
 const f=fixture(),c=f.compile().contract;mutate(f.snapshot);const p=f.core.prepareValidationSnapshot(f.snapshot,c),d=c.componentDependencies[0],r=f.core.resolveFixedNestedBinding(p,d,d.bindings[1],false,c);
 assert.equal(r.status,'unknown',JSON.stringify(r));
});
check('ambiguous actual host representations remain unknown',()=>{
 const f=fixture();f.manual.representations.push({...clone(f.manual.representations[0]),id:'same-native-key'});const r=f.run();assert.ok(r.engine.dependencyRuns.every(x=>x.status==='not-executed'&&x.reason==='dependency-representation-unresolved'));
});
for(const [label,mutate]of [
 ['missing host child',f=>{f.snapshot.nodes=f.snapshot.nodes.filter(n=>n.id!=='member-0');f.snapshot.nodes.find(n=>n.id==='frame').childIds=[];}],
 ['foreign child',f=>f.snapshot.nodes.find(n=>n.id==='member-0').component.identity.componentSetKey='foreign'],
 ['hidden foreign child',f=>{const n=f.snapshot.nodes.find(n=>n.id==='member-0');n.visible=false;n.component.identity.componentSetKey='foreign';}],
 ['missing capture',f=>f.snapshot.componentDependencyCaptures=[]],
 ['stale child capture',f=>f.snapshot.componentDependencyCaptures[0].snapshot.nodes[0].appearance.opacity=.3],
])check('child proof fails closed: '+label,()=>{const f=fixture();mutate(f);const r=f.run();assert.ok(r.engine.dependencyRuns.some(x=>x.bindingId==='desktop-child'&&x.status==='not-executed'),JSON.stringify(r.engine.dependencyRuns));});
for(const version of [undefined,1,3])check('root runtime refuses missing/downgraded/unknown feature '+version,()=>{const f=fixture(),c=f.compile().contract;c.runtimePolicy.crossRepresentationBindingsVersion=version;assert.throws(()=>f.core.evaluateCompiledContract(f.snapshot,c),/REPRESENTATION_RUNTIME_UNSUPPORTED/);});
check('root runtime refuses forged malformed scoped data',()=>{const f=fixture(),c=f.compile().contract;c.componentDependencies[0].bindings[0].representationIds=[];assert.throws(()=>f.core.evaluateCompiledContract(f.snapshot,c),/COMPONENT_DEPENDENCY_RUNTIME_UNSUPPORTED/);});
check('actual old bare Core and Editor root evaluation refuse the new feature',()=>{
 const f=fixture(),c=f.compile().contract;for(const suffix of ['/component-contract-core/dist/core.cjs','/ComponentContractEditor/dist/core.cjs']){const file=frozen.find(x=>x.original.path.endsWith(suffix)).copy.path;
  const old=require(file);assert.throws(()=>old.evaluateCompiledContract(f.snapshot,c),/REPRESENTATION_RUNTIME_UNSUPPORTED/);
  assert.throws(()=>old.prepareValidationSnapshot(f.snapshot,c),/REPRESENTATION_RUNTIME_UNSUPPORTED/);
  assert.ok(old.compileManualSource(f.manual,f.evidence,[f.childContract]).issues.some(i=>i.code==='COMPONENT_DEPENDENCY'&&i.message==='Unknown dependency binding kind.'));
 }
});
check('actual old V4 profile refuses new scoped contract; candidate accepts it',()=>{
 const f=fixture(),c=f.compile().contract,base=root+'/workspace/baseline/projects/Apollo-v3',next=root+'/workspace/candidate/projects/Apollo-v3';
 const oldProfile=require(base+'/apps/apollo-v4/dist/profile.cjs'),engine=require(next+'/packages/component-contract-core/dist/predicate.cjs'),profile=require(next+'/apps/apollo-v4/dist/profile.cjs');
 assert.throws(()=>oldProfile.assertRuntimeContract(c,engine,{evaluationMode:'authoring-preview'}),e=>e.code==='APOLLO_V4_CONTRACT_INCOMPATIBLE');
 const oldRuntime=require(frozen.find(x=>x.original.path.endsWith('/apollo-v4/dist/runtime.cjs')).copy.path);
 assert.throws(()=>oldRuntime.loadRuntimeContract(c,{evaluationMode:'authoring-preview'}),e=>e.code==='APOLLO_V4_CONTRACT_INCOMPATIBLE');
 assert.throws(()=>oldRuntime.auditContractSnapshot(f.snapshot,c,{evaluationMode:'authoring-preview'}),e=>e.code==='APOLLO_V4_CONTRACT_INCOMPATIBLE');
 assert.equal(profile.assertRuntimeContract(c,engine,{evaluationMode:'authoring-preview'}),c);
});
check('legacy unscoped compiler, prepared snapshot and verdicts remain exact',()=>{
 const a=fixture('baseline'),b=fixture('candidate');
 for(const f of [a,b]){f.manual.componentDependencies[0].bindings=[f.manual.componentDependencies[0].bindings[0]];f.manual.componentDependencies[0].bindings[0].kind='fixed-nested';delete f.manual.componentDependencies[0].bindings[0].representationIds;}
 const old=a.run(),next=b.run();assert.deepEqual(next.compiled,old.compiled);assert.deepEqual(next.prepared,old.prepared);assert.deepEqual(next.engine,old.engine);
});
check('direct-child guard and historical results unchanged',()=>{
 const old=require(root+'/workspace/baseline/projects/ComponentContractEditor/tests/helpers/direct-group.js').scenario(2),next=require(root+'/workspace/candidate/projects/ComponentContractEditor/tests/helpers/direct-group.js').scenario(2);
 assert.deepEqual(next.run(),old.run());old.snapshot.nodes[1].parentId='unknown';next.snapshot.nodes[1].parentId='unknown';assert.deepEqual(next.run(),old.run());
});
const after=guard('after-private-regressions'),attempt=process.argv[2]||'01';assert.match(attempt,/^\d{2}$/);fs.writeFileSync(root+'/REGRESSION-'+attempt+'.json',JSON.stringify({checks,passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,after,kind:'synthetic private regression, no native/model calls',Ready:false})+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,failures:checks.filter(c=>c.status==='FAIL').map(c=>({name:c.name,error:c.error}))}));
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
