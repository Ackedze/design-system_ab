---
id: Spinner.bridge
layer: core
platforms: [web]
targets: [code, figma]
status: draft
lastReviewed: 2026-07-21
---

# Bridge: Spinner

Связь `Spinner` между Figma Web :: Core и `@alfalab/core-components`.

API — MCP `core-components` (master). Figma — [Spinner](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=24-19668) (`lGWq8DtnUcSkRasagBuwq6`); node-id — `../spinner/figma-keys.json`. Адаптеры — `../spinner/adapter.code.md`, `../spinner/adapter.figma.md`.

[Storybook](https://core-ds.github.io/core-components/master/?path=/docs/spinner--docs)

## Figma component set

| Поле bridge | Имя в Figma | node-id | Когда использовать |
|---|---|---|---|
| `figma.spinner` | `Spinner` | `24:19668` | Отдельный индикатор загрузки или swap в слотах Button / IconButton |

Один component set для всех сценариев; отдельных desktop/mobile/inverted наборов **нет** — инверсия через variant `Inverted`.

## Выбор реализации в коде

```tsx
import { Spinner } from '@alfalab/core-components/spinner';
```

Адаптивной обёртки нет — один компонент `Spinner`.

---

## Алгоритм lookup: Figma → Code

1. Прочитай **variant properties** инстанса `Spinner` (таблица ниже).
2. Если инстанс вложен в Button / IconButton при `loading` — см. [использование в родителях](#использование-в-button-и-iconbutton).
3. Для standalone-спиннера собери props:
   - `Size` → `preset`
   - `Inverted` → `colors`
   - `visible={true}` — в витрине и при отображении на экране
4. `Static` в Figma **не имеет** prop в коде (см. ниже).

## Алгоритм lookup: Code → Figma

1. Если задан `preset` — выставь `Size` на инстансе `Spinner`.
2. Если `colors="inverted"` → `Inverted=True`, иначе `Inverted=False`.
3. По умолчанию `Static=False` для standalone; при вложении в Button — матрица по `view` (см. ниже).
4. Кастомный размер (`size` + `lineWidth` без preset) — в Figma нет прямого аналога; используй ближайший `Size` или собери вручную только если дизайнер явно запросил нестандартный размер.

---

## Маппинг: variant properties → props

Значения в bridge для кода — **lowercase**, если не указано иное.

| Figma variant property | Значения Figma | Prop в коде | Значения в коде |
|---|---|---|---|
| `Size` | 16, 24, 48 | `preset` | `16`, `24`, `48` |
| `Inverted` | False, True | `colors` | `default`, `inverted` |
| `Static` | False, True | — | **нет prop в коде** |

### `Static` — только Figma

Variant `Static` управляет **статичным кольцом** в макете (без анимации в Figma). В коде анимация всегда включена при `visible={true}`.

| Сценарий | `Static` в Figma |
|---|---|
| Standalone на экране | `False` (по умолчанию) |
| Вложен в Button / IconButton при loading | по матрице `view` — см. [ниже](#использование-в-button-и-iconbutton) |

### Кастомизация (без preset)

| Код | Figma |
|---|---|
| `preset={16\|24\|48}` | `Size=16\|24\|48` |
| `size={number}` + `lineWidth={number}` | нет variant; ближайший `Size` или ручная сборка |
| `style={{ color: '…' }}` | цвет кольца через токен / переменную в макете |
| `visible={true}` | спиннер виден на экране |

В режиме `preset` props `size` и `lineWidth` **не передавай** — они задаются пресетом внутри компонента.

---

## Использование в Button и IconButton

Spinner часто не рисуется отдельно — он вложен в родителя при загрузке.

| Родитель | Слот в Figma | Код | Детали |
|---|---|---|---|
| Button | `🔩 Addon` → variant **`Type=Spinner`** (не swap glyph) | `loading={true}` | `core/web/components/button/bridge.md` → Loading |
| IconButton | `🔩 Icon` → `Type=Spinner 24` / `Spinner 16` | `loading={true}` | `core/web/components/icon-button/bridge.md` → Loading |

**Матрица `Inverted` / `Static` для Spinner внутри Button** (size кнопки 56; для `[M] Button` — те же правила):

| `view` кнопки | Spinner `Inverted` | Spinner `Static` |
|---|---|---|
| `accent` | `True` | `True` |
| `primary` | `True` | `False` |
| `secondary` | `False` | `False` |
| `outlined` | `False` | `False` |
| `transparent` | `False` | `False` |
| `text` | `False` | `False` |

Размер Spinner в слоте Button: **24** для кнопок 48–72, **16** для 32–40 (через `🔩 Addon` Size 24 / 16).

В IconButton слот `🔩 Icon` уже содержит варианты `Spinner 24` / `Spinner 16`; отдельную матрицу `inverted`/`static` по `view` **не задавай**.

---

## Props без макетного аналога

Только в коде:

| Prop | Примечание |
|---|---|
| `visible` | управление видимостью; в Figma инстанс либо на макете, либо скрыт |
| `className`, `id`, `dataTestId`, `style` | служебные / кастомизация |

---

## Ограничения

| Правило | Figma | Code |
|---|---|---|
| Стандартные размеры | 16, 24, 48 | `preset` 16, 24, 48 |
| Инверсия | variant `Inverted` | `colors="inverted"` |
| Статичное кольцо | variant `Static` | нет аналога |
| Анимация | только в коде | всегда при `visible={true}` |

## Defaults

| Prop | Figma (default инстанса) | Code (MCP master) |
|---|---|---|
| `preset` / `Size` | `Size=48` | нет default preset в API — в примерах передают явно |
| `colors` / `Inverted` | `Inverted=False` | `default` |
| `Static` | `False` | — |
| `visible` | — | `false` |

При cross-target генерации для **preset** всегда бери фактический `Size` инстанса.

### Примеры

| Сценарий | Figma | Code |
|---|---|---|
| Default preset 24 | `Size=24, Static=False, Inverted=False` | `<Spinner visible preset={24} />` |
| Inverted на тёмном фоне | `Inverted=True` | `<Spinner visible preset={48} colors="inverted" />` |
| Мелкий в кнопке | `Size=16` в слоте Addon | `<ButtonDesktop loading>…</ButtonDesktop>` |
| Кастом | — | `<Spinner visible size={28} lineWidth={4} style={{ color: 'var(--color-light-decorative-text-red)' }} />` |
