---
id: Button.cookbook
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Cookbook: Button в Figma

- Устройство в Figma — `adapter.md`
- Figma keys — `keys.json`
- Сниппеты — `snippets.md`
- Когда брать компонент — `../guidelines.md`

## Импорт

Импорт: `importComponentSetByKeyAsync` по `componentSetKey` из `keys.json`, затем инстанс `defaultVariant`.

Актуальные наборы:

| Палитра | Desktop | Mobile |
|---|---|---|
| Default | `[D] Button` | `[M] Button` |
| Inverted | `[D] Button_Inverted` | `[M] Button_Inverted` |

View задаётся variant-свойством `View` на инстансе, не именем набора.

## Свойства инстанса

| Property | Plugin API key | Значения · default |
|---|---|---|
| `View` | `View` | `Accent`, `Primary`, `Secondary`, `Outlined`, `Transparent`, `Text` · технический default **`Accent`** |
| `Size` | `Size` | `32`, `40`, `48`, `56`, `64`, `72` · технический default **`72`** |
| `Shape` | `Shape` | `Rectangular`, `Rounded` · default **`Rectangular`** |
| `SingleIcon` | `SingleIcon` | `False`, `True` · default **`False`** |
| `DisabledState` | `DisabledState` | `False`, `True` · default **`False`** |
| `Label` / `Hint` / `LeftAddon` / `RightAddon` | ключи набора — ниже | BOOLEAN · технический default **`true`** |
| `✎ Label` / `✎ Hint` | ключи набора — ниже | TEXT · технические defaults **`Label`** / **`Hint`** |

### Ключи Label / Hint / Addon

Ключи зависят от набора (default / inverted):

| Набор | Left addon | Label text | Right addon | Hint text | Hint visible | Label visible |
|---|---|---|---|---|---|---|
| `[D] Button` / `[M] Button` | `LeftAddon#4:10` | `✎ Label#16:294` | `RightAddon#4:9` | `✎ Hint#16:149` | `Hint#4:8` | `Label#4:11` |
| `[D] Button_Inverted` | `LeftAddon#650:0` | `✎ Label#650:1` | `RightAddon#650:2` | `✎ Hint#650:3` | `Hint#650:4` | `Label#650:5` |
| `[M] Button_Inverted` | `LeftAddon#650:6` | `✎ Label#650:7` | `RightAddon#650:8` | `✎ Hint#650:9` | `Hint#650:10` | `Label#650:11` |

Бери ключи **с инстанса** или из строки таблицы для **этого** набора. У default и inverted суффиксы разные — чужие ключи на инстанс не ставь.

### Hint и Label

Скрыть Hint или Label — boolean `false`. Не очищай TEXT-проп (`✎ Hint`, `✎ Label`) пустой строкой — `skills/design-figma/01-cookbook/07-boolean-text-props.md`.

### Рабочий default сборки

Не полагайся на технический `defaultVariant`: он создаётся как `View=Accent`, `Size=72`, с включёнными
`Hint` и addons. Если задача не задаёт иное, рабочий default для макета — `View=Secondary`, `Size=56`,
`Label=true`, `Hint=false`, `LeftAddon=false`, `RightAddon=false`.

### Выставление свойств

Выставляй через `applyButtonProps` в `snippets.md`: helper применяет рабочий default и берёт
точные ключи Label / Hint / Addon с текущего инстанса. Для hint передай текст в `hint` и видимость в
`hintVisible`; если `hintVisible` не задан, наличие текста включает hint.

## Addons и sizing

- Включай addons boolean-свойствами выше.
- Вложенные контейнеры: `LeftAddon` / `RightAddon`. Библиотечный аддон — `Type` = `Icon-24`, `Icon-20`, `Spinner`, … Для кастома — `Type=SwapMe`: `swapComponent` INSTANCE **или** контент в `Slot` (**R8**, `../../icon/cookbook.md`); без detach.
- По ширине контента → `HUG`; на всю ширину родителя → `FILL` после `append` — `skills/design-figma/01-cookbook/04-auto-layout-sizing.md`.

### Иконки в addon

Copy-секция **«Для копирования»** в Web :: Core (`330:37554`): `[D] Light` (`330:50836`), `[M] Light` (`330:50773`). Правила одинаковы для `[D]` и `[M] Button`. Размеры слотов — `../bridge.md` → «Addon и иконки».

