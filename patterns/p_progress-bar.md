# Pattern: ProgressBar

- documentType: pattern
- patternType: component
- component: ProgressBar
- patternId: ptrn:components.progress-bar
- patternKey: components.progress-bar
- productType: b2b
- platforms: desktop, mobileweb
- locale: ru-RU
- owner: Design System
- status: active
- updatedAt: 2026-07-29
- sourceType: component-contract
- tags: progress-bar, progress, goal, limit, amount, status, web-corp-presets
- figmaLink: none
- sections: 10

## Section 1: Определение

`ProgressBar` — компонент Web :: Corp Presets для отображения прогресса по денежной цели или лимиту. Компонент показывает подпись, текущую сумму, дополнительное значение, линейную шкалу прогресса и короткий `Hint`.

В каталоге доступны две смысловые версии:

- `ProgressBar :: Goal` — прогресс накопления или достижения цели;
- `ProgressBar :: Limit` — состояние использования лимита, порога или доступного объёма.

Для каждой версии есть отдельные desktop и mobile-web компоненты: `[D]` и `[M]`.

## Section 2: Когда использовать

Используй `ProgressBar`, когда нужно показать:

- насколько пользователь приблизился к денежной цели;
- сколько уже использовано или осталось в рамках лимита;
- состояние лимита: нормальное, внимание, риск, полный, отсутствует или недоступен;
- компактную финансовую метрику, где сумма и шкала должны считываться вместе.

Используй `Goal`, когда прогресс движется к целевому значению. Используй `Limit`, когда шкала описывает ограничение, доступный объём или риск превышения лимита.

## Section 3: Когда не использовать

Не используй `ProgressBar` для пошаговой навигации, статуса заявки, загрузки файла или системного процесса без денежного значения. Для таких сценариев нужны stepper, status, loader или другой специализированный компонент.

Не используй `ProgressBar`, если значение можно показать одной суммой без сравнения с целью, лимитом или порогом.

Не собирай прогресс-бар вручную из линии, текста и `AmountParagraph`. Используй готовые preset-компоненты `ProgressBar :: Goal` или `ProgressBar :: Limit`.

## Section 4: Принципы

1. Компонент всегда связывает сумму со шкалой: текстовое значение и визуальная длина прогресса должны описывать один и тот же факт.
2. Версия `Goal` отвечает за движение к цели, версия `Limit` — за состояние лимита или порога.
3. Состояние выбирается через `variant.State`, а не через ручное перекрашивание слоёв.
4. Desktop использует `[D]`-компоненты, mobile-web использует `[M]`-компоненты.
5. Внутренняя анатомия компонента не пересобирается вручную.
6. Текстовые стили, цвета шкалы, высота шкалы и отступы наследуются из component baseline.
7. `Hint` должен пояснять показатель или условие расчёта, но не заменять основное значение.

## Section 5: Структура текста

Базовая структура `ProgressBar`:

```text
Label
Caption: [основная сумма] + [дополнительная сумма]
ProgressBar
Hint
```

`Label` называет показатель. В `Caption` используются суммы через `AmountParagraph`: основная сумма акцентная, дополнительная сумма второстепенная. `ProgressBar` показывает долю прогресса или лимита. `Hint` коротко поясняет условие, срок, остаток или контекст расчёта.

Для `Goal` подписи должны описывать накопление или достижение цели: сколько накоплено, сколько осталось, какая цель задана.

Для `Limit` подписи должны описывать состояние лимита: сколько доступно, использовано, исчерпано или почему лимит недоступен.

## Section 6: Правила

### Rule 1: Используй публичные ProgressBar preset-компоненты

- ruleId: rule:components.progress-bar.public-presets-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Для интерфейса используй только публичные preset-компоненты `ProgressBar :: Goal` и `ProgressBar :: Limit` в desktop или mobile-web версии. Не собирай компонент вручную из внутренних частей.

#### Правильно

```text
[D] ProgressBar :: Goal
[M] ProgressBar :: Limit
```

#### Неправильно

