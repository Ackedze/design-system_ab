# BackgroundPlate — Code Connect

Статус: **опубликовано и проверено через Figma MCP 04.11.2026**.
Шесть шаблонов regular, Promo и native Slot для Desktop / Mobile Web загружены
официальным CLI с полной валидацией. Фактический readback подтвердил собственный
непустой snippet для всех 18 вариантов и шести запросов component set.
Все 24 MCP snippets со всеми возвращёнными imports прошли strict source API check.

До публикации выполнены 146 native preview cases: 18 корневых вариантов и
128 адаптированных Style probes. Получены 88 допустимых сниппетов и 58 ожидаемых
отказов modal-фона; все допустимые примеры прошли source API typecheck.

| Семейство | Desktop | Mobile Web |
| --- | --- | --- |
| Обычный BackgroundPlate | [шаблон](BackgroundPlateDesktop.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=66402-30696) | [шаблон](../mobile-web/code-connect/BackgroundPlateMobile.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=66402-30703) |
| Promo | [шаблон](BackgroundPlateDesktopPromo.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=102592-139626) | [шаблон](../mobile-web/code-connect/BackgroundPlateMobilePromo.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=102592-139631) |
| BackgroundPlateSlot | [шаблон](BackgroundPlateDesktopSlot.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=136846-8889) | [шаблон](../mobile-web/code-connect/BackgroundPlateMobileSlot.figma.ts) · [Figma](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=136941-9164) |

Шесть parserless `.figma.ts` следуют структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, default export с id/imports/example/metadata.
Config включает ровно эти шесть файлов. Style Level 1/2 управляют props родителя;
дополнительный runtime export или дополнительная вложенная подложка не создаются.

## Проверенный API и соответствие

Исходник `arui-private` 81.1.0, commit
`4bf38e2be8589da705f991b4dcac0d41975dff3d`; использован существующий frozen source
snapshot. Публичные exports проверены в реальных leaf/barrel:

- `BackgroundPlateDesktop` из `arui-private/background-plate/desktop`;
- `BackgroundPlateMobile` из `arui-private/background-plate/mobile`;
- `BackgroundPlateView` — enum из `arui-private/background-plate`, не компонент React.

| Figma | React |
| --- | --- |
| D/M family | явный Desktop/Mobile export |
| Promo family | `promo={true}` |
| Position Level 1/2 | `level="outer"` / `"inner"` |
| Вложенный Style Level Type | `view={BackgroundPlateView.…}` |
| Style BackgroundColor base-bg/base-bg-alt | соответствующий `backgroundColor` |
| Skeleton | `showSkeleton`; необязательный typed `skeletonProps` |
| BackgroundPlate без SLOT | обязательный `children` приложения |
| Slot#136328:0, native SLOT | `getSlot` → структурированные React children |
| Padding/axis/gap/alignment Slot | обязательный typed `layoutProps` приложения |

У обычных и Promo roots нет SLOT. Содержимое приложения не извлекается из
декоративного Style Level. У Slot есть настоящий `Slot#136328:0`; runtime `getSlot` принимает короткое имя `Slot`. Вложенные
Code Connect sections сохраняются, неподдержанный непрозрачный контент требует
ReactNode, несколько таких областей — ReactNode[]. Пустой SLOT передаёт `{null}`:
это пустое содержимое, а не выдуманный компонент.

## Границы и контекст

- В публичном `backgroundColor` только `base-bg` и `base-bg-alt`. Modal-фоны не
  подменяются base-фонами: шаблон отказывает с указанием BackgroundColor.
  В свежих 128 Style-вариантах 70 допустимы по этому API, 58 — modal.
  Оба Skeleton=True обычного Desktop Style Level 2 сейчас имеют modal-фон.
- Colored требует `coloredViewValue`, согласованный с реальным token-bound
  fill. Шаблон не доказывает происхождение строки и не придумывает raw color.
- Radius задаётся family/level. Desktop обычный — 16/12, Desktop Promo и обе
  mobile семьи — 24/16; сверено с raw, native и source CSS. Для Skeleton
  соответствующий `borderRadius` передаётся после spread `skeletonProps`:
  source default Skeleton radius на desktop сам не учитывает Promo.
- Native SLOT roots имеют outer radius, Type/Skeleton и не имеют Position или
  BackgroundColor. Они не изображаются как inner/Promo по догадке.
- У Slot geometry не является VARIANT. Существующие raw `structure` /
  `variantStructures` остаются источником layout; native дополнительно проверен.
  Проверенный standalone root имеет padding 24 и gap 10; рекомендация нормы
  начать с 32 не означает принудительную замену этих значений. App context
  передаёт фактическую композицию, не фиксированное число из шаблона.
- `paddings` React допускает 16/20/24/32. Другие, несимметричные padding,
  display/flexDirection/gap/alignItems/justifyContent передаются через разрешённые
  layout-поля `style`. Полный произвольный style не запрашивается.
- Click/hover, Dropzone, ручные fill/stroke/blur overrides и runtime/browsers
  не выводятся из свойств текущих Figma roots. Для их использования нужна
  отдельная проверка реальных props и композиции; такого покрытия здесь нет.

## Проверки

7 локальных тестов PASS: strict types самих шаблонов; 18 корневых вариантов;
128 nested Style cases (70 допустимых + 58 явных отказов); structured Slot,
empty/opaque/nested content, escaping, отсутствующие поля и отрицательные API cases.
Примеры проверены по actual source public types без any/casts, с реальными
Core/React types. Это source API projection, а не установленный SDK 81.1.0.

[Контекст свойств и identities](figma-context.json) не заменяет сырые каталоги
Apollo и не добавляет nativeAuditFactsV1. [Тесты](BackgroundPlate.test.cjs),
[source API checker](check-source-api.cjs).

Выполнены official preview шести set, 18 root variants и 128 read-only Style
probes. Последние меняют только selected root/level, отдельно не публикуются.
58 modal-отказов проверены по конкретной ошибке BackgroundColor. Первый native
preview выявил, что getSlot принимает display name `Slot`, а не полный property
key; вызов и fixture исправлены, повторный preview прошёл.

Публикация шести canonical файлов выполнена с CLI validation PASS и upload PASS.
MCP readback: 18/18 вариантов, 6/6 запросов set; hasTemplate=true и собственные
непустые snippets с правильным Desktop/Mobile import. Временные внутренние и
транспортные ошибки MCP устранены повторным чтением только неуспешных запросов.
Проверка типов включает все фактически возвращённые imports, без исключений.

[Финальный receipt с pins](publication/2026-11-04.json),
[фактические опубликованные snippets/imports](publication/2026-11-04.snippets.json),
[read-only preview результаты](publication/2026-11-04.preview-results.json).
Предыдущие `2026-11-04.pending.json` и `2026-11-04.preview-verified.json`
сохраняют исторические этапы подготовки и сетевой блокировки, а не текущие pins.
Browser/установленный SDK 81.1.0 и Ready/публикация Apollo не заявлены.
Контракты, ZIP и прежние mapping/seals остаются без изменений.

Локальный запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/BackgroundPlate.test.cjs
```
