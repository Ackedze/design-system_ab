# Pattern: TitleView

- documentType: pattern
- patternType: component
- component: TitleView
- patternId: ptrn:components.title-view
- patternKey: components.title-view
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: ready
- updatedAt: 2026-07-11
- sourceType: component-guideline
- tags: titleview, page-header, heading, subtitle, status, actions, title-addon, right-addon, skeleton, web-corp
- figmaLink: none
- relatedPatterns:
  - ptrn:components.title-view-editable
  - ptrn:controls.buttons-and-button-groups
  - ptrn:layout.wide-grid
- sections: 10

## Section 1: Определение

`TitleView` — компонент заголовка страницы или смыслового блока в продуктовых интерфейсах Альфа-Бизнеса.

Компонент собирает основной заголовок, подзаголовок, статус, выбор компании, дополнительные слоты рядом с заголовком и группу действий. Паттерн фиксирует иерархию размеров `xLarge`, `Large`, `Medium`, `Small`, правила слотов `TitleAddon`, `RightAddon`, `TitleStatus` и ограничения для действий в заголовке.

## Section 2: Когда использовать

Используйте `TitleView`, когда нужно:

- оформить главный заголовок продуктовой страницы;
- показать заголовок раздела или смыслового блока;
- добавить описание страницы через `Subtitle`;
- показать статус или комментарий к заголовку;
- добавить выбор компании через `FilterCompanySelect`;
- разместить связанные действия под главным заголовком;
- показать загрузочное состояние заголовка через `Skeleton=True`.

Типовые компоненты каталога:

- `[D] TitleView`, `[M] TitleView`;
- `[D] TitleAddon`, `[M] TitleAddon`;
- `[D] TitleAddonXL`, `[M] TitleAddonXL`;
- `[D] RightAddon`, `[M] RightAddon`;
- `[D] RightAddonXL`, `[M] RightAddonXL`;
- `[D] TitleStatus`, `[M] TitleStatus`.

## Section 3: Когда не использовать

Не используйте `TitleView`, если:

- нужен обычный текстовый заголовок внутри карточки, формы или таблицы без компонентной структуры;
- на странице уже есть главный `xLarge`-заголовок и требуется второй заголовок того же уровня;
- действие можно разместить в контенте рядом с объектом действия, а не в заголовке;
- слот используется как произвольный контейнер для текста, статусов или декоративных элементов;
- нужно редактирование заголовка, но не применены правила редактируемого `TitleView`.

Для редактируемых названий используйте связанный паттерн `Редактируемый TitleView`.

## Section 4: Принципы

1. `xLarge` — единственный главный заголовок страницы.
2. `Large`, `Medium` и `Small` строят вложенную иерархию разделов ниже `xLarge`.
3. `Title` содержит основной текст и использует `Typography.TitleResponsive`.
4. `Subtitle` дополняет смысл страницы или блока, но не дублирует `Title`.
5. `Status` показывает состояние страницы с заголовком `xLarge`, а `TitleStatus` при необходимости добавляет информацию по этому состоянию.
6. В `xLarge` основные действия располагаются в `Button group`; для `Large`, `Medium` и `Small` primary-действия размещаются вне `TitleView`.
7. В группе действий должно быть только одно целевое действие.
8. Лишние действия уходят в `PickerButton`.
9. `RightAddon` используется для дополнительного действия или ссылки, а не для primary-действия.
10. Полное загрузочное состояние собирается через вариант `Skeleton=True`; отдельные вложенные элементы могут загружаться независимо.
11. Внешние отступы вокруг `TitleView` обязательны и определяются соседним блоком.

## Section 5: Структура текста

`TitleView` строится вокруг обязательного `Title` и опциональных частей.

```text
Status
Title + TitleAddon + RightAddon
FilterCompanySelect
Subtitle
TitleStatus
Button group
```

Порядок структурных слотов обязателен: `Status -> Heading -> Holding -> Subtitle -> TitleStatus -> Button group`. Скрытые или недоступные для текущего `View` слоты пропускаются, но оставшиеся слоты не переставляются.

