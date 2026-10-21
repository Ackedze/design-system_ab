# PaymentMaskedNumber r1 · Draft

Один public root для desktop/mobile-web. Отступ Addon — **6 px** по решению владельца 21.10.2026.

Четыре уникальных authoring-правила выпускают шесть IR: две видимые текстовые части, общий color binding, baseline text-style pair, точный литерал маски, padding-left Addon6px и высота Addon ≤ line-height номера. Типографическая пара объединяет два прежних пересекающихся требования.

Regex-формат Major и Minor пока не исполняется — это прямо принятый владельцем gap первого Draft. Custom-slot placeholder и narrow overflow остаются контекстными; standalone internal roots ограничены паспортом, без отдельной доказанной area-проверки. Проверка padding6px не является общей проверкой расстояния до произвольного содержимого; принадлежность цветового токена DS остаётся сквозной политикой. Все12 исходных норм и маршруты см. reports/skill-evals/authoring-r1-2026-10-21/coverage-map.json.

Core/runtime/Proxy не менялись. Schema compile, ZIP roundtrip и13 primitive cases прошли. Source Figma прочитан, но новые native-прогоны контракта не выполнялись. Старые September Ready receipts не принимают текущий Draft. Существующие legacy case links указывают на frames; ссылки на проверяемые экземпляры не доказаны и как готовые тесткейсы не выдаются.

Пакет предназначен для авторинга/проверки в Editor; в работающий Apollo не установлен.
