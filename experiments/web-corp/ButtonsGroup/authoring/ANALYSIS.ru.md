# ButtonsGroup — анализ для ручного заполнения

Дата: 01.10.2026. Статус: подготовка authoring; новый manual не создан и
Ready не объявлен. Разобраны 32 source rules, composition/override sources,
документация Hub и все 16 текущих библиотечных вариантов Figma.
Это разбор и инструкция; он не является ComponentContract или runtime input.

## Принятые решения владельца

| Аспект | Решение 01.10.2026 | Следствие для нового manual |
| --- | --- | --- |
| Минимум видимых кнопок | «Разрешить одну видимую кнопку» | Desktop 1–4, mobile 1–2. Старое `minimum-two-buttons` заменяется новым минимумом 1. |
| View вложенной Button | «Только Primary и Secondary» | Более широкий domain Core Button сужается контрактом группы. |
| Root Hug/Hug | «не используем это правило» | Не переносить `root-sizing-is-hug-hug`; не вводить его косвенно через blanket auto-layout lock, width/height или sizing baseline. |

Правила SingleIcon/overflow про минимум две кнопки остаются отдельными:
одна текстовая кнопка допустима, одиночный kebab не допустим. Primary не
обязателен; если присутствует — максимум один и первый среди видимых.
Root sizing свободен от отменённой нормы; режим HORIZONTAL и gap/padding
остаются своими требованиями. Библиотечные FIXED/HUG mobile — наблюдаемые
факты, не новая обязательная норма и не повод править библиотеку.

Исходные legacy JSON сохраняются как evidence. Решения относятся к новому
ручному контракту; старый compiled эксперимент не объявляется соответствующим
этим решениям. При создании manual сохранить accepted decisions/sourceRefs
и отмену старого sizing RuleID в audit, не оставлять его активным predicate.

## Технические ограничения перед полной проверкой

1. **Одноимённые occurrences.** Все direct children называются `[D] Button`
   или `[M] Button`. `snapshotPaths` требует уникальные именные пути;
   `extractVariantEvidence` отбрасывает структуру с повторным путём.
   Gate срабатывает до source identity 0.2.73. Synthetic control на общем
   built core: одинаковые имена → shape unavailable, 0/5 baseline matches;
   уникальные diagnostic имена при тех же keys/source IDs → 5/5.
   Это подтверждение ограничения, не live audit будущего контракта.
   Повторить: `node check-duplicate-name-paths.js` из этого каталога после
   сборки shared core. Результат сохраняется в `duplicate-name-check.2026-10-01.json`.
2. **Прямые зависимости Button.** Текущий `FixedNestedBinding` рассчитан на
   owner INSTANCE → непустой childPath и уникальную пару targetRole/relativePath.
   Проверенный Button → Addon → Spinner route нельзя механически превратить
   в group → четыре/две прямые Button. Self childPath пустым невалиден;
   несколько children одного root также не описаны текущей уникальностью.
3. **Условный порядок коллекции.** Quantity и nested domain/mapping существуют,
   но exact `positionOrder` не выражает «Primary необязателен и первый видимый»
   или «SingleIcon последний видимый» при разрешённом скрытии средней кнопки.
   Нужны count-by-value/first-visible/last-visible с host conditions либо
   отдельно доказанная конечная configuration model.

Бэклог Editor: `BUTTONSGROUP-AUTHORING-001/002`.
Потребитель Apollo v4: `APOLLO-V4-PARITY-006/007/008`.
Не переименовывать исходную библиотеку, не придумывать пути `Button#2` и
не выбирать occurrence по имени/индексу ради обхода. Вручную можно сохранить
draft правил; полное исполнение и dependency closure требуют этих доработок.

## Проверенное устройство Figma

Источник: [Web Corp, ButtonGroup](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/?node-id=62786-37766).
Read-only evidence: `figma-readback.2026-10-01.json`,
`single-icon-readback.2026-10-01.json`. Nodes не изменялись, экземпляры не создавались.

