# ButtonsGroup r57: девять context Draft правил — пакет ревью

Статус: **предложение для решения владельца, не приёмка**. Полные тексты норм взяты из main r57 и совпадают с legacy rules и crosswalk. Девять правил остаются Draft/context-only; весь источник остаётся Draft. Нормы, пакеты, pins, core, Google и accepted scope не изменены. Новых live-прогонов нет.

## Предложенный пилот

**CorporateContent desktop r12 → native Body SLOT `[D] Body#135096:3` → ButtonsGroup desktop r57, Size56, Overflow=false, две обычные текстовые кнопки.** Это отдельный content-only профиль для ревью. Он не подтверждает соответствие геометрии/отступов/поверхности CorporateContent в коде и не является глобальным Ready.

Реальный продуктовый сценарий, два выбранных native occurrences, handlers, приоритеты и lifecycle ещё не предоставлены. `pilot.desktop.plan.json` с send/cancel — только синтетический пример. Нельзя назначать первые две кнопки по индексам: выбор должен сохранять captured identity, visibility и order.

В Figma после identity-proven capture Overflow=false шесть Overflow=true норм могут стать **evidence-based not-applicable для этого прогона**. Сейчас таких receipts нет: они **unresolved**. В коде `ButtonGroup` включает picker при недостаточной ширине, даже при двух действиях и maxVisibleButtons=4; отдельного prop Overflow=false нет. Нужны runtime width/state receipts. Три нормы с applicability=all остаются применимыми.

## Точные источники и pins

| Вход | Revision / identity | Pin |
| --- | --- | --- |
| [ButtonsGroup main](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/contract.manual.json) | r57 | manualSourceHash `5ba3bf8f2b92bc842f917c209eef2e5a98f939eb0403bb4e204c7154f2cbef6a` |
| [ButtonsGroup ZIP](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/ButtonsGroup.component-contract.zip) | r57 / desktop | SHA256 `214d9cc0c16a4b7c56e3a69e9151e0d5a36d3d9d05e947bf2122d0e53eb3743a` |
| [CorporateContent main](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/contract.manual.json) | r12 | manualSourceHash `babd61bace922b9ce4c46ddad751c8bf1ebd906fd7c8e828a7a0d02c82d1a408` |
| [CorporateContent ZIP](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/CorporateContent.component-contract.zip) | r12 / desktop | SHA256 `281159400f53164d58c4302b8f3fcecc32da3aff573bb8dd949e9072cd8bc8de` |
| [Button.component-contract.zip](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/Button.component-contract.zip) | r31 | manual `0177a9b6cd3fc60c8ebafbf962ec7da74538e13fd18b6b22cf77ac663feebc22`; compiled `6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b`; ZIP `56aaa478ad4e4deb4d8b6f1973a382c8cdd99757759b6d997c5d84645d3a72f3` |
| [Spinner.component-contract.zip](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/Spinner.component-contract.zip) | r8 | manual `f364e2bfc0a42a09e6656d0510905d11c793ea63324c8fba0a52e3b873ae6f95`; compiled `909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221`; ZIP `f8eb8af5fce11b04f983151a2764a30fd4ba0419310c10171d02d731ab2dab46` |
| [Code registry](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/arui-private-80.7.1.v1.json) | arui-private 80.7.1; commit `c037d0c322ea9774a9c251400d76d41222819b87` | digest `bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0` |

Публичные импорты подтверждены: `ButtonGroup` из `arui-private/button-group`; `CorporateContent` из `arui-private/corporate-content`. Свежая проверка registry/lock и закреплённых source/mapping/ZIP файлов прошла. Это source/API availability; full code parity остаётся **not-confirmed**.

Основные источники норм: [legacy rules](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]/rules.json>), [crosswalk](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/rule-crosswalk.json), [Hub instructions](/Users/alexkukhta/Desktop/workplace/ds-ai-hub/products/ab/components/button-group/instructions.md), [code intent](/Users/alexkukhta/Desktop/workplace/ds-ai-hub/products/ab/components/button-group/adapter.code.md), [editorial pattern](/Users/alexkukhta/Desktop/workplace/ds-ai-hub/products/ab/patterns/buttons-and-buttons-group.md). Точные sourceRefs, SHA256 и позиции источников каждого правила находятся в JSON companion.

