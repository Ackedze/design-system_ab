# Button — ComponentContract v2 reference package

## Текущий пакет — r22 / Editor 0.2.41 · ширина до / после Loading

Сохраните свои сессионные правки, перезапустите Editor0.2.41, загрузите
**[Button.editor-input.zip](editor/Button.editor-input.zip)**. Импорт заменяет сессию,
не объединяет правки. `contract.manual.json` — единственный ручной источник.

Во вкладке проверки появилась кнопка **«Запомнить состояние до»**. Сохраните обычный
Button, затем включите Loading у того же экземпляра и нажмите обычную проверку.
В JSON будут оба снимка. Плагин сам не изменяет ваш instance и не включает Loading.

Прежний RuleID `loading-preserves-width` теперь исполняется: `transitionInvariant`
описывает активность зависимости Spinner false→true, `bounds.width`, допуск0.01px,
инварианты View/Size/Shape/Disabled/SingleIcon/surface/тексты. Видимость текста и Addon
может меняться. Это поведение компонента, не продуктовое правило и не паттерн страницы.
Общий compiler/runtime материализует пару, существующий Predicate Engine выполняет
`approximately-equals`. Compiled, проекции и ZIP пересобраны, не редактировались вручную.

Одинаковые ключи, instance ID, страница, manual hash, последовательность и сессия,
Product/modes, внешние layout-условия проверяются до сравнения. Нет пары/данные неизвестны/
контекст изменился → **Не выполнено**. Размер default варианта не подставляется.
Снимки ограничены500 узлами,32 уровнями предков и200 соседями; GRID-родители пока не
поддержаны. Размер HUG-предка может следовать за кнопкой; фиксированные размеры и
геометрия соседей считаются входными условиями. Наблюдаются состояния, не история кликов.

Локально:358 Editor tests,146 scoped package tests, typecheck/build, Chrome UI
capture/edit/download/replay. Старые r21 engine/coverage/details пересчитываются точно.
Предыдущие manual/compiled/core сохранены в `history/r21-editor-0.2.40/`.
26 RuleID/59 parent RuleIR; Spinner r8, generated Athena facts и остальные25 правил
не менялись. Осталось8 неимплементированных правил, Button **Draft**; live paired
приёмка ещё не проведена. Два исторических Spinner suite с удалёнными оригиналами
по-прежнему исключены из scoped count, не объявляются зелёными.

Следующий шаг: **[BW01–BW06](TESTCASES.md)**. Для каждого достаточно одного JSON после
перехода. QA/hashes: `qa/width-transition.2026-09-28.json`.
Все шесть экземпляров уже созданы [в прежней секции Button, ниже BL](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13070-63891).
На карточках есть пошаговые действия и ожидаемый результат. Пять кейсов стартуют
с текста, BW05 — с активного Spinner без пары. ID/начальные состояния:
`qa/width-transition-test-cases.2026-09-28.json`. Это подготовка, не live-приёмка;
manual r22, ZIP и runtime не менялись.
Реестр Правила1596, Core Predicate Draft и drift Леджер59 обновлены/readback проверен.
В Hub §Loading нет описания сохранения ширины; нормативные документы Hub не менялись.

## История — r21 / Editor 0.2.40 · настройка Hint и видимость разделены

Для первой загрузки сохраните свои session edits, перезапустите **Editor0.2.40**
и загрузите **[Button.editor-input.zip](editor/Button.editor-input.zip)**.
Если r21 уже загружен, сохраняйте текущую сессию: ничего переимпортировать не нужно.
Spinner r8 внутри,
без изменений. `contract.manual.json` остаётся единственным ручным источником.

- `hintEnabled` — настроенное значение component property Hint; input для генерации.
- `hintVisible` — read-only факт `target.hint` / `visibility.effective`; учитывает
  скрытых родителей и доказанное отсутствие цели в варианте.
- Продуктовый запрет и условие Size56/64/72 используют именно видимость. Два прежних
  RuleID возвращены в Draft,26 IDs/58 RuleIR сохранены. Домен продукта/размеров прежний.
- Неизвестные visibility/identity/topology и needs-remap не превращаются в pass.
  Общий core исполняет явный binding, без имени Hint/Loading как runtime-исключения.

