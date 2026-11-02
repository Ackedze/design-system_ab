# NEXT-01 · Apollo v4 · локальная передача

Результат от 05.10.2026: проверен source API `arui-private` 80.7.1,
подготовлены три локальных Code Connect mapping и versioned read-only registry.
Это передача для NEXT-02/03. Полная совместимость контрактов с готовым UI,
живой Figma и release не подтверждены.

Целевой продукт: `projects/Apollo-v3/apps/apollo-v4`. Исходники компонентов,
manual, ZIP, общие schemas/core и приоритеты в этой задаче не изменялись.

## Вход для Generation

- `registry/arui-private-80.7.1.v1.json` — availability, точный API, defaults,
  source/build evidence, transformations, platform, contract/dependency pins и gaps.
- `registry/mapping-registry.schema.json` — JSON Schema draft-07 для этого каталога.
- `registry/lock.v1.json` — точный digest каталога, code version/commit и archive hashes.
- `registry/consumer.cjs` — reference Node API: `loadRegistry`, `preflight`, `emit`.
- `examples/pilot.desktop.plan.json` — synthetic example входа, не новая нормативная
  ScreenSpec и не копия private manual/capture.
- `examples/PilotDesktop.generated.tsx` — проекция этого примера с двумя переданными
  обработчиками. Полный frontend typecheck/browser run ещё требует NEXT-05 toolchain.
- `reports/NEXT-01.2026-10-05.json` — машиночитаемая проверка и hashes артефактов.

Reference consumer выполняется в Node: ему нужны filesystem/git и закреплённый
TypeScript из локального tooling. Он не предназначен для исполнения внутри
Figma sandbox или браузера. NEXT-03 подключает каталог/схему к своему preflight,
а проверку свежести файлов — к внешнему порту Apollo v4. Порт должен сохранять
те же code/contract/registry locks и возвращать receipt до записи любого target.

```js
const path = require('node:path');
const bridge = require('/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/consumer.cjs');
const registry = bridge.loadRegistry();
const lock = require('./registry/lock.v1.json');
const node = require('./examples/pilot.desktop.plan.json');
const receipt = bridge.preflight(registry, node, lock, {
    repo: '/Users/alexkukhta/Desktop/workplace/arui-private',
    workspaceRoot: '/Users/alexkukhta/Desktop/workplace',
});
const snippet = bridge.emit(receipt.prepared);
```

`prepare` — offline projection helper; он сам не проверяет текущие файлы.
Рабочая точка входа availability gate — `preflight`. Неизвестные import/export,
prop, slot, platform, несовпадающая Figma identity и stale lock/pin блокируют
соответствующий маршрут с явным кодом диагностики. Успех availability не
означает успех contract/UI validation или frontend compilation.

## Подтверждённые imports и mapping

| Контракт | Public source/build export | Поддержанный маршрут |
| --- | --- | --- |
| ButtonsGroup desktop r57 | `ButtonGroup` из `arui-private/button-group` | Desktop, Size=56, Overflow=false, 1–4 text actions |
| CorporateContent desktop r12 | `CorporateContent` из `arui-private/corporate-content` | `[D] Body#135096:3` SLOT → ordered `children` |
| CorporateContent mobile-web r7 | тот же `CorporateContent` | `[M] Body#135096:2` SLOT → ordered `children`, отдельный platform/contract pin |

HEAD: `c037d0c322ea9774a9c251400d76d41222819b87`. Registry закрепляет 29
source/build файлов и 5 файлов mapping/consumer. У root package нет `exports`;
build script формирует wildcard subpaths из реальных `src/**/index.ts`.
Проверены named source exports и правила сборки. Distribution в checkout не
собран; успешный resolution опубликованного/private package здесь не проверен.

Core Button — внутренняя зависимость ButtonGroup. `@alfalab/core-components/button`,
`arui-private/button` и `arui-private/ButtonsGroup` не разрешены как самостоятельные
imports генератора. Перечень внутренних imports записан отдельно в registry.

### ButtonGroup

Точное объявление `ButtonGroupProps` читается из `src/button-group/typings.ts`:
required `elements`; optional `size`, `maxVisibleButtons`, `pickerButtonProps`,
`primaryFirst`, `showSkeleton`, `className`, `dataTestId`,
`mapElementToPickerOption`, `tooltipProps`. Defaults: size=56,
maxVisibleButtons=4, primaryFirst=false, showSkeleton=false.

`Size` — `Exclude<ButtonProps['size'], 'l' | 'xl' | 64 | 72>`; реализованы
numeric 32/40/48/56 и aliases xxs/xs/s/m. Figma Size — строковый VARIANT,
преобразуется в число. Non-56 route закрыт до occurrence evidence/live acceptance.
Figma Overflow также строковый VARIANT false/true; code Boolean prop отсутствует.

`elements` содержит normal ButtonElementProps или PickerElementProps.
Normal branch передаёт props внутреннему Core Button, затем задаёт group size,
primary только для первого при primaryFirst, остальные secondary; на mobile
первый становится block. Custom React element children обходят эту нормализацию;
пилот их не генерирует. Labels → elements[].children, DisabledState → disabled,
первый View → primaryFirst, scenario handlerRef → реальный elements[].onClick.
Handler functions передаёт вызывающий сценарий, Figma их не определяет.