| `Button.Size` | `🔩 Addon` | Глиф внутри Addon (glyph-26, solid) |
|---|---|---|
| 72, 64, 56, 48 | **24** (`Type=Icon-24`) | **24dp** — обычные глифы (`chevron-down` / `dots-three-vertical`, `Size=m`) |
| 40, 32 | **16** (`Type=Icon-20`) | **20dp** через Icon-20 — compact-глифы (`chevron-down-compact`, `dots-three-vertical` `Size=s`) |

Клонируй готовый инстанс из copy-секции с нужным `Size` и типом (текст+шеврон / `SingleIcon`) — addon и глиф уже согласованы. Вручную: пресет `Type` или swap глифа **внутри** `Slot` / `PaintMe` в `🔩 Addon`, не весь addon.

Legacy `glyph_*` в новых макетах не используй. Общая политика иконок — `../../icon/cookbook.md`.

### Шевроны и PickerButton

Шевроны и иконки для PickerButton — `../../picker-button/cookbook.md`.

### `textResizing`

После `appendChild` и `button.layoutSizingHorizontal = 'FILL'` настрой фрейм `Text` и **оба** видимых слоя — `Label` и `Hint` (если `Hint=true`):

| Сценарий | `Text` frame | `Label` | `Hint` (если виден) |
|---|---|---|---|
| `textResizing="hug"` | `HUG` | `HUG`, `WIDTH_AND_HEIGHT` | `HUG`, `WIDTH_AND_HEIGHT` |
| `textResizing="fill"` | `FILL` | `FILL`, `HEIGHT`, `textAlignHorizontal = CENTER` | `FILL`, `HEIGHT`, `textAlignHorizontal = CENTER` |

Раскладка fill — `applyButtonFillTextLayout` в `snippets.md`.

### `nowrap` и перенос текста

После `appendChild` настрой слои `Text` и `Label` (шрифты — через `getStyledTextSegments`):

| Режим | Кнопка | `Label` | Фрейм `Text` |
|---|---|---|---|
| Без переноса (`nowrap`) | `HUG` по ширине, не `FILL` | `HUG`, `textAutoResize = WIDTH_AND_HEIGHT` | `HUG` |
| С переносом | `FILL` в узком родителе | `FILL`, `textAutoResize = HEIGHT` | `FILL` |

У родителя при `nowrap` выключи `clipsContent`, иначе длинный лейбл обрежется. Не ставь `textAutoResize = 'NONE'` и не сочетай `FILL` на кнопке с `nowrap`. Раскладка — `applyButtonNowrapLayout` в `snippets.md`.

### Размытие фона (ControlBlur)

У `secondary` / `outlined` / `transparent` effect **ControlBlur** в библиотеке включён по умолчанию — при сборке макета не выключай. Связь с `allowBackdropBlur` в коде — `../bridge.md`.

### Loading

Отдельного variant `loading` нет. Собери так:

1. `Label=false`, `LeftAddon=true`.
2. На `🔩 Addon` выставь `Type=Spinner` — не подменяй глиф на Spinner и не клади Spinner внутрь `Icon-24`.
3. Цвет Spinner (`Inverted` / `Static`) — по матрице view в `../bridge.md` → Loading; удобно вызвать `configureButtonLoadingSpinner(button, view)` из `snippets.md`.

Ключи Spinner — `../../spinner/cookbook.md`.

## Проверка

- Корень — `INSTANCE`, без detach.
- View, Size, Shape, Disabled, SingleIcon, Label / Hint / addons — как в задаче; если View / Size не заданы — helper явно выставил рабочие `Secondary` / `56`.
- Скрытые Hint и Label — boolean `false`; TEXT-пропы (`✎ Label`, `✎ Hint`) не затёрты пустой строкой.
- `textResizing` и `nowrap` — по таблицам выше; fill — `textAlignHorizontal = CENTER` на Label и Hint.
- У `secondary` / `outlined` / `transparent` effect ControlBlur не выключен.
- Loading: Addon с `Type=Spinner`; у вложенного `Spinner` (`name === 'Spinner'`) — `Inverted` / `Static` по матрице в `../bridge.md` для каждого view в секции View — Loading.
- Если в кнопке есть иконка — проверь по пунктам:
  - в слоте остался слой `🔩 Addon` (обёртка), его не выкинули;
  - иконка лежит **внутри** Addon, а не вместо него;
  - иконка из библиотеки **Icons** (набор glyph-26), не legacy-компонент `glyph_*` — см. `../../icon/cookbook.md`;
  - размер Addon: **24** при Size кнопки 48 / 56 / 64 / 72; **16** при Size 32 / 40.
