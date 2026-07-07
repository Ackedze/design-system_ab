# Pattern: ContentCardWrapper

- documentType: pattern
- patternType: component
- component: ContentCardWrapper
- patternId: ptrn:components.content-card-wrapper
- patternKey: components.content-card-wrapper
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: draft
- updatedAt: 2026-07-07
- sourceType: component-guideline
- tags: contentcardwrapper, content-card, card, form, choice, slot, action, web-corp
- figmaLink: none
- relatedPatterns:
  - ptrn:components.background-plate
- sections: 10

## Section 1: Определение

`ContentCardWrapper` — компонент карточки для разбиения сложной формы на отдельные логические подсценарии и выбора одной или нескольких сущностей.

Карточка помогает снизить когнитивную нагрузку, сократить длину формы и показать пользователю достаточно информации, чтобы отличить одну сущность от другой. Компонент строится из левого слота выбора, центрального содержимого и правого слота действий. Для Desktop и MobileWeb используются разные композиционные принципы.

## Section 2: Когда использовать

Используйте `ContentCardWrapper`:

- на страницах форм;
- в сценариях выбора одного или нескольких вариантов;
- когда форма содержит однотипные логические блоки;
- когда в каждом блоке 3 или больше полей;
- когда по клику на карточку нужно показать дополнительную информацию на странице;
- когда после добавления сущности нужно заменить placeholder полноценной карточкой.

Типовые компоненты каталога:

- `[D] ContentCardWrapper`, `[M] ContentCardWrapper`;
- `🔩 [D] LeftSlot`, `🔩 [M] LeftSlot`;
- `🔩 MiddleContentSlot`, `🔩 [M] MiddleContentSlot`;
- `🔩 [D] RightSlot`, `🔩 [M] RightSlot`;
- `🔩 [D] ContentPresets`, `🔩 [M] ContentPresets`.

## Section 3: Когда не использовать

Не используйте `ContentCardWrapper`, если:

- карточка не связана с формой или выбором сущности;
- внутри карточки нет набора параметров, по которым можно отличить сущности;
- блок содержит меньше 3 полей и не требует отдельного подсценария;
- карточка используется как обычная навигационная плитка;
- `Disabled` используется как альтернативный визуальный стиль карточки;
- правый слот перегружается действиями вместо меню;
- MobileWeb или adaptive повторяет desktop-раскладку горизонтальными сегментами без необходимости.

## Section 4: Принципы

1. Карточка должна помогать выбрать или отредактировать сущность в составе формы.
2. Контента на карточке должно быть достаточно для дифференциации сущностей.
3. Базовая структура карточки — три горизонтальные ячейки: `Left`, `Middle`, `Right`.
4. `LeftSlot` используется для выбора: `Radio`, `Checkbox`, `Switch` или заменяемый `SwapMe`.
5. `MiddleSlot` содержит основную информацию: заголовок, дополнительные строки, статусы и пояснения.
6. `RightSlot` содержит иконки действий, а не основной контент карточки.
7. В Desktop контент лучше раскладывать горизонтально, чтобы экономить место.
8. В MobileWeb и adaptive контент выстраивается вертикально, если нет специальной задачи разнести значения по разным сторонам.
9. Loading-состояние собирается через `Skeleton=True`; скелетон занимает всю ширину и высоту карточки.
10. Placeholder заранее резервирует место под карточку и запускает сценарий добавления.
11. Добавление и редактирование контента карточки происходит в модальном сценарии, на MobileWeb и adaptive — в полноэкранной версии.
12. После создания карточки нужно показать `Notification`.
13. `Disabled` блокирует все состояния карточки и не используется как визуальный стиль для единичного выбора.
14. Отступы от краёв карточки до контента не меняются: Desktop использует `24 px`, MobileWeb использует `16 px`.
15. Уровень встроенного `BackgroundPlate` не меняется: Desktop использует `Level 2 (inner)`, MobileWeb использует `Level 1 (outer)`.
16. Стили типографики текстовых элементов внутри карточки не меняются вручную.

## Section 5: Структура текста

`ContentCardWrapper` настраивается через состояние и skeleton:

```text
ContentCardWrapper
State: Active | Disabled | Empty | Error
Skeleton: False | True
```

Левый слот:

```text
LeftSlot
Presets: Checkbox | Radio | Switch | SwapMe
```

Центральный слот:

```text
MiddleContentSlot
Capacity: 1 | 2 | 3 | 4
Connected: True | False

ContentPresets
Presets: Title | SubTitle | ExtraTitle | SwapMe
```

