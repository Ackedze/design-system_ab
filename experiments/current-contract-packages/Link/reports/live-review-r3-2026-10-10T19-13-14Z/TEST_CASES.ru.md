Link r3 / Editor 0.2.100, «Проверить инстанс». Size=M (16-24), Line=Solid, оба Addon=true; Label=Открыть подробные условия (текущий текст, 24 символа). Выделяй корень Link. Чистое начальное состояние уже подтверждено последним отчётом. Меняй указанные поля вручную; не сбрасывай весь экземпляр. Каждая строка — отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-05 · нарушение](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | У текстового слоя Label: fontSize=18, letter spacing=0 px; публичный Label оставить текущим | 2 нарушения: fontSize и letter spacing |
| [LINK-05 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | У текстового слоя вернуть fontSize=16 и letter spacing=−0.24 px; текст не менять | 0 нарушений, тот же custom Label |

Целевые RuleID: component:web-core.link.label-typography.1.2 и component:web-core.link.label-typography.1.4. В обоих прогонах ожидаем 8 targets resolved, 0 inconclusive, 3 известных context-only. RESET должен сохранять тот же публичный Label непосредственно в своём отчёте. Текст >32 символов, icon swaps/height и остальные открытые области этим циклом не покрываются. Статус этих новых шагов NOT_RUN_USER_ONLY.
