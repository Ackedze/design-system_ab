# Адаптер Apollo / Proxy: staged-content-v1

Применяй порядок SKILL.md и нормы установленного пакета. Proxy хранит историю,
полный план и active unit, native-плагин подтверждает состояние Figma, MCP
выполняет сборку. Адаптер не задаёт дизайн-системные компоненты или композицию.

## Бриф и короткий план

Сначала уточни существенные неоднозначности брифа. Используй исходный запрос,
подтверждённые ответы и обязательные общие нормы. Planning возвращает полный
specJson: facts с устойчивыми IDs, решения/вопросы, порядок и роли sections,
contentShape каждого блока (число пунктов, полей, действие CTA, формат графики).
До build не читай component packages будущих блоков и не выбирай точные ассеты
или финальные тексты всей страницы. Контекст текущего файла/страницы авторитетен.

build создаёт одну native section/root в выбранном месте. Далее Proxy выдаёт
по одной единице работы; её stage и activeSectionId менять нельзя. Existing
owned root при продолжении перечитывается и переиспользуется. После build
возвращай WRITE_STEP: specJson отсутствует, полный план заменять запрещено.

## Подготовка основы и каркасов

Порядок host: prepare-foundation → foundation → prepare-structure/structure
каждого блока → prepare-content/content каждого блока → verify.

В prepare-foundation прочитай выбранный паттерн и источники основы. Он задаёт
контейнер, mount, сетку, поверхность и общие отступы. Например, применимый
AB draft-layout может требовать CorporateContent и его Body; это вывод из нормы,
а не универсальная настройка Proxy. Сохрани foundation decision с declared
container/mount roles, native type/key и layout из прочитанных источников.

В prepare-structure читай только пакет текущего компонента/группового пресета:
instructions, Figma adapter, keys, применимые cookbook, manual и зависимости.
Проверь специализированные варианты до ручной композиции. Выбери root,
публичные props/slots и layout; финальные тексты/точные изображения пока отложены.
Unread package не считается отсутствующим. Structure создаёт/изменяет только
активный каркас и сохраняет временные поля источника. Технические Figma workflow
и нужные API signatures прочитай перед соответствующим API-вызовом.

В preparation unit доступны только чтения Proxy, MCP не запускается. Для
завершения верни continue, sectionPatch:null и resultJson с:

- checkpoint: sectionId равен execution.activeSectionId (null для основы),
  status=complete, nextAction — конкретное следующее действие;
- preparationPatch: stage, sectionId, baseRevision, sources, decision.
  baseRevision — 0 или текущая revision этого плана; sources содержит реально
  прочитанные id/sha256/path/offset/observation.

Формы decision:

- Основа: container и mount, каждый {role,type,componentKey}, и layout object.
  Type FRAME/INSTANCE/SLOT; INSTANCE использует фактически выбранный published
  key из источника, у остальных componentKey=null. Названия role задаются здесь,
  затем реальные узлы получают эти роли в namespace apollolanding.
- Каркас: root {type,componentKey}, props object, slots array публичных имён,
  layout object. Props содержат структурные настройки, финальный TEXT идёт позже.
- Контент: texts [{target,value,factIds}], assets [{target,kind,key,resourceId,path}].
  kind=component/image; asset selection range присутствует в реально прочитанных
  sources. FactIds ссылаются на принятые spec.facts; не придумывай условия.

Proxy допускает дельту после неизменного независимого readback. Она пополняет
только foundation.plan, активный structurePlan или contentPlan. Business facts,
порядок, contentShape, чужие блоки и полный spec этой дельтой не меняются.
При смене технического выбора перечитай источники и увеличь revision текущего
плана до записи. Сначала source-bound решение, затем отдельный проход сборки.

После bounded сборки возвращай continue и checkpoint partial/complete. Только
structure может вернуть sectionPatch {sectionId,nodeId}; остальные стадии — null.
Proxy подтверждает nodeId, type/key, заявленные props, containment и сохранность
соседей по native readback. Partial оставляет текущую единицу активной. Проверка
каркаса не подтверждает финальные переносы/изображения или полное покрытие DS.

