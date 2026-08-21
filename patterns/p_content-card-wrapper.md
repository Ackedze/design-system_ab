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
- status: active
- updatedAt: 2026-08-20
- sourceType: component-guideline
- tags: contentcardwrapper, content-card, card, form, choice, slot, action, web-corp
- figmaLink: https://www.figma.com/design/7WJ21bqd9XKcS8JBN4rdeY/%E2%9C%85-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82----ContentCardWrapper?node-id=1-211
- relatedPatterns:
  - ptrn:components.background-plate
- sections: 10

## Section 1: Определение

`ContentCardWrapper` — компонент для отображения однородного набора карточек одного типа с одинаковым набором параметров. Чаще всего он используется в формах, но также применяется на страницах просмотра.

Карточка помогает снизить когнитивную нагрузку и сократить длину страницы: повторяющиеся поля или элементы заполнения, редактирования и просмотра можно вынести в модальную сущность, а на основной странице оставить компактное представление. Компонент строится из левого слота, центрального содержимого и правого слота действий. Для Desktop и MobileWeb используются разные композиционные принципы.

## Section 2: Когда использовать

Используйте `ContentCardWrapper`:

- на страницах форм;
- на страницах просмотра;
- для набора однотипных сущностей с одинаковым набором параметров;
- в сценариях выбора одного или нескольких вариантов;
- когда форма или просмотровая страница содержит однотипные повторяющиеся логические блоки;
- когда повторяющиеся поля или элементы нужно вынести в модальную сущность и оставить на странице компактную карточку;
- когда по клику на карточку нужно показать дополнительную информацию на странице;
- когда после добавления сущности нужно заменить placeholder полноценной карточкой.

Набор карточек располагается внутри `BackgroundPlate` вместе с другими элементами формы или просмотровой страницы: заголовком, полями ввода и связанным контентом.

Типовые компоненты каталога:

- `[D] ContentCardWrapper`, `[M] ContentCardWrapper`;
- `🔩 [D] LeftSlot`, `🔩 [M] LeftSlot`;
- `🔩 MiddleContentSlot`, `🔩 [M] MiddleContentSlot`;
- `🔩 [D] RightSlot`, `🔩 [M] RightSlot`;
- `🔩 [D] ContentPresets`, `🔩 [M] ContentPresets`.

## Section 3: Когда не использовать

Не используйте `ContentCardWrapper`, если:

- карточки одной группы относятся к разным типам сущностей или используют разные наборы параметров;
- внутри карточки нет набора параметров, по которым можно отличить сущности;
- карточка используется как обычная навигационная плитка;
- набор карточек размещён вне `BackgroundPlate` и потерял контекст связанного блока формы или страницы просмотра;
- `Disabled` используется как альтернативный визуальный стиль карточки;
- правый слот перегружается действиями вместо меню;
- MobileWeb или adaptive повторяет desktop-раскладку горизонтальными сегментами без необходимости.

## Section 4: Принципы

