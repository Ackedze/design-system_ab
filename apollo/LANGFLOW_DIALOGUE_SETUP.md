# Apollo Agent: настройка двух режимов в Langflow

Документ описывает ручное обновление Langflow без редактирования экспортированных JSON flow в репозитории.

Целевые режимы:

- `audit-analysis` — автоматический анализ `apollo-agent-report`;
- `design-dialogue` — многоходовый диалог о паттернах, применении компонентов и проектировании.

## 1. Подготовка

1. В Langflow сделайте duplicate flow `Apollo-Agent` и назовите копию `Apollo-Agent-dialogue-dev`.
2. Сделайте duplicate дочерних flow `apollo_reading_patterns` и `apollo_reading_rag` с суффиксом `-dialogue-dev` либо зафиксируйте текущие working versions другим способом.
3. Не меняйте production endpoint, пока все тесты из этого документа не пройдены.

## 2. Обновление файлов в AlfaFile library

Загрузите новые версии файлов, сохранив существующие library names:

- `a_intention_system.md` как `a_intention_system`;
- `a_intention_template.md` как `a_intention_template`;
- `a_intention_scheme.json` как `a_intention_scheme`;
- `a_orchestrator_agent_system.md` как `a_orchestrator_agent_system`;
- `a_pattern_agent_system.md` как `a_pattern_agent_system`;
- `a_rag_agent_system.md` как `a_rag_agent_system`.

Для сопровождения нормативных pattern-документов используйте:

- `apollo/pattern-registry.json` как реестр source metadata;
- все `patterns/p_*.md` с точными исходными именами, включая `p_title-view.md` без суффикса `(1)`;
- общий Confluence ARAG domain пространства DESIGN; `documentType` классифицирует доказательную силу результата, но не фильтрует поиск.

После загрузки prompt-файлов откройте каждый соответствующий `AlfaFile` node, повторно выберите файл и нажмите save/refresh. Это важно: Langflow может сохранить старую ревизию при том же имени файла.

## 3. Main flow `Apollo-Agent`

### Classifier

Откройте node `Спросить LLM` (`StructuredJSONResponseComponent`).

Проверьте связи:

- `a_intention_system` -> `system_prompt`;
- classifier prompt template -> `user_prompt`;
- `a_intention_scheme` -> `schema_text_input`;
- Chat Input -> classifier prompt `raw_request`;
- Message History -> classifier prompt `conversation_context`;
- `a_intention_template` -> classifier prompt `instruction`.

Настройки classifier:

- `Structured output`: enabled;
- `Strict schema`: enabled;
- `Memory`: disabled;
- `Tool choice`: `none`;
- `Temperature`: `0`;
- `Max tokens`: `4096`.

Откройте preview поля `schema_text_input` и убедитесь, что enum `primaryIntent` содержит:

- `analyze_report`;
- `summarize_report`;
- `explain_finding`;
- `find_pattern_context`;
- `explain_component_usage`;
- `design_consultation`;
- `find_examples`;
- `unknown`.

Также схема должна требовать поля `mode`, `contextMode`, `shouldUseConversationHistory` и `needsClarification`. Если preview показывает legacy-intents `check_rules`, `generate_ui_text`, `rewrite_with_sources` или `create_pattern`, файл не обновился.

### Orchestrator

Проверьте связь:

- `a_orchestrator_agent_system` -> main Agent `system_prompt`.

Настройки main Agent:

- `Tool choice`: `auto`;
- `Temperature`: `0`;
- `Max tokens`: `4096`;
- история: до `20` сообщений;
- оба дочерних flow подключены как tools.

Переименуйте tools так, чтобы main Agent видел точные имена:

- flow `apollo_reading_patterns` -> tool `s_reading_patterns`;
- flow `apollo_reading_rag` -> tool `s_reading_rag`.

