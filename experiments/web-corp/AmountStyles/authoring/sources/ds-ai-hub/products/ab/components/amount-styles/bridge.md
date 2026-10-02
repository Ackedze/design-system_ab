---
id: AmountStyles.bridge
layer: product
product: ab
platforms: [web]
targets: [figma, code]
status: verified
lastReviewed: 2026-07-24
---

# Bridge: AmountStyles

AmountStyles связывает Figma-only presets с code intent, но не объявляет отдельный code component.

## Target contract

| Аспект | Figma | Code |
|---|---|---|
| Сущность | `AmountParagraph` / `[D|M] AmountHeadline` | Web Core `Amount` в типографическом контексте |
| Availability | available | `not-applicable` для прямого AmountStyles export |
| Style | Root variant `Style` | Окружающая типографика / подтверждённый Core API |
| Sign | Root `Operation` + nested `Negative` | Core Amount sign intent |
| Value | `Major`, `Minor` text | Числовое значение через Core Amount |
| Currency | Nested Currency visibility/type | Core Amount currency intent |
| Addon | Nested Addon with IconView/StatusBadge | Core Amount addon intent |
| Points | `Major`; Minor/Currency hidden; Addon=IconView | Product points intent, exact runtime mapping `[VERIFY]` |

Не выводи из таблицы несуществующие prop names.

## Source of truth

| Аспект | Источник |
|---|---|
| Визуал, variants, properties, anatomy | Live Figma |
| Product semantics и запреты | source `contract.overrides.json` + `rules.json` |
| Context rules | source `patterns/p_amount_component.md` |
| Exact runtime API | Core Amount MCP / code adapter |
| Reset and audit ownership | source `composition-contract.json` + `audit-mapping.json` |
| Points availability | Прямое решение владельца продукта, 2026-07-24 |

## Figma → semantic model

1. Определи root: paragraph, desktop headline или mobile headline.
2. Прочитай `Style`.
3. Прочитай root boolean `Operation`.
4. Внутри `Operation` прочитай `Negative`.
5. Внутри Core `Amount` прочитай visibility `Minor`, `Currency`, `Addon`.
6. Прочитай `Major`, `Minor`, `Currency` text properties.
7. Зафиксируй общий text style и общий text color.
8. Зафиксируй контекст: table, table-list, TableBulkActions, steps, side panel или другое.
9. Если это баллы, проверь `Minor=false`, `Currency=false`, `Addon=true` и main component Addon=`IconView`.
10. Отдельно зафиксируй leaf customizations для reset.

## Semantic model → Figma

1. Выбери public root по роли и каналу страницы.
2. Выбери штатный `Style`.
3. Создай library instance по component set key.
4. Установи Operation на root.
5. Установи Negative на nested Operation.
6. Настрой Major/Minor/Currency/Addon на nested Core Amount.
7. Для баллов скрой Minor/Currency и добавь в Addon IconView по подтверждённому asset/size.
8. Применяй только общую контекстную color variable ко всем текстовым parts.
9. Выполни Verify из cookbook.

## Reset ownership

| Изменение | Категория | Reset target |
|---|---|---|
| `Style` | component property | root preset |
| `Negative` | nested component property | Operation instance |
| `fill` на `Minus` | layer property | exact `Minus` leaf |
| `fill` на `Major|Minor|Currency` | layer property | exact text leaf |
| `styles.text` | forbidden layer property | exact changed leaf |
| `opacity` на Minor/Currency | forbidden layer property | exact changed part/leaf |

Variant change не поглощает независимые leaf customizations.

## Explicit divergence

AmountStyles использует вложенную анатомию Web Core Amount, но не является code-аналогом Core Amount один-к-одному. Это Figma-only preset layer. В `AmountInput` применяется обычный Core Amount, и правила AmountStyles к нему не относятся.

Source-контракт ранее помечал points как `separate-pattern`. Решение владельца от 2026-07-24 разрешает использовать AmountStyles для баллов уже сейчас. Неполной остаётся только будущая детализация конкретной иконки и соответствия размеров; эти значения нельзя угадывать.
