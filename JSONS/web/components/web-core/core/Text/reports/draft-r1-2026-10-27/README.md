# Text r1 — Draft

Draft для проверки Figma на существующем Core. Поставка Proxy: **PENDING_CAPACITY**. Пользовательский прогон Apollo не выполнен.

Общее: выделять конкретный INSTANCE по ссылке, источник — соответствующий Draft r1. Число ниже относится только к правилам этого контракта.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [TX-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72720) | Text; {}; Своя подпись · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [TX-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72725) | Text; {}; Другой библиотечный Text Style · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [TX-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72730) | Text; {}; Detach Text Style · 1 | 1 нарушений; component:web-core.text.text-library-style.1.1 |
| [TX-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72726) | Text; {}; RGB без токена в тексте · 1 | 1 нарушений; component:web-core.text.text-color-token.1.1 |
| [TX-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72731) | Text; {}; Opacity корня 55% · 1 | 1 нарушений; component:web-core.text.layer-properties-use-effective-baseline.1.13 |

[Coverage](coverage-map.json) · [Eval](eval.json) · [Verification](verification.json)