## Правила

### 1. component:buttons-group.desktop.buttons-group.actions-descend-by-priority

**Норма:** Кнопки располагаются слева направо в порядке убывания приоритета действия; SingleIcon при его наличии остаётся последним.

**Сейчас:** Draft; context-only; pattern owner `ptrn:controls.buttons-and-button-groups`; applicability `"all"`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.actions-descend-by-priority`; crosswalk drift=null. Hub: Иерархия действий.

**Source refs:** `component:web-corp.buttons-group.actions-descend-by-priority`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`, `docs.buttons-group.editorial-pattern`.

**Пилот: applies.** Норма охватывает все desktop variants и две видимые текстовые кнопки. View и порядок сами по себе не доказывают бизнес-приоритет.

**Недостающие реальные входы:** Реальные action identity, назначение, приоритет и утверждённый видимый порядок двух действий. Привязка каждого action к захваченному native occurrence и действующему handler.

**Решение владельца:** Владелец сценария подтверждает бизнес-иерархию. Автоматическая проверка может сравнивать порядок с подтверждёнными priority facts, но не устанавливать бизнес-приоритет по label/View.

**Возможная проверка consumer:** Сравнить identity-preserving visible order с подтверждённым порядком приоритетов; проверить approved ties, если они есть. При отсутствии подтверждённого приоритета вернуть unresolved/human-review.

### 2. component:buttons-group.desktop.buttons-group.overflow-moves-nearest-action-first

**Норма:** При переносе действий в список у SingleIcon первым переносится действие кнопки, расположенной непосредственно перед SingleIcon; дальнейший перенос продолжается справа налево по убыванию приоритета.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.overflow-moves-nearest-action-first`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.overflow-moves-nearest-action-first`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Explicit applicability требует Overflow=true. Предложение Overflow=false ещё не является native capture receipt. Код может включить overflow при недостаточной ширине.

**Недостающие реальные входы:** Native identity/Size56/Overflow=false receipt и отсутствие SingleIcon в двух выбранных occurrences. Runtime measurements на всех разрешённых ширинах/состояниях: оба действия видимы, picker/list отсутствуют. Для полного источника — фактическая последовательность переноса и priorities.

**Решение владельца:** Для узкого профиля утвердить область ширин/состояний с запретом автоматического overflow; выход за неё должен отклоняться или требовать другого профиля. Для полной приёмки согласовать trace переноса справа налево. Список hiddenIndexes в исходном порядке не доказывает хронологию переноса.

**Возможная проверка consumer:** Сначала проверить applicability по подтверждённому variant. При Overflow=true сверить transfer trace с соседним перед SingleIcon action, затем движением справа налево; positive/negative/reset.

### 3. component:buttons-group.desktop.buttons-group.single-icon-opens-overflow-list

**Норма:** Последняя кнопка с SingleIcon=true открывает список перенесённых действий: [D] OptionList на desktop или BottomSheet на mobile-web. Использовать её для другого действия запрещено.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.single-icon-opens-overflow-list`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.single-icon-opens-overflow-list`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Для подтверждённого Figma Overflow=false правило условно не применяется. Пока реальных Figma/code receipts пилота нет; runtime auto-overflow способен создать trigger.

**Недостающие реальные входы:** Доказательство отсутствия native SingleIcon и runtime trigger/list в разрешённом профиле. Для полного desktop источника — activation receipt, opened list identity и подтверждение, что trigger не запускает отдельный business action.

**Решение владельца:** Принять проверку trigger только как входа в overflow; не назначать ему обычный handler действия.

**Возможная проверка consumer:** Для полного источника активировать штатный SingleIcon, подтвердить открытие списка перенесённых действий, отсутствие отдельного business action; negative/reset. Для профиля без overflow отклонять обнаруженный trigger/list.

### 4. component:buttons-group.desktop.buttons-group.overflow-container-follows-platform

**Норма:** SingleIcon открывает [D] OptionList на desktop и BottomSheet на mobile-web. Mobile BottomSheet содержит только список действий без footer.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.overflow-container-follows-platform`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.overflow-container-follows-platform`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Overflow=true — явное условие правила. Для пилота Overflow=false возможна evidence-based not-applicable после capture и runtime absence receipts.

