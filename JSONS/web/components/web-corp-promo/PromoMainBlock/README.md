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

## Подтверждённая семантика — раунд 1

PromoMainBlock — главный промо-блок с ключевым сообщением, изображением и CTA. На странице он всегда расположен первым и используется только один раз.

Публичные корни — только `[D] PromoMainBlock` и `[M] PromoMainBlock`. ButtonGroup, SwapMe, LightOverlay и DarkOverlay являются внутренними семействами и отдельно не вызываются.

На desktop `View=Page` используется на странице, `View=Modal` — внутри модального контейнера. Mobile использует единый root в обоих контекстах. `Compact=True` обязателен при viewport `<=1024 px` или когда контент не помещается в стандартный формат.

`Appearance` не является темой и выбирается по сегменту и поверхности: `Light` используется на светлых цветных подложках сегмента ММБ, `Dark` — на тёмной подложке сегмента КИБ. На desktop для `View=Page` обязательно использовать `Background=False`; `Background=True` возвращает `error`. В mobile-web разрешён только `Background=True`; `Background=False` возвращает `error`.

BlurEffect обрезает изображение по нижнему краю и добавляет fade. Для `View=Page` он обязателен; для `View=Modal` остаётся опциональным.

Между D/M сохраняются контент, изображение, Status, Bottom slot, набор действий и `Appearance`. `View` и `Compact` остаются desktop-only. `Background` следует платформенному правилу и намеренно различается для page-сценария: `False` на D, `True` на M.

Title, Subtitle и ImageContainer обязательны. Status опционален: разрешено от одного до трёх StatusBadge, каждый наследует полный контракт StatusBadge. Один статус — штатный вариант; два или три возвращают `warning`, больше трёх — `error`. Holding используется только когда пользователь работает от группы компаний и наследует контракт FilterCompanySelect/AccountSelect; состояние сохраняется между D/M.

Bottom slot опционален и принимает простой текст либо произвольный компонент. CTA также опциональны: допустимы Primary, Secondary, оба действия или полностью скрытый action-блок. На mobile вместо ButtonGroup используется figma-only пресет `🔒 [M] ButtonStack`; его отдельный pattern contract будет добавлен позже.

Порядок областей фиксирован: Status → Title/Holding → Subtitle → Bottom slot → actions. Gap, padding и порядок принадлежат компоненту и вручную не изменяются.

Текстовые лимиты: Title — до 40 символов и двух строк; Subtitle — до 120 символов и трёх строк. Изображение обязательно выбирается из Corp Image Library с `Crop=Center`, `Size=534`; `Segment` соответствует сегменту страницы и `Appearance`.

Размеры и позиционирование ImageContainer, обрезка изображения, fade, высоты блока, gap и padding принадлежат PromoMainBlock. LightOverlay/DarkOverlay и их Presets — внутренняя реализация Appearance и вручную не выбираются. D/M сохраняют количество, тип и текст StatusBadge; различие Uppercase (`True` на D, `False` на M) принадлежит пресетам.

Отдельного loading-состояния нет. Контейнер некликабелен; интерактивность разрешена только CTA, Holding и интерактивному содержимому Bottom slot. PromoMainBlock активен и каноничен, replacement и legacy-вариантов нет.
