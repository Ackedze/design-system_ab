# BenefitCard r5 · сброс выравнивания и Auto height

**4/4 сброса подтверждены в тех же экземплярах D/M.** Нарушений и UNKNOWN нет. Exact replay четырёх исходных отчётов Editor 0.2.96 и четырёх новых Editor 0.2.97 совпал на core 0.1.14. Текущий ZIP/manual/compiled/runtime/snapshot hashes проверены, capture complete, warnings=0, все девять targets resolved.

| Кейс | Изменение | Результат после сброса | Отчёт |
| --- | --- | --- | --- |
| [BC4-209](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67297) | Center → Left | compliant, 11 символов / 1 строка | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-31-34-880Z.json) |
| [BC4-210](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67322) | Center → Left | compliant, 11 символов / 1 строка | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-32-03-401Z.json) |
| [BC4-215](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67450) | Fixed size → Auto height | compliant, 11 символов / 1 строка | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-32-46-541Z.json) |
| [BC4-216](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67475) | Fixed size → Auto height | compliant, 11 символов / 1 строка | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-33-28-439Z.json) |

Physical root, published component key, native source Title, содержимое и explicit scenario pin совпадают с исходным отрицательным/UNKNOWN прогоном. При Auto height число строк доказано заново: UNKNOWN не подменён прежним cached значением. В 24 целевых reset оценках — compliant. Проверенные копии всех восьми исходных и reset captures сохранены в reports/live-captures/2026-10-09.

Следующие четыре сброса: BC4-203/204 → ровно две строки Title; BC4-207/208 → ровно три строки Subtitle. Auto height, Left, тот же корень/контекст и остальные параметры сохраняются. После них остаются четыре сброса символов BC4-201/202 и BC4-205/206.

Все полные сценарии incomplete с тремя nonExecutable rules. Пакет, нормы и Draft-статусы не менялись; полные текстовые нормы, весь компонент, установленный Apollo и release не приняты.

Полные доказательства: [text-style-resets-live-review.r5.2026-10-09.json](text-style-resets-live-review.r5.2026-10-09.json). [Условия сбросов](reading-fix-retest.r5.md).
