# AmountStyles — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Corp Components / AmountStyles**.

Raw Figma catalog остаётся source of truth:

`../Web _ Corp Components -- AmountStyles.json`

Сохранённая package-local copy также лежит в `catalog.raw.json` для migration testing.

## Файлы

- `catalog.raw.json` — сохранённая копия source catalog для этого пакета.
- `contract.generated.json` — сгенерированный compact contract, извлечённый из raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную, для amount typography и operation parts.
- `composition-contract.json` — ownership model для AmountHeadline, AmountParagraph и Operation.
- `rules.json` — component-level rules.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs AmountStyles.
- `examples.json` — MVP fixtures для Apollo и интерпретации агентом.
- `agent-context.json` — compact context для интерпретации на стороне агента.

## Источник

- Библиотека: `Web _ Corp Components`
- Файл: `Web _ Corp Components`
- Сгенерировано: `2026-06-05T16:07:39.725Z`
- Компонентов: `4`

## Текущий Scope

Этот пакет покрывает `AmountHeadline`, `AmountParagraph` и nested `Operation` part. Apollo должен трактовать `Style` и `Negative` как component/part configuration, а ручные paint/text changes на leaf text layers вроде `Minus`, `Major`, `Minor` и `Currency` должны оставаться layer customizations.

## Важное Audit Rule

Когда paint change найден на `Operation / Minus`, Apollo должен сохранять точный leaf path для reset, а агент должен описывать это как color customization знака операции суммы внутри `AmountParagraph` или `AmountHeadline`.
