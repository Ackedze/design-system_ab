# Slider r1 — Draft

Draft для проверки Figma на существующем Core. Поставка Proxy: **PENDING_CAPACITY**. Пользовательский прогон Apollo не выполнен.

Общее: выделять конкретный INSTANCE по ссылке, источник — соответствующий Draft r1. Число ниже относится только к правилам этого контракта.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [SL-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75749) | Slider; {"Size":"2","Mode":"Single","Pips":"False","Dots":"False"}; 2 / Single · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SL-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73034) | Slider; {"Size":"4","Mode":"Range","Pips":"True","Dots":"True"}; 4 / Range / Pips + Dots · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SL-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73319) | Slider_Inverted; {"Size":"4","Mode":"Range","Pips":"False","Dots":"True"}; Inverted / 4 / Range / Dots · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SL-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73406) | Slider; {"Size":"2","Mode":"Single","Pips":"False","Dots":"False"}; Opacity корня 55% · 1 | 1 нарушений; component:web-core.slider.layer-properties-use-effective-baseline.1.13 |
| [SL-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-74363) | Slider; {"Size":"2","Mode":"Single","Pips":"False","Dots":"False"}; Padding top у Line +3 px · 1 | 1 нарушений; component:web-core.slider.layer-properties-use-effective-baseline.1.2 |
| [SL-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-74372) | Slider; {"Size":"4","Mode":"Single","Pips":"True","Dots":"False"}; Opacity первой подписи Pips 55% · 1 | 1 нарушений; component:web-core.slider.layer-properties-use-effective-baseline.1.13 |

[Coverage](coverage-map.json) · [Eval](eval.json) · [Verification](verification.json)
