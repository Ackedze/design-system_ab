# BenefitCard r4 — живая проверка viewport и Hug, 09.10.2026

**12/12 кейсов совпали с ожиданием.** Проверен установленный Editor 0.2.94 / core 0.1.13. Exact source/snapshot/runtime hashes, engine и Editor replay совпали. Capture complete, warnings=0; все declared targets resolved. ZIP, нормы и Draft-статусы не изменены.

Целевые 24 оценки: 14 compliant, 4 ожидаемых violation, 2 not-applicable и 4 ожидаемых UNKNOWN. Незаданный контекст сохраняет UNKNOWN; group исключает Hug одиночной карточки. Неправильный viewport и Fixed single обнаруживаются на D/M.

| Кейс | ViewportClass | CardPlacement | Viewport | Hug | Отчёт |
| --- | --- | --- | --- | --- | --- |
| [BC4-V01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13606-66153) | desktop | single | Соответствует | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-55-19-327Z.json) |
| [BC4-V17](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13606-66521) | mobile-web | single | Соответствует | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-55-54-338Z.json) |
| [BC4-109](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66897) | desktop | single | Соответствует | Нарушение | [JSON](../benefit-card.validation-report.2026-10-09T13-56-19-907Z.json) |
| [BC4-110](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66922) | mobile-web | single | Соответствует | Нарушение | [JSON](../benefit-card.validation-report.2026-10-09T13-56-31-403Z.json) |
| [BC4-111](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66948) | desktop | group | Соответствует | Неприменимо | [JSON](../benefit-card.validation-report.2026-10-09T13-56-47-912Z.json) |
| [BC4-112](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66973) | mobile-web | group | Соответствует | Неприменимо | [JSON](../benefit-card.validation-report.2026-10-09T13-56-59-519Z.json) |
| [BC4-113](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66999) | mobile-web | single | Нарушение | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-57-17-969Z.json) |
| [BC4-114](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-67024) | desktop | single | Нарушение | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-57-31-306Z.json) |
| [BC4-115](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-67050) | Не задано | single | UNKNOWN (ожидаемый) | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-57-48-904Z.json) |
| [BC4-116](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-67075) | Не задано | single | UNKNOWN (ожидаемый) | Соответствует | [JSON](../benefit-card.validation-report.2026-10-09T13-57-59-041Z.json) |
| [BC4-117](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-67101) | desktop | Не задано | Соответствует | UNKNOWN (ожидаемый) | [JSON](../benefit-card.validation-report.2026-10-09T13-58-12-842Z.json) |
| [BC4-118](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-67126) | mobile-web | Не задано | Соответствует | UNKNOWN (ожидаемый) | [JSON](../benefit-card.validation-report.2026-10-09T13-58-19-766Z.json) |

Контекстные проверки приняты в указанной области Editor. Все полные сценарии остаются incomplete с тремя nonExecutable rules; это не приёмка всей карточки, Source Reviewed/Ready или installed Apollo. Чтение BackgroundPlate BC4-307–312, Graphic=Icon BC4-319/320 и Background=False остаётся открытым. Остальные группы борда ещё не проверены.

Доказательства: [context-live-review.r4.2026-10-09.json](context-live-review.r4.2026-10-09.json). Результаты первого столбца сохраняются отдельно в [первом разборе](first-column-live-review.r4.2026-10-09.md).
