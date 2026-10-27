# Text / List / SegmentedControl / Slider — Draft r1

Свежие Athena-источники 27.10.2026. Core, Proxy reader, plugin, runtime и границы генерационного пилота не менялись. Push/install не выполнялись.

[Секция в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14549-72718) · [Пакеты](../../manifest.json)

Четыре ZIP проходят compile и точный import/export/reopen. Реальные scoped captures существующего Core SDK в Figma и audit установленного main в VM проходят: Text TX-02, List LI-02, Slider SL-02 — 0 нарушений / 0 UNKNOWN; SegmentedControl SG-07 — 1 ожидаемое / 0 UNKNOWN. Это не пользовательский прогон Apollo UI.

**Поставка:** [кандидат36](delivery-candidate/RESULT.json) сохраняет прежние32контракта и133payloadфайла. Текущий reader принимает максимум32; кандидат штатно отклоняется. Каналы Git/data, generation и установка сохранены; статус PENDING_CAPACITY. Подъём конечного лимита reader до64 требует отдельного writer-окна; Core/operator/IR не затрагиваются.

**SegmentedControl:** проверяются публичный API активных6корней, оформление корня,2–5сегментов и единственный Selected. Внутренние стили/типографика и максимум2слова подписи остаются явным пробелом до отдельного контракта Segment. SG-09 демонстрирует этот пробел и исключён из приёмки. Expanded failed attempt сохранён; неверный контур не включён в canonical ZIP.

## Ручная проверка после решения вопроса поставки

25 приёмочных кейсов и1известный пробел. Выбирать конкретный INSTANCE по ссылке. Источник — соответствующий Draft r1. Числа относятся только к правилам компонента; глобальные стили/coverage анализируются отдельно. Тесты Apollo пока NOT_RUN_USER_ONLY.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [TX-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72720) | Text; {}; Своя подпись · 0 | 0 нарушений |
| [TX-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72725) | Text; {}; Другой библиотечный Text Style · 0 | 0 нарушений |
| [TX-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14550-72730) | Text; {}; Detach Text Style · 1 | 1 нарушений |
| [TX-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72726) | Text; {}; RGB без токена в тексте · 1 | 1 нарушений |
| [TX-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72731) | Text; {}; Opacity корня 55% · 1 | 1 нарушений |
| [LI-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14551-72736) | List; {"Caption": "False"}; Caption=False, свой текст · 0 | 0 нарушений |
| [LI-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72738) | List; {"Caption": "True"}; Caption=True, свои две подписи · 0 | 0 нарушений |
| [LI-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72749) | List; {"Caption": "False"}; Opacity корня 55% · 1 | 1 нарушений |
| [LI-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72757) | List; {"Caption": "True"}; Opacity вложенного Text 55% · 1 | 1 нарушений |
| [SG-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-72986) | SegmentedControl_32; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; 32 / 2 / Fill · 0 | 0 нарушений |
| [SG-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-73247) | SegmentedControl_40; {"Shape": "Rounded", "Capacity": "3", "Resize": "Hug"}; 40 / 3 / Rounded / Hug, выбран второй · 0 | 0 нарушений |
| [SG-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-73538) | SegmentedControl_48; {"Shape": "Rounded", "Capacity": "5", "Resize": "Fill"}; 48 / 5 / Rounded · 0 | 0 нарушений |
| [SG-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-74799) | SegmentedControl_Muted_32; {"Shape": "Rectangular", "Capacity": "4", "Resize": "Hug"}; Muted32 / 4 / Hug · 0 | 0 нарушений |
| [SG-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75093) | SegmentedControl_Muted_40; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; Muted40 / 2 · 0 | 0 нарушений |
| [SG-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75347) | SegmentedControl_Muted_48; {"Shape": "Rounded", "Capacity": "3", "Resize": "Fill"}; Muted48 / 3 / Rounded · 0 | 0 нарушений |
| [SG-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75409) | SegmentedControl_40; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; Два Selected=True · 1 | 1 нарушений |
| [SG-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75458) | SegmentedControl_40; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; Нет Selected=True · 1 | 1 нарушений |
| [SG-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75487) | SegmentedControl_40; {"Shape": "Rectangular", "Capacity": "3", "Resize": "Fill"}; Подпись из трёх слов · 1 | Известный пробел — не приёмочный тест |
| [SG-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75545) | SegmentedControl_40; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; Opacity корня 55% · 1 | 1 нарушений |
| [SG-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75566) | SegmentedControl_40; {"Shape": "Rectangular", "Capacity": "2", "Resize": "Fill"}; Объект внутри Slot аддона · 0 | 0 нарушений |
| [SL-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75749) | Slider; {"Size": "2", "Mode": "Single", "Pips": "False", "Dots": "False"}; 2 / Single · 0 | 0 нарушений |
| [SL-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73034) | Slider; {"Size": "4", "Mode": "Range", "Pips": "True", "Dots": "True"}; 4 / Range / Pips + Dots · 0 | 0 нарушений |
| [SL-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73319) | Slider_Inverted; {"Size": "4", "Mode": "Range", "Pips": "False", "Dots": "True"}; Inverted / 4 / Range / Dots · 0 | 0 нарушений |
| [SL-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-73406) | Slider; {"Size": "2", "Mode": "Single", "Pips": "False", "Dots": "False"}; Opacity корня 55% · 1 | 1 нарушений |
| [SL-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-74363) | Slider; {"Size": "2", "Mode": "Single", "Pips": "False", "Dots": "False"}; Padding top у Line +3 px · 1 | 1 нарушений |
| [SL-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14553-74372) | Slider; {"Size": "4", "Mode": "Single", "Pips": "True", "Dots": "False"}; Opacity первой подписи Pips 55% · 1 | 1 нарушений |

[Проверки](VERIFICATION.json) · [Регрессия gate](capacity-gate-regression.json) · [Скилл/эвалы](skill-snapshot-pins.json) · [Сводка](SUMMARY.json) · [Леджер и Predicate](sheets-readback.json)

Финальный источник manual/facts/ZIP — `JSONS/web/components/web-core/core/<Component>`. Доказательства старых приёмок и35прежних записей canonical manifest сохранены.
