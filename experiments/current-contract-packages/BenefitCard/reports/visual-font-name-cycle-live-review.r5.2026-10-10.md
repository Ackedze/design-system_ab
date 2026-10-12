# BenefitCard r5 — цикл смены шрифта Title

**2/2 отрицательных прогона и 2/2 RESET приняты.** Regular обнаружен одним целевым нарушением fontName на Title для каждой платформы. После восстановления Bold на desktop и Medium на mobile-web violations=0 и inconclusive=0.

Editor 0.2.98, core 0.1.14, r5. Captures сняты 10.10.2026 02:17–02:18 Europe/Moscow (09.10.2026 23:17–23:18 UTC). Четыре engine replay и четыре Editor report replay совпали полностью. Проверены source/runtime/snapshot hashes, полнота capture, девять resolved targets и независимый baseline Title.

| Кейс | Контекст | Изменение fontName | Целевой результат |
| --- | --- | --- | --- |
| [BC4-425](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100820) | desktop; single | Regular → Bold | .1.13: violation → compliant |
| [BC4-426](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100845) | mobile-web; single | Regular → Medium | .1.13: violation → compliant |

В каждой паре сохранены physical root, native identity/properties, explicit context, baseline, layout/Hug, остальные текстовые параметры, видимость и визуальные свойства. RESET восстановил также typography styleId по baseline; в mobile-web вернулась привязка fontStyle. Эти сопутствующие изменения зафиксированы в JSON и не названы неизменными.

Baseline Bold/Medium сверён с exact native TEXT и независимо сопоставленным эталоном предыдущих pinned captures. Прямой новый readback Title внутри master не заявляется. Приёмка относится к fontName двух указанных вариантов; остальные размеры шрифта, lineHeight и letterSpacing имеют отдельную автоматическую проверку, но не принятую этим циклом ручную проверку борда.

Полный компонент остаётся Draft; три неисполняемых правила сохраняются. Нормы, ZIP и статусы правил не менялись.

Доказательства: [visual-font-name-cycle-live-review.r5.2026-10-10.json](visual-font-name-cycle-live-review.r5.2026-10-10.json). [Условия теста](visual-font-name-tests.r5.md).