Сейчас в export оба child node могут отображаться как `s_reading_rag`, хотя один из них запускает patterns flow. Исправьте display name и tool metadata у pattern child node. Иначе orchestrator может вызывать не тот инструмент.

Проверьте child-flow mapping:

- `s_reading_patterns` передаёт запрос в `ChatInput-G4VZQ~input_value`;
- `s_reading_rag` передаёт запрос в `ChatInput-jtVV6~input_value`.

### Conversation memory

Проверьте:

- main Chat Input: `Store messages = true`;
- main Chat Output: `Store messages = true`;
- Message History: `12` последних сообщений, ascending order;
- classifier memory остаётся выключенной: история передаётся ему только через prompt template;
- `session_id` поступает с внешнего API и одинаков для всех turn одного диалога.

Для автоматического анализа и свободного диалога используйте разные session ids:

```text
audit:<user>:<reportId>
dialogue:<user>:<figmaFile>:<conversationId>
```

## 4. Flow `apollo_reading_patterns`

Старый multi-file tool нельзя подключать к Design Knowledge Agent. `AlfaFile`, содержащий все `p_*`, возвращает общий rollup: после tool-call модель получает весь корпус и может завершиться `400 input too long`. Пользовательский Python component для selective file loading не требуется: поиск выполняет общий Confluence ARAG domain пространства DESIGN через стандартный `RAG v.2`.

### Retrieval probe до настройки Agent

До отладки prompts подтвердите, что ARAG действительно видит Confluence-документы. Создайте временный flow `apollo_pattern_rag_probe` только из стандартных блоков:

```text
Chat Input.message -> RAG v.2.query_input
RAG v.2.rag_response_output -> Chat Output.input_value
```

Настройки `RAG v.2` должны совпадать с production pattern node:

- `Тип RAG = ARAG`;
- `System ID = ai_flow`;
- `ID домена = 571`;
- `Источник = Confluence`;
- `Мультидомен = false`;
- `Строгое форматирование = false`.

В probe-flow нет Agent, system prompt, classifier, post-filter и tool mode. Он обязан показывать исходный `{ "chunks": [...] }` от ARAG.

Выполните последовательно четыре запроса:

```text
Кнопки и группы кнопок
как работать с адаптивом
правила редакционной политики
rule:controls.buttons-and-button-groups.primary-left
```

Интерпретация:

- широкий запрос пустой — документы отсутствуют в domain, не проиндексированы или выбран неверный domain/source;
- тематические запросы возвращают разные релевантные страницы — общий поиск DESIGN работает;
- тематические запросы работают, а точный ruleId пустой — `ruleId` отсутствует в searchable chunk metadata/body;
- найденный документ без `documentType: pattern` должен быть принят как контекст, а не отброшен;
- все запросы пустые — prompts и Agent не являются причиной.

Не добавляйте route hints для отдельных компонентов, пока probe не подтвердил наличие документов.

### Целевая схема

```text
Chat Input ─────────────────> Pattern Agent.input_value
a_pattern_agent_system ─────> Pattern Agent.system_prompt
Pattern RAG v.2 ────────────> Pattern Agent.tools
Pattern Agent ───────────────> Chat Output
```

### Область поиска и доказательная сила

Используйте общий Confluence ARAG domain пространства DESIGN (`domain 571`). Он может содержать patterns, гайды, правила, описания процессов и другие документы пространства. Не используйте domain из `apollo_reading_rag`: тот инструмент предназначен для продуктовых примеров.

Не задавайте retrieval-фильтр по `documentType`. Релевантный документ принимается в результат независимо от типа, если RAG вернул его по запросу. `documentType` применяется после поиска: точное значение `pattern` даёт документу нормативную силу, неизвестный или другой тип означает только контекст пространства. Registry используется вне runtime для контроля локальных нормативных pattern-файлов и не отправляется Agent целиком.

Рекомендуемые metadata нормативного pattern-документа или chunk:

```json
{
  "documentType": "pattern",
  "patternId": "ptrn:components.button-group",
  "patternKey": "components.button-group",
  "patternName": "ButtonsGroup",
  "sourceFile": "p_button-group.md",
  "section": "Rules",
  "ruleId": "rule:components.button-group.first-button-primary",
  "severity": "...",
  "platforms": ["desktop"],
  "tags": ["button", "button-group"]
}
```

Для всех документов сохраняйте как минимум title и Confluence URL. Для pattern-документов лучший размер индексации: один rule block вместе с его `documentType`, `ruleId`, severity и текстом правила в одном chunk. Не разрывайте `ruleId` и rule text между chunks. Общие разделы без ruleId индексируйте отдельными chunks с `section` и `sourceFile`.

Если ARAG сам выполняет chunking и не позволяет управлять metadata, сначала загрузите исходные Markdown-файлы и проверьте retrieval по точному `ruleId`. Production можно включать только если ответ возвращает rule text и source filename в одном chunk.

### Pattern RAG v.2

1. Удалите edge `AlfaFile с pattern-файлами -> Pattern Agent.tools`.
2. Добавьте стандартный node `RAG v.2` и назовите его `Pattern RAG`.
3. Установите `Тип RAG = ARAG`.
4. В `System ID` укажите `ai_flow`.
5. В `ID домена по умолчанию` укажите `571`.
6. В `Источник данных в ARAG` выберите `Confluence`.
7. Отключите `Мультидомен`.
8. Отключите `Строгое форматирование ответа`: Pattern Agent нужны source metadata, а strict mode оставляет только chunk number/header/body.
9. В Actions оставьте enabled только `get_rag_response`. `get_rag_json_schema` отключите.
10. Подключите `Pattern RAG.component_as_tool` к `Pattern Agent.tools`.

Не подменяйте domain `571` доменом из flow `apollo_reading_rag`: продуктовые примеры остаются отдельным источником и отдельным tool.

### Pattern Agent

Проверьте связи:

- `a_pattern_agent_system` -> Pattern Agent `system_prompt`;
- Chat Input -> Pattern Agent `input_value`;
- Pattern RAG -> Pattern Agent `tools`;
- Pattern Agent -> Chat Output.

Настройки:

- `Temperature = 0`;
- `Max tokens = 4096`;
- `Tool choice = auto`;
- `n_messages = 0`;
- Chat Input `Store messages = false`;
- Chat Output `Store messages = false`.

Не подключайте общую conversation memory к дочернему flow. Orchestrator уже передаёт нормализованный текущий запрос. Agent должен вызвать `get_rag_response` с исходным вопросом пользователя. Второй вызов допустим только при пустом результате и должен быть более широким переформулированием того же вопроса без вымышленных идентификаторов.

Component rules и `agent-context` в этом MVP должны приходить из request context Apollo, а не загружаться все сразу в Langflow.

### Обновление registry

После добавления, удаления или изменения metadata/ruleId pattern-файлов выполните:

```bash
python3 apollo/scripts/build_pattern_registry.py
python3 apollo/scripts/build_pattern_registry.py --check
python3 apollo/scripts/test_agent_prompt_contracts.py
```

Если добавлен новый файл, generator потребует добавить для него routing aliases в `ROUTING`. После этого обновите соответствующий документ в Confluence DESIGN и проверьте retrieval по естественному вопросу, component alias и хотя бы одному `ruleId`.

Registry не подключается к Agent и не отправляется модели целиком. Он является локальным каталогом нормативных pattern sources и нужен для контроля coverage и metadata; общий runtime-поиск DESIGN от registry не зависит.

## 5. Flow `apollo_reading_rag`

Проверьте связи:

- `a_rag_agent_system` -> RAG Agent `system_prompt`;
- RAG v2 -> RAG Agent `tools`;
- Chat Input -> RAG Agent `input_value`;
- RAG Agent -> Chat Output.

