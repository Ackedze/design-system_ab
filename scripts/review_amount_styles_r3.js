// Immutable live r2 evidence replayed against r3; this is not new live acceptance.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-corp/AmountStyles/authoring');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const history=path.resolve(root,'../history/r3-editor-0.2.60');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const readR3=p=>JSON.parse(fs.readFileSync(path.join(fs.existsSync(history)?history:root,p)));
const dir='reports/fixtures/r2-editor-0.2.59';
if(process.argv.includes('--archive')) {
  fs.mkdirSync(path.join(root,dir),{recursive:true});
  for(const name of fs.readdirSync(path.join(root,'editor')).filter(n=>/^amount-styles\.validation-report\.2026-09-29T18-.*\.json$/.test(n))) {
    const bytes=fs.readFileSync(path.join(root,'editor',name)),target=path.join(root,dir,name+'.gz');
    if(JSON.parse(bytes).run.manualRevision!==2)continue;
    if(fs.existsSync(target))assert(zlib.gunzipSync(fs.readFileSync(target)).equals(bytes));
    else fs.writeFileSync(target,zlib.gzipSync(bytes,{level:9}),{flag:'wx'});
  }
}
function review() {
  const manual=readR3('contract.manual.json'),compiled=readR3('compiled/component-contract.v2.json'),runtime=core.prepareAuthoringPreviewContract(compiled);
  assert.equal(manual.metadata.revision,3);
  assert.equal(core.stableHash(manual),compiled.package.manualSourceHash);
  const cases=read('reports/figma-testcases-r2.2026-09-29.json').cases,seen=new Set(),results=[];
  let bindingAssertions=0;
  for(const name of fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.json.gz')).sort()) {
    const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,dir,name))),r=JSON.parse(bytes),before=JSON.stringify(r.snapshot);
    assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
    const engine=core.evaluateCompiledContract(r.snapshot,runtime),editor=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,r.snapshot);
    const violationIds=engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
    const oldIds=r.results.engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
    assert.deepEqual(violationIds,oldIds.filter(id=>!id.includes('fixed-part-order')),name);
    assert.equal(engine.evaluations.find(e=>e.ruleId.includes('fixed-part-order')).classification,'compliant',name);
    const c=cases.find(c=>c.instanceId===r.snapshot.source.rootNodeId);
    if(c){seen.add(c.caseId);for(const [id,outcome] of Object.entries(c.expectedRuleOutcomes)) {
      const evaluations=engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
      assert(evaluations.length>0,id);
      assert.equal(evaluations.some(e=>e.classification==='violation'),outcome==='fail',c.caseId+':'+id);
      if(outcome==='pass')assert(evaluations.every(e=>e.classification==='compliant'),c.caseId+':'+id);
      bindingAssertions++;
    }}
    assert.equal(JSON.stringify(r.snapshot),before);
    assert.deepEqual(core.evaluateCompiledContract(r.snapshot,runtime),engine);
    results.push({fixtureFile:dir+'/'+name,sha256:sha(bytes),caseId:c?.caseId||null,rootNodeId:r.snapshot.source.rootNodeId,
      violations:violationIds,dependencyRuns:engine.dependencyRuns,complete:editor.scenarioCoverage.complete,
      classifications:engine.coverage.byClassification,rawCaptureUnchanged:true});
  }
  assert.equal(results.length,31);assert.equal(seen.size,29);assert.equal(bindingAssertions,87);
  const output={schemaVersion:'amount-styles.live-review.v1',date:'2026-09-29',manualRevision:3,editorVersion:'0.2.60',
    manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(compiled),
    interpretation:'31 original r2 captures replayed offline against r3. AS-B binding live evidence accepted 87/87; r3 live retest pending. Six context-only rules remain.',
    counts:{reports:results.length,matchedCases:seen.size,bindingAssertions},results};
  if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/live-review-r3.2026-09-29.json'),JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module)console.log(JSON.stringify(review().counts));
module.exports={review};
