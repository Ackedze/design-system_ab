---
id: AmountStyles.cookbook.03-contexts
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# AmountStyles — контексты

Overview — [`01-overview.md`](01-overview.md). Сборка — [`02-build.md`](02-build.md).

## Table

- Root: `🔒 AmountParagraph`.
- Выравнивание: вправо.
- Primary amount: Style с `Medium`.
- Secondary amount: Style с `Regular`.
- Если валюта указана в header одновалютной колонки, выключи Currency у всех values.
- `text/positive` разрешён только для пополнения.
- Для списания используй `text/primary`, не красный.

## Table list

- Root: `🔒 AmountParagraph`.
- `text/positive` разрешён только для пополнения.
- Правило `Bold / Medium` из общего Amount pattern относится к Web Core Amount и не переносится автоматически на AmountStyles.
- Выбери штатный Style по роли суммы.

## Points

- AmountStyles разрешён для количества баллов.
- Root и `Style` выбираются по роли значения и каналу страницы.
- `Major` содержит значение.
- `Minor=false`, `Currency=false`, `Addon=true`.
- Addon содержит Core `IconView` соответствующего размера.
- Конкретные icon asset и `Style → IconView.Size` будут заданы отдельным points pattern. До этого используй только подтверждённый макет или прямое указание; не угадывай.

## TableBulkActions

- Root: `🔒 AmountParagraph`.
- `Operation=false`.
- Цвет нейтральный; `text/positive` запрещён.

## Steps

- Root выбирается по роли и каналу страницы.
- Рекомендуется `Regular`.
- Другой штатный Style допустим как осознанное контекстное решение и требует фиксации в evidence.

## Side panel

- Повтори root, формат, видимость частей, знак и валюту соответствующего значения на исходной странице.
- Не «нормализуй» side panel отдельно.

## Large headline

- Desktop: `🔒 [D] AmountHeadline`.
- Mobile-web: `🔒 [M] AmountHeadline`.
- Не используй desktop preset на канале mobile-web и наоборот.

## Unknown value

Не создавай AmountStyles instance. Выведи `—` отдельным библиотечно оформленным текстовым элементом.

## Interaction

Amount может быть кликабельным только по сценарию. Не добавляй underline, фон или effects вручную. Если Addon интерактивен, его действие совпадает с действием Amount.
