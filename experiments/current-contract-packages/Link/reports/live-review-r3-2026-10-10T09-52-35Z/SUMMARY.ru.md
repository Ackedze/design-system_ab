# Link r3: четыре installed прогона, 10.10.2026

Editor 0.2.99, shared core 0.1.15. Точные Engine и Editor replay четырёх
отчётов совпали. Manual/compiled/preview и capture conditions проверены;
во всех прогонах восемь целей resolved, inconclusive=0.

- Длинный Label с fontSize=18 и tracking≈−0.36: два ожидаемых typography
  нарушения; identity сохраняется. Это не чистый положительный Label тест.
- На том же INSTANCE полный сброс вернул Label, fontSize=16, tracking≈−0.24:
  нарушений нет. Сброс с сохранением длинного текста ещё не выполнен.
- Оба Addon=false: engine без нарушений, четыре скрытые цели present/resolved.
  Editor ошибочно добавляет четыре «целевой слой не найден»; всего семь
  not-executed вместо трёх context-only. Повтор существующего hidden coverage gap.
- Повтор default baseline: нарушений нет.

Следующий технический шаг — общий hidden target coverage fix с сохранением
missing/stale/foreign guards. Затем чистый длинный Label, nested Line и public
icon swap/height negative+RESET. Link остаётся Draft. Нормы и ZIP не изменены,
исторические receipts/seals сохранены. Google нормы/Predicate не менялись.

Проверка: `node verify.cjs` (читает frozen runtime и inputs, не пишет).
