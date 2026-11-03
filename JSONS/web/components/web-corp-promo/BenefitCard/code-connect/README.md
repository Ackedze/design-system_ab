# BenefitCard — Code Connect

Опубликовано и проверено 04.11.2026: два parserless `.figma.ts` шаблона,
16 Desktop + 16 Mobile Web вариантов. Формат повторяет Core PR
[#2280](https://github.com/core-ds/core-components/pull/2280),
head `0250cce31906f9ca4307a4a3f0f3470884fdbc05`:
`import figma from 'figma'`, `figma.code`, default export, `id/imports/metadata`.

| Платформа | Figma set / пример варианта | Файл | Публичный import |
| --- | --- | --- | --- |
| Desktop | [set 17:12762](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=17-12762) / [вариант 17:12763](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=17-12763) | [BenefitCardDesktop.figma.ts](BenefitCardDesktop.figma.ts) | `BenefitCardDesktop` из `arui-private/benefit-card` |
| Mobile Web | [set 17:12781](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=17-12781) / [вариант 17:12782](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=17-12782) | [BenefitCardMobile.figma.ts](../mobile-web/code-connect/BenefitCardMobile.figma.ts) | `BenefitCardMobile` из `arui-private/benefit-card` |

Файлы принадлежат компоненту; [конфигурация](../figma.config.json) включает
только эти два шаблона. В Dev Mode связь показывается у вариантов/instances;
два файла не означают две видимые записи у контейнеров component set.

## Соответствие

| Figma | React |
| --- | --- |
| `GraphicPosition` Left/Right | `graphicPosition` left/right |
| `CardAxis` Horizontal/Vertical | `orientation` horizontal/vertical |
| `Background` True/False | `withBackgroundPlate` boolean |
| `Compact` True/False | `compactView` boolean |
| `Content > Title/Subtitle > value`, BOOLEAN Subtitle | `title`, условный `subtitle`; точные пути в шаблоне |
| `Graphic.Presets` Image/IconView/Icon | `graphicContent.type` image/icon-view/icon |
| `Content.Bottom` и `Bottom.Presets` SwapMe/Link | условный `bottomSlot` custom-slot/link |
| Promo BackgroundPlate Type/BackgroundColor/Skeleton | `backgroundPlateProps.view/backgroundColor/showSkeleton` |

`Graphic`, `ContentWrapper`, `BottomContent` — служебные Figma-части без
отдельного публичного React-компонента: их свойства переводятся в API родителя.
`SwapMe` содержит текст/вложенное содержимое и не является native SLOT;
`getSlot()` не используется. При поиске вложенных слоёв обязательны полный
путь от корня и `traverseInstances: true`.

Код — типизированная `Example`, `nestable: false`. Приложение передаёт
иллюстрацию как `image: ReactNode`, выбранный SVG как `iconProps.Icon`,
кастомный низ как `bottomContent`, реальные `linkProps.href` и addons.
Действие карточки задаётся явно через `interaction`; для `clickable: true`
обязателен обработчик. Figma не содержит свойства кликабельности, поэтому
шаблон не придумывает действие, URL, импорт иконки или путь к картинке.
Для Colored нужен `coloredViewValue`, для Skeleton можно передать `skeletonProps`.
Asset identity/size/crop/segment сохранены в fixture и metadata для выбора
соответствующего ресурса приложением; автоматический asset bridge не подтверждён.

## Ограничения реализации и покрытия

- **CC-LND-03-SOURCE-01:** в 8 компактных Desktop-вариантах Figma использует
  Title Secondary. Исходник `BenefitCardDesktop` после `{...props}` принудительно
  задаёт Primary. Передача `titleView` не исправляет это; шаблон выводит
  предупреждение и не создаёт неработающее обещание соответствия.
- Mobile принудительно использует Secondary; ручной выбор Primary также
  получает предупреждение. Типографика не исправляется изменением контракта.
- Дополнительные IconView slots/форма, Logo/Emoji в Icon, Link размера кроме
  S (14–20), modal-bg и вложенный Level 2 отклоняются до отдельной проверки.
  Размеры и фон AnimaIconView частично задаёт сама React-реализация.
- При `Background=False` исходник создаёт `role=button`, `tabIndex=0` и
  `onKeyDown=onClick` даже без `clickable`. Клавиатурное поведение и вложенная
  ссылка требуют отдельной проверки исходника/приложения; mapping его не меняет.
- В 16 MCP ответах Figma автоматически добавила неиспользуемый import
  `BackgroundPlate` из прежней вложенной связи. Он сохранён в readback;
  все фактические imports прошли source API typecheck, исключений нет.
  Чужие связи не изменялись.

Наличие Code Connect не подтверждает полную визуальную эквивалентность,
готовность произвольных overrides, SDK/runtime adoption или Ready контракта.

## Проверка и повторная публикация

Исходники: `arui-private` 81.1.0,
commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
Публичные экспорты, реальные props и forwardRef проверяются из source.
Для внешних типов использованы локальные React 19.2.7 / @types/react 19.2.16
и Core 50.26.1-alfasans. BenefitCard отсутствует в локальном distribution
80.7.1, опубликованный SDK 81.1.0 недоступен: это **source-only API projection**,
не сборка библиотеки и не тест установленного SDK. Browser/visual тест не выполнялся.

- 11 тестов PASS, 0 FAIL/SKIP: strict template types, 32 frozen native variants,
  144 synthetic nested-state combinations, escaping, отрицательные состояния,
  реальное переопределение Title в leaf и проверки выдуманных props.
- CLI 1.4.9: parse ровно двух шаблонов; preview двух sets и всех 32 variants PASS;
  validation и upload PASS.
- После публикации MCP: 32/32 `hasTemplate=true` **и непустой snippet**;
  import, source pin, значения/тексты и source API types всех 32 сниппетов PASS.
  Ветви Icon/Link/Skeleton покрыты локальными фикстурами; на реальных Figma
  overrides не проверялись.

Из этой папки (`BenefitCard/code-connect`) локальные тесты запускаются так:

```sh
NODE_PATH="$APOLLO_ROOT/node_modules" \
ARUI_SOURCE_ROOT="$ARUI_ROOT" \
ARUI_SDK_NODE_MODULES="$ARUI_SDK_MODULES" \
node --test BenefitCard.test.cjs
```

Из родительской папки BenefitCard сначала выполнить `figma connect preview`
и проверить `success`/snippet, затем `figma connect publish`, после — MCP readback.
Использовать `--config figma.config.json --dir . --exit-on-unreadable-files`.
Токен передаётся окружением или локальным `node --env-file`, не хранится в Git.
CLI validation и `hasTemplate` сами по себе не доказывают исполнение шаблона:
первый upload прошёл с ошибкой поиска ImageView, исправление подтверждено preview.

Frozen native evidence: [figma-context.json](figma-context.json).
Итоговые pins и фактические сниппеты: [publication/2026-11-04.json](publication/2026-11-04.json).
Private logs/первый failure: `.local/benefit-card-code-connect-2026-11-04` в workspace.
Контракты, ZIP, исторические mappings и source/Draft/Ready не изменялись.