Настройки:

- `Temperature = 0`;
- `Max tokens = 4096`;
- `n_messages = 0`;
- Chat Input `Store messages = false`;
- Chat Output `Store messages = false`.

RAG должен вызываться только для явных вопросов о реальных примерах. Обычный вопрос «как использовать Button» не должен запускать RAG.

## 6. Smoke tests

Все design-dialogue tests запускайте с одним `session_id`, кроме теста изоляции.

### Pattern question

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-smoke-1",
  "message": "Расскажи про паттерн кнопок и групп кнопок",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: classifier возвращает `design-dialogue + find_pattern_context`; вызывается только patterns tool; ответ содержит source pattern и не содержит audit-таблицу.

Если DESIGN search возвращает HTTP error/timeout, финальный ответ должен завершиться коротким сообщением о недоступности пространства. В нём не должно быть сведений о документах, правил, типовых размеров, состояний, ARIA, contrast ratios, spacing, вариантов применения, примеров или проектных рекомендаций из памяти модели.

### Pattern inventory

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-inventory-1",
  "message": "Какие паттерны ты знаешь?",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: Agent выполняет общий поиск по исходному вопросу и возвращает только фактически найденные документы. Полным список можно назвать только если среди chunks есть явный registry/inventory source; иначе ответ маркируется как частичный. Общеизвестные UI-паттерны из памяти модели не добавляются.

### Broad pattern question: adaptive

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-adaptive-1",
  "message": "Как работать с адаптивом?",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: Agent передаёт в `get_rag_response` точную исходную формулировку без добавления `responsive`, названия дизайн-системы или заранее заданного patternId. Результат имеет `match_kind = pattern_context` или `document_context`, содержит title, URL и атомарные claims с source quote. Если найденный excerpt говорит только о том, что паттерн описывает брейкпоинты, но не содержит значений, ответ не должен называть значения.

Регрессионные запреты для этого теста: в ответе не должно быть `≤ 599`, `600–1023`, `≥ 1024`, `grid`, `flex`, `responsive-spacing`, `fallback-компонент`, автоматического переключения, эмуляторов или тестовой стратегии, если соответствующая строка буквально не присутствует в возвращённом `source_quote`.

Проверьте presentation-layer финального ответа:

- ключи `source_quote`, `source_url`, `evidence_kind` и `document_type` не отображаются;
- цитата вынесена в Markdown blockquote `> «...»`;
- source отображается ссылкой `[Источник: <название документа>](<URL>)`;
- символы `【】` и их URL-encoded варианты не попадают в ссылку;
- блок `Итого` не повторяет уже перечисленные требования;
- шаблонный призыв задать дополнительные вопросы отсутствует.

### No-rule fail-closed

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-no-rule-1",
  "message": "Расскажи нормативные правила для неизвестного компонента XyzzyPanel",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: `found = false`, `match_kind = no_source`; финальный ответ сообщает об отсутствии документов и не содержит проектного предложения, общих UI-рекомендаций или accessibility guidance.

### Component usage

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-smoke-1",
  "message": "Когда использовать TitleView и какие ограничения у этого компонента?",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: `explain_component_usage`; вызывается patterns tool; unsupported details не выдумываются.

### Design consultation

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-smoke-1",
  "message": "Предложи два варианта построения desktop-формы с восемью полями и тремя действиями",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: `design_consultation`; нормативные ограничения отделены от проектных предложений; даны 2 варианта и trade-offs.

### Multi-turn follow-up

Следующий запрос отправьте с тем же `session_id` и `conversationId`:

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-smoke-1",
  "message": "Теперь адаптируй второй вариант под mobile",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: classifier возвращает `follow_up`; Agent понимает, что означает «второй вариант»; предыдущий ответ целиком не повторяется.

### Explicit RAG

