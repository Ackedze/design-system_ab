const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const component = path.resolve(__dirname, '..'), packages = path.resolve(component, '..');
const workspace = path.resolve(packages, '../../../..');
const core = require(path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const wire = value => JSON.parse(JSON.stringify(value));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manual = read(path.join(component, 'authoring/contract.manual.json'));
const compiled = read(path.join(component, 'authoring/compiled/component-contract.v2.json'));
const expectedContract = core.prepareAuthoringPreviewContract(compiled);
const names = [
  '08-50-10-389', '08-50-33-817', '08-50-47-798', '08-51-00-210',
  '08-51-07-430', '08-51-12-665', '08-51-19-523', '08-51-25-300',
].map(time => `benefit-card.validation-report.2026-10-09T${time}Z.json`);
const expected = [['compliant','compliant'], ['violation','compliant'], ['compliant','compliant'], ['compliant','violation']];
const checks = names.map((name, index) => {
  const file = path.join(component, name), report = read(file);
  assert.equal(report.editorVersion, 'component-contract-editor@0.2.93');
  assert.equal(report.run.manualRevision, 3);
  assert.deepEqual(report.sources.manual, manual);
  assert.deepEqual(report.sources.compiledContract, compiled);
  assert.deepEqual(report.runtime.evaluatedContract, wire(expectedContract));
  assert.equal(core.stableHash(report.sources.manual), report.run.manualSourceHash);
  assert.equal(core.stableHash(report.snapshot), report.run.snapshotHash);
  assert.equal(core.stableHash(report.runtime.evaluatedContract), report.run.evaluatedContractHash);
  assert.equal(core.validationSnapshotHash(report.snapshot, report.runtime.evaluatedContract), report.run.engineSnapshotHash);
  const replay = core.evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract);
  assert.deepEqual(wire(replay), report.results.engine);
  assert.deepEqual(wire(core.buildEditorValidationReport(replay, {contract:compiled,issues:report.sources.compilerIssues}, manual, report.snapshot)), report.results.editor);
  assert.deepEqual(replay.evaluations.map(e => e.classification), expected[index % 4]);
  assert.equal(report.run.context.platform, index < 4 ? 'desktop' : 'mobile-web');
  assert.equal(report.summary.inconclusive, 0);
  assert.equal(report.summary.notExecuted, 29);
  assert.equal(report.summary.complete, false);
  const snapshot = core.prepareValidationSnapshot(report.snapshot, report.runtime.evaluatedContract);
  assert(snapshot.declaredTargetIdentitiesV1.targets.every(t => t.status === 'resolved'));
  return {file:name,sha256:sha(file),platform:report.run.context.platform,componentKey:report.snapshot.source.componentKey,
    properties:report.snapshot.nodes.find(n => report.snapshot.selection.includes(n.id)).component.properties,
    sequence:['baseline','hidden-title','restored','hidden-graphic'][index % 4],
    classifications:replay.evaluations.map(e => ({ruleId:e.ruleId,classification:e.classification,count:e.trace.actual})),
    targetVisibility:snapshot.declaredTargetIdentitiesV1.targets.map(t => ({targetId:t.targetId,status:t.status,effectiveVisible:t.effectiveVisible})),
    exactEngineReplay:true,exactEditorReplay:true,hashesVerified:true};
});
const receipt = {date:'2026-10-09',status:'PASS_INSTALLED_EDITOR_TITLE_GRAPHIC_SCOPE',editorVersion:'0.2.93',revision:3,
  manualSourceHash:core.stableHash(manual),archiveSha256:sha(path.join(packages,'BenefitCard.component-contract.zip')),
  reports:checks,totals:{reports:8,evaluations:16,violations:4,compliant:12,inconclusive:0},
  testedPlatforms:['desktop','mobile-web'],testedVariantProperties:{CardAxis:'Vertical',GraphicPosition:'Left',Background:'True',Compact:'False'},
  scope:'Presence and effective visibility of Title and Graphic on the captured desktop/mobile variants.',
  remainingContextRules:29,fullComponentAcceptance:false,compiledStatus:'draft',all32VariantsLiveValidated:false,
  authoringPreview:true,activatedDraftRuleIds:read(path.join(component,names[0])).runtime.activatedDraftRuleIds,
  manualRuleReviewStatusChanged:false,registryReceipt:'registry-r3-user-runs.2026-10-09.json',
  sourceRulesChanged:false,contractChanged:false,productionPublication:false};
fs.writeFileSync(path.join(__dirname,'r3-user-runs-review.2026-10-09.json'), JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,totals:receipt.totals,contractChanged:false}));
