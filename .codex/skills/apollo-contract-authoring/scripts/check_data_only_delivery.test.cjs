'use strict';

// Synthetic data only. Both consumers are read from explicit, unchanged checkouts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const apolloRoot = process.env.APOLLO_ROOT;
const proxyRoot = process.env.APOLLO_PROXY_ROOT;
assert(apolloRoot && proxyRoot, 'Set APOLLO_ROOT and APOLLO_PROXY_ROOT to the accepted current checkouts');
const { ENGINE_VERSION, validatePackageDirectory } = require(path.join(proxyRoot, 'src/knowledge-package'));
const { manifestChecksum, walkFiles } = require(path.join(proxyRoot, 'scripts/build-knowledge-package'));
const { loadPredicateRelease } = require(path.join(proxyRoot, 'src/predicate-engine/release-loader'));
const { compilePredicateReleaseRules } = require(path.join(proxyRoot, 'src/predicate-engine/release-service'));
const host = 'a'.repeat(40), member = 'b'.repeat(40);
const baseUrl = 'https://eval.invalid/JSONS/';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const runtime = (async () => {
  const req = createRequire(path.join(apolloRoot, 'package.json'));
  const modules = { prep: 'data-preparation.ts', registry: 'rules/runtimeContractRegistry.ts', engine: 'rules/compositionContractEngine.ts' };
  const pins = new Map();
  const built = await req('esbuild').build({
    absWorkingDir: apolloRoot, tsconfigRaw: { compilerOptions: {} }, bundle: true, write: false,
    platform: 'node', format: 'cjs', logLevel: 'silent',
    stdin: { contents: 'module.exports={' + Object.entries(modules).map(([key, file]) =>
      key + ':require(' + JSON.stringify(path.join(apolloRoot, 'src/v3-audit', file)) + ')').join(',') + '}', resolveDir: apolloRoot },
    plugins: [{ name: 'pin-consumer-inputs', setup(build) {
      build.onLoad({ filter: /\.(?:[cm]?js|ts|json)$/ }, args => {
        const bytes = fs.readFileSync(args.path);
        assert(!args.path.includes('/component-contract-core/'), 'Retired contract core must not enter this V3 eval');
        pins.set(args.path, sha(bytes));
        return { contents: bytes.toString('utf8'), loader: args.path.endsWith('.ts') ? 'ts' : args.path.endsWith('.json') ? 'json' : 'js' };
      });
    } }],
  });
  const result = { exports: {} };
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(req, result, result.exports);
  return Object.assign(result.exports, { assertCurrent() {
    for (const [file, hash] of pins) assert.equal(sha(fs.readFileSync(file)), hash, 'Consumer input changed: ' + file);
  } });
})();

function put(root, relative, value) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

async function fixture(t, poisoned = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-data-only-eval-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const ds = path.join(root, 'data/design-system_ab');
  const entry = { componentKey: 'fixture.owner', packageName: 'PeerOwner', packagePath: 'fixture/Owner',
    figmaKeys: [host, member], coverage: 'required',
    artifacts: { generatedContract: 'api.json', rules: 'rules.json', composition: 'composition-contract.json' } };
  const index = { schemaVersion: 2, documentType: 'component-contract-index', baseUrl, coverage: { defaultPolicy: 'required' }, packages: [entry],
    components: { [host]: entry.componentKey, [member]: entry.componentKey } };
  put(ds, 'JSONS/apollo/indexes/componentContractIndex.json', index);
  put(ds, 'JSONS/apollo/designPatternRules.json', { rules: [] });
  put(ds, 'redpolrules/dictionary.json', { rules: [] });
  put(root, 'data/ds-ai-hub/products/ab/components/fixture/meta.json', { name: 'PeerOwner' });
  put(root, 'data/ds-ai-hub/core/web/components/fixture/meta.json', { name: 'PeerStatus' });
  put(ds, 'JSONS/fixture/Owner/rules.json', { rules: [] });
  put(ds, 'JSONS/fixture/Owner/api.json', { schemaVersion: 'apollo.ds-contracts.v1',
    contracts: [[host, 'PeerOwner'], [member, 'PeerStatus']].map(([key, name]) => ({
      id: name, name, normalizedName: name.toLowerCase(), componentKey: key,
      status: 'current', role: 'Main', platform: 'Desktop',
      figma: { variants: { properties: {}, allowedCombinations: [], variantKeys: [] } },
    })) });
  const authority = { status: 'active', provenance: 'synthetic-eval', revision: 1 };
  const legacy = { id: 'fixture.existing', schemaVersion: 'apollo.composition-predicate-contract.v1',
    ruleKind: 'design-rule', authority,
    match: { hostComponentKeys: [host], hostComponentIdentities: ['fixture.owner'] },
    select: { nestedComponentKeys: [member], nestedComponentIdentities: ['fixture.member'], visibility: 'visible', order: 'document' },
    facts: { visibleMemberNodeIds: 'fixture.members', siblingPropertyValuesPrefix: 'fixture.memberProperties' },
    constraints: [{ id: 'count', ruleId: 'fixture.existing.count', op: 'countBetween', min: 2, max: 2,
      message: 'Keep two members', presentation: { expectation: 'Two members', action: 'Restore members' } }] };
  const binding = { id: 'fixture.peer-types', ruleKind: 'design-rule', authority,
    match: { hostComponentKeys: [host], hostComponentIdentities: ['fixture.owner'] },
    select: { nestedComponentKeys: [member], visibility: 'visible', order: 'document' },
    constraints: [{ id: 'equal', ruleId: 'fixture.peer-types.equal', op: 'propertyEqualsFirst', property: 'Type',
      message: 'Peer types must agree', presentation: { expectation: 'Same Type', action: 'Match Type' } }] };
  if (poisoned) binding.schemaVersion = legacy.schemaVersion;
  const compositionPath = 'JSONS/fixture/Owner/composition-contract.json';
  put(ds, compositionPath, { schemaVersion: 2, documentType: 'composition-contract',
    metadata: { componentKey: entry.componentKey, ownershipSchema: 'apollo.artifact-ownership.v2' },
    generated: { component: { name: 'PeerOwner' } }, manual: { contracts: [legacy, binding] } });
  const artifacts = [];
  for (const relative of await walkFiles(path.join(root, 'data'))) {
    const name = 'data/' + relative.split(path.sep).join('/');
    const bytes = fs.readFileSync(path.join(root, name));
    artifacts.push({ path: name, size: bytes.length, sha256: sha(bytes) });
  }
  const manifest = { schemaVersion: 'apollo.knowledge-package.v1', contentVersion: 'synthetic-rule-edit',
    channel: 'stable', generatedAt: '2026-11-06T00:00:00Z',
    sourceCommits: { 'design-system_ab': '1'.repeat(40), 'ds-ai-hub': '2'.repeat(40) },
    engineCompatibility: { min: ENGINE_VERSION, max: ENGINE_VERSION }, artifacts,
    artifactCount: artifacts.length, totalBytes: artifacts.reduce((sum, row) => sum + row.size, 0),
    checksum: manifestChecksum(artifacts) };
  put(root, 'manifest.json', manifest);
  put(root, 'package.json', { name: '@apollo/knowledge', version: '0.0.0' });
  return { root, ds, index, manifest, legacy, compositionPath };
}

