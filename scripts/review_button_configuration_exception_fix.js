// Offline re-evaluation is distinct from a new Figma capture. Original reports stay immutable.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
// Historical acceptance is pinned; newer canonical manuals must not rewrite r28 QA.
const read=p=>JSON.parse(p==='compiled/component-contract.v2.json'
 ?zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r28-editor-0.2.49/component-contract.v2.json.gz')))
 :fs.readFileSync(path.join(root,p==='contract.manual.json'?'history/r28-editor-0.2.49/contract.manual.json':p)));
const clone=x=>JSON.parse(JSON.stringify(x));
const manifest=read('qa/text-layout-live-review.2026-09-29.json');
const load=item=>{const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);return JSON.parse(bytes);};
const baselineId='component:web-core.button.internal-sizing-locked.1.1';
const textId='component:web-core.button.text-resizing-maps-to-figma-layout.1.1';
const compile=r=>core.compileManualSource(r.sources.manual,r.sources.compiledContract.facts.variantEvidence,r.sources.compiledContract.componentDependencies.map(d=>d.contract));
function review() {
 const first=load(manifest.reportResults[0]),compiled=compile(first);
 assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 assert.deepEqual(read('contract.manual.json'),first.sources.manual);
 assert.equal(core.stableHash(read('compiled/component-contract.v2.json')),core.stableHash(compiled.contract));
 assert.deepEqual(compiled.contract.facts,first.sources.compiledContract.facts);
 assert.deepEqual(compiled.contract.componentDependencies,first.sources.compiledContract.componentDependencies);
 const changed=compiled.contract.rules.filter((r,i)=>core.stableHash(r)!==core.stableHash(first.sources.compiledContract.rules[i])).map(r=>r.ruleId);
 assert.deepEqual(changed.sort(),[baselineId,textId,textId+'.specification'].sort());
 const results=[];
 for(const item of manifest.reportResults) {
  const r=load(item),old=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.deepEqual(old,r.results.engine);
  const oldEditor=core.buildEditorValidationReport(old,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
  assert.deepEqual(clone(oldEditor),r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(oldEditor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
  const active=core.prepareAuthoringPreviewContract(compiled.contract),now=core.evaluateCompiledContract(r.snapshot,active);
  assert.equal(now.evaluations.length,old.evaluations.length);
  const delta=[];
  for(let i=0;i<now.evaluations.length;i++) {
   const a=now.evaluations[i],b=old.evaluations[i];
   assert.equal(a.ruleId,b.ruleId);assert.equal(a.subjectNodeId,b.subjectNodeId);
   if(a.classification!==b.classification)delta.push({ruleId:a.ruleId,subjectNodeId:a.subjectNodeId,before:b.classification,after:a.classification});
  }
  assert.deepEqual(delta,item.caseId==='TL10B'?[{ruleId:baselineId,subjectNodeId:'preview:2',before:'human-review',after:'compliant'}]:[]);
  assert.deepEqual(now.dependencyRuns,old.dependencyRuns);
  results.push({caseId:item.caseId,mode:item.mode,fixtureFile:item.fixtureFile,sha256:item.sha256,evaluations:now.evaluations.length,delta,oldReplayExact:true});
 }
 return {status:'compiler-fixed-offline-verified-live-retest-pending',reviewedAt:'2026-09-29',editorVersion:'component-contract-editor@0.2.49',manualRevision:28,manualSourceHash:core.stableHash(first.sources.manual),compiledStableHash:core.stableHash(compiled.contract),changedRuleIR:changed,manualChanged:false,generatedFactsChanged:false,spinnerChanged:false,reportCount:results.length,engineEvaluations:results.reduce((n,r)=>n+r.evaluations,0),reportResults:results,contractReady:false,limits:['Offline replay is not live Figma acceptance. Retest TL10B audit/specification on 0.2.49.','Missing block intent, absent before-state and context-only nowrap/blur remain incomplete, not implicitly passed.']};
}
module.exports={core,root,read,clone,manifest,load,compile,baselineId,textId,review};
if(require.main===module){const result=review();fs.writeFileSync(path.join(root,'qa/configuration-exception-fix.2026-09-29.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,reports:result.reportCount,evaluations:result.engineEvaluations,changes:result.reportResults.flatMap(r=>r.delta)},null,2));}
