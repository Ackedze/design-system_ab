# Карта component package

## Источники и ownership

| Документ | Владелец | Для чего нужен |
| --- | --- | --- |
| Raw-каталог рядом с package | Athena | Полный наблюдаемый снимок Figma; текущий audit baseline Apollo. |
| `contract.generated.json` | Athena | Компактное представление variants, structure, defaults и token/style references. |
| `.index.json` и `componentContractIndex.json` | Athena | Маршрутизация Apollo к raw и артефактам нужного компонента. |
| `rules.json` | Hybrid | Generated defaults плюс подтверждённые component rules для Apollo и агента. |
| `composition-contract.json` | Hybrid | Ownership nested-компонентов, `wraps`, slots и effective baseline. |
| `agent-context.json` | Hybrid | Смысл компонента, critical baselines и ограничения интерпретации для агента. |
| `audit-mapping.json` | Hybrid | Классификация diff, display/reset semantics и ручные исключения. |
| `contract.overrides.json` | Manual | Public API, aliases, variant semantics и reset model, невыводимые из raw. |
| `examples.json` | Manual | Regression cases для Apollo и агента; не является источником правил. |
| `README.md` | Manual | Человекочитаемое назначение package, lifecycle, источники и статус. |
| Pattern | Manual | Cross-component правила сценария; не дублирует локальные component rules. |
| Registries/reference | Athena | Публикуемый runtime discovery layer; вручную не редактируется. |

## Где хранить смысл

Храни в `generated` только воспроизводимые данные из raw. Храни в `manual` только подтверждённые владельцем утверждения: назначение, обязательность, запреты, recommendations, lifecycle, composition semantics и agent instructions.

При конфликте:

1. Решение владельца компонента определяет semantic rule.
2. Exact pattern/component rule является нормативным evidence.
3. Manual package уточняет правила компонента.
4. Raw/generated подтверждает только наблюдаемое состояние Figma.
5. Example иллюстрирует ожидаемое поведение и не создаёт правило.

## Правила редактирования

- Не меняй generated-секции вручную.
- Не редактируй `.index.json`, reference и registries вручную; обновляй через Athena.
- Не превращай каждый diff в запрет. Сначала определи, есть ли exact rule.
- Не описывай в `audit-mapping.json` проверку как активную, если Apollo её ещё не снимает.
- Не копируй длинный rule text в разные документы; используй `ruleId` и краткий контекст.
- Не удаляй manual-секции при регенерации.