Правый слот:

```text
RightSlot
Presets: IconButton | SwapMe
```

Минимальная полезная связка контента должна состоять из уникальных параметров сущности:

```text
[Название] + [ИНН] + [БИК]
[Имя] + [Роль] + [Почта]
[Имя] + [ИНН] + [Доля владения]
```

Для заголовка карточки используются разные текстовые стили:

```text
Desktop: Headline-System / 18-22 xSmall
MobileWeb: Action / 16-24 Medium
```

Отступы до краёв карточки и уровень подложки являются частью компонентной структуры:

```text
Desktop ContentCardWrapper
padding: 24 px
BackgroundPlate Position: Level 2 (inner)

MobileWeb ContentCardWrapper
padding: 16 px
BackgroundPlate Position: Level 1 (outer)
```

Стили типографики текстовых элементов берутся из компонента и не заменяются ручными текстовыми стилями.

## Section 6: Правила

### Rule 1: Используй карточку только в форме или выборе сущности

- ruleId: rule:components.content-card-wrapper.form-choice-only
- severity: warning
- appliesTo: screen
- checkType: llm
- autofix: no

`ContentCardWrapper` используется на страницах форм и в сценариях, где карточка служит элементом выбора одного или нескольких вариантов.

#### Правильно

```text
Форма добавления бенефициаров использует ContentCardWrapper для каждого бенефициара.
```

#### Неправильно

```text
Главная страница использует ContentCardWrapper как навигационную плитку.
```

#### Почему

Компонент нужен для форменных подсценариев и выбора сущностей, а не для любой карточной навигации.

### Rule 2: Используй карточку для однотипных блоков от 3 полей

- ruleId: rule:components.content-card-wrapper.three-fields-minimum
- severity: recommendation
- appliesTo: flow
- checkType: llm
- autofix: no

Карточка уместна, если форма содержит однотипные логические блоки и в каждом блоке 3 или больше полей.

#### Правильно

```text
Бенефициар: ФИО, ИНН, доля владения, роль.
```

#### Неправильно

```text
Карточка используется для одного поля "Название".
```

#### Почему

Если данных мало, отдельная карточка увеличивает сложность формы вместо снижения когнитивной нагрузки.

### Rule 3: Показывай уникальные параметры сущности

- ruleId: rule:components.content-card-wrapper.entity-differentiation
- severity: error
- appliesTo: text
- checkType: llm
- autofix: no

На карточке должно быть достаточно информации, чтобы отличить сущности друг от друга. Используйте связку уникальных параметров: название, ИНН, БИК, имя, роль, почта, доля владения или другой бизнес-идентификатор.

#### Правильно

```text
ООО «Нагатино»
ИНН 385479038745 · Доля владения 45%
```

#### Неправильно

```text
ООО «Нагатино»
```

#### Почему

Один заголовок часто не даёт пользователю уверенно выбрать нужную сущность.

### Rule 4: Собирай loading через Skeleton=True

- ruleId: rule:components.content-card-wrapper.skeleton-variant
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Загрузочное состояние карточки собирается через `Skeleton=True`. Элемент скелетона занимает всю ширину и высоту карточки.

#### Правильно

```text
ContentCardWrapper
State=Active
Skeleton=True
```

#### Неправильно

```text
Внутри карточки вручную нарисованы маленькие skeleton-линии.
```

#### Почему

Встроенный skeleton сохраняет размер и структуру карточки.

### Rule 5: Empty резервирует место и запускает добавление

- ruleId: rule:components.content-card-wrapper.empty-placeholder-add
- severity: warning
- appliesTo: flow
- checkType: llm
- autofix: no

Состояние `Empty` используется как placeholder: оно заранее резервирует место под карточку, а сценарий добавления может начинаться по кнопке или по нажатию на саму карточку-placeholder.

#### Правильно

```text
Вы ещё не добавили ни одну сущность
Добавить бенефициара
```

#### Неправильно

```text
Пустой блок формы без места под будущую карточку.
```

#### Почему

Placeholder показывает пользователю, что здесь появится добавленная сущность, и даёт прямой вход в сценарий добавления.

### Rule 6: Редактируй карточку через клик по всей карточке

- ruleId: rule:components.content-card-wrapper.card-click-edits
- severity: warning
- appliesTo: flow
- checkType: llm
- autofix: no

В состоянии `Active` переход в редактирование происходит по клику на всю карточку. Отдельная иконка справа может использоваться для удаления или дополнительных действий.

#### Правильно

