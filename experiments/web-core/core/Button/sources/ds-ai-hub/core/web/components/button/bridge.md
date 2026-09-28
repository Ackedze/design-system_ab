---
id: Button.bridge
layer: core
platforms: [web]
targets: [code, figma]
status: draft
lastReviewed: 2026-08-10
---

# Bridge: Button

Связь `Button` между Figma и `@alfalab/core-components`.

- Когда брать — `guidelines.md`
- Устройство в Figma — `figma/adapter.md`
- Сборка — `figma/cookbook.md`
- Ключи Figma — `figma/keys.json`
- API кода — MCP `core-components` (master)
- Storybook — Button: https://core-ds.github.io/core-components/master/?path=/docs/button--docs
- Figma (variants) — Default: https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=42-43028

---

## Figma component sets

| Поле bridge | Имя в Figma | node-id (component set) | Когда использовать |
|---|---|---|---|
| `figma.desktop` | `[D] Button` | `47:50695` | Макет под desktop |
| `figma.mobile` | `[M] Button` | `47:52208` | Макет под mobile |
| `figma.inverted.desktop` | `[D] Button_Inverted` | `650:19395` | Desktop на инвертированном фоне |
| `figma.inverted.mobile` | `[M] Button_Inverted` | `650:20356` | Mobile на инвертированном фоне |

`Button_Inverted` в Figma — отдельный component set, чтобы не раздувать матрицу вариантов. В коде это тот же `Button*` + `colors="inverted"`.

## Выбор реализации в коде

| Контекст | Компонент | Когда |
|---|---|---|
| Desktop-макет | `ButtonDesktop` | Генерация под desktop (по умолчанию) |
| Mobile-макет | `ButtonMobile` | Генерация под mobile |
| Адаптивный макет | `Button` | **Только** если дизайнер явно запросил адаптивность |

По умолчанию адаптивную обёртку **не** используй. Макеты собираются либо под desktop, либо под mobile.

```tsx
import {
  ButtonDesktop,
  ButtonMobile,
  Button,
} from '@alfalab/core-components/button';
```

## Алгоритм lookup: Figma → Code