```text
Text + Rectangle + AmountParagraph собраны вручную как прогресс-бар
```

#### Почему

Готовый preset сохраняет семантику состояния, токены, текстовые стили и корректную анатомию.

### Rule 2: Выбирай Goal для движения к цели

- ruleId: rule:components.progress-bar.goal-for-target-progress
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Используй `ProgressBar :: Goal`, когда шкала показывает продвижение к целевому значению.

#### Правильно

```text
Накоплено 120 000 ₽ из 300 000 ₽
```

#### Неправильно

```text
Использовано 90% кредитного лимита показано через ProgressBar :: Goal
```

#### Почему

`Goal` описывает положительное движение к цели, а не риск или расходование ограничения.

### Rule 3: Выбирай Limit для лимита и риска

- ruleId: rule:components.progress-bar.limit-for-threshold
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Используй `ProgressBar :: Limit`, когда шкала показывает лимит, порог, доступный объём, риск превышения или отсутствие лимита.

#### Правильно

```text
Использовано 450 000 ₽ из лимита 500 000 ₽
```

#### Неправильно

```text
Прогресс накопления на цель показан через ProgressBar :: Limit
```

#### Почему

`Limit` содержит специальные состояния для внимания, риска, полного использования и отсутствия лимита.

### Rule 4: Используй только разрешённые состояния Goal

- ruleId: rule:components.progress-bar.goal-state-set
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Для `ProgressBar :: Goal` используй только состояния `Start`, `First`, `Second`, `End`, `Disabled`.

#### Правильно

```text
ProgressBar :: Goal · State=Second
```

#### Неправильно

```text
ProgressBar :: Goal · State=Risk
```

#### Почему

Состояния `Risk`, `Attention`, `Full` и `None` относятся к версии `Limit`, а не к движению к цели.

### Rule 5: Используй только разрешённые состояния Limit

- ruleId: rule:components.progress-bar.limit-state-set
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Для `ProgressBar :: Limit` используй только состояния `None`, `In progress`, `Attention`, `Risk`, `Full`, `Disabled`.

#### Правильно

```text
ProgressBar :: Limit · State=Risk
```

#### Неправильно

```text
ProgressBar :: Limit · State=Second
```

#### Почему

`Limit` описывает состояние лимита, поэтому использует шкалу нормального, предупредительного, рискованного и завершённого состояния.

### Rule 6: Соблюдай платформенную версию

- ruleId: rule:components.progress-bar.platform-version
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На desktop используй `[D] ProgressBar`, на mobile-web используй `[M] ProgressBar`.

#### Правильно

```text
Desktop → [D] ProgressBar :: Limit
MobileWeb → [M] ProgressBar :: Limit
```

#### Неправильно

```text
MobileWeb → [D] ProgressBar :: Limit
```

#### Почему

Desktop и mobile-web версии имеют разные baseline-настройки и должны соответствовать платформе макета.

### Rule 7: Не меняй внутреннюю анатомию

- ruleId: rule:components.progress-bar.required-anatomy
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Сохраняй структуру компонента: `Label`, `Content`, `Caption`, `AmountParagraph`, внутренний `ProgressBar` и `Hint`. Не скрывай и не удаляй части, если это не предусмотрено выбранным `State`.

#### Правильно

```text
Label + Caption + ProgressBar + Hint сохранены в экземпляре компонента
```

#### Неправильно

```text
Hint удалён, ProgressBar заменён вручную нарисованной линией
```

#### Почему

Компонент должен оставаться читаемым и машинно распознаваемым: агент сравнивает изменения с effective baseline текущего состояния.

### Rule 8: Не меняй визуальные стили вручную

- ruleId: rule:components.progress-bar.no-manual-visual-styles
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Не меняй вручную цвета, text styles, высоту шкалы, радиусы и отступы внутренних слоёв. Для смыслового изменения используй подходящий `State`.

#### Правильно

```text
State=Attention выбран через variant.State
```

#### Неправильно