1. Карточки одной группы отображают сущности одного типа и используют одинаковый набор параметров.
2. Компонент применяется в формах и на страницах просмотра; повторяющиеся данные могут редактироваться или просматриваться в модальной сущности.
3. Фиксированного минимума параметров нет: контента должно быть достаточно для однозначной идентификации сущности.
4. Набор карточек располагается внутри `BackgroundPlate` рядом с другими элементами связанного блока.
5. Базовая структура карточки — три горизонтальные ячейки: `Left`, `Middle`, `Right`.
6. `LeftSlot` используется для выбора: `Radio`, `Checkbox` или `Switch`. `SwapMe` — служебная заглушка.
7. `MiddleSlot` содержит основную информацию: заголовок, дополнительные строки, статусы и пояснения.
8. `RightSlot` содержит не более двух `IconButton`-действий. Произвольный component swap запрещён.
9. `StatusSlot` можно скрыть; в видимом слоте находится ровно один preset: `StatusPreset` для статуса карточки или `PropertyPreset` для акцента на одном параметре. Значения могут различаться у разных карточек.
10. В Desktop контент обычно раскладывается горизонтально, в MobileWeb и adaptive — вертикально; контекстные исключения допустимы.
11. Для вертикального и горизонтального интервала между внутренними элементами можно независимо выбрать любой spacing-токен дизайн-системы.
12. Loading-состояние собирается через `Skeleton=True`; оно совместимо с любым `State`, занимает всю ширину и высоту карточки и блокирует взаимодействие.
13. Placeholder заранее резервирует место под карточку и сам не кликабелен: если добавление разрешено, действие находится только в отдельной кнопке под карточкой; иначе кнопки нет.
14. Добавление и редактирование контента карточки может происходить в модальном сценарии, на MobileWeb и adaptive — в полноэкранной версии. `RightSlot` при этом разрешён и не требует обязательного `BottomSheet`.
15. После создания карточки нужно показать `Notification`.
16. `Active` доступен для взаимодействия; `Disabled` оставляет карточку только для просмотра и не используется как визуальный стиль для единичного выбора.
17. Отступы от краёв карточки до контента не меняются: Desktop использует `24 px`, MobileWeb использует `16 px`.
18. Уровень встроенного `BackgroundPlate` не меняется: Desktop использует `Level 2 (inner)`, MobileWeb использует `Level 1 (outer)`.
19. Стили типографики текстовых элементов внутри карточки не меняются вручную.
20. Для одной сущности между D/M сохраняются `State`, текст `Empty`/`Error`, тип и текст `StatusSlot`.

## Section 5: Структура текста

`ContentCardWrapper` настраивается через состояние и skeleton:

```text
ContentCardWrapper
State: Active | Disabled | Empty | Error
Skeleton: False | True
```

`Skeleton` семантически независим от `State`. Текущий raw-каталог содержит `Skeleton=True` только для `State=Active`; это известный долг Figma component set, а не запрет сочетаний `Disabled`, `Empty` или `Error` с загрузкой.

Левый слот:

```text
LeftSlot
Presets: Checkbox | Radio | Switch
SwapMe: service placeholder, replace before use
```

Центральный слот:

```text
MiddleContentSlot
Capacity: 1 | 2 | 3 | 4
Connected: True | False

Capacity задаёт точное количество ContentPresets.
Connected=True визуально связывает элементы точками.
Добавлять больше четырёх элементов вручную запрещено.

ContentPresets
Presets: Title | SubTitle | ExtraTitle
ExtraTitle: крупный жирный заголовок, обычно главный заголовок карточки
Title: небольшой заголовок
SubTitle: подпись к заголовку или параметры объекта
SwapMe: service placeholder, replace before use
```

Правый слот:

```text
RightSlot
Presets: IconButton
Maximum actions: 2
SwapMe: service placeholder, replace before use
```

Статусный слот:

```text
StatusSlot: optional
Content: StatusPreset | PropertyPreset
Maximum presets: 1
StatusPreset: статус карточки
PropertyPreset: акцент на одном параметре, например «Лучший»
Arbitrary swap: forbidden
```

В корневой карточке всегда остаются видимыми `BackgroundPlate` и минимум один `MiddleContentSlot`. Остальные slots и элементы можно скрывать независимо.

Фиксированного минимума строк или параметров нет. Выбирайте достаточный набор идентификаторов по контексту, например:

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

### Rule 1: Используй одинаковую структуру для однотипных сущностей

- ruleId: rule:components.content-card-wrapper.homogeneous-items
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

Карточки одной группы должны отображать сущности одного типа с одинаковым набором параметров.

#### Правильно

```text
Все карточки бенефициаров содержат ФИО, ИНН, роль и долю владения.
```

#### Неправильно

```text
В одной группе карточка компании содержит название и ИНН, а карточка физического лица — ФИО и роль.
```

#### Почему

Однородная структура позволяет быстро сравнивать элементы и понимать, какие данные относятся к одной сущности.

### Rule 2: Используй компонент в форме или на странице просмотра

- ruleId: rule:components.content-card-wrapper.form-or-view-page
- severity: info
- appliesTo: flow
- checkType: llm
- autofix: no

