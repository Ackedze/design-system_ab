// Distribution copies only. Normative sources remain in component authoring directories.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..');
const destination = path.join(repo, 'experiments/current-contract-packages');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const packages = [
  {name: 'Button', root: 'experiments/web-core/core/Button', zip: 'editor/Button.editor-input.zip', acceptance: 'qa/final-readiness-r31.2026-09-29.json', scope: 'Figma: desktop/mobile, ordinary/inverted; code representations draft'},
  {name: 'Spinner', root: 'experiments/web-core/core/Spinner', zip: 'editor/Spinner.editor-input.zip', acceptance: 'qa/final-review.2026-09-27.json', scope: 'Declared Figma predicates; code/generation outside acceptance'},
  {name: 'Amount', root: 'experiments/web-core/core/Amount/authoring', zip: 'editor/Amount.editor-input.zip', acceptance: 'reports/acceptance.json', scope: 'Core Amount declared Figma rules; frontend/patterns outside acceptance'},
  {name: 'AmountStyles', root: 'experiments/web-corp/AmountStyles/authoring', zip: 'editor/AmountStyles.editor-input.zip', acceptance: 'reports/acceptance.json', scope: 'Paragraph and desktop/mobile Headline preset rules; frontend outside acceptance'},
  {name: 'CorporateContent', root: 'experiments/web-corp/CorporateContent/authoring', zip: 'corporate-content.component-contract.zip', acceptance: 'reports/acceptance.json', scope: 'Six declared desktop rules only; Section/mobile/patterns/code outside acceptance'},
  {name: '[M] CorporateContent', filename: 'CorporateContent.mobile-web.r6.component-contract.zip', root: 'experiments/web-corp/CorporateContent/mobile-web/authoring', zip: 'editor/CorporateContent.mobile-web.component-contract.zip', acceptance: 'reports/acceptance.json', scope: 'Six declared mobile-web Figma rules; external Body payload/Section/patterns/code outside acceptance'},
];
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
async function collect(checkOnly = false) {
  const prepared = [];
  for (const item of packages) {
    const root = path.join(repo, item.root);
    const manual = json(path.join(root, 'contract.manual.json'));
    const compiled = json(path.join(root, 'compiled/component-contract.v2.json'));
    const acceptance = json(path.join(root, item.acceptance));
    const bytes = fs.readFileSync(path.join(root, item.zip));
    const entries = await core.readZip(bytes);
    const imported = core.importWorkspace(entries.map(e => ({name: e.name, text: core.zipEntryText(e)})));
    assert.deepEqual(imported.manual, manual, item.name + ': ZIP manual differs from current source');
    assert.ok(manual.rules.every(r => r.status === 'reviewed'), item.name + ': draft source rule');
    assert.equal(compiled.status, 'ready');
    assert.equal(compiled.package.componentId, manual.component.componentId);
    assert.equal(compiled.package.manualSourceHash, core.stableHash(manual));
    const acceptedManualHash = acceptance.manualSourceHash || acceptance.candidateManualHash;
    const acceptedRevision = acceptance.manualRevision ?? acceptance.targetRevision;
    assert.equal(acceptedManualHash, core.stableHash(manual), item.name + ': acceptance is stale');
    assert.equal(acceptedRevision, manual.metadata.revision);
    const acceptedCompiledHash = acceptance.compiledHash || acceptance.candidateCompiledHash;
    if (acceptedCompiledHash) assert.equal(acceptedCompiledHash, core.stableHash(compiled));
    if (imported.compiledInput) assert.deepEqual(imported.compiledInput, compiled);
    const filename = item.filename || item.name + '.component-contract.zip';
    const dependencies = (compiled.componentDependencies || []).map(d => {
      assert.ok(d.contract, item.name + ': missing pinned dependency');
      assert.equal(d.compiledHash, core.stableHash(d.contract));
      const input = imported.dependencyContracts.find(c => c.package.componentId === d.componentId);
      assert.deepEqual(input, d.contract, item.name + ': ZIP dependency differs from compiled dependency');
      return {componentId: d.componentId, revision: d.revision, manualSourceHash: d.manualSourceHash, compiledHash: d.compiledHash};
    });
    prepared.push({bytes, item, compiled, record: {
      name: item.name, componentId: manual.component.componentId, revision: manual.metadata.revision,
      file: filename, sourceZip: path.posix.join(item.root, item.zip),
      sourceManual: path.posix.join(item.root, 'contract.manual.json'),
      sourceCompiled: path.posix.join(item.root, 'compiled/component-contract.v2.json'),
      sourceReadme: path.posix.join(item.root, 'README.md'),
      acceptance: path.posix.join(item.root, item.acceptance),
      scope: item.scope, sourceRules: manual.rules.length, ruleIR: compiled.rules.length,
      zipSha256: sha(bytes), manualSourceHash: core.stableHash(manual), dependencies,
      zipIncludesHostCompiled: !!imported.compiledInput,
    }});
  }
  for (const {record, compiled} of prepared) {
    for (const dependency of compiled.componentDependencies || []) {
      const current = prepared.find(p => p.record.componentId === dependency.componentId);
      assert.ok(current, record.name + ': dependency missing from collection');
      assert.equal(dependency.revision, current.record.revision);
      assert.deepEqual(dependency.contract, current.compiled, record.name + ': dependency not current');
    }
  }
  const manifest = {
    schemaVersion: 'component-contract-package-collection.v1', normative: false,
    purpose: 'Current accepted manual-first Figma packages for import into ComponentContract Editor',
    canonicalSourcesRemainInPlace: true, productionPublication: false,
    packages: prepared.map(p => p.record),
  };
  if (checkOnly) {
    assert.deepEqual(json(path.join(destination, 'manifest.json')), manifest);
    for (const {bytes, record} of prepared) assert.ok(fs.readFileSync(path.join(destination, record.file)).equals(bytes));
  } else {
    fs.mkdirSync(destination, {recursive: true});
    for (const {bytes, record} of prepared) fs.writeFileSync(path.join(destination, record.file), bytes);
    fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return manifest;
}
if (require.main === module) collect(process.argv.includes('--check'))
  .then(m => console.log(JSON.stringify({checkOnly: process.argv.includes('--check'), packages: m.packages.map(p => p.name + ' r' + p.revision), zipAndSourceParity: true, pinnedDependenciesCurrent: true})))
  .catch(e => {console.error(e); process.exitCode = 1;});
module.exports = {collect};
