# Pattern: AccountSelect

- documentType: pattern
- patternType: component
- component: AccountSelect
- patternId: ptrn:components.account-select
- patternKey: components.account-select
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System
- status: draft
- updatedAt: 2026-07-16
- sourceType: component-guideline
- tags: account-select, accounts, option-list, single-select, multi-select, grouped
- figmaLink: https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=30810-131081
- sections: 10

## Section 1: Определение

`AccountSelect` — семейство компонентов Альфа-Бизнеса для одиночного или множественного выбора счетов. Публичными точками использования являются `[D] AccountOptionListContent` и `[M] AccountOptionListContent`.

Остальные компоненты семейства формируют внутреннюю структуру списка, ячеек и данных счёта и не используются отдельно.

## Section 2: Когда использовать

Используйте AccountSelect, когда пользователю нужно:

- выбрать один счёт;
- выбрать несколько счетов;
- просмотреть баланс или полный номер счёта перед выбором;
- выбрать счёт из плоского или сгруппированного списка;
- работать со списком счетов на desktop или Mobile Web.

## Section 3: Когда не использовать

Не используйте:

- служебные `AccountOptionCell`, `AccountOptionCells`, `GroupedAccountOptionCell`, `AccountInfo` или `AccountItem` отдельно;
- `AccountItem.Type=SwapMe` в финальном макете;
- legacy-вариант `AccountItem.Type=❌ Number`;
- `AccountInfo / Sum` для `AccountItem.Type=Number`;
- `AccountInfo / Number` для `AccountItem.Type=Sum`.

## Section 4: Принципы

1. `SelectType=Single` позволяет выбрать один счёт.
2. `SelectType=Multi` позволяет выбрать несколько счетов через Checkbox без ограничения количества.
3. `Grouped=True` группирует счета по критерию продуктовой команды.
4. По умолчанию счета группируются по принадлежности к компании.
5. Все группы раскрыты по умолчанию, пользователь может сворачивать их по отдельности.
6. Порядок групп фиксирован и не меняется.
7. В `Single` checkmark расположен справа, в `Multi` Checkbox расположен слева.
8. `AccountItem.Type` определяет композицию данных внутри OptionListCell.
9. Preset соответствующего `AccountInfo` выбирается по контексту и составу данных.
10. `CardImage` используется для карточного счёта; по умолчанию `IconView` не используется.

## Section 5: Структура текста

`Type=Sum` выводит баланс на главную позицию, а название и короткий номер счёта — в подстрочник.

`Type=Number` выводит полный номер счёта на главную позицию, а название — в подстрочник.

Точные правила форматирования названий, номеров, валют и сумм задаются отдельными паттернами данных.

Preset `AccountInfo / Sum` задаёт один из составов:

- `name` — название счёта;
- `number` — полный номер счёта;
- `name + maskedNumber` — название и короткий номер счёта;
- `name + number` — название и полный номер счёта.

Preset `AccountInfo / Number` задаёт один из составов:

- `name` — название счёта;
- `name + sum` — название счёта и баланс.

Значения, предусмотренные выбранным preset, не скрываются вручную.

## Section 6: Правила

### Rule 1: Используй публичный контейнер

- ruleId: rule:components.account-select.public-roots-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй только `[D] AccountOptionListContent` или `[M] AccountOptionListContent`. Остальные компоненты семейства являются служебными.

### Rule 2: Выбирай SelectType по сценарию

- ruleId: rule:components.account-select.selection-type-semantics
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `Single` для выбора одного счёта и `Multi` для выбора нескольких счетов.

### Rule 3: Группируй счета по контекстному критерию

- ruleId: rule:components.account-select.grouping-criterion-is-contextual
- severity: info
- appliesTo: component
- checkType: llm
- autofix: no

При `Grouped=True` выбирай критерий группировки по задаче. По умолчанию группируй счета по принадлежности к компании.

### Rule 4: Замени SwapMe

- ruleId: rule:components.account-select.swap-me-must-be-replaced
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`AccountItem.Type=SwapMe` является placeholder и должен быть заменён на `Sum` или `Number`.

### Rule 5: Не используй legacy Number

- ruleId: rule:components.account-select.legacy-number-forbidden
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`AccountItem.Type=❌ Number` является legacy-вариантом и запрещён.

