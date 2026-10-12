# BenefitCard r5 · подмена Graphic и placeholder Bottom

Отрицательная часть принята: **4/4 целевых нарушения**, exact engine/Editor replay совпал. Отчёты Editor 0.2.98 получены 10.10.2026 в 01:25 по Москве (09.10.2026 22:25 UTC). В подменённой области Graphic остаются UNKNOWN без независимого baseline; у видимого SwapMe дополнительно срабатывает LEFT против CENTER служебного текста. [Разбор результатов](composition-swap-placeholder-negative-live-review.r5.2026-10-10.md).

**4/4 RESET приняты; цикл закрыт.** В отчётах 10.10.2026 01:32–01:33 по Москве восстановлены исходные Graphic, выключен Bottom; целевых и дополнительных нарушений, UNKNOWN и capture warnings нет. Восемь отрицательных/reset captures повторно исполнены в engine и Editor report layer с совпадающими результатами. [Закрытие цикла](composition-swap-placeholder-resets-live-review.r5.2026-10-10.md). Таблица RESET сохраняет условия воспроизведения; повторять этот цикл сейчас не требуется.

Четыре отрицательных кейса сверены чтением Figma 10.10.2026. В BC4-105/106 Graphic заменён чужим instance: внутри desktop стоит mobile BenefitCard, внутри mobile — desktop BenefitCard. В BC4-107/108 Bottom включён, эффективно видим и имеет `Presets=SwapMe`. Корни сохраняют публичные ключи BenefitCard, Hug и параметры Left/Vertical/Background=True/Compact=False. Подписи каждого кейса содержат полную норму и RuleID. Это подтверждение подготовки борда, а не исполнения правил в Editor.

В Editor загрузи текущий `BenefitCard.component-contract.zip`, revision=5. Проверяй **корневой instance карточки**, сохраняя подготовленные изменения в Figma. Во всех четырёх случаях `CardPlacement=single`.

| Кейс | ViewportClass в Editor | Подготовленное изменение | Целевое нарушение |
| --- | --- | --- | --- |
| [BC4-105](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66755) | `desktop` | Graphic заменён чужим instance | `component:web.benefit-card-content-is-closed.1.1` |
| [BC4-106](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66800) | `mobile-web` | Graphic заменён чужим instance | `component:web.benefit-card-content-is-closed.1.1` |
| [BC4-107](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66846) | `desktop` | Bottom включён, `Presets=SwapMe` | `component:web.benefit-card-bottom-content-link-only.1.1` |
| [BC4-108](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66871) | `mobile-web` | Bottom включён, `Presets=SwapMe` | `component:web.benefit-card-bottom-content-link-only.1.1` |

## Восстановление после отрицательных проверок

Используй те же четыре корневых instance. Сохрани `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высоту Hug и `CardPlacement=single`. Сбрасывай только указанную мутацию; общий Reset корня может вернуть библиотечный режим высоты и затронуть другие условия.

| Кейс | Действие RESET | ViewportClass | Целевой результат |
| --- | --- | --- | --- |
| [BC4-105](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66755) | Сбрось instance swap в GraphicContainer до исходного `[D] Graphic` | `desktop` | `content-is-closed.1.1` — compliant; Graphic и Image снова разрешаются, UNKNOWN чужой области исчезают |
| [BC4-106](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66800) | Сбрось instance swap в GraphicContainer до исходного `[M] Graphic` | `mobile-web` | `content-is-closed.1.1` — compliant; Graphic и Image снова разрешаются, UNKNOWN чужой области исчезают |
| [BC4-107](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66846) | Выключи `Bottom` у вложенного `Content`; `Presets=SwapMe` можно сохранить скрытым | `desktop` | `bottom-content-link-only.1.1` — notApplicable; нарушения видимого placeholder и его CENTER исчезают |
| [BC4-108](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66871) | Выключи `Bottom` у вложенного `Content`; `Presets=SwapMe` можно сохранить скрытым | `mobile-web` | `bottom-content-link-only.1.1` — notApplicable; нарушения видимого placeholder и его CENTER исчезают |

Разрешённый видимый Link и его внутренние правила требуют отдельного Link closure; восстановление здесь проверяет выключение Bottom, а не готовность Link. Следующие подготовленные проверки — [верхний и правый padding D/M](visual-padding-tests.r5.md).

Подготовка: [Figma readback](composition-swap-placeholder-preflight.r5.2026-10-10.json). Полный контракт остаётся Draft.
