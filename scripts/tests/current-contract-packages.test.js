const test = require('node:test');
const assert = require('node:assert/strict');
const {collect} = require('../collect_current_contract_packages');
test('The distribution contains the six current accepted ZIPs with exact source and pinned dependency parity', async () => {
  const manifest = await collect(true);
  assert.equal(manifest.normative, false);
  assert.equal(manifest.canonicalSourcesRemainInPlace, true);
  assert.deepEqual(manifest.packages.map(p => [p.name, p.revision]), [
    ['Button', 31], ['Spinner', 8], ['Amount', 5], ['AmountStyles', 10], ['CorporateContent', 11], ['[M] CorporateContent', 6],
  ]);
  assert.deepEqual(manifest.packages.filter(p => p.dependencies.length).map(p => [
    p.name, p.dependencies[0].componentId, p.dependencies[0].revision,
  ]), [['Button', 'core.web.spinner', 8], ['AmountStyles', 'core.web.amount', 5]]);
  const mobile=manifest.packages.find(p=>p.componentId==='corporate-content.mobile-web');
  assert.equal(mobile.file,'CorporateContent.mobile-web.r6.component-contract.zip');
  assert.equal(mobile.manualSourceHash,'e68649c64756864d3acaaf1e44c51a41fd82f9e7cb9a9660deaca6e7f63ced31');
});
