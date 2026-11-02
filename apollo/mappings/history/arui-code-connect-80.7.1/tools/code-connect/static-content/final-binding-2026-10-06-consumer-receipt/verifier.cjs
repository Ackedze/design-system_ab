'use strict';
const fs = require('node:fs');
const path = require('node:path');
const p = require('./protocol.cjs');
const { unique } = require('./builder.cjs');
function noExecution(v) {
  if (v.accepted !== false || v.executionAllowed !== false) p.fail('BINDING_AUTHORITY');
}
function output(document, declared, manifest, expectedSpec) {
  p.closed(document, ['schemaVersion', 'status', 'accepted', 'executionAllowed', 'apiExpressibility', 'targetSupport',
    'inputHash', 'planHash', 'plan', 'contentHash', 'content', 'apiIntent', 'diagnostics', 'observation',
    'generationSourceRead', 'generationPreflight', 'gaps'], 'BINDING_OUTPUT');
  noExecution(document); p.authority(document.observation);
  if (document.schemaVersion !== 'apollo.code-connect.static-content.v1-draft' || document.status !== 'draft'
    || document.plan.executionAllowed !== false || document.plan.generationPlanHash !== null
    || document.generationPreflight.executionAllowed !== false) p.fail('BINDING_OUTPUT');
  p.exact(document.targetSupport, { figma: 'not-supported', frontend: 'not-supported' }, 'BINDING_AUTHORITY');
  p.exact(document.plan.spec, expectedSpec, 'BINDING_INPUT');
  const checks = { inputHash: p.digest(expectedSpec), planHash: p.digest(document.plan), contentHash: p.digest(document.content) };
  p.exact(document.content, document.plan.content, 'BINDING_CONTENT');
  const observation = Object.assign({}, document.observation); delete observation.observationHash;
  checks.observationHash = p.digest(observation);
  for (const [k, h] of Object.entries(checks)) {
    if (declared[k] !== h || (k === 'observationHash' ? document.observation[k] : document[k]) !== h) p.fail('BINDING_OUTPUT_HASH', k);
  }
  for (const k of ['inputHash', 'planHash', 'contentHash']) if (document.observation[k] !== checks[k]) p.fail('BINDING_OBSERVATION');
  const planPins = { specHash: checks.inputHash, artifactDigest: manifest.artifactDigest,
    registryDigest: manifest.frozen.registryDigest, currentInputsDigest: manifest.frozen.currentInputsDigest,
    lockDigest: manifest.frozen.lockDigest, consumerFilesDigest: p.digest(manifest.consumerFiles),
    workspaceConsumerFilesDigest: p.digest(manifest.workspaceConsumerFiles), buildInputsDigest: p.digest(manifest.buildInputs) };
  p.exact(document.plan.pins, planPins, 'BINDING_PLAN_PINS');
  p.exact(document.observation.planPins, planPins, 'BINDING_PLAN_PINS');
  if (document.observation.artifactDigest !== manifest.artifactDigest || document.observation.generationWireSupport !== 'not-supported'
    || document.observation.generationSourceReadHash !== p.digest(document.generationSourceRead)) p.fail('BINDING_OBSERVATION');
  p.exact(document.observation.consumerVector, manifest.consumerVector, 'BINDING_OBSERVATION');
  p.exact(document.observation.inputPackages, manifest.frozen.inputPackages, 'BINDING_SOURCE');
  for (const [field, source] of [['consumerFilesDigest', 'consumerFiles'], ['workspaceConsumerFilesDigest', 'workspaceConsumerFiles'],
    ['buildInputsDigest', 'buildInputs'], ['apiEvidenceDigest', 'apiEvidenceFiles']])
    if (document.observation[field] !== p.digest(manifest[source])) p.fail('BINDING_OBSERVATION');
  for (const field of ['registryDigest', 'currentInputsDigest', 'lockDigest', 'basisRegistryDigest'])
    if (document.observation[field] !== manifest.frozen[field]) p.fail('BINDING_SOURCE');
  const c = document.content;
  if (!Array.isArray(c.actions) || !c.actions.length || c.actions.some(a => a.loading !== false || typeof a.disabled !== 'boolean'
    || typeof a.id !== 'string' || typeof a.label !== 'string') || c.size !== '56' || c.overflow !== false) p.fail('BINDING_CONTENT');
  p.exact(c.actions.map(a => a.id), c.displayOrder, 'BINDING_CONTENT');
  p.exact(c.provenance, c.actions.map(a => ({ actionId: a.id, ownerNodeId: c.groupNodeId, port: 'button-label', canonicalOccurrenceId: null, symbolId: null })), 'BINDING_PROVENANCE');
  const unsupported = c.actions.some((a, i) => i > 0 && a.view === 'primary') || p.digest(c.displayOrder) !== p.digest(c.priorityOrder);
  if (document.apiExpressibility !== (unsupported ? 'not-supported' : 'bounded-content-expressible')
    || (unsupported ? document.apiIntent !== null : document.apiIntent?.kind !== 'non-executable-public-api-intent')) p.fail('BINDING_API_LIMIT');
  p.exact(declared.generationSourceRead, document.generationSourceRead, 'BINDING_OUTPUT_HASH');
  return checks;
}
function closure(manifest, roots) {
  const rows = [];
  for (const [root, key] of [[roots.producer, 'producerFiles'], [roots.producer, 'apiEvidenceFiles'], [roots.generation, 'consumerFiles'],
    [roots.workspace, 'workspaceConsumerFiles'], [roots.generation, 'buildInputs']]) {
    if (!Array.isArray(manifest[key]) || !manifest[key].length) p.fail('BINDING_INVENTORY');
    for (const pin of manifest[key]) {
      if (typeof pin.path !== 'string' || path.isAbsolute(pin.path) || pin.path.includes('\\') || pin.path.split('/').some(x => !x || x === '.' || x === '..')) p.fail('BINDING_PATH');
      rows.push({ path: path.join(root, pin.path), sha256: pin.sha256 });
    }
  }
  rows.push(...manifest.requestPins);
  for (const pin of [manifest.frozen.registry, manifest.frozen.lock]) rows.push({ path: path.join(roots.producer, pin.path), sha256: pin.sha256 });
  for (const pkg of manifest.frozen.inputPackages) {
    rows.push({ path: path.join(roots.workspace, pkg.archivePath), sha256: pkg.archiveSha256 },
      { path: path.join(roots.workspace, pkg.manualPath), sha256: pkg.mainManualSha256 });
  }
  const result = unique(rows); p.pins(result); return result;
}
function inspect({ manifestPin, reportPin, requestPin, roots, read = fs.readFileSync }) {
  const a = p.jsonPin(manifestPin, read), b = p.jsonPin(reportPin, read), q = p.jsonPin(requestPin, read);
  p.authority(a); p.authority(b); p.authority(q);
  const payload = Object.assign({}, a); delete payload.artifactDigest;
  if (a.schemaVersion !== 'apollo.code-connect.static-producer.v1-draft' || a.status !== 'draft' || a.version !== 1
    || a.artifactDigest !== p.digest(payload) || a.generationWireSupport !== 'not-supported'
    || b.producerManifest.path !== manifestPin.path || b.producerManifest.sha256 !== manifestPin.sha256
    || b.producerManifest.artifactDigest !== a.artifactDigest) p.fail('BINDING_BASIS');
  p.exact(a.consumerVector, q.vectorPin, 'BINDING_BASIS'); p.exact(b.consumerVector, q.vectorPin, 'BINDING_BASIS');
  p.exact(a.frozen.inputPackages, b.sourcePackages, 'BINDING_SOURCE');
  if (!a.requestPins.some(pin => p.digest(pin) === p.digest(requestPin)) || b.outputs.length !== 3 || q.cases.length !== 3) p.fail('BINDING_COVERAGE');
  const outputPaths = new Set();
  for (let i = 0; i < b.outputs.length; i++) {
    const declared = b.outputs[i]; p.authority(declared);
    if (outputPaths.has(declared.path) || declared.path !== path.join(path.dirname(manifestPin.path), `synthetic.${q.cases[i].id}.review.json`)) p.fail('BINDING_OUTPUT');
    outputPaths.add(declared.path);
    output(p.jsonPin({ path: declared.path, sha256: declared.sha256 }, read), declared, a, q.cases[i].spec);
  }
  const all = closure(a, roots), mismatches = [], observed = [];
  for (const pin of all) {
    let actual = null; try { actual = p.hash(read(pin.path)); } catch {}
    observed.push({ path: pin.path, sha256: actual });
    if (actual !== pin.sha256) mismatches.push({ path: pin.path, expectedSha256: pin.sha256, actualSha256: actual });
  }
  function assertCurrent() {
    for (const pin of [manifestPin, reportPin, requestPin, ...b.outputs.map(o => ({ path: o.path, sha256: o.sha256 }))]) p.readPin(pin, read);
    for (const pin of observed) {
      let current = null; try { current = p.hash(read(pin.path)); } catch {}
      if (current !== pin.sha256) p.fail('BINDING_READ_CHANGED', pin.path);
    }
  }
  assertCurrent();
  return { manifest: a, basis: b, request: q, closurePins: all, producerFreshness: mismatches.length ? 'stale' : 'matches', assertCurrent,
    mismatches, accepted: false, executionAllowed: false, generationPlanHash: null, scope: 'structural-byte-and-provenance-inspection-only' };
}
function receipt(options) {
  // The imported documents cannot supply or replace this local trust input.
  const { receiptPin, manifestPin, reportPin, roots, read = fs.readFileSync } = options;
  const r = p.jsonPin(receiptPin, read);
  p.closed(r, ['schemaVersion', 'status', 'accepted', 'executionAllowed', 'generationPlanHash', 'baselineVectorPin',
    'producer', 'preselection', 'selection', 'final', 'closurePins', 'additions'], 'BINDING_RECEIPT');
  p.authority(r);
  if (r.schemaVersion !== p.RECEIPT || r.status !== 'draft') p.fail('BINDING_RECEIPT');
  for (const [value, keys] of [[r.producer, ['manifestPin', 'basisPin', 'artifactDigest', 'outputs']],
    [r.preselection, ['vectorPin', 'configArchivePin', 'configPath', 'configSha256']],
    [r.selection, ['configPin', 'manifestPin', 'reportPin']], [r.final, ['vectorPin', 'buildManifestPin', 'runtimePins']]])
    p.closed(value, keys, 'BINDING_RECEIPT');
  for (const pin of [r.producer.manifestPin, r.selection.manifestPin]) p.exact(pin, manifestPin, 'BINDING_SELECTOR');
  for (const pin of [r.producer.basisPin, r.selection.reportPin]) p.exact(pin, reportPin, 'BINDING_SELECTOR');
  p.exact(r.baselineVectorPin, options.baselineVectorPin, 'BINDING_BASIS');
  const c0 = p.readPin(r.preselection.configArchivePin, read);
  const historicalRead = file => file === r.preselection.configPath ? c0 : read(file);
  const prepared = p.prepare(Object.assign({}, options, { read: historicalRead }));
  p.exact(r.preselection.vectorPin, prepared.q.vectorPin, 'BINDING_BASIS');
  p.exact(r.preselection.configArchivePin, prepared.q.c0ArchivePin, 'BINDING_CONFIG_ARCHIVE');
  if (r.preselection.configPath !== prepared.q.configPin.path || r.preselection.configSha256 !== prepared.q.configPin.sha256) p.fail('BINDING_CONFIG_ARCHIVE');
  p.exact(r.final.buildManifestPin, prepared.q.buildManifestPin, 'BINDING_BUILD');
  const inspection = inspect(options);
  const { manifest: a, basis: b } = inspection;
  const expectedManifest = require('./builder.cjs').manifestFor(prepared, options);
  p.exact(a, expectedManifest, 'BINDING_PRODUCER');
  if (a.artifactDigest !== r.producer.artifactDigest) p.fail('BINDING_PRODUCER');
  p.exact(r.producer.outputs, b.outputs.map(o => ({ path: o.path, sha256: o.sha256, inputHash: o.inputHash,
    planHash: o.planHash, contentHash: o.contentHash, observationHash: o.observationHash })), 'BINDING_OUTPUT');
  p.exact(unique(r.closurePins), inspection.closurePins, 'BINDING_COVERAGE'); p.pins(r.closurePins);
  const downstream = new Map();
  for (const [role, rows] of [['producer', [manifestPin]], ['basis', [reportPin]], ['output', b.outputs.map(o => ({ path: o.path, sha256: o.sha256 }))],
    ['request', a.requestPins], ['config-archive', [prepared.q.c0ArchivePin]], ['preselection-vector', [prepared.q.vectorPin]]])
    for (const pin of rows) if (!prepared.inventory.has(pin.path)) {
      const old = downstream.get(pin.path);
      if (old) p.exact(old.pin, pin, 'BINDING_PIN_CONFLICT');
      downstream.set(pin.path, { role, pin });
    }
  if (!Array.isArray(r.additions) || r.additions.length !== downstream.size) p.fail('BINDING_DELTA');
  const seen = new Set();
  for (const item of r.additions) {
    p.closed(item, ['role', 'pin'], 'BINDING_DELTA');
    if (seen.has(item.pin.path)) p.fail('BINDING_DELTA'); seen.add(item.pin.path);
    p.exact(item, downstream.get(item.pin.path), 'BINDING_DELTA');
  }
  const { v: v1, inventory: final } = p.vector(r.final.vectorPin, 'final', read, [receiptPin.path]);
  const runtimePaths = ['apps/apollo-v4/dist/runtime.cjs', 'apps/apollo-v4/dist/code.js', 'apps/apollo-v4/dist/ui.html',
    'apps/apollo-v4/scripts/static-producer-review-inputs.cjs', 'packages/generation-core/dist/index.cjs']
    .map(file => path.join(roots.generation, file)).concat(path.join(roots.workspace, 'services/apollo-proxy/src/generation-v4/static-review-service.js'));
  const runtimes = p.pins(r.final.runtimePins);
  if (runtimes.size !== runtimePaths.length || runtimePaths.some(file => !runtimes.has(file))) p.fail('BINDING_BUILD_COVERAGE');
  for (const pin of runtimes.values()) p.exact(final.get(pin.path), pin, 'BINDING_BUILD_COVERAGE');
  const change = p.transition({ v0: prepared.v, v1, c0ArchiveBytes: c0, c1Bytes: p.readPin(r.selection.configPin, read),
    configPath: prepared.q.configPin.path, producerRoot: roots.producer, manifestPin, reportPin,
    downstreamPins: Array.from(downstream.values(), item => item.pin) });
  p.exact(inspection.mismatches, [change.originalMismatch], 'BINDING_FRESHNESS');
  const forbidden = new Set([receiptPin.path, r.final.vectorPin.path]);
  for (const pin of final.values()) {
    if (forbidden.has(pin.path)) p.fail('BINDING_BACKREFERENCE');
    if (/\.(?:json|[cm]?js|ts|md|html|sh)$/.test(pin.path) && Buffer.from(read(pin.path)).includes(receiptPin.sha256)) p.fail('BINDING_BACKREFERENCE');
  }
  const watched = unique([...final.values(), receiptPin, r.final.vectorPin, prepared.q.vectorPin, options.baselineVectorPin,
    options.baselineManifestPin, options.baselineReportPin, manifestPin, reportPin]);
  const assertCurrent = () => { for (const pin of watched) p.readPin(pin, read); };
  assertCurrent();
  return { consumerBinding: 'structurally-verified', producerFreshness: inspection.producerFreshness,
    mismatches: inspection.mismatches, accepted: false, executionAllowed: false, generationPlanHash: null, assertCurrent };
}
module.exports = { output, closure, inspect, receipt };
