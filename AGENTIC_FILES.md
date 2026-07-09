# Agentic-файлы Apollo

Документ описывает комплект machine-readable и agentic-файлов, которые лежат рядом с raw-каталогами компонентов и используются экосистемой Apollo: Figma-плагином, Athena CLI и агентом рекомендаций.

Цель комплекта — отделить стабильный raw-каталог Figma от смыслового слоя: правил компонента, composition baseline, подсказок для агента, regression-примеров и маппинга аудита.

## Где лежат файлы

Компонентный комплект хранится в отдельной папке компонента:

```text
JSONS/web/components/<library-group>/<ComponentName>/
```

Пример:

```text
JSONS/web/components/web-corp/BackgroundPlate/
```

В этой папке могут лежать:

```text
README.md
agent-context.json
audit-mapping.json
composition-contract.json
contract.generated.json
contract.overrides.json
examples.json
rules.json
```

Индекс всех комплектов:

```text
JSONS/apollo/indexes/componentContractIndex.json
```

Точка входа для Apollo:

```text
JSONS/referenceSourcesMVP.json
```

## Использование в pipeline

| Файл | Где применяется | Текущий статус использования | Ценность для pipeline |
| --- | --- | --- | --- |
| **✅ `componentContractIndex.json`** | Figma-плагин Apollo, Athena CLI | Активно используется Apollo runtime для поиска нужного component package по `figmaKeys`, alias, имени компонента или исходному raw-каталогу. | Главная точка маршрутизации: Apollo понимает, какие агентские файлы нужно скачать для найденных в макете компонентов. |
| **✅ `rules.json`** | Figma-плагин Apollo, agentic | Apollo runtime загружает файл через `componentContractIndex.json` и добавляет правила в remote component rule registry. Агент также получает правила в `*_agent.json`, если они относятся к найденным отклонениям. | Детерминированные и LLM-readable правила компонента: что запрещено, что допустимо, какие проверки требуют точного rule match. |
| **✅ `composition-contract.json`** | Figma-плагин Apollo | Apollo runtime загружает файл через `componentContractIndex.json`. Сейчас используется для contract-aware diff: wrapper-owned overrides, effective baseline, suppression/rebase части nested diffs. | Позволяет корректно проверять составные компоненты и не считать штатные настройки вложенных DS-компонентов ручной кастомизацией. |
| **✅ `agent-context.json`** | agentic | Файл индексируется и публикуется. Используется как компактный смысловой контекст для агента и должен попадать в агентский слой, когда компонент участвует в отчёте. | Объясняет агенту назначение компонента, alias, critical baselines, правила интерпретации и запреты на галлюцинации. |
| `audit-mapping.json` | Figma-плагин Apollo, agentic | Файл индексируется и публикуется. Базовая генерация уже есть в Athena CLI, но Apollo runtime сейчас не использует его как основной источник группировки; часть логики всё ещё зашита в коде плагина. | Должен стать декларативной моделью группировки diff: “Параметры компонента”, “Параметры слоя”, reset surface, display names, порядок вывода, baseline policy. |
| `contract.generated.json` | Athena CLI, будущий Apollo runtime | Генерируется Athena из raw-каталога. Публикуется и указывается в индексе, но текущий Apollo runtime напрямую его не загружает в audit path; Figma-плагин пока продолжает опираться на raw-каталог и composition/rules. | Компактный baseline компонента: variants, allowed combinations, nested tree, layer defaults, style/token references. Нужен как промежуточный слой между raw-каталогом и audit/runtime контрактами. |
| `contract.overrides.json` | Athena CLI, authoring, future runtime | Создаётся Athena, если отсутствует. Сейчас не должен затираться при регенерации. Apollo runtime напрямую не читает файл; его смысл должен учитываться при генерации итоговых артефактов. | Ручные уточнения поверх generated baseline: public API, alias, reset model, семантика вариантов, исключения, которые нельзя вывести из raw-каталога. |
| `examples.json` | QA, agentic, future tests | Сейчас используется как regression/authoring-документ. Apollo runtime напрямую не читает файл. Может использоваться для ручной проверки агента и будущих автоматических тестов Athena/Apollo. | Фиксирует ожидаемое поведение на конкретных кейсах: что должен показать Apollo, как должен отреагировать агент, какие выводы запрещены. |
| `README.md` | Люди, ревью, onboarding | Runtime не использует. Документ нужен для разработчиков, дизайнеров и авторов контрактов. | Быстро объясняет назначение комплекта компонента, источники данных и основные правила интерпретации. |

