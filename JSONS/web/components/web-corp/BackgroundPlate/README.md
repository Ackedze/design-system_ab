# BackgroundPlate contract package

Source raw catalog:

`JSONS/web/components/web-corp/Web _ Corp Components -- BackgroundPlate.json`

This folder is an experimental Apollo contract package. It does not replace the raw catalog used by the current Apollo audit.

## Файлы

- `contract.generated.json` - compact generated baseline from the raw catalog.
- `contract.overrides.json` - public API, aliases and reset model.
- `composition-contract.json` - composition and nested ownership model.
- `rules.json` - draft machine-readable rules.
- `audit-mapping.json` - mapping from diff properties to Apollo audit categories.
- `examples.json` - regression examples for expected Apollo behavior.
- `agent-context.json` - compact context for Apollo agent.

## Источник

- Библиотека: `Web _ Corp Components`
- File: `Web _ Corp Components`
- Сгенерировано: `2026-06-05T16:07:39.725Z`

## Примечания

- BackgroundPlate wraps Style Level 1 or Style Level 2 depending on Position.
- Style Level components carry the actual background fill baseline through BackgroundColor, Type and Skeleton variants.
- BackgroundPlateSlot exposes slot padding and Type/Skeleton variants; normal slot content is not a customization by itself.
