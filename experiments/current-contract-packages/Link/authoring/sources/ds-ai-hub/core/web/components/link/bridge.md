---
id: Link.bridge
layer: core
platforms: [web]
targets: [code, figma]
status: draft
lastReviewed: 2026-07-21
---

# Bridge: Link

Связь `Link` между Figma Web :: Core и `@alfalab/core-components`. Выбор — `guidelines.md`.

API — MCP `core-components` (master). Figma — [Web :: Core](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core) (`lGWq8DtnUcSkRasagBuwq6`); node-id — `../link/figma-keys.json`. Адаптеры — `../link/adapter.code.md`, `../link/adapter.figma.md`.

[Storybook](https://core-ds.github.io/core-components/master/?path=/docs/link--docs) · [Figma docs](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=493-7757)

---

## Figma component set

| Поле bridge | Имя в Figma | node-id | Когда использовать |
|---|---|---|---|
| `figma.link` | `Link` | `493:7843` | Отдельная ссылка, ссылка с addon |

Вложенный компонент: **`🔩 Underline`** (`493:7883`) — тип линии подчёркивания.

Один component set для всех сценариев; отдельных desktop/mobile наборов **нет**.

## Выбор реализации в коде

```tsx
import { Link } from '@alfalab/core-components/link';
import { Typography } from '@alfalab/core-components/typography';
```

Адаптивной обёртки нет — один компонент `Link`.

---

## Алгоритм lookup: Figma → Code

1. Определи контекст:
   - инстанс `Link` с addon или вне абзаца → компонент `Link`;
   - текст в абзаце без addon → `Link` внутри `Typography.Text` (см. [встроенная ссылка](#встроенная-ссылка-в-тексте)).
2. Прочитай **variant property** `Size`.
3. Прочитай **цвет текста** (оверрайд / токен) → `view` в коде.
4. Прочитай вложенный **`🔩 Underline`**: `Line=Solid | Pseudo | None`.
5. Прочитай **component properties**: `✎ Label`, `Left Addon`, `Right Addon`, swap-иконки.
6. Собери props по таблицам ниже.
7. Оберни в `Typography.Text` с `view` по матрице [Size → Typography](#size-figma--typographytext-в-коде).

## Алгоритм lookup: Code → Figma

1. Если `leftAddons` / `rightAddons` или ссылка отдельно от абзаца → инстанс `Link`.
2. Если ссылка внутри текста без addon → стилизованный текст в Figma (см. [встроенная ссылка](#встроенная-ссылка-в-тексте)).
3. Выставь variant properties по таблицам.
4. Настрой swap-иконки и `🔩 Underline` по [addon](#addon-и-иконки) и [подчёркиванию](#маппинг-underline--underline-pseudo).

---

## Маппинг: variant properties → props

Значения в bridge для кода — **lowercase**, если не указано иное.

| Figma variant property | Значения Figma | Prop в коде | Значения в коде |
|---|---|---|---|
| `Size` | S (14-20), S (14-20) (Size-20 icons), M (16-24), L (18-24), Custom | — | через `Typography.Text` — [таблица](#size-figma--typographytext-в-коде) |

### Цвет (`view`) — Figma `View` / оверрайд → prop в коде

| Figma `View` / смысл цвета | `view` в коде |
|---|---|
| Default / link-color, синяя | `default` |
| Primary / `text-primary` | `primary` |
| Secondary / `text-secondary` | `secondary` |

Default в API — `primary`. Не путать Figma `View=Default` (синяя) с кодом `view="primary"` (цвет текста).

### Маппинг `🔩 Underline` → `underline` / `pseudo`

| `🔩 Underline` `Line` | `underline` | `pseudo` | `view` (ограничение) |
|---|---|---|---|
| `Solid` | `true` | `false` | любой |
| `Pseudo` | `true` | `true` | любой |
| `None` | `false` | `false` | **только** `default` |

В спеке Figma свойство может называться `Underline` (`Default` / `Pseudo` / `—`) — маппинг тот же.

---

## Size (Figma) → Typography.Text (в коде)

В коде у `Link` **нет** prop размера.

| Figma `Size` | Typography.Text `view` | Иконка в addon (glyph) |
|---|---|---|
| S (14-20) | `primary-small` | 16dp (`diamonds` / `s`) |
| S (14-20) (Size-20 icons) | `primary-small` | glyph-26 **20dp** (`Diamonds20Icon` / `Icon20Adapter`) |
| M (16-24) | `primary-medium` | 24dp (`diamonds` / `m`) |
| L (18-24) | `primary-large` | 24dp (`diamonds` / `m`) |
| Custom | ближайший `Typography.Text` по кеглю | подобрать по line-height |

Отступ между addon и текстом в Figma: **4px** для S, **8px** для M и L.

---

## Маппинг: component properties → props

| Figma property | Тип | Prop / слот в коде |
|---|---|---|
| `✎ Label` | TEXT | `children` |
| `Left Addon` | BOOLEAN | видимость `leftAddons` |
| `Right Addon` | BOOLEAN | видимость `rightAddons` |
| `Left icon 16` / `Left icon 24` / `Left icon 20` | INSTANCE_SWAP | содержимое `leftAddons` |
| `Right icon 16` / `Right icon 24` / `Right icon 20` | INSTANCE_SWAP | содержимое `rightAddons` |

---

## Addon и иконки

| Figma `Size` | Swap-слот | Размер иконки |
|---|---|---|
| S (14-20) | `Left icon 16` / `Right icon 16` | glyph **16dp** (`DiamondsSIcon` и аналоги) |
| S (14-20) (Size-20 icons) | `Left icon 20` / `Right icon 20` | glyph-26 **20dp** (`Diamonds20Icon` / `Icon20Adapter`) |
| M (16-24), L (18-24) | `Left icon 24` / `Right icon 24` | glyph **24dp** (`DiamondsMIcon` и аналоги) |

```tsx
import { Diamonds20Icon } from '@alfalab/icons-glyph-26/Diamonds20Icon';
import { Icon20Adapter } from '@alfalab/core-components/icon-20-adapter';

<Typography.Text view="primary-small">
  <Link view="default" href="/docs" leftAddons={<Icon20Adapter><Diamonds20Icon /></Icon20Adapter>}>
    Документация
  </Link>
</Typography.Text>
```

```tsx
import { DiamondsMIcon } from '@alfalab/icons-glyph/DiamondsMIcon';

<Typography.Text view="primary-medium">
  <Link view="default" href="/docs" rightAddons={<DiamondsMIcon />}>
    Документация
  </Link>
</Typography.Text>
```

---

## Встроенная ссылка в тексте

| Target | Реализация |
|---|---|
| Figma | фрагмент текста с подчёркиванием (и при необходимости цветом); Figma hyperlink на слой; **без** инстанса `Link`, если нет addon |
| Code | `Typography.Text` + вложенный `<Link view="primary" href="…">фрагмент</Link>` |

Пример из спеки: слово «тарифа» внутри абзаца 14/20 с подчёркиванием, цвет как у текста.

---

## Сценарии сборки

### Обычная ссылка (переход)

| Figma | Code |
|---|---|
| `🔩 Underline` `Line=Solid`, синий link-color, `Size=M (16-24)` | см. ниже |

```tsx
<Typography.Text view="primary-medium">
  <Link view="default" href="/path">
    Label
  </Link>
</Typography.Text>
```

### Псевдоссылка

| Figma | Code |
|---|---|
| `🔩 Underline` `Line=Pseudo` | `pseudo={true}`, `onClick` вместо `href` |

```tsx
<Typography.Text view="primary-medium">
  <Link pseudo view="default" onClick={handleOpen}>
    Показать детали
  </Link>
</Typography.Text>
```

### Без подчёркивания (вне текста)

```tsx
<Typography.Text view="primary-medium">
  <Link view="default" underline={false} href="/path">
    Label
  </Link>
</Typography.Text>
```

### Inverted

| Figma | Code |
|---|---|
| ссылка на инвертированном фоне | `colors="inverted"` |

---

## Props без макетного аналога

| Prop | Примечание |
|---|---|
| `Component` | роутер (`react-router` Link и т.п.) |
| `className`, `dataTestId`, `style` | служебные |
| `target`, `rel` | native; для `_blank` — `rel="noopener"` |

## Defaults

| Prop / variant | Figma (default инстанса) | Code (MCP master) |
|---|---|---|
| `view` | Figma `View` / оверрайд | `primary` (API); синяя — `default` |
| `underline` / `pseudo` | `🔩 Underline` `Line` | `true` / `false` |
| `colors` | — (оверрайд при необходимости) | `default` |
| `Size` | `M (16-24)` | — (`Typography.Text` `primary-medium`) |

При cross-target для **размера** всегда бери фактический `Size` инстанса и подбирай `Typography.Text`.

---

## Ограничения

| Правило | Figma | Code |
|---|---|---|
| Без подчёркивания | `🔩 Underline` `Line=None` + цвет `default` | `underline={false}` + `view="default"` |
| Псевдоссылка | `Line=Pseudo` | `pseudo={true}`, `button` |
| Размер | variant `Size` | родительский `Typography.Text` |
| Главный CTA | не `Link` | используй `Button` |
| Addon в тексте | не инстанс `Link` | `Link` без addon внутри `Typography.Text` |
