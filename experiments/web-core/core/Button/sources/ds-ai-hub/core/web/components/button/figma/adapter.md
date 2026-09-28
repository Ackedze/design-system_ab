---
id: Button.adapter.figma
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Адаптер: Button в Figma

- Ключи импорта — `keys.json`
- Механическая модель — `model.json`
- Когда брать компонент — `../guidelines.md`
- Связь с кодом — `../bridge.md`
- Сборка — `cookbook.md`

## Как применять

- Инстансы из библиотеки, не отрисовывай вручную.
- Макет — **либо desktop** (`[D] Button`), **либо mobile** (`[M] Button`).
- View, размеры — по `../guidelines.md`; addon, loading, layout — по `../bridge.md` / `cookbook.md`.

## Component sets

Реестр node-id: **`keys.json`**. Секция вариантов — Button Default: https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=42-43028

| Контекст | Component set | node-id |
|---|---|---|
| Desktop | `[D] Button` | `47:50695` |
| Mobile | `[M] Button` | `47:52208` |
| Desktop inverted | `[D] Button_Inverted` | `650:19395` |
| Mobile inverted | `[M] Button_Inverted` | `650:20356` |

`Button_Inverted` — отдельный набор (`colors="inverted"` в коде).

### Технические defaults Figma

`View=Accent`, `Size=72`, `Shape=Rectangular`, `SingleIcon=False`, `DisabledState=False`.

Component properties нового `defaultVariant`: `Label=true`, `Hint=true`, `LeftAddon=true`,
`RightAddon=true`; тексты — `Label` и `Hint`. Точные ключи по наборам зафиксированы в
`model.json` и таблице cookbook.

Это технический default библиотеки, не рекомендуемый сценарий продукта. Если задача не задаёт view и
size, `applyButtonProps` явно выставляет рабочий default `View=Secondary`, `Size=56` по
`../guidelines.md` и текущему API кода.

## Свойства инстанса

**Variant properties:** `View`, `Size`, `Shape`, `DisabledState`, `SingleIcon`.

**Component properties:** `Label`, `✎ Label`, `Hint`, `✎ Hint`, `LeftAddon`, `RightAddon` + swap (`🔩 Addon`).

Вложенный слот: **`🔩 Addon`**. Библиотечные variant `Type` (`Icon-24`, `Icon-20`, `Spinner`, …) — не `SwapMe`. Кастом — `Type=SwapMe`: `swapComponent` вложенного INSTANCE **или** контент в `Slot` (**R7** / **R8**). Секция деталей addon: [node `25:20038`](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=25-20038) (`keys.json` → `addon.size24` / `addon.size16`).

Полный маппинг variant/component properties ↔ props — `../bridge.md`. Ключи Plugin API по наборам — `cookbook.md`.

## Ограничения (Figma)

- `View=Text` → только `Shape=Rectangular`.
- `Hint=false` скрывает слой hint; не очищай `✎ Hint` пустой строкой — `skills/design-figma/01-cookbook/07-boolean-text-props.md`.
- `Hint=true` имеет смысл при `Size` 56, 64, 72.
- Hover, pressed, focus — не собирать.

## Сценарии сборки

SingleIcon, hint, inverted, loading, block, textResizing, nowrap, ControlBlur — `cookbook.md` и `../bridge.md`.

Смежные компоненты: `../../icon-button/cookbook.md`, `../../picker-button/cookbook.md` — выбор типа — `../guidelines.md`.
