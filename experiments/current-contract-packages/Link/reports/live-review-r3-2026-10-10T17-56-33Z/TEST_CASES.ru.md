Link r3, Editor 0.2.100, «Проверить инстанс», representation `core.web.link.figma.universal`. Выделяй корень Link. Size=`M (16-24)`, оба Addon=`true`. Fixture LINK-08 подготовлен как синяя ссылка вне абзаца. Line меняется у вложенного Underline. После каждой строки отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67989) | Underline → Line=`None` | Чтение допустимого значения: 0 violations, 0 inconclusive, 8 resolved; 3 context-only not-executed |
| [LINK-08 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67989) | На том же экземпляре вернуть Line=`Solid` | 0 violations, 0 inconclusive, 8 resolved; 3 context-only not-executed |

Проверяем `component:web-core.link.underline-domain.1.1`. Требование к цвету и месту использования `component:web-core.link.underline-none-context` пока context-only; эти два captures не объявляются его автоматической приёмкой.
