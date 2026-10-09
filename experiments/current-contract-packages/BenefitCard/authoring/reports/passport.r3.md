# BenefitCard — паспорт r2

Статус: **Draft**. Desktop и mobile-web в одном family package.

Показывает отдельное преимущество, функцию или ценностное предложение через короткий текст и обязательную графику.

Публичные корни: [D] BenefitCard, [M] BenefitCard. Внутренние части отдельно не используются. 32 вариантов, 3 объявленных целей с native identity, включая скрытые слои. Привязки закреплены за master-версией тестового борда в лаборатории I3MsagXR8Tz2eZcGtIgUk8.

Импорты: `BenefitCardDesktop`, `BenefitCardMobile` из `arui-private/benefit-card`, версия 80.7.1. Публичные imports/types и production package/browser proof подтверждены отдельной технической проверкой. Parity, пользовательская live-приёмка r2 и release не подтверждены.

- Публичный prop выравнивания называется textAling (исходное написание).
- Desktop wrapper задаёт titleView=primary, mobile — secondary после spread props. Compact/Secondary требует отдельной проверки parity.
- Graphic, BottomContent, токены и действия требуют фактического контента и точных дочерних контрактов.

Сохранены 30 RuleID и формулировок. Исполняемых норм: 1. Остальные ограничения сохранены с missingFacts в rule-coverage.json.

Подробнее: code-api.source-evidence.json, native-target-bindings.r2.json, gaps.json.
