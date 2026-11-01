# ActionButton r1 · Draft

[Лабораторная секция](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77294)

Обновить общий пакет данных в Proxy. Экземпляры уже настроены; Apollo: Desktop для всей секции или нужная платформа для отдельного Attach. Подтверждение только ручным прогоном владельца.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [AB-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77297) | ✎ Label#603:2=Label, View=Primary, Inverted=False, Static=False, DisabledState=False | 0 нарушений |
| [AB-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77307) | ✎ Label#603:2=Label, View=Secondary, Inverted=False, Static=True, DisabledState=True | 0 нарушений |
| [AB-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77317) | ✎ Label#603:2=Label, View=Primary, Inverted=True, Static=False, DisabledState=False | 0 нарушений |
| [AB-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77327) | ✎ Label#603:2=Перевести, View=Primary, Inverted=False, Static=False, DisabledState=False | 0 нарушений |
| [AB-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77336) | ✎ Label#603:2=Label, View=Primary, Inverted=False, Static=False, DisabledState=False; swap-icon | 0 нарушений |
| [AB-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77346) | ✎ Label#603:2=Label, View=Primary, Inverted=False, Static=False, DisabledState=False; bg-opacity | 1 нарушений · `component:web-core.action-button.layer-properties-use-effective-baseline` |
| [AB-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77355) | ✎ Label#603:2=Label, View=Primary, Inverted=False, Static=False, DisabledState=False; gap | 1 нарушений · `component:web-core.action-button.layer-properties-use-effective-baseline` |
| [AB-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77364) | ✎ Label#603:2=Label, View=Primary, Inverted=False, Static=False, DisabledState=False; label-opacity | 1 нарушений · `component:web-core.action-button.layer-properties-use-effective-baseline` |

Draft не означает Ready. Проверка компиляции/IR и повторное открытие ZIP прошли. Новая native-приёмка — NOT_RUN_USER_ONLY.

## Источники

Каталоги:
- JSONS/web/components/web-core/core/Web _ Core -- ActionButton.json

Агентские файлы:
- JSONS/web/components/web-core/core/ActionButton/contract.generated.json
- JSONS/web/components/web-core/core/ActionButton/rules.json
- JSONS/web/components/web-core/core/ActionButton/composition-contract.json
- JSONS/web/components/web-core/core/ActionButton/agent-context.json
- JSONS/web/components/web-core/core/ActionButton/contract.overrides.json

Паттерны:
не использовались

Редполитика:
не использовались
