# Design System AB Data

Репозиторий общих данных дизайн-системы.

- `JSONS` — опубликованные каталоги компонентов, токенов, стилей, indexes и runtime-конфиги Apollo.
- `redpol` — материалы редакционной политики.
- `CONTRACTS` — скомпилированные Apollo DS contracts, полученные из нормализованных Figma-каталогов в `JSONS`.

JSON-отчёты проверок Apollo хранятся отдельно в `Ackedze/design-system_stats`.

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

## Apollo DS contracts

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
