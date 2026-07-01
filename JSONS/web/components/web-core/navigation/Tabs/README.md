# Web Core Navigation Tabs contract package

Source raw catalog:

`JSONS/web/components/web-core/navigation/Web _ Core Navigation -- Tabs.json`

This folder is an experimental Apollo contract package for the Web Core Navigation Tabs catalog. It does not replace the raw catalog used by the current Apollo audit.

## Файлы

- `contract.generated.json` - compact generated baseline from the raw catalog.
- `contract.overrides.json` - public API, aliases and reset model.
- `composition-contract.json` - standalone composition model for `TabsPrimary`, `TabPrimary` and secondary tabs.
- `rules.json` - draft machine-readable rules.
- `audit-mapping.json` - mapping from diff properties to Apollo audit categories.
- `examples.json` - regression examples for standalone and host-owned nested baselines.
- `agent-context.json` - compact context for Apollo agent.

## Important baseline

Standalone core `TabPrimary` uses:

- `layout.itemSpacing = 12`
- `Label styles.text = Paragraph/18–24 Primary Large`

When `[D] TabsView` intentionally changes these values to `16` and `Action/18–24 Primary Large`, this should be interpreted through the host `TabsView` composition contract, not as a direct core Tabs violation.
