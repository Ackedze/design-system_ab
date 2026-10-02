// Review an Editor-owned source ZIP through the shared compiler; no manual edits.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const repo = path.resolve(__dirname, '..');
const root = path.join(repo, 'experiments/web-corp/CorporateContent/authoring');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const dates = ['14-58-27-046', '14-59-54-745', '16-23-15-112', '17-22-48-414', '17-23-35-614'];
const reportName = time => `corporate-content.validation-report.2026-09-30T${time}Z.json`;
const authoredPrefix = 'component:corporate-content.desktop.';
const legacyPrefix = 'component:web-corp.corporate-content.';
const hubPath = 'products/ab/components/corporate-content/instructions.md';
const suffixes = {
  'body.composition-content': ['body-allows-arbitrary-composition', 'body-layout-delegated'],
  'corporate-content.auto-layout-1': ['root-layout-protected', 'spacing-uses-grid-cols-mode', 'root-fill-hug-sizing'],
  'corporate-content.layout-clips-content': ['clips-content-disabled', 'root-visual-overrides-prohibited'],
  'corporate-content.layout-grid-style-id': ['grid-style-protected'],
  'corporate-content.variable-modes-22d83aeb0d0d643a5359f63464a2ab81838fbe9f': ['page-background-modes-only', 'background-mode-only'],
  'corporate-content.visual-style-1': ['root-visual-overrides-prohibited', 'background-mode-only'],
};
function reportBytes(time) {
  const raw = path.join(root, reportName(time));
  return fs.existsSync(raw) ? fs.readFileSync(raw) : zlib.gunzipSync(fs.readFileSync(path.join(root, 'reports/fixtures/r10-r11', reportName(time) + '.gz')));
}
async function review() {
  const archive = fs.readFileSync(path.join(root, 'corporate-content.component-contract.zip'));
  const entries = await core.readZip(archive);
  const files = entries.map(e => ({name: e.name, text: core.zipEntryText(e)}));
  const workspace = core.importWorkspace(files);
  const {manual, variantEvidence} = workspace;
  assert.equal(manual.metadata.revision, 11);
  assert.equal(manual.component.componentId, 'web-corp.corporate-content');
  assert.equal(manual.rules.length, 6);
  assert.ok(manual.rules.every(r => r.status === 'reviewed' && r.ownership.ownerId === manual.component.componentId));
  assert.deepEqual(manual.representations.map(r => r.platform), ['desktop']);
  const bundle = JSON.parse(JSON.stringify(core.buildExportBundle(manual, variantEvidence, workspace.dependencyContracts)));
  assert.equal(bundle.validation.valid, true);
  assert.equal(bundle.compiled.status, 'ready');
  assert.equal(bundle.compiled.rules.length, 17);
  assert.deepEqual(bundle.compiled, workspace.compiledInput, 'Shared compiler must reproduce the authored ZIP');
  const layout = manual.rules.find(r => r.capabilitySet === 'auto-layout@1');
  assert.equal(layout.capabilitySelection.length, 9);
  assert.ok(!layout.capabilitySelection.includes('layout.sizingVertical'));
  const observations = dates.map(time => {
    const bytes = reportBytes(time), report = JSON.parse(bytes);
    assert.equal(core.stableHash(report.snapshot), report.run.snapshotHash);
    assert.equal(core.stableHash(report.runtime.evaluatedContract), report.run.evaluatedContractHash);
    const engine = core.evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract);
    assert.deepEqual(JSON.parse(JSON.stringify(engine)), report.results.engine);
    if (time.startsWith('17-')) {
      assert.equal(report.run.manualSourceHash, core.stableHash(manual));
      assert.deepEqual(report.sources.manual, manual);
      assert.deepEqual(report.runtime.evaluatedContract, bundle.compiled);
      assert.equal(report.summary.complete, true);
      assert.equal(report.summary.notExecuted, 0);
      assert.equal(report.summary.inconclusive, 0);
      assert.equal(report.summary.engineEvaluations, 17);
      assert.equal(report.run.capture.matchedBaselineNodes, 2);
      assert.equal(report.snapshot.nodes[0].layout.sizingVertical, 'HUG');
      const violations = engine.evaluations.filter(e => e.classification === 'violation');
      assert.equal(violations.length, time === '17-22-48-414' ? 1 : 0);
      if (violations.length) assert.ok(violations[0].trace.factPaths.includes('layout.padding.top'));
    }
    return {file: `reports/fixtures/r10-r11/${reportName(time)}.gz`, sha256: sha(bytes),
      revision: report.run.manualRevision, exactEngineReplay: true, complete: report.summary.complete,
      evaluations: engine.evaluations.length, classifications: report.summary.classifications,
      historicalFailure: time.startsWith('14-'), captureWarnings: report.run.capture.warnings};
  });
  const acceptance = {
    schemaVersion: 'apollo.component-contract.acceptance.v1', componentId: manual.component.componentId,
    date: '2026-10-01', status: 'accepted', scope: 'figma-component', platform: 'desktop', published: false,
    manualRevision: 11, manualSourceHash: core.stableHash(manual), compiledHash: core.stableHash(bundle.compiled),
    generatedFactsHash: bundle.compiled.package.generatedFactsHash, sourceZipSha256: sha(archive),
    editorVersion: '0.2.71', sourceRules: 6, ruleIRCount: 17, normativeSemanticsUnchanged: true,
    ownerAcceptance: {source: 'user-message', date: '2026-10-01', quote: 'считаем проверки пройденными. Можно финалить контракт ? если да, то сделай это и переходи к настройке коннекта с кодом'},
    liveEvidence: observations.filter(r => !r.historicalFailure), historicalEvidence: observations.filter(r => r.historicalFailure),
    bodyMatrixAcceptance: 'owner-attested; no additional JSON reports supplied for the full Body matrix',
    externalContentValidation: false,
    limitations: [
      'Ready covers the six authored desktop rules only; not all 32 legacy rules, mobile, Section, page patterns, frontend validation or production publication.',
      'External native Body payload is deliberately outside host validation; its own component contracts are not executed.',
      'Vertical resizing is unrestricted: the owner removed sizingVertical from the lock; this is not a FIXED/HUG domain constraint.',
      'Blank semantics.purpose remains a compiler warning; broader generation profiles and code parity are a subsequent stage.',
      'Explicit padding-token binding, placeholder semantics and root clickability have no additional authored checks in this accepted revision.',
      'Hub/legacy differences remain open in the ledger; no normative Hub files or production catalogs are rewritten.',
    ],
  };
  const legacy = JSON.parse(fs.readFileSync(path.join(repo, 'JSONS/web/components/web-corp/CorporateContent/rules.json'))).manual.rules;
  const hubText = fs.readFileSync(path.resolve(repo, '../../ds-ai-hub', hubPath), 'utf8');
  const crosswalk = {
    schemaVersion: 'apollo.component-contract.rule-crosswalk.v1', normative: false,
    componentId: manual.component.componentId, manualSourceHash: core.stableHash(manual),
    scope: 'semantic evidence, not full legacy parity or an additional rules source',
    authored: manual.rules.map(rule => {
      const related = suffixes[rule.id.slice(authoredPrefix.length)].map(s => legacyPrefix + s);
      assert.ok(related.every(id => legacy.some(r => r.ruleId === id)));
      return {ruleId: rule.id, legacyRuleIds: related, relationship: 'semantic-crosswalk',
        coverage: rule.capabilitySet === 'auto-layout@1' ? 'partial-with-sizing-conflict' : 'component-scoped-subset',
        hubEvidence: [{kind: 'section', path: hubPath, title: rule.targetId === 'target.body' ? 'Body' : rule.capability.startsWith('variable.modes.') ? 'Фон' : 'Root layout', exists: hubText.length > 0}],
      };
    }),
    legacy: legacy.map(rule => ({ruleId: rule.ruleId,
      owner: rule.ruleId.includes('.section-') ? 'Section-or-documentation' : /\.(required-on-product-page|platform-breakpoint-selection|default-page-background|nesting-prohibited|header-adjacency|gutter-horizontal-composition)$/.test(rule.ruleId) ? 'pattern' : /\.(component-properties-are-first-class|layer-properties-use-effective-baseline|lifecycle-context-is-informational|transition-version-prohibited)$/.test(rule.ruleId) ? 'infrastructure-or-lifecycle' : 'CorporateContent',
      authoredRuleIds: manual.rules.filter(r => suffixes[r.id.slice(authoredPrefix.length)].map(s => legacyPrefix + s).includes(rule.ruleId)).map(r => r.id),
      disposition: 'not automatically imported, deleted or declared fully migrated',
    })),
  };
  return {archive, files, bundle, acceptance, crosswalk};
}
function write(rootPath, name, bytes) {
  const file = path.join(rootPath, name); fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, typeof bytes === 'string' || Buffer.isBuffer(bytes) ? bytes : JSON.stringify(bytes, null, 2) + '\n');
}
async function record() {
  const r = await review();
  for (const time of dates) {
    const bytes = reportBytes(time), target = path.join(root, 'reports/fixtures/r10-r11', reportName(time) + '.gz');
    if (fs.existsSync(target)) assert.ok(zlib.gunzipSync(fs.readFileSync(target)).equals(bytes));
    else write(root, path.relative(root, target), zlib.gzipSync(bytes, {level: 9}));
  }
  const source = r.files.find(f => f.name === 'contract.manual.json');
  write(root, 'contract.manual.json', source.text); // Byte-identical extraction, never a hand-authored projection.
  for (const file of r.files.filter(f => f.name.startsWith('corporate-content/source/'))) {
    const existing = path.join(root, 'src', path.basename(file.name));
    if (fs.existsSync(existing)) assert.equal(fs.readFileSync(existing, 'utf8').trim(), file.text.trim());
    else write(root, 'src/' + path.basename(file.name), file.text);
  }
  write(root, 'compiled/component-contract.v2.json', r.bundle.compiled);
  write(root, 'reports/coverage.json', r.bundle.coverage);
  write(root, 'reports/readiness.json', r.bundle.validation);
  write(root, 'reports/acceptance.json', r.acceptance);
  write(root, 'reports/rule-crosswalk.json', r.crosswalk);
  write(root, 'runtime/component-contract.index.json', {
    componentId: r.acceptance.componentId, contractId: r.bundle.manual.component.contractId,
    compiledPath: '../compiled/component-contract.v2.json', status: 'ready', published: false,
    acceptedScope: 'desktop, included-source-rules-only', manualSourceHash: r.acceptance.manualSourceHash,
    compiledHash: r.acceptance.compiledHash, representationKeys: r.bundle.manual.representations.map(r => r.locator.componentKey),
  });
  assert.ok(fs.readFileSync(path.join(root, 'corporate-content.component-contract.zip')).equals(r.archive));
  return r.acceptance;
}
if (require.main === module) (process.argv.includes('--record') ? record() : review().then(r => r.acceptance))
  .then(r => console.log(JSON.stringify({status:r.status,scope:r.scope,revision:r.manualRevision,checks:r.ruleIRCount,manualHash:r.manualSourceHash})))
  .catch(error => {console.error(error);process.exitCode=1;});
module.exports = {review, record};