При реализации прошли328 Editor +136 профильных package tests; typecheck/build; импорт,
сохранение паспорта/сессионных правок и скачивание JSON через built Chrome UI.
Все14 архивных BL-снимков пересчитаны с r21: только ложное BL11-нарушение исчезло,
прочие verdicts/traces сохранены. BL12 по-прежнему содержит два нарушения, BL10
корректно подтверждает отсутствие Hint. Это был локальный replay до live-приёмки ниже.

**Live-приёмка 08:25–08:26 UTC завершена:** BL11/BL12/BL10 —0/2/0 нарушений.
В BL11 `hintEnabled=true`, `hintVisible=false` из-за скрытого Text. В BL12 оба
настоящих нарушения сохранены; BL10 подтверждает отсутствие Hint в SingleIcon.
Все1258 evaluations (504 child), Editor coverage/details воспроизводятся точно;
45/45 узлов, warnings/inconclusive=0. Все прочие verdicts/traces совпадают с r20.
Добавлены7 live-регрессий;143 профильных package tests прошли. Это не меняет
manual/compiled/ZIP/runtime, Spinner r8 и ручные статусы review.

Три оригинала с SHA сохранены в `qa/fixtures/effective-hint-visibility-r21/`;
экспортные копии в editor/ можно удалять. Повторять эти кейсы не нужно.
Приёмка: `qa/effective-hint-visibility-live-review.2026-09-28.json`.
Button остаётся **Draft**, сохранение ширины и остальные pending не закрыты.
В этих трёх сценариях7/7/4 неисполненных проверки; на уровне всего контракта ещё9
неимплементированных правил. Следующий функциональный шаг — paired width evidence.
Старые r20 manual/compiled/core сохранены в `history/r20-editor-0.2.39/`;
Spinner и Predicate Engine побайтно прежние. Два исторических Spinner suite,
зависящих от удалённых оригиналов, явно исключены из указанного scoped count.
Результат/hashes: `qa/effective-hint-visibility.2026-09-28.json`.
Реестр1590/1821, drift58 и Core Predicate обновлены; Hub не редактировался.
Это была синхронизация при реализации r21; текущая live-приёмка не меняет нормативных
правил или Google-реестра. Проекция Hub остаётся отдельным drift-бэклогом.

## История — r20 / Editor 0.2.39 · только Spinner в Loading

**Live-приёмка Loading завершена 28.09.2026, 07:24–07:26 UTC: 14/14 кейсов.**
Все 42 атомарные проверки состава дают ожидаемые результаты, включая 7 ожидаемых
нарушений в отрицательных кейсах. 5792 engine evaluations (2215 child), Editor
coverage/details воспроизводятся точно; 244/244 узла, без capture warnings
и inconclusive. Повторять BL01–BL14 или переимпортировать пакет сейчас не нужно.

**Отдельная открытая проблема — BL11:** Loading правильно принимает скрытый Hint,
но старое `desktop-hint-restricted` проверяет boolean `Hint=true`, а не видимость
с учётом родителя Text, и выдаёт нарушение продукта `ab`. В BL12 это же правило
срабатывает уже на реально видимом Hint, вместе с Loading. Текущий binding
`semanticApi.hintVisible → component.properties.Hint#4:8` не различает настройку
и фактическую видимость. Следующий P0 — разделить эти понятия декларативно и
определить область продуктового запрета; не отключать правило целиком в Loading.
Нормативный manual/compiled/ZIP, Editor и Spinner в этой приёмке не менялись.

14 исходных отчётов сохранены в `qa/fixtures/loading-composition-r20/` с SHA-256;
их экспортные копии в `editor/` можно удалять. Результат:
`qa/loading-composition-live-review.2026-09-28.json`. Контракт целиком всё ещё Draft:
в сценариях остаются 4–8 неисполненных проверок, в том числе сохранение ширины.
Добавлены18 live-регрессий;119 scoped package tests проходят. Полный исторический
glob не зелёный: два старых suite Spinner зависят от удалённых оригиналов в editor/
и падают с ENOENT; исключены явно, долг архива записан отдельно в бэклог.

### Реализация r20 (история подготовки пакета)

