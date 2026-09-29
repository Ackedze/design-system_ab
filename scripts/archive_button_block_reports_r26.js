// Derived QA evidence; never edits the user's original reports.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-core/core/Button');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const reportResults=[];
for(const [i,time] of ['17-31-58-804','17-32-16-075','17-32-30-016','17-32-58-731','17-33-49-978'].entries()){
 const name=`button.validation-report.2026-09-28T${time}Z.json`,relative=`qa/fixtures/block-r26/${name}.gz`,target=path.join(root,relative);
 const bytes=fs.existsSync(target)?zlib.gunzipSync(fs.readFileSync(target)):fs.readFileSync(path.join(root,'editor',name));const r=JSON.parse(bytes);
 if(r.run.manualRevision!==26||r.editorVersion!=='component-contract-editor@0.2.46'||r.run.manualSourceHash!=='f3963a068edb1eb85fe386858ce7e20e371d60ac721b95840ad922e0f9bfd118')throw Error(name);
 const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
 const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
 for(const [actual,expected] of [[engine,r.results.engine],[editor,r.results.editor],[core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy),r.results.details]])if(core.stableHash(actual)!==core.stableHash(expected))throw Error('Replay mismatch '+name);
 if(!fs.existsSync(target)){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,zlib.gzipSync(bytes),{flag:'wx'});}
 reportResults.push({caseId:`BI0${i+1}`,fixtureFile:relative,sha256:sha(bytes),intent:r.snapshot.validationIntent.values,layout:r.snapshot.nodes[0].layout.sizingHorizontal,parent:r.snapshot.nodes[0].parent.layout.mode,violations:engine.evaluations.filter(e=>e.classification==='violation').length});
}
const review={status:'accepted-mechanics-bi01-bi05-not-whole-contract',editorVersion:'component-contract-editor@0.2.46',manualRevision:26,engineEvaluations:415,reportResults,notCovered:['BI06 missing input','BI07 changed instance'],note:'r27 supersedes ordinary audit semantics. These originals retain exact r26 replay.'};
fs.writeFileSync(path.join(root,'qa/block-live-review.2026-09-28.json'),JSON.stringify(review,null,2)+'\n');
console.log('Archived and replayed 5 r26 reports / 415 engine evaluations.');
