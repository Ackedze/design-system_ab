# Pattern: TabsView

- documentType: pattern
- patternType: component
- component: TabsView
- patternId: ptrn:components.tabs-view
- patternKey: components.tabs-view
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System
- status: ready
- updatedAt: 2026-07-15
- sourceType: component-guideline
- tags: tabs-view, tabs-primary, tabs-secondary, navigation, adaptive, mobile-web
- figmaLink: https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components
- sections: 10

## Section 1: Определение

`TabsView` — компонент Альфа-Бизнеса для переключения контекста внутри блока страницы. Он объединяет табы первого уровня `TabsPrimary` и опциональные табы второго уровня `TabsSecondary`, применяет темизацию Альфа-Бизнеса и задаёт собственный effective baseline вложенных компонентов.

Источник правил: компонентный паттерн `Web __ Corp Components (15-Jul-2026-11.30am).pdf`.

В макетах Альфа-Бизнеса используется `TabsView`, а не отдельно размещённый `TabsPrimary` из Core.

## Section 2: Когда использовать

Используйте `TabsView`, когда нужно:

- переключать контекст блока на странице через табы первого уровня;
- переключать вложенный контекст внутри выбранного таба первого уровня;
- показать один или два уровня навигации;
- разместить табы на небольшом desktop-разрешении с навигацией стрелками;
- адаптировать табы для Mobile Web со свайпом по горизонтали;
- показать состояние загрузки через штатный `Skeleton`.

## Section 3: Когда не использовать

Не используйте:

- `TabsPrimary` из Core как самостоятельную замену `TabsView` в Альфа-Бизнесе;
- `TabsSecondary` на странице без `TabsPrimary`;
- `[M] TabsView` в отдельной мобильной версии, не относящейся к адаптивной версии Альфа-Бизнеса;
- ручные изменения spacing, divider, typography, fill и других wrapper-owned свойств вместо effective baseline `TabsView`.

## Section 4: Принципы

1. `TabsPrimary` задаёт первый уровень и переключает контекст блока страницы.
2. `TabsSecondary` задаёт второй уровень внутри контекста выбранного `TabsPrimary`.
3. Второй уровень не существует без первого.
4. На странице desktop `TabsSecondary` используется в размере `40`.
5. На небольшом desktop-разрешении используется `[D] TabsView`, а неуместившиеся табы прокручиваются кнопками Slider.
6. В адаптивной мобильной версии используется `[M] TabsView`, а неуместившиеся табы прокручиваются свайпом.
7. Вложенные Core-компоненты сравниваются с effective baseline `TabsView`, а не со standalone baseline.
8. В каждом видимом уровне должно быть минимум два таба; максимальное количество пока не регламентировано.
9. Одновременно активен только один таб каждого видимого уровня.
10. Отдельные табы можно отключать и перезагружать; `Skeleton` на корне загружает весь `TabsView`.
11. Дизайнер может добавлять, скрывать и менять порядок Primary и Secondary, сохраняя минимум два видимых таба на каждом показанном уровне.
12. У каждого Primary может быть собственный набор Secondary; для отдельных Primary второй уровень может отсутствовать.
13. Для Secondary обязательны `Size=40`, `View=Filled`, `Shape=Rounded`, `SingleIcon=False`; менять можно только `Indicator`.
14. Ручные визуальные изменения запрещены: используй effective baseline `TabsView`.
15. Активный таб не может быть Disabled, а названия соседних табов одного уровня не должны повторяться.
16. Disabled-табы учитываются в минимуме видимых, но на каждом уровне остаётся хотя бы один доступный активный таб.
17. Desktop и Mobile Web сохраняют одинаковые названия, порядок и количество табов.
18. При выборе Primary активируется первый доступный Secondary; предыдущий выбор не восстанавливается.
19. Любой таб может перезагружаться отдельно, не блокируя переключение; корневой Skeleton показывает один общий skeleton.
20. Повторное нажатие на активный таб ничего не делает.
21. Допустимы только два уровня: Primary и Secondary.
22. Недоступные табы не скрываются, а переводятся в Disabled.
23. Таб может переключать контент текущей страницы или вести на другую страницу/URL.

