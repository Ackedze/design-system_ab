# Pattern: Скругления

- documentType: pattern
- patternId: ptrn:visual.border-radius
- patternKey: visual.border-radius
- productType: cross-product
- platforms: desktop, mobileweb
- locale: ru-RU
- owner: Editorial / Design System
- status: active
- updatedAt: 2026-06-30
- sourceType: catalog-derived-guideline
- tags: border-radius, corners, surfaces, controls, cards, pills, web-core, web-corp
- figmaLink: none
- sections: 10

## Section 1: Определение

Скругление задаёт геометрию поверхности, контрола или индикатора и помогает отличать уровень элемента в интерфейсе.

В дизайн-системе скругления не используются как декоративная настройка. Радиус зависит от роли элемента: интерактивный контрол, вложенный слот, карточка, поверхность, промо-блок, бейдж или pill.

Паттерн выведен из каталогов `web-core`, `web-corp`, `web-corp-presets` и `web-corp-promo`.

## Section 2: Когда использовать

Используй паттерн, когда нужно выбрать радиус для:

- кнопки, icon button, tag или filter tag;
- поля ввода, select, amount input, date input или number input;
- карточки, plate, island, widget или background plate;
- статусного бейджа, индикатора или pill;
- промо-карточки, bento-grid, benefit-card или promo table;
- skeleton, scrollbar, calendar day и других служебных элементов.

Паттерн особенно важен, когда новый компонент должен выглядеть как часть существующего web-каталога.

## Section 3: Когда не использовать

Не используй паттерн как повод произвольно округлять элементы.

Не применяй скругления:

- чтобы визуально смягчить компонент без изменения его роли;
- чтобы отличить состояние, если состояние уже выражено цветом, текстом или компонентным вариантом;
- чтобы сделать обычную карточку похожей на промо-блок;
- чтобы превратить прямоугольный контрол в pill без варианта `Shape=Rounded`;
- чтобы переносить служебные радиусы из иконок, нативных keyboard/webview-элементов или helper-графики в продуктовый UI.

Не считай дробные радиусы, `54.37`, `70`, `655` и похожие значения системной шкалой. В каталоге они относятся к служебной графике или нативным деталям.

## Section 4: Принципы

- Радиус должен соответствовать роли элемента.
- У интерактивных контролов радиус растёт вместе с высотой.
- `Shape=Rounded` означает pill, а не просто увеличенный радиус.
- Вложенная поверхность должна быть менее округлой, чем внешняя.
- Desktop-поверхности сдержаннее промо- и mobile-поверхностей.
- Служебные элементы не задают общую шкалу скруглений.
- Не смешивай радиусы внутри одного компонента без иерархической причины.
- Используй готовый компонентный вариант, если он уже содержит нужный радиус.

## Section 5: Структура текста

### Основная шкала

- `0` — без видимой поверхности или для внутренних layout-фреймов.
- `2` — микро-индикаторы и skeleton-линии.
- `4` — мелкие add-on элементы и служебные слоты.
- `6` — маленькие icon actions около `24px`.
- `8` — small controls, compact content areas и внутренние блоки.
- `10` — стандартные контролы и поля.
- `12` — крупные контролы и вложенные поверхности второго уровня.
- `14` — самые крупные поля и кнопки.
- `16` — основные desktop-поверхности и outer plates.
- `20` — круглые индикаторы и icon-view маркеры.
- `24` — крупные promo, mobile и card surfaces.
- `28` и `32` — специализированные продуктовые карточки.
- `999` или `9999` — pill, round badge или circle.

### Подтверждения из каталогов

