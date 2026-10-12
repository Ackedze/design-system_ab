---
id: Link.adapter.figma
layer: core
platforms: [web]
targets: [figma]
status: draft
lastReviewed: 2026-07-21
---

# Адаптер: Link в Figma

Привязка `Link` из этой папки компонента к инстансам [Web :: Core](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core) (`fileKey: lGWq8DtnUcSkRasagBuwq6`). Выбор типа и view — по общим правилам; здесь — component set и свойства инстанса.

Cross-target (Figma ↔ Code): `bridge.md` (рядом).

## Как применять

- Инстансы из библиотеки, не отрисовывай вручную.
- Отдельная ссылка с иконкой или вне абзаца — инстанс `Link`.
- Ссылка **внутри текста** без addon — стилизованный текст (цвет + подчёркивание), не обязательно инстанс `Link`.
- View, подчёркивание, addon — по `guidelines.md`; маппинг ↔ props — bridge.

## Component set

Реестр node-id: **`figma-keys.json`**. Документация: [Link — Default](https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=493-7757).

| Поле | Component set | node-id |
|---|---|---|
| `Link` | `Link` | `493:7843` |

Отдельных desktop/mobile/inverted наборов **нет**. Инверсия — оверрайд цвета или `colors="inverted"` в коде.

### Defaults

`Size=M (16-24)`, сплошное подчёркивание (`🔩 Underline` `Line=Solid`), `Left Addon=False`, `Right Addon=False`. Цвет по умолчанию в API кода — `view="primary"`; синяя ссылка — `view="default"` (см. `guidelines.md`).

## Свойства инстанса

**Variant properties:** `Size` — `S (14-20)`, `S (14-20) (Size-20 icons)`, `M (16-24)`, `L (18-24)`, `Custom`.

**Component properties:** `✎ Label`, `Left Addon`, `Right Addon`, swap `Left icon 16` / `Left icon 24` / `Right icon 16` / `Right icon 24`, swap `Left icon 20` / `Right icon 20` (glyph-26 20dp; только при `Size=S (14-20) (Size-20 icons)`).

**Цвет (view):** оверрайд текста / токена на инстансе — не variant (см. bridge → View).

**Подчёркивание:** вложенный **`🔩 Underline`** (`493:7883`) — `Line=Solid | Pseudo | None`; в спеке также может отображаться как свойство `Underline` на инстансе.

Полный маппинг variant/component properties ↔ props — **bridge**.

## Ограничения (Figma)

- `Line=None` на `🔩 Underline` — только с `view="default"` (синяя ссылка вне текста).
- Высота addon не выше line-height выбранного `Size`.
- Hover, pressed, focus — не собирать.
- `Size=Custom` — только если нужен кегль вне матрицы; проверь addon.

## Сценарии сборки

Встроенная ссылка в текст, псевдоссылка, addon, inverted — **bridge** (`bridge.md` (рядом)).
