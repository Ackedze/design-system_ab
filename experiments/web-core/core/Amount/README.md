# Amount component contract v2 experiment

## Актуальная работа: manual authoring r4 · 29.09.2026

Новый компонентный контракт находится в [`authoring/README.md`](authoring/README.md).
Единственный редактируемый источник — `authoring/contract.manual.json`;
для Editor 0.2.57 загрузить `authoring/editor/Amount.editor-input.zip` r4.
R4 требует библиотечный Text Style у каждого видимого диапазона Major/Minor/Currency,
но позволяет разные стили. Каталог закреплён в Athena evidence; 31 source/47 IR.
Два пропуска detach в r3 исправлены на сохранённых снимках. Новая live-приёмка ожидается;
QA: `authoring/reports/text-style-binding-r4.2026-09-29.json`.

История предыдущего шага:
R2 исправил одиночную identity и bindings; r3 закрепляет решения владельца:
цвета Major/Minor/Currency только через токены, Custom — любой текст, Addon — любой
native swap без видимого исходного placeholder. Нормы AmountStyles не перенесены.
28 source/44 IR,510 Editor и290 package regressions; прежние18 raw snapshots
повторно вычислены:10 полных положительных,6 полных отрицательных,2 неполных.
Новые8 live-отчётов r3 приняты:3 положительных,5 отрицательных, все complete;
engine/editor/details совпали при replay. Подтверждены token binding Currency,
свободный Addon swap, Custom-текст и запрет исходного placeholder. Полный разбор —
`authoring/reports/live-review-r3.2026-09-29.json`.
Это **Draft**, не принятый третий контракт: остаток граничной live-матрицы указан в
`authoring/TESTCASES.md`. R2 сохранён в `history/r2-editor-0.2.55/`.

В этом каталоге уже находился старый source-only эксперимент, подключённый через
`experiments/runtime-index.json`. Его `compiled/`, `coverage.json` и
`execution-policy.json` не заменены; байтовый архив — `history/pre-manual-v2/`.
Новый `authoring/runtime/` не опубликован и не подключён к этому индексу.
Разделение каталогов временное: предотвращает незаметное изменение старого Apollo.

## Старый source-only эксперимент (не новый manual-контракт)

This package is excluded from Apollo production enforcement and Athena production discovery.
Apollo may load it only through the manually enabled Contract v2 test contour.

- Source package: `JSONS/web/components/web-core/core/Amount`
- Component API facts: 5
- Executable RuleIR entries: 5
- Deterministic coverage: 4/4
- Unsupported deterministic rules: 0
- Manual rules: 0
- Advisory rules: 0

Unsupported rules are intentional discovery results. Their candidate capabilities are recorded
in `coverage.json` and the root `capability-matrix.json`; they are never inferred from prose.
