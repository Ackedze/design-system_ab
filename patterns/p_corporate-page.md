# Pattern: CorporatePage

- documentType: pattern
- patternType: component
- component: CorporatePage
- patternId: ptrn:components.corporate-page
- patternKey: components.corporate-page
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System / Product Design
- status: active
- updatedAt: 2026-07-11
- sourceType: component-guideline
- tags: corporate-page, corporateappheadernew, content, page-template, wide-grid, grid-and-cols, body-slot, page-layout, adaptive
- figmaLink: https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=47124-72335
- relatedPatterns:
  - ptrn:components.corporate-app-navigation
  - ptrn:layout.adaptive-alfa-business
- sections: 10

## Section 1: Определение

`CorporatePage` — целевая фронтовая сборка страницы продукта в Альфа-Бизнесе, а не отдельный Figma-компонент. В Figma сборка состоит из навигации `CorporateAppHeaderNew`, самостоятельного `CorporateContent` и других системных компонентов страницы.

Компонент задаёт базовую структуру страницы, широкую сетку, слоты для контента и поведение при переключении ключевых разрешений экрана.

## Section 2: Когда использовать

Используйте паттерн `CorporatePage`, когда нужно:

- собрать новую страницу продукта в Альфа-Бизнесе;
- работать с широкой сеткой и 12 колонками;
- использовать актуальную страницу вместо старой базовой страницы `1440 x 860 px`;
- автоматически перестраивать макет на ключевые разрешения через переменные;
- разместить страницу вместе с `CorporateAppHeaderNew`;
- заменить содержимое `Body` на собственную сборку контента через слот;
- актуализировать старый макет со светлым боковым меню;
- проверить размеры широкой сетки для `1600`, `1440`, `1280`, `1024`, `768` и мобильного адаптива.

## Section 3: Когда не использовать

Не используйте `CorporatePage`, если:

- нужно собрать локальный блок внутри страницы, а не саму страницу;
- макет относится к старой сборке и не планируется актуализировать до широкой сетки;
- нужно вручную собрать шапку, боковое меню или контент без page-шаблона;
- хочется detached-копией изменить системные компоненты `[D] SideMenu`, `[D] Header`, `Content` или `Body`;
- задача касается только правил текста, кнопок, таблиц или форм без изменения page-шаблона.

## Section 4: Принципы

1. Для новых макетов используется актуальная сборка страницы по паттерну `CorporatePage`.
2. Базовая страница Альфа-Бизнеса - `1600 x 900 px`, максимальная ширина контента - `1248 px`.
3. С Q3 2025 в продуктах Альфа-Бизнеса используется только широкая сетка.
4. Правильно собранный экран на переменных автоматически перестраивается на другие разрешения.
5. Таблицы и сложные кастомные блоки могут требовать ручной доработки после перестроения.
6. `[D] SideMenu` и `[D] Header` нельзя detach-ить.
7. Контент странцы размещается в слоте `Body`.
8. Компоненты страницы `CorporateContent`, `SideMenu`, `Header` и `HeaderMenu` нельзя detach-ить.
9. `Gutter` используется как горизонтальный отступ в любой горизонтальной композиции; `Section` не обязателен. `Gutter` не является обязательным вертикальным отступом `Body`.
10. На продуктовой странице используется один платформенный `CorporateContent`; в Figma он может быть самостоятельным, а во фронтовой сборке входит в `CorporatePage`.
11. В `Body` можно размещать любую композицию; ограничения дочернего контента определяются его собственными контрактами.
12. Фон и отступы `CorporateContent` управляются modes переменных, grid style не меняется вручную.

## Section 5: Структура текста

В описании страницы фиксируйте:

- используемую сборку страницы по паттерну `CorporatePage`;
- режим сетки `[D] Grid & Cols` или `[Old] Grid Values`;
- разрешение экрана;
- ширину контента;
- боковые отступы;
- способ замены содержимого `Body`;
- переменные ширины для блоков, которые занимают 12 колонок или конкретные колонки.

