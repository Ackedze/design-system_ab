# Тесткейсы компонентов прогресса · Draft r1

[Вся секция Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77816). Размещено27 экземпляров и6 RESET на тех же экземплярах.

Пакет1.4.12-data.20261102.1 подготовлен локально, не опубликован. До загрузки этой версии новые контракты не проверять. Платформа: Desktop; компоненты universal. Локальные ожидания не равны приёмке всей области. Native Apollo прогоны не запускались. Каждый шаг, включая RESET, сохранять отдельным отчётом.

У CircularProgressBar в полном графе20 вложенных Content/Circle пока без подключённого контракта. Кейсы CP подготовлены для проверки корня; их запуск в этом блоке отложен до закрытия входов. UNKNOWN не считать отсутствием нарушения и не подавлять. Расчёт прогресса и число шагов не являются новыми ограничениями.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [BI-01 · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77829) | Default · View=Color; уже подготовлено. | 0 нарушений локального контракта. |
| [BI-02 · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77833) | Default · View=Blank; уже подготовлено. | 0 нарушений локального контракта. |
| [BI-03 · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77837) | Inverted · View=Color; уже подготовлено. | 0 нарушений локального контракта. |
| [BI-04 · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77841) | Inverted · View=Blank; уже подготовлено. | 0 нарушений локального контракта. |
| [BI-05 · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77845) | Нарушение · opacity=50%; уже подготовлено. | component:web-core.bar-item.layer-properties-use-effective-baseline.1.13 |
| [BI-05 — RESET · BarItem](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77845) | На той же цели вернуть opacity=100%. | Целевые нарушения исчезают. |
| [STP-01 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77849) | Default · Description=False; уже подготовлено. | 0 нарушений локального контракта. |
| [STP-02 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77864) | Default · Description=True · свой текст; уже подготовлено. | 0 нарушений локального контракта. |
| [STP-03 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77880) | Inverted · Description=False; уже подготовлено. | 0 нарушений локального контракта. |
| [STP-04 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77895) | Inverted · Description=True; уже подготовлено. | 0 нарушений локального контракта. |
| [STP-05 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77911) | Открытый Steps Slot · произвольный TEXT; уже подготовлено. | 0 нарушений локального контракта. |
| [STP-06 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77938) | Нарушение · opacity=50%; уже подготовлено. | component:web-core.stepped-progress-bar.layer-properties-use-effective-baseline.1.13 |
| [STP-06 — RESET · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77938) | На той же цели вернуть opacity=100%. | Целевые нарушения исчезают. |
| [STP-07 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77954) | Нарушение · Description fontSize +1; уже подготовлено. | component:web-core.stepped-progress-bar.visible-text-typography.1.2.part-53871a82b3<br>component:web-core.stepped-progress-bar.visible-text-typography.1.10.part-53871a82b3 |
| [STP-07 — RESET · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77954) | Description: вернуть стиль 14–20 Primary Small; размер14. | Целевые нарушения исчезают. |
| [STP-08 · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77970) | Вложенный BarItem · opacity=50%; уже подготовлено. | component:web-core.bar-item.layer-properties-use-effective-baseline.1.13 |
| [STP-08 — RESET · SteppedProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77970) | На той же цели вернуть opacity=100%. | Целевые нарушения исчезают. |
| [CP-01 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-77996) | Size=16 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-02 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78010) | Size=24 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-03 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78024) | Size=48 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-04 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78038) | Size=64 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-05 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78052) | Size=80 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-06 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78066) | Size=96 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-07 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78080) | Size=128 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-08 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78094) | Size=144 · Content=true; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-09 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78108) | Size=16 · Content=false; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-10 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78118) | Size=144 · Content=false; уже подготовлено. | 0 нарушений локального контракта. |
| [CP-11 · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78128) | Нарушение · opacity=50%; уже подготовлено. | component:web-core.circular-progress-bar.layer-properties-use-effective-baseline.1.13 |
| [CP-11 — RESET · CircularProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78128) | На той же цели вернуть opacity=100%. | Целевые нарушения исчезают. |
| [HP-01 · HatchingProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78138) | Библиотечный вариант · width=400; уже подготовлено. | 0 нарушений локального контракта. |
| [HP-02 · HatchingProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78146) | Разрешённая ширина520; уже подготовлено. | 0 нарушений локального контракта. |
| [HP-03 · HatchingProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78154) | Нарушение · opacity=50%; уже подготовлено. | component:web-core.hatching-progress-bar.layer-properties-use-effective-baseline.1.13 |
| [HP-03 — RESET · HatchingProgressBar](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14851-78154) | На той же цели вернуть opacity=100%. | Целевые нарушения исчезают. |

В STP-08 цель RESET — первый вложенный BarItem внутри Steps. В STP-07 Figma снимает стиль при числовой правке размера; ожидаются два IR одной нормы типографики. Восстановить библиотечный стиль, одного ввода14 недостаточно.

Граф идентичностей:117 экземпляров,97 сопоставлены с имеющимся пакетом,20 пока без сопоставления. Это инвентаризация, а не PASS исполнения.

## Источники

### Каталоги

- JSONS/web/components/web-core/progressbars/Web _ Core ProgressBars -- {SteppedProgressBar,CircularProgressBar,HatchingProgressBar}.json
- JSONS/styles/Web _ Typography.json
- JSONS/tokens/{Spacing,001 _ Interface Dynamic Colors,002 _ Interface Static Colors}.json

### Агентские файлы

- Для SteppedProgressBar, CircularProgressBar и HatchingProgressBar: contract.manual.json, variant-evidence.json, agent-context.json, rules.json, composition-contract.json, contract.overrides.json, examples.json.
- SteppedProgressBar/parts/BarItem/contract.manual.json и variant-evidence.json.
- Существующие test-cases.json каждой папки использованы как исходный план; они остаются историческими.

### Паттерны

Не использовались: подготовлена лабораторная матрица, не продуктовый экран. Поиск examples не выявил относящихся к прогрессу примеров.

### Редполитика

Не использовалась: технические подписи тесткейсов.
