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
- status: active
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
11. Недоступный счёт не кликабелен и объясняет причину через Tooltip.
12. Весь список использует единый media-режим: `IconView`, `CardImage` или без аддона.
13. В `Single` выбор применяется сразу, в `Multi` — по кнопке «Применить».
14. Недоступный счёт не может быть выбран.
15. Порядок счетов определяется данными и контекстной сортировкой, а не ручной перестановкой.
16. На desktop высота списка равна 5.5 двухстрочных OptionListItem без блока кнопок Multi; на Mobile Web ограничения высоты нет.
17. Геометрия и визуальные состояния строк следуют effective baseline.
18. Все строки списка используют одинаковые `AccountItem.Type` и preset.
19. `[D]` открывается в OptionList, `[M]` — в BottomSheet.
20. Для 10 и более счетов рекомендуется поиск через платформенный OptionListHeader.
21. Нулевой явный выбор в Multi означает применение ко всем доступным счетам.
22. В Multi с 10 и более элементами Select All обязателен.
23. Если нужны Search и Select All, располагай их вертикально именно в этом порядке.

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

Ограничения длинных названий и других текстов определяются общими правилами `OptionListCell`.

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

### Rule 12: Блокируй недоступный счёт

- ruleId: rule:components.account-select.disabled-account-is-non-interactive
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Недоступный счёт должен находиться в disabled-состоянии и не реагировать на клик.

### Rule 13: Объясняй недоступность

- ruleId: rule:components.account-select.disabled-account-shows-reason-tooltip
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

При наведении показывай `Tooltip` с `View=Hint` и короткой причиной недоступности счёта.

### Rule 14: Сохраняй визуальное disabled-состояние

- ruleId: rule:components.account-select.disabled-account-visual-state
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для недоступного счёта переводи `Amount`, `PaymentMaskedNumber` и `AccountInfo` в `text/tertiary`. В `Multi` дополнительно используй `Checkbox.DisabledState`.

### Rule 15: Не смешивай media-режимы

- ruleId: rule:components.account-select.media-mode-is-exclusive-and-uniform
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В одном списке используй либо `IconView` для всех счетов, либо `CardImage` для всех карточных счетов, либо не используй медиа-аддон. Не смешивай режимы.

### Rule 16: Применяй выбор согласно SelectType

- ruleId: rule:components.account-select.selection-commit-behavior
- severity: recommendation
- appliesTo: flow
- checkType: manual
- autofix: no

В `Single` закрывай список сразу после выбора. В `Multi` применяй выбор только после нажатия кнопки «Применить».

### Rule 17: Показывай selected-состояние согласно SelectType

- ruleId: rule:components.account-select.selected-state-follows-select-type
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `Single` показывай выбранный счёт через `Checkmark.SelectedState=true`, в `Multi` — через checked-состояние Checkbox.

### Rule 18: Не выбирай недоступный счёт

- ruleId: rule:components.account-select.disabled-account-cannot-be-selected
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Недоступный счёт не может находиться в выбранном состоянии.

### Rule 19: Не меняй порядок счетов вручную

- ruleId: rule:components.account-select.item-order-is-data-driven
- severity: error
- appliesTo: component
- checkType: manual
- autofix: no

Порядок счетов определяется контекстом данных: алфавитом, возрастанием или убыванием значений. Не переставляй строки вручную.

### Rule 20: Сохраняй высоту списка

- ruleId: rule:components.account-select.list-height-is-fixed
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На desktop высота списка должна вмещать 5.5 двухстрочных OptionListItem. Блок кнопок множественного выбора не входит в эту высоту. На Mobile Web ограничения высоты нет.

### Rule 21: Используй OptionListEmptyState

- ruleId: rule:components.account-select.empty-state-uses-option-list-empty-state
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Для пустого списка и отсутствия результатов используй OptionListEmptyState без кнопок: `[D]` на desktop и `[M]` на Mobile Web.

### Rule 22: Не придумывай loading-state

- ruleId: rule:components.account-select.loading-state-is-undefined
- severity: info
- appliesTo: component
- checkType: manual
- autofix: no

Loading-state пока не регламентирован. Не считай отсутствие конкретного loading-решения нарушением.

### Rule 23: Сохраняй effective baseline строки

