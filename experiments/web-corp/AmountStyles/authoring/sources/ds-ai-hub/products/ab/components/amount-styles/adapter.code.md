---
id: AmountStyles.adapter.code
layer: product
product: ab
platforms: [web]
targets: [code]
status: verified
lastReviewed: 2026-07-24
---

# Code adapter: AmountStyles

## Availability

`not-applicable` — AmountStyles является Figma-only семейством пресетов. Прямого package export, React-компонента или отдельного runtime API нет по дизайну.

Нельзя генерировать:

```ts
import { AmountStyles } from '...'
import { AmountParagraph } from '...'
import { AmountHeadline } from '...'
```

Такие imports не подтверждены источником и считаются вымышленными.

## Implementation intent

Если макет использует AmountStyles, код реализует денежную сумму через проверенный [`Web Core Amount`](../../../../core/web/components/amount/code/adapter.md) и задаёт типографику окружающим code API согласно контексту.

Это не означает прямой prop-to-prop bridge:

- Figma `Style` — preset типографики, а не подтверждённый prop AmountStyles в коде;
- Figma `Operation`, `Minor`, `Currency`, `Addon` передают намерение видимости частей;
- профиль баллов передаёт `Major` как значение, скрывает Minor/Currency и использует IconView intent в Addon;
- точные code props берутся только из Core Amount adapter / MCP;
- Figma-only channel presets не превращаются в imports.

## Fallback

При генерации кода:

1. зафиксируй, что исходный root — Figma-only AmountStyles;
2. выбери Core Amount по его code adapter;
3. сохрани смысл значения, знака, minor part, валюты и addon; для баллов отдельно зафиксируй отсутствие Minor/Currency и назначение IconView;
4. сопоставь типографику с существующим code-контекстом;
5. если точного соответствия нет, пометь `[VERIFY]`, не создавай новый API.

Точный runtime API баллов не подтверждён этим Figma-only контрактом. Не превращай IconView из макета в вымышленный prop без источника в продуктовой кодовой базе.
