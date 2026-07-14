# CorporateAppHeaderNew [D] — component contract

Папка содержит generated baseline и ручной semantic layer для desktop-навигационной оболочки корпоративной страницы.

Raw-каталог Figma остаётся источником структуры, вариантов и effective baseline:

`../Web _ Corp Components -- CorporateAppHeaderNew [D].json`

## Публичные компоненты

- `[D] Header` — верхняя панель страницы.
- `[D] SideMenu` — постоянное боковое меню на больших desktop-разрешениях.
- `[D](768) HeaderMenu` — левый drawer с функциями SideMenu на ширине 768 px.

Остальные 16 компонентов пакета являются служебными и не используются самостоятельно.

## Файлы

- `contract.generated.json` — автоматически сгенерированный structural baseline из raw-каталога.
- `contract.overrides.json` — ручная семантика публичного API, состояний, разрешённых overrides и ограничений.
- `composition-contract.json` — ownership вложенных компонентов, breakpoint-композиция и effective baseline.
- `rules.json` — точные component rules для Apollo и агента.
- `audit-mapping.json` — классификация отклонений и правила интерпретации аудита.
- `examples.json` — валидные и невалидные сценарии использования.
- `agent-context.json` — generated факты и ручной контекст для агента.

## Основная композиция

- На больших desktop-разрешениях `[D] Header` используется вместе с `[D] SideMenu`.
- На ширине 768 px Header автоматически получает `👽 Tablet=true`, а SideMenu заменяется `[D](768) HeaderMenu`.
- HeaderMenu открывается слева как drawer и закрывается только кнопкой Close.
- SideMenu и HeaderMenu используют одну синхронизированную модель навигации.
- Компоненты обязательны на корпоративной странице и не используются отдельно.

## Ключевые ограничения

- Detach публичных и служебных компонентов запрещён.
- Ручное изменение `👽 Tablet`, геометрии, layout и визуальных стилей запрещено.
- `Back`, `Edit Mode` и `Holding` используются по контексту.
- В Edit Mode пользователь меняет только порядок и видимость продуктовых пунктов.
- `AllServices`, `Bonus`, `LogoCell` и системные контролы нельзя переименовывать или заменять.
- Допустим только один уровень вложенной навигации и один активный пункт.
- Прокручивается только область Cells; LogoCell и Footer закреплены.

## Источник

- Библиотека: `Web _ Corp Components`
- Raw-каталог обновлён: `2026-07-09T07:11:39.994Z`
- Компонентов: `19`
- Платформа: `desktop`, включая breakpoint `768 px`
- Статус комплекта: `Ready`
