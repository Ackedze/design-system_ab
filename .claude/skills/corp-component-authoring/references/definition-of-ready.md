# Definition of Ready

## Статусы документов

- `Draft` — документ существует, но содержит шаблонные данные, открытые вопросы или не прошёл проверку.
- `Legacy` — документ описывает устаревший компонент и сохраняется для совместимости или миграции.
- `Ready` — документ согласован владельцем, непротиворечив и прошёл предусмотренные проверки.

Общий статус компонента:

- `In progress` — хотя бы один обязательный документ не готов или не завершён runtime-тест;
- `Ready` — все обязательные документы готовы и комплект проверен в Apollo.

## Generated data

- Raw-каталог соответствует актуальной Figma library page.
- `contract.generated.json` сформирован Athena из этого raw.
- `.index.json`, `componentContractIndex.json`, reference и registries актуальны.
- Generated-секции hybrid-документов не изменялись вручную.
- Нет дубликатов package, raw path, component key или старого имени компонента.

## Manual documents

- `rules.json` содержит подтверждённые правила и не использует пример как evidence.
- У rules определены `ruleId`, `severity`, `source`, `appliesTo`, `checkType` и `ruleText`.
- `composition-contract.json` описывает ownership вложенных компонентов и effective baseline.
- `contract.overrides.json` содержит только семантику, которую нельзя вывести из raw.
- `examples.json` содержит positive, negative и context-dependent cases для ключевых правил.
- `agent-context.json` объясняет назначение, critical baselines и ограничения интерпретации.
- `audit-mapping.json` согласован с текущими возможностями Apollo; будущие проверки не выдаются за активные.
- Package `README.md` описывает состав комплекта, область применения и lifecycle.
- Связанный pattern обновлён, если правило относится к сценарию шире одного компонента.

## Качество

- Документы написаны по-русски, кроме технических терминов и имён из Figma.
- Нет `TODO`, `TBD`, template summaries и неподтверждённых продуктовых выводов.
- Exact prohibitions и recommendations разделены.
- Manual override одного generated `ruleId` допустим; дубликаты внутри одной ownership-секции запрещены.
- Все ссылки, component keys, aliases и package paths согласованы.

## Проверки

- Локальный package validator завершён без ошибок.
- Targeted Athena catalog check завершён успешно.
- Targeted Athena contract check завершён успешно.
- `git diff` не содержит изменений несвязанных компонентов.
- На реальном Figma-макете проверены минимум один корректный и один ошибочный кейс.
- `*_agent.json` содержит релевантные component rules и context.
- Ответ агента не содержит выводов, отсутствующих в evidence.

## Ручное подтверждение

- Владелец компонента подтвердил semantic rules.
- Reviewer подтвердил статус каждого документа.
- Общая таблица готовности обновлена после merge, а не до него.
