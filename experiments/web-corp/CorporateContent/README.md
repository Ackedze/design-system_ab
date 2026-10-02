# CorporateContent component contract v2 experiment

Current accepted package: [authoring/README.md](authoring/README.md).
Mobile r6 draft: [mobile-web/authoring/README.md](mobile-web/authoring/README.md).
Owner-authored r11 was accepted on 2026-10-01 for six desktop rules / 17 RuleIR checks.
The canonical manual and current compiled projection are under authoring/.
The files and counts below describe the historical generated experiment.
Production publication, mobile/Section, code parity and full Code Connect
template publication are not included in this acceptance.

This package is excluded from Apollo production enforcement and Athena production discovery.
Apollo may load it only through the manually enabled Contract v2 test contour.

- Source package: `JSONS/web/components/web-corp/CorporateContent`
- Component API facts: 7
- Executable RuleIR entries: 18
- Deterministic coverage: 17/24
- Unsupported deterministic rules: 7
- Manual rules: 1
- Advisory rules: 7

Unsupported rules are intentional discovery results. Their candidate capabilities are recorded
in `coverage.json` and the root `capability-matrix.json`; they are never inferred from prose.
