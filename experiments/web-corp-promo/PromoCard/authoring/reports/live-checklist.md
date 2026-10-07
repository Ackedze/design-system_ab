# PromoCard — live-проверка r2

Статус Draft. Эти действия проверяют новую редакцию; старые отчёты не являются live-приёмкой r2.

1. Загрузить PromoCard.component-contract.zip в Editor 0.2.92 или совместимую версию. Проверить r2, anatomy и desktop/mobile-web.
2. На существующем тестовом борде лаборатории повторить эталоны D01/M01. Цели должны иметь exact native identity; отсутствие schema ошибок не означает полную проверку норм.
3. Повторить D03/M03 (скрытый Title). Ожидается title-required.
4. Не повышать context-only правила до Reviewed по зелёному исполняемому отчёту. Их missingFacts/ручная проверка перечислены в rule-coverage.json.
5. При другой версии/import master-компонента reference pin может стать stale; требуется новый authoring capture и перенос привязок с проверкой.
6. Offset/Image=None ограничения подготовлены как context-only; пока не ожидать автоматического нарушения от них.
