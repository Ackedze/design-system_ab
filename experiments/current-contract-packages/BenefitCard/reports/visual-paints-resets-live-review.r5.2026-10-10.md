# BenefitCard r5 — восстановление заливок и обводок

**4/4 RESET приняты; цикл BC4-413–416 закрыт.** На всех корнях Fill и Stroke восстановлены в пустые массивы. Все восемь целевых оценок compliant; violations=0, inconclusive=0.

Editor 0.2.98, core 0.1.14, r5. Новые captures сняты 10.10.2026 01:59–02:00 Europe/Moscow (09.10.2026 22:59–23:00 UTC). Повторены exact engine и exact Editor report replay восьми captures — четырёх отрицательных и четырёх RESET. Все совпали; source/runtime/snapshot hashes проверены.

| Кейс | Контекст | Результат |
| --- | --- | --- |
| [BC4-416](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100590) | mobile-web; single | violation → compliant; Fill/Stroke=[] |
| [BC4-415](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100565) | desktop; single | violation → compliant; Fill/Stroke=[] |
| [BC4-414](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100539) | mobile-web; single | violation → compliant; Fill/Stroke=[] |
| [BC4-413](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100514) | desktop; single | violation → compliant; Fill/Stroke=[] |

Подтверждены те же physical roots, native component identities/properties, explicit context, baseline, root layout и Hug, текст, видимость и внешний вид потомков. Все девять targets resolved; capture complete, warnings=0, unmatched baseline nodes=0.

Приёмка охватывает добавление SOLID paint на корни и его удаление в данных вариантах. Во всех сценариях остаются три неисполняемых правила. Полный компонент остаётся Draft; нормы, ZIP и статусы правил сохранены.

Доказательства: [visual-paints-resets-live-review.r5.2026-10-10.json](visual-paints-resets-live-review.r5.2026-10-10.json). [Условия теста](visual-paints-tests.r5.md).