- `Button`: `Size=32` использует `8`, `Size=40/48` использует `10`, `Size=56` использует `12`, `Size=64/72` использует `14`, `Shape=Rounded` использует `999`.
- `IconButton`: `Size=24` использует `6`, `Size=32` использует `8`, `Size=40/48` использует `10`, `Size=56` использует `12`.
- `Input`, `Select`, `AmountInput`, `NumberInput`, `UniversalDateInput`: поля используют `10`, `12`, `14` по размеру.
- `Tag` и `FilterTag`: прямоугольные варианты используют `8`, `10`, `12`, rounded-варианты используют `999` или `9999`.
- `BackgroundPlate`: `Style Level 1` использует `16`, `Style Level 2` использует `12`.
- `Plate`: поддерживает `BorderRadius=0`, `12`, `16`, `24`.
- `ContentCardWrapper`: desktop-вложенность использует `12`, mobile/large wrapper использует `24`.
- `PromoCard`, `BenefitCard`, `BentoGrid`: крупные промо-поверхности используют `24`.
- `StatusBadge`, `Status`, `Calendar Day`, `ScrollBar`: круглые и pill-элементы используют большие full-radius значения.
- `WidgetPlate [D]`: внешний `[D] Style Level 1` использует `16`, вложенные `Content` и `Footer` используют `12`.
- `Modal` и `UniversalModal`: используют собственные радиусы модальной поверхности и служебных overlay-элементов. Эти значения не переносятся на `BackgroundPlate`, `WidgetPlate` и обычные рабочие plate-поверхности.

## Section 6: Правила

### Rule 1: Выбирай радиус по роли элемента

- ruleId: rule:visual.border-radius.role-based-radius
- severity: error
- appliesTo: component
- checkType: llm
- autofix: partial

Радиус должен выводиться из роли элемента: контрол, поверхность, вложенный блок, промо-карточка, бейдж или pill.

#### Правильно

```text
Button Size 56 Shape Rectangular → radius 12
BackgroundPlate Level 1 → radius 16
StatusBadge → full radius
```

#### Неправильно

```text
Button Size 56 Shape Rectangular → radius 24
BackgroundPlate Level 1 → radius 8
StatusBadge → radius 8
```

#### Почему

Скругление кодирует роль и уровень элемента. Произвольный радиус ломает компонентную иерархию.

### Rule 2: Масштабируй радиус контролов вместе с высотой

- ruleId: rule:visual.border-radius.control-size-scale
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для прямоугольных контролов используй шкалу каталога: `32 → 8`, `40/48 → 10`, `56 → 12`, `64/72 → 14`.

#### Правильно

```text
Button Size 32 → radius 8
IconButton Size 40 → radius 10
Input Size 72 → radius 14
```

#### Неправильно

```text
Button Size 32 → radius 12
IconButton Size 40 → radius 16
Input Size 72 → radius 8
```

#### Почему

Каталог `Button`, `IconButton`, `Input` и `Select` показывает устойчивую связь высоты и радиуса.

### Rule 3: Используй full radius только для pill и circle

- ruleId: rule:visual.border-radius.full-radius-only-for-pill
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`999`, `9999`, `99`, `100` и похожие full-radius значения допустимы только для pill, круглых бейджей, круглых индикаторов, scrollbar thumb и calendar day.

#### Правильно

```text
Tag Shape Rounded → full radius
StatusBadge → full radius
Calendar selected day → full radius
```

#### Неправильно

```text
Card → full radius
Input → full radius
Table row → full radius
```

#### Почему

Full radius в каталоге означает форму pill или circle, а не универсальное большое скругление.

### Rule 4: Разделяй уровни поверхностей

- ruleId: rule:visual.border-radius.surface-levels
- severity: error
- appliesTo: component
- checkType: manual
- autofix: no

Внешняя рабочая desktop-поверхность должна быть округлее вложенной: `Level 1` использует `16`, `Level 2` использует `12`. Для `WidgetPlate [D]` это означает `[D] Style Level 1 → 16`, а вложенные `Content` и `Footer → 12`.

#### Правильно

```text
BackgroundPlate Level 1 → radius 16
BackgroundPlate Level 2 → radius 12
WidgetPlate [D] / [D] Style Level 1 → radius 16
WidgetPlate [D] / Content или Footer → radius 12
```

#### Неправильно

```text
BackgroundPlate Level 1 → radius 12
BackgroundPlate Level 2 → radius 16
WidgetPlate [D] / [D] Style Level 1 → radius 32
```

