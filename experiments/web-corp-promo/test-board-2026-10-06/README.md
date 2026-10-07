# Промо-компоненты: борд контрактных кейсов

[Открыть борд в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66494)

Создано 38 кейсов: BenefitCard — 12, PromoCard — 12, BenefitsBlock — 14. Каждая строка содержит Desktop и Mobile-web. Section ID: 13418:66494; layout ID: 13418:66495. Полный список созданных IDs сохранён в board-audit.json.

Кейсы содержат ожидаемые результаты. Прогоны в Editor не выполнялись. AUTO требует подтверждённых native bindings и Reviewed; пакеты сейчас Draft. КОНТЕКСТ означает ручную проверку нормы, которая не исполняется автоматически текущим пакетом. BB-D07 и BB-M07 помечены SOURCE-PENDING / UNKNOWN: историческая редакция из 31 правила не является подтверждённой актуальной нормой; ожидается источник из 26 правил, указанный в Ledger495.

Проверены библиотечная identity всех 38 корней, сохранность instance, значения целевых mutations, токены/текстовые стили подписей и отсутствие выхода субъекта за рамку кейса. Финальный скриншот просмотрен. UI остаётся редактируемым; IMAGE fills принадлежат вложенным библиотечным ImageView, а не снимкам интерфейса.

Все композиционные рамки — Auto Layout. Отступы борда: Spacing/64; семейств: Spacing/32; кейса: Spacing/16. Gap между семействами — 64, внутри пары — 32, между подписью и субъектом — 16. Тема — BlueTint Light. BenefitCard имеет Vertical=Hug, BenefitsBlock — Fill/Hug. PromoCard сохраняет штатную геометрию опубликованного Small-варианта. Геометрия лабораторного превью не задаёт viewport; desktop предполагает viewport > 1024 px.

В BenefitsBlock сохранён штатный ImageView.Size=534. Требование к 348 отменено; новый фиксированный размер не введён. Контекстные расхождения loading/click/Compact не использованы для новых кейсов.

| Компонент | Пара | Кейс | Ожидание | Тип | RuleID |
|---|---|---|---|---|---|
| BenefitCard | [BC-D01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66511) / [BC-M01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66536) | Эталон | Без нарушения | AUTO | component:web.benefit-card.title-and-graphic-required |
| BenefitCard | [BC-D02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66562) / [BC-M02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66587) | Без Subtitle | Без нарушения | КОНТЕКСТ | component:web.benefit-card.title-and-graphic-required |
| BenefitCard | [BC-D03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66613) / [BC-M03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66638) | Скрыт Title | Нарушение | AUTO | component:web.benefit-card.title-and-graphic-required |
| BenefitCard | [BC-D04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66664) / [BC-M04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66689) | Скрыт Graphic | Нарушение | AUTO | component:web.benefit-card.title-and-graphic-required |
| BenefitCard | [BC-D05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66715) / [BC-M05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66740) | Изменён padding | Нарушение | КОНТЕКСТ | component:web.benefit-card.visuals-follow-effective-baseline |
| BenefitCard | [BC-D06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66766) / [BC-M06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66816) | Compact=True | Без нарушения | КОНТЕКСТ | component:web.benefit-card.compact-uses-secondary-title |
| PromoCard | [PC-D01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66864) / [PC-M01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66889) | Эталон | Без нарушения | AUTO | component:web.promo-card.title-required |
| PromoCard | [PC-D02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66916) / [PC-M02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66941) | Без Subtitle | Без нарушения | КОНТЕКСТ | component:web.promo-card.title-required |
| PromoCard | [PC-D03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66968) / [PC-M03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-66993) | Скрыт Title | Нарушение | AUTO | component:web.promo-card.title-required |
| PromoCard | [PC-D04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67020) / [PC-M04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67065) | Позиция изображения | Без нарушения | КОНТЕКСТ | component:web.promo-card.title-required |
| PromoCard | [PC-D05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67111) / [PC-M05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67136) | Изменён gap | Нарушение | КОНТЕКСТ | component:web.promo-card.visuals-follow-effective-baseline |
| PromoCard | [PC-D06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67163) / [PC-M06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67207) | ImageCrop=True | Без нарушения | КОНТЕКСТ | component:web.promo-card.image-view-overrides |
| BenefitsBlock | [BB-D01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67260) / [BB-M01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67291) | Эталон · Size=534 | Без нарушения | AUTO | component:web.benefits-block.title-and-image-are-required |
| BenefitsBlock | [BB-D02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67322) / [BB-M02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67353) | Без ContentPresets | Без нарушения | КОНТЕКСТ | component:web.benefits-block.content-preset-semantics |
| BenefitsBlock | [BB-D03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67384) / [BB-M03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67415) | Без ButtonGroup | Без нарушения | КОНТЕКСТ | component:web.benefits-block.button-group-is-optional |
| BenefitsBlock | [BB-D04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67446) / [BB-M04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67477) | Скрыт Title | Нарушение | AUTO | component:web.benefits-block.title-and-image-are-required |
| BenefitsBlock | [BB-D05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67508) / [BB-M05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67539) | Скрыт Image | Нарушение | AUTO | component:web.benefits-block.title-and-image-are-required |
| BenefitsBlock | [BB-D06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67570) / [BB-M06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67608) | Включён RightAddon | Нарушение | AUTO | component:web.benefits-block.right-addon-must-be-hidden |
| BenefitsBlock | [BB-D07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67646) / [BB-M07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8?node-id=13418-67677) | Gap · источник ожидается | UNKNOWN | SOURCE-PENDING | Исторический ID: component:web.benefits-block.layout-is-component-owned |

