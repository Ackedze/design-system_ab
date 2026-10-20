# IconView r7 — оставшиеся native проверки

Статус всех восьми кейсов: `NOT_RUN_USER_ONLY`. Импортировать ZIP r7 из этой папки. Текущий рабочий r6 в корне не заменён.

Общие параметры: Size=64, Shape=true, Border=false, Content=true, Text=false, BgImg=false, BgColor=true, Indicator=false, TopAddon=true, BottomAddon=true. В аддонах — обычные вложенные IconView; у их Shape и Border исходно Form=Circle. Это отдельные подготовленные экземпляры, повторять RESET после каждого не требуется.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [IV-QA-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68557) | Общие; все четыре Form=Circle | 0 нарушений; четыре новые Circle-проверки compliant |
| [IV-QA-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68632) | TopAddon → Shape → Form=Rectangle | 1: `component:web-core.icon-view.top-addon-shape-circle.1.1` |
| [IV-QA-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68708) | TopAddon → Border → Form=Rectangle | 1: `component:web-core.icon-view.top-addon-border-circle.1.1` |
| [IV-QA-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68785) | BottomAddon → Shape → Form=Superellipse | 1: `component:web-core.icon-view.bottom-addon-shape-circle.1.1` |
| [IV-QA-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68861) | BottomAddon → Border → Form=Superellipse | 1: `component:web-core.icon-view.bottom-addon-border-circle.1.1` |
| [IV-QA-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-68937) | TopAddon=false | 0 нарушений; две проверки TopAddon not-applicable, BottomAddon compliant |
| [IV-QA-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-69013) | BottomAddon=false | 0 нарушений; две проверки BottomAddon not-applicable, TopAddon compliant |
| [IV-QA-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14004-69088) | Shape=false, Border=false; оба аддона включены, Form=Circle | 0 нарушений; четыре проверки аддонов остаются активны независимо от Shape корня |

IV-QA-09–12 приняты в r6 по четырём отчётам от 15.10.2026; их повтор сейчас не назначается. Это переиспользованное evidence r6, а не новый native PASS r7. Сценарий замены TopAddon на Indicator и три его остаточных условия остаются отдельным неисполняемым контуром. Полный контракт Draft.
