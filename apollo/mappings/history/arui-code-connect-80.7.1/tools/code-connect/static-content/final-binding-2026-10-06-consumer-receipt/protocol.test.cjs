'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const p = require('./protocol.cjs');
const builder = require('./builder.cjs');
const verifier = require('./verifier.cjs');
const { fixture } = require('./structural-fixture.cjs');
const reject = (fn, code) => assert.throws(fn, e => e.code === code);
test('finite preparation and receipt preserve original config-only mismatch', () => {
  const f = fixture(); const c = builder.preflight(f.options);
  assert.equal(c.manifest.artifactDigest, p.digest(Object.fromEntries(Object.entries(c.manifest).filter(([k]) => k !== 'artifactDigest'))));
  const s = f.seal(); const result = verifier.receipt(f.options);
  assert.equal(result.consumerBinding, 'structurally-verified'); assert.equal(result.producerFreshness, 'stale');
  assert.deepEqual(result.mismatches, [{ path: f.configPin.path, expectedSha256: f.configPin.sha256, actualSha256: s.finalConfigPin.sha256 }]);
  assert.equal(result.accepted, false); assert.equal(result.executionAllowed, false); assert.equal(result.generationPlanHash, null);
});
test('N01 rejects whitespace even after resealing config, V1 and receipt', () => {
  const f = fixture(), s = f.seal();
  s.r.selection.configPin = f.put(f.configPin.path, f.read(f.configPin.path).toString() + ' ');
  s.v1.files = s.v1.files.map(pin => pin.path === f.configPin.path ? s.r.selection.configPin : pin); s.repinV1();
  reject(() => verifier.receipt(f.options), 'BINDING_CONFIG_DELTA');
});
for (const key of ['manifestPin', 'reportPin']) test(`N01 rejects wrong ${key} selectors independently of raw byte reseal`, () => {
  const f = fixture(), s = f.seal(); const config = p.config(f.read(f.configPin.path)); config[key].sha256 = p.hash('wrong');
  s.r.selection.configPin = f.put(f.configPin.path, config); s.v1.files = s.v1.files.map(pin => pin.path === f.configPin.path ? s.r.selection.configPin : pin); s.repinV1();
  reject(() => verifier.receipt(f.options), 'BINDING_SELECTOR');
});
test('N01 identical content cannot substitute a different manifest basis', () => {
  const f = fixture(), s = f.seal(); s.r.producer.manifestPin = f.put('/synthetic-private/other-manifest.json', f.read(s.manifestPin.path).toString()); s.repinReceipt();
  reject(() => verifier.receipt(f.options), 'BINDING_SELECTOR');
});
test('N02 refuses wrong externally supplied receipt hash', () => {
  const f = fixture(); f.seal(); f.options.receiptPin.sha256 = p.hash('wrong');
  reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE');
});
test('N02 missing receipt pin cannot fall back to imported data', () => {
  const f = fixture(); f.seal(); delete f.options.receiptPin; reject(() => verifier.receipt(f.options), 'BINDING_PIN');
});
for (const mutate of [r => { r.receiptPin = r.producer.manifestPin; }, r => { r.schemaVersion = 'unknown'; },
  r => { r.final.vectorPin.path = '/synthetic-private/../escape.json'; }]) test('N02 closed receipt version/path and self-selected pin rejected', () => {
  const f = fixture(), s = f.seal(); mutate(s.r); s.repinReceipt(); assert.throws(() => verifier.receipt(f.options));
});
test('N02 config rejects extra receipt selector', () => { const f = fixture(); const c = p.config(f.read(f.configPin.path)); c.receiptPin = f.q.vectorPin; reject(() => p.config(Buffer.from(JSON.stringify(c))), 'BINDING_CONFIG'); });
test('N03 archive must be byte-identical, separate and in V0', () => {
  const f = fixture(); f.q.c0ArchivePin = f.put(f.c0ArchivePin.path, f.read(f.configPin.path).toString() + ' '); f.repinRequest();
  reject(() => builder.preflight(f.options), 'BINDING_PIN_STALE');
});
test('N03 same path cannot serve as mutable config and archive', () => { const f = fixture(); f.q.c0ArchivePin = f.configPin; f.repinRequest(); reject(() => builder.preflight(f.options), 'BINDING_CONFIG_ARCHIVE'); });
test('N03 resealing an altered archive still fails raw C0 equality', () => {
  const f = fixture(); const changed = f.put(f.c0ArchivePin.path, f.read(f.configPin.path).toString() + ' ');
  f.q.c0ArchivePin = changed; f.q.newFiles = f.q.newFiles.map(pin => pin.path === changed.path ? changed : pin);
  f.v0.files = f.v0.files.map(pin => pin.path === changed.path ? changed : pin); f.repinV0();
  reject(() => builder.preflight(f.options), 'BINDING_CONFIG_ARCHIVE');
});
for (const target of ['config', 'README']) test(`N03 omitted ${target} pin is rejected`, () => {
  const f = fixture(); const file = target === 'config' ? f.configPin.path : f.proxy[3].path;
  f.v0.files = f.v0.files.filter(pin => pin.path !== file); f.repinV0(); reject(() => builder.preflight(f.options), 'BINDING_COVERAGE');
});
test('N03 a source edit cannot be declared as a downstream addition', () => {
  const f = fixture(), s = f.seal(); const pin = f.put(f.proxy[3].path, 'edited README');
  s.v1.files = s.v1.files.map(old => old.path === pin.path ? pin : old); s.repinV1(); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE');
  reject(() => p.transition({ v0: f.v0, v1: s.v1, c0ArchiveBytes: f.read(f.c0ArchivePin.path), c1Bytes: f.read(f.configPin.path),
    configPath: f.configPin.path, producerRoot: f.options.roots.producer, manifestPin: s.manifestPin, reportPin: s.reportPin,
    downstreamPins: s.r.additions.map(item => item.pin) }), 'BINDING_DELTA');
});
for (const index of [0, 1, 2, 3, 4, 5, 6]) test(`N04 detects each original/new build input drift #${index}`, () => {
  const f = fixture(); f.seal(); f.put(f.buildFiles[index].path, 'drift'); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE');
});
for (const index of [0, 1, 2]) test(`N04 provider/root/migration drift #${index}`, () => {
  const f = fixture(); f.seal(); f.put(f.proxy[index].path, 'drift'); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE');
});
test('N04 build manifest drift rejects complete receipt', () => { const f = fixture(); f.seal(); f.put(f.q.buildManifestPin.path, '{}'); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE'); });
test('N04 dropping an original input from a resealed build manifest fails', () => {
  const f = fixture(); const build = JSON.parse(f.read(f.q.buildManifestPin.path)); build.inputs.pop(); build.inputs.shift();
  f.q.buildManifestPin = f.put(f.q.buildManifestPin.path, build);
  f.v0.files = f.v0.files.map(pin => pin.path === f.q.buildManifestPin.path ? f.q.buildManifestPin : pin);
  f.v0.buildInputs = build.inputs.map(pin => ({ path: require('node:path').join(f.options.roots.generation, pin.path), sha256: pin.sha256 }));
  f.q.approvedChanges = [{ path: f.q.buildManifestPin.path, beforeSha256: f.baseline.files.find(pin => pin.path === f.q.buildManifestPin.path).sha256, afterSha256: f.q.buildManifestPin.sha256 }];
  f.repinV0(); reject(() => builder.preflight(f.options), 'BINDING_BUILD_OMITTED');
});
test('N04 V1 and receipt tampering are rejected without trusting their own claims', () => { const f = fixture(), s = f.seal(); f.put(s.finalVectorPin.path, '{}'); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE'); });
test('N04 resealed receipt cannot reduce the required producer closure', () => {
  const f = fixture(), s = f.seal(); s.r.closurePins.pop(); s.repinReceipt(); reject(() => verifier.receipt(f.options), 'BINDING_COVERAGE');
});
for (let index = 0; index < 10; index++) test(`N05 every five-package ZIP/manual pin checked #${index}`, () => {
  const f = fixture(); f.put(f.packagePins[index].path, 'drift'); reject(() => builder.preflight(f.options), 'BINDING_PIN_STALE');
});
for (const suffix of ['synthetic-registry.json', 'synthetic-lock.json', 'synthetic-api/index.d.ts']) test(`N05 frozen registry/lock/API ${suffix}`, () => {
  const f = fixture(); const pin = f.baseline.files.find(pin => pin.path.endsWith(suffix)); f.put(pin.path, 'drift'); reject(() => builder.preflight(f.options), 'BINDING_PIN_STALE');
});
test('N05 removing transitive dependency package fails full coverage', () => { const f = fixture(); const pin = f.packagePins[2]; f.v0.files = f.v0.files.filter(p => p.path !== pin.path); f.repinV0(); reject(() => builder.preflight(f.options), 'BINDING_IMMUTABLE'); });
for (const field of ['inputHash', 'planHash', 'contentHash', 'observationHash']) test(`N06 output ${field} is recomputed against declared pinned basis`, () => {
  const f = fixture(), s = f.seal(); const o = JSON.parse(f.read(s.outputs[0].path));
  if (field === 'observationHash') o.observation[field] = p.hash('wrong'); else o[field] = p.hash('wrong');
  reject(() => verifier.output(o, s.outputs[0], s.manifest, f.q.cases[0].spec), 'BINDING_OUTPUT_HASH');
});
for (const id of [1, 2]) test(`N06 unsupported structural case #${id} retains apiIntent=null`, () => {
  const f = fixture(), s = f.seal(), o = JSON.parse(f.read(s.outputs[id].path)); assert.equal(o.apiIntent, null);
  o.apiIntent = { kind: 'non-executable-public-api-intent' }; reject(() => verifier.output(o, s.outputs[id], s.manifest, f.q.cases[id].spec), 'BINDING_API_LIMIT');
});
for (const kind of ['loading', 'provenance', 'id', 'order']) test(`N06 resealed ${kind} still fails structural content checks`, () => {
  const f = fixture(), s = f.seal(), o = JSON.parse(f.read(s.outputs[0].path));
  if (kind === 'loading') o.content.actions[0].loading = true;
  if (kind === 'provenance') o.content.provenance[0].symbolId = 'invented';
  if (kind === 'id') o.content.actions[0].id = 'invented';
  if (kind === 'order') o.content.actions.reverse();
  o.plan.content = o.content; o.contentHash = p.digest(o.content); o.planHash = p.digest(o.plan);
  Object.assign(o.observation, { contentHash: o.contentHash, planHash: o.planHash });
  const x = { ...o.observation }; delete x.observationHash; o.observation.observationHash = p.digest(x);
  const declared = { ...s.outputs[0], contentHash: o.contentHash, planHash: o.planHash, observationHash: o.observation.observationHash };
  assert.throws(() => verifier.output(o, declared, s.manifest, f.q.cases[0].spec), e => ['BINDING_CONTENT', 'BINDING_PROVENANCE'].includes(e.code));
});
test('N07 before/during/after await drift fails bounded reads', async () => {
  for (const when of ['before', 'during', 'after']) {
    const f = fixture(), ctx = builder.preflight(f.options).ctx;
    if (when === 'before') f.put(f.proxy[0].path, 'drift');
    if (when === 'after') { await builder.bounded(ctx, async () => true); f.put(f.proxy[0].path, 'drift'); reject(() => ctx.assertCurrent(), 'BINDING_PIN_STALE'); }
    else await assert.rejects(builder.bounded(ctx, async () => { if (when === 'during') f.put(f.proxy[0].path, 'drift'); return true; }), e => e.code === 'BINDING_PIN_STALE');
  }
});
test('N07 receipt readback guards drift after validation', () => { const f = fixture(); f.seal(); const r = verifier.receipt(f.options); f.put(f.proxy[0].path, 'drift'); reject(() => r.assertCurrent(), 'BINDING_PIN_STALE'); });
test('N07 rollback to C0 cannot replay a C1 receipt', () => { const f = fixture(); f.seal(); f.put(f.configPin.path, f.read(f.c0ArchivePin.path).toString()); reject(() => verifier.receipt(f.options), 'BINDING_PIN_STALE'); });
for (const [key, value] of [['accepted', true], ['executionAllowed', true], ['generationPlanHash', p.hash('fake-plan')]]) test(`N08 receipt cannot forge ${key}`, () => {
  const f = fixture(), s = f.seal(); s.r[key] = value; s.repinReceipt(); reject(() => verifier.receipt(f.options), 'BINDING_AUTHORITY');
});
for (const field of ['ready', 'live', 'release', 'Predicate']) test(`N08 closed receipt rejects added ${field} claim`, () => {
  const f = fixture(), s = f.seal(); s.r[field] = 'accepted'; s.repinReceipt(); reject(() => verifier.receipt(f.options), 'BINDING_RECEIPT');
});
test('N08 output v1 remains closed; no top-level Generation fields are invented', () => { const f = fixture(), s = f.seal(); const o = JSON.parse(f.read(s.outputs[0].path)); o.generationPlanHash = null; reject(() => verifier.output(o, s.outputs[0], s.manifest, f.q.cases[0].spec), 'BINDING_OUTPUT'); });
test('N09 V0 cannot include its downstream request', () => { const f = fixture(); f.v0.files.push(f.options.requestPin); f.repinV0(); reject(() => builder.preflight(f.options), 'BINDING_PIN_STALE'); });
test('N09 graph enforces the complete finite phase order', () => {
  const order = ['source', 'config-pre', 'config-archive', 'vector-pre', 'request', 'producer', 'output', 'basis', 'config-final', 'vector-final', 'receipt', 'readback', 'general-proof'];
  const nodes = order.map((kind, i) => ({ id: String(i), kind, dependencies: i > 3 ? [String(i - 1)] : [] })); assert.equal(p.graph(nodes), true);
  for (const [from, to] of [[0, 3], [3, 4], [9, 10], [10, 11], [8, 10], [10, 10]]) {
    const changed = JSON.parse(JSON.stringify(nodes)); changed[from].dependencies.push(String(to)); reject(() => p.graph(changed), 'BINDING_BACKREFERENCE');
  }
});
test('N09 V1 cannot add R as an upstream artifact', () => { const f = fixture(), s = f.seal(); s.v1.files.push(s.receiptPin); s.repinV1(); reject(() => verifier.receipt(f.options), 'BINDING_BACKREFERENCE'); });
test('N09 V1 cannot add post-R detached readback', () => { const f = fixture(), s = f.seal(); s.v1.files.push(f.put('/synthetic-private/readback.json', '{}')); s.repinV1(); reject(() => verifier.receipt(f.options), 'BINDING_UNDECLARED_ADDITION'); });
test('new helper must retain exact v1 producer bytes', () => {
  const f = fixture(); const old = f.options.toolPins[0]; const changed = f.put(old.path, 'different producer implementation');
  f.options.toolPins = [changed]; f.q.newFiles = f.q.newFiles.map(pin => pin.path === old.path ? changed : pin);
  f.v0.files = f.v0.files.map(pin => pin.path === old.path ? changed : pin); f.repinV0();
  reject(() => builder.preflight(f.options), 'BINDING_PRODUCER_WIRE');
});
test('undeclared source addition and protected delta rejected', () => {
  const f = fixture(); f.v0.files.push(f.put('/synthetic-private/unreviewed.json', '{}')); f.repinV0(); reject(() => builder.preflight(f.options), 'BINDING_UNDECLARED_ADDITION');
});
test('archive operation is an exact copy in memory and leaves C0 bytes unchanged', () => {
  const f = fixture(); f.files.delete(f.c0ArchivePin.path);
  const before = f.read(f.configPin.path);
  const write = (file, bytes, options) => { assert.equal(options.flag, 'wx'); if (f.files.has(file)) throw Error('EEXIST'); f.files.set(file, Buffer.from(bytes)); };
  const pin = builder.archiveConfig({ configPin: f.configPin, archivePath: f.c0ArchivePin.path, read: f.read, write });
  assert.deepEqual(f.read(pin.path), before); assert.deepEqual(f.read(f.configPin.path), before);
  assert.throws(() => builder.archiveConfig({ configPin: f.configPin, archivePath: pin.path, read: f.read, write }), /EEXIST/);
});
test('archive copy detects a concurrent C0 edit before returning', () => {
  const f = fixture(); f.files.delete(f.c0ArchivePin.path);
  reject(() => builder.archiveConfig({ configPin: f.configPin, archivePath: f.c0ArchivePin.path, read: f.read,
    write(file, bytes) { f.files.set(file, Buffer.from(bytes)); f.put(f.configPin.path, 'drift'); } }), 'BINDING_PIN_STALE');
});
test('structural inspection preserves mismatches and guards later drift', () => {
  const f = fixture(); f.seal(); const inspected = verifier.inspect(f.options);
  assert.equal(inspected.producerFreshness, 'stale'); assert.equal(inspected.mismatches.length, 1);
  f.put(f.proxy[1].path, 'drift'); reject(() => inspected.assertCurrent(), 'BINDING_READ_CHANGED');
});
