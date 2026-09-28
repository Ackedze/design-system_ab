#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(repoRoot, '../..');
const packageRoot = path.join(repoRoot, 'experiments/web-core/core/Button');
const editorRoot = path.join(workspaceRoot, 'projects/ComponentContractEditor');
const preserveSources = process.argv.includes('--preserve-sources');
const editorCore = path.join(editorRoot, 'dist/core.cjs');
const manualPath = path.join(packageRoot, 'contract.manual.json');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function writeJson(relativePath, value) {
  const target = path.join(packageRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function copyFile(sourceRoot, relativeSource, relativeTarget) {
  if (preserveSources) {
    const previous = previousSnapshots.find((snapshot) => snapshot.snapshotPath === relativeTarget);
    const target = path.join(packageRoot, relativeTarget);
    if (!previous || !fs.existsSync(target)) throw new Error(`Missing preserved source evidence: ${relativeTarget}`);
    const buffer = fs.readFileSync(target);
    if (sha256(buffer) !== previous.sha256) throw new Error(`Preserved evidence changed: ${relativeTarget}`);
    return previous;
  }
  const source = path.join(sourceRoot, relativeSource);
  if (!fs.existsSync(source)) throw new Error(`Missing reference source: ${source}`);
  const target = path.join(packageRoot, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const buffer = fs.readFileSync(target);
  return {
    sourceRepository: path.basename(sourceRoot),
    sourcePath: relativeSource,
    snapshotPath: relativeTarget,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
  };
}

function copyOptionalFile(sourceRoot, relativeSource, relativeTarget) {
  const source = path.join(sourceRoot, relativeSource);
  if (fs.existsSync(source)) return copyFile(sourceRoot, relativeSource, relativeTarget);
  const preservedSnapshot = path.join(packageRoot, relativeTarget);
  if (!fs.existsSync(preservedSnapshot)) return null;
  const buffer = fs.readFileSync(preservedSnapshot);
  return {
    sourceRepository: `${path.basename(sourceRoot)} (snapshot-only)`,
    sourcePath: relativeSource,
    snapshotPath: relativeTarget,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
  };
}

if (!fs.existsSync(editorCore)) {
  throw new Error(`ComponentContract Editor core is not built: ${editorCore}. Run npm run build in the Editor first.`);
}
if (!fs.existsSync(manualPath)) throw new Error(`Manual source is missing: ${manualPath}`);

const athenaRoot = path.join(repoRoot, 'JSONS/web/components/web-core/core/Button');
const evidenceRoot = preserveSources ? path.join(packageRoot, 'sources/design-system_ab-athena') : athenaRoot;
const dsAiHubRoot = path.join(workspaceRoot, 'ds-ai-hub');
const snapshots = [];
const previousSnapshots = preserveSources
  ? JSON.parse(fs.readFileSync(path.join(packageRoot, 'reports/source-inventory.json'), 'utf8')).sources
  : [];

for (const file of [
  'README.md',
  'agent-context.json',
  'audit-mapping.json',
  'composition-contract.json',
  'contract.generated.json',
  'contract.overrides.json',
  'examples.json',
  'rules.json',
  'semantic-targets.json',
]) {
  snapshots.push(copyFile(athenaRoot, file, `sources/design-system_ab-athena/${file}`));
}

for (const file of [
  'core/web/components/button/meta.json',
  'core/web/components/button/guidelines.md',
  'core/web/components/button/bridge.md',
  'core/web/components/button/code/adapter.md',
  'core/web/components/button/figma/adapter.md',
  'core/web/components/button/figma/cookbook.md',
  'core/web/components/button/figma/keys.json',
  'core/web/components/button/figma/model.json',
  'core/web/components/button/figma/snippets.md',
  'evals/cases/core/design-figma/component-demo/button/structure.md',
  'evals/cases/core/design-figma/component-demo/button/expected.json',
]) {
  snapshots.push(copyFile(dsAiHubRoot, file, `sources/ds-ai-hub/${file}`));
}

const previousEditorExport = path.join(athenaRoot, 'button.component-contract');
for (const file of [
  'contract.manual.json',
  'compiled/component-contract.v2.json',
  'coverage.json',
  'validation-report.json',
]) {
  const snapshot = copyOptionalFile(previousEditorExport, file, `sources/component-contract-editor/previous-export/${file}`);
  if (snapshot) snapshots.push(snapshot);
}
for (const file of ['README.md', 'docs/USER_GUIDE.ru.md']) {
  snapshots.push(copyFile(editorRoot, file, `sources/component-contract-editor/current/${file}`));
}

const manual = JSON.parse(fs.readFileSync(manualPath, 'utf8'));
const sortedSnapshots = snapshots.sort((left, right) => left.snapshotPath.localeCompare(right.snapshotPath));
const sourceBundleHash = sha256(Buffer.from(sortedSnapshots
  .map((snapshot) => `${snapshot.snapshotPath}\0${snapshot.sha256}`)
  .join('\n')));
const core = require(editorCore);
const dependencyPaths=process.argv.flatMap((arg,index)=>arg==='--dependency'?[process.argv[index+1]]:[]);
if(dependencyPaths.some(p=>!p||p.startsWith('--')))throw new Error('--dependency requires a compiled contract path.');
const dependencyContracts=dependencyPaths.map(p=>JSON.parse(fs.readFileSync(path.resolve(repoRoot,p),'utf8')));
const editorEvidenceFiles = [
  'contract.generated.json', 'contract.overrides.json', 'semantic-targets.json',
  'composition-contract.json', 'rules.json', 'examples.json', 'audit-mapping.json', 'agent-context.json',
];
const inputFiles = [
  {name:'contract.manual.json',text:JSON.stringify(manual)},
  ...editorEvidenceFiles.map(file=>({name:`evidence/${file}`,text:fs.readFileSync(path.join(evidenceRoot,file),'utf8')})),
];
// Use exactly the same import route as Editor (including provenance hashes).
const variantEvidence = core.importWorkspace(inputFiles).variantEvidence;
// Generated membership is an independent read-only input; it never rewrites manual policy.
const assetCatalogs = core.extractAssetCatalogs(['Icons -- glyph-26', 'Icons -- general (glyph)'].map(name =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, 'JSONS/indexes/icons', `${name}.index.json`), 'utf8'))));
variantEvidence.assetCatalogs = assetCatalogs;
const compactAssets = {schemaVersion:'apollo.asset-catalogs.v1', catalogs:assetCatalogs};
const bundle = core.buildExportBundle(manual, variantEvidence, dependencyContracts);
if (!bundle.validation.valid) {
  const errors = bundle.validation.issues.filter((issue) => issue.level === 'error');
  throw new Error(`Manual source is invalid:\n${errors.map((issue) => `${issue.path}: ${issue.message}`).join('\n')}`);
}