Внутри предусмотренных слотов разрешён `instance swap` на произвольные компоненты. Сам swap не считается нарушением, если сохраняются порядок слотов и корневая структура `TitleView`; выбранный компонент далее проверяется по собственному контракту.

Для корня `TitleView` рекомендуется ширина `Fill container` и высота `Hug contents`. Рекомендация одинакова для desktop и mobile-web.

Для `xLarge` доступны расширенные слоты: `Status`, `FilterCompanySelect`, `Subtitle`, `TitleStatus`, `Button group`, `TitleAddonXL`, `RightAddonXL`.

Для `Large`, `Medium` и `Small` структура компактнее: `Title`, `Subtitle`, `TitleAddon`, `RightAddon`. Эти уровни используются для разделов и подзаголовков внутри страницы.

`Status` показывает состояние страницы, заголовком которой является `xLarge`. Верхний `Status` всегда использует `Size=24`: `Style=Contrast` на сером фоне и `Style=Muted` на белом. `Type` может принимать любое значение из API компонента.

`TitleStatus` — опциональный статусный блок, который может использоваться вместе с верхним `Status` или самостоятельно. Если видимы оба слота, значения `Type` должны совпадать: `Type` определяет статусный цвет.

`TitleAddon` — опциональный функциональный элемент рядом с заголовком: иконка, `IconButton`, точка вызова нейропомощника или иконка `Info`. Элемент может быть кликабельным, а `StatusBadge` может реагировать только на hover.

`RightAddon` используется для дополнительного действия или ссылки, например `О продукте`. Его состав и поведение определяются выбранным `Type`.

`Holding` содержит `FilterCompanySelect_Single` и обязателен, если пользователь работает от группы компаний, а страница доступна только в моно-режиме.

## Section 6: Правила

### Rule 1: Используй только один xLarge на странице

- ruleId: rule:components.title-view.single-xlarge
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

На одной странице может быть только один `TitleView` с `View=xLarge`. Он задаёт главный заголовок страницы.

#### Правильно

```text
Страница продукта -> один TitleView View=xLarge
Разделы ниже -> TitleView View=Large или Medium
```

#### Неправильно

```text
На одной странице размещены два TitleView View=xLarge
```

#### Почему

`xLarge` обозначает главный уровень страницы. Несколько главных заголовков ломают иерархию и мешают понять, что является основным экраном.

### Rule 2: Используй xLarge для главного заголовка продуктовой страницы

- ruleId: rule:components.title-view.xlarge-main-page-title
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

Главный заголовок продуктовой страницы собирается через `[D] TitleView` или `[M] TitleView` с `View=xLarge`.

#### Правильно

```text
TitleView View=xLarge
Title: Письма
Subtitle: Входящие, исходящие и шаблоны писем
```

#### Неправильно

```text
Главный заголовок страницы набран отдельным текстовым слоем
```

#### Почему

`xLarge` содержит нужные слоты, отступы, типографику и поведение для главного заголовка страницы.

### Rule 3: Соблюдай иерархию Large, Medium и Small

- ruleId: rule:components.title-view.heading-hierarchy
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

`Large`, `Medium` и `Small` используются как уровни вложенности ниже главного заголовка.

#### Правильно

```text
xLarge -> заголовок страницы
Large -> крупный раздел
Medium -> подраздел
Small -> компактный блок
```

#### Неправильно

```text
Small используется как главный заголовок страницы
Medium и Large меняются местами без смысловой вложенности
```

#### Почему

Размер `TitleView` должен отражать смысловую иерархию, а не только визуальное предпочтение.

### Rule 4: Не дублируй Title в Subtitle

- ruleId: rule:components.title-view.subtitle-supports-title
- severity: warning
- appliesTo: text
- checkType: llm
- autofix: partial

`Subtitle` используется для дополнительного описания контента на странице или в блоке. Он не должен повторять основной заголовок другими словами.

#### Правильно

```text
Title: Гарантийная линия N 04251979
Subtitle: Условия, заявки и отправка документов
```

#### Неправильно

```text
Title: Гарантийная линия
Subtitle: Заголовок гарантийной линии
```

#### Почему

Подзаголовок должен добавлять смысл, а не создавать шум под заголовком.

### Rule 5: Используй Status, TitleStatus и TitleAddon по назначению

