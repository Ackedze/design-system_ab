#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(
  REPO_ROOT,
  'JSONS/web/components/web-corp/TitleView',
);
const EXPERIMENT_DIR = path.join(
  REPO_ROOT,
  'JSONS/experiments/component-contract-v2/web-corp/TitleView',
);
const SOURCE_COPY_DIR = path.join(EXPERIMENT_DIR, 'source');
const COMPILED_DIR = path.join(EXPERIMENT_DIR, 'compiled');
const SCHEMA_DIR = path.join(EXPERIMENT_DIR, 'schemas');

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

const TITLE_VIEW_KEYS = {
  desktop: 'fbc4ff889c9fe2db128bc76471f512271d4cc229',
  mobile: '227149bd55130d69d63e33cd3c8c52ae3f4e7e19',
};

const TITLE_STATUS_KEYS = {
  desktop: '6a8aa56ae7c8b57b9d9dfbbf23af14c348d83763',
  mobile: 'e64c6d19cadc818b180b9176a51e3f65714b84b0',
};

function main() {
  assertSourcePackage();
  ensureDirectories();
  copySourcePackage();

  const generatedContract = readJson('contract.generated.json');
  const compositionContract = readJson('composition-contract.json');
  const rulesDocument = readJson('rules.json');
  const sourceRules = uniqueSourceRules(rulesDocument);
  const sourceRuleById = new Map(sourceRules.map((rule) => [rule.ruleId, rule]));

  const selectors = buildSelectors(generatedContract);
  const compositionRules = compileCompositionRules(compositionContract);
  const authoredRules = buildAuthoredRules(sourceRuleById);
  const executableRules = [buildComponentApiRule()]
    .concat(compositionRules, authoredRules);
  const coverage = buildCoverage(sourceRules, executableRules);
  const sourceFiles = buildSourceFileManifest();

  const contract = {
    schemaVersion: 'apollo.component-contract.v2-experimental',
    documentType: 'component-contract',
    status: 'experimental',
    runtimePolicy: {
      consumedByApollo: false,
      publishedToRuntimeIndexes: false,
      purpose: 'RuleIR v2 shape and compiler-capability validation',
    },
    package: {
      id: 'web-corp.title-view',
      family: 'TitleView',
      library: generatedContract.source.library,
      sourcePath: 'JSONS/web/components/web-corp/TitleView',
      sourceGeneratedAt: generatedContract.source.generatedAt,
      sourceExportVersion: generatedContract.source.exportVersion,
      sourceFiles,
    },
    capabilities: {
      selectorVersion: 2,
      factModelVersion: 1,
      ruleIrVersion: 2,
      selectors: uniqueSorted(
        executableRules.flatMap((rule) => rule.capabilities.selectors),
      ),
      facts: uniqueSorted(
        executableRules.flatMap((rule) => rule.capabilities.facts),
      ),
      operators: uniqueSorted(
        executableRules.flatMap((rule) => rule.capabilities.operators),
      ),
      remediations: uniqueSorted(
        executableRules.flatMap((rule) => rule.capabilities.remediations),
      ),
      unknownCapabilityPolicy: 'unsupported-fail-closed',
      missingEvidencePolicy: 'unknown-never-violation',
    },
    facts: {
      componentApi: generatedContract.contracts.map(compactComponentApi),
      selectors,
      baseline: {
        source: 'source/composition-contract.json#/manual/standaloneBaselines',
        resolution: 'effective-component-variant-and-owner-context',
      },
      ownership: {
        source: 'source/composition-contract.json#/manual/ownershipModel',
        nestedDiffPolicy: 'compare-against-component-effective-baseline',
      },
    },
    rules: executableRules,
    nonExecutableRules: coverage.rules
      .filter((entry) => entry.status !== 'executable')
      .map((entry) => ({
        sourceRuleId: entry.sourceRuleId,
        status: entry.status,
        reason: entry.reason,
        source: 'source/rules.json',
      })),
    coverage: {
      summary: coverage.summary,
      report: '../coverage.json',
    },
  };

  validateContract(contract);
  writeJson(path.join(COMPILED_DIR, 'component-contract.v2.json'), contract);
  writeJson(path.join(EXPERIMENT_DIR, 'coverage.json'), coverage);
  writeJson(
    path.join(SCHEMA_DIR, 'apollo-component-contract-v2.schema.json'),
    buildSchema(),
  );
  writeText(path.join(EXPERIMENT_DIR, 'README.md'), buildReadme(contract, coverage));

  console.log(JSON.stringify({
    experiment: path.relative(REPO_ROOT, EXPERIMENT_DIR),
    sourceFiles: sourceFiles.length,
    componentFacts: contract.facts.componentApi.length,
    selectors: Object.keys(selectors).length,
    executableRules: executableRules.length,
    coverage: coverage.summary,
    runtimeIndexed: false,
  }, null, 2));
}

