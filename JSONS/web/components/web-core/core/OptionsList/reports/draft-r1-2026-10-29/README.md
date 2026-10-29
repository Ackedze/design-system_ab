# OptionsList · Draft r1

Компоненты уже настроены. Выбери в Apollo платформу экземпляра и запусти проверку конкретного INSTANCE по ссылке. Число в последнем столбце относится к локальным правилам этого контракта; общие проверки и непроверенные private-детали учитываются отдельно.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [OL-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77877) | [D] OptionList; FixedHeight=True | 0 |
| [OL-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77888) | [D] OptionListCell; LeftControl=True, RightControl=False | 0 |
| [OL-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77897) | [M] OptionListCell; LeftControl=True, RightControl=False | 0 |
| [OL-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77906) | [D] OptionListHeader;  | 0 |
| [OL-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77914) | [M] OptionListHeader;  | 0 |
| [OL-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77922) | [D] OptionListFooter;  | 0 |
| [OL-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77930) | [D] OptionListGroupTitle;  | 0 |
| [OL-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77934) | [M] OptionListGroupTitle;  | 0 |
| [OL-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77938) | [D] OptionListEmptyState;  | 0 |
| [OL-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77942) | [M] OptionListEmptyState;  | 0 |
| [OL-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77946) | [D] OptionList; FixedHeight=False; Подготовленный произвольный FRAME внутри native Slot · Body | 0 |
| [OL-12](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77961) | [D] OptionList; FixedHeight=True; Opacity=55% | 1 — `component:web-core.options-list.layer-properties-use-effective-baseline.1.13` |
| [OL-13](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77970) | [M] OptionListCell; LeftControl=False, RightControl=False; Opacity=55% | 1 — `component:web-core.options-list.layer-properties-use-effective-baseline.1.13` |

Границы Draft: USER_NATIVE_ACCEPTANCE; CONTEXT_AND_INTERACTIVITY; PRIVATE_PART_DEPENDENCIES; HUB_SCROLLBAR_API_DRIFT.

Ручные Apollo-прогоны: `NOT_RUN_USER_ONLY`. Установка и публикация не выполнялись.
