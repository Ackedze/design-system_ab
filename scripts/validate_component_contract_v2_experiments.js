#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPERIMENT_ROOT = path.join(REPO_ROOT, 'JSONS/experiments/component-contract-v2');
const INVENTORY_PATH = path.join(EXPERIMENT_ROOT, 'ready-corp-components.inventory.json');
const SOURCE_FILES = [
  'README.md',
  'agent-context.json',
  'audit-mapping.json',
  'composition-contract.json',
  'contract.generated.json',
  'contract.overrides.json',
  'examples.json',
  'rules.json',
];
const TARGET_ALIASES = new Map([
  ['web-corp/ButtonGroup [D]', 'ButtonsGroup'],
]);

function main() {
  const inventory = readJson(INVENTORY_PATH);
  const packageIds = new Set();
  let verifiedSourceFiles = 0;
  let executableRules = 0;
  for (const item of inventory.packages) {
    const targetName = TARGET_ALIASES.get(`${item.library}/${item.name}`) || item.name;
    const sourceDir = path.join(REPO_ROOT, 'JSONS/web/components', item.library, item.name);
    const packageDir = path.join(EXPERIMENT_ROOT, item.library, targetName);
    const contract = readJson(path.join(packageDir, 'compiled/component-contract.v2.json'));
    const coverage = readJson(path.join(packageDir, 'coverage.json'));
    if (contract.runtimePolicy.consumedByApollo || contract.runtimePolicy.publishedToRuntimeIndexes) {
      throw new Error(`${contract.package.id}: experimental package is runtime-visible`);
    }
    if (packageIds.has(contract.package.id)) throw new Error(`Duplicate package id: ${contract.package.id}`);
    packageIds.add(contract.package.id);
    for (const sourceFile of contract.package.sourceFiles) {
      const canonicalPath = sourceFile.file.startsWith('source/')
        ? path.join(sourceDir, sourceFile.file.slice('source/'.length))
        : path.join(REPO_ROOT, sourceFile.file);
      const contents = fs.readFileSync(canonicalPath);
      const digest = crypto.createHash('sha256').update(contents).digest('hex');
      if (contents.length !== sourceFile.bytes || digest !== sourceFile.sha256) {
        throw new Error(`${contract.package.id}: source manifest drift for ${sourceFile.file}`);
      }
      verifiedSourceFiles++;
    }
    const sourceCopyDir = path.join(packageDir, 'source');
    if (fs.existsSync(sourceCopyDir)) {
      for (const fileName of SOURCE_FILES) {
        const source = fs.readFileSync(path.join(sourceDir, fileName));
        const copy = fs.readFileSync(path.join(sourceCopyDir, fileName));
        if (!source.equals(copy)) throw new Error(`Source copy drift: ${item.library}/${item.name}/${fileName}`);
      }
    }
    if (coverage.summary.deterministicSourceRules
      !== coverage.summary.executableDeterministicSourceRules + coverage.summary.unsupported) {
      throw new Error(`${contract.package.id}: deterministic coverage is incomplete`);
    }
    executableRules += contract.rules.length;
  }
  const matrix = readJson(path.join(EXPERIMENT_ROOT, 'capability-matrix.json'));
  const profile = readJson(path.join(EXPERIMENT_ROOT, 'ready-package-rule-profile.json'));
  const registry = readJson(path.join(EXPERIMENT_ROOT, 'schemas/capability-registry.v1.json'));
  const runtimeIndex = readJson(path.join(EXPERIMENT_ROOT, 'runtime-index.json'));
  if (matrix.coverage.packageCount !== inventory.packages.length) throw new Error('Matrix package count mismatch');
  if (profile.inventory.packageCount !== inventory.packages.length) throw new Error('Profile package count mismatch');
  if (packageIds.size !== inventory.packages.length) throw new Error('Compiled package count mismatch');
  if (runtimeIndex.runtimePolicy.defaultEnabled !== false) {
    throw new Error('Experimental runtime index must remain disabled by default');
  }
  if (runtimeIndex.packages.length !== inventory.packages.length) {
    throw new Error('Experimental runtime index package count mismatch');
  }
  const indexedPackageIds = new Set();
  const indexedComponentKeys = new Set();
  for (const entry of runtimeIndex.packages) {
    if (!packageIds.has(entry.id)) throw new Error(`Unknown runtime package: ${entry.id}`);
    if (indexedPackageIds.has(entry.id)) throw new Error(`Duplicate runtime package: ${entry.id}`);
    indexedPackageIds.add(entry.id);
    const contractPath = path.join(EXPERIMENT_ROOT, entry.contractPath);
    if (!fs.existsSync(contractPath)) throw new Error(`Missing runtime contract: ${entry.contractPath}`);
    for (const componentKey of entry.componentKeys) {
      if (indexedComponentKeys.has(componentKey)) {
        throw new Error(`Duplicate runtime component key: ${componentKey}`);
      }
      indexedComponentKeys.add(componentKey);
    }
  }
  console.log(JSON.stringify({
    packages: packageIds.size,
    verifiedSourceFiles,
    executableRules,
    deterministicCoverage: matrix.coverage,
    capabilities: {
      selectors: registry.selectors.length,
      facts: registry.facts.length,
      operators: registry.operators.length,
      conditionOperators: registry.conditionOperators.length,
      remediations: registry.remediations.length,
    },
    artifactSha256: treeDigest(EXPERIMENT_ROOT),
  }, null, 2));
}

function treeDigest(root) {
  const hash = crypto.createHash('sha256');
  for (const filePath of listFiles(root)) {
    hash.update(path.relative(root, filePath));
    hash.update('\0');
    hash.update(fs.readFileSync(filePath));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function listFiles(root) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(fullPath));
    else result.push(fullPath);
  }
  return result.sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

main();
