# Status & Property — component contract

Папка содержит готовый component-contract для **Web _ Corp Components / Status & Property**.

Raw-каталог Figma остаётся источником структурных данных:

`../Web _ Corp Components -- Status & Property.json`

## Файлы

- `contract.generated.json` — структурный контракт, который Athena генерирует из raw-каталога.
- `contract.overrides.json` — публичные preset-компоненты и допустимые semantic overrides.
- `composition-contract.json` — ownership вложенного core Status и правила композиции.
- `rules.json` — точные правила для Apollo и агента.
- `audit-mapping.json` — классификация изменений и условная обработка `Color=Custom`.
- `examples.json` — положительные и ошибочные сценарии с ожидаемым аудитом.
- `agent-context.json` — компактный контекст для интерпретации отчёта агентом.
- `../../../patterns/p_status-model.md` — общий паттерн статусной модели.

## Источник

- Библиотека: `Web _ Corp Components`
- Последняя продуктовая проверка: `2026-07-22`
- Компонентов: `4`

## Статус

Пакет имеет статус **Ready**. Generated-секции обновляет Athena, manual-секции принадлежат авторам дизайн-системы и должны сохраняться при повторной генерации.

Публичные компоненты: `🔒 [D] StatusPreset`, `🔒 [M] StatusPreset`, `🔒 [D] PropertyPreset`, `🔒 [M] PropertyPreset`. Вложенный core `Status` отдельно не используется.

## Краткая модель

- `StatusPreset` показывает состояние объекта или процесса; на один объект допускается один статус.
- `PropertyPreset` показывает характеристику объекта; в одной композиции допускается до двух свойств.
- `StatusPreset` и `PropertyPreset` не используются вместе.
- На серой поверхности используется `Style=Contrast`, на белой — `Style=Muted`.
- `Color=Custom` разрешён только для PropertyPreset и требует контрастных токенизированных цветов текста и фона.
