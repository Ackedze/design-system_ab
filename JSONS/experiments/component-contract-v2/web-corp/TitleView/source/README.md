# TitleView contract package

## Назначение

TitleView описывает сценарий header with title, status and action buttons. Это готовая DS-композиция для заголовка страницы/секции: Title, Status, Button group, RightAddon, TitleAddon и Subtitle должны настраиваться через встроенные slots и nested DS instances, а не через внешнюю ручную композицию.

## Источник raw catalog

`JSONS/web/components/web-corp/Web _ Corp Components -- TitleView.json`

Папка содержит экспериментальный Apollo contract package. Он не заменяет raw catalog, который используется текущим Apollo audit.

## Файлы

- `contract.generated.json` — compact generated baseline из raw catalog.
- `contract.overrides.json` — public API, aliases и reset model.
- `composition-contract.json` — composition и nested ownership model.
- `rules.json` — draft machine-readable rules.
- `audit-mapping.json` — mapping от diff properties к Apollo audit categories.
- `examples.json` — regression examples для ожидаемого поведения Apollo.
- `agent-context.json` — compact context для Apollo agent.

## Источник

- Библиотека: `Web _ Corp Components`
- Файл: `Web _ Corp Components`
- Сгенерировано: `2026-06-05T16:07:39.725Z`

## Платформенные версии

- `[D] TitleView` используется в desktop-интерфейсах.
- `[M] TitleView` является адаптивной версией `[D] TitleView` для мобильного браузера.
- `[M] TitleViewMobile` является специальной версией для mobile-web и описывается отдельным компонентным комплектом.
- `[M] TitleView` и `[M] TitleViewMobile` разрешены при проектировании. Выбор зависит от сценария, поэтому сам факт использования одной из версий не является основанием рекомендовать замену на другую.

## Примечания

- Nested [D]/[M] Button instances внутри Button group являются частью TitleView baseline; variant changes дизайнером нужно показывать относительно TitleView effective baseline.
- StatusPreset и Status внутри MainContent / Status являются ожидаемыми nested structures; использование preset нормально, если preset не изменён за пределами его variant API.
- View и Skeleton являются public TitleView component properties.
- Title, Subtitle, Button labels и Status label меняются как text content overrides.
- Для встроенного статуса допустимый пример настройки: `Type=Processing`, `Style=Muted`, `Size=24`, label `В работе`.
- Кнопки внутри `Button group` используют платформенный размер: `Size=56` в `[D] TitleView` и `Size=48` в `[M] TitleView`; остальные параметры определяются public API `Button` и паттерном `Кнопки и группы кнопок`.
- Nested DS instances внутри TitleView не считаются локальными компонентами и предпочтительнее внешней ручной композиции.
- Для `View=Large`, `Medium` и `Small` доступны только `Title`, `Subtitle`, `TitleAddon` и `RightAddon`; расширенные слоты относятся к `xLarge`.
- `Holding` с `FilterCompanySelect_Single` обязателен, если пользователь работает от группы компаний, а страница доступна только в моно-режиме.
- `RightAddon` используется для контекстных кликабельных точек входа в правой части страницы и не содержит primary-действие.
- В `xLarge` primary-действия размещаются в `Button group`; для `Large`, `Medium` и `Small` primary-действия располагаются вне `TitleView`.
- `Title` обязателен и не может быть пустым или скрытым.
- Label встроенного `Status`, а также `Title` и `Subtitle` внутри `TitleStatus` разрешено менять через content overrides; `Type` продолжает определять статусный цвет.
- Верхний `Status` использует только `Size=24`: `Style=Contrast` на сером фоне и `Style=Muted` на белом; `Type` может быть любым из public API.
- `TitleStatus` может использоваться без верхнего `Status`.
- Кнопки в `Button group` используют `Size=56` для `[D] TitleView` и `Size=48` для `[M] TitleView`; остальные параметры определяются public API `Button` и паттерном `Кнопки и группы кнопок`.
- Параметры `FilterCompanySelect_Single` внутри `Holding` определяются собственным API и будущим компонентным контрактом селекта.
- Editable-сценарии и правила `p_title-view-editable.md` являются частью комплекта `TitleView`.
- Редактируемый `Title` всегда однострочный с ellipsis. Полное редактирование запускается кнопкой с карандашом и требует `Subtitle`; частичное — контекстной кнопкой действия, для даты кнопкой с календарём.
- Способы сохранения и отмены редактирования зависят от контекста и платформы; комплект не требует `Enter`, `Escape` или фиксированный набор кнопок без отдельного правила.
- Рекомендуемая длина `Subtitle` — не больше 120 символов с пробелами.
- Значения `Type` у одновременно видимых `StatusPreset` и `TitleStatus` должны совпадать: `Type` определяет статусный цвет. Apollo проверяет эту связь детерминированно и не формирует нарушение, если исходный `Type` отсутствует в snapshot.
- `TitleAddon` может быть кликабельным, а `StatusBadge` может реагировать только на hover; состав `RightAddon` определяется выбранным `Type`.
- Ручные изменения layout, sizing, типографики, цвета, opacity и других стилей корня и всего внутреннего дерева `TitleView` запрещены; текст меняется через content overrides.
- Для корня рекомендуется ширина `Fill container` и высота `Hug contents`; различий между desktop и mobile-web нет.
- Порядок слотов `Status -> Heading -> Holding -> Subtitle -> TitleStatus -> Button group` обязателен.
- Внутри предусмотренных слотов разрешён instance swap на произвольные компоненты. Сам swap не является нарушением, пока сохраняются порядок слотов и структура `TitleView`.
- Корень `TitleView` нельзя оформлять вручную или превращать в единую кликабельную поверхность.
