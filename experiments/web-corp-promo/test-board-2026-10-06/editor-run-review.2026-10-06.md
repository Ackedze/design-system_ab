# Проверка 38 прогонов Editor · 06.10.2026

Все 38 отчётов Editor 0.2.91 сопоставлены с 38 кейсами по rootNodeId. Отчёты воспроизведены существующим runtime побайтово по JSON-результату: 38/38. Источники manual совпадают с текущими исходными пакетами. Capture warnings и compiler issues отсутствуют; topology complete во всех снимках.

Полностью завершённых проверок: 0/38. Все контракты остаются Draft. Отсутствие violation в положительных кейсах не означает принятую проверку полного контракта.

| Компонент | Прогоны | Авто-негативы: violation обнаружен | Context-only правил |
|---|---:|---:|---:|
| BenefitCard | 12 | 2/4 | 29 |
| PromoCard | 12 | 0/2 | 21 |
| BenefitsBlock | 14 | 4/6 | 29 |

Автоматически обнаружены: скрытый Graphic BenefitCard (BC-D04/M04), скрытый Title BenefitsBlock (BB-D04/M04), включённый RightAddon BenefitsBlock (BB-D06/M06).

Неопределённы: скрытый Title BenefitCard (BC-D03/M03), скрытый Title PromoCard (PC-D03/M03), скрытый Image BenefitsBlock (BB-D05/M05). Во всех шести снимках фактическое скрытие есть. Вместе с этим шесть автоматических baseline-кейсов содержат human-review.

## Причина и следующий шаг

У Title одновременно semantic.role=title получают FRAME Title и TEXT value. У BenefitsBlock semantic.role=image получают INSTANCE ImageView и RECTANGLE Image. Runtime ожидает единственную цель и делает semanticTargets неизвестным. Объявленный точный target path при этом присутствует. Требуется отделить диагностические роли от доказанной привязки конкретной цели и сохранить unknown при настоящей неоднозначности; исправление должно быть версионировано с сохранением historical replay.

Отдельно BC-D06 теряет подтверждение Title внутри изменённого nested content. У PC-D04 и PC-M06 reference-catalog-structure-drift: compliant получен по FRAME Title, хотя контракт объявляет TEXT value. Эти варианты требуют независимого native correspondence и проверки скрытия именно текста.

BC-D05/M05 (padding) и PC-D05/M05 (gap) не проверены: соответствующие правила context-only. Сначала следует исправить target identity/presence, затем подключать типизированные ограничения layout/appearance по существующим нормам и effective baseline. Остальные context-правила сохраняют явные зависимости от фактов сценария, ассетов и действий.

BB-D07/M07 остаются UNKNOWN: точный актуальный источник26 отсутствует. Исторический31-rule Draft не объявляется текущим одобренным нормативным источником. Требование fixed348 не восстановлено; fixed534 не введено.

## Матрица прогонов

| Кейс | Ожидание/маршрут борда | Результат | violation | human-review | not-executed |
|---|---|---|---:|---:|---:|
| [BB-D01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-25-25-394Z.json) | pass / auto | Baseline неполон | 0 | 1 | 29 |
| [BB-D02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-25-42-538Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BB-D03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-25-58-846Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BB-D04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-14-760Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BB-D05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-32-046Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 29 |
| [BB-D06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-47-670Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BB-D07](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-27-04-390Z.json) | unknown / source-pending | UNKNOWN · источник ожидается | 0 | 1 | 29 |
| [BB-M01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-25-33-631Z.json) | pass / auto | Baseline неполон | 0 | 1 | 29 |
| [BB-M02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-25-50-585Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BB-M03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-06-486Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BB-M04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-22-511Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BB-M05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-39-344Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 29 |
| [BB-M06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-26-55-760Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BB-M07](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitsBlock/benefits-block.validation-report.2026-10-06T15-27-12-528Z.json) | unknown / source-pending | UNKNOWN · источник ожидается | 0 | 1 | 29 |
| [BC-D01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-20-38-968Z.json) | pass / auto | Baseline неполон | 0 | 1 | 29 |
| [BC-D02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-08-457Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BC-D03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-22-211Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 29 |
| [BC-D04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-34-651Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BC-D05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-46-677Z.json) | fail / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BC-D06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-58-369Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BC-M01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-00-792Z.json) | pass / auto | Baseline неполон | 0 | 1 | 29 |
| [BC-M02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-16-025Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BC-M03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-28-455Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 29 |
| [BC-M04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-40-380Z.json) | fail / auto | Ожидаемое нарушение обнаружено | 1 | 1 | 29 |
| [BC-M05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-21-51-770Z.json) | fail / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [BC-M06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/benefit-card.validation-report.2026-10-06T15-22-03-429Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 29 |
| [PC-D01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-23-51-846Z.json) | pass / auto | Baseline неполон | 0 | 1 | 21 |
| [PC-D02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-04-960Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-D03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-20-561Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 21 |
| [PC-D04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-34-069Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 0 | 21 |
| [PC-D05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-46-435Z.json) | fail / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-D06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-58-644Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-M01](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-23-58-226Z.json) | pass / auto | Baseline неполон | 0 | 1 | 21 |
| [PC-M02](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-13-836Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-M03](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-26-393Z.json) | fail / auto | Нарушение не определено | 0 | 1 | 21 |
| [PC-M04](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-39-808Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-M05](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-24-52-211Z.json) | fail / context | Контекстная проверка не выполнена | 0 | 1 | 21 |
| [PC-M06](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/PromoCard/promo-card.validation-report.2026-10-06T15-25-05-210Z.json) | pass / context | Контекстная проверка не выполнена | 0 | 0 | 21 |

Исходные отчёты, 9 manual/compiled/ZIP, карта кейсов, код и нормативные источники не изменены. Новые Ready/release/freeze/repin не выполнены. Кодовая доработка в этом review не применялась.
