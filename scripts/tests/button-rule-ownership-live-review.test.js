const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'qa/rule-ownership-live-review.2026-09-28.json')));
const bytes=item=>zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));
const read=item=>JSON.parse(bytes(item)),clone=value=>JSON.parse(JSON.stringify(value));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const hint='component:web-core.button.desktop-hint-restricted.1.1';

for(const item of manifest.reportResults)test(`${item.caseId}: immutable r24 live report replays engine, split coverage and details exactly`,()=>{
  assert.equal(sha(bytes(item)),item.sha256);
  const r=read(item);assert.equal(r.editorVersion,manifest.editorVersion);assert.equal(r.run.manualRevision,24);
  assert.equal(r.run.context.product,item.product);assert.equal(r.snapshot.source.rootNodeId,item.rootNodeId);
  assert.equal(core.stableHash(r.sources.manual),manifest.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract),manifest.compiledStableHash);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
  const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.equal(engine.snapshotHash,r.run.engineSnapshotHash);assert.deepEqual(clone(engine),r.results.engine);
  const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
  assert.deepEqual(clone(editor),r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
  assert.equal(engine.evaluations.length,94);assert.equal(editor.evaluations.filter(e=>e.classification==='violation').length,item.violations);
  assert.equal(r.run.capture.matchedBaselineNodes,16);assert.equal(r.snapshot.nodes.length,16);
  assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
  assert.equal(editor.scenarioCoverage.inconclusive,0);
  assert.equal(editor.ownershipCoverage.component.violations,0);
  assert.equal(editor.ownershipCoverage.usage.violations,item.violations);
  assert.equal(editor.ownershipCoverage.unclassified.evaluations,0);
});

test('same actual instance: Product changes only the external Hint verdict; all 93 intrinsic checks remain exact',()=>{
  const a=read(manifest.reportResults[0]),b=read(manifest.reportResults[1]);
  assert.deepEqual(a.snapshot.nodes,b.snapshot.nodes);
  assert.equal(a.snapshot.nodes[0].semanticApi.hintEnabled,true);
  assert.equal(a.snapshot.nodes[0].semanticApi.hintVisible,true);
  assert.equal(a.snapshot.nodes[0].semanticApi.size,56);
  assert.equal(a.snapshot.nodes[0].semanticApi.singleIcon,false);
  const comparable=({evaluationId,...e})=>e;
  const filtered=r=>r.results.engine.evaluations.filter(e=>e.ruleId!==hint).map(comparable);
  assert.equal(filtered(a).length,93);assert.deepEqual(filtered(a),filtered(b));
  const rule=b.sources.compiledContract.rules.find(r=>r.ruleId===hint);
  assert.deepEqual(rule.manual.ownership,{kind:'product-policy',ownerId:'ab'});
  const no=a.results.engine.evaluations.find(e=>e.ruleId===hint),yes=b.results.engine.evaluations.find(e=>e.ruleId===hint);
  assert.equal(no.classification,'not-applicable');assert.equal(no.trace.actual,'ao');
  assert.equal(yes.classification,'violation');assert.equal(yes.trace.actual,true);assert.deepEqual(yes.trace.expected,[false]);
});

test('three intrinsic and three usage gaps remain explicit; inactive Spinner is not a successful child run',()=>{
  for(const item of manifest.reportResults){const r=read(item),s=r.summary;
    assert.equal(s.complete,false);assert.equal(s.notExecuted,6);
    assert.equal(s.contractReadiness.status,'draft');assert.equal(s.contractReadiness.unimplementedRules,8);
    assert.equal(s.ownershipCoverage.component.notExecuted,3);assert.equal(s.ownershipCoverage.usage.notExecuted,3);
    assert.equal(s.ownershipCoverage.dependencies.evaluations,0);
    assert.deepEqual(r.results.editor.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId).sort(),[...manifest.coverage.componentPending,...manifest.coverage.usagePending].sort());
    assert.equal(r.results.engine.dependencyRuns.length,2);
    assert.ok(r.results.engine.dependencyRuns.every(d=>d.status==='not-applicable'&&d.reason==='target-hidden'&&d.revision===8));
  }
  assert.equal(manifest.status,'accepted-ow01-ow02-only');assert.equal(manifest.pending.length,3);
});

test('canonical source, compiled and ZIP unchanged at acceptance; archived reports need no editor-folder originals',()=>{
  const archived={'contract.manual.json':'contract.manual.json','compiled/component-contract.v2.json':'component-contract.v2.json.gz','editor/Button.editor-input.zip':'Button.editor-input.zip'};
  for(const a of manifest.normativeArtifactsUnchanged){const p=archived[a.file];assert.ok(p);const bytes=fs.readFileSync(path.join(root,'history/r24-editor-0.2.45',p));assert.equal(sha(p.endsWith('.gz')?zlib.gunzipSync(bytes):bytes),a.sha256);}
  for(const item of manifest.reportResults)assert.ok(item.fixtureFile.startsWith('qa/fixtures/rule-ownership-r24/'));
});
