const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../projects/ComponentContractEditor/dist/core.cjs');
const repo=path.resolve(__dirname,'..');
const root=path.join(repo,'experiments/web-corp/CorporateContent/mobile-web/authoring');
const name='corporate-content.validation-report.2026-10-01T13-07-01-176Z.json';
const original=path.join(repo,'experiments/current-contract-packages',name);
const archived=path.join(root,'reports/fixtures/r7-editor-0.2.71',name+'.gz');
const clone=x=>JSON.parse(JSON.stringify(x));
async function review(record=false){
  const bytes=fs.existsSync(original)?fs.readFileSync(original):zlib.gunzipSync(fs.readFileSync(archived));
  const report=JSON.parse(bytes),canonical=JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json')));
  const normalized=clone(report.sources.manual);
  normalized.metadata.revision=canonical.metadata.revision;
  normalized.metadata.updatedAt=canonical.metadata.updatedAt;
  assert.deepEqual(normalized,canonical,'Report has normative edits, not just session revision/date.');
  assert.equal(canonical.metadata.revision,6);assert.equal(report.run.manualRevision,7);
  assert.equal(core.stableHash(report.sources.manual),report.run.manualSourceHash);
  assert.equal(core.stableHash(report.snapshot),report.run.snapshotHash);
  assert.equal(core.stableHash(report.runtime.evaluatedContract),report.run.evaluatedContractHash);
  const engine=core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract);
  assert.deepEqual(clone(engine),report.results.engine);
  const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/CorporateContent.mobile-web.component-contract.zip')));
  const workspace=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
  const bundle=clone(core.buildExportBundle(report.sources.manual,workspace.variantEvidence,workspace.dependencyContracts));
  assert.deepEqual(bundle.compiled,report.sources.compiledContract);
  assert.deepEqual(bundle.compiled,report.runtime.evaluatedContract);
  assert.equal(report.summary.complete,false);assert.equal(report.summary.inconclusive,17);assert.equal(report.summary.notExecuted,1);
  assert.equal(report.run.capture.matchedBaselineNodes,0);assert.equal(report.snapshot.nodes.length,6);
  assert.equal(report.snapshot.source.captureTopology.complete,true);assert.equal(report.snapshot.source.truncated,false);
  const comparison=core.compareInstanceBoundaries(report.snapshot,report.snapshot.variantReference);
  assert.equal(comparison.complete,false);assert.deepEqual(Object.keys(comparison.referencePaths),['']);
  const spacers=report.snapshot.nodes.filter(n=>['TopMargin','BottomMargin'].includes(n.name));
  assert.equal(spacers.length,2);assert.deepEqual(spacers[0].component.identity,spacers[1].component.identity);
  const rootNode=report.snapshot.nodes.find(n=>n.parentId===null);
  const result={schemaVersion:'apollo.component-contract.report-review.v1',date:'2026-10-01',status:'incomplete',normative:false,
    canonicalRevision:6,reportedRevision:7,normativeSemanticsUnchanged:true,canonicalManualSourceHash:core.stableHash(canonical),
    reportedManualSourceHash:report.run.manualSourceHash,reportSha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    fixture:path.relative(root,archived),editorVersion:report.editorVersion,exactEngineReplay:true,sourceHashesVerified:true,sharedCompilerReproducesReport:true,
    capturedNodes:6,matchedBaselineNodes:0,engineEvaluations:17,inconclusive:17,notExecuted:1,violations:0,complete:false,
    topologyComplete:true,truncated:false,externalBodyPayloadChecked:false,
    blocker:{reason:'ambiguous equal-key sibling instance correspondence',spacerComponentKey:spacers[0].component.identity.componentKey,comparison},
    observedFacts:{clipsContent:rootNode.layout.clipsContent,backgroundMode:rootNode.variable.modes['22d83aeb0d0d643a5359f63464a2ab81838fbe9f'],
      backgroundModeName:rootNode.variable.modeCatalog['22d83aeb0d0d643a5359f63464a2ab81838fbe9f'].modes.find(m=>m.modeId===rootNode.variable.modes['22d83aeb0d0d643a5359f63464a2ab81838fbe9f']).name},
    observedFactsAreNotExecutedVerdicts:true,canonicalManualAndZipChanged:false};
  if(record){fs.mkdirSync(path.dirname(archived),{recursive:true});
    if(fs.existsSync(archived))assert(zlib.gunzipSync(fs.readFileSync(archived)).equals(bytes));else fs.writeFileSync(archived,zlib.gzipSync(bytes,{level:9}));
    fs.writeFileSync(path.join(root,'reports/live-review-r7.2026-10-01.json'),JSON.stringify(result,null,2)+'\n');}
  return result;
}
if(require.main===module)review(process.argv.includes('--record')).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={review};
