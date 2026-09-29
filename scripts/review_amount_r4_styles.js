// Current contract against immutable old captures: replay, NOT new live acceptance.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Amount/authoring');
const coreFile=path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),core=require(coreFile);
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json'),runtime=core.prepareAuthoringPreviewContract(compiled);
assert.equal(manual.metadata.revision,4);assert.equal(compiled.package.manualSourceHash,core.stableHash(manual));
const dir='reports/fixtures/r3-editor-0.2.56',results=[];
for(const name of fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.json.gz')).sort()){
  const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,dir,name))),r=JSON.parse(bytes),s=r.snapshot,before=JSON.stringify(s);
  const previous=core.evaluateCompiledContract(s,r.runtime.evaluatedContract);
  assert.equal(core.stableHash(previous),core.stableHash(r.results.engine));
  const engine=core.evaluateCompiledContract(s,runtime),editor=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,s);
  const ids=e=>e.evaluations.filter(x=>x.classification==='violation').map(x=>x.ruleId).sort();
  const old=ids(previous),actual=ids(engine),added=actual.filter(id=>!old.includes(id));
  const expected=name.includes('13-06-02-132')?['component:web-core.amount.currency-text-style-binding-required.1.1']:
    name.includes('13-07-37-413')?['component:web-core.amount.major-text-style-binding-required.1.1']:[];
  assert.deepEqual(added,expected);assert(old.every(id=>actual.includes(id)));assert(editor.scenarioCoverage.complete);
  assert.equal(JSON.stringify(s),before);assert.deepEqual(core.evaluateCompiledContract(s,runtime),engine);
  results.push({fixtureFile:dir+'/'+name,sha256:sha(bytes),rootNodeId:s.source.rootNodeId,oldViolations:old,newViolations:actual,addedViolations:added,complete:editor.scenarioCoverage.complete,rawCaptureUnchanged:true});
}
const output={schemaVersion:'amount.text-style-binding-review.v1',date:'2026-09-29',manualRevision:4,manualSourceHash:core.stableHash(manual),sourceBundleHash:manual.source.sourceHash,
  editorVersion:require(path.resolve(repo,'../../projects/ComponentContractEditor/package.json')).version,coreByteSha256:sha(fs.readFileSync(coreFile)),
  interpretation:'r4 replay of immutable r3 capture; not new Figma live acceptance. Previous complete flag did not cover detached Text Styles.',liveAcceptance:'pending',
  counts:{reports:results.length,additionalViolations:results.reduce((n,r)=>n+r.addedViolations.length,0),complete:results.filter(r=>r.complete).length},results};
if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/text-style-binding-r4.2026-09-29.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
