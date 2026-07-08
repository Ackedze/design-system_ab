# Switch — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / Switch**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- Switch.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Файлы

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.
- `rules.json` — component-level rules and pattern-rule links.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs Switch.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo должен использовать the generated contract to understand Switch states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.

## Current scope

Это draft для Switch. Он покрывает:

- `Switch`
- `Switch_Inverted`
- `SwitchLabel`
- `SwitchLabel_Inverted`

## Important audit rule

Если состояние компонента изменилось, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.

variant.SelectedState: False -> True plus manual area fill should compare area fill against SelectedState=True baseline.
