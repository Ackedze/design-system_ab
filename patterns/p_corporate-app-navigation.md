# Pattern: Header, SideMenu и HeaderMenu

- documentType: pattern
- patternType: component
- component: Header, SideMenu, HeaderMenu
- patternId: ptrn:components.corporate-app-navigation
- patternKey: components.corporate-app-navigation
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Dashboard & Navigation / Design System
- status: active
- updatedAt: 2026-07-04
- sourceType: component-guideline
- tags: header, side-menu, header-menu, navigation, corporate-app-header-new, desktop, adaptive, page, product-cells
- figmaLink: https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=68924-8054
- relatedPatterns:
  - ptrn:layout.adaptive-alfa-business
- sections: 10

## Section 1: Определение

Паттерн описывает навигационные компоненты `[D] Header`, `[D] SideMenu` и `[D](768) HeaderMenu` для Альфа-Бизнеса.

Компоненты относятся к `CorporateAppHeaderNew` и используются для верхнего и бокового меню на desktop, планшетных и адаптивных ширинах. В Storybook компонент связан с `Arui-Private :: CorporateAppHeaderNew`.

Поддержкой и развитием компонента занимается команда «Дашборд и Навигация».

## Section 2: Когда использовать

Используйте паттерн, когда нужно:

- собрать верхнюю навигацию страницы на desktop;
- подключить боковое меню на desktop;
- показать адаптивное меню на ширинах `768-1023 px`;
- показать открытое адаптивное меню через `HeaderMenu/Opened`;
- настроить режим `Back`, `Holding` или `Person` в шапке;
- добавить продукт в боковое меню через `ProductCells`;
- переключить пресет меню между ММБ и КИБ;
- показать режим настройки меню, где пользователь может скрывать и менять порядок пунктов.

## Section 3: Когда не использовать

Не используйте эти компоненты:

- отдельно от компонента `Page`;
- в старых сборках страниц, куда не заложен `CorporateAppHeaderNew`;
- для мобильной навигации, если по адаптивному правилу нужен `CorporateAppHeaderMobile` с `Navigation Bar`;
- как произвольный список ссылок внутри контента;
- если нужно собрать локальную навигацию внутри раздела, а не глобальную навигацию продукта.

## Section 4: Принципы

1. На `1024 px` и шире используется desktop-шапка `Header`.
2. На `768-1023 px` функционал бокового меню переносится в верхнее меню `HeaderMenu`.
3. В адаптивной версии меню переходит в `CorporateAppHeaderMobile` с `Navigation Bar`.
4. Открытое меню в адаптиве показывается отдельным компонентом `HeaderMenu/Opened`.
5. `SideMenu` используется только в составе `Page`.
6. Боковое меню состоит из предсказуемых блоков: логотип, статичные пункты, подключенные продукты, промо-продукты и настройка меню.
7. Настройки продукта меняются только в разрешённых местах: label и логотип.
8. Пользовательская настройка меню сохраняется на уровне пользователя и едина для всех компаний и групп.

## Section 5: Структура текста

Пункты меню должны быть короткими и называться как разделы или действия: `Все сервисы`, `Новый платёж`, `Лента операций`, `Платежи в работе`, `Импорт реестров`, `Выписка`, `Счета`, `Контрагенты`, `Справки`, `Счета на оплату`, `Карты`, `Настроить меню`.

Для ячейки продукта используйте понятное название продукта в поле `Label`. Логотип продукта ставится в `IconView` через замену `Content` на логотип из набора `logo-corp`.

Текст режима настройки должен объяснять действие: пользователь может скрывать и менять очерёдность подключённых пунктов меню.

## Section 6: Правила

### Rule 1: Используйте Header на экранах 1024 px и шире

- ruleId: rule:components.corporate-app-navigation.header-desktop
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На экранах `1024 px` и шире используйте desktop-компонент `Header` как шапку страницы.

#### Правильно

```text
1024 px и шире -> Header
```

#### Неправильно

```text
Desktop 1440 px -> HeaderMenu вместо Header
```

