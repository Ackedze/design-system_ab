# Divider — Code Connect

Один универсальный parserless `.figma.ts` по структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, literal id, imports/example/metadata.

| Платформы | Figma component set | Шаблон | Публичный import |
| --- | --- | --- | --- |
| Desktop, Mobile Web | [Divider, default/light](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=142493-164121) | [Divider.figma.ts](Divider.figma.ts) | `import { Divider } from 'arui-private/divider'` |

Native set key `b831bd9a4f890b5928fd0fedc3cc3750c7459403` и существующий контракт
описывают универсальное семейство. React export также общий для платформ;
отдельные DividerDesktop/DividerMobile и дублирующие templates не создаются.
[Mobile Web использует тот же файл](../mobile-web/code-connect/README.md).

## Presets и CSS

Публичный DividerProps содержит только `className` и `dataTestId`.
Компонент рисует семантический `<hr>` с border-bottom 1px, margin gap-0;
ширину и внешние отступы задаёт композиция приложения.

| Presets | Код и контекст |
| --- | --- |
| `default` | `<Divider />`, библиотечный `--divider-color: var(--color-light-neutral-translucent-300)` |
| `light` | `<Divider className={lightClassName} />`; приложение подключает CSS-рецепт с `--color-light-neutral-translucent-200` |

[Divider.example.css](Divider.example.css) содержит готовый рецепт `.dividerLight`.
Его нужно перенести в stylesheet приложения и передать соответствующий реальный
класс как `lightClassName`. Пустой класс отклоняется. Шаблон не импортирует
вымышленный stylesheet приложения и не добавляет в Divider props preset/view/color.
Light snippet содержит тот же CSS-рецепт комментарием.

Цвета сверены с native paint и точной цепочкой CSS imports:
`core-components/vars/bundle/corp.css` → `core-components-vars/bundle/corp.css` →
`colors-bluetint.css`. Captured native default — rgba(15,25,55,0.1),
light — rgba(30,43,68,0.08); им соответствуют токены 300 и 200.
Это проверка текущего light-контекста. Другие variable modes и переопределения
темы требуют отдельной сверки класса/токена; автоматическая dark-эквивалентность
не заявлена. Имена переменных получены из реальной palette, а не из имени пресета.

## Проверки

- CLI 1.4.9: ровно один canonical template; обычные validation/upload.
- Native read-only preview обоих вариантов и set: три непустых snippets,
  совпадение с fixture и source API types.
- 6 групп тестов: exhaustive Presets, строгая типизация `.figma.ts`, обязательный
  CSS-контекст light, отрицательные props/exports, реальный source render `<hr>`,
  palette RGBA/import chain и точность native/published snippets со всеми imports.
- После публикации проверены два собственных непустых MCP snippets и set query.
  Component set разворачивается в варианты; собственный snippet COMPONENT_SET
  не заявлен. Диагностические preview copies не публикуются.

[Фактические readbacks](publication/2026-11-04.snippets.json),
[receipt](publication/2026-11-04.json), [тесты](Divider.test.cjs).
Source API 81.1.0, commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
Проверены реальные source/barrel и существующие dependencies; declaration
projection Divider не применяется. [Fixture и provenance](figma-context.json).

Запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/Divider.test.cjs
```

Установленный SDK 81.1.0, browser rendering и реальное подключение CSS-класса
в приложении отдельно не проверены. Contracts/raw/ZIP, прежние mappings/seals,
Draft/Ready, `arui-private`, Apollo и Proxy source/build не изменены.
