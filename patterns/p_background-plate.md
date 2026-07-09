# Pattern: BackgroundPlate

- documentType: pattern
- patternType: component
- component: BackgroundPlate
- patternId: ptrn:components.background-plate
- patternKey: components.background-plate
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: ready
- updatedAt: 2026-07-09
- sourceType: component-guideline
- tags: backgroundplate, background, plate, container, level, overlay, adaptive, skeleton, web-corp
- figmaLink: none
- relatedPatterns:
  - ptrn:components.title-view
  - ptrn:components.table-view
  - ptrn:forms.form-construction-rules
- sections: 10

## Section 1: Определение

`BackgroundPlate` — компонент подложки для смысловых блоков и вложенных областей в продуктовых интерфейсах Альфа-Бизнеса.

Компонент задаёт уровень подложки, фон, стиль отображения, skeleton-состояние и, в варианте `BackgroundPlateSlot`, область для вложенного контента. Паттерн фиксирует выбор `Level 1` и `Level 2`, правила `BackgroundColor`, допустимые `Type`, кликабельность и адаптивное поведение.

## Section 2: Когда использовать

Используйте `BackgroundPlate`, когда нужно:

- выделить основной смысловой блок на странице;
- показать вложенный блок поверх основного блока;
- собрать фон под таблицей, формой, реквизитами или связанным контентом;
- сохранить единый фон подложек на странице;
- показать loading-состояние через `Skeleton=True`;
- использовать промо-подложку через `[D][Promo]` или `[M][Promo] BackgroundPlate`.

Типовые компоненты каталога:

- `[D] BackgroundPlate`, `[M] BackgroundPlate`;
- `[D] BackgroundPlateSlot`, `[M] BackgroundPlateSlot`;
- `[D] Style Level 1`, `[M] Style Level 1`;
- `[D] Style Level 2`, `[M] Style Level 2`;
- `[D][Promo] BackgroundPlate`, `[M][Promo] BackgroundPlate`;
- `[D][Promo] Style Level 1`, `[M][Promo] Style Level 1`;
- `[D][Promo] Style Level 2`, `[M][Promo] Style Level 2`.

## Section 3: Когда не использовать

Не используйте `BackgroundPlate`, если:

- нужен только визуальный цвет фона без смыслового блока;
- вложенная подложка `Level 2` размещается без внешней `Level 1`;
- фон подложек на одной странице выбирается по-разному без причины;
- `Border` используется как кликабельная карточка;
- адаптивная версия оставляет лишние вложенные отступы и уровни без ручной настройки.

Не используйте ручные прямоугольники вместо `BackgroundPlate`, если доступен компонентный вариант с нужным уровнем и стилем.

## Section 4: Принципы

1. `Level 1` — первый или внешний слой подложки.
2. `Level 2` — второй или внутренний слой и всегда располагается только поверх `Level 1`.
3. `BackgroundColor` выбирается по фону основной страницы.
4. Значение `BackgroundColor` определяется один раз для всех подложек на странице.
5. Если компонент расположен на сером фоне, используется `base-bg-alt (gray)`.
6. Если компонент расположен на белом фоне, используется `base-bg (white)`.
7. Для `Level 2` не существует стиля `Secondary`.
8. `Border` используется как декоративный вариант и не может быть кликабельным.
9. Кликабельность активируется только в коде компонента.
10. В адаптиве вложенные конструкции требуют ручной проверки уровня и внутренних отступов.
11. Базовые `padding` могут иметь любое значение из spacing-шкалы, но должны задаваться через токены `Spacing`.

## Section 5: Структура текста

`BackgroundPlate` настраивается через `Position`, `BackgroundColor`, `Type` и `Skeleton`.

```text
BackgroundPlate
Position: Level 1 (outer) | Level 2 (inner)
BackgroundColor: base-bg-alt (gray) | base-bg (white)
Type: Primary | Secondary | Colored | Border
Skeleton: False | True
```

Для `Level 1` доступны `Primary`, `Secondary`, `Colored`, `Border`.

Для `Level 2` доступны `Primary`, `Colored`, `Border`. `Secondary` для `Level 2` не используется.

`BackgroundPlateSlot` содержит слот для контента. Внутренние отступы слота берутся из компонента и не заменяются ручной геометрией, кроме адаптивных случаев, где по гайду нужно вручную убрать внутренние `32 px`.

