# TitleView contract package

Source raw catalog:

`JSONS/web/components/web-corp/Web _ Corp Components -- TitleView.json`

This folder is an experimental Apollo contract package. It does not replace the raw catalog used by the current Apollo audit.

## Files

- `contract.generated.json` - compact generated baseline from the raw catalog.
- `contract.overrides.json` - public API, aliases and reset model.
- `composition-contract.json` - composition and nested ownership model.
- `rules.json` - draft machine-readable rules.
- `audit-mapping.json` - mapping from diff properties to Apollo audit categories.
- `examples.json` - regression examples for expected Apollo behavior.
- `agent-context.json` - compact context for Apollo agent.

## Source

- Library: `Web _ Corp Components`
- File: `Web _ Corp Components`
- Generated at: `2026-06-05T16:07:39.725Z`

## Notes

- Nested [D]/[M] Button instances inside Button group are part of the TitleView baseline; variant changes by the designer should be reported against the TitleView effective baseline.
- StatusPreset and Status inside MainContent / Status are expected nested structures; preset usage itself is normal unless the preset is manually changed beyond its variant API.
- View and Skeleton are the public TitleView component properties.
