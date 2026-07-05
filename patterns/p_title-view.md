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
- status: draft
- updatedAt: 2026-07-05
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
5. `Status`, `TitleStatus`, `TitleAddon` и `RightAddon` используются через компонентные слоты.
6. В `xLarge` действия располагаются под заголовком в `Button group`.
7. В группе действий должно быть только одно целевое действие.
8. Лишние действия уходят в `PickerButton`.
9. `RightAddon` используется для дополнительного действия или ссылки, а не для primary-действия.
10. Загрузочное состояние собирается через вариант `Skeleton=True`.

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

Для `xLarge` доступны расширенные слоты: `Status`, `FilterCompanySelect`, `Subtitle`, `TitleStatus`, `Button group`, `TitleAddonXL`, `RightAddonXL`.

Для `Large`, `Medium` и `Small` структура компактнее: `Title`, `Subtitle`, `TitleAddon`, `RightAddon`. Эти уровни используются для разделов и подзаголовков внутри страницы.

`TitleAddon` чаще используется для `StatusBadge`. `RightAddon` чаще используется для кнопки или ссылки с дополнительной информацией, например `О продукте`.

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

Статусы и комментарии к заголовку должны размещаться в предназначенных слотах: `Status`, `TitleStatus`, `TitleAddon` или `TitleAddonXL`.

#### Правильно

```text
TitleAddonXL Type=StatusBadge
TitleStatus Type=Approved
```

#### Неправильно

```text
Статус набран отдельным текстом рядом с Title
StatusBadge вставлен вне слота TitleAddon
```

#### Почему

Компонентные слоты сохраняют выравнивание, адаптивность и визуальную связь статуса с заголовком.

### Rule 6: Используй контрастный Status

- ruleId: rule:components.title-view.status-contrast
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Для верхнего `Status` рекомендуется использовать контрастные статусы, а не варианты с прозрачным фоном.

#### Правильно

```text
Status -> контрастный фон
```

#### Неправильно

```text
Status -> прозрачный фон в главном заголовке
```

#### Почему

В главном заголовке статус должен быстро считываться и не теряться на фоне страницы.

### Rule 7: Размещай целевые действия под xLarge

- ruleId: rule:components.title-view.actions-under-xlarge
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Основные кнопки действия в `xLarge` располагаются под заголовком в `Button group`. Не размещайте primary-действие в `RightAddon`.

#### Правильно

```text
TitleView View=xLarge
Button group: Primary 56 + Secondary 56
RightAddon: Link "О продукте"
```

#### Неправильно

```text
RightAddon: Primary Button "Создать письмо"
Button group отсутствует
```

#### Почему

Целевое действие должно находиться в ожидаемой зоне под главным заголовком, а `RightAddon` служит для дополнительного контента.

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

Загрузочное состояние `TitleView` собирается через вариант `Skeleton=True`, а не через вручную нарисованные прямоугольники.

#### Правильно

```text
TitleView View=xLarge, Skeleton=True
```

#### Неправильно

```text
TitleView скрыт, вместо него вручную добавлены серые плейсхолдеры
```

#### Почему

Встроенный skeleton сохраняет размер, структуру и адаптивность компонента.

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

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять, что компонент относится к `[D] TitleView` или `[M] TitleView`.
- Проверять, что значение `View` равно `xLarge`, `Large`, `Medium` или `Small`.
- Проверять, что на одном экране не больше одного `View=xLarge`.
- Проверять, что `RightAddon` использует допустимые варианты `Type=Link`, `Type=IconButton` или `Type=Icon 24`.
- Проверять, что `TitleAddon` использует допустимые варианты `Type=StatusBadge` или `Type=Icon 24`.
- Проверять, что `TitleAddonXL` использует допустимые варианты `Type=StatusBadge`, `Type=Icon 24`, `Type=Button` или `Type=Neurohelper`.
- Проверять, что загрузочное состояние использует `Skeleton=True`.
- Проверять, что в `Button group` не больше четырёх видимых действий.

### Словарные проверки

- Находить ручные текстовые статусы рядом с `Title`: `на проверке`, `одобрен`, `ошибка`, `требует действия`, если они не собраны через компонентный статус.
- Находить повторяющиеся подзаголовки, которые буквально дублируют `Title`.

### LLM-проверки

- Проверять, что `xLarge` используется как главный заголовок продуктовой страницы.
- Проверять, что `Large`, `Medium` и `Small` отражают смысловую вложенность.
- Проверять, что статусы размещены в `Status`, `TitleStatus`, `TitleAddon` или `TitleAddonXL`.
- Проверять, что `RightAddon` используется для дополнительного действия или ссылки, а не для primary-действия.
- Проверять, что в `Button group` не больше одной primary-кнопки.
- Проверять, что `Subtitle` дополняет смысл, а не дублирует `Title`.

### Не проверяется автоматически

- Смысловая уместность конкретного заголовка для бизнес-сценария.
- Корректность текста `Subtitle` без знания страницы.
- Визуальная уместность статуса или `StatusBadge` без продуктового контекста.
- Правильность приоритета действий, если он зависит от сценария.

### Автоисправления

- Заменить ручной skeleton на `Skeleton=True`, если компонент и состояние однозначно распознаны.
- Перенести лишние действия после четвёртого в `PickerButton`, если порядок действий задан явно.
- Переключить недопустимый `TitleAddon` на ближайший допустимый тип, если содержимое совпадает с вариантом каталога.