## Подробно по файлам

### `componentContractIndex.json`

**Назначение:** удалённый индекс component packages.

Файл сообщает Apollo, какие комплектные артефакты есть у каждого компонента:

```json
{
  "componentKey": "web-corp.background-plate",
  "packagePath": "JSONS/web/components/web-corp/BackgroundPlate",
  "figmaKeys": ["..."],
  "aliases": ["BackgroundPlate", "[D] BackgroundPlate"],
  "sourceCatalogPath": "JSONS/web/components/web-corp/Web _ Corp Components -- BackgroundPlate.json",
  "artifacts": {
    "rules": "rules.json",
    "composition": "composition-contract.json",
    "agentContext": "agent-context.json",
    "auditMapping": "audit-mapping.json",
    "overrides": "contract.overrides.json",
    "generatedContract": "contract.generated.json"
  }
}
```

**Ценность:** Apollo не должен заранее скачивать все файлы. Он определяет компоненты в выбранной области, матчится с индексом и докачивает только нужные артефакты.

**Актуальное использование:** активно используется Figma-плагином Apollo.

### `rules.json`

**Назначение:** machine-readable правила компонента.

Типовые разделы:

- `rules[]`
- `ruleId`
- `severity`
- `source`
- `appliesTo`
- `checkType`
- `matchKind`
- `conditions`
- `classification`
- `ruleText`

Пример:

```json
{
  "ruleId": "component:web-corp.background-plate.level-2-requires-level-1",
  "severity": "error",
  "appliesTo": "component.composition",
  "checkType": "llm",
  "matchKind": "composition_rule",
  "ruleText": "BackgroundPlate с Position=Level 2 (inner) должен располагаться только поверх BackgroundPlate Level 1."
}
```

**Ценность:** правила дают агенту и Apollo точные основания для рекомендаций. Агент может повышать критичность только по exact/component rule, а не по догадке.

**Актуальное использование:** активно используется Apollo runtime как remote component rule registry.

### `composition-contract.json`

**Назначение:** описание composition ownership и effective baseline для составных компонентов.

Типовые разделы:

- `wraps`
- `ownershipModel`
- `allowedOverrides`
- `standaloneBaselines`

Пример `wraps`:

```json
{
  "hostComponentName": "[D] BackgroundPlate",
  "path": "Position=Level 1 (outer) / [D] Style Level 1",
  "componentName": "[D] Style Level 1",
  "role": "internal-instance",
  "visible": true,
  "variantProperties": {
    "BackgroundColor": "base-bg-alt (gray)",
    "Skeleton": "False",
    "Type": "Primary"
  }
}
```

**Ценность:** без composition contract Apollo сравнивает вложенный компонент с его standalone baseline и может ошибочно считать штатные настройки обёртки кастомизацией.

**Актуальное использование:** активно используется Apollo runtime в contract-aware diff.

### `agent-context.json`

**Назначение:** компактный контекст для агента о назначении компонента и правилах интерпретации.

Типовые разделы:

- `generated`
- `manual`
- `summary`
- `source`
- `components`
- `criticalBaselines`
- `agentInstructions`
- `codeExports`

Пример полезной инструкции:

```json
{
  "agentInstructions": [
    "Не выводи нарушение из примера. Используй только exact rules, exact component contracts и явно найденные pattern rules."
  ]
}
```

