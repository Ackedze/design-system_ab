---
id: AmountStyles.cookbook.01-overview
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# Cookbook: AmountStyles в Figma

Правила выбора — [`instructions.md`](../instructions.md), структура — [`adapter.figma.md`](../adapter.figma.md), ключи — [`figma-keys.json`](../figma-keys.json).

AmountStyles — Figma-only presets вокруг вложенного Web Core Amount. Не собирай сумму из отдельных текстовых слоёв и не вставляй внутренний `Operation` отдельно.

## Карта рецептов

| Рецепт | Когда загружать |
|---|---|
| [`02-build.md`](02-build.md) | Import, выбор Style, настройка частей и текста |
| [`03-contexts.md`](03-contexts.md) | Таблицы, баллы, bulk actions, steps, side panel |
| [`04-verify.md`](04-verify.md) | Обязательная проверка результата |

## Imports

```js
const AMOUNT_STYLES_KEYS = {
  paragraph: '6276f825ec9ee2ceded5305171c715a7dd73637e',
  headlineDesktop: '46d9453084998704a7c26aefd8c2d4427e3a4f5c',
  headlineMobile: 'cee3a597980650c3d43dbe8bf283d2c4f6c1507e',
}
```

Импортируй component set выбранного public root. `Operation` не входит в import map, потому что internal-only.

## Выбор root

| Intent | Root |
|---|---|
| Сумма в таблице, списке, карточке, secondary value | `paragraph` |
| Крупная сумма на desktop | `headlineDesktop` |
| Крупная сумма на mobile-web | `headlineMobile` |
| Баллы | Любой root по роли и каналу; points profile на nested Amount |

## Обязательный порядок

1. Выбери root и `Style`.
2. Импортируй library component set.
3. Создай instance выбранного variant.
4. Настрой root `Operation`.
5. Настрой nested Operation и nested Core Amount.
6. Примени контекстные правила.
7. Выполни `04-verify.md`.

Универсальные операции import hygiene, variables и финальный cleanup не копируются: используй `skills/design-figma/`.