Базовые `padding` могут отличаться по сценарию, но каждое значение должно быть задано через токены `Spacing`: `0`, `1`, `2`, `4`, `6`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `56`, `64`, `72`, `80`, `96`, `128`, `256`.

## Section 6: Правила

### Rule 1: Используй Level 1 как внешний слой

- ruleId: rule:components.background-plate.level-1-outer
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`Level 1` используется как первый или внешний слой подложки для основных смысловых блоков на странице.

#### Правильно

```text
BackgroundPlate Position=Level 1 (outer)
Основной смысловой блок страницы
```

#### Неправильно

```text
Основной блок страницы собран сразу как Level 2
```

#### Почему

`Level 1` задаёт внешний слой композиции. Если начинать с `Level 2`, вложенность подложек становится неверной.

### Rule 2: Размещай Level 2 только поверх Level 1

- ruleId: rule:components.background-plate.level-2-over-level-1
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`Level 2` — внутренний слой наложения. Он всегда располагается только поверх `Level 1`.

#### Правильно

```text
BackgroundPlate Level 1
  BackgroundPlate Level 2
```

#### Неправильно

```text
BackgroundPlate Level 2
без родительского BackgroundPlate Level 1
```

#### Почему

`Level 2` нужен для вложения, а не для самостоятельного блока. Самостоятельные исключения возможны только в отдельных компонентах, где это заложено в компонентной структуре.

### Rule 3: Выбирай BackgroundColor по фону страницы

- ruleId: rule:components.background-plate.background-color-by-page
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Если компонент расположен на сером фоне, используйте `base-bg-alt (gray)`. Если компонент расположен на белом фоне, используйте `base-bg (white)`.

#### Правильно

```text
Страница на сером фоне -> BackgroundColor=base-bg-alt (gray)
Страница на белом фоне -> BackgroundColor=base-bg (white)
```

#### Неправильно

```text
Серый фон страницы -> BackgroundColor=base-bg (white)
Белый фон страницы -> BackgroundColor=base-bg-alt (gray)
```

#### Почему

Подложка должна соответствовать фону страницы и сохранять ожидаемую глубину наложения.

### Rule 4: Используй один BackgroundColor для всех подложек страницы

- ruleId: rule:components.background-plate.single-background-color-per-page
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Значение `BackgroundColor` определяется один раз для всех подложек на странице. Какой фон у основной страницы, такой вариант должен быть у всех `BackgroundPlate`.

#### Правильно

```text
Все BackgroundPlate на странице: BackgroundColor=base-bg-alt (gray)
```

#### Неправильно

```text
Один BackgroundPlate: base-bg-alt (gray)
Другой BackgroundPlate: base-bg (white)
без смены контекста страницы
```

#### Почему

Разные базовые фоны на одной странице создают случайную визуальную иерархию.

### Rule 5: Не используй Secondary для Level 2

- ruleId: rule:components.background-plate.no-secondary-for-level-2
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для `Level 2` не существует стиля `Secondary`. Используйте `Primary`, `Colored` или `Border`.

#### Правильно

```text
Position=Level 2 (inner)
Type=Primary
```

#### Неправильно

```text
Position=Level 2 (inner)
Type=Secondary
```

#### Почему

`Secondary` доступен для `Level 1`, но не для внутреннего уровня наложения.

### Rule 6: Не делай Border кликабельным

- ruleId: rule:components.background-plate.border-not-clickable
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`Border` используется как декоративный элемент и не может быть кликабельным.

#### Правильно

```text
Type=Border
clickable=false
```

#### Неправильно

```text
Type=Border
clickable=true
```

#### Почему

`Border` не должен выглядеть как декоративная подложка и одновременно работать как интерактивная карточка.

### Rule 7: Включай кликабельность только в коде компонента

- ruleId: rule:components.background-plate.clickable-in-code-only
- severity: warning
- appliesTo: component
- checkType: manual
- autofix: no

Кликабельность `BackgroundPlate` активируется только в коде компонента. В макете не заменяйте это ручными hover/click слоями.

#### Правильно

```text
Компонент в коде получает clickable-состояние
```

#### Неправильно

```text
В макете вручную добавлены слои для имитации кликабельности
```

#### Почему

Интерактивность должна соответствовать реализации компонента, а не декоративным слоям в макете.

### Rule 8: Настраивай адаптивные вложенные подложки вручную

- ruleId: rule:components.background-plate.adaptive-level-adjustment
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

В адаптиве нужно вручную изменить `BackgroundPlate Level 2` на `Level 1`, если в адаптивной композиции не предполагается наличие внешнего `Level 1`.

