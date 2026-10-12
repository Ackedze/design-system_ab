# BenefitCard r5 · граница Title 60/61 символ

**4/4 целевых результатов совпали.** Установленный Editor 0.2.96, текущий контракт r5; exact ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали на core 0.1.14. Capture complete, warnings=0, все девять declared targets resolved, контекст ViewportClass/CardPlacement задан явно и соответствует кейсу.

| Кейс | Платформа | Символы | Строки | Лимит символов | Лимит строк | Отчёт |
| --- | --- | --- | --- | --- | --- | --- |
| [BC4-211](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67348) | desktop | 60 | 2 | compliant | compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-32-03-329Z.json) |
| [BC4-212](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67373) | mobile-web | 60 | 1 | compliant | compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-32-14-256Z.json) |
| [BC4-201](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67093) | desktop | 61 | 3 | violation | violation | [JSON](../benefit-card.validation-report.2026-10-09T17-32-27-686Z.json) |
| [BC4-202](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67118) | mobile-web | 61 | 2 | violation | compliant | [JSON](../benefit-card.validation-report.2026-10-09T17-32-41-851Z.json) |

BC4-201 содержит 61 символ и три строки, поэтому оба независимых лимита нарушены. BC4-202 содержит 61 символ и две строки, поэтому нарушен только лимит символов. Две ошибки на desktop и одна на mobile — корректное различие, не дефект счётчика. UNKNOWN и неожиданных нарушений нет.

Принята только граница символов Title D/M. Отдельные line-boundary, Subtitle, alignment, UNKNOWN и same-occurrence reset проверки ещё не приняты. Все полные сценарии incomplete с тремя nonExecutable rules; нормы, ZIP и Draft-статусы не менялись. Установленный Apollo и полный контракт не приняты.

Полные доказательства: [title-character-boundaries-live-review.r5.2026-10-09.json](title-character-boundaries-live-review.r5.2026-10-09.json). Следующие кейсы: BC4-203/204 (Title, три строки) и BC4-205/206 (Subtitle, 121 символ).
