# Pattern: Компонент Amount

- documentType: pattern
- patternType: component
- component: Amount
- patternId: ptrn:components.amount
- patternKey: components.amount
- productType: cross-product
- platforms: desktop, mobileweb, mobile
- locale: ru-RU
- owner: Editorial / Design System
- status: active
- updatedAt: 2026-07-22
- sourceType: component-guideline
- tags: amount, currency, numeric-data, tables, table-lists, side-panel, input, typography, color, formatting
- figmaLink: https://www.figma.com/design/VcHkzjFmNGCbKpO2YFCogJ/%E2%9C%85-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82----Amount?m=auto&t=yxdKGIY4gfsWChEc-7
- sections: 10

## Section 1: Определение

Amount — компонент для отображения денежных сумм и балансов в интерфейсах. Компонент может отображать баллы, но правила баллов будут описаны отдельным паттерном.

Паттерн фиксирует структуру компонента, правила настройки `Operation`, частей суммы, требования к типографике, цвету, математическим знакам, пробелам и использованию Amount в таблицах, табличных списках, steps, `TableBulkActions`, input и сайд-панели. Внутри `AmountInput` используется `Amount` из Web Core; Figma-only presets Web Corp AmountStyles не заменяют его.

## Section 2: Когда использовать

Используйте Amount, когда нужно показать:

- сумму с валютой;
- пополнение или списание;
- баланс или остаток;
- сумму в таблице, табличном списке, steps, `TableBulkActions`, input или сайд-панели.

## Section 3: Когда не использовать

Не используйте Amount для числовых идентификаторов без размерности: телефонов, дат, номеров счетов, ИНН, номеров документов.

Не используйте этот паттерн для процентов и произвольных числовых величин с единицами. Для баллов применяйте отдельный паттерн после его появления.

Не используйте Amount, если значение должно быть набрано обычным текстом без компонентной структуры `Major`, `Minor`, `Currency` и `Addon`.

## Section 4: Принципы

1. `Major` — обязательная часть Amount.
2. `Operation` располагается перед суммой и отвечает за отображение знака операции.
3. `Negative=True` показывает отрицательную операцию, `Negative=False` — положительную.
4. `Minor`, `Currency` и `Addon` опциональны и включаются через пропсы.
5. `Addon` вставляется через слот и не должен быть выше line-height текстовой части Amount.
6. Все текстовые части компонента должны использовать один text style.
7. Для `Minor` не используется opacity.
8. Между разрядами используется математический пробел.
9. Для отрицательных значений используется математический минус.
10. Цвет `text/positive` допустим для пополнений только в таблицах и табличных списках.

## Section 5: Структура текста

Amount состоит из первой части `Operation`, обязательной целой части `Major` и опциональных частей `Minor`, `Currency`, `Addon`.

Порядок частей фиксирован: `Operation → Major → Minor → Currency → Addon`. `IconView` и `StatusBadge` в Addon сохраняют собственные контекстные цвета и не обязаны повторять цвет текстовых частей Amount.

```text
+1 234 567,00 ₽
Operation Major Minor Currency
```

`Operation` управляет знаком операции: при `Negative=True` отображается отрицательный знак, при `Negative=False` — положительный. Если сценарий не должен показывать знак операции, `Operation` не выводится.

`Operation`, `Major`, `Minor` и `Currency` должны использовать один и тот же text style внутри одного экземпляра Amount. Начертание и размер выбираются для всего Amount по роли значения: например, основная сумма в таблице может быть `Medium`, а второстепенная — `Regular`, но части одной суммы не должны получать разные text styles.

Если валюта указана в заголовке колонки и все суммы в колонке в одной валюте, валюту в значениях не дублируют.

Для списаний используется математический минус `−`, а не дефис или тире. Для разрядов используется математический пробел, а не обычный пробел.

## Section 6: Правила

### Rule 1: Сохраняй Major обязательным

- ruleId: rule:components.amount.major-required
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Amount всегда должен содержать `Major` — основную целую часть суммы.

#### Правильно

```text
1 234 ₽
```

#### Неправильно

```text
,00 ₽
```

#### Почему

Без `Major` сумма теряет основное значение и становится нечитаемой.

### Rule 2: Настраивай Operation через Negative

- ruleId: rule:components.amount.operation-negative
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`Operation` располагается перед суммой и отвечает за знак операции. Для отрицательной операции используй `Negative=True`, для положительной — `Negative=False`.