`ContentCardWrapper` чаще всего используется в форме, но также допустим на странице просмотра. Компонент может показывать набор однородных сущностей либо заменять повторяющиеся поля и элементы компактной карточкой, открывающей модальный подсценарий.

#### Правильно

```text
Страница просмотра содержит однородные карточки компаний внутри связанного блока.
```

#### Неправильно

```text
ContentCardWrapper используется как универсальная навигационная плитка вне формы или просмотрового контекста.
```

#### Почему

Компонент предназначен для структурирования повторяющихся данных, а не для любой карточной навигации.

### Rule 3: Показывай уникальные параметры сущности

- ruleId: rule:components.content-card-wrapper.entity-differentiation
- severity: error
- appliesTo: text
- checkType: llm
- autofix: no

Фиксированного минимального количества параметров нет. На карточке должно быть достаточно информации, чтобы однозначно отличить сущность в текущем контексте: название, ИНН, БИК, имя, роль, почта, доля владения или другой бизнес-идентификатор.

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

Загрузочное состояние карточки собирается через `Skeleton=True`. Этот признак независим от `State`: он допустим с `Active`, `Disabled`, `Empty` и `Error`. Скелетон занимает всю ширину и высоту карточки и блокирует взаимодействие.

#### Правильно

```text
ContentCardWrapper
State=Active | Disabled | Empty | Error
Skeleton=True
```

#### Неправильно

```text
Внутри карточки вручную нарисованы маленькие skeleton-линии.

или агент отклоняет `State=Disabled, Skeleton=True` только потому, что этой комбинации нет в текущем raw.
```

#### Почему

Встроенный skeleton сохраняет размер и структуру карточки.

### Rule 5: Используй Empty только при отсутствии карточек

- ruleId: rule:components.content-card-wrapper.empty-placeholder-add
- severity: info
- appliesTo: flow
- checkType: llm
- autofix: no

Состояние `Empty` используется только при нулевом количестве карточек. Текст строится как «Нет добавленных [сущностей]», label кнопки — как «Добавить [сущность]». Карточка не кликабельна. Если добавление разрешено, оно запускается только отдельной кнопкой под карточкой; если запрещено, кнопки нет.

#### Правильно

```text
State=Empty
Карточек: 0
Текст: Нет добавленных товаров
Добавление разрешено: кнопка «Добавить» под карточкой

или

Добавление запрещено: неинтерактивный placeholder без кнопки
```

#### Неправильно

```text
State=Empty при уже добавленных карточках.

или placeholder кликабелен без отдельной кнопки добавления.
```

#### Почему

Placeholder сохраняет место и явно отделяет отсутствие данных от доступности действия добавления.

### Rule 6: Соблюдай приоритет взаимодействий карточки и slots

- ruleId: rule:components.content-card-wrapper.interaction-priority
- severity: warning
- appliesTo: flow
- checkType: llm
- autofix: no

В состоянии `Active` действие основного клика зависит от композиции. Если видим `LeftSlot`, клик по карточке переключает вложенный `Radio`, `Checkbox` или `Switch`. Если `LeftSlot` отсутствует, клик открывает просмотр или редактирование по контексту страницы. Клик по `RightSlot` выполняет только собственное действие и не должен запускать основной клик карточки.

#### Правильно

```text
LeftSlot=Checkbox: клик по карточке переключает Checkbox.

Без LeftSlot: клик по карточке открывает просмотр или редактирование.

RightSlot=delete: клик удаляет и не открывает карточку.
```

#### Неправильно

```text
Клик по RightSlot=delete одновременно удаляет и открывает карточку.
```

#### Почему

Приоритеты предотвращают конфликт выбора, основного перехода и локальных действий.

### Rule 7: Ограничивай действия в RightSlot

- ruleId: rule:components.content-card-wrapper.right-slot-actions
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`RightSlot` предназначен максимум для двух `IconButton`-действий. Если доступно больше двух действий, используйте иконку многоточия и dropdown. Произвольный component swap запрещён; `SwapMe` является только служебной заглушкой. Корзинка находится справа, кроме кейсов с шевроном.

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

