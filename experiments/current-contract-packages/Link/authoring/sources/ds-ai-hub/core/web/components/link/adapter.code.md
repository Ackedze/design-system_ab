---
id: Link.adapter.code
layer: core
platforms: [web]
targets: [code]
status: draft
lastReviewed: 2026-07-21
---

# Адаптер: Link в коде

Привязка `Link` из этой папки компонента к `@alfalab/core-components`. Выбор типа, view и подчёркивания — по общим правилам; здесь — импорт, props и сборка в коде.

Cross-target (Figma ↔ Code): `bridge.md` (рядом).

## Как применять

- Импорт: `@alfalab/core-components/link`.
- API и defaults — MCP `core-components` (ветка master).
- Размер — через обёртку `Typography.Text`; у `Link` prop размера **нет**.
- View, `pseudo`, `underline`, addon — по `guidelines.md`; маппинг с Figma — bridge.

## Импорт и выбор компонента

```tsx
import { Link } from '@alfalab/core-components/link';
import { Typography } from '@alfalab/core-components/typography';
```

Адаптивной обёртки нет — один компонент `Link`.

Документация: [Link — Storybook](https://core-ds.github.io/core-components/master/?path=/docs/link--docs).

## Props

| Свойство | Prop | Значения | Default |
|---|---|---|---|
| тип / цвет | `view` | `default` (синяя), `primary` (текст), `secondary` (второст. текст) | `primary` |
| пунктирное подчёркивание | `pseudo` | `boolean` | `false` |
| подчёркивание | `underline` | `boolean` | `true` |
| текст | `children` | `ReactNode` | — (**required**) |
| слот слева / справа | `leftAddons` / `rightAddons` | `ReactNode` | — |
| палитра | `colors` | `default`, `inverted` | `default` |
| URL | `href` | `string` | — |
| кастомный тег / роутер | `Component` | `ElementType` | `pseudo ? 'button' : 'a'` |
| disabled (native) | `disabled` | `boolean` | — |

При `pseudo={true}` по умолчанию рендерится `<button type="button">`, не `<a>`.

### Размер через Typography

```tsx
<Typography.Text view="primary-medium">
  <Link view="primary" href="/tariffs">
    тарифа
  </Link>
</Typography.Text>
```

Синяя отдельная ссылка: `view="default"`. Соответствие Figma `Size` ↔ `Typography.Text` — **bridge**.

## Ограничения (код)

- `underline={false}` — только с `view="default"` (см. `guidelines.md`).
- Hover / focus — компонент рисует сам.
- Встроенная ссылка в абзаце — без addon; размер только от родителя.

## Сценарии и примеры

Обычная ссылка, псевдоссылка, без подчёркивания, addon, inverted, роутер — **bridge** (`bridge.md` (рядом)).