#### Правильно

```text
Operation Negative=True -> −
Operation Negative=False -> +
```

#### Неправильно

```text
Знак операции набран вручную отдельным текстовым слоем
```

#### Почему

Знак операции должен управляться настройкой компонента, а не ручным текстом.

### Rule 3: Подключай Minor, Currency и Addon как опциональные части

- ruleId: rule:components.amount.optional-parts
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: no

`Minor`, `Currency` и `Addon` включаются через пропсы. `Addon` вставляется через слот, а его размер не должен превышать line-height текстовой части Amount.

#### Правильно

```text
Major + Minor + Currency + Addon через props и slot
```

#### Неправильно

```text
Addon вручную не совпадает с line-height Major
```

#### Почему

Опциональные части должны сохранять компонентную структуру и высоту строки.

### Rule 4: Используй один text style для всех текстовых частей Amount

- ruleId: rule:components.amount.same-text-style-for-parts
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`Operation`, `Major`, `Minor` и `Currency` внутри одного экземпляра Amount должны использовать один и тот же text style.

#### Правильно

```text
Operation -> Medium 16/24
Major -> Medium 16/24
Minor -> Medium 16/24
Currency -> Medium 16/24
```

#### Неправильно

```text
Operation -> Medium 16/24
Major -> Medium 16/24
Minor -> Regular 14/20
Currency -> Regular 14/20
```

#### Почему

Части одной суммы образуют единое числовое значение. Разные text styles внутри суммы ломают чтение и создают ложную иерархию.

### Rule 5: Не используй opacity для Minor и Currency

- ruleId: rule:components.amount.no-opacity
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для `Minor` не используется opacity. В таблицах opacity не используется и для `Currency`. В заголовочных стилях `Headline-System` и `Headline-System-Mobile` opacity не используется для `Minor` и `Currency`.

#### Правильно

```text
Minor opacity: false
Currency opacity: false
```

#### Неправильно

```text
minor :: opacity :: true
```

#### Почему

Opacity ухудшает читаемость суммы и создаёт лишнюю визуальную иерархию внутри одного значения.

### Rule 6: Используй математический пробел между разрядами

- ruleId: rule:components.amount.math-space
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: yes

Между разрядами чисел используется математический пробел.

#### Правильно

```text
1 234 567,00 ₽
```

#### Неправильно

```text
1 234 567,00 ₽
```

#### Почему

Математический пробел точнее соответствует форматированию числовых данных и не ломает визуальный ритм суммы.

### Rule 7: Используй математический минус

- ruleId: rule:components.amount.math-minus
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: yes

Для отрицательных значений используется математический минус `−`, а не дефис, короткое или длинное тире.

#### Правильно

```text
−1 234 567,00 ₽
```

#### Неправильно

```text
-1 234 567,00 ₽
```

#### Почему

Математический минус корректен для числового значения и визуально отличается от текстового тире.

### Rule 8: Используй text/positive только для пополнений в таблицах и табличных списках

- ruleId: rule:components.amount.positive-color-context
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Цвет `text/positive` используется для пополнений только в таблицах и табличных списках. Другие цветовые токены могут быть разрешены точным правилом конкретного контекста; без такого правила нельзя автоматически требовать `text/primary` или объявлять контекстный токен нарушением.

#### Правильно

```text
+1 234 567,00 ₽ -> text/positive в таблице
```

#### Неправильно

```text
+1 234 567,00 ₽ -> text/positive в карточке вне таблицы
```

#### Почему

Зелёный цвет должен подсвечивать пополнение только там, где пользователь сравнивает операции.

### Rule 9: Не окрашивай списания в красный

- ruleId: rule:components.amount.negative-primary
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для списаний используется `text/primary`, а не красный цвет.

#### Правильно

```text
−100,00 ₽ -> text/primary
```

#### Неправильно

```text
−100,00 ₽ -> red
```

#### Почему

Списание уже обозначено знаком минуса. Красный создаёт лишний тревожный статус.

### Rule 10: В таблицах выравнивай Amount по правому краю

- ruleId: rule:components.amount.table-align-right
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Числовые данные с размерностью в таблицах всегда выравниваются по правому краю.

#### Правильно

```text
Amount -> align right
```

#### Неправильно

```text
Amount -> align left
```

#### Почему

Правое выравнивание помогает сравнивать разряды и суммы.

