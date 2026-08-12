#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPERIMENT_ROOT = path.join(
  REPO_ROOT,
  'JSONS/experiments/component-contract-v2',
);
const TITLE_VIEW_BUILDER = path.join(
  __dirname,
  'build_title_view_contract_v2_experiment.js',
);
const INVENTORY_PATH = path.join(
  EXPERIMENT_ROOT,
  'ready-corp-components.inventory.json',
);
const READY_PACKAGE_ANALYZER = path.join(
  __dirname,
  'analyze_component_contract_v2_ready_packages.js',
);
const SCHEMA_REGISTRY_BUILDER = path.join(
  __dirname,
  'build_component_contract_v2_schema_registry.js',
);
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

const PACKAGE_PROFILE_OVERRIDES = {
  'web-corp/BackgroundPlate': {
    packageId: 'web-corp.background-plate',
  },
  'web-corp/ButtonGroup [D]': {
    targetName: 'ButtonsGroup',
    packageId: 'web-corp.buttons-group',
    compositionRuleSources: {
      'buttons-group.composition:button-count': [
        'component:web-corp.buttons-group.minimum-two-buttons',
        'component:web-corp.buttons-group.visible-button-limit',
      ],
      'buttons-group.composition:uniform-size': [
        'component:web-corp.buttons-group.uniform-size',
      ],
      'buttons-group.composition:primary-position': [
        'component:web-corp.buttons-group.primary-is-first-and-unique',
      ],
      'buttons-group.composition:single-icon-position': [
        'component:web-corp.buttons-group.single-icon-is-last',
      ],
    },
  },
  'web-corp/AmountStyles': {
    packageId: 'web-corp.amount-styles',
  },
  'web-corp/CardImage': {
    packageId: 'web-corp.card-image',
    compositionRuleSources: {
      'card-image.silver-line-large:silver-line-type': [
        'component:web-corp.card-image.silver-line-follows-size',
      ],
      'card-image.silver-line-medium-small:silver-line-type': [
        'component:web-corp.card-image.silver-line-follows-size',
      ],
      'card-image.silver-line-xs:silver-line-hidden': [
        'component:web-corp.card-image.silver-line-follows-size',
      ],
    },
  },
  'web-corp/ButtonStack [M]': {
    packageId: 'web-corp.button-stack',
    compositionRuleSources: {
      'button-stack.primary:button-count': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.primary:button-view-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.secondary:button-count': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.secondary:button-view-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.group-horizontal:button-count': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.group-horizontal:button-view-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.group-vertical:button-count': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.group-vertical:button-view-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.primary-icon:button-count': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.primary-icon:button-view-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.primary-icon:single-icon-order': [
        'component:web-corp.button-stack.preset-composition-is-fixed',
      ],
      'button-stack.information-addon:status-size': [
        'component:web-corp.button-stack.option-information-addon-is-fixed',
      ],
      'button-stack.information-addon:status-view': [
        'component:web-corp.button-stack.option-information-addon-is-fixed',
      ],
    },
  },
  'web-corp/Table Basic [D]': {
    packageId: 'web-corp.table-basic',
    compositionRuleSources: {
      'table-basic.body-row.cells:visible-data-cell-count': [
        'component:web-corp.table-basic-d.use-basic-for-simple-table',
        'component:web-corp.table-basic-d.keep-one-visible-column',
      ],
    },
  },
};

const SUPPLEMENTAL_PACKAGE_PROFILES = readJson(
  path.join(EXPERIMENT_ROOT, 'supplemental-packages.json'),
).packages;

const BASELINE_RULE_SUFFIXES = new Set([
  'layer-properties-use-effective-baseline',
  'geometry-follows-effective-baseline',
  'visual-and-layout-baseline-is-fixed',
  'spacing-uses-effective-baseline',
]);

const CLASSIFICATION_RULE_SUFFIXES = new Set([
  'component-properties-are-first-class',
  'background-plate-view-is-alias',
  'padding-is-designer-controlled',
  'slot-auto-layout-is-context-controlled',
  'slot-clipping-is-context-controlled',
  'blur-is-context-controlled',
  'border-stroke-weight-is-context-controlled',
]);

const UNRATIFIED_RUNTIME_OPERATORS = new Set([
  'numericFormat',
  'statePolicy',
  'visibilityPolicy',
]);

function main() {
  require('child_process').execFileSync(process.execPath, [TITLE_VIEW_BUILDER], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
  });

  const packageResults = [readTitleViewResult()];
  for (const profile of readInventoryProfiles()) {
    if (profile.sourceLibrary === 'web-corp' && profile.sourceName === 'TitleView') continue;
    packageResults.push(buildPackageExperiment(profile));
  }

  const matrix = buildCapabilityMatrix(packageResults);
  writeJson(path.join(EXPERIMENT_ROOT, 'capability-matrix.json'), matrix);
  writeJson(
    path.join(EXPERIMENT_ROOT, 'runtime-index.json'),
    buildExperimentalRuntimeIndex(packageResults),
  );
  writeText(path.join(EXPERIMENT_ROOT, 'README.md'), buildRootReadme(matrix));
  writeText(
    path.join(EXPERIMENT_ROOT, 'capability-gap-report.md'),
    buildCapabilityGapReport(matrix, packageResults),
  );
  require('child_process').execFileSync(process.execPath, [READY_PACKAGE_ANALYZER], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
  });
  require('child_process').execFileSync(process.execPath, [SCHEMA_REGISTRY_BUILDER], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
  });

  console.log(JSON.stringify({
    experimentRoot: path.relative(REPO_ROOT, EXPERIMENT_ROOT),
    packages: packageResults.map((result) => ({
      packageId: result.packageId,
      rules: result.contract.rules.length,
      coverage: result.coverage.summary,
    })),
    totals: matrix.totals,
    saturation: matrix.saturation,
  }, null, 2));
}

function buildPackageExperiment(profile) {
  const sourceDir = path.join(
    REPO_ROOT,
    'JSONS/web/components',
    profile.sourceLibrary,
    profile.sourceName,
  );
  const targetDir = path.join(
    EXPERIMENT_ROOT,
    profile.sourceLibrary,
    profile.targetName,
  );
  const compiledDir = path.join(targetDir, 'compiled');
  ensurePackage(sourceDir);
  fs.mkdirSync(compiledDir, { recursive: true });
  removeGeneratedDirectory(path.join(targetDir, 'source'));
  removeGeneratedDirectory(path.join(targetDir, 'schemas'));

  const generatedContract = readJson(path.join(sourceDir, 'contract.generated.json'));
  const compositionDocument = readJson(path.join(sourceDir, 'composition-contract.json'));
  const rulesDocument = readJson(path.join(sourceDir, 'rules.json'));
  const sourceRules = uniqueRules(rulesDocument);
  const sourceRuleById = new Map(sourceRules.map((rule) => [rule.ruleId, rule]));
  const componentKeyFamilies = buildComponentKeyFamilies(generatedContract);
  const compositionRules = compileCompositionRules(
    compositionDocument,
    profile,
    sourceRuleById,
    componentKeyFamilies,
  );
  const inferred = sourceRules.map((rule) => inferSourceRule(rule, profile));
  const executableSourceRules = inferred.filter((entry) => entry.status === 'executable');
  const compositionCoveredSourceRuleIds = new Set(
    compositionRules.flatMap((rule) => rule.source.sourceRuleIds || []),
  );
  const compiledSourceRules = executableSourceRules
    .filter((entry) => !compositionCoveredSourceRuleIds.has(entry.sourceRuleId))
    .flatMap((entry) =>
    expandUniformPropertyRules(entry.rule, sourceRuleById.get(entry.sourceRuleId)),
    );
  const rules = ensureUniqueRuleIds([buildComponentApiRule(profile)]
    .concat(compositionRules, compiledSourceRules));
  const coverage = buildCoverage(sourceRules, rules, inferred);
  const selectors = buildSelectors(
    generatedContract,
    compositionDocument,
    sourceRules,
    componentKeyFamilies,
  );
  const contractOwnership = buildContractOwnership(compositionDocument, profile);
  const sourceFiles = sourceManifest(sourceDir);

  const contract = {
    schemaVersion: 'apollo.component-contract.v2-experimental',
    documentType: 'component-contract',
    status: 'experimental',
    runtimePolicy: {
      consumedByApollo: false,
      publishedToRuntimeIndexes: false,
      purpose: 'Cross-component RuleIR capability discovery',
    },
    package: {
      id: profile.packageId,
      family: profile.targetName,
      library: generatedContract.source.library,
      sourcePath: `JSONS/web/components/${profile.sourceLibrary}/${profile.sourceName}`,
      sourceGeneratedAt: generatedContract.source.generatedAt,
      sourceExportVersion: generatedContract.source.exportVersion,
      sourceFiles,
    },
    capabilities: aggregateCapabilities(rules, inferred),
    facts: {
      componentApi: generatedContract.contracts.map((entry) => compactComponentApi(entry, profile)),
      selectors,
      baseline: {
        source: `${sourceFile(profile, 'composition-contract.json')}#/manual/standaloneBaselines`,
        resolution: 'effective-component-variant-and-owner-context',
      },
      ...(contractOwnership ? { contractOwnership } : {}),
    },
    rules,
    nonExecutableRules: coverage.rules
      .filter((entry) => entry.status !== 'executable')
      .map((entry) => ({
        sourceRuleId: entry.sourceRuleId,
        sourceCheckType: entry.sourceCheckType,
        status: entry.status,
        reason: entry.reason,
        structuredFields: entry.structuredFields,
        candidateCapabilities: entry.candidateCapabilities,
      })),
    coverage: {
      summary: coverage.summary,
      report: '../coverage.json',
    },
  };

  validateContract(contract);
  writeJson(path.join(compiledDir, 'component-contract.v2.json'), contract);
  writeJson(path.join(targetDir, 'coverage.json'), coverage);
  writeText(path.join(targetDir, 'README.md'), buildPackageReadme(contract, coverage));

  return {
    packageId: profile.packageId,
    contract,
    coverage,
    contractPath: path.relative(
      EXPERIMENT_ROOT,
      path.join(compiledDir, 'component-contract.v2.json'),
    ),
  };
}