- ruleId: rule:components.title-view.status-slots
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`Status` используется для состояния страницы с заголовком `xLarge`. `TitleStatus` является опциональным статусным блоком и может использоваться вместе со `Status` или самостоятельно. `TitleAddon` и `TitleAddonXL` используются для опционального функционального элемента рядом с заголовком.

#### Правильно

```text
Status Type=Approved
TitleStatus Type=Approved
TitleAddonXL Type=Neurohelper
```

#### Неправильно

```text
Статус страницы набран отдельным текстом рядом с Title
TitleStatus сообщает цветом другое состояние, чем Status
```

#### Почему

Компонентные слоты сохраняют выравнивание, адаптивность и смысловую связь статуса с заголовком. Все перечисленные слоты опциональны и используются по контексту.

### Rule 6: Согласуй цвет Status и TitleStatus

- ruleId: rule:components.title-view.status-color-consistency
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Если одновременно используются `Status` и `TitleStatus`, их значения `Type` должны совпадать. `Type` определяет статусный цвет.

#### Правильно

```text
Status Type=Processing
TitleStatus Type=Processing
```

#### Неправильно

```text
Status Type=Approved
TitleStatus Type=Error / Risk
```

#### Почему

Совпадающий `Type` связывает основной статус страницы с дополнительной информацией в `TitleStatus` и гарантирует согласованный цвет.

### Rule 7: Размещай основные действия в Button group

- ruleId: rule:components.title-view.primary-actions-use-button-group
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

В `View=xLarge` основные действия располагаются в `Button group`. Не размещайте primary-действие в `RightAddon`.

#### Правильно

```text
TitleView View=xLarge
Button group desktop: Primary 56 + Secondary 56
Button group mobile-web: Primary 48 + Secondary 48
RightAddon: Link "О продукте"
```

#### Неправильно

```text
RightAddon: Primary Button "Создать письмо"
Button group отсутствует
```

#### Почему

Целевое действие должно находиться в ожидаемой зоне `Button group`, а `RightAddon` служит для дополнительного контента.

### Rule 8: Ограничивай Button group четырьмя кнопками

- ruleId: rule:components.title-view.button-group-max-four
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: no

В `Button group` рекомендуется показывать до четырёх кнопок. Остальные действия переносите в `PickerButton`.

#### Правильно

```text
Primary | Secondary | Secondary | PickerButton
```

#### Неправильно

```text
Primary | Secondary | Secondary | Secondary | Secondary | Secondary
```

#### Почему

Группа из большого количества кнопок перегружает заголовок и снижает заметность главного действия.

### Rule 9: Не используй несколько primary-кнопок

- ruleId: rule:components.title-view.single-primary-action
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

В группе действий `TitleView` должно быть только одно целевое действие. Повторяющиеся действия не должны менять стиль между состояниями страницы.

#### Правильно

```text
Primary: Создать письмо
Secondary: Настройки
```

#### Неправильно

```text
Primary: Создать письмо
Primary: Настройки
```

#### Почему

Несколько primary-кнопок создают конкурирующие главные действия и сбивают приоритет сценария.

### Rule 10: Используй Skeleton-вариант компонента

- ruleId: rule:components.title-view.skeleton-variant
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Если загружается весь `TitleView`, используй вариант `Skeleton=True`. Если загружается только отдельный слот или вложенный элемент, он может находиться в собственном состоянии загрузки при `Skeleton=False` у родительского `TitleView`.

#### Правильно

```text
TitleView View=xLarge, Skeleton=True

TitleView View=xLarge, Skeleton=False
Status -> собственное состояние загрузки
```

#### Неправильно

```text
Весь TitleView заменён ручными плейсхолдерами при Skeleton=False
```

#### Почему

Встроенный skeleton сохраняет размер, структуру и адаптивность компонента при полной загрузке и не запрещает частичную загрузку вложенного контента.

### Rule 11: Соблюдай внешние отступы TitleView

- ruleId: rule:components.title-view.external-spacing
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Внешние отступы вокруг `TitleView` зависят от соседнего блока. Между `[D] Header` и `[D] TitleView` используется `40 px` через `TopMargin`. Между `[D] TitleView` и основным контентом используется `32 px`. Для `TopBar` используется `12 px`, потому что внутри `TopBar` уже заложен верхний отступ `24 px`.

