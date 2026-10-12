Link r3 / Editor 0.2.100, режим «Проверить инстанс», representation core.web.link.figma.universal. Size=M (16-24), Line=Solid, оба Addon=true. Выделяй корень Link. У Label исходные fontSize=16, lineHeight=24, letterSpacing=−0.24 px. Каждая строка — отдельный JSON; RESET на том же INSTANCE.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-05 · текст](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Через публичное поле Label: Открыть подробные условия обслуживания (38 символов); fontSize=16 | 0 нарушений |
| [LINK-05 · нарушение](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Сохранить этот Label; у текстового слоя Label поставить fontSize=18 | 1 нарушение fontSize |
| [LINK-05 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Вернуть только fontSize=16; Label оставить тем же | 0 нарушений |

Целевой compiled RuleID: component:web-core.link.label-typography.1.2. Во всех прогонах ожидаем 8 resolved, 0 inconclusive, 3 известных context-only. Не сбрасывай весь экземпляр: текст должен сохраниться. Эти шаги NOT_RUN_USER_ONLY; другие незапущенные кейсы остаются открытыми.