**Ценность:** снижает галлюцинации агента. Объясняет, какие изменения считать нарушением, какие только кастомизацией, а какие штатным поведением компонента.

**Generated/manual модель:** Athena может обновлять `generated.source`, `generated.components`, `generated.summary` и `generated.auditInterpretation` при каждом обновлении raw-каталога. Ручные смысловые поля должны жить в `manual`: `manual.summary`, `manual.criticalBaselines`, `manual.agentInstructions`, `manual.codeExports`. Для обратной совместимости эти поля могут дублироваться наверх, но источником ручного смысла считается `manual`.

**Актуальное использование:** индексируется и должен использоваться agentic pipeline. Для Figma runtime сейчас важнее `rules.json` и `composition-contract.json`.

### `audit-mapping.json`

**Назначение:** декларативная модель группировки и отображения diff в Apollo.

Типовые разделы:

- `generated`
- `manual`
- `categories` или `classification`
- `match`
- `category`
- `scope`
- `groupTitle`
- `resetSurface`
- `baselinePolicy`
- `displayName`
- `priority`

Пример:

```json
{
  "match": {
    "propertyPrefix": "variant."
  },
  "scope": "component-property",
  "groupTitle": "Параметры компонента",
  "resetSurface": "parameters",
  "priority": 10
}
```

**Ценность:** выносит из кода Apollo знание о том, как группировать diff и какой reset action применять.

**Generated/manual модель:** Athena может обновлять `generated.classification`, `generated.groupingOrder` и `generated.evidencePolicy`. Ручные уточнения должны жить в `manual`: legacy `categories`, `hostIntegrationNote`, `codeExportAliases`, исключения и notes. Runtime может читать верхнеуровневые поля для совместимости, но при конфликте ручные уточнения должны иметь приоритет над generated default.

**Актуальное использование:** файл публикуется и индексируется. Базовая генерация есть в Athena CLI. Runtime Apollo пока не полностью управляется этим файлом, поэтому часть поведения остаётся в коде плагина.

### `contract.generated.json`

**Назначение:** автоматически сгенерированный компактный контракт из raw-каталога.

Типовые разделы:

- `schemaVersion`
- `source`
- `stats`
- `contracts[]`
- `figma.variants`
- `structure`
- `layerDefaults`
- `style/token references`

**Ценность:** raw-каталог большой и содержит много низкоуровневых деталей. Generated contract должен стать компактным и стабильным источником baseline для runtime, agentic и тестов.

**Актуальное использование:** генерируется Athena и публикуется. В текущем Apollo runtime пока не является основным источником аудита; используется как подготовительный артефакт и база для следующих этапов миграции.

### `contract.overrides.json`

**Назначение:** ручные уточнения поверх `contract.generated.json`.

Типовые разделы:

- `publicApi`
- `nestedComponentAliases`
- `resetModel`
- компонентные alias
- ручная семантика variants

Пример смысла:

```json
{
  "publicApi": {
    "codeExports": ["BackgroundPlate", "BackgroundPlateView"]
  },
  "resetModel": {
    "variant.*": "reset-component-properties",
    "fill|stroke|layout.*": "reset-layer-properties"
  }
}
```

**Ценность:** raw-каталог не знает бизнес-семантику компонента. Например, он не может вывести, что `BackgroundPlateView` — alias, или что `BackgroundColor=modal-bg*` относится к модальным поверхностям.

**Актуальное использование:** создаётся Athena, если отсутствует, и не должен затираться. Сейчас это authoring/future-runtime слой; прямого чтения Apollo runtime нет.

### `examples.json`

**Назначение:** regression-примеры ожидаемого поведения Apollo и агента.

Типовые разделы:

- `examples[]`
- `inputChange`
- `expectedAudit`
- `expectedAgent`
- `mustNotSay`

Пример:

```json
{
  "exampleId": "background-plate-border-raw-stroke",
  "inputChange": {
    "property": "stroke",
    "variantContext": {
      "Type": "Border"
    },
    "actualTokenBinding": false
  },
  "expectedAgent": {
    "severity": "high",
    "recommendation": "Заменить raw stroke на цветовой токен дизайн-системы."
  }
}
```

