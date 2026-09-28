# Button — MVP component contract

Папка содержит экспериментальный слой component-contract для **Web _ Core / Button**.

Raw Figma catalog остаётся source of truth:

`../Web _ Core -- Button.json`

Этот файл намеренно не редактируется вручную. Он большой и полный: в нём хранятся экспортированные структуры Figma-компонентов, variants, nested layers, fills, text styles и token references.

## Файлы

- `contract.generated.json` — сгенерированный compact contract, извлечённый из raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, slots, internal layers и reset model.
- `rules.json` — source of truth для component-level rules и ссылок на pattern rules.
- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs Button.
- `examples.json` — MVP fixtures для тестирования Apollo и интерпретации агентом.
- `agent-context.json` — compact explanatory context, который можно передавать агенту вместо generated contract. Он ссылается на rule ids, но не дублирует rule text или severity.

В этом MVP для Button нет `composition-contract.json`. Button трактуется как standalone core component: его baselines берутся из raw/generated component contract, semantic overrides и rules. `composition-contract.json` нужен только тогда, когда wrapper component владеет nested component overrides и должен объявить effective baseline для этих nested layers.

## Предполагаемое использование

Apollo должен использовать generated contract, чтобы понимать component states и baselines, затем применять overrides и rules, чтобы интерпретировать diff как component property change, slot configuration, layer customization или component-contract violation.

Агент должен получать matched rules из `rules.json` и, при необходимости, `agent-context.json` или меньший slice этого файла. Агент не должен получать полный raw Figma catalog или полный generated contract.

## Текущий Scope

Это draft для Button only. Он покрывает:

- `[D] Button`
- `[D] Button_Inverted`
- `[M] Button`
- `[M] Button_Inverted`
- scheduled Corporate Button variants
- `Addon` part components

## Важное audit rule

Если component property изменилась, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.

Пример:

`variant.View: Primary → Accent` followed by manual fill change should show:

`fill: Button/Desktop/Colors/Accent/bg → custom value`

а не:

`fill: Button/Desktop/Colors/Primary/bg → custom value`.
