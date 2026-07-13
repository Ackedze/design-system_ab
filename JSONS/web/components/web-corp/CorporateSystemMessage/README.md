# CorporateSystemMessage — component contract

Папка содержит generated baseline и authored semantic contract для **Web _ Corp Components / CorporateSystemMessage**.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- CorporateSystemMessage.json`

## Файлы

- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — authored semantic ownership и правила публичного API.
- `composition-contract.json` - generated internal ownership + manual composition semantics.
- `rules.json` - component-level classification и design rules.
- `audit-mapping.json` - generated default Apollo grouping model.
- `examples.json` - тестовые сценарии и ожидаемые выводы.
- `agent-context.json` - compact generated context for agent-side interpretation.

## Источник

- Библиотека: `Web _ Corp Components`
- Raw-каталог обновлён: `2026-07-09T07:11:39.994Z`
- Компонентов: `29`

## Current Scope

Публичными являются только `[D] CorporateSystemMessage` и `[M] CorporateSystemMessage`. Остальные компоненты семейства используются как внутренние части композиции; переходные `🔄/.🔄` запрещены.

- `View=No adaptive` сообщает о недоступности функции на текущей платформе.
- `BG plate=True` используется для самостоятельного сообщения, `False` — при встраивании в существующий контент.
- `Size=Small` относится к локальной области страницы, `Large` — к странице или крупной самостоятельной области.
- Для `Large` обязательны Graphic, Title и Description; для `Small` обязателен Title.
- После выбора `View` разрешено выбрать только относящийся к нему вложенный `Type`.
- Graphic можно менять только в `Base`; Title — в `Base` и `Progress`; Description — в `Base`, `Empty/Nothing Found Yet` и `Progress`.
- Тексты оцениваются по `p_status-screen.md`.
- Допускается максимум две кнопки: одна Primary и одна Secondary. Axis можно менять только для `Large`.
- Кнопки необязательны. Для `Large` вертикальный Axis используется, только если две кнопки не помещаются горизонтально.
- `Subtitle` является Description. `Caption` можно использовать в любом View как дополнительное описание.
- Геометрия и визуальные стили корня и внутренних слоёв защищены effective baseline выбранных `View/Size/BG plate`.
- `Large` продолжает ширину исходного сценария: 8 колонок после формы либо 12 колонок/100% на странице с таблицей. Ширина `Small` определяется контейнером.
- Корень использует Fill/Hug, содержимое всегда центрируется.
- Detach, внутренний instance swap и произвольные дочерние слои запрещены.
- На ширине 768 и выше используется `[D]`; ниже 768, в mobile-web и адаптиве — `[M]`.
- Интерактивность разрешена только кнопкам; кликабельность и hover корня запрещены.
- Встроенная подложка защищена от overrides. При `BG plate=False` разрешена внешняя обёртка `BackgroundPlateSlot`.
- Компонент можно использовать в Modal, UniversalModal и PopUpSheet в обоих размерах.
- В `No adaptive` Graphic, Title и Description фиксированы; Caption можно добавить.
