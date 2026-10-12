const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const old = require('./runtime/core-before.cjs'), current = require('./runtime/core-after.cjs'), editor = require('./runtime/editor-after.cjs');
const wire = value => JSON.parse(JSON.stringify(value));
const pin = name => {const bytes = fs.readFileSync(path.join(__dirname,name)); return {path:name,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};};
const rows = [];
for (const file of fs.readdirSync(path.join(__dirname,'inputs')).filter(f => f.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname,'inputs',file))), s = d.snapshot;
  const engine = current.evaluateCompiledContract(s,d.runtime.evaluatedContract);
  assert.deepEqual(wire(engine),d.results.engine);
  assert.deepEqual(wire(old.evaluateCompiledContract(s,d.runtime.evaluatedContract)),d.results.engine);
  assert.deepEqual(wire(editor.evaluateCompiledContract(s,d.runtime.evaluatedContract)),d.results.engine);
  const args = [engine,{contract:d.sources.compiledContract,issues:d.sources.compilerIssues},d.sources.manual,s];
  const legacy = current.buildEditorValidationReport(...args);
  assert.deepEqual(wire(legacy),d.results.editor);
  assert.deepEqual(wire(old.buildEditorValidationReport(...args)),d.results.editor);
  assert.deepEqual(wire(current.buildEvaluationDetails(legacy,d.runtime.evaluatedContract,d.anatomy)),d.results.details);
  const fixed = current.buildEditorValidationReport(...args,{hiddenTargetCoverageVersion:1});
  assert.deepEqual(wire(editor.buildEditorValidationReport(...args,{hiddenTargetCoverageVersion:1})),wire(fixed));
  for (const detail of current.buildEvaluationDetails(fixed,d.runtime.evaluatedContract,d.anatomy)) {
    if (!fixed.evaluations.some(e => e.evaluationId === detail.id && e.origin === 'editor-hidden-target-scope')) continue;
    assert.equal(detail.reasonLabel,'Слой найден и подтверждён, но скрыт. Эта проверка не применяется.');
    assert.equal(detail.showComparison,false);
  }
  assert.equal(fixed.scenarioCoverage.notExecuted,3);
  assert.equal(fixed.scenarioCoverage.inconclusive,0);
  const row = {input:pin('inputs/'+file),component:d.component.componentId,revision:d.run.manualRevision,
    instanceId:s.source.rootNodeId,engineUnchanged:true,legacyEditorReplayExact:true,legacyDetailReplayExact:true,
    oldNotExecuted:legacy.scenarioCoverage.notExecuted,newNotExecuted:fixed.scenarioCoverage.notExecuted,
    violationRuleIds:fixed.evaluations.filter(e => e.classification==='violation').map(e => e.ruleId),
    hiddenExcludedRuleIds:fixed.evaluations.filter(e => e.origin==='editor-hidden-target-scope').map(e => e.ruleId),
    installedNewEditor:'NOT_RUN_USER_ONLY'};
  assert.deepEqual(row.violationRuleIds,engine.evaluations.filter(e => e.classification==='violation').map(e => e.ruleId));
  rows.push(row);
}
assert.equal(rows.length,12);
assert.equal(rows.filter(r => r.hiddenExcludedRuleIds.length).length,3);
assert.deepEqual(fs.readFileSync(path.join(__dirname,'runtime/apollo-v4-before.cjs')),fs.readFileSync(path.join(__dirname,'runtime/apollo-v4-after.cjs')));
const before = JSON.parse(fs.readFileSync(path.join(__dirname,'checks/apollo-v4-build-inputs.before.json')));
const after = JSON.parse(fs.readFileSync(path.join(__dirname,'checks/apollo-v4-build-inputs.after.json')));
assert.deepEqual(before.inputs,after.inputs); assert.equal(before.runtimeVersion,'0.1.15'); assert.equal(after.runtimeVersion,'0.1.16');
assert(!after.inputs.some(p => /validation-(?:coverage|report)\.ts$/.test(p.path)));
const receipt = {schemaVersion:'apollo.hidden-target-coverage-replay.v1',editorVersion:'0.2.100',coreVersion:'0.1.16',
  options:{hiddenTargetCoverageVersion:1},cases:rows,exactHistoricalReplays:12,editorCoreParity:true,
  v4:{runtimeBytesUnchanged:true,dependencyInventoryUnchanged:true,sourceInputs:after.inputs.length,
    runtimeVersionMetadata:['0.1.15','0.1.16'],compiledRulesAndAdmissionUnchanged:true},
  installedNewEditor:'NOT_RUN_USER_ONLY',wholeContractReady:false};
if (fs.existsSync(path.join(__dirname,'replay.json'))) assert.deepEqual(JSON.parse(fs.readFileSync(path.join(__dirname,'replay.json'))),receipt);
if (fs.existsSync(path.join(__dirname,'seal.json'))) {
  const seal=JSON.parse(fs.readFileSync(path.join(__dirname,'seal.json')));
  for (const p of seal.files) assert.deepEqual(pin(p.path),p);
}
console.log(JSON.stringify(receipt));
