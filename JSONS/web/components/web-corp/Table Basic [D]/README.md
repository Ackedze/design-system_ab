# Table Basic [D]

Машиночитаемый комплект для более воздушных desktop-таблиц до пяти столбцов. В одной ячейке доступны основной `Text 1` и опциональный `Text 2`.

## Источник

- Raw-каталог: `../Web _ Corp Components -- Table _ _ Basic [D].json`
- Библиотека: `Web _ Corp Components`
- Платформа: `desktop`, начиная с 768 px
- Канал: `b2b`

## Сборка таблицы

Дизайнер добавляет `[D] HeadRow :: Universal` и `[D] BodyRow :: Basic`, детачит строки и наполняет их библиотечными ячейками из `[D] HeadCells :: Universal` и `[D] BodyCells :: Basic`. `TableView` не относится к этой композиции.

Обязательная внешняя композиция:

1. `CorporateTopbar`
2. `[D] HeadRow :: Universal`
3. `[D] BodyRow :: Basic`
4. `Pagination`
5. `[D] BackgroundPlateSlot` как контейнер

## Основные ограничения

- Не более пяти столбцов и без горизонтального скролла.
- При расширении одной обычной колонки другая уменьшается; HeadCell и BodyCell одного столбца совпадают.
- Ширину control/action-ячеек менять нельзя.
- Функциональная группировка не поддерживается; `GroupDivider` служит заголовком или разделителем строк.
- Высота строк и визуальные состояния следуют effective baseline.
- Typography, fill, stroke, opacity, padding, spacing и radius вручную не меняются.
- Для empty/error `CorporateSystemMessage` заменяет только BodyRow.
- Pagination не удаляется; доступны размеры страницы 10, 25, 50 и 100.
- Разрешены только предусмотренные компонентом presets; arbitrary instance swap запрещён.
- Компоненты с префиксом `🔄` относятся к старой версии и крайне не рекомендуются для новых макетов.

## Документы

- `contract.generated.json` — автоматически сгенерированная структура и baseline.
- `contract.overrides.json` — ручная бизнес-семантика и допустимые настройки.
- `composition-contract.json` — правила сборки и вложенного владения.
- `rules.json` — детерминированные правила Apollo и агента.
- `audit-mapping.json` — классификация diff и правила reset.
- `agent-context.json` — компактный контекст для трактовки отчёта.
- `examples.json` — регрессионные сценарии.

Все ручные документы имеют статус `ready`.
