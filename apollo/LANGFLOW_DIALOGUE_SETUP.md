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

Для подготовки отдельного pattern-domain используйте:

- `apollo/pattern-registry.json` как реестр source metadata;
- все `patterns/p_*.md` с точными исходными именами, включая `p_title-view.md` без суффикса `(1)`;
- отдельный ARAG domain, содержащий только нормативные pattern-документы.

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

Старый multi-file tool нельзя подключать к Pattern Agent. `AlfaFile`, содержащий все `p_*`, возвращает общий rollup: после tool-call модель получает весь корпус и может завершиться `400 input too long`. Пользовательский Python component для selective file loading не требуется: маршрутизацию выполняет отдельный нормативный ARAG domain через стандартный `RAG v.2`.

### Целевая схема

```text
Chat Input ─────────────────> Pattern Agent.input_value
a_pattern_agent_system ─────> Pattern Agent.system_prompt
Pattern RAG v.2 ────────────> Pattern Agent.tools
Pattern Agent ───────────────> Chat Output
```

### Разделение RAG-доменов

Создайте отдельный ARAG domain для нормативных документов, например `apollo-patterns`. Не используйте domain из `apollo_reading_rag`: там находятся продуктовые примеры, которые не имеют доказательной силы правила.

В pattern-domain должны попадать только `patterns/p_*.md`. Registry не является нормативным документом и не должен возвращаться как evidence. Он используется вне runtime для подготовки metadata и проверки полноты загрузки.

Минимальные metadata каждого индексируемого документа или chunk:

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

Лучший размер индексации: один rule block вместе с его `ruleId`, severity и текстом правила в одном chunk. Не разрывайте `ruleId` и rule text между chunks. Общие разделы без ruleId индексируйте отдельными chunks с `section` и `sourceFile`.

Если ARAG сам выполняет chunking и не позволяет управлять metadata, сначала загрузите исходные Markdown-файлы и проверьте retrieval по точному `ruleId`. Production можно включать только если ответ возвращает rule text и source filename в одном chunk.

### Pattern RAG v.2

1. Удалите edge `AlfaFile с pattern-файлами -> Pattern Agent.tools`.
2. Добавьте стандартный node `RAG v.2` и назовите его `Pattern RAG`.
3. Установите `Тип RAG = ARAG`.
4. В `System ID` укажите system id, в котором зарегистрирован отдельный pattern-domain.
5. В `ID домена по умолчанию` укажите ID только pattern-domain.
6. В `Источник данных в ARAG` выберите источник, куда загружены `p_*.md`, либо оставьте пустым, если domain физически содержит только patterns.
7. Отключите `Мультидомен`.
8. Отключите `Строгое форматирование ответа`: Pattern Agent нужны source metadata, а strict mode оставляет только chunk number/header/body.
9. В Actions оставьте enabled только `get_rag_response`. `get_rag_json_schema` отключите.
10. Подключите `Pattern RAG.component_as_tool` к `Pattern Agent.tools`.

Числовой domain id нельзя переносить из примера или из flow `apollo_reading_rag`. Используйте ID, выданный именно для загруженной нормативной базы.

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

Не подключайте общую conversation memory к дочернему flow. Orchestrator уже передаёт нормализованный текущий запрос. Pattern Agent должен вызвать `get_rag_response` один раз; второй вызов допустим только для точного lookup отсутствующего `ruleId`.

Component rules и `agent-context` в этом MVP должны приходить из request context Apollo, а не загружаться все сразу в Langflow.

### Обновление registry

После добавления, удаления или изменения metadata/ruleId pattern-файлов выполните:

```bash
python3 apollo/scripts/build_pattern_registry.py
python3 apollo/scripts/build_pattern_registry.py --check
```

Если добавлен новый файл, generator потребует добавить для него routing aliases в `ROUTING`. После этого обновите соответствующий документ в pattern-domain и проверьте retrieval по новому `patternId`, component alias и хотя бы одному `ruleId`.

Registry не подключается к Agent и не отправляется модели целиком. Он нужен для ingest mapping, контроля coverage и автоматических проверок соответствия source files индексу.

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

Если pattern tool возвращает HTTP error/timeout, финальный ответ должен завершиться коротким сообщением о недоступности нормативного источника. В нём не должно быть типовых размеров, состояний, ARIA, contrast ratios, spacing, вариантов применения, примеров или проектных рекомендаций.

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

Ожидание: Pattern Agent вызывает `get_rag_response` с `Адаптив в Альфа-Бизнес`, `ptrn:layout.adaptive-alfa-business` и исходной формулировкой. Результат имеет `match_kind = pattern_context` или `exact_rule`, содержит source `p_adaptive-alfa-business.md` и использует только зафиксированные в source значения, включая `MobileWeb 320–767 px` и `Desktop от 768 px`. Generic breakpoints, fluid-grid, `clamp()`, WCAG и responsive tokens не добавляются.

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

Ожидание: `found = false`, `match_kind = no_rule`; финальный ответ сообщает об отсутствии контекста и не содержит проектного предложения, общих UI-рекомендаций или accessibility guidance.

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
- pattern questions запускают только отдельный Pattern RAG, но не RAG продуктовых примеров;
- Pattern RAG domain содержит только документы с `documentType = pattern`;
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
4. Перейдите на отдельный Pattern RAG domain; не пытайтесь исправлять входной лимит через `Max tokens`, потому что это ограничение output.

После миграции проверьте trace `get_rag_response`: tool должен возвращать только несколько релевантных chunks, а не все pattern-файлы. Для каждого exact-rule теста в одном chunk должны одновременно присутствовать `ruleId`, rule text и `sourceFile`; chunk из продуктового RAG считается ошибкой изоляции доменов.
