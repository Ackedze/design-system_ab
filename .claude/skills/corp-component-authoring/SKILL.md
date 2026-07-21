---
name: corp-component-authoring
description: Аудитирует и наполняет machine-readable комплект corp-компонента для Apollo, Athena и agentic pipeline. Используй для rules.json, composition-contract.json, contract.overrides.json, examples.json, agent-context.json, audit-mapping.json, package README и связанных паттернов.
---

# Corp component authoring

Аргумент задачи: `$ARGUMENTS`.

## 1. Найди комплект

Определи:

- raw-каталог в `JSONS/web/components/...`;
- package компонента;
- `.index.json`;
- связанные паттерны;
- lifecycle и платформы всех main/supporting компонентов семейства.

Если имя неоднозначно, покажи кандидатов и запроси выбор. Не создавай новый package, пока не исключено существование пакета под alias или старым именем.

## 2. Прочитай правила процесса

Обязательно прочитай:

- `AGENTIC_FILES.md`;
- `COMPONENT_AUTHORING.md`;
- [questionnaire.md](references/questionnaire.md);
- [definition-of-ready.md](references/definition-of-ready.md).

В качестве эталона сложного готового комплекта используй `JSONS/web/components/web-corp/BackgroundPlate/`. Эталон показывает структуру документов, но его продуктовые правила нельзя переносить в другой компонент.

## 3. Проведи аудит до редактирования

Составь краткую таблицу:

- файл;
- ownership: generated, manual или hybrid;
- текущий статус;
- заполненные разделы;
- шаблонные/default значения;
- противоречия;
- открытые вопросы.

Сопоставь manual-секции с raw-фактами, но не исправляй продуктовый смысл догадкой.

## 4. Собери знания у владельца

Задавай вопросы группами до пяти. Начинай с назначения, lifecycle, public anatomy и главных сценариев, затем переходи к variants, composition, content, responsive, состояниям и допустимым кастомизациям.

Для каждого ответа разделяй:

- exact rule;
- recommendation;
- informational context;
- unresolved decision.

Если ответ противоречит raw-каталогу, покажи конкретное противоречие и уточни, что должно измениться: Figma-компонент, каталог или правило.

## 5. Обнови manual-слой

Редактируй только подтверждённые данные:

- `rules.json`: проверяемые запреты, требования, warnings и info;
- `composition-contract.json`: ownership, wraps, slots, allowed/forbidden composition и effective baseline;
- `contract.overrides.json`: semantic aliases, public API, штатные overrides и reset model;
- `examples.json`: positive, negative и ambiguous regression cases;
- `agent-context.json`: `manual.summary`, critical baselines и anti-hallucination instructions;
- `audit-mapping.json`: только manual-классификацию и исключения;
- `README.md`: человекочитаемую сводку;
- pattern: только правила, применимые шире одного технического baseline.

Не редактируй `generated`. Не дублируй одно правило во всех документах: нормативная формулировка живёт в `rules.json` или pattern, остальные документы ссылаются на неё и добавляют свой контекст.

## 6. Проверь качество

Запусти:

```bash
node .claude/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "<package-path>"
```

Если raw был перегенерирован, выполни targeted Athena checks из `COMPONENT_AUTHORING.md`. Не запускай full-tree sync для одного компонента.

Проверь `git diff` и удали несвязанный generated churn. Не откатывай чужие изменения.

## 7. Заверши итерацию

Сообщи:

- какие решения подтверждены;
- какие файлы изменены;
- какие проверки выполнены;
- какие вопросы остались;
- можно ли считать каждый документ `Draft`, `Legacy` или `Ready`;
- можно ли считать весь компонент `Ready` или он остаётся `In progress`.

Статус `Ready` устанавливает владелец компонента после ручного ревью и проверки Apollo на реальном макете.
