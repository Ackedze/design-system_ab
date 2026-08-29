#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPERIMENT_ROOT = path.join(REPO_ROOT, 'JSONS/experiments/component-contract-v2');
const INVENTORY_PATH = path.join(EXPERIMENT_ROOT, 'ready-corp-components.inventory.json');
const RUNTIME_INDEX_PATH = path.join(EXPERIMENT_ROOT, 'runtime-index.json');
const OUTPUT_PATH = path.join(EXPERIMENT_ROOT, 'rule-execution-classification.json');
const OUTPUT_MARKDOWN_PATH = path.join(EXPERIMENT_ROOT, 'rule-execution-classification.md');
const WAVE_PATH = path.join(EXPERIMENT_ROOT, 'migration-wave-1.json');
const UNRATIFIED_RUNTIME_OPERATORS = new Set([
  'numericFormat',
  'statePolicy',
  'visibilityPolicy',
]);
const DECISIONS = new Set([
  'deterministic',
  'agent-required',
  'human-review',
  'policy-only',
  'unresolved',
]);
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
  // Authority proves whether evidence may be used. It is not an assertion.
  'authority',
]);

function main() {
  const inventory = readJson(INVENTORY_PATH);
  const runtimeIndex = readJson(RUNTIME_INDEX_PATH);
  const readySourcePaths = new Set(inventory.packages.map((entry) =>
    normalizePath(path.join('JSONS/web/components', entry.library, entry.name)),
  ));
  const packages = runtimeIndex.packages.map((indexEntry) =>
    classifyPackage(indexEntry, readySourcePaths),
  );
  const readyPackages = packages.filter((entry) => entry.inventoryStatus === 'ready-corp');
  const supportingPackages = packages.filter((entry) => entry.inventoryStatus === 'supporting');
  const firstWave = readyPackages.filter((entry) => entry.migrationEligibility.startsWith('ready-'));
  const firstWaveSupporting = supportingPackages.filter(
    (entry) => entry.migrationEligibility.startsWith('supporting-'),
  );
  const report = {
    schemaVersion: 'apollo.contract-v2-rule-execution-classification.v1',
    generatedFrom: {
      inventory: normalizePath(path.relative(REPO_ROOT, INVENTORY_PATH)),
      runtimeIndex: normalizePath(path.relative(REPO_ROOT, RUNTIME_INDEX_PATH)),
      policy: 'Classify source semantics without inferring executable behavior from ruleText.',
    },
    decisionDefinitions: {
      deterministic: 'The rule is executable now, or has explicit structured assertion fields that make a deterministic implementation unambiguous.',
      'agent-required': 'The source explicitly declares llm/contextual evaluation; semantic interpretation is required.',
      'human-review': 'The source explicitly declares manual evaluation.',
      'policy-only': 'The source is dictionary/classification material and does not produce a verdict.',
      unresolved: 'The rule is prose-only or otherwise lacks enough typed evidence to choose deterministic versus agent execution safely.',
    },
    summary: summarizePackages(packages),
    readySummary: summarizePackages(readyPackages),
    firstWave: {
      readyPackageIds: firstWave.map((entry) => entry.packageId),
      supportingPackageIds: firstWaveSupporting.map((entry) => entry.packageId),
      ruleCount: firstWave.reduce((total, entry) => total + entry.rules.length, 0),
      deterministicRuleCount: firstWave.reduce(
        (total, entry) => total + entry.summary.decisions.deterministic,
        0,
      ),
    },
    packages,
  };
  writeJson(OUTPUT_PATH, report);
  writeJson(WAVE_PATH, buildWaveManifest(firstWave, firstWaveSupporting));
  for (const entry of packages) writePackagePolicy(entry);
  writeText(OUTPUT_MARKDOWN_PATH, buildMarkdown(report));
  console.log(JSON.stringify({
    output: normalizePath(path.relative(REPO_ROOT, OUTPUT_PATH)),
    readyPackages: readyPackages.length,
    firstWaveReadyPackages: firstWave.map((entry) => entry.packageId),
    supportingPackages: firstWaveSupporting.map((entry) => entry.packageId),
    readySummary: report.readySummary,
  }, null, 2));
}

