# BenefitCard r5 · Position: нарушение, сброс и повтор

**Сброс Position подтверждён на desktop и mobile-web.** Все пять surface checks возвращаются в compliant; все девять declared targets resolved. У desktop в свежем повторе 16:58:20 UTC выбран explicit ViewportClass=desktop / CardPlacement=single: нарушений и UNKNOWN нет.

Проверены шесть отчётов установленного Editor 0.2.95. Exact ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали; capture complete, warnings=0. Пакет r5 и исходные Draft-статусы не менялись.

| Кейс | Время UTC | Position | Пять surface checks | Контекст viewport/Hug | Отчёт |
| --- | --- | --- | --- | --- | --- |
| [BC4-311](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67774) | 16-46-23-528 | Level 2 (inner) | 1 violation + 4 UNKNOWN | 2 compliant | [JSON](../benefit-card.validation-report.2026-10-09T16-46-23-528Z.json) |
| [BC4-312](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67800) | 16-46-53-840 | Level 2 (inner) | 1 violation + 4 UNKNOWN | 2 compliant | [JSON](../benefit-card.validation-report.2026-10-09T16-46-53-840Z.json) |
| [BC4-312](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67800) | 16-47-31-464 | Level 1 (outer) | 5 compliant | 2 compliant | [JSON](../benefit-card.validation-report.2026-10-09T16-47-31-464Z.json) |
| [BC4-311](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67774) | 16-48-02-961 | Level 1 (outer) | 5 compliant | 2 UNKNOWN: поля не выбраны | [JSON](../benefit-card.validation-report.2026-10-09T16-48-02-961Z.json) |
| [BC4-311](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67774) | 16-58-20-390 | Level 1 (outer) | 5 compliant | 2 compliant | [JSON](../benefit-card.validation-report.2026-10-09T16-58-20-390Z.json) |
| [BC4-311](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67774) | 16-58-51-013 | Level 2 (inner) | 1 violation + 4 UNKNOWN | 2 compliant | [JSON](../benefit-card.validation-report.2026-10-09T16-58-51-013Z.json) |

Level 2 повторно даёт ожидаемое нарушение Position. Четыре UNKNOWN связаны с новым native Style Level 2 и недоказанной target.surface identity; это отдельный открытый gap, не PASS. Reset восстанавливает исходный Style Level 1 и его точную identity. Нельзя наследовать identity от родителя либо подставлять её по имени или порядку.

Старый desktop reset 16:48:02 UTC подтверждает только пять surface checks: его два контекстных UNKNOWN вызваны пустыми inputs. Свежий desktop reset 16:58:20 UTC закрывает этот повтор с явным контекстом.

Все полные сценарии остаются incomplete с тремя nonExecutable rules. Полный контракт, Source Reviewed/Ready, дочерние контракты, установленный Apollo и release не приняты.

Полные доказательства: [position-reset-live-review.r5.2026-10-09.json](position-reset-live-review.r5.2026-10-09.json). [Условия тестов](reading-fix-retest.r5.md).
