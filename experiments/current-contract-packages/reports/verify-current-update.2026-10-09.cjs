const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),workspace=path.resolve(root,'../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
(async()=>{
 const checks=[];
 for(const [folder,file]of [['BenefitCard','BenefitCard.component-contract.zip'],['ButtonsGroup','ButtonsGroup.component-contract.zip'],['ButtonsGroup/mobile-web','ButtonsGroup.mobile-web.component-contract.zip']]){
  const pending=fs.existsSync(path.join(root,file+'.pending')),entries=await core.readZip(fs.readFileSync(path.join(root,file+(pending?'.pending':''))));
  const files=entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)}));
  const manual=JSON.parse(fs.readFileSync(path.join(root,folder,'authoring/contract.manual.json'))),compiled=JSON.parse(fs.readFileSync(path.join(root,folder,'authoring/compiled/component-contract.v2.json')));
  const zipManual=JSON.parse(files.find(f=>f.name==='contract.manual.json').text),zipCompiled=JSON.parse(files.find(f=>f.name==='compiled/component-contract.v2.json').text);
  assert.deepEqual(zipManual,manual);assert.deepEqual(zipCompiled,compiled);
  for(const rep of manual.representations.filter(r=>r.kind==='figma'&&r.status!=='deprecated')){
   const id=manual.component.contractId.replace(/desktop$/,rep.platform),w=core.importWorkspace(files,id);
   assert.deepEqual(w.manual,manual);assert(w.anatomy.length);
   const b=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);
   assert.equal(b.validation.valid,true);assert.deepEqual(JSON.parse(JSON.stringify(b.compiled)),compiled);
  }
  if(folder==='BenefitCard'){
   assert.equal(manual.targets.flatMap(t=>t.identityBindingsV1).filter(b=>b.portableReferenceHash).length,96);
   const c=core.prepareAuthoringPreviewContract(compiled);
   const replays=fs.readdirSync(path.join(root,folder)).filter(f=>/^benefit-card\.validation-report\./.test(f)).map(f=>core.evaluateCompiledContract(JSON.parse(fs.readFileSync(path.join(root,folder,f))).snapshot,c));
   assert.equal(replays.length,10);assert.equal(replays.flatMap(r=>r.evaluations).filter(e=>e.classification==='violation').length,4);assert.equal(replays.flatMap(r=>r.evaluations).filter(e=>e.classification==='human-review').length,0);
  }else{
   const recipe=JSON.parse(files.find(f=>f.name==='context/recipe-rules.json').text);assert.equal(recipe.rules.length,9);assert.equal(compiled.nonExecutableRules.length,0);
   const pin=compiled.componentDependencies.find(d=>d.componentId==='core.web.button');assert.equal(pin.revision,31);assert.equal(pin.contract.componentDependencies[0].revision,8);
  }
  checks.push({folder,file,revision:manual.metadata.revision,status:compiled.status,sourceRules:manual.rules.length,predicates:compiled.rules.length,entries:entries.length,result:'PASS_ZIP_REOPEN_COMPILE'});
 }
 fs.writeFileSync(path.join(root,'reports/final-package-checks.2026-10-09.json'),JSON.stringify({date:'2026-10-09',checks},null,2)+'\n');console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
