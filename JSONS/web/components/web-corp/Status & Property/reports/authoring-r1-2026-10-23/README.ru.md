# Status & Property r1 — первый Draft

4 публичных Corp-представления, 208 вариантов. 27 исходных норм сохранены; локально компилируются 15 IR. Контракт не Ready. Движок не изменялся.

## Проверка

Все кейсы подготовлены. Выбирайте по ссылке сам экземпляр, затем в Apollo указывайте соответствующую платформу. Style=Muted на белой поверхности во всех кейсах. Числа ниже — ожидаемые результаты собственных локальных правил пресета; не выполненный live-вердикт.

| Компонент | Платформа и параметры | Ожидаем |
| --- | --- | --- |
| [SP-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71188) | desktop; status; Size=20, Type=Approved | 0 |
| [SP-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71196) | desktop; property; Size=32, Color=Green | 0 |
| [SP-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71204) | mobile-web; status; Size=24, Type=Attention | 0 |
| [SP-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71325) | mobile-web; property; Size=40, Color=Blue | 0 |
| [SP-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71335) | desktop; status; Size=20, Type=Approved; Вложенный Status.Shape=Rectangular | 1 — `component:web-corp.status-property.shape-is-fixed-by-preset.1.2` |
| [SP-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71345) | mobile-web; property; Size=24, Color=Green; Root.Size=24; вложенный Status.Size=32 | 1 — `component:web-corp.status-property.nested-status-size-matches-preset.1.1` |
| [SP-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71357) | desktop; status; Size=24, Type=Approved; Label.Uppercase=False | 1 — `component:web-corp.status-property.case-is-fixed-by-platform.desktop.1.1` |
| [SP-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71366) | mobile-web; property; Size=20, Color=Green; Label.Uppercase=True | 1 — `component:web-corp.status-property.case-is-fixed-by-platform.mobile-web.1.1` |
| [SP-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71377) | desktop; status; Size=20, Type=Approved; Label скрыт | 1 — `component:web-corp.status-property.label-is-required.1.1` |
| [SP-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71385) | mobile-web; property; Size=24, Color=Green; Label пустой | 1 — `component:web-corp.status-property.label-is-required.nonempty.1.1` |
| [SP-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71393) | desktop; property; Size=20, Color=Green; Корень: ширина Fixed | 1 — `component:web-corp.status-property.hug-sizing-is-fixed.1.1` |
| [SP-12](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71403) | mobile-web; status; Size=20, Type=Approved; Opacity корня=50% | 1 — `component:web-corp.status-property.preset-root-visuals-follow-effective-baseline.1.3` |

## Явные пробелы

Core Status r2 остаётся Draft. Текущий runtime требует Ready дочерние контракты, поэтому runtime-зависимость не встроена; точные предложенные bindings/hash сохранены в dependency-inventory.json. Проверки базового Status не выдаются за принятые внутри Corp. Дополнительно Color=Custom разрешает менять токены и конфликтует с фиксированным fill-lock Core Status.

Не заявлены проверки смысла Type, Style по фону сборки, численности/взаимоисключения сущностей на объекте, кликабельности, фактического viewport, двух слов и 20 отображаемых символов с ellipsis. Полный исходный текст может быть длиннее 20 символов. Shape/Uppercase проверяются как native параметры; общий запрет изменения дочерней типографики/оформления остаётся незакрытым.

Private preflight использует ограниченную проекцию native-значений, без полных producer lineage и независимых вложенных references. Её UNKNOWN сохранены. Она не заменяет тест Apollo. Для смены непустого текста не повторяется RESET: API и ограничение min1 прежние.

Артефакты: `../../packages/StatusProperty.r1.draft.component-contract.zip`, `../../contract.manual.json`; схема/reopen — technical.json; покрытие — coverage-map.json; eval — eval.json; native ссылки — test-cases.json.

Обновление общего Git data snapshot выполняется отдельным согласованным шагом после освобождения publisher Skills. Наличие ZIP само по себе не меняет данные запущенного Proxy.
