# BenefitCard r5 — отрицательные прогоны заливки и обводки

**4/4 целевые нарушения подтверждены.** На каждом корне обнаружено ровно одно violation нужного RuleID; дополнительных нарушений и UNKNOWN нет.

Editor 0.2.98, core 0.1.14, r5. Captures сняты 10.10.2026 01:57 Europe/Moscow (09.10.2026 22:57 UTC). Четыре exact engine replay и четыре exact Editor report replay совпали полностью; все source/runtime/snapshot hashes проверены.

| Кейс | Контекст | Факт | Результат |
| --- | --- | --- | --- |
| [BC4-413](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100514) | desktop; single | appearance.fill: один SOLID paint вместо пустого массива | violation component:web.benefit-card.visuals-follow-effective-baseline.1.7 |
| [BC4-414](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100539) | mobile-web; single | appearance.fill: один SOLID paint вместо пустого массива | violation component:web.benefit-card.visuals-follow-effective-baseline.1.7 |
| [BC4-415](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100565) | desktop; single | appearance.stroke: один SOLID paint вместо пустого массива | violation component:web.benefit-card.visuals-follow-effective-baseline.1.8 |
| [BC4-416](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100590) | mobile-web; single | appearance.stroke: один SOLID paint вместо пустого массива | violation component:web.benefit-card.visuals-follow-effective-baseline.1.8 |

Actual paints совпадают с нормализованным независимым Figma readback: тип, видимость, opacity, tokenId и RGB. Baseline остаётся пустым массивом библиотечного мастера. Подтверждены native root/component-set identity, VARIANT parameters и Hug. Все девять declared targets resolved, capture complete, warnings=0, unmatched baseline nodes=0.

Принята отрицательная часть BC4-413–416. Для завершения цикла нужны RESET на тех же физических корнях: удалить только добавленный Fill/Stroke и сохранить параметры, Hug и explicit context. Эти четыре RESET ещё не представлены.

Остаются три неисполняемых правила полного сценария. ZIP, нормы и статусы правил не менялись; полный компонент остаётся Draft.

Доказательства: [visual-paints-negative-live-review.r5.2026-10-10.json](visual-paints-negative-live-review.r5.2026-10-10.json). [Условия теста](visual-paints-tests.r5.md).
