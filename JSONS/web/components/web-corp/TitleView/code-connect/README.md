# TitleView — Code Connect

Опубликовано и проверено через Figma MCP 04.11.2026. Два parserless `.figma.ts`
следуют структуре Core: URL/source/component, `figma.selectedInstance`,
`figma.code`, default export с id/imports/example/metadata.

| Платформа | Файл | Figma set | Публичный export |
| --- | --- | --- | --- |
| Desktop | [TitleViewDesktop.figma.ts](TitleViewDesktop.figma.ts) | [37705:55347](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=37705-55347) | `TitleViewDesktop` из `arui-private/title-view/desktop` |
| Mobile Web | [TitleViewMobile.figma.ts](../mobile-web/code-connect/TitleViewMobile.figma.ts) | [37705:55896](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=37705-55896) | `TitleViewMobile` из `arui-private/title-view/mobile` |

`[M] TitleView` — адаптивная версия Desktop. Отдельный `[M] TitleViewMobile` и
`arui-private/title-view-mobile` имеют другой API с `header`; они в этом выпуске
не изменены. Source API проверен по commit
`4bf38e2be8589da705f991b4dcac0d41975dff3d`, версия 81.1.0.

## Соответствие

| Figma | React |
| --- | --- |
| xLarge / Large / Medium / Small | `view={VIEWS.XLARGE/LARGE/MEDIUM/SMALL}` |
| Title | `children`, фактический текст из MainContent/Heading/Title |
| Subtitle | `subtitle`; скрытая область не передаётся |
| Skeleton | `showSkeleton`; underlying данные задаёт приложение |
| M `2 line` | `rowLimit={2}` / `{1}` |
| Status / StatusPreset | `statusProps`: label, color, contrast/muted, uppercase; source задаёт size 24 и rounded |
| Holding | `filterCompanySelectProps`, реальные options/selected/onChange приложения |
| Button group | `buttonsGroup`, полный упорядоченный ReactElement[]; настройки overflow в `maxVisibleButtons` / `pickerButtonProps` |
| TitleStatus | `titleStatusProps`: Type → TitleStatusType, Title и optional Caption |
| TitleAddon / RightAddon | типизированный ReactNode, соответствующий выбранному вложенному preset/swap |

Root TitleAddon/RightAddon — BOOLEAN, не native SLOT. Шаблон не вызывает для них
getSlot и не придумывает одноимённые runtime exports. Вложенные Figma-only presets
потребляются через публичные props родителя.

`VIEW_DATA` исходника допускает Status, Holding, Button group и TitleStatus только
в xLarge. Сохранённые скрытые BOOLEAN-флаги других размеров не создают props.
Subtitle/TitleAddon/RightAddon доступны во всех размерах; showSkeleton скрывает
оба addon согласно реализации. При различающихся видимых Type верхнего Status
и TitleStatus значения сохраняются с warning о необходимости сверки с нормой.

StatusPreset Type переводится в Core color:
Approved → green, Attention → orange, Error / Risk → red, Action → blue,
Processing → purple, Neutral → grey. [Native color evidence](status-color-evidence.json)
содержит проверенные заливки и token IDs шести Contrast/24 вариантов. Core COLORS
и TitleStatus CSS/enum также проверены. TitleStatus использует соответственно
POSITIVE/WARNING/ERROR/ACTION/PROCESS/INFO из публичного TitleStatusType.

## Контекст приложения

- `tag` обязателен: семантический уровень h1/h2/... не выводится из размера View.
- В Skeleton master вместо текстовых областей находятся Skeleton instances.
  Реальные title/subtitle/statusProps/titleStatusProps при включённых областях
  передаются приложением. Тексты из другого master не подставляются.
- Holding требует реальные компании, выбранное значение и обработчик. Сам набор
  данных и действие селекта не выводятся из демонстрационного названия компании.
- ButtonsGroup получает полный список действий, включая скрытые в overflow.
  Desktop показывает три labels, mobile — один в проверенном default. Dots-контрол
  — представление overflow, а не дополнительное бизнес-действие. Видимые labels
  сохранены в metadata; они не доказывают полный состав скрытых действий.
- Действия должны использовать реальные DS-компоненты и public API; размеры
  Figma Button: D 56, M 48. Hint/addons и обработчики требуется воспроизвести
  допустимой композицией выбранного Core Button. Шаблон не придумывает callbacks,
  href, отсутствующие props или дополнительные действия.
- Addons и произвольные instance swaps требуют реального ReactNode выбранной
  композиции. Сам факт BOOLEAN=True не задаёт её SVG, данные, href или действие.

Это source API mapping. Установленный SDK 81.1.0, browser rendering, полная
визуальная эквивалентность, editable-сценарий и поведение overflow в браузере
здесь не проверялись. Оpaque app context должен соответствовать реальному Figma
instance и сценарию приложения. Авторинг правил, Draft/Ready, contracts/ZIP и
чужая работа в pilot/ не изменены.

## Проверки

- CLI 1.4.9: parse, normal validation и upload двух canonical templates PASS.
- Native preview: 16/16 root variants и 12/12 адаптированных TitleStatus probes.
  Последние проверяют шесть Type для обеих платформ и отдельно не публиковались.
- MCP после публикации: 16/16 вариантов и 2/2 запроса set, собственный непустой
  snippet, правильные Desktop/Mobile imports и source pin. Временная ошибка одного
  MCP запроса устранена повторным чтением, повторная публикация не требовалась.
- 8 тестов PASS; 256 Boolean combinations, размеры/Skeleton, видимость слотов,
  шесть TitleStatus Type, escaping и отрицательные public API cases.
- Все 28 native preview snippets и 18 фактических MCP snippets со всеми imports
  прошли strict source API projection на реальных forwardRef props/barrels/types.

[Финальный receipt](publication/2026-11-04.json),
[опубликованные MCP snippets/imports](publication/2026-11-04.snippets.json),
[тесты](TitleView.test.cjs), [source API checker](check-source-api.cjs).
Существующий raw `structure`/`variantStructures` остаётся источником Apollo;
[контекст Code Connect](figma-context.json) хранит provenance и проверенные API
идентичности/состояния, не вводит nativeAuditFactsV1 или новый формат каталогов.

Локальный запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/TitleView.test.cjs
```
