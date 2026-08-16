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
- `[M] AppHeader :: Bottom` опционален;
- вложенный `[M] TabBar` показывается на основных навигационных экранах, перечисленных в нём: `Home`, `History`, `Payments`, `Marketplace`, `Chat`;
- `Active Tab` соответствует текущему основному навигационному экрану.

## Источники

- raw: `../Web _ Corp Components -- CorporateAppHeaderMobile [M].json`;
- Figma: `https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=515-80766`;
- pattern: `patterns/p_corporate-app-navigation.md`.

## Статус

**Draft.** Назначение, platform, public boundary, семантика `Page`/`Home` и область применения `TabBar` подтверждены владельцем. Anatomy, свойства, контент, visual policy, states, interaction и severity ещё уточняются.
