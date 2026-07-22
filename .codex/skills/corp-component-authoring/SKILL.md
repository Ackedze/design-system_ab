---
name: corp-component-authoring
description: Аудитирует, уточняет у владельца и наполняет machine-readable комплект web-corp компонента для Apollo, Athena CLI, Figma generation и agentic pipeline. Используй при подготовке или проверке rules.json, composition-contract.json, contract.overrides.json, examples.json, agent-context.json, audit-mapping.json, package README, связанного pattern и статусов готовности компонента.
---

# Corp Component Authoring

Подготавливай один компонентный комплект за раз. Считай целью не максимальное число правил, а согласованный набор доказуемых правил, который Apollo корректно обнаруживает, а агент трактует без домыслов.

## 1. Найди комплект и источники

Определи:

- raw-каталог `JSONS/web/components/web-corp/Web _ Corp Components -- <Name>.json`;
- package `JSONS/web/components/web-corp/<Name>/`;
- `.index.json` в `JSONS/indexes/web/components/web-corp/`;
- связанные patterns в `patterns/`;
- public, supporting, service, preset и legacy-компоненты семейства;
- поддерживаемые channel/platform и lifecycle.

При неоднозначном имени или нескольких raw-каталогах сначала разреши идентичность по `componentKey`, Figma key, aliases и фактической структуре. Не объединяй разные компоненты по сходству названий.

Прочитай перед работой:

- `AGENTIC_FILES.md` для роли файлов в pipeline;
- `COMPONENT_AUTHORING.md` для командного процесса;
- [references/document-map.md](references/document-map.md) для ownership и назначения документов;
- [references/questionnaire.md](references/questionnaire.md) перед интервью;
- [references/definition-of-ready.md](references/definition-of-ready.md) перед сменой статусов.

## 2. Проведи исходный аудит

Для каждого документа зафиксируй:

- существует ли он и кто его обновляет: Athena, автор вручную или hybrid;
- статус `Draft`, `Legacy` или `Ready`;
- какие поля заполнены фактическими данными, а какие шаблонны;
- противоречия между raw, generated, manual, pattern и соседними компонентами;
- что можно вывести из Figma, а что должен подтвердить владелец;
- какие возможности Apollo уже проверяет детерминированно, а какие пока доступны только агенту или будущему runtime.

Не переписывай generated-секции вручную. Не используй `contract.generated.json` или raw как доказательство продуктовой семантики: они подтверждают только наблюдаемую структуру, variants, defaults и связи.

## 3. Интервьюируй владельца

Задавай до пяти связанных вопросов за сообщение. Группируй их по темам: назначение и lifecycle, anatomy, properties, composition, content, responsive, visual tokens, states, interaction, audit и regression.

После каждого ответа:

1. Кратко проверь понимание и выяви противоречия с raw.
2. Немедленно внеси подтверждённые сведения в manual-документы.
3. Проверь JSON и package validator.
4. Продолжи следующей группой вопросов.

Не задавай повторно то, что уже однозначно подтверждено. Не заполняй пробелы «разумными best practices» без пометки. Разделяй:

- exact rule: обязательное или запрещённое поведение;
- recommendation: предпочтение без запрета;
- info: объяснение штатной кастомизации или ограничения текущего pipeline;
- unresolved: вопрос, для которого пока нет правила.

Используй полный вопросник из [references/questionnaire.md](references/questionnaire.md), но пропускай неприменимые разделы.

## 4. Наполняй документы

Редактируй только подтверждённую manual-семантику:

- `rules.json`: точные правила, рекомендации и info с корректной severity, scope, conditions, evidence и remediation;
- `composition-contract.json`: public roots, `wraps`, ownership, slots, allowed composition, effective baseline, suppression/rebase;
- `contract.overrides.json`: aliases, public API, variant semantics, reset model и исключения, которые нельзя вывести из raw;
- `examples.json`: positive, negative и context-dependent regression cases с `expectedAudit`, `expectedAgent` и `mustNotSay`;
- `agent-context.json`: назначение, critical baselines, evidence policy и anti-hallucination instructions;
- `audit-mapping.json`: ручные исключения классификации, display/reset semantics и только реально поддержанные Apollo проверки;
- `README.md`: назначение семейства, lifecycle, источники, состав и текущая готовность;
- pattern: только правило сценария шире одного компонента.

Не дублируй один canonical rule разными формулировками. Ссылайся на `ruleId`. Пример иллюстрирует правило, но не создаёт его.

При описании layer diff всегда разрешай effective baseline текущего host/nested variant до сравнения. Не подменяй component-property customization изменениями paint/layout/style и не теряй ручные layer customizations после смены variant.

Если правило невозможно проверить текущим Apollo, сохраняй его как agentic/context rule и явно фиксируй runtime limitation. Не выдавай будущую проверку за работающую.

## 5. Защищай агента от галлюцинаций

Для каждого важного правила зафиксируй evidence и тип совпадения. Агент может повышать criticality только по точному применимому правилу, а не по примеру, общему смыслу pattern или best practice.

Если точного правила нет:

- сообщай о найденной кастомизации;
- при необходимости проси ручную проверку;
- не объявляй изменение запрещённым;
- не придумывай rationale, лимиты, тексты, CTA-иерархию или remediation.

Условные разрешения описывай явно. Например, tokenized fill может быть разрешён только при конкретном variant, тогда как raw fill остаётся нарушением.

## 6. Валидируй после каждой итерации

Запускай из корня `design-system_ab`:

```bash
node .codex/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/web-corp/<ComponentName>"
```

После регенерации raw запускай targeted Athena sync/check из проекта Athena, передавая только выбранный catalog. Athena должна обновить generated contract, index, reference и registries; не редактируй registries вручную.

Проверь:

- валидность JSON и отсутствие template markers;
- сохранность manual-секций после Athena regeneration;
- появление актуальных rule IDs в `apollo-rules-registry.json`;
- появление composition ownership в `apollo-composition-registry.json`;
- отсутствие unrelated churn в `git diff`;
- один корректный и один нарушающий кейс в реальном Apollo;
- наличие применимых rules/context в `*_agent.json`;
- отсутствие неподтверждённых выводов в ответе агента.

## 7. Заверши пакет

Используй [references/definition-of-ready.md](references/definition-of-ready.md). Не ставь `Ready` автоматически только потому, что JSON валиден.

Ставь документу `Ready`, когда его смысл подтверждён владельцем и проверки выполнены. Общий статус компонента `Ready` допустим только когда обязательные документы готовы и пройден runtime-тест. Иначе оставляй `In progress`.

По явному запросу владельца обнови строку компонента на вкладке `Corp components` в общей Google Sheet: найди строку по имени, сохрани dropdown, формулы и форматирование, измени только статусы и связанные служебные поля. Следуй [references/readiness-sheet.md](references/readiness-sheet.md).

В результате сообщи:

- какие решения подтверждены;
- какие файлы изменены;
- какие проверки выполнены;
- какие ограничения pipeline обнаружены;
- какие вопросы остались;
- какой статус имеет каждый документ и компонент в целом.