Сохраните свои session edits, перезапустите **Editor0.2.39** и загрузите
**`editor/Button.editor-input.zip`**. Spinner r8 включён и побайтно прежний.
Один существующий RuleID `loading-uses-addon-spinner` теперь исполняется:
при видимом штатном Addon.Type=Spinner нужен ровно один видимый pinned Spinner
и больше никакого контента: Label/Hint скрыты (либо подтверждённо отсутствуют),
виден ровно один addon — содержащий Spinner. Владелец подтвердил28.09.2026.
Три typed quantity constraints,58 parent RuleIR; остальные25 правил не изменены.
Размер проверяет прежний RuleID: Button32/40 → Spinner16, Button48–72 → Spinner24.

Применимость и количество опираются на общий dependency resolver и Predicate Engine.
Скрытый/подменённый ребёнок не отменяет выбранный Type=Spinner; неизвестная identity,
visibility или topology оставляет проверку неполной. Никакого Loading property в Figma
не придумано. Второй addon запрещён независимо от его Type. `Hint=true` при
скрытом Text не создаёт видимый контент и не является нарушением этого правила.
Фон Button, служебные контейнеры и внутренние слои Spinner остаются допустимыми.

Код Editor/compiler/Predicate Engine не менялся: дополнение реализовано только
в manual. 323 Editor +101 профильный package test и Chrome прошли.
Сохранённые BP01/BP08 получают три успешные проверки композиции и7 pending вместо8;
BP13 —8 вместо9. Старые verdicts/traces и child pin сохранены. Это replay архивов,
**не live-приёмка r20**. [BL01–BL14](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13047-63768)
подготовлены в прежней секции; [инструкция](TESTCASES.md). Статус **Draft**.

**Ширина при Loading — поведенческое правило самого Button.** Оно уже есть в manual,
но пока context-only: нужны связанные состояния до/после с одинаковым внешним
контекстом. Один статичный снимок и ширина master не доказывают сохранение ширины.
Не создавать отдельный паттерн или второй RuleID для того же инварианта.

Неизменяемые r18/r19: `history/`. Итог r20, hashes и новые Figma IDs:
`qa/spinner-only-loading.2026-09-28.json`; прежняя реализация r19 —
`qa/loading-composition.2026-09-28.json`. Реестр синхронизирован со статусом
В работе / Predicate Draft; уточнение Hub остаётся в Леджере «Найдено».

## История — r18 / Editor 0.2.38 · выбор экземпляра по ключу

Перезапустите **Editor0.2.38**. Если r18 уже загружен, сохраняйте текущую сессию:
повторный импорт не требуется. Manual/compiled/ZIP и Spinner r8 побайтно прежние;
producer compiled0.2.37 не обязан совпадать с версией приложения0.2.38.

Проверка определяет Figma-представление и platform по фактическому component/set
key, независимо от authoring-вкладки. Неизвестный или неоднозначный ключ даёт
короткую ошибку без перебора библиотечных imports. Все независимые эталоны получают
тот же корректный platform; manual и session edits не подменяются.

**Палитра принята на всех13 BP-сценариях:** BP01–08 без нарушений; BP09–12 —
ровно по1 нарушению нужного Inverted/Static; BP13 — матрица не применяется.
В повторном live BP08 из0.2.38 actual representation/platform корректны:
mobile-web,0 human-review вместо прежних53,168 проверок Spinner исполняются.
Повторные BP01/BP13 не изменили прежние verdicts/traces.1095 новых engine evaluations
(504 child),54/54 узлов, Editor coverage/details воспроизводятся точно;
warnings/violations/inconclusive=0. Во всех3 запусках manual и compiled прежние.

Все4831 engine evaluations/2016 child и coverage/details исходных отчётов
воспроизводятся точно;235/235 узлов matched, warnings=0. Неизменяемые gzip с SHA:
`qa/fixtures/spinner-palette-r18/`. Эти13 оригиналов в editor/ теперь можно удалять.
При реализации прошли316 Editor +83 scoped tests, typecheck/build и Chrome
cross-platform/session regression. При live-приёмке добавлены7 регрессий,
все90 scoped package tests прошли; plugin/core не менялись.
Новые3 уникальных отчёта архивированы в `qa/fixtures/selection-key-editor-0.2.38/`.
Четвёртый файл с лишним дефисом — побайтная копия BP13, не новый запуск.
**Финальный BP01 06:16 UTC для обратного сценария принят.** Actual Desktop,
0 нарушений/неопределённостей,18/18 nodes,168 child checks;398 evaluations,
Editor coverage/details воспроизводятся точно. Verdicts/traces совпадают с прежним
BP01, нормативные данные и dependency pin не менялись.92 scoped tests прошли.
Выбор [M] в authoring — контекст запрошенного теста; dropdown не сериализуется,
а `component.platform=desktop` — metadata manual. Cross-direction дополнительно
проверен в VM/Chrome. **P0 выбора по ключу закрыт**, повторять тесты не нужно.
Финальный оригинал также архивирован в `qa/fixtures/selection-key-editor-0.2.38/`.

