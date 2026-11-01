# FileUploadItem r1 · Draft

[32 кейса в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76902)

Пакет данных: **1.4.10-data.20261101.3**,59 контрактов. Статус: **PENDING_PUBLICATION**. После публикации владелец обновляет данные Proxy и запускает Apollo. Пересборка Apollo/Proxy для этой партии не требуется.

Экземпляры уже настроены. Выбрать Desktop и секцию целиком либо конкретный компонент по ссылке. Ожидаемые числа относятся к локальным правилам этих контрактов; системные проверки стилей/публикации показываются отдельно. В Spacing два нарушения имеют уровень warning, остальные девять — error.


## FileUploadItem

| Компонент | Настройки, уже выставлены | Ожидаемый результат |
|---|---|---|
| [FU-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77040) | RightAddon=true; LeftAddon Presets=Document, Style=Gray; Content Preset=Default; RightAddon Preset=Controls | 0 нарушений |
| [FU-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77046) | Та же сборка; RightAddon=false | 0 нарушений |
| [FU-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77052) | LeftAddon Presets=Img, Style=None; Content=Default; RightAddon Controls | 0 нарушений |
| [FU-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77058) | LeftAddon Document/Gray; Content Preset=Error; RightAddon Controls | 0 нарушений |
| [FU-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77064) | Content Default; RightAddon Controls; Delete=false | 0 нарушений |
| [FU-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77070) | Базовая сборка FU-01; opacity корня=50% | 1 ошибка · `component:web-core.file-upload-item.layer-properties-use-effective-baseline.1.13` |
| [FU-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77076) | Базовая сборка FU-01; gap увеличен на1 px | 1 ошибка · `component:web-core.file-upload-item.layer-properties-use-effective-baseline.1.6` |
| [FU-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77082) | Базовая сборка FU-01; opacity вложенного Content=50% | 1 ошибка · `component:web-core.file-upload-item.layer-properties-use-effective-baseline.1.13` |

При ручной проверке сохранить отчёт Apollo. Сброс всех экземпляров перед прогоном не нужен: отрицательные кейсы уже подготовлены. Для проверки восстановления у отрицательного кейса вернуть указанное изменённое свойство к библиотечному значению; соответствующее нарушение должно исчезнуть.

## Контекст и границы

- Соответствие Preset реальному состоянию файла, типу/размеру, доступности действий и прогрессу — рецепт загрузки. Библиотечные вложенные пресеты и их поля проверяются по независимому состоянию.