#### Правильно

```text
Header -> TitleView: 40 px
TitleView -> Content: 32 px
TitleView -> TabsView: 32 px
TitleView -> FiltersBlock: 32 px
TitleView -> Plate: 32 px
TitleView -> TopBar: 12 px
```

#### Неправильно

```text
Header -> TitleView: 24 px
TitleView -> Content: 16 px
TitleView -> TopBar: 32 px
```

#### Почему

Эти отступы удерживают вертикальный ритм продуктовой страницы. `TopBar` получает меньший внешний отступ, потому что его собственная структура уже содержит верхний внутренний отступ.

### Rule 12: Используй слоты, доступные выбранному View

- ruleId: rule:components.title-view.slot-availability-by-view
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для `View=Large`, `Medium` и `Small` доступны только `Title`, `Subtitle`, `TitleAddon` и `RightAddon`. Расширенные слоты `Status`, `Holding`, `TitleStatus`, `Button group`, `TitleAddonXL` и `RightAddonXL` относятся к `View=xLarge`.

### Rule 13: Показывай выбор компании в Holding для mono-страниц группы компаний

- ruleId: rule:components.title-view.holding-for-group-company-mono-mode
- severity: error
- appliesTo: component
- checkType: llm
- autofix: partial

`Holding` с `FilterCompanySelect_Single` обязателен, если пользователь работает от группы компаний, а страница доступна только в моно-режиме. В остальных сценариях отсутствие `Holding` допустимо.

### Rule 14: Не меняй оформление внутренних слоёв вручную

- ruleId: rule:components.title-view.manual-layer-style-overrides-prohibited
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Layout, sizing, типографика, цвет, stroke, radius, opacity, effects и blend mode слоёв `Title`, `Subtitle`, `Status`, `TitleStatus` и вложенных `Button` определяются компонентами и не меняются вручную. Текстовое содержание разрешено менять через content overrides.

### Rule 15: Ограничивай Subtitle 120 символами

- ruleId: rule:components.title-view.subtitle-max-120-characters
- severity: warning
- appliesTo: text
- checkType: deterministic
- autofix: no

Рекомендуемая длина `Subtitle` — не больше 120 символов с пробелами. Более длинный текст следует сократить, но само превышение не является жёсткой ошибкой компонента.

### Rule 16: Определяй интерактивность TitleAddon по Type

- ruleId: rule:components.title-view.title-addon-interaction-follows-type
- severity: info
- appliesTo: component
- checkType: llm
- autofix: no

`TitleAddon` может быть кликабельным. Вариант `StatusBadge` может реагировать на hover без обязательного действия по клику. Не требуй одинакового поведения от всех вариантов.

### Rule 17: Определяй содержимое RightAddon через Type

- ruleId: rule:components.title-view.right-addon-content-follows-type
- severity: info
- appliesTo: component
- checkType: deterministic
- autofix: no

Состав и поведение `RightAddon` определяются выбранным `Type`. `RightAddon` не является произвольным контейнером для нескольких дополнительных элементов.

### Rule 18: Размещай primary-действия компактных View вне TitleView

- ruleId: rule:components.title-view.compact-primary-actions-outside-title-view
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

Для `View=Large`, `Medium` и `Small` primary-действие размещается вне `TitleView`. `RightAddon` не используется как обходной слот для primary-действия.

### Rule 19: Не оставляй Title пустым

- ruleId: rule:components.title-view.title-required-non-empty
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

`Title` обязателен во всех вариантах `TitleView`. Его нельзя оставлять пустым или скрывать.

### Rule 20: Меняй label Status через content override

- ruleId: rule:components.title-view.status-label-is-content-override
- severity: info
- appliesTo: text
- checkType: deterministic
- autofix: no

Label встроенного `Status` разрешено менять. Формулировка может уточнять состояние, пока `Type` остаётся корректным и определяет нужный цвет.

### Rule 21: Меняй контент TitleStatus без изменения оформления