#### Почему

Так вложенность читается визуально: внешний контейнер мягче, внутренний собраннее.

### Rule 5: Не переносить promo radius в рабочие B2B-поверхности

- ruleId: rule:visual.border-radius.no-promo-radius-for-work-ui
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Радиус `24` используй для крупных promo, mobile и card surfaces. Для плотных рабочих desktop-блоков чаще подходят `12` и `16`.

#### Правильно

```text
PromoCard → radius 24
BenefitCard → radius 24
Desktop BackgroundPlate Level 1 → radius 16
Desktop BackgroundPlate Level 2 → radius 12
```

#### Неправильно

```text
Desktop table container → radius 24
Dense filter block → radius 24
Corporate topbar control → radius 24
```

#### Почему

Промо-компоненты допускают более мягкую форму, а рабочие B2B-интерфейсы требуют плотности и предсказуемости.

### Rule 6: Не считать служебные радиусы системными

- ruleId: rule:visual.border-radius.ignore-technical-radii
- severity: warning
- appliesTo: component
- checkType: manual
- autofix: no

Не используй дробные и редкие значения из иконок, webview, helper-обложек и native-элементов как продуктовые токены.

#### Правильно

```text
Использовать 8, 10, 12, 14, 16, 24 или full radius
```

#### Неправильно

```text
Использовать 54.37 для карточки
Использовать 655 для промо-блока
Использовать 1.33333 для UI-контрола
```

#### Почему

Эти значения появляются в служебной графике и нативных деталях, а не в правилах продуктового интерфейса.

### Rule 7: Не переносить modal radius на plate-поверхности

- ruleId: rule:visual.border-radius.no-modal-radius-for-plates
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`Modal` и `UniversalModal` имеют собственную геометрию overlay/modal shell. Их крупные радиусы не задают правила для `BackgroundPlate`, `WidgetPlate`, `Plate`, виджетов и обычных рабочих desktop-поверхностей.

#### Правильно

```text
WidgetPlate [D] / [D] Style Level 1 → radius 16
BackgroundPlate [D] / Style Level 1 → radius 16
BackgroundPlate [D][Promo] / Style Level 1 → radius 24
UniversalModal → использовать радиус, заданный самим modal-компонентом
```

#### Неправильно

```text
WidgetPlate [D] / [D] Style Level 1 → radius 32
BackgroundPlate [D] / Style Level 1 → radius 32
Plate в рабочем dashboard → radius modal shell
```

#### Почему

Модальная поверхность изолирована от страницы и может использовать свою геометрию. Plate- и widget-поверхности участвуют в плотной desktop-сетке, поэтому должны сохранять уровни `16/12`.

## Section 7: Шаблоны

### Шаблон выбора радиуса для контрола

```text
Если компонент интерактивный и прямоугольный:
1. Определи высоту: 32, 40, 48, 56, 64 или 72.
2. Примени радиус: 8, 10, 10, 12, 14 или 14.
3. Если Shape=Rounded, замени радиус на full radius.
```

### Шаблон выбора радиуса для поверхности

```text
Если поверхность внешняя: radius 16.
Если поверхность вложенная: radius 12.
Если поверхность promo/mobile/card: radius 24.
Если поверхность modal/universal modal: используй радиус, заданный modal-компонентом.
Если поверхность не имеет видимой заливки или границы: radius 0.
```

### Шаблон выбора радиуса для индикатора

```text
Если индикатор круглый или pill: full radius.
Если индикатор compact/icon-view: radius 20.
Если это skeleton-line: radius 2 или full radius по готовому компоненту Skeleton.
```

## Section 8: Примеры

### Пример 1: Кнопка стандартного размера

```text
Компонент: Button
Size: 56
Shape: Rectangular
Radius: 12
```

### Пример 2: Поле большого размера

```text
Компонент: Input
Size: 72
Field radius: 14
```

### Пример 3: Двухуровневая поверхность

```text
Внешний контейнер: BackgroundPlate Level 1 → radius 16
Внутренний контейнер: BackgroundPlate Level 2 → radius 12
```