#### Почему

На desktop ширине верхняя навигация должна использовать полноценную desktop-шапку.

### Rule 2: Используйте HeaderMenu на ширинах 768-1023 px

- ruleId: rule:components.corporate-app-navigation.header-menu-adaptive
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На экранах `768-1023 px` функционал бокового меню переносится в верхнее меню `HeaderMenu`.

#### Правильно

```text
768-1023 px -> HeaderMenu
```

#### Неправильно

```text
768 px -> desktop SideMenu остаётся сбоку
```

#### Почему

На планшетной ширине боковая колонка забирает слишком много пространства, поэтому навигация переезжает наверх.

### Rule 3: Используйте CorporateAppHeaderMobile для мобильного адаптива

- ruleId: rule:components.corporate-app-navigation.mobile-header
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

В мобильной адаптивной версии меню превращается в `CorporateAppHeaderMobile` с `Navigation Bar`.

#### Правильно

```text
Mobile adaptive -> CorporateAppHeaderMobile + Navigation Bar
```

#### Неправильно

```text
Mobile adaptive -> desktop Header и SideMenu
```

#### Почему

Мобильная навигация требует другой структуры и поведения, чем desktop-меню.

### Rule 4: Показывайте открытое адаптивное меню через HeaderMenu/Opened

- ruleId: rule:components.corporate-app-navigation.header-menu-opened
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для отображения открытого меню в Figma используйте отдельный компонент `HeaderMenu/Opened`. Настройки адаптивного компонента в Figma соответствуют desktop-компоненту.

#### Правильно

```text
Открытое меню 768 -> HeaderMenu/Opened
```

#### Неправильно

```text
Открытое меню собрано вручную из отдельных пунктов.
```

#### Почему

Отдельный компонент сохраняет поведение и настройки открытого состояния.

### Rule 5: Настраивайте Header через Back, Holding и Person

- ruleId: rule:components.corporate-app-navigation.header-settings
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: no

В `Header` настройка `Back` включает кнопку «Назад», `Holding` меняет отображение аккаунта для режима «Холдинг», `Person` меняет отображение персоны.

#### Правильно

```text
Back: true -> показана кнопка «Назад»
Holding: true -> показан режим холдинга
Person: custom -> изменена персона
```

#### Неправильно

```text
Кнопка «Назад» добавлена вручную поверх Header.
```

#### Почему

Состояния шапки должны управляться настройками компонента, а не ручной сборкой.

### Rule 6: Используйте SideMenu только в составе Page

- ruleId: rule:components.corporate-app-navigation.side-menu-in-page
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`SideMenu` используйте только в составе компонента `Page`. Не вставляйте новое меню в старые сборки страницы.

#### Правильно

```text
Page + CorporateAppHeaderNew + SideMenu
```

#### Неправильно

```text
SideMenu вставлен вручную в старую сборку страницы.
```

#### Почему

Меню зависит от структуры страницы и должно работать как часть общей page-сборки.

### Rule 7: Соблюдайте архитектуру SideMenu

- ruleId: rule:components.corporate-app-navigation.side-menu-architecture
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`SideMenu` состоит из основных блоков: `LogoCell`, статичные пункты, `ProductCells` для подключённых продуктов, заготовка для продукта, `ProductCells` для промо-продуктов и переход в режим настройки меню.

#### Правильно

```text
LogoCell
Статичные пункты
ProductCells подключённых продуктов
Промо-продукты
Настроить меню
```

#### Неправильно

```text
Все пункты меню перемешаны без разделения на блоки.
```

#### Почему

Архитектура меню помогает пользователю отличать глобальные разделы, подключённые продукты и настройки.

### Rule 8: Настраивайте ячейку продукта только через Label и логотип

- ruleId: rule:components.corporate-app-navigation.product-cell-settings
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Для ячейки `Ваш продукт` настройте поле `Label` и замените `IconView Content` на логотип продукта из `Logotypes` набора `logo-corp`. Остальные настройки `IconView` не меняйте.

#### Правильно