- ruleId: rule:components.title-view.title-status-content-overrides-allowed
- severity: info
- appliesTo: text
- checkType: deterministic
- autofix: no

`Title` и `Subtitle` внутри `TitleStatus` разрешено менять через content overrides. Для `Subtitle` действует рекомендация не превышать 120 символов с пробелами.

### Rule 22: Настраивай Holding по контракту FilterCompanySelect_Single

- ruleId: rule:components.title-view.holding-delegates-to-filter-company-select-contract
- severity: info
- appliesTo: component
- checkType: deterministic
- autofix: no

Параметры `FilterCompanySelect_Single` внутри `Holding` определяются собственным API и компонентным контрактом селекта. `TitleView` не вводит дополнительных ограничений для его параметров.

### Rule 23: Используй Size=24 для верхнего Status

- ruleId: rule:components.title-view.status-size-24
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: yes

Верхний `Status` внутри `TitleView` всегда использует `Size=24`.

### Rule 24: Выбирай Style Status по фону

- ruleId: rule:components.title-view.status-style-matches-surface
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На сером фоне верхний `Status` использует `Style=Contrast`, на белом фоне — `Style=Muted`.

### Rule 25: Используй доступные Type Status без дополнительных ограничений

- ruleId: rule:components.title-view.status-type-follows-public-api
- severity: info
- appliesTo: component
- checkType: deterministic
- autofix: no

`Type` верхнего `Status` может принимать любое значение из public API `StatusPreset`. `TitleView` не вводит дополнительных ограничений.

### Rule 26: Разрешай TitleStatus без верхнего Status

- ruleId: rule:components.title-view.title-status-may-be-standalone
- severity: info
- appliesTo: component
- checkType: deterministic
- autofix: no

`TitleStatus` может использоваться самостоятельно. Отсутствие верхнего `Status` при видимом `TitleStatus` не является нарушением.

### Rule 27: Используй платформенный размер кнопок Button group

- ruleId: rule:components.title-view.button-group-button-size-by-platform
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: yes

Вложенные `Button` используют размер по платформенной версии: `Size=56` внутри `[D] TitleView` и `Size=48` внутри `[M] TitleView`.

### Rule 28: Настраивай Button по паттерну кнопок

- ruleId: rule:components.title-view.button-properties-delegate-to-button-pattern
- severity: info
- appliesTo: component
- checkType: deterministic
- autofix: no

Кроме обязательного платформенного размера (`56` для `[D] TitleView`, `48` для `[M] TitleView`), параметры `View`, label, addons, hint и singleIcon определяются public API `Button` и паттерном `Кнопки и группы кнопок`. `TitleView` не вводит дополнительных ограничений.

### Rule 29: Применяй editable-правила как часть TitleView

- ruleId: rule:components.title-view.editable-scenarios-belong-to-title-view-pattern
- severity: info
- appliesTo: component
- checkType: llm
- autofix: no

Editable-сценарии являются частью паттерна `TitleView`. Связанные правила `p_title-view-editable.md` применяются в этом же компонентном комплекте.

### Rule 30: Используй Fill по ширине и Hug по высоте

- ruleId: rule:components.title-view.root-fill-hug-sizing
- severity: warning
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Для корня `TitleView` рекомендуется `Fill container` по ширине и `Hug contents` по высоте. Между desktop и mobile-web различий в этой рекомендации нет.

### Rule 31: Сохраняй обязательный порядок слотов

- ruleId: rule:components.title-view.slot-order-required
- severity: error
- appliesTo: component.composition
- checkType: deterministic
- autofix: no

Слоты располагаются в порядке `Status -> Heading -> Holding -> Subtitle -> TitleStatus -> Button group`. Если часть слотов скрыта или недоступна для текущего `View`, порядок оставшихся слотов сохраняется.

### Rule 32: Разрешай instance swap внутри предусмотренных слотов

- ruleId: rule:components.title-view.slot-instance-swap-allowed
- severity: info
- appliesTo: component.composition
- checkType: llm
- autofix: no

В предусмотренный слот можно подставить произвольный компонент через `instance swap`. Сам swap не является нарушением. Проверяй выбранный компонент по его собственному контракту и отдельно проверяй сохранение порядка слотов и структуры `TitleView`.

