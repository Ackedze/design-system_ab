# Redpol Migration Notes

## What moved here

- `redpolRules/dictionary.json` -> `rules/dictionary.json`
- `redpolRules/llm/*.json` -> `llm/`
- `redpolRules/textGrabber/*` -> `textgrabber-cases/`
- `redpolRules/terms.docx` -> `sources/terms.docx`

## What did not change

- The internal case hierarchy under `textgrabber-cases/` was preserved.
- Individual case files and context snapshots were moved as-is.

## Follow-up

- Remove stale editor tabs pointing to old `redpolRules/...` paths.
- Decide later whether `standards/redpol` should remain local-only or become a private repository.
