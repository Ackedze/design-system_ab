# SelectWithTags · Draft r1

Компоненты уже настроены. Выбери в Apollo платформу экземпляра и запусти проверку конкретного INSTANCE по ссылке. Число в последнем столбце относится к локальным правилам этого контракта; общие проверки и непроверенные private-детали учитываются отдельно.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [ST-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77976) | [D] SelectWithTags; Size=48, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=False | 0 |
| [ST-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78016) | [D] SelectWithTags_Inverted; Size=72, FilledState=True, ActiveState=False, DisabledState=False, ErrorState=False | 0 |
| [ST-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78056) | [M] SelectWithTags; Size=56, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=False | 0 |
| [ST-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78096) | [M] SelectWithTags_Inverted; Size=64, FilledState=True, ActiveState=False, DisabledState=False, ErrorState=False | 0 |
| [ST-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78136) | [D] SelectWithTags; Size=56, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=True; ErrorMessage=false при ErrorState=True | 1 — `component:web-core.select-with-tags.error-message-required.1.1` |
| [ST-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78176) | [D] SelectWithTags; Size=56, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=False; Скрыты Arrow_Down / Arrow_Up | 1 — `component:web-core.select-with-tags.chevron-required.1.1` |
| [ST-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78216) | [M] SelectWithTags; Size=48, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=False; Opacity=55% | 1 — `component:web-core.select-with-tags.layer-properties-use-effective-baseline.1.13` |
| [ST-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-78256) | [D] SelectWithTags; Size=56, FilledState=False, ActiveState=False, DisabledState=False, ErrorState=False; Подготовленный произвольный FRAME внутри native Slot · Field / LeftAddons / LeftAddon1 / Slot | 0 |

Границы Draft: USER_NATIVE_ACCEPTANCE; CONTEXT_AND_INTERACTIVITY; PRIVATE_PART_DEPENDENCIES; SOURCE_TRAVERSAL_READ_ONLY_REFUSAL; NESTED_TAG_NORMS; ERROR_MESSAGE_TEXT_CONTENT.

Ручные Apollo-прогоны: `NOT_RUN_USER_ONLY`. Установка и публикация не выполнялись.
