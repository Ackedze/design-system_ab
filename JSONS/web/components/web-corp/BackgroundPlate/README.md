# BackgroundPlate contract package

Источник raw-каталога:

`JSONS/web/components/web-corp/Web _ Corp Components -- BackgroundPlate.json`

Пакет описывает machine-readable слой для семейства `BackgroundPlate`: рабочие и промо-подложки, slot-компоненты и вложенные `Style Level` компоненты. Пакет не заменяет raw-каталог Apollo, а дополняет его правилами, composition baseline и агентским контекстом.

## Область применения

- Канал: `b2b`
- Платформы: `desktop`, `mobile-web`
- Библиотека: `Web _ Corp Components`
- Code/private exports: `BackgroundPlate`, `BackgroundPlateView`

`BackgroundPlateView` — кодовая обёртка/alias для `BackgroundPlate`. В Apollo и агентском анализе она не считается отдельным Figma-компонентом: для неё применяются те же `componentKey`, правила, reset model и composition-contract.

## Файлы

- `contract.generated.json` - компактный сгенерированный baseline из raw-каталога.
- `contract.overrides.json` - публичный API, code aliases и reset model.
- `composition-contract.json` - composition model, nested ownership и effective baseline.
- `rules.json` - machine-readable правила компонента.
- `audit-mapping.json` - маппинг diff properties в категории аудита Apollo.
- `examples.json` - regression examples для ожидаемого поведения Apollo.
- `agent-context.json` - компактный контекст для Apollo agent.

## Правила интерпретации

- `Position` у `BackgroundPlate` выбирает `Style Level 1` или `Style Level 2`.
- `Style Level` хранит фактический baseline поверхности: `BackgroundColor`, `Type`, `Skeleton`, `fill` и `radius`.
- `BackgroundPlateSlot` управляет slot padding и `Type/Skeleton`. Само содержимое слота не является кастомизацией.
- `variant.*` показывается как `component-property customization`.
- `fill`, `stroke`, `radius`, `opacity`, `layout.*`, `styles.*` показываются как `layer-property customization` и сравниваются с effective baseline выбранного variant.
- Padding у `BackgroundPlateSlot` может быть дизайнерской настройкой композиции. Его нужно показывать как кастомизацию и дополнительно проверять по Spacing tokens, но не считать ошибкой без точного правила.

## Важные baseline

- Desktop рабочий `BackgroundPlate Level 1` использует radius `16`.
- Desktop рабочий `BackgroundPlate Level 2` использует radius `12`.
- Promo и mobile variants используют свои значения из raw-каталога и не должны автоматически переноситься на рабочие desktop-поверхности.
