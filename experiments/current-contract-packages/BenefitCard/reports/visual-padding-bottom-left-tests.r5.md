# BenefitCard r5 — bottom/left padding

Предыдущий цикл BC4-401–404 закрыт: четыре целевых отрицательных прогона и четыре RESET приняты по [receipt](visual-padding-top-right-cycle-live-review.r5.2026-10-10.json). Следующие четыре мутации сверены независимым чтением Figma 10.10.2026; живой Editor-прогон ещё ожидается.

Используй текущий корневой `BenefitCard.component-contract.zip`, revision=5. Выбирай именно корневой instance по ссылке из таблицы. Отступы уже изменены; перед отрицательным прогоном ничего менять не нужно.

Общие параметры: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. В Editor всегда `CardPlacement=single`; `ViewportClass` указан в таблице.

Полный префикс RuleID: `component:web.benefit-card.visuals-follow-effective-baseline`. В таблице дан его суффикс.

| Кейс | ViewportClass | Подготовленная мутация | Суффикс RuleID | Значение для RESET |
| --- | --- | --- | --- | --- |
| [BC4-405](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100310) | `desktop` | Padding bottom: 32 → 36 | `.1.3` | 32 |
| [BC4-406](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100335) | `mobile-web` | Padding bottom: 20 → 24 | `.1.3` | 20 |
| [BC4-407](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100361) | `desktop` | Padding left: 32 → 36 | `.1.4` | 32 |
| [BC4-408](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100386) | `mobile-web` | Padding left: 20 → 24 | `.1.4` | 20 |

Для каждого кейса выполни две проверки:

1. Проверь подготовленный instance и выгрузи отрицательный JSON-отчёт. Ожидается violation целевого RuleID на корне.
2. Верни только проверяемый padding к значению из последнего столбца. Сохрани public parameters, explicit context и высоту Hug. Повтори проверку и выгрузи RESET JSON-отчёт. Целевая проверка должна стать compliant.

Сохрани восемь отчётов в папку BenefitCard. Порядок выгрузки свободный: соответствие устанавливается по physical root, context и фактам, а не по имени кейса. Дополнительные нарушения фиксируются отдельно.

Подготовка: [read-only Figma preflight](visual-padding-bottom-left-preflight.r5.2026-10-10.json). Все четыре roots имеют подтверждённые публичные component keys, native VARIANT parameters, один изменённый padding и Hug. Остальные три padding каждого root совпадают с библиотечным мастером.

Нормы, ZIP и статусы правил не менялись; полный контракт остаётся Draft.