**Недостающие реальные входы:** Подтверждённая desktop platform и отсутствие runtime overflow в пилоте. Для полной desktop приёмки — реальный container identity и trace открытия OptionList.

**Решение владельца:** r57 охватывает desktop. Упоминание BottomSheet в тексте не принимает mobile representation; mobile требует отдельной области и доказательств.

**Возможная проверка consumer:** При desktop Overflow=true подтвердить OptionList по native/runtime identity, а не подписи слоя. Mobile branch проверять отдельно: BottomSheet содержит только actions без footer.

### 5. component:buttons-group.desktop.buttons-group.overflow-items-preserve-action-content

**Норма:** Пункт списка для перенесённой кнопки сохраняет её label, действие и наличие иконки: если у исходной кнопки иконки нет, пункт списка также остаётся без иконки.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.overflow-items-preserve-action-content`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.overflow-items-preserve-action-content`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Заявленный Overflow=false позволяет исключить ветку лишь после native и runtime подтверждения отсутствия overflow.

**Недостающие реальные входы:** Для пилота — отсутствие runtime list на всех разрешённых ширинах/состояниях. Для полного источника — source action identity/handler/label/iconPresence и их связь с каждым перенесённым item.

**Решение владельца:** Если overflow разрешён, принять mapper и маршрутизацию по реальным action identities. Default code mapper переносит children и disabled, но не доказывает handler/action identity/icon parity.

**Возможная проверка consumer:** Сверить каждый overflow item с исходным action по stable identity, effective handler, label и icon presence; отсутствие иконки также должно сохраняться. Недостаточные action facts → unresolved, одинаковые labels не заменяют identity.

### 6. component:buttons-group.desktop.buttons-group.visible-and-overflow-actions-are-unique

**Норма:** Каждая видимая текстовая кнопка может запускать отдельное действие, а SingleIcon служит только входом в список перенесённых действий. Одно действие нельзя одновременно оставлять видимым и дублировать в списке.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `"all"`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.visible-and-overflow-actions-are-unique`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.visible-and-overflow-actions-are-unique`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: applies.** Applicability=all. Две текстовые кнопки остаются действиями; пустой overflow set нужно доказать. Нельзя объявить всю норму not-applicable только из-за Overflow=false.

**Недостающие реальные входы:** Реальные visible action identities и их handlers. Подтверждённое пустое множество runtime overflow items в предлагаемом профиле.

**Решение владельца:** Проверять запрет дублирования одного действия между visible и overflow. Не усиливать норму автоматически до запрета любых двух visible actions с одинаковым label; action meaning подтверждает владелец сценария.

**Возможная проверка consumer:** По stable action identity проверить visible ∩ overflow = ∅; trigger не считать отдельным перенесённым business action. Пустой overflow set засчитывать только по capture/runtime evidence.

### 7. component:buttons-group.desktop.buttons-group.disabled-state-is-preserved-in-overflow

**Норма:** Если перенесённое действие недоступно, его disabled state должно сохраняться в соответствующем пункте OptionList или BottomSheet; по hover показывается Tooltip с причиной недоступности.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.disabled-state-is-preserved-in-overflow`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.disabled-state-is-preserved-in-overflow`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Applicability=Overflow=true; для false потребуется доказанное отсутствие этой ветки. Значение disabled=false в synthetic example не исключает норму глобально.

**Недостающие реальные входы:** Для пилота — runtime absence overflow receipt и реальные enabled/disabled states действий. Для полного источника — disabled item, исходное состояние action, disabled reason и hover/Tooltip receipt.

**Решение владельца:** Для полной приёмки принять источник disabled reason и способ его отображения. Передача disabled в default code mapper не подтверждает Tooltip.

**Возможная проверка consumer:** При перенесённом недоступном action сверить disabled, запрет активации и Tooltip reason по hover; positive/negative/reset.

### 8. component:buttons-group.desktop.buttons-group.overflow-list-closes-after-action

