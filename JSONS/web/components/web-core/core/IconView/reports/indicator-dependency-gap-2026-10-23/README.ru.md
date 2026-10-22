# IconView → Indicator: открытый пробел зависимости

Текущий IconView r11 сохранён без изменений. Его собственные ограничения использования Indicator продолжают действовать. Собственные нормы ребёнка Indicator r2 ещё не подключены.

Нативное чтение доказывает точечный Indicator Size=8 по пути Content / Indicator в 10 вариантах IconView (16–80); у 128 его нет. Видимость связана с Indicator#70244:65. Допустимый swap TopAddon → Indicator Size=24 — отдельное вхождение, оно не подменяется точечным индикатором.

Кандидат в памяти с точными pins ребёнка валиден по схеме, но неизменный reader отвергает его: APOLLO_V4_CONTRACT_INCOMPATIBLE: Authoring preview requires ready dependencies. Это ограничение текущего runtime, не новая нормативная развилка. Ready не выставлялся ради прохождения проверки.

Следующий шаг — содержательная финальная приёмка Indicator, после неё проверить native active/inactive/UNKNOWN для фиксированного вхождения и отдельно публичного swap. Текущий IconView, ZIP и поставка не меняются. Никаких изменений engine не требуется в этом задании.

Доказательства: [gap.json](gap.json), [native-source.json](native-source.json), воспроизводимый [check.cjs](check.cjs). Проба authority не доказывает готовность capture этой зависимости.
