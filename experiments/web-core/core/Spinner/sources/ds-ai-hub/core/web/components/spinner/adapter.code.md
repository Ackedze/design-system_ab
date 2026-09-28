---
id: Spinner.adapter.code
layer: core
platforms: [web]
targets: [code]
status: draft
lastReviewed: 2026-07-21
---

# Адаптер: Spinner в коде

Привязка `Spinner` к `@alfalab/core-components`.

Cross-target: `bridge.md` (рядом).

## Как применять

- Импорт: `@alfalab/core-components/spinner`.
- API — MCP `core-components` (master).
- Пресеты: **16**, **24**, **48**.
- В Button / IconButton — `loading={true}`, не вставляй `<Spinner />` вручную.

## Props

| Свойство | Prop | Значения | Default |
|---|---|---|---|
| пресет | `preset` | `16`, `24`, `48` | — |
| кастом | `size`, `lineWidth` | `number` (без `preset`) | — |
| палитра | `colors` | `default`, `inverted` | `default` |
| видимость | `visible` | `boolean` | `false` |

```tsx
import { Spinner } from '@alfalab/core-components/spinner';

<Spinner visible preset={24} />
```

Не смешивай `preset` с `size` / `lineWidth`.

## Ограничения (код)

- `Static` — только Figma, prop нет.
- Standalone — `visible={true}` при отображении.

## В родительских компонентах

Параметры вложенного Spinner в Figma задаёт Button / IconButton — **bridge** Button / IconButton → loading.