Использованные варианты: BenefitCard Background=True, CardAxis=Vertical, GraphicPosition=Left, Compact=False/True; PromoCard Size=Small, Image=Bottom/Top, ImageCrop=False/True; BenefitsBlock D Image=Right, HeightCustom=False, Background=True, Compact=False и M Image=Bottom, Background=True. Изображения и тексты эталона оставлены из библиотеки, чтобы не добавлять независимые overrides.

## Каталоги

- [Web _ Сorp Promo Components -- BenefitCard.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/Web _ Сorp Promo Components -- BenefitCard.json>)
- [Web _ Сorp Promo Components -- PromoCard.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/Web _ Сorp Promo Components -- PromoCard.json>)
- [Web _ Сorp Promo Components -- BenefitsBlock.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/Web _ Сorp Promo Components -- BenefitsBlock.json>)
- [Web _ Typography.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/styles/Web _ Typography.json>)
- [001 _ Interface Dynamic Colors.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/tokens/001 _ Interface Dynamic Colors.json>)
- [Spacing.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/tokens/Spacing.json>)

## Агентские файлы

- [agent-context.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/agent-context.json>)
- [rules.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/rules.json>)
- [composition-contract.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/composition-contract.json>)
- [contract.generated.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/contract.generated.json>)
- [contract.overrides.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/contract.overrides.json>)
- [agent-context.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/PromoCard/agent-context.json>)
- [rules.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/PromoCard/rules.json>)
- [composition-contract.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/PromoCard/composition-contract.json>)
- [contract.generated.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/PromoCard/contract.generated.json>)
- [contract.overrides.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/PromoCard/contract.overrides.json>)
- [agent-context.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitsBlock/agent-context.json>)
- [rules.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitsBlock/rules.json>)
- [composition-contract.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitsBlock/composition-contract.json>)
- [contract.generated.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitsBlock/contract.generated.json>)
- [contract.overrides.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitsBlock/contract.overrides.json>)
- [contract.manual.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp-promo/BenefitCard/authoring/contract.manual.json>)
- [contract.manual.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp-promo/PromoCard/authoring/contract.manual.json>)
- [contract.manual.json](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp-promo/BenefitsBlock/authoring/contract.manual.json>)

## Паттерны

Не использовались. Борд — лабораторная матрица тестов, а не продуктовая страница.

## Редполитика

- [redpol_rules_context.md](</Users/alexkukhta/Desktop/workplace/shared/design-system_ab/redpolrules/redpol_rules_context.md>)

Применены орфография с ё, пробелы вокруг тире, нейтральные подписи и числовые формы без буквенных наращений.

