---
id: Amount.adapter.code
layer: core
platforms: [web]
targets: [code]
status: draft
lastReviewed: 2026-08-05
---

# Адаптер: Amount в коде

- Пакет — `@alfalab/core-components/amount`
- Когда брать компонент — `../guidelines.md`
- Связь с Figma — `../bridge.md`

## Как применять

- Импорт: `@alfalab/core-components/amount`.
- API и defaults — MCP `core-components` (ветка master).
- Только отображение; ввод — [`AmountInput`](../../amount-input/guidelines.md).

## Импорт

```tsx
import { Amount } from '@alfalab/core-components/amount';
```

Документация — Amount: https://core-ds.github.io/core-components/master/?path=/docs/amount--docs

## Props

| Свойство | Prop | Значения | Default |
|---|---|---|---|
| сумма (минорные ед.) | `value` | `number` | **обязателен** |
| минорность валюты | `minority` | `number` | **обязателен** (часто `100`) |
| валюта | `currency` | ISO-код (`RUB`, `USD`, …) | — |
| формат валюты | `codeFormat` | `symbolic`, `letter` | `symbolic` |
| копейки при нуле | `view` | `default`, `withZeroMinorPart` | `default` |
| жирность | `fontWeight` | `bold`, `medium`, `{ major: 'bold' }` или `{ major: 'medium' }` | **bold** на мажорной части, если не задан |
| приглушить копейки | `transparentMinor` | `boolean` | — (тема: opacity на минорной части) |
| плюс у положительных | `showPlus` | `boolean` | `false` |
| обрезать хвостовые нули | `trimZero` | `boolean` | `false` |
| слот справа | `rightAddons` | `ReactNode` | — |

`bold` — **deprecated**; используй `fontWeight`.

```tsx
<Typography.Text view="primary-medium" weight="regular">
  <Amount value={123456700} minority={100} currency="RUB" transparentMinor={false} />
</Typography.Text>

<Typography.Text view="primary-medium" weight="bold">
  <Amount value={123456700} minority={100} currency="RUB" fontWeight="bold" />
</Typography.Text>

<Amount
  value={150000}
  minority={100}
  currency="RUB"
  showPlus
  view="withZeroMinorPart"
  fontWeight="bold"
/>
```

## Ограничения (код)

- Нет prop размера/цвета — стиль с родителя (`Typography`, контейнер ячейки).
- Без `fontWeight` на `Amount` мажорная часть по умолчанию **bold**. Чтобы наследовать `weight` с `Typography.Text` (`regular`, `medium`), передай `transparentMinor={false}`.
- `value` всегда в минорных единицах; не передавай «рубли с плавающей точкой» напрямую.
- Ввод и маска — [`AmountInput`](../../amount-input/adapter.code.md), не этот компонент.

## Сценарии и примеры

Маппинг слоёв Figma `Amount` / `🔩 Major` / `Minor` / `Currency` / `Addon` — `../bridge.md`.

Смежный ввод: `../../amount-input/cookbook.md` — см. `../guidelines.md`.
