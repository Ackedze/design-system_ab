# BackgroundPlate r6 — план проверки blend mode

Статус: `PREPARED_NOT_ASSIGNED / NOT_RUN_USER_ONLY_R6`.
Рабочий пакет: `BackgroundPlate.r6.candidate.component-contract.zip`.
Editor 0.2.105 / core 0.1.18; wholeReady=false. Canvas и пользовательские
прогоны в publication296 не выполнялись. Таблица пока не является назначением
пользователю: сначала нужны согласование следующего этапа и отдельные кейсы
на canvas с полным текстом нормы и конкретным RuleID.

Норма: Blend mode BackgroundPlate и его внутренних surface-слоёв должен
совпадать с effective baseline конкретного слоя и варианта. Ручное изменение
запрещено. Критичность — error.

Доказанный исторический исходный экземпляр:
[BP-QA-21 — сам BackgroundPlate](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69177).
Это ссылка на INSTANCE, не на фрейм. Проверенный отчёт r2 от 16.10.2026
09:19:46 UTC подтверждает desktop/legacy, Position=`Level 1 (outer)`,
Type=`Colored`, Skeleton=`False` (VARIANT-строка),
BackgroundColor=`base-bg-alt (gray)`. Root key:
`34e9064066253fb2f2d7bc056bb36a2580fd860e`; surface key:
`86fe66bc39733dc333904e6428c2cb1698f3ad96`.
Текущее состояние canvas и значения blend mode этим историческим отчётом
не подтверждаются. Его нельзя считать fresh PASS r6.

| Будущий кейс | Параметры и действие | Ожидаемый результат |
| --- | --- | --- |
| BP-R6-01 — исходное состояние | Чистый desktop/legacy с параметрами выше. Получить независимые actual/effective baseline blendMode для root и surface. | 0 нарушений; оба новых RuleID исполняются и compliant, без missing facts. |
| BP-R6-02 — корень | Те же параметры. Изменить только blend mode корня на значение, отличающееся от прочитанного effective baseline. Исходное значение сохранить. | Ровно 1 новое нарушение `component:web-corp.background-plate.blend-mode-is-fixed.root.1.1`; surface compliant. |
| BP-R6-03 — поверхность | Те же параметры. Корень соответствует baseline; изменить только blend mode `target.surface` на другое значение. | Ровно 1 новое нарушение `component:web-corp.background-plate.blend-mode-is-fixed.surface.1.1`; root compliant. |

Не задавать NORMAL/PASS_THROUGH как предполагаемый эталон: значения берутся
из независимого reference текущего варианта. Для двух FAIL использовать
отдельные экземпляры; отдельный RESET-прогон не назначен. Если понадобится
восстановление для настройки следующего кейса, это действие подготовки.

Неизвестные actual/baseline проверены восемью core-регрессиями в закрытом
phase-b-window295: missing facts → UNKNOWN/human-review. Искусственно ломать
capture или делать detach ради ещё одного ручного UNKNOWN не требуется.
Прежние 23 IR и bindings не изменялись; их историческое покрытие сохраняется
с исходными pins и не объявляется свежей native проверкой r6.

Источник historical native evidence:
`BackgroundPlate/reports/live-review-r2-style-level2-2026-10-16T09-19/eval.json`,
кейс BP-QA-21; raw report
`background-plate.validation-report.2026-10-16T09-19-46-303Z.json`,
SHA256 `bc53aa2c94be3e03d0c4fb706048c579c97bf604f7cb9b8f181c682d3f96fbf8`.
Свежие ссылки на три будущих кейса будут записаны после фактического создания
и readback. На этом этапе новые node IDs не назначены.
