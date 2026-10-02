# AmountStyles — backlog

## r9 · 2026-09-30 · Editor 0.2.64 — текущее состояние

- [x] R8 Paragraph overrides/reset приняты: 13 → 0 нарушений; captures и пакет архивированы.
- [x] Ручное оформление переведено в 18 исполняемых baseline assertions по явным ролям.
- [x] Общий compiler и Editor: targetRoles для propertyForbidden; range text.decoration.
- [x] Без зависимости от кликабельности; TEXT color и внешний Addon не заблокированы.
- [x] 46 исторических отчётов: exact replay, остальные вердикты неизменны.
- [x] 638 Editor / 342 Amount+Button tests, typecheck, 36 layout checks,
  UI import/save всех трёх constraints и детерминированная пересборка ZIP.
- [x] Реестр/леджер/Predicate Draft обновлены; 33 ячейки сверены чтением.
- [ ] Технический долг общего suite: два старых Spinner tests читают удалённые
  editor JSON вместо постоянных fixtures; полный suite сейчас не зелёный.
- [ ] Live AS-D01–AS-D10 на Editor 0.2.64 / r9; затем review статуса нового правила.
- [ ] Оставшиеся D/M Headline Operation/layout, высота/StatusBadge и общая приёмка.
- [ ] Не заявлять покрытие произвольных bounds/sizing; ширина/клиппинг — паттерн.
- [ ] Hub: пересоздать документацию без условия кликабельности (drift в леджере).

Далее — исторические чеклисты, они не переоткрывают уже принятые пункты.

## r8 · 2026-09-30 · Editor 0.2.63 без изменений движка

- [x] Четыре live r7 capture архивированы; native plus, hidden и две ручные подмены
  дают ожидаемый результат. Operation принят в проверенном Paragraph-сценарии.
- [x] Геометрия: direction, padding, gap и alignment через existing propertyForbidden
  и propertyApplicability; boundaryPolicy отделяет pinned Core Amount и его Addon.
- [x] 24 targeted tests: overrides/reset, внешний текст/ширина, Addon boundary,
  неизвестные факты и 44 exact historical replay без изменения других правил.
- [x] 322 package tests, 635 Editor tests, typecheck. Реестр и леджер обновлены:
  33 ячейки сверены обратным чтением; Predicate остаётся Draft.
- [ ] Live r8: AS-G01–AS-G10; штатные D/M Headline, смена Style/Negative, overrides/reset.
- [ ] Operation: повтор штатного плюса на D/M Headline; не закрыт Paragraph-отчётом.
- [ ] Ручное оформление: оставшийся context-only блок, без условия кликабельности.
- [ ] Не считать проверенными произвольные bounds/sizing внутренних частей:
  реализован именно Auto Layout, не сравнение размеров текста с default.
- [ ] Остальные незакрытые live boundary cases высоты/StatusBadge и общей приёмки.

## r7 · 2026-09-29 · Editor 0.2.63 без изменений движка

- [x] Приняты два live r6 отчёта: высота 24 при line-height 20 нарушает правило,
  высота 24 при line-height 24 проходит. Архивированы r6 package и оба capture.
- [x] Operation: неизменность текста по выбранному библиотечному варианту;
  existing propertyForbidden/library-text + existing same-family TEXT target.
- [x] Native Negative и Operation=False — разрешённый API; прежний RuleID
  operation-negative-is-part-property сохранён как policy-only без дубля проверки.
- [x] 40 исторических capture: exact old replay и неизменность прежних вердиктов.
- [x] QA: 25 Operation tests, все 298 package и 635 Editor tests; детерминированная
  пересборка. Реестр правил, леджер и Predicate Draft обновлены и сверены чтением.
- [ ] Live r7: минус, плюс через Negative, ручные подмены, hidden, reset;
  повторить штатный plus на Paragraph, D Headline и M Headline.
- [ ] Два оставшихся context-only блока: внутренняя геометрия и ручное оформление.
- [ ] Остальные r6 live boundary cases, не представленные двумя отчётами, не объявлены пройденными.

## r6 · 2026-09-29 · Editor 0.2.63

- [x] Live r5: IconView — разрешён, Button — запрещён, скрытый Addon — разрешён;
  все три отчёта сохранены в immutable fixtures, r5 package архивирован.
