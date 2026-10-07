# CorporateContent mobile-web — главный manual r7

05.10.2026 главный источник восстановлен побайтно из закреплённого owner ZIP r7. История предыдущего main r6, рабочего ZIP и проекций сохранена в `history/r6-primary-before-owner-r7-2026-10-05`.

Шесть нормативных правил, 17 Predicate checks, targets, control ports и Figma facts совпали с прежней принятой областью. Добавленных норм нет. Body semantic API, паспорт, Figma generation fields и metadata теперь соответствуют owner export. Code fields из NEXT-02 остаются предложениями и не применены.

Текущий редактируемый источник: `contract.manual.json`. Рабочий ZIP: `editor/CorporateContent.mobile-web.component-contract.zip` — точная копия текущего owner ZIP. Принятый ZIP в current-contract-packages не изменён; его manual/facts/compiled hashes сохранены. Predicate Ready остаётся только для шести Figma норм; code, layout parity, внешнее Body содержимое и публикация вне этой приёмки.

Проверки и полный diff: `reports/next-02.primary-source-reconciliation.2026-10-05.json`. Оригинальная `reports/acceptance.json` сохранена как историческое доказательство приёмки r6; новых live проверок этим переносом не заявляется.

---

## Историческое описание до восстановления main

# [M] CorporateContent — ручной контракт r6, Ready

Подготовлен 01.10.2026 по мобильному авторскому экспорту r5 и принятому
desktop r11. Владелец запросил аналогичные правила. Component ID
`corporate-content.mobile-web`, существующие мобильные RuleID и component key
сохранены. Desktop manual r11 не изменён.

