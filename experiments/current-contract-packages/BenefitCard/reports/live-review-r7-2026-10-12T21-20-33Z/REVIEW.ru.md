# BenefitCard r7: два исходных baseline

Оба отчёта воспроизводятся текущим reader byte-equivalent. Editor 0.2.104, manual r7 и точный Link r5 pin загружены правильно. Baseline не принят.

| Компонент | Фактические параметры | Результат |
| --- | --- | --- |
| [Desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | ViewportClass=desktop, Label=Label, высота HUG; CardPlacement отсутствует | Все три новых Link usage правила UNKNOWN; Hug условие UNKNOWN |
| [Mobile](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | ViewportClass=mobile-web, Label=Label, высота HUG; CardPlacement отсутствует | Все три новых Link usage правила UNKNOWN; Hug условие UNKNOWN |

Validated child capture/nodeMap проходит. Child declared target.label не разрешается: `reference-pin-stale`. Эталон Link r5 имеет 10 полей API и 4 Size, встроенная опубликованная Link — 8 полей и 3 Size. Внутри карточки нет `Left icon 20#145985:35` и `Right icon 20#145985:40`. Причина различия источников не установлена; их native definitions подтверждены read-only в Figma. Family keys совпадают, но этого недостаточно для приёмки source/reference identity.

Каждый отчёт: 320 Compliant, 4 human-review, 2 not-applicable, 38 child not-evaluable. Последние сохраняют Draft authority Link и не являются доказанной проверкой child правил. Нулевое число violations не означает PASS.

Дальнейшее изменение зависит от нормативного источника: опубликованная библиотечная Link либо эталон r5. Вопрос передан владельцу. Guard не ослабляется и package не перепривязывается к текущим overrides. После согласования источник/контракт приводятся в соответствие отдельным новым candidate, затем повторяются два baseline.

В следующем запуске обязательно установить поле «Контекст: Способ размещения» в `single`; текущая высота HUG уже подтверждена. Label=Label допустим по лимитам и сам по себе не требует нового кейса лишь ради другого разрешённого текста.

Editor/shared core/v4 и canvas не изменены. Бэклог и реестр актуализированы; v4 перенос остаётся HELD_UNTIL_CONTRACT_ACCEPTANCE. Полный BenefitCard и Link — Draft.
