const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {review} = require('../review_corporate_content_finalization');
const root = path.resolve(__dirname, '../../experiments/web-corp/CorporateContent/authoring');
test('CorporateContent r11 is lossless, compiled by the shared core and exactly replays evidence', async () => {
  const r = await review();
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'contract.manual.json'))), r.bundle.manual);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'compiled/component-contract.v2.json'))), r.bundle.compiled);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'reports/acceptance.json'))), r.acceptance);
  assert.equal(r.acceptance.liveEvidence.length, 3);
  assert.equal(r.acceptance.historicalEvidence.length, 2);
});
test('Acceptance is desktop-only and does not claim payload/code/pattern or complete legacy coverage', async () => {
  const r = await review();
  assert.equal(r.acceptance.externalContentValidation, false);
  assert.equal(r.acceptance.published, false);
  assert.equal(r.crosswalk.legacy.length, 32);
  assert.equal(r.bundle.manual.representations.length, 1);
  assert.ok(r.acceptance.bodyMatrixAcceptance.startsWith('owner-attested'));
});