### Rule 33: Не оформляй и не делай кликабельным корень TitleView

- ruleId: rule:components.title-view.root-style-and-clickability-prohibited
- severity: error
- appliesTo: component.root
- checkType: deterministic
- autofix: no

Корень `TitleView` нельзя вручную перекрашивать, обводить, скруглять, менять его opacity, effects или blend mode. Весь компонент не может быть единой кликабельной поверхностью: интерактивность размещается во вложенных `Button`, `TitleAddon`, `RightAddon` и других предназначенных элементах.

Ручные изменения layout, sizing и оформления запрещены также для всего внутреннего дерева `TitleView`. Разрешены text content overrides и `instance swap` внутри предусмотренных слотов.

## Section 7: Шаблоны

### Главный заголовок страницы

```text
[D] TitleView
View=xLarge
Skeleton=False
Title=<название страницы>
Subtitle=<дополнительное описание>
Button group=<до 4 действий>
```

### Заголовок раздела

```text
[D] TitleView
View=Large | Medium | Small
Title=<название раздела>
Subtitle=<описание раздела, если нужно>
TitleAddon=StatusBadge, если нужен статус
RightAddon=Link или IconButton, если нужно дополнительное действие
```

### Загрузочное состояние

```text
[D] TitleView
View=<xLarge | Large | Medium | Small>
Skeleton=True
```

### Внешние отступы

```text
[D] Header
TopMargin 40 px
[D] TitleView
Spacing 32 px
[D] Content | [D] TabsView | [D] FiltersBlock | [D] Plate
```

```text
[D] TitleView
Spacing 12 px
[D] TopBar
```

## Section 8: Примеры

### Пример 1: продуктовая страница

```text
TitleView View=xLarge
Title: Письма
Subtitle: Входящие, исходящие, черновики и шаблоны
Button group: Создать письмо | Настройки
```

### Пример 2: блок с дополнительным статусом

```text
TitleView View=Large
Title: Гарантийная линия N 04251979
TitleAddon: StatusBadge
RightAddon: Link "Подробнее"
```

### Пример 3: компактный подраздел

```text
TitleView View=Small
Title: Настройки отправки
Subtitle: Сроки и условия отправки платежа
```

### Пример 4: заголовок перед контентом

```text
[D] Header
40 px
[D] TitleView View=xLarge
32 px
[D] Content
```

## Section 9: Антипримеры

### Антипример 1: два главных заголовка

```text
TitleView View=xLarge
TitleView View=xLarge
```

### Антипример 2: primary-действие в RightAddon

```text
TitleView View=xLarge
RightAddon: Button Primary "Создать"
Button group отсутствует
```

### Антипример 3: ручной статус

```text
Title: Счёт
Text layer: "На проверке"
```

### Антипример 4: ручной skeleton

```text
Серые прямоугольники вместо TitleView Skeleton=True
```

### Антипример 5: произвольные внешние отступы