function buildContractOwnership(compositionDocument, profile) {
  const source = compositionDocument.manual && compositionDocument.manual.contractOwnership;
  if (!source) return null;
  if (!Array.isArray(source.nestedPackages)) {
    throw new Error(`${profile.packageId}: contractOwnership.nestedPackages must be an array`);
  }
  const nestedPackages = source.nestedPackages.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${profile.packageId}: nested package ownership ${index} must be an object`);
    }
    if (typeof entry.packageId !== 'string' || !entry.packageId.trim()) {
      throw new Error(`${profile.packageId}: nested package ownership ${index} has no packageId`);
    }
    if (entry.mode !== 'host-contract') {
      throw new Error(`${profile.packageId}: unsupported nested package ownership mode ${entry.mode}`);
    }
    return {
      packageId: entry.packageId.trim(),
      mode: entry.mode,
      ...(typeof entry.reason === 'string' && entry.reason.trim()
        ? { reason: entry.reason.trim() }
        : {}),
    };
  });
  const packageIds = nestedPackages.map((entry) => entry.packageId);
  if (new Set(packageIds).size !== packageIds.length) {
    throw new Error(`${profile.packageId}: duplicate nested package ownership`);
  }
  return {
    source: `${sourceFile(profile, 'composition-contract.json')}#/manual/contractOwnership`,
    nestedPackages,
  };
}

function readInventoryProfiles() {
  const inventory = readJson(INVENTORY_PATH);
  const inventoryProfiles = inventory.packages.map((entry) => {
    const override = PACKAGE_PROFILE_OVERRIDES[`${entry.library}/${entry.name}`] || {};
    return {
      sourceName: entry.name,
      sourceLibrary: entry.library,
      targetName: override.targetName || entry.name,
      packageId: override.packageId || `${entry.library}.${slugify(entry.name)}`,
      compositionRuleSources: override.compositionRuleSources || {},
    };
  });
  const existingIds = new Set(inventoryProfiles.map((profile) => profile.packageId));
  return inventoryProfiles.concat(
    SUPPLEMENTAL_PACKAGE_PROFILES.filter((profile) => !existingIds.has(profile.packageId)),
  );
}

function inferSourceRule(rule, profile) {
  if (rule.checkType !== 'deterministic') {
    return discoveryEntry(
      rule,
      rule.checkType === 'manual' ? 'manual' : 'advisory',
      null,
      candidateCapabilities(rule),
      `Source checkType is ${rule.checkType || 'unspecified'}.`,
    );
  }

  const inference = inferAssertion(rule);
  if (!inference.executable) {
    return discoveryEntry(
      rule,
      'unsupported',
      null,
      inference.capabilities,
      inference.reason,
    );
  }

  const assertion = normalizeAssertionForProfile(
    inference.assertion,
    rule,
    profile,
  );
  const capabilities = mergeCapabilitySets(
    inference.capabilities,
    {
      selectors: ['component-identity', 'self-and-descendants'],
      facts: factsForRule(rule),
      operators: [assertion.op],
      remediations: remediationCapabilities(rule),
    },
  );
  const targetRule = {
    id: `rule-ir:${profile.packageId}.${ruleSuffix(rule.ruleId)}`,
    source: {
      file: sourceFile(profile, 'rules.json'),
      sourceRuleIds: [rule.ruleId],
      patternRuleId: rule.patternRuleId || null,
    },
    severity: normalizeSeverity(rule.severity),
    enforcement: inference.enforcement,
    select: selectorForRule(rule),
    when: normalizeConditions(rule.conditions, rule),
    assert: assertion,
    verdict: inference.enforcement === 'classification'
      ? { pass: 'allowed', fail: 'unknown', unknown: 'unknown' }
      : { pass: 'expected', fail: 'violation', unknown: 'unknown' },
    evidence: capabilities.facts,
    remediation: normalizeRemediation(rule.remediation),
    presentation: {
      message: rule.ruleText,
      group: rule.appliesTo || 'component',
    },
    capabilities,
  };
  validateRuleTargetSelector(rule, targetRule.select, profile.packageId);
  return discoveryEntry(
    rule,
    'executable',
    targetRule,
    capabilities,
    'Structured source fields map to typed RuleIR capabilities.',
  );
}

function validateRuleTargetSelector(sourceRule, select, packageId) {
  const expectedComponents = targetComponentsForRule(sourceRule);
  if (expectedComponents.length && typeof select.host === 'string') {
    throw new Error(`${packageId}: ${sourceRule.ruleId} lost target component scope`);
  }
  const expectedTargets = uniqueSorted(
    targetLayersForRule(sourceRule)
      .concat(targetSlotsForRule(sourceRule), targetPlaceholdersForRule(sourceRule)),
  );
  if (!expectedTargets.length) return;
  if (typeof select.targets === 'string') {
    throw new Error(`${packageId}: ${sourceRule.ruleId} lost semantic target scope`);
  }
  if (expectedTargets.length === 1 && expectedTargets[0] === 'root') {
    if (select.targets.scope !== 'selection-root') {
      throw new Error(`${packageId}: ${sourceRule.ruleId} root target is not selection-root`);
    }
    return;
  }
  const compiledTargets = select.targets.where?.semanticRoleOrLayerName?.values || [];
  for (const target of expectedTargets) {
    if (!compiledTargets.includes(target)) {
      throw new Error(`${packageId}: ${sourceRule.ruleId} lost semantic target ${target}`);
    }
  }
}

function normalizeAssertionForProfile(assertion, rule, profile) {
  if (
    profile.packageId !== 'web-corp.table-wide' ||
    assertion.op !== 'matchesEffectiveBaseline' ||
    !Array.isArray(assertion.properties) ||
    !assertion.properties.includes('layout.*')
  ) {
    return assertion;
  }

  // Wide data columns intentionally allow width and alignment overrides. Keep
  // their remaining layout baseline strict; fixed edge widths are enforced by
  // the dedicated edge-cell-widths rule.
  return {
    ...assertion,
    properties: assertion.properties.flatMap((property) =>
      property === 'layout.*'
        ? [
            'layout.height',
            'layout.padding.*',
            'layout.itemSpacing',
            'layout.sizing.vertical',
          ]
        : [property],
    ),
  };
}