| Факт | Desktop | Mobile web |
| --- | --- | --- |
| Публичный root | `[D] ButtonsGroup` | `[M] ButtonsGroup` |
| Component set | `62786:48893` | `133812:11630` |
| Set key | `f05915599f71e822fd8b46a2b2509a2e395005cf` | `3efdfaf64eddbcf48b183ce917b7a64c0c3d6062` |
| Встроенных Button | 4 direct INSTANCE | 2 direct INSTANCE |
| Button set key | `f9979d6cc8598aec25f721e0a45b7eef2eeb0088` | `7fb0c8679c682f7f82c031538c1b9efef8d98f1c` |
| Root API | Size, Overflow | Size, Overflow |
| Варианты | 4 Size × 2 Overflow | 4 Size × 2 Overflow |
| Auto layout | HORIZONTAL | HORIZONTAL |
| Padding в библиотеке | 0 по четырём сторонам | 0 по четырём сторонам |
| Sizing в библиотеке | HUG/HUG | FIXED/HUG; только факт |

Size — VARIANT со строковыми значениями `32`, `40`, `48`, `56`.
Overflow — VARIANT со строками `false`, `true`, **не BOOLEAN property**.
Значения вложенного SingleIcon — строки `False`, `True` с прописной буквы.
Если semantic API нормализует их в boolean, transform должен быть явным;
не смешивать типы в constraints и host conditions.

Встроенные «button slots» — обычные INSTANCE, не native SLOT внешнего Body.
У них пустые group-level componentPropertyReferences: видимость меняется
на слое, готовых host BOOLEAN `Button1Visible` и т. п. нет.

| Size | Desktop gap, px | Mobile gap, px |
| --- | ---: | ---: |
| 56 | 16 | 8 |
| 48 | 16 | 8 |
| 40 | 12 | 8 |
| 32 | 8 | 8 |

Gap брать из effective baseline выбранного platform/Size; не фиксировать
16 на всём desktop. Overflow не меняет gap в прочитанных вариантах.
При false все built-in Button текстовые; при true последняя библиотечная
Button имеет SingleIcon=True. Это источник исходной композиции, а разрешения
на скрытие/настройки определяет контракт. Не требовать все кнопки видимыми.

Nested Button API включает View, Size, Shape, SingleIcon, DisabledState,
Label/Hint и addons. У группы нет общего Disabled/Loading API.
В D/M Size=56, Overflow=true видимая иконка — `dots-three-horizontal`,
семейство `fbff043825f38065070826258145c12a6a021f6d`, variant key
`0b592b067d6f6f5761d1f9bef0e0aa4449e1659f`, Size=24, Style=Line, Color=False.
Путь внутри этой Button:
`LeftAddon / LeftAddon / Fixer / PaintMe / dots-three-horizontal`.
Она связана с `Icon-24#13:0` вложенного Addon. Для остальных Size путь/порт/
variant dimensions нужно подтвердить отдельно; не превращать 24 px в общую норму.

## Рекомендуемый порядок ручного заполнения

Начать с desktop, затем оформить отдельный mobile manual или явно разделённые
representations/scopes. Значения root API одинаковы; различаются число Button,
keys и baseline. Mobile не копирует desktop gap.

1. **Identity и purpose.** Группа связанных действий с общей иерархией;
   keywords ButtonGroup/ButtonsGroup. Platform и representation locator брать
   из соответствующего root. Source package называется `ButtonGroup [D]`, но
   содержит обе платформы. Не искать компонент по этому имени в consumer.
2. **Targets.** Root и четыре/две отдельные semantic occurrences встроенных
   Button. Роли, например button-1…button-4, — назначенные смысловые targets;
   номер не является доказательством runtime identity. Доказать source lineage
   и resolution после исправления именных paths.
