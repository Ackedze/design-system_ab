# PromoCard — паспорт r3

Статус: **Draft**. Desktop и mobile-web в одном family package.

Показывает отдельное промопредложение, преимущество или акцию через короткий текст, изображение и опциональное действие.

Публичные корни: [D] PromoCard, [M] PromoCard. Внутренние части отдельно не используются. 36 вариантов, 2 объявленных целей с native identity, включая скрытые слои. Привязки закреплены за master-версией тестового борда в лаборатории I3MsagXR8Tz2eZcGtIgUk8.

Импорты: `PromoCardDesktop`, `PromoCardMobile` из `arui-private/promo-card`, версия 80.7.1. Публичные imports/types и production package/browser proof подтверждены отдельной технической проверкой. Parity, полная live-приёмка и release не подтверждены.

- Image включает Figma-only None; публичный code imageOrientation принимает только top/bottom. Полный enum Image не связан с code через неполную таблицу.
- Offset — реальный BOOLEAN Offset#1101:0. Code imageOffset применяется только сверху; crop/align могут зависеть от размера и ориентации.
- Code всегда использует BackgroundPlate. Кнопки — core Button, desktop size=48/view=primary, mobile size=56/view=accent; это факт кода, parity не принята.

Сохранены 22 RuleID и формулировок. Исполняемых норм: 1. Остальные ограничения сохранены с missingFacts в rule-coverage.json.

Подробнее: code-api.source-evidence.json, native-target-bindings.r2.json, gaps.json.

Редакция r3 добавляет 30 подтверждённых скрытых слоёв в 9 вариантах производной anatomy. 12 свежих r2 snapshots воспроизводятся без regression; два прежних UNKNOWN исчезли. Свежий live-ретест r3 ещё не выполнен.
