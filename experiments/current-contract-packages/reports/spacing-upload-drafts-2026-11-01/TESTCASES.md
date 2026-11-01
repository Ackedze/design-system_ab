# Spacing / ProgressBar / Dropzone / FileUploadItem · Draft r1

[32 кейса в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76902)

Пакет данных: **1.4.10-data.20261101.3**,59 контрактов. Статус: **PENDING_PUBLICATION**. После публикации владелец обновляет данные Proxy и запускает Apollo. Пересборка Apollo/Proxy для этой партии не требуется.

Экземпляры уже настроены. Выбрать Desktop и секцию целиком либо конкретный компонент по ссылке. Ожидаемые числа относятся к локальным правилам этих контрактов; системные проверки стилей/публикации показываются отдельно. В Spacing два нарушения имеют уровень warning, остальные девять — error.

Автоматические native fixtures:32/32 PASS,11 намеренных нарушений, UNKNOWN0, executionComplete32/32. Ручная приёмка Apollo — **NOT_RUN_USER_ONLY**. Draft не переведён в Ready.

## Spacing

| Компонент | Настройки, уже выставлены | Ожидаемый результат |
|---|---|---|
| [SP-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76905) | ↔ Horizontal; Size=16 | 0 нарушений |
| [SP-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76909) | ↕ Vertical; Size=24 | 0 нарушений |
| [SP-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76913) | ↔ Horizontal; Size=16; высота96 px | 0 нарушений |
| [SP-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76917) | ↕ Vertical; Size=24; ширина240 px | 0 нарушений |
| [SP-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76922) | ↔ Horizontal; Size=Fill; родитель Auto Layout, ширина300 px | 0 нарушений |
| [SP-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76927) | ↕ Vertical; Size=Fill; родитель Auto Layout, высота120 px | 0 нарушений |
| [SP-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76931) | ↔ Horizontal; Size=16; opacity корня=50% | 1 warning · `component:web.spacing-component.layer-properties-use-effective-baseline.1.11` |
| [SP-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76935) | ↕ Vertical; Size=24; opacity слоя Fixer=50% | 1 warning · `component:web.spacing-component.layer-properties-use-effective-baseline.1.11` |

При ручной проверке сохранить отчёт Apollo. Сброс всех экземпляров перед прогоном не нужен: отрицательные кейсы уже подготовлены. Для проверки восстановления у отрицательного кейса вернуть указанное изменённое свойство к библиотечному значению; соответствующее нарушение должно исчезнуть.

## ProgressBar

| Компонент | Настройки, уже выставлены | Ожидаемый результат |
|---|---|---|
| [PB-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76939) | ProgressBar; Size=8px | 0 нарушений |
| [PB-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76944) | ProgressBar; Size=4px | 0 нарушений |
| [PB-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76949) | ProgressBarInverted; Size=8px | 0 нарушений |
| [PB-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76954) | ProgressBarInverted; Size=4px | 0 нарушений |
| [PB-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76959) | ProgressBar; Size=8px; ширина520 px | 0 нарушений |
| [PB-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76964) | ProgressBar; Size=8px; opacity корня=50% | 1 ошибка · `component:web-core.progress-bar.layer-properties-use-effective-baseline.1.13` |
| [PB-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76969) | ProgressBar; Size=8px; opacity Fill=50% | 1 ошибка · `component:web-core.progress-bar.layer-properties-use-effective-baseline.1.13` |
| [PB-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76974) | ProgressBar; Size=8px; радиус корня увеличен на1 px | 1 ошибка · `component:web-core.progress-bar.layer-properties-use-effective-baseline.1.14` |

При ручной проверке сохранить отчёт Apollo. Сброс всех экземпляров перед прогоном не нужен: отрицательные кейсы уже подготовлены. Для проверки восстановления у отрицательного кейса вернуть указанное изменённое свойство к библиотечному значению; соответствующее нарушение должно исчезнуть.

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
