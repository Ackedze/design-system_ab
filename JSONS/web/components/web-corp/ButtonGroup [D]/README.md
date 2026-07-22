# ButtonGroup [D]

Machine-readable комплект семейства `Web _ Corp Components / ButtonGroup [D]` для Apollo, Athena CLI и agentic pipeline.

## Статус

`Draft / In progress`. Продуктовая семантика подтверждена владельцем. До статуса `Ready` нужны targeted Athena sync/check, проверка registries и минимум один корректный и один нарушающий runtime-кейс в Apollo.

## Назначение

- `[D] ButtonsGroup` — рабочая desktop-группа связанных кнопок; существует в Figma и коде.
- `[M] ButtonsGroup` — рабочая mobile-web-группа связанных кнопок; существует в Figma и коде.

Для связанных действий предпочтительно использовать `ButtonsGroup`, а не ручную композицию отдельных `Button`.

## Источники

- Raw: `../Web _ Corp Components -- ButtonGroup [D].json`.
- Index: `../../../indexes/web/components/web-corp/Web _ Corp Components -- ButtonGroup [D].index.json`.
- Pattern: `../../../../../patterns/p_buttons-and-buttons-group.md`.
- Generated contract: `contract.generated.json`, формируется Athena CLI.

## Состав комплекта

- `contract.generated.json` — generated variants и structural baseline.
- `contract.overrides.json` — public API, variant semantics и reset model.
- `composition-contract.json` — ownership вложенных Button и effective baseline.
- `rules.json` — component rules и ссылки на pattern rules.
- `audit-mapping.json` — host integration и reset semantics для Apollo diffs.
- `examples.json` — regression cases Apollo и агента.
- `agent-context.json` — назначение, baselines и anti-hallucination context.

## Подтверждённая модель

В `[D] ButtonsGroup` допускается до четырёх видимых кнопок, в `[M] ButtonsGroup` — до двух. Минимум — одна видимая кнопка. Используются только штатные button slots: их можно скрывать и показывать, включая средний слот, но нельзя добавлять, дублировать или заменять через instance swap.

Primary необязателен. Если он есть, то должен быть единственным и располагаться первым. Остальные действия идут слева направо в порядке убывания приоритета. Все вложенные кнопки используют общий `Size` группы: `32`, `40`, `48` или `56`. Остальные настройки следуют контракту соответствующего `[D] Button` или `[M] Button`.

Группа всегда горизонтальная и использует `Hug / Hug`. Direction, item spacing и остальные visual/layout properties сохраняются по effective baseline. Ручные изменения fill, stroke, radius, padding, spacing, opacity, effects и typography запрещены.

`Overflow=true` можно включать добровольно уже в группе из двух кнопок. Он переводит последнюю кнопку в `SingleIcon=true`. Иконка этой кнопки фиксирована; сама кнопка используется только для открытия списка скрытых действий и всегда остаётся последней.

На desktop SingleIcon открывает `[D] OptionList`, на mobile-web — `BottomSheet` только со списком действий без footer. Первым переносится действие кнопки непосредственно перед SingleIcon, затем перенос продолжается справа налево. Пункты сохраняют label, action, наличие icon и disabled state исходных действий. Если у исходной кнопки иконки нет, пункт также остаётся без иконки. Disabled-пункт показывает Tooltip с причиной недоступности. После выбора доступного действия поверхность сразу закрывается. Количество скрытых действий отдельно не ограничено. Одно действие нельзя одновременно оставлять видимым и дублировать в списке.

Общего Disabled или Loading state у Figma-компонента нет. Loading разрешён у отдельной видимой Button по её контракту. У `OptionListCell` нет Loading state; поведение скрытого действия, которое перешло в Loading, пока не определено и не должно трактоваться агентом как правило. Общий Skeleton существует в коде, но пока отсутствует в Figma и будет добавлен позднее.

В Apollo variant changes вложенной Button показываются как параметры компонента. Ручные paint/layout/style changes остаются отдельными параметрами слоя и сравниваются с effective baseline после применения текущих View, Size и других variant properties.
