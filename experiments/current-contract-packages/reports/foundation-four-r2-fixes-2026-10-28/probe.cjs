const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), assert = require('node:assert/strict');
const R = __dirname, A = path.resolve(R, '../../../..'), W = path.resolve(A, '../..'), B = W + '/.local/apollo-main';
const esbuild = require(B + '/node_modules/esbuild');
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const overrides = ['src/runtime.js', 'packages/component-contract-core/src/member-collections.ts'];
const plugin = {name: 'private-source-candidates', setup(build) {
  build.onLoad({filter: /\.(?:js|ts)$/}, args => {
    const relative = path.relative(B, args.path);
    if (process.env.PRIVATE_SOURCE_OVERLAY === '1' && overrides.includes(relative)) return {contents: fs.readFileSync(R + '/source-candidate/' + relative, 'utf8'),
      loader: relative.endsWith('.ts') ? 'ts' : 'js', resolveDir: path.dirname(args.path)};
  });
}};
const count = evaluations => evaluations.reduce((o, e) => (o[e.classification] = (o[e.classification] || 0) + 1, o), {});
(async () => {
  const out = R + '/private-runtime'; fs.mkdirSync(out, {recursive: true});
  const options = require(B + '/build.js').runtimeBuildOptions();
  await esbuild.build(Object.assign({}, options, {outfile: out + '/runtime.cjs', plugins: [plugin]}));
  await esbuild.build({absWorkingDir: B, entryPoints: ['packages/component-contract-core/src/index.ts'],
    outfile: out + '/core.cjs', platform: 'node', format: 'cjs', bundle: true, plugins: [plugin]});
  const runtime = require(out + '/runtime.cjs'), core = require(out + '/core.cjs');
  const raw = zlib.gunzipSync(fs.readFileSync(R + '/../foundation-four-live-2026-10-28/report.json.gz'));
  const report = JSON.parse(raw), contracts = {}, rows = [];
  for (const name of ['Text', 'List', 'SegmentedControl', 'Slider']) {
    const dir = name === 'List' ? R + '/../foundation-four-drafts-2026-10-27/List' : R + '/candidate/' + name;
    const manual = read(dir + '/contract.manual.json'), facts = read(dir + '/variant-evidence.json');
    const bundle = core.buildExportBundle(manual, facts, []);
    if (!bundle.validation.valid) { write(R + '/compile-failure.json', {name, diagnostics: bundle.validation}); throw Error('Compile failed ' + name); }
    contracts[name] = JSON.parse(JSON.stringify(bundle.compiled));
    if (name !== 'List') {
      write(dir + '/compiled.json', bundle.compiled);
      write(dir + '/validation.json', bundle.validation);
      const source = {schemaVersion: 'apollo.component-contract-source.v1-experimental', documentType: 'component-contract-source',
        manual, variantEvidence: facts, dependencies: [], projectionStamp: {sourceExportVersion: contracts[name].package.sourceExportVersion,
          compiledHash: runtime.contractHash(contracts[name])}};
      const loaded = runtime.loadAuthoringSource(source, {evaluationMode: 'authoring-preview'});
      assert.equal(runtime.contractHash(loaded.contract), runtime.contractHash(contracts[name]));
      write(dir + '/source.json', source);
    }
    const cases = read(R + '/../foundation-four-drafts-2026-10-27/' + name + '/test-cases.json').cases;
    for (const c of cases) {
      const actual = report.components.find(item => item.scopeId === c.nodeId);
      const result = runtime.auditContractSnapshot(structuredClone(actual.snapshot), contracts[name], {evaluationMode: 'authoring-preview'});
      const violations = result.engine.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort();
      const row = {caseId: c.caseId, component: name, expected: c.expectedRuleIds, actual: violations,
        exactExpectedViolationIds: c.caseId === 'SG-09' ? null : JSON.stringify(violations) === JSON.stringify(c.expectedRuleIds.slice().sort()),
        classifications: count(result.engine.evaluations), coverage: result.coverage,
        uncertain: result.engine.evaluations.filter(e => e.classification === 'human-review' || e.collection?.missing?.length)
          .map(e => ({ruleId: e.ruleId, classification: e.classification, reason: e.trace.reason, collection: e.collection}))};
      rows.push(row);
    }
  }
  write(R + '/private-replay.json', {evidenceKind: 'replay-user-native-snapshots-private-candidate-runtime', freshApolloRun: false, rows});
  console.log(JSON.stringify(rows.map(r => ({id: r.caseId, match: r.exactExpectedViolationIds, complete: r.coverage.executionComplete,
    uncertain: r.coverage.uncertain, classes: r.classifications}))));
})().catch(e => { if (!fs.existsSync(R + '/first-failure.json')) write(R + '/first-failure.json', {message: e.message, stack: e.stack}); console.error(e); process.exitCode = 1; });