### Rule 11: Настраивай начертание Amount в таблицах по роли значения

- ruleId: rule:components.amount.table-weight
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

В таблицах основная сумма набирается `Medium`, второстепенные значения с числовыми данными с размерностью — `Regular`.

#### Правильно

```text
Основная сумма -> Medium
Второстепенное значение -> Regular
```

#### Неправильно

```text
Основная сумма -> Regular
```

#### Почему

Начертание помогает отличить основное значение от дополнительного.

### Rule 12: Не дублируй валюту, если она вынесена в заголовок

- ruleId: rule:components.amount.table-currency-not-duplicated
- severity: error
- appliesTo: text
- checkType: llm
- autofix: partial

Если валюта указана в названии колонки и все суммы в колонке в одной валюте, валюту не дублируют в значениях.

#### Правильно

```text
Сумма, ₽
210 000,06
25 000,26
```

#### Неправильно

```text
Сумма, ₽
210 000,06 ₽
25 000,26 ₽
```

#### Почему

Повтор валюты в каждой ячейке создаёт визуальный шум.

### Rule 13: В TableBulkActions не используй знаки и цвет операции

- ruleId: rule:components.amount.table-bulk-actions
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `TableBulkActions` для пополнений и списаний не используются знаки `+` и `−`, используется только `text/primary`, а для `Minor` не используется opacity.

#### Правильно

```text
1 234 567,00 ₽
```

#### Неправильно

```text
+1 234 567,00 ₽
```

#### Почему

В массовых действиях Amount показывает выбранное значение, а не должен кодировать операцию цветом и знаком.

### Rule 14: В steps предпочитай Regular

- ruleId: rule:components.amount.steps-regular
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

В steps рекомендуется отображать Amount в начертании `Regular`, без opacity для `Minor`. Другой штатный Style требует осознанного контекстного решения, но сам по себе не является нарушением.

#### Правильно

```text
Amount в steps -> Regular
Minor opacity -> false
```

#### Неправильно

```text
Amount в steps -> Medium
```

#### Почему

В steps сумма не должна спорить с основной структурой шага.

### Rule 15: В табличных списках различай общую сумму и остальные суммы

- ruleId: rule:components.amount.table-list-weight
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

Это правило применяется только к компоненту `Amount` из Web Core. К Figma-only presets семейства Web Corp AmountStyles оно не применяется.

В табличных списках не используйте opacity и одинаковую жирность для значений Amount. Общая сумма набирается `Bold`, остальные суммы — `Medium`.

#### Правильно

```text
Общая сумма -> Bold
Остальные суммы -> Medium
```

#### Неправильно

```text
Все суммы -> Medium
```

#### Почему

Разное начертание помогает пользователю быстро найти итог.

### Rule 16: В сайд-панели повторяй формат со страницы

- ruleId: rule:components.amount.side-panel-match-source
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

В сайд-панели формат и цвет суммы повторяют то, что пользователь видит на странице. Для поступлений и списаний сохраняются знак и цвет, для баланса или остатка сумма отображается без знака операции.

#### Правильно

```text
На странице: +1 234 567,00 ₽
В сайд-панели: +1 234 567,00 ₽
```

#### Неправильно

```text
На странице: +1 234 567,00 ₽
В сайд-панели: 1 234 567,00 ₽
```

#### Почему

Сайд-панель должна подтверждать выбранную строку, а не менять смысл суммы.

### Rule 17: Округляй дробную часть до двух знаков

- ruleId: rule:components.amount.round-to-two-minor-digits
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: yes

Если исходное значение содержит больше двух знаков после запятой, округляйте его до двух знаков перед отображением в Amount.

### Rule 18: Сохраняй фиксированный порядок частей

- ruleId: rule:components.amount.fixed-part-order
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Порядок частей всегда остаётся `Operation → Major → Minor → Currency → Addon`. Переставлять части вручную запрещено.

### Rule 19: Используй Amount для денежных значений

- ruleId: rule:components.amount.monetary-values-only
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Amount используется для денежных сумм и балансов. Баллы регулируются отдельным паттерном. Проценты и произвольные величины с единицами не относятся к этому паттерну.

### Rule 20: Ограничивай Major 13 символами

- ruleId: rule:components.amount.major-max-13-digits
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

`Major` содержит не более 13 символов без учёта математических пробелов между разрядами.

## Section 7: Шаблоны

### Базовый Amount

