---
id: AmountStyles.instructions
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# AmountStyles

Figma-only пресеты типографики суммы для AB. Публичные roots:

- `🔒 AmountParagraph` — суммы в таблицах, списках, карточках и второстепенные значения;
- `🔒 [D] AmountHeadline` — крупная акцентная сумма на desktop;
- `🔒 [M] AmountHeadline` — крупная акцентная сумма на mobile-web.

`Operation` — внутренняя часть. Не вставляй её отдельно.

## Когда использовать

- Денежная сумма или баланс, для которых нужен готовый Figma-пресет типографики.
- Количество баллов: `Minor=false`, `Currency=false`, `Addon=true` с `IconView`.
- `AmountParagraph` — на desktop и mobile-web.
- `[D] AmountHeadline` — только на desktop.
- `[M] AmountHeadline` — только на mobile-web.

## Когда не использовать

- Для процентов и произвольных величин с единицами.
- Для неизвестного значения: вместо Amount выведи отдельный текстовый элемент `—`.
- Для `AmountInput`: внутри него используется [`Web Core Amount`](../../../../core/web/components/amount/guidelines.md), а не контракт AmountStyles.
- Для прямой реализации в коде: у AmountStyles нет code export.

## Выбор пресета и Style

Любой штатный `Style` выбранного пресета разрешён по контексту. `Accent` в `AmountParagraph` не ограничен таблицами.

| Root | Доступные `Style` |
|---|---|
| `🔒 AmountParagraph` | `Paragraph 14/20`, `Paragraph 16/20`, `Paragraph 16/24`, `Action 14/20`, `Action 16/20`, `Action 16/24`, `Accent 14/20`, `Accent 16/20`, `Accent 16/24` |
| `🔒 [D] AmountHeadline` | `Headline 18/22`, `Headline 22/26`, `Headline 30/36`, `Headline 40/48`, `Headline 48/52` |
| `🔒 [M] AmountHeadline` | `Headline 16/20`, `Headline 20/28`, `Headline 26/32`, `Headline 30/36`, `Headline 34/40` |

Стиль всей суммы задаётся только `Style`. Ручное изменение text style у `Operation`, `Minus`, `Major`, `Minor` или `Currency` запрещено.

## Анатомия и defaults

Порядок фиксирован:

```text
Operation → Major → Minor → Currency → Addon
```

- `Major` обязателен.
- `Minor` и `Currency` включены по умолчанию.
- `Operation` и `Addon` выключены по умолчанию.
- Опциональные части могут быть включены одновременно.
- `Minor`, `Currency` и `Addon` принадлежат вложенному Core `Amount`, а не root preset.
- В `Addon` разрешены `IconView` и `StatusBadge`; их размер не превышает line-height текста.

Не меняй вручную порядок, direction, spacing, alignment или размеры частей: геометрия следует effective baseline текущего `Style`.

## Значение

- Для `ru-RU` используй запятую как десятичный разделитель.
- Между разрядами `Major` используй математический пробел.
- Для списания используй математический минус, не дефис и не тире.
- `Operation.Negative=True` показывает минус; `Negative=False` — плюс.
- Чтобы убрать знак, выключи `Operation`; не заменяй текст вручную.
- `Minor` содержит один или два знака. Большую точность округли до двух знаков до отображения.
- `Major` содержит не более 13 символов без учёта межразрядных пробелов.
- Ноль отображается как `0` или `0,00`.
- Скобочная запись отрицательной суммы запрещена.

Правила `Minor`, округления и валюты относятся к денежному профилю. В профиле баллов `Minor` и `Currency` скрыты.

## Баллы

AmountStyles разрешён для отображения баллов:

```text
Major → Addon: IconView
```

- `Major` содержит количество баллов.
- На nested Core `Amount` установи `Minor=false`, `Currency=false`, `Addon=true`.
- В `Addon` размести библиотечный Core `IconView` с иконкой баллов.
- Размер `IconView` должен соответствовать текущему `Style` AmountStyles и не превышать его line-height.
- Не используй `StatusBadge` вместо IconView для обозначения баллов.

Точный asset и таблица соответствия `Style → IconView.Size` будут определены отдельным паттерном. До его появления не угадывай их: бери из конкретного утверждённого макета или явного указания владельца и фиксируй `[VERIFY]`.

## Цвет и акцент

- `Operation`, `Minus`, `Major`, `Minor` и `Currency` используют один text style и один цветовой токен.
- Разрешено перекрасить все текстовые части в один контекстный токен.
- Нельзя перекрашивать только одну часть.
- `IconView` и `StatusBadge` в `Addon` сохраняют собственные контекстные цвета.
- `text/positive` разрешён только для пополнений в таблицах и табличных списках.
- Для списаний используй `text/primary`; красный и другие статусные цвета запрещены.
- Не меняй opacity у `Minor` и `Currency` и не включай их component property `Opacity`; штатное значение — `Opacity=False`.

## Контекстные правила

### Таблицы

- Выравнивай сумму вправо.
- Основная сумма использует `Medium`, второстепенная — `Regular`.
- Если валюта уже указана в заголовке одновалютной колонки, выключи `Currency` во всех значениях.

### TableBulkActions

- Выключи `Operation`.
- Используй нейтральный цвет; `text/positive` запрещён.

### Steps и side panel

- В steps рекомендуется `Regular`; другой штатный Style допустим только как осознанное контекстное решение.
- В side panel повтори формат значения с исходной страницы.

## Layout, states и interaction

- Amount всегда остаётся в одну строку.
- Контейнер обеспечивает ширину; при нехватке ширины он клипует Amount.
- Не применяй перенос, ellipsis, fade или ручное сокращение.
- У AmountStyles нет собственных loading, skeleton, disabled и error states.
- Кликабельность определяется контекстом.
- Не добавляй вручную underline, фон или эффекты для обозначения кликабельности.
- Если `Addon` интерактивен внутри кликабельного Amount, он выполняет то же действие.

## Источники

- Семантика и запреты: `JSONS/web/components/web-corp/AmountStyles/contract.overrides.json` и `rules.json` в `Ackedze/design-system_ab`.
- Паттерн: `patterns/p_amount_component.md` в том же репозитории.
- Варианты и анатомия: [live Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=57377-15916).
- Ключи и точная структура: [`figma-keys.json`](figma-keys.json) и [`adapter.figma.md`](adapter.figma.md).