## Section 5: Структура текста

Тексты табов обозначают переключаемые контексты. Label можно менять, но он должен оставаться в одну строку и содержать не более 10 символов. Если тексту не хватает места, увеличивай ширину таба. В `TabPrimary` можно включать и заменять штатный `Addon`: иконку, счётчик или статус.

## Section 6: Правила

### Rule 1: Используй TabsView вместо Core TabsPrimary

- ruleId: rule:components.tabs-view.use-tabs-view-in-alfa-business
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В Альфа-Бизнесе используй `TabsView`. Не размещай `TabsPrimary` из Core как самостоятельную замену этого компонента.

### Rule 2: Используй Primary для первого уровня

- ruleId: rule:components.tabs-view.primary-switches-block-context
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

`TabsPrimary` переключает контекст блока на странице и является первым уровнем навигации.

### Rule 3: Не используй Secondary без Primary

- ruleId: rule:components.tabs-view.secondary-requires-primary
- severity: error
- appliesTo: composition
- checkType: deterministic
- autofix: no

`TabsSecondary` используется только после `TabsPrimary` и переключает контекст внутри выбранного таба первого уровня.

### Rule 4: Сохраняй размер Secondary на desktop

- ruleId: rule:components.tabs-view.desktop-secondary-size-40
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На странице desktop используй `TabsSecondary` только в размере `40`.

### Rule 5: Используй desktop overflow через Slider

- ruleId: rule:components.tabs-view.desktop-overflow-slider
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

На небольшом desktop-разрешении сохраняй `[D] TabsView`; неуместившиеся табы прокручиваются кнопками Slider.

### Rule 6: Используй свайп в адаптивной мобильной версии

- ruleId: rule:components.tabs-view.mobile-overflow-swipe
- severity: error
- appliesTo: interaction
- checkType: llm
- autofix: no

В `[M] TabsView` неуместившиеся табы прокручиваются горизонтальным свайпом.

### Rule 7: Используй Mobile только в адаптивной версии

- ruleId: rule:components.tabs-view.mobile-only-adaptive-alfa-business
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

`[M] TabsView` существует только для адаптивной версии Альфа-Бизнеса и не используется в отдельной мобильной версии.

### Rule 8: Используй минимум два таба

- ruleId: rule:components.tabs-view.minimum-two-tabs
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

В `TabsPrimary` должно быть минимум два видимых таба. Если `TabsSecondary` показан, в нём также должно быть минимум два видимых таба. Максимальное количество пока не регламентировано.

### Rule 9: Оставляй один активный таб на уровень

- ruleId: rule:components.tabs-view.one-active-tab-per-level
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Одновременно активен только один `TabsPrimary` и, если второй уровень показан, только один `TabsSecondary`.

### Rule 10: Сохраняй Label однострочным

- ruleId: rule:components.tabs-view.single-line-label
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Label таба можно менять, но текст должен оставаться в одну строку и содержать не более 10 символов. Если тексту не хватает места, увеличивай ширину таба.

### Rule 11: Сохраняй штатные параметры Secondary

- ruleId: rule:components.tabs-view.secondary-fixed-properties
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для `TabsSecondary` обязательны `Size=40`, `View=Filled`, `Shape=Rounded` и `SingleIcon=False`. Параметр `Indicator` может иметь значения `Hidden`, `Collapsed` или `Digit`: `Collapsed` показывает точку, `Digit` — числовой счётчик до `99+`, `Hidden` скрывает индикатор.

### Rule 12: Не меняй визуальные свойства вручную

- ruleId: rule:components.tabs-view.manual-visual-overrides-forbidden
- severity: error
- appliesTo: layer
- checkType: deterministic
- autofix: partial