function inferAssertion(rule) {
  const suffix = ruleSuffix(rule.ruleId);
  if (
    suffix === 'graphic-override-base-only' &&
    rule.allowedWhen &&
    rule.allowedWhen['variant.View'] === 'Base'
  ) {
    return executable('configurationPolicy', {
      manualComponentPropertiesAllowed: false,
      includeDescendants: true,
    });
  }
  if (
    suffix === 'center-alignment-protected' &&
    rule.expected === 'CENTER'
  ) {
    return executable('propertiesEqual', {
      values: {
        'text.align.horizontal': rule.expected,
      },
    });
  }
  if (
    suffix === 'buttons-count-and-views' &&
    rule.constraints &&
    Array.isArray(rule.constraints.allowedViews) &&
    rule.constraints.allowedViews.length > 0
  ) {
    const inferred = executable('allMatch', {
      predicate: {
        op: 'oneOf',
        fact: 'target.variant.View',
        values: rule.constraints.allowedViews,
      },
    });
    inferred.capabilities.operators.push('oneOf');
    return inferred;
  }
  if (
    rule.scope === 'root-and-all-internal-layers' &&
    typeof rule.baselinePolicy === 'string' &&
    rule.baselinePolicy.length > 0
  ) {
    return executable(
      'matchesEffectiveBaseline',
      baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
    );
  }
  if (Array.isArray(rule.allowedBaselineOverrides)) {
    return executable(
      'matchesEffectiveBaseline',
      baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
    );
  }
  if (
    rule.conditions &&
    Array.isArray(rule.conditions.uniformProperties) &&
    rule.conditions.uniformProperties.length > 0
  ) {
    return executable('allEqual', {
      facts: rule.conditions.uniformProperties.map((property) => `variant.${property}`),
    });
  }
  if (rule.requiredVariant) {
    return executable('propertiesEqual', { values: rule.requiredVariant });
  }
  if (isDirectVariantState(rule)) {
    return executable('propertiesEqual', { values: rule.requiredState });
  }
  if (isDirectLayoutRequirement(rule)) {
    return executable('propertiesEqual', { values: normalizeLayoutValues(rule.requiredLayout) });
  }
  if (Array.isArray(rule.requiredOrder) && rule.requiredOrder.length > 1) {
    return executable('relativeOrder', { values: rule.requiredOrder, ignoreMissing: true });
  }
  if (Array.isArray(rule.forbiddenWidthOverride) && rule.forbiddenWidthOverride.length) {
    return executable('matchesEffectiveBaseline', { properties: ['layout.width'] });
  }
  if (rule.requiredMapping) {
    return executable('valueByContext', { mapping: rule.requiredMapping });
  }
  if (rule.requiredPaintState) {
    if (
      Object.values(rule.requiredPaintState).length > 0 &&
      Object.values(rule.requiredPaintState).every((value) => value === 'effective-baseline')
    ) {
      return executable(
        'matchesEffectiveBaseline',
        baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
      );
    }
    return executable('paintStateEquals', { state: rule.requiredPaintState });
  }
  if (rule.requiredTokenBinding) {
    return executable('boundToTokenByVariant', rule.requiredTokenBinding);
  }
  if (rule.requiredTokenSource) {
    return executable('boundToTokenFromSource', rule.requiredTokenSource);
  }
  if (rule.requiredValues) {
    return executable('propertiesEqual', { values: rule.requiredValues });
  }
  if (rule.requiredFactRelation) {
    const relation = rule.requiredFactRelation;
    if (
      relation.op === 'equals' &&
      typeof relation.targetFact === 'string' &&
      typeof relation.hostFact === 'string'
    ) {
      const inferred = executable('allMatch', {
        predicate: {
          op: 'equalsFact',
          fact: relation.targetFact,
          expectedFact: relation.hostFact,
        },
      });
      inferred.capabilities.operators.push('equalsFact');
      return inferred;
    }
  }
  if (rule.requiredValue != null) {
    return rule.requiredValue === 'effective-baseline'
      ? executable(
          'matchesEffectiveBaseline',
          baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
        )
      : executable('propertiesEqual', {
          values: Object.fromEntries(
            splitAppliesTo(rule.appliesTo).map((property) => [
              property,
              rule.requiredValue,
            ]),
          ),
        });
  }
  if (rule.disallowedVariant) {
    return executable('notMatches', { values: rule.disallowedVariant });
  }
  if (rule.disallowedEffectTypes) {
    return executable('noneMatch', {
      fact: 'effects.type',
      values: rule.disallowedEffectTypes,
    });
  }
  if (rule.sharedValueConstraint) {
    return executable('allEqual', {
      facts: splitAppliesTo(rule.appliesTo),
      strategy: rule.sharedValueConstraint,
    });
  }
  if (rule.requiredConfiguration) {
    const assertion = { ...rule.requiredConfiguration };
    const variableCollections = splitAppliesTo(rule.appliesTo)
      .filter((property) => property.startsWith('variables.') && property.endsWith('.mode'))
      .map((property) => property.slice('variables.'.length, -'.mode'.length));
    if (variableCollections.length) assertion.variableCollections = variableCollections;
    return executable('configurationPolicy', assertion);
  }
  if (rule.requiredComposition) {
    if (rule.requiredComposition.sameBackgroundColorAcrossScope) {
      return executable('allEqual', { fact: 'variant.BackgroundColor', scope: 'page' });
    }
    return executable('compositionPolicy', rule.requiredComposition);
  }
  if (BASELINE_RULE_SUFFIXES.has(suffix)) {
    return executable(
      'matchesEffectiveBaseline',
      baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
    );
  }
  if (rule.classification && rule.classification.useEffectiveBaseline === true) {
    return executable(
      'matchesEffectiveBaseline',
      baselineAssertionParameters(rule, splitAppliesTo(rule.appliesTo)),
    );
  }
  if (CLASSIFICATION_RULE_SUFFIXES.has(suffix) || rule.classification) {
    return executable(
      'classificationPolicy',
      rule.classification || { classification: suffix },
      'classification',
    );
  }
  if (suffix.includes('component-property')) {
    return executable(
      'classificationPolicy',
      { classification: 'component-property', properties: splitAppliesTo(rule.appliesTo) },
      'classification',
    );
  }
  if (suffix === 'major-max-13-digits') {
    return executable('digitCountBetween', { min: 1, max: 13, ignore: ['group-separator'] });
  }
  if (suffix === 'minor-has-one-or-two-digits') {
    return executable('digitCountBetween', { min: 1, max: 2 });
  }
  if (suffix === 'parts-share-text-style') {
    return executable('allEqual', { fact: 'style.text' });
  }
  if (suffix === 'parts-share-color') {
    return executable('allEqual', { fact: 'paint.fill.effectiveValue' });
  }
  if (suffix === 'major-is-required') {
    return executable('requiredChild', { semanticRole: 'amount.major', min: 1 });
  }
  if (suffix === 'opacity-is-forbidden') {
    return executable('propertiesEqual', { values: { opacity: 1 } });
  }
  if (suffix === 'opacity-property-is-forbidden') {
    return executable('propertiesEqual', { values: { Opacity: 'False' } });
  }

  return {
    executable: false,
    reason: 'The source declares a deterministic rule but contains no structured assertion parameters.',
    capabilities: candidateCapabilities(rule),
  };
}

function expandUniformPropertyRules(targetRule, sourceRule) {
  const properties = sourceRule?.conditions?.uniformProperties;
  if (!Array.isArray(properties) || properties.length <= 1) return [targetRule];
  const runtimeWhen = stripUniformCompilationConditions(targetRule.when);
  return properties.map((property) => ({
    ...targetRule,
    id: `${targetRule.id}.${slugify(property)}`,
    when: runtimeWhen,
    assert: {
      op: 'allEqual',
      fact: `variant.${property}`,
    },
    presentation: {
      ...targetRule.presentation,
      group: `variant.${property}`,
    },
  }));
}

function stripUniformCompilationConditions(when) {
  if (when?.op !== 'all' || !when.clauses || typeof when.clauses !== 'object') {
    return when;
  }
  const clauses = Object.fromEntries(
    Object.entries(when.clauses).filter(([key]) =>
      key !== 'uniformProperties' && key !== 'allowedPerCardDifferences',
    ),
  );
  return Object.keys(clauses).length
    ? { ...when, clauses }
    : { op: 'evidenceComplete' };
}

function baselineAssertionParameters(rule, properties) {
  const parameters = { properties };
  if (rule.classification?.baselineSource === 'host-variant') {
    parameters.baselineSource = 'host-variant';
  }
  if (Array.isArray(rule.allowedBaselineOverrides) && rule.allowedBaselineOverrides.length) {
    parameters.allowedBaselineOverrides = rule.allowedBaselineOverrides;
  }
  return parameters;
}