- ruleId: rule:components.account-select.row-visuals-follow-effective-baseline
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй вручную высоту, padding, gap, radius, fill, hover, selected и другие геометрические или визуальные параметры строк.

### Rule 24: Используй OptionListFooter для Multi

- ruleId: rule:components.account-select.multi-footer-composition
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `Multi` на desktop используй `[D] OptionListFooter`, на Mobile Web — `[M] BottomSheetFooter`. Primary «Применить» отображается всегда. Secondary «Сбросить» появляется после сделанного выбора и очищает выбор до нуля. Других кнопок нет.

### Rule 25: Сохраняй единый состав строк

- ruleId: rule:components.account-select.list-content-is-uniform
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Все строки одного списка должны использовать одинаковые `AccountItem.Type` и `AccountInfo` preset.

### Rule 26: Выбирай весь список

- ruleId: rule:components.account-select.select-all-covers-entire-list
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Добавляй действие через `[D] OptionListHeader` с `Preset=Select All`. Оно выбирает все доступные счета во всём списке, пропуская disabled-счета.

### Rule 27: Используй контейнер платформы

- ruleId: rule:components.account-select.platform-container-is-fixed
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Открывай `[D] AccountSelect` в OptionList, а `[M] AccountSelect` — в BottomSheet.

### Rule 28: Добавляй поиск для большого списка

- ruleId: rule:components.account-select.search-is-recommended-for-large-list
- severity: recommendation
- appliesTo: component
- checkType: manual
- autofix: partial

Для 10 и более счетов в Single и Multi рекомендуется OptionListHeader с `Preset=Search`: `[D]` на desktop и `[M]` на Mobile Web.

### Rule 29: Не меняй текст empty-state

- ruleId: rule:components.account-select.empty-state-text-is-fixed
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Не редактируй фиксированный текст `[D] OptionListEmptyState`.

### Rule 30: Оставляй кнопку Применить активной

- ruleId: rule:components.account-select.apply-is-always-enabled
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Кнопка «Применить» всегда активна. Нулевой явный выбор означает применение ко всем доступным счетам.

### Rule 31: Скрывай Сбросить после сброса

- ruleId: rule:components.account-select.reset-clears-and-hides
- severity: error
- appliesTo: flow
- checkType: manual
- autofix: partial

«Сбросить» очищает выбор до нуля и сразу скрывается.

### Rule 32: Соблюдай состояния Select All

- ruleId: rule:components.account-select.select-all-state-machine
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй текст `Select All`. При частичном выборе используй `IndeterminateState=true`. При выборе всех доступных счетов используй `SelectedState=true`.

### Rule 33: Описывай возможности поиска

- ruleId: rule:components.account-select.search-placeholder-describes-scope
- severity: error
- appliesTo: text
- checkType: manual
- autofix: partial

Команда определяет критерии поиска. Placeholder должен явно сообщать, по каким данным выполняется поиск.

### Rule 34: Добавляй Select All в большой Multi

- ruleId: rule:components.account-select.select-all-required-for-large-multi
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

В `Multi` с 10 и более элементами OptionListHeader с `Preset=Select All` обязателен.

### Rule 35: Сохраняй порядок Header

- ruleId: rule:components.account-select.header-stack-order
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Если одновременно нужны Search и Select All, располагай их вертикально: сначала Search, затем Select All.

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

### Недоступный счёт

```text
disabled=true
clickable=false
Tooltip.View=Hint
Amount, PaymentMaskedNumber, AccountInfo = text/tertiary
Multi: Checkbox.DisabledState=true
```

### Viewport списка

```text
Platform=desktop
Высота = 5.5 двухстрочных OptionListItem
Overflow = vertical scroll
Блок кнопок Multi расположен вне viewport списка
```

### Поиск

