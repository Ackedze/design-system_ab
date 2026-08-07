# TitleView component contract v2 experiment

This directory is an isolated, non-runtime duplicate of the production package at
`JSONS/web/components/web-corp/TitleView`.

## Safety

- Apollo does not load this directory.
- Athena package discovery does not scan `JSONS/experiments`.
- No production manifest, rules registry, composition registry or component index references it.
- `source/` is copied byte-for-byte from the production TitleView package.

## Target package shape

- `source/` keeps generated facts, manual overlays, examples and agent context as evidence.
- `compiled/component-contract.v2.json` contains compact Component API facts, stable selectors, typed RuleIR, capability requirements, remediation and coverage links.
- `schemas/apollo-component-contract-v2.schema.json` defines the experiment envelope and rule requirements.
- `coverage.json` prevents free-text or unsupported rules from silently becoming violations.

## Result

- Component API facts: 12
- Selectors: 17
- Executable RuleIR entries: 32
- Deterministic source rules covered as executable: 27/27
- LLM/advisory source rules promoted by stronger structural evidence: 1
- Advisory source rules: 13
- Unsupported deterministic source rules: 0

## Architectural invariant

Changing a TitleView rule that uses the declared capabilities must require only a contract
publication. Apollo code changes are allowed only when the contract requests a genuinely new
selector, fact, operator or remediation capability.

## Regeneration

`node scripts/build_title_view_contract_v2_experiment.js`
