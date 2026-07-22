# Definition of Ready

## Статусы

- `Draft`: документ содержит шаблонные данные, открытые вопросы или не прошёл проверку.
- `Legacy`: документ описывает устаревший компонент и нужен для совместимости или миграции.
- `Ready`: документ согласован владельцем, непротиворечив и прошёл применимые проверки.
- `In progress`: хотя бы один обязательный документ или runtime-тест не готов.

## Generated data

- Raw соответствует актуальной Figma library page.
- `contract.generated.json` сформирован Athena из этого raw.
- `.index.json`, `componentContractIndex.json`, reference и registries актуальны.
- Generated-секции hybrid-документов не изменялись вручную.
- Нет дублей package, raw path, component key или старого имени.

## Manual documents

- `rules.json` содержит подтверждённые правила; пример не используется как evidence.
- Rules имеют необходимые идентификаторы, severity, scope, check/match kind и rule text.
- `composition-contract.json` описывает ownership, slots и effective baseline.
- `contract.overrides.json` содержит только невыводимую из raw семантику.
- `examples.json` покрывает positive, negative и context-dependent cases.
- `agent-context.json` содержит назначение, baselines, evidence policy и anti-hallucination instructions.
- `audit-mapping.json` не выдаёт будущие возможности Apollo за активные.
- `README.md` описывает семейство, источники, lifecycle и статус.
- Связанный pattern обновлён только для cross-component сценариев.

## Качество

- Документы написаны по-русски, кроме технических терминов и имён Figma.
- Нет `TODO`, `TBD`, template summary и неподтверждённых продуктовых выводов.
- Exact prohibitions, recommendations, info и unresolved разделены.
- Один canonical `ruleId` не продублирован в одной ownership-секции.
- Ссылки, keys, aliases и paths согласованы.

## Проверки

- Package validator завершён без ошибок.
- Targeted Athena catalog и contract checks завершены успешно после обновления raw.
- `git diff` не содержит unrelated component churn.
- В Figma проверены минимум корректный и ошибочный кейсы.
- `*_agent.json` содержит релевантные component rules/context.
- Ответ агента не содержит выводов без evidence.

## Ручное подтверждение

- Владелец подтвердил component semantics.
- Reviewer подтвердил статус документов.
- Общая таблица готовности обновляется после подтверждения, а не заранее.