Для новых макетов используйте названия переменных и компонентов так же, как в Figma: `[D] CorporateContent`, `[M] CorporateContent`, `[D] Grid & Cols`, `[M] Grid & Cols`, `[D] SideMenu`, `[D] Header`, `Body`, `SwapMe`, `Gutter`.

## Section 6: Правила

### Rule 1: Используйте сборку CorporatePage как целевой паттерн страницы

- ruleId: rule:components.corporate-page.use-target-page-component
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Для страницы продукта в Альфа-Бизнесе используйте актуальную сборку `CorporatePage`, в которую входят `SideMenu`, `Header` или `HeaderMenu` и `CorporateContent`. Не ищи и не требуй отдельный Figma-компонент `CorporatePage`.

#### Правильно

```text
CorporatePage assembly
CorporateAppHeaderNew
CorporateContent
```

#### Неправильно

```text
Страница собрана вручную из шапки, бокового меню и фрейма контента.
```

#### Почему

Паттерн `CorporatePage` задаёт системную page-сборку, сетку, слоты и адаптивное поведение.

### Rule 2: Используйте базовую страницу 1600 x 900 px для новой сборки

- ruleId: rule:components.corporate-page.base-page-size
- severity: warning
- appliesTo: screen
- checkType: deterministic
- autofix: no

Базовая страница Альфа-Бизнеса - `1600 x 900 px`, максимальная ширина контента - `1248 px`. Она заменяет старую базовую страницу `1440 x 860 px`.

#### Правильно

```text
Base page: 1600 x 900 px
Max content width: 1248 px
```

#### Неправильно

```text
Новый макет начинается со старой страницы 1440 x 860 px.
```

#### Почему

Новая базовая страница соответствует широкой сетке и актуальному page-шаблону.

### Rule 3: Используйте только широкую сетку для продуктов АБ

- ruleId: rule:components.corporate-page.wide-grid-only
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

С Q3 2025 в продуктах Альфа-Бизнеса используется только широкая сетка.

#### Правильно

```text
Новая продуктовая страница использует Wide grid.
```

#### Неправильно

```text
Новая продуктовая страница использует старый Basic grid.
```

#### Почему

Wide grid - актуальный стандарт для продуктовых страниц Альфа-Бизнеса.

### Rule 4: `Header` и `CorporateContent` располагаются в одном вертикальном автолейауте с отступом 0 px

- ruleId: rule:components.corporate-page.header-content-autolayout
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

Страница делится на две зоны в горизонтальном автолейауте. Слева располагается `SideMenu`, справа — единый вертикальный контейнер, внутри которого `Header` стоит над `CorporateContent` с отступом `0 px`.

#### Правильно

```text
CorporatePage
Horizontal auto layout
Left: SideMenu
Right: Vertical auto layout, gap 0 px
  Header
  CorporateContent
```

#### Неправильно

```text
CorporatePage
Horizontal auto layout
Left: SideMenu
Right:
  Header вынесен отдельно
  CorporateContent расположен в другом контейнере
  Между Header и CorporateContent задан gap 16 px
```

#### Почему

`Header` и `CorporateContent` образуют единую правую рабочую область страницы. Если разделить их по разным контейнерам или добавить вертикальный отступ, ломается структура CorporatePage, появляются лишние зазоры и страница хуже адаптируется к сетке.

### Rule 5: Переключайте размер страницы через D Grid & Cols

- ruleId: rule:components.corporate-page.grid-and-cols-variable
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Фрейм страницы и `[D] CorporateContent` используют переменные `[D] Grid & Cols`. Меняйте размер страницы через блок `Appearance`, переключая `[D] Grid & Cols` на `1600`, `1440`, `1280` или `1024`.

#### Правильно

```text
Appearance -> [D] Grid & Cols -> 1440
```

#### Неправильно

```text
Размер страницы изменён ручным растягиванием без переменной.
```

#### Почему

Переменные сохраняют системную сетку и позволяют странице корректно перестраиваться.