```text
Клик по карточке открывает редактирование.
RightSlot содержит иконку удаления.
```

#### Неправильно

```text
Карточка не кликабельна, редактирование доступно только через мелкую иконку.
```

#### Почему

Вся карточка является крупной и понятной интерактивной областью для редактирования.

### Rule 7: Ограничивай действия в RightSlot

- ruleId: rule:components.content-card-wrapper.right-slot-actions
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

`RightSlot` предназначен для иконок действий. Если доступно больше двух действий, используйте иконку многоточия и dropdown. Корзинка находится справа, кроме кейсов с шевроном.

#### Правильно

```text
RightSlot: delete

или

RightSlot: more
Dropdown: Редактировать, Дублировать, Удалить
```

#### Неправильно

```text
RightSlot: edit, copy, delete, print
```

#### Почему

Перегруженный правый слот ухудшает сканирование карточки и конфликтует с основным кликом по карточке.

### Rule 8: В standalone и adaptive действия открываются через BottomSheet

- ruleId: rule:components.content-card-wrapper.mobile-actions-bottomsheet
- severity: warning
- appliesTo: flow
- checkType: llm
- autofix: no

В standalone и adaptive правый аддон для набора действий не используется. При тапе на карточку поднимается `BottomSheet` со всеми доступными действиями.

#### Правильно

```text
MobileWeb: тап по карточке -> BottomSheet со списком действий.
```

#### Неправильно

```text
MobileWeb: несколько action icon вынесены в правый слот карточки.
```

#### Почему

На узкой ширине набор иконок справа перегружает карточку и уменьшает область основного контента.

### Rule 9: В Disabled нельзя добавлять, изменять и выбирать карточки

- ruleId: rule:components.content-card-wrapper.disabled-is-view-only
- severity: error
- appliesTo: flow
- checkType: llm
- autofix: no

Состояние `Disabled` используется на страницах просмотра, где с карточками нельзя совершать действия, в том числе добавлять новую карточку, редактировать, удалять или выбирать карточку.

#### Правильно

```text
Страница просмотра: карточки Disabled, кнопки добавления нет.
```

#### Неправильно

```text
Disabled-карточка содержит действие "Добавить".
```

#### Почему

Disabled должен означать недоступность всех действий и состояний карточки.

### Rule 10: Не используй Disabled как другой стиль карточки

- ruleId: rule:components.content-card-wrapper.disabled-not-style
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`Disabled` нельзя использовать как альтернативный визуальный стиль карточки или как стиль для единичного выбора. Для такого сценария используется другой компонент карточки единичного выбора.

#### Правильно

```text
Для единичного выбора используется специальная карточка единичного выбора.
ContentCardWrapper State=Disabled применяется только для недоступной карточки просмотра.
```

#### Неправильно

```text
ContentCardWrapper State=Disabled используется как приглушённый стиль selectable-карточки.
```

#### Почему

В состоянии `Disabled` блокируются все состояния и взаимодействия карточки, поэтому пользователь не сможет корректно выбрать или открыть карточку.

### Rule 11: Разводи Desktop и MobileWeb раскладку

- ruleId: rule:components.content-card-wrapper.desktop-horizontal-mobile-vertical
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

В Desktop контент лучше раскладывать по горизонтальным сегментам. В MobileWeb и adaptive сегменты выстраиваются вертикально друг под другом. Исключение — кейсы, где значения специально выравниваются по разным сторонам карточки.

#### Правильно

```text
Desktop: имя | реквизиты | сумма
MobileWeb: имя, реквизиты и сумма идут вертикально.
```

#### Неправильно

```text
MobileWeb повторяет desktop-строку из нескольких узких горизонтальных сегментов.
```

#### Почему

На Desktop горизонтальная раскладка экономит место, а на MobileWeb вертикальная сохраняет читаемость.

### Rule 12: Используй платформенный стиль заголовка

- ruleId: rule:components.content-card-wrapper.title-text-style-by-platform
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Для заголовка карточки в Desktop используется `Headline-System / 18-22 xSmall`. В MobileWeb используется `Action / 16-24 Medium`.

#### Правильно

```text
Desktop Title: Headline-System / 18-22 xSmall
MobileWeb Title: Action / 16-24 Medium
```

#### Неправильно

```text
MobileWeb Title использует desktop-стиль Headline-System / 18-22 xSmall.
```

#### Почему

Платформенные стили сохраняют ожидаемую плотность и читаемость карточки.

### Rule 13: LeftSlot выбирает карточку

