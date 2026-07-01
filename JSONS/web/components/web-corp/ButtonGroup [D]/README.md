# ButtonGroup [D] contract package

Source raw catalog:

`JSONS/web/components/web-corp/Web _ Corp Components -- ButtonGroup [D].json`

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

- Nested [D]/[M] Button variant properties inside ButtonsGroup are part of the group baseline and must be compared against the ButtonsGroup effective baseline.
- Changing a nested button property such as SingleIcon, View, Size or DisabledState should be reported as a component-property customization.
- Manual layer changes on the same nested button must use the nested button effective baseline after variant changes are applied.
