# BenefitCard r5 подмена Graphic и видимый placeholder

**4/4 целевых отрицательных результата подтверждены.** Forbidden swap найден на desktop/mobile-web; Presets=SwapMe при включённом Bottom также найден на обеих платформах. Platform и Hug проходят. Четыре exact engine replay и четыре exact Editor report replay совпали.

Отчёты Editor 0.2.98 сняты 10.10.2026 в 01:25 по Москве (09.10.2026 22:25 UTC). Core 0.1.14. Проверены ZIP, manual/compiled, runtime и snapshot hashes, исходные корни и явный контекст; raw captures сохранены с SHA.

| Кейс | Целевое нарушение | Дополнительный результат |
| --- | --- | --- |
| [BC4-105](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66755) | Запрещённая подмена Graphic, swapCount=1 | 30 UNKNOWN для чужой области |
| [BC4-106](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66800) | Запрещённая подмена Graphic, swapCount=1 | 42 UNKNOWN для чужой области |
| [BC4-107](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66846) | Видимый Bottom, SwapMe вне домена Link | Выравнивание _Placeholder CENTER вместо LEFT |
| [BC4-108](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66871) | Видимый Bottom, SwapMe вне домена Link | Выравнивание _Placeholder CENTER вместо LEFT |

В BC4-105/106 сохранился source address прежнего Graphic, но actual component identity изменилась. Независимый baseline прежнего компонента не используется: 21 узел остаётся без сопоставления; semantic Graphic/Image unresolved. UNKNOWN включают required Graphic, ImageView и сравнения opacity/effects в чужом дереве. Они не отменяют доказанное нарушение swap и не принимают внутренние свойства подменённого компонента. Полнота сценария остаётся открытой.

В BC4-107/108 все девять targets resolved, capture warnings=0. Кроме целевого запрета SwapMe, широкое правило text-alignment-protected проверяет служебный _Placeholder и находит CENTER вместо LEFT. Это отдельный результат текущего manual; норму не изменяли и отдельную приёмку выравнивания не выдавали.

Следующий шаг — RESET: BC4-105/106 восстановить исходный Graphic без подмены; BC4-107/108 выключить Bottom в исходном Content. Это проверит исчезновение swap, UNKNOWN чужой области и неприменимость placeholder при выключенном Bottom. Разрешённый видимый Link ожидает своего зависимого контракта и здесь не принимается.

Полный контракт остаётся Draft. Отрицательная часть принята только для двух указанных механизмов; цикл ожидает четыре RESET. Неточная диагностика скрытого Title относится к предыдущей открытой задаче и этим прогоном не исправлена.

Доказательства: [composition-swap-placeholder-negative-live-review.r5.2026-10-10.json](composition-swap-placeholder-negative-live-review.r5.2026-10-10.json). [Условия и RESET](composition-swap-placeholder-tests.r5.md).