Не меняй вручную spacing, padding, divider, типографику, заливки, обводки, скругления и opacity. Эти свойства определяются effective baseline `TabsView`.

### Rule 13: Используй платформенное поведение переполнения

- ruleId: rule:components.tabs-view.platform-overflow-behavior
- severity: error
- appliesTo: interaction
- checkType: llm
- autofix: no

На desktop Slider появляется автоматически только при переполнении и не включается вручную. На Mobile Web Slider запрещён: неуместившиеся табы прокручиваются горизонтальным свайпом.

### Rule 14: Не отключай активный таб

- ruleId: rule:components.tabs-view.active-tab-cannot-be-disabled
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Активный Primary или Secondary не может одновременно находиться в состоянии Disabled.

### Rule 15: Используй уникальные названия

- ruleId: rule:components.tabs-view.labels-are-unique-within-level
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Названия соседних табов одного уровня не должны повторяться.

### Rule 16: Используй только разрешённые Addon

- ruleId: rule:components.tabs-view.primary-addon-types
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В Addon у Primary используй только иконки, счётчики или статусы. Addon можно показывать только у активного и доступного Primary.

### Rule 17: Оставляй доступный активный таб

- ruleId: rule:components.tabs-view.minimum-one-enabled-active-tab
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Disabled-табы учитываются в минимуме видимых, но на каждом показанном уровне должен оставаться хотя бы один доступный активный таб.

### Rule 18: Сохраняй отступы между уровнями и контентом

- ruleId: rule:components.tabs-view.fixed-external-spacing
- severity: error
- appliesTo: layer
- checkType: deterministic
- autofix: partial

Между Primary и Secondary должно быть `24 px`. Между последним видимым уровнем табов и контентом также должно быть `24 px`.

### Rule 19: Сохраняй структуру в адаптивной версии

- ruleId: rule:components.tabs-view.desktop-mobile-web-parity
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

Desktop и Mobile Web версии TabsView должны иметь одинаковые названия, порядок и количество табов.

### Rule 20: Выбирай первый доступный Secondary

- ruleId: rule:components.tabs-view.secondary-selects-first-enabled
- severity: info
- appliesTo: interaction
- checkType: llm
- autofix: no

При выборе Primary активируется первый доступный Secondary. Ранее выбранный Secondary для этого Primary не восстанавливается.

### Rule 21: Не блокируй навигацию при загрузке таба

- ruleId: rule:components.tabs-view.individual-loading-behavior
- severity: error
- appliesTo: interaction
- checkType: llm
- autofix: no

Любой таб может перезагружаться отдельно. Активный таб остаётся выбранным, а пользователь может переключаться на другие табы. При `TabsView.Skeleton=true` показывается один общий skeleton.

### Rule 22: Не перезапускай активный таб повторным нажатием

- ruleId: rule:components.tabs-view.active-tab-repeat-click-noop
- severity: error
- appliesTo: interaction
- checkType: llm
- autofix: no

Повторное нажатие на уже активный таб ничего не делает и не запускает обновление контента.

### Rule 23: Не добавляй третий уровень

- ruleId: rule:components.tabs-view.maximum-two-levels
- severity: error
- appliesTo: composition
- checkType: deterministic
- autofix: no

В TabsView допустимы только два уровня: Primary и Secondary. Третий уровень табов запрещён.

### Rule 24: Привязывай контент к активному Secondary

- ruleId: rule:components.tabs-view.content-follows-active-secondary
- severity: error
- appliesTo: composition
- checkType: llm
- autofix: no

Если у выбранного Primary показан Secondary, контент должен соответствовать активному Secondary. Прямого контента самого Primary в этом состоянии быть не должно.

### Rule 25: Отключай недоступные табы вместо скрытия

- ruleId: rule:components.tabs-view.unavailable-tabs-are-disabled
- severity: error
- appliesTo: component
- checkType: llm
- autofix: partial

Табы, недоступные из-за прав, сегмента пользователя или данных, не скрываются, а переводятся в Disabled. Если активный таб становится недоступным, активируется первый доступный таб уровня.

