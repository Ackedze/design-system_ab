# BenefitCard r5 · Title: три строки; Subtitle: 121 символ

**4/4 целевых результатов совпали.** Установленный Editor 0.2.96; exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали на core 0.1.14. Capture complete, warnings=0, все девять declared targets resolved. Explicit ViewportClass / CardPlacement=single, Hug и параметры корня совпадают с условиями.

| Кейс | Платформа | Текст | Символы | Строки | Результат лимита символов / строк | Отчёт |
| --- | --- | --- | --- | --- | --- | --- |
| [BC4-203](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67144) | desktop | title | 20 | 3 | compliant / violation | [JSON](../benefit-card.validation-report.2026-10-09T17-37-32-302Z.json) |
| [BC4-204](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67169) | mobile-web | title | 20 | 3 | compliant / violation | [JSON](../benefit-card.validation-report.2026-10-09T17-37-46-054Z.json) |
| [BC4-205](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67195) | desktop | subtitle | 121 | 4 | violation / violation | [JSON](../benefit-card.validation-report.2026-10-09T17-37-57-108Z.json) |
| [BC4-206](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67220) | mobile-web | subtitle | 121 | 3 | violation / compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-38-08-502Z.json) |

Title из трёх строк нарушает только лимит строк, длина 20 символов допустима. Subtitle из 121 символа нарушает длину на D/M; desktop также занимает четыре строки и нарушает второй лимит, mobile занимает допустимые три строки. UNKNOWN и неожиданных нарушений нет.

Приняты эти отрицательные проверки. Subtitle=120, отдельные четыре строки при допустимом числе символов, выравнивание, UNKNOWN и same-occurrence resets ещё открыты. Все полные сценарии incomplete с тремя nonExecutable rules; нормы, ZIP и Draft-статусы не менялись. Установленный Apollo и весь контракт не приняты.

Полные доказательства: [text-limits-negative-live-review.r5.2026-10-09.json](text-limits-negative-live-review.r5.2026-10-09.json). Следующие кейсы: BC4-213/214 (Subtitle, 120 символов) и BC4-207/208 (Subtitle, четыре строки).
