# IconButton — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / IconButton**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- IconButton.json`

A preserved package-local copy is also stored as `catalog.raw.json` for migration testing.

## Файлы

- `catalog.raw.json` - preserved source catalog copy for this package.
- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy и reset model.
- `composition-contract.json` - internal Icon ownership model.
- `rules.json` - component-level rules.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs IconButton.
- `examples.json` - MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` - compact context that can be passed to the agent instead of the generated contract.

## Источник

- Библиотека: `Web _ Core`
- File: `Web _ Core`
- Сгенерировано: `2026-06-05T12:00:35.744Z`
- Компонентов: `9`

## Current scope

This package covers desktop, mobile, inverted and scheduled corporate IconButton variants plus the internal `🔩 Icon` part.

## Important audit rule

Если меняется `View`, `Size`, `TransparentBg` или nested `Icon.Type`, а затем layer кастомизируется вручную, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.
