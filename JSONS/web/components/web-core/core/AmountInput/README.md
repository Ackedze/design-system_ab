# AmountInput — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / AmountInput**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- AmountInput.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Файлы

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.
- `rules.json` — component-level rules and pattern-rule links.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs AmountInput.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo должен использовать the generated contract to understand AmountInput states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.

## Current scope

Это draft для AmountInput. Он покрывает:

- `[D] AmountInput`
- `[D] AmountInput_Inverted`
- `[M] AmountInput`
- `[M] AmountInput_Inverted`
- `🔄 [D][Corporate] AmountInput`
- `🔄 [D][Corporate] AmountInput_Inverted`
- `🔄 [M][AO] AmountInput`
- `🔄 [M][AO] AmountInput_Inverted`

## Important audit rule

Если состояние компонента изменилось, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.

variant.ErrorState: False -> True плюс ручной Field fill должен сравнивать fill с ErrorState=True baseline.