function classifyPackage(indexEntry, readySourcePaths) {
  const contractPath = path.join(EXPERIMENT_ROOT, indexEntry.contractPath);
  const contract = readJson(contractPath);
  const contractRulesSourceFiles = (contract.package?.sourceFiles || [])
    .filter((source) => path.posix.basename(source.file) === 'rules.json');
  if (contractRulesSourceFiles.length !== 1) {
    throw new Error(`${contract.package.id}: expected exactly one pinned rules.json source`);
  }
  const packageDir = path.dirname(path.dirname(contractPath));
  const coverage = readJson(path.join(packageDir, 'coverage.json'));
  const sourcePath = normalizePath(contract.package.sourcePath);
  const rulesDocument = readJson(path.join(REPO_ROOT, sourcePath, 'rules.json'));
  const sourceRules = uniqueRules(rulesDocument);
  const coverageById = new Map((coverage.rules || []).map((entry) => [entry.sourceRuleId, entry]));
  const policyRoutes = executionPolicyRoutes(rulesDocument?.manual?.executionPolicy);
  const rules = sourceRules.map((rule) => classifyRule(
    rule,
    coverageById.get(rule.ruleId),
    policyRoutes.get(rule.ruleId) || null,
  ));
  const summary = summarizeRules(rules);
  const inventoryStatus = readySourcePaths.has(sourcePath) ? 'ready-corp' : 'supporting';
  const unsupportedRules = rules.filter((rule) => rule.compilerStatus === 'unsupported');
  const productionPredicateBridgeRules = unsupportedRules.filter((rule) => (
    rule.policyRoute === 'predicate'
    && rule.structuredFields.includes('predicateContour')
  ));
  const bridgedRuleIds = new Set(
    productionPredicateBridgeRules.map((rule) => rule.sourceRuleId),
  );
  const blockingUnsupportedRules = unsupportedRules.filter(
    (rule) => !bridgedRuleIds.has(rule.sourceRuleId),
  );
  const migrationEligible = blockingUnsupportedRules.length === 0;
  const eligibilitySuffix = productionPredicateBridgeRules.length
    ? 'production-predicate-bridge'
    : 'no-new-operators';
  return {
    packageId: contract.package.id,
    family: contract.package.family,
    library: contract.package.library,
    sourcePath,
    contractPath: normalizePath(path.relative(EXPERIMENT_ROOT, contractPath)),
    contractRulesSourceFile: contractRulesSourceFiles[0].file,
    inventoryStatus,
    migrationEligibility: migrationEligible
      ? `${inventoryStatus === 'ready-corp' ? 'ready' : 'supporting'}-${eligibilitySuffix}`
      : 'blocked-by-authoring-or-capabilities',
    closureStatus: summary.decisions.unresolved === 0 && migrationEligible
      ? 'closed-for-migration'
      : 'classified-with-gaps',
    productionPredicateBridgeRuleIds: Array.from(bridgedRuleIds).sort(),
    blockingUnsupportedRuleIds: blockingUnsupportedRules
      .map((rule) => rule.sourceRuleId)
      .sort(),
    compilerCoverage: coverage.summary,
    summary,
    rules,
  };
}

