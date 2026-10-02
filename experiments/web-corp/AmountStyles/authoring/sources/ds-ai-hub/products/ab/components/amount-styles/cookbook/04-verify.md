---
id: AmountStyles.cookbook.04-verify
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# AmountStyles — Verify

Overview — [`01-overview.md`](01-overview.md). Проверка обязательна после каждого рецепта.

## Library integrity

- Root — library `INSTANCE` одного из трёх public presets.
- Main component key совпадает с [`figma-keys.json`](../figma-keys.json).
- `Operation` не используется отдельно.
- Nested `Amount`, Major, Minor, Currency и Addon не detached.
- Нет вручную нарисованных копий частей суммы.

## Preset and Style

- Paragraph используется на обеих платформах для обычных сумм.
- Desktop headline используется только на desktop.
- Mobile headline используется только на mobile-web.
- `Style` существует у выбранного component set.
- Text style leaf-слоёв не переопределён вручную.

## Anatomy

- Порядок: Operation → Major → Minor → Currency → Addon.
- Major присутствует и видим.
- Minor/Currency/Addon настроены на nested Amount, не на root.
- Operation настроен root boolean; Negative — на nested Operation.
- Addon содержит только IconView или StatusBadge и не выше line-height.

## Content

- Между разрядами Major — математический пробел.
- Для отрицательного значения — математический минус.
- Minor содержит один или два знака.
- Значение с большей точностью округлено до двух знаков.
- Major не длиннее 13 символов без межразрядных пробелов.
- Ноль — `0` или `0,00`.
- Unknown value не представлен AmountStyles.
- Проценты и arbitrary units не представлены AmountStyles.
- Баллы представлены AmountStyles только через points profile.

## Visual

- Operation, Minus, Major, Minor, Currency используют один text style и один color token.
- Addon сохраняет собственные contextual colors.
- Opacity Minor/Currency не изменён.
- Нет ручных geometry overrides.
- Сумма остаётся в одну строку.
- При нехватке ширины клипует контейнер; нет wrap, ellipsis или fade.

## Context

- Table выровнена вправо.
- Table primary/secondary используют Medium/Regular.
- Валюта не дублируется при header currency.
- TableBulkActions не имеет знака и `text/positive`.
- Side panel совпадает с исходной страницей.
- `text/positive` используется только для пополнения в table/table-list.
- Списание использует `text/primary`.

### Points

- Minor скрыт.
- Currency скрыта.
- Addon включён.
- Addon содержит library IconView, не StatusBadge и не вручную нарисованную иконку.
- IconView не выше line-height текущего Style.
- Asset и Size имеют явный источник; до публикации points pattern неподтверждённое значение помечено `[VERIFY]`.

## States and interaction

- Не добавлены выдуманные loading, skeleton, disabled или error states.
- Для кликабельности нет ручного underline/background/effects.
- Интерактивный Addon выполняет то же действие, что Amount.

## Evidence report

Зафиксируй:

- root name и main component key;
- выбранный канал страницы;
- Style;
- Operation/Negative;
- Major/Minor/Currency values;
- visibility Minor/Currency/Addon;
- контекст и общий color token;
- для баллов — IconView main component, asset, Size и источник выбора;
- exact leaf customizations, если они есть;
- все оставшиеся `[VERIFY]`.