**Норма:** После выбора доступного действия [D] OptionList или BottomSheet сразу закрывается.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `{"Overflow":["true"]}`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.overflow-list-closes-after-action`; crosswalk drift=null. Hub: Overflow.

**Source refs:** `component:web-corp.buttons-group.overflow-list-closes-after-action`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: unresolved.** Applicability=Overflow=true; ни отсутствие compiler route, ни предложение false не являются доказательством not-applicable.

**Недостающие реальные входы:** Для пилота — подтверждённое отсутствие runtime list. Для полного источника — enabled item selection event и состояния openBefore/openAfter со временной связью.

**Решение владельца:** Для полной приёмки определить проверяемую связь выбора доступного action и немедленного закрытия списка.

**Возможная проверка consumer:** Выбрать enabled action, подтвердить выполнение нужного handler и переход списка в closed сразу после выбора; negative/reset. Disabled item не использовать как positive для этой нормы.

### 9. component:buttons-group.desktop.buttons-group.visible-button-loading-follows-button

**Норма:** Loading разрешён у отдельной видимой Button, например после запуска её действия, и настраивается по контракту Button. У OptionListCell нет Loading state.

**Сейчас:** Draft; context-only; component owner `web-corp.buttons-group`; applicability `"all"`, desktop/all modes. Исполняемого constraint нет. Текст совпадает с источником `component:web-corp.buttons-group.visible-button-loading-follows-button`; crosswalk drift=null. Hub: Состояния.

**Source refs:** `component:web-corp.buttons-group.visible-button-loading-follows-button`, `docs.buttons-group.legacy-rules`, `docs.buttons-group.code-intent`, `docs.buttons-group.hub-instructions`.

**Пилот: applies.** Applicability=all; отсутствие Loading в начальном snapshot не исключает норму после действия. Loading опционален: правило не требует вводить его у синхронного action.

**Недостающие реальные входы:** Реальные lifecycle/state policy каждого handler: синхронное действие либо async/loading transitions. Доказательства соответствия используемых loading states закреплённому Button r31 и фактическому code Button API.

**Решение владельца:** Если предлагается профиль без Loading, владелец сценария должен подтвердить ограничение реальных lifecycle; это сужение профиля, не удаление нормы. Loading отдельной Button, code-only group showSkeleton и состояние overflow item различать. Не изобретать Loading у OptionListCell.

**Возможная проверка consumer:** Проверить начальные и post-action states видимых Button по r31; для async action — positive/negative/reset Loading lifecycle. Для синхронного действия подтвердить отсутствие неподдерживаемого Loading; не требовать его появления. При наличии overflow проверить отсутствие выдуманного Loading API у OptionListCell.

## Пять независимых уровней приёмки

| Уровень | Сейчас | Что требуется |
| --- | --- | --- |
| norm-text | 9 текстов совпадают в manual, legacy rules и crosswalk; все остаются Draft. | Явное ревью владельцем девяти точных текстов. Принятие текста не подтверждает runtime-поведение и не даёт Ready. |
| executable-coverage | 17 Reviewed predicate правил; 9 context-only Draft; 30 compiled checks; весь источник Draft. | Типизированные реальные факты и принятый deterministic/delegated/human маршрут для каждой применимой нормы; честные unresolved/not-executed результаты. |
| code-api-and-parity | Доступность закреплённых arui-private source/API подтверждена; fullContractParity=not-confirmed. | Соответствие семантики и runtime в явно принятой области; закрытие auto-overflow и CC geometry/padding/surface gaps. |
| generation-profile-authority | desktop-size56-text только выбирает Figma variant. Отдельный content-only профиль двух действий предложен; не применён и не принят. | Утверждённая область и поддерживаемый механизм authority/receipts, который блокирует неподтверждённые входы; без глобального Ready или обхода SOURCE_COMPILE. |
| live-acceptance | Новых Figma/code/frontend/live прогонов в этой задаче нет; реальный продуктовый сценарий не предоставлен. | Свежие native Body SLOT/occurrence bindings, реальные входы сценария и positive/negative/reset evidence для принятой области. |

Отсутствие Predicate/route не делает правило неприменимым. Перевод текстов в Reviewed сам по себе не закрывает nonExecutable/context-only coverage. Бизнес-иерархия требует решения владельца сценария: editorial pattern прямо относит её к тому, что автоматически не устанавливается.

## Два варианта для решения

### 1. Полная приёмка текущего desktop источника

**Статус:** reviewable-plan-not-accepted. **Область:** Текущий desktop r57 целиком, с сохранением всех 26 норм.

- Провести ревью девяти текстов; получить реальные action identities, priorities, lifecycle и overflow facts.

- Реализовать и принять проверяющие маршруты для всех применимых context норм, сохранив unknown/not-executed результаты.

- Закрыть representation/binding и code parity в принятой области; получить корректную упаковку зависимостей без переписывания pins или подстановки cached Predicate.

- Провести свежую desktop variant/binding и live/frontend приёмку positive/negative/reset; достигнуть Ready через поддерживаемые гейты.



- Не выводить mobile приёмку из упоминания mobile в desktop-нормах.

- Не устанавливать action identity или priority только по label.

### 2. Отдельный профиль двух текстовых действий

**Статус:** proposed-not-accepted. **Область:** Точно закреплённые desktop CC Body content bridge и BG Size56/Overflow=false/две обычные текстовые кнопки; content-only, без заявления CC layout parity.

- Принять девять точных норм как сохраняющиеся требования полного источника; не переводить весь источник в Ready.

- До использования утвердить отдельную типизированную область/authority, exact pins и receipts со сроком действия и проверкой актуальности в поддерживаемом механизме генерации.

- Получить два реальных действия с native occurrences, приоритетами, handlers, disabled/state policy и loading lifecycle; сохранить применимые проверки priority/uniqueness/Loading.

- Доказать отсутствие автоматического code overflow на разрешённых ширинах и состояниях; только после этого отметить шесть Overflow=true норм как evidence-based not-applicable для конкретного capture/profile/run.

- Закрыть prerequisites упаковки и профильной authority через их технических владельцев; сохранить SOURCE_COMPILE и binding gates.

- Получить native Body SLOT, точные occurrence/dependency/registry lock доказательства и frontend/live приёмку positive/negative/reset для профиля.



- Не трактовать context-only как not-applicable.

- Не принимать synthetic send/cancel за продуктовый сценарий.

- Не заявлять соответствие CC geometry/padding/surface; расширять область только после отдельной проверки.

Оба варианта сохраняют нормы. Во втором шесть правил Overflow могут исключаться только по фактам конкретного captured scope; три применимых context нормы остаются проверяемыми. Отдельная authority сейчас лишь предложена. Текущие SOURCE_COMPILE/Ready/binding gates не обходятся.

## Конкретные вопросы владельцу

1. Подтверждаешь девять точных норм как требования полного desktop-контракта и выбираешь путь: полная приёмка r57 либо отдельно ограниченный пилот с двумя текстовыми действиями? Выбор пилота не переводит весь источник в Ready.

2. Для пилота укажи реальный продуктовый сценарий и два действия: назначение/label, порядок приоритетов, реальные handlers, disabled и loading lifecycle; затем нужны конкретные native occurrences и допустимые ширины/состояния. Пример send/cancel не считается этими входами.

Для пилота минимально нужны: подтверждение норм/выбор пути, реальные действия с business/lifecycle facts, а затем native Body/occurrences и допустимые runtime widths/states. Экспортер, профильная authority и consumer routes решаются их техническими владельцами; вопросы бизнес-сценария нельзя закрыть синтетическими данными.

## Ограничения и проверка пакета

Проверены: все 9 RuleID/текстов/sourceRefs, equality manual ↔ legacy ↔ crosswalk, r57/r12 и exact archive/dependency pins, registry/lock freshness. Coverage источника: 26 правил, 17 predicate / 9 context-only, 30 compiled checks. До/после записи отчёта SHA256 закреплённых входов совпали.

Ранее выявленные prerequisites сохранены в [NEXT-02 followup](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/NEXT-02.followup-handoff.2026-10-05.md): dependency packaging и scoped authority; code fields/bindings и CC geometry/padding/surface parity в [code handoff](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/NEXT-02.code-passport-handoff.2026-10-05.md). В этой задаче экспортер не перепроверялся и рабочие ZIP не переэкспортировались. Статус параллельной починки не переопределён.

Машинный пакет: [next-02.context-draft-review.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.context-draft-review.2026-10-05.json).