- [x] Однострочность удалена полностью по решению владельца. Отмена только в manual
  decisions; crosswalk учитывает retired RuleID, активной нормы больше нет.
- [x] Addon.height ≤ line-height выбранного Style: typed constraint, поле Editor,
  общая подготовка reference facts и штатный Predicate Engine compare/lte.
- [x] QA: 635/635 Editor, 273/273 package, 36 layout checks, 38 exact historical
  replay; typecheck и побайтовая повторная сборка. Реестр/леджер/Predicate Draft
  обновлены, 77 изменённых ячеек сверены чтением. Отчёты в `reports/*r6*`.
- [ ] Live r6: граница высоты, превышение, скрытие, смена Style, StatusBadge.
- [ ] Operation: запрет редактирования текста; штатные Negative и visibility разрешены.
- [ ] Геометрия: внутренние layout параметры; не ширина внешнего контейнера,
  не клиппинг, не однострочность и не сравнение ширины произвольного текста с default.
- [ ] Ручное оформление: условие кликабельности уже удалено из manual; реализовать конкретные
  underline/fill/effects в принадлежащих пресету узлах, исключая содержимое Addon.
- [ ] Диагностика unmatched nodes: отличать внешнее содержимое swap от ошибки mapping,
  не скрывать настоящие unknown или неоднозначность.

Ниже — историческое состояние предыдущих ревизий, не текущий список блокеров.

## r5 · 2026-09-29 · Editor 0.2.62

- [x] Live r4 закреплён: 19:07:54 — 0 нарушений, 19:08:01 — 8; точный replay.
- [x] Уточнена причина AS-B08c: неизвестны две проверки Addon, не текстовые bindings.
- [x] Явный slot-api ownerTargetId=target.amount в manual и поле в форме Editor.
- [x] Только подтверждённая native граница; содержимое замены не наследует placeholder baseline.
- [x] 35 архивных capture: изменились только два прежних unknown Addon на compliant.
- [x] QA: 617/617 Editor, 272/272 пакетов, typecheck/build, 36 layout checks;
  реестр и Predicate Draft обновлены и сверены обратным чтением.
- [x] Live r5: AS-B08c, чужое семейство и скрытый Addon (принято в r6).
- [ ] Шесть context-only правил остаются; следующий P0 — Addon ≤ line-height.

## r4 · 2026-09-29 · Editor 0.2.61

- [x] Явные manual-связи TEXT → Minor/Currency; редактирование в паспорте Editor.
- [x] Восстановление только внутри доказанного same-family variant; отсутствие,
  неоднозначность, чужое семейство и повреждённая структура не проходят.
- [x] 33 immutable captures: старый replay точен, actual evidence не меняется.
  Три unknown в opacity-кейсах заменены реальными binding violations, чистый кейс зелёный.
- [x] 602/602 Editor, 272/272 пакетов; typecheck/build и 36 layout checks.
- [x] Детерминированная сборка, архив r3, реестр/Predicate Draft и обратное чтение.
- [x] Live r4: два отчёта 19:07:54 и 19:08:01 приняты, fixtures сохранены.
- [x] Роль Addon после swap (AS-B08c): исправлена в r5, live-повтор ожидается.
- [ ] Остальные шесть context-only правил и P0 ниже остаются открытыми.

## r3 · 2026-09-29 · Editor 0.2.60

- [x] Operation=False разрешён: прежний RuleID порядка использует явный structural
  scope; скрытие и перестановка больше не смешиваются. Поле редактируется в Editor.
- [x] Исправлен ложный incomplete вложенного Amount для hidden optional Addon;
  неизвестные факты и отсутствующие captures по-прежнему не проходят.
- [x] 31 исходный отчёт сохранён в immutable gzip fixtures; replay сохраняет все
  реальные нарушения и убирает только ложный fixed-part-order.
- [x] AS-B01–AS-B08: 29 live r2 отчётов, 87/87 ожидаемых исходов binding rules.
- [x] Opacity=True и 60% Minor/Currency определены верно; правила не ослаблены.
- [x] QA r3: 585/585 Editor, 272/272 пакетов, typecheck/build, идентичная
  пересборка ZIP. Старые compiled сохраняют точный replay (completion version gate).
