#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPERIMENT_ROOT = path.join(REPO_ROOT, 'JSONS/experiments/component-contract-v2');
const INVENTORY_PATH = path.join(EXPERIMENT_ROOT, 'ready-corp-components.inventory.json');
const OUTPUT_PATH = path.join(EXPERIMENT_ROOT, 'ready-package-rule-profile.json');

const FEATURE_GROUPS = [
  'ruleFields',
  'assertionFields',
  'checkTypes',
  'targetFields',
  'conditionFields',
  'remediationFields',
  'compositionOperators',
  'compositionMatchFields',
  'compositionSelectFields',
  'compositionPolicyPaths',
  'overridePolicyPaths',
];
const RUNTIME_FEATURE_GROUPS = FEATURE_GROUPS.filter((group) => group !== 'overridePolicyPaths');
const BASE_RULE_FIELDS = new Set([
  'ruleId',
  'patternRuleId',
  'checkType',
  'severity',
  'appliesTo',
  'ruleText',
  'target',
  'conditions',
  'remediation',
  'sources',
  'evidence',
  'source',
  'matchKind',
  'patternId',
  'ruleKind',
  'designSeverity',
  'severityScope',
]);

function main() {
  const inventory = readJson(INVENTORY_PATH);
  const packages = inventory.packages.map(profilePackage);
  const vocabulary = Object.fromEntries(FEATURE_GROUPS.map((group) => [
    group,
    uniqueSorted(packages.flatMap((item) => item.features[group])),
  ]));
  const runtimeSaturation = buildGreedySaturation(packages, RUNTIME_FEATURE_GROUPS);
  const authoringSaturation = buildGreedySaturation(packages, FEATURE_GROUPS);
  const report = {
    schemaVersion: 'apollo.contract-experiment-rule-profile.v1',
    inventory: {
      file: path.relative(REPO_ROOT, INVENTORY_PATH),
      spreadsheetId: inventory.source.spreadsheetId,
      sheetName: inventory.source.sheetName,
      range: inventory.source.range,
      packageCount: packages.length,
    },
    totals: Object.fromEntries(FEATURE_GROUPS.map((group) => [group, vocabulary[group].length])),
    vocabulary,
    fieldUsage: buildRuleFieldUsage(packages),
    deterministicAssertionSignatures: buildAssertionSignatures(packages),
    saturation: {
      runtime: runtimeSaturation,
      authoring: authoringSaturation,
    },
    packages,
  };
  writeJson(OUTPUT_PATH, report);
  console.log(JSON.stringify({
    output: path.relative(REPO_ROOT, OUTPUT_PATH),
    packageCount: packages.length,
    totals: report.totals,
    runtimeSaturationOrder: runtimeSaturation.map((entry) => ({
      packageId: entry.packageId,
      gain: entry.gain,
      cumulativeCoverageRatio: entry.cumulativeCoverageRatio,
    })),
  }, null, 2));
}

function profilePackage(entry) {
  const sourceDir = path.join(REPO_ROOT, 'JSONS/web/components', entry.library, entry.name);
  const rulesDocument = readJson(path.join(sourceDir, 'rules.json'));
  const compositionDocument = readJson(path.join(sourceDir, 'composition-contract.json'));
  const overridesDocument = readJson(path.join(sourceDir, 'contract.overrides.json'));
  const rules = uniqueRules(rulesDocument);
  const contracts = (((compositionDocument || {}).manual || {}).contracts || []);
  const constraints = contracts.flatMap((contract) => contract.constraints || []);
  const subtreePolicies = contracts.flatMap((contract) => contract.subtreePropertyPolicies || []);
  const features = {
    ruleFields: uniqueSorted(rules.flatMap((rule) => Object.keys(rule))),
    assertionFields: uniqueSorted(rules.flatMap((rule) =>
      Object.keys(rule).filter((field) => !BASE_RULE_FIELDS.has(field)),
    )),
    checkTypes: uniqueSorted(rules.map((rule) => rule.checkType || 'unspecified')),
    targetFields: uniqueSorted(rules.flatMap((rule) => Object.keys(rule.target || {}))),
    conditionFields: uniqueSorted(rules.flatMap((rule) => collectObjectPaths(rule.conditions || {}, 'conditions'))),
    remediationFields: uniqueSorted(rules.flatMap((rule) => collectObjectPaths(rule.remediation || {}, 'remediation'))),
    compositionOperators: uniqueSorted(constraints.map((constraint) => constraint.op || 'unspecified')),
    compositionMatchFields: uniqueSorted(contracts.flatMap((contract) => Object.keys(contract.match || {}))),
    compositionSelectFields: uniqueSorted(contracts.flatMap((contract) => Object.keys(contract.select || {}))),
    compositionPolicyPaths: uniqueSorted(subtreePolicies.flatMap((policy) => collectObjectPaths(policy, 'subtreePropertyPolicy'))),
    overridePolicyPaths: uniqueSorted(collectObjectPaths((((overridesDocument || {}).manual) || {}), 'manual')),
  };
  return {
    packageId: `${entry.library}.${slugify(entry.name)}`,
    name: entry.name,
    library: entry.library,
    channel: entry.channel,
    platform: entry.platform,
    sourcePath: path.relative(REPO_ROOT, sourceDir),
    counts: {
      rules: rules.length,
      deterministicRules: rules.filter((rule) => rule.checkType === 'deterministic').length,
      compositionContracts: contracts.length,
      compositionConstraints: constraints.length,
      subtreePropertyPolicies: subtreePolicies.length,
    },
    deterministicRules: rules
      .filter((rule) => rule.checkType === 'deterministic')
      .map((rule) => ({
        ruleId: rule.ruleId,
        assertionFields: Object.keys(rule).filter((field) => !BASE_RULE_FIELDS.has(field)).sort(),
      })),
    features,
  };
}

