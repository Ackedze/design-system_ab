# CorporateAppHeaderMobile [M]

## Назначение

Семейство компонентов образует навигационную обвязку Alfa Business для `mobile-web` и мобильного состояния адаптивных страниц. Сборка состоит из верхней части `[M] AppHeader :: Top` и опциональной нижней части `[M] AppHeader :: Bottom`.

## Публичная граница

- public roots: `[M] AppHeader :: Top` и `[M] AppHeader :: Bottom`;
- `[M] NavigationBar`, `[M] TabBar`, `BottomAddon`, `CenteredMainSlot`, `LeftAddon`, `RightAddon`, `HomeAddon` и `LeftMainSlot` — внутренние части семейства;
- внутренние части не используются самостоятельно вне публичных roots;
- поддерживается только `mobile-web` (`320–767 px`), в том числе как мобильное состояние адаптивной страницы.

## Подтверждённая семантика

- `[M] NavigationBar.Presets=Page` используется на внутренних страницах продукта;
- `[M] NavigationBar.Presets=Home` используется на главном экране;
- `[M] AppHeader :: Top` обязателен во всех сценариях семейства;
- `NativeStatusBar=True` рекомендуется сохранять; status bar показывается и в отдельной mobile-web версии, и в мобильном состоянии адаптивной страницы;
- на страницах `NavigationBar=True` обязателен; `False` допустим для полноэкранных `Modal` и `PopupSheet`;
- `BackgroundColor` верхней части соответствует фону страницы: `base-bg (white)` или `base-bg-alt (gray)`;
- `Overlap=False` используется до прокрутки, а при скролле автоматически переключается в `True` и показывает разделитель;
- `[M] AppHeader :: Bottom` опционален;
- внутри используемой `[M] AppHeader :: Bottom` `NativeSafariBottom=True` обязателен и в отдельной mobile-web, и в адаптивной версии;
- допустимы только `TabBar=True + NativeSafariBottom=True` и `TabBar=False + NativeSafariBottom=True`;
- defaults вложенного `NativeSafariBottom`: `URL=True`, `Tabs=False`, `DarkMode=False`; `Tabs=True` и `DarkMode=True` разрешены;
- вложенный `[M] TabBar` показывается на основных навигационных экранах, перечисленных в нём: `Home`, `History`, `Payments`, `Marketplace`, `Chat`;
- `Active Tab` соответствует текущему основному навигационному экрану.
- состав `TabBar` фиксирован: Главный, История, Платежи, Сервисы и Связь в заданном порядке;
- индикаторы и счётчики на пунктах `TabBar` разрешены и зависят от продуктового контекста;
- `Top` и `Bottom` растягиваются по ширине viewport, а их высота определяется содержимым;
- ручные изменения width, height, padding и gap запрещены;
- `Top` закреплён у верхнего края, `Bottom` — у нижнего края viewport;
- `Back` возвращает на предыдущий экран, `FloatingCross` закрывает текущую страницу или модальную сущность;
- `Action` и `[D] IconButton` получают действия из продуктового сценария;
- выбор пункта `TabBar` открывает соответствующий основной раздел и обновляет `Active Tab`;
- семейство не создаёт собственные loading, disabled, error или skeleton-состояния и отображает состояния вложенных компонентов;
- ручные fill, stroke, radius, typography, opacity и effects запрещены; внешний вид меняется только через предусмотренные properties и token baseline;
- detach `Top`, `Bottom` и внутренних компонентов запрещён;
- instance swap разрешён в `BottomAddon=Custom`; в `RightAddon=Icons` разрешено менять иконки штатным swap с сохранением `[D] IconButton`;
- реализация в коде существует, но Code Connect не настроен; package/export пока не верифицирован;
- семейство активно, replacement и план снятия с поддержки отсутствуют.
- в `Page` используются `LeftAddon`, `CenteredMainSlot`, `RightAddon` и при необходимости `BottomAddon`;
- `CenteredMainSlot.Content` поддерживает `Title + Subtitle`, `Title` и `None`; переполняющийся текст сокращается через ellipsis;
- `LeftAddon=Back` показывает навигацию назад, `None` оставляет слот пустым;
- `RightAddon=Icons` содержит одну или две `[D] IconButton`, `FloatingCross` закрывает страницу, `Action` показывает одно текстовое действие, `None` оставляет слот пустым;
- в `Home` используются `LeftMainSlot` и `HomeAddon`;
- `Home` всегда использует `base-bg-alt (gray)` и применяется только вместе с `TabBar`;
- `Profile=True` в `Home` включается только после перехода из раздела `TabBar` в `NavigationBar`;
- `BottomAddon` поддерживает `Custom`, `SegmentedContol`, `FilterBlock` и `Segmented + Filter` согласно их прямому назначению.

## Источники

- raw: `../Web _ Corp Components -- CorporateAppHeaderMobile [M].json`;
- Figma: `https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=515-80766`;
- pattern: `patterns/p_corporate-app-navigation.md`.

## Статус

**Ready.** Назначение, platform, public boundary, anatomy, properties, composition, content, layout, visual policy, states, interaction, severity, lifecycle и Code Connect status подтверждены владельцем. Package validator и targeted Athena checks пройдены; владелец принял комплект 2026-08-16.
