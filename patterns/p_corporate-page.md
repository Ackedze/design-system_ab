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
- updatedAt: 2026-07-04
- sourceType: component-guideline
- tags: corporate-page, corporateappheadernew, content, page-template, wide-grid, grid-and-cols, body-slot, page-layout, adaptive
- figmaLink: https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=47124-72335
- relatedPatterns:
  - ptrn:components.corporate-app-navigation
  - ptrn:layout.adaptive-alfa-business
- sections: 10

## Section 1: Определение

`CorporatePage` - целевой компонент страницы продукта в Альфа-Бизнесе. Внутри сборки находятся навигация `CorporateAppHeaderNew` и содержимое страницы `CorporateContent` / `Content`.

Компонент задаёт базовую структуру страницы, широкую сетку, слоты для контента и поведение при переключении ключевых разрешений экрана.

## Section 2: Когда использовать

Используйте `CorporatePage`, когда нужно:

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

1. Для новых макетов используется последняя сборка компонента `CorporatePage`.
2. Базовая страница Альфа-Бизнеса - `1600 x 900 px`, максимальная ширина контента - `1248 px`.
3. С Q3 2025 в продуктах Альфа-Бизнеса используется только широкая сетка.
4. Правильно собранный экран на переменных автоматически перестраивается на другие разрешения.
5. Таблицы и сложные кастомные блоки могут требовать ручной доработки после перестроения.
6. `[D] SideMenu` и `[D] Header` нельзя detach-ить.
7. `Content` и `Body` собраны на слотах, их тоже нельзя detach-ить.
8. Отступ между блоками задаётся переменной `Gutter`.

## Section 5: Структура текста

В описании страницы фиксируйте:

- используемый preset `CorporatePage`;
- режим сетки `[D] Grid & Cols` или `[Old] Grid Values`;
- разрешение экрана;
- ширину контента;
- боковые отступы;
- способ замены содержимого `Body`;
- переменные ширины для блоков, которые занимают 12 колонок или конкретные колонки.

Для новых макетов используйте названия переменных и компонентов так же, как в Figma: `[D] CorporatePage`, `[D] Grid & Cols`, `[D] SideMenu`, `[D] Header`, `Content`, `Body`, `SwapMe`, `Gutter`.

## Section 6: Правила

### Rule 1: Используйте CorporatePage как целевой компонент страницы

- ruleId: rule:components.corporate-page.use-target-page-component
- severity: error
- appliesTo: component
- checkType: llm
- autofix: no

Для страницы продукта в Альфа-Бизнесе используйте актуальный `CorporatePage`, внутри которого находятся `CorporateAppHeaderNew` и `Content`.

#### Правильно

```text
CorporatePage
CorporateAppHeaderNew
Content
```

#### Неправильно

```text
Страница собрана вручную из шапки, бокового меню и фрейма контента.
```

#### Почему

`CorporatePage` задаёт системную page-сборку, сетку, слоты и адаптивное поведение.

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

### Rule 4: Включайте режим сетки через Shift + G

- ruleId: rule:components.corporate-page.grid-mode-hotkey
- severity: recommendation
- appliesTo: screen
- checkType: manual
- autofix: no

Горячие клавиши `Shift + G` включают отображение сетки с 12 колонками. Для каждого ключевого размера экрана есть свой preset страницы и отдельная сетка.

#### Правильно

```text
Shift + G -> 12-column grid visible
```

#### Неправильно

```text
Сетка проверяется вручную без включения grid mode.
```

#### Почему

Включённая сетка помогает проверить привязку контента к колонкам.

### Rule 5: Переключайте размер страницы через D Grid & Cols

- ruleId: rule:components.corporate-page.grid-and-cols-variable
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Фрейм `[D] CorporatePage` собран на переменных `[D] Grid & Cols`. Меняйте размер страницы через блок `Appearance`, переключая `[D] Grid & Cols` на `1600`, `1440`, `1280` или `1024`.

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

### Rule 9: Используйте Gutter для отступов между блоками

- ruleId: rule:components.corporate-page.gutter-spacing
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используйте переменную `Gutter` как значение отступа между блоками.

#### Правильно

```text
Spacing between blocks: Gutter
```

#### Неправильно

```text
Spacing between blocks: ручное значение без переменной.
```

#### Почему

`Gutter` синхронизирует отступы с выбранным режимом сетки.

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

## Section 7: Шаблоны

### Новый макет страницы

```text
Copy [D] CorporatePage
Appearance -> [D] Grid & Cols -> нужное разрешение
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
CorporatePage
CorporateAppHeaderNew
Content
Body slot
```

## Section 8: Примеры

### Пример 1: Новая базовая страница

```text
CorporatePage 1600 x 900 px
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

- Проверять наличие `patternType: component` и `component: CorporatePage, CorporateAppHeaderNew, Content`.
- Проверять, что новый макет использует `CorporatePage`.
- Проверять базовый размер `1600 x 900 px` и максимальную ширину контента `1248 px`.
- Проверять, что размер страницы переключается через `[D] Grid & Cols`.
- Проверять, что `[D] SideMenu`, `[D] Header`, `Content` и `Body` не detached.
- Проверять, что `SwapMe` удалён после замены контента.
- Проверять, что отступы между блоками используют `Gutter`.
- Проверять значения боковых отступов и ширины контента для ключевых диапазонов.
- Проверять, что старый макет переключён в `[Old] Grid Values -> Wide`.

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
- Заменить ручной отступ между блоками на `Gutter`, если доступна переменная.
- Пометить старый grid mode как `Wide`, если макет актуализируется.
- Удалить `SwapMe`, если в `Body` уже есть пользовательский контент.