```text
Label: Депозиты
IconView Content: логотип продукта из logo-corp
Остальные настройки IconView не изменены
```

#### Неправильно

```text
Изменены размер, начертание и внутренние настройки IconView.
```

#### Почему

Менять нужно только содержимое продукта, а не системные настройки ячейки.

### Rule 9: Используйте состояние selected для выбранного пункта меню

- ruleId: rule:components.corporate-app-navigation.selected-item
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

Выбранный пункт меню должен отображаться через состояние выбранного пункта. Hover-состояние используется только для наведения.

#### Правильно

```text
Текущий раздел -> selected
Наведение -> hover
```

#### Неправильно

```text
Текущий раздел показан только hover-состоянием.
```

#### Почему

Пользователь должен понимать, где находится сейчас, даже без наведения.

### Rule 10: Не используйте addon без необходимости

- ruleId: rule:components.corporate-app-navigation.addon-rare
- severity: recommendation
- appliesTo: component
- checkType: llm
- autofix: no

Addon в пункте меню, скорее всего, не нужен. Используйте его только если есть обоснованный сценарий.

#### Правильно

```text
Пункт меню без addon.
```

#### Неправильно

```text
Addon добавлен во все пункты меню для визуального украшения.
```

#### Почему

Лишний addon перегружает навигацию и отвлекает от названия раздела.

### Rule 11: Переключайте пресеты ММБ и КИБ в ProductFooter

- ruleId: rule:components.corporate-app-navigation.product-footer-preset
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: no

Переключение между пресетами ММБ и КИБ выполняется в `ProductFooter`.

#### Правильно

```text
ProductFooter preset: ММБ
ProductFooter preset: КИБ
```

#### Неправильно

```text
Пункты ММБ и КИБ собраны вручную без пресета ProductFooter.
```

#### Почему

Пресет управляет составом и отображением меню для нужного сегмента.

### Rule 12: Сохраняйте настройку меню на уровне пользователя

- ruleId: rule:components.corporate-app-navigation.menu-settings-user-level
- severity: error
- appliesTo: flow
- checkType: llm
- autofix: no

В режиме редактирования пользователь может скрывать и менять очерёдность подключённых пунктов меню. Настройка сохраняется на уровне пользователя и едина для всех компаний и групп.

#### Правильно

```text
Пользователь изменил порядок пунктов.
Настройка применена ко всем компаниям и группам пользователя.
```

#### Неправильно

```text
Порядок меню сохранён только для одной компании.
```

#### Почему

Меню является пользовательской настройкой, а не настройкой отдельной компании.

### Rule 13: Оставляйте боковое меню фиксированной высоты в макетах

- ruleId: rule:components.corporate-app-navigation.fixed-height-in-mockups
- severity: warning
- appliesTo: screen
- checkType: manual
- autofix: no

В макетах оставляйте боковое меню фиксированной высоты. Оно помогает определить размер зоны первого экрана в сценариях, где контент страницы уходит в вертикальный скролл.

#### Правильно

```text
SideMenu фиксированной высоты в макете со скроллящимся контентом.
```

#### Неправильно

```text
SideMenu растянут на всю высоту длинного контента страницы.
```

#### Почему

Фиксированная высота меню помогает оценивать первый экран и поведение страницы со скроллом.

## Section 7: Шаблоны

### Desktop Header

```text
Width: 1024 px+
Component: Header
Settings: Back, Holding, Person
```

### Adaptive HeaderMenu

```text
Width: 768-1023 px
Component: HeaderMenu
Opened state: HeaderMenu/Opened
```

### Mobile Adaptive Header

```text
Component: CorporateAppHeaderMobile
Navigation: Navigation Bar
```

### SideMenu Architecture

```text
LogoCell -> переход на главную
Статичные пункты
ProductCells -> подключённые продукты
Заготовка «Ваш продукт»
ProductCells -> промо-продукты
Настроить меню -> режим редактирования
```

### Product Cell

```text
Label: название продукта
IconView Content: логотип из logo-corp
IconView settings: не менять
```

