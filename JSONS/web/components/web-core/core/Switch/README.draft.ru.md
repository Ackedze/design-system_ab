# Switch r1 — Draft для проверки

12 публичных представлений и 40 вариантов библиотеки Web Core. Пять прежних source-политик сведены в 3 уникальных authoring-правила и 32 IR: разрешённый native API, baseline оформления/Auto Layout, типографика Label/HintMessage. Reverse/Inverted выбираются публичным представлением; они не объявлены выдуманными параметрами.

Compile/export/reopen с полными facts и reader 14 контрактов прошли. Свежих результатов Apollo пока нет: Draft, wholeReady=false. Style identity при неизменных метриках отдельно не проверяется.

## Проверка

Кейсы находятся в [заданной секции](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=13573-169065). Платформа Desktop; выбирайте по одному указанному экземпляру. Все параметры и намеренные нарушения уже выставлены. Не меняйте компоненты перед первым прогоном. Нативные VARIANT используют строки True/False, не BOOLEAN.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [SW-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70518) | Switch_20: SelectedState=False, DisabledState=False. | 0 нарушений |
| [SW-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70537) | Switch_24_Inverted: SelectedState=True, DisabledState=True. | 0 нарушений |
| [SW-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70560) | SwitchLabel_20: Hint=True, CompactLabel=True; Label=Новая подпись, Hint=Пояснение; вложенный Switch: SelectedState=False, DisabledState=True. | 0 нарушений |
| [SW-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-70582) | SwitchLabel_24_Reverse_Inverted: Hint=False; Label=Обратный переключатель; вложенный Switch: SelectedState=False, DisabledState=False. | 0 нарушений |
| [SW-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71541) | Switch_20: SelectedState=True, DisabledState=False; у area вручную задана пурпурная заливка. | 1 нарушений |
| [SW-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71545) | Switch_24: SelectedState=False, DisabledState=False; opacity корня=50%. | 1 нарушений |
| [SW-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71549) | SwitchLabel_20: Hint=False, CompactLabel=False; размер шрифта Label=17 вместо 16. | 1 нарушений |
| [SW-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14346-71558) | SwitchLabel_24_Reverse_Inverted: Hint=True; у HintMessage вручную задана пурпурная заливка. | 1 нарушений |

Ожидаемые точные RuleID и восстановление исходных свойств: [test-cases.json](reports/authoring-r1-2026-10-23/test-cases.json). Повторные RESET-прогоны заранее не назначаются.

## Доставка

После push main владелец выбирает «Проверить обновления → Обновить» в миниаппе Proxy. Готовый снимок: dataId d329d4e0beb1eeb523db4e2b187f922737f781bc31a46f625ae9598a0c7d1870, 14 контрактов; [current.json](../../../../../../apollo/data-packages/current.json). Код и плагин не пересобираются. Пуш/установка в этой задаче не выполнялись.

Пакет: [Switch.r1.draft.component-contract.zip](packages/Switch.r1.draft.component-contract.zip). Техническая проверка и ограничения: [eval.json](reports/authoring-r1-2026-10-23/eval.json).

## Зависимости

Встроенный Switch_20/24 в SwitchLabel принадлежит этому же семейству: [inventory](reports/authoring-r1-2026-10-23/dependency-inventory.json), отдельного self-dependency нет.

Для существующего IconView зафиксирован [открытый пробел Indicator](../IconView/reports/indicator-dependency-gap-2026-10-23/README.ru.md). Нынешний runtime требует Ready у ребёнка, а Indicator r2 остаётся Draft. Действующий IconView и его рабочие проверки сохранены; наличие самостоятельного контракта Indicator ещё не означает исполнение его норм внутри родителя.

## Использованные контекстные файлы

- Каталоги: Web Core Switch; Interface Dynamic Colors (neutral/1300 для контрастных подложек стенда).
- Агентские файлы: component-owned правила, структура, generated/manual и source anatomy.
- Паттерны: не использовались.
- Редполитика: не использовалась.

Точные пути/SHA: [context-files.json](reports/authoring-r1-2026-10-23/context-files.json).