3. **API.** Size — domain `32,40,48,56`; Overflow — domain `false,true` в типе
   фактического VARIANT. Root Disabled/Loading/Skeleton не добавлять.
4. **Root layout.** HORIZONTAL через propertyDomain; itemSpacing forbidden
   относительно effective baseline; четыре padding forbidden относительно
   baseline. Scope self. Не выбирать весь `auto-layout@1`: он включает sizing
   и alignment, а sizing rule владелец отменил. Не фиксировать bounds.
5. **Root visual.** Forbidden только fill, stroke, opacity, radius. Можно
   выбрать эти четыре members visual-style; effects в exact source rule не
   входят. Typography и прочие свойства вложенных Button принадлежат Button.
6. **Видимость.** Для каждого built-in target разрешить direct visibility.
   Не объявлять внешнее content ownership и не создавать INSTANCE_SWAP API.
   Скрытие среднего target допустимо; добавление/дублирование/replacement
   отдельно запрещены structural policy.
7. **Количество.** Root/self → «Количество» → явные роли button-1…button-4
   (mobile две), «только видимые», min=1, max=4 или 2. Dependency quantity —
   второй вариант после исправления прямых bindings. SingleIcon также считается
   одной видимой Button; пункты внешнего overflow в этот count не входят.
   Отдельное условие SingleIcon требует min=2, а не меняет общий min обратно на 2.
8. **Зависимости.** Закрепить `core.web.button` r31 с manual/compiled hashes
   и полным Spinner r8 closure, когда прямой binding станет выразимым.
   Дочерние source правила не копировать. До этого явно оставить dependency
   execution pending, не заменять его пустым «allowed nested component».
9. **Host narrowing.** View каждой видимой Button — Primary/Secondary.
   Size каждой видимой Button равен root Size. Для nested domain использовать
   dependency VARIANT property и require-domain; Size mapping от явно bound
   semanticApi.size: 32→32, 40→40, 48→48, 56→56. Pins/bindings должны быть
   доказаны; отсутствие identity не считается нулём или compliant.
10. **Условная композиция.** Primary max=1, первый видимый, отсутствие допустимо.
    SingleIcon max=1, последний видимый, только при Overflow=true и count≥2.
    Для самого Overflow=true также сохранить отдельное условие count≥2.
    Не ставить точную неизменную последовательность всех четырёх ролей.
    Не выводить обязательное наличие видимого kebab только из Overflow=true:
    source composition задаёт maxCount=1, штатные кнопки допускают скрытие.
    Fixed icon narrowing действует на фактически используемый SingleIcon.
11. **Context/runtime rules.** Перенос действий, action identity, меню,
    закрытие, disabled Tooltip и code Loading/Skeleton оставить собственным
    маршрутом. Root snapshot не доказывает runtime interaction. В scope Ready
    входят только authored и проверенные правила с явным coverage остальных.

Точные UI поля: «Component dependencies · fixed nested» хранит pins/bindings;
«Вложенный компонент / каталог иконки» — subjects, VARIANT property и mapping;
«Количество» поддерживает dependency либо explicit targetRoles/visibleOnly.
Типы есть в Editor 0.2.73, но это не означает готовую поддержку этой anatomy.

## Разбор всех source rules

Префикс ID каждой строки: `component:web-corp.buttons-group.`.
Маршруты ниже предложены для authoring, не означают выполненное исполнение.

