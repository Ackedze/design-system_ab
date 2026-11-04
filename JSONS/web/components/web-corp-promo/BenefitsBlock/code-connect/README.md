# BenefitsBlock — Code Connect

Опубликовано и проверено через Figma MCP 04.11.2026. Это технические шаблоны
React; существующий Draft-контракт, нормы и ZIP не изменены.

| Платформа | Файл | Figma component set | Публичный React export |
| --- | --- | --- | --- |
| Desktop | [BenefitBlockDesktop.figma.ts](BenefitBlockDesktop.figma.ts) | [19:29686](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=19-29686) | `BenefitBlockDesktop` из `arui-private/benefit-block` |
| Mobile Web | [BenefitBlockMobile.figma.ts](../mobile-web/code-connect/BenefitBlockMobile.figma.ts) | [19:12037](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=19-12037) | `BenefitBlockMobile` из `arui-private/benefit-block` |

Figma использует имя **BenefitsBlock**, React — **BenefitBlock**. Два
parserless `.figma.ts` следуют структуре Core PR #2280: URL/source/component,
`figma.selectedInstance`, `figma.code`, default export с id/imports/example/metadata.
Вложенные ContentPresets и ButtonGroup не имеют самостоятельных public exports;
их данные переводятся в props родителя. Отдельные связи для них не опубликованы.

Исходники зафиксированы на `arui-private` **81.1.0**, commit
`4bf38e2be8589da705f991b4dcac0d41975dff3d`. Использован существующий frozen source
snapshot; рабочие изменения `arui-private` не включены в эту проверку.

## Соответствие

| Figma | React |
| --- | --- |
| TitleView / MainContent / Heading / Title | `title`; только строка |
| D Image Left/Right, M Image Top/Bottom | `imagePositionDesktop`, `imagePositionMobile` |
| ImageView | обязательный `image` типа `Props['image']` из контекста приложения |
| D Compact | `compact`; mobile этого свойства не получает |
| D HeightCustom=True | обязательный числовой `heightCustom` из контекста приложения |
| HeightCustom=False | prop не передаётся; mobile не получает высоту |
| Background | `withBackground` |
| Presets=False | subtitle/listItems/stepsItems не передаются |
| ContentPresets Text | `preset="text"`, видимый текст в `subtitle` |
| ContentPresets List | `preset="list"`, упорядоченные видимые `listItems: {title}[]` |
| ContentPresets Steps | `preset="steps"`, упорядоченные `stepsItems: {title, subtitle?}[]` |
| ButtonGroup | `primaryButtonProps` / `secondaryButtonProps`; подписи читаются динамически |
| Button DisabledState, LeftAddon/RightAddon | `props.disabled`, типизированные addons из контекста приложения |
| BackgroundPlate outer Primary/Colored | `backgroundPlateProps`, реальные enum из `arui-private/background-plate` |

Повторяющиеся слои List, Steps и Button выбираются через scoped `findLayers`.
Поиск из root использует полные пути и `traverseInstances: true`. Native preview
подтвердил три видимых пункта List при двух скрытых и все пять видимых шагов;
количество и порядок не фиксируются в шаблоне. Более трёх шагов сохраняются с warning.
Secondary-only поддерживается исходником BenefitBlock и проверен отдельно.

## Контекст приложения и ограничения

- Изображение обязательно. Выбирается соответствующий реальный ассет из Corp Image
  Library; template metadata сохраняет Size/Crop/Segment. JSX, URL и SVG не выдумываются.
  Конкретный ассет и его оформление требуют отдельного readback/проверки при сборке.
- CTA получает обязательный `onClick: MouseEventHandler<HTMLButtonElement>` и,
  при наличии флага, соответствующие addons. Действия и href из Figma не выводятся.
  Текущий рецепт создаёт кнопки; отдельный link-рецепт не заявлен.
- HeightCustom — флаг Figma, а React принимает число. При True приложение должно
  передать согласованную высоту в px; значение из названия варианта не угадывается.
- Для Colored требуется явный `coloredViewValue`, согласованный с token-bound
  fill и Segment. Шаблон сам не доказывает происхождение цветового значения.
- `BackgroundPlateProps.children` обязателен в публичном типе. Рецепт передаёт
  `children: null` внутри `backgroundPlateProps`: исходник BenefitBlock после
  spread подставляет собственный `{content}`. Это проверено по AST исходника;
  настоящий контент не заменяется null и не дублируется.
- TitleAddon/TitleStatus/RightAddon, Subtitle и Skeleton внутри TitleView
  отклоняются: API BenefitBlock принимает только строковый title. В частности,
  разрешённый нормой TitleAddon=StatusBadge пока не представим этим API.
- List с Caption, нестандартным marker; Steps с интерактивным/статусным
  индикатором или дополнительными PureCell-областями; Button с Hint, SingleIcon,
  скрытым Label либо неподдерживаемыми Shape/Size дают явную ошибку.
- У поверхности поддержаны norm-admitted outer Primary/Colored и два публичных
  backgroundColor. Другие уровни/типы/значения требуют отдельной проверки.

## Проверки и сохранённые данные

- CLI 1.4.9: parse, validation и upload двух канонических файлов PASS.
- До публикации: 20/20 root native previews с точным телом шаблонов; 12/12
  дополнительных native previews ContentPresets/ButtonGroup с адаптацией
  selected root и внешнего Example. Эти 12 probes не публиковались.
- После публикации: непустой собственный snippet и `hasTemplate=true` для 16 D
  и 4 M вариантов; запросы обоих component set также вернули шаблоны.
- 11 тестов PASS, 180 synthetic preset/CTA combinations; negative cases,
  escaping, обязательные пути, скрытые области, отсутствие выдуманных props.
- Все 32 preview examples и 22 MCP readbacks со всеми импортами прошли strict
  source API type projection. Использованы реальные forwardRef props/barrels,
  включая унаследованные MCP imports BackgroundPlate и TitleView; без any/casts.
- Это **source API** проверка. Установленный SDK 81.1.0, browser rendering и
  полная визуальная эквивалентность в этом выпуске не проверялись.

[Frozen Figma fixture](figma-context.json), [тесты](BenefitBlock.test.cjs),
[проверка исходного API](check-source-api.cjs),
[receipt с pins](publication/2026-11-04.json),
[фактические MCP snippets/imports](publication/2026-11-04.snippets.json).

Локальный запуск из папки компонента, без установки зависимостей:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/BenefitBlock.test.cjs
```

`figma.config.json` включает ровно два канонических файла. Токен хранится отдельно
в private env-файле и отсутствует в component folder и Git.
