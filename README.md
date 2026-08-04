# Design System AB Data

Репозиторий общих данных дизайн-системы.

- `JSONS` — опубликованные каталоги компонентов, токенов, стилей, indexes и runtime-конфиги Apollo.
- `redpol` — материалы редакционной политики.
- `CONTRACTS` — скомпилированные Apollo DS contracts, полученные из нормализованных Figma-каталогов в `JSONS`.

JSON-отчёты проверок Apollo хранятся отдельно в `Ackedze/design-system_stats`.

## Apollo Agent и Langflow

Исходные prompts Apollo Agent находятся в `apollo/instructions`. Agent поддерживает два независимых режима: автоматический `audit-analysis` по `apollo-agent-report` и многоходовый `design-dialogue` о паттернах, правилах применения компонентов и проектировании.

Экспортированные JSON flow хранятся в `apollo/flows`, но ручное обновление flow выполняется через интерфейс Langflow. Пошаговая настройка узлов, memory, tools и smoke tests описана в [`apollo/LANGFLOW_DIALOGUE_SETUP.md`](./apollo/LANGFLOW_DIALOGUE_SETUP.md).

Дочерний flow `apollo_reading_patterns` выполняет общий поиск по документам Confluence-пространства DESIGN через стандартный Langflow-компонент `RAG v.2` (`domain 571`, `source Confluence`). База продуктовых примеров остаётся отдельным инструментом `apollo_reading_rag`. [`apollo/pattern-registry.json`](./apollo/pattern-registry.json) является локальным каталогом нормативных pattern-файлов: он связывает source files с pattern ids, component names, aliases и rule ids, но не ограничивает runtime-поиск. Registry пересобирается командой `python3 apollo/scripts/build_pattern_registry.py`.

Релевантные документы любого типа могут попасть в ответ DESIGN search. Только документ с точным `documentType: pattern` имеет нормативную силу; остальные материалы маркируются как контекст пространства и не превращаются в обязательные правила. Ответ всегда сохраняет title и URL источника, а отсутствие результатов нельзя компенсировать знаниями модели. Перечень паттернов считается полным только при наличии явного registry/inventory-документа в найденных источниках.

Design dialogue работает в closed-book режиме: каждое фактическое утверждение должно быть представлено атомарным claim с `source_quote` и `source_url`. Числа, брейкпоинты, токены, variants, компоненты и технические механизмы нельзя выводить из заголовка, общего описания документа или знаний модели. Если найденный chunk содержит только обзор, Agent сообщает о неполном coverage вместо восстановления деталей.

В пользовательском ответе evidence отображается без служебных JSON-полей: statement сопровождается отдельной Markdown-цитатой и ссылкой с названием source-документа. Ключи `source_quote/source_url`, сырые URL, псевдоfootnotes `【...】` и повторяющий блок `Итого` в UI не выводятся.

Перед настройкой Pattern Agent доступность документов проверяется отдельным `apollo_pattern_rag_probe`: `Chat Input -> RAG v.2 -> Chat Output`, без LLM и post-filter. Пустой raw `chunks` в этом flow означает проблему ARAG domain/source/indexing, которую нельзя исправить prompt-правилами.

## Наполнение component packages

- `COMPONENT_AUTHORING.md` — командный workflow подготовки corp-компонентов.
- `AGENTIC_FILES.md` — назначение, ownership и runtime-роль каждого документа.
- `CLAUDE.md` и `.claude/skills/corp-component-authoring/` — воспроизводимые инструкции для Claude Code.

Для начала новой сессии в Claude Code открой репозиторий и вызови `/corp-component-authoring <ComponentName>`.

## Точность REST-каталогов

Если Figma REST не возвращает радиус маски или `BOOLEAN_OPERATION`, Athena CLI сохраняет известное значение из предыдущего опубликованного каталога по точному совпадению component key, variant key и semantic path. Для `IconView` эталонная матрица Shape/Border: размеры `128/80/72` используют радиус `6`, `64/56/48` — `4`, `40/32/24/20/16` — `2`.

## Runtime-конфиг Apollo

Декларативные правила оценки кастомизаций находятся в `JSONS/apollo/patternRules.json`. Ссылка на них задаётся через `apollo.patternRulesPath` в `JSONS/referenceSourcesMVP.json`.

После изменения правил нужно проверить валидность JSON и опубликовать этот репозиторий. Apollo загружает конфиг при каждом запуске с cache-busting параметром, поэтому после публикации достаточно перезапустить плагин; пересборка Apollo не требуется. Не удаляйте конфиг и не меняйте поддерживаемый `schemaVersion` без синхронного изменения валидатора Apollo: невалидный конфиг блокирует reference bootstrap.

Явные замены устаревших компонентов и стилей находятся в `JSONS/apollo/remediations.json`; путь объявлен как `apollo.remediationConfigPath` в bootstrap manifest. Ключ объекта — исходный опубликованный Figma key, target key задаётся через `replacementComponentKey` или `replacementStyleKey`. Apollo показывает действие только для валидной однозначной записи и повторно проверяет исходный key перед мутацией. Изменения этого файла не требуют пересборки Apollo, но требуют публикации GitHub Pages и перезапуска плагина.

Пары Desktop/MobileWeb не дублируются в этом конфиге: Athena записывает безопасные same-page пары в `channelCounterparts` соответствующего component index. Если family неоднозначна, связь не публикуется и кнопка замены в Apollo не появляется.

## Apollo DS contracts

Runtime registry находится в `JSONS/apollo/indexes/componentContractIndex.json` и использует schema v2. Каждый пакет объявляет coverage `required | optional | none`; для `required` обязательны `rules.json` и `composition-contract.json`. Figma keys в итоговом индексе уникальны: если один компонент встречается в нескольких catalog pages, Athena назначает владельца детерминированно с приоритетом active/current компонента, совпадения имени family и более нового каталога.

Перед публикацией обязательно выполнить в Athena CLI:

```bash
npm run contracts:check-apollo
npm run catalogs:sync-apollo -- --check
```

Athena release публикуется только из локальной ветки `main` в `origin/main`.
Feature-ветки нельзя использовать как накопительный target для выгрузок каталогов:
независимые Android, Web и contract batches переносятся и проверяются поэтапно,
после чего каждый следующий batch строится поверх уже валидного `main` snapshot.
Publisher Athena CLI отклоняет запуск из любой другой ветки до создания commit.

Reference manifest и contract index публикуются одним снимком. Apollo schema v2 не использует fallback для отсутствующих component indexes и блокирует проверку при неполном обязательном bootstrap.

Конвертация нормализованных Figma-каталогов в компактные runtime-контракты выполняется локальным скриптом:

```bash
node scripts/convert_figma_catalogs_to_contracts.js \
  JSONS/web/components/web-core/core \
  JSONS/web/components/web-corp \
  --out CONTRACTS/web/components
```

Результат:

- `CONTRACTS/web/components/manifest.json`
- `CONTRACTS/web/components/compiled/**/*.generated-contracts.json`
- `CONTRACTS/web/components/conversion-summary.json`

Скрипт не изменяет raw-файлы в `JSONS`. Перед записью он пересоздаёт только generated-директорию `CONTRACTS/web/components/compiled`.

Быстрая проверка converter logic:

```bash
node scripts/convert_figma_catalogs_to_contracts.js --self-test
```
