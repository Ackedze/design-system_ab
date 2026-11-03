# PromoMainBlock — Code Connect

**Опубликовано и проверено через Figma MCP 04.11.2026:** 16 Desktop и 4 Mobile
Web варианта. [Receipt, source hashes и фактические примеры](publication/2026-11-04.json).

| Платформа | Шаблон | Figma set / key | Public import |
| --- | --- | --- | --- |
| Desktop | [PromoMainBlockDesktop.figma.ts](PromoMainBlockDesktop.figma.ts) | `2041:23594` / `e691885120337235bc0443186870e7b120567f40` | `PromoMainBlockDesktop` из `arui-private/promo-main-block/desktop` |
| Mobile Web | [PromoMainBlockMobile.figma.ts](../mobile-web/code-connect/PromoMainBlockMobile.figma.ts) | `2226:10113` / `3b7ac57095a531c933b5960841f09f94b6324988` | `PromoMainBlockMobile` из `arui-private/promo-main-block/mobile` |

Применён тот же parserless формат Core: `url/source/component`,
`figma.selectedInstance`, `id/imports/example/metadata`, `figma.code`.
Оба leaf import подтверждены `src/promo-main-block/docs/development.mdx`,
своими `index.ts` и реализациями. Адаптивный `arui-private/promo-main-block`
также существует, но эти связи сохраняют конкретную D/M identity.
Исходник 81.1.0: commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.

## Сопоставление

| Figma | Код / обработка |
| --- | --- |
| `Appearance=Light/Dark` | `appearance="light/dark"` |
| `Background=False/True` (VARIANT) | `withBackground={false/true}` |
| D `View=Page/Modal` | `view="page/modal"` |
| D `Compact=False/True` (VARIANT) | `compact={false/true}` |
| D `BlurEffect` (BOOLEAN) | `blurEffect` |
| `Title/value`, `Subtitle/value` | `title`, `subtitle`; отдельные полные пути и безопасные JS-строки |
| `Bottom` + `Bottom slot` (SLOT) | `customAddon`; скрытый Bottom не читается и не добавляется |
| `ButtonGroup` + Primary/Secondary | Настоящие `primaryButtonProps` / `secondaryButtonProps`: Figma label и обязательный callback из контекста приложения |
| D ButtonGroup / M `Axis` | D horizontal; M Horizontal/Vertical → `buttonsGroupLayout` |
| `Holding` | Типизированный `corporateFilterCompanySelectProps` из контекста приложения |
| `Status` | Типизированный `statuses` из контекста приложения; data API не выводится из имён StatusPreset |
| `ImageView` | Обязательный `imageProps` с `src` и `alt` из выбранного библиотечного ресурса |
| Цветовой контекст | Опциональный `backgroundColor` настоящего API; палитра не угадывается по имени слоя |

Тексты разрешаются по полным путям, одинаковым во всех проверенных вариантах:

- D: `Content / ContentWrapper / Content / Text content / Title|Subtitle / value`.
- M: `Content / ContentWrapper / Content / Title|Subtitle / value`.
- CTA: `Content / ContentWrapper / ButtonGroup`, затем Primary/Secondary и
  их TEXT property `✎ Label`.
- ImageView: D `Content / ImageContainer / Container / ImageView`,
  M `Content / ImageContent / Container / ImageView`.

Точные definitions, полные SLOT identities `Bottom slot#4708:61` на D и
`Bottom slot#4708:95` на M, defaults, пути и 20 вариантов сохранены в
[frozen Figma context](figma-context.json). Это техническое evidence,
не новый runtime registry и не копия нормы.

Готовое содержимое Bottom сохраняет секции, порядок и вложенные imports.
Непрозрачное содержимое требует `customAddon: ReactNode` либо `ReactNode[]`
для нескольких регионов. ERROR или отсутствующий включённый SLOT прерывает
выполнение. Нет подстановки SwapMe, выдуманного текста, URL или пустых callbacks.

Пример всегда требует контекста изображения, поэтому возвращает функцию
`Example`, `metadata.nestable=false`. Parent должен передать результат через
свой контекст, а не вставлять объявление функции внутрь JSX. Общий runtime
helper не импортируется: CLI его не собирает.

## Границы и source gap