function isDirectVariantState(rule) {
  if (!isFlatPrimitiveObject(rule.requiredState)) return false;
  if (!Object.keys(rule.requiredState).every((property) => /^[A-Z]/.test(property))) return false;
  const appliesTo = splitAppliesTo(rule.appliesTo);
  return appliesTo.length > 0 && appliesTo.every((property) => property.startsWith('variant.'));
}

function isDirectLayoutRequirement(rule) {
  if (!isFlatPrimitiveObject(rule.requiredLayout)) return false;
  return !Object.values(rule.requiredLayout).some((value) =>
    typeof value === 'string' && /effective baseline/i.test(value),
  );
}

function isFlatPrimitiveObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return false;
  return Object.values(value).every((item) => item == null || ['string', 'number', 'boolean'].includes(typeof item));
}

function normalizeLayoutValues(requiredLayout) {
  const aliases = { direction: 'layoutMode' };
  return Object.fromEntries(Object.entries(requiredLayout).map(([property, value]) => [
    aliases[property] || property,
    value,
  ]));
}

function executable(op, parameters, enforcement = 'enforced') {
  return {
    executable: true,
    enforcement,
    assertion: Object.assign({ op }, parameters),
    capabilities: {
      selectors: [],
      facts: [],
      operators: [op],
      remediations: [],
    },
  };
}

function compileCompositionRules(document, profile, sourceRuleById, componentKeyFamilies) {
  const result = [];
  for (const contract of document.manual.contracts || []) {
    for (const constraint of contract.constraints || []) {
      const key = `${contract.id}:${constraint.id}`;
      const sourceRuleIds = (profile.compositionRuleSources[key] || [])
        .filter((ruleId) => sourceRuleById.has(ruleId));
      const assertion = compileConstraint(constraint);
      const capabilities = compositionCapabilities(constraint);
      result.push({
        id: `rule-ir:${profile.packageId}.${contract.id}.${constraint.id}`,
        source: {
          file: sourceFile(profile, 'composition-contract.json'),
          sourceRuleIds,
        },
        severity: 'error',
        enforcement: 'enforced',
        select: {
          host: inlineHostSelector(contract.match, componentKeyFamilies),
          targets: inlineTargetSelector(contract.select, componentKeyFamilies),
        },
        when: contract.when && contract.when.variant
          ? { op: 'all', clauses: { hostVariant: contract.when.variant } }
          : { op: 'evidenceComplete' },
        assert: assertion,
        verdict: { pass: 'expected', fail: 'violation', unknown: 'unknown' },
        evidence: capabilities.facts,
        remediation: compositionRemediation(constraint),
        presentation: { message: constraint.message, group: 'component.composition' },
        capabilities,
      });
    }
    for (const policy of contract.subtreePropertyPolicies || []) {
      const capabilities = capability(
        ['component-identity', 'descendant'],
        ['variant.properties', 'diff.property', 'baseline.effective'],
        ['allowedPropertiesByVariant'],
        ['restore-effective-baseline'],
      );
      result.push({
        id: `rule-ir:${profile.packageId}.${contract.id}.${policy.id}`,
        source: { file: sourceFile(profile, 'composition-contract.json'), sourceRuleIds: [] },
        severity: 'error',
        enforcement: 'enforced',
        select: {
          host: inlineHostSelector(contract.match, componentKeyFamilies),
          targets: inlineTargetSelector(contract.select, componentKeyFamilies),
        },
        when: { op: 'evidenceComplete' },
        assert: {
          op: 'allowedPropertiesByVariant',
          variantProperty: policy.variantProperty,
          controlledProperties: policy.controlledProperties,
          allowedPropertiesByValue: policy.allowedPropertiesByValue,
        },
        verdict: { pass: 'expected', fail: 'violation', unknown: 'unknown' },
        evidence: capabilities.facts,
        remediation: { kind: 'restore-effective-baseline', target: '$failingTarget' },
        presentation: {
          passMessage: policy.allowedMessage,
          failMessage: policy.violationMessage,
          group: 'layer-properties',
        },
        capabilities,
      });
    }
  }
  return result;
}

function compileConstraint(constraint) {
  if (constraint.op === 'countBetween') {
    return { op: 'countBetween', min: constraint.min, max: constraint.max };
  }
  if (constraint.op === 'propertyDomain') {
    return {
      op: 'allMatch',
      predicate: { op: 'oneOf', fact: `target.variant.${constraint.property}`, values: constraint.values },
    };
  }
  if (constraint.op === 'propertyEqualsHost') {
    return {
      op: 'allMatch',
      predicate: {
        op: 'equalsFact',
        fact: `target.variant.${constraint.property}`,
        expectedFact: `host.variant.${constraint.hostProperty || constraint.property}`,
      },
    };
  }
  if (constraint.op === 'propertyEqualsFirst') {
    return { op: 'allEqual', fact: `target.variant.${constraint.property}` };
  }
  if (constraint.op === 'propertySequence') {
    return {
      op: 'sequenceEquals',
      fact: `target.variant.${constraint.property}`,
      values: constraint.values,
    };
  }
  if (constraint.op === 'valuePosition') {
    const assertion = {
      op: 'valuePosition',
      fact: `target.variant.${constraint.property}`,
      value: constraint.value,
      maxCount: constraint.maxCount == null ? null : constraint.maxCount,
    };
    if (Array.isArray(constraint.positions) && constraint.positions.length) {
      assertion.positions = constraint.positions;
    }
    if (typeof constraint.subjectLabel === 'string' && constraint.subjectLabel.trim()) {
      assertion.subjectLabel = constraint.subjectLabel.trim();
    }
    return assertion;
  }
  throw new Error(`Unsupported composition operator: ${constraint.op}`);
}

function compositionCapabilities(constraint) {
  const operators = {
    countBetween: ['countBetween'],
    propertyDomain: ['allMatch', 'oneOf'],
    propertyEqualsHost: ['allMatch', 'equalsFact'],
    propertyEqualsFirst: ['allEqual'],
    propertySequence: ['sequenceEquals'],
    valuePosition: ['valuePosition'],
  }[constraint.op];
  return capability(
    ['component-identity', 'descendant', 'visibility', 'document-order'],
    ['component.identity', 'variant.properties', 'node.visibility', 'node.documentOrder'],
    operators || [],
    constraint.op === 'countBetween' ? [] : ['set-variant-properties'],
  );
}

function compositionRemediation(constraint) {
  if (constraint.op === 'countBetween') return null;
  if (constraint.op === 'propertySequence') {
    return {
      kind: 'set-variant-properties',
      target: '$failingTarget',
      properties: { [constraint.property]: '$expectedValue' },
    };
  }
  const value = constraint.replacement
    || (constraint.values && constraint.values.length === 1 ? constraint.values[0] : null);
  return value
    ? {
        kind: 'set-variant-properties',
        target: '$failingTarget',
        properties: { [constraint.property]: value },
      }
    : null;
}

function buildComponentApiRule(profile) {
  const capabilities = capability(
    ['component-identity', 'self-and-descendants'],
    ['target.componentKey', 'target.variant.properties', 'component-api.contract'],
    ['componentApiValid'],
    ['set-variant-properties'],
  );
  return {
    id: `rule-ir:${profile.packageId}.component-api`,
    source: { file: sourceFile(profile, 'contract.generated.json'), sourceRuleIds: [] },
    severity: 'error',
    enforcement: 'enforced',
    select: { host: 'host.package', targets: 'tree.package-components' },
    when: { op: 'evidenceComplete' },
    assert: {
      op: 'componentApiValid',
      validate: ['known-properties', 'allowed-values', 'allowed-combinations'],
    },
    verdict: { pass: 'expected', fail: 'violation', unknown: 'unknown' },
    evidence: capabilities.facts,
    remediation: {
      kind: 'set-variant-properties',
      target: '$failingTarget',
      properties: '$nearestAllowedCombination',
    },
    presentation: { message: 'Component properties must match the published API.', group: 'component-properties' },
    capabilities,
  };
}

