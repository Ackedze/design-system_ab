# Amount — ComponentContract v2

## Актуальный контракт: r5 · Ready для Figma

Компонентный контракт принят владельцем29.09.2026. Все рабочие данные находятся
в [authoring/README.md](authoring/README.md).

- Редактировать: [authoring/contract.manual.json](authoring/contract.manual.json).
- В Editor0.2.57 загрузить: [Amount.editor-input.zip](authoring/editor/Amount.editor-input.zip).
- Читать машинно: [compiled ComponentContract](authoring/compiled/component-contract.v2.json).
- Проверить приёмку и ограничения: [acceptance.json](authoring/reports/acceptance.json).

31 reviewed source rules /47 RuleIR;3 явных разрешения policy-only;0 excluded.
32 архивных снимка /1 666 результатов сохраняют поведение r4→r5.
Core Amount допускает разные библиотечные Text Style и токены; AmountStyles,
продуктовые паттерны и frontend mapping не входят в этот контракт.

## Старый source-only эксперимент — не рабочий manual-контракт

Соседние `compiled/`, `coverage.json` и `execution-policy.json` относятся к старому
эксперименту, подключённому через `experiments/runtime-index.json`. Они не заменены;
байтовый архив — `history/pre-manual-v2/`. Не импортировать их вместо authoring ZIP.

Новый `authoring/runtime/` имеет статус Ready, но `published=false` и не подключён
к production/legacy индексу. Разделение предотвращает незаметное изменение Apollo.
Публикация, Hub projection и code bridge — отдельный следующий этап.
