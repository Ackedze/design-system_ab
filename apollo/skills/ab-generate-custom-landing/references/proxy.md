# Адаптер Apollo / Proxy

Используй общий SKILL.md и нормы из установленного пакета. Это адаптер хранения
и диалога, а не отдельные правила проектирования. Не применяй старый
ScreenSpec/«generation-only» профиль с отключёнными нормами.

- Host передаёт исходный бриф, подтверждённые ответы, spec, target file/page/root,
  версию навыка и индекс доступных ресурсов.
- Для адресного чтения верни `request_context` с ID из индекса. Host читает
  только pinned файлы из наблюдаемого индекса. Точный list одной компонентной
  папки сразу читает её Figma instructions/adapter/keys/cookbook; metadata поиска
  и журнал всех чтений остаются у Proxy. Не выдавай неуспешный/tooLarge read за источник. Наличие ID не доказывает чтение. Большой
  каталог запрашивай через JSON path и диапазон, не целиком в prompt.
- Источник manual в поставке — `contracts/manifest.json` → выбранная запись
  `contracts[].file` с префиксом `contracts/` → source-envelope `path=["manual", …]`.
  Сверь component identity, платформу и key. `compiledCache`, legacy generated
  artifacts и совпадение названия не заменяют применимые нормы manual.
  Если отдельного manual нет, читай инструкции/adapter/cookbook/каталог хаба
  и явно фиксируй этот fallback. Подробности: `references/figma-workflow.md`.
- В planning используй бриф, обязательные нормы, выбранные component packages
  и индексы ассетов. Технические `workflow/figma-use/*` и
  `workflow/figma-generate-design/*` читай в execution перед нужным MCP-вызовом.
  Для конкретного API используй поставленный индекс символов и адресные
  диапазоны; shell grep и последовательное чтение всего typings не требуются.
- Для рекомендованного группового пресета прочитай его собственные instructions
  и keys до выбора ручной группы. «Ещё не прочитано» не означает «в поставке нет».
- Если существенно недостаёт бизнес-факта, верни `question` с вопросом и spec.
  Подтверждён только следующий ответ пользователя. Ответ возобновляет тот же
  чат; root повторно не создаётся. Не вводи фиксированный вопросник.
- Перед сборкой сохрани spec: роли секций, выбор компонентов, public props/slots,
  ассеты, прочитанные источники и точные `sourceIds` каждой секции. На исполнении
  повторяется её набор и технический workflow; `availableReads` позволяет вернуть
  любое удержанное чтение. Общий журнал не удаляется. Host создаёт один owned root в текущей странице.
  MCP пишет внутри него после проверки namespace/nonce/pageId. Чужие узлы,
  библиотечные определения и глобальные Variables/styles защищены.
- Planning возвращает полный `specJson`. В execution полный план хранит Proxy:
  верни только `sectionPatch:null` или `{sectionId,nodeId}`, checkpoint и наблюдения.
  Возвращать замену spec при записи запрещено.
- До записи оцени бюджет: из 24 model calls резервируются bootstrap, каждая секция,
  verify и два recovery. Для пяти секций подготовке остаётся 14 вызовов. Если
  обязательные источники не подготовлены, сохрани конкретные openSelections;
  host остановит подготовку, сохранив чтения, вместо неподготовленной сборки.
- Уточнение только технического решения активной секции: отдельный tool-free
  `continue`, `checkpoint.status=partial`, `sectionPatch:null` и `resultJson.technicalPatch`
  с `sectionId`, `baseRevision`, `sources:[{id,sha256,path,offset,observation}]`,
  `decision`. Версия — число уже сохранённых technicalDecisions. Host допускает
  запись решения лишь после неизменного независимого readback. Бизнес-факты,
  тексты, CTA, host и другие секции этим способом не меняются: нужно перепланирование.
  API-наблюдения передавай через `resultJson.apiObservations:[строки]`; происхождение
  остаётся agent-report. Это не доказательство независимого наблюдения API.
- После секции возвращай реальные IDs. Неопределённый результат записи сначала
  перечитай. Отмена сохраняет spec, историю, root и частичный результат.
- При правке секции используй spec и nodeId, перечитай блок и зависимости.
  Остальные секции не пересобирай без поручения.
- `finish` содержит result, без повторного spec: ссылку и IDs, проверки PASS/FAIL/UNKNOWN
  с происхождением, источники, гэпы и ограничения. Root receipt не доказывает
  качество страницы. Реальную Figma-приёмку выполняет владелец.
- Для нового профиля native-плагин независимо читает дерево, все вложенные
  instance keys, props, modes, bindings, image hashes и fonts. Пометь существующий
  документированный Body SLOT `role=body` в apollolanding, host instance — `role=host`.
  Tag не заменяет проверку реального типа и key из источника.
- В verify передай `visualReviews:[{scope,modelStep,callId,verdict,evidence}]`: scope —
  ID секции или `page`. Укажи реальные image deliveries из execution.screenshots
  для каждой секции и всего root, рассмотри изображения. URL без картинки не
  подтверждает визуальную проверку. Critical checks — PASS/FAIL/UNKNOWN с evidence;
  некритические UNKNOWN явно пометь critical:false.
- Отсутствие подходящего изображения, critical UNKNOWN/FAIL или missing font
  сохраняет `needs-verification`; Ready=false. Host-native структура, agent-report
  норм, визуальное суждение и приёмка владельца — разные результаты.
- Скриншоты получает MCP, а независимый readback — native host; host хранит trace, версии и usage.
  Недоступный usage — UNKNOWN. Не запускай Python или второй журнал токенов.

Первый срез: Desktop, существующий Figma-файл, Codex CLI. Mobile и другие
providers не объявляй поддержанными до реализации. Успешный synthetic тест
не означает публикацию, установку или ручную приёмку.