### Rule 6: Не detach-ьте SideMenu и Header

- ruleId: rule:components.corporate-page.no-detach-header-sidemenu
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`[D] SideMenu` и `[D] Header` - полноценные компоненты. Их нельзя detach-ить.

#### Правильно

```text
[D] SideMenu остаётся компонентом.
[D] Header остаётся компонентом.
```

#### Неправильно

```text
[D] SideMenu detached и отредактирован вручную.
```

#### Почему

Detach ломает связь с системным компонентом и обновлениями дизайн-системы.

### Rule 7: Не detach-ьте Content и Body

- ruleId: rule:components.corporate-page.no-detach-content-body
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`Content` и `Body` собраны на слотах. Не detach-ьте их. Заменяйте содержимое `Body` на свою сборку через слот и удаляйте фрейм `SwapMe`.

#### Правильно

```text
Body slot -> собственная сборка контента
SwapMe -> удалён
```

#### Неправильно

```text
Body detached, SwapMe остался внутри страницы.
```

#### Почему

Слот сохраняет системную структуру страницы и позволяет безопасно заменить контент.

### Rule 8: Настраивайте ширину контента через переменные колонок

- ruleId: rule:components.corporate-page.content-width-variables
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Для компонентов, которые занимают все 12 колонок страницы, можно использовать переменную `12 Cols` или ширину через `Auto layout` в режиме `Fill Container`. Для сложных по вёрстке блоков задавайте ширину через переменные соответствующих колонок.

#### Правильно

```text
Full-width block -> 12 Cols
Complex block -> column-specific variable
```

#### Неправильно

```text
Complex block растянут вручную без привязки к колонкам.
```

#### Почему

Переменные колонок позволяют блоку перестраиваться вместе со страницей.

### Rule 9: Используйте Gutter между элементами Section

- ruleId: rule:components.corporate-page.gutter-spacing
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используйте переменную `Gutter` как горизонтальный отступ в горизонтальных композициях. Компонент `Section` для этого не обязателен. Direction и itemSpacing внутри `Body` определяются вложенной композицией и не обязаны использовать `Gutter`.

#### Правильно

```text
Section horizontal items: Gutter
```

#### Неправильно

```text
Section horizontal items: ручное значение без переменной.
```

#### Почему

`Gutter` синхронизирует горизонтальные отступы элементов `Section` с выбранным режимом сетки.

### Rule 10: Для старых макетов переключайте Old Grid Values в Wide

- ruleId: rule:components.corporate-page.old-layout-wide
- severity: warning
- appliesTo: screen
- checkType: deterministic
- autofix: no

Большинство старых макетов со светлым боковым меню были собраны на старом `CorporatePage` и переменных `[Old] Grid Values` с режимами `Basic` и `Wide`. Для актуализации выберите макет страницы в обёртке `[D](****) Page` и переключите `[Old] Grid Values` на `Wide`.

#### Правильно

```text
[Old] Grid Values -> Wide
```

#### Неправильно

```text
Старый макет оставлен в Basic.
```

#### Почему

Актуализированный макет должен соответствовать широкой сетке.

### Rule 11: Соблюдайте размеры широкой сетки для desktop

- ruleId: rule:components.corporate-page.desktop-wide-grid-sizes
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

Для desktop используйте размеры широкой сетки: `1600-1920 px` - боковые отступы `52 px`, контент фиксированный `1248 px`; `1440-1600 px` - боковые отступы `50 px`, контент гибкий `1092-1248 px`; `1280-1439 px` - боковые отступы `30 px`, контент начинается с `972 px`; `1024-1279 px` - боковые отступы `30 px`, контент начинается с `716 px`.

#### Правильно

```text
1440 px -> side margins 50 px, content 1092-1248 px
```

#### Неправильно

```text
1440 px -> side margins 30 px
```

#### Почему

Каждый диапазон ширины имеет свой preset и свою сетку.

### Rule 12: Соблюдайте размеры сетки для tablet и mobile adaptive

