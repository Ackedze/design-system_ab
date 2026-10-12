# BenefitCard r5 — цикл добавления и удаления тени

**2/2 отрицательных прогона и 2/2 RESET приняты.** Добавленная тень обнаружена одним целевым violation на каждом корне. После удаления эффекты и effectDetailsV1 восстановлены в пустые массивы, violations=0 и inconclusive=0.

Editor 0.2.98, core 0.1.14, r5. Captures сняты 10.10.2026 02:04–02:05 Europe/Moscow (09.10.2026 23:04–23:05 UTC). Четыре exact engine replay и четыре exact Editor report replay совпали полностью; source/runtime/snapshot hashes проверены.

| Кейс | Контекст | Целевой результат |
| --- | --- | --- |
| [BC4-421](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100718) | desktop; single | .1.11: violation → compliant |
| [BC4-422](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100743) | mobile-web; single | .1.11: violation → compliant |

Actual effectDetailsV1 совпадает с независимым Figma readback тени, включая radius, offset, цвет, spread и видимость. Исходный baseline пуст. В паре сохранены physical root, native component identity/properties, explicit context, baseline, layout/Hug, текст, видимость и внешний вид потомков. Все девять targets resolved; capture complete, warnings=0, unmatched baseline nodes=0.

Приёмка охватывает добавление DROP_SHADOW и его удаление. Изменение параметров уже существующего эффекта этим циклом не проверено: IR сравнивает compact appearance.effects. Полный компонент остаётся Draft; три неисполняемых правила сохраняются, нормы/ZIP/статусы правил не менялись.

Доказательства: [visual-effects-cycle-live-review.r5.2026-10-10.json](visual-effects-cycle-live-review.r5.2026-10-10.json). [Условия теста](visual-effects-tests.r5.md).
