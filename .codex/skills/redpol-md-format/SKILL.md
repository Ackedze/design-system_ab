---
name: redpol-md-format
description: "Готовит и нормализует markdown-паттерны в `design-system_ab`: конвертирует PDF/заметки в 10-секционный pattern, проверяет формат Redpol, распределяет проверяемые правила между `patterns/` и агентскими документами компонента (`rules.json`, `agent-context.json`). Используй при создании или доработке pattern-документов дизайн-системы Альфа-Бизнеса."
---

# Redpol Pattern Authoring

## Repository Source Gate

Канонический навык живёт в `design-system_ab/.codex/skills/redpol-md-format/SKILL.md`. Используй и дорабатывай эту версию. Не считай копии в корневом `DS-AB-Plugin/.codex/skills`, `~/.codex/skills` или plugin cache источником правды.

Рабочий корень — локальный checkout `design-system_ab`, в котором есть:

- `patterns/` — человекочитаемые pattern-файлы;
- `JSONS/` — component packages, contracts, `rules.json`, `agent-context.json`;
- `apollo/` — инструкции и runtime-контекст Apollo;
- `.codex/skills/redpol-md-format/` — этот навык, аудит и форматная спецификация.

Если работа запущена из родительского checkout `DS-AB-Plugin`, путь к корню обычно `shared/design-system_ab`. Перед правками проверь, из какого корня запускаешь команды, и используй соответствующие пути.

## Когда Использовать

Используй навык, когда нужно:

- сконвертировать PDF, изображение, заметки или описание компонента в pattern markdown;
- привести существующий `patterns/p_*.md` к текущему 10-секционному формату;
- добавить или уточнить атомарные `Rule N` в pattern-файле;
- решить, какие правила оставить в pattern, а какие перенести в `JSONS/.../rules.json`;
- добавить ручную сводку в `agent-context.json`, чтобы Apollo-агент понимал назначение компонента;
- проверить `snapshot`, `context` или `pattern` markdown на Redpol-формат.

## Основной Workflow

1. Определи корень `design-system_ab`.
2. Найди существующий pattern и component package:

```bash
rg --files patterns | rg -i "<topic|component>"
rg --files JSONS | rg -i "<component>"
```

3. Если источник — PDF, извлеки текст постранично. Для больших PDF сначала выводи заголовки и ключевые строки, затем полные релевантные страницы.
4. Перед правками проверь целевой markdown:

```bash
python3 .codex/skills/redpol-md-format/scripts/audit_redpol_markdown.py patterns/p_example.md
```

5. Открой `references/format-spec.md` и соблюдай формат metadata, секций и правил.
6. Создай или обнови `patterns/p_*.md`.
7. Если есть компонентный package, прочитай:

```text
JSONS/.../<Component>/rules.json
JSONS/.../<Component>/agent-context.json
JSONS/.../<Component>/composition-contract.json
JSONS/.../<Component>/contract.generated.json
JSONS/.../<Component>/contract.overrides.json
```

8. Перенеси в `rules.json` только проверяемые component-level правила.
9. Добавь в `agent-context.json` только компактный ручной контекст: назначение, usage guidance, content guidance, ссылки на pattern и highlights. Не дублируй весь pattern.
10. Проверь изменённые файлы:

```bash
python3 .codex/skills/redpol-md-format/scripts/audit_redpol_markdown.py patterns/p_example.md
python3 -m json.tool JSONS/.../<Component>/rules.json >/tmp/rules.checked.json
python3 -m json.tool JSONS/.../<Component>/agent-context.json >/tmp/agent-context.checked.json
```

## Pattern Markdown

Pattern всегда состоит из 10 секций:

1. `Определение`
2. `Когда использовать`
3. `Когда не использовать`
4. `Принципы`
5. `Структура текста`
6. `Правила`
7. `Шаблоны`
8. `Примеры`
9. `Антипримеры`
10. `Машинная обработка`

Для компонентного pattern:

- `patternType: component`;
- поле `component` обязательно сразу после `patternType`;
- `patternId` обычно `ptrn:components.<component-slug>`;
- `patternKey` обычно `components.<component-slug>`.

Для верхнеуровневых паттернов используй подходящий `patternType`: `layout`, `controls`, `forms`, `table`, `ux`, `visual`, `flow`.

Каждое правило оформляй атомарно:

```md
### Rule N: Название

- ruleId: rule:<category>.<pattern-name>.<rule-name>
- severity: error | warning | recommendation
- appliesTo: component | text | screen | flow
- checkType: deterministic | dictionary | llm | manual
- autofix: yes | no | partial
```

После метаданных правила добавляй описание, `Правильно`, `Неправильно` и `Почему`.

## Распределение Правил

Оставляй в `patterns/p_*.md`:

- сценарии использования;
- UX-аксиомы и объяснения;
- редакционные правила и примеры текста;
- межкомпонентные композиции;
- правила, требующие LLM-оценки контекста;
- рекомендации, которые не должны становиться автоматическим violation без контекста.

Добавляй в `JSONS/.../<Component>/rules.json`:

- запреты и обязательные состояния конкретного компонента;
- правила public variant/property;
- проверяемые visibility/layout/content constraints;
- точные соответствия pattern-rule, которые Apollo должен видеть как `componentRules`;
- разрешающие info-правила, если нужно объяснить допустимую кастомизацию.

Для `rules.json` schema v2:

- не редактируй `generated.rules`, если правило не generated;
- ручные правила добавляй в `manual.rules`;
- сохраняй `metadata.ownershipSchema`;
- обновляй `metadata.applicability.updatedAt`.

Для старой schema v1:

- добавляй правила в корневой массив `rules`;
- обновляй `applicability.updatedAt`.

Добавляй в `agent-context.json`:

- `patternReferences`;
- краткий `purpose`;
- `usageGuidance`;
- `contentGuidance`;
- `ruleHighlights`;
- уточнения для агента, которые помогают интерпретировать findings.

Не добавляй в `agent-context.json` длинные копии pattern-разделов.

## Проверки

Markdown:

```bash
python3 .codex/skills/redpol-md-format/scripts/audit_redpol_markdown.py patterns/p_name.md
```

JSON:

```bash
python3 -m json.tool JSONS/path/to/rules.json >/tmp/rules.checked.json
```

Быстрая сверка ruleId:

```bash
rg -n "rule:<pattern>|component:<component>" patterns/p_name.md JSONS/path/to/rules.json
```

## References

- Формат Redpol markdown: `references/format-spec.md`
- Аудит markdown: `scripts/audit_redpol_markdown.py`