- ruleId: rule:components.corporate-page.tablet-mobile-grid-sizes
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

Для `768-1023 px` используйте боковые отступы `32 px`, контент начинается с `704 px`. Для `320-767 px` используйте боковые отступы `20 px`, ширина контента гибкая. Базовый экран мобильного адаптива - `375 x 812 px`, ширина контента - `335 px`.

#### Правильно

```text
768 px -> side margins 32 px, content starts from 704 px
375 px -> side margins 20 px, content 335 px
```

#### Неправильно

```text
375 px -> desktop side margins 30 px
```

#### Почему

Tablet и mobile adaptive используют отдельные значения отступов и ширины контента.

### Rule 13: Не используй переходный CorporateContent

- ruleId: rule:components.corporate-page.transition-corporate-content-prohibited
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`🔄 [T] CorporateContent` не допускается в рабочих макетах. Для desktop используй `[D] CorporateContent`, для mobile-web — `[M] CorporateContent`.

### Rule 14: Используй CorporateContent как обязательную область страницы

- ruleId: rule:components.corporate-page.corporate-content-required-on-page
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: no

На продуктовой странице используется один соответствующий платформе `CorporateContent`. В Figma он может использоваться самостоятельно: родительского компонента `CorporatePage` нет. Во фронтовой сборке `CorporateContent` размещается внутри `CorporatePage`.

### Rule 15: Управляй фоном CorporateContent через BackgroundPlate Color

- ruleId: rule:components.corporate-page.corporate-content-background-mode
- severity: error
- appliesTo: component.root.fill
- checkType: deterministic
- autofix: no

Цвет фона всего фрейма `CorporateContent` определяется выбором mode коллекции `BackgroundPlate Color`. Не меняй fill вручную.

### Rule 16: Не меняй grid style CorporateContent

- ruleId: rule:components.corporate-page.corporate-content-grid-style-protected
- severity: error
- appliesTo: component.root.grid
- checkType: deterministic
- autofix: no

Grid style корня `CorporateContent` является системным и не меняется вручную.

### Rule 17: Управляй отступами через Grid & Cols

- ruleId: rule:components.corporate-page.corporate-content-spacing-mode
- severity: error
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Отступы `CorporateContent` регулируются выбором mode коллекции `[D] Grid & Cols` или `[M] Grid & Cols`. Ручное изменение padding запрещено. Для `[M] CorporateContent` обязательны `TopMargin=24` и `BottomMargin=24`.

### Rule 18: Разрешай произвольную композицию в Body

- ruleId: rule:components.corporate-page.corporate-content-body-arbitrary-composition
- severity: info
- appliesTo: component.composition
- checkType: llm
- autofix: no

В `Body` можно размещать любой контент или композицию, включая несколько дочерних элементов. Не считай их количество или тип нарушением сами по себе; проверяй дочерние элементы по собственным компонентным контрактам и паттернам.

### Rule 19: Используй только page modes для фона CorporateContent

- ruleId: rule:components.corporate-page.corporate-content-page-background-modes
- severity: error
- appliesTo: component.root.fill
- checkType: deterministic
- autofix: no

Для `CorporateContent` разрешены `base-bg-alt (grey)` и `base-bg (white)`. Modes `modal-bg-alt (grey)` и `modal-bg (white)` запрещены.

### Rule 20: Используй Fill по ширине и Hug по высоте

- ruleId: rule:components.corporate-page.corporate-content-fill-hug-sizing
- severity: error
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Корень `CorporateContent` использует `Fill container` по ширине и `Hug contents` по высоте.

### Rule 21: Не меняй визуальные параметры корня вручную

- ruleId: rule:components.corporate-page.corporate-content-root-overrides-prohibited
- severity: error
- appliesTo: component.root
- checkType: deterministic
- autofix: no

У корня `CorporateContent` нельзя вручную менять radius, stroke, effects, opacity и clips content.

### Rule 22: Используй desktop CorporateContent на ширине 768