Контракт **Draft**, полная Loading-композиция/сохранение ширины ещё открыты;
в успешных BP остаются8–9 pending в зависимости от сценария. Правила и реестр не
менялись. Текущая приёмка: `qa/selection-key-final-review.2026-09-28.json`.
Предыдущая порция: `qa/selection-key-live-review.2026-09-28.json`.
Первый прогон: `qa/spinner-palette-live-review.2026-09-28.json`;
реализация: `qa/selection-key-capture.2026-09-28.json`.

## История реализации r18 / Editor 0.2.37 · палитра вложенного Spinner

Загрузите **`editor/Button.editor-input.zip`** в Editor0.2.37, предварительно
экспортировав свои session edits. Spinner r8 уже внутри и не изменён.
Единственный ручной источник — `contract.manual.json`; compiled/projections/ZIP
пересобраны. Сохранены все26 RuleID, теперь55 собственных RuleIR.

Существующее `loading-spinner-style-follows-view` стало исполнимым: две таблицы
`dependencyDomain`, обе стороны Addon.Type=Spinner. Палитрой места встраивания
владеет Button, внутренними инвариантами — отдельный Spinner.

| View обычного [D]/[M] Button | Spinner Inverted | Spinner Static |
|---|---|---|
| Accent | True | True |
| Primary | True | False |
| Secondary / Outlined / Transparent / Text | False | False |

Все размеры32–72 подтверждены владельцем28.09.2026. **Button_Inverted не входит**
в эту матрицу; отдельное правило ещё не согласовано. Неизвестный View, ошибочная
identity, отсутствие VARIANT или фактов дают неполную проверку, не pass. Наличие
Spinner устанавливается через fixed binding, не через вымышленный Loading property.

307 Editor +67 профильных package tests, typecheck/build. Матрица144 позитивных /
288 негативных сочетаний. Старые BS сохраняют все прежние вердикты и traces,
включая1008 child evaluations; новый пакет добавляет4 palette checks и оставляет9
pending вместо10. Chrome проверил импорт, изменение таблицы в сессии и JSON replay
на архивных фактах; **это не live-приёмка новых экземпляров**.

[BP01–BP13 в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13038-67729)
подготовлены на странице «Лаборатория» в той же секции Button, прежние BS не изменены.
[Порядок проверки](TESTCASES.md). Статус правила и всего пакета — **Draft** до
live-приёмки; полная Loading-композиция и сохранение ширины остаются открыты.

Реестр: Правила1826, Леджер56, Core Predicate Draft/28.09.2026 синхронизированы
и перечитаны с проверкой formats/validation/chips. Hub не переписан: его Size56-only
формулировка и fallback неизвестного View должны быть перегенерированы по manual.
`qa/spinner-palette.2026-09-28.json` — итог и hashes. Неизменяемый r17:
`history/r17-editor-0.2.36/`. Production manifests и Spinner r8 не затронуты.

## История — r17 / Editor 0.2.36 · границы правил

При первой загрузке используйте **`editor/Button.editor-input.zip`** с Editor0.2.36;
сначала сохраните свои session edits. Если r17 уже загружен, повторный импорт не нужен.
Spinner r8 уже включён и не изменён.
Manual — единственный ручной source of truth, compiled/projections/ZIP пересобраны.

Три recursive baseline rules явно используют `boundaryPolicy=component-owned@1`:
Button не повторяет внутренние проверки Spinner; nominal Size остаётся у Button.
Два текстовых style rules используют `targetApplicability=visible-target@1`:
доказанно скрытый Text не превращается в missing target. Два layout rules
получили `flow-gap-either@1`: неактивный actual+baseline gap не проверяется.
Missing/ambiguous/collision/неверный pin не дают pass; required presence отдельно.
Новые поля доступны в inspector Editor и входят в экспортируемый manual.