- [x] Правило в реестре и Predicate Draft обновлены и проверены чтением.
- [x] Два live r3 отчёта подтверждают Operation=False и Opacity True/False;
  opacity-нарушения сохранены, чистый экземпляр без нарушений.
- [x] TEXT targets после Opacity variant changes исправлены в r4 (offline QA).
- [ ] Addon swap остаётся отдельным P0; неизвестные bindings не объявлены pass.
- [ ] Остальные шесть context-only проверок не закрыты этим исправлением.

## r2 · 2026-09-29 · Editor 0.2.59

- [x] Три прежних RuleID переведены в predicate: parts-share-color,
  parts-share-text-style, manual-text-style-is-layer-property.
- [x] Общий typed constraint bindingConsistency: явные TEXT roles, visibleOnly,
  сравнение ключей fill-token/text-style и pinned selected-variant reference.
- [x] Capture диапазонов fill, разрешение локальных Variable ID с кэшем,
  нормализация ключей и переиспользование штатных all-equal/count-between.
- [x] Поля настройки доступны в Editor; manual остаётся единственным ручным источником.
- [x] Offline QA: Editor 575/575 (34 новых теста), пакеты 272/272; typecheck/build
  успешны, повторная сборка идентична. Реестр и Predicate Draft сверены обратным чтением.
- [x] Live-приёмка трёх binding rules r2: AS-B01–AS-B08, 87/87; пакет остаётся Draft.
- [x] Созданы 29 Figma-кейсов AS-B в существующей секции AmountStyle; выполнены
  структурное обратное чтение и визуальная проверка. Отчёты Editor получены и сохранены.

## r1 · 2026-09-29

- [x] Сверить три публичных семейства и внутренний Operation с живой Figma.
- [x] Сохранить изолированную Athena REST выгрузку; 21/21 variant structures.
- [x] Подключить pinned Core Amount r5, не копируя его правила в manual.
- [x] Закрепить Addon и Opacity как ограничения пресета по ответам владельца.
- [x] Разделить 49 исходных RuleID: 29 в пресете, 20 в pattern handoff;
  добавить два явных sibling rules для Currency Opacity.
- [x] Исправить общий root-child path и standalone dependency identity в Editor.
- [x] Импорт/экспорт ZIP сохраняет manual, facts и compiled child без изменений.
- [x] По решению владельца полностью отменено ограничение Currency.Custom «только
  вне стандартного списка»; в паттерн не переносится.
- [x] Offline QA: Editor 541/541, пакеты Amount/Button 272/272, включая 6 AmountStyles;
  typecheck/build без ошибок. Это не live-приёмка; девять gaps остаются открытыми.
- [x] Реестр правил, леджер и Predicate Draft обновлены и сверены обратным чтением.

## P0 — исполняемость и приёмка (не закрыто)

1. Подтверждено r2: общий токен всех видимых текстовых частей; raw RGB, detach
   и смесь токенов не проходят. Addon не входит в явный список целей.
2. Подтверждено r2: Text Style выбранного Style пресета для всех диапазонов.
   Другой библиотечный стиль не допустим только потому, что допустим в Core Amount.
3. Проверять высоту Addon относительно доказанного line-height выбранного варианта,
   не фиксированного default. Проверить обычный StatusBadge; Inverted не включать
   автоматически без отдельного подтверждения его принадлежности разрешённому семейству.
4. Operation: родительский BOOLEAN, Negative, знак; штатный switch не должен считаться
   ручной кастомизацией. Геометрия и appearance — без привязки ширины к тексту default.
   No-wrap отменён владельцем в r6 и не является открытым P0.
5. Live Editor: 19 defaults, разрешённые настройки, negative cases, nested Amount
   execution, unknown evidence, ZIP/session/replay. Не считать unit tests live-приёмкой.

## P1 — отдельно

- Синхронизация Hub после решения drift; не переносить predicateContour в Markdown.
- Детализация и подключение pattern handoff (таблицы, цвет по смыслу, формат, каналы).
- Code mapping через Core Amount и typography context. У AmountStyles нет прямого export.
- Production publication только после отдельного решения и приёмки.