function buildSelectors(generatedContract, compositionDocument, sourceRules, componentKeyFamilies) {
  const componentKeys = uniqueSorted(
    generatedContract.contracts.flatMap(componentRoutingKeys),
  );
  const selectors = {
    'host.package': {
      scope: 'selection-root',
      where: { componentKey: { op: 'oneOf', values: componentKeys } },
    },
    'tree.package': {
      scope: 'self-and-descendants',
      from: 'host.package',
      occurrence: 'all',
      orderBy: 'document',
    },
    'tree.package-components': {
      scope: 'self-and-descendants',
      from: 'host.package',
      where: { componentKey: { op: 'oneOf', values: componentKeys } },
      occurrence: 'all',
      orderBy: 'document',
    },
  };
  const semanticLayers = uniqueSorted(sourceRules.flatMap((rule) =>
    rule.target && Array.isArray(rule.target.layers) ? rule.target.layers : [],
  ));
  if (semanticLayers.length) {
    selectors['tree.semantic-targets'] = {
      scope: 'descendants',
      from: 'host.package',
      where: { semanticRoleOrLayerName: { op: 'oneOf', values: semanticLayers } },
      occurrence: 'all',
      orderBy: 'document',
    };
  }
  for (const contract of compositionDocument.manual.contracts || []) {
    selectors[`composition.${contract.id}`] = inlineTargetSelector(
      contract.select,
      componentKeyFamilies,
    );
  }
  return selectors;
}

function selectorForRule(rule) {
  if (ruleSuffix(rule.ruleId) === 'graphic-override-base-only') {
    return {
      host: 'host.package',
      targets: {
        scope: 'descendants',
        from: '$host',
        where: {
          semanticRoleOrLayerName: { op: 'oneOf', values: ['Graphic'] },
          visible: { op: 'equals', value: true },
        },
        occurrence: 'all',
        orderBy: 'document',
      },
    };
  }
  if (ruleSuffix(rule.ruleId) === 'buttons-count-and-views') {
    return {
      host: 'host.package',
      targets: {
        scope: 'descendants',
        from: '$host',
        where: {
          semanticRoleOrLayerName: { op: 'oneOf', values: ['Button'] },
          visible: { op: 'equals', value: true },
        },
        occurrence: 'all',
        orderBy: 'document',
      },
    };
  }
  if (rule.scope === 'root-and-all-internal-layers') {
    return {
      host: 'host.package',
      targets: {
        scope: 'self-and-descendants',
        from: '$host',
        occurrence: 'all',
        orderBy: 'document',
      },
    };
  }
  const targetLayers = targetLayersForRule(rule);
  const targetComponents = targetComponentsForRule(rule);
  const targetSlots = targetSlotsForRule(rule);
  const targetPlaceholders = targetPlaceholdersForRule(rule);
  const semanticTargets = uniqueSorted(targetLayers.concat(targetSlots, targetPlaceholders));
  const targets = semanticTargets.length
    ? {
        scope: semanticTargets.length === 1 && semanticTargets[0] === 'root'
          ? 'selection-root'
          : 'self-and-descendants',
        from: '$host',
        ...(semanticTargets.length === 1 && semanticTargets[0] === 'root'
          ? {}
          : {
              where: {
                semanticRoleOrLayerName: { op: 'oneOf', values: semanticTargets },
              },
            }),
        occurrence: 'all',
        orderBy: 'document',
      }
    : 'tree.package';
  const host = targetComponents.length
    ? {
        scope: 'selection-root',
        where: {
          semanticRoleOrLayerName: { op: 'oneOf', values: targetComponents },
        },
      }
    : 'host.package';
  return { host, targets };
}

function targetLayersForRule(rule) {
  const values = [];
  if (rule.target && Array.isArray(rule.target.layers)) values.push(...rule.target.layers);
  if (rule.target && typeof rule.target.layer === 'string') values.push(rule.target.layer);
  if (Array.isArray(rule.forbiddenWidthOverride)) values.push(...rule.forbiddenWidthOverride);
  return uniqueSorted(values);
}

function targetComponentsForRule(rule) {
  const values = [];
  const hasExplicitStructuralTarget = rule.target && (
    rule.target.layer === 'root' ||
    (Array.isArray(rule.target.slots) && rule.target.slots.length > 0) ||
    (Array.isArray(rule.target.placeholders) && rule.target.placeholders.length > 0)
  );
  // Generated package rules use singular `target.component` as a family label,
  // while their actual hosts are any Component API members routed to the package.
  // Only structural rules make that singular component an exact host constraint.
  if (
    hasExplicitStructuralTarget &&
    rule.target &&
    typeof rule.target.component === 'string'
  ) {
    values.push(rule.target.component);
  }
  if (rule.target && Array.isArray(rule.target.components)) {
    values.push(...rule.target.components);
  }
  return uniqueSorted(values);
}

function targetSlotsForRule(rule) {
  return rule.target && Array.isArray(rule.target.slots)
    ? uniqueSorted(rule.target.slots)
    : [];
}

function targetPlaceholdersForRule(rule) {
  return rule.target && Array.isArray(rule.target.placeholders)
    ? uniqueSorted(rule.target.placeholders)
    : [];
}

function buildCoverage(sourceRules, executableRules, inferred) {
  const executableBySource = new Map();
  for (const rule of executableRules) {
    for (const sourceRuleId of rule.source.sourceRuleIds || []) {
      const ids = executableBySource.get(sourceRuleId) || [];
      ids.push(rule.id);
      executableBySource.set(sourceRuleId, ids);
    }
  }
  const inferredById = new Map(inferred.map((entry) => [entry.sourceRuleId, entry]));
  const rules = sourceRules.map((sourceRule) => {
    const targetRuleIds = uniqueSorted(executableBySource.get(sourceRule.ruleId) || []);
    const discovered = inferredById.get(sourceRule.ruleId);
    if (targetRuleIds.length) {
      return {
        sourceRuleId: sourceRule.ruleId,
        sourceCheckType: sourceRule.checkType || 'unspecified',
        status: 'executable',
        targetRuleIds,
        reason: discovered && discovered.reason
          ? discovered.reason
          : 'Covered by structured composition evidence.',
        structuredFields: discovered ? discovered.structuredFields : [],
        candidateCapabilities: discovered ? discovered.capabilities : emptyCapability(),
      };
    }
    return {
      sourceRuleId: sourceRule.ruleId,
      sourceCheckType: sourceRule.checkType || 'unspecified',
      status: discovered ? discovered.status : 'unsupported',
      targetRuleIds: [],
      reason: discovered ? discovered.reason : 'No inference result.',
      structuredFields: discovered ? discovered.structuredFields : structuredAssertionFields(sourceRule),
      candidateCapabilities: discovered ? discovered.capabilities : candidateCapabilities(sourceRule),
    };
  });
  const deterministic = rules.filter((rule) => rule.sourceCheckType === 'deterministic');
  const summary = {
    sourceRules: rules.length,
    deterministicSourceRules: deterministic.length,
    executableDeterministicSourceRules: deterministic.filter((rule) => rule.status === 'executable').length,
    promotedManualOrAdvisorySourceRules: rules.filter(
      (rule) => rule.sourceCheckType !== 'deterministic' && rule.status === 'executable',
    ).length,
    executable: rules.filter((rule) => rule.status === 'executable').length,
    advisory: rules.filter((rule) => rule.status === 'advisory').length,
    manual: rules.filter((rule) => rule.status === 'manual').length,
    unsupported: rules.filter((rule) => rule.status === 'unsupported').length,
  };
  summary.deterministicCoverageRatio = Number((
    summary.executableDeterministicSourceRules
    / Math.max(1, summary.deterministicSourceRules)
  ).toFixed(4));
  return { schemaVersion: 'apollo.rule-coverage.v1', summary, rules };
}