- ruleId: rule:components.content-card-wrapper.left-slot-selection
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Если вся карточка работает как элемент выбора, `LeftSlot` принимает `Radio` или `Checkbox` в зависимости от логики выбора. При наличии левого слота клик на карточку приводит к выбору этого элемента.

#### Правильно

```text
Один вариант: LeftSlot Presets=Radio
Несколько вариантов: LeftSlot Presets=Checkbox
```

#### Неправильно

```text
Карточка выбирается, но LeftSlot пустой и логика выбора не видна.
```

#### Почему

Левый слот делает тип выбора явным и связывает клик по карточке с понятным контролом.

### Rule 14: Не меняй отступы до краёв карточки

- ruleId: rule:components.content-card-wrapper.edge-padding-immutable
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Отступы от краёв карточки до контента являются частью компонента и не меняются вручную. Для Desktop используется `24 px`, для MobileWeb используется `16 px`.

#### Правильно

```text
[D] ContentCardWrapper padding: 24 px
[M] ContentCardWrapper padding: 16 px
```

#### Неправильно

```text
[D] ContentCardWrapper padding: 20 px
[M] ContentCardWrapper padding: 24 px
```

#### Почему

Эти отступы задают плотность карточки и согласованы с её внутренней композицией. Если менять их вручную, карточки начинают отличаться по сканированию и посадке контента.

### Rule 15: Не меняй уровень BackgroundPlate

- ruleId: rule:components.content-card-wrapper.background-plate-level-by-platform
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

У встроенного `BackgroundPlate` нельзя менять уровень. В Desktop используется только `Level 2 (inner)`, в MobileWeb используется только `Level 1 (outer)`.

#### Правильно

```text
Desktop: BackgroundPlate Position=Level 2 (inner)
MobileWeb: BackgroundPlate Position=Level 1 (outer)
```

#### Неправильно

```text
Desktop: BackgroundPlate Position=Level 1 (outer)
MobileWeb: BackgroundPlate Position=Level 2 (inner)
```

#### Почему

Уровень подложки в `ContentCardWrapper` уже учитывает платформенную композицию: desktop-карточка находится как внутренняя подложка, mobile-карточка — как внешний уровень.

### Rule 16: Не меняй стили типографики текстовых элементов

- ruleId: rule:components.content-card-wrapper.text-style-immutable
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Стили типографики всех текстовых элементов внутри карточки должны оставаться компонентными. Нельзя вручную менять `styles.text` у заголовков, подзаголовков, дополнительных строк, статусов и пояснений.

#### Правильно

```text
Text elements use component baseline typography.
Desktop Title: Headline-System / 18-22 xSmall
MobileWeb Title: Action / 16-24 Medium
```

#### Неправильно

```text
Title вручную переведён на другой text style.
Subtitle вручную переведён на стиль заголовка.
```

#### Почему

Типографика определяет иерархию карточки. Ручная замена текстовых стилей ломает сканирование и может исказить роль данных.

## Section 7: Шаблоны

### Активная карточка

```text
ContentCardWrapper
State=Active
Skeleton=False

LeftSlot: optional Radio | Checkbox | Switch
MiddleSlot: title + identifiers + optional status
RightSlot: optional delete | more
Padding: 24 px on Desktop, 16 px on MobileWeb
BackgroundPlate: Level 2 on Desktop, Level 1 on MobileWeb
```

### Placeholder

```text
ContentCardWrapper
State=Empty
Skeleton=False

Text: Вы ещё не добавили ни одну [сущность]
Action: Добавить [название]
```

### Loading

```text
ContentCardWrapper
State=Active
Skeleton=True
```

### Desktop layout

```text
LeftSlot | MiddleSlot horizontal segments | RightSlot
```

### MobileWeb layout

```text
LeftSlot
MiddleSlot vertical content
Tap card -> BottomSheet actions
```

## Section 8: Примеры

### Пример 1: карточка компании

```text
ООО «Нагатино»
ИНН 385479038745 · Доля владения 45%
```

### Пример 2: карточка бенефициара

```text
Вениаминов Константин Павлович
ИНН 385479038745 · Доля владения 45%
```

### Пример 3: карточка с действиями

```text
Клик по карточке: редактировать
RightSlot: more
Dropdown: Редактировать, Дублировать, Удалить
```

### Пример 4: пустое состояние

```text
Вы ещё не добавили ни одного бенефициара
Добавить бенефициара
```

## Section 9: Антипримеры

### Антипример 1: карточка без идентификаторов

```text
ООО «Нагатино»
```

### Антипример 2: перегруженный правый слот

