# TabsView — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Corp Components / TabsView**.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- TabsView.json`

That file is intentionally not edited by hand. It stores the exported Figma component structures, variants, nested layers, fills, strokes, text styles and token references.

## Файлы

- `contract.generated.json` — generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.
- `composition-contract.json` — ownership rules for nested TabsPrimary/TabsSecondary overrides.
- `rules.json` — component-level and composition-level rules.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs TabsView.
- `examples.json` — MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` — compact context that can be passed to the agent instead of the generated contract.

## Intended use

Apollo должен использовать TabsView effective baseline for nested TabsPrimary/TabsSecondary differences. Wrapper-owned overrides must not be reported as customizations when actual equals the effective baseline.

Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.

## Important audit rule

Standalone nested component baseline is not enough for composite components.

Example:

`TabsPrimary / Items.itemSpacing: 24 → 32` is not a customization when `32` is TabsView effective baseline.

If designer changes it to `40`, Apollo should show:

`TabsPrimary / Items.itemSpacing: 32 → 40`.
