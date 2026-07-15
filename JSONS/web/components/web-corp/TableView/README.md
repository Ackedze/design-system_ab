# TableView

Машиночитаемый комплект для просмотрового представления параметров и значений строками или колонками.

## Источник

- Raw-каталог: `../Web _ Corp Components -- TableView.json`
- Библиотека: `Web _ Corp Components`
- Канал: `b2b`
- Платформы: `desktop`, `mobile-web`

## Публичные компоненты

- `[D] TableView :: Horizontal` — одна колонка при `Compact=True`, несколько колонок при `Compact=False`.
- `TableView :: Vertical` — одна колонка данных для островков на Desktop и Mobile Web.
- `[D] TableView :: Horizontal SidePanel` — одна компактная колонка для SidePanel, Modal и UniversalModal на Desktop.

`Caption`, `Column`, `Row`, `Row :: SidePanel`, `ShowMore`, `Title`, `Subtitle` и `RightAddon` — служебные части. Отдельное использование запрещено.

## Основные ограничения

- Все Row используют одинаковый Compact: `12 px` при `True`, `16 px` при `False`.
- Для Multi-column обязательна Header Row; её структура совпадает с колонками данных.
- Рекомендуется не более трёх колонок данных, четырёх вместе с Caption.
- Caption опционален. Title/Subtitle presets выбираются по типу данных.
- ShowMore доступен во всех публичных вариантах.
- Частичный Skeleton для Row и Column разрешён.
- Ширина Caption и Column не меняется вручную.
- Divider вручную переключается только у последней строки.
- Instance swap внутри Title и Subtitle запрещён.
- Ручные изменения typography, spacing, fill и stroke запрещены.

## Документы

- `contract.generated.json` — автоматически сгенерированная структура и baseline.
- `contract.overrides.json` — бизнес-семантика и допустимые настройки.
- `composition-contract.json` — правила композиции и вложенности.
- `rules.json` — нормативные правила Apollo и агента.
- `audit-mapping.json` — классификация diff и правила reset.
- `agent-context.json` — контекст для трактовки отчёта.
- `examples.json` — регрессионные сценарии.

Все авторские документы имеют статус `ready`.
