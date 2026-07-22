---
paths:
  - "JSONS/web/components/**/*.json"
  - "JSONS/web/components/**/README.md"
  - "patterns/*.md"
---

# Component contract rules

- Сначала найди raw-каталог, component package и связанные паттерны.
- Не считай наличие кастомизации доказательством нарушения.
- Для `severity=error` должна существовать точная запрещающая формулировка.
- `severity=warning` означает риск или нежелательное поведение, а не запрет.
- `severity=info` должен объяснять обнаруженное изменение, но не требовать сброса без отдельного правила.
- `checkType=deterministic` используй только для факта, который Apollo может вычислить из доступных данных.
- Если Apollo пока не снимает нужный параметр, зафиксируй правило для agentic/generation и добавь ограничение в backlog, не называя проверку доступной.
- Manual rule должен содержать уникальный в своей секции `ruleId`, `severity`, `source`, `appliesTo`, `checkType` и `ruleText`.
- Пример может подтверждать правило, но не заменяет его.
- Не добавляй нормативное утверждение в ответ агента без evidence из component rule или pattern rule.
