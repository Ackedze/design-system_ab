# Segment r1 и 35 вложенных экземпляров

Segment подготовлен на существующем Core0.1.24:24 active наборов,72 варианта,6 уникальных authoring-правил,32 IR. Размеры32/40/48; Label=False/known absence сохраняет неприменимость текста. ZIP/reopen, source-load/tamper и6 текстовых контролей PASS.

Ручной Apollo не запускался; пакет ещё не опубликован и не установлен. Draft остаётся Draft.

## Что нужно для оставшихся35

| Часть | Экземпляров | Минимальное действие |
|---|---:|---|
| Segment |4|Подключить новый Segment r1 в следующей поставке данных.|
| Addon Segment |1|Проверить владение после подключения Segment: owner/Slot targets уже включены.|
| Pointer / Pointer_Inverted |8|Добавить явные source targets в Slider, переиспользовать его baseline.|
| Dots / Dots_Inverted |2|То же.|
| Dot / Dot_Inverted |20|Точные native source addresses повторяющихся Dot, затем те же owned targets.|

Все30 частей Slider уже имеют660 выполненных baseline-сравнений в исходном отчёте. Частный кандидат из25 target declarations на4 наблюдавшихся native вариантах перевёл все30 в component-owned через текущий collectContractOwnedParts. Число IR Slider осталось31. Это доказательство data-only маршрута, а не новая каноническая версия Slider. Для универсального обновления нужны независимые source addresses остальных вариантов; поля @catalog запрещены guard-ом.

## Ручная проверка Segment после публикации

Выбирай сам вложенный Segment. Selected и Label — строковые VARIANT, аддоны — BOOLEAN. Новые fixture и мутации не создавались; перечитаны существующие SG-09 и SG-02.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [SE-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=I14552%3A75487%3B147335%3A16583) | Мутация текста уже стоит в SG-09. Выбрать сам вложенный Segment. {"Selected": "True", "✎ Label#75999:3": "Первое второе третье", "LeftAddon#147294:1": false, "RightAddon#147294:4": false} | component:web-core.segment.label-one-or-two-words.1.1 |
| [SE-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=I14552%3A75487%3B147335%3A16583) | Заменить подпись через TEXT property. {"✎ Label#75999:3": "Рабочий день"} | word rule compliant |
| [SE-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=I14552%3A73247%3B147335%3A17845) | Выбрать Label=False у Hug-сегмента SG-02. Это другая native ветка. {"Selected": "False", "Label": "False"} | word rule not-applicable |
| [SE-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=I14552%3A75487%3B147335%3A16583) | Снизить opacity самого Segment. {"✎ Label#75999:3": "Рабочий день", "opacity": 0.55} | component:web-core.segment.layer-properties-use-effective-baseline.1.13 |
| [SE-04-restore](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=I14552%3A75487%3B147335%3A16583) | Вернуть opacity=1 на том же экземпляре. {"✎ Label#75999:3": "Рабочий день", "opacity": 1} | Целевое нарушение отсутствует |

Целевые RuleID указаны для новых проверок; дополнительные UNKNOWN или другие нарушения сохранять для разбора, не считать автоматически ожидаемыми.

## Файлы

- Канонический manual/facts/ZIP находятся в JSONS/web/components/web-core/core/Segment/ и зарегистрированы в текущем manifest.
- NESTED-35.json — каждый из35 exact native IDs, parent scope и выполненные проверки.
- Slider.ownership-targets.candidate.json — проверенная узкая гипотеза, не новая редакция Slider.
- coverage-map.json — source→manual→IR и контекстные/интерактивные границы.
- Исходные SegmentedControl r2 и Slider r2, Athena-входы, Core/Proxy и закрытые отчёты не менялись.
