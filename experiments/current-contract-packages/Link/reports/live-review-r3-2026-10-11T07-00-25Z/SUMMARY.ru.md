Link r3 · Editor 0.2.101 · core 0.1.16 · 11.10.2026, 10:00 MSK.

| Прогон | Фактически | Приёмка |
|---|---|---|
| Замена Left/Right icon 24 на rocket/flag | 0 нарушений, 32 inconclusive, 0 из 8 targets resolved | FAIL: чтение разрешённого публичного swap |
| RESET обеих иконок в том же INSTANCE | 0 нарушений, 0 inconclusive, 8 из 8 targets resolved | PASS_SCOPED |

Оба capture полные: 17 nodes, нет warnings и unmatched baseline nodes.
Источник, manual r3, compiled и evaluated contract совпадают с закреплённым
пакетом. Все Engine/Editor/details воспроизведены точно через frozen core
0.1.16 и совместимые API frozen Editor 0.2.100; фактическая версия отчётов —
Editor 0.2.101. Его capture implementation отдельно не пересобиралась.

В обоих прогонах INSTANCE 13666:68129, Size=M (16-24), Line=Solid,
оба Addon=true, Label=Label. Root layout/appearance, Label typography и
context не менялись. У двух иконок 24×24 сохранены sourceNodeId 493:8525 /
493:8878, текущий host owner и точные публичные INSTANCE_SWAP-порты.

Причина: configuration reference hash v1 исключает только typed root
TEXT/BOOLEAN. Значения INSTANCE_SWAP и структура выбранных asset остаются
в whole reference pin. В swapped capture все восемь целей получают
reference-pin-stale: 31 selector UNKNOWN и 1 отсутствующее configured Size
дают 32 human-review. Возврат исходных diamonds восстанавливает hash и цели.
Hash-only probes подтверждают, что корневые swap values сами меняют pin;
возврата только этих values недостаточно при сохранении swapped subtree.
Эти probes не являются live тестом или исправлением.

Три прежних context-only правила остаются not-executed. Link остаётся Draft.
Нормы, root ZIP, manual, compiled и product code не менялись. Следующий шаг —
исправить identity/correspondence публичных swap-портов в общем core; до этого
повторять данный ручной кейс не нужно. План: FIX_PLAN.ru.md.
