const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
const history=path.resolve(root,'../history/r3-editor-0.2.60');
function immutable(file,bytes){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(bytes),file);else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});}}
function archive(){
  if(!fs.existsSync(path.join(history,'contract.manual.json')))assert.equal(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))).metadata.revision,3);
  for(const name of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'])if(!fs.existsSync(path.join(history,name)))immutable(path.join(history,name),fs.readFileSync(path.join(root,name)));
  for(const t of ['18-47-36-079','18-47-56-009']){
    const name=`amount-styles.validation-report.2026-09-29T${t}Z.json`,bytes=fs.readFileSync(path.join(root,'editor',name));
    immutable(path.join(root,'reports/fixtures/r3-editor-0.2.60',name+'.gz'),zlib.gzipSync(bytes,{level:9}));
  }
}
function review(){
  const archived=path.resolve(root,'../history/r4-editor-0.2.61');
  const read=p=>JSON.parse(fs.readFileSync(path.join(fs.existsSync(archived)?archived:root,p))),manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json');
  assert.equal(manual.metadata.revision,4);assert.equal(core.stableHash(manual),compiled.package.manualSourceHash);
  const runtime=core.prepareAuthoringPreviewContract(compiled),results=[];
  const bindingIds=['manual-text-style-is-layer-property','parts-share-color','parts-share-text-style'].map(id=>'component:web-corp.amount-styles.'+id+'.1.1');
  for(const dir of ['r2-editor-0.2.59','r3-editor-0.2.60'])for(const name of fs.readdirSync(path.join(root,'reports/fixtures',dir)).filter(n=>n.endsWith('.json.gz')).sort()){
    const file='reports/fixtures/'+dir+'/'+name,bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,file))),r=JSON.parse(bytes),raw=JSON.stringify(r.snapshot);
    assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
    const old=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
    assert.deepEqual(JSON.parse(JSON.stringify(old)),r.results.engine);
    const engine=core.evaluateCompiledContract(r.snapshot,runtime),editor=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,r.snapshot);
    const ids=e=>e.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
    const expected=ids(old).filter(id=>id!=='component:web-corp.amount-styles.fixed-part-order.1.1');
    const opacity=name.includes('18-26-22-115')||name.includes('18-47-36-079');
    assert.deepEqual(ids(engine),[...expected,...(opacity?bindingIds:[])].sort(),name);
    if(opacity){assert.equal(engine.evaluations.filter(e=>e.classification==='human-review').length,0);assert.equal(ids(engine).filter(id=>id.includes('.opacity-')).length,4);}
    assert.equal(JSON.stringify(r.snapshot),raw);assert.deepEqual(core.evaluateCompiledContract(r.snapshot,runtime),engine);
    results.push({fixtureFile:file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),rootNodeId:r.snapshot.source.rootNodeId,
      originalExactReplay:true,rawCaptureUnchanged:true,violations:ids(engine),classifications:engine.coverage.byClassification,complete:editor.scenarioCoverage.complete,notExecuted:editor.scenarioCoverage.notExecuted});
  }
  assert.equal(results.length,33);
  const output={date:'2026-09-29',manualRevision:4,editorVersion:'0.2.61',manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(compiled),
    interpretation:'Offline r4 replay of 33 immutable r2/r3 captures, not new r4 Figma acceptance. Three formerly unknown binding checks now report real violations in two opacity captures. Six context-only checks and Addon swap mapping remain open.',results};
  if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/live-review-r4.2026-09-29.json'),JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module){if(process.argv.includes('--archive')){archive();console.log('Archived r3 and two live captures.');}else console.log(JSON.stringify({reports:review().results.length}));}
module.exports={root,history,core,review};
