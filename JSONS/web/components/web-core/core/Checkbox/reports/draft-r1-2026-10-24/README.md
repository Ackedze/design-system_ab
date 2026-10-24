# Checkbox r1 — Draft

[Пакет](../../packages/Checkbox.r1.draft.component-contract.zip) · [Manual](../../contract.manual.json) · [Eval](eval.json)

Существующий Core; Proxy, plugin и Editor не изменялись. Native-live и Editor UI не выполнялись.

| Проверка | Параметры | Изменение | Ожидаемый результат |
| --- | --- | --- | --- |
| checkbox-01 | {"representation":"CheckboxLabel_24","Hint":"False","DisabledLabel":"False"} | Штатные параметры и независимый библиотечный эталон без ручных правок. | Нет нарушений локальных норм; неполнота evidence учитывается отдельно. |
| checkbox-02 | Тот же выбранный вариант | Изменить заливку целевого внутреннего слоя вручную, без смены View/State. | violation по сравнению appearance.fill с текущим baseline. |
| checkbox-03 | Тот же вариант | Восстановить целевую правку; сохранять разрешённые public properties. | Целевое нарушение исчезает. |
| checkbox-04 | Другой разрешённый вариант / inverted / состояние | Изменить только штатные параметры; новый независимый эталон. | Не считать штатную смену варианта нарушением. |
| checkbox-05 | {"representation":"CheckboxLabel_20","CompactLabel":"True","Hint":"False"} | Сначала изменить текст Label, затем отдельно увеличить fontSize на 1. | Текст разрешён; изменение fontSize даёт нарушение label-typography-baseline. |

Точные исходные нормы, маршруты и пробелы — в [coverage-map.json](coverage-map.json).
Экземпляры в лаборатории пока не созданы; ссылки на несуществующие тестовые компоненты не выдаются.

Пакет данных Proxy и активный канал в этой задаче не переключались.
