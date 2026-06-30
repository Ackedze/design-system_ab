# TabsView component contract MVP

This folder contains an experimental component-contract layer for **Web _ Corp Components / TabsView**.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- TabsView.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Files

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — human-authored semantic layer: public API, anatomy, slots and reset model.
- `composition-contract.json` — ownership rules for nested TabsPrimary/TabsSecondary overrides.
- `rules.json` — component-level and composition-level rules.
- `audit-mapping.json` — how Apollo should classify and group TabsView diffs.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo should use TabsView effective baseline for nested TabsPrimary/TabsSecondary differences. Wrapper-owned overrides must not be reported as customizations when actual equals the effective baseline.

The agent should receive `agent-context.json` or a smaller slice of it, not the full raw Figma catalog or the full generated contract.

## Important audit rule

Standalone nested component baseline is not enough for composite components.

Example:

`TabsPrimary / Items.itemSpacing: 24 → 32` is not a customization when `32` is TabsView effective baseline.

If designer changes it to `40`, Apollo should show:

`TabsPrimary / Items.itemSpacing: 32 → 40`.