### Rule 6: Связывай Sum с AccountInfo Sum

- ruleId: rule:components.account-select.sum-info-binding
- severity: error
- appliesTo: composition
- checkType: deterministic
- autofix: partial

Для `AccountItem.Type=Sum` используй `AccountInfo / Sum`.

### Rule 7: Связывай Number с AccountInfo Number

- ruleId: rule:components.account-select.number-info-binding
- severity: error
- appliesTo: composition
- checkType: deterministic
- autofix: partial

Для `AccountItem.Type=Number` используй `AccountInfo / Number`.

### Rule 8: Не меняй порядок групп

- ruleId: rule:components.account-select.group-order-is-fixed
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Порядок групп менять нельзя. По умолчанию заголовок группы содержит название компании; при другом критерии используй соответствующий текст.

### Rule 9: Сохраняй selection-контрол

- ruleId: rule:components.account-select.selection-controls-are-fixed
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `Single` checkmark всегда расположен справа. В `Multi` Checkbox всегда расположен слева. Не скрывай, не заменяй и не переноси эти контролы.

### Rule 10: Используй CardImage только для карточного счёта

- ruleId: rule:components.account-select.card-image-only-for-card-account
- severity: warning
- appliesTo: component
- checkType: manual
- autofix: partial

Используй `CardImage`, когда пользователь выбирает карточный счёт. По умолчанию не добавляй `IconView`.

### Rule 11: Показывай значения выбранного preset

- ruleId: rule:components.account-select.account-info-preset-defines-visible-values
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Настраивай состав данных через preset соответствующего `AccountInfo`. Не скрывай вручную значения, предусмотренные выбранным preset.

## Section 7: Шаблоны

### Одиночный выбор

```text
AccountOptionListContent
SelectType=Single
Grouped=False или True
AccountItem.Type=Sum или Number
```

### Множественный выбор

```text
AccountOptionListContent
SelectType=Multi
Checkbox для каждой строки
Grouped=False или True
```

### Сгруппированный список

```text
Grouped=True
Все группы раскрыты по умолчанию
Заголовок по умолчанию = название компании
Пользователь может свернуть отдельную группу
```

## Section 8: Примеры

### Баланс на главной позиции

```text
SelectType=Single
AccountItem.Type=Sum
AccountInfo / Sum
```

### Полный номер на главной позиции

```text
SelectType=Multi
AccountItem.Type=Number
AccountInfo / Number
```

### Карточный счёт

```text
AccountItem.Type=Sum или Number
CardImage=true
IconView=false
```

## Section 9: Антипримеры

### Служебная ячейка отдельно

```text
[D] AccountOptionCell / Single
```

### Незавершённая композиция

```text
AccountItem.Type=SwapMe
```

### Legacy

```text
AccountItem.Type=❌ Number
```

### Скрытый selection-контрол

```text
SelectType=Multi
Checkbox hidden
```

### Неполный preset

```text
AccountInfo / Number
Presets=name + sum
Баланс скрыт вручную
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Находить служебные компоненты семейства, использованные как самостоятельный корень.
- Проверять `AccountItem.Type`.
- Проверять связь `Type=Sum` с `AccountInfo / Sum`.
- Проверять связь `Type=Number` с `AccountInfo / Number`.
- Фиксировать `SwapMe` и `❌ Number` как нарушения.
- Проверять наличие и положение checkmark или Checkbox по `SelectType`.
- Проверять неизменность порядка групп.
- Проверять, что состав видимых значений соответствует выбранному preset.

### LLM-проверки

- Проверять соответствие Single или Multi продуктовому сценарию.
- Проверять осмысленность критерия группировки.
- Проверять соответствие выбранного preset составу данных.
- Проверять обоснованность `CardImage` карточным счётом.

### Словарные проверки

- Применять отдельные правила форматирования названий счетов, номеров, валют и сумм.

### Не проверяется автоматически

- Продуктовая необходимость группировки.
- Максимальное количество выбранных счетов, поскольку компонент его не ограничивает.
- Состояние конкретной группы после пользовательского взаимодействия.

### Автоисправления

- Предлагать заменить служебный корень на AccountOptionListContent нужной платформы.
- Предлагать заменить `SwapMe` или `❌ Number` на `Sum` либо `Number`.