1. Определи платформу макета → выбери `[D] Button` или `[M] Button` (или `*_Inverted`).
2. Прочитай **variant properties** инстанса (см. таблицу ниже).
3. Прочитай **component properties**: `Label`, `Hint`, `LeftAddon`, `RightAddon`, `✎ Label`, `✎ Hint`.
4. Собери props по правилам [анатомии](#анатомия-иконки-hint-loading) и [ограничений](#ограничения).
5. Выбери `ButtonDesktop` / `ButtonMobile` / `Button` (адаптивная обёртка) по контексту.
6. Если инстанс из `Button_Inverted` → добавь `colors="inverted"`.

## Алгоритм lookup: Code → Figma

1. Определи платформу → `[D] Button` или `[M] Button`.
2. Если `colors="inverted"` → используй `Button_Inverted` вместо обычного Button.
3. Выставь variant properties по таблице маппинга.
4. Настрой component properties, layout и effects по [анатомии](#анатомия-иконки-hint-loading) и [layout-параметрам](#layout-параметры-block-textresizing-nowrap-backdrop-blur).

---

## Маппинг: variant properties → props

Значения в bridge — **как в коде** (lowercase), если не указано иное.

| Figma variant property | Значения Figma | Prop в коде | Значения в коде |
|---|---|---|---|
| `View` | Accent, Primary, Secondary, Outlined, Transparent, Text | `view` | `accent`, `primary`, `secondary`, `outlined`, `transparent`, `text` |
| `Size` | 32, 40, 48, 56, 64, 72 | `size` | `32`, `40`, `48`, `56`, `64`, `72` |
| `Shape` | Rectangular, Rounded | `shape` | `rectangular`, `rounded` |
| `DisabledState` | False, True | `disabled` | `false`, `true` |
| `SingleIcon` | False, True | — | см. [SingleIcon](#singleicon) |

**`View=Text`:** в Figma доступен только `Shape=Rectangular`. В коде `view="text"` — без скруглённой формы.

## Маппинг: component properties → props

| Figma property | Тип | Prop / слот в коде |
|---|---|---|
| `Label` | BOOLEAN | видимость `children` (текст кнопки) |
| `✎ Label` | TEXT | содержимое `children` |
| `Hint` | BOOLEAN | видимость `hint` |
| `✎ Hint` | TEXT | содержимое `hint` |
| `LeftAddon` | BOOLEAN | видимость `leftAddons` |
| `RightAddon` | BOOLEAN | видимость `rightAddons` |
| `LeftAddon` → swap | INSTANCE_SWAP | `Icon-24#…` (слот 24) или `Icon-20#…` / `Icon-16#…` (слот 16) — содержимое `leftAddons` |
| `RightAddon` → swap | INSTANCE_SWAP | то же — содержимое `rightAddons` |

---

## Addon и иконки

Общая политика ассетов (glyph-26, diamonds, legacy, вшитые) — `../icon/cookbook.md`. Ниже — только слоты **Button**.

Вложенный компонент слота: **`🔩 Addon`**. Цвет одноцветной иконки задаётся на **обёртке Addon** (`Color=False`), не на swap-иконке — при обновлении иконки в библиотеке заливка сохраняется.

### Размер слота Addon

У `🔩 Addon` в Button **только два размера**: **24** и **16**. Другой размер в слот **нельзя**.

| `Button.size` | Размер `🔩 Addon` | Размер иконки в swap |
|---|---|---|
| 72, 64, 56, 48 | **24** | glyph-26 **24dp** |
| 40, 32 | **16** | glyph-26 **20dp** через адаптер (см. ниже) |

### Слот 16 + иконка 20 (Icon-20)

Общее правило — `../icon/cookbook.md` (слот 16 + Icon-20). В Button:

| Target | Figma | Code |
|---|---|---|
| Figma | `🔩 Addon` → вариант **Icon-20** (`Size=20`, `Style=Default`, `Color=False`) → swap `glyph-26_*_20` | — |
| Code | — | `Icon20Adapter` + `*20Icon` из `@alfalab/icons-glyph-26` |

См. Glyph-26 Icon Adapter: https://core-ds.github.io/core-components/master/?path=/docs/glyph-26-icon-adapter--docs

```tsx
import { Icon20Adapter } from '@alfalab/core-components-shared/icon-20-adapter';
import { Diamonds20Icon } from '@alfalab/icons-glyph-26/Diamonds20Icon';

<ButtonDesktop size={40} leftAddons={<Icon20Adapter icon={Diamonds20Icon} />}>
  Label
</ButtonDesktop>
```

Слот 24 — без адаптера:

```tsx
import { Diamonds24Icon } from '@alfalab/icons-glyph-26/Diamonds24Icon';

<ButtonDesktop size={56} leftAddons={<Diamonds24Icon color="var(--color-light-neutral-0)" />}>
  Label
</ButtonDesktop>
```

### Иконка по умолчанию и наборы

Заглушка diamonds, glyph-26 vs legacy, вшитые иконки других компонентов — `../icon/cookbook.md`. В слотах Button для новых макетов — только glyph-26; размеры Addon — таблица выше.

---

## Анатомия: иконки, hint, loading

### Обычная кнопка (label + опционально hint + addons)

- `children` ← `✎ Label` (если `Label=true`).
- `hint` ← `✎ Hint` (если `Hint=true` **и** `size >= 56`).
- `leftAddons` / `rightAddons` ← `🔩 Addon` с иконкой по правилам [выше](#addon-и-иконки).

### Иконка + текст

Скрывай ненужные слои через BOOLEAN-пропсы:

| Сценарий | Label | Hint | LeftAddon | RightAddon | SingleIcon |
|---|---|---|---|---|---|
| Только текст | true | по необходимости | false | false | False |
| Иконка слева + текст | true | по необходимости | true | false | False |
| Иконка справа + текст | true | по необходимости | false | true | False |
| Только иконка | false | false | true *или* false | false *или* true | True |

### SingleIcon

`SingleIcon=True` в Figma — отдельный view варианта, чтобы не конфликтовать с минимальной шириной кнопки.

В коде: **один** слот (`leftAddons` или `rightAddons`) **без** `children`.

- По умолчанию используй **`leftAddons`**.
- `rightAddons` — если в макете явно задействован правый слот.

### Hint

- В коде `hint` доступен только при `size >= 56` (размеры 56, 64, 72).
- В Figma: BOOLEAN `Hint` управляет **видимостью** слоя; `✎ Hint` — **текст**, только когда hint показывается.
- **Скрыть hint:** `Hint=false`. Не передавай `✎ Hint` и не записывай в него пустую строку — это стирает значение слота, а не прячет слой.
- **Показать hint:** `Hint=true` и задай `✎ Hint`.

### Loading

В Figma отдельного variant property для loading нет. Состояние собирается вручную:

1. `Label=false` — скрыть текст.
2. `LeftAddon=true` (по умолчанию) — спиннер в левом слоте.
3. На вложенном `🔩 Addon` выставь вариант **`Type=Spinner`** (это variant property Addon, не `INSTANCE_SWAP` glyph→Spinner и не Spinner внутри `Icon-24`). Размер Addon — как у обычной иконки (24 / 16). У появившегося Spinner задай `inverted` / `static` по `view` (таблица ниже). Component set **Spinner** — `../spinner/figma-keys.json`; маппинг props — `../spinner/cookbook.md` и `../spinner/bridge.md` (использование в Button / IconButton).
4. В коде: `loading={true}` (спиннер, цвет и минимальное время отображения — внутри компонента).

**Матрица Spinner в Figma** (size 56; для `[M] Button` — те же правила):

| `view` | Spinner `inverted` | Spinner `static` |
|---|---|---|
| `accent` | `true` | `true` |
| `primary` | `true` | `false` |
| `secondary` | `false` | `false` |
| `outlined` | `false` | `false` |
| `transparent` | `false` | `false` |
| `text` | `false` | `false` |

Пример loading-инстанса — Web :: Core, loading (desktop): https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=49-107887

Hover, pressed, focus в Figma для сборки макетов **не нужны**.

---

## Layout-параметры: block, textResizing, nowrap, backdrop blur

Отдельных variant properties нет — настраивается через auto-layout, effects и текстовые слои.

### `block`

Кнопка растягивается на ширину родительского контейнера.

| Код | Figma |
|---|---|
| `block={true}` | Инстанс `[D] Button` / `[M] Button` лежит в **autolayout-контейнере**; у инстанса **horizontal sizing = Fill** |

```tsx
<ButtonDesktop block view="accent" size={56}>Label</ButtonDesktop>
```

### `textResizing`

Ширина текстового контента внутри кнопки.

| Код | Figma |
|---|---|
| `textResizing="hug"` (default) | Фрейм `Text`, слои `Label` и `Hint` (если виден) — **Hug** по горизонтали |
| `textResizing="fill"` | Фрейм `Text`, слои `Label` и `Hint` (если виден) — **Fill** по горизонтали; `textAlignHorizontal = CENTER` на обоих текстовых слоях |

```tsx
<ButtonDesktop textResizing="fill" view="accent" size={56}>Fill</ButtonDesktop>
```

### `nowrap`

Перенос текста внутри кнопки.

| Код | Figma |
|---|---|
| `nowrap={true}` (default `false`) | Кнопка `HUG` в узком контейнере; `Label` → `WIDTH_AND_HEIGHT`. **Не** `FILL` — иначе текст обрежется |
| `nowrap={false}` | `Label` → `HEIGHT`; `Text` frame и `Label` → `FILL` в узком контейнере; кнопка растёт по вертикали |

```tsx
<ButtonDesktop nowrap view="accent" size={56}>Длинный текст без переноса</ButtonDesktop>
```

### `allowBackdropBlur`

Размытие фона для кнопок с прозрачным или полупрозрачным фоном (`secondary`, `outlined`, `transparent`).

| Код | Figma |
|---|---|
| `allowBackdropBlur={true}` | На инстансе кнопки включён effect **ControlBlur** (`BACKGROUND_BLUR`, radius 80) |
| `allowBackdropBlur={false}` | Effect **ControlBlur выключен** |
| prop не задан в коде | Effect **выключен** |

**Дефолты расходятся:**

| Среда | Поведение |
|---|---|
| **Figma** | У `view=secondary`, `outlined`, `transparent` effect **ControlBlur включён по умолчанию** — **не выключай** при сборке макета |
| **Код** | `allowBackdropBlur` **не задан** (`undefined`) — blur **выключен** |

**Правила для агента:**

- **Figma → макет:** сохраняй ControlBlur как в библиотеке; не снимай effect с полупрозрачных view.
- **Код без Figma-макета:** не передавай `allowBackdropBlur` — blur остаётся выключенным.
- **Код по Figma-макету:** если на инстансе ControlBlur **включён** → `allowBackdropBlur={true}`; если **выключен** → не передавай prop (или `false`).

```tsx
// Только если в Figma на инстансе включён ControlBlur:
<ButtonDesktop view="secondary" allowBackdropBlur>
  Label
</ButtonDesktop>
```

---

## Props без макетного аналога

Только в коде, в Figma не собираются: `href`, `Component`, `className`, `dataTestId`, `spinnerClassName`, `breakpoint`, `client`.

Фиксированная ширина в px — через `className` в коде; в Figma — задай ширину контейнера или инстанса вручную.

---

## Ограничения

| Правило | Figma | Code |
|---|---|---|
| Hint только в крупных размерах | `Hint=true` имеет смысл при `Size` ∈ {56, 64, 72} | `hint` при `size >= 56` |
| Label без видимого hint | `Hint=false`, не очищай `✎ Hint` | `children` без `hint` допустимо |
| Text view + rounded | `View=Text` → только `Shape=Rectangular` | `view="text"`, `shape="rectangular"` |
| Inverted | отдельный component set `Button_Inverted` | `colors="inverted"` |
| Приоритеты view | — | `guidelines.md` |

## Defaults

Технический default Figma и default кода различаются.

| Аспект | Figma | Код |
|---|---|---|
| View | технический default `Accent` | default `secondary` |
| Size | технический default `72` | default `56` |
| Shape | `Rectangular` | `rectangular` |
| Палитра | обычный set | `colors="default"` |
| Single icon / disabled | `False` / `False` | нет отдельного prop / `false` |
| Label / Hint / addons | технически включены в `defaultVariant` | контент и слоты не заданы |
| Layout | задаётся слоями | `textResizing="hug"`, `nowrap=false`, `loading=false` |
| Backdrop blur | включён для `Secondary` / `Outlined` / `Transparent` | `allowBackdropBlur` не задан, blur выключен |

Рабочий default генерации макета — явно выставленные `View=Secondary`, `Size=56`,
`Shape=Rectangular`, `SingleIcon=False`, `DisabledState=False`, `Label=true`, `Hint=false`, addons
выключены. Его применяет `applyButtonProps`; это согласованный продуктовый сценарий, а не технический
`defaultVariant` Figma. В коде те же view / size можно не передавать.

## Примеры

| Сценарий | Figma | Code |
|---|---|---|
| Рабочий default | `[D] Button`, явно `View=Secondary`, `Size=56`, без hint и addons | `<ButtonDesktop>Label</ButtonDesktop>` |
| Primary CTA, desktop | `View=Primary`, Size=56 | `<ButtonDesktop view="primary" size={56}>Оформить</ButtonDesktop>` |
| Иконка-кнопка, mobile | `[M] Button`, SingleIcon=True, LeftAddon | `<ButtonMobile view="secondary" size={56} leftAddons={<Icon />} />` |
| С hint | Size=64, Label + Hint | `<ButtonDesktop size={64} hint="Подпись">Label</ButtonDesktop>` |
| Inverted | `[D] Button_Inverted`, View=Accent | `<ButtonDesktop view="accent" colors="inverted">…</ButtonDesktop>` |
| Loading | Label=false, LeftAddon, `🔩 Addon` → `Type=Spinner` | `<ButtonDesktop view="accent" loading>…</ButtonDesktop>` |
| Block | Fill в autolayout-родителе | `<ButtonDesktop block>…</ButtonDesktop>` |
| Text fill | фрейм `Text` и слой `Label` — Fill | `<ButtonDesktop textResizing="fill">Fill</ButtonDesktop>` |
| No wrap | текст без переноса | `<ButtonDesktop nowrap>Длинный текст</ButtonDesktop>` |
| Backdrop blur (Figma default) | ControlBlur on | `allowBackdropBlur={true}` только если в макете включён |
| Backdrop blur off | ControlBlur off | prop не передавать |
| Адаптив (явный запрос) | — | `<Button view="primary" size={56}>…</Button>` |
