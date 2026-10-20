# IconView r8: уточнение Shape=false

Пакет: `IconView.r8.candidate.component-contract.zip`, Draft. Проверка в Editor в режиме «Проверить инстанс». Первые семь native-кейсов r7 сохранены как scoped evidence и дополнительно проверены replay на r8; повтор не требуется. Старый IV-QA-08 с двумя активными аддонами был ошибочно положительным: его raw-отчёт и закрытые receipts остаются неизменными.

Все три состояния проверяются на одном экземпляре: Size=64, Shape=false, Border=false, Content=true, Text=false, BgImg=false, BgColor=true. Менять boolean-параметры на корне. После каждого состояния сохранить отдельный отчёт.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [IV-QA-08: два аддона](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-69088) | TopAddon=true, BottomAddon=true, Indicator=false. Это исходное состояние кейса. | 2 нарушения: TopAddon (.1.1), BottomAddon (.1.2). |
| [IV-QA-08: RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-69088) | TopAddon=false, BottomAddon=false, Indicator=false. | 0 нарушений; обе ошибки исчезают. |
| [IV-QA-08: индикатор](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-69088) | TopAddon=false, BottomAddon=false, Indicator=true. | 1 нарушение: Indicator (.1.3). |

Общий префикс compiled RuleID: `component:web-core.icon-view.shape-false-disables-addons-and-indicator`. Ожидаемые полные ID: `component:web-core.icon-view.shape-false-disables-addons-and-indicator.1.1`, `component:web-core.icon-view.shape-false-disables-addons-and-indicator.1.2`, `component:web-core.icon-view.shape-false-disables-addons-and-indicator.1.3`.

Свежие native-прогоны r8: `NOT_RUN_USER_ONLY`. Техническая компиляция, ZIP/reopen, replay и synthetic PASS не меняют Draft/Ready. Canvas и старые кейсы не изменялись. После третьего состояния можно выключить Indicator для чистого рабочего экземпляра; дополнительный отчёт RESET не требуется для уже проверенного механизма.