### Пример 4: WidgetPlate в рабочем desktop-интерфейсе

```text
Компонент: WidgetPlate [D]
[D] Style Level 1: radius 16
Content/Footer: radius 12
```

### Пример 5: Промо-карточка

```text
Компонент: PromoCard
Surface radius: 24
Внутренний content wrapper: 16
```

### Пример 6: Статусный бейдж

```text
Компонент: StatusBadge
Shape: circle или pill
Radius: full
```

### Пример 7: Модальная поверхность

```text
Компонент: Modal или UniversalModal
Surface radius: значение из готового modal-компонента
Не использовать этот radius для WidgetPlate или BackgroundPlate [D]
```

## Section 9: Антипримеры

### Антипример 1: Слишком мягкий рабочий контрол

```text
Desktop Button Size 40 → radius 24
```

Такой контрол выглядит как промо-карточка или pill, хотя должен быть обычной кнопкой.

### Антипример 2: Одинаковый радиус у вложенных поверхностей

```text
Outer plate → radius 16
Inner plate → radius 16
```

Вложенность хуже читается, потому что уровни поверхности не различаются.

### Антипример 3: Full radius у поля ввода

```text
Input Size 56 → radius 999
```

Поле начинает выглядеть как pill/tag и теряет связь с остальными input-компонентами.

### Антипример 4: Служебный радиус из helper-графики

```text
Card surface → radius 54.37
```

Значение не относится к продуктовой шкале и не должно использоваться в UI.

### Антипример 5: Радиус modal shell на WidgetPlate

```text
WidgetPlate [D] / [D] Style Level 1 → radius 32
```

Обычная desktop-поверхность виджета должна оставаться на уровне `16`. Значения модальных и специализированных поверхностей не повышают радиус WidgetPlate.

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять прямоугольные `Button`, `IconButton`, `Tag`, `FilterTag` на соответствие радиуса размеру.
- Проверять `Shape=Rounded` у `Button`, `Tag`, `FilterTag`, `Status` на full radius.
- Проверять `BackgroundPlate [D] Level 1` на `16`, `BackgroundPlate [D] Level 2` на `12`.
- Проверять `WidgetPlate [D] / [D] Style Level 1` на `16`, `Content` и `Footer` на `12`.
- Проверять, что радиусы `Modal` и `UniversalModal` не применены к `BackgroundPlate [D]`, `WidgetPlate [D]` и обычным plate-поверхностям.
- Проверять отсутствие full radius у `Input`, `Select`, `AmountInput`, `NumberInput`, `UniversalDateInput`.

### Словарные проверки

- Искать нестандартные значения радиуса в продуктовых компонентах: дробные числа, `54.37`, `70`, `655`.
- Искать использование `24` в dense desktop controls, tables, filters и topbar-компонентах.
- Искать использование `32` и modal-specific радиусов в обычных desktop plate/widget-поверхностях.

### LLM-проверки

- Определять роль элемента, если radius нельзя проверить только по имени компонента.
- Проверять, не применён ли promo/mobile radius к рабочему B2B-интерфейсу.
- Проверять, не применён ли modal/universal modal radius к обычной plate/widget-поверхности.
- Проверять, есть ли иерархическая причина для разных радиусов внутри одного компонента.

### Не проверяется автоматически

- Намеренные визуальные исключения, согласованные дизайн-системой.
- Иллюстрации, helper-обложки, логотипы, webview/native keyboard и внутренние векторные формы.
- Компоненты, которые наследуют радиус через готовый instance без явного значения в JSON.

### Автоисправления

- Можно автоматически заменить радиус прямоугольного контрола по размерной шкале.
- Можно автоматически заменить rounded-вариант на full radius.
- Можно автоматически заменить `BackgroundPlate Level 1` на `16`, `Level 2` на `12`.
- Можно автоматически заменить `WidgetPlate [D] / [D] Style Level 1` на `16`, `Content/Footer` на `12`.
- Нельзя автоматически менять радиусы поверхностей, если роль элемента не определена однозначно.
