# BenefitCard r5 — эффекты

Предыдущий цикл заливок/обводок BC4-413–416 закрыт: [четыре отрицательных прогона и четыре RESET приняты](visual-paints-resets-live-review.r5.2026-10-10.json). Следующий блок — два корня с добавленным DROP_SHADOW. Состояние сверено чтением Figma 10.10.2026; у обоих библиотечных мастеров effects=[] и effectStyleId пуст.

Используй текущий `BenefitCard.component-contract.zip`, revision=5. Выбирай именно корневой instance по ссылке. Тень уже добавлена; перед отрицательным прогоном менять ничего не требуется.

Параметры: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. В Editor всегда `CardPlacement=single`; ViewportClass указан в таблице.

| Кейс | ViewportClass | Подготовленная мутация | RESET |
| --- | --- | --- | --- |
| [BC4-421](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100718) | `desktop` | На корне добавлен DROP_SHADOW | Удалить добавленную тень; effects=[] |
| [BC4-422](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100743) | `mobile-web` | На корне добавлен DROP_SHADOW | Удалить добавленную тень; effects=[] |

Целевой RuleID: `component:web.benefit-card.visuals-follow-effective-baseline.1.11`.

Для каждого кейса выгрузи отрицательный отчёт: ожидается violation целевого RuleID на корне. Затем удали только добавленную тень, сохрани параметры, Hug и explicit context и выгрузи RESET. Целевая проверка должна стать compliant. Можно сразу выгрузить все четыре отчёта в папку BenefitCard.

Подготовка: [read-only Figma preflight](visual-effects-preflight.r5.2026-10-10.json). Это проверка добавленного DROP_SHADOW; прочие формы эффекта и варианты компонента не получают автоматическую приёмку. Нормы и ZIP не менялись; полный контракт остаётся Draft.
