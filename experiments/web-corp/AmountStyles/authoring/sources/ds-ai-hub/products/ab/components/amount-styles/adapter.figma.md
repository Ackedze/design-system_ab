---
id: AmountStyles.adapter.figma
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# Figma adapter: AmountStyles

## Public boundary

| Root | Node ID | Component set key | Platform |
|---|---|---|---|
| `🔒 AmountParagraph` | `57377:15927` | `6276f825ec9ee2ceded5305171c715a7dd73637e` | desktop + mobile-web |
| `🔒 [D] AmountHeadline` | `57388:16155` | `46d9453084998704a7c26aefd8c2d4427e3a4f5c` | desktop |
| `🔒 [M] AmountHeadline` | `57388:16319` | `cee3a597980650c3d43dbe8bf283d2c4f6c1507e` | mobile-web |

`Operation` (`57693:404`) — internal component set. Не импортируй его как самостоятельный UI.

## Root properties

У публичного root есть только:

- `Style` — variant;
- `Operation#…` — boolean visibility.

Точный boolean key различается:

| Root | Operation key |
|---|---|
| `🔒 AmountParagraph` | `Operation#57377:0` |
| `🔒 [D] AmountHeadline` | `Operation#57749:0` |
| `🔒 [M] AmountHeadline` | `Operation#57749:6` |

Не пытайся назначить `Minor`, `Currency` или `Addon` на root: эти properties принадлежат вложенному инстансу `Amount`.

## Anatomy

```text
AmountStyles preset
├── Operation                       # nested INSTANCE, optional
│   └── Minus                       # TEXT
└── Amount                          # Web Core INSTANCE
    ├── Major                       # required INSTANCE → TEXT Major
    ├── Minor                       # optional INSTANCE → TEXT Minor
    ├── Currency                    # optional INSTANCE → TEXT Currency
    └── Addon                       # optional INSTANCE
```

Live Figma подтвердила:

- `Operation` visibility связана с root boolean property;
- `Major` text property — `✎ Major#487:0`;
- `Minor` visibility — `Minor#72085:2`, text — `✎ Minor#487:1`;
- `Currency` visibility — `Currency#72085:3`, text — `✎ Currency#487:4`;
- `Addon` visibility — `Addon#100902:0`;
- `Negative=True|False` принадлежит внутреннему `Operation`;
- `Opacity` и `Currency.Type` принадлежат вложенным Core parts.

## Defaults

| Part | Default | Управление |
|---|---|---|
| Major | visible, required | text property |
| Minor | visible | nested Amount boolean |
| Currency | visible | nested Amount boolean |
| Operation | hidden | root boolean |
| Addon | hidden | nested Amount boolean |

## Points profile

Для баллов структура public root не меняется. Меняются properties вложенного Core `Amount`:

| Property | Value |
|---|---|
| `Minor#72085:2` | `false` |
| `Currency#72085:3` | `false` |
| `Addon#100902:0` | `true` |

В `Addon` используется library `IconView`. Его точный asset и `Size` не являются частью текущего AmountStyles manifest: они будут закреплены отдельным points pattern. До этого используй только значения из утверждённого макета или прямого указания владельца; произвольный asset/size запрещён.

## Effective baseline

- Root `Style` задаёт text style и геометрию всех текстовых частей.
- Variant change — component-property change.
- Ручные fill, text style, opacity или layout changes на leaf — layer customizations.
- Reset leaf customization выполняется на точном leaf target, а не сбрасывает `Style`.
- `Minus`, `Major`, `Minor`, `Currency` должны оставаться в одном text style и одном цвете.

## Source of truth

| Аспект | Источник |
|---|---|
| Public roots, variants, properties, anatomy | [Live Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=57377-15916) |
| Import keys и node IDs | [`figma-keys.json`](figma-keys.json) |
| Семантика, defaults, запреты | source `contract.overrides.json` + `rules.json` |
| Context rules | source `patterns/p_amount_component.md` |
| Core Amount anatomy | [`core/web/components/amount/figma/adapter.md`](../../../../core/web/components/amount/figma/adapter.md) |
| IconView anatomy и keys | [`core/web/components/icon-view/figma/adapter.md`](../../../../core/web/components/icon-view/figma/adapter.md) |
| Points availability | Прямое решение владельца продукта, 2026-07-24 |

При расхождении raw-каталога с живой Figma по структуре или prop names приоритет у живой Figma. Семантические правила не выводятся из геометрии и берутся из ручного контракта. Текущее source-правило откладывает баллы до отдельного паттерна; прямое решение владельца уже разрешает профиль выше, но не определяет будущие icon/size mappings.
