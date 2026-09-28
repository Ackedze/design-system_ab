---
id: Spinner.cookbook
layer: core
platforms: [web]
targets: [figma]
status: draft
lastReviewed: 2026-07-29
---

# Cookbook: Spinner в Figma

Правила выбора — `adapter.figma.md`. Figma keys — `figma-keys.json`.
Универсальные операции — `skills/design-figma/SKILL.md` → `skills/design-figma/01-cookbook/01-index.md`. Метки — `skills/design-figma/glossary.md`.
Import — **R2**; текст/поверхности/fills — **R5**, **R11**, **R4**; verify — **R12**.
Paste-JS — `skills/design-figma/02-code-snippets/26-spinner.md` (`applySpinnerProps`).

## Стабильные свойства

| Ключ | Значения |
|---|---|
| `Size` | `48`, `24`, `16` |
| `Static` | `False`, `True` |
| `Inverted` | `False`, `True` |

База: `Size=48`, `Static=False`, `Inverted=False`. Свойства — `applySpinnerProps` (Paste-JS).

## Размеры

- Держи intrinsic-размер; масштабируй только если adapter разрешает.
- Клади в Auto Layout, когда нужны отступы/центрирование.
- Не правь vectors, не перекрашивай сырыми paints, не detach и не пересобирай spinner.

## Inverted-секции витрины

Toggle `Inverted` → **две секции**. Цвет заголовка и фон — skill **R6** / **R11** / `assertSectionTitleSeed` (**R12**). Spinner:

| Секция | Spinner |
|---|---|
| `Section — Inverted` (toggle off, light surface) | `Inverted=False` |
| `Section — Inverted — Inverted` (toggle on, inverted surface) | `Inverted=True` |

Инстанс для `Inverted=True` создавай из variant `Inverted=True`, не полагайся только на `setProperties` после импорта другого variant.

## Проверка

- `INSTANCE`; Size/Static/Inverted соответствуют сценарию.
- Inverted-секции: skill **R6** / **R12** (seed + variable); structural fills — **R4**.
