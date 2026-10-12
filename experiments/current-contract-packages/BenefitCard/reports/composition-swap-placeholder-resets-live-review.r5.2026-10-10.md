# BenefitCard r5 восстановление Graphic и выключение Bottom

**4/4 RESET приняты. Цикл BC4-105–108 закрыт в заявленной области.** Подмена Graphic больше не обнаруживается; исходные Graphic/Image resolved и baseline сопоставлен. При выключенном Bottom скрытый SwapMe разрешён по неприменимости правила видимого placeholder. Нарушения выравнивания _Placeholder исчезли. Во всех четырёх новых отчётах violations=0, inconclusive=0.

Отчёты Editor 0.2.98 сняты 10.10.2026 в 01:32–01:33 по Москве (09.10.2026 22:32–22:33 UTC). Core 0.1.14. Повторены exact engine и Editor report replay восьми captures: четырёх отрицательных и четырёх RESET. Все совпали; source/runtime/snapshot hashes проверены.

| Кейс | Изменение после отрицательного прогона | Результат |
| --- | --- | --- |
| [BC4-105](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66755) | Исходный Graphic восстановлен по прежнему source address | swap violation → compliant; UNKNOWN 30/42 → 0 |
| [BC4-106](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66800) | Исходный Graphic восстановлен по прежнему source address | swap violation → compliant; UNKNOWN 30/42 → 0 |
| [BC4-107](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66846) | Bottom=false, скрытый Presets=SwapMe сохранён | placeholder violation → notApplicable; CENTER violation исчез |
| [BC4-108](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66871) | Bottom=false, скрытый Presets=SwapMe сохранён | placeholder violation → notApplicable; CENTER violation исчез |

Подтверждены те же physical roots, public component identity, root layout/properties и explicit context. Все девять declared targets resolved, capture complete, warnings=0, unmatched baseline nodes=0. В 16 целевых reset оценках — 12 compliant и четыре notApplicable. Сохраняются три неисполняемых правила полного сценария.

Этот цикл принимает обнаружение запрещённой подмены и видимого placeholder с соответствующим восстановлением. Видимый допустимый Link, его ограничения и closure не приняты. UNKNOWN чужого содержимого исчезли после восстановления исходного компонента; произвольное чужое содержимое не получило новый baseline или приёмку.

Нормы, ZIP и статусы правил не менялись; весь BenefitCard остаётся Draft. Пробел диагностики скрытого Title, зависимости, другие группы и installed Apollo/live/release gates остаются отдельными задачами.

Доказательства: [composition-swap-placeholder-resets-live-review.r5.2026-10-10.json](composition-swap-placeholder-resets-live-review.r5.2026-10-10.json). [Условия цикла](composition-swap-placeholder-tests.r5.md).