```text
Количество счетов >= 10
Desktop: [D] OptionListHeader
Mobile Web: [M] OptionListHeader
Preset=Search
Placeholder отражает критерии поиска
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

### Media-режим списка

```text
Все строки = IconView
или
Все строки = CardImage
или
Все строки = без media-аддона
```

### Пустое состояние

```text
Desktop: [D] OptionListEmptyState
Mobile Web: [M] OptionListEmptyState
Buttons=false
```

### Нет результатов поиска

```text
Desktop: [D] OptionListEmptyState
Mobile Web: [M] OptionListEmptyState
Buttons=false
```

### Footer множественного выбора

```text
Desktop: [D] OptionListFooter
Mobile Web: [M] BottomSheetFooter
Primary=Применить
Secondary=Сбросить, если выбор уже был сделан; очищает выбор до нуля
```

### Выбрать все

```text
[D] OptionListHeader
Preset=Select All
Scope=все доступные счета во всём списке
Disabled-счета пропускаются
```

### Состояния Select All

```text
Ничего не выбрано:
IndeterminateState=false
SelectedState=false
Click -> выбрать все доступные

Выбрана часть:
IndeterminateState=true
SelectedState=false
Click -> выбрать все доступные

Выбраны все доступные:
IndeterminateState=false
SelectedState=true
Click -> сбросить весь выбор
```

### Search и Select All

```text
Количество элементов >= 10
SelectType=Multi
Vertical:
1. OptionListHeader Preset=Search
2. OptionListHeader Preset=Select All
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

### Недоступный счёт без причины

```text
disabled=true
Tooltip отсутствует
```

### Смешанные медиа

```text
Строка 1 = IconView
Строка 2 = CardImage
```

### Выбранный disabled-счёт

```text
disabled=true
selected=true
```

### Ручная геометрия

```text
OptionListItem.radius изменён вручную
```

### Смешанный состав списка

```text
Строка 1: AccountItem.Type=Sum
Строка 2: AccountItem.Type=Number
```

### Неверный контейнер

```text
[M] AccountOptionListContent внутри OptionList
```

### Изменённый empty-state

```text
[D] OptionListEmptyState
Текст изменён вручную
```

### Неактивная кнопка Применить

```text
Selected accounts=0
Применить DisabledState=true
```

### Неверный порядок Header

```text
1. Select All
2. Search
```

### Неинформативный поиск

```text
Поиск выполняется по названию и номеру
Placeholder=Поиск
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
- Проверять `Checkbox.DisabledState` и `text/tertiary` у недоступного счёта.
- Проверять единый media-режим списка.
- Проверять selected-состояние по `SelectType`.
- Проверять, что disabled-счёт не выбран.
- Проверять высоту viewport списка.
- Проверять геометрию и визуальные стили по effective baseline.
- Проверять платформенный OptionListEmptyState без кнопок для empty и no results.
- Проверять состав OptionListFooter в Multi.
- Проверять единый Type и preset внутри списка.
- Проверять контейнер по платформе.
- Проверять фиксированный текст OptionListEmptyState.
- Проверять активность кнопки «Применить».
- Проверять `IndeterminateState` и `SelectedState` у Select All.
- Проверять обязательность Select All в Multi с 10 и более элементами.
- Проверять порядок Search, затем Select All.

### LLM-проверки

- Проверять соответствие Single или Multi продуктовому сценарию.
- Проверять осмысленность критерия группировки.
- Проверять соответствие выбранного preset составу данных.
- Проверять обоснованность `CardImage` карточным счётом.
- Проверять наличие короткой причины недоступности в Tooltip.
- Проверять сценарий применения выбора для Single и Multi.
- Проверять обоснованность принципа сортировки счетов.
- Проверять, что `Select All` действует на все доступные счета и пропускает disabled.
- Комментировать отсутствие поиска при 10 и более счетах как рекомендацию.
- Проверять, что «Сбросить» очищает выбор и скрывается.
- Проверять соответствие placeholder фактическим критериям поиска.

### Словарные проверки

- Применять отдельные правила форматирования названий счетов, номеров, валют и сумм.

### Не проверяется автоматически

- Продуктовая необходимость группировки.
- Максимальное количество выбранных счетов, поскольку компонент его не ограничивает.
- Состояние конкретной группы после пользовательского взаимодействия.
- Семантику `StatusBadge`, пока она не регламентирована.
- Длину текста, пока правило не определено в `OptionListCell`.
- Конкретную реализацию loading-state, пока она не регламентирована.

### Автоисправления

- Предлагать заменить служебный корень на AccountOptionListContent нужной платформы.
- Предлагать заменить `SwapMe` или `❌ Number` на `Sum` либо `Number`.
