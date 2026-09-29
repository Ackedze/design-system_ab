---
id: Amount.bridge
layer: core
platforms: [web]
targets: [code, figma]
status: draft
lastReviewed: 2026-08-05
---

# Bridge: Amount

Связь `Amount` между Figma и `@alfalab/core-components`.

- Когда брать — `guidelines.md`
- Устройство в Figma — `figma/adapter.md`
- Сборка — `figma/cookbook.md`
- Ключи Figma — `figma/keys.json`
- API кода — MCP `core-components` (master)
- Storybook — Amount: https://core-ds.github.io/core-components/master/?path=/docs/amount--docs
- Figma (docs) — Amount: https://www.figma.com/design/lGWq8DtnUcSkRasagBuwq6/Web----Core?node-id=485-67053

---

## Figma component

| Поле bridge | Имя в Figma | node-id | Когда |
|---|---|---|---|
| `figma.amount` | `Amount` | `485:67101` | отображение суммы |
| `figma.amount.major` | `🔩 Major` | `485:67037` | слой мажорной части |
| `figma.amount.minor` | `🔩 Minor` | `485:67039` | слой минорной части |
| `figma.amount.currency` | `🔩 Currency` | `485:67044` | валюта |
| `figma.amount.addon` | `🔩 Addon` | `485:67049` | слот справа |

## Выбор реализации в коде

```tsx
import { Amount } from '@alfalab/core-components/amount';
```

Обёртка со стилем типографики — `Typography.Text` / контейнер ячейки. Ввод — `AmountInput` → `../amount-input/cookbook.md`.

---

## Алгоритм lookup: Figma → Code

1. Подтверди инстанс `Amount` (`485:67101`).
2. Прочитай оверрайды вложенных инстансов:
   - `Major` → characters (разряды, опциональный `+` в начале);
   - `Minor` → characters (`,XX` или пусто); variant `Opacity`;
   - `Currency` → variant `Type`, `Opacity`; при `Custom` — текст;
   - `Addon` → видимый контент → `rightAddons` (в коде).
3. Собери `value` в минорных единицах: мажорная + минорная части × `minority` (для RUB обычно `100`).
4. `Type=₽` → `currency="RUB"`, `codeFormat="symbolic"`; `RUB`/`USD`/… → `codeFormat="letter"`.
5. `Opacity=True` на `Minor` (и при необходимости `Currency`) → `transparentMinor={true}`.
6. Пустая `Minor` при нулевых копейках → `view="default"`; `,00` при нуле → `view="withZeroMinorPart"`.
7. Кегль/вес в макете — Text Style на вложенных `TEXT` `Amount` и/или обёртка `Typography.Text` с тем же стилем; не отдельный prop размера у `Amount`.

## Алгоритм lookup: Code → Figma

1. Инстанс `Amount` из библиотеки.
2. Отформатируй сумму так же, как `formatAmount` в коде (или задай оверрайды по визуалу макета):
   - `Major` — целая часть + `+` при `showPlus`;
   - `Minor` — минорная часть с разделителем;
   - `Currency` — `Type` по `codeFormat` + `currency`;
   - `Addon` — контент `rightAddons`.
3. `transparentMinor` → `Opacity=True` на `Minor` / `Currency`.
4. Типографика — Text Style на видимых вложенных `TEXT` инстанса (как в `figma/cookbook.md`); суффикс периода — отдельный `TEXT`, строка по базовой линии.

---

## Маппинг: слои / variants → props

| Figma | Prop в коде |
|---|---|
| текст `Major` (число) + `Minor` | `value`, `minority` |
| `Currency.Type=₽` / `$` / `€` / `¥` | `currency` + `codeFormat="symbolic"` |
| `Currency.Type=RUB` / `USD` / … | `currency` + `codeFormat="letter"` |
| `Minor.Opacity=True` (и/или `Currency.Opacity=True`) | `transparentMinor={true}` |
| пустая `Minor` при нулевых копейках | `view="default"` |
| `Minor` = `,00` при нуле | `view="withZeroMinorPart"` |
| `+` в начале `Major` | `showPlus={true}` |
| контент `Addon` | `rightAddons` |
| Text Style на `TEXT` суммы / родителя строки | обёртка `Typography.Text` (`view` по typography bridge) |

### Примеры

| Сценарий | Figma | Code |
|---|---|---|
| Баланс | `1 234 567,00 ₽`, Opacity на минорной | `<Amount value={123456700} minority={100} currency="RUB" transparentMinor />` |
| Без копеек | `1 234 567 ₽`, Minor пустой | `<Amount value={123456700} minority={100} currency="RUB" />` |
| Пополнение | `+1 500,00 ₽` | `<Amount value={150000} minority={100} currency="RUB" showPlus view="withZeroMinorPart" />` |
| Код валюты | `Type=RUB` | `<Amount … currency="RUB" codeFormat="letter" />` |

## Props без прямого variant в Figma

| Prop | Примечание |
|---|---|
| `trimZero` | только код (`1,70` → `1,7`) |
| `fontWeight` | вес мажорной части; в Figma — Text Style родителя или ручной вес на слоях |
| `className`, `dataTestId` | код |

## Defaults

Единый default для Figma и кода (сверено с MCP `core-components`, ветка **master**):

| Prop | Default |
|---|---|
| `minority` | **обязателен**; RUB → `100` |
| `codeFormat` | `symbolic` |
| `view` | `default` (скрывает нулевые копейки) |
| `showPlus` | `false` |
| `trimZero` | `false` |

В Figma default-инстанс: `Minor` и `Currency` видимы (`true`), `Addon` скрыт (`false`). Ключи boolean — `figma/cookbook.md`.

## Связанные компоненты

| Компонент | Связь |
|---|---|
| `AmountInput` | ввод; `../amount-input/cookbook.md` |
| `Typography.Text` | стиль строки вокруг суммы |
| `Text` | вложенный `Amount` в `children` — `../text/cookbook.md` |
