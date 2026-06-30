# Input component contract MVP

This folder contains an experimental component-contract layer for **Web _ Core / Input**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- Input.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Files

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — human-authored semantic layer: public API, anatomy, slots and reset model.
- `rules.json` — component-level rules and links to input-field pattern rules.
- `audit-mapping.json` — how Apollo should classify and group Input diffs.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo should use the generated contract to understand Input states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

The agent should receive `agent-context.json` or a smaller slice of it, not the full raw Figma catalog or the full generated contract.

## Current scope

This is a draft for Input only. It covers:

- `[D] Input`
- `[D] Input_Inverted`
- `[M] Input`
- `[M] Input_Inverted`
- scheduled Corporate/AO Input variants

## Important audit rule

If a component state changes and then a layer is manually customized inside the new state, Apollo must compare the layer against the **current state baseline**, not the original state baseline.

Example:

`variant.ErrorState: False → True` followed by manual Field fill change should show:

`fill: <ErrorState=True Field baseline> → custom value`

not:

`fill: <ErrorState=False Field baseline> → custom value`.

## Pattern boundary

The component contract explains Input structure and states. The related pattern `Поля ввода` explains text rules for label, placeholder, hint and error messages.
