# Benefits — component contract

Папка содержит generated- и manual-слои component contract для **Web _ Сorp Promo Components / Benefits**.

## Статус

**Ready.** Generated-слой актуален, manual-секции заполнены по результатам анкетирования и подтверждены владельцем AB-слоя 2026-07-29. Targeted Athena checks и проверки Apollo пройдены.

## Назначение

`🔒 [D] Benefits` и `🔒 [M] Benefits` — активные канонические Figma-only пресеты для группы из трёх или четырёх BenefitCard на лендинге. Знак `🔒` обозначает Figma-only, а не legacy. Для поддерживаемого количества агент создаёт экземпляр пресета по component key. Если карточек меньше трёх или больше четырёх, разрешена ручная композиция отдельных BenefitCard без Benefits.

Вложенные BenefitCard остаются настраиваемыми. Значения `Background`, `CardAxis`, `Compact` и `GraphicPosition` должны совпадать у всех карточек внутри одного пресета. Для поверхностей общего типа `Border` или общего типа `Colored` допускаются разные цвета заливки и обводки отдельных карточек, но только через разрешённые токены BackgroundPlate.

Title, Subtitle, Graphic и BottomContent могут различаться и наследуют правила BenefitCard. Desktop и mobile-web версии сохраняют одинаковые Capacity, порядок и содержимое карточек; ручная перестановка разрешена, если она синхронно повторена на обеих платформах. Корень использует Fill по ширине и Hug по высоте; все карточки пресета имеют одинаковую высоту. Gap, padding, axis и wrap принадлежат пресету и вручную не меняются. Loading/Skeleton включается одновременно для всей группы.

Вложенную BenefitCard нельзя заменять через instance swap. Сам Benefits не имеет общего действия: отдельные карточки могут вести к разным целям, но внутри группы они должны быть либо все кликабельными, либо все некликабельными.

Raw Figma catalog остаётся source of truth:

`../../../../web/components/web-corp-promo/Web _ Сorp Promo Components -- Benefits.json`

## Файлы

- `contract.generated.json` — сгенерированный compact contract, извлечённый из raw Figma catalog.
- `contract.overrides.json` — semantic layer, заполняемый вручную.
- `composition-contract.json` — context владения internal instances.
- `rules.json` — component-level classification и design rules.
- `audit-mapping.json` — модель группировки Apollo.
- `examples.json` — примеры трактовки.
- `agent-context.json` — compact context для интерпретации на стороне агента.

## Ограничение pipeline

Benefits публикуется и обнаруживается Apollo через `JSONS/apollo/indexes/componentContractIndex.json`, который содержит component keys и ссылки на package artifacts. Legacy-сборщик `apollo-rules-registry.json` сейчас включает только packages из `web/components/web-corp/`, поэтому rule IDs из `web-corp-promo/Benefits` в этот legacy registry не копируются. Это ограничение общего инструментария, а не component semantics.

## Источник

- Библиотека: `Web _ Сorp Promo Components`
- Сгенерировано: `2026-07-27T13:29:07.697Z`
- Компонентов: `2`
