Link r3 / Editor 0.2.100, «Проверить инстанс», representation core.web.link.figma.universal. Size=M (16-24), Line=Solid, оба Addon=true; выделяй корень Link. Отрицательные fixtures уже подготовлены. Ожидаем 8 resolved, 0 inconclusive, 3 context-only во всех captures. После каждой строки отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-14](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68109) | Заливка корня включена | 1 нарушение заливки |
| [LINK-14 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68109) | Сбросить override заливки до эталона: выключена | 0 нарушений |
| [LINK-16](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68149) | Label → letter spacing=0 | 1 нарушение letter spacing |
| [LINK-16 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68149) | Label → letter spacing=−0.24px | 0 нарушений |

RuleID заливки: component:web-core.link.root-fill-baseline.1.1. RuleID letter spacing: component:web-core.link.label-typography.1.4.
