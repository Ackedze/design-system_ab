const test=require('node:test'),assert=require('node:assert/strict');
const {core,clone,manifest,load,compile,baselineId,textId,review}=require('../review_button_configuration_exception_fix');
const r=load(manifest.reportResults.find(r=>r.caseId==='TL10B'&&r.mode==='component-audit'));
const c=compile(r).contract,active=core.prepareAuthoringPreviewContract(c);
const node=s=>s.nodes.find(n=>n.id==='preview:2');
const result=s=>core.evaluateCompiledContract(s,active);
const own=s=>result(s).evaluations.find(e=>e.ruleId===baselineId&&e.subjectNodeId==='preview:2');
test('15 immutable r28 reports replay exactly; only the two Loading false unknowns change on recompilation',()=>{assert.equal(review().engineEvaluations,2047);});
test('real nested LeftAddon without a role compares baseline and detects an actual horizontal override',()=>{
 const s=clone(r.snapshot);assert.equal(node(s).semantic.role,undefined);assert.equal(own(s).classification,'compliant');
 node(s).layout.sizingHorizontal='FIXED';assert.equal(own(s).classification,'violation');
 node(s).unknownFacts.push('layout.sizingHorizontal');assert.equal(own(s).classification,'human-review');
});
test('missing, ambiguous and truncated target resolution cannot grant a baseline exemption',()=>{
 for(const edit of [s=>s.source.truncated=true,s=>{const n=s.nodes.find(n=>n.name==='Label');s.nodes.push(clone(n));},s=>{s.nodes=s.nodes.filter(n=>n.name!=='Label');}]) {
  const s=clone(r.snapshot);edit(s);node(s).layout.sizingHorizontal='FIXED';const e=own(s);
  assert.ok(!e||!['compliant','not-applicable'].includes(e.classification));
  const report=core.buildEditorValidationReport(result(s),{contract:c,issues:[]},r.sources.manual,s);
  assert.equal(report.scenarioCoverage.complete,false);
 }
});
test('text configuration and Spinner ownership do not widen to unrelated nodes or external descendants',()=>{
 const s=clone(r.snapshot);node(s).name='Text'; // display name cannot establish a semantic target
 assert.notEqual(own(s)?.classification,'not-applicable');
 const now=result(r.snapshot),before=r.results.engine;
 for(const e of now.evaluations.filter(e=>e.ruleId!==baselineId)) {
  const old=before.evaluations.find(v=>v.ruleId===e.ruleId&&v.subjectNodeId===e.subjectNodeId);
  assert.ok(old);assert.equal(e.classification,old.classification);
 }
 assert.equal(now.evaluations.find(e=>e.ruleId===textId).classification,'not-applicable');
 assert.deepEqual(now.dependencyRuns,before.dependencyRuns);
});