const athenaRules = JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'rules.json'), 'utf8')).manual.rules;
const manualRuleIds = new Set(manual.rules.map((rule) => rule.id));
const missingAthenaRuleIds = athenaRules.map((rule) => rule.ruleId).filter((ruleId) => !manualRuleIds.has(ruleId));
if (missingAthenaRuleIds.length) {
  throw new Error(`Manual source lost Athena rule ids: ${missingAthenaRuleIds.join(', ')}`);
}

const editorInputZip = core.createZip([
  core.textZipEntry('contract.manual.json', manual),
  core.textZipEntry('evidence/asset-catalogs.json', compactAssets),
  ...dependencyContracts.map(c=>core.textZipEntry(`dependencies/${c.package.componentId}/component-contract.v2.json`,c)),
  ...editorEvidenceFiles.map((file) => core.textZipEntry(
    `evidence/${file}`,
    JSON.parse(fs.readFileSync(path.join(evidenceRoot, file), 'utf8')),
  )),
]);
const editorInputPath = path.join(packageRoot, 'editor/Button.editor-input.zip');
fs.mkdirSync(path.dirname(editorInputPath), { recursive: true });
fs.writeFileSync(editorInputPath, editorInputZip);
writeJson('compiled/asset-catalogs.json', compactAssets);
for(const dependency of bundle.compiled.componentDependencies||[])if(dependency.contract)writeJson(`compiled/dependencies/${dependency.componentId}/component-contract.v2.json`,dependency.contract);
writeJson('reports/dependencies.json',{ownership:'generated-read-only',dependencies:(bundle.compiled.componentDependencies||[]).map(({contract,...d})=>({...d,linked:Boolean(contract)}))});

