# BenefitsBlock — component contract

Папка содержит generated- и manual-слои component contract для **Web _ Сorp Promo Components / BenefitsBlock**.

## Статус

**Ready.** Generated-слой актуален, manual-секции полностью заполнены по результатам анкетирования и подтверждены владельцем AB-слоя 2026-07-29. Targeted Athena checks и проверки Apollo пройдены.

## Назначение

`[D] BenefitsBlock` и `[M] BenefitsBlock` — активные канонические промо-баннеры для яркой подачи ключевой информации и преимуществ. Рекомендуется использовать один BenefitsBlock на промо-странице, но несколько блоков также допустимы и не являются нарушением. Planned replacement и legacy-вариантов нет.

Публичными root являются только `[D] BenefitsBlock` и `[M] BenefitsBlock`. Вложенные `[D]/[M] ButtonGroup` и `[D]/[M] ContentPresets` принадлежат композиции BenefitsBlock и отдельно не создаются.

Позиции изображения на desktop (`Left`/`Right`) и mobile-web (`Top`/`Bottom`) выбираются независимо. Desktop `Compact=True` обязателен при viewport `≤1024 px` и также используется, если контент не помещается в стандартный формат. `Background=False` означает использование внешней общей поверхности без собственного BackgroundPlate.

`HeightCustom=True` позволяет задать произвольную высоту BackgroundPlate. При `HeightCustom=False` BackgroundPlate растягивается только по высоте контента, без учёта изображения. Ширина не ограничена свойством HeightCustom, но композиция обязана исключать перекрытие контента изображением.

Title и изображение обязательны. `ContentPresets` можно скрыть; его типы: `Text` для простого текстового блока с заголовком, `List` для перечня элементов, `Steps` для инструкции или последовательности шагов. Для `Steps` рекомендуется 3 шага; если шагов больше 3, аудит возвращает `warning`, но не блокирует использование. `ButtonGroup` также можно скрыть; при отображении допустимы Primary, Secondary или оба действия. Между D/M сохраняются контент, изображение, количество и порядок действий, а позиция изображения может различаться.

При `Background=True` разрешены только поверхности `Primary` и `Colored`. У mobile-web нет `HeightCustom`: высота определяется содержимым и штатным mobile layout.

RightAddon должен быть скрыт. TitleAddon допускается только как StatusBadge. Изображение использует `Crop=Center`, owner-confirmed `Size=348`, а `Segment` выбирается по сегменту лендинга. Это намеренная curated-дельта: текущий raw baseline содержит `Size=534`.

Для `Colored` разрешён только token-bound fill; `Primary` сохраняет baseline без цветовых overrides. Loading допустим при `Background=False`. Root использует Fill по ширине и Hug по высоте; `HeightCustom` меняет только высоту BackgroundPlate и не разрешает ручные размеры остальных частей. Количество элементов List/Steps задаётся соответствующими вложенными компонентами.

Текстовые лимиты: Title — до 60 символов и двух строк; Text — до 240 символов и четырёх строк; label кнопок следует контракту Button. Изображение обязательно выбирается из `Corp :: Image Library`; swap внутри этой библиотеки разрешён при сохранении `Crop=Center`, `Size=348` и Segment лендинга.

Loading охватывает весь BenefitsBlock и блокирует действия. Сам контейнер некликабелен: действия доступны только через ButtonGroup. Segment изображения и token-bound fill поверхности Colored должны совпадать. При `HeightCustom=False` изображение может выходить за визуальные границы BackgroundPlate, если не перекрывает контент и остаётся внутри root; при `HeightCustom=True` такой overflow не допускается.

Gap, padding, axis, порядок внутренних областей и размеры ImageContainer принадлежат BenefitsBlock и вручную не изменяются. TitleAddon наследует полный контракт StatusBadge. Raw colors запрещены: Colored использует только token-bound fill соответствующего Segment.

Raw Figma catalog остаётся source of truth:

`../../../../web/components/web-corp-promo/Web _ Сorp Promo Components -- BenefitsBlock.json`

## Файлы

- `contract.generated.json` — сгенерированный compact contract, извлечённый из raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную.
- `composition-contract.json` — context владения internal instances.
- `rules.json` — component-level classification и design rules.
- `audit-mapping.json` — модель группировки Apollo.
- `examples.json` — примеры трактовки.
- `agent-context.json` — compact context для интерпретации на стороне агента.

## Источник

- Библиотека: `Web _ Сorp Promo Components`
- Сгенерировано: `2026-07-27T13:29:07.697Z`
- Компонентов: `6`