async function checkV3(f) {
  const current = await runtime;
  const policies = await current.prep.preparePolicies(f.index, async url => {
    assert(url.startsWith(baseUrl), 'Unexpected external data request');
    return read(path.join(f.ds, 'JSONS', url.slice(baseUrl.length)));
  }, baseUrl);
  current.registry.setNormalizedAuditPolicies(policies);
  function check(secondType) {
    const nodes = [
      { id: 1, parentId: null, nodeId: 'owner', name: 'PeerOwner', path: 'PeerOwner', type: 'INSTANCE', visible: true,
        componentInstance: { componentKey: host, variantProperties: {} } },
      ...['Good', secondType].map((Type, i) => ({ id: i + 2, parentId: 1, nodeId: 'member-' + i,
        name: 'PeerStatus', path: 'PeerOwner/PeerStatus' + i, type: 'INSTANCE', visible: true,
        componentInstance: { componentKey: member, variantProperties: { Type } } })),
    ];
    const result = current.engine.applyCompositionContracts([], {
      actualStructure: nodes, hostReference: nodes, hostComponentKey: host, hostComponentName: 'PeerOwner',
      resolveComponent: key => ({ key, name: key === host ? 'PeerOwner' : 'PeerStatus' }),
    });
    return result.diffs.filter(d => d.assessment?.ruleId === 'fixture.peer-types.equal');
  }
  assert.equal(check('Good').length, 0);
  assert.equal(check('Other').length, 1);
  current.assertCurrent();
}

test('isolated V3 0/1 does not hide an incompatible legacy format marker in the full package', async t => {
  const f = await fixture(t, true);
  await checkV3(f);
  await assert.rejects(validatePackageDirectory(f.root), error => {
    assert.equal(error.code, 'KNOWLEDGE_SMOKE_TEST_FAILED');
    assert.match(error.message, /select\.nestedComponentIdentities must be a non-empty string array/);
    return true;
  });
});

test('V3-only binding passes the full current package without duplicating existing legacy IR', async t => {
  const f = await fixture(t);
  const before = f.manifest.artifacts.map(row => [row.path, sha(fs.readFileSync(path.join(f.root, row.path)))]);
  const accepted = await validatePackageDirectory(f.root, ENGINE_VERSION);
  assert.deepEqual(accepted.engineCompatibility, { min: ENGINE_VERSION, max: ENGINE_VERSION });
  const loaded = loadPredicateRelease(f.ds, [host, member]);
  assert.equal(loaded.compositionDefinitions.length, 1);
  assert.deepEqual(compilePredicateReleaseRules(loaded).map(rule => rule.ruleId), ['fixture.existing.count']);
  assert.deepEqual(read(path.join(f.ds, f.compositionPath)).manual.contracts[0], f.legacy);
  await checkV3(f);
  for (const [file, hash] of before) assert.equal(sha(fs.readFileSync(path.join(f.root, file))), hash);
});

test('data-only delivery retains the current engine compatibility guard', async t => {
  const f = await fixture(t);
  await assert.rejects(validatePackageDirectory(f.root, '999.0.0'), { code: 'KNOWLEDGE_ENGINE_INCOMPATIBLE' });
  await validatePackageDirectory(f.root, ENGINE_VERSION);
});
