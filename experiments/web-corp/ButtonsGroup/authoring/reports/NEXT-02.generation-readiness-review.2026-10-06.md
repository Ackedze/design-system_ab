# NEXT-02 · проверка готовности генерации · 06.10.2026

Результат: подтверждены текущие исходные пакеты и независимое чтение объявленных свойств. Полную принятую привязку и разрешение на исполнение из этих входов сформировать нельзя. Этот отчёт — техническая координация, не нормативный источник и не accepted receipt.

Все 26 desktop правил ButtonsGroup уже Reviewed; пилот уже согласован: desktop CorporateContent Body → ButtonsGroup, Size=56, Overflow=false, две обычные текстовые кнопки, только содержимое. Повторное согласование норм или состава пилота не требуется.

| Источник | Ревизия | Source | Source SHA | Compiled SHA | ZIP SHA |
| --- | --- | --- | --- | --- | --- |
| core.web.button | 31 | ready | `0177a9b6cd3fc60c8ebafbf962ec7da74538e13fd18b6b22cf77ac663feebc22` | `6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b` | `cd363081f2c8f5cf53d05fa674490e6ba719d46faebc4a7f513130a0f1676330` |
| core.web.spinner | 8 | ready | `f364e2bfc0a42a09e6656d0510905d11c793ea63324c8fba0a52e3b873ae6f95` | `909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221` | `8c38d4d3faa9014d7d2ed16e745b0150e9996d576ede807bd87019f441bdbc0f` |
| corporate-content.mobile-web | 8 | ready | `722b98e830a58e18fb47d258f99db099d52a32cd413cde7f2571c5c765408452` | `abbf345813f4589b9a37ec923afcddf69d7a7c2ed59d0fca3543fbb5c23328d3` | `78a0352a0a2a208f725c94d14ec7f1f4390417d6deaece8edc31592df553727e` |
| buttons-group.desktop | 59 | draft | `ab69dff747b8d6b6f35618563203e44b6ba2134dc32ca66854b6431df6f3d98f` | `7de13ae7567ada098ddd6960011b5bc576bf00f037d776d44e98cc6365566404` | `d7112c61163bdbd4b2979c18b75bbf9c1a2980abb37a7f7724a4a0251fa1f95e` |
| corporate-content.desktop | 13 | ready | `6393e14c0369c4f9f409931a1d7d3725819a6f35de18283060e38e435b43f914` | `aa6a991cd4455f603f5d9f6cb4f857ae55f9ef89d1e330327b7a7c8bcf42b47f` | `5848372939d4758635b41d92b4cee94815386507040002f7c2807fd1957955be` |

Полные facts/scope, dependency и consumer pins находятся в соседнем [JSON](NEXT-02.generation-readiness-review.2026-10-06.json). Проверены main/manual в ZIP, compiled projection и вложенные dependency contracts. Повторная компиляция BG r59 дала тот же hash и ноль issues.

Canonical identity остаётся отдельным техническим пробелом. У CorporateContent подтверждены exact SLOT property/type и direct native SLOT read; авторский native source address и независимое соответствие отсутствуют. У ButtonsGroup подтверждены четыре авторские цели, pin Button r31 и 12 наблюдённых значений трёх объявленных свойств. Адреса объявлены в авторских variant hints, но full variant facts содержат normalized @catalog paths без независимого native address crosswalk. Ни одно наблюдение пока не получило canonical target binding или symbol recipe. Remote main IDs, совпадение суффикса, имени, пути или порядкового номера недостаточны.

Старый приватный анализ Body использован как историческое evidence без переписывания. Новые реальные IDs, значения и подробный crosswalk сохранены только в /private/tmp/apollo-v4-canonical-binding-readiness-2026-10-06.

Девять контекстных правил для пилота:

| RuleID | Применимость в пилоте | Необходимый источник фактов / критерий |
| --- | --- | --- |
| `component:buttons-group.desktop.buttons-group.actions-descend-by-priority` | Применимо | Два реальных ActionID и независимый бизнес-приоритет; canonical видимый порядок. View и label не задают приоритет. |
| `component:buttons-group.desktop.buttons-group.overflow-moves-nearest-action-first` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.single-icon-opens-overflow-list` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.overflow-container-follows-platform` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.overflow-items-preserve-action-content` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.visible-and-overflow-actions-are-unique` | Применимо | Полные ActionID видимых/overflow действий и явная provenance; сравнить пересечение, отсутствие overflow подтвердить наблюдением. |
| `component:buttons-group.desktop.buttons-group.disabled-state-is-preserved-in-overflow` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.overflow-list-closes-after-action` | Условно not-applicable | Fresh Overflow=false probe, полная membership/absence и фактический runtime width-fit; вне ветки пилота — not-applicable с evidence, не PASS. |
| `component:buttons-group.desktop.buttons-group.visible-button-loading-follows-button` | Применимо | Явно неиспользуемый Loading в статическом пилоте, наблюдение штатного Addon/Spinner и checks Button r31. Без фиктивного Loading transition. |

В JSON по каждому RuleID сохранены точные missingFacts, условия, технически получаемые факты и необходимые продуктовые данные, а также отдельные требования будущей overflow ветки. Здесь нет копии нормативных формулировок.

Один конкретный вариант: статический content-only профиль с явно заданными двумя действиями, их независимым приоритетом, View, disabled и Loading=false; canonical correspondence всех четырёх штатных occurrences; две остаются скрытыми без удаления. Выполняются существующие 30 BG predicate checks и полная pinned dependency проверка. Для трёх применимых контекстных правил нужен trusted fact producer/checker; шесть получают not-applicable только после fresh branch/absence/width evidence. Любой computed overflow, Loading transition или неизвестная membership прекращает этот пилот.

Это reviewable proposal, executable=false. Сейчас core сохраняет BG Draft при любом nonExecutableRule, preflight требует Source Ready, native host требует Ready contract, а assessVerification отвергает pending/nonExecutable coverage. Отдельного accepted scoped receipt / статического owned-content режима нет. Наличие фактов само не включает context-only route.

Технические действия для Generation/shared core:

- `CANONICAL-SOURCE` · source owner / Generation native adapter: Independent source-owned export of exact CC SLOT owner/property/address and all four BG occurrence topology/identity entries; reviewed resolver receipt. Existing remote IDs and inherited suffixes remain candidates.
- `SCOPED-CONTEXT-EXECUTION` · shared Generation/compiler authority + Generation adapter: Implement and review a narrowly scoped fact/checker receipt contour for all nine RuleIDs with exact source/pins/plan/runtime width basis. Current compiler, Ready loader and assessVerification reject the Draft/pending routes even if a separate receipt claims success. No existing complete accepted receipt format enables this.
- `CONTENT-ONLY-OWNED-PORT` · Generation core + adapters: Current OwnedAction requires eventId; schema requires declared events and native host consequently requires a scenario binding. Add a reviewed static content projection mode before using two actions without handlers/events. Do not fabricate no-op events/transitions to satisfy the current format.
- `NATIVE-DEFINITION-AND-RECIPE` · Generation sole writer: Accepted CC SLOT operation + canonical source IDs and BG component-set/selected-variant definition support, four-occurrence preservation/two-visible mapping and symbol IDs. Current host imports mapping as ComponentNode and accepted reader is null.
- `WIDTH-AND-CAPABILITY` · Generation native/frontend adapters: Fresh complete runtime width-fit and native mutation/content readback/rollback verification at exact source/provider/build pins; four observed sample buttons do not prove the approved two-action plan.
- `PROFILE-ACCEPTANCE` · Generation / Code Connect: Exact pilot profile acceptance and accepted producer observation separate from API availability, followed by actual target/parity/live acceptance. Code representations remain Draft.

Особенность текущего протокола: OwnedAction требует eventId, схема — объявленные events, host — scenario binding. Для согласованного content-only пилота следует сначала принять статическую проекцию в техническом протоколе. Запрашивать бизнес-обработчики или придумывать no-op events ради этой схемы не нужно. Priority и Loading также отсутствуют в closed OwnedAction; их trusted receipt/sidecar должен быть принят отдельным техническим изменением.

Минимальный следующий человеческий вход — продуктовые данные: две реальные надписи/ActionID, порядок бизнес-приоритета, View и disabled каждой кнопки, явное отсутствие Loading, размер viewport и доступная ширина группы в Body (одна фиксированная ширина либо точный набор/диапазон для проверки). Native source IDs, symbol IDs и resolver receipts должен предоставить source owner/exporter; это не новая нормативная дискуссия. Точный шаблон требуемых source-owner полей лежит приватно и содержит null для отсутствующих доказательств.

Current accepted native provider и primitive policy остаются null. Native capability/mutation/readback/rollback, Code profile/parity, actual target и live acceptance не выполнены. В данном плане нет отдельного text primitive: acceptedPrimitivePolicy потребуется лишь при его добавлении; Button labels требуют source font/readback.

Ответ владельца об invalidation уже учтён: не проверено. Повторный вопрос не задавался; later export invalidation/page-switch/close cleanup остаются отдельной runtime проверкой. Нормативные файлы, ревизии, ZIP, Google, registry и compiler не изменялись.

Дополнительно последний mobile Editor отчёт 05.10 16:24 подтверждает одно нарушение SingleIcon при Overflow=false и не выдаёт отдельного нарушения за саму замену иконки. Пять зависимых проверок неопределённы из-за отсутствующего catalog fact. Это historical mobile r2 run, не receipt текущего desktop r59 пилота.
