# Адаптер Apollo + Proxy

Исполнитель `apollo.figma-audit`, CLI `figma-audit`, native wire
`apollo.figma-audit.v3`, capability `figma-audit-v3`. Несовместимость отклоняется
до capture/CLI; отсутствие wireVersion означает legacy v1. У модели отключены
shell/MCP/файлы/сеть/apps/plugins. Canvas читает native: capture/read/source/verify;
focus разрешён только нажатием пользователя, операции правок отсутствуют.
Host требует requestControl=request-id-v1, factEvidence=native-fields-v1;
start передаёт controlVersion=request-id-v1.

### Пакетные факты кастомизаций (0.4.4)

customizationFacts=component-customizations-v1 требует wire3/cap3. Несовместимость отклоняется до capture/CLI. Старые профили сохраняют прежний путь; новый требует совместимых Proxy/runtime/плагина и пакета навыка.

Exact TitleView/Button variants берутся из Athena assets отдельным reader. Native compare читает base+selected patches, не вызывает V3 registry/cache/assessment или Git fallback. Один decode asset на запуск, варианты кэшируются. Pins/native facts проверяются после сравнения и на final verify.

customizationFacts.comparisons — факты. Native nodeId+field/nativeEvidenceId — target; catalogueField/catalogueNodeId/catalogueEvidenceId — source. catalogue.* не заменяет native, норму/read grant. Модель получает нужные узлы, предков и provenance; полная evidence — в отчёте. Нет source — UNKNOWN. Missing baseline не заменяется default/0/empty/PASS; каталог — pinned export, не live библиотека.

Контент, неподдержанные поля и raw overrides сохраняются независимо от diff. Для styledTextSegments host показывает factField=textSegments: alias лишь имени transport и реально прочитанных range-полей. Отсутствующие свойства не доказаны. Агент решает допустимость по Hub, включая контекст без overrides.

До verdict host проверяет роли: target — цель/потомки, context — подтверждённый предок. По feedback меняй роль/поле или добавляй sourceRequirement; rule/target/fact ID/node сохраняются. Local binding repair: два шага, затем UNKNOWN; valid provisional строки остаются. Global scope/owner/source/freshness строгие. Цитата только из planned sourceId. Typography requiredResources уже переданы; повторный поиск не нужен.

Профиль 0.4.x требует audit.catalogLifecycle=component-lifecycle-v1. Pins и схемы трёх индексов проверяются до CLI. Модель получает группы ERROR/WARNING/UNKNOWN; полные строки, PASS/NOT_LISTED и SHA остаются в catalogLifecycle. Это метаданные, не нормы; search/read_document индексы не открывают. Missing — AUDIT_DATA_REQUIRED, drift — AUDIT_DATA_STALE; старый host отклоняет незнакомый профиль, пакет0.3.0 индексы не проверяет.

Native usageContext проходит до PAGE либо первого INSTANCE/COMPONENT, защищён
от циклов и уступает UI каждые 32 предка. Возвращаются результат, ID/тип владельца;
оформление/текст вне области и новые read/source grants не выдаются. Недоступность
или обрезка — UNKNOWN; старый native без поля не доказывает standalone. Ownership
входит в identity freeze и финальное перечитывание. Наблюдаемый owner.id — только
ссылка: недоступное чтение отклоняется, а не расширяет область проверки.

`catalogLifecycle.checks`: ERROR/WARNING/PASS/UNKNOWN/NOT_LISTED, свои счётчики
и покрытие. WARNING не является ошибкой. Строки содержат targetId/category,
sourceId, matchedKeys/recordKeys, metadataWarnings и native evidenceIds; sources —
SHA256 индексов. Provisional/historical/stale сохраняются в UI/экспорте.
Индексная проверка не вызывает CLI; передача групп модели входит в usage вызова.

Профиль требует audit.documentRouting=component-documents-v1 и pinned identity
index, pattern registry, Hub registry, AB knowledge graph; иначе AUDIT_DATA_REQUIRED
до CLI. Meta/keys маршрутизируют, не задают нормы. Bootstrap читает видимые
INSTANCE по12: модели даны identity и metadata изменений. Для значений variants,
paints/overrides нужен read_nodes. Смена ключа делает запуск устаревшим.

