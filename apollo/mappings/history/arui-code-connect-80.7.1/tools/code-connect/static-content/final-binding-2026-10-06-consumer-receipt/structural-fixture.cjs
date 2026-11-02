'use strict';
// Artificial bytes in memory only. These are not valid runtime contract packages
// or Generation DTO fixtures and never establish a source/API acceptance result.
const path = require('node:path');
const p = require('./protocol.cjs');
const b = require('./builder.cjs');
const roots = { producer: path.resolve(__dirname, '../../../..') };
roots.workspace = path.dirname(roots.producer); roots.generation = path.join(roots.workspace, 'projects/Apollo-v3');
const flags = { accepted: false, executionAllowed: false, generationPlanHash: null };
const copy = value => JSON.parse(JSON.stringify(value));
function fixture() {
  const files = new Map();
  const put = (file, value) => {
    const bytes = Buffer.from(typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
    files.set(file, bytes); return { path: file, sha256: p.hash(bytes) };
  };
  const read = file => { if (!files.has(file)) throw Error('synthetic missing'); return Buffer.from(files.get(file)); };
  const file = (root, name) => path.join(root, name);
  const historical = put(file(roots.producer, 'synthetic-history/producer.cjs'), 'synthetic-v1-helper');
  const api = put(file(roots.producer, 'synthetic-api/index.d.ts'), 'synthetic-api-declaration');
  const registry = put(file(roots.producer, 'synthetic-registry.json'), { synthetic: 'registry' });
  const lock = put(file(roots.producer, 'synthetic-lock.json'), { synthetic: 'lock' });
  const frozen = { registry: { path: p.relative(roots.producer, registry.path), sha256: registry.sha256 },
    lock: { path: p.relative(roots.producer, lock.path), sha256: lock.sha256 }, registryDigest: p.hash('registry'),
    currentInputsDigest: p.hash('inputs'), lockDigest: p.hash('lock'), basisRegistryDigest: p.hash('basis'), inputPackages: [] };
  const packagePins = [];
  for (const id of ['button', 'spinner', 'mobile-content', 'button-group', 'desktop-content']) {
    const archive = put(file(roots.workspace, `synthetic-packages/${id}.zip`), `synthetic archive ${id}`);
    const manual = put(file(roots.workspace, `synthetic-packages/${id}.manual.json`), { synthetic: id });
    packagePins.push(archive, manual);
    frozen.inputPackages.push({ componentId: id, revision: 1, archivePath: p.relative(roots.workspace, archive.path), archiveSha256: archive.sha256,
      manualPath: p.relative(roots.workspace, manual.path), mainManualSha256: manual.sha256 });
  }
  const buildNames = ['apps/apollo-v4/dist/runtime.cjs', 'apps/apollo-v4/dist/code.js', 'apps/apollo-v4/dist/ui.html',
    'packages/generation-core/dist/index.cjs', 'apps/apollo-v4/scripts/static-producer-review-inputs.cjs',
    'apps/apollo-v4/src/synthetic-original.ts', 'apps/apollo-v4/src/synthetic-new.ts'];
  const buildFiles = buildNames.map(name => put(file(roots.generation, name), `synthetic build ${name}`));
  const buildInputs = buildFiles.map(pin => ({ path: p.relative(roots.generation, pin.path), sha256: pin.sha256 }));
  const buildManifestPin = put(file(roots.generation, 'apps/apollo-v4/dist/build-inputs.json'), {
    documentType: 'apollo-v4-local-build-inputs', runtimeVersion: 'synthetic-core', profileVersion: 'synthetic-profile', inputs: buildInputs });
  const proxy = ['src/generation-v4/static-review-service.js', 'src/knowledge-root.js', 'src/predicate-engine/migration-wave-audit.js', 'README.md']
    .map(name => put(file(roots.workspace, `services/apollo-proxy/${name}`), `synthetic proxy ${name}`));
  const configPin = put(file(roots.workspace, 'services/apollo-proxy/src/generation-v4/static-review-config.json'), {
    schemaVersion: 'apollo.v4-static-review-local-config.v1-draft',
    manifestPin: { path: 'synthetic-history/producer.v1-draft.json', sha256: p.hash('old-manifest') },
    reportPin: { path: 'synthetic-history/review-report.v1-draft.json', sha256: p.hash('old-report') } });
  const m = { schemaVersion: 'apollo.code-connect.static-producer.v1-draft', version: 1, status: 'draft', ...flags,
    generationWireSupport: 'not-supported', targetSupport: { figma: 'not-supported', frontend: 'not-supported' }, frozen,
    producerFiles: [{ path: p.relative(roots.producer, historical.path), sha256: historical.sha256 }],
    apiEvidenceFiles: [{ path: p.relative(roots.producer, api.path), sha256: api.sha256 }],
    consumerFiles: buildInputs, workspaceConsumerFiles: proxy.map(pin => ({ path: p.relative(roots.workspace, pin.path), sha256: pin.sha256 })),
    buildInputs, requestPins: [], acceptance: { profile: 'not-accepted', parity: 'not-confirmed', native: 'not-accepted', scoped: 'not-accepted', live: 'not-run' } };
  m.artifactDigest = p.digest(m);
  const baselineManifestPin = put(file(roots.producer, 'synthetic-history/producer.v1-draft.json'), m);
  const baselineReportPin = put(file(roots.producer, 'synthetic-history/review-report.v1-draft.json'), { ...flags,
    producerManifest: { ...baselineManifestPin, artifactDigest: m.artifactDigest } });
  const baselineFiles = [historical, api, registry, lock, ...packagePins, ...buildFiles, buildManifestPin, ...proxy, configPin, baselineManifestPin, baselineReportPin];
  const baseline = { ...flags, files: baselineFiles, standardBuildInputs: { inputs: buildInputs.slice(0, -1) } };
  const baselineVectorPin = put('/synthetic-private/baseline.json', baseline);
  const toolPin = put(file(__dirname, 'producer.cjs'), 'synthetic-v1-helper');
  const c0ArchivePin = put(file(__dirname, 'preselection-config.json'), read(configPin.path).toString());
  const additions = [toolPin, c0ArchivePin];
  const v0 = { schemaVersion: p.VECTOR, phase: 'preselection', files: [...baselineFiles, ...additions], buildInputs: buildFiles };
  const vectorPin = put('/synthetic-private/v0.json', v0);
  const cases = ['supported', 'unsupported-view', 'unsupported-priority'].map(id => ({ id, spec: { syntheticStructuralCase: id,
    actions: [{ id: 'action-a', label: 'Synthetic A', view: 'primary', disabled: false, loading: false },
      { id: 'action-b', label: 'Synthetic B', view: id === 'unsupported-view' ? 'primary' : 'secondary', disabled: true, loading: false }],
    displayOrder: ['action-a', 'action-b'], priorityOrder: id === 'unsupported-priority' ? ['action-b', 'action-a'] : ['action-a', 'action-b'] } }));
  const q = { schemaVersion: p.REQUEST, runId: 'synthetic-memory', ...flags, vectorPin, c0ArchivePin, configPin, buildManifestPin,
    versions: { core: 'synthetic-core', apolloV4: 'synthetic-profile' }, approvedChanges: [], newFiles: additions, cases };
  const requestPin = put('/synthetic-private/request.json', q);
  const options = { roots, requestPin, baselineVectorPin, baselineManifestPin, baselineReportPin,
    toolPins: [toolPin], immutablePins: [historical, api, registry, lock, ...packagePins, baselineManifestPin, baselineReportPin], read };
  function repinV0() { q.vectorPin = put(vectorPin.path, v0); options.requestPin = put(requestPin.path, q); }
  function repinRequest() { options.requestPin = put(requestPin.path, q); }
  function seal() {
    const { ctx, manifest } = b.preflight(options);
    const manifestPin = put(file(__dirname, 'producer.v1-draft.json'), manifest);
    const outputs = q.cases.map(c => {
      const document = syntheticOutput(manifest, c.spec);
      return { ...put(file(__dirname, `synthetic.${c.id}.review.json`), document), inputHash: document.inputHash, planHash: document.planHash,
        contentHash: document.contentHash, observationHash: document.observation.observationHash, ...flags, generationSourceRead: document.generationSourceRead };
    });
    const basis = { ...flags, producerManifest: { ...manifestPin, artifactDigest: manifest.artifactDigest }, consumerVector: q.vectorPin,
      outputs, sourcePackages: manifest.frozen.inputPackages };
    const reportPin = put(file(__dirname, 'review-report.v1-draft.json'), basis);
    const before = p.config(read(configPin.path));
    const after = copy(before); after.manifestPin = { path: p.relative(roots.producer, manifestPin.path), sha256: manifestPin.sha256 };
    after.reportPin = { path: p.relative(roots.producer, reportPin.path), sha256: reportPin.sha256 };
    let c1 = read(configPin.path).toString();
    for (const key of ['manifestPin', 'reportPin']) for (const field of ['path', 'sha256']) c1 = c1.replace(JSON.stringify(before[key][field]), JSON.stringify(after[key][field]));
    const finalConfigPin = put(configPin.path, c1);
    const additions = [{ role: 'producer', pin: manifestPin }, { role: 'basis', pin: reportPin }, ...outputs.map(o => ({ role: 'output', pin: { path: o.path, sha256: o.sha256 } })),
      ...manifest.requestPins.filter(pin => !ctx.inventory.has(pin.path)).map(pin => ({ role: pin.path === q.vectorPin.path ? 'preselection-vector' : 'request', pin }))];
    const v1 = { schemaVersion: p.VECTOR, phase: 'final', buildInputs: v0.buildInputs,
      files: v0.files.map(pin => pin.path === configPin.path ? finalConfigPin : pin).concat(additions.map(item => item.pin)) };
    const finalVectorPin = put('/synthetic-private/v1.json', v1);
    const closurePins = require('./verifier.cjs').closure(manifest, roots);
    const runtimePins = [...buildFiles.slice(0, 5), proxy[0]];
    const r = { schemaVersion: p.RECEIPT, status: 'draft', ...flags, baselineVectorPin,
      producer: { manifestPin, basisPin: reportPin, artifactDigest: manifest.artifactDigest, outputs: outputs.map(o => ({ path: o.path, sha256: o.sha256,
        inputHash: o.inputHash, planHash: o.planHash, contentHash: o.contentHash, observationHash: o.observationHash })) },
      preselection: { vectorPin: q.vectorPin, configArchivePin: c0ArchivePin, configPath: configPin.path, configSha256: configPin.sha256 },
      selection: { configPin: finalConfigPin, manifestPin, reportPin }, final: { vectorPin: finalVectorPin, buildManifestPin, runtimePins }, closurePins, additions };
    const receiptPin = put('/synthetic-private/receipt.json', r);
    Object.assign(options, { manifestPin, reportPin, receiptPin });
    return { manifest, manifestPin, outputs, basis, reportPin, v1, r, finalConfigPin, finalVectorPin, receiptPin,
      repinReceipt() { options.receiptPin = put(receiptPin.path, r); }, repinV1() { r.final.vectorPin = put(finalVectorPin.path, v1); options.receiptPin = put(receiptPin.path, r); } };
  }
  return { files, put, read, q, v0, baseline, options, repinV0, repinRequest, seal, buildFiles, packagePins, proxy, configPin, c0ArchivePin, copy };
}
function syntheticOutput(m, spec) {
  const content = { ownerNodeId: 'owner', groupNodeId: 'group', size: '56', overflow: false, actions: copy(spec.actions),
    displayOrder: spec.displayOrder, priorityOrder: spec.priorityOrder,
    provenance: spec.actions.map(a => ({ actionId: a.id, ownerNodeId: 'group', port: 'button-label', canonicalOccurrenceId: null, symbolId: null })) };
  const planPins = { specHash: p.digest(spec), artifactDigest: m.artifactDigest, registryDigest: m.frozen.registryDigest,
    currentInputsDigest: m.frozen.currentInputsDigest, lockDigest: m.frozen.lockDigest, consumerFilesDigest: p.digest(m.consumerFiles),
    workspaceConsumerFilesDigest: p.digest(m.workspaceConsumerFiles), buildInputsDigest: p.digest(m.buildInputs) };
  const plan = { spec, content, pins: planPins, executionAllowed: false, generationPlanHash: null };
  const source = { status: 'synthetic-not-run', accepted: false, executionAllowed: false };
  const observation = { ...flags, artifactDigest: m.artifactDigest, inputHash: p.digest(spec), planHash: p.digest(plan), contentHash: p.digest(content),
    planPins, consumerVector: m.consumerVector, generationSourceReadHash: p.digest(source), generationWireSupport: 'not-supported',
    inputPackages: m.frozen.inputPackages, registryDigest: m.frozen.registryDigest, currentInputsDigest: m.frozen.currentInputsDigest,
    lockDigest: m.frozen.lockDigest, basisRegistryDigest: m.frozen.basisRegistryDigest,
    consumerFilesDigest: p.digest(m.consumerFiles), workspaceConsumerFilesDigest: p.digest(m.workspaceConsumerFiles),
    buildInputsDigest: p.digest(m.buildInputs), apiEvidenceDigest: p.digest(m.apiEvidenceFiles) };
  observation.observationHash = p.digest(observation);
  const unsupported = spec.syntheticStructuralCase !== 'supported';
  return { schemaVersion: 'apollo.code-connect.static-content.v1-draft', status: 'draft', accepted: false, executionAllowed: false,
    apiExpressibility: unsupported ? 'not-supported' : 'bounded-content-expressible', targetSupport: { figma: 'not-supported', frontend: 'not-supported' },
    inputHash: p.digest(spec), planHash: p.digest(plan), plan, contentHash: p.digest(content), content,
    apiIntent: unsupported ? null : { kind: 'non-executable-public-api-intent' }, diagnostics: [], observation,
    generationSourceRead: source, generationPreflight: { executionAllowed: false }, gaps: [] };
}
module.exports = { fixture, syntheticOutput };
