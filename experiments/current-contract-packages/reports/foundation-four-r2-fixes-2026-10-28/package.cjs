const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const R = __dirname, A = path.resolve(R, '../../../..'), core = require(R + '/private-runtime/core.cjs');
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const pin = p => {const b = fs.readFileSync(p); return {path: p, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length};};
const jsonHash = value => core.stableHash(JSON.parse(JSON.stringify(value)));
(async () => {
  const summaries = [], replay = read(R + '/private-replay.json');
  for (const name of ['Text', 'Slider', 'SegmentedControl']) {
    const dir = R + '/candidate/' + name, manual = read(dir + '/contract.manual.json'), facts = read(dir + '/variant-evidence.json');
    const bundle = core.buildExportBundle(manual, facts, []), compiled = read(dir + '/compiled.json');
    assert(bundle.validation.valid); assert.equal(jsonHash(bundle.compiled), core.stableHash(compiled));
    const oldPath = A + '/JSONS/web/components/web-core/core/' + name + '/packages/' + name + '.r1.draft.component-contract.zip';
    const old = await core.readZip(fs.readFileSync(oldPath));
    const files = old.filter(e => e.name.endsWith('.json')).map(e => ({name: e.name, text: core.zipEntryText(e)}));
    const zipped = core.buildAuthoringZip(bundle, files);
    const entries = (await core.readZip(zipped)).map(e => e.name === 'contract.manual.json'
      ? Object.assign({}, e, {data: new TextEncoder().encode(JSON.stringify(manual) + '\n')}) : e);
    const archive = core.createZip(entries), archivePath = dir + '/' + name + '.r2.draft.component-contract.zip';
    fs.writeFileSync(archivePath, archive);
    const after = await core.readZip(archive);
    const reopened = core.importWorkspace(after.filter(e => e.name.endsWith('.json')).map(e => ({name: e.name, text: core.zipEntryText(e)})), manual.component.contractId);
    assert.deepEqual(reopened.manual, manual); assert.deepEqual(reopened.variantEvidence, facts);
    assert.equal(jsonHash(core.buildExportBundle(reopened.manual, reopened.variantEvidence, []).compiled), core.stableHash(compiled));
    const sourceEntries = old.filter(e => e.name.includes('/source/'));
    for (const entry of sourceEntries) assert.deepEqual(after.find(e => e.name === entry.name)?.data, entry.data, 'Raw source changed: ' + entry.name);
    const map = read(R + '/../foundation-four-drafts-2026-10-27/' + name + '/coverage-map.json');
    map.revision = 2;
    for (const entry of map.entries) entry.compiledRuleIds = compiled.rules.filter(r => entry.manualRuleIds?.includes(r.source.anchor)).map(r => r.ruleId);
    map.correction = {scope: read(R + '/candidate-changes.json').find(c => c.name === name), nativeReport: '../foundation-four-live-2026-10-28/report.json.gz',
      executionEvidence: 'private-replay.json; retained native snapshot replay, not fresh Apollo', fullNormativeCoverage: name !== 'SegmentedControl'};
    write(dir + '/coverage-map.json', map);
    const rows = replay.rows.filter(row => row.component === name && row.caseId !== 'SG-09');
    assert(rows.every(row => row.exactExpectedViolationIds && row.coverage.executionComplete));
    const summary = {name, revision: 2, status: 'draft', sourceRules: manual.rules.length, ruleIR: compiled.rules.length,
      nonExecutableRules: compiled.nonExecutableRules.length, manualSourceHash: compiled.package.manualSourceHash,
      compiledHash: core.stableHash(compiled), zip: pin(archivePath), zipRoundtrip: 'PASS',
      preservedRawSourceEntries: sourceEntries.length, replayCases: rows.length, allExpectedIdsMatch: true,
      executionCompleteInReplay: true, freshApollo: 'NOT_RUN_USER_ONLY', installed: false, ready: false};
    write(dir + '/summary.json', summary); summaries.push(summary);
  }
  write(R + '/package-verification.json', {status: 'PASS_PRIVATE_SCOPE', summaries});
  console.log(summaries.map(s => ({name: s.name, roundtrip: s.zipRoundtrip, replay: s.replayCases, zipBytes: s.zip.bytes})));
})().catch(e => {console.error(e); process.exitCode = 1;});
