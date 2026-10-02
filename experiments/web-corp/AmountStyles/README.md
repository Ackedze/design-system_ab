# AmountStyles component contract v2 experiment

Актуальный редактируемый пакет: [authoring/README.md](authoring/README.md), **r10 Ready для Figma** (Editor ≥ 0.2.64), принят 2026-09-30.
Единственный manual находится в `authoring/contract.manual.json`; пакет Editor —
`authoring/editor/AmountStyles.editor-input.zip`. Ниже описан прежний runtime-эксперимент;
он сохранён и не перенаправлен на новый пакет. Production-публикация и связь с кодом не входят в эту приёмку.

This package is excluded from Apollo production enforcement and Athena production discovery.
Apollo may load it only through the manually enabled Contract v2 test contour.

- Source package: `JSONS/web/components/web-corp/AmountStyles`
- Component API facts: 4
- Executable RuleIR entries: 13
- Deterministic coverage: 12/29
- Unsupported deterministic rules: 17
- Manual rules: 0
- Advisory rules: 20

Unsupported rules are intentional discovery results. Their candidate capabilities are recorded
in `coverage.json` and the root `capability-matrix.json`; they are never inferred from prose.
