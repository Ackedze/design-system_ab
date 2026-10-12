Link r3, Editor 0.2.100, «Проверить инстанс», representation `core.web.link.figma.universal`. Выделяй корень Link. Size=`M (16-24)`, Line=`Solid`, оба Addon=`true`. Отрицательные изменения подготовлены в лабораторных fixtures; проверь указанное значение перед запуском. Во всех четырёх captures ожидаем 8 resolved, 0 inconclusive, 3 context-only. После каждой строки отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68029) | Корень Link → padding left=`7` | 1 нарушение padding left |
| [LINK-10 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68029) | На том же экземпляре padding left=`0` | 0 нарушений |
| [LINK-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68049) | Корень Link → opacity=`50%` | 1 нарушение opacity |
| [LINK-11 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68049) | На том же экземпляре opacity=`100%` | 0 нарушений |

RuleID padding left: `component:web-core.link.layer-properties-use-effective-baseline.1.5`.
RuleID opacity: `component:web-core.link.layer-properties-use-effective-baseline.1.12`.