В documentRouting есть subjects, requiredSources, candidateSources и gaps.
Identity основана на published keys, не именах. Selector ограничен AB/web/Figma:
мобильный документ не заменяет web. Related/composes — условные кандидаты,
не обязательные транзитивные правила. Отсутствие/неоднозначность остаётся гэпом.

Начальные фрагменты обязательных документов передаются с бюджетом 120000
UTF-8 байт. Все оставшиеся диапазоны остаются в `nextReads`: прочитай их
через `read_documents` (до 6 `{id,offset}` за шаг) до `plan` и фазы отчёта.
Диапазоны и offset измеряются в UTF-16, фрагмент до 12000 символов;
`next=null` означает конец. Запись пути/метаданных не является прочитанной нормой.
Host не разрешает переход к плану/отчёту с обязательными хвостами; повторное
игнорирование границы останавливает запуск. Пробелы источников сохраняются
отдельно от покрытия проверок. Полное чтение не доказывает полноту семантики.

`search` ищет фрагменты путей (AND), игнорируя регистр и разделители.
`TitleView`, `title-view` и `title/view` находят те же исходные пути.
После пустого результата сократи запрос; не повторяй эквивалентные варианты.
При необходимости читай дополнительные применимые нормы Hub адресно.

Host `overrideCoverage`: каждую nodeId+field закрой через target-role requiredFields,
Hub и typed actual/source evidence. Другая проверка поля/родителя не подходит.
Перед отчётом есть два следующих хода на дополнение; остатки NOT_CHECKED,
нехватка proof — UNKNOWN. Metadata не доказывает нарушение и не даёт read grants.

`plan` перечисляет правило × один целевой узел: id, sourceId, rule,
targets, requiredFields. При расширении плана сохраняй прежние строки/ID.
План предшествует оценке, но не чтению identity. Обнаруженные семейства,
не покрытые правилами, перечисли в excluded с причиной. Прочитай каждое поле
requiredFields; отсутствие/ошибка/MIXED не равны пустому значению.

`requiredFields`: до 128 `{id,field,nodeId,role}`, ID уникальны внутри строки. field — точный factFieldId; сверяй nodeTypes. INSTANCE variants = componentProperties; variantProperties — определения. На plan-type-repair исправь поля за два следующих вызова, сохранив rule/target rows, IDs, nodes, roles и прежние строки. Невалидный план не сохранён. UNAVAILABLE/MIXED не исправляются alias или PASS. target — выбранный узел/потомок, context — допустимый предок/contextParent, source — независимый связанный эталон. Для решающего вывода нужен target-факт.

`factBindings:[{factId,evidenceId}]` связывает каждое требование с native evidence;
evidenceId также входит в check.evidenceIds. Другой узел поле не доказывает.

Host сверяет точное поле на объявленном узле, его type, доступность значения
и происхождение. Source inventory без подробного чтения не доказывает поле.
Missing binding/field, unsupported ID, UNAVAILABLE, UNDEFINED, MIXED или
неподтверждённый тип дают UNKNOWN только зависимой строки. Исходный вывод модели
сохраняется отдельно в agentClaim/claimedStatus, factGaps объясняет причину.
Ноль, false, пустые paints и пустой style ID остаются значениями там, где
допускаются типом. Чужой evidence/target/source и повторяющиеся fact IDs
отклоняются; остальные ранее принятые группы сохраняются.

`read_nodes` читает до 12 IDs из `snapshot.nodes`, явно открытого source
или `snapshot.contextParents`. Ссылка `parentId`, `children` или `overrides`
сама по себе не разрешает чтение. `contextParents` содержит только ближайших
родителей выделенных корней: геометрию, layout, paints/bindings и identity
без source ID. Их children ограничены выбранными корнями; текст, overrides,
соседи и предки не выдаются. Используй контекст для правила выбранного узла,
не добавляй родителя в targets/coverage и не открывай его master.

Legacy read_source: nodeIds:[actual.main.id], resourceId:""; read_document: resourceId=Hub path, nodeIds:[]. ID между полями не переносить. Source открывается по observed main.id; context identity не даёт grant. Удалённый source — UNAVAILABLE. Отказ оставляет UNKNOWN/NOT_CHECKED; повторы ограничены. В новом профиле используются пакетные эталоны, native-source запрещён. Import, temporary instances и произвольный JavaScript запрещены.