## Section 8: Примеры

### Пример 1: Header на desktop

```text
Экран 1440 px
Используется Header
Back: false
Holding: false
Person: default
```

Шапка соответствует desktop-ширине и не заменяется адаптивным меню.

### Пример 2: Режим «Назад»

```text
Back: true
В Header показана кнопка «Назад»
```

Кнопка включается настройкой компонента.

### Пример 3: Адаптивное меню

```text
Экран 768 px
Используется HeaderMenu
Открытое состояние: HeaderMenu/Opened
```

Функционал бокового меню перенесён в верхнее меню.

### Пример 4: Ячейка продукта

```text
Label: Депозиты
IconView Content: логотип Депозитов из logo-corp
```

Меняется только название и логотип продукта.

### Пример 5: Настройка меню

```text
Пользователь скрыл пункт «Карты».
Пользователь переместил пункт «Депозиты».
Настройка применена для всех компаний пользователя.
```

Режим редактирования управляет пользовательским составом меню.

## Section 9: Антипримеры

### Антипример 1: HeaderMenu на desktop

```text
1440 px -> HeaderMenu
```

На `1024 px` и шире нужен `Header`.

### Антипример 2: SideMenu без Page

```text
SideMenu вставлен в старую страницу вручную.
```

Меню используется только в составе `Page`.

### Антипример 3: Ручная сборка открытого меню

```text
Открытое адаптивное меню собрано из отдельных пунктов.
```

Для открытого состояния используйте `HeaderMenu/Opened`.

### Антипример 4: Изменены настройки IconView

```text
В ProductCell изменили размер, начертание и базовые настройки IconView.
```

Для продукта меняются только `Label` и `IconView Content`.

### Антипример 5: Настройка меню сохранена на компанию

```text
Порядок пунктов изменился только для ООО «Город Нагатино».
```

Настройка меню сохраняется на уровне пользователя и едина для всех компаний и групп.

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять, что на ширине `1024 px` и выше используется `Header`.
- Проверять, что на ширине `768-1023 px` используется `HeaderMenu`.
- Проверять, что открытое адаптивное меню использует `HeaderMenu/Opened`.
- Проверять наличие настроек `Back`, `Holding`, `Person` в `Header`.
- Проверять, что `SideMenu` находится в составе `Page`.
- Проверять, что ячейка продукта меняет только `Label` и `IconView Content`.
- Проверять, что пресет ММБ или КИБ выбран через `ProductFooter`.
- Проверять фиксированную высоту `SideMenu` в макете.

### Словарные проверки

- Находить ручные подписи пунктов меню, которые не соответствуют стандартному списку.
- Находить слова `Назад`, `Холдинг`, `Персона` вне настроек компонента.
- Находить `Ваш продукт` без заполненного `Label`.
- Находить пункты меню с addon без описанного сценария.

### LLM-проверки

- Проверять, что выбранный навигационный компонент соответствует ширине экрана.
- Проверять, что SideMenu не вставлен в старую сборку страницы.
- Проверять, что архитектура SideMenu не нарушена ручной перестановкой блоков.
- Проверять, что настройка меню описана как пользовательская, а не привязанная к компании.
- Проверять, что промо-продукты визуально отделены от подключённых продуктов.

### Не проверяется автоматически

- Актуальность состава стандартных пунктов меню.
- Реальная поддержка сценария addon в конкретном пункте.
- Корректность логотипа продукта без доступа к библиотеке `logo-corp`.
- Фактическое сохранение пользовательской настройки в продуктовой логике.
- Ответственность команды поддержки и процесс согласования изменений.

### Автоисправления

- Заменить `HeaderMenu` на `Header` для desktop-макета `1024 px+`, если ширина известна.
- Заменить ручное открытое меню на `HeaderMenu/Opened`, если компонент доступен.
- Убрать addon из пункта меню, если сценарий не описан.
- Вернуть стандартные настройки `IconView`, если изменены не `Content`.
- Пометить настройку меню как пользовательскую, если она ошибочно описана на уровне компании.