Code Connect отражает raw состояние Figma и реальный API. Он не исправляет
автоматически нарушающий нормы raw default. В snippet-комментарии и
`metadata.props.warnings` явно отмечаются неправильная Background-матрица,
выключенный D BlurEffect, M Background=False, M Holding и raw M ButtonGroup.
Для лендинга действуют существующие контракты и паттерны: mobile-действия
выносятся во внешний fixed ButtonStack. Наличие raw M Holding подтверждено
живым чтением; оно не означает его допуска в curated mobile-сценарий.

Figma StatusPreset и используемый реализацией Core Status имеют разные data
API. Маппинг требует явных `statuses` нужного типа; он не придумывает
преобразование Type/Style в props. URL/alt изображения, статусы, модель компании,
callbacks и цветовые токены предоставляет приложение по документам ДС.

**Secondary-only временно отклоняется.** Реальный
`src/promo-main-block/components/buttons-group/promo-main-block-buttons-group.tsx`
читает `primaryButtonProps.loading` при рендере Secondary. Без Primary это
воспроизводимо выбрасывает ошибку. Шаблоны не создают фиктивную Primary для
обхода; исправление реализации — отдельная source-задача.

Также отклоняются Hint/addons/icon-only/disabled и изменённые View/Shape/Size
вложенных CTA: публичный API PromoMainBlock не позволяет передать эти настройки.
Неподдерживаемая конфигурация не выдаётся за сохранённое соответствие.

## Проверки

| Проверка | Результат |
| --- | --- |
| Native Figma properties/paths | Fresh MCP + read-only Plugin API; 16 D / 4 M |
| Официальный CLI 1.4.9 parse/validation/upload | PASS; ровно 2 новых root templates |
| Строгие официальные Figma types | PASS, TypeScript 5.9.3 |
| Тесты | 14 PASS / 0 FAIL / 0 SKIP |
| Опциональные состояния на native fixture matrix | 512 D + 64 M = 576 сочетаний |
| Тексты, Bottom, CTA, отрицательные случаи | PASS; источник Secondary-only ошибки воспроизведён |
| Фактическое исполнение опубликованных шаблонов | 20/20 MCP результатов, `hasTemplate=true`, правильный leaf import и transforms |
| API фактических snippets по исходнику 81.1.0 | 20 PASS, 0 diagnostics; метод ниже |
| Опубликованный SDK / полный runtime / browser | NOT_RUN |

`check-source-api.cjs` проверяет текущие prop types из настоящих файлов
`typings.ts`, а сигнатуры leaf exports выводит из аннотаций параметров функций.
Тела компонентов заменяются type-only проекцией `ComponentType<Props>`;
type-only импорт FilterCompanySelect направлен в фактически экспортируемый
`typings.ts`, без подтягивания runtime. Это **source-only API check**, а не
сборка или приёмка опубликованного SDK. Настоящие внешние Core/React declaration
dependencies взяты из существующего toolchain: Core 50.26.1-alfasans,
React 19.2.7. Декларации props не подменяются `any` или вручную составленным API.

В четырёх D readbacks Figma автоматически добавила неиспользуемый
BackgroundPlate import из прежней вложенной связи. Raw readback сохранён;
этот import явно исключён только из source-only проверки собственного snippet.
Проверка полной SDK import closure остаётся NOT_RUN; чужая связь не изменялась.

Для повторения из корня `design-system_ab`:

```sh
NODE_PATH=/path/to/code-connect-toolchain/node_modules \
ARUI_SOURCE_ROOT=/path/to/arui-private \
ARUI_SDK_NODE_MODULES=/path/to/core-and-react-toolchain/node_modules \
node --test JSONS/web/components/web-corp-promo/PromoMainBlock/code-connect/PromoMainBlock.test.cjs
```

Без source/toolchain переменных соответствующие API/source tests будут явно
SKIP. Конфиг публикации находится в [папке компонента](../figma.config.json).
Токен хранится отдельно в локальном приватном файле и не входит в пакет.

Сохранены первые ошибки проверки (enum literal types, fixture key priority,
дедупликация type imports) и финальный прогон в workspace
`.local/promo-main-block-code-connect-2026-11-04/`. Контракты, прежние seals,
Ready и установленная поставка Proxy/Apollo этой работой не изменены.
