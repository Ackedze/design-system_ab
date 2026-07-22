# AmountStyles

Machine-readable комплект семейства `Web _ Corp Components / AmountStyles` для Apollo, Athena CLI и agentic pipeline.

## Статус

`Ready`. Семантика component, composition, content, visual, responsive и interaction подтверждена владельцем. Targeted Athena checks, package validation и runtime-проверки Apollo пройдены. Skeleton и hover не являются пробелами комплекта: они будут определены отдельными будущими правилами.

## Назначение

- `🔒 [D] AmountHeadline` — Figma-only preset для крупных акцентных сумм на desktop.
- `🔒 [M] AmountHeadline` — Figma-only preset для крупных акцентных сумм на mobile-web.
- `🔒 AmountParagraph` — Figma-only preset для сумм в таблицах, списках, карточках и второстепенных значений.
- `Operation` — внутренняя служебная часть; отдельно не используется.

Прямых code exports у компонентов семейства нет.

## Источники

- Raw: `../Web _ Corp Components -- AmountStyles.json`.
- Index: `../../../indexes/web/components/web-corp/Web _ Corp Components -- AmountStyles.index.json`.
- Pattern: `../../../../../patterns/p_amount_component.md`.
- Generated contract: `contract.generated.json`, формируется Athena CLI.

## Состав комплекта

- `contract.generated.json` — generated variants и structural baseline.
- `contract.overrides.json` — ручная семантика presets, slots и reset model.
- `composition-contract.json` — ownership внутренних частей и effective baseline.
- `rules.json` — component rules и ссылки на pattern rules.
- `audit-mapping.json` — классификация и reset semantics для Apollo diffs.
- `examples.json` — regression cases Apollo и агента.
- `agent-context.json` — назначение, baselines и anti-hallucination context.

## Подтверждённые defaults

`Major` обязателен. По умолчанию `Minor` и `Currency` включены, `Operation` и `Addon` выключены. Опциональные части управляются штатными properties.

`Operation.Negative=True` показывает математический минус, `Negative=False` — плюс. Для отсутствия знака нужно выключить `Operation` штатным property.

Текст `Major`, `Minor` и `Currency` можно менять. Между разрядами используется математический пробел. В `Addon` можно разместить `IconView` или `StatusBadge` и настроить его штатными properties вложенного компонента; размер Addon не должен превышать line-height текста Amount.

Стиль всей суммы выбирается через `Style`; все доступные значения, включая `Accent`, разрешены по контексту соответствующей платформы. Ручное изменение text style отдельных `Operation`, `Minus`, `Major`, `Minor` или `Currency` запрещено.

`Operation`, `Major`, `Minor` и `Currency` используют один цвет. Дизайнер может вручную перекрасить все текстовые части Amount в общий контекстный токен. `IconView` и `StatusBadge` в Addon сохраняют собственные контекстные цвета. `text/positive` допустим только для пополнений в таблицах и табличных списках; остальные токены оцениваются по точным контекстным правилам. Изменение opacity у `Minor` и `Currency` запрещено.

Геометрия полностью соответствует effective baseline выбранного `Style`: direction, item spacing, alignment и размеры внутренних частей вручную не меняются. Для Currency можно выбрать любой штатный `Type`; `Custom` используется для отсутствующего кода валюты или символа.

В таблицах Amount выравнивается справа, основная сумма использует `Medium`, второстепенная — `Regular`. Валюта обязательно скрывается в значениях одновалютной колонки, если она уже указана в заголовке. В `TableBulkActions` не используются знак операции и `text/positive`; в steps рекомендуется `Regular`; в сайд-панели формат обязательно повторяет исходную страницу. Правило `Bold / Medium` для табличных списков относится только к Web Core Amount.

`🔒 [D] AmountHeadline` используется от `768 px`, `🔒 [M] AmountHeadline` — ниже `768 px`; `🔒 AmountParagraph` применяется на обеих платформах. Amount всегда остаётся в одну строку. Контейнер должен обеспечить достаточную ширину; при её недостатке Amount клипуется контейнером.

У семейства нет собственных loading, skeleton, disabled или error states. Skeleton будет описан отдельным pattern. Amount может быть кликабельным по контексту, но вручную добавлять подчёркивание, фон или эффекты нельзя; hover-состояния будут описаны позднее. `Operation`, `Minor`, `Currency` и `Addon` могут использоваться одновременно.

Внутри `AmountInput` используется `Amount` из Web Core. Контракт Figma-only presets Web Corp AmountStyles к нему не применяется.

Контейнер обеспечивает ширину для одной строки; при недостатке ширины он клипует Amount. Интерактивный `IconView` или `StatusBadge` внутри кликабельного Amount должен выполнять то же действие.

Для `ru-RU` используется запятая, математический пробел и математический минус без скобочной записи. `Minor` содержит один или два знака; значения с большей точностью округляются до двух знаков. `Major` содержит не более 13 символов без учёта математических пробелов. Ноль отображается как `0` или `0,00`. Для неизвестного значения Amount не используется: отдельным текстовым элементом выводится длинное тире `—`.

Порядок частей фиксирован: `Operation → Major → Minor → Currency → Addon`. Этот контракт применяется к денежным суммам и балансам. Баллы поддерживаются компонентом, но будут описаны отдельным паттерном; проценты и произвольные величины с единицами не относятся к AmountStyles.