```text
Fill прогресс-бара перекрашен вручную в предупреждающий цвет
```

#### Почему

Ручное оформление ломает связь между состоянием компонента и визуальной семантикой.

## Section 7: Шаблоны

### Goal

```text
Компонент: [D/M] ProgressBar :: Goal
State: Start | First | Second | End | Disabled
Label: [название цели]
Caption: [накоплено] + [цель или осталось]
Hint: [короткое пояснение условия]
```

### Limit

```text
Компонент: [D/M] ProgressBar :: Limit
State: None | In progress | Attention | Risk | Full | Disabled
Label: [название лимита]
Caption: [использовано или доступно] + [общий лимит]
Hint: [короткое пояснение состояния]
```

## Section 8: Примеры

### Пример 1

Контекст: пользователь копит на цель.

```text
[D] ProgressBar :: Goal
State=Second
Label: На оборудование
Caption: 120 000 ₽ из 300 000 ₽
Hint: Осталось накопить 180 000 ₽
```

### Пример 2

Контекст: лимит почти исчерпан.

```text
[D] ProgressBar :: Limit
State=Risk
Label: Кредитный лимит
Caption: 450 000 ₽ из 500 000 ₽
Hint: Осталось 50 000 ₽
```

### Пример 3

Контекст: лимит пока не задан.

```text
[M] ProgressBar :: Limit
State=None
Label: Лимит
Caption: 0 ₽
Hint: Лимит будет доступен после проверки
```

## Section 9: Антипримеры

### Антипример 1

Контекст: для лимита использована версия цели.

```text
[D] ProgressBar :: Goal
State=End
Label: Кредитный лимит
Caption: 500 000 ₽ из 500 000 ₽
```

Почему не работает: лимит должен использовать `ProgressBar :: Limit`, потому что состояние лимита может быть предупреждением или риском.

### Антипример 2

Контекст: состояние показано ручным цветом.

```text
ProgressBar :: Limit · State=In progress
Fill перекрашен вручную в цвет риска
```

Почему не работает: визуальная семантика должна задаваться состоянием `State=Risk`.

### Антипример 3

Контекст: компонент пересобран вручную.

```text
Label + AmountParagraph + Rectangle вместо ProgressBar preset
```

Почему не работает: ручная сборка не имеет component contract и не может быть корректно проверена агентом.

## Section 10: Машинная обработка

### Детерминированные проверки

- Использование публичных компонентов `ProgressBar :: Goal` и `ProgressBar :: Limit`.
- Соответствие `[D]` desktop и `[M]` mobile-web.
- Значения `variant.State` входят в разрешённый набор для `Goal` или `Limit`.
- Внутренняя анатомия не удалена и не заменена ручными слоями.
- Изменения layer/style сравниваются с effective baseline текущего состояния.

### Словарные проверки

- Сценарии `Goal`: цель, накоплено, осталось, прогресс к цели.
- Сценарии `Limit`: лимит, доступно, использовано, риск, внимание, полный, недоступно.
- Нежелательные замены: stepper, loader, status, ручная линия.

### LLM-проверки

- Правильно ли выбран `Goal` или `Limit` по смыслу данных.
- Не скрывает ли `Hint` важную информацию, которая должна быть видна в `Label` или `Caption`.
- Соответствует ли состояние `State` фактическому смыслу лимита или прогресса.
- Достаточно ли понятны `Label`, `Caption` и `Hint`.

### Не проверяется автоматически

- Точная бизнес-логика расчёта процента прогресса.
- Достаточность порогов для перехода между `Attention`, `Risk` и `Full`.
- Корректность финансовых значений без данных продукта.
- Содержимое PNG из исходной папки, если оно не относится к ProgressBar.

### Автоисправления

- `partial`: заменить `[D]` на `[M]` или наоборот по платформе, если доступен правильный компонент.
- `partial`: предложить подходящий `State` при явном несоответствии `Goal`/`Limit`.
- `no`: пересчитывать суммы, проценты, пороги риска и бизнес-логику автоматически нельзя.
