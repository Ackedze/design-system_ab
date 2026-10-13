AP-PROC-015 / AP-PROC-006 — Link native icon Size, 12.10.2026.

Факт: правило соответствия размера asset публичному слоту из bridge/cookbook
было сохранено только в разрешении swap; отдельного исполняемого ограничения
в r4 не было. Снимок rocket Size=20 в активном слоте24 имел fitted H=24 и
законно проходил имеющийся height predicate. Автор предложил менять H вручную;
владелец подтвердил, что без detach это недоступно. Следствие — неправильно
выбран отрицательный тест и ошибочный вывод о полноте покрытия размера иконки.
Исторический геометрический verdict не меняется.

Исправление: отдельный Draft r5 candidate с шестью условными native Size
domain predicates. Прежние 18 норм / 32 IR, bindings и API сохранены. Повтор
четырёх actual captures на candidate: 0/1/0/0, все8resolved, UNKNOWN0;
missing Size даёт UNKNOWN, неактивный Addon — notApplicable. ZIP reopen и
Engine/Editor parity PASS. Правила1910–1915 / Леджер504 и Predicate Draft
сверены чтением. Fresh installed r5 и независимая приёмка ещё не выполнены.

Защита в этой области: source → actual IR отдельно для совместимости asset;
проверять достижимость отрицательной мутации через native API; не подменять
intrinsic Size измеренной геометрией, не нормализовать строки s/m без native
source proof. NEXT_TESTS.ru.md заменяет недоступный H-case публичным Size20.
Подтверждённое знание сохранено в candidate/eval/lessons; shared skills и
инструкции пилота не менялись.

Повтор AP006: начальный helper поднялся на лишний сегмент родителя и получил
MODULE_NOT_FOUND до записи candidate данных. Исправлен exact cwd и existence
preflight. Отдельный wrong-root negative останавливается до записи. Причина
ошибки установлена; stdout/stderr отрицательной проверки сохранены. Исправление
не меняло canonical contracts, shared source/build/config или runtime процесса.

Ответственный: Contract Creation. Статус: локальный candidate и синхронизация
проверены автором; General закрывает запись после независимой проверки защиты.
Evidence: эта папка, verification-inputs.json, replay.json, additional-checks.json,
registry-sync.json, verify.cjs, HANDOFF.json и seal.json.