function buildCapabilityMatrix(packageResults) {
  const dimensions = ['selectors', 'facts', 'operators', 'remediations'];
  const matrix = {
    schemaVersion: 'apollo.capability-matrix.v1',
    packages: [],
    capabilities: {},
    saturation: [],
    totals: {},
    coverage: {},
  };
  const seen = Object.fromEntries(dimensions.map((dimension) => [dimension, new Set()]));
  for (const result of packageResults) {
    const required = result.contract.capabilities;
    const candidates = aggregateCoverageCandidates(result.coverage);
    const packageEntry = {
      packageId: result.packageId,
      coverage: result.coverage.summary,
      required,
      candidates,
    };
    matrix.packages.push(packageEntry);
    const novelty = { packageId: result.packageId };
    for (const dimension of dimensions) {
      const values = uniqueSorted((required[dimension] || []).concat(candidates[dimension] || []));
      novelty[dimension] = values.filter((value) => !seen[dimension].has(value));
      values.forEach((value) => seen[dimension].add(value));
    }
    matrix.saturation.push(novelty);
  }
  for (const dimension of dimensions) {
    const values = Array.from(seen[dimension]).sort();
    matrix.capabilities[dimension] = values.map((id) => ({
      id,
      packages: matrix.packages
        .filter((entry) => (entry.required[dimension] || []).includes(id)
          || (entry.candidates[dimension] || []).includes(id))
        .map((entry) => entry.packageId),
    }));
    matrix.totals[dimension] = values.length;
  }
  matrix.coverage = {
    packageCount: packageResults.length,
    sourceRules: sumCoverage(packageResults, 'sourceRules'),
    deterministicSourceRules: sumCoverage(packageResults, 'deterministicSourceRules'),
    executableDeterministicSourceRules: sumCoverage(packageResults, 'executableDeterministicSourceRules'),
    unsupported: sumCoverage(packageResults, 'unsupported'),
    fullCoveragePackages: packageResults
      .filter((result) => result.coverage.summary.deterministicCoverageRatio === 1)
      .map((result) => result.packageId),
  };
  matrix.coverage.unsupportedByGapKind = summarizeUnsupportedGapKinds(packageResults);
  matrix.coverage.deterministicCoverageRatio = Number((
    matrix.coverage.executableDeterministicSourceRules
    / Math.max(1, matrix.coverage.deterministicSourceRules)
  ).toFixed(4));
  return matrix;
}

function summarizeUnsupportedGapKinds(packageResults) {
  const totals = {
    'structured-fields-unmapped': 0,
    'structured-fields-missing-runtime-operator': 0,
    'prose-existing-operator': 0,
    'prose-missing-runtime-operator': 0,
    'prose-unclassified': 0,
  };
  for (const result of packageResults) {
    for (const entry of result.coverage.rules.filter((rule) => rule.status === 'unsupported')) {
      totals[classifyUnsupportedGap(entry)] += 1;
    }
  }
  return totals;
}

function classifyUnsupportedGap(entry) {
  const operators = (((entry || {}).candidateCapabilities || {}).operators || []);
  const hasStructuredFields = Array.isArray(entry.structuredFields) && entry.structuredFields.length > 0;
  const missesRuntimeOperator = operators.some((operator) => UNRATIFIED_RUNTIME_OPERATORS.has(operator));
  if (hasStructuredFields) {
    return missesRuntimeOperator
      ? 'structured-fields-missing-runtime-operator'
      : 'structured-fields-unmapped';
  }
  if (missesRuntimeOperator) return 'prose-missing-runtime-operator';
  if (!operators.includes('author-structured-assertion')) return 'prose-existing-operator';
  return 'prose-unclassified';
}

function sumCoverage(packageResults, field) {
  return packageResults.reduce((total, result) => total + (result.coverage.summary[field] || 0), 0);
}

function readTitleViewResult() {
  const targetDir = path.join(EXPERIMENT_ROOT, 'web-corp/TitleView');
  const contract = readJson(path.join(targetDir, 'compiled/component-contract.v2.json'));
  contract.capabilities = Object.assign(
    {},
    contract.capabilities,
    buildTitleViewCompatibleCapabilities(contract),
  );
  return {
    packageId: 'web-corp.title-view',
    contract,
    coverage: readJson(path.join(targetDir, 'coverage.json')),
    contractPath: path.relative(
      EXPERIMENT_ROOT,
      path.join(targetDir, 'compiled/component-contract.v2.json'),
    ),
  };
}

