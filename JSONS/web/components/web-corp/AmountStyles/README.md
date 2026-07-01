# AmountStyles component contract MVP

This folder contains an experimental component-contract layer for **Web _ Corp Components / AmountStyles**.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- AmountStyles.json`

A preserved package-local copy is also stored as `catalog.raw.json` for migration testing.

## Files

- `catalog.raw.json` - preserved source catalog copy for this package.
- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` - human-authored semantic layer for amount typography and operation parts.
- `composition-contract.json` - ownership model for AmountHeadline, AmountParagraph and Operation.
- `rules.json` - component-level rules.
- `audit-mapping.json` - how Apollo should classify and group AmountStyles diffs.
- `examples.json` - MVP fixtures for Apollo and agent interpretation.
- `agent-context.json` - compact context for agent-side interpretation.

## Source

- Library: `Web _ Corp Components`
- File: `Web _ Corp Components`
- Generated at: `2026-06-05T16:07:39.725Z`
- Components: `4`

## Current Scope

This package covers `AmountHeadline`, `AmountParagraph` and the nested `Operation` part. Apollo should treat `Style` and `Negative` as component/part configuration, while manual paint/text changes on leaf text layers such as `Minus`, `Major`, `Minor` and `Currency` remain layer customizations.

## Important Audit Rule

When a paint change is detected on `Operation / Minus`, Apollo should keep the exact leaf path for reset, but the agent should describe it as a color customization of the amount operation sign inside `AmountParagraph` or `AmountHeadline`.
