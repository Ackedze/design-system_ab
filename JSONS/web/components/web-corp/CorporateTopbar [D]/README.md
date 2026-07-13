# CorporateTopbar [D] — component contract

Папка содержит generated baseline и ручной semantic layer для **Web _ Corp Components / [D] TopBar**.

Raw-каталог Figma остаётся источником структуры, вариантов и effective baseline:

`../Web _ Corp Components -- CorporateTopbar [D].json`

## Файлы

- `contract.generated.json` — автоматически сгенерированный structural baseline из raw-каталога.
- `contract.overrides.json` — ручная семантика публичного API, состояний, слотов и ограничений.
- `composition-contract.json` — ownership вложенных компонентов и правила композиции.
- `rules.json` — точные component rules для Apollo и агента.
- `audit-mapping.json` — generated классификация аудита и ручные правила интерпретации.
- `examples.json` — валидные и невалидные сценарии использования.
- `agent-context.json` — generated факты и ручной контекст для агента.

## Источник

- Библиотека: `Web _ Corp Components`
- Raw-каталог обновлён: `2026-07-09T07:11:39.994Z`
- Компонентов: `8`
- Публичный компонент: `[D] TopBar`
- Платформа: `desktop`, от `768 px`
- Статус комплекта: `Ready`

## Назначение

`[D] TopBar` используется над табличным, списочным или карточным представлением данных. Он показывает количество объектов, предоставляет контекстные и массовые действия и управляет настройками отображения данных.

Остальные компоненты пакета являются служебными и не используются вне `[D] TopBar`.
