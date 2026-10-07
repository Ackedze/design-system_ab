# ButtonsGroup — desktop контракт

Текущая версия — **r57**, Editor/core producer `0.2.90`. Паспорт заполнен
05.10.2026 по исходным 32 нормам и решениям владельца. Пакет в целом **Draft**:
17 authored Figma-правил имеют статус Reviewed, девять правил сценария и
поведения — Draft с маршрутом `context-only` и явными `missingFacts`.

Source of truth — [contract.manual.json](contract.manual.json).
Для Editor — [ButtonsGroup.component-contract.zip](ButtonsGroup.component-contract.zip);
его актуальная копия находится в `current-contract-packages`.

## Паспорт

- Назначение, условия выбора, ограничения применения и ключевые слова.
- Product layer и точный desktop Figma component set locator.
- API: `Size` — строки `32/40/48/56`; `Overflow` — строки `false/true`.
  Оба свойства имеют тип VARIANT в Figma. Code props не выведены из этих имён.
- Источники, принятые решения, инструкции генерации, два примера выбора
  варианта Size=56 и три Draft-сценария для последующей проверки.
- Точные Button r31 и Spinner r8 pins и все исходные targets сохранены.

## Как зафиксированы остальные нормы

Выбор штатной группы, свобода Label и границы состояний/видимости описаны
в semantics, decisions и generation instructions. Общий минимум — одна
видимая кнопка. Legacy минимум две и root Hug/Hug отменены в audit решений.
SingleIcon и Overflow=true сохраняют отдельный минимум две.

Девять Draft context-only правил задают приоритет действий, порядок переноса,
открытие и тип overflow, сохранение содержимого, уникальность action identity,
disabled/Tooltip, закрытие после выбора и runtime Loading. У каждого есть
RuleID, нормативный владелец, sourceRefs, rationale и missingFacts.
Они не создают фиктивные исполняемые predicates. `missingFacts` — требования
к будущему адаптеру; это не уже поддержанные runtime paths.

Все 32 исходные нормы учтены в [crosswalk](reports/rule-crosswalk.json),
включая правила, выраженные паспортом, зависимости и отменённые нормы.
Подпись Label не заменяет action identity или приоритет сценария.

## Проверено и что осталось

[Проверка пакета](reports/passport-verification.2026-10-05.json): ошибок схемы
и компиляции нет; 30 существующих Figma predicates сохранили свои тела и RuleID;
generated evidence и полный dependency closure не изменены; manual после
ZIP import совпадает побайтно по сериализованным полям, повторная компиляция
даёт тот же контракт. Shared compiler Apollo совпадает с Editor.

Пакет не содержит исходные Athena JSON. Как и входной r56, прямой core import
многовариантного набора восстанавливает параметры и manual, но не anatomy.
Для редактирования слоёв нужен live preview либо исходный Athena-пакет.
Это ограничение не превращено в новое доказательство target identity.

Открыты: checker и факты девяти context-only норм; source code mapping;
подтверждение четырёх occurrences для Size 32/40/48 и live original/swap/reset;
отдельный mobile контракт; актуализация human-проекций Hub по решениям
владельца. Этот пакет не включён в accepted/production collection.

Следующий вход — подтверждённый mapping/API из NEXT-01 общей очереди
`docs/APOLLO_NEXT_PRIORITIES.md`. До генерации Figma или фронта требуется
подтверждение доступного code export в `arui-private`. Два профиля в паспорте
пока описывают выбор известных Figma variants; они не закрывают этот preflight
и не разрешают выводить code API из имени ButtonsGroup.

Исходный экспорт r56 сохранён в `history/r56-editor-0.2.90`.


NEXT-02 technical source/API fields (2026-10-05): main r58, manualSourceHash `a5517e6141f0c373dea37fd8e133437bcc11bdd7adde9a2f193c5bca075a2548`; source Predicate draft in the unchanged Figma rule scope. Code representation Draft, parity not-confirmed, acceptance not-run, publication not-confirmed; no accepted code generation profile/native write capability. Details: `reports/next-02.typed-passport-application.2026-10-05.json`. Historical source/ZIP preserved in `r57-before-next-02-typed-code-2026-10-05`.


Owner review 2026-10-06: main r59, all 26 rules Reviewed (17 existing + 9 approved context-only). Exact norm texts/IDs/sourceRefs/applicability/owner/routes/constraints, 30 existing predicate bodies and full facts unchanged. Canonical package remains Draft due nine nonExecutable context rules; no Ready override. Content-only CorporateContent desktop → native Body → ButtonsGroup Size56/Overflow=false/two normal text Button pilot scope confirmed; code/native profile, product facts, parity, source equivalence, mutation/live/release remain separate. Current pins and honest coverage: `reports/owner-review-application.2026-10-06.json`; historical r58: `history/r58-before-owner-review-2026-10-06`.
