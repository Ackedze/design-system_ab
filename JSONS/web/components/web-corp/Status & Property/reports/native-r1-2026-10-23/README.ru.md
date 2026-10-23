# Status & Property r1 — нативный прогон владельца

Пакет68179d13 загружен через Git. Локальные ожидаемые нарушения совпали во всех12случаях; это не полная приёмка контракта.

| Компонент | Ожидали нарушений | Получили | UNKNOWN локальных правил |
| --- | --- | --- | --- |
| [SP-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71188) | 0 | 0 | 0 |
| [SP-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71196) | 0 | 0 | 0 |
| [SP-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71204) | 0 | 0 | 0 |
| [SP-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71325) | 0 | 0 | 0 |
| [SP-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71335) | 1 | 1 | 3 |
| [SP-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71345) | 1 | 1 | 3 |
| [SP-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71357) | 1 | 1 | 2 |
| [SP-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71366) | 1 | 1 | 2 |
| [SP-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71377) | 1 | 1 | 0 |
| [SP-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71385) | 1 | 1 | 0 |
| [SP-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71393) | 1 | 1 | 0 |
| [SP-12](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71403) | 1 | 1 | 0 |

Вложенный Core Status дополнительно проверен12раз:19findings(17fill,2typography),140UNKNOWN. На эталонномSP01 parentbaseline и actualfill совпадают, но отдельный childaudit ожидает базовый синийCore. Это подтверждённая потеря контекста Corp в данном отдельном childbaseline. Две typography diagnostics отдельно не приняты как ошибки дизайнера.

Вся область:35discovered=24checked+10governed+1notCheckedLabel;6warnings. Общий результат Partial, Ready=false.11исходных контекстных/зависимых норм остаются неисполняемыми. Повторять12ручных настроек не нужно; сохранённый отчёт — вход для дальнейшего разбора. Нормы, движок, source/build и установленные данные не менялись.
