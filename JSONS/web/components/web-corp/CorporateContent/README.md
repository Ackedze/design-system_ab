# CorporateContent — MVP component contract

Папка содержит component-contract для **Web _ Corp Components / CorporateContent**. Во фронтовой архитектуре `CorporatePage` остаётся названием page-сборки, но отдельного Figma-компонента с таким именем нет.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- CorporateContent.json`

## Файлы

- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — authored semantic rules, slots и ownership.
- `composition-contract.json` — effective baseline и композиционные зависимости.
- `rules.json` — детерминированные и контекстные правила Apollo/агента.
- `audit-mapping.json` — группировка findings и reset surfaces Apollo.
- `examples.json` — тестовые сценарии и ожидаемая реакция агента.
- `agent-context.json` — компактный generated + manual контекст для агента.

## Источник

- Библиотека: `Web _ Corp Components`
- Raw-каталог обновлён: `2026-07-11T11:00:44.329Z`
- Компонентов: `15`

## Current Scope

Пакет содержит authored-контракт `CorporateContent` и вложенного `[D] Section`. Raw и generated-части обновляются Athena; manual-части сохраняются при повторной генерации.

## CorporateContent

- На продуктовой странице используется один `CorporateContent`. В Figma он может использоваться самостоятельно: родительского компонента `CorporatePage` не существует. Во фронтовой сборке `CorporateContent` входит в `CorporatePage`.
- Для desktop используй `[D] CorporateContent`, для mobile-web — `[M] CorporateContent`.
- Переходный `🔄 [T] CorporateContent` не допускается в рабочих макетах.
- В слот `Body` можно помещать любой контент или композицию, включая несколько дочерних элементов.
- Фон всего фрейма выбирается через mode коллекции `BackgroundPlate Color`; разрешены только `base-bg-alt (grey)` и `base-bg (white)`, а `modal-bg-*` запрещены. Ручной fill запрещён.
- Grid style корня является системным и не меняется вручную.
- Отступы определяются mode коллекции `[D] Grid & Cols` или `[M] Grid & Cols`, а не ручными padding.
- Для `[M] CorporateContent` обязательны `TopMargin=24` и `BottomMargin=24`.
- Корень использует `Fill container` по ширине и `Hug contents` по высоте.
- У корня нельзя вручную менять radius, stroke, effects, opacity и clips content.
- На ширине `768` используется `[D] CorporateContent` с mode `768` коллекции `[D] Grid & Cols`; `[M] CorporateContent` используется ниже `768`.
- Default-фон — `base-bg-alt (grey)`. Выбор между двумя page modes будет описан отдельным паттерном.
- Корень не может быть кликабельным; `CorporateContent` и `Body` нельзя detach-ить.
- Direction и itemSpacing внутри `Body` определяются вложенной композицией. `Gutter` можно применять в любой горизонтальной композиции, `Section` не обязателен.
- Нельзя вкладывать `CorporateContent` внутрь другого `CorporateContent`.
- После добавления реального контента placeholder `SwapMe` должен быть удалён или заменён.
- `Header` или `HeaderMenu` располагается непосредственно над `CorporateContent` в общем вертикальном контейнере с gap `0`.
- Корень `CorporateContent` использует вертикальный auto layout, `itemSpacing=0` и `clipsContent=false`.
- `[D] Section` входит в комплект как необязательный вспомогательный компонент; горизонтальную композицию с `Gutter` можно собрать и без него.
- `Section` предназначен для горизонтальной группировки блоков и управления колонками.
- На всех разрешениях `Position=true` размещает `Isle` ниже `Content`, `Position=false` — выше.
- `👽 TabletIsle` автоматически становится `true` в modes 1024 и 768; вручную его не переключают.
- Корень `Section` использует `Fill container`/`Hug contents`; direction и alignment определяются компонентом и mode.
- В `Content` и `Isle` можно помещать любой контент через slots, но instance swap запрещён.
- Между `Content` и `Isle` обязательно используется переменная `Gutter`.
- Ширина `Content` и `Isle` задаётся только переменными колонок `Grid & Cols`.
- `SwapMe` обязательно удаляется или заменяется отдельно в обоих слотах.
- `Section`, `Content` и `Isle` нельзя detach-ить или вручную менять их fill, stroke, radius, opacity и effects.
