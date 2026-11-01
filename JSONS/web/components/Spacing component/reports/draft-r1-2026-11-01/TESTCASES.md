# Spacing r1 · Draft

[32 кейса в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14771-76902)

Пакет данных: **1.4.10-data.20261101.3**,59 контрактов. Статус: **PENDING_PUBLICATION**. После публикации владелец обновляет данные Proxy и запускает Apollo. Пересборка Apollo/Proxy для этой партии не требуется.

Экземпляры уже настроены. Выбрать Desktop и секцию целиком либо конкретный компонент по ссылке. Ожидаемые числа относятся к локальным правилам этих контрактов; системные проверки стилей/публикации показываются отдельно. В Spacing два нарушения имеют уровень warning, остальные девять — error.


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

## Контекст и границы

- Size=Fill зависит от Auto Layout вызывающей сборки; контракт не вводит фиксированную длину Fill и не проверяет рецепт размещения.
- Draft охватывает Horizontal/Vertical. .SpacerСell сохранён в source facts; самостоятельная политика его размещения этой задачей не вводится.