function buildSelectors(generatedContract) {
  const packageComponentKeys = uniqueSorted(
    generatedContract.contracts.flatMap(componentRoutingKeys),
  );
  const desktopTitleViewKeys = routingKeysForContract(
    generatedContract,
    '[D] TitleView',
    TITLE_VIEW_KEYS.desktop,
  );
  const mobileTitleViewKeys = routingKeysForContract(
    generatedContract,
    '[M] TitleView',
    TITLE_VIEW_KEYS.mobile,
  );
  const titleViewKeys = uniqueSorted(desktopTitleViewKeys.concat(mobileTitleViewKeys));
  return {
    'host.title-view': {
      scope: 'selection-root',
      where: {
        componentKey: { op: 'oneOf', values: titleViewKeys },
      },
    },
    'host.title-view.desktop': {
      scope: 'selection-root',
      where: { componentKey: { op: 'oneOf', values: desktopTitleViewKeys } },
    },
    'host.title-view.mobile': {
      scope: 'selection-root',
      where: { componentKey: { op: 'oneOf', values: mobileTitleViewKeys } },
    },
    'descendant.status-preset': {
      scope: 'descendants',
      from: 'host.title-view',
      where: {
        visible: { op: 'equals', value: true },
        componentName: {
          op: 'oneOf',
          values: ['StatusPreset', '🔒 [D] StatusPreset', '🔒 [M] StatusPreset'],
        },
      },
      identityQuality: 'name-fallback-until-dependency-key-is-published',
      occurrence: 'all',
      orderBy: 'document',
    },
    'descendant.title-status': {
      scope: 'descendants',
      from: 'host.title-view',
      where: {
        visible: { op: 'equals', value: true },
        componentKey: { op: 'oneOf', values: Object.values(TITLE_STATUS_KEYS) },
      },
      occurrence: 'all',
      orderBy: 'document',
    },
    'descendant.button': {
      scope: 'descendants',
      from: 'host.title-view',
      where: {
        visible: { op: 'equals', value: true },
        componentName: { op: 'oneOf', values: ['[D] Button', '[M] Button'] },
        ancestorRole: { op: 'equals', value: 'slot.button-group' },
      },
      identityQuality: 'name-fallback-until-dependency-key-is-published',
      occurrence: 'all',
      orderBy: 'document',
    },
    'slot.status': slotSelector(['Status']),
    'slot.title': slotSelector(['Title']),
    'slot.subtitle': slotSelector(['Subtitle']),
    'slot.title-status': slotSelector(['TitleStatus']),
    'slot.button-group': slotSelector(['Button group']),
    'slot.structural': slotSelector([
      'Status',
      'Heading',
      'Holding',
      'Subtitle',
      'TitleStatus',
      'Button group',
    ]),
    'tree.title-view': {
      scope: 'self-and-descendants',
      from: 'host.title-view',
      occurrence: 'all',
      orderBy: 'document',
    },
    'tree.title-view-package-components': {
      scope: 'self-and-descendants',
      from: 'host.title-view',
      where: {
        componentKey: { op: 'oneOf', values: packageComponentKeys },
      },
      occurrence: 'all',
      orderBy: 'document',
    },
    'screen.title-view': {
      scope: 'page-descendants',
      where: {
        componentKey: { op: 'oneOf', values: titleViewKeys },
      },
      occurrence: 'all',
      orderBy: 'document',
    },
  };
}

function buildComponentApiRule() {
  return {
    id: 'rule-ir:title-view.component-api',
    source: {
      file: 'source/contract.generated.json',
      pointer: '/contracts',
      sourceRuleIds: [],
    },
    severity: 'error',
    enforcement: 'enforced',
    select: {
      host: 'host.title-view',
      targets: 'tree.title-view-package-components',
    },
    when: { op: 'evidenceComplete' },
    assert: {
      op: 'componentApiValid',
      validate: ['known-properties', 'allowed-values', 'allowed-combinations'],
    },
    verdict: defaultVerdict(),
    evidence: ['target.componentKey', 'target.variant.properties', 'component-api.contract'],
    remediation: {
      kind: 'set-variant-properties',
      target: '$failingTarget',
      properties: '$nearestAllowedCombination',
    },
    presentation: {
      message: 'Component properties must match the published TitleView Component API.',
      group: 'component-properties',
    },
    capabilities: capability(
      ['component-identity', 'self-and-descendants'],
      ['target.componentKey', 'target.variant.properties', 'component-api.contract'],
      ['componentApiValid'],
      ['set-variant-properties'],
    ),
  };
}