| Source ID suffix | Смысл / маршрут нового контракта |
| --- | --- |
| exists-in-code | Context/reference: источник утверждает D/M availability; actual code/API здесь не проверялся. Не добавлять Figma predicate «код существует». |
| prefer-group-for-related-buttons | Pattern/usage: предпочитать готовую группу для связанных действий. Нужен контекст экрана. |
| visible-button-limit | Predicate quantity: max 4 D / 2 M, видимые Button, включая SingleIcon. |
| primary-is-first-and-unique | Conditional collection: Primary необязателен, max 1, первый видимый. Pending generic contour. |
| minimum-two-buttons | Старую норму не переносить. Решение владельца: общий min 1; сохранить supersession при новом authoring. |
| uniform-size | Root Size domain + nested VARIANT mapping к root Size. Child identity обязательна. |
| nested-button-views-are-primary-or-secondary | Host domain View {Primary,Secondary}, подтверждён владельцем. |
| nested-buttons-follow-button-contract | Pinned Button r31 dependency; host сужает только явно заданные свойства. |
| horizontal-layout-is-fixed | Root propertyDomain layout.mode={HORIZONTAL}. |
| spacing-uses-effective-baseline | Root forbidden itemSpacing по selected variant/mode. |
| visual-and-layout-baseline-is-fixed | Root-only fill/stroke/opacity/radius + 4 padding по baseline; не recursive Button lock. |
| root-sizing-is-hug-hug | Отменено владельцем для нового manual. Нет sizing/width/height lock. |
| actions-descend-by-priority | Pattern/delegated: приоритет действия не выводится из View или текста Label. |
| built-in-buttons-can-be-hidden | Allowed direct visibility, включая middle; другие ограничения остаются. |
| overflow-moves-nearest-action-first | Context/runtime: первым переносить соседнее с kebab действие, затем справа налево. Нужны before/actions facts. |
| has-no-group-state | Context/API: state у child; root Disabled/Loading отсутствуют, Skeleton code-only. |
| single-icon-opens-overflow-list | Runtime/interaction: SingleIcon открывает платформенный список; не другое действие. |
| single-icon-icon-is-fixed | Host narrowing glyph identity/baseline для активного SingleIcon. Обычные Button addons следуют широкому child API. |
| overflow-container-follows-platform | Pattern/runtime context: D OptionList, M BottomSheet со списком без footer. Вне host subtree. |
| overflow-items-preserve-action-content | Context/runtime: сохранить label, action и наличие иконки. Нужна явная связь action, не совпадение текста. |
| overflow-item-count-is-contextual | Context: отдельного max hidden items нет; не применять max 4/2 к меню. |
| button-labels-follow-button-contract | Button dependency + editorial pattern; labels freely configurable, baseline text lock не нужен. |
| visible-and-overflow-actions-are-unique | Pattern/runtime: одно действие не дублируется одновременно видимым и скрытым. Label uniqueness не доказывает action uniqueness. |
| use-only-built-in-button-slots | Structural policy: toggle existing occurrences; no add/duplicate/swap/detach. Quantity alone не покрывает замену при том же count. |
| overflow-enables-last-single-icon | Conditional predicate: активный SingleIcon только last visible и при Overflow=true; interaction остаётся отдельным scope. |
| overflow-is-optional-from-two-buttons | Разрешение Overflow при ≥2, даже до max; не требовать overflow при достижении лимита. |
| disabled-state-is-preserved-in-overflow | Runtime: disabled action/Tooltip reason. Mobile hover wording требует platform interaction evidence, не выдумывать Figma state. |
| overflow-list-closes-after-action | Runtime: список закрывается после доступного действия. |
| visible-button-loading-follows-button | Child runtime Loading; у OptionListCell его нет. Figma variant не придумывать. |
| skeleton-is-code-only | Context-only code capability; от Figma не требовать Skeleton. |
| single-icon-is-last | Тот же conditional collection invariant; связать source IDs, не дублировать identical check. |
| single-icon-requires-two-buttons | Conditional quantity min=2 для SingleIcon, при общем min=1. |

Legacy composition содержит `countBetween`, `propertyEqualsHost`, `valuePosition`;
их технические IDs отличаются от human rules. Они не являются новыми typed
constraints Editor. Переносить семантику через shared authoring schema, сохраняя
source linkage и coverage; готовый legacy compiled не подмешивать в manual.
Старое `PickerButton` в subjectLabel означает last SingleIcon внутри Button,
а не новый самостоятельный child группы.

