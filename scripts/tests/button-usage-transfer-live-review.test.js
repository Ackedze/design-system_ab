const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button');
const review=JSON.parse(fs.readFileSync(path.join(root,'qa/usage-transfer-live-review.2026-09-28.json')));
const bytes=item=>zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));
const read=item=>JSON.parse(bytes(item)),clone=v=>JSON.parse(JSON.stringify(v));
const comparable=({evaluationId,...e})=>e;

for(const item of review.reportResults)test(`${item.caseId}: r25 live archive checksum, exact engine/Editor/details replay and provenance`,()=>{
  assert.equal(crypto.createHash('sha256').update(bytes(item)).digest('hex'),item.sha256);
  const r=read(item);assert.equal(r.editorVersion,review.editorVersion);assert.equal(r.run.manualRevision,25);
  assert.equal(core.stableHash(r.sources.manual),review.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract),review.compiledStableHash);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
  assert.equal(r.snapshot.source.rootNodeId,item.rootNodeId);assert.equal(r.run.context.product,item.product);
  assert.equal(r.snapshot.nodes[0].appearance.opacity,item.opacity);
  assert.equal(r.snapshot.nodes[0].semanticApi.hintVisible,true);
  const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.deepEqual(clone(engine),r.results.engine);assert.equal(engine.snapshotHash,r.run.engineSnapshotHash);
  const editor=core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
  assert.deepEqual(clone(editor),r.results.editor);
  const details=core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy);
  assert.deepEqual(clone(details),r.results.details);
  assert.equal(engine.evaluations.length,93);assert.equal(editor.evaluations.length,97);assert.equal(details.length,97);
  assert.equal(engine.evaluations.filter(e=>e.classification==='violation').length,item.engineViolations);
  assert.equal(core.groupEvaluationDetails(details).filter(d=>d.classification==='violation').length,item.groupedViolationCards);
  assert.equal(r.run.capture.matchedBaselineNodes,16);assert.equal(r.snapshot.nodes.length,16);
  assert.deepEqual(r.run.capture.warnings,[]);assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds,[]);
});

test('live AB/AO has identical actual nodes and all93 intrinsic evaluations; Hint remains a real visible capability',()=>{
  const a=read(review.reportResults[0]),b=read(review.reportResults[1]);
  assert.deepEqual(a.snapshot.nodes,b.snapshot.nodes);
  assert.deepEqual(a.results.engine.evaluations.map(comparable),b.results.engine.evaluations.map(comparable));
  assert.equal(a.snapshot.nodes[0].semanticApi.hintEnabled,true);
  assert.equal(a.snapshot.nodes[0].semanticApi.hintVisible,true);
  assert.equal(a.snapshot.nodes[0].semanticApi.size,56);
  assert.equal(a.snapshot.nodes[0].semanticApi.singleIcon,false);
  assert.equal(a.summary.ownershipCoverage.component.violations,0);
  assert.equal(b.summary.ownershipCoverage.component.violations,0);
});

test('live opacity50% changes only the root property and two existing assertions; UI groups one defect',()=>{
  const a=read(review.reportResults[0]),b=read(review.reportResults[2]),nodes=clone(b.snapshot.nodes);
  nodes[0].appearance.opacity=1;assert.deepEqual(nodes,a.snapshot.nodes);
  const expected=[
    'component:core.web.button.root.visual-style-1.3.1',
    'component:web-core.button.manual-layout-and-appearance-overrides-prohibited.1.11',
  ];
  const violations=b.results.engine.evaluations.filter(e=>e.classification==='violation');
  assert.deepEqual(violations.map(e=>e.ruleId),expected);
  for(const v of violations){assert.equal(v.subjectNodeId,'preview:0');assert.equal(v.trace.actual,0.5);assert.equal(v.trace.expected,1);assert.equal(v.trace.predicate,'matches-effective-baseline');}
  const unchanged=r=>r.results.engine.evaluations.filter(e=>!(expected.includes(e.ruleId)&&e.subjectNodeId==='preview:0')).map(comparable);
  assert.equal(unchanged(b).length,91);assert.deepEqual(unchanged(a),unchanged(b));
  const cards=core.groupEvaluationDetails(b.results.details).filter(d=>d.classification==='violation');
  assert.equal(cards.length,1);assert.equal(cards[0].evaluations.length,2);assert.equal(cards[0].factPath,'appearance.opacity');
});

test('coverage honestly excludes usage without declaring compliance; three scenario gaps/four package gaps remain',()=>{
  const forbidden=new Set(JSON.parse(fs.readFileSync(path.join(root,'migrations/usage-rules-r25.json'))).transfers.map(t=>t.ruleId));
  for(const item of review.reportResults){const r=read(item),s=r.summary;
    assert.equal(s.sourceRules,22);assert.equal(s.compiledChecks,53);
    assert.equal(s.complete,false);assert.equal(s.notExecuted,3);assert.equal(s.inconclusive,0);
    assert.equal(s.contractReadiness.status,'draft');assert.equal(s.contractReadiness.unimplementedRules,4);
    assert.equal(s.contractReadiness.ownership.usage.status,'not-included');
    assert.equal(s.ownershipCoverage.usage.status,'not-evaluated');assert.equal(s.ownershipCoverage.usage.complete,false);
    assert.equal(s.ownershipCoverage.usage.evaluations,0);assert.equal(s.ownershipCoverage.usage.notExecuted,0);
    assert.ok(r.sources.manual.rules.every(rule=>!forbidden.has(rule.id)));
    assert.ok(r.sources.compiledContract.rules.every(rule=>!forbidden.has(rule.source.anchor)));
    assert.deepEqual(r.results.editor.evaluations.filter(e=>e.classification==='not-executed').map(e=>e.ruleId),[
      'component:web-core.button.block-maps-to-fill',
      'component:web-core.button.nowrap-maps-to-figma-layout',
      'component:web-core.button.text-resizing-maps-to-figma-layout',
    ]);
    assert.equal(s.ownershipCoverage.dependencies.evaluations,0);
    assert.equal(r.results.engine.dependencyRuns.length,2);
    assert.ok(r.results.engine.dependencyRuns.every(d=>d.revision===8&&d.status==='not-applicable'&&d.reason==='target-hidden'));
  }
  assert.equal(review.status,'accepted-tr01-tr03');
});
