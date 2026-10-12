# Link r3 · Draft

Пакет подготовлен для Editor **0.2.99**, shared core **0.1.15**. Сохраняются
18 исходных норм, 32 IR, 4 Size и 8 semantic targets. Новый явный identity opt-in
отделяет root Label/BOOLEAN values от source identity; visual baseline и guards
сохраняются. Nested Line и icon swap scope этим изменением не закрыты.

Пять неизменённых Editor r2 snapshots проходят локальный replay r3 без violations
и human-review, восемь targets resolved. Installed r3 ещё NOT_RUN_USER_ONLY.
Исторические r1/r2 файлы и seals сохранены, полная приёмка не объявлена.

Четыре source conflicts, три context-only правила и global icon policy остаются
открыты. BenefitCard r5 не изменён. Нужна отдельная проверка интеграции Link pin.

Тесты: [TEST_CASES.r3.ru.md](TEST_CASES.r3.ru.md). Карта: [coverage-map.r3.json](coverage-map.r3.json).
Eval: [r3](../reports/skill-evals/link-r3-root-configuration-2026-10-10/eval.json).