Все26 RuleID/51 parent RuleIR, generated facts и принятый Spinner r8 сохранены.
Пять изменённых правил остаются в Draft. **Live-приёмка 19:09–19:10 UTC
2026-09-27 подтвердила runtime на всех семи BS экземплярах:**

| Кейс | Нарушения, atomic | Карточки |
|---|---:|---:|
| BS01 / BS02 / BS06 / BS07 | 0 | 0 |
| BS03, неверный nominal Size | 1 | 1 |
| BS04, Scale Button | 14 | 8 |
| BS05, opacity Spinner | 2 (только Spinner) | 1 |

Везде остаются10 прежних pending. Все2589 engine evaluations (1008 child), Editor
coverage/details воспроизведены точно;121/121 узлов matched, warnings/inconclusive=0.
Обнаруженный в0.2.35 дефект пояснений **исправлен в Editor0.2.36 (2026-09-28)**:
hidden/child-owned «Не применяется» объясняет причину без `true/false → all true`.
Движок, coverage и raw trace не меняются, только reasonLabel/showComparison. Unknown
не становится разрешением. Все2589 evaluations воспроизводятся точно;299 Editor
и58 профильных package tests прошли. Контракт остаётся Draft.
Loading palette/composition/pre-loading width остаются открыты. Production не затронут.

Итог live-приёмки: [qa/ownership-scope-live-review.2026-09-27.json](qa/ownership-scope-live-review.2026-09-27.json).
Семь исходных JSON архивированы с проверкой SHA-256 в `qa/fixtures/ownership-scope-r17/`;
временные отчёты из editor/ можно удалять. В этой приёмке нормативные файлы,
compiled/ZIP/core/plugin, Spinner и реестр не менялись; хеши подтверждены.
Добавлены13 live regression tests, включая воспроизведение дефекта пояснения;
все58 профильных package tests прошли. Исторические r16 ожидания сохранены отдельно.
Итог presentation-патча: [qa/scope-explanations.2026-09-28.json](qa/scope-explanations.2026-09-28.json).
Новый набор live-кейсов не нужен. Buttonr17/Spinnerr8 manual/compiled/ZIP остаются
побайтно прежними; в отчёте версия приложения0.2.36 не обязана совпадать с producer
compiled0.2.35. Следующая функциональная задача — View→Inverted/Static.

Проверки:291 Editor +45 scoped package tests, typecheck/build, legacy exact replay
2547 evaluations и неизменённые1008 child evaluations. Старый r16 архивирован в
`history/r16-editor-0.2.34/`. Реестр Правила1592/1594/1598/1837/1838, Леджер55,
CoreAF10:AH10 синхронизирован с readback; Predicate Draft, Hub не менялся.
Исторический итог реализации до live-приёмки: `qa/ownership-scope-r17.2026-09-27.json`.

## История — r16 / Editor 0.2.34 · интеграция Spinner

Загрузите **`editor/Button.editor-input.zip`** после перезапуска Editor0.2.34.
Сначала экспортируйте несохранённые правки сессии. Spinnerr8 уже внутри пакета,
отдельно импортировать его не нужно. Manual — единственный ручной source of truth;
дочерний compiled закреплён по componentId/revision/source hash/compiled hash.

Две явные связи через Addon.Type=Spinner (слева/справа), не glyph swap. В существующее
`addon-size-follows-button-size` добавлен восьмой constraint: Button32/40→Spinner16,
Button48–72→Spinner24. Семь прежних icon constraints и все26 RuleID сохранены.
Теперь51 собственный RuleIR;31 Spinner RuleIR исполняются отдельно тем же Predicate
Engine, без копии правил в Button. Scale и opacity проверяет именно контракт Spinner.
Независимый эталон ребёнка не перенимает его overrides; missing/ambiguous/version
ошибки явно оставляют проверку неполной. ZIP, сессия и отчёт сохраняют dependency.

**2026-09-27 15:54–15:55 UTC: все семь live-отчётов разобраны.** Подключение
Spinnerr8, Size, intrinsic geometry, opacity и правый Addon подтвердились; BS01/02/06/07
без нарушений. Точный replay всех2547 engine evaluations (1008 дочерних), Editor
coverage и details. Все узлы matched, warnings/inconclusive=0.
Полную интеграцию **не закрываем**, Button остаётся **Draft**:

- BS04: Button recursive policies дают4 лишних atomic findings /2 карточки gap
  на Addon и Spinner, хотя gapApplicable=false у actual И reference.
- BS05:2 parent+2 child opacity checks объединены в1 карточку, но области владения
  пересекаются; нужен явный boundary для общих parent policies.
- BS01–06: скрытый Text/Label найден в snapshot, но2 style rules показывают
  «Не выполнено» вместо явной неприменимости;12 pending против10 у BS07.

Следующий P0 — явные границы parent/child policies + применимость неактивных
свойств и скрытого текста. Не отключать ограничения Button на место встраивания.
Нормативные файлы/r16/ZIP/Spinner не изменены. Итог:
`qa/spinner-integration-live-review.2026-09-27.json`; оригинальные семь JSON
архивированы в `qa/fixtures/spinner-integration-r16/`, editor/ можно очищать.
Добавлены12 live-regression tests; все44 scoped package tests прошли. SHA-256
manual/compiled/ZIP совпадают с состоянием до анализа; исправления P0 ещё не вносились.
Это приёмка механизма зависимости и Size, не всего Loading.
Три прежних Loading RuleID (композиция, View→Inverted/Static, сохранение ширины)
остаются context-only. Не закрыты другие старые context-only/delegated gaps и
unresolved target Spinner, относящийся к этим старым правилам; новая fixed binding
его не подменяет. Production runtime не подключён, индекс unpublished/draft.
Принятый Spinnerr8 и его hash не менялись; правила хаба не переписаны (drift54 открыт).

Пересборка: `node scripts/build_button_component_contract_v2_reference.js --preserve-sources --dependency experiments/web-core/core/Spinner/compiled/component-contract.v2.json`.
Отчёт связи: `reports/dependencies.json`; immutable r15 в `history/r15-editor-0.2.33/`.
Проверки:277 Editor +32 package tests, typecheck/build; Chrome проверил импорт,
passport и сохранение восьмого constraint с синтетическим preview. Реестр
Правила1823 /Леджер54 /CoreAF10:AH10 синхронизирован и прочитан обратно.
Подробности и hashes: `qa/spinner-integration.2026-09-27.json`.

## История — план 2026-09-26

**2026-09-26: следующий этап Loading.** Сначала самостоятельный
[Spinner Draft r2](../Spinner/README.md) (12/12 структур из свежего REST;
live-приёмка ожидается), затем зависимость Button с ограничениями
размера/палитры родителя. [Границы ownership и план](../COMPONENT_OWNERSHIP.md):
продуктовые/канальные ограничения принадлежат паттернам. Текущий Button manual r15,
ZIP и deferred Loading rules этим этапом не меняются и не считаются принятыми.

Изолированный эталон целевой модели `ComponentContract`. Пакет не включён в
`runtime-index.json`, не читается production Apollo и не изменяет текущие
Athena-каталоги.

## Предыдущий пакет — r15 / Editor 0.2.27

Загрузите `editor/Button.editor-input.zip` после перезапуска Editor0.2.27.
Сначала экспортируйте текущий ZIP при наличии более новых правок сессии:
импорт не объединяет их. Все 26 прежних RuleID и пользовательская цель PaintMe
сохранены; дополнено существующее `addon-size-follows-button-size`.
Теперь 7 ограничений и 49 атомарных проверок. Единственный нормативный источник
по-прежнему `contract.manual.json`; compiled и projections пересобраны, не правились.

| Каталог | Активный порт | VARIANT Size |
|---|---|---|
| Icons -- general (glyph) | Icon-16 | s |
| Icons -- glyph-26 | Icon-20 | 20 |
| Icons -- glyph-26 | Icon-24 | 24 |

Номинальный Size — типизированное свойство выбранной иконки, не имя/геометрия.
Прежние связи Button32/40 → Addon16/Icon-20/20×20 и Button48–72 →
Addon24/Icon-24/24×24 для glyph-26 сохраняются; width/height имеют допуск ±0.01px.
Size24, сжатая до20×20 в Icon-20, нарушает Size, но не bounds. Legacy M в Icon-16
нарушает Size=m→s и прежнюю catalog policy. Корректный исходный legacy S допустим;
соответствие Size не разрешает новую legacy-замену. Неизвестные данные не дают pass.
В Editor доступны все семь constraints, включая property/activePorts/catalog/domain.

