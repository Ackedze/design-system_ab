# AmountInput component contract MVP

This folder contains an experimental component-contract layer for **Web _ Core / AmountInput**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- AmountInput.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Files

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — human-authored semantic layer: public API, anatomy, slots and reset model.
- `rules.json` — component-level rules and pattern-rule links.
- `audit-mapping.json` — how Apollo should classify and group AmountInput diffs.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo should use the generated contract to understand AmountInput states and baselines, then apply overrides/rules to interpret whether a diff is a component property change, slot configuration, layer customization or content text review.

The agent should receive `agent-context.json` or a smaller slice of it, not the full raw Figma catalog or the full generated contract.

## Current scope

This is a draft for AmountInput. It covers:

- `[D] AmountInput`
- `[D] AmountInput_Inverted`
- `[M] AmountInput`
- `[M] AmountInput_Inverted`
- `🔄 [D][Corporate] AmountInput`
- `🔄 [D][Corporate] AmountInput_Inverted`
- `🔄 [M][AO] AmountInput`
- `🔄 [M][AO] AmountInput_Inverted`

## Important audit rule

If a component state changes and then a layer is manually customized inside the new state, Apollo must compare the layer against the **current state baseline**, not the original state baseline.

variant.ErrorState: False -> True plus manual Field fill should compare fill against ErrorState=True baseline.