Общий контекст: [Apollo / Athena backlog](codex://threads/019f5a6b-8886-7071-a415-f032bbbce8c5).

Для Editor импортировать один
[`CorporateContent.mobile-web.component-contract.zip`](editor/CorporateContent.mobile-web.component-contract.zip).
В `experiments/current-contract-packages` теперь сохранён owner export r7:
изменены только revision/updatedAt, нормативная семантика r6 та же. Checker
проверяет этот экспорт отдельно и не перезаписывает его. После ручных изменений
экспортировать новый ZIP и синхронизировать этот manual и его проекции.

## Правила

| Правило | Поведение |
|---|---|
| Body / composition.content | `[M] Body` открыт для произвольного внешнего содержимого через native SLOT `[M] Body#135096:2`; payload не наследует placeholder constraints |
| auto-layout@1 | Девять root capabilities защищены от прямых overrides по мобильному effective library baseline |
| clipsContent | Library baseline false; включать обрезку запрещено |
| gridStyleId | Системный мобильный grid style нельзя менять или отвязывать |
| BackgroundPlate Color | Разрешены page modes `136853:0/1`; modal modes `136941:0/1` запрещены |
| visual-style@1 | Fill, stroke, opacity, radius, effects защищены library baseline |

Режим высоты не ограничен, как в desktop r11. TopMargin и BottomMargin —
библиотечные экземпляры Spacer `Size=24`; отдельных правил для них в этой
редакции нет. Section, паттерны страницы и React API не входят в эту область.

## Исправление r5

Авторский r5 разрешал `136941:0/1` с пояснением про MobileWeb. Чтение Figma
01.10 показало, что это `modal-bg-alt` и `modal-bg`. Для совпадения с desktop
правилом фон страницы исправлен на `base-bg-alt` / `base-bg`, `136853:0/1`.
Исходный ZIP сохранён побайтово в `../history/r5-owner-export` и остаётся
в общей папке как входной архив; он не считается актуальным мобильным r6.

## Проверки и приёмка

Компилятор: valid, 6 source rules, 17 RuleIR, одна warning о пустом purpose.
ZIP повторно импортирован без потери manual, anatomy и восьми Athena JSON.
11 сценариев проверяют семантику правил на изолированной synthetic anatomy.
Это не отчёты проверки реального мобильного экземпляра.

В Editor 0.2.71 обнаружено ограничение correspondence: TopMargin и
BottomMargin — соседние экземпляры с одинаковыми component/set keys. Сопоставление
этой версии считает их неоднозначными, даже при разных названиях. В synthetic
воспроизведении реальной восьмиузловой структуры: 17 inconclusive и 1
notExecuted для Body, полный аудит не завершён. Это не нарушение норм компонента.

Статус пакета и Predicate — **Ready** для шести согласованных mobile Figma
правил. Исправление Editor проверено пользовательским негативным сценарием и
контрольным/reset отчётом; владелец подтвердил приёмку сообщением «всё ок».
`reports/preparation-r6.json` хранит историческое состояние Draft; текущая
приёмка находится в `reports/acceptance.json` и `runtime/component-contract.index.json`.

### Приёмка 01.10.2026

Контрольный/reset report `corporate-content.validation-report.2026-10-01T18-09-18-969Z.json`:
clipping=false, page grey `136853:0`, 17 compliant, 0 violations,
inconclusive/notExecuted=0, 6/6 matches. Он использует тот же экземпляр и тот же
manual r7 hash, что негативный report от 17:59:37 UTC (15 compliant + 2 violation).
Оба полных engine/Editor результата точно воспроизведены, source hashes и
shared compiler проверены. Это подтверждённые live negative/reset сценарии;
отдельные отчёты для всех protected capabilities не заявляются.

Принят canonical r6; owner export r7 отличается только metadata и сохраняется
побайтово. Общая подборка содержит canonical copy
`CorporateContent.mobile-web.r6.component-contract.zip`; он включён в
`current-contract-packages/manifest.json`. Приёмка относится к шести authored
mobile Figma правилам; external Body payload, отдельные Spacer=24 проверки,
Section, паттерны, code parity и publication остаются за её пределами.

Evidence: `reports/acceptance.json`,
`reports/live-review-editor-0.2.73.2026-10-01T18-09-18-969Z.json`.
Проверка: `node scripts/review_corporate_content_mobile_acceptance.js`.
Реестр синхронизирован и проверен чтением:
`reports/registry-sync-acceptance.2026-10-01.json`. Predicate Ready; Леджер 81
«Проверено»; шесть RuleID и canonical source hash сохранены. Hub drift Леджера 82
остаётся открытым, по текущим нормам зафиксировано «Решение принято».

### Пользовательский live-отчёт Editor 0.2.73, 17:59:37 UTC

`corporate-content.validation-report.2026-10-01T17-59-37-209Z.json` подтверждает
исправление correspondence в настоящем Editor: 6/6 matches, complete=true,
17 evaluations, inconclusive/notExecuted=0. TopMargin/BottomMargin имеют разные
подтверждённые source IDs на actual и независимой reference стороне.

15 проверок соответствуют нормам; два ожидаемых violation — `clipsContent=true`
при baseline=false и `modal-bg (white)` (`136941:1`) вместо page modes.
Body policy выполнена, external payload намеренно не проверялся. Hashes manual,
snapshot, engine snapshot и evaluated contract проверены; shared compiler,
полные engine и Editor results точно воспроизведены.

Исходный отчёт сохранён lossless в `reports/fixtures/editor-0.2.73`;
review: `reports/live-review-editor-0.2.73.2026-10-01T17-59-37-209Z.json`.
Повторить: `node scripts/review_corporate_content_mobile_live.js` из корня
design-system_ab. Технический сбой source correspondence подтверждён исправленным;
Леджер 81 «Проверено». На этапе этого negative report Mobile Predicate оставался
Draft; последующий контроль/reset и приёмка зафиксированы выше.
Нормативные manual r6, owner export r7 и ZIP не изменены.
Реестр синхронизирован и проверен чтением:
`reports/live-review-editor-0.2.73.registry-sync.2026-10-01T17-59-37-209Z.json`.

### Исправление Editor 0.2.73: импортированный main

Новый отчёт `corporate-content.validation-report.2026-10-01T17-17-10-791Z.json`
из Editor 0.2.72 снова содержит 0/6 matches, 17 inconclusive и Body 1
notExecuted. В мастерской remote main имеет локальные ID `11722:42349/42353`,
а TopMargin/BottomMargin в instance сохраняют исходные `89653:28855/28857`.
Проверка предыдущего patch в исходной библиотеке не покрыла эту разницу.

Editor 0.2.73 подтверждает исходные ID и цепочку родителей через отдельный
pristine instance того же импортированного main. Неизвестное, чужое, неполное
или противоречивое свидетельство остаётся неполной проверкой. Временный instance
удаляется; сопоставление не зависит от имён и порядка слоёв.

Полный capture того же экземпляра `11723:44304` в мастерской дал 6/6 matches,
17 определённых evaluations: 15 compliant и два violation — clipping=true и
modal-bg (white). Coverage complete, inconclusive/notExecuted=0, external Body
payload не проверялся. Все четыре созданных temporary roots/page удалены;
исходный instance и состав страниц совпали до/после. Это live verification patch,
не пользовательский экспорт 0.2.73 и не полная приёмочная control/reset матрица.

Editor validate: 736/736; shared core validate и Apollo v4 98/98 прошли.
Legacy Apollo v3 gate снова остановлен отсутствующим CardImage compiled fixture
после успешных typecheck/build/runtime compatibility. Исходный отчёт 0.2.72
сохранён lossless и точно воспроизводит прежнюю неполную проверку.
Evidence: `reports/live-review-r7-editor-0.2.72.2026-10-01.json`,
`reports/editor-0.2.73-workshop-probe.2026-10-01.json`,
`reports/editor-0.2.73-verification.2026-10-01.json`.
Manual/ZIP r6 и owner export r7 не изменены. Перезапустите Editor 0.2.73,
повторите проверку и сохраните контроль/negative/reset отчёты. Mobile пока Draft.
Реестр обновлён и проверен чтением; форматирование и validation сохранены:
`reports/editor-0.2.73-registry-sync.2026-10-01.json`. Леджер 81 «В работе»,
шесть RuleID и source hash canonical r6 сохранены; drift Леджера 82 не изменён.

### Исправление Editor 0.2.72 (история)

Shared core теперь захватывает и проверяет связь каждого допустимого nested
instance с конкретным исходным слоем ближайшего main component. Это позволяет
различить TopMargin/BottomMargin без сопоставления по названиям или порядку.
Проверены независимый reference, неизвестное/чужое/дублированное свидетельство
и сохранность root violations. Plugin API simulation даёт 6/6 matches и
ожидаемые clipping/modal/opacity negative/reset результаты.

Два временных экземпляра в исходной Figma подтвердили разные source IDs
`89653:28855` и `89653:28857`; оба удалены. Evidence:
`reports/editor-0.2.72-source-identity-probe.2026-10-01.json`.
Это проверка механизма identity, не приёмка экземпляра в мастерской.
Manual/ZIP r6 не изменены; mobile остаётся Draft до нового live audit.
Последующий захват в мастерской выявил ограничение remote main; оно исправлено
в 0.2.73 выше.
Проверки: Editor 727/727 (28 новых regressions), shared core validate и Apollo v4
98/98; original report exact replay сохранён. Итог:
`reports/editor-0.2.72-verification.2026-10-01.json`. Реестр обновлён и проверен
чтением: `reports/editor-0.2.72-registry-sync.2026-10-01.json`; mobile Draft,
Леджер 81 «В работе» до нового live audit.

### Live-отчёт 01.10.2026, 16:07 МСК

`corporate-content.validation-report.2026-10-01T13-07-01-176Z.json` подтвердил
ограничение: topology complete, 6 captured nodes, но 0/6 baseline matches,
17 inconclusive и Body 1 notExecuted. Payload Body намеренно не обходился;
проблема находится в сопоставлении собственных Spacer-слоёв.

Отчёт использует session r7. От canonical r6 изменились только revision и
updatedAt; правила, targets, source metadata и остальная семантика идентичны.
Manual/ZIP r6 не перезаписаны. Shared compiler воспроизводит compiled r7;
hashes и весь engine result проверены точным повтором.

В фактах экземпляра `clipsContent=true` и фон `modal-bg (white)`, `136941:1`.
Это ожидаемые отличия от заданных норм, но отчёт не выдал violation из-за
unknown correspondence. Ноль нарушений при неполном аудите не означает PASS.
Результат: `reports/live-review-r7.2026-10-01.json`; исходный JSON сохранён
без потерь в `reports/fixtures/r7-editor-0.2.71/*.json.gz`.

## Источники и воспроизводимость

- `contract.manual.json` — текущий ручной нормативный источник;
- `src/` — read-only Athena JSON без изменений;
- `compiled/component-contract.v2.json` — проекция общего compiler core;
- `reports/preparation-r6.json` — hashes, изменения, offline-проверки и блокер;
- `reports/figma-source-facts.2026-10-01.json` — чтение Figma, не live audit;
- `reports/registry-sync-r6.2026-10-01.json` — сохранение и чтение реестра;
- `TESTCASES.md` — контрольные сценарии для последующей проверки.

Из корня `design-system_ab`:

```sh
node scripts/prepare_corporate_content_mobile.js
node scripts/review_corporate_content_mobile_report.js
```

`--record` предназначен для первоначальной записи r6 и не перезаписывает
последующие авторские изменения. Принятые пять desktop/core пакетов проверяются
своим `collect_current_contract_packages.js --check`; мобильный Draft описан
отдельно в `current-contract-packages/draft-manifest.json`.

Hub/legacy содержит более широкие нормы: FILL/HUG, Spacer=24, замена SwapMe,
page rules. Они не объявлены полностью мигрированными в эти шесть правил;
расхождение сохранено в Леджере. Проверены чтением: `Правила!A1879:O1884`,
`Леджер!A81:O82`, `Corp components!AF17:AH17`; Predicate Draft от 01.10.2026.


NEXT-02 technical source/API fields (2026-10-05): main r8, manualSourceHash `722b98e830a58e18fb47d258f99db099d52a32cd413cde7f2571c5c765408452`; source Predicate ready in the unchanged Figma rule scope. Code representation Draft, parity not-confirmed, acceptance not-run, publication not-confirmed; no accepted code generation profile/native write capability. Details: `reports/next-02.typed-passport-application.2026-10-05.json`. Historical source/ZIP preserved in `r7-before-next-02-typed-code-2026-10-05`.
