---
id: Amount.adapter.figma
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Адаптер: Amount в Figma

- Ключи импорта — `keys.json`
- Когда брать компонент — `../guidelines.md`
- Связь с кодом — `../bridge.md`
- Сборка — `cookbook.md`

## Как применять

- Сумма в макете — инстанс **`Amount`** из библиотеки. Сборка слотов — `cookbook.md`.
- Типографика (кегль, стиль) — Text Style на видимых вложенных `TEXT` (`Major`, `Currency`, при необходимости `Minor`) после импорта; либо наследование от родителя строки. Суффикс периода (`в месяц` и т.п.) — отдельный `TEXT`, строка с выравниванием по базовой линии — `skills/design-figma/01-cookbook/11-amount-baseline.md` и `cookbook.md`.
- Ввод суммы — **`[D] AmountInput` / `[M] AmountInput`** (`../../amount-input/cookbook.md`), не `Amount`.

## Component

Реестр: **`keys.json`**. Секция **[Default]** (`485:67100`).

| Ключ | Имя в Figma | node-id | Назначение |
|---|---|---|---|
| `amount` | `Amount` | `485:67101` | Отформатированная сумма |
| `major` | `🔩 Major` | `485:67037` | Мажорная часть (текст) |
| `minor` | `🔩 Minor` | `485:67039` | Минорная часть |
| `currency` | `🔩 Currency` | `485:67044` | Символ или код валюты |
| `addon` | `🔩 Addon` | `485:67049` | Слот справа |

`Amount` — **одиночный компонент** (не component set). Variant properties на корне **нет**. На корне есть boolean видимости слотов (`Minor`, `Currency`, `Addon`) — ключи и defaults в `cookbook.md`.

### Анатомия инстанса `Amount`

| Слой | Назначение |
|---|---|
| `Major` | Целая часть и разделители разрядов; опционально «+» в начале |
| `Minor` | Дробная часть (`,00`); variant `Opacity` |
| `Currency` | Валюта; variants `Opacity`, `Type` |
| `Addon` | Доп. контент справа; состав слота только из библиотеки или согласованной спеки |

### `🔩 Minor` — variant properties

| Property | Значения |
|---|---|
| `✎ Minor#487:1` | TEXT; default `,00` |
| `Opacity` | `False`, `True` |

Текст минорной части — оверрайд `✎ Minor` на вложенном тексте.

### `🔩 Currency` — variant properties

| Property | Значения |
|---|---|
| `✎ Currency#487:4` | TEXT; default ` Custom `, используется при `Type=Custom` |
| `Opacity` | `False`, `True` |
| `Type` | `₽`, `$`, `€`, `¥`, `RUB`, `USD`, `EUR`, `CNY`, `Custom` |

При `Type=Custom` — оверрайд `✎ Currency` на тексте.

## Ограничения (Figma)

- Нет variant для `showPlus`, `view`, `trimZero` — настраивай текстовые оверрайды на `Major` / `Minor` или собирай в коде по `../bridge.md`.
- Маппинг `Opacity` / `Currency.Type` и прочих props на код — `../bridge.md`.
