# BenefitCard r5 · живой повтор после исправления чтения

**12/12 целевых результатов совпали.** Установленный Editor 0.2.95; r5 source/runtime/snapshot hashes, engine и Editor replay совпали. Условия Editor/Figma совпадают с таблицей, capture complete, warnings=0. Пакет и Draft-статусы сохранены.

В шести отрицательных кейсах обнаружено ровно по одному целевому нарушению. Icon исключает три ImageView проверки и сохраняет обязательность Graphic. Background=False исключает пять surface checks. Segment=KIB проходит Size/Crop/Grid. В 24 дополнительных viewport/Hug оценках — compliant.

| Кейс | Целевой результат | Дополнительные UNKNOWN | Отчёт |
| --- | --- | --- | --- |
| [BC4-307](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67662) | 1 ожидаемое violation | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-11-12-197Z.json) |
| [BC4-308](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67687) | 1 ожидаемое violation | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-11-27-886Z.json) |
| [BC4-309](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67713) | 1 ожидаемое violation | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-11-44-266Z.json) |
| [BC4-310](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67743) | 1 ожидаемое violation | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-12-00-962Z.json) |
| [BC4-311](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67774) | 1 ожидаемое violation | 4 | [JSON](../benefit-card.validation-report.2026-10-09T16-12-15-085Z.json) |
| [BC4-312](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67800) | 1 ожидаемое violation | 4 | [JSON](../benefit-card.validation-report.2026-10-09T16-12-29-207Z.json) |
| [BC4-319](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67984) | 3 × not-applicable; Graphic compliant | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-12-48-377Z.json) |
| [BC4-320](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-68019) | 3 × not-applicable; Graphic compliant | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-13-07-263Z.json) |
| [BC4-V02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13606-66178) | 5 × not-applicable | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-13-22-536Z.json) |
| [BC4-V25](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13606-66717) | 5 × not-applicable | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-13-37-038Z.json) |
| [BC4-317](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67929) | 3 × compliant | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-13-50-366Z.json) |
| [BC4-318](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67956) | 3 × compliant | 0 | [JSON](../benefit-card.validation-report.2026-10-09T16-14-04-012Z.json) |

**BC4-311/312:** Position=Level 2 обнаружен как нарушение. Вместе с ним исходный Style Level 1 заменяется Style Level 2, меняются native source и owner. Доказательство содержимого новой границы matched, но оно не создаёт разрешение переименовать target.surface. Поэтому четыре внутренние проверки на каждый кейс остаются UNKNOWN: Color, Skeleton и два paint binding checks. Эти восемь UNKNOWN сохранены как явный gap; это не полный PASS карточки.

Следующий короткий цикл: в BC4-311 и BC4-312 вернуть Position=Level 1 (outer), сохранить тот же ViewportClass и CardPlacement=single и проверить снова. Ожидается исчезновение нарушения Position и четырёх UNKNOWN; все пять surface checks должны быть compliant. Эти reset отчёты ещё не получены.

Все 12 полных сценариев incomplete с тремя nonExecutable rules. Целевой reading fix принят в области Editor; Source Reviewed/Ready, остальные кейсы борда, child contracts, installed Apollo и publication не приняты.

Полные доказательства: [reading-fix-live-review.r5.2026-10-09.json](reading-fix-live-review.r5.2026-10-09.json). [Условия тестов](reading-fix-retest.r5.md).
