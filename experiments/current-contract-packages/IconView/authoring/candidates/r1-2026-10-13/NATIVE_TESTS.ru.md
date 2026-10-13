# Первые проверки IconView r1

Загрузить `IconView.r1.candidate.component-contract.zip` в Editor0.2.104. Вкладка «Проверка», Product → «Альфа-Бизнес · ab», режим → «Аудит компонента». Проверять выбранный instance по ссылке; статусы правил не менять.

Общие параметры: Shape,BgColor,Border,Content=true; BgImg,Text,TopAddon,BottomAddon,Indicator=false; opacity100%. Исходные библиотечные цвета и вложенные варианты сохранены.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [IV1-P01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13840-68046) | Size=64,64×64 |0 исполняемых нарушений; context-only пробелы остаются |
| [IV1-P02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13840-68079) | Size=48,48×48 |0 исполняемых нарушений; context-only пробелы остаются |

Скачать по одному отчёту каждого запуска. Это проверка новой привязки, не окончательная приёмка всего контракта. Мутации и RESET назначаются после baseline; восстановление использует тот же конкретный instance. Точные ожидаемые IR и дальнейшие этапы — `native-case-matrix.json`.
