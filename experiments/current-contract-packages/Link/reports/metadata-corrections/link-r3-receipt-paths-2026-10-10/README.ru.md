# Link r3: исправление metadata handoff

Текущий вход — HANDOFF.corrected.json, final seal — seal.json. Все четыре
buildAndValidate receipts теперь содержат абсолютные пути к существующим
technical/checks логам исходного closed eval. SHA256, bytes, команды, числа
проверок и результаты подтверждены; product checks повторно не запускались.

Исходные HANDOFF.json, seal.json, логи, shared runtime source pins, нормы и
пакет не изменены. Единственная текущая supporting source metadata правка —
запись повторного случая в AP-PROC-004; прежний pin доступен в sealed source
snapshot и journal.before.md, новый — в journal.after.md и corrected handoff.

guard.py проверяет физические пути и pins, ограниченность metadata diff,
current source pins и final seal. guard-checks.json: positive PASS,
семь negative cases отклонены. Независимая приёмка General ещё не заявлена;
installed Editor 0.2.99 / Link r3 и остальные открытые gates не изменены.
