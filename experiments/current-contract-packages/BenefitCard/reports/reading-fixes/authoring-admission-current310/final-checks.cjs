const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {root,W,guard,pin}=require('./guard.cjs'),{fixture,clone}=require('./scoped-fixture.cjs');
(async()=>{
 const before=guard('before-final-candidate-checks'),checks=[],attempt=process.argv[2]||'01';assert.match(attempt,/^\d{2}$/);
 const E=root+'/workspace/candidate/projects/ComponentContractEditor';
 for(const [name,args]of [['portable-node-tests',['--test',E+'/tests/scoped-fixed-nested.test.js']],['typecheck',[W+'/projects/ComponentContractEditor/node_modules/typescript/bin/tsc','--noEmit','--project',E+'/tsconfig.json']],['private-regression',[root+'/regression.cjs','04']]]){
  const result=cp.spawnSync('/usr/local/bin/node',args,{encoding:'utf8',env:{...process.env,TMPDIR:root+'/workspace/tmp'}});
  fs.writeFileSync(root+'/FINAL-'+name+'-'+attempt+'.log',result.stdout+result.stderr,{flag:'wx'});assert.equal(result.status,0,name+': '+result.stdout+result.stderr);
  checks.push({name,status:'PASS',log:pin(root+'/FINAL-'+name+'-'+attempt+'.log')});
 }
 const old=require(root+'/workspace/baseline/projects/ComponentContractEditor/dist/core.cjs'),core=require(E+'/dist/core.cjs');
 const f=fixture('baseline'),manual=clone(f.manual);manual.schemaVersion=old.LEGACY_MANUAL_SCHEMA_VERSION;manual.componentDependencies=[];
 const files=[{name:'contract.manual.json',text:JSON.stringify(manual)}],RealDate=Date,fixed='2026-01-01T00:00:00.000Z';
 try{
  global.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return RealDate.parse(fixed);}};
  assert.deepEqual(core.importWorkspace(files),old.importWorkspace(files));
 }finally{global.Date=RealDate;}
 checks.push({name:'legacy v1 import exact with the same controlled migration clock',status:'PASS'});
 const frozen=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;
 for(const label of ['BenefitCard.r7','BenefitCard.r8']){
  const input=frozen.find(x=>x.original.path.includes(label)),entries=(await core.readZip(fs.readFileSync(input.copy.path))).filter(x=>x.name.endsWith('.json')).map(x=>({name:x.name,text:core.zipEntryText(x)}));
  const o=core.importWorkspace(entries),result=core.compileManualSource(o.manual,o.variantEvidence,o.dependencyContracts);
  assert.equal(result.issues.filter(x=>x.level==='error').length,0);assert.equal(core.stableHash(result.contract),core.stableHash(o.compiledInput));
  checks.push({name:label+' historical compiled hash exact',status:'PASS',input:input.copy,compiledHash:core.stableHash(result.contract)});
 }
 const portable=JSON.parse(fs.readFileSync(root+'/PORTABLE-UI-TESTS-'+attempt+'.json'));assert.equal(portable.status,0);
 const uiReport=root+'/workspace/portable-ui-'+attempt+'/UI-ADMISSION-candidate-01.json',ui=JSON.parse(fs.readFileSync(uiReport));assert.equal(ui.checks.length,8);assert.ok(ui.checks.every(x=>x.status==='PASS'));
 checks.push({name:'portable actual UI/controller eight-gate smoke',status:'PASS',report:pin(uiReport)});
 fs.writeFileSync(root+'/FINAL-CHECKS-'+attempt+'.json',JSON.stringify({before,after:guard('after-final-candidate-checks'),checks,versions:{core:'0.1.19',editor:'0.2.106'},nativeModelCalls:0,Ready:false},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({checks:checks.length,portableNode:25,privateRegressions:35,ui:8,typecheck:'PASS',legacyImport:'exact',legacyPackages:2}));
})().catch(error=>{const p=root+'/FIRST-FINAL-CHECKS-FAILURE.json';if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
