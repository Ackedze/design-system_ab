# Redpol Standards

This directory holds domain knowledge and reusable source material for Redpol-related text work.

## Structure

- `rules/` - stable rule dictionaries and normalization inputs
- `llm/` - reusable LLM-oriented prompt/context JSON files
- `textgrabber-cases/` - collected TextGrabber cases, snapshots, and context materials
- `sources/` - raw source documents kept for reference

## Usage

- Keep product code out of this directory.
- Add new domain rules to `rules/`.
- Add new case collections under `textgrabber-cases/` without flattening the business hierarchy.
- Treat this as standards content, not runtime output.
