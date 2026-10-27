# SegmentedControl r1 — Draft

Draft для проверки Figma на существующем Core. Поставка Proxy: **PENDING_CAPACITY**. Пользовательский прогон Apollo не выполнен.

Общее: выделять конкретный INSTANCE по ссылке, источник — соответствующий Draft r1. Число ниже относится только к правилам этого контракта.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [SG-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72986) | SegmentedControl_32; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; 32 / 2 / Fill · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-73247) | SegmentedControl_40; {"Shape":"Rounded","Capacity":"3","Resize":"Hug"}; 40 / 3 / Rounded / Hug, выбран второй · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-73538) | SegmentedControl_48; {"Shape":"Rounded","Capacity":"5","Resize":"Fill"}; 48 / 5 / Rounded · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-74799) | SegmentedControl_Muted_32; {"Shape":"Rectangular","Capacity":"4","Resize":"Hug"}; Muted32 / 4 / Hug · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75093) | SegmentedControl_Muted_40; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; Muted40 / 2 · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75347) | SegmentedControl_Muted_48; {"Shape":"Rounded","Capacity":"3","Resize":"Fill"}; Muted48 / 3 / Rounded · 0 | 0 нарушений; все правила применимого контура соблюдены |
| [SG-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75409) | SegmentedControl_40; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; Два Selected=True · 1 | 1 нарушений; component:web-core.segmented-control.single-selected.capacity-2.1.1 |
| [SG-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75458) | SegmentedControl_40; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; Нет Selected=True · 1 | 1 нарушений; component:web-core.segmented-control.single-selected.capacity-2.1.1 |
| [SG-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75487) | SegmentedControl_40; {"Shape":"Rectangular","Capacity":"3","Resize":"Fill"}; Подпись из трёх слов · 1 | Известный пробел: норма сохранена, проверка не подключена; не приёмочный кейс |
| [SG-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75545) | SegmentedControl_40; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; Opacity корня 55% · 1 | 1 нарушений; component:web-core.segmented-control.layer-properties-use-effective-baseline.1.13 |
| [SG-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75566) | SegmentedControl_40; {"Shape":"Rectangular","Capacity":"2","Resize":"Fill"}; Объект внутри Slot аддона · 0 | 0 нарушений; все правила применимого контура соблюдены |

[Coverage](coverage-map.json) · [Eval](eval.json) · [Verification](verification.json)