#### Правильно

```text
Desktop: Level 1 -> Level 2
Adaptive без внешнего Level 1: бывший Level 2 вручную изменён на Level 1
```

#### Неправильно

```text
Adaptive: Level 2 остался без внешнего Level 1
```

#### Почему

При перестроении страницы вложенность меняется. `Level 2` не должен оставаться самостоятельной подложкой.

### Rule 9: Убирай внутренние 32 px в адаптивных конструкциях

- ruleId: rule:components.background-plate.adaptive-remove-inner-32
- severity: warning
- appliesTo: screen
- checkType: llm
- autofix: no

В адаптиве внутренние отступы `32 px` в подобных вложенных конструкциях необходимо убирать вручную.

#### Правильно

```text
Adaptive: лишние внутренние 32 px у вложенной конструкции отключены вручную
```

#### Неправильно

```text
Adaptive: desktop-вложенность оставила внутренние 32 px и сжала контент
```

#### Почему

В мобильной ширине desktop-отступы внутри вложенных подложек перегружают экран и ломают полезную ширину контента.

### Rule 10: Используй Skeleton-вариант компонента

- ruleId: rule:components.background-plate.skeleton-variant
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Загрузочное состояние `BackgroundPlate` собирается через вариант `Skeleton=True`, а не через ручные placeholder-слои.

#### Правильно

```text
BackgroundPlate Skeleton=True
```

#### Неправильно

```text
BackgroundPlate скрыт, вместо него добавлены ручные серые прямоугольники
```

#### Почему

Встроенный skeleton сохраняет структуру, скругления, фон и размеры компонента.

### Rule 11: Задавай padding через токены Spacing

- ruleId: rule:components.background-plate.padding-uses-spacing-tokens
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Базовые `padding` у `BackgroundPlate` могут быть любыми по значению, но должны задаваться через токены из `Spacing.json`.

#### Правильно

```text
padding-left: Spacing/16
padding-right: Spacing/24
padding-top: Spacing/32
padding-bottom: Spacing/32
```

#### Неправильно

```text
padding-left: 16 px вручную
padding-right: 24 px вручную
padding-top: 30 px без токена
```

#### Почему

Padding может адаптироваться под сценарий, но токены сохраняют единую spacing-шкалу и позволяют агенту отличать допустимую настройку компонента от ручной геометрии.

### Rule 12: Не меняй скругления вручную

- ruleId: rule:components.background-plate.radius-fixed-by-component
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Скругления `BackgroundPlate`, `BackgroundPlateSlot` и вложенных `Style Level` задаются компонентом и его текущим вариантом. Не меняйте `radius` или `cornerRadius` вручную.

#### Правильно

```text
[D] BackgroundPlate Level 1 -> radius из component baseline
[D] Style Level 1 -> radius из component baseline
```

#### Неправильно

```text
[D] BackgroundPlate radius: 0 -> 24
[D] Style Level 1 radius: 16 -> 23
```

#### Почему

Скругления задают уровень поверхности и визуальную иерархию подложек. Ручное изменение radius ломает соответствие component baseline и должно фиксироваться как нарушение, а не как допустимая композиционная настройка.

## Section 7: Шаблоны

### Внешняя подложка

```text
BackgroundPlate
Position=Level 1 (outer)
BackgroundColor=<фон основной страницы>
Type=Primary | Secondary | Colored | Border
Skeleton=False
```

### Вложенная подложка

```text
BackgroundPlate Level 1
  BackgroundPlate
  Position=Level 2 (inner)
  Type=Primary | Colored | Border
```

### Загрузочное состояние

```text
BackgroundPlate
Skeleton=True
```

### Адаптив

```text
Desktop: Level 1 -> Level 2
Adaptive без внешнего Level 1: Level 2 -> Level 1
Adaptive: убрать лишние внутренние 32 px
```

### Padding через токены

```text
BackgroundPlateSlot
padding: Spacing/<token>
allowed tokens: 0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128, 256
```

## Section 8: Примеры

### Пример 1: основной блок на сером фоне

```text
Page background: gray
BackgroundPlate Position=Level 1 (outer)
BackgroundColor=base-bg-alt (gray)
Type=Primary
```

### Пример 2: вложенная область

```text
BackgroundPlate Level 1
  BackgroundPlate Level 2
  Type=Colored
```

### Пример 3: декоративная рамка

```text
BackgroundPlate
Type=Border
clickable=false
```

