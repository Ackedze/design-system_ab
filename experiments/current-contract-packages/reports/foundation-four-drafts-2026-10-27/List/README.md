# List r1 — Draft

Draft для проверки Figma на существующем Core. Поставка Proxy: **PENDING_CAPACITY**. Пользовательский прогон Apollo не выполнен.

Общее: выделять конкретный INSTANCE по ссылке, источник — соответствующий Draft r1. Число ниже относится только к правилам этого контракта.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [LI-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72736) | List; {"Caption":"False"}; Caption=False, свой текст · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [LI-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72738) | List; {"Caption":"True"}; Caption=True, свои две подписи · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [LI-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72749) | List; {"Caption":"False"}; Opacity корня 55% · 1 | 1 нарушений; component:web-core.list.layer-properties-use-effective-baseline.1.13 |
| [LI-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72757) | List; {"Caption":"True"}; Opacity вложенного Text 55% · 1 | 1 нарушений; component:web-core.list.layer-properties-use-effective-baseline.1.13 |

[Coverage](coverage-map.json) · [Eval](eval.json) · [Verification](verification.json)