function slotSelector(roles) {
  return {
    scope: 'descendants',
    from: 'host.title-view',
    where: {
      visible: { op: 'equals', value: true },
      semanticRole: { op: 'oneOf', values: roles.map(normalizeRole) },
    },
    occurrence: 'all',
    orderBy: 'document',
  };
}

function compileCompositionRules(document) {
  const rules = [];
  for (const contract of document.manual.contracts || []) {
    for (const constraint of contract.constraints || []) {
      rules.push({
        id: `rule-ir:${contract.id}.${constraint.id}`,
        source: {
          file: 'source/composition-contract.json',
          pointer: `/manual/contracts/${contract.id}/constraints/${constraint.id}`,
          sourceRuleIds: compositionSourceRuleIds(contract.id, constraint.id),
        },
        severity: 'error',
        enforcement: 'enforced',
        select: {
          host: inlineHostSelector(contract.match),
          targets: inlineMemberSelector(contract.select),
        },
        when: { op: 'evidenceComplete' },
        assert: compileConstraint(constraint),
        verdict: defaultVerdict(),
        evidence: compositionEvidence(constraint),
        remediation: compositionRemediation(constraint),
        presentation: {
          message: constraint.message,
          group: 'component-properties',
        },
        capabilities: compositionCapabilities(constraint),
      });
    }
    for (const policy of contract.subtreePropertyPolicies || []) {
      rules.push({
        id: `rule-ir:${contract.id}.${policy.id}`,
        source: {
          file: 'source/composition-contract.json',
          pointer: `/manual/contracts/${contract.id}/subtreePropertyPolicies/${policy.id}`,
          sourceRuleIds: [],
        },
        severity: 'error',
        enforcement: 'enforced',
        select: {
          host: inlineHostSelector(contract.match),
          targets: inlineMemberSelector(contract.select),
        },
        when: { op: 'evidenceComplete' },
        assert: {
          op: 'allowedPropertiesByVariant',
          variantProperty: policy.variantProperty,
          controlledProperties: policy.controlledProperties,
          allowedPropertiesByValue: policy.allowedPropertiesByValue,
        },
        verdict: defaultVerdict(),
        evidence: ['component.identity', 'variant.properties', 'diff.property'],
        remediation: { kind: 'restore-effective-baseline', target: '$diff.target' },
        presentation: {
          passMessage: policy.allowedMessage,
          failMessage: policy.violationMessage,
          group: 'layer-properties',
        },
        capabilities: capability(
          ['component-identity', 'descendant'],
          ['component.identity', 'variant.properties', 'diff.property'],
          ['allowedPropertiesByVariant'],
          ['restore-effective-baseline'],
        ),
      });
    }
  }
  return rules;
}