### Rule 8: Разрешай RightSlot на MobileWeb по общему контракту

- ruleId: rule:components.content-card-wrapper.mobile-right-slot-allowed
- severity: info
- appliesTo: flow
- checkType: llm
- autofix: no

На MobileWeb и adaptive `RightSlot` разрешён по тем же ограничениям: максимум два `IconButton`, без произвольного swap. `BottomSheet` может использоваться по отдельному продуктовому сценарию, но не является обязательной заменой `RightSlot`.

#### Правильно

```text
MobileWeb: RightSlot содержит один IconButton delete.
```

#### Неправильно

```text
MobileWeb: агент запрещает RightSlot или требует BottomSheet без продуктового правила.
```

#### Почему

Платформенный root уже содержит мобильный RightSlot; его использование регулируется общими composition-ограничениями.

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

В Desktop контент обычно раскладывается по горизонтальным сегментам. В MobileWeb и adaptive сегменты обычно выстраиваются вертикально друг под другом. Допустимы контекстные исключения. Вертикальные и горизонтальные интервалы между элементами можно менять только spacing-токенами.

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
- componentRuleId: component:web-corp.content-card-wrapper.title-text-style-by-platform
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
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
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Если вся карточка работает как элемент выбора или переключения, `LeftSlot` принимает только `Radio`, `Checkbox` или `Switch`: `Radio` — для единичного выбора, `Checkbox` — для множественного, `Switch` — для включения функции или состояния. `SwapMe` является служебной заглушкой, произвольный component swap запрещён. При наличии левого слота клик по карточке переключает вложенный контрол.

#### Правильно

```text
Один вариант: LeftSlot Presets=Radio
Несколько вариантов: LeftSlot Presets=Checkbox
Включение функции: LeftSlot Presets=Switch
```

#### Неправильно

```text
LeftSlot оставлен в SwapMe или заменён произвольным компонентом.
```

#### Почему

Левый слот делает тип выбора явным и связывает клик по карточке с понятным контролом.

### Rule 14: Не меняй отступы до краёв карточки

- ruleId: rule:components.content-card-wrapper.edge-padding-immutable
- componentRuleId: component:web-corp.content-card-wrapper.edge-padding-immutable
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
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
- componentRuleId: component:web-corp.content-card-wrapper.background-plate-level-by-platform
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
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
- componentRuleId: component:web-corp.content-card-wrapper.text-style-immutable
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
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

### Rule 17: Размещай набор карточек внутри BackgroundPlate

- ruleId: rule:components.content-card-wrapper.inside-background-plate
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

`ContentCardWrapper` располагается внутри `BackgroundPlate` вместе с другими элементами формы или страницы просмотра: заголовком, полями ввода и связанным контентом.

#### Правильно

```text
BackgroundPlate
├── TitleView
├── form fields
└── homogeneous ContentCardWrapper list
```

#### Неправильно

```text
Разрозненные ContentCardWrapper размещены вне связанного BackgroundPlate.
```

#### Почему

Подложка объединяет карточки с контекстом формы или просмотрового блока и сохраняет визуальную иерархию страницы.

### Rule 18: Выноси повторяющиеся данные в модальный подсценарий

- ruleId: rule:components.content-card-wrapper.modal-subflow-optimization
- severity: info
- appliesTo: flow
- checkType: llm
- autofix: no

Для оптимизации заполнения, редактирования или просмотра повторяющиеся поля и элементы можно вынести в модальную сущность, оставив на основной странице компактную карточку.

#### Правильно

```text
Страница: компактная карточка бенефициара
Клик: модальная сущность с полным набором повторяющихся полей
```

#### Неправильно

```text
Все повторяющиеся поля каждой сущности постоянно раскрыты на основной странице, хотя они образуют самостоятельный подсценарий.
```

#### Почему

Карточка сокращает длину страницы и сохраняет обзор набора однотипных сущностей.

### Rule 19: Сохраняй обязательную anatomy карточки