`publish_checks` (если есть в схеме) передаёт 1–100 готовых проверок с теми же
нормами/цитатами/native evidence, что итог. Публикуй пачки по готовности без
отдельного CLI на строку. Повтор ID заменяет предварительный вывод; дубли в пачке
запрещены. До final verify всё предварительно. План расширяется: счётчик выводов
не равен проценту завершения. Прогресс — реальные действия без выдуманных ETA/MCP.

`finish`: union принятых групп и новых checks содержит каждую строку плана один раз. Для готовых строк checks:[]; не переписывай их. PASS/FAIL/NOT_APPLICABLE требуют sourceQuote из прочитанного Hub, native target evidence и reason; FAIL — actual/expected/fix. Severity не выдумывать. Проверки refs/typed fields/quotes не доказывают смысл нормы или полноту плана. Missing/MIXED/UNAVAILABLE сохраняют UNKNOWN. На host без publish_checks передай полную матрицу через finish.

### Адресное исправление доказательств (0.4.1)

`publish_checks` и `finish` сохраняют проверенные строки, когда другой sourceQuote
не совпал с дословным текстом реально прочитанного документа. Все hard-проверки
refs/targets/roles/evidence/reason/FAIL fields/bindings проходят до такого ремонта.
Непрочитанный документ, чужой evidence или неправильный binding — не quote mismatch.
Нельзя склеивать пункты, убирать ссылки, менять пробелы или дописывать норму.

`quote-repair` даёт checkId/sourceId/readRanges; модель получает два следующих
вызова на исправление всей pending-группы. Верни только исправленные строки
либо явный UNKNOWN. В report можно перечитать только pending source документы;
native чтение и произвольные документы не открываются. Старый published verdict
того же ID не заменяет pending revision. Остальные строки и счётчики сохраняются.

После лимита неподтверждённая оценка становится UNKNOWN с proofIssues и agentClaim;
непроверенная цитата не показывается как проверенный sourceQuote. Это не повышение
исходного UNKNOWN до PASS. При step budget good rows сохраняются, pending — UNKNOWN,
ещё не оценённые строки — NOT_CHECKED; completion=STEP_BUDGET_EXHAUSTED явно
ограничивает отчёт. Итоговые counts/summary считает host, agentSummary сохранён
отдельно. Любой такой отчёт всё равно ждёт native verify; Stop/stale не отменяются.

Финальная фаза report — отдельный вызов CLI. После неё host требует native
verify использованных actual/source/variable/style фактов. Изменение данных
или ошибка перечитывания останавливают выпуск актуального отчёта. После
публикации изменение макета помечает сохранённый отчёт как устаревший.

JSON отчёт сохраняет полные sources с SHA256 и диапазонами UTF-16, матрицу,
evidence, scope, release/skill pins, ограничения и usage. Coverage — только
объявленный набор правил; непрочитанные семейства не исчезают из excluded.
Usage — фактические поля CLI по фазе вызова, включая общий контекст. null
означает отсутствие данных. Cached/reasoning — подмножества, не прибавляй их.
Нативные операции сами не расходуют токены модели. Не называй разбиение фаз
точным распределением токенов отдельных частей смешанного контекста.

Stop обращается к `/requests/:requestId/cancel` ещё до получения runId.
Отмена до создания запуска сохраняется на диске и запрещает последующий
start с этим ID. Подтверждение ожидает завершения выполняющегося CLI;
неподтверждённая остановка остаётся видимой, новый запуск не начинается.
Повтор Stop идемпотентен. Операции native-чтения не превращаются в правки.

Host держит ограниченное число полных запусков в памяти. При очистке
удаляются только завершённые записи без выполняющегося вызова; история,
receipts и отмены остаются в audit state root. Старый requestId после
eviction/restart не вызывает модель повторно. Исторические данные выдаются
с historical/freshness=HISTORICAL, не как актуальный аудит. Resume не выполняется
автоматически; неизвестное состояние прежнего процесса не считается
подтверждённой остановкой. Повреждённое состояние не трактуется как новый ID.