- ruleId: rule:components.corporate-page.corporate-content-platform-breakpoint
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

На ширине `768` используется `[D] CorporateContent` с mode `768` коллекции `[D] Grid & Cols`. `[M] CorporateContent` применяется ниже `768`.

### Rule 23: Не делай корень CorporateContent кликабельным

- ruleId: rule:components.corporate-page.corporate-content-root-clickability-prohibited
- severity: error
- appliesTo: component.root
- checkType: deterministic
- autofix: no

Весь `CorporateContent` не может быть единой кликабельной поверхностью. Интерактивность размещается во вложенном контенте.

### Rule 24: Не detach-ь CorporateContent и Body

- ruleId: rule:components.corporate-page.corporate-content-detach-prohibited
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`CorporateContent` и слот `Body` нельзя detach-ить. Контент заменяется через слот без разрушения компонентной структуры.

### Rule 25: Не вкладывай CorporateContent друг в друга

- ruleId: rule:components.corporate-page.corporate-content-nesting-prohibited
- severity: error
- appliesTo: component.composition
- checkType: deterministic
- autofix: no

`CorporateContent` нельзя вкладывать внутрь другого `CorporateContent`. На продуктовой странице используется одна корневая контентная область.

### Rule 26: Удаляй SwapMe после добавления контента

- ruleId: rule:components.corporate-page.corporate-content-swapme-replaced
- severity: error
- appliesTo: component.composition
- checkType: deterministic
- autofix: yes

После добавления реального содержимого в `Body` placeholder `SwapMe` должен быть удалён или заменён.

### Rule 27: Не меняй layout корня CorporateContent

- ruleId: rule:components.corporate-page.corporate-content-root-layout-protected
- severity: error
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Корень `CorporateContent` использует вертикальный auto layout и `itemSpacing=0`.

### Rule 28: Оставляй clipsContent выключенным

- ruleId: rule:components.corporate-page.corporate-content-clips-disabled
- severity: error
- appliesTo: component.root
- checkType: deterministic
- autofix: no

У корня `CorporateContent` значение `clipsContent` должно быть `false`.

### Rule 29: Управляй порядком Isle через Position

- ruleId: rule:components.corporate-page.section-position-tablet-order
- severity: error
- appliesTo: component.composition
- checkType: deterministic
- autofix: no

На всех разрешениях `Position=true` размещает `Isle` ниже `Content`, а `Position=false` — выше `Content`.

### Rule 30: Не переключай TabletIsle вручную

- ruleId: rule:components.corporate-page.section-tablet-isle-auto
- severity: error
- appliesTo: component.variant
- checkType: deterministic
- autofix: no

Параметр `👽 TabletIsle` автоматически становится `true` в modes 1024 и 768. Дизайнер не должен переключать его вручную.

### Rule 31: Не меняй layout корня Section

- ruleId: rule:components.corporate-page.section-root-layout-protected
- severity: error
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Корень `[D] Section` использует `Fill container` по ширине и `Hug contents` по высоте. Direction и alignment определяются компонентом и текущим mode и не меняются вручную.

### Rule 32: Наполняй Section через slots без instance swap

- ruleId: rule:components.corporate-page.section-slot-content-policy
- severity: error
- appliesTo: component.composition
- checkType: llm
- autofix: no

В слоты `Content` и `Isle` можно помещать любой контент или композицию. Используй slot content replacement; instance swap вложенных компонентов `Section` запрещён.

### Rule 33: Используй Gutter между Content и Isle

- ruleId: rule:components.corporate-page.section-gutter-required
- severity: error
- appliesTo: component.root.layout
- checkType: deterministic
- autofix: no

Отступ между `Content` и `Isle` всегда задаётся переменной `Gutter`. Ручное значение itemSpacing запрещено.

### Rule 34: Задавай ширину слотов через переменные колонок

- ruleId: rule:components.corporate-page.section-column-widths-variable-only
- severity: error
- appliesTo: component.layout
- checkType: deterministic
- autofix: no