```json
{
  "schemaVersion": 1,
  "mode": "design-dialogue",
  "conversationId": "dialogue-smoke-1",
  "message": "Покажи реальные примеры похожих форм из продукта",
  "context": {
    "selection": null,
    "finding": null,
    "auditReport": null,
    "componentContext": null
  }
}
```

Ожидание: `find_examples`; вызывается RAG; каждый пример имеет source; практика не называется правилом.

### Session isolation

Сначала отправьте report в session `audit:test:report-1`. Затем отправьте новый pattern question в session `dialogue:test:file-1:chat-1`.

Ожидание: design-dialogue не пересказывает отчёт и не использует его findings, если отчёт не прикреплён в `context.auditReport`.

## 7. Критерии готовности

- classifier schema не содержит legacy-intents;
- report автоматически получает `mode = audit-analysis`;
- обычный вопрос получает `mode = design-dialogue`;
- follow-up использует history только своей session;
- вопросы о дизайне запускают DESIGN search, но не RAG продуктовых примеров;
- DESIGN search принимает релевантные документы любого типа из Confluence domain `571`;
- только chunk с точным `documentType: pattern` используется как нормативное требование;
- каждый принятый chunk сохраняет title и URL источника;
- каждый факт финального design-dialogue ответа имеет source quote и source URL;
- число или технический термин отсутствуют в ответе, если они отсутствуют в соответствующем source quote;
- Pattern Agent не имеет multi-file AlfaFile tool и не получает весь corpus в одном ответе;
- `get_rag_json_schema` отключён, а `get_rag_response` вызывается не более двух раз;
- каждый нормативный вывод содержит `sourceFile` и source quote;
- RAG examples не становятся rules;
- design answer отделяет нормативные требования от проектного предложения;
- child flows не сохраняют сообщения в общей memory;
- production endpoint не переключён до прохождения smoke tests.

## 8. Ошибка LLM provider 523

Если traceback заканчивается на `openai.InternalServerError: Error code: 523` внутри `chat.completions.create`, ошибка возникает до выполнения AlfaFile/RAG tool. Это недоступность или сбой OpenAI-compatible model endpoint, а не ошибка prompt JSON или чтения файлов.

Диагностика:

1. В проблемном Agent повторно выберите model и сохраните node.
2. Временно отключите tool чтения pattern-файлов, но оставьте system prompt.
3. В новой session отправьте `Ответь одним словом: OK`.
4. Если 523 повторяется, переключитесь на доступную модель с native tool calling либо повторите запрос после восстановления provider.
5. Если простой ответ работает, подключите tool обратно и повторите прямой child-flow test.
6. Если 523 появляется только с tool, проверьте tool status, переподключите tool edge и протестируйте модель, для которой в платформе подтверждён native tool calling.

Не изменяйте classifier schema и prompts для исправления 523: запрос не доходит до стадии их смысловой обработки.

## 9. Ошибка `400 input too long`

Если первый model turn успешно вызывает pattern file-tool, а следующий завершается `400 Bad Request` или сообщением о максимальной длине входных данных, проверьте архитектуру child flow.

Причина старой схемы: один `AlfaFile` с несколькими выбранными файлами выполняет `process_files()` для всего списка и возвращает общий `rollup_data`. Количество файлов в UI не является фильтром по текущему вопросу.

Проверка:

1. Временно оставьте в старом AlfaFile только один релевантный pattern.
2. Запустите тот же child-flow request в новой session.
3. Если ответ проходит, ошибка подтверждает переполнение после multi-file rollup.
4. Перейдите на общий DESIGN RAG domain; не пытайтесь исправлять входной лимит через `Max tokens`, потому что это ограничение output.

После миграции проверьте trace `get_rag_response`: tool должен возвращать только несколько релевантных chunks, а не весь корпус. Для каждого exact-rule теста в одном chunk должны одновременно присутствовать `documentType: pattern`, `ruleId`, rule text и source identity. Другие документы допустимы как context evidence, но не как нормативное правило.
