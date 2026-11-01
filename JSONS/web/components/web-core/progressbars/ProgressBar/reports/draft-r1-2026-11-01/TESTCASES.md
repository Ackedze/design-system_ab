# ProgressBar r1 · Draft

[32 кейса в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76902)

Пакет данных: **1.4.10-data.20261101.3**,59 контрактов. Статус: **PENDING_PUBLICATION**. После публикации владелец обновляет данные Proxy и запускает Apollo. Пересборка Apollo/Proxy для этой партии не требуется.

Экземпляры уже настроены. Выбрать Desktop и секцию целиком либо конкретный компонент по ссылке. Ожидаемые числа относятся к локальным правилам этих контрактов; системные проверки стилей/публикации показываются отдельно. В Spacing два нарушения имеют уровень warning, остальные девять — error.


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

## Контекст и границы

- Расчёт фактического прогресса и соответствие данных заполнению не представлены публичным числовым свойством; это не проверка бизнес-логики. Corp Presets Goal/Limit — другое семейство и не используется как источник норм Core.