Capture v4 строит независимую цепочку library host → выбранный Addon → nested icon.
У каждого этапа проверяются parent, identity, port, modes, context и shape.
Actual styles не копируются. При недоступном дочернем эталоне доказанные domain facts
доступны, но содержимое ребёнка остаётся непроверенным. Лимит — 8 эталонов на запуск;
временные страницы очищаются. Исторические v1–v3 JSON имеют прежний точный replay.

Проверено локально: **182 теста**, typecheck/build, пять точных engine/editor/details
replay 08:31–08:35, Chrome формы всех семи constraints, сессионные изменения verdict,
JSON/ZIP roundtrip и Node parity. В API-симуляции: 15/15 matched при двух эталонах,
13/15 при отказе дочернего reference. Overrides PaintMe и opacity иконки/vector
не скрываются. Golden snapshots оригинальны; новые v4 stages в тестах явно synthetic.

**Live-приёмка ожидается:** повторить экземпляры из 08:33 и08:35, правильные Size20/S,
Button56 и правый видимый слот; скачать свежие JSON. Контракт **Draft**: сохраняются
9 прежних «Не выполнено» и warning отсутствующего Spinner. Production не затронут.
Google Sheets: Правила1823, PredicateAF10:AH10, legacy drift51 и новый drift52
синхронизированы с проверкой чтением. Cookbook ds-ai-hub смешивает Size=s/m с
20/24 для glyph-26: расхождение зафиксировано, hub в этой задаче не менялся.

Read-only asset membership по Athena indexes остаётся в `compiled/asset-catalogs.json`
и `evidence/asset-catalogs.json` внутри ZIP. Generated facts/source snapshots сохранены.
Пакет не опубликован в production runtime index.

## Source of truth

Единственный нормативный редактируемый документ — `contract.manual.json`.
Его нужно открывать и менять через последнюю версию **ComponentContract
Editor**. Вручную не редактируются:

- `compiled/` — результат общего compiler core;
- `editor/Button.editor-input.zip` — готовый входной пакет для Editor;
- `reports/` — validation, coverage, ownership и crosswalk;
- `projections/` — будущие проекции для Athena и ds-ai-hub;
- `runtime/` — компактная запись для будущего lazy-loading Apollo;
- `sources/` — неизменённые снимки исходных документов.

Схема manual source:
[`../../../schemas/apollo-component-contract-manual-v2.schema.json`](../../../schemas/apollo-component-contract-manual-v2.schema.json).
Схема compiled output:
[`../../../schemas/apollo-component-contract-v2.1.schema.json`](../../../schemas/apollo-component-contract-v2.1.schema.json).

## Что описано в manual source

- единые `componentId`, `familyId` и стабильные Rule ID;
- назначение, use / do-not-use и связи с соседними компонентами;
- четыре Figma и три React representation одного Button;
- единый semantic API и binding каждого свойства к representation;
- semantic targets и локальные control ports для будущих PatternContract;
- 26 действующих правил; все 12 Athena Rule ID сохранены. Удалённый пользователем
  deprecated-дубль Hint не возвращается (история остаётся в его отчётах);
- явный execution route: `predicate`, `policy-only`, `delegated` или
  `context-only`;
- generation/validation/mapping examples, рабочие generation profiles и
  нормативные решения по конфликтам источников.

## Источники

`sources/design-system_ab-athena/` содержит полный текущий агентский пакет
Button из design-system_ab. `sources/ds-ai-hub/` содержит документацию,
Figma/code bridge, cookbook, keys/model/snippets и принятый Figma eval.
`sources/component-contract-editor/` сохраняет предыдущий Editor export и
инструкцию Editor на момент сохранения снимка. При `--preserve-sources` эти
документы остаются историческим evidence, а не обновляются вслед за кодом.

Эти файлы являются evidence. После подтверждения миграции нормативные знания
живут в `contract.manual.json`; ds-ai-hub и Athena получают только производные
проекции и ссылки на исходный manual source.

## Маршрут изменения данных

