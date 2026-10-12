# BenefitCard r5 верхний и правый padding

Четыре отрицательных кейса подготовлены и сверены чтением Figma 10.10.2026. Меняется только один padding корня: desktop с 32 до 36, mobile-web с 20 до 24. Остальные padding совпадают с независимо прочитанным библиотечным мастером. Корни видимы, имеют правильные публичные ключи и сохраняют высоту Hug. В подписи каждого кейса есть полная норма и целевой RuleID. Это подготовка экземпляров; живой прогон Editor ещё не принят.

Загрузи текущий `BenefitCard.component-contract.zip`, revision=5. Выбирай корневой instance соответствующего кейса. Подготовленные изменения уже выставлены; перед прогоном ничего менять не требуется.

Общие параметры Figma: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. В Editor для всех кейсов `CardPlacement=single`; `ViewportClass` возьми из таблицы. Ширина самого instance не заменяет viewport.

| Кейс | ViewportClass | Подготовленная мутация | Целевой RuleID |
| --- | --- | --- | --- |
| [BC4-401](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100208) | `desktop` | Padding top 32 → 36 | `component:web.benefit-card.visuals-follow-effective-baseline.1.1` |
| [BC4-402](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100233) | `mobile-web` | Padding top 20 → 24 | `component:web.benefit-card.visuals-follow-effective-baseline.1.1` |
| [BC4-403](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100259) | `desktop` | Padding right 32 → 36 | `component:web.benefit-card.visuals-follow-effective-baseline.1.2` |
| [BC4-404](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100284) | `mobile-web` | Padding right 20 → 24 | `component:web.benefit-card.visuals-follow-effective-baseline.1.2` |

Ожидается violation указанного RuleID на корне. Другие результаты фиксируются отдельно; общее число ошибок не задаётся. После каждого прогона выгрузи JSON-отчёт в папку BenefitCard. RESET подготовим после приёмки отрицательной части; он должен вернуть только изменённый padding к независимому эталону и сохранить высоту Hug.

Подготовка: [read-only Figma preflight](visual-padding-preflight.r5.2026-10-10.json). Нормы и ZIP не менялись; полный контракт остаётся Draft.