`ButtonsGroup.figma.ts` требует `figma.batch.buttonsGroupBinding`: подтверждённые
visibleOccurrenceIds, handlersByOccurrenceId и identityByOccurrenceId. Direct
child IDs/order/symbolId сверяются, Button componentSetKey закреплён. Этот порт
пока не интегрирован в Apollo v4. Шаблон context-required: обычный Dev Mode без
порта получит диагностику; CLI parse подтверждает сборку шаблона, не live execution.

### CorporateContent

Props: `children`, `className`, `id`, deprecated `tableMode`, `theme`,
`disableVerticalInlinePaddings`, `verticalPaddings`, `dataTestId`.
`disableVerticalInlinePaddings=false`; children рендерятся непосредственно.
ThemeType: alfa-on-color / alfa-on-white / grey, default context alfa-on-white.
VerticalPaddings — platform pair из number или px string; default Core symbols
desktop gap3xl/gap5xl, mobile gapXl/gapXl. Значения peer tokens локально не разрешены.
В пилотном маршруте props ограничены id/className/dataTestId и slot Body;
theme/padding требуют отдельного parity profile.

## Gaps, которые нужно сохранить в NEXT-02/03/05

| ID | Следствие |
| --- | --- |
| CC-GEOMETRY | Code root — row flex, Figma root — vertical AutoLayout; Body mapping не подтверждает геометрию композиции |
| CC-PADDING | Code horizontal desktop-l=50 отличается от Figma baseline 40/52/64/52; numeric Core defaults не проверены |
| CC-SURFACE | BackgroundPlate Color и theme/context не имеют подтверждённого соответствия |
| BG-AUTO-OVERFLOW | Ширина/количество могут скрыть действие даже при Figma Overflow=false; требуется наблюдаемая runtime width fit |
| BG-OVERFLOW-ACTIONS | Default options не переносят onClick, action identity, icon и disabled reason; нужен explicit mapper + picker routing |
| BG-OVERFLOW-ORDER | Source сохраняет ascending hidden indexes; contract transfer order отличается |
| BG-MOBILE | Source <768 показывает только первое действие; mobile ButtonsGroup contract в этих входах отсутствует |
| BG-SIZE-BINDINGS | Для non-56 нужны собственные подтверждения native occurrence bindings |
| BG-VISIBILITY-PORT | Native visibility/business handlers требуют locked input/capture port NEXT-03 |

Не возвращать удалённую норму root HUG×HUG из прежних ревизий ButtonsGroup.
Сейчас закреплён r57: 1–4 visible, optional first primary, SingleIcon rules,
четыре встроенных occurrences и Button dependency r31. Детали pins — в registry.
Accepted CorporateContent ZIP r12 отличается от main manual r11; использован
принятый ZIP, расхождение явно записано. Ни один из источников не переписан.

## Передача Contract Creation · NEXT-02

Предлагаемые code representation IDs имеют статус `proposed-for-authoring`:

- `web-corp.buttons-group.code.arui-private.desktop`
- `web-corp.corporate-content.code.arui-private.desktop`
- `corporate-content.mobile-web.code.arui-private`

Registry содержит code package/version/commit/file hashes, exact subpath/export,
API/evidence, transformations, platform и links к Figma identity. NEXT-02 принимает
эти значения в паспорт по своему процессу и сохраняет distinction между source API,
context-required execution и полной приёмкой. Mapping IDs, code representation IDs
и Figma representation IDs имеют разные роли и не взаимозаменяемы.

## Проверки

Из `arui-private/tools/code-connect` без установки и публикации:

```sh
npm run typecheck
npm test
node registry/check-schema.cjs /Users/alexkukhta/node_modules/ajv
node_modules/.bin/figma connect parse --config ../../figma.config.json --dir ../.. --skip-update-check --exit-on-unreadable-files
```

31/31 tests PASS, official template typecheck PASS, CLI parse 3 templates PASS,
registry schema PASS. Node v22.14.0, TypeScript 5.3.3, Code Connect CLI 2.0.1.
Schema QA использовал явно переданный существующий Ajv 6.15.0 вне этого пакета;
`npm test` от него не зависит. Fresh install/reproduction schema QA этим запуском
не подтверждены. Root private dependencies/Core peer не установлены.

Tests выполняют реальные pure source helpers: overflow calculation, picker option
mapping, platform padding selection. Mock Core tokens имеют symbolic unresolved
значения. Проверка JSX — syntax/transpile; full React application typecheck,
browser interactions и visual parity не запускались. Live Figma/write/publication
в NEXT-01 не выполнялись. Исторический publication gap описан отдельно в README.

Следующий вход: NEXT-02 принятие code fields, затем NEXT-03 общий plan/lock и порты
visibility/event/freshness. NEXT-05 проверяет реальные handler bindings, ширину,
interaction и геометрию в браузере с доступным private package source.
