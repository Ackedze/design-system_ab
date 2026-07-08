# Design System AB Data

Репозиторий общих данных дизайн-системы.

- `JSONS` — опубликованные каталоги компонентов, токенов, стилей, indexes и runtime-конфиги Apollo.
- `redpol` — материалы редакционной политики.
- `CONTRACTS` — скомпилированные Apollo DS contracts, полученные из нормализованных Figma-каталогов в `JSONS`.

JSON-отчёты проверок Apollo хранятся отдельно в `Ackedze/design-system_stats`.

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
