---
paths:
  - "JSONS/referenceSourcesMVP.json"
  - "JSONS/indexes/**/*.json"
  - "JSONS/apollo/indexes/**/*.json"
  - "JSONS/web/components/**/contract.generated.json"
  - "JSONS/web/components/**/agent-context.json"
  - "JSONS/web/components/**/audit-mapping.json"
  - "JSONS/web/components/**/apollo-*-registry.json"
---

# Generated file protection

- Не редактируй raw-каталоги, indexes, registries, `componentContractIndex.json` и `contract.generated.json` вручную.
- В `agent-context.json` и `audit-mapping.json` редактируй только секцию `manual`.
- В ownership schema v2 секция `generated` принадлежит Athena CLI.
- Если generated-результат неверен, остановись и укажи, какой source или генератор нужно исправить.
- После Athena regeneration проверь, что изменения относятся только к выбранному каталогу и связанным индексам.