Ширина `Content` и `Isle` определяется переменными колонок `Grid & Cols`. Ручное изменение ширины запрещено.

### Rule 35: Удаляй SwapMe в обоих слотах Section

- ruleId: rule:components.corporate-page.section-placeholders-replaced
- severity: error
- appliesTo: component.composition
- checkType: deterministic
- autofix: yes

После наполнения `Section` placeholders `SwapMe` должны быть удалены или заменены отдельно в слотах `Content` и `Isle`.

### Rule 36: Не detach-ь и не стилизуй Section вручную

- ruleId: rule:components.corporate-page.section-detach-and-style-overrides-prohibited
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

`Section`, `Content` и `Isle` нельзя detach-ить или вручную менять их fill, stroke, radius, opacity и effects.

## Section 7: Шаблоны

### Новый макет страницы

```text
Create page frame using CorporatePage assembly
Appearance -> [D] Grid & Cols -> нужное разрешение
Add [D] CorporateContent
Body slot -> собственная сборка контента
Delete SwapMe
Spacing between blocks -> Gutter
```

### Старый макет

```text
Select [D](****) Page
Appearance -> [Old] Grid Values -> Wide
Clean Body
Add content through slot
Set widths through Fill Container or column variables
```

### Desktop grid sizes

```text
1600-1920 px -> side margins 52 px, content 1248 px fixed
1440-1600 px -> side margins 50 px, content 1092-1248 px
1280-1439 px -> side margins 30 px, content starts from 972 px
1024-1279 px -> side margins 30 px, content starts from 716 px
```

### Tablet and mobile adaptive

```text
768-1023 px -> side margins 32 px, content starts from 704 px
320-767 px -> side margins 20 px, flexible content
375 x 812 px -> content 335 px
```

### Component structure

```text
CorporatePage assembly
CorporateAppHeaderNew
CorporateContent
Body slot
```

## Section 8: Примеры

### Пример 1: Новая базовая страница

```text
CorporatePage assembly 1600 x 900 px
Max content width 1248 px
Grid mode: Shift + G
```

Страница соответствует актуальной широкой сетке.

### Пример 2: Переключение разрешения

```text
Appearance
[D] Grid & Cols: 1280
```

Размер меняется через variable mode, а не вручную.

### Пример 3: Замена Body

```text
Body slot -> page content
SwapMe -> deleted
```

Контент заменён через слот без detach системного компонента.

### Пример 4: Полноширинный блок

```text
Block width: 12 Cols
Auto layout: Fill Container
```

Блок занимает все 12 колонок и перестраивается вместе со страницей.

### Пример 5: Актуализация старого макета

```text
[Old] Grid Values: Wide
Body cleaned
Content added through slot
```

Старый макет переведён на широкую сетку.

## Section 9: Антипримеры

### Антипример 1: Старый базовый размер для нового макета

```text
New page: 1440 x 860 px
```

Новая базовая страница должна начинаться с `1600 x 900 px`.

### Антипример 2: Detached SideMenu

```text
[D] SideMenu -> Detach instance
```

`SideMenu` нельзя detach-ить.

### Антипример 3: Detached Body

```text
Body -> Detach instance
SwapMe remains inside
```

`Body` нужно заменять через слот, а `SwapMe` удалять.

### Антипример 4: Ручная ширина сложного блока

```text
Complex block width: manual 873 px
```

Ширину сложных блоков задавайте через переменные соответствующих колонок.

### Антипример 5: Старый Basic grid

```text
[Old] Grid Values: Basic
```