## Наполнение и завершение

Все каркасы завершаются до первого prepare-content. Далее для одного блока
подготовь финальные тексты из подтверждённых фактов и точные библиотечные ассеты,
сохрани contentPlan и заполни существующий блок. Проверь текст, изображения,
crop, размеры, шрифты и reflow. Затем переходи к следующему content unit.
Не заполняй всю страницу одним длинным MCP-проходом.

Verify читает итоговый макет после наполнения. Получи реальные image deliveries
каждой секции и root, просмотри их и верни visualReviews с scope, modelStep,
callId, verdict и evidence, совпадающие с execution.screenshots. Скриншот каркаса
до наполнения не подтверждает итоговый вид. Успешный tool call/URL без image
не считается визуальным доказательством. Critical checks требуют фактического
PASS/FAIL/UNKNOWN и evidence; неполные некритические явно пометь critical:false.
Finish допускается только в verify, содержит summary/checks/issues/limits и
visualReviews без полного spec. Missing image/font или critical UNKNOWN/FAIL
сохраняет needs-verification; Ready=false, owner acceptance pending.

## Источники, ограничения и продолжение

- Proxy выдаёт pinned индекс и адресные чтения. list_resources query — поиск,
  resources[].id — точный файл; folder prefix не читается и не даёт source proof.
  Exact list одной компонентной папки читает её Figma package за один host step.
  Follow next cursor; tooLarge/error — не прочитанный источник. JSON сначала
  исследуй через keys и наблюдаемые paths, не угадывай asset keys.
- Manual route: contracts/manifest.json → contracts[].file с contracts/ prefix
  → source-envelope manual. Сверь identity/platform/key; читай применимые нормы
  по JSON paths/ranges, а не только identity. CompiledCache/generated artifacts
  не заменяют manual. При отсутствии отдельного manual используй инструкции,
  adapter/cookbook/каталог хаба с явной отметкой fallback. Подробности —
  references/figma-workflow.md. Shell/checkout/ZIP от пользователя не нужны.
- Proxy держит полный pinned read ledger; prompt содержит sourceIds активной
  секции/основы и необходимые workflow. AvailableReads позволяет открыть скрытое
  чтение вновь; повтор неизменного видимого чтения не считается прогрессом.
- Fixed budget нового workflow: 48 model calls / 96 MCP; outline <=6 calls.
  Legacy profile остаётся 24/96. Смена стадий, checkpoint и автоматический retry
  не обнуляют счётчики. Stop/source freshness/ownership/scope/readback и per-turn
  ограничения сохраняются. Не обходи отсутствие нормы или недоступный источник.
- Пиши маленькими API-скриптами, до двух MCP calls за проход. Неизвестный outcome
  сначала требует независимого чтения сохранённых узлов. После ошибки/Stop
  сохраняются история, partial root, принятные планы и точный stage.
- Техническую append-only API находку активного structure/content unit можно
  сохранить через прежний tool-free technicalPatch и unchanged readback;
  это не замена props/контента/брифа. ApiObservations остаются agent-report.
- Follow-up ограничивается порученными editSectionIds; чужие узлы, библиотечные
  определения и глобальные styles/variables защищены. Для явного продолжения
  неизменный план и source/root pins позволяют возобновить сохранённую единицу.
- Native readback доказывает записанные структуру/значения; agent norm report,
  image review и ручная приёмка владельца — отдельные уровни. Unknown не PASS.
  Usage сохраняется host из CLI receipts, недоступное UNKNOWN. Python-журнал
  в Proxy не запускается. Отчёт сохраняется и при прерывании.

Новая capability generationWorkflow=staged-content-v1 требует совместимого
runtime/Proxy до активации пакета. Старые клиенты не получают его через прежний
runtime channel. Первый срез Desktop/Codex/существующий Figma-файл. Реальную
установку и ручной тест Figma выполняет владелец; synthetic тест не заменяет их.
