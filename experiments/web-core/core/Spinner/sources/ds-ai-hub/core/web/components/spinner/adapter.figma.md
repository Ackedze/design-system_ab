---
id: Spinner.adapter.figma
layer: core
platforms: [web]
targets: [figma]
status: draft
lastReviewed: 2026-07-21
---

# Адаптер: Spinner в Figma

Привязка `Spinner` к [Web :: Core](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=24-19668) (`fileKey: lGWq8DtnUcSkRasagBuwq6`).

Cross-target: `bridge.md` (рядом).

## Component set

**Spinner** (`24:19668`). Реестр: **`figma-keys.json`**.

### Defaults

`Size=48`, `Static=False`, `Inverted=False`.

## Variant properties

| Property | Значения | Примечание |
|---|---|---|
| `Size` | 16, 24, 48 | ↔ `preset` в коде |
| `Inverted` | False, True | ↔ `colors` в коде |
| `Static` | False, True | только Figma |

## Использование

- **Standalone** — инстанс Spinner на макете.
- **В Button** — на `🔩 Addon` variant **`Type=Spinner`** (не swap glyph); `Label=false` (матрица по `view` — bridge Button → Loading).
- **В IconButton** — `🔩 Icon` → `Type=Spinner 24` / `Spinner 16`.

Детали — **bridge** (`bridge.md` (рядом), `bridge.md` (рядом)).

## Ограничения (Figma)

- Кастомный `size` / `lineWidth` из кода — нет variant.
- `visible` — нет variant; инстанс на макете или скрыт.
