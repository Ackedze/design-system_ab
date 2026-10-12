# BenefitCard r5 · сброс видимости Title и Graphic

**4/4 сброса приняты. Цикл скрыть → показать закрыт для Title и Graphic на desktop/mobile-web.** В текущих captures оба обязательных элемента видимы, count=1 и compliant. Прежние четыре нарушения исчезли; во всех четырёх отчётах violations/human-review=0. Platform и Hug проходят. В 16 целевых reset оценках — 16 compliant.

Отчёты получены 10.10.2026 в 01:06–01:07 по Москве (09.10.2026 22:06–22:07 UTC). Editor 0.2.98, core 0.1.14. Exact engine/Editor replay четырёх новых и четырёх сохранённых отрицательных captures совпал. ZIP/manual/compiled/runtime/snapshot hashes проверены; capture complete, warnings=0, все девять targets resolved. Те же physical roots, explicit context, native source/component identity Title и Graphic, текст/типографика Title, layout и параметры корня подтверждены.

| Кейс | Платформа | Сброс | Результат |
| --- | --- | --- | --- |
| [BC4-101](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66653) | desktop | title: hidden → visible | required count 0 → 1, violation → compliant |
| [BC4-102](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66678) | mobile-web | title: hidden → visible | required count 0 → 1, violation → compliant |
| [BC4-103](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66704) | desktop | graphic: hidden → visible | required count 0 → 1, violation → compliant |
| [BC4-104](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66729) | mobile-web | graphic: hidden → visible | required count 0 → 1, violation → compliant |

Неточная диагностика лимита скрытого Title остаётся открытой: она отсутствует в видимом RESET вследствие восстановления видимости. Этот прогон не принимает исправление hidden-target coverage. Нормы, ZIP и Draft-статусы не менялись. Full scenarios incomplete с тремя context-only gaps; весь компонент, зависимости, Source Reviewed/Ready и установленный Apollo не приняты.

Следующая группа: BC4-105/106 — запрещённая подмена Graphic; BC4-107/108 — видимый Bottom с Presets=SwapMe. Подготовку этих кейсов проверяем отдельно. Новые raw captures из корня current-contract-packages сохранены копиями с SHA в BenefitCard/reports/live-captures/2026-10-09.

Доказательства: [composition-visibility-resets-live-review.r5.2026-10-10.json](composition-visibility-resets-live-review.r5.2026-10-10.json). [Условия предыдущего цикла](composition-visibility-tests.r5.md).