**Ценность:** помогает проверять, что изменения в Apollo, Athena и агентских prompt не ломают договорённое поведение.

**Актуальное использование:** сейчас это QA/authoring слой. Runtime Apollo напрямую не читает файл; его стоит подключить к будущим тестам Athena/Apollo и использовать при ручной проверке агента.

### `README.md`

**Назначение:** человекочитаемое описание component package.

Типовые разделы:

- источник raw-каталога
- область применения
- список файлов
- ключевые правила интерпретации
- важные baseline

**Ценность:** ускоряет ревью, onboarding и ручное наполнение пакета.

**Актуальное использование:** только human-readable слой. Runtime не читает.

## Роли файлов в текущем Apollo runtime

Сейчас Figma-плагин Apollo загружает remote contract index и при аудите выбранной области докачивает пакетные артефакты для найденных компонентов.

Активно читаются runtime:

- `componentContractIndex.json`
- `rules.json`
- `composition-contract.json`

Индексируются, публикуются и нужны для развития pipeline, но пока не являются главным runtime-источником:

- `agent-context.json`
- `audit-mapping.json`
- `contract.generated.json`
- `contract.overrides.json`
- `examples.json`
- `README.md`

## Роли файлов в Athena CLI

Athena CLI отвечает за подготовку и публикацию комплектов:

- генерирует `contract.generated.json`;
- создаёт отсутствующие ручные документы;
- обновляет `componentContractIndex.json`;
- обновляет reference/index файлы;
- должна сохранять ручные правки и не затирать authoring-слой.

Критичное правило: generated-файлы можно перезаписывать, ручные файлы нельзя затирать без явного режима миграции.

## Generated vs manual

| Файл | Тип владения |
| --- | --- |
| `contract.generated.json` | Generated. Можно перезаписывать Athena. |
| `componentContractIndex.json` | Generated/index. Обновляется Athena. |
| `rules.json` | Manual-first. Athena может создать каркас, но не должна затирать ручные правила. |
| `composition-contract.json` | Manual-first. Athena может создать каркас/wraps, но доменные уточнения требуют ручной проверки. |
| `agent-context.json` | Hybrid. Athena обновляет `generated`, ручной смысл хранится в `manual`. |
| `audit-mapping.json` | Hybrid. Athena обновляет `generated`, ручной слой `manual` уточняет доменную семантику и legacy compatibility. |
| `contract.overrides.json` | Manual. Основной слой ручных уточнений поверх generated baseline. |
| `examples.json` | Manual. Regression-кейсы должны описывать реальное ожидаемое поведение. |
| `README.md` | Manual/human. |

## Что важно не сломать

- Не удалять `componentContractIndex.json`: без него Apollo strict mode не сможет загрузить remote component artifacts.
- Не затирать ручные `rules.json`, `agent-context.json`, `contract.overrides.json`, `examples.json`.
- Не считать наличие файла в `artifacts` гарантией runtime-использования. Сейчас Apollo runtime активно использует только часть комплекта.
- Не переносить agentic-файлы в отдельный репозиторий без обновления `referenceSourcesMVP.json`, `componentContractIndex.json` и GitHub Pages/хостинга.
- Не дублировать raw-каталог как `catalog.raw.json`, если источник raw уже лежит рядом в `JSONS/web/components/...`.

## Целевое развитие

1. Подключить `audit-mapping.json` к runtime Apollo как источник группировки, display names и reset surface.
2. Использовать `contract.generated.json` как компактный baseline вместо прямой зависимости от большого raw-каталога там, где это безопасно.
3. Добавить merge-модель для `audit-mapping`: generated base + manual overrides.
4. Подключить `examples.json` к regression-тестам Athena/Apollo.
5. Гарантировать, что `*_agent.json` получает релевантные `rules`, `agent-context` и evidence по компонентам, найденным в проверке.