### Пример 4: адаптивное перестроение

```text
Desktop: реквизиты внутри Level 2
Adaptive: Level 2 заменён на Level 1, внутренние 32 px убраны
```

### Пример 5: произвольный padding через токен

```text
BackgroundPlateSlot
padding-top: Spacing/24
padding-right: Spacing/32
padding-bottom: Spacing/24
padding-left: Spacing/32
```

## Section 9: Антипримеры

### Антипример 1: Level 2 без Level 1

```text
BackgroundPlate Position=Level 2 (inner)
размещён как самостоятельный блок страницы
```

### Антипример 2: смешанные фоны на странице

```text
BackgroundPlate A: base-bg-alt (gray)
BackgroundPlate B: base-bg (white)
на одной странице без смены фонового контекста
```

### Антипример 3: Secondary для Level 2

```text
Position=Level 2 (inner)
Type=Secondary
```

### Антипример 4: кликабельный Border

```text
Type=Border
clickable=true
```

### Антипример 5: desktop-вложенность в адаптиве

```text
Adaptive
Level 2 без Level 1
внутренние 32 px остались
```

### Антипример 6: ручной padding без токена

```text
BackgroundPlateSlot
padding: 30 px
padding-left: 16 px вручную без Spacing token
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять, что компонент относится к `[D] BackgroundPlate`, `[M] BackgroundPlate`, `[D] BackgroundPlateSlot`, `[M] BackgroundPlateSlot` или их `[Promo]` вариантам.
- Проверять, что `Position=Level 2 (inner)` не используется как самостоятельная подложка без `Level 1`.
- Проверять соответствие `BackgroundColor` фону страницы: `base-bg-alt (gray)` для серого фона, `base-bg (white)` для белого фона.
- Проверять, что все `BackgroundPlate` на странице используют один `BackgroundColor`, если не найден отдельный фоновой контекст.
- Проверять запрет `Type=Secondary` для `Position=Level 2 (inner)`.
- Проверять, что `Type=Border` не помечен как clickable.
- Проверять, что loading-состояние использует `Skeleton=True`.
- Проверять, что `layout.padding.*` у `BackgroundPlate` и `BackgroundPlateSlot` задан через токены `Spacing`.
- Проверять, что значения `layout.padding.*` входят в набор `0`, `1`, `2`, `4`, `6`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `56`, `64`, `72`, `80`, `96`, `128`, `256`.
- Проверять, что `radius` и `cornerRadius` у `BackgroundPlate`, `BackgroundPlateSlot` и вложенных `Style Level` совпадают с effective baseline текущего варианта компонента. Любое ручное изменение скруглений считать нарушением.

### Словарные проверки

- Находить ручные названия уровней `Level 1` и `Level 2` вне component property.
- Находить ручные подписи `Primary`, `Secondary`, `Colored`, `Border` рядом с подложкой, если они не являются настройками компонента.
- Находить упоминания кликабельности для `Border`.
- Находить ручные значения `px` у padding без ссылки на `Spacing`.

### LLM-проверки

- Проверять, что `Level 1` используется как внешний слой смыслового блока.
- Проверять, что `Level 2` используется как внутренний слой поверх `Level 1`.
- Проверять, что в адаптиве `Level 2` не остаётся без внешнего `Level 1`.
- Проверять, что в адаптиве лишние внутренние `32 px` в подобных вложенных конструкциях убраны.
- Проверять, что ручные прямоугольники не заменяют доступный компонент `BackgroundPlate`.
- Проверять, что нестандартный padding является осознанной настройкой через spacing token, а не ручной правкой геометрии.

### Не проверяется автоматически

- Продуктовая необходимость конкретного цвета `Colored`.
- Исключения, заложенные внутри самостоятельных компонентов.
- Корректность кликабельности в коде без доступа к реализации.
- Все случаи адаптивного перестроения без просмотра desktop и adaptive вариантов рядом.
- Бизнес-уместность выбранного размера padding, если он задан корректным spacing token.

### Автоисправления

- Заменить `Type=Secondary` на допустимый тип для `Level 2`, если целевой стиль очевиден.
- Выставить единый `BackgroundColor` на странице, если фон страницы распознан однозначно.
- Включить `Skeleton=True` вместо ручных placeholder-слоёв, если loading-состояние однозначно распознано.
- Привязать ручное значение padding к соответствующему токену `Spacing`, если значение точно совпадает со spacing-шкалой.