function classifyRule(rule, coverage, policyRoute) {
  const sourceCheckType = rule.checkType || 'unspecified';
  const compilerStatus = coverage?.status || nonDeterministicCompilerStatus(sourceCheckType);
  // Recompute from the authoritative source. Coverage files are compiler
  // diagnostics and may be produced by package-specific builders with a
  // different metadata vocabulary. In particular, `authority` alone must
  // never promote prose into a deterministic rule.
  const structuredFields = structuredAssertionFields(rule);
  const candidateCapabilities = coverage?.candidateCapabilities || emptyCapabilities();
  const gapKind = compilerStatus === 'unsupported'
    ? classifyUnsupportedGap(structuredFields, candidateCapabilities)
    : null;
  let decision;
  let readiness;
  let basis;
  if (compilerStatus === 'executable') {
    decision = 'deterministic';
    readiness = 'executable-now';
    basis = 'compiler-executable';
  } else if (sourceCheckType === 'llm' || sourceCheckType === 'contextual') {
    decision = 'agent-required';
    readiness = 'agent-route-required';
    basis = `source-check-type:${sourceCheckType}`;
  } else if (sourceCheckType === 'manual') {
    decision = 'human-review';
    readiness = 'human-route-required';
    basis = 'source-check-type:manual';
  } else if (sourceCheckType === 'dictionary') {
    decision = 'policy-only';
    readiness = 'non-verdict';
    basis = 'source-check-type:dictionary';
  } else if (sourceCheckType === 'deterministic' && structuredFields.length > 0) {
    decision = 'deterministic';
    readiness = gapKind === 'structured-fields-missing-runtime-operator'
      ? 'requires-versioned-capability'
      : 'requires-typed-authoring';
    basis = 'explicit-structured-assertion-fields';
  } else {
    decision = 'unresolved';
    readiness = 'requires-owner-triage';
    basis = sourceCheckType === 'deterministic'
      ? 'prose-only-deterministic-label-is-insufficient'
      : 'unclassified-source-check-type';
  }
  if (!DECISIONS.has(decision)) throw new Error(`${rule.ruleId}: unknown decision ${decision}`);
  return {
    sourceRuleId: rule.ruleId,
    sourceCheckType,
    compilerStatus,
    compilerRuleIds: coverage?.targetRuleIds || [],
    decision,
    readiness,
    basis,
    policyRoute,
    structuredFields,
    gapKind,
    candidateCapabilities,
  };
}

function structuredAssertionFields(rule) {
  return Object.keys(rule || {})
    .filter((field) => !BASE_RULE_FIELDS.has(field))
    .sort();
}

function nonDeterministicCompilerStatus(checkType) {
  if (checkType === 'manual') return 'manual';
  if (checkType === 'llm' || checkType === 'contextual') return 'advisory';
  return 'non-executable';
}

function classifyUnsupportedGap(structuredFields, candidateCapabilities) {
  const operators = candidateCapabilities.operators || [];
  const missesRuntimeOperator = operators.some((operator) =>
    UNRATIFIED_RUNTIME_OPERATORS.has(operator),
  );
  if (structuredFields.length) {
    return missesRuntimeOperator
      ? 'structured-fields-missing-runtime-operator'
      : 'structured-fields-unmapped';
  }
  if (missesRuntimeOperator) return 'prose-missing-runtime-operator';
  if (!operators.includes('author-structured-assertion')) return 'prose-existing-operator';
  return 'prose-unclassified';
}

function executionPolicyRoutes(policy) {
  const result = new Map();
  if (!policy) return result;
  for (const ruleId of policy.predicateRules || []) result.set(ruleId, 'predicate');
  for (const [field, route] of [
    ['compositionRules', 'composition'],
    ['delegatedRules', 'delegated'],
    ['policyRules', 'policy'],
    ['contextOnlyRules', 'context-only'],
  ]) {
    for (const entry of policy[field] || []) result.set(entry.sourceRuleId, route);
  }
  return result;
}

function summarizePackages(packages) {
  return packages.reduce((summary, entry) => {
    summary.packages += 1;
    summary.rules += entry.rules.length;
    for (const [decision, count] of Object.entries(entry.summary.decisions)) {
      summary.decisions[decision] += count;
    }
    for (const [readiness, count] of Object.entries(entry.summary.readiness)) {
      summary.readiness[readiness] = (summary.readiness[readiness] || 0) + count;
    }
    return summary;
  }, {
    packages: 0,
    rules: 0,
    decisions: Object.fromEntries(Array.from(DECISIONS).map((decision) => [decision, 0])),
    readiness: {},
  });
}

function summarizeRules(rules) {
  const result = {
    total: rules.length,
    decisions: Object.fromEntries(Array.from(DECISIONS).map((decision) => [decision, 0])),
    readiness: {},
  };
  for (const rule of rules) {
    result.decisions[rule.decision] += 1;
    result.readiness[rule.readiness] = (result.readiness[rule.readiness] || 0) + 1;
  }
  return result;
}

function buildWaveManifest(firstWave, supportingPackages) {
  return {
    schemaVersion: 'apollo.contract-v2-migration-wave.v1',
    waveId: 'wave-1-no-new-operators',
    status: 'ready-for-shadow-parity',
    policy: {
      selection: 'Ready Corp packages with zero blocking unsupported deterministic rules; an unsupported legacy RuleIR entry is allowed only when the source rule has predicateContour and an explicit production predicate route.',
      runtime: 'Experimental, default-off and non-production-enforcing.',
      proseInference: 'forbidden',
      unknownEvidence: 'never-violation',
    },
    readyPackages: firstWave.map(waveEntry),
    supportingPackages: supportingPackages.map(waveEntry),
  };
}