```text
[D] Header
24 px
[D] TitleView
16 px
[D] Content
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять, что компонент относится к `[D] TitleView` или `[M] TitleView`.
- Проверять, что значение `View` равно `xLarge`, `Large`, `Medium` или `Small`.
- Проверять, что на одном экране не больше одного `View=xLarge`.
- Проверять доступность слотов для выбранного `View`.
- Проверять, что `Title` видим и не пуст.
- Проверять, что `RightAddon` использует допустимые варианты `Type=Link`, `Type=IconButton` или `Type=Icon 24`.
- Проверять, что `TitleAddon` использует допустимые варианты `Type=StatusBadge` или `Type=Icon 24`.
- Проверять, что `TitleAddonXL` использует допустимые варианты `Type=StatusBadge`, `Type=Icon 24`, `Type=Button` или `Type=Neurohelper`.
- Проверять, что верхний `Status` использует `Size=24`.
- Проверять `Style=Contrast` для серого фона и `Style=Muted` для белого фона.
- Не вводить дополнительных ограничений для `Type` верхнего `Status`, если значение доступно в public API.
- Проверять, что загрузочное состояние использует `Skeleton=True`.
- Не требовать `Skeleton=True` у всего TitleView, если загружается только отдельный вложенный элемент.
- Проверять, что в `Button group` не больше четырёх видимых действий.
- Проверять платформенный размер `Button`: `Size=56` внутри `[D] TitleView` и `Size=48` внутри `[M] TitleView`.
- Проверять, что `Subtitle` содержит не больше 120 символов с пробелами; превышение показывать как рекомендацию.
- Проверять, что `Subtitle` внутри `TitleStatus` содержит не больше 120 символов с пробелами; превышение показывать как рекомендацию.
- Проверять отсутствие ручных layout, sizing и style-overrides у корня и всего внутреннего дерева `TitleView`.
- Проверять рекомендацию `Fill container` по ширине и `Hug contents` по высоте корня.
- Проверять обязательный порядок слотов `Status -> Heading -> Holding -> Subtitle -> TitleStatus -> Button group`.
- Не считать `instance swap` внутри предусмотренного слота нарушением сам по себе; выбранный компонент проверять по его собственному контракту.
- Проверять отсутствие ручного оформления и единой кликабельности корня `TitleView`.
- Проверять внешний отступ `40 px` между `[D] Header` и `[D] TitleView`.
- Проверять внешний отступ `32 px` между `[D] TitleView` и `[D] Content`, `[D] TabsView`, `[D] FiltersBlock` или `[D] Plate`.
- Проверять внешний отступ `12 px` между `[D] TitleView` и `[D] TopBar`.

### Словарные проверки

- Находить ручные текстовые статусы рядом с `Title`: `на проверке`, `одобрен`, `ошибка`, `требует действия`, если они не собраны через компонентный статус.
- Находить повторяющиеся подзаголовки, которые буквально дублируют `Title`.

### LLM-проверки

- Проверять, что `xLarge` используется как главный заголовок продуктовой страницы.
- Проверять, что `Large`, `Medium` и `Small` отражают смысловую вложенность.
- Проверять, что статусы размещены в `Status`, `TitleStatus`, `TitleAddon` или `TitleAddonXL`.
- Проверять совпадение `Type` у `Status` и `TitleStatus`, если видимы оба слота.
- Не требовать верхний `Status`, если `TitleStatus` используется самостоятельно.
- Проверять, что `RightAddon` используется для дополнительного действия или ссылки, а не для primary-действия.
- Проверять, что primary-действия при `View=Large`, `Medium` и `Small` размещены вне `TitleView`.
- Проверять, что интерактивность `TitleAddon` соответствует его `Type`; `StatusBadge` может реагировать только на hover.
- Проверять, что состав `RightAddon` определяется его `Type`, а не ручным добавлением нескольких элементов.
- Проверять наличие `Holding` с `FilterCompanySelect_Single`, если пользователь работает от группы компаний, а страница доступна только в моно-режиме.
- Не придумывать ограничения параметров `FilterCompanySelect_Single`; использовать его собственный компонентный контракт.
- Делегировать параметры `View`, label, addons, hint и singleIcon вложенных `Button` паттерну `Кнопки и группы кнопок`.
- Применять `p_title-view-editable.md` как часть паттерна `TitleView` при editable-сценариях.
- Проверять, что в `Button group` не больше одной primary-кнопки.
- Проверять, что `Subtitle` дополняет смысл, а не дублирует `Title`.
- Проверять, что соседний блок под `TitleView` распознан корректно перед применением правила внешнего отступа.

### Не проверяется автоматически

- Смысловая уместность конкретного заголовка для бизнес-сценария.
- Корректность текста `Subtitle` без знания страницы.
- Визуальная уместность статуса или `StatusBadge` без продуктового контекста.
- Правильность приоритета действий, если он зависит от сценария.

### Автоисправления

- Заменить ручной skeleton на `Skeleton=True`, если компонент и состояние однозначно распознаны.
- Перенести лишние действия после четвёртого в `PickerButton`, если порядок действий задан явно.
- Переключить недопустимый `TitleAddon` на ближайший допустимый тип, если содержимое совпадает с вариантом каталога.
- Выставить внешний отступ `40 px`, `32 px` или `12 px`, если соседний блок распознан однозначно.
