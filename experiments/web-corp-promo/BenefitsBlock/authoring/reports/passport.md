# BenefitsBlock — паспорт r2

Статус: **Draft**. Desktop и mobile-web в одном family package.

Активный канонический промо-баннер для яркой подачи ключевой информации и преимуществ на landing/promo page.

Публичные корни: [D] BenefitsBlock, [M] BenefitsBlock. Внутренние части отдельно не используются. 20 вариантов, 4 объявленных целей с native identity, включая скрытые слои. Привязки закреплены за master-версией тестового борда в лаборатории I3MsagXR8Tz2eZcGtIgUk8.

Импорты: `BenefitBlockDesktop`, `BenefitBlockMobile` из `arui-private/benefit-block`, версия 80.7.1. Публичные imports/types и production package/browser proof подтверждены отдельной технической проверкой. Parity, пользовательская live-приёмка r2 и release не подтверждены.

- Канонический DS owner BenefitsBlock соответствует публичному модулю arui-private/benefit-block и экспортам BenefitBlockDesktop/Mobile.
- HeightCustom является строковым Figma VARIANT, а heightCustom в коде — number. Автоматического преобразования нет.
- Для preset=list требуется listItems, для preset=steps — stepsItems. Desktop imagePositionDesktop принимает left/right; mobile imagePositionMobile — top/bottom.
- RightAddon и TitleAddon отсутствуют в публичном code API. Точный актуальный источник 26 норм не получен; сохраняется историческая проекция 31 правила.
- Требование ImageView.Size=348 отменено; замена другим фиксированным размером не вводится.

Сохранены 31 RuleID и формулировок. Исполняемых норм: 2. Остальные ограничения сохранены с missingFacts в rule-coverage.json.

Подробнее: code-api.source-evidence.json, native-target-bindings.r2.json, gaps.json.
