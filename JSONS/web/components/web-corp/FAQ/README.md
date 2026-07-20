# FAQ — component contract

Папка содержит готовый component-contract для **Web _ Corp Components / FAQ**.

Raw-каталог Figma остаётся источником структурных данных:

`../Web _ Corp Components -- FAQ.json`

## Файлы

- `contract.generated.json` — структурный контракт, который Athena генерирует из raw-каталога.
- `contract.overrides.json` — публичные корни, служебные части и допустимые semantic overrides.
- `composition-contract.json` — ownership вложенных компонентов и правила композиции.
- `rules.json` — точные правила для Apollo и агента.
- `audit-mapping.json` — классификация изменений и краткая component policy для Apollo.
- `examples.json` — положительные и ошибочные сценарии с ожидаемым аудитом.
- `agent-context.json` — компактный контекст для интерпретации отчёта агентом.
- `../../../patterns/p_faq.md` — компонентный паттерн FAQ.

## Источник

- Библиотека: `Web _ Corp Components`
- Последняя продуктовая проверка: `2026-07-20`
- Компонентов: `6`

## Статус

Пакет имеет статус **Ready**. Generated-секции обновляет Athena, manual-секции принадлежат авторам дизайн-системы и должны сохраняться при повторной генерации.

Публичные корни: `[D][Promo] FAQ`, `[M][Promo] FAQ`, `FAQ`. Все варианты `FAQItem` являются служебными и отдельно не используются.
