# CardSwiperMobile [M]

Component package для mobile-web карусели банковских карт. Компонент показывает выбранную карту в центре и соседние карты по краям, поддерживает свайп и выбор боковой карты тапом.

## Статус

**Ready**. Продуктовая семантика и комплект документов подтверждены владельцем 2026-08-03. Package validator и targeted Athena checks проходят; точный runtime API остаётся отдельным долгом и не блокирует готовность Figma-контракта.

## Источники

- Figma: `Web _ Corp Components`, page `CardSwiperMobile [M]`, node `20005:58597`.
- Raw: `../Web _ Corp Components -- CardSwiperMobile [M].json`.
- Generated baseline: `contract.generated.json`.
- Вложенный компонент: package `CardImage` и его exact component rules.
- Решения владельца компонента от 2026-08-03.

Приоритет смысла: подтверждённые решения владельца → exact component rules → manual package → raw/generated для наблюдаемой структуры.

## Публичная граница

Публичный root только один:

- `CardSwiperMobile` — `71276eaed89138c3a234084b2f7339019a558aec`.

`CardsCollection`, `LeftCardWrapper`, `RightCardWrapper`, spacing-слои и вложенные `CardImage` принадлежат host-композиции. Их нельзя вставлять отдельно, detach, переставлять или вручную менять их геометрию.

Компонент предназначен только для mobile-web. Runtime-аналог предполагается существующим, но Code Connect, package/import и точный prop API пока не подтверждены.

## Основной контракт

- Принимает одну или более карт без верхнего лимита.
- Порядок карт сохраняется; первая карта выбрана по умолчанию, если выбранная карта явно не задана.
- Выбранная карта находится в центре и использует `CardImage Size=264x164`.
- Предыдущая и следующая карты используют `CardImage Size=212x132`.
- При одной карте отображается только центральная карта; при двух — текущая и один доступный сосед; при трёх и более — предыдущая, текущая и следующая.
- На первом и последнем элементе отсутствующий сосед не отображается, а текущая карта остаётся по центру.
- `Show Start#17127:0` показывает previous; `Show End#17127:3` показывает next. Для одной карты оба `false`; на первом элементе `false/true`, внутри списка `true/true`, на последнем `true/false`.
- Карусель нециклическая. Свайп или тап по боковой карте сдвигает выбор ровно на одну позицию.
- `Screen Size=320-360` применяется для viewport 320–359 px; `360+` — от 360 px включительно.
- Верхний отступ всегда `24 px`, нижний всегда `32 px`.

## CardImage и взаимодействие

Содержимое, cover, state и разрешённые leaf overrides каждой карты наследуют полный контракт `CardImage` и могут различаться. Размер, `Stack=false`, позиция и геометрия управляются CardSwiperMobile.

Центральная позиция означает выбор независимо от `CardImage State`: `Active`, `Inactive` и `Locked` разрешены и не блокируют прокрутку. Центральная карта не является CTA карусели, но вложенное действие самой карты разрешено, например тап по иконке показа реквизитов.

Компонент не содержит pagination indicators, стрелки, подписи, Empty, Loading или Error. Внешние элементы управления собираются рядом с компонентом, а при нуле карт CardSwiperMobile не создаётся.

## Accessibility и motion

- Объявляй карусель как список карт.
- Передавай current/selected для центральной карты, позицию `N из M` и состояние карты.
- Порядок фокуса совпадает с исходным порядком карт.
- Тап по боковой карте остаётся доступной альтернативой свайпу.
- Переход сохраняет горизонтальное перемещение и изменение размера; duration, easing и reduced-motion определяет React-контракт и не выводятся из Figma.

## Известный конфликт raw

Generated variant delta для `320-360` показывает нижний spacing `24`, но владелец подтвердил единый нижний отступ `32 px` для обоих вариантов. Это curated semantic override; generated-файл вручную не исправляется.

Текущий raw exporter также не отражает root boolean properties `Show Start#17127:0` и `Show End#17127:3`, подтверждённые live Figma. Они зафиксированы только в manual-секциях и производном hub manifest до обновления exporter.

## Файлы

- `contract.generated.json` — generated baseline Athena; вручную не редактируется.
- `contract.overrides.json` — публичная граница, semantics variants и interaction/reset model.
- `composition-contract.json` — ownership, окно карусели и effective baseline.
- `rules.json` — exact component rules для Apollo и агента.
- `agent-context.json` — назначение, evidence policy и anti-hallucination instructions.
- `audit-mapping.json` — ручная классификация selection/content/composition diffs.
- `examples.json` — positive, negative и context-dependent regression cases.

## Проверка

```bash
node .codex/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/web-corp/CardSwiperMobile [M]"
```

Targeted Athena checks запускаются только для `web/components/web-corp/Web _ Corp Components -- CardSwiperMobile [M].json`.
