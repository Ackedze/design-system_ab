'use strict';
const fs = require('node:fs');
const path = require('node:path');
const p = require('./protocol.cjs');
const clone = v => JSON.parse(JSON.stringify(v));
const encode = v => JSON.stringify(v, null, 2) + '\n';
const inside = (root, file) => file.startsWith(root + path.sep);
function unique(rows) {
  const map = new Map();
  for (const row of rows) {
    if (map.has(row.path)) p.exact(map.get(row.path), row, 'BINDING_PIN_CONFLICT');
    map.set(row.path, row);
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}
function manifestFor(ctx, options) {
  const { roots, requestPin, baselineVectorPin, baselineManifestPin, baselineReportPin, toolPins } = options;
  const a = clone(ctx.baselineManifest); delete a.artifactDigest;
  const files = Array.from(ctx.inventory.values());
  const relativeRows = root => files.filter(f => inside(root, f.path)).map(f => ({ path: p.relative(root, f.path), sha256: f.sha256 }));
  a.producerFiles = unique(relativeRows(roots.producer));
  a.consumerFiles = unique(relativeRows(roots.generation));
  a.workspaceConsumerFiles = unique(files.filter(f => inside(roots.workspace, f.path)
    && !inside(roots.producer, f.path) && !inside(roots.generation, f.path))
    .map(f => ({ path: p.relative(roots.workspace, f.path), sha256: f.sha256 })));
  a.requestPins = unique([requestPin, ctx.q.vectorPin, baselineVectorPin, baselineManifestPin, baselineReportPin,
    ...files.filter(f => !inside(roots.workspace, f.path))]);
  a.consumerVector = clone(ctx.q.vectorPin); a.consumerVersions = clone(ctx.q.versions);
  a.buildInputs = clone(ctx.build.inputs);
  // Every old helper is preserved; the new helper must be a byte-identical v1 copy.
  const helperPin = toolPins.find(f => f.path === path.join(__dirname, 'producer.cjs'));
  if (!helperPin) p.fail('BINDING_PRODUCER_WIRE');
  const priorHelpers = ctx.baselineManifest.producerFiles.filter(f => f.path.endsWith('/producer.cjs'));
  if (!priorHelpers.length || priorHelpers.some(f => f.sha256 !== helperPin.sha256)) p.fail('BINDING_PRODUCER_WIRE');
  a.historicalSnapshotFiles = unique(options.immutablePins.filter(f => inside(roots.producer, f.path))
    .map(f => ({ path: p.relative(roots.producer, f.path), sha256: f.sha256 })));
  a.rebind = { kind: 'exact-consumer-rebind-same-wire', snapshot: ctx.q.runId,
    previousManifest: baselineManifestPin, previousReport: baselineReportPin, producerSourceUnchanged: true,
    reviewImport: 'separate unaccepted inspection; not Generation execution support',
    sourceObservation: 'strict v1 runtime source read; historical observations not reused',
    proxyConfig: ctx.q.configPin, configArchive: ctx.q.c0ArchivePin,
    panelFreshness: 'not-claimed; preselection C0 remains the producer basis' };
  a.artifactDigest = p.digest(a);
  return a;
}
function preflight(options) {
  const ctx = p.prepare(options); ctx.assertCurrent();
  const manifest = manifestFor(ctx, options);
  return { ctx, manifest };
}
async function bounded(ctx, operation) {
  ctx.assertCurrent();
  const value = await operation();
  ctx.assertCurrent();
  return value;
}
function archiveConfig({ configPin, archivePath, write = fs.writeFileSync, read = fs.readFileSync }) {
  p.absolute(archivePath);
  if (archivePath !== path.join(__dirname, 'preselection-config.json') || archivePath === configPin.path) p.fail('BINDING_WRITE_SCOPE');
  const bytes = p.readPin(configPin, read); p.config(bytes);
  write(archivePath, bytes, { flag: 'wx' });
  p.readPin(configPin, read);
  const result = { path: archivePath, sha256: p.hash(bytes) }; p.readPin(result, read); return result;
}
async function build(options) {
  // This operation belongs to the separately authorized post-V0 stage.
  // No writes happen when importing this module or during preflight.
  const { ctx, manifest } = preflight(options);
  const names = ['producer.v1-draft.json', ...ctx.q.cases.map(c => `synthetic.${c.id}.review.json`), 'review-report.v1-draft.json'];
  if (names.some(n => fs.existsSync(path.join(__dirname, n)))) p.fail('BINDING_ALREADY_BUILT');
  const bridge = require('../../registry/consumer.cjs');
  const registry = bridge.loadRegistry(), lock = JSON.parse(fs.readFileSync(path.join(options.roots.producer, manifest.frozen.lock.path)));
  bridge.verifyLock(registry, lock); bridge.verifySource(registry, options.roots.producer, options.roots.workspace);
  p.exact(lock.inputPackages, manifest.frozen.inputPackages, 'BINDING_SOURCE');
  ctx.assertCurrent();
  function write(name, bytes) {
    const file = path.join(__dirname, name); fs.writeFileSync(file, bytes, { flag: 'wx' });
    return { path: file, sha256: p.hash(bytes) };
  }
  const manifestPin = write(names[0], encode(manifest));
  const producer = require('./producer.cjs');
  const outputs = [];
  function assertSnapshot() {
    p.readPin(manifestPin);
    for (const o of outputs) p.readPin({ path: o.path, sha256: o.sha256 });
  }
  for (const c of ctx.q.cases) {
    assertSnapshot();
    const result = await bounded(ctx, () => producer.prepareStatic(c.spec));
    assertSnapshot();
    const bytes = await bounded(ctx, () => producer.emitStatic(result));
    assertSnapshot();
    const pin = write(`synthetic.${c.id}.review.json`, bytes);
    outputs.push({ ...pin, inputHash: result.inputHash, planHash: result.planHash, contentHash: result.contentHash,
      observationHash: result.observation.observationHash, apiExpressibility: result.apiExpressibility,
      accepted: false, executionAllowed: false, generationPlanHash: null, targetSupport: result.targetSupport,
      diagnosticCodes: result.diagnostics.map(d => d.code), generationSourceRead: result.generationSourceRead });
  }
  ctx.assertCurrent(); assertSnapshot(); producer.verifyFresh();
  const report = { documentType: 'next-03-code-connect-static-source-api-review-handoff', version: 1,
    status: 'exact-rebind-basis-for-independent-review-import', accepted: false, executionAllowed: false, generationPlanHash: null,
    producerManifest: { ...manifestPin, artifactDigest: manifest.artifactDigest }, consumerVector: ctx.q.vectorPin,
    outputs, sourcePackages: manifest.frozen.inputPackages };
  const reportPin = write('review-report.v1-draft.json', encode(report));
  ctx.assertCurrent(); assertSnapshot(); p.readPin(reportPin);
  return { manifestPin, reportPin, outputs, accepted: false, executionAllowed: false, generationPlanHash: null };
}
module.exports = { unique, encode, manifestFor, preflight, bounded, archiveConfig, build };
