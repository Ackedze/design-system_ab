# BenefitCard r5 · сброс лимита строк

**4/4 сброса подтверждены.** Title из двух строк и Subtitle из трёх строк проходят на desktop/mobile-web. Editor 0.2.98, core 0.1.14; exact engine/Editor replay четырёх новых отчётов совпал. Current ZIP/manual/compiled/runtime/snapshot hashes проверены; capture complete, warnings=0, все девять targets resolved. В 24 целевых оценках — compliant, violations/UNKNOWN=0.

| Кейс | Платформа | Текст | Символы | Строки | Результат | Отчёт |
| --- | --- | --- | --- | --- | --- | --- |
| [BC4-203](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67144) | desktop | title | 13 | 2 | compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T19-00-32-177Z.json) |
| [BC4-204](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67169) | mobile-web | title | 13 | 2 | compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T19-00-49-017Z.json) |
| [BC4-207](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67246) | desktop | subtitle | 20 | 3 | compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T19-01-08-260Z.json) |
| [BC4-208](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67271) | mobile-web | subtitle | 20 | 3 | compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T19-01-28-168Z.json) |

Physical root, explicit context, параметры и Hug корня совпали с сохранёнными review receipts предыдущих отрицательных прогонов. Из текста удалена последняя строка; Auto height/Left сохранены. Исходные negative raw captures сейчас отсутствуют: новый exact replay отрицательных отчётов и before/after native source continuity здесь не заявляются. Прежние receipts сохранены без изменения. Четыре свежих raw captures сохранены с проверенным SHA в reports/live-captures/2026-10-09.

Остались четыре character resets: BC4-201/202 → 60 латинских i в Title, BC4-205/206 → 120 латинских i в Subtitle. Копировать только characters из положительных BC4-211/212 и BC4-213/214 в текущие TEXT, без замены слоёв.

Все полные сценарии incomplete с тремя nonExecutable rules. Пакет, нормы и Draft-статусы не менялись; полный текстовый контур, весь компонент, установленный Apollo и release не приняты.

Полные доказательства: [text-line-resets-live-review.r5.2026-10-09.json](text-line-resets-live-review.r5.2026-10-09.json). [Условия сбросов](reading-fix-retest.r5.md).