Для актуализации старого макета используйте `Wide`.

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять наличие сборки страницы с `CorporateAppHeaderNew` и платформенным `CorporateContent`.
- Не требовать отдельный Figma-компонент `CorporatePage`.
- Проверять базовый размер `1600 x 900 px` и максимальную ширину контента `1248 px`.
- Проверять, что размер страницы переключается через `[D] Grid & Cols`.
- Проверять, что `[D] SideMenu`, `[D] Header`, `Content` и `Body` не detached.
- Проверять, что `SwapMe` удалён после замены контента.
- Проверять `Gutter` как горизонтальный отступ в горизонтальных композициях; не требовать обязательный `Section`.
- Проверять значения боковых отступов и ширины контента для ключевых диапазонов.
- Проверять, что старый макет переключён в `[Old] Grid Values -> Wide`.
- Проверять, что на продуктовой странице используется один платформенный `CorporateContent`; не требовать родительский инстанс `CorporatePage` в Figma.
- Запрещать `🔄 [T] CorporateContent`.
- Проверять, что fill корня управляется mode коллекции `BackgroundPlate Color`, а не ручной заливкой.
- Проверять неизменность grid style корня `CorporateContent`.
- Проверять, что padding управляется mode коллекции `Grid & Cols`.
- Проверять `TopMargin=24` и `BottomMargin=24` у `[M] CorporateContent`.
- Не ограничивать количество и тип дочерних элементов в `Body` без отдельного правила их собственных компонентов.
- Не требовать `Gutter` для direction или itemSpacing внутри `Body`.
- Запрещать `modal-bg-*` для `CorporateContent`.
- Проверять `Fill container` по ширине и `Hug contents` по высоте.
- Проверять отсутствие ручных radius, stroke, effects, opacity и clips content у корня.
- Проверять `[D] CorporateContent` и mode `768` на ширине `768`.
- Проверять отсутствие кликабельности корня.
- Проверять, что `CorporateContent` и `Body` не detached.
- Проверять отсутствие вложенного `CorporateContent`.
- Проверять, что `SwapMe` удалён после добавления реального контента.
- Проверять вертикальное направление и `itemSpacing=0` корня.
- Проверять `clipsContent=false`.
- Проверять порядок `Content` и `Isle` по значению `Position` на всех разрешениях.
- Проверять автоматическое `👽 TabletIsle=true` в modes 1024 и 768.
- Проверять `Fill/Hug` и отсутствие ручных direction/alignment overrides у корня `Section`.
- Разрешать произвольный slot content в `Content` и `Isle`, но запрещать instance swap.
- Проверять переменную `Gutter` между `Content` и `Isle`.
- Проверять ширину слотов через переменные колонок `Grid & Cols`.
- Проверять удаление `SwapMe` в обоих слотах.
- Проверять отсутствие detach и ручных style overrides у `Section`, `Content` и `Isle`.

### Словарные проверки

- Находить `Detach`, `detached` и `Detach instance` рядом с `[D] SideMenu`, `[D] Header`, `Content` или `Body`.
- Находить `Basic` в старых grid values.
- Находить `SwapMe` в финальном содержимом страницы.
- Находить ручные значения ширины там, где ожидаются `12 Cols`, `Fill Container` или переменные колонок.

### LLM-проверки

- Проверять, что страница действительно является страницей продукта, а не локальным контентным блоком.
- Проверять, что сложные кастомные блоки не полагаются только на автоматическое перестроение.
- Проверять, что выбранный grid preset соответствует ширине макета.
- Проверять, что content-слот заменён на осмысленную сборку страницы.
- Проверять, что старый макет актуализирован без разрушения структуры page-компонента.

### Не проверяется автоматически

- Визуальная корректность сложных таблиц после перестроения.
- Полная совместимость кастомных блоков с переменными колонок.
- Фактическое поведение горячей клавиши `Shift + G` в Figma.
- Содержательная корректность пользовательского контента в `Body`.
- Актуальность внешней Storybook-документации.

### Автоисправления

- Добавить `patternType: component` и `component`, если паттерн распознан как компонентный.
- Заменить ручной full-width на `12 Cols`, если блок должен занимать все колонки.
- Заменить ручной горизонтальный отступ между элементами `Section` на `Gutter`, если доступна переменная.
- Пометить старый grid mode как `Wide`, если макет актуализируется.
- Удалить `SwapMe`, если в `Body` уже есть пользовательский контент.

```

```
