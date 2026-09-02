#!/usr/bin/env node

/*
 * Human-first projection for FilterCompanySelect.
 *
 * The source of semantic meaning is ds-ai-hub/products/ab/patterns/
 * filter-company-select.md.  This helper only maintains the Apollo-owned
 * projection: executable contours, routes, fixtures and trace metadata.
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageRoot = path.join(root, 'JSONS/web/components/web-corp/FilterCompanySelect');
const rulesPath = path.join(packageRoot, 'rules.json');
const examplesPath = path.join(packageRoot, 'examples.json');
const auditMappingPath = path.join(packageRoot, 'audit-mapping.json');
const agentContextPath = path.join(packageRoot, 'agent-context.json');
const overridesPath = path.join(packageRoot, 'contract.overrides.json');
const crosswalkPath = path.join(root, 'apollo/rule-crosswalk.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const rules = readJson(rulesPath);
const oldById = new Map(rules.manual.rules.map((rule) => [rule.ruleId, rule]));
const rootSelector = {
  from: 'selection-root',
  traverse: 'self-and-descendants',
  where: [
    { predicate: 'equals', actual: { fact: 'type' }, expected: { literal: 'INSTANCE' } },
    { predicate: 'equals', actual: { fact: 'component.identity' }, expected: { literal: 'web-corp.filter-company-select' } },
    { predicate: 'one-of', actual: { fact: 'component.family' }, expected: { literal: ['filter-company-select-multi', 'filter-company-select-single'] } },
    { predicate: 'equals', actual: { fact: 'ownership.contour.isRoot' }, expected: { literal: true } },
  ],
};

const removedScenarioRules = new Set([
  'component:web-corp.filter-company-select.filterblock-company-first',
  'component:web-corp.filter-company-select.table-multi-uses-multi-filtertag',
  'component:web-corp.filter-company-select.table-single-uses-single-filtertag',
  'component:web-corp.filter-company-select.form-uses-select-view',
  'component:web-corp.filter-company-select.titleview-uses-compact-view',
  'component:web-corp.filter-company-select.selected-value-content',
  'component:web-corp.filter-company-select.selected-value-display-delegated',
]);

const keep = rules.manual.rules
  .filter((rule) => !removedScenarioRules.has(rule.ruleId))
  .map(clone);

const replace = new Map();
const replaceRule = (ruleId, patch) => {
  // A rule may already have been renamed by a previous projection build.
  // Resolve the old id first and then its resulting id, so running this
  // source generator twice produces exactly the same package.
  const currentRuleId = oldById.has(ruleId) ? ruleId : (patch.ruleId || ruleId);
  const rule = oldById.get(currentRuleId);
  if (!rule) throw new Error(`Expected existing rule ${ruleId}`);
  replace.set(currentRuleId, Object.assign(clone(rule), patch));
};

replaceRule('component:web-corp.filter-company-select.lifecycle-context-is-informational', {
  source: 'technical-policy',
  appliesTo: 'component.lifecycle',
  checkType: 'policy',
  ruleText: 'Lifecycle — metadata/context. Сам по себе статус lifecycle не создаёт finding; нарушение возможно только по отдельному активному правилу.',
});
replaceRule('component:web-corp.filter-company-select.single-view-purpose', {
  severity: 'info',
  source: 'pattern-reference',
  appliesTo: 'flow.context|variant.View',
  checkType: 'llm',
  ruleText: 'Выбор View зависит от holding-сценария. Проверку соответствия View форме, таблице, FilterBlock и TitleView ведёт owner паттерна holding-company-selection.',
});
replaceRule('component:web-corp.filter-company-select.holding-context', {
  source: 'pattern-reference',
  appliesTo: 'flow.context',
  checkType: 'llm',
  patternRuleId: 'rule:flow.holding-company-selection.place-selector-by-page-type',
  ruleText: 'Режим холдинга — контекст сценария. Без подтверждённых flow-фактов не создавай design finding; применимость и размещение определяет holding-company-selection.',
});
replaceRule('component:web-corp.filter-company-select.runtime-owned-open-selected', {
  checkType: 'interaction',
  ruleText: 'Open и Selected являются runtime-состояниями. Их связь с открытым списком и выбранными компаниями проверяется только interaction/runtime evidence; без него результат not-evaluable.',
});
replaceRule('component:web-corp.filter-company-select.search-contract', {
  checkType: 'interaction',
  ruleText: 'Поиск в Multi и Single выполняется по названию, ИНН и адресу; placeholders: Multi «Название, ИНН или адрес», Single «Поиск». Поисковую семантику проверяй только с text-role и interaction evidence.',
});
replaceRule('component:web-corp.filter-company-select.search-visible-over-ten', {
  checkType: 'runtime',
  ruleText: 'Search видим при полном companyCount > 10 до поиска и не пересчитывается по числу результатов. Без pre-search companyCount и searchVisible результат not-evaluable.',
});
replaceRule('component:web-corp.filter-company-select.fixed-control-labels', {
  checkType: 'context',
  ruleText: 'Подписи «Компания», «Выбрать все», «Применить», «Сбросить» фиксированы. Проверка требует подтверждённый text.control-role; произвольный текст runtime-данных компании не сравнивай.',
});
replaceRule('component:web-corp.filter-company-select.single-clear-filter-tag-only', {
  checkType: 'interaction',
  ruleText: 'Очистка Single разрешена только в View=FilterTag и сразу возвращает пустое значение. Доступность clear и commit проверяются interaction evidence; snapshot без action facts не создаёт finding.',
});
replaceRule('component:web-corp.filter-company-select.states-delegate-to-nested-components', {
  source: 'delegated-contract',
  severity: 'info',
  checkType: 'delegated',
  ruleText: 'Loading, error, disabled, hover, focus, keyboard и no-results принадлежат Select, FilterTag, CheckboxLabel_24 и OptionList. FilterCompanySelect не создаёт собственных state-правил.',
});
replaceRule('component:web-corp.filter-company-select.sizing-delegation', {
  source: 'delegated-contract',
  checkType: 'delegated',
  ruleText: 'Root.width и dropdown.width можно менять независимо без min/max. Height, padding, gap и внутренняя геометрия принадлежат effective baseline nested-компонентов.',
});
replaceRule('component:web-corp.filter-company-select.empty-selection-by-view', {
  ruleId: 'component:web-corp.filter-company-select.single-compact-selected-required',
  appliesTo: 'variant.View|variant.Selected',
  checkType: 'deterministic',
  ruleText: 'У FilterCompanySelect_Single с View=Compact должна быть предвыбрана компания: Selected=False — error. Для Multi, FilterTag и Select нужны контекстные/runtime факты.',
  predicateContour: {
    schemaVersion: 'apollo.contour-definition.v1',
    kind: 'fact-domain',
    select: Object.assign({}, rootSelector, {
      where: rootSelector.where.concat([
        { predicate: 'equals', actual: { fact: 'component.family' }, expected: { literal: 'filter-company-select-single' } },
        { predicate: 'equals', actual: { fact: 'component.properties.View' }, expected: { literal: 'Compact' } },
      ]),
    }),
    actual: { fact: 'component.properties.Selected' },
    allowedValues: ['True'],
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'В Compact не выбрана компания',
      observed: 'У FilterCompanySelect_Single с View=Compact задан Selected={{actual}}.',
      expectation: 'View=Compact всегда показывает предвыбранную компанию: Selected должен быть True.',
      action: 'Выбрать компанию или сменить View на вариант, допускающий пустой выбор.',
    },
    scope: { platform: ['desktop'] },
    unknownPolicy: 'not-evaluable',
  },
});
replaceRule('component:web-corp.filter-company-select.preserve-library-composition', {
  source: 'delegated-contract',
  checkType: 'delegated',
  ruleText: 'Public root остаётся библиотечным instance. Detach, swap внутренних DropdownList/OptionList и служебных частей проверяются общими component-known-key/component-no-detach и nested contracts.',
});
replaceRule('component:web-corp.filter-company-select.company-data-runtime-owned', {
  source: 'runtime-content-policy',
  checkType: 'policy',
  ruleText: 'Название компании, ИНН и адрес — runtime-контент. Реальные примеры разрешены и не сравниваются как фиксированный текст компонента.',
});
replaceRule('component:web-corp.filter-company-select.select-all-checkbox-state', {
  checkType: 'runtime',
  ruleText: 'Состояние «Выбрать все» наследует CheckboxLabel_24: empty / indeterminate / selected по текущему набору. Без current-set и selected-id facts результат not-evaluable.',
});
replaceRule('component:web-corp.filter-company-select.visuals-follow-effective-baseline', {
  source: 'delegated-contract',
  checkType: 'delegated',
  ruleText: 'Визуальные и внутренние layout-свойства nested Select, FilterTag, CompactTag и OptionList сравниваются с их effective baseline. Root.width и dropdown.width — разрешённые независимые исключения.',
});
replaceRule('component:web-corp.filter-company-select.universal-modal-is-separate-package', {
  source: 'package-policy',
  checkType: 'policy',
  ruleText: 'FilterCompanySelect_UniversalModal — отдельный package внутри UniversalModal и не входит в public roots FilterCompanySelect; это policy/context, а не самостоятельный finding текущего пакета.',
});
replaceRule('component:web-corp.filter-company-select.empty-and-interaction-states-delegated', {
  source: 'delegated-contract',
  severity: 'info',
  checkType: 'delegated',
  ruleText: 'No-results, отсутствие компаний, hover, focus, keyboard и disabled наследуются от продукта и nested contracts; локальные FilterCompanySelect state-правила не создаются.',
});
replaceRule('component:web-corp.filter-company-select.selection-cardinality', {
  checkType: 'runtime',
  ruleText: 'Multi допускает 0..all, Single — максимум одну компанию. Условие пустого Select зависит от requiredness формы; без selectedCompanyCount и form facts результат not-evaluable.',
});

const replaceIds = new Set(replace.keys());
const selectedValueDelegated = {
  ruleId: 'component:web-corp.filter-company-select.selected-value-display-delegated',
  severity: 'info',
  source: 'delegated-contract',
  appliesTo: 'text.selectedValue',
  checkType: 'delegated',
  matchKind: 'delegated_contract',
  ruleText: 'Selected-value display принадлежит Select, [D] FilterTag и [D] CompactTag. FilterCompanySelect не задаёт собственную формулу текста и не создаёт finding по runtime названию или счётчику.',
};

rules.manual.rules = keep
  .filter((rule) => !replaceIds.has(rule.ruleId))
  .concat(Array.from(replace.values()), [selectedValueDelegated])
  .sort((left, right) => left.ruleId.localeCompare(right.ruleId));

rules.metadata.status = 'draft';
rules.metadata.applicability.platforms = ['desktop'];
rules.metadata.applicability.source = 'owner-confirmed-human-pattern';
rules.metadata.applicability.updatedAt = '2026-09-02';
rules.manual.executionPolicy = {
  schemaVersion: 'apollo.component-rule-execution.v1',
  componentIdentities: ['web-corp.filter-company-select'],
  projection: {
    sourceOfMeaning: 'ds-ai-hub/products/ab/patterns/filter-company-select.md',
    sourceRevision: '2026-09-02',
    readiness: 'draft',
    scenarioOwner: 'ptrn:flow.holding-company-selection',
    notes: [
      'Scenario placement rules are not component-owned findings.',
      'Runtime and interaction rules return not-evaluable without the required evidence.',
      'No direct Code Connect package, props or callbacks are asserted.',
    ],
  },
  predicateRules: [
    'component:web-corp.filter-company-select.public-roots-only',
    'component:web-corp.filter-company-select.desktop-only',
    'component:web-corp.filter-company-select.show-first-company-forbidden',
    'component:web-corp.filter-company-select.root-visuals-follow-effective-baseline',
    'component:web-corp.filter-company-select.single-compact-selected-required',
  ],
  delegatedRules: [
    {
      sourceRuleId: 'component:web-corp.filter-company-select.selected-value-display-delegated',
      targetContracts: ['web-core.select', 'web-core.filter-tag', 'web-core.compact-tag'],
    },
    {
      sourceRuleId: 'component:web-corp.filter-company-select.states-delegate-to-nested-components',
      targetContracts: ['web-core.select', 'web-core.filter-tag', 'web-core.checkbox-label', 'web-core.option-list'],
    },
    {
      sourceRuleId: 'component:web-corp.filter-company-select.empty-and-interaction-states-delegated',
      targetContracts: ['web-core.select', 'web-core.filter-tag', 'web-core.checkbox-label', 'web-core.option-list'],
    },
    {
      sourceRuleId: 'component:web-corp.filter-company-select.sizing-delegation',
      targetContracts: ['web-core.select', 'web-core.filter-tag', 'web-core.compact-tag', 'web-core.option-list'],
    },
    {
      sourceRuleId: 'component:web-corp.filter-company-select.visuals-follow-effective-baseline',
      targetContracts: ['web-core.select', 'web-core.filter-tag', 'web-core.compact-tag', 'web-core.option-list'],
    },
    {
      sourceRuleId: 'component:web-corp.filter-company-select.preserve-library-composition',
      targetRuleIds: ['component-known-key', 'component-no-detach'],
    },
  ],
  policyRules: [
    { sourceRuleId: 'component:web-corp.filter-company-select.lifecycle-context-is-informational', effect: 'informational' },
    { sourceRuleId: 'component:web-corp.filter-company-select.holding-context', effect: 'scenario-context' },
    { sourceRuleId: 'component:web-corp.filter-company-select.company-data-runtime-owned', effect: 'allow-content' },
    { sourceRuleId: 'component:web-corp.filter-company-select.universal-modal-is-separate-package', effect: 'separate-package' },
  ],
  contextOnlyRules: [
    { sourceRuleId: 'component:web-corp.filter-company-select.single-view-purpose', missingFacts: ['page.holding-mode', 'component.semantic-role'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.runtime-owned-open-selected', missingFacts: ['interaction.open-state', 'data.selectedCompanyCount'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.multi-apply-model', missingFacts: ['interaction.pending-selection', 'interaction.apply-action'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.multi-reset-immediate', missingFacts: ['interaction.reset-action', 'interaction.applied-selection'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.single-select-immediate', missingFacts: ['interaction.row-action', 'interaction.applied-selection'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.search-contract', missingFacts: ['text.control-role', 'interaction.search-index'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.search-visible-over-ten', missingFacts: ['data.companyCount.beforeSearch', 'component.searchVisible'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.fixed-control-labels', missingFacts: ['text.control-role'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.select-all-current-results', missingFacts: ['interaction.search-results', 'data.selectedCompanyIds'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.select-all-checkbox-state', missingFacts: ['data.currentSetCompanyIds', 'data.selectedCompanyIds'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.single-clear-filter-tag-only', missingFacts: ['interaction.clear-action', 'interaction.applied-selection'] },
    { sourceRuleId: 'component:web-corp.filter-company-select.selection-cardinality', missingFacts: ['data.selectedCompanyCount', 'form.required'] },
  ],
  coverageGaps: [
    { sourceRuleId: 'component:web-corp.filter-company-select.root-visuals-follow-effective-baseline', missingFacts: ['appearance.effects'] },
  ],
};

const examples = readJson(examplesPath);
examples.metadata.status = 'draft';
examples.metadata.applicability.platforms = ['desktop'];
examples.metadata.applicability.updatedAt = '2026-09-02';
examples.manual.examples = [
  {
    exampleId: 'filter-company-select.pass-public-single-compact',
    title: 'PASS · Compact с выбранной компанией',
    inputState: { root: '[D] FilterCompanySelect_Single', platform: 'desktop', View: 'Compact', Selected: 'True', ShowFirstCompany: 'False' },
    expectedAudit: { category: 'none' },
    evidence: 'predicate-release-service:C21 compact pass',
  },
  {
    exampleId: 'filter-company-select.fail-internal-root',
    title: 'FAIL · Вставлен внутренний CompactTag',
    inputState: { root: '[D] CompactTag', standalone: true, platform: 'desktop' },
    expectedAudit: { category: 'components', severity: 'error', ruleId: 'component:web-corp.filter-company-select.public-roots-only' },
    evidence: 'predicate-release-service:C21 internal root',
  },
  {
    exampleId: 'filter-company-select.fail-mobile-web',
    title: 'FAIL · Desktop root использован на mobile-web',
    inputState: { root: '[D] FilterCompanySelect_Single', platform: 'mobile-web' },
    expectedAudit: { category: 'components', severity: 'error', ruleId: 'component:web-corp.filter-company-select.desktop-only' },
    evidence: 'predicate-release-service:C21 platform',
  },
  {
    exampleId: 'filter-company-select.fail-legacy-show-first-company',
    title: 'FAIL · Включён legacy ShowFirstCompany',
    inputState: { root: '[D] FilterCompanySelect_Multi', platform: 'desktop', ShowFirstCompany: 'True' },
    expectedAudit: { category: 'components', severity: 'error', ruleId: 'component:web-corp.filter-company-select.show-first-company-forbidden' },
    evidence: 'predicate-release-service:C21 legacy',
  },
  {
    exampleId: 'filter-company-select.fail-compact-without-selection',
    title: 'FAIL · Compact без выбранной компании',
    inputState: { root: '[D] FilterCompanySelect_Single', platform: 'desktop', View: 'Compact', Selected: 'False', ShowFirstCompany: 'False' },
    expectedAudit: { category: 'components', severity: 'error', ruleId: 'component:web-corp.filter-company-select.single-compact-selected-required' },
    evidence: 'predicate-release-service:C21 compact fail',
  },
  {
    exampleId: 'filter-company-select.fail-root-radius',
    title: 'FAIL · Изменён radius public root',
    inputState: { root: '[D] FilterCompanySelect_Single', platform: 'desktop', property: 'radius', actual: 20, baseline: 12 },
    expectedAudit: { category: 'components', severity: 'error', ruleId: 'component:web-corp.filter-company-select.root-visuals-follow-effective-baseline.radius' },
    evidence: 'predicate-release-service:C21 baseline',
  },
  {
    exampleId: 'filter-company-select.not-evaluable-search-company-count',
    title: 'NOT-EVALUABLE · Нет полного companyCount до поиска',
    inputState: { root: '[D] FilterCompanySelect_Multi', searchVisible: true },
    expectedAudit: { category: 'none', classification: 'not-evaluable' },
    evidence: 'interaction/runtime fixture required',
  },
  {
    exampleId: 'filter-company-select.interaction-multi-transaction',
    title: 'INTERACTION · Multi apply / close / reset',
    inputState: { root: '[D] FilterCompanySelect_Multi', checks: ['apply-commits', 'close-cancels', 'reset-commits-empty'] },
    expectedAudit: { route: 'interaction' },
    evidence: 'product interaction test required',
  },
  {
    exampleId: 'filter-company-select.llm-holding-placement',
    title: 'LLM · View и размещение в holding-сценарии',
    inputState: { root: '[D] FilterCompanySelect_Single', View: 'Select', pageType: 'form', holdingMode: 'unknown' },
    expectedAudit: { route: 'llm-agent', classification: 'not-evaluable-without-context' },
    evidence: 'holding-company-selection owner pattern',
  },
];

const auditMapping = readJson(auditMappingPath);
auditMapping.metadata.status = 'draft';
auditMapping.metadata.applicability.platforms = ['desktop'];
auditMapping.manual.runtimeLimitations = [
  'Apply/cancel/reset, search scope, Select All and runtime-derived Open/Selected require interaction or runtime evidence; static snapshots without these facts are not-evaluable.',
  'View placement in tables, forms, FilterBlock and TitleView belongs to holding-company-selection; it is not a FilterCompanySelect-owned violation.',
  'Selected-value display, nested states and nested visual geometry are delegated to Select, FilterTag, CompactTag, CheckboxLabel_24 and OptionList.',
];
auditMapping.manual.contentChecks = {
  Multi: { searchPlaceholder: 'Название, ИНН или адрес' },
  Single: { searchPlaceholder: 'Поиск' },
  fixedControls: ['Компания', 'Выбрать все', 'Применить', 'Сбросить'],
  runtimeOwned: ['companyName', 'inn', 'address'],
  selectedValueOwner: ['Select', '[D] FilterTag', '[D] CompactTag'],
};
auditMapping.manual.evidencePolicy = {
  showFirstCompanyTrueIsViolation: true,
  singleCompactSelectedFalseIsViolation: true,
  rootCodeConnectStatus: 'not-configured',
  nestedCodeConnectDoesNotVerifyRoot: true,
  noRuntimeFactCreatesViolation: false,
  projectionStatus: 'draft',
};

const overrides = readJson(overridesPath);
overrides.metadata.status = 'draft';
overrides.metadata.applicability.platforms = ['desktop'];
overrides.manual.selectionContent = {
  owner: ['Select', '[D] FilterTag', '[D] CompactTag'],
  policy: 'FilterCompanySelect не задаёт собственную формулу selected value; runtime company data не является фиксированным компонентным текстом.',
};
overrides.manual.patternReferences = [{
  name: 'holding-company-selection',
  patternId: 'ptrn:flow.holding-company-selection',
  file: 'patterns/p_holding-company-selection.md',
  status: 'verified',
  integration: 'Сценарные table/form/TitleView/FilterBlock правила принадлежат flow-pattern и не дублируются в rules.json FilterCompanySelect.',
}];
overrides.manual.codeConnect = {
  rootStatus: 'not-configured',
  nestedMappingsDoNotVerifyRoot: true,
  doNotInfer: ['package', 'import', 'symbol', 'props', 'callbacks'],
};

const agentContext = readJson(agentContextPath);
agentContext.metadata.status = 'draft';
agentContext.metadata.applicability.platforms = ['desktop'];
agentContext.manual.patternReferences = [{
  patternId: 'ptrn:components.filter-company-select',
  file: 'ds-ai-hub/products/ab/patterns/filter-company-select.md',
  sourceType: 'human-semantic-authority',
  updatedAt: '2026-09-02',
}, {
  patternId: 'ptrn:flow.holding-company-selection',
  file: 'ds-ai-hub/products/ab/patterns/holding-company-selection.md',
  sourceType: 'scenario-owner',
  updatedAt: '2026-08-14',
}];
agentContext.manual.summary = {
  componentFamily: 'FilterCompanySelect',
  library: 'Web _ Corp Components',
  purpose: 'Desktop-компонент режима холдинга для выбора одной или нескольких компаний. Human source определяет смысл; Apollo применяет только подтверждённые predicate и delegated routes.',
};
agentContext.manual.usageGuidance = [
  'Публичны только [D] FilterCompanySelect_Multi и [D] FilterCompanySelect_Single; скрытая [MW] секция не является mobile API.',
  'ShowFirstCompany всегда False. Single + View=Compact всегда требует Selected=True.',
  'Root.width и dropdown.width можно менять независимо; остальные visual/layout свойства принадлежат effective baseline владельца.',
  'Selected-value display принадлежит Select, FilterTag и CompactTag; company name, ИНН и address — runtime-content.',
  'Multi transaction, Single immediate selection, search scope, select-all и clear требуют interaction/runtime facts; без них verdict not-evaluable.',
  'View/размещение для form/table/FilterBlock/TitleView принадлежат holding-company-selection.',
  'Не выводи package, import, props или callbacks: прямой Code Connect отсутствует.',
];
agentContext.manual.ruleHighlights = rules.manual.executionPolicy.predicateRules;
agentContext.manual.agentInstructions = [
  'Не создавай finding при отсутствии runtime или interaction facts.',
  'Не дублируй сценарные ошибки form/table/TitleView/FilterBlock как правила FilterCompanySelect.',
  'Не проверяй selected value по локальной формуле: делегируй Select, FilterTag и CompactTag.',
  'Не считай lifecycle самостоятельным design violation.',
  'Не рассматривай FilterCompanySelect_UniversalModal как public root текущего package.',
];

const crosswalk = readJson(crosswalkPath);
crosswalk.documents.filterCompanySelectPattern = { path: 'products/ab/patterns/filter-company-select.md' };
crosswalk.documents.filterCompanySelectInstructions = { path: 'products/ab/components/filter-company-select/instructions.md' };
crosswalk.documents.holdingCompanySelectionPattern = { path: 'products/ab/patterns/holding-company-selection.md' };
crosswalk.entries = crosswalk.entries.filter((entry) => entry.apolloSource !== 'JSONS/web/components/web-corp/FilterCompanySelect/rules.json');

const source = 'JSONS/web/components/web-corp/FilterCompanySelect/rules.json';
const human = (ruleNumber, title) => ({
  kind: 'named-rule',
  document: 'filterCompanySelectPattern',
  ruleId: `rule:components.filter-company-select.${title.id}`,
  heading: `Rule ${ruleNumber}: ${title.heading}`,
});
const humanRules = {
  1: { id: 'holding-context-only', heading: 'Используй FilterCompanySelect только в режиме холдинга' },
  2: { id: 'public-roots-only', heading: 'Используй только два публичных root' },
  3: { id: 'desktop-only', heading: 'Используй компонент только на desktop' },
  4: { id: 'show-first-company-false', heading: 'Сохраняй ShowFirstCompany=False' },
  5: { id: 'view-semantics', heading: 'Выбирай View по его собственной семантике' },
  6: { id: 'open-selected-follow-runtime-state', heading: 'Связывай Open и Selected с фактическим состоянием' },
  7: { id: 'multi-transaction-model', heading: 'Сохраняй transaction-модель Multi' },
  8: { id: 'single-selection-immediate', heading: 'Применяй Single сразу' },
  9: { id: 'search-fields-and-placeholders', heading: 'Сохраняй search-контракт' },
  10: { id: 'search-visible-over-ten', heading: 'Показывай поиск только при количестве компаний больше 10' },
  11: { id: 'fixed-control-labels', heading: 'Не изменяй фиксированные подписи' },
  12: { id: 'select-all-current-set', heading: 'Применяй «Выбрать все» к текущему набору' },
  13: { id: 'select-all-tristate', heading: 'Сохраняй tri-state «Выбрать все»' },
  14: { id: 'selected-value-display-delegated', heading: 'Делегируй отображение выбранного значения' },
  15: { id: 'nested-states-delegated', heading: 'Не создавай собственные состояния вложенных компонентов' },
  16: { id: 'width-only-layout-override', heading: 'Изменяй только ширину root и dropdown' },
  17: { id: 'preserve-library-composition', heading: 'Сохраняй библиотечную composition' },
  18: { id: 'company-data-runtime-owned', heading: 'Считай данные компании runtime-контентом' },
  19: { id: 'selection-cardinality', heading: 'Соблюдай cardinality и пустой выбор' },
  20: { id: 'single-clear-filtertag-only', heading: 'Разрешай очистку Single только в FilterTag' },
  21: { id: 'universal-modal-separate-package', heading: 'Не подменяй пакет UniversalModal' },
};
const crosswalkMap = {
  'lifecycle-context-is-informational': { relation: 'technical-only', route: 'policy/context-only', scope: 'lifecycle metadata', evidence: [], test: 'release loader closure' },
  'public-roots-only': { relation: 'exact', route: 'predicate', scope: 'public root boundary', human: 2, test: 'filter-company-select.fail-internal-root' },
  'desktop-only': { relation: 'exact', route: 'predicate', scope: 'desktop-only root', human: 3, test: 'filter-company-select.fail-mobile-web' },
  'show-first-company-forbidden': { relation: 'exact', route: 'predicate', scope: 'legacy property', human: 4, test: 'filter-company-select.fail-legacy-show-first-company' },
  'single-view-purpose': { relation: 'semantic-support', route: 'LLM-agent', scope: 'scenario View choice', human: 5, test: 'filter-company-select.llm-holding-placement' },
  'holding-context': { relation: 'semantic-support', route: 'policy/context-only', scope: 'holding applicability', human: 1, test: 'holding scenario evidence required' },
  'multi-apply-model': { relation: 'exact', route: 'interaction', scope: 'Multi Apply commit', human: 7, test: 'filter-company-select.interaction-multi-transaction' },
  'multi-reset-immediate': { relation: 'semantic-support', route: 'interaction', scope: 'Multi Reset commit empty', human: 7, test: 'filter-company-select.interaction-multi-transaction' },
  'single-select-immediate': { relation: 'exact', route: 'interaction', scope: 'Single commit and close', human: 8, test: 'product interaction test required' },
  'runtime-owned-open-selected': { relation: 'exact', route: 'interaction', scope: 'runtime Open/Selected', human: 6, test: 'runtime state fixture required' },
  'search-contract': { relation: 'exact', route: 'interaction', scope: 'search field and placeholder', human: 9, test: 'text-role + interaction fixture required' },
  'select-all-current-results': { relation: 'exact', route: 'interaction', scope: 'Select All current set', human: 12, test: 'search result interaction fixture required' },
  'selected-value-display-delegated': { relation: 'exact', route: 'delegated', scope: 'selected value owner', human: 14, test: 'nested contract evidence' },
  'fixed-control-labels': { relation: 'exact', route: 'LLM-agent', scope: 'fixed control labels', human: 11, test: 'text-role fixture required' },
  'search-visible-over-ten': { relation: 'exact', route: 'not-evaluable without runtime facts', scope: 'pre-search company count', human: 10, test: 'filter-company-select.not-evaluable-search-company-count' },
  'single-clear-filter-tag-only': { relation: 'exact', route: 'interaction', scope: 'Single clear action', human: 20, test: 'clear interaction fixture required' },
  'states-delegate-to-nested-components': { relation: 'exact', route: 'delegated', scope: 'nested state ownership', human: 15, test: 'nested contract evidence' },
  'sizing-delegation': { relation: 'semantic-support', route: 'delegated', scope: 'nested geometry and allowed widths', human: 16, test: 'baseline fixture required' },
  'single-compact-selected-required': { relation: 'semantic-equivalent', route: 'predicate', scope: 'Compact selection required', human: 19, test: 'filter-company-select.fail-compact-without-selection' },
  'preserve-library-composition': { relation: 'exact', route: 'delegated', scope: 'detach and inner swaps', human: 17, test: 'generic component-known-key/component-no-detach tests' },
  'company-data-runtime-owned': { relation: 'exact', route: 'policy/context-only', scope: 'runtime company content', human: 18, test: 'content allow policy fixture' },
  'select-all-checkbox-state': { relation: 'exact', route: 'not-evaluable without runtime facts', scope: 'CheckboxLabel_24 tri-state', human: 13, test: 'current set runtime fixture required' },
  'visuals-follow-effective-baseline': { relation: 'semantic-support', route: 'delegated', scope: 'nested visual baseline', human: 16, test: 'nested baseline fixture required' },
  'root-visuals-follow-effective-baseline': { relation: 'semantic-support', route: 'predicate', scope: 'root visual baseline', human: 16, test: 'filter-company-select.fail-root-radius' },
  'universal-modal-is-separate-package': { relation: 'exact', route: 'policy/context-only', scope: 'separate UniversalModal package', human: 21, test: 'package boundary review' },
  'empty-and-interaction-states-delegated': { relation: 'semantic-support', route: 'delegated', scope: 'no results and interaction state ownership', human: 15, test: 'nested contract evidence' },
  'selection-cardinality': { relation: 'exact', route: 'not-evaluable without runtime facts', scope: 'Multi/Single cardinality', human: 19, test: 'selected count runtime fixture required' },
};

for (const rule of rules.manual.rules) {
  const shortId = rule.ruleId.replace('component:web-corp.filter-company-select.', '');
  const mapping = crosswalkMap[shortId];
  if (!mapping) throw new Error(`Crosswalk mapping is missing for ${rule.ruleId}`);
  crosswalk.entries.push({
    apolloRuleId: rule.ruleId,
    apolloSource: source,
    relation: mapping.relation,
    enforcementScope: mapping.scope,
    executionRoute: mapping.route,
    testEvidence: mapping.test,
    hubEvidence: mapping.human ? [human(mapping.human, humanRules[mapping.human])] : mapping.evidence,
    review: {
      status: 'verified',
      reviewedAt: '2026-09-02',
      basis: 'Human-first projection reviewed against owner-confirmed FilterCompanySelect pattern; Predicate remains Draft pending live Figma verification.',
    },
  });
}
crosswalk.projections = crosswalk.projections || {};
crosswalk.projections.filterCompanySelect = {
  sourceDocument: 'filterCompanySelectPattern',
  readiness: 'draft',
  humanRuleRoutes: Object.entries(humanRules).map(([number, descriptor]) => ({
    humanRuleId: `rule:components.filter-company-select.${descriptor.id}`,
    heading: `Rule ${number}: ${descriptor.heading}`,
    route: ({
      1: 'policy/context-only', 2: 'predicate', 3: 'predicate', 4: 'predicate', 5: 'LLM-agent',
      6: 'interaction', 7: 'interaction', 8: 'interaction', 9: 'interaction', 10: 'not-evaluable without runtime facts',
      11: 'LLM-agent', 12: 'interaction', 13: 'not-evaluable without runtime facts', 14: 'delegated',
      15: 'delegated', 16: 'predicate + delegated', 17: 'delegated', 18: 'policy/context-only',
      19: 'predicate + not-evaluable without runtime facts', 20: 'interaction', 21: 'policy/context-only',
    })[number],
  })),
  scenarioRules: {
    owner: 'holdingCompanySelectionPattern',
    excludedFromComponentRuleIds: Array.from(removedScenarioRules).filter((ruleId) => ruleId !== 'component:web-corp.filter-company-select.selected-value-content'),
  },
  retiredApolloRuleIds: ['component:web-corp.filter-company-select.selected-value-content'],
};

writeJson(rulesPath, rules);
writeJson(examplesPath, examples);
writeJson(auditMappingPath, auditMapping);
writeJson(agentContextPath, agentContext);
writeJson(overridesPath, overrides);
writeJson(crosswalkPath, crosswalk);
