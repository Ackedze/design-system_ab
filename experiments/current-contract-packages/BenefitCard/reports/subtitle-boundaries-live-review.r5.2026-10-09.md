# BenefitCard r5 · Subtitle: 120 символов и четыре строки

**4/4 целевых результатов совпали.** Установленный Editor 0.2.96; exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали на core 0.1.14. Capture complete, warnings=0, все девять declared targets resolved. Explicit ViewportClass / CardPlacement=single, Hug и параметры корня совпадают с условиями.

| Кейс | Платформа | Текст | Символы | Строки | Результат лимита символов / строк | Отчёт |
| --- | --- | --- | --- | --- | --- | --- |
| [BC4-213](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67399) | desktop | subtitle | 120 | 2 | compliant / compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-51-46-637Z.json) |
| [BC4-214](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67424) | mobile-web | subtitle | 120 | 2 | compliant / compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-51-57-361Z.json) |
| [BC4-207](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67246) | desktop | subtitle | 27 | 4 | compliant / violation | [JSON](../benefit-card.validation-report.2026-10-09T17-52-09-600Z.json) |
| [BC4-208](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67271) | mobile-web | subtitle | 27 | 4 | compliant / violation | [JSON](../benefit-card.validation-report.2026-10-09T17-52-20-910Z.json) |

Subtitle из 120 символов занимает две строки и проходит оба лимита D/M. Subtitle из четырёх строк содержит 27 символов и нарушает только лимит строк D/M. UNKNOWN и неожиданных нарушений нет.

Приняты эти положительные и отрицательные проверки. Выравнивание, UNKNOWN и same-occurrence resets, включая отдельную положительную границу трёх строк Subtitle, ещё открыты. Все полные сценарии incomplete с тремя nonExecutable rules; нормы, ZIP и Draft-статусы не менялись. Установленный Apollo и весь контракт не приняты.

Полные доказательства: [subtitle-boundaries-live-review.r5.2026-10-09.json](subtitle-boundaries-live-review.r5.2026-10-09.json). Следующие кейсы: BC4-209/210 (выравнивание по центру) и BC4-215/216 (Fixed TEXT: число строк недоказуемо).
