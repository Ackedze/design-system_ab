---
id: Link.cookbook
layer: core
platforms: [web]
targets: [figma]
status: draft
lastReviewed: 2026-07-29
---

# Cookbook: Link в Figma

Правила выбора — `adapter.figma.md`. Figma keys — `figma-keys.json`.
Универсальные операции — `skills/design-figma/SKILL.md` → `skills/design-figma/01-cookbook/01-index.md`. Метки — `skills/design-figma/glossary.md`.
Import / addons — **R2**, **R8**; verify — **R12**.
Paste-JS — `skills/design-figma/02-code-snippets/23-link.md` (`applyLinkProps`).

## Стабильные свойства

| Property | Plugin API key | Значения · default |
|---|---|---|
| `Size` | `Size` | `S (14-20)`, `S (14-20) (Size-20 icons)`, `M (16-24)`, `L (18-24)` |
| `✎ Label` | `✎ Label#493:29` | string |
| `Left Addon` | `Left Addon#60204:0` | boolean |
| `Right Addon` | `Right Addon#60204:4` | boolean |
| `Left icon 16` | `Left icon 16#493:13` | instance swap |
| `Right icon 16` | `Right icon 16#493:17` | instance swap |
| `Right icon 24` | `Right icon 24#493:21` | instance swap |
| `Left icon 24` | `Left icon 24#493:25` | instance swap |
| `Left icon 20` | `Left icon 20#145985:35` | instance swap (glyph-26 20dp) |
| `Right icon 20` | `Right icon 20#145985:40` | instance swap (glyph-26 20dp) |

Свойства корня — `applyLinkProps` (Paste-JS).

## Addons и текст

- Для иконки включи нужный addon, импортируй компонент иконки и используй matching swap 16/24/20 или `swapComponent()` на вложенном инстансе иконки.
- Иконка **20dp** (glyph-26) при размере S — variant **`Size=S (14-20) (Size-20 icons)`** (`145981:19242`), swap **`Left icon 20`** / **`Right icon 20`**; не обычный `S (14-20)` с icon 16.
- Стабильный вложенный слой подчёркивания: `Underline` (`INSTANCE`). Задай его свойство `Line` в `Solid`, `Pseudo` или `None`; ограничения — в `adapter.figma.md`.
- Не подменяй лейбл ссылки отдельным текстовым узлом.
- View ссылки — semantic override text-fill, не variant. Variable бери через color guide и bridge; никогда raw RGB.
- Держи intrinsic-ширину, если паттерн вокруг явно не растягивает контейнер ссылки.

## Проверка

- Итоговый узел — `INSTANCE` Web :: Core.
- Size, label, видимость addon и underline совпадают с запросом.
- Вложенная иконка остаётся `INSTANCE`; временных узлов нет.
