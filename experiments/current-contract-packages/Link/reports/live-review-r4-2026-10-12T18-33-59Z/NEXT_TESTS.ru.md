# Link r4 — повторить только высоту и восстановление

Четыре отчёта воспроизводятся точно в Engine, Editor и деталях. Публичная
замена rocket/flag и возврат diamonds проходят: 8 resolved, 0 inconclusive.
Во втором отчёте выбран rocket `Size=20`, а высота его экземпляра осталась
24 px. Нарушение высоты 40 px не было создано; корректный PASS этого снимка
не означает пропуск нарушения.

Editor **0.2.103**, пакет **Link r4**. Общие параметры Link:
Size=`M (16-24)`, Left/Right Addon=`true`, Line=`Solid`, Label=`Label`.
Через публичные поля вернуть rocket 24 слева и flag 24 справа.

В дереве Figma выбрать вложенный экземпляр
`AddonLeft → Wrapper → PaintMe → rocket`. В правой панели изменить его
фактическую высоту **H**, сохранив вариант самой иконки `Size=24`.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-15 · высота](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | На выбранном экземпляре rocket поставить **H=40 px**. Параметр `Size` иконки оставить `24`. Затем выделить корень Link и проверить в Editor. | Нарушение `component:web-core.link.left-icon-height.1.1`; 8 resolved, 0 inconclusive. |
| [LINK-15 · RESET высоты](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | На том же экземпляре вернуть **H=24 px**, сохранив rocket/flag. Затем проверить корень Link. | 0 нарушений; 8 resolved, 0 inconclusive. |

Сохранить отдельный JSON после каждой строки. Если установка H не сохраняется,
описать, какое значение видно после изменения; прогон с фактической H=24
не считать отрицательным тестом.

Три прежних context-only правила остаются неисполняемыми. Полный контракт Draft.
