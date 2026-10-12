# BenefitCard r5 — цикл top/right padding

**4/4 отрицательных прогона и 4/4 RESET приняты.** Каждый отрицательный capture содержит одно целевое нарушение на корне. Во всех RESET violations=0 и inconclusive=0. Все 16 проверок четырёх padding корня в RESET compliant.

Editor 0.2.98, core 0.1.14, r5. Captures: 10.10.2026 01:39–01:41 Europe/Moscow (09.10.2026 22:39–22:41 UTC). Восемь exact engine replay и восемь exact Editor report replay совпали полностью; source/runtime/snapshot hashes проверены.

| Кейс | Контекст | Проверенный padding | Отрицательный прогон | RESET |
| --- | --- | --- | --- | --- |
| [BC4-401](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100208) | desktop; single | layout.padding.top | 36 вместо 32: violation | 32: compliant |
| [BC4-402](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100233) | mobile-web; single | layout.padding.top | 24 вместо 20: violation | 20: compliant |
| [BC4-403](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100259) | desktop; single | layout.padding.right | 36 вместо 32: violation | 32: compliant |
| [BC4-404](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100284) | mobile-web; single | layout.padding.right | 24 вместо 20: violation | 20: compliant |

Эталон подтверждён ранее независимым чтением библиотечного мастера. В паре сохранены physical root, native component identities/properties, explicit context, независимый baseline, текст, внешний вид, видимость и высота Hug. Все девять declared targets resolved; captures complete, warnings=0, unmatched baseline nodes=0.

Во всех сценариях остаются три неисполняемых правила. Этот цикл принимает top/right padding в указанных вариантах; остальные визуальные свойства, зависимости, Reviewed/Ready и installed Apollo остаются отдельными этапами. Нормы, ZIP и статусы правил не менялись. Полный BenefitCard остаётся Draft.

Доказательства: [visual-padding-top-right-cycle-live-review.r5.2026-10-10.json](visual-padding-top-right-cycle-live-review.r5.2026-10-10.json). [Условия теста](visual-padding-tests.r5.md).
