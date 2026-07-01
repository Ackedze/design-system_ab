# Button component contract MVP

This folder contains an experimental component-contract layer for **Web _ Core / Button**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- Button.json`

That file is intentionally not edited by hand. It is large and complete: it stores the exported Figma component structures, variants, nested layers, fills, text styles and token references.

## Files

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — human-authored semantic layer: public API, slots, internal layers and reset model.
- `rules.json` — source of truth for component-level rules and links to pattern rules.
- `audit-mapping.json` — how Apollo should classify and group Button diffs.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact explanatory context that can be passed to the agent instead of the generated contract. It references rule ids but does not duplicate rule text or severity.

There is no `composition-contract.json` for Button in this MVP. Button is treated as a standalone core component: its baselines come from the raw/generated component contract plus semantic overrides and rules. `composition-contract.json` is only needed when a wrapper component owns nested component overrides and must declare an effective baseline for those nested layers.

## Intended use

Apollo should use the generated contract to understand component states and baselines, then apply overrides and rules to interpret whether a diff is a component property change, slot configuration, layer customization, or component-contract violation.

The agent should receive matched rules from `rules.json` and, when needed, `agent-context.json` or a smaller slice of it. The agent should not receive the full raw Figma catalog or the full generated contract.

## Current scope

This is a draft for Button only. It covers:

- `[D] Button`
- `[D] Button_Inverted`
- `[M] Button`
- `[M] Button_Inverted`
- scheduled Corporate Button variants
- `Addon` part components

## Important audit rule

If a component property changes and then a layer is manually customized inside the new state, Apollo must compare the layer against the **current state baseline**, not the original state baseline.

Example:

`variant.View: Primary → Accent` followed by manual fill change should show:

`fill: Button/Desktop/Colors/Accent/bg → custom value`

not:

`fill: Button/Desktop/Colors/Primary/bg → custom value`.
