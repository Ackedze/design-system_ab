const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const R = __dirname, A = path.resolve(R, '../../../..'), W = path.resolve(A, '../..');
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const pin = p => {const b = fs.readFileSync(p); return {path: path.relative(A, p), sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length};};
const names = ['Text', 'Slider', 'SegmentedControl'];
for (const p of read(R + '/input-pins.json').pins.filter(p => p.path.startsWith(A + '/') && !p.path.includes('/reports/'))) {
  const actual = pin(p.path); assert.equal(actual.sha256, p.sha256, 'Data preimage drift ' + p.path);
}
assert(read(R + '/package-verification.json').summaries.every(s => s.zipRoundtrip === 'PASS'));
const ip = A + '/JSONS/indexes/component-contracts.index.json', mp = A + '/experiments/current-contract-packages/manifest.json';
const index = read(ip), manifest = read(mp), before = structuredClone({index, manifest}), records = [];
const replay = read(R + '/private-replay.json');
assert(replay.rows.filter(r => r.caseId !== 'SG-09').every(r => r.exactExpectedViolationIds && r.coverage.executionComplete));
for (const name of names) {
  const source = R + '/candidate/' + name, dir = A + '/JSONS/web/components/web-core/core/' + name;
  const summary = read(source + '/summary.json'), manual = read(source + '/contract.manual.json'), compiled = read(source + '/compiled.json');
  const old = manifest.packages.find(e => e.name === name), record = index.entries.find(e => e.name === name);
  assert.equal(old.revision, 1); assert.equal(record.revision, 1);
  const report = dir + '/reports/draft-r2-2026-10-28'; fs.mkdirSync(report, {recursive: true});
  fs.mkdirSync(dir + '/history', {recursive: true});
  write(dir + '/history/r1.json', {archive: structuredClone(old), preservedAtOriginalPath: true, reason: 'Closed receipts pin the original r1 path; no historical bytes moved or changed.'});
  fs.writeFileSync(dir + '/contract.manual.json', JSON.stringify(manual) + '\n');
  const archive = dir + '/packages/' + name + '.r2.draft.component-contract.zip'; fs.copyFileSync(summary.zip.path, archive);
  for (const file of ['coverage-map.json', 'summary.json', 'validation.json']) fs.copyFileSync(source + '/' + file, report + '/' + file);
  write(report + '/eval.json', {schemaVersion: 'apollo.contract-authoring-eval.v1', overall: 'PARTIAL',
    revision: 2, evidenceKind: 'retained-native-snapshot-replay', ready: false, installed: false,
    sourceReport: path.relative(report, R + '/../foundation-four-live-2026-10-28/report.json.gz'),
    verification: path.relative(report, R + '/package-verification.json'), replay: path.relative(report, R + '/private-replay.json'),
    freshApollo: 'NOT_RUN_USER_ONLY', gaps: name === 'SegmentedControl' ? ['Segment child contract; SG09 two-word label rule remains uncovered', 'Paired runtime/data adoption pending'] : ['Paired runtime/data adoption and fresh Apollo pending']});
  const zip = pin(archive), m = pin(dir + '/contract.manual.json');
  Object.assign(record, {revision: 2, archiveSha256: zip.sha256, manualSourceHash: summary.manualSourceHash,
    compiledHash: summary.compiledHash, sourceExportVersion: compiled.package.sourceExportVersion, manual: m});
  Object.assign(old, {revision: 2, file: zip.path, sourceRules: summary.sourceRules, ruleIR: summary.ruleIR,
    nonExecutableRules: summary.nonExecutableRules, ruleStatuses: {draft: summary.sourceRules}, zipSha256: zip.sha256, bytes: zip.bytes,
    manualSourceHash: summary.manualSourceHash, manualEntrySha256: m.sha256, compiledHash: summary.compiledHash,
    statusScope: 'Draft r2: exact native report replay/ZIP reopen PASS; runtime/data pair adoption and fresh Apollo pending.' + (name === 'SegmentedControl' ? ' Nested Segment and SG09 remain an explicit gap.' : ''),
    currentEvidence: '../../' + path.relative(A, report + '/eval.json')});
  records.push({name, manual: m, archive: zip, report: path.relative(A, report)});
}
for (const entry of before.index.entries.filter(e => !names.includes(e.name))) assert.deepEqual(index.entries.find(e => e.contractId === entry.contractId), entry);
assert.deepEqual(index.dependencySources, before.index.dependencySources);
for (const entry of before.manifest.packages.filter(e => !names.includes(e.name))) assert.deepEqual(manifest.packages.find(e => e.contractId === entry.contractId), entry);
write(ip, index); manifest.authoringIndex = {file: '../../JSONS/indexes/component-contracts.index.json', sha256: pin(ip).sha256, bytes: pin(ip).bytes};
manifest.updatedAt = new Date().toISOString(); write(mp, manifest);
const crosswalkPath = A + '/apollo/rule-crosswalk.json', crosswalk = read(crosswalkPath);
const entries = crosswalk.entries || crosswalk.rules || crosswalk.mappings;
assert(Array.isArray(entries));
for (const name of names) {
  const manual = read(R + '/candidate/' + name + '/contract.manual.json');
  for (const rule of manual.rules) {
    const matches = entries.filter(e => e.apolloRuleId === rule.id); assert.equal(matches.length, 1, rule.id);
    matches[0].enforcementScope = name + ' / ' + rule.targetId + ' / ' + JSON.stringify(rule.applicability.variants);
    matches[0].review = Object.assign({}, matches[0].review, {reviewedAt: '2026-10-28', basis: 'r2 source/routing readback; exact 25-case retained replay. Semantic source correspondence retained; no Ready/fresh Apollo claim.'});
  }
}
write(crosswalkPath, crosswalk);
write(R + '/APPLIED.json', {status: 'CANONICAL_DRAFT_R2_SOURCE_APPLIED', records, packages: manifest.packages.length,
  otherCanonicalEntriesPreserved: index.entries.length - 3, dependencySourcesUnchanged: true, installed: false, pushed: false});
console.log({packages: manifest.packages.length, updated: names, installed: false});
