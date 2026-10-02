const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring'),history=path.resolve(root,'../history/r5-editor-0.2.62');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
function immutable(file,data){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(data));else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data,{flag:'wx'});}}
function archive(){
 for(const n of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'])if(!fs.existsSync(path.join(history,n))){assert.equal(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))).metadata.revision,5);immutable(path.join(history,n),fs.readFileSync(path.join(root,n)));}
 for(const t of ['19-30-03-448','19-30-38-075','19-30-53-102']){const n=`amount-styles.validation-report.2026-09-29T${t}Z.json`;immutable(path.join(root,'reports/fixtures/r5-editor-0.2.62',n+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,'editor',n)),{level:9}));}
}
function review(){
 const c=JSON.parse(fs.readFileSync(path.resolve(root,'../history/r6-editor-0.2.63/compiled/component-contract.v2.json'))),runtime=core.prepareAuthoringPreviewContract(c),results=[];
 const previous=core.prepareAuthoringPreviewContract(JSON.parse(fs.readFileSync(path.join(history,'compiled/component-contract.v2.json'))));
 for(const dir of ['r2-editor-0.2.59','r3-editor-0.2.60','r4-editor-0.2.61','r5-editor-0.2.62'])for(const file of fs.readdirSync(path.join(root,'reports/fixtures',dir)).filter(n=>n.endsWith('.gz'))){
  const r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures',dir,file))));
  assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
  const before=core.evaluateCompiledContract(r.snapshot,previous),after=core.evaluateCompiledContract(r.snapshot,runtime);
  const simple=e=>e.evaluations.filter(v=>!v.ruleId.includes('addon-does-not-exceed-text-line-height')).map(v=>[v.ruleId,v.classification]);
  assert.deepEqual(simple(after),simple(before));
  results.push({file,originalExactReplay:true,existingVerdictsPreserved:true,heightChecks:after.evaluations.filter(e=>e.ruleId.includes('addon-does-not-exceed-text-line-height')).map(e=>({ruleId:e.ruleId,classification:e.classification})),classifications:after.coverage.byClassification});
 }
 assert.equal(results.length,38);return {date:'2026-09-29',manualRevision:6,editorVersion:'0.2.63',compiledHash:core.stableHash(c),liveAcceptance:'pending-r6',r5LiveAcceptance:'accepted: IconView allowed, Button forbidden, hidden Addon allowed',results};
}
if(require.main===module){if(process.argv.includes('--archive'))archive();else{const r=review();if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/replay-r6.2026-09-29.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}}
module.exports={archive,review};
