# Контракты карточек — ретест r2 и PromoCard r3

2026-10-07. Статус всех трёх контрактов: **Draft**.

Проверены 39 новых отчётов Editor 0.2.92: 38 уникальных кейсов и повтор BB-D01. Manuals r2, compiled/runtime contracts, snapshot hashes, native reference pins и результаты engine воспроизведены точно. Все 18 исполняемых case assertions прошли: 6 эталонов и 12 отрицательных.

| Компонент | Отчёты | Auto case assertions | Оставшиеся пробелы |
|---|---:|---:|---|
| BenefitCard r2 | 12 | 6/6 | BC-D06: ContentPreset отличается от Compact-эталона; D05/M05 визуальная норма context-only |
| PromoCard r2 → r3 | 12 | 4/4 | r3 исправляет PC-D04/M06; live r3 ещё не выполнен. D05/M05 визуальная норма context-only |
| BenefitsBlock r2 | 15 | 8/8 | BB-D07/M07 source-pending: требуется текущий источник 26 правил |

## PromoCard r3

В source/contract.generated.r3.json добавлены только 30 недостающих скрытых Offset/BlurEffect слоёв в 9 вариантах. Ни один существующий узел или его поле не удалён и не заменён. Все 36 независимых native structures совпадают с derived inventory. Исходные выгрузки и прежние generated JSON сохранены байт-в-байт; в ZIP исторические generated inputs имеют расширение .json.txt.

Все 22 нормы, RuleID, constraints, execution routes, semantic API, code representations и 72 native bindings сохранены. Shared core/runtime/Editor не менялись. Offset/Image=None остаются context-only.

r3 воспроизводит все 12 свежих r2 snapshots: PC-D04 и PC-M06 теперь resolved для root и Title. ZIP повторно открыт и перекомпилирован для desktop и mobile-web с exact equality. Это технический replay; свежая live-приёмка r3 пока не выполнена.

Обновлённый пакет: [PromoCard.component-contract.zip](../current-contract-packages/PromoCard.component-contract.zip).

## Следующий ретест

Загрузить PromoCard r3 в Editor и повторить PC-D04, PC-M06. Ожидается отсутствие human-review у title-required; root и Title resolved. Для контроля доступны PC-D01/M01 и PC-D03/M03.

BC-D06 не считается PASS: nested ContentWrapper / Content имеет component-variant-changed boundary. После смены Compact фактический ContentPreset отличается от pristine Compact-эталона; перед утверждением положительного кейса нужна отдельная сверка этой конфигурации.

Проверки присутствия не закрывают визуальные и контекстные нормы, dependency closure, code parity или release. Требование Size=348 для BenefitsBlock не возвращается.

Google Правила (22 строки PromoCard), Predicate (Corp rows 50/52/56) и Леджер (497/498/499) синхронизированы: 105 ячеек подтверждены readback, формат и validation сохранены. Predicate Draft; drift Найдено.

Доказательства: test-board-2026-10-06/editor-run-review.r2.2026-10-07.json и card-contracts-r3.2026-10-07.json. Полные частные captures в репозиторий не перенесены.
