# IconButton component contract MVP

This folder contains an experimental component-contract layer for **Web _ Core / IconButton**.

The raw Figma catalog remains the source of truth:

`../Web _ Core -- IconButton.json`

A preserved package-local copy is also stored as `catalog.raw.json` for migration testing.

## Files

- `catalog.raw.json` - preserved source catalog copy for this package.
- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` - human-authored semantic layer: public API, anatomy and reset model.
- `composition-contract.json` - internal Icon ownership model.
- `rules.json` - component-level rules.
- `audit-mapping.json` - how Apollo should classify and group IconButton diffs.
- `examples.json` - MVP fixtures for testing Apollo and agent interpretation.
- `agent-context.json` - compact context that can be passed to the agent instead of the generated contract.

## Source

- Library: `Web _ Core`
- File: `Web _ Core`
- Generated at: `2026-06-05T12:00:35.744Z`
- Components: `9`

## Current scope

This package covers desktop, mobile, inverted and scheduled corporate IconButton variants plus the internal `🔩 Icon` part.

## Important audit rule

If `View`, `Size`, `TransparentBg` or nested `Icon.Type` changes and then a layer is manually customized, Apollo must compare the layer against the **current state baseline**, not the original state baseline.
