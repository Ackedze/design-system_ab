const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring');
const history=path.resolve(root,'../history/r4-editor-0.2.61');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
function immutable(file,data){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(data));else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data,{flag:'wx'});}}
function archive(){
 for(const n of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'])if(!fs.existsSync(path.join(history,n))){assert.equal(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))).metadata.revision,4);immutable(path.join(history,n),fs.readFileSync(path.join(root,n)));}
 for(const t of ['19-07-54-167','19-08-01-464']){const n=`amount-styles.validation-report.2026-09-29T${t}Z.json`;immutable(path.join(root,'reports/fixtures/r4-editor-0.2.61',n+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,'editor',n)),{level:9}));}
}
function review(){
 const c=JSON.parse(fs.readFileSync(path.resolve(root,'../history/r5-editor-0.2.62/compiled/component-contract.v2.json'))),runtime=core.prepareAuthoringPreviewContract(c),results=[];
 for(const dir of ['r2-editor-0.2.59','r3-editor-0.2.60','r4-editor-0.2.61'])for(const file of fs.readdirSync(path.join(root,'reports/fixtures',dir)).filter(n=>n.endsWith('.gz'))){
  const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures',dir,file))),r=JSON.parse(bytes),raw=JSON.stringify(r.snapshot);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
  const previous=JSON.parse(fs.readFileSync(path.join(history,'compiled/component-contract.v2.json')));
  const before=core.evaluateCompiledContract(r.snapshot,core.prepareAuthoringPreviewContract(previous)),after=core.evaluateCompiledContract(r.snapshot,runtime);
  const simple=e=>e.evaluations.map(v=>[v.ruleId,v.classification]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const swap=r.snapshot.source.rootNodeId==='13161:65182';
  assert.deepEqual(simple(after),simple(before).map(([id,result])=>[id,swap&&id.includes('addon-uses-supported-components')?'compliant':result]));
  assert.equal(JSON.stringify(r.snapshot),raw);
  results.push({file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),rootNodeId:r.snapshot.source.rootNodeId,originalExactReplay:true,classifications:after.coverage.byClassification});
 }
 assert.equal(results.length,35);return {date:'2026-09-29',manualRevision:5,editorVersion:'0.2.62',compiledHash:core.stableHash(c),manualSourceHash:c.package.manualSourceHash,interpretation:'35 captures replayed offline. Two r4 live reports accepted; r5 live Addon retest pending.',results};
}
if(require.main===module){if(process.argv.includes('--archive'))archive();else{const r=review();if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/replay-r5.2026-09-29.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({reports:r.results.length}));}}
module.exports={review,archive};
