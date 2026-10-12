# BenefitCard r5 · Title и Graphic скрыты

**4/4 целевых отрицательных кейса подтверждены.** В BC4-101/102 сработала обязательность видимого Title; в BC4-103/104 — обязательность видимого Graphic. Каждая проверка содержит ровно одно нарушение, без human-review и неожиданных нарушений. Платформа и Hug проходят. Exact engine/Editor replay четырёх captures совпал; hashes проверены, capture complete, warnings=0, девять targets resolved. Нормы, ZIP и Draft-статусы сохранены.

| Кейс | Платформа | Целевой RuleID | Результат |
| --- | --- | --- | --- |
| [BC4-101](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66653) | desktop | component:web.benefit-card.title-required.1.1 | violation: 0 видимых элементов |
| [BC4-102](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66678) | mobile-web | component:web.benefit-card.title-required.1.1 | violation: 0 видимых элементов |
| [BC4-103](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66704) | desktop | component:web.benefit-card.graphic-required.1.1 | violation: 0 видимых элементов |
| [BC4-104](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66729) | mobile-web | component:web.benefit-card.graphic-required.1.1 | violation: 0 видимых элементов |

**Отдельный пробел диагностики Editor:** у скрытого Title оба IR лимита текста дают not-applicable, но сводка добавляет not-executed с сообщением «Целевой слой не найден». Target фактически присутствует, resolved и доказанно скрыт. Поэтому BC4-101/102 имеют четыре notExecuted, а BC4-103/104 — три. Этот пробел зафиксирован в парном бэклоге Editor/Apollo; целевая обязательность работает. Исправление не должно скрывать настоящие missing/unresolved/foreign/stale gaps.

**Следующий шаг — RESET на этих же четырёх экземплярах.** В BC4-101/102 включить видимость вложенного TEXT Title (слой value внутри Title); в BC4-103/104 — самого instance Graphic. Остальные свойства и контекст сохраняются: desktop/mobile-web соответственно, CardPlacement=single, корень Hug, Left/Vertical/Background=True/Compact=False. Проверять корень карточки. Обе required checks должны стать compliant с count=1, целевое нарушение исчезнуть.

Отрицательная часть принята только в указанной области. RESET, полный компонент, зависимости, Source Reviewed/Ready и установленный Apollo остаются открытыми. Raw copies сохранены с SHA в reports/live-captures.

Доказательства: [composition-visibility-negative-live-review.r5.2026-10-09.json](composition-visibility-negative-live-review.r5.2026-10-09.json). [Условия тестов](composition-visibility-tests.r5.md).
