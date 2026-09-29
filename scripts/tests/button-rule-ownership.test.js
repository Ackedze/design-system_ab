const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const zipped=p=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,p))));
const clone=v=>JSON.parse(JSON.stringify(v));
const manual=read('history/r24-editor-0.2.45/contract.manual.json'),compiled=zipped('history/r24-editor-0.2.45/component-contract.v2.json.gz');
const oldManual=read('history/r23-editor-0.2.44/contract.manual.json');
const oldContract=zipped('history/r23-editor-0.2.44/component-contract.v2.json.gz');
const issues=read('reports/validation-report.json').issues;
const stripRule=r=>{const c=clone(r);delete c.manual?.ownership;delete c.revision;delete c.source.checksum;return c;};

test('r24 changes only explicit ownership and metadata; normative IDs, scopes and constraints remain exact',()=>{
  const c=clone(manual);for(const r of c.rules)delete r.ownership;c.metadata=oldManual.metadata;
  assert.deepEqual(c,oldManual);assert.equal(manual.metadata.revision,24);
  assert.equal(manual.metadata.ruleOwnershipVersion,1);
  assert.deepEqual(compiled.coverage.byOwnership,{component:22,usage:5,unclassified:0});
  assert.equal(compiled.rules.length,54);
  assert.deepEqual(compiled.rules.map(stripRule),oldContract.rules.map(stripRule));
  for(const r of compiled.rules)assert.deepEqual(r.manual.ownership,manual.rules.find(s=>s.id===r.source.anchor).ownership);
  for(const k of Object.keys(oldContract).filter(k=>!['package','rules','customizationPolicy','coverage','runtimePolicy'].includes(k)))assert.deepEqual(compiled[k],oldContract[k],k);
  assert.equal(compiled.package.generatedFactsHash,oldContract.package.generatedFactsHash);
  assert.equal(compiled.package.manualSourceHash,core.stableHash(manual));
});

test('component and usage readiness each retain four gaps; Spinner r8 stays pinned and Button unpublished',()=>{
  const ready=core.buildContractReadiness({contract:compiled,issues},manual);
  assert.equal(ready.status,'draft');assert.equal(ready.unimplementedRules,8);
  assert.equal(ready.ownership.component.unimplementedRuleIds.length,4);
  assert.equal(ready.ownership.usage.unimplementedRuleIds.length,4);
  assert.equal(ready.ownership.unclassified.rules,0);
  assert.deepEqual(compiled.componentDependencies,oldContract.componentDependencies);
  assert.equal(compiled.componentDependencies[0].revision,8);
  assert.equal(compiled.componentDependencies[0].compiledHash,'909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221');
  assert.equal(compiled.status,'draft');
});

const review=read('qa/instance-identity-live-review.2026-09-28.json');
for(const item of review.reportResults)test(`r24 parity on archived ${item.widthMode} capture: same verdicts and evidence, split coverage only`,()=>{
  const report=zipped(item.fixtureFile),contract=core.prepareAuthoringPreviewContract(compiled);
  const engine=core.evaluateCompiledContract(report.snapshot,contract);
  const comparable=e=>({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,classification:e.classification,trace:e.trace,dependency:e.dependency});
  assert.deepEqual(engine.evaluations.map(comparable),report.results.engine.evaluations.map(comparable));
  const result=core.buildEditorValidationReport(engine,{contract:compiled,issues},manual,report.snapshot);
  assert.equal(result.scenarioCoverage.notExecuted,7);
  assert.equal(result.scenarioCoverage.complete,false);
  assert.equal(result.ownershipCoverage.unclassified.evaluations,0);
  assert.equal(result.ownershipCoverage.dependencies.evaluations,168);
  assert.ok(result.ownershipCoverage.component.evaluations>0);
  assert.ok(result.ownershipCoverage.usage.evaluations>0);
});

test('real AB Hint policy remains executable and external; Product never changes intrinsic verdicts',()=>{
  const hintReview=read('qa/effective-hint-visibility-live-review.2026-09-28.json');
  const source=zipped(hintReview.reportResults.find(r=>r.caseId==='BL12').fixtureFile),snapshot=clone(source.snapshot);
  const contract=core.prepareAuthoringPreviewContract(compiled);
  const rule=contract.rules.find(r=>r.source.anchor==='component:web-core.button.desktop-hint-restricted');
  assert.deepEqual(rule.manual.ownership,{kind:'product-policy',ownerId:'ab'});
  assert.deepEqual(stripRule(rule),stripRule(core.prepareAuthoringPreviewContract(oldContract).rules.find(r=>r.ruleId===rule.ruleId)));
  const intrinsic=new Set(contract.rules.filter(r=>r.manual.ownership.kind==='component').map(r=>r.ruleId));
  const run=product=>{snapshot.context.product=product;return core.evaluateCompiledContract(snapshot,contract).evaluations;};
  const ab=run('ab'),other=run('ao');
  assert.ok(ab.some(e=>e.ruleId===rule.ruleId&&e.classification==='violation'));
  const abReport=core.buildEditorValidationReport({evaluations:ab},{contract:compiled,issues},manual,{...snapshot,context:{...snapshot.context,product:'ab'}});
  assert.ok(abReport.ownershipCoverage.usage.violations>0);
  const values=e=>({id:e.ruleId,node:e.subjectNodeId,classification:e.classification,trace:e.trace});
  assert.deepEqual(ab.filter(e=>intrinsic.has(e.ruleId)).map(values),other.filter(e=>intrinsic.has(e.ruleId)).map(values));
  assert.ok(other.filter(e=>e.ruleId===rule.ruleId).every(e=>e.classification==='not-applicable'));
  delete snapshot.context.product;
  const engine=core.evaluateCompiledContract(snapshot,contract);
  const report=core.buildEditorValidationReport(engine,{contract:compiled,issues},manual,snapshot);
  assert.equal(report.ownershipCoverage.usage.complete,false);
});
