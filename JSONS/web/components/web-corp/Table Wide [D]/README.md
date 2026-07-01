# Table Wide [D] contract package

Source raw catalog:

`JSONS/web/components/web-corp/Web _ Corp Components -- Table _ Wide [D].json`

This folder is an experimental Apollo contract package. It keeps the raw catalog and generated runtime context for table-family audits.

## Файлы

- `catalog.raw.json` - preserved source catalog copy for this package.
- `contract.generated.json` - compact generated baseline from the raw catalog.
- `contract.overrides.json` - public API, aliases and reset model.
- `composition-contract.json` - composition and nested ownership model.
- `rules.json` - draft machine-readable rules.
- `audit-mapping.json` - mapping from diff properties to Apollo audit categories.
- `examples.json` - regression examples for expected Apollo behavior.
- `agent-context.json` - compact context for Apollo agent.

## Источник

- Библиотека: `Web :: Corp Components`
- File: `Web :: Corp Components`
- Сгенерировано: `2026-04-28T16:08:11.293Z`
- Компонентов: `21`

## Примечания

- Treat table rows, cells and add-ons as one table family context.
- Component properties and manual layer/style changes should be reported independently.
- Use the selected table component effective baseline before falling back to standalone nested component baselines.
