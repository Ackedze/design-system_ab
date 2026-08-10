# Table Wide [D]

Машиночитаемый комплект для desktop-таблиц с большим количеством столбцов, горизонтальным скроллом, закреплением и одним уровнем группировки.

## Источник

- Raw-каталог: `../Web _ Corp Components -- Table _ _ Wide [D].json`
- Библиотека: `Web _ Corp Components`
- Платформа: `desktop`, начиная с 768 px
- Канал: `b2b`

## Сборка таблицы

Дизайнер добавляет `[D] HeadRow :: Universal` и `[D] BodyRow :: Wide`, детачит строки и наполняет их библиотечными ячейками из `[D] HeadCells :: Universal` и `[D] BodyCells :: Wide`. `TableView` не относится к этой композиции.

Обязательная внешняя композиция:

1. `CorporateTopbar`
2. `[D] HeadRow :: Universal`
3. `[D] BodyRow :: Wide`
4. `Pagination`
5. `[D] BackgroundPlateSlot` как контейнер

## Основные ограничения

- HeadCell и BodyCell одного столбца имеют одинаковую ширину.
- Ширину обычных колонок можно менять; ширину control/action-ячеек менять нельзя.
- Разрешён один уровень группировки.
- Высота строк и визуальные состояния следуют effective baseline.
- Typography, fill, stroke, opacity, padding, spacing и radius вручную не меняются.
- `Text` с `Presets=Amount` наследует контракт `AmountStyles`: части суммы используют один цветовой токен и выравниваются по верхнему правому краю.
- Для empty/error `CorporateSystemMessage` заменяет только BodyRow.
- Pagination не удаляется; доступны размеры страницы 10, 25, 50 и 100.
- Разрешены только предусмотренные компонентом presets; arbitrary instance swap запрещён.

## Документы

- `contract.generated.json` — автоматически сгенерированная структура и baseline.
- `contract.overrides.json` — ручная бизнес-семантика и допустимые настройки.
- `composition-contract.json` — правила сборки и вложенного владения.
- `rules.json` — детерминированные правила Apollo и агента.
- `audit-mapping.json` — классификация diff и правила reset.
- `agent-context.json` — компактный контекст для трактовки отчёта.
- `examples.json` — регрессионные сценарии.

Все ручные документы имеют статус `ready`.
