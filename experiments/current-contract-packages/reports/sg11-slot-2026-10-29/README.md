# SG-11: исправление предупреждения native Slot

Исправлено в локальной сборке Apollo: произвольный объект внутри подтверждённого native Slot не требует совпадения с библиотечным эталоном. Тип Slot, native binding, тип порта и ближайший владелец проверяются по независимому текущему эталону. Сам Slot, родитель, соседние узлы и другие предупреждения сохраняются; raw IDs и warnings остаются в полной диагностике.

Изменены только src/native-slot-diagnostics.ts, его вызов в code.ts, regression test и README Apollo. Перенос правил в родительский контракт отклонён до canonical записи; первые отказы сохранены. Все контракты, пакет данных46, portable runtime d058 и shared core/compiler/predicates сохранены. Переупаковка данных/Proxy не требуется.

Проверки: npm run validate — 1404/1404. На сохранённом отчёте554dec2a439d:56полных проверок,30точных owner contexts,прежние12нарушений,0UNKNOWN; убрано только предупреждениеSG11. Три opacity-мутации группы/Segment/Addon по-прежнему нарушают baseline.

Для свежей проверки владелец перезапускает Apollo из projects/Apollo/manifest.json и проверяет [SG-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75566), оставив подготовленное произвольное содержимое Slot. Ожидаем0локальных нарушений/UNKNOWN и0предупреждений о несовпадении Slot payload с эталоном. Fresh Figma: NOT_RUN_USER_ONLY.

Результат: RESULT.json; replay: NATIVE-REPLAY.json; защита runtime: PROTECTED-PINS.json; обучение: lessons.json. Коммит Apollo: 5031134aada5a5f6e60212b02564a6d93f09d825. Публикация/push/установка не выполнялись.
