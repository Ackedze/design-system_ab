# Accordion r1 · Draft

[Лабораторная секция](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77294)

Обновить общий пакет данных в Proxy. Экземпляры уже настроены; Apollo: Desktop для всей секции или нужная платформа для отдельного Attach. Подтверждение только ручным прогоном владельца.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [AC-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77717) | Content=True, ControlSide=Right | 0 нарушений |
| [AC-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77743) | Content=False, ControlSide=Left | 0 нарушений |
| [AC-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77759) | Content=True, ControlSide=Right; slot-Header | 0 нарушений |
| [AC-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77780) | Content=True, ControlSide=Right; slot-Body | 0 нарушений |
| [AC-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77803) | Content=True, ControlSide=Right; slot-Control | 0 нарушений |
| [AC-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77826) | Content=True, ControlSide=Right; slot-padding | 1 нарушений · `component:web-core.accordion.layer-properties-use-effective-baseline` |
| [AC-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77843) | Content=True, ControlSide=Right; opacity | 1 нарушений · `component:web-core.accordion.layer-properties-use-effective-baseline` |
| [AC-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77860) | Content=True, ControlSide=Right; headline-gap | 1 нарушений · `component:web-core.accordion.layer-properties-use-effective-baseline` |

Draft не означает Ready. Проверка компиляции/IR и повторное открытие ZIP прошли. Новая native-приёмка — NOT_RUN_USER_ONLY.

## Источники

Каталоги:
- JSONS/web/components/web-core/wrappers/Web _ Core Wrappers -- Accordion.json

Агентские файлы:
- JSONS/web/components/web-core/wrappers/Accordion/contract.generated.json
- JSONS/web/components/web-core/wrappers/Accordion/rules.json
- JSONS/web/components/web-core/wrappers/Accordion/composition-contract.json
- JSONS/web/components/web-core/wrappers/Accordion/agent-context.json
- JSONS/web/components/web-core/wrappers/Accordion/contract.overrides.json

Паттерны:
не использовались

Редполитика:
не использовались
