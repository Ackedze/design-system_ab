# BenefitCard → Link: оставшееся исполнение

Статус: `PREPARED_HELD`. Это план исправления reader, а не принятый код.
BenefitCard r6 — отдельный Draft candidate; рабочие ZIP, manifests и пилот сохранены.

В обоих прочитанных native кейсах BottomContent.Presets=Link содержит Core Link
`c1a788fea95f376b3c344b85ce006493b530db94`, Size=S (14-20).
BottomContent D/M различаются: `4158b0817d3da15996c620b445d98333276765b1` /
`26c17fc60aaf65818137b58279d23ceae0f8458c`. Pin Link r5 закреплён,
полный compiled closure включён в ZIP. Link r5 остаётся Draft; scoped installed
PASS не является приёмкой всего дочернего контракта.

## Подтверждённый пробел

Исходный independent parent reference содержит BottomContent.Presets=SwapMe,
а не Link/Label. Текущий fixed-nested resolver умеет доказать выбранного ребёнка
и `validatedDependencyCapture` проверяет child snapshot/nodeMap, но результаты
child rules возвращаются отдельно. Родительский semantic target не получает
identity ребёнка или его Label. `materializeVariantTextTargets` также требует
исходный TEXT в parent reference и ближайший INSTANCE=anchor; Label внутри Link
эти условия не выполняет. Имя слоя, путь или cached role не заменяют proof.

Три родительские нормы поэтому честно оставлены `context-only`:

| Source RuleID | Требование | Нужный факт |
| --- | --- | --- |
| component:web.benefit-card-bottom-link-text-only | Меняется только текст; другие свойства и устройство Link сохраняют независимый эталон BottomContent.Link | Identity-proven Link subject; исходная конфигурация владельца, исключение только разрешённого TEXT |
| component:web.benefit-card-link-content-limit | Не более 32 символов | Identity-proven child target.label → textContentV1.characterCount |
| component:web.benefit-card-link-line-limit | Не более одной строки | Та же цель → textContentV1.lineCount; недостаточное line evidence даёт UNKNOWN |

Последняя норма выделена из прежнего составного требования. Значения и область
не менялись. Не включать `auto` на корне BenefitCard: он не является текстом Link.
Не дополнять глобальный Link лимитами карточки и не менять pin под overrides.

## Минимальная доработка

1. В текущей dependency модели добавить явную привязку родительской цели к
   `dependencyId + bindingId + childTargetId`. Это отдельное opt-in declaration;
   старые контракты сохраняют семантику. Проект интерфейса хранится в
   `usage-binding-proposal.json`, вне manual/compiled текущего candidate.
2. Recompute proof через existing fixed-nested resolver, exact dependency pin,
   validated independent child capture и child target ledger. Проверить nodeMap,
   текущий source/representation, единственность owner/subject, visibility.
   Ничего не переносить через foreign/stale/ambiguous/configured swap boundary.
3. Для «только текст» сравнивать с pristine выбранным BottomContent.Link, а не
   с текущей публичной конфигурацией проверяемого Link. Глобальные разрешения
   Link не отменяют более узкую родительскую норму. Typed port identities и
   inactive properties нельзя сравнивать через предположенную нормализацию IDs.
4. Выпускать обычные IR с parent ownership. Зависимость и её authority остаются
   read-only; parent preview не повышает Draft ребёнка. Inactive Bottom —
   notApplicable; missing proof/closure/metrics — UNKNOWN с точной диагностикой.
5. Один authoring/compiler/runtime/report контур в Editor и Apollo v4. Добавить
   bounded regressions, private сборку и final handoff. Shared интеграция требует
   согласованного sole-writer окна General по APOLLO_SYNC_WORKFLOW.md.

## Проверка после реализации

Использовать существующие INSTANCE, без создания canvas во время пилота:
desktop `13608:100973`, mobile `13608:101030` в Workshop-AI.
Root: GraphicPosition=Left, CardAxis=Vertical, Background=True, Compact=False;
height=Hug; Content.Bottom=true; Bottom.Presets=Link; Graphic.Presets=Image.
Editor: ViewportClass соответствует платформе, CardPlacement=single.
Остальные поля — pristine исходного выбранного BottomContent.Link.

Для D/M: 32 символа/1 строка → 33 символа → RESET → два явно заданных текстовых
ряда при длине ≤32 → RESET. Затем изменить один публичный Boolean Link,
например Right Addon true→false, и восстановить его с сохранением custom Label.
Проверить конкретные parent RuleID отдельно от child results.

Дополнительно: Bottom=false, видимый SwapMe (старое placeholder нарушение),
missing closure/reference/Label/line metrics, stale pin/nodeMap, foreign child,
дубликат и nearest-owner mismatch. Повторить прежние 37 IR. Эти новые native
кейсы пока `NOT_RUN_USER_ONLY`; не назначать владельцу прогон неготового reader.
