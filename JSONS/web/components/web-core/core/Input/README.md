# Input — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / Input**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- Input.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Файлы

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.
- `rules.json` — component-level rules and links to input-field pattern rules.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs Input.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo должен использовать the generated contract to understand Input states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.

## Current scope

Это draft для Input only. Он покрывает:

- `[D] Input`
- `[D] Input_Inverted`
- `[M] Input`
- `[M] Input_Inverted`
- scheduled Corporate/AO Input variants

## Important audit rule

Если состояние компонента изменилось, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.

Example:

`variant.ErrorState: False → True` followed by manual Field fill change should show:

`fill: <ErrorState=True Field baseline> → custom value`

not:

`fill: <ErrorState=False Field baseline> → custom value`.

## Pattern boundary

The component contract explains Input structure and states. The related pattern `Поля ввода` explains text rules for label, placeholder, hint and error messages.
