# Section — responsive Code Connect

Один parserless `.figma.ts` по структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, literal id, imports/example/metadata.
Section использует общий responsive export; отдельные SectionDesktop/SectionMobile
не существуют в публичном barrel.

| Figma | Шаблон | Публичный import |
| --- | --- | --- |
| [[D] Section — четыре варианта](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=137848-49081) | [Section.figma.ts](Section.figma.ts) | `import Section from 'arui-private/section'` |

В опубликованной Corp-библиотеке и на странице CorporateContent найден один
Section set, key `2bbced82d96c1347fea71a3922cd11cf4c25ad6a`. Отдельный Mobile
Figma set не обнаружен. Поэтому опубликована одна связь с responsive React Section;
отдельная native Mobile Figma identity или её публикация не заявлены.
[Mobile Web](../mobile-web/code-connect/README.md) использует тот же компонент.

## Свойства и содержимое

| Figma | React / поведение |
| --- | --- |
| native SLOT `Content#137848:18`, путь `Content` | `children` |
| native SLOT `Isle#137848:17`, путь `Isle` | `sidebar` |
| `Position=false` | `sidebarOrder={{ desktop: 2, tablet: 1, mobile: 1 }}` |
| `Position=true` | `sidebarOrder={{ desktop: 2, tablet: 2, mobile: 2 }}` |
| `👽 TabletIsle=false/true` | Автоматическое Figma-состояние, сохраняется в metadata. Отдельный runtime prop не создаётся. |

Position взят из действующей нормы CorporateContent:
`component:web-corp.corporate-content.section-position-tablet-order` — Isle выше
Content при false и ниже при true. TabletIsle автоматически включается в modes
768/1024; имя флага не трактуется как пользовательский toggle. На Desktop
сохраняется порядок Content → Isle. На Mobile Web применяется тот же порядок
stacked-областей, что и на tablet; это явно выбранная политика responsive-сборки,
не независимо проверенная mobile Figma-норма.

CSS исходника задаёт одну колонку до 1280 px, tablet-order от 768 px и
Desktop 8/4 колонки с gap-24 от 1280 px. Используется `sidebarOrder`,
deprecated `sidebarFirst` не выдаётся. Width/Position/TabletIsle/platform props
или собственный CSS bridge не добавляются.

Оба слота читаются через `getSlot`, а ResultSections передаются структурно,
с сохранением порядка, вложенных snippets/imports и границ Content/Isle.
Текущие masters содержат default FRAME+TEXT SwapMe: это требует реальных
`children`/`sidebar` приложения, placeholder не становится JSX лендинга.
Несколько неразрешённых областей получают независимые массивы app inputs.
Пустой Content допустим; пустой Isle не создаёт пустой sidebar fragment.
Неизвестные enum, отсутствующий SLOT и ошибки nested execution отклоняются.
Корневой responsive Section не подменяется новым компонентом или картинкой.

## Проверки

- CLI 1.4.9 обнаружил ровно один canonical template; диагностические копии
  четырёх variants и set использованы только в read-only preview.
- Все пять native previews непустые, точные variant snippets совпали с fixtures.
  Snippet set совпадает с двумя вариантами, различающимися только TabletIsle;
  его точная rendered variant identity не выводится из совпавшего кода.
- 9 групп тестов: все четыре сочетания Position/TabletIsle, native SLOT identity,
  typed template, пустые/filled/opaque/mixed/nested slots, сохранение imports,
  отрицательные enum/slot/API cases, реальный source render и CSS boundaries.
- Полученный код проверен по реальным Section source, default barrel и withTheme,
  включая все возвращённые imports. Declaration projection Section не применяется.
- Публикация и фактический MCP readback зафиксированы в
  [receipt](publication/2026-11-04.json) и
  [сниппетах](publication/2026-11-04.snippets.json).

Source 81.1.0: commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`;
точные source/config pins и provenance — [figma-context.json](figma-context.json).
Общий raw CorporateContent содержит Section; новый raw-каталог или контракт
для этой задачи не создаётся. Существующие contracts/raw/ZIP, исторические
mappings/seals и Draft/Ready не изменены.

Запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/Section.test.cjs
```

Установленный SDK 81.1.0, browser rendering, mobile Figma identity, визуальная
эквивалентность во всех modes и доступность приложения отдельно не проверены.
Исходники/сборки `arui-private`, Apollo и Proxy не изменяются этой связью.
