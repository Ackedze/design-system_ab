const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {root,W,guard,pin}=require('./guard.cjs'),{fixture,clone}=require('./scoped-fixture.cjs');
(async()=>{
 const before=guard('before-repair-checks'),checks=[],attempt=process.argv[2]||'01',E=root+'/workspace/candidate/projects/ComponentContractEditor',C=root+'/workspace/candidate/projects/Apollo-v3/packages/component-contract-core';assert.match(attempt,/^\d{2}$/);
 for(const [name,args]of [['scoped-node',['--test',E+'/tests/scoped-fixed-nested.test.js']],['owned-code-node',['--test',C+'/tests/code-passport.test.js']],['typecheck',[W+'/projects/ComponentContractEditor/node_modules/typescript/bin/tsc','--noEmit','--project',E+'/tsconfig.json']],['compatibility',[root+'/regression.cjs',attempt]]]){
  const r=cp.spawnSync('/usr/local/bin/node',args,{encoding:'utf8',env:{...process.env,TMPDIR:root+'/workspace/tmp'}});
  fs.writeFileSync(root+'/CHECK-'+name+'-'+attempt+'.log',r.stdout+r.stderr,{flag:'wx'});assert.equal(r.status,0,r.stdout+r.stderr);
  checks.push({name,status:'PASS',log:pin(root+'/CHECK-'+name+'-'+attempt+'.log')});
 }
 const core=require(C+'/dist/core.cjs'),old=require(root+'/workspace/baseline/projects/Apollo-v3/packages/component-contract-core/dist/core.cjs');
 const {scenario}=require(C+'/tests/helpers/direct-code-group.cjs'),{ownBindings}=require(C+'/tests/helpers/code-passport.cjs');
 const f=ownBindings(scenario()),legacy=clone(core.compileManualSource(f.manual,f.evidence,[f.childContract]).contract);
 assert.deepEqual(core.projectOwnedCodeCollection(legacy,f.snapshot,'code'),old.projectOwnedCodeCollection(legacy,f.snapshot,'code'));
 checks.push({name:'legacy owned projection including evidenceHash remains exact',status:'PASS'});
 const childPath=Object.entries(f.snapshot.variantReference.nodeProperties).find(([p,v])=>p&&v.identity?.componentSetKey==='button-set')[0];
 f.manual.componentDependencies[0].bindings.push({kind:'fixed-nested-scoped',id:'scoped-extra',targetRole:'root',relativePath:'',ownerComponentSetKeys:['group-set'],activeVariant:{property:'Background',values:['True']},childPath,representationIds:['desktop']});
 f.snapshot.nodes[0].component.properties.Background='True';f.snapshot.nodes[0].component.propertyTypes.Background='VARIANT';f.snapshot.variantReference=core.captureVariantReference(clone(f.snapshot),'group-variant','group-set');
 const compiled=core.compileManualSource(f.manual,f.evidence,[f.childContract]);assert.equal(compiled.issues.filter(i=>i.level==='error').length,0);
 const contract=compiled.contract,profile=require(root+'/workspace/candidate/projects/Apollo-v3/apps/apollo-v4/dist/profile.cjs'),engine=require(C+'/dist/predicate.cjs');
 assert.equal(profile.assertRuntimeContract(contract,engine,{evaluationMode:'authoring-preview'}),contract);
 assert.equal(core.projectOwnedCodeCollection(contract,f.snapshot,'code').elements.length,4);
 const forged=clone(legacy);forged.runtimePolicy.crossRepresentationBindingsVersion=2;
 for(const c of [forged,...[undefined,1,3].map(v=>{const c=clone(contract);c.runtimePolicy.crossRepresentationBindingsVersion=v;return c;})])assert.throws(()=>profile.assertRuntimeContract(c,engine,{evaluationMode:'authoring-preview'}),/Unsupported representation evidence\/bindings/);
 checks.push({name:'mixed canonical V4 profile accepts supported version and refuses missing mismatched future versions',status:'PASS'});
 const editor=require(E+'/dist/core.cjs'),base=require(root+'/workspace/baseline/projects/ComponentContractEditor/dist/core.cjs'),legacyFixture=fixture('baseline'),manual=clone(legacyFixture.manual);manual.schemaVersion=base.LEGACY_MANUAL_SCHEMA_VERSION;manual.componentDependencies=[];
 const files=[{name:'contract.manual.json',text:JSON.stringify(manual)}],RealDate=Date,fixed='2026-01-01T00:00:00.000Z';
 try{global.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return RealDate.parse(fixed);}};assert.deepEqual(editor.importWorkspace(files),base.importWorkspace(files));}finally{global.Date=RealDate;}
 checks.push({name:'legacy import remains exact with controlled migration clock',status:'PASS'});
 const frozen=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;
 for(const label of ['BenefitCard.r7','BenefitCard.r8']){
  const p=frozen.find(x=>x.original.path.includes(label)).copy,entries=(await editor.readZip(fs.readFileSync(p.path))).filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:editor.zipEntryText(e)}));
  const o=editor.importWorkspace(entries),compiled=editor.compileManualSource(o.manual,o.variantEvidence,o.dependencyContracts);
  assert.equal(compiled.issues.filter(i=>i.level==='error').length,0);assert.equal(editor.stableHash(compiled.contract),editor.stableHash(o.compiledInput));
  checks.push({name:label+' exact historical compiled hash',status:'PASS',input:p});
 }
 fs.writeFileSync(root+'/REPAIR-CHECKS-'+attempt+'.json',JSON.stringify({before,after:guard('after-repair-checks'),checks,Ready:false},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({checks:checks.length,status:'PASS'}));
})().catch(error=>{const p=root+'/FIRST-REPAIR-CHECK-FAILURE.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
