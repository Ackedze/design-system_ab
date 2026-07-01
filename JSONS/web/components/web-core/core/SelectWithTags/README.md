# SelectWithTags — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / SelectWithTags**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- SelectWithTags.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Файлы

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.
- `rules.json` — component-level rules and pattern-rule links.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs SelectWithTags.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo должен использовать the generated contract to understand SelectWithTags states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.

## Current scope

Это draft для SelectWithTags. Он покрывает:

- `[D] SelectWithTags`
- `[D] SelectWithTags_Inverted`
- `[M] SelectWithTags`
- `[M] SelectWithTags_Inverted`
- `🔄 [D][Corporate] SelectWithTags`
- `🔄 [D][Corporate] SelectWithTags_Inverted`
- `🔄 [M][AO] SelectWithTags`
- `🔄 [M][AO] SelectWithTags_Inverted`
- `🔩 Tag`
- `🔩 Tag_Inverted`
- `🔩 TagControl`
- `🔩 TagControl_Inverted`
- `🔩 Value`

## Important audit rule

Если состояние компонента изменилось, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.

variant.ErrorState: False -> True plus manual Field fill should compare fill against ErrorState=True baseline; Tag visual changes should remain separate layer customizations.
