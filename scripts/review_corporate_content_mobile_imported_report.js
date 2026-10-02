const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-corp/CorporateContent/mobile-web/authoring');
const name='corporate-content.validation-report.2026-10-01T17-17-10-791Z.json';
const reportFile=path.join(repo,'experiments/current-contract-packages',name);
const reportArchive=path.join(root,'reports/fixtures/r7-editor-0.2.72',name+'.gz');
const probeArchive=path.join(root,'reports/fixtures/editor-0.2.73/workshop-capture.2026-10-01.json.gz');
const probeInput='/private/tmp/corporate-content-0273-workshop-capture.json';
const clone=x=>JSON.parse(JSON.stringify(x)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function preserve(file,bytes){fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))assert(zlib.gunzipSync(fs.readFileSync(file)).equals(bytes));else fs.writeFileSync(file,zlib.gzipSync(bytes,{level:9}));}
async function review(record=false){
 const bytes=fs.existsSync(reportFile)?fs.readFileSync(reportFile):zlib.gunzipSync(fs.readFileSync(reportArchive));
 const report=JSON.parse(bytes),canonical=JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json')));
 const normalized=clone(report.sources.manual);normalized.metadata.revision=canonical.metadata.revision;normalized.metadata.updatedAt=canonical.metadata.updatedAt;
 assert.deepEqual(normalized,canonical);assert.equal(canonical.metadata.revision,6);assert.equal(report.run.manualRevision,7);
 assert.equal(core.stableHash(report.sources.manual),report.run.manualSourceHash);
 assert.equal(core.stableHash(report.snapshot),report.run.snapshotHash);
 assert.equal(core.stableHash(report.runtime.evaluatedContract),report.run.evaluatedContractHash);
 assert.equal(core.validationSnapshotHash(report.snapshot,report.runtime.evaluatedContract),report.run.engineSnapshotHash);
 assert.deepEqual(clone(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract)),report.results.engine);
 assert.equal(report.editorVersion,'component-contract-editor@0.2.72');
 assert.equal(report.snapshot.source.instanceSourceIdentityVersion,1);
 assert(report.snapshot.nodes.every(n=>!n.component?.sourceIdentity));
 assert.equal(report.run.capture.matchedBaselineNodes,0);assert.equal(report.summary.inconclusive,17);assert.equal(report.summary.notExecuted,1);assert.equal(report.summary.complete,false);
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/CorporateContent.mobile-web.component-contract.zip')));
 const workspace=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const compiled=clone(core.buildExportBundle(report.sources.manual,workspace.variantEvidence,workspace.dependencyContracts).compiled);
 assert.deepEqual(compiled,report.sources.compiledContract);assert.deepEqual(compiled,report.runtime.evaluatedContract);
 const reportReview={schemaVersion:'apollo.component-contract.report-review.v1',date:'2026-10-01',normative:false,status:'incomplete',editorVersion:report.editorVersion,canonicalRevision:6,reportedRevision:7,normativeSemanticsUnchanged:true,reportSha256:sha(bytes),fixture:path.relative(root,reportArchive),sourceHashesVerified:true,exactEngineReplay:true,sharedCompilerReproducesReport:true,capturedNodes:6,matchedBaselineNodes:0,engineEvaluations:17,inconclusive:17,notExecuted:1,complete:false,blocker:'Imported main child IDs use the local namespace; inherited instance IDs use library source IDs. Capture marker exists but verified source identities are absent.'};
 const probeBytes=fs.existsSync(probeArchive)?zlib.gunzipSync(fs.readFileSync(probeArchive)):fs.readFileSync(probeInput),capture=JSON.parse(probeBytes),snapshot=capture.snapshot;
 assert.equal(snapshot.source.rootNodeId,report.snapshot.source.rootNodeId);assert.equal(capture.matchedBaselineNodes,6);assert.deepEqual(capture.unmatchedBaselineNodeIds,[]);
 assert.deepEqual(capture.before,capture.after);assert.equal(capture.createdNodeIds.length,4);assert.deepEqual(capture.removedNodeIds.slice().sort(),capture.createdNodeIds.slice().sort());
 for(const s of[snapshot,snapshot.instanceContentReferences.base])assert(s.source.instanceSourceIdentityCapture.owners.every(o=>o.status==='captured'&&o.sourceInstanceId&&capture.removedNodeIds.includes(o.sourceInstanceId)));
 assert.equal(core.compareInstanceBoundaries(snapshot,snapshot.variantReference).complete,true);
 const sourceIds=snapshot.nodes.filter(n=>n.component?.sourceIdentity).map(n=>n.component.sourceIdentity.sourceNodeId).sort();assert.deepEqual(sourceIds,['89653:28855','89653:28857']);
 const engine=core.evaluateCompiledContract(snapshot,compiled),editor=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},report.sources.manual,snapshot);
 assert.equal(editor.editorCoverage.complete,true);assert.equal(editor.editorCoverage.engineEvaluations,17);assert.equal(editor.editorCoverage.inconclusive,0);assert.equal(editor.editorCoverage.notExecuted,0);
 const counts=engine.evaluations.reduce((acc,e)=>(acc[e.classification]=(acc[e.classification]||0)+1,acc),{});assert.deepEqual(counts,{compliant:15,violation:2});
 const violations=engine.evaluations.filter(e=>e.classification==='violation');assert.deepEqual(violations.map(e=>e.trace.factPaths.at(-1)).sort(),['layout.clipsContent','variable.modes.22d83aeb0d0d643a5359f63464a2ab81838fbe9f']);
 assert.equal(snapshot.source.nativeSlotCaptureScope.manualSourceHash,report.run.manualSourceHash);
 const probeReview={schemaVersion:'apollo.editor-workshop-probe.v1',date:'2026-10-01',editorCandidate:'0.2.73',figmaFileKey:'I3MsagXR8Tz2eZcGtIgUk8',remoteMainComponentId:'11722:42348',captureKind:'full-shared-captureInstanceAudit-via-Figma-MCP',normative:false,notUserEditorExport:true,fixture:path.relative(root,probeArchive),captureSha256:sha(probeBytes),snapshotHash:core.stableHash(snapshot),engineHash:core.stableHash(engine),manualSourceHash:report.run.manualSourceHash,manualRevision:7,componentKey:capture.componentKey,sourceNodeIds:sourceIds,capturedNodes:snapshot.nodes.length,matchedBaselineNodes:6,coverage:editor.editorCoverage,classifications:counts,violations,createdNodeIds:capture.createdNodeIds,removedNodeIds:capture.removedNodeIds,originalInstanceUnchanged:true,pageInventoryUnchanged:true,externalBodyPayloadChecked:false,fullControlNegativeResetAcceptance:false,mobileStatus:'Draft'};
 if(record){preserve(reportArchive,bytes);preserve(probeArchive,probeBytes);fs.writeFileSync(path.join(root,'reports/live-review-r7-editor-0.2.72.2026-10-01.json'),JSON.stringify(reportReview,null,2)+'\n');fs.writeFileSync(path.join(root,'reports/editor-0.2.73-workshop-probe.2026-10-01.json'),JSON.stringify(probeReview,null,2)+'\n');}
 return {reportReview,probeReview};
}
if(require.main===module)review(process.argv.includes('--record')).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={review};
