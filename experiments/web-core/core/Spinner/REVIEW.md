# Spinner — ревью 2026-09-27

## Финальное ревью: manual r8

**6/6 правил Reviewed; объявленный Figma predicate-контур Ready.** Это авторская/
исполнительная готовность перечисленных правил, не обещание полной проверки
всех свойств Figma или готовности code adapter/production.

| Правило | Основания | Граница |
|---|---|---|
| `auto-layout-1` | 10 явных layout facts; accepted L01–L06; either-side/missing truth table и controller tests;7 пересечений сохранены | Padding/gap/оси проверяются по явной применимости; mode/sizing не отключаются. Недостижимые layoutMode изменения — только моделируемые тесты, не live-доказательства. |
| `layer-properties-use-effective-baseline` | 13 constraints; независимый baseline, paints/token identity; G01–G04 приняты ранее; текущие r8 controller-проверки gradient alpha/transform/token; missing→incomplete | Не включает vector geometry, произвольные координаты, полную матрицу variable modes или автоматический reset. |

r8 меняет только два status и metadata.revision/updatedAt. IDs/semantics/conditions/
constraints/source facts сохранены. RuleIR logic/runtimePolicy r7 и r8 совпадают;
1008 L01–L06 verdict/trace/coverage/details сохранены с новыми revision-derived IDs.
Прямого live capture r8 не было: повторять статусы не нужно, parity это не новый
Figma-прогон. Исходные r7 manual/compiled архивированы, шесть live JSON — qa/fixtures/.
Проверки:264 Editor +27 package tests и typecheck. Сверены7/7 pinned Hub sources,
нового drift нет; конфликты production и Addon wording остаются в леджере53/54.

Code mapping/representations/generation остаются Draft и не пересматриваются этим
решением. Compiled readiness=ready, runtime index draft/unpublished — не публикация.
Builder liveAcceptance=pending относится к прямому r8 capture; доказательство review
и parity — `qa/final-review.2026-09-27.json`. Нормативный источник только manual;
этот протокол не добавляет новых правил. Button dependency — следующий этап.

Прежние24/G JSON были удалены пользователем из временной папки; это допустимо.
Не требуем повторить всю матрицу. Историческое принятие сохранено, exact replay
этих удалённых файлов заново не заявляется; новые принятые отчёты архивирует агент.

## Дополнение: последняя целевая P0-приёмка, 10:53 UTC

Editor0.2.33 /manual r7, L01–L06 приняты: padding/alignment у Fixer с NONE
не вызывают ложных нарушений, активные root padding/оси дают ожидаемые findings.
6/6 matched и полная проверка во всех; exact replay1008 evaluations/coverage/details.
Независимый эталон сохранён, фактические изменения совпадают с планом.
Итог: `qa/layout-live-acceptance.2026-09-27.json`; 11 новых regression +8 base tests.
Оба известных runtime P0 имеют целевую приёмку. Это не автоматическое изменение
manual.reviewStatus: остаются4 reviewed/2 draft до отдельного ревью этих правил.
Следующий шаг — такое ревью и решение о готовности, затем композиционная зависимость
Button→Spinner. Утверждения об открытых P0 ниже относятся к истории.

Новые шесть отчётов сохранены без изменения байтов в `qa/fixtures/layout-r7/`.
Прежние24 и G01–G04 JSON отсутствуют в `editor/`; их историческая приёмка
зафиксирована, но повторный replay текущего checkout не подтверждён. Восстановление
оригиналов — отдельный P1; результаты новых тестов не заменяют старые fixtures.

## Дополнение: целевая live-приёмка 09:37 UTC

G01–G04 на Editor0.2.32 /manual r6 приняты: исходный без findings, alpha gradient
stop, transform и отвязка solid token дают по 2 atomic violations →1 карточке.
Все сценарии полные, 6/6 matched; 552 evaluations и Editor/details replay exact.
Независимый reference не перенимает изменения actual. Эта приёмка закрывает
целевой gradient capture P0, но **не** статус двух Draft правил: ещё открыт P0
неактивных padding/alignment. Нормативные документы и runtime не менялись.
Итог: `qa/gradient-live-acceptance.2026-09-27.json`; 7 новых regression tests
и 8 base package tests проходят. Прежние JSON для исторического review-suite
сейчас отсутствуют, поэтому его повторный replay не подтверждён в этом запуске.

Ниже — хронология ревью/реализации до этой приёмки.

## Дополнение: Editor 0.2.32, gradient capture

Первый P0 ниже реализован в общем Editor/core: stops/transform/bindings четырёх
типов градиентов захватываются симметрично, отсутствующие/некорректные поля дают
unknown и неполный сценарий. Локальные проверки пройдены; новая целевая приёмка
в Figma **ожидается**. P0 неактивных padding/alignment ещё открыт.
Manual r6 не изменён; source RuleID и статусы сохранены, пакет остаётся Draft.

