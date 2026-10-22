# Switch r1 — нативный тест Apollo

Все восемь подготовленных кейсов совпали с ожидаемой матрицей. Пакет d329d4e0 и manual 6b70848f подтверждены исходным отчётом; проверены точные RuleID и целевые узлы.

| Кейс | Ожидали | Получили |
| --- | --- | --- |
| [SW-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70518) | 0 | 0 |
| [SW-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70537) | 0 | 0 |
| [SW-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70560) | 0 | 0 |
| [SW-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70582) | 0 | 0 |
| [SW-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71541) | 1 | 1 |
| [SW-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71545) | 1 | 1 |
| [SW-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71549) | 1 | 1 |
| [SW-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71558) | 1 | 1 |

Ровно четыре нарушения: ручная заливка area, прозрачность корня, размер шрифта Label, ручная заливка HintMessage.

Apollo обнаружил 12 экземпляров: восемь корней кейсов и четыре вложенных Switch в SwitchLabel. Вложенные контролы не имеют нарушений; разрешённые изменения их состояния не дали ложных ошибок.

Всего 880 вычислений: 490 compliant, 386 not-applicable, 4 violation. UNKNOWN=0, executionComplete=true у всех 12 компонентов и области, notChecked=0. Отдельные unknownFacts о неиспользуемых variable modes в snapshot не являются UNKNOWN-результатами правил.

Сохранён [исходный отчёт gzip](owner-report.json.gz), [сверка](review.json) и [eval](eval.json). Архив распаковывается в точные исходные bytes.

Принимается только эта тестовая матрица. Контракт остаётся Draft; manual, ZIP, runtime и Git-снимок данных не менялись. Повторный прогон этих же кейсов сейчас не нужен. Связь IconView → Indicator остаётся отдельным открытым пунктом.
