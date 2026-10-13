# BenefitCard r7: CardPlacement подтверждён

Оба отчёта Editor 0.2.104 / manual r7 воспроизводятся byte-equivalent.

| Компонент | Фактические параметры | Результат |
| --- | --- | --- |
| [Mobile](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | ViewportClass=mobile-web, CardPlacement=single, высота HUG | vertical-resizing-policy.1.1 — Compliant |
| [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | ViewportClass=desktop, CardPlacement=single, высота HUG | vertical-resizing-policy.1.1 — Compliant |

Принята только положительная проверка Hug на D/M. Три Link usage нормы остаются human-review / UNKNOWN в каждом отчёте: child target.label=reference-pin-stale. Встроенная библиотечная Link имеет 3 Size и не имеет двух портов иконок 20 px; pinned reference r5 содержит 4 Size и эти порты.

Эта сверка закрывает отсутствие CardPlacement в предыдущих двух baseline. Выбор нормативного источника Link остаётся pending; dependency/native negative/RESET и полный Ready не приняты. Editor/shared core/v4 и Figma не изменены.
