# PromoCard — Code Connect

Два parserless `.figma.ts` по структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, literal id, imports/example/metadata.
Публикация и фактический MCP readback — [в receipt](publication/2026-11-04.json).

| Платформа | Файл | Figma set | Публичный import |
| --- | --- | --- | --- |
| Desktop | [PromoCardDesktop.figma.ts](PromoCardDesktop.figma.ts) | [16:8923](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=16-8923) | `PromoCardDesktop` из `arui-private/promo-card` |
| Mobile Web | [PromoCardMobile.figma.ts](../mobile-web/code-connect/PromoCardMobile.figma.ts) | [16:9029](https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA?node-id=16-9029) | `PromoCardMobile` из `arui-private/promo-card` |

Каждый set содержит 18 вариантов. Source API 81.1.0 проверен на commit
`4bf38e2be8589da705f991b4dcac0d41975dff3d`. Существующая локальная правка
`src/promo-card/types.ts` меняет только путь импорта BackgroundPlateProps
с `src/background-plate` на `../background-plate`; оба ведут к той же декларации.
Source checker использует неизменный снимок commit и разрешает исходный alias;
локальный файл не изменён этой задачей.

## Соответствие

| Figma | React |
| --- | --- |
| Small / Medium / Large | `size='small'/'medium'/'large'` |
| Image Top / Bottom | `imageOrientation`; настоящий `image` приложения |
| Image None (Figma only) | prop `image` отсутствует; строка none в API не передаётся |
| ImageCrop / Offset | `imageCrop` / `imageOffset`, только при наличии изображения |
| Image Centred | `imageAlign='normal'/'bottomRight'` для нижнего изображения |
| Content Title / Centred | `titleView` / `centred`; ограничения leaf описаны ниже |
| Видимые Title / Subtitle | строки `title` / `subtitle`; скрытый Subtitle не передаётся |
| Buttons, Axis, PrimaryButton, SecondaryButton | реальные `primaryButtonProps`/`secondaryButtonProps`, `buttonsDirection` |
| CTA Label / DisabledState / addons | label, disabled и типизированные addon values; порядок Primary → Secondary |
| Bottom / Presets | `bottomAddon: ReactNode`; выбранная композиция отражена в metadata |
| Promo Style Primary, Level 1 | `backgroundPlateProps`: promo, outer, backgroundColor, showSkeleton |

Вложенные Content/ImageView/CTA/Style читаются динамически по полным root paths.
Frame с тем же названием не выдаётся за InstanceHandle. Root Offset — BOOLEAN;
ImageCrop и CTA DisabledState — VARIANT. SLOT-свойств здесь нет, getSlot не вызывается.
ResultSection сохраняются структурированно; строки экранируются как JS expressions.

## Контекст приложения

- `image` — настоящий ReactNode выбранного ImageView. Metadata хранит Crop,
  Segment, Size и Grid; сам ассет, его права, alt и crop-композицию задаёт приложение.
  Демонстрационный placeholder и выдуманный src не создаются.
- `primaryAction` / `secondaryAction` нужны для включённых CTA: реальные onClick
  и активные leftAddons/rightAddons. Выключенные addons сбрасываются. Сохраняются
  label, disabled, размер и роль. Primary мобильной CTA соответствует source
  view=accent, Desktop — primary; Secondary — secondary.
- `bottomAddon` воспроизводит выбранный SwapMe/ButtonGroup preset реальными
  компонентами. Название Figma-only пресета не становится отдельным runtime export.
- Необязательный `cardAction` задаёт реальный onClick всей карточки. Его отсутствие
  не подменяется фиктивным callback; действие карточки и CTA согласует приложение.

Для CTA используется distributive ActionProps: публичный ButtonProps содержит
button/anchor union. Обычный Omit объединял несовместимые `type` поля и не проходил
source API types. Выбранный тип сохраняет исходные ветви без cast/any.

`BackgroundPlateProps` требует children даже в конфигурационном prop. Поэтому
передаётся `children:undefined`: реализация PromoCard затем задаёт собственный
реальный контент через JSX children. Promo=true задаётся явно для Promo family.

## Ограничения исходника

Desktop leaf после props жёстко задаёт `titleView='primary'`, Mobile — secondary.
Другой выбранный Content Title сохраняется в metadata/prop, а snippet содержит
`TITLE_VIEW_SOURCE_GAP`. Передача prop не устраняет расхождение. Все 36 текущих
root master-вариантов используют совпадающие с source Title; альтернативы проверены
fixtures и реальным source overwrite test.

Source отключает offset для нижнего изображения и crop при bottomRight. Шаблон
предупреждает о таких сочетаниях; их полная визуальная эквивалентность не утверждается.
При Image=None crop/offset остаются неактивными сохранёнными настройками Figma.
Hint, SingleIcon, другой Shape или скрытый Label бизнес-кнопки явно отклоняются;
неизвестные enum/style values тоже требуют нового проверенного рецепта.

Source root всегда имеет role=button/tabIndex=0 и передаёт onClick в onKeyDown
без фильтра клавиши. Это проверено чтением/вызовом исходника; доступность,
всплытие действий CTA и клавиатурный сценарий нужно отдельно принять в приложении.

## Проверки

- CLI 1.4.9: ровно два canonical templates, обычные validation/upload.
- Native preview: 36 root variants, два set previews и восемь CTA port probes.
  Первые 38 — сниппеты компонентов, последние восемь проверяют decoder портов;
  диагностические копии не публикуются.
- CLI set preview Desktop выбрал 16:8924, хотя Figma defaultVariant — 16:8987.
  Preview сопоставлен с фактически исполненным известным вариантом; свойство
  defaultVariant не использовано как доказательство выбранного preview состояния.
- 11 тестов: native variants, 24 CTA/Bottom combinations, visibility/escaping,
  disabled/addons, отрицательные API cases и реальные source normalizations.
- Source API types проверяют все 38 native component snippets и фактические
  MCP snippets со всеми возвращёнными imports.

[Фактические readbacks](publication/2026-11-04.snippets.json),
[receipt](publication/2026-11-04.json), [тесты](PromoCard.test.cjs).
Запуск из папки компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/PromoCard.test.cjs
```

Установленный SDK 81.1.0, browser rendering, реальные ассеты, поведение и доступность
в приложении, полная визуальная эквивалентность не проверены. Contracts/raw/ZIP,
исторические mappings/seals и Draft/Ready не изменены. Новый контекст Code Connect
хранит provenance; существующие raw structure/variantStructures остаются источником Apollo.
