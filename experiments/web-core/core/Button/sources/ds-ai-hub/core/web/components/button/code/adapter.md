---
id: Button.adapter.code
layer: core
platforms: [web]
targets: [code]
status: draft
lastReviewed: 2026-08-10
---

# Адаптер: Button в коде

- Пакет — `@alfalab/core-components/button`
- Когда брать компонент — `../guidelines.md`
- Связь с Figma — `../bridge.md`

## Как применять

- Импорт: `@alfalab/core-components/button`.
- API и defaults — MCP `core-components` (ветка master).
- **По умолчанию** — `ButtonDesktop` / `ButtonMobile`, не адаптивная обёртка `Button`.
- View, размеры, состояния — по `../guidelines.md`; addon, loading, layout — по bridge.

## Импорт и выбор компонента

```tsx
import { ButtonDesktop, ButtonMobile, Button } from '@alfalab/core-components/button';
```

| Контекст | Компонент |
|---|---|
| Desktop-макет | `ButtonDesktop` |
| Mobile-макет | `ButtonMobile` |
| Адаптив (явный запрос) | `Button` |

Документация — Button: https://core-ds.github.io/core-components/master/?path=/docs/button--docs

## Props

| Свойство | Prop | Значения | Default |
|---|---|---|---|
| view | `view` | `accent`, `primary`, `secondary`, `outlined`, `transparent`, `text` | `secondary` |
| размер | `size` | `32`, `40`, `48`, `56`, `64`, `72` | `56` |
| форма | `shape` | `rectangular`, `rounded` | `rectangular` |
| инвертированные цвета | `colors` | `default`, `inverted` | `default` |
| текст | `children` | `ReactNode` | — |
| подпись | `hint` | `ReactNode` (только `size >= 56`) | — |
| слот слева / справа | `leftAddons` / `rightAddons` | `ReactNode` | — |
| disabled / loading / block | `disabled`, `loading`, `block` | `boolean` | `false` |
| ширина текста / перенос | `textResizing`, `nowrap` | `hug`/`fill`, `boolean` | `hug`, `false` |
| размытие фона | `allowBackdropBlur` | `boolean` | не задан |
| ссылка / тег | `href`, `Component` | — | — |
| брейкпоинт, SSR (только `Button`) | `breakpoint`, `client` | `number`, `desktop`/`mobile` | `1024`, — |

Иерархия view — `../guidelines.md`. Default без явного `view`:

```tsx
<ButtonDesktop size={56}>Label</ButtonDesktop>
```

## Ограничения (код)

- `view="text"` — без `shape="rounded"`.
- `hint` — только при `size >= 56`.
- `allowBackdropBlur` — для `secondary`, `outlined`, `transparent`; без макета prop не передавай (см. bridge → ControlBlur).
- Hover / focus / pressed — компонент рисует сам.

## Сценарии и примеры

Addon, Icon-20, loading, inverted, block, textResizing, nowrap — `../bridge.md`.

Смежные компоненты: `../../icon-button/cookbook.md`, `../../picker-button/cookbook.md` — см. `../guidelines.md`.