function buildAuthoredRules(sourceRuleById) {
  const definitions = [
    authored(
      sourceRuleById,
      'component:web-corp.title-view.component-properties-are-first-class',
      'classify-component-properties',
      'info',
      'classification',
      { host: 'host.title-view', targets: 'tree.title-view' },
      { op: 'classifyDiffDomain', componentProperties: 'component-property', derivedLayerDiffs: 'derived' },
      ['diff.domain', 'component.properties'],
      ['classifyDiffDomain'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.layer-properties-use-effective-baseline',
      'effective-baseline',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'tree.title-view' },
      { op: 'matchesEffectiveBaseline', properties: ['layout.*', 'styles.text', 'fill', 'stroke', 'radius', 'opacity', 'effects.*', 'blendMode'] },
      ['diff.property', 'diff.actual', 'baseline.effective', 'ownership.owner'],
      ['matchesEffectiveBaseline'],
      ['restore-effective-baseline'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.external-spacing',
      'external-spacing',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'screen.title-view' },
      { op: 'neighborSpacingByPair', cases: sourceRuleById.get('component:web-corp.title-view.external-spacing').requiredSpacing },
      ['page.context', 'node.bounds', 'neighbor.componentIdentity'],
      ['neighborSpacingByPair'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.status-style-matches-surface',
      'status-style-by-surface',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'descendant.status-preset' },
      {
        op: 'valueByContext',
        actual: 'target.variant.Style',
        context: 'host.surface.kind',
        expectedByContext: sourceRuleById.get('component:web-corp.title-view.status-style-matches-surface').requiredVariantByContext,
      },
      ['host.surface.kind', 'target.variant.Style'],
      ['valueByContext'],
      ['set-variant-properties'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.status-type-follows-public-api',
      'status-public-api',
      'info',
      'enforced',
      { host: 'host.title-view', targets: 'descendant.status-preset' },
      { op: 'componentApiValid', properties: ['Type'] },
      ['target.component.contract', 'target.variant.Type'],
      ['componentApiValid'],
      ['set-variant-properties'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.title-status-may-be-standalone',
      'title-status-standalone',
      'info',
      'classification',
      { host: 'host.title-view', targets: 'descendant.title-status' },
      { op: 'absenceAllowed', optionalSelector: 'descendant.status-preset' },
      ['selector.matches'],
      ['absenceAllowed'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.status-label-is-content-override',
      'status-label-content-policy',
      'info',
      'classification',
      { host: 'host.title-view', targets: 'slot.status' },
      { op: 'changePolicy', allowed: ['text.characters'], delegated: ['variant.Type'] },
      ['diff.property', 'diff.owner'],
      ['changePolicy'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.title-status-content-overrides-allowed',
      'title-status-content-policy',
      'warning',
      'enforced',
      { host: 'host.title-view', targets: 'slot.title-status' },
      { op: 'contentPolicy', allowed: ['Title.text', 'Subtitle.text'], limits: { 'Subtitle.text': { maxLength: 120 } } },
      ['text.characters', 'semanticRole'],
      ['contentPolicy'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.button-group-max-four-actions',
      'button-group-max-four',
      'warning',
      'enforced',
      { host: 'host.title-view', targets: 'descendant.button' },
      { op: 'countBetween', min: 0, max: 4 },
      ['selector.matches'],
      ['countBetween'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.button-properties-delegate-to-button-pattern',
      'button-contract-delegation',
      'info',
      'classification',
      { host: 'host.title-view', targets: 'descendant.button' },
      { op: 'delegateToContract', contractIdentityFrom: 'target.componentKey' },
      ['target.componentKey'],
      ['delegateToContract'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.skeleton-is-component-property',
      'skeleton-component-api',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'host.title-view' },
      { op: 'componentApiValid', properties: ['Skeleton'] },
      ['host.component.contract', 'host.variant.Skeleton'],
      ['componentApiValid'],
      ['set-variant-properties'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.slot-availability-by-view',
      'slot-availability-by-view',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'slot.structural' },
      {
        op: 'allowedChildrenByHostProperty',
        hostProperty: 'View',
        allowedRolesByValue: sourceRuleById.get('component:web-corp.title-view.slot-availability-by-view').requiredComposition,
      },
      ['host.variant.View', 'target.semanticRole', 'target.visible'],
      ['allowedChildrenByHostProperty'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.holding-delegates-to-filter-company-select-contract',
      'holding-contract-delegation',
      'info',
      'classification',
      { host: 'host.title-view', targets: 'slot.structural' },
      { op: 'delegateToContract', role: 'slot.holding', contractIdentityFrom: 'target.componentKey' },
      ['target.semanticRole', 'target.componentKey'],
      ['delegateToContract'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.title-required-non-empty',
      'title-required',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'slot.title' },
      { op: 'visibleAndNonEmpty', property: 'text.characters' },
      ['target.visible', 'text.characters'],
      ['visibleAndNonEmpty'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.subtitle-max-120-characters',
      'subtitle-length',
      'warning',
      'enforced',
      { host: 'host.title-view', targets: 'slot.subtitle' },
      { op: 'stringLengthBetween', property: 'text.characters', min: 0, max: 120 },
      ['text.characters'],
      ['stringLengthBetween'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.right-addon-content-follows-type',
      'right-addon-content-by-type',
      'info',
      'enforced',
      { host: 'host.title-view', targets: 'tree.title-view' },
      { op: 'allowedChildrenByHostProperty', hostRole: 'right-addon', hostProperty: 'Type', source: 'component-api.anatomy' },
      ['target.semanticRole', 'target.variant.Type', 'component-api.anatomy'],
      ['allowedChildrenByHostProperty'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.manual-layer-style-overrides-prohibited',
      'manual-overrides',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'tree.title-view' },
      { op: 'matchesEffectiveBaseline', except: ['text.characters', 'instanceSwap'] },
      ['diff.property', 'diff.actual', 'baseline.effective', 'ownership.owner'],
      ['matchesEffectiveBaseline'],
      ['restore-effective-baseline'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.editable-full-title-pencil-action',
      'editable-full-title-action',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'tree.title-view' },
      { op: 'interactionByContext', context: { editMode: 'full-title' }, requiredTrigger: { icon: 'pencil' } },
      ['component.editMode', 'prototype.reactions', 'icon.identity'],
      ['interactionByContext'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.editable-title-single-line-ellipsis',
      'editable-single-line',
      'warning',
      'enforced',
      { host: 'host.title-view', targets: 'slot.title' },
      { op: 'propertiesEqual', values: { 'text.maxLines': 1, 'text.overflow': 'ellipsis' }, when: { 'component.editMode': ['full-title', 'partial-title'] } },
      ['component.editMode', 'text.maxLines', 'text.overflow'],
      ['propertiesEqual'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.root-fill-hug-sizing',
      'root-sizing',
      'warning',
      'classification',
      { host: 'host.title-view', targets: 'host.title-view' },
      { op: 'propertiesEqual', values: { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'HUG' } },
      ['layoutSizingHorizontal', 'layoutSizingVertical'],
      ['propertiesEqual'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.slot-order-required',
      'slot-order',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'slot.structural' },
      { op: 'relativeOrder', values: sourceRuleById.get('component:web-corp.title-view.slot-order-required').requiredComposition.slotOrder, ignoreMissing: true },
      ['target.semanticRole', 'target.documentOrder'],
      ['relativeOrder'],
    ),
    authored(
      sourceRuleById,
      'component:web-corp.title-view.root-style-and-clickability-prohibited',
      'root-style-and-clickability',
      'error',
      'enforced',
      { host: 'host.title-view', targets: 'host.title-view' },
      { op: 'noOverridesOrReactions', properties: ['fill', 'stroke', 'radius', 'opacity', 'effects.*', 'blendMode'], reactions: 'none' },
      ['diff.property', 'prototype.reactions'],
      ['noOverridesOrReactions'],
      ['restore-effective-baseline', 'remove-reaction'],
    ),
  ];

  return definitions.filter(Boolean);
}

function authored(
  sourceRuleById,
  sourceRuleId,
  suffix,
  severity,
  enforcement,
  select,
  assertion,
  facts,
  operators,
  remediations = [],
) {
  const source = sourceRuleById.get(sourceRuleId);
  if (!source) {
    throw new Error(`Missing source rule: ${sourceRuleId}`);
  }
  return {
    id: `rule-ir:title-view.${suffix}`,
    source: {
      file: 'source/rules.json',
      sourceRuleIds: [sourceRuleId],
      patternRuleId: source.patternRuleId || null,
    },
    severity,
    enforcement,
    select,
    when: { op: 'evidenceComplete' },
    assert: assertion,
    verdict: enforcement === 'classification'
      ? { pass: 'allowed', fail: 'unknown', unknown: 'unknown' }
      : defaultVerdict(),
    evidence: facts,
    remediation: remediations.length
      ? { kind: remediations[0], target: '$failingTarget' }
      : null,
    presentation: {
      message: source.ruleText,
      group: source.appliesTo,
    },
    capabilities: capability(
      selectorCapabilities(select),
      facts,
      operators,
      remediations,
    ),
  };
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
  if (constraint.op === 'valuePosition') {
    return {
      op: 'valuePosition',
      fact: `target.variant.${constraint.property}`,
      value: constraint.value,
      positions: constraint.positions,
      maxCount: constraint.maxCount == null ? null : constraint.maxCount,
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
  throw new Error(`Unsupported composition operator in experiment compiler: ${constraint.op}`);
}

function compositionCapabilities(constraint) {
  const facts = ['component.identity', 'variant.properties', 'node.visibility', 'node.documentOrder'];
  const operatorsBySourceOperator = {
    countBetween: ['countBetween'],
    propertyDomain: ['allMatch', 'oneOf'],
    valuePosition: ['valuePosition'],
    propertyEqualsHost: ['allMatch', 'equalsFact'],
    propertyEqualsFirst: ['allEqual'],
  };
  const operators = operatorsBySourceOperator[constraint.op];
  if (!operators) {
    throw new Error(`Missing capability mapping for ${constraint.op}`);
  }
  return capability(
    ['component-identity', 'descendant', 'visibility', 'document-order'],
    facts,
    operators,
    constraint.op === 'countBetween' ? [] : ['set-variant-properties'],
  );
}

function compositionRemediation(constraint) {
  if (constraint.op === 'countBetween') return null;
  if (constraint.op === 'propertyEqualsFirst') {
    return {
      kind: 'set-variant-properties',
      target: '$failingTarget',
      properties: { [constraint.property]: '$targets[0].variant.' + constraint.property },
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

function compositionEvidence(constraint) {
  if (constraint.op === 'countBetween') return ['selector.matches'];
  return ['selector.matches', `target.variant.${constraint.property}`];
}

function compositionSourceRuleIds(contractId, constraintId) {
  const key = `${contractId}:${constraintId}`;
  const map = {
    'title-view.status.composition:status-size': [
      'component:web-corp.title-view.status-size-24',
    ],
    'title-view.status-type-relation.composition:matching-status-type': [
      'component:web-corp.title-view.status-and-title-status-color-match',
    ],
    'title-view.button-group.composition:primary-position': [
      'component:web-corp.title-view.button-group-single-primary-action',
    ],
    'title-view.desktop-button-size.composition:button-size': [
      'component:web-corp.title-view.button-group-button-size-by-platform',
    ],
    'title-view.mobile-button-size.composition:button-size': [
      'component:web-corp.title-view.button-group-button-size-by-platform',
    ],
  };
  return map[key] || [];
}

function inlineHostSelector(match) {
  return {
    scope: 'selection-root',
    where: {
      componentKey: match.hostComponentKeys
        ? { op: 'oneOf', values: match.hostComponentKeys }
        : undefined,
      componentName: match.hostComponentNames
        ? { op: 'oneOf', values: match.hostComponentNames }
        : undefined,
    },
  };
}

function inlineMemberSelector(select) {
  return {
    scope: 'descendants',
    from: '$host',
    where: {
      componentKey: select.nestedComponentKeys
        ? { op: 'oneOf', values: select.nestedComponentKeys }
        : undefined,
      componentName: select.nestedComponentNames
        ? { op: 'oneOf', values: select.nestedComponentNames }
        : undefined,
      visible: select.visibility === 'all'
        ? undefined
        : { op: 'equals', value: true },
    },
    occurrence: 'all',
    orderBy: select.order || 'document',
  };
}

function compactComponentApi(contract) {
  return {
    id: contract.id,
    name: contract.name,
    componentKey: contract.componentKey,
    componentKeys: componentRoutingKeys(contract),
    platform: contract.platform,
    status: contract.status,
    publicApi: {
      properties: contract.figma.variants.properties,
      allowedCombinations: contract.figma.variants.allowedCombinations,
    },
    evidence: {
      source: 'source/contract.generated.json',
      anatomyCount: contract.figma.anatomy.length,
      structureNodeCount: contract.figma.structureSignature.length,
    },
  };
}

function routingKeysForContract(generatedContract, name, fallbackKey) {
  const contract = generatedContract.contracts.find((entry) => entry.name === name);
  return contract ? componentRoutingKeys(contract) : [fallbackKey];
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

function buildCoverage(sourceRules, executableRules) {
  const executableBySourceRule = new Map();
  for (const rule of executableRules) {
    for (const sourceRuleId of rule.source.sourceRuleIds || []) {
      const existing = executableBySourceRule.get(sourceRuleId) || [];
      existing.push(rule.id);
      executableBySourceRule.set(sourceRuleId, existing);
    }
  }

  const rules = sourceRules.map((sourceRule) => {
    const targetRuleIds = executableBySourceRule.get(sourceRule.ruleId) || [];
    if (targetRuleIds.length) {
      return {
        sourceRuleId: sourceRule.ruleId,
        status: 'executable',
        targetRuleIds: uniqueSorted(targetRuleIds),
        reason: 'Represented by typed selectors, facts and trusted operators.',
      };
    }
    if (sourceRule.checkType === 'llm') {
      return {
        sourceRuleId: sourceRule.ruleId,
        status: 'advisory',
        targetRuleIds: [],
        reason: 'Source explicitly classifies this rule as LLM/manual guidance.',
      };
    }
    return {
      sourceRuleId: sourceRule.ruleId,
      status: 'unsupported',
      targetRuleIds: [],
      reason: 'Deterministic source rule has not yet been expressed in RuleIR v2.',
    };
  });

  const summary = {
    sourceRules: rules.length,
    deterministicSourceRules: sourceRules.filter(
      (rule) => rule.checkType === 'deterministic',
    ).length,
    executableDeterministicSourceRules: sourceRules.filter(
      (rule) => rule.checkType === 'deterministic'
        && executableBySourceRule.has(rule.ruleId),
    ).length,
    promotedAdvisorySourceRules: sourceRules.filter(
      (rule) => rule.checkType === 'llm'
        && executableBySourceRule.has(rule.ruleId),
    ).length,
    executable: rules.filter((rule) => rule.status === 'executable').length,
    advisory: rules.filter((rule) => rule.status === 'advisory').length,
    unsupported: rules.filter((rule) => rule.status === 'unsupported').length,
    additionalExecutableRules: executableRules.filter(
      (rule) => !(rule.source.sourceRuleIds || []).length,
    ).length,
  };
  summary.executableShare = Number(
    (summary.executable / Math.max(1, summary.sourceRules)).toFixed(4),
  );
  summary.deterministicCoverageRatio = Number(
    (
      summary.executableDeterministicSourceRules
      / Math.max(1, summary.deterministicSourceRules)
    ).toFixed(4),
  );
  return { schemaVersion: 'apollo.rule-coverage.v1', summary, rules };
}

function uniqueSourceRules(document) {
  const byId = new Map();
  for (const rule of (document.generated.rules || []).concat(document.manual.rules || [])) {
    byId.set(rule.ruleId, rule);
  }
  return Array.from(byId.values()).sort((left, right) =>
    left.ruleId.localeCompare(right.ruleId),
  );
}

function validateContract(contract) {
  if (contract.schemaVersion !== 'apollo.component-contract.v2-experimental') {
    throw new Error('Unexpected contract schemaVersion.');
  }
  if (!contract.facts.componentApi.length) {
    throw new Error('Component API facts are empty.');
  }
  const selectorIds = new Set(Object.keys(contract.facts.selectors));
  const ruleIds = new Set();
  for (const rule of contract.rules) {
    if (ruleIds.has(rule.id)) throw new Error(`Duplicate rule id: ${rule.id}`);
    ruleIds.add(rule.id);
    for (const selector of [rule.select.host, rule.select.targets]) {
      if (typeof selector === 'string' && !selectorIds.has(selector)) {
        throw new Error(`${rule.id}: missing selector ${selector}`);
      }
    }
    if (!rule.assert || typeof rule.assert.op !== 'string') {
      throw new Error(`${rule.id}: assertion operator is required`);
    }
    if (!rule.capabilities.operators.includes(rule.assert.op)) {
      throw new Error(`${rule.id}: primary assertion operator is missing from capabilities`);
    }
  }
  const coverageTotal = contract.coverage.summary.executable
    + contract.coverage.summary.advisory
    + contract.coverage.summary.unsupported;
  if (coverageTotal !== contract.coverage.summary.sourceRules) {
    throw new Error('Coverage summary does not cover every source rule.');
  }
}

function buildSchema() {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://ackedze.github.io/design-system_ab/JSONS/experiments/component-contract-v2/schemas/apollo-component-contract-v2.schema.json',
    title: 'Apollo experimental component contract v2',
    type: 'object',
    additionalProperties: false,
    required: [
      'schemaVersion',
      'documentType',
      'status',
      'runtimePolicy',
      'package',
      'capabilities',
      'facts',
      'rules',
      'nonExecutableRules',
      'coverage',
    ],
    properties: {
      schemaVersion: { const: 'apollo.component-contract.v2-experimental' },
      documentType: { const: 'component-contract' },
      status: { enum: ['experimental', 'active', 'deprecated'] },
      runtimePolicy: { type: 'object' },
      package: { type: 'object' },
      capabilities: { type: 'object' },
      facts: { type: 'object' },
      rules: {
        type: 'array',
        items: { $ref: '#/$defs/rule' },
      },
      nonExecutableRules: { type: 'array' },
      coverage: { type: 'object' },
    },
    $defs: {
      rule: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'source',
          'severity',
          'enforcement',
          'select',
          'when',
          'assert',
          'verdict',
          'evidence',
          'remediation',
          'presentation',
          'capabilities',
        ],
        properties: {
          id: { type: 'string', minLength: 1 },
          source: { type: 'object' },
          severity: { enum: ['info', 'warning', 'error'] },
          enforcement: { enum: ['enforced', 'classification'] },
          select: { type: 'object' },
          when: { type: 'object' },
          assert: {
            type: 'object',
            required: ['op'],
            properties: { op: { type: 'string', minLength: 1 } },
          },
          verdict: { type: 'object' },
          evidence: { type: 'array', items: { type: 'string' } },
          remediation: { type: ['object', 'null'] },
          presentation: { type: 'object' },
          capabilities: { type: 'object' },
        },
      },
    },
  };
}

function buildReadme(contract, coverage) {
  return `# TitleView component contract v2 experiment

This directory is an isolated, non-runtime duplicate of the production package at
\`JSONS/web/components/web-corp/TitleView\`.

## Safety

- Apollo does not load this directory.
- Athena package discovery does not scan \`JSONS/experiments\`.
- No production manifest, rules registry, composition registry or component index references it.
- \`source/\` is copied byte-for-byte from the production TitleView package.

## Target package shape

- \`source/\` keeps generated facts, manual overlays, examples and agent context as evidence.
- \`compiled/component-contract.v2.json\` contains compact Component API facts, stable selectors, typed RuleIR, capability requirements, remediation and coverage links.
- \`schemas/apollo-component-contract-v2.schema.json\` defines the experiment envelope and rule requirements.
- \`coverage.json\` prevents free-text or unsupported rules from silently becoming violations.

## Result

- Component API facts: ${contract.facts.componentApi.length}
- Selectors: ${Object.keys(contract.facts.selectors).length}
- Executable RuleIR entries: ${contract.rules.length}
- Deterministic source rules covered as executable: ${coverage.summary.executableDeterministicSourceRules}/${coverage.summary.deterministicSourceRules}
- LLM/advisory source rules promoted by stronger structural evidence: ${coverage.summary.promotedAdvisorySourceRules}
- Advisory source rules: ${coverage.summary.advisory}
- Unsupported deterministic source rules: ${coverage.summary.unsupported}

## Architectural invariant

Changing a TitleView rule that uses the declared capabilities must require only a contract
publication. Apollo code changes are allowed only when the contract requests a genuinely new
selector, fact, operator or remediation capability.

## Regeneration

\`node scripts/build_title_view_contract_v2_experiment.js\`
`;
}

function defaultVerdict() {
  return { pass: 'expected', fail: 'violation', unknown: 'unknown' };
}

function capability(selectors, facts, operators, remediations = []) {
  return {
    selectors: uniqueSorted(selectors),
    facts: uniqueSorted(facts),
    operators: uniqueSorted(operators),
    remediations: uniqueSorted(remediations),
  };
}

function selectorCapabilities(select) {
  const capabilityByPrefix = {
    host: 'selection-root',
    descendant: 'descendant',
    slot: 'semantic-role',
    tree: 'self-and-descendants',
    screen: 'page-descendants',
  };
  return uniqueSorted(Object.values(select)
    .filter((value) => typeof value === 'string')
    .map((value) => capabilityByPrefix[String(value).split('.')[0]]));
}

function normalizeRole(value) {
  return `slot.${String(value).trim().toLowerCase().replace(/\s+/g, '-')}`;
}

function assertSourcePackage() {
  for (const fileName of SOURCE_FILES) {
    const filePath = path.join(SOURCE_DIR, fileName);
    if (!fs.existsSync(filePath)) throw new Error(`Missing source file: ${filePath}`);
  }
}

function ensureDirectories() {
  fs.mkdirSync(SOURCE_COPY_DIR, { recursive: true });
  fs.mkdirSync(COMPILED_DIR, { recursive: true });
  fs.mkdirSync(SCHEMA_DIR, { recursive: true });
}

function copySourcePackage() {
  for (const fileName of SOURCE_FILES) {
    fs.copyFileSync(path.join(SOURCE_DIR, fileName), path.join(SOURCE_COPY_DIR, fileName));
  }
}

function buildSourceFileManifest() {
  return SOURCE_FILES.map((fileName) => {
    const contents = fs.readFileSync(path.join(SOURCE_DIR, fileName));
    return {
      file: `source/${fileName}`,
      bytes: contents.length,
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    };
  });
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, fileName), 'utf8'));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, 'utf8');
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    String(left).localeCompare(String(right)),
  );
}

main();
