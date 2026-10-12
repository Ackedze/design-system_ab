# BenefitCard r5 — смена шрифта Title

Цикл добавления и удаления тени закрыт: [два отрицательных прогона и два RESET приняты](visual-effects-cycle-live-review.r5.2026-10-10.json). Типографические сравнения прошли [32 автоматические проверки](visual-typography-offline-review.r5.2026-10-10.md). Следующий ручной блок проверяет фактическое чтение изменённого fontName на desktop и mobile-web.

Используй текущий `BenefitCard.component-contract.zip`, revision=5. В Figma на обоих кейсах шрифт текста Title уже заменён на Alfa Interface Sans Regular. Перед отрицательным прогоном менять ничего не требуется; для проверки в Editor выбирай корень карточки по ссылке.

Общие параметры: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. В Editor всегда `CardPlacement=single`.

| Кейс | ViewportClass | Подготовленная мутация на Title | RESET fontName |
| --- | --- | --- | --- |
| [BC4-425](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100820) | `desktop` | Alfa Interface Sans Regular | Alfa Interface Sans **Bold** |
| [BC4-426](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100845) | `mobile-web` | Alfa Interface Sans Regular | Alfa Interface Sans **Medium** |

Целевой RuleID: `component:web.benefit-card.visuals-follow-effective-baseline.1.13`.

Для каждого кейса выгрузи отрицательный отчёт: ожидается violation указанного RuleID на TEXT Title. Затем в Figma выбери вложенный текст Title и верни fontName из последнего столбца. Сохрани размер, lineHeight, letterSpacing, текст, остальные настройки и Hug. Снова выбери корень для проверки в Editor и выгрузи RESET; целевая проверка должна стать compliant. Можно сразу передать четыре отчёта.

Источники подготовки разделены: [Figma readback](visual-font-name-preflight.r5.2026-10-10.json) подтверждает мутации, TEXT IDs и параметры корней; значения RESET взяты из независимо сопоставленного baseline двух свежих live captures, закреплённых в [offline receipt](visual-typography-offline-review.r5.2026-10-10.json). Новый прямой readback Title внутри root master не заявляется: список совпадений lineage там пуст.

Полный компонент остаётся Draft. Нормы, ZIP и статусы правил не менялись.