Исторические результаты ниже относятся к Editor **0.2.31**. Его compiled сохранён
в `history/r6-editor-0.2.31/compiled/component-contract.v2.json`; исходные отчёты
не переписаны. Новый compiled0.2.32 не объявляет старые неполные gradient captures
полными. Итог патча: `qa/gradient-capture.2026-09-27.json`; целевые кейсы —
[TESTCASES.md](TESTCASES.md#целевая-приёмка-editor-0232-градиенты).

## Исходное ревью до патча

**r6 / Draft: 4 reviewed, 2 draft.** Из пяти открытых правил приняты три.
Единственный ручной источник — `contract.manual.json`; этот файл является
протоколом ревью, не параллельным нормативным документом.

| Правило (окончание стабильного RuleID) | Решение | Граница приёмки |
|---|---|---|
| `component-properties-are-first-class` | Reviewed | Size/Inverted/Static — штатный API, 12 комбинаций подтверждены Athena/live. Policy-only, без фиктивного predicate и продуктовых ограничений. |
| `intrinsic-size-required` | Reviewed | Root width/height относительно независимого текущего варианта. Scale, отдельные width/height и missing baseline проверены; внутренняя vector geometry и размеры Button не входят. |
| `library-instance-required` | Reviewed | Predicate проверяет type=INSTANCE; общий resolver отдельно доказывает identity. Foreign/missing key и detach дают неполную проверку, не pass и не поиск по имени. Negative identity cases проверены локально, не в новой Figma-серии. |
| `auto-layout-1` | Draft | Gap gate подтверждён; padding/alignment ошибочно сравниваются при layoutMode=NONE. Нужны явная применимость и negative/unknown-тесты. |
| `layer-properties-use-effective-baseline` | Draft | Reference и solid token binding подтверждены. Не захватываются gradientStops/gradientTransform; остаётся проблема неактивных padding. |

Прежде reviewed `visual-style-1` сохранён: смысл запрета не изменён. Но прежнее
ревью смысла не доказывает полноту runtime; gap градиентов относится и к нему.
Весь пакет остаётся Draft до исправления, Button пока не подключён.

## Проверенные доказательства

- r5 архивирован в `history/r5/contract.manual.json`. Все исходные отчёты и их
  SHA256 неизменны. r6 меняет только три статуса, revision и updatedAt.
- Новый manual hash: `f0fb69e1319e5c552abe9b865be9a49634dd332f0a0c27ef90383fd70e06a96f`.
  31 predicate + 1 policy-only; RuleID, constraints, targets, applicability,
  control paths и generated facts сохранены.
- Все 24 отчёта: exact replay исходных engine/Editor/details. Для r6 сохранены
  3312 verdict/subject/applicability/trace/severity и coverage. Из сравнения
  исключены только revision-derived evaluationId/ruleRevision; RuleIR отличается
  лишь revision/source/authority. Это semantic parity, не новая live-приёмка.
- 9 новых тестов: review-only diff; replay24; public API; width/height negatives
  и missing baseline; identity fail-closed; overlap/grouping; два воспроизведения
  открытых проблем. Последние подтверждают **наличие дефекта**, а не исправление.
- Все 7 закреплённых файлов ds-ai-hub совпадают с текущими по SHA256. Прежний
  конфликт «swap в Addon» vs `Addon.Type=Spinner` остаётся в леджере; хаб не изменён.
  Adapter не разрешает произвольный Figma scale.
- Реестр синхронизирован и проверен повторным чтением: Правила1716/1717/1833–1836,
  Core components AF61:AH61 (Predicate Draft /2026-09-27), Леджер53/54.

`qa/live-acceptance.2026-09-27.json` описывает принятую r5. Builder пишет
`reports/readiness.json.liveAcceptance=pending` для новой ревизии: r6 не имеет
нового capture, но имеет проверенную semantic parity. Повтор 24 кейсов только
ради статусов не нужен; после изменения runtime нужны целевые новые кейсы.

## Пересечения

С baseline-правилом пересекаются 7 auto-layout paths (4 padding, gap, 2 sizing)
и 5 visual-style paths. У baseline уникален strokeWeight, у auto-layout — mode
и 2 alignment. Удаление целого правила потеряет coverage или исходный RuleID.

Общий `groupEvaluationDetails` уже объединяет одинаковые node/property/actual/
expected в одну карточку с обоими RuleID. Проверено на C01: 2 atomic violations
→ 1 карточка; разные ожидания и unknown не объединяются. IDs и явные списки
сохраняем. Упрощение authoring — P1, не новая runtime-архитектура.

## Следующие шаги

1. **P0 — полнота paint capture.** Сохранять stops (position/RGBA/bindings) и
   transform реального GRADIENT_ANGULAR симметрично в actual/reference. Старый
   snapshot без обязательных полей — unknown, не полная проверка. Generic
   реализация, без Spinner-specific исключений. Тесты: pristine, stop/color/alpha/
   transform override, token detach, missing facts; затем целевые live-кейсы.
2. **P0 — применимость padding/alignment.** Явная manual policy через общий
   compiler: relevant layout в actual ИЛИ baseline; NONE→H/V и обратная смена
   остаются проверяемыми, missing activity → unknown. Sizing не отключать вместе
   с padding: он может зависеть от родителя. Проверить inactive/active/removal/
   missing и отрицательные изменения каждого поля. Без глобального silent skip.
3. Повторное ревью двух Draft правил и целевая Figma-приёмка. Затем dependency
   Spinner в Button без копирования predicates; размеры/цвет/Loading route
   определяет Button, продуктовые ограничения — pattern owner.

Ограничения: Inverted не равен variable mode; матрица не доказывает все light/dark
modes. `semanticApi.visible` — unsupported binding, code mapping Draft. Safe
remediation пока обозначает намерение, не гарантирует автоматический reset.
Vector paths, произвольная геометрия/позиции потомков и анимация не покрыты;
продуктовые loading-сценарии находятся за границей этого компонентного контракта.

Проверка из корня design-system_ab:

```sh
node --test scripts/tests/spinner-contract.test.js scripts/tests/spinner-rule-review.test.js
```