- ruleId: rule:components.content-card-wrapper.required-anatomy
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В корневом `ContentCardWrapper` запрещено скрывать `BackgroundPlate` и последний видимый `MiddleContentSlot`. Должен оставаться минимум один `MiddleContentSlot`; остальные slots и элементы можно скрывать независимо.

#### Правильно

```text
BackgroundPlate: visible
MiddleContentSlot count: 1
LeftSlot, Status, RightSlot: optional
```

#### Неправильно

```text
BackgroundPlate: hidden
MiddleContentSlot count: 0
```

#### Почему

Подложка и центральный контент образуют минимальную смысловую и визуальную структуру карточки.

### Rule 20: Не превышай Capacity MiddleContentSlot

- ruleId: rule:components.content-card-wrapper.middle-content-capacity-and-connection
- componentRuleId: component:web-corp.content-card-wrapper.middle-content-capacity-and-connection
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`Capacity=1–4` задаёт точное количество `ContentPresets`. `Connected=True` визуально связывает элементы точками, `Connected=False` убирает эту связь. Добавлять пятый элемент через swap или ручную композицию запрещено.

#### Правильно

```text
MiddleContentSlot Capacity=4 Connected=True
ContentPresets count: 4
```

#### Неправильно

```text
MiddleContentSlot Capacity=4
ContentPresets count: 5
```

#### Почему

Capacity и Connected являются частью компонентной композиции, а не рекомендацией по ручной раскладке.

### Rule 21: Используй ContentPresets по роли текста

- ruleId: rule:components.content-card-wrapper.content-presets-semantics
- severity: info
- appliesTo: text
- checkType: llm
- autofix: no

`ExtraTitle` — крупный жирный заголовок, обычно главный заголовок карточки. `Title` — небольшой заголовок, `SubTitle` — подпись к заголовку или параметры объекта. `SwapMe` — служебная заглушка и не должен оставаться в готовом макете.

### Rule 22: Используй Error только для ошибки обязательного набора

- ruleId: rule:components.content-card-wrapper.error-required-card-validation
- componentRuleId: component:web-corp.content-card-wrapper.error-required-card-validation
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
- severity: error
- appliesTo: flow
- checkType: llm
- autofix: no

`State=Error` используется, когда бизнес-правило требует хотя бы одну карточку, но пользователь не добавил ни одной. Он появляется после действия, запускающего валидацию: обычно ключевого действия страницы, но продукт может задать другой триггер. Для Error используется отдельная композиция с текстом «Нет добавленных [сущностей]» и кнопкой «Добавить [сущность]». Если добавление запрещено, Error использовать нельзя.

#### Правильно

```text
Минимум одна карточка обязательна
Текущее количество: 0
State=Error
Text=Нет добавленных компаний
Button=Добавить компанию
```

#### Неправильно

```text
Карточки уже добавлены или не обязательны
State=Error используется для красной обводки
```

### Rule 23: Не отклоняйся от component baseline

- ruleId: rule:components.content-card-wrapper.layer-properties-use-effective-baseline
- componentRuleId: component:web-corp.content-card-wrapper.layer-properties-use-effective-baseline
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Edge padding, цвета, типографика, заливки, обводки, радиусы и opacity принадлежат компоненту. Сравнивайте их с effective baseline текущего variant и вложенного owner context; ручное отклонение является ошибкой. Исключение — inter-item gaps: их можно менять вертикально и горизонтально, но только spacing-токенами.

#### Неправильно

```text
BackgroundPlate fill заменён на ручной hex.
Отступ ContentCardWrapper изменён с baseline 24 px на 20 px.
```

### Rule 24: Ограничивай содержимое StatusSlot

- ruleId: rule:components.content-card-wrapper.status-slot-content
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`StatusSlot` можно скрыть. Если он показан, внутри находится ровно один preset. `StatusPreset` показывает статус карточки. `PropertyPreset` акцентирует один параметр или свойство, например «Лучший». Значения могут различаться у разных карточек. Произвольный component swap запрещён.