## Что проверить после ручного заполнения и до Ready

| Контроль | Ожидаемый смысл |
| --- | --- |
| Одна видимая текстовая Button, Overflow=false | Допустима D/M. |
| Только Secondary, без Primary | Допустимо. |
| Две Primary или Primary не первый видимый | Нарушение композиции. |
| Скрытая средняя Button при корректном count/order | Допустима. |
| Root Size=40, видимая child Size=48 | Нарушение host Size mapping. |
| View Accent/Outlined | Нарушение узкого domain группы. |
| SingleIcon в середине / при Overflow=false / один видимый kebab | Нарушение соответствующего conditional rule. |
| Group Overflow=true до max платформы при ≥2 | Допустимо. |
| Overflow=true при одной видимой текстовой Button | Нарушение отдельного минимального count для overflow. |
| Desktop Size=40 gap=12 / gap=16 | Контроль / отклонение selected baseline. |
| Root width/height/sizing изменены, остальные нормы соблюдены | Отменённый Hug/Hug не создаёт violation. |
| Label/DisabledState/addons меняются по Button API | Допустимость определяется child contract и явными host narrowing rules. |
| Иконка активного SingleIcon заменена | Нарушение fixed icon narrowing; обычная Button иконка не получает этот blanket запрет. |
| Added/duplicated/replaced Button при том же видимом count | Structural violation или явное unknown до доказательства; не PASS по count. |
| Недоступны source identity/order/reference/dependency | Явная неполнота; не PASS и не выдуманная норма. |

Cases на Figma canvas должны содержать полный текст правила и стабильный RuleID.
Сначала compiler/source closure, потом negative/control replay и пользовательский
live run; Ready только для принятого authored scope. Новые изменения Editor,
которые понадобятся при этой работе, заносить в backlog Apollo v4 в той же задаче.

## Источники и фиксация расхождений

- `JSONS/web/components/web-corp/ButtonGroup [D]/rules.json` — 32 source rules;
  SHA-256 `038cd923d9bca88bb4f718723fc7bbf2f98de20dfb9623c7d8f73be6461ebf22`.
- `composition-contract.json` — SHA-256
  `f8609190ca48af5eb6dccf07f24412cad7ee4a41236efe807c2228ca567cc2d6`.
- `contract.overrides.json` — SHA-256
  `f856ae9a47275b6b188f2e3d5ada1c7e21673f600300cf5e2e2aa7c90d9118a3`.
- Hub `products/ab/components/button-group/instructions.md`, adapters/cookbooks;
  `products/ab/patterns/buttons-and-buttons-group.md` — usage/editorial evidence.
  Не сводить отсутствие одинакового RuleID к Missing: секции могут покрывать смысл.
- Принятый child manual: `experiments/web-core/core/Button/contract.manual.json` r31.
  `experiments/patterns/buttons-and-button-groups/rules.manual.json` — отдельный
  draft handoff, runtime не подключён; не добавляет автоматических запретов группе.
- Shared core: `snapshot-topology.ts`, `variant-facts.ts`, `instance-correspondence.ts`,
  `component-dependencies.ts`, `compiler.ts`, `validator.ts` в Apollo-v3 package.

[Таблица учёта](https://docs.google.com/spreadsheets/d/1u3Y7lhO3udXAhGlf7hOk2_zYkWZ0-vgtd6KjtbnxLnk/edit):
`Леджер` row 12 — решения о min/View; row 83 — отмена Hug/Hug после mobile
readback; row 84 — технические authoring/capture gaps.
`Правила` rows 579/580/591 отражают owner решения и scopes вместо прежнего
source-only Missing. `Corp components` row 10 Predicate становится Draft:
старый Ready относится к Apollo 0.1.62 и не подтверждает новый manual/новые нормы.
