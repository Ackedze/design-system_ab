# Dropzone r1 · Draft

[32 кейса в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76902)

Пакет данных: **1.4.10-data.20261101.3**,59 контрактов. Статус: **PENDING_PUBLICATION**. После публикации владелец обновляет данные Proxy и запускает Apollo. Пересборка Apollo/Proxy для этой партии не требуется.

Экземпляры уже настроены. Выбрать Desktop и секцию целиком либо конкретный компонент по ссылке. Ожидаемые числа относятся к локальным правилам этих контрактов; системные проверки стилей/публикации показываются отдельно. В Spacing два нарушения имеют уровень warning, остальные девять — error.


## Dropzone

| Компонент | Настройки, уже выставлены | Ожидаемый результат |
|---|---|---|
| [DZ-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76979) | State=Default; Content исходный | 0 нарушений |
| [DZ-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76985) | State=Active; Content исходный | 0 нарушений |
| [DZ-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76997) | State=Error; Content исходный | 0 нарушений |
| [DZ-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77003) | State=Default; Content swap→FileUploadItem; Document/Gray, Content Default, RightAddon Controls | 0 нарушений |
| [DZ-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77008) | State=Default; Content swap→Attach desktop | 0 нарушений |
| [DZ-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77019) | State=Default; opacity корня=50% | 1 ошибка · `component:web-core.dropzone.layer-properties-use-effective-baseline.1.13` |
| [DZ-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77024) | State=Active; Blend mode корня=Multiply | 1 ошибка · `component:web-core.dropzone.layer-properties-use-effective-baseline.1.22` |
| [DZ-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-77035) | State=Error; strokeWeight увеличен на1 px | 1 ошибка · `component:web-core.dropzone.layer-properties-use-effective-baseline.1.17` |

При ручной проверке сохранить отчёт Apollo. Сброс всех экземпляров перед прогоном не нужен: отрицательные кейсы уже подготовлены. Для проверки восстановления у отрицательного кейса вернуть указанное изменённое свойство к библиотечному значению; соответствующее нарушение должно исчезнуть.

## Контекст и границы

- Drag/drop, выбор файла, ограничения типов/объёма и переходы состояний требуют поведения или рецепта FileUpload; статичный Draft проверяет локальную Figma-конфигурацию.
