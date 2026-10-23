# Status Core r1 — первый нативный тест

Результат PARTIAL. Все четыре заданных нарушения найдены по точным RuleID и значениям, но ST-02/ST-03/ST-08 не имеют полного исполнения.

| Кейс | Нарушения: ожидали / получили | Неопределённых |
| --- | --- | --- |
| ST-01 | 0 / 0 | 0 |
| ST-02 | 0 / 0 | 18 |
| ST-03 | 0 / 0 | 9 |
| ST-04 | 0 / 0 | 0 |
| ST-05 | 1 / 1 | 0 |
| ST-06 | 1 / 1 | 0 |
| ST-07 | 1 / 1 | 0 |
| ST-08 | 1 / 1 | 9 |

Итого: 388 compliant, 75 not-applicable, 36 human-review, 4 violation. Область: 8 проверенных корней, 10 governed частей, 1 notChecked — вложенный Label после Uppercase=True. Скан полный, executionComplete=false у трёх корней и области.

- Девять неопределённых проверок типографики: explicit semantic target Label/Text не разрешается после штатной смены вложенного Uppercase. Независимый baseline вложенного варианта при этом получен.
- 27 проверок на Fixer в native SLOT: для содержимого нет source identity и effective baseline. SLOT/Fixer присутствуют в anatomy; это не пропущенный слой. Неизвестные значения нельзя подменять совпадением.

В [typography-probe.json](typography-probe.json) сохранён повтор на исходных native snapshots тем же frozen runtime. Исходные 36 UNKNOWN воспроизведены. Существующий descendant typography baseline вместо искусственного explicit Label selector убирает девять UNKNOWN без потери нарушения шрифта. Остаются 27 UNKNOWN на SLOT/Fixer; native area notChecked этим probe отдельно не проверен.

Новый пакет не выпущен, текущий manual/ZIP/data и прежние seals не изменены. Сначала нужно корректное поддержанное описание ownership содержимого SLOT. Произвольное разрешение, исключение или доработка движка этой проверкой не авторизованы. Пробу не считать свежим native PASS. Повтор владельцем до исправления не нужен; контракт остаётся Draft.

[Исходный отчёт gzip](owner-report.json.gz), [сверка](review.json), [eval](eval.json).