### Rule 25: Настраивай интервалы только токенами

- ruleId: rule:components.content-card-wrapper.inter-item-gap-tokenized
- componentRuleId: component:web-corp.content-card-wrapper.inter-item-gap-tokenized
- ruleKind: design-rule
- authorityStatus: active
- authorityProvenance: design-system-author
- authorityRevision: 1
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для вертикального и горизонтального интервала между внутренними элементами можно независимо выбрать любой spacing-токен дизайн-системы. Ручные `px`-значения запрещены. Это исключение не распространяется на edge padding карточки.

### Rule 26: Сохраняй смысловое D/M-соответствие

- ruleId: rule:components.content-card-wrapper.desktop-mobile-content-parity
- severity: error
- appliesTo: responsive pair
- checkType: llm
- autofix: no

Для одной сущности между Desktop и MobileWeb должны совпадать `State`, текст `Empty`/`Error`, тип preset и текст `StatusSlot`. Раскладка и spacing-токены могут различаться. Значения status/property могут различаться между разными карточками, но не между D/M одной карточки.

## Section 7: Шаблоны

### Активная карточка

```text
ContentCardWrapper
State=Active
Skeleton=False

LeftSlot: optional Radio | Checkbox | Switch
MiddleSlot: title + identifiers + optional status
RightSlot: optional delete | more
StatusSlot: optional StatusPreset | PropertyPreset
Padding: 24 px on Desktop, 16 px on MobileWeb
BackgroundPlate: Level 2 on Desktop, Level 1 on MobileWeb
```

### Placeholder

```text
ContentCardWrapper
State=Empty
Skeleton=False

Text template: Нет добавленных [сущностей]
Если добавление разрешено: отдельная кнопка «Добавить [сущность]» под карточкой
Если добавление запрещено: кнопки нет, placeholder неинтерактивен
```

### Loading

```text
ContentCardWrapper
State=Active | Disabled | Empty | Error
Skeleton=True
Interaction: blocked
```

### Desktop layout

```text
LeftSlot | MiddleSlot horizontal segments | RightSlot
```

### MobileWeb layout

```text
LeftSlot
MiddleSlot vertical content
RightSlot optional, maximum 2 IconButton
BottomSheet optional by product flow
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
Без LeftSlot: клик по карточке открывает просмотр или редактирование
RightSlot: more
Dropdown: Редактировать, Дублировать, Удалить
Клик RightSlot не запускает клик карточки
```

### Пример 4: пустое состояние