```text
Athena facts + ds-ai-hub docs + previous Editor export
                      ↓ import / review
        ComponentContract Editor → contract.manual.json
                                   ↓ shared compiler core
        compiled/ + reports/ + projections/ + runtime/
```

Изменение начинается только в Editor. После сохранения manual source сборщик:

1. валидирует схему, стабильные идентификаторы и ссылки между сущностями;
2. проверяет, что ни один существующий Athena Rule ID не потерян;
3. сравнивает `source.sourceHash` с полным набором evidence и показывает drift;
4. компилирует Predicate RuleIR только для правил с route `predicate`;
5. сохраняет остальные правила явными `policy-only`, `delegated` или
   `context-only`, не пытаясь угадать исполнимую проверку;
6. строит read-only проекции и компактную runtime-запись.

| Данные manual source | Производный документ | Будущий потребитель |
|---|---|---|
| identity, semantics, representations, semantic API | `projections/ds-ai-hub/component.json` | ds-ai-hub, ответы по Figma и code |
| targets, control ports, rules, examples | `projections/athena/manual-overlay.json` | Athena CLI / Editor import |
| predicate rules + generated Figma facts | `compiled/component-contract.v2.json` | Predicate Engine / Apollo |
| coverage, source hashes, crosswalk, ownership | `reports/` | CI, review, migration governance |
| component и representation indexes | `runtime/component-contract.index.json` | Apollo lazy loading после публикации |

Текущий builder реализует этот маршрут только для изолированного Button-пилота.
Он не обновляет production-файлы Athena, ds-ai-hub или Apollo.

## Сборка

```bash
cd projects/ComponentContractEditor
npm run validate

cd shared/design-system_ab
node scripts/build_button_component_contract_v2_reference.js --preserve-sources
```

Для начала редактирования загрузите в Editor один файл:
`editor/Button.editor-input.zip`. Он содержит `contract.manual.json`, восемь
Athena evidence JSON для variants/anatomy и компактный asset catalog. После
редактирования экспортируйте ZIP из Editor и возьмите из него новый
`contract.manual.json`; остальные файлы экспорта являются производными.

Скрипт никогда не перезаписывает `contract.manual.json`. С `--preserve-sources`
он проверяет хеши сохранённых evidence и не обновляет их; без флага заново
собирает снимки источников. Он проверяет сохранность всех Athena Rule ID и
строит read-only артефакты. Исходные пользовательские
`editor/button.component-contract.zip` и `editor/button.validation-report.*.json`
сборщик не перезаписывает.

## История: r8 / Editor 0.2.17 (не текущий пакет)

Manual r8 / Editor 0.2.17, основа — пользовательская r6 из отчёта
`button.validation-report.2026-09-25T00-01-09-615Z.json`. Изменено только
`component:web-core.button.single-icon-content-shape`: SingleIcon=true на корне
запускает две проверки состава — один видимый Addon и отсутствие видимых Label/Hint.
В SingleIcon текстовые слои и RightAddon отсутствуют; свойства Label/Hint не
обязаны быть false. Другие 23 правила сохранены, включая Hint AB и Hint/Size.

SingleIcon остаётся Draft до live-приёмки; Editor активирует Draft для теста,
а compiled сохраняет честный authoring-статус. Пакет не опубликован: 24 правила,
18 compiled checks, 10 context-only и 3 делегации. Read-only variantEvidence
сверяется с полным reference и экземпляром выбранного варианта. Подтверждённое
отсутствие не равно unknown. Старый отчёт без reference недостаточен для новой
проверки; replay со старым compiled сохраняется. Продуктовые scope и loading не менялись.

Для тестирования переимпортируйте `editor/Button.editor-input.zip`. Если после
r6 вы внесли новые изменения в сессии, сначала экспортируйте их для сохранности.
Переключите настоящий SingleIcon=True → False → True и скачайте validation reports.
Не требуется включать отсутствующие Label/Hint или второй Addon. Локальные тесты
на Athena topology и браузерный replay не заменяют live-приёмку. Production
Athena/ds-ai-hub/Apollo не обновлялись; различие инструкции bridge и Figma фиксируется в леджере.

Ранее отложенная синхронизация r8 закрыта при выпуске r13. Актуальная сверка
реестра/леджера фиксируется в `reports/knowledge-sync-pending.json` с явной ревизией
и подтверждением повторного чтения; прежний pending не означает текущий блокер.
