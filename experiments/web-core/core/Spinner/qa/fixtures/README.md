# Immutable acceptance reports

`layout-r7/*.json.gz` preserves the exact bytes of the six L01–L06 user exports.
No fields, IDs, runtime sources, facts or outcomes are removed or rewritten.
SHA256 of decompressed bytes is pinned in `../layout-live-acceptance.2026-09-27.json`.
Regression tests read these fixtures, not the disposable `editor/` export folder.

Archive command from the repository root (safe to repeat; never overwrites fixtures):

```sh
node scripts/archive_component_acceptance_reports.js experiments/web-core/core/Spinner/qa/layout-live-acceptance.2026-09-27.json
```

Older 24-case and G01–G04 reports are absent from this checkout. Their acceptance
records are historical evidence, not substitutes for missing snapshot fixtures.
Restore original bytes from a saved copy before claiming another exact replay.