function waveEntry(entry) {
  return {
    packageId: entry.packageId,
    sourcePath: entry.sourcePath,
    contractPath: entry.contractPath,
    contractRulesSourceFile: entry.contractRulesSourceFile,
    executionPolicyPath: normalizePath(path.join(path.dirname(entry.contractPath), '..', 'execution-policy.json')),
    deterministicRules: entry.summary.decisions.deterministic,
    agentRules: entry.summary.decisions['agent-required'],
    humanReviewRules: entry.summary.decisions['human-review'],
    policyOnlyRules: entry.summary.decisions['policy-only'],
    unresolvedRules: entry.summary.decisions.unresolved,
    productionPredicateBridgeRuleIds: entry.productionPredicateBridgeRuleIds,
    blockingUnsupportedRuleIds: entry.blockingUnsupportedRuleIds,
  };
}

function writePackagePolicy(entry) {
  const target = path.join(
    EXPERIMENT_ROOT,
    path.dirname(entry.contractPath),
    '..',
    'execution-policy.json',
  );
  writeJson(target, {
    schemaVersion: 'apollo.component-contract-v2-execution-policy.v1',
    packageId: entry.packageId,
    status: entry.closureStatus,
    migrationEligibility: entry.migrationEligibility,
    sourcePath: entry.sourcePath,
    contractPath: entry.contractPath,
    summary: entry.summary,
    rules: entry.rules.map((rule) => ({
      sourceRuleId: rule.sourceRuleId,
      decision: rule.decision,
      readiness: rule.readiness,
      compilerStatus: rule.compilerStatus,
      compilerRuleIds: rule.compilerRuleIds,
      policyRoute: rule.policyRoute,
      gapKind: rule.gapKind,
    })),
  });
}

function buildMarkdown(report) {
  const decisions = Object.entries(report.readySummary.decisions)
    .map(([decision, count]) => `- ${decision}: ${count}`)
    .join('\n');
  const firstWave = report.firstWave.readyPackageIds
    .map((packageId) => `- \`${packageId}\``)
    .join('\n');
  const packageRows = report.packages
    .filter((entry) => entry.inventoryStatus === 'ready-corp')
    .map((entry) => `| \`${entry.packageId}\` | ${entry.compilerCoverage.executableDeterministicSourceRules}/${entry.compilerCoverage.deterministicSourceRules} | ${entry.summary.decisions.deterministic} | ${entry.summary.decisions['agent-required']} | ${entry.summary.decisions['human-review']} | ${entry.summary.decisions.unresolved} | ${entry.migrationEligibility} |`)
    .join('\n');
  return `# Contract v2 rule execution classification\n\nThis report classifies source rules without normalizing them or inferring executable semantics from prose.\n\n## Ready Corp summary\n\n- packages: ${report.readySummary.packages}\n- rules: ${report.readySummary.rules}\n${decisions}\n\n\`deterministic\` means either executable now or backed by explicit structured assertion fields.\n\`agent-required\` is used only for rules explicitly authored as \`llm\` or \`contextual\`.\nProse-only rules labelled deterministic remain \`unresolved\` until an owner chooses typed authoring or an agent route.\n\n## First migration wave\n\nThe first wave requires no new runtime operators and is ready only for shadow parity:\n\n${firstWave}\n\n## Ready packages\n\n| Package | Executable deterministic | Deterministic decision | Agent | Human | Unresolved | Eligibility |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n${packageRows}\n`;
}

function uniqueRules(document) {
  const byId = new Map();
  for (const rule of (((document || {}).generated || {}).rules || [])
    .concat((((document || {}).manual || {}).rules || []))) {
    byId.set(rule.ruleId, rule);
  }
  return Array.from(byId.values()).sort((left, right) => left.ruleId.localeCompare(right.ruleId));
}

function emptyCapabilities() {
  return { selectors: [], facts: [], operators: [], remediations: [] };
}

function normalizePath(value) {
  return String(value).split(path.sep).join('/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, 'utf8');
}

main();
