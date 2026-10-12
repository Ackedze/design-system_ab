Пакет Link r3, Editor 0.2.100, режим «Проверить инстанс», representation `core.web.link.figma.universal`. Size=`M (16-24)`, оба Addon=`true`. Line меняется у вложенного Underline через component property. После каждой строки отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67968) | Underline → Line=`Pseudo` | Допустимое значение: 0 violations, 0 inconclusive, 8 resolved, 3 context-only not-executed |
| [LINK-07 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67968) | На том же Link вернуть Underline → Line=`Solid` | 0 violations, 0 inconclusive, 8 resolved, 3 context-only not-executed |

Целевая проверка: `component:web-core.link.underline-domain.1.1`. Это следующий ещё не выполненный scope; результаты не объявлены заранее принятыми.
