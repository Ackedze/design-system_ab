# BenefitCard r5 · выравнивание и неизвестное число строк

**4/4 целевых результатов совпали.** Exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали; Editor 0.2.96, core 0.1.14. Capture complete, warnings=0, все девять targets resolved, explicit viewport/single и Hug выбраны корректно.

| Кейс | Платформа | Title | Целевой результат | Отчёт |
| --- | --- | --- | --- | --- |
| [BC4-209](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67297) | desktop | CENTER / HEIGHT | Alignment violation; символы и строки compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-12-41-141Z.json) |
| [BC4-210](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67322) | mobile-web | CENTER / HEIGHT | Alignment violation; символы и строки compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-13-20-197Z.json) |
| [BC4-215](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67450) | desktop | LEFT / NONE | Line count UNKNOWN; 11 символов compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-13-29-764Z.json) |
| [BC4-216](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67475) | mobile-web | LEFT / NONE | Line count UNKNOWN; 11 символов compliant | [JSON](../reports/live-captures/2026-10-09/benefit-card.validation-report.2026-10-09T18-13-42-411Z.json) |

Center нарушает требование LEFT только у изменённого Title; Subtitle остаётся compliant. Fixed size у TEXT делает число строк unknown, хотя его прямоугольник по высоте похож на одну строку. Число символов 11 известно и проверяется. Оба UNKNOWN ожидаемы и подтверждают guard; неизвестность не подменена PASS. Корень карточки во всех случаях Hug.

Получены ожидаемые результаты всех 16 подготовленных текстовых кейсов BC4-201–216. Свежий exact replay выполнен для текущих четырёх; их копии с проверенным SHA сохранены в reports/live-captures/2026-10-09. Предыдущие 12 приняты согласно сохранённым историческим receipts. Сейчас доступны и проверены 0 из их raw reports; отсутствуют 12. Новый exact replay отсутствующих файлов не заявляется. Same-occurrence resets ещё не приняты.

Следующий цикл: в этих же BC4-209/210 вернуть Title → Left, а в BC4-215/216 вернуть TEXT → Auto height. Контекст и параметры корня сохранить. Ожидается исчезновение обоих violations и обоих UNKNOWN. Далее — сбросы строк и символов на тех же экземплярах.

Все полные сценарии incomplete с тремя nonExecutable rules. Нормы, ZIP и Draft-статусы не менялись; полный текстовый контур, весь компонент, установленный Apollo и release не приняты.

Полные доказательства: [text-alignment-unknown-live-review.r5.2026-10-09.json](text-alignment-unknown-live-review.r5.2026-10-09.json). [Условия сбросов](reading-fix-retest.r5.md).
