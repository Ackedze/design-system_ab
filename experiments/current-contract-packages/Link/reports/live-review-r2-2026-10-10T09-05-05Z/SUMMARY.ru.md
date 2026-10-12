# Link r2 — проверка пяти пользовательских отчётов

Editor 0.2.98 / core 0.1.14, 10.10.2026. Приёмка ограничена конкретными кейсами.

| Кейс | Фактические параметры | Результат |
| --- | --- | --- |
| LINK-01 | S (14-20), оба Addon=true, Solid | PASS; 0 violations / 0 inconclusive, 8 targets resolved |
| LINK-02 | S (14-20) (Size-20 icons), оба Addon=true, Solid | PASS; 0 violations / 0 inconclusive, 8 targets resolved |
| LINK-04 | L (18-24), оба Addon=true, Solid | PASS; 0 violations / 0 inconclusive, 8 targets resolved |
| LINK-05 | M, публичный Label «Открыть подробные условия обслуживания» | FAIL ожидаемой полной проверки: 31 human-review, 8 reference-pin-stale |
| LINK-06 | M, публичные LeftAddon=false / RightAddon=false | FAIL ожидаемой полной проверки: 31 human-review, 8 reference-pin-stale |

Причина подтверждена: portable reference pin содержит разрешённые публичные значения
TEXT/BOOLEAN. Native структура, source/owner identity и остальные portable поля
совпадают с исходным эталоном. Counterfactual восстановление только этих значений
в reference разрешает 8 targets; actual snapshot и effective baseline сохранены.
Это доказательство причины, а не исправление продукта или installed PASS.

Сохранены exact исходные bytes пяти отчётов, hashes и replay в verify.cjs/review.json.
Проверки stale структуры и реального fontSize violation остаются успешными.
Нормы, ZIP, manual, compiled, Reviewed/Draft и исторические receipts не изменялись.
Три context-only нормы открыты; полный контракт Draft. Предыдущие 5 M baseline/
Gap/fontSize/RESET прогонов сохраняют отдельную ранее принятую область.

Следующий шаг — bounded repair identity/configuration в shared core/capture с
парными Editor и Apollo/Proxy проверками. Задачи EDITOR-DECLARED-TARGET-CONFIGURATION-001
и CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04 открыты. Повторять LINK-05/06 до fix
не требуется. Продуктовый код в этой проверке не изменялся.
