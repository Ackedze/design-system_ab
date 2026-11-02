const test = require('node:test'), assert = require('node:assert/strict');
const {checkAreaReport} = require('./check_area_report.cjs');
function fixture() {
  const components = Array.from({length: 32}, (_, i) => ({scopeId: String(i), release: {contractId: 'root', manualSourceHash: 'pin'},
    result: {coverage: {executionComplete: true, uncertain: 0, captureIncomplete: false}, engine: {evaluations: []}}}));
  return {selection: {complete: true, components: components.map(c => ({nodeId: c.scopeId}))}, components, governedComponents: [], notChecked: []};
}
test('32 passing labelled roots do not hide an incomplete nested audit', () => {
  const r = fixture(); r.selection.components.push({nodeId: 'nested'});
  r.components.push({scopeId: 'nested', result: {coverage: {executionComplete: false, uncertain: 71, captureIncomplete: false}, engine: {evaluations: [{classification: 'human-review'}]}}});
  const result = checkAreaReport(r); assert.equal(result.status, 'FAIL'); assert.equal(result.unknown, 1);
});
test('a missing contract and a lost discovered instance each fail delivery', () => {
  const r = fixture(); r.selection.components.push({nodeId: 'missing'}, {nodeId: 'lost'});
  r.notChecked.push({nodeId: 'missing', reason: 'contract-not-found'});
  assert.deepEqual(checkAreaReport(r).issues, ['NOT_CHECKED:missing:contract-not-found', 'UNACCOUNTED:lost']);
});
test('a duplicate governed row cannot compensate for an unaccounted instance', () => {
  const r = fixture(); r.governedComponents.push({nodeId: '0'});
  assert.equal(checkAreaReport(r).status, 'FAIL');
});
test('permitted external payload remains explicitly unverified with exact owner proof', () => {
  const r = fixture(); r.selection.components.push({nodeId: 'payload'});
  r.notChecked.push({nodeId: 'payload', reason: 'permitted-external-content', validationScope: 'boundary-only', payloadValidation: 'unverified', parentContractId: 'root', manualSourceHash: 'pin', targetId: 'slot', property: 'Content#1:2', byScopeId: '0'});
  const result = checkAreaReport(r); assert.equal(result.status, 'PASS_CHECKED_COMPONENT_SCOPE'); assert.equal(result.payloadInternalsVerified, false);
  r.notChecked[0].manualSourceHash = 'stale'; assert.equal(checkAreaReport(r).status, 'FAIL');
  r.notChecked[0].manualSourceHash = 'pin'; delete r.notChecked[0].targetId; assert.equal(checkAreaReport(r).status, 'FAIL');
});
test('missing full-area evidence and incomplete scan cannot pass', () => {
  assert.throws(() => checkAreaReport({}), /FULL_AREA_REPORT_REQUIRED/);
  const r = fixture(); r.selection.complete = false; assert.equal(checkAreaReport(r).status, 'FAIL');
});
