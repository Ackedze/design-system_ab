---
id: Amount.cookbook
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Cookbook: Amount в Figma

- Устройство в Figma — `adapter.md`
- Figma keys — `keys.json`
- Сниппеты — `snippets.md`
- Когда брать компонент — `../guidelines.md`

## Импорт

Импорт: `importComponentByKeyAsync` по `componentKey` из `keys.json` (`components.amount`).

Не собирай `Major` / `Minor` / `Currency` отдельными компонентами на странице.

## Свойства инстанса

| Property | Plugin API key | Тип / default |
|---|---|---|
| `Minor` | `Minor#72085:2` | boolean / `true` |
| `Currency` | `Currency#72085:3` | boolean / `true` |
| `Addon` | `Addon#100902:0` | boolean / `false` |

Типовой набор — `applyAmountProps(instance, { minor, currency, addon })`.

## Вложенные слои

- `Major` (`INSTANCE`) → public TEXT `✎ Major#487:0`, default `1 234 567`.
- `Minor` (`INSTANCE`) → public TEXT `✎ Minor#487:1`, default `,00`; `Opacity=False|True`.
- `Currency` (`INSTANCE`) → public TEXT `✎ Currency#487:4`, default ` Custom `; `Opacity=False|True`, `Type=₽|$|€|¥|RUB|USD|EUR|CNY|Custom`.
- `Addon` (`INSTANCE`) — опциональный контент справа; состав слота только из библиотеки или согласованной спеки.

Перед правкой текста `Major`, `Minor` или кастомной валюты загрузи текущие шрифты с текстового узла. Валюту задавай через `Type`, если значение есть в списке; оверрайд текста — только для `Custom`.

Если `Minor`, `Currency` или `Addon` нужно скрыть, сначала получи вложенные инстансы и задай им текст, `Opacity`, `Type` и Text Style. После этого примени boolean-свойства корня: runtime может исключить скрытую ветку из `findAllWithCriteria`.

## Типографика и строка с суффиксом

- Text Style задавай на видимых вложенных `TEXT` инстанса (`Major`, `Currency`, при необходимости `Minor`) после импорта и `setProperties`; либо наследуй от родителя строки. Не собирай сумму произвольным текстом вне инстанса `Amount`.
- Суффикс периода рядом с суммой (`в месяц`, `/ мес.` и т.п.) — отдельный `TEXT`, не часть `Amount`. В горизонтальном Auto Layout строки выравнивай по базовой линии (`counterAxisAlignItems = 'BASELINE'`), не по центру. Подробно — `skills/design-figma/01-cookbook/11-amount-baseline.md`.

## Проверка

- Корень `Amount` и видимые `Major` / `Minor` / `Currency` / `Addon` — `INSTANCE`, без detach.
- Видимость Minor / Currency / Addon и `Type` валюты совпадают с задачей; тексты `Major` / `Minor` (и `Currency` при `Custom`) — как задано.
- На canvas нет временных импортированных подкомпонентов `Major` / `Minor` / `Currency`.
- Если рядом суффикс периода — выравнивание строки по базовой линии (см. выше).