```text
Operation: знак операции через Negative
Major: обязательный
Minor: опциональный
Currency: опциональная
Addon: опциональный слот
```

### Сумма с дробной частью

```text
1 234 567,00 ₽
```

### Отрицательная сумма

```text
−1 234 567,00 ₽
```

### Единый text style частей суммы

```text
Operation, Major, Minor, Currency -> один text style
```

### Таблица с валютой в заголовке

```text
Сумма, ₽
210 000,06
25 000,26
16 000,00
```

### TableBulkActions

```text
1 234 567,00 ₽
```

## Section 8: Примеры

### Пример 1: Пополнение в таблице

```text
+1 234 567,00 ₽ -> text/positive
```

Цвет допустим, потому что значение показывает пополнение в таблице.

### Пример 2: Списание

```text
−100,00 ₽ -> text/primary
```

Списание обозначено математическим минусом, красный цвет не нужен.

### Пример 3: Второстепенная сумма в таблице

```text
Второстепенное значение -> Regular
```

Начертание помогает отделить дополнительное значение от основной суммы.

### Пример 4: Баланс в сайд-панели

```text
3 458 000,00 ₽
```

Баланс или остаток отображается без знака операции.

### Пример 5: Единый text style

```text
Operation, Major, Minor, Currency -> Medium 16/24
```

Все части суммы используют один text style, потому что относятся к одному значению.

## Section 9: Антипримеры

### Антипример 1: Opacity для Minor

```text
minor :: opacity :: true
```

Opacity для `Minor` не используется.

### Антипример 2: Дефис вместо математического минуса

```text
-1 234 567,00 ₽
```

Для отрицательных значений нужен математический минус `−`.

### Антипример 3: Красный цвет списания

```text
−100,00 ₽ -> red
```

Списания не окрашиваются в красный.

### Антипример 4: Валюта продублирована в колонке

```text
Сумма, ₽
210 000,06 ₽
25 000,26 ₽
```

Если валюта уже в заголовке и вся колонка в одной валюте, в значениях её не повторяют.

### Антипример 5: Знаки операций в TableBulkActions

```text
+1 234 567,00 ₽
−1 234 567,00 ₽
```

В `TableBulkActions` знаки `+` и `−` не используются.

### Антипример 6: Разные text styles внутри суммы

```text
Operation -> Medium 16/24
Major -> Medium 16/24
Minor -> Regular 14/20
Currency -> Regular 14/20
```

Все текстовые части одной суммы должны использовать один text style.

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять наличие `Major`.
- Проверять, что `Operation` управляет знаком операции через `Negative=True` или `Negative=False`.
- Проверять, что `Minor`, `Currency` и `Addon` подключены через настройки компонента.
- Проверять единый text style для `Operation`, `Major`, `Minor` и `Currency`.
- Проверять `minor opacity = false`.
- Проверять `currency opacity = false` в таблицах и заголовочных стилях.
- Проверять математический пробел между разрядами.
- Проверять математический минус для отрицательных значений.
- Проверять выравнивание Amount в таблицах по правому краю.
- Проверять запрет знаков `+` и `−` в `TableBulkActions`.
- Проверять `text/primary` в `TableBulkActions`.

### Словарные проверки

- Находить дефис, короткое тире и длинное тире перед суммой.
- Находить обычные пробелы между разрядами.
- Находить повтор валюты в ячейках, если валюта указана в заголовке.
- Находить красный цвет для отрицательных сумм.

### LLM-проверки

- Проверять, что `text/positive` используется только для пополнений в таблицах и табличных списках.
- Проверять, что в колонке с двумя значениями `text/positive` применён только к основному значению со знаком `+`.
- Проверять, что в сайд-панели формат и цвет повторяют исходную страницу.
- Проверять, что Amount используется для числовых данных с размерностью, а не для идентификаторов.

### Не проверяется автоматически

- Корректность подготовленного `Addon` под конкретную высоту строки.
- Визуальная уместность акцентного веса суммы.
- Смысловая роль суммы в конкретном бизнес-сценарии.
- Полное соответствие сайд-панели исходному экрану без контекста страницы.

### Автоисправления

- Заменить дефис или тире перед суммой на математический минус.
- Заменить обычные пробелы между разрядами на математические.
- Отключить opacity для `Minor`.
- Убрать знаки операций в `TableBulkActions`.
- Заменить красный цвет списания на `text/primary`.
