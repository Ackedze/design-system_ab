const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-corp/CorporateContent/mobile-web/authoring');
const defaultName='corporate-content.validation-report.2026-10-01T17-59-37-209Z.json';
const clone=x=>JSON.parse(JSON.stringify(x)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function review(name=defaultName,record=false){
 assert(/^corporate-content\.validation-report\.[0-9TZ-]+\.json$/.test(name),'Expected a report filename from current-contract-packages.');
 const original=path.join(repo,'experiments/current-contract-packages',name),archived=path.join(root,'reports/fixtures/editor-0.2.73',name+'.gz');
 const bytes=fs.existsSync(original)?fs.readFileSync(original):zlib.gunzipSync(fs.readFileSync(archived)),report=JSON.parse(bytes);
 assert.equal(report.schemaVersion,'apollo.editor-validation-report.v1');assert.equal(report.editorVersion,'component-contract-editor@0.2.73');
 const canonical=JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))),normalized=clone(report.sources.manual);
 normalized.metadata.revision=canonical.metadata.revision;normalized.metadata.updatedAt=canonical.metadata.updatedAt;assert.deepEqual(normalized,canonical);
 assert.equal(core.stableHash(report.sources.manual),report.run.manualSourceHash);assert.equal(core.stableHash(report.snapshot),report.run.snapshotHash);
 assert.equal(core.stableHash(report.runtime.evaluatedContract),report.run.evaluatedContractHash);
 assert.equal(core.validationSnapshotHash(report.snapshot,report.runtime.evaluatedContract),report.run.engineSnapshotHash);
 const engine=core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract);assert.deepEqual(clone(engine),report.results.engine);
 const editor=core.buildEditorValidationReport(engine,{contract:report.sources.compiledContract,issues:report.sources.compilerIssues},report.sources.manual,report.snapshot);assert.deepEqual(clone(editor),report.results.editor);
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/CorporateContent.mobile-web.component-contract.zip')));
 const workspace=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const bundle=core.buildExportBundle(report.sources.manual,workspace.variantEvidence,workspace.dependencyContracts);
 assert.deepEqual(clone(bundle.compiled),report.sources.compiledContract);assert.deepEqual(clone(bundle.compiled),report.runtime.evaluatedContract);
 assert.equal(report.run.capture.matchedBaselineNodes,6);assert.deepEqual(report.run.capture.unmatchedBaselineNodeIds,[]);
 assert.equal(report.snapshot.source.captureTopology.complete,true);assert.equal(report.snapshot.source.truncated,false);
 assert.equal(core.compareInstanceBoundaries(report.snapshot,report.snapshot.variantReference).complete,true);
 for(const snapshot of[report.snapshot,report.snapshot.instanceContentReferences.base]){
  assert.equal(snapshot.source.instanceSourceIdentityVersion,1);assert.equal(snapshot.source.instanceSourceIdentityCapture.owners.length,1);
  assert.equal(snapshot.source.instanceSourceIdentityCapture.owners[0].status,'captured');
 }
 const sourceIds=report.snapshot.nodes.filter(n=>n.component?.sourceIdentity).map(n=>n.component.sourceIdentity.sourceNodeId).sort();assert.deepEqual(sourceIds,['89653:28855','89653:28857']);
 assert.equal(editor.editorCoverage.complete,true);assert.equal(editor.editorCoverage.engineEvaluations,17);assert.equal(editor.editorCoverage.inconclusive,0);assert.equal(editor.editorCoverage.notExecuted,0);
 assert.equal(report.summary.captureScope.externalContentsChecked,false);assert.equal(report.snapshot.source.nativeSlotCaptureScope.manualSourceHash,report.run.manualSourceHash);
 const classifications=engine.evaluations.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{});
 const violations=engine.evaluations.filter(e=>e.classification==='violation'),rootNode=report.snapshot.nodes.find(n=>n.parentId===null),backgroundKey='22d83aeb0d0d643a5359f63464a2ab81838fbe9f';
 const result={schemaVersion:'apollo.component-contract.live-report-review.v1',date:report.generatedAt.slice(0,10),normative:false,status:violations.length?'verified-negative':'verified-control',report:name,reportSha256:sha(bytes),fixture:path.relative(root,archived),editorVersion:report.editorVersion,canonicalRevision:canonical.metadata.revision,reportedRevision:report.run.manualRevision,normativeSemanticsUnchanged:true,canonicalManualSourceHash:core.stableHash(canonical),reportedManualSourceHash:report.run.manualSourceHash,sourceHashesVerified:true,sharedCompilerReproducesReport:true,exactEngineReplay:true,exactEditorReplay:true,sourceNodeIds:sourceIds,rootNodeId:report.snapshot.source.rootNodeId,capturedNodes:report.snapshot.nodes.length,matchedBaselineNodes:6,coverage:editor.editorCoverage,classifications,violations:violations.map(e=>({ruleId:e.ruleId,classification:e.classification,trace:e.trace})),observedFacts:{clipsContent:rootNode.layout.clipsContent,backgroundMode:rootNode.variable.modes[backgroundKey]},externalBodyPayloadChecked:false,correspondenceFixConfirmed:true,controlResetAcceptanceComplete:false,mobileStatus:'Draft'};
 if(record){fs.mkdirSync(path.dirname(archived),{recursive:true});if(fs.existsSync(archived))assert(zlib.gunzipSync(fs.readFileSync(archived)).equals(bytes));else fs.writeFileSync(archived,zlib.gzipSync(bytes,{level:9}));
  fs.writeFileSync(path.join(root,'reports',name.replace('corporate-content.validation-report.','live-review-editor-0.2.73.')),JSON.stringify(result,null,2)+'\n');}
 return result;
}
if(require.main===module){const args=process.argv.slice(2);review(args.find(a=>!a.startsWith('--'))||defaultName,args.includes('--record')).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exitCode=1;});}
module.exports={review};