writeJson('compiled/component-contract.v2.json', bundle.compiled);
writeJson('reports/coverage.json', bundle.coverage);
writeJson('reports/validation-report.json', bundle.validation);
writeJson('reports/source-inventory.json', {
  schemaVersion: 'apollo.component-contract.source-inventory.v1',
  componentId: manual.component.componentId,
  generatedAt: manual.metadata.updatedAt,
  ownership: 'generated-read-only',
  sourceBundleHash,
  manualDeclaredSourceHash: manual.source.sourceHash,
  inSyncWithManual: sourceBundleHash === manual.source.sourceHash,
  sources: sortedSnapshots,
});
writeJson('reports/rule-crosswalk.json', {
  schemaVersion: 'apollo.component-contract.rule-crosswalk.v1',
  componentId: manual.component.componentId,
  sourceRuleIds: {
    athena: athenaRules.map((rule) => rule.ruleId).sort(),
    manual: manual.rules.map((rule) => rule.id).sort(),
  },
  missingAthenaRuleIds,
  entries: manual.rules.map((rule) => ({
    ruleId: rule.id,
    sourceRefs: rule.sourceRefs || [],
    route: rule.execution?.route || 'auto',
    status: rule.status,
    scopeStatus: rule.applicability.scopeStatus || 'confirmed',
  })).sort((left, right) => left.ruleId.localeCompare(right.ruleId)),
});
writeJson('reports/ownership.json', {
  schemaVersion: 'apollo.component-contract.ownership.v1',
  componentId: manual.component.componentId,
  normativeEditable: ['contract.manual.json'],
  generatedReadOnly: ['compiled/', 'editor/', 'reports/', 'projections/', 'runtime/', 'sources/'],
  excludedFromRuntimeIndexes: true,
  compiler: 'projects/ComponentContractEditor/dist/core.cjs',
  invariants: [
    'Editor is the only authoring route for contract.manual.json.',
    'Compiler output is never edited by hand.',
    'Source snapshots preserve evidence but are not normative after migration.',
    'Existing Athena rule ids are preserved; only previously unmodelled claims receive new ids.',
  ],
});

writeJson('projections/ds-ai-hub/component.json', {
  schemaVersion: 'ds-ai-hub.component-projection.v1-experimental',
  generatedFrom: '../contract.manual.json',
  componentId: manual.component.componentId,
  semantics: manual.semantics,
  representations: manual.representations,
  semanticApi: manual.semanticApi,
  documentation: manual.documentation,
  generation: manual.generation,
  decisions: manual.decisions,
  componentDependencies: manual.componentDependencies || [],
});
writeJson('projections/athena/manual-overlay.json', {
  schemaVersion: 'athena.component-manual-projection.v1-experimental',
  generatedFrom: '../contract.manual.json',
  componentId: manual.component.componentId,
  semantics: manual.semantics,
  targets: manual.targets,
  controlPorts: manual.controlPorts,
  componentDependencies: manual.componentDependencies || [],
  rules: manual.rules,
  examples: manual.examples,
});
writeJson('runtime/component-contract.index.json', {
  schemaVersion: 'apollo.component-contract.runtime-index-entry.v1-experimental',
  componentId: manual.component.componentId,
  contractId: manual.component.contractId,
  familyId: manual.component.familyId,
  lifecycle: manual.component.lifecycle,
  compiledPath: '../compiled/component-contract.v2.json',
  representationKeys: manual.representations
    .filter((representation) => representation.kind === 'figma')
    .map((representation) => representation.locator.componentKey)
    .filter(Boolean),
  ruleCount: bundle.coverage.sourceRules,
  executableRuleCount: bundle.coverage.compiledRules,
  status: bundle.compiled.status,
  published: false,
});

console.log(`Button reference package built: ${packageRoot}`);
console.log(`Rules: ${bundle.coverage.sourceRules}; compiled RuleIR: ${bundle.coverage.compiledRules}; validation issues: ${bundle.validation.issues.length}`);
if (sourceBundleHash !== manual.source.sourceHash) {
  console.warn(`Source evidence changed: manual declares ${manual.source.sourceHash}, current bundle is ${sourceBundleHash}. Review sources in the Editor before updating manual sourceHash.`);
}
