# PromoMainBlock — MVP component contract

**Статус:** Ready — manual-секции заполнены по raw-каталогу, live Figma и решениям владельца AB-слоя.

Папка содержит сгенерированный слой component-contract для **Web _ Сorp Promo Components / PromoMainBlock**.

Raw Figma catalog остаётся source of truth:

`../../../../web/components/web-corp-promo/Web _ Сorp Promo Components -- PromoMainBlock.json`

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
- Сгенерировано: `2026-06-02T08:28:22.629Z`
- Компонентов: `10`

## Подтверждённая семантика — повторная верификация 2026-09-02

PromoMainBlock — главный промо-блок с ключевым сообщением, изображением и CTA. Правила «первый и единственный на странице», выбор `Appearance` по сегменту, контекст `Holding` и размещение mobile `ButtonStack` принадлежат landing-page pattern, а не component contract.

Публичные корни — только `[D] PromoMainBlock` и `[M] PromoMainBlock`. ButtonGroup, SwapMe, LightOverlay и DarkOverlay являются внутренними семействами и отдельно не вызываются.

На desktop `View=Page` используется на странице, `View=Modal` — внутри модального контейнера. Mobile использует единый root в обоих контекстах. `Compact=True` обязателен только при viewport `<=1024 px`; у mobile свойства `Compact` нет.

`Appearance` не является темой и выбирается landing-page pattern по сегменту и поверхности. Component contract задаёт строгую матрицу `Background`: D Page=`False`, D Modal=`True`, M=`True`.

BlurEffect обрезает изображение по нижнему краю и добавляет fade. На desktop он обязателен и для `View=Page`, и для `View=Modal`; у mobile свойства нет.

Между D/M сохраняются смысловой контент, один image asset, Status, Bottom slot, набор и порядок действий и `Appearance`. `View`, `Compact`, `BlurEffect` и `Holding` остаются desktop-only. `Background` следует строгой матрице.

Title, Subtitle и ImageContainer обязательны. Status опционален: разрешено от одного до трёх StatusBadge, каждый наследует полный контракт StatusBadge. Один статус — штатный вариант; два или три возвращают `warning`, больше трёх — `error`. Holding существует только на desktop и наследует контракт FilterCompanySelect/AccountSelect.

Bottom slot опционален и принимает простой текст либо один произвольный компонент; `SwapMe` запрещён в финальном макете, а содержимое сохраняется между D/M. CTA на desktop опциональны: допустимы Primary, Secondary, оба действия или полностью скрытый action-блок. У видимых кнопок сохраняются baseline-порядок, `View` и параметры. На mobile внутренний ButtonGroup скрывается; его использование даёт `warning`, а figma-only `🔒 [M] ButtonStack` размещается отдельно по landing-page pattern.

Порядок областей фиксирован: D — Status → Title/Holding → Subtitle → Bottom slot → actions; M — Status → Title → Subtitle → Bottom slot. Gap, padding и порядок принадлежат компоненту и вручную не изменяются.

Текстовые лимиты: Title — до 40 символов и двух строк; Subtitle — до 120 символов и трёх строк. Изображение обязательно выбирается из Corp Image Library с `Crop=Center`, `Size=534`; `Segment` соответствует сегменту страницы и `Appearance`.

Размеры и позиционирование ImageContainer, обрезка изображения, fade, высоты блока, gap и padding принадлежат PromoMainBlock. LightOverlay/DarkOverlay и их Presets — внутренняя реализация Appearance и вручную не выбираются. D/M сохраняют количество, тип и текст StatusBadge; различие Uppercase (`True` на D, `False` на M) принадлежит пресетам.

Отдельных loading, error, disabled и skeleton-состояний нет. Контейнер и изображение некликабельны; интерактивность разрешена только CTA, desktop Holding и интерактивному содержимому Bottom slot. PromoMainBlock активен и каноничен, replacement и legacy-вариантов нет.
