# Indicator r2: исправление применимости и анатомии

Исходный прогон Apollo r1 дал 0/0/0/1/1/0/1/0 нарушений и 86 неопределённых результатов. Отчёт сохранён без потерь в `owner-report.json.gz`, его исходный SHA и разбор — в `before.json`.

У девяти проверок Count условие Size читалось у текста. Добавлен существующий `conditionSubject=component-root`. Для шести вариантов Size=8 восстановлен служебный fixer FRAME по ранее сохранённому native readback. `variant-anatomy.source.json` сохраняет исходный generated-контракт с шестью явными добавлениями; прежний generated и библиотека не менялись. Нормы, ограничения и RuleID сохранены.

Повторный расчёт тех же восьми native-снимков на прежнем runtime дал **0/0/0/1/1/1/1/0**, точные ожидаемые RuleID и полное исполнение без UNKNOWN. Неполный reference по-прежнему даёт UNKNOWN. Это retained-native replay, свежая проверка установленного r2 ещё не выполнена.

ZIP прошёл compile/export/reopen с сохранением полного facts inventory, включая libraryText. Старый r1 и его закрытые receipts сохранены. Локальная поставка заменяет только Indicator среди 13 checking contracts; остальные 12 записей, generation mappings и runtime остаются точными. Продуктовый код не менялся, push и установка не выполнялись.

Для проверки обновить данные через Git и повторить существующий [борд из восьми экземпляров](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70497). Индивидуальные ссылки, параметры и результаты — в [README компонента](../../README.draft.ru.md). Статус остаётся Draft до свежего подтверждения.
