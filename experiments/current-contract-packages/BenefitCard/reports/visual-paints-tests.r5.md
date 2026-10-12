# BenefitCard r5 — заливки и обводки

Четыре кейса сверены чтением Figma 10.10.2026. На корне каждого добавлен ровно один paint; у соответствующего библиотечного мастера массив пуст. Полные source/IR RuleID указаны в подписи. Ручной прогон Editor пока ожидается.

Используй текущий корневой `BenefitCard.component-contract.zip`, revision=5. Выбирай именно корневой BenefitCard по ссылке. Мутации уже выставлены.

Параметры Figma: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. В Editor всегда `CardPlacement=single`; `ViewportClass` указан в таблице.

Префикс целевого RuleID: `component:web.benefit-card.visuals-follow-effective-baseline`.

| Кейс | ViewportClass | Мутация на корне | Суффикс RuleID |
| --- | --- | --- | --- |
| [BC4-413](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100514) | `desktop` | Fill: один добавленный paint | `.1.7` |
| [BC4-414](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100539) | `mobile-web` | Fill: один добавленный paint | `.1.7` |
| [BC4-415](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100565) | `desktop` | Stroke: один добавленный paint | `.1.8` |
| [BC4-416](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100590) | `mobile-web` | Stroke: один добавленный paint | `.1.8` |

Для каждого кейса проверь мутацию и сохрани отрицательный JSON-отчёт. Ожидается violation указанного RuleID на корне. Затем удали только добавленную заливку или обводку корня: соответствующий массив должен снова стать пустым. Сохрани остальные параметры и высоту Hug, повтори проверку и выгрузи RESET. Целевой RuleID должен стать compliant.

Можно сразу выгрузить все восемь отчётов; соответствие определяется по physical root/context/facts. Дополнительные нарушения фиксируются отдельно.

Подготовка: [Figma preflight](visual-paints-preflight.r5.2026-10-10.json). Числовые механизмы отдельно проверены [автоматически](visual-scalars-offline-review.r5.2026-10-10.md). Полный компонент остаётся Draft.