function buildGreedySaturation(packages, groups) {
  const universe = new Set(packages.flatMap((item) => featureTokens(item, groups)));
  const covered = new Set();
  const remaining = packages.slice();
  const result = [];
  while (remaining.length) {
    remaining.sort((left, right) => {
      const rightGain = featureTokens(right, groups).filter((token) => !covered.has(token)).length;
      const leftGain = featureTokens(left, groups).filter((token) => !covered.has(token)).length;
      return rightGain - leftGain || left.packageId.localeCompare(right.packageId);
    });
    const selected = remaining.shift();
    const novelFeatures = featureTokens(selected, groups).filter((token) => !covered.has(token));
    novelFeatures.forEach((token) => covered.add(token));
    result.push({
      packageId: selected.packageId,
      gain: novelFeatures.length,
      novelFeatures,
      cumulativeFeatures: covered.size,
      cumulativeCoverageRatio: Number((covered.size / Math.max(1, universe.size)).toFixed(4)),
    });
  }
  return result;
}

function featureTokens(item, groups) {
  return groups.flatMap((group) => item.features[group].map((value) => `${group}:${value}`));
}

function buildRuleFieldUsage(packages) {
  const usage = new Map();
  for (const item of packages) {
    for (const rule of item.deterministicRules) {
      for (const field of rule.assertionFields) {
        const entry = usage.get(field) || { field, packages: new Set(), rules: [] };
        entry.packages.add(item.packageId);
        entry.rules.push(rule.ruleId);
        usage.set(field, entry);
      }
    }
  }
  return Array.from(usage.values())
    .map((entry) => ({
      field: entry.field,
      packageCount: entry.packages.size,
      ruleCount: entry.rules.length,
      packages: Array.from(entry.packages).sort(),
      exampleRuleIds: entry.rules.slice().sort().slice(0, 8),
    }))
    .sort((left, right) => right.packageCount - left.packageCount || left.field.localeCompare(right.field));
}

function buildAssertionSignatures(packages) {
  const signatures = new Map();
  for (const item of packages) {
    for (const rule of item.deterministicRules) {
      const signature = rule.assertionFields.length ? rule.assertionFields.join('+') : '(prose-only)';
      const entry = signatures.get(signature) || { signature, packages: new Set(), ruleIds: [] };
      entry.packages.add(item.packageId);
      entry.ruleIds.push(rule.ruleId);
      signatures.set(signature, entry);
    }
  }
  return Array.from(signatures.values())
    .map((entry) => ({
      signature: entry.signature,
      packageCount: entry.packages.size,
      ruleCount: entry.ruleIds.length,
      packages: Array.from(entry.packages).sort(),
      exampleRuleIds: entry.ruleIds.slice().sort().slice(0, 12),
    }))
    .sort((left, right) => right.ruleCount - left.ruleCount || left.signature.localeCompare(right.signature));
}

function collectObjectPaths(value, prefix) {
  if (Array.isArray(value)) {
    const nested = value.flatMap((item) => collectObjectPaths(item, `${prefix}[]`));
    return [prefix].concat(nested);
  }
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, nested]) => {
    const next = `${prefix}.${key}`;
    return [next].concat(collectObjectPaths(nested, next));
  });
}

function uniqueRules(document) {
  const byId = new Map();
  for (const rule of (((document || {}).generated || {}).rules || []).concat((((document || {}).manual || {}).rules || []))) {
    byId.set(rule.ruleId, rule);
  }
  return Array.from(byId.values());
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function uniqueSorted(values) {
  return Array.from(new Set((values || []).filter(Boolean))).sort((left, right) =>
    String(left).localeCompare(String(right)),
  );
}

main();
