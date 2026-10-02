const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const { candidate, review } = require('../review_amount_finalization');
const { matchingAcceptance } = require('../build_component_contract_reference');
const root = path.resolve(__dirname, '../../experiments/web-core/core/Amount/authoring');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p)));
test('Amount r5 changes review status, not executable behavior across 32 immutable snapshots', () => {
  assert.deepEqual(read('contract.manual.json'), candidate());
  const qa = review();
  assert.equal(qa.historicalSnapshots, 32);
  assert.equal(qa.comparedEvaluations, 1666);
  assert.equal(qa.reportResults.length, 6);
  assert.equal(qa.readiness.status, 'ready');
  assert(qa.rules.every(r => r.status === 'reviewed'));
  assert(qa.rules.filter(r => r.route !== 'policy-only').every(r => Object.keys(r.reevaluationClassifications).length));
});
test('derived acceptance is valid only for its exact component/manual/compiled/facts hashes', () => {
  const qa = read('reports/acceptance.json'), c = read('compiled/component-contract.v2.json');
  assert.equal(matchingAcceptance(qa, c), true);
  for (const key of ['componentId', 'manualSourceHash', 'compiledHash', 'generatedFactsHash', 'status', 'scope']) {
    assert.equal(matchingAcceptance({ ...qa, [key]: 'stale' }, c), false, key);
  }
  assert.equal(matchingAcceptance(null, c), false);
});
test('Ready authoring artifacts do not publish or reroute legacy runtime', () => {
  const r = read('reports/readiness.json'), index = read('runtime/component-contract.index.json');
  assert.equal(r.status, 'ready');
  assert.equal(r.liveAcceptance, 'accepted-with-offline-boundaries');
  assert.equal(r.acceptanceReport, 'reports/acceptance.json');
  assert.equal(index.status, 'ready');
  assert.equal(index.published, false);
  assert.equal(core.stableHash(read('contract.manual.json')), index.manualSourceHash);
});