```text
Нет добавленных бенефициаров
Кнопка под карточкой: Добавить бенефициара
Клик по карточке: ничего
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
- Проверять, что `Skeleton=True` блокирует взаимодействие и не отклонять его сочетания с `Active`, `Disabled`, `Empty` или `Error`.
- Проверять допустимые значения `State`: `Active`, `Disabled`, `Empty`, `Error`.
- Проверять допустимые пользовательские значения `LeftSlot Presets`: `Checkbox`, `Radio`, `Switch`; `SwapMe` считать незаменённой служебной заглушкой.
- Проверять, что `RightSlot` содержит не больше двух `IconButton`, не использует произвольный component swap и не оставлен в `SwapMe`.
- Проверять, что видимый `StatusSlot` содержит ровно один `StatusPreset` или `PropertyPreset`.
- Проверять допустимые значения `MiddleContentSlot Capacity`: `1`, `2`, `3`, `4`.
- Проверять, что число `ContentPresets` совпадает с `Capacity`, не превышает четыре, а `Connected` отражает наличие визуальной связи точками.
- Проверять, что `BackgroundPlate` и минимум один `MiddleContentSlot` остаются видимыми.
- Проверять текстовый стиль заголовка по платформе: Desktop `Headline-System / 18-22 xSmall`, MobileWeb `Action / 16-24 Medium`.
- Проверять, что edge padding у `[D] ContentCardWrapper` равен `24 px`, а у `[M] ContentCardWrapper` равен `16 px`.
- Проверять, что вложенный `BackgroundPlate` использует `Level 2 (inner)` в Desktop и `Level 1 (outer)` в MobileWeb.
- Проверять, что `styles.text` текстовых элементов не отличается от component baseline.
- Проверять, что horizontal/vertical inter-item gap независимо связан с любым spacing-токеном дизайн-системы; edge padding остаётся фиксированным.
- Проверять, что `State=Empty` не кликабелен, а добавление запускается только отдельной кнопкой под карточкой.
- Проверять конструкцию текста Empty/Error: `Нет добавленных [сущностей]`.
- Проверять конструкцию label кнопки: `Добавить [сущность]`.
- Проверять, что Error появляется только после validation-trigger и не используется при запрещённом добавлении.

### Словарные проверки

- Находить карточки с одним только названием без идентификаторов.
- Находить ручные подписи `Добавить [название]`, если они не связаны с `State=Empty`.
- Находить больше двух action icon в RightSlot на любой платформе.
- Находить `Disabled` рядом с действиями `Добавить`, `Редактировать`, `Удалить`, если это не текст описания.
- Находить `Disabled` рядом с признаками выбора: `выбрать`, `selected`, `single choice`, `radio`, `единичный выбор`.
- Находить ручные `px`-значения рядом с padding карточки.
- Находить ручные упоминания `Level 1` или `Level 2` рядом с `ContentCardWrapper`, если они не совпадают с платформой.

### LLM-проверки

- Проверять, что карточка используется в форме или на странице просмотра, а не как универсальная навигационная плитка.
- Проверять, что карточки одной группы относятся к одному типу сущности и используют одинаковый набор параметров.
- Проверять, что набор ContentCardWrapper расположен внутри связанного BackgroundPlate.
- Проверять применимость модального подсценария, когда повторяющиеся поля или элементы перегружают основную страницу.
- Проверять, что содержимое карточки дифференцирует сущности.
- Проверять приоритет кликов: при наличии LeftSlot карточка переключает контрол; без LeftSlot открывает просмотр или редактирование; RightSlot выполняет только собственное действие.
- Проверять, что `State=Error` используется только при обязательности хотя бы одной карточки и нулевом количестве карточек.
- Проверять, что при количестве действий больше двух используется многоточие и dropdown.
- Не считать RightSlot нарушением на MobileWeb или adaptive; BottomSheet проверять только при наличии отдельного продуктового правила.
- Проверять основную раскладку Desktop/MobileWeb с учётом допустимых контекстных исключений.
- Проверять D/M parity одной сущности по State, Empty/Error text и StatusSlot type/text.
- Проверять, что `State=Disabled` не используется как альтернативный визуальный стиль карточки или стиль единичного выбора.
- Проверять, что изменения edge padding, background level, typography и цветов не трактуются как допустимая дизайнерская настройка; inter-item gap разрешать только со spacing-токеном.

### Не проверяется автоматически

- Бизнес-достаточность конкретного набора идентификаторов без знания сценария.
- Нужен ли `Switch` вместо `Checkbox` или `Radio` в конкретной форме.
- Содержимое модалки добавления и редактирования.
- Факт показа `Notification` после создания карточки без анализа flow.
- Click propagation между RightSlot и карточкой без prototype или flow evidence.
- Исключения, где MobileWeb специально выравнивает значения по разным сторонам карточки.
- Продуктовая причина выбора конкретного набора текстовых строк, если компонентные стили не изменены.

### Автоисправления

- Включить `Skeleton=True` вместо ручного loading, если состояние распознано однозначно; не менять выбранный `State` только ради Skeleton.
- Заменить недопустимое значение `State` или `Presets` на ближайший допустимый вариант только при однозначном контексте.
- Подставить платформенный текстовый стиль заголовка, если слой заголовка распознан точно.
- Вернуть edge padding к `24 px` для Desktop и `16 px` для MobileWeb.
- Вернуть `BackgroundPlate` к `Level 2 (inner)` для Desktop и `Level 1 (outer)` для MobileWeb.
- Вернуть текстовые стили к component baseline, если изменённый текстовый слой распознан однозначно.