function buildExperimentalRuntimeIndex(packageResults) {
  const packages = packageResults
    .map((result) => ({
      id: result.packageId,
      family: result.contract.package.family,
      library: result.contract.package.library,
      contractPath: result.contractPath.split(path.sep).join('/'),
      componentKeys: uniqueSorted(
        result.contract.facts.componentApi.flatMap((entry) =>
          Array.isArray(entry.componentKeys) ? entry.componentKeys : [entry.componentKey],
        ),
      ),
      aliases: uniqueSorted(
        result.contract.facts.componentApi
          .map((entry) => entry.name)
          .concat(result.contract.package.family),
      ),
      coverage: {
        executableDeterministicSourceRules:
          result.coverage.summary.executableDeterministicSourceRules,
        deterministicSourceRules: result.coverage.summary.deterministicSourceRules,
        unsupported: result.coverage.summary.unsupported,
      },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  const componentKeys = new Set();
  for (const entry of packages) {
    for (const componentKey of entry.componentKeys) {
      if (componentKeys.has(componentKey)) {
        throw new Error(`Duplicate experimental component key: ${componentKey}`);
      }
      componentKeys.add(componentKey);
    }
  }

  return {
    schemaVersion: 'apollo.component-contract-index.v2-experimental',
    documentType: 'component-contract-index',
    status: 'experimental',
    runtimePolicy: {
      defaultEnabled: false,
      consumer: 'apollo-local-test-contour',
      unsupportedRule: 'skip-with-diagnostics',
      unknownEvaluation: 'never-violation',
    },
    baseUrl:
      'https://raw.githubusercontent.com/Ackedze/design-system_ab/main/JSONS/experiments/component-contract-v2/',
    generatedAt: packages
      .map((entry) => packageResults.find((result) => result.packageId === entry.id)
        ?.contract.package.sourceGeneratedAt)
      .filter(Boolean)
      .sort()
      .pop() || null,
    coverage: {
      packageCount: packages.length,
      componentKeyCount: componentKeys.size,
      deterministicSourceRules: sumCoverage(packageResults, 'deterministicSourceRules'),
      executableDeterministicSourceRules: sumCoverage(
        packageResults,
        'executableDeterministicSourceRules',
      ),
      unsupported: sumCoverage(packageResults, 'unsupported'),
    },
    packages,
  };
}

function aggregateCapabilities(rules, inferred) {
  const result = emptyCapability();
  for (const rule of rules) mergeInto(result, rule.capabilities);
  for (const entry of inferred.filter((item) => item.status === 'unsupported')) {
    mergeInto(result, { selectors: [], facts: [], operators: [], remediations: [] });
  }
  return {
    selectorVersion: 2,
    factModelVersion: 1,
    ruleIrVersion: 2,
    selectors: uniqueSorted(result.selectors),
    facts: uniqueSorted(result.facts),
    operators: uniqueSorted(result.operators),
    remediations: uniqueSorted(result.remediations),
    unknownCapabilityPolicy: 'unsupported-fail-closed',
    missingEvidencePolicy: 'unknown-never-violation',
  };
}

function aggregateCoverageCandidates(coverage) {
  const result = emptyCapability();
  for (const rule of coverage.rules.filter((entry) => entry.status === 'unsupported')) {
    mergeInto(result, rule.candidateCapabilities || emptyCapability());
  }
  return result;
}

function candidateCapabilities(rule) {
  const suffix = ruleSuffix(rule.ruleId);
  const suffixTokens = new Set(suffix.split('-').filter(Boolean));
  const operators = [];
  if (suffixTokens.has('order')) operators.push('relativeOrder');
  if (suffixTokens.has('required') && isRequiredChildCandidate(rule)) operators.push('requiredChild');
  if (suffixTokens.has('format') || suffixTokens.has('digits')) operators.push('numericFormat');
  if (suffixTokens.has('visibility')) operators.push('visibilityPolicy');
  if (suffixTokens.has('state')) operators.push('statePolicy');
  if (suffixTokens.has('fixed')) operators.push('matchesEffectiveBaseline');
  if (suffix.includes('component-property')) operators.push('classifyDiffDomain');
  return capability(
    ['component-identity', 'semantic-role', 'ancestry'],
    factsForRule(rule),
    operators.length ? operators : ['author-structured-assertion'],
    remediationCapabilities(rule),
  );
}

function isRequiredChildCandidate(rule) {
  const appliesTo = String(rule.appliesTo || '');
  if (/(^|\|)(variant\.|viewport|content\.fit)/.test(appliesTo)) return false;
  return /(^|\|)(structure\.|layers\.visible|content\.|component\.[A-Z\[]|text\.(Title|Subtitle)|instance\.)/.test(appliesTo);
}

function factsForRule(rule) {
  const text = String(rule.appliesTo || '');
  const facts = ['component.identity'];
  if (/variant/i.test(text)) facts.push('variant.properties');
  if (/fill|paint/i.test(text)) facts.push('paint.fill', 'variable.binding');
  if (/stroke/i.test(text)) facts.push('paint.stroke', 'variable.binding');
  if (/layout|width|height|size/i.test(text)) facts.push('layout.properties');
  if (/styles\.text|typograph/i.test(text)) facts.push('style.text');
  if (/text|content/i.test(text)) facts.push('text.characters');
  if (/opacity/i.test(text)) facts.push('opacity');
  if (/effect|blur|shadow/i.test(text)) facts.push('effects');
  if (/blend/i.test(text)) facts.push('blendMode');
  if (/component\.composition|component\.structure|component\.order/i.test(text)) {
    facts.push('semanticRole', 'ancestry', 'node.documentOrder');
  }
  if (/screen|responsive|page/i.test(text)) facts.push('page.context', 'node.bounds');
  if (/interaction|click|behavior/i.test(text)) facts.push('prototype.reactions');
  if (/baseline/i.test(rule.ruleId) || /effective baseline/i.test(rule.ruleText || '')) {
    facts.push('baseline.effective', 'ownership.owner');
  }
  return uniqueSorted(facts);
}

function remediationCapabilities(rule) {
  if (!rule.remediation) return [];
  const serialized = JSON.stringify(rule.remediation);
  const values = [];
  if (/variant/i.test(serialized)) values.push('set-variant-properties');
  if (/reset|baseline/i.test(serialized)) values.push('restore-effective-baseline');
  if (/token/i.test(serialized)) values.push('bind-variable');
  return values.length ? values : ['rule-defined-remediation'];
}

function selectorForTarget(target) {
  return target && target.layers ? 'semantic-role' : 'component-identity';
}

function normalizeConditions(conditions, rule) {
  if (
    ruleSuffix(rule.ruleId) === 'graphic-override-base-only' &&
    rule.allowedWhen &&
    rule.allowedWhen['variant.View'] === 'Base'
  ) {
    return {
      op: 'all',
      clauses: {
        except: {
          variant: { View: 'Base' },
        },
      },
    };
  }
  return conditions ? { op: 'all', clauses: conditions } : { op: 'evidenceComplete' };
}

function normalizeRemediation(remediation) {
  if (!remediation) return null;
  if (
    typeof remediation === 'object' &&
    !Array.isArray(remediation) &&
    remediation.kind === 'set-variant-properties' &&
    remediation.target === '$failingTarget' &&
    remediation.properties &&
    typeof remediation.properties === 'object' &&
    !Array.isArray(remediation.properties)
  ) {
    return remediation;
  }
  return { kind: 'rule-defined-remediation', specification: remediation };
}

function inlineHostSelector(match, componentKeyFamilies) {
  return {
    scope: 'selection-root',
    where: {
      componentKey: match.hostComponentKeys
        ? { op: 'oneOf', values: expandComponentKeys(match.hostComponentKeys, componentKeyFamilies) }
        : undefined,
      componentName: match.hostComponentNames
        ? { op: 'oneOf', values: match.hostComponentNames }
        : undefined,
    },
  };
}

function inlineTargetSelector(select, componentKeyFamilies) {
  return {
    scope: 'descendants',
    from: '$host',
    where: {
      componentKey: select.nestedComponentKeys
        ? { op: 'oneOf', values: expandComponentKeys(select.nestedComponentKeys, componentKeyFamilies) }
        : undefined,
      componentName: select.nestedComponentNames
        ? { op: 'oneOf', values: select.nestedComponentNames }
        : undefined,
      visible: select.visibility === 'all' ? undefined : { op: 'equals', value: true },
    },
    occurrence: 'all',
    orderBy: select.order || 'document',
  };
}

function buildComponentKeyFamilies(generatedContract) {
  const result = new Map();
  for (const contract of generatedContract.contracts || []) {
    const familyKeys = componentRoutingKeys(contract);
    for (const componentKey of familyKeys) result.set(componentKey, familyKeys);
  }
  return result;
}

function expandComponentKeys(componentKeys, componentKeyFamilies) {
  return uniqueSorted(componentKeys.flatMap((componentKey) =>
    componentKeyFamilies && componentKeyFamilies.get(componentKey)
      ? componentKeyFamilies.get(componentKey)
      : [componentKey],
  ));
}

function compactComponentApi(contract, profile) {
  const properties = Object.fromEntries(
    Object.entries(contract.figma.variants.properties || {})
      .filter(([property]) => property !== 'raw'),
  );
  const allowedCombinations = Object.keys(properties).length
    ? (contract.figma.variants.allowedCombinations || []).map((combination) =>
        Object.fromEntries(
          Object.entries(combination).filter(([property]) => property !== 'raw'),
        ),
      )
    : [];
  return {
    id: contract.id,
    name: contract.name,
    componentKey: contract.componentKey,
    componentKeys: componentRoutingKeys(contract),
    platform: contract.platform,
    status: contract.status,
    publicApi: {
      properties,
      allowedCombinations,
    },
    evidence: {
      source: sourceFile(profile, 'contract.generated.json'),
      anatomyCount: contract.figma.anatomy.length,
      structureNodeCount: contract.figma.structureSignature.length,
    },
  };
}

function componentRoutingKeys(contract) {
  return uniqueSorted([
    contract.componentKey,
    contract.figma && contract.figma.defaultVariantKey,
    ...(
      contract.figma && contract.figma.variants && Array.isArray(contract.figma.variants.variantKeys)
        ? contract.figma.variants.variantKeys.map((entry) => entry && entry.key)
        : []
    ),
  ].filter(Boolean));
}

function sourceFile(profile, fileName) {
  return `JSONS/web/components/${profile.sourceLibrary}/${profile.sourceName}/${fileName}`;
}

function validateContract(contract) {
  const ids = new Set();
  for (const rule of contract.rules) {
    if (ids.has(rule.id)) throw new Error(`Duplicate rule id: ${rule.id}`);
    ids.add(rule.id);
    if (!rule.assert || !rule.assert.op) throw new Error(`${rule.id}: missing assertion`);
    if (!rule.capabilities.operators.includes(rule.assert.op)) {
      throw new Error(`${rule.id}: assertion operator missing from capabilities`);
    }
    if (
      rule.assert.op === 'allEqual' &&
      rule.when?.op === 'all' &&
      (
        Object.prototype.hasOwnProperty.call(rule.when.clauses ?? {}, 'uniformProperties') ||
        Object.prototype.hasOwnProperty.call(rule.when.clauses ?? {}, 'allowedPerCardDifferences')
      )
    ) {
      throw new Error(`${rule.id}: compile-time uniform metadata leaked into runtime conditions`);
    }
  }
  const summary = contract.coverage.summary;
  if (summary.executableDeterministicSourceRules > summary.deterministicSourceRules) {
    throw new Error(`${contract.package.id}: invalid deterministic coverage`);
  }
}

function ensureUniqueRuleIds(rules) {
  const counts = new Map();
  for (const rule of rules) counts.set(rule.id, (counts.get(rule.id) || 0) + 1);
  const used = new Set();
  return rules.map((rule, index) => {
    if (counts.get(rule.id) === 1) {
      used.add(rule.id);
      return rule;
    }
    const sourceIdentity = JSON.stringify({
      file: rule.source && rule.source.file,
      sourceRuleIds: rule.source && rule.source.sourceRuleIds,
      index,
    });
    const suffix = crypto.createHash('sha256').update(sourceIdentity).digest('hex').slice(0, 10);
    let nextId = `${rule.id}.${suffix}`;
    let collision = 1;
    while (used.has(nextId)) nextId = `${rule.id}.${suffix}-${collision++}`;
    used.add(nextId);
    return Object.assign({}, rule, { id: nextId });
  });
}

function buildPackageReadme(contract, coverage) {
  return `# ${contract.package.family} component contract v2 experiment

This package is excluded from Apollo production enforcement and Athena production discovery.
Apollo may load it only through the manually enabled Contract v2 test contour.

- Source package: \`${contract.package.sourcePath}\`
- Component API facts: ${contract.facts.componentApi.length}
- Executable RuleIR entries: ${contract.rules.length}
- Deterministic coverage: ${coverage.summary.executableDeterministicSourceRules}/${coverage.summary.deterministicSourceRules}
- Unsupported deterministic rules: ${coverage.summary.unsupported}
- Manual rules: ${coverage.summary.manual}
- Advisory rules: ${coverage.summary.advisory}

Unsupported rules are intentional discovery results. Their candidate capabilities are recorded
in \`coverage.json\` and the root \`capability-matrix.json\`; they are never inferred from prose.
`;
}

function buildRootReadme(matrix) {
  const rows = matrix.packages.map((entry) =>
    `| ${entry.packageId} | ${entry.coverage.executableDeterministicSourceRules}/${entry.coverage.deterministicSourceRules} | ${entry.coverage.unsupported} |`,
  ).join('\n');
  return `# Component contract v2 capability experiments

These packages are isolated research artifacts. Athena production discovery and Apollo's default
runtime do not use them. The bootstrap manifest exposes only \`runtime-index.json\`, which Apollo
loads lazily after the user manually enables the Contract v2 test contour. The contour is disabled
on every plugin start and never falls back to prose or production schema-v1 decisions.

Only rules published as \`enforcement=enforced\` and fully supported by the versioned runtime
selector/operator vocabulary may produce a violation. Unsupported rules, missing evidence and
unknown evaluations are reported as diagnostics and never become violations.

Each Component API publishes \`componentKeys\` containing its canonical component-set key and every
known variant key. \`runtime-index.json\` indexes the complete union; package routing by a displayed
name or heuristic alias is forbidden.

The package inventory is a read-only snapshot of Google Sheets tab \`Corp components\`, range
\`A2:F101\`, filtered by \`Общий статус=Ready\` and \`Ready=10\`. It contains
${matrix.coverage.packageCount} packages. The spreadsheet selects the sample only; executable
semantics always come from the local component-package JSON files.

| Package | Deterministic coverage | Unsupported deterministic |
| --- | ---: | ---: |
${rows}

The union and per-package novelty of selectors, facts, operators and remediations is stored in
\`capability-matrix.json\`. Across the sample, ${matrix.coverage.executableDeterministicSourceRules}
of ${matrix.coverage.deterministicSourceRules} deterministic rules compile (${matrix.coverage.deterministicCoverageRatio});
${matrix.coverage.unsupported} remain unsupported. A source rule is executable only when its assertion
parameters are structured; prose is never promoted into runtime behavior.

\`ready-package-rule-profile.json\` separates runtime vocabulary from descriptive override-policy
paths and provides greedy saturation orders for both dimensions.
`;
}

function buildCapabilityGapReport(matrix, packageResults) {
  const dimensions = ['selectors', 'facts', 'operators', 'remediations'];
  const totals = dimensions
    .map((dimension) => `- ${dimension}: ${matrix.totals[dimension]}`)
    .join('\n');
  const saturation = matrix.saturation.map((entry) => {
    const additions = dimensions.map((dimension) => {
      const values = entry[dimension] || [];
      return values.length ? `${dimension}: ${values.join(', ')}` : `${dimension}: none`;
    }).join('; ');
    return `- \`${entry.packageId}\`: ${additions}`;
  }).join('\n');
  const gaps = packageResults.map((result) => {
    const unsupported = result.coverage.rules.filter((entry) => entry.status === 'unsupported');
    if (!unsupported.length) return `## ${result.packageId}\n\nNo unsupported deterministic rules.`;
    const rows = unsupported.map((entry) => {
      const operators = (entry.candidateCapabilities && entry.candidateCapabilities.operators) || [];
      return `| \`${entry.sourceRuleId}\` | ${classifyUnsupportedGap(entry)} | ${operators.join(', ') || 'not identified'} | ${entry.reason} |`;
    }).join('\n');
    return `## ${result.packageId}\n\n| Source rule | Gap kind | Candidate operator | Blocking reason |\n| --- | --- | --- | --- |\n${rows}`;
  }).join('\n\n');
  const gapCounts = Object.entries(matrix.coverage.unsupportedByGapKind)
    .map(([kind, count]) => `- ${kind}: ${count}`)
    .join('\n');
  return `# Component contract v2 capability gap report

This report distinguishes missing runtime vocabulary from missing structured rule authoring.
Candidate capabilities are discovery hints, not executable behavior.

## Current union

${totals}

## Unsupported classification

${gapCounts}

The classification separates source authoring from runtime support. Structured source fields are
reported independently from prose-only rules; candidate operators remain discovery hints.

## Capability novelty by package

${saturation}

## Unsupported deterministic rules

${gaps}

## Interpretation

- A rule with a structured assertion and known facts is compiled into RuleIR.
- A rule expressed only as prose remains unsupported even if its likely operator is known.
- Normalize \`structured-fields-unmapped\` rules before adding runtime capabilities.
- Specify and fixture every \`*-missing-runtime-operator\` rule before implementing its operator.
- Triage \`prose-unclassified\` rules into typed assertions, \`manual\` or \`llm\`; never infer
  enforcement from prose.
- Candidate operators must not be added to Apollo until at least one source rule defines their
  exact inputs, unknown-evidence behavior and violation output.
- The sample now covers every package marked Ready in the Corp components sheet. The next step is
  to normalize recurring structured assertion fields into a smaller versioned operator vocabulary,
  then re-author or downgrade unsupported deterministic rules explicitly.
`;
}

function buildTitleViewCompatibleCapabilities(contract) {
  const source = contract.capabilities;
  return {
    selectors: source.selectors || source.requiredSelectors || [],
    facts: source.facts || source.requiredFacts || [],
    operators: source.operators || source.requiredOperators || [],
    remediations: source.remediations || source.requiredRemediations || [],
  };
}

function mergeCapabilitySets(left, right) {
  const result = emptyCapability();
  mergeInto(result, left || emptyCapability());
  mergeInto(result, right || emptyCapability());
  return result;
}

function mergeInto(target, source) {
  for (const key of ['selectors', 'facts', 'operators', 'remediations']) {
    target[key] = uniqueSorted((target[key] || []).concat(source[key] || []));
  }
}

function capability(selectors, facts, operators, remediations) {
  return {
    selectors: uniqueSorted(selectors || []),
    facts: uniqueSorted(facts || []),
    operators: uniqueSorted(operators || []),
    remediations: uniqueSorted(remediations || []),
  };
}

function emptyCapability() {
  return capability([], [], [], []);
}

function discoveryEntry(rule, status, targetRule, capabilities, reason) {
  return {
    sourceRuleId: rule.ruleId,
    sourceCheckType: rule.checkType || 'unspecified',
    status,
    rule: targetRule,
    capabilities: capabilities || emptyCapability(),
    structuredFields: structuredAssertionFields(rule),
    reason,
  };
}

function structuredAssertionFields(rule) {
  return Object.keys(rule || {}).filter((field) => !BASE_RULE_FIELDS.has(field)).sort();
}

function normalizeSeverity(value) {
  if (value === 'warning' || value === 'info') return value;
  return 'error';
}

function ruleSuffix(ruleId) {
  return String(ruleId).split('.').pop();
}

function splitAppliesTo(value) {
  return String(value || '').split('|').map((item) => item.trim()).filter(Boolean);
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function uniqueRules(document) {
  const byId = new Map();
  for (const rule of (document.generated.rules || []).concat(document.manual.rules || [])) {
    byId.set(rule.ruleId, rule);
  }
  return Array.from(byId.values()).sort((left, right) => left.ruleId.localeCompare(right.ruleId));
}

function sourceManifest(sourceDir) {
  return SOURCE_FILES.map((fileName) => {
    const contents = fs.readFileSync(path.join(sourceDir, fileName));
    return {
      file: path.relative(REPO_ROOT, path.join(sourceDir, fileName)),
      bytes: contents.length,
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    };
  });
}

function ensurePackage(sourceDir) {
  for (const fileName of SOURCE_FILES) {
    if (!fs.existsSync(path.join(sourceDir, fileName))) {
      throw new Error(`Missing package file: ${path.join(sourceDir, fileName)}`);
    }
  }
}

function removeGeneratedDirectory(directory) {
  if (!directory.startsWith(`${EXPERIMENT_ROOT}${path.sep}`)) {
    throw new Error(`Refusing to remove a non-experiment directory: ${directory}`);
  }
  fs.rmSync(directory, { recursive: true, force: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, 'utf8');
}

function uniqueSorted(values) {
  return Array.from(new Set((values || []).filter(Boolean))).sort((left, right) =>
    String(left).localeCompare(String(right)),
  );
}

main();
