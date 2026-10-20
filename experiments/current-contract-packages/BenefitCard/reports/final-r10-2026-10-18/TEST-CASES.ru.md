# BenefitCard r10 — финальная проверка
Пакет: `/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard.r10.candidate.component-contract.zip`
SHA-256: `0f43d88103b797d763ea629541f99e8f04a861ee71b22f17a2b4e69785ef632c`.

В Editor: «Проверить инстанс», продукт AB, канал как в строке; `CardPlacement=single`. Все параметры экземпляров уже выставлены. Выбирать саму карточку по ссылке; повторный RESET для этих независимых экземпляров не нужен.

| № | Проверяемый компонент | Подготовленные параметры | Ожидаемые нарушения BenefitCard |
|---|---|---|---|
| 01 | [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14134-68892) | Link: Size=S (14-20), RightAddon=false | 0 |
| 02 | [Mobile-web](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14134-68949) | Link: Size=S (14-20) (Size-20 icons), RightAddon=false | 0 |
| 03 | [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-68971) | Link: Size=M (16-24) | 1: недопустимый Size |
| 04 | [Mobile-web](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69023) | Link: Size=L (18-24) | 1: недопустимый Size |
| 05 | [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69064) | Graphic=IconView; Shape=true, BgColor=false; Link=S (14-20) (Size-20 icons), RightAddon=true | 0 |
| 06 | [Mobile-web](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69201) | Graphic=IconView; Shape=true, BgColor=false; Link=S (14-20), RightAddon=true | 0 |
| 07 | [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69379) | BackgroundPlate.Type=Secondary; Link=S (14-20), RightAddon=false | 0 |
| 08 | [Mobile-web](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69419) | BackgroundPlate.Type=Secondary; Link=S (14-20) (Size-20 icons), RightAddon=false | 0 |

Общие параметры: Bottom=true, Presets=Link, Label=Подробнее, LeftAddon=false, Compact=False, CardAxis=Vertical, GraphicPosition=Left, Background=True, высота Hug. Размеры Link M/L являются целевой мутацией только в кейсах 03/04.

В 03/04 ожидается именно `component:web.benefit-card-bottom-link-size-14-20.1.1.1` (violation); в остальных — compliant. Прежнее text-only ограничение deprecated и не должно создавать нарушений.

Сохранить восемь JSON-отчётов в папку BenefitCard. При проверке будут сверены revision/hash, выбранный ID/канал/контекст, конкретные RuleID и unknown/not-evaluable, а не только общий счётчик.

Ожидания таблицы относятся к родительским правилам BenefitCard. Исполнение собственных правил зависимостей Link r5 / IconView r8 / BackgroundPlate r6 проверяется отдельно: исходная Draft authority не повышается автоматически. Подготовленный борд сам по себе не означает native PASS или Ready.

