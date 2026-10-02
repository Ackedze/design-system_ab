const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring'),history=path.resolve(root,'../history/r8-editor-0.2.63');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
function immutable(file,data){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(data));else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data,{flag:'wx'});}}
function archive(){
 for(const n of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'])if(!fs.existsSync(path.join(history,n))){assert.equal(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))).metadata.revision,8);immutable(path.join(history,n),fs.readFileSync(path.join(root,n)));}
 for(const t of ['06-28-36-859','06-30-28-788']){const file=`amount-styles.validation-report.2026-09-30T${t}Z.json`;immutable(path.join(root,'reports/fixtures/r8-editor-0.2.63',file+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,'editor',file)),{level:9}));}
}
function review(){
 const contract=JSON.parse(fs.readFileSync(path.resolve(root,'../history/r9-editor-0.2.64/compiled/component-contract.v2.json'))),runtime=core.prepareAuthoringPreviewContract(contract),results=[];
 const previous=core.prepareAuthoringPreviewContract(JSON.parse(fs.readFileSync(path.join(history,'compiled/component-contract.v2.json'))));
 for(const dir of ['r2-editor-0.2.59','r3-editor-0.2.60','r4-editor-0.2.61','r5-editor-0.2.62','r6-editor-0.2.63','r7-editor-0.2.63','r8-editor-0.2.63'])for(const file of fs.readdirSync(path.join(root,'reports/fixtures',dir)).filter(n=>n.endsWith('.gz'))){
  const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures',dir,file))),r=JSON.parse(bytes);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
  const before=core.evaluateCompiledContract(r.snapshot,previous),after=core.evaluateCompiledContract(r.snapshot,runtime);
  const old=e=>e.evaluations.filter(v=>!v.ruleId.includes('manual-interactive-decoration-is-forbidden')).map(v=>[v.ruleId,v.subjectNodeId,v.classification]);
  assert.deepEqual(old(after),old(before),file);
  const decoration=after.evaluations.filter(e=>e.ruleId.includes('manual-interactive-decoration-is-forbidden'));
  assert(decoration.some(e=>e.classification==='human-review'),'Old captures must not invent decoration facts');
  results.push({file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),originalExactReplay:true,existingVerdictsPreserved:true,decoration:decoration.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{})});
 }
 assert.equal(results.length,46);return {date:'2026-09-30',manualRevision:9,editorVersion:'0.2.64',compiledHash:core.stableHash(contract),liveAcceptance:'pending-r9',r8Acceptance:{violationsBefore:13,violationsAfter:0,warningsAfter:0,scope:'Paragraph layout overrides/reset only'},results};
}
if(require.main===module){if(process.argv.includes('--archive'))archive();else{const r=review();if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/replay-r9.2026-09-30.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}}
module.exports={archive,review};
