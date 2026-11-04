# PromoTableView — Code Connect

Два parserless `.figma.ts` по структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, literal id, imports/example/metadata.
Оба опубликованы и проверены через Figma MCP 04.11.2026.

| Платформа | Файл | Figma component set | Публичный import |
| --- | --- | --- | --- |
| Desktop | [PromoTableViewDesktop.figma.ts](PromoTableViewDesktop.figma.ts) | [4:9112](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=4-9112) | `PromoTableViewDesktop` из `arui-private/promo-table-view` |
| Mobile Web | [PromoTableViewMobile.figma.ts](../mobile-web/code-connect/PromoTableViewMobile.figma.ts) | [4:9149](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=4-9149) | `PromoTableViewMobile` из `arui-private/promo-table-view` |

В каждом set четыре сочетания Axis Horizontal/Vertical и Style preset White/Gray.
Source API 81.1.0 проверен на commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
Оба exports — обычные arrow functions с `PromoTableViewProps`; вложенные типы
выводятся через `ComponentProps`, внутренние HeaderCell/BodyCell не импортируются.
Frozen native context содержит provenance; raw structure/variantStructures Apollo
и существующие contracts/mappings/seals не изменены, Draft/Ready не повышены.

## Данные таблицы и контекст приложения

Axis задаёт `orientation`. Для Vertical направление карточек — row на Desktop,
column на Mobile; это отдельный `direction`, не переименование Axis. Считываются
только видимые строки и ячейки в исходном порядке. У текущих masters видимы
три строки, четыре логических заголовка, FirstCell, три BodyCell и LastCell.

- `headerCells` общий для всей таблицы. Заголовки Vertical-карточек должны совпадать;
  учитывается сдвиг на один при FirstCell. Несовпадение и неправильная размерность
  отклоняются до выдачи кода: source обращается к заголовкам без защиты от отсутствия.
- `rows`, `firstCells`, `lastCells` сохраняют позиционную связь. Необязательные
  first/last entries записываются по индексу строки, без сжатия разреженного массива.
- BodyCell поддерживает `text-content`, `status`, `status-badge`, `slot`;
  FirstCell — text-content или slot. Accent Title становится `boldTitle`.
  Видимые цены остаются строками; amount/currency props не выдумываются.
- Приложение передаёт устойчивые непустые IDs заголовков, строк и ячеек;
  проверяется уникальность в соответствующей области, native node IDs не подставляются.
- Приложение задаёт реальные CTA callbacks, ReactNode для SwapMe и активных addons,
  а также дополнительные StatusBadge props, если нужны. Фиктивные обработчики и
  предположительные icon imports не создаются. SwapMe является instance preset,
  не native SLOT. Его содержимое требует реального компонента приложения.
- `backgroundPlateBorder` — явный контекст для общего фонового бордера.
  Визуальное состояние Figma не превращается в неподтверждённый runtime prop.

Поиск выполняется из handle конкретной строки с `traverseInstances:false`.
Только подтверждённые spacer components разворачиваются рекурсивно; их содержимое
не отбрасывается. Собственные TEXT Header/TextCell читаются без вложенных addon
instances; фиксированный порядок Title/Subtitle проверен native probes. Ручное
скрытие, нарушающее число text roles, явно отклоняется. Mobile Horizontal HeadRow
использует подтверждённый `[D] FirstHeadCell` 4:9024; допускается эта identity,
принадлежность остальных cell families остаётся платформенной.

## Ограничения исходника

Source использует Primary BackgroundPlate, Outer, фиксированный platform context
base-bg-alt Desktop / base-bg Mobile. Gray Desktop и White Mobile, нестандартные
row surfaces и отключённая Header background не выражаются публичным API:
snippet содержит `TABLE_STYLE_SOURCE_GAP`, `ROW_SURFACE_SOURCE_GAP` или
`HEADER_BACKGROUND_SOURCE_GAP`. Skeleton отклоняется. Передача выдуманного
stylePreset/backgroundColor prop не используется; полная визуальная эквивалентность
таких состояний не подтверждена.

LastCell требует Primary: source безусловно обращается к primaryButtonProps.
Secondary-only отклоняется, пустая Primary не создаётся. Обе CTA жёстко используют
size=48 и свою роль primary/secondary. Disabled, Hint, SingleIcon, другой Shape,
скрытый Label и addons не представлены в LastCell API и требуют отдельного решения.
Неизвестные enum значения или чужая cell family также отклоняются.

## Проверки и воспроизведение

- CLI 1.4.9: ровно два canonical templates, обычные validation/upload PASS.
- Native preview: восемь root variants и два set previews; все десять component
  snippets совпали с fixtures и прошли source API types. Desktop set preview
  выбрал 4:9113 при defaultVariant 4:9124; сопоставлен фактически выполненный вариант.
- 24 standalone cell port probes: 22 точных decoder results, два ожидаемых отказа
  Secondary-only. Это проверки портов, а не 24 полных сниппета таблицы. Descriptor
  property aliases сравниваются после lossless normalization с отказом при конфликте;
  production metadata сохраняет значения native API.
- Четыре scoped row probes и три own TEXT probes подтверждают границы поиска.
- 14 тестов: восемь root states, 72 synthetic сочетания Body/First/Last, status/badge
  enums, visibility, sparse indexing, escaping, отрицательные cases, реальные source
  render helpers и source API types со всеми возвращёнными imports.
- После публикации получены восемь собственных непустых MCP snippets, точно равных
  native previews. Оба set-запроса вернули по четыре собственных варианта. Desktop
  также вернул 14 посторонних legacy source-only entries: они сохранены отдельно,
  не считались успешными шаблонами таблицы. Собственный snippet COMPONENT_SET не заявлен.

[Фактические readbacks](publication/2026-11-04.snippets.json),
[receipt](publication/2026-11-04.json), [тесты](PromoTableView.test.cjs).
Запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/PromoTableView.test.cjs
```

Проверены source API и native Code Connect execution. Установленный SDK 81.1.0,
browser rendering, реальные bindings/ассеты, доступность и поведение приложения
не проверены. Новые шаблоны не меняют исходники или публикацию `arui-private`.