```text
RightSlot: edit, copy, delete, print
```

### Антипример 3: mobile-карточка как desktop-строка

```text
MobileWeb: ФИО | счёт | БИК | роль | действие
```

### Антипример 4: disabled с действиями

```text
State=Disabled
Action: Добавить
```

### Антипример 5: disabled как стиль выбора

```text
State=Disabled
используется как приглушённый стиль карточки единичного выбора
```

### Антипример 6: loading вручную

```text
Skeleton=False
Внутри карточки нарисованы ручные серые прямоугольники.
```

### Антипример 7: изменены базовые отступы карточки

```text
[D] ContentCardWrapper padding изменён с 24 px на 20 px
```

### Антипример 8: изменён уровень BackgroundPlate

```text
[D] ContentCardWrapper
BackgroundPlate Position=Level 1 (outer)
```

### Антипример 9: изменён текстовый стиль

```text
Title вручную переведён на другой typography style
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять, что `Skeleton=True` используется для loading-состояния.
- Проверять допустимые значения `State`: `Active`, `Disabled`, `Empty`, `Error`.
- Проверять допустимые значения `LeftSlot Presets`: `Checkbox`, `Radio`, `Switch`, `SwapMe`.
- Проверять допустимые значения `RightSlot Presets`: `IconButton`, `SwapMe`.
- Проверять допустимые значения `MiddleContentSlot Capacity`: `1`, `2`, `3`, `4`.
- Проверять текстовый стиль заголовка по платформе: Desktop `Headline-System / 18-22 xSmall`, MobileWeb `Action / 16-24 Medium`.
- Проверять, что edge padding у `[D] ContentCardWrapper` равен `24 px`, а у `[M] ContentCardWrapper` равен `16 px`.
- Проверять, что вложенный `BackgroundPlate` использует `Level 2 (inner)` в Desktop и `Level 1 (outer)` в MobileWeb.
- Проверять, что `styles.text` текстовых элементов не отличается от component baseline.

### Словарные проверки

- Находить карточки с одним только названием без идентификаторов.
- Находить ручные подписи `Добавить [название]`, если они не связаны с `State=Empty`.
- Находить несколько action icon в правом слоте на MobileWeb или adaptive.
- Находить `Disabled` рядом с действиями `Добавить`, `Редактировать`, `Удалить`, если это не текст описания.
- Находить `Disabled` рядом с признаками выбора: `выбрать`, `selected`, `single choice`, `radio`, `единичный выбор`.
- Находить ручные `px`-значения рядом с padding карточки.
- Находить ручные упоминания `Level 1` или `Level 2` рядом с `ContentCardWrapper`, если они не совпадают с платформой.

### LLM-проверки

- Проверять, что карточка используется в форме или сценарии выбора сущности.
- Проверять, что карточка применяется для однотипных блоков с 3 и более полями.
- Проверять, что содержимое карточки дифференцирует сущности.
- Проверять, что клик по активной карточке открывает редактирование.
- Проверять, что при количестве действий больше двух используется многоточие и dropdown.
- Проверять, что в MobileWeb и adaptive действия собраны в BottomSheet.
- Проверять, что Desktop использует горизонтальную раскладку, а MobileWeb — вертикальную.
- Проверять, что `State=Disabled` не используется как альтернативный визуальный стиль карточки или стиль единичного выбора.
- Проверять, что изменения padding, background level и typography не трактуются как допустимая дизайнерская настройка компонента.

### Не проверяется автоматически

- Бизнес-достаточность конкретного набора идентификаторов без знания сценария.
- Нужен ли `Switch` вместо `Checkbox` или `Radio` в конкретной форме.
- Содержимое модалки добавления и редактирования.
- Факт показа `Notification` после создания карточки без анализа flow.
- Исключения, где MobileWeb специально выравнивает значения по разным сторонам карточки.
- Продуктовая причина выбора конкретного набора текстовых строк, если компонентные стили не изменены.

### Автоисправления

- Включить `Skeleton=True` вместо ручного loading, если состояние распознано однозначно.
- Заменить недопустимое значение `State` или `Presets` на ближайший допустимый вариант только при однозначном контексте.
- Подставить платформенный текстовый стиль заголовка, если слой заголовка распознан точно.
- Вернуть edge padding к `24 px` для Desktop и `16 px` для MobileWeb.
- Вернуть `BackgroundPlate` к `Level 2 (inner)` для Desktop и `Level 1 (outer)` для MobileWeb.
- Вернуть текстовые стили к component baseline, если изменённый текстовый слой распознан однозначно.