### Rule 26: Выбирай навигационный режим по контексту

- ruleId: rule:components.tabs-view.navigation-mode-is-contextual
- severity: info
- appliesTo: interaction
- checkType: llm
- autofix: no

Таб может переключать контент внутри текущей страницы или выполнять переход на другую страницу/URL. Оба режима допустимы и выбираются по продуктовому контексту.

## Section 7: Шаблоны

### Один уровень

```text
TabsPrimary
Content выбранного первого уровня
```

### Два уровня

```text
TabsPrimary
TabsSecondary, Size=40
Content выбранного второго уровня
```

### Маленький desktop

```text
[D] TabsView
Overflow: Slider buttons
```

### Adaptive Mobile Web

```text
[M] TabsView
Overflow: horizontal swipe
```

## Section 8: Примеры

### Первый уровень

`TabsPrimary` переключает целые контекстные блоки страницы.

### Второй уровень

`TabsSecondary` внутри выбранного `TabsPrimary` переключает блок фильтров и фильтруемый контент.

## Section 9: Антипримеры

### Secondary без Primary

`TabsSecondary` размещён непосредственно под TitleView без первого уровня.

### Core вместо TabsView

На странице Альфа-Бизнеса размещён самостоятельный `TabsPrimary` из Core.

### Неверная адаптация

На небольшом desktop-разрешении компонент заменён мобильной версией вместо `[D] TabsView` со Slider.

## Section 10: Машинная обработка

### Детерминированные проверки

- Находить самостоятельный `TabsPrimary` из Core в b2b-макетах.
- Проверять наличие `TabsPrimary`, если видим `TabsSecondary`.
- Проверять `Size=40` у desktop `TabsSecondary`.
- Проверять `View=Filled` и `Shape=Rounded` у `TabsSecondary`.
- Проверять `SingleIcon=False` у `TabsSecondary`.
- Проверять, что активный таб не находится в состоянии Disabled.
- Проверять уникальность названий внутри каждого уровня и длину Label до 10 символов.
- Проверять тип Addon у Primary: иконка, счётчик или статус.
- Проверять, что Addon показан только у активного и доступного Primary.
- Проверять наличие хотя бы одного доступного активного таба на каждом показанном уровне.
- Проверять отступ `24 px` между Primary и Secondary и между последним уровнем табов и контентом.
- Проверять общий skeleton при `TabsView.Skeleton=true`.
- Проверять отсутствие третьего уровня табов.
- Проверять использование `[D] TabsView` на desktop и `[M] TabsView` на Mobile Web.
- Сравнивать вложенные layout и typography с effective baseline `TabsView`.
- Фиксировать ручные изменения spacing, padding, divider, typography, fill, stroke, radius и opacity как нарушения.

### LLM-проверки

- Проверять соответствие уровня табов масштабу переключаемого контекста.
- Отличать adaptive Mobile Web от отдельной мобильной версии.
- Проверять, что Slider и свайп соответствуют платформе.
- Сопоставлять названия, порядок и количество табов в desktop и mobile-web версиях.
- Проверять выбор первого доступного Secondary при переключении Primary.
- Проверять доступность переключения во время индивидуальной загрузки таба.
- Проверять, что повторное нажатие на активный таб не запускает действие.
- Проверять привязку контента к активному Secondary.
- Проверять, что недоступные табы отключены, а не скрыты.
- Проверять соответствие навигационного режима продуктовому контексту.

### Словарные проверки

- Находить слишком общие или неразличимые названия соседних табов.
- Находить подписи, которые не описывают переключаемый контекст.

### Не проверяется автоматически

- Продуктовая обоснованность конкретного набора табов.
- Качество названий табов без редакционного контекста.
- Реализация переключения контента на стороне продукта.

### Автоисправления

- Предлагать заменить самостоятельный Core `TabsPrimary` на `TabsView`.
- Возвращать `TabsSecondary` на desktop к размеру `40`.
