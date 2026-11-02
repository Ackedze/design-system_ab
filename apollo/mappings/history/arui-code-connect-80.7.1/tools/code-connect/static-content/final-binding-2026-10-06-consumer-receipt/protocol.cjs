'use strict';
// Structural hash/provenance checks only. No runtime, target, norm or release authority.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const SHA = /^[a-f0-9]{64}$/;
const REQUEST = 'apollo.static-final-binding-request.v1-draft';
const VECTOR = 'apollo.static-review-consumer-vector.v1-draft';
const RECEIPT = 'apollo.static-review-consumer-binding.v1-draft';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const digest = value => hash(JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v));
const fail = (code, detail = '') => { throw Object.assign(new Error(`${code}${detail ? ': ' + detail : ''}`), { code }); };
const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
function closed(v, keys, code) {
  if (!object(v) || Object.keys(v).length !== keys.length || !keys.every(k => Object.hasOwn(v, k))) fail(code);
}
function authority(v) {
  if (v.accepted !== false || v.executionAllowed !== false || v.generationPlanHash !== null) fail('BINDING_AUTHORITY');
}
function absolute(p) {
  if (typeof p !== 'string' || !path.isAbsolute(p) || path.normalize(p) !== p || p.includes('\\')) fail('BINDING_PATH');
  return p;
}
function relative(root, p) {
  const r = path.relative(root, absolute(p));
  if (!r || r.startsWith('..') || path.isAbsolute(r)) fail('BINDING_PATH', p);
  return r.split(path.sep).join('/');
}
function readPin(pin, read = fs.readFileSync) {
  closed(pin, ['path', 'sha256'], 'BINDING_PIN'); absolute(pin.path);
  if (!SHA.test(pin.sha256)) fail('BINDING_PIN');
  let bytes; try { bytes = Buffer.from(read(pin.path)); } catch { fail('BINDING_FILE_MISSING', pin.path); }
  if (hash(bytes) !== pin.sha256) fail('BINDING_PIN_STALE', pin.path);
  return bytes;
}
function jsonPin(pin, read) {
  try { return JSON.parse(readPin(pin, read)); } catch (e) { if (e.code) throw e; fail('BINDING_JSON', pin.path); }
}
function pins(rows) {
  if (!Array.isArray(rows) || !rows.length) fail('BINDING_INVENTORY');
  const result = new Map();
  for (const p of rows) {
    absolute(p.path); if (!SHA.test(p.sha256) || result.has(p.path)) fail('BINDING_INVENTORY', p.path);
    result.set(p.path, { path: p.path, sha256: p.sha256 });
  }
  return result;
}
function exact(a, b, code) { if (a === undefined || b === undefined || digest(a) !== digest(b)) fail(code); }
function config(bytes) {
  let c; try { c = JSON.parse(bytes); } catch { fail('BINDING_CONFIG'); }
  closed(c, ['schemaVersion', 'manifestPin', 'reportPin'], 'BINDING_CONFIG');
  if (c.schemaVersion !== 'apollo.v4-static-review-local-config.v1-draft') fail('BINDING_CONFIG');
  for (const p of [c.manifestPin, c.reportPin]) {
    closed(p, ['path', 'sha256'], 'BINDING_CONFIG');
    if (!SHA.test(p.sha256) || typeof p.path !== 'string' || path.isAbsolute(p.path) || p.path.includes('\\')
      || p.path.split('/').some(x => !x || x === '.' || x === '..')) fail('BINDING_CONFIG');
  }
  return c;
}
function vector(pin, stage, read, forbiddenPaths = []) {
  const v = jsonPin(pin, read);
  closed(v, ['schemaVersion', 'phase', 'files', 'buildInputs'], 'BINDING_VECTOR');
  if (v.schemaVersion !== VECTOR || v.phase !== stage) fail('BINDING_VECTOR');
  const inventory = pins(v.files);
  if (inventory.has(pin.path)) fail('BINDING_BACKREFERENCE', 'vector contains itself');
  for (const file of forbiddenPaths) if (inventory.has(file)) fail('BINDING_BACKREFERENCE', file);
  for (const p of inventory.values()) readPin(p, read);
  pins(v.buildInputs);
  return { v, inventory };
}
function buildCoverage(v, roots, inventory, read, q, baseline) {
  const b = jsonPin(q.buildManifestPin, read);
  exact(inventory.get(q.buildManifestPin.path), q.buildManifestPin, 'BINDING_BUILD_COVERAGE');
  if (b.documentType !== 'apollo-v4-local-build-inputs' || !Array.isArray(b.inputs) || !b.inputs.length
    || b.runtimeVersion !== q.versions.core || b.profileVersion !== q.versions.apolloV4) fail('BINDING_BUILD');
  exact(b.inputs.map(p => ({ path: path.join(roots.generation, p.path), sha256: p.sha256 })), v.buildInputs, 'BINDING_BUILD');
  for (const p of baseline.standardBuildInputs.inputs) if (!b.inputs.some(x => x.path === p.path)) fail('BINDING_BUILD_OMITTED', p.path);
  if (v.buildInputs.some(p => p.path === q.configPin.path)) fail('BINDING_BACKREFERENCE', 'config is a build input');
  const seen = new Set();
  for (const p of b.inputs) {
    closed(p, ['path', 'sha256'], 'BINDING_BUILD');
    if (typeof p.path !== 'string' || p.path.includes('\\') || p.path.split('/').some(x => !x || x === '.' || x === '..')
      || path.isAbsolute(p.path) || seen.has(p.path)) fail('BINDING_BUILD');
    seen.add(p.path);
    const q = { path: path.join(roots.generation, p.path), sha256: p.sha256 };
    readPin(q, read); exact(inventory.get(q.path), q, 'BINDING_BUILD_COVERAGE');
  }
  for (const p of ['apps/apollo-v4/dist/runtime.cjs', 'apps/apollo-v4/dist/code.js', 'apps/apollo-v4/dist/ui.html',
    'packages/generation-core/dist/index.cjs', 'apps/apollo-v4/scripts/static-producer-review-inputs.cjs']) {
    if (!inventory.has(path.join(roots.generation, p))) fail('BINDING_BUILD_COVERAGE', p);
  }
  return b;
}
function changes(baseline, current, approved, newFiles, immutablePaths) {
  if (!Array.isArray(approved) || !Array.isArray(newFiles)) fail('BINDING_DELTA');
  const allowed = new Map();
  for (const p of approved) {
    closed(p, ['path', 'beforeSha256', 'afterSha256'], 'BINDING_DELTA');
    if (!SHA.test(p.beforeSha256) || !SHA.test(p.afterSha256) || allowed.has(p.path)
      || immutablePaths.has(p.path) || baseline.get(p.path)?.sha256 !== p.beforeSha256) fail('BINDING_DELTA');
    allowed.set(p.path, p);
  }
  for (const [p, old] of baseline) {
    const now = current.get(p); if (!now) fail('BINDING_COVERAGE', p);
    if (now.sha256 !== old.sha256 && allowed.get(p)?.afterSha256 !== now.sha256) fail('BINDING_DELTA', p);
  }
  for (const [p, a] of allowed) if (current.get(p)?.sha256 !== a.afterSha256 || a.beforeSha256 === a.afterSha256) fail('BINDING_DELTA', p);
  const additions = new Map();
  for (const p of newFiles) {
    closed(p, ['path', 'sha256'], 'BINDING_DELTA'); absolute(p.path);
    if (!SHA.test(p.sha256) || baseline.has(p.path) || additions.has(p.path)) fail('BINDING_DELTA');
    additions.set(p.path, p);
  }
  for (const [p, now] of current) if (!baseline.has(p)) exact(additions.get(p), now, 'BINDING_UNDECLARED_ADDITION');
  for (const [p, now] of additions) exact(current.get(p), now, 'BINDING_UNDECLARED_ADDITION');
}
function graph(nodes) {
  const rank = { source: 0, 'config-pre': 0, 'config-archive': 0, 'vector-pre': 1, request: 2, producer: 3,
    output: 4, basis: 5, 'config-final': 6, 'vector-final': 7, receipt: 8, readback: 9, 'general-proof': 10 };
  if (!Array.isArray(nodes) || !nodes.length) fail('BINDING_GRAPH');
  const map = new Map();
  for (const n of nodes) {
    closed(n, ['id', 'kind', 'dependencies'], 'BINDING_GRAPH');
    if (typeof n.id !== 'string' || !n.id || map.has(n.id) || !Object.hasOwn(rank, n.kind)
      || !Array.isArray(n.dependencies) || new Set(n.dependencies).size !== n.dependencies.length) fail('BINDING_GRAPH');
    map.set(n.id, n);
  }
  for (const n of nodes) for (const id of n.dependencies) {
    const dep = map.get(id);
    if (!dep || rank[dep.kind] >= rank[n.kind]) fail('BINDING_BACKREFERENCE', `${n.id} -> ${id}`);
  }
  return true;
}
function prepare({ requestPin, baselineVectorPin, baselineManifestPin, baselineReportPin, roots,
  toolPins, immutablePins, read = fs.readFileSync }) {
  // Trust pins are caller inputs, never computed from the imported request itself.
  const q = jsonPin(requestPin, read);
  closed(q, ['schemaVersion', 'runId', 'accepted', 'executionAllowed', 'generationPlanHash', 'vectorPin',
    'c0ArchivePin', 'configPin', 'buildManifestPin', 'versions', 'approvedChanges', 'newFiles', 'cases'], 'BINDING_REQUEST');
  authority(q);
  if (q.schemaVersion !== REQUEST || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(q.runId)) fail('BINDING_REQUEST');
  const baseVector = jsonPin(baselineVectorPin, read), base = pins(baseVector.files);
  authority(baseVector);
  if (!Array.isArray(baseVector.standardBuildInputs?.inputs) || !baseVector.standardBuildInputs.inputs.length || !object(q.versions)) fail('BINDING_BASIS');
  const m = jsonPin(baselineManifestPin, read), b = jsonPin(baselineReportPin, read);
  authority(m); authority(b);
  const payload = Object.assign({}, m); delete payload.artifactDigest;
  if (m.schemaVersion !== 'apollo.code-connect.static-producer.v1-draft' || m.version !== 1 || m.status !== 'draft' || m.generationWireSupport !== 'not-supported'
    || m.targetSupport?.figma !== 'not-supported' || m.targetSupport?.frontend !== 'not-supported' || m.frozen.inputPackages.length !== 5 || m.artifactDigest !== digest(payload)
    || b.producerManifest.sha256 !== baselineManifestPin.sha256 || b.producerManifest.artifactDigest !== m.artifactDigest) fail('BINDING_BASIS');
  const { v, inventory } = vector(q.vectorPin, 'preselection', read);
  if (inventory.has(requestPin.path)) fail('BINDING_BACKREFERENCE', 'V0 contains downstream request');
  const protectedPins = pins(immutablePins);
  for (const p of protectedPins.values()) { readPin(p, read); exact(inventory.get(p.path), p, 'BINDING_IMMUTABLE'); }
  changes(base, inventory, q.approvedChanges, q.newFiles, new Set(protectedPins.keys()));
  const configPath = path.join(roots.workspace, 'services/apollo-proxy/src/generation-v4/static-review-config.json');
  if (q.configPin.path !== configPath || base.get(configPath)?.sha256 !== q.configPin.sha256) fail('BINDING_CONFIG');
  const c0 = readPin(q.configPin, read); config(c0);
  exact(inventory.get(configPath), q.configPin, 'BINDING_COVERAGE');
  if (q.c0ArchivePin.path === configPath) fail('BINDING_CONFIG_ARCHIVE');
  if (!c0.equals(readPin(q.c0ArchivePin, read))) fail('BINDING_CONFIG_ARCHIVE');
  exact(inventory.get(q.c0ArchivePin.path), q.c0ArchivePin, 'BINDING_COVERAGE');
  const allToolPins = pins(toolPins);
  for (const p of allToolPins.values()) { readPin(p, read); exact(inventory.get(p.path), p, 'BINDING_TOOL_COVERAGE'); }
  for (const p of m.apiEvidenceFiles) {
    const a = { path: path.join(roots.producer, p.path), sha256: p.sha256 };
    readPin(a, read); exact(inventory.get(a.path), a, 'BINDING_SOURCE_COVERAGE');
  }
  for (const p of [m.frozen.registry, m.frozen.lock]) {
    const a = { path: path.join(roots.producer, p.path), sha256: p.sha256 };
    readPin(a, read); exact(inventory.get(a.path), a, 'BINDING_SOURCE_COVERAGE');
  }
  for (const p of m.frozen.inputPackages) for (const [field, sha] of [['archivePath', 'archiveSha256'], ['manualPath', 'mainManualSha256']]) {
    const a = { path: path.join(roots.workspace, p[field]), sha256: p[sha] };
    readPin(a, read); exact(inventory.get(a.path), a, 'BINDING_SOURCE_COVERAGE');
  }
  const build = buildCoverage(v, roots, inventory, read, q, baseVector);
  for (const pin of inventory.values()) {
    if (/\.(?:json|[cm]?js|ts|md|html|sh)$/.test(pin.path) && Buffer.from(read(pin.path)).includes(q.vectorPin.sha256))
      fail('BINDING_BACKREFERENCE', 'V0 hash appears in pre-existing source');
  }
  if (!Array.isArray(q.cases) || q.cases.length !== 3) fail('BINDING_CASES');
  exact(q.cases.map(c => c.id), ['supported', 'unsupported-view', 'unsupported-priority'], 'BINDING_CASES');
  for (const c of q.cases) { closed(c, ['id', 'spec'], 'BINDING_CASES'); if (!object(c.spec)) fail('BINDING_CASES'); }
  const watched = [...inventory.values(), requestPin, q.vectorPin, q.c0ArchivePin, baselineVectorPin, baselineManifestPin, baselineReportPin];
  return { q, v, inventory, build, baselineManifest: m, watched,
    assertCurrent() { for (const p of watched) readPin(p, read); } };
}
function transition({ v0, v1, c0ArchiveBytes, c1Bytes, configPath, producerRoot, manifestPin, reportPin, downstreamPins }) {
  for (const [v, phase] of [[v0, 'preselection'], [v1, 'final']]) {
    closed(v, ['schemaVersion', 'phase', 'files', 'buildInputs'], 'BINDING_VECTOR');
    if (v.phase !== phase || v.schemaVersion !== VECTOR) fail('BINDING_VECTOR');
  }
  const pre = pins(v0.files), final = pins(v1.files);
  const c0Pin = pre.get(configPath), c1Pin = final.get(configPath);
  const c0 = config(c0ArchiveBytes), c1 = config(c1Bytes);
  if (!c0Pin || !c1Pin || hash(c0ArchiveBytes) !== c0Pin.sha256 || hash(c1Bytes) !== c1Pin.sha256) fail('BINDING_CONFIG_ARCHIVE');
  exact(c1.manifestPin, { path: relative(producerRoot, manifestPin.path), sha256: manifestPin.sha256 }, 'BINDING_SELECTOR');
  exact(c1.reportPin, { path: relative(producerRoot, reportPin.path), sha256: reportPin.sha256 }, 'BINDING_SELECTOR');
  if (digest(c0) === digest(c1)) fail('BINDING_SELECTOR');
  // Only the four selector string values may change; raw formatting is preserved.
  let expected = c0ArchiveBytes.toString('utf8');
  for (const key of ['manifestPin', 'reportPin']) for (const field of ['path', 'sha256']) {
    const before = JSON.stringify(c0[key][field]), after = JSON.stringify(c1[key][field]);
    if (before !== after) {
      if (expected.split(before).length !== 2) fail('BINDING_CONFIG_DELTA');
      expected = expected.replace(before, after);
    }
  }
  if (expected !== c1Bytes.toString('utf8')) fail('BINDING_CONFIG_DELTA');
  exact(v0.buildInputs, v1.buildInputs, 'BINDING_BUILD');
  changes(pre, final, [{ path: configPath, beforeSha256: c0Pin.sha256, afterSha256: c1Pin.sha256 }], downstreamPins, new Set());
  return { producerFreshness: 'stale', originalMismatch: { path: configPath,
    expectedSha256: c0Pin.sha256, actualSha256: c1Pin.sha256 }, structuralTransition: 'verified', accepted: false, executionAllowed: false, generationPlanHash: null };
}
module.exports = { REQUEST, VECTOR, RECEIPT, hash, digest, fail, closed, authority, absolute, relative,
  readPin, jsonPin, pins, exact, config, vector, buildCoverage, changes, graph, prepare, transition };
