# ButtonsGroup component contract v2 experiment

Новый ручной authoring: [разбор правил от 01.10.2026](authoring/ANALYSIS.ru.md).
Владелец разрешил одну видимую Button, подтвердил View Primary/Secondary и
отменил Hug/Hug rule. Новый manual заполняется вручную; старый эксперимент
ниже не переписан и не объявлен принятым по новым решениям. Capture paths,
прямые dependencies и conditional collection rules требуют общих доработок.

This package is excluded from Apollo production enforcement and Athena production discovery.
Apollo may load it only through the manually enabled Contract v2 test contour.

- Source package: `JSONS/web/components/web-corp/ButtonGroup [D]`
- Component API facts: 2
- Executable RuleIR entries: 15
- Deterministic coverage: 4/17
- Unsupported deterministic rules: 13
- Manual rules: 16
- Advisory rules: 1

Unsupported rules are intentional discovery results. Their candidate capabilities are recorded
in `coverage.json` and the root `capability-matrix.json`; they are never inferred from prose.
