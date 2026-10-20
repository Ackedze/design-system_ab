# BackgroundPlate r1 — план native проверки

Это предложенный план. Экземпляры ещё не созданы. Прямые ссылки будут добавлены после native readback; ссылки на библиотечные определения не заменяют ссылки на проверяемые экземпляры.

Первые шесть кейсов подтверждают привязки трёх семейств на desktop/mobile. Последующие кейсы проверяют новые условия и разрешения. Все ожидаемые числа относятся к исполняемым IR; 14 context-only записей не становятся принятыми из-за нуля нарушений.

| Кейс | Параметры | Мутация | Ожидаем |
| --- | --- | --- | --- |
| BP-QA-01 · desktop.legacy | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-02 · mobile-web.legacy | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-03 · desktop.promo | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-04 · mobile-web.promo | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-05 · desktop.slot | {"Type":"Primary","Skeleton":"False"} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-06 · mobile-web.slot | {"Type":"Primary","Skeleton":"False"} | Нет: свежий экземпляр публичного корня. | 0 исполняемых нарушений; доказаны root и соответствующий surface/Slot. Context-only остаются непроверенными. |
| BP-QA-07 · desktop.slot | {"Type":"Primary","Skeleton":"False"} | Изменить radius корня, сохранив компонент. | 1 целевое нарушение radius. |
| BP-QA-08 · desktop.legacy | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Изменить radius вложенного Style Level. | 1 целевое нарушение radius внутренней поверхности. |
| BP-QA-09 · desktop.slot | {"Type":"Primary","Skeleton":"False"} | Opacity корня 70%. | 1 целевое нарушение opacity. |
| BP-QA-10 · desktop.legacy | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Opacity вложенного Style Level 70%. | 1 целевое нарушение opacity внутренней поверхности. |
| BP-QA-11 · desktop.slot | {"Type":"Primary","Skeleton":"False"} | Заменить fill другим библиотечным цветовым токеном. | 1 нарушение фиксированной заливки; наличие токена не разрешает изменение Primary. |
| BP-QA-12 · desktop.legacy | {"Position":"Level 1 (outer)","nestedStyle":{"Type":"Primary","Skeleton":"False"}} | Заменить fill Style Level другим токеном. | 1 нарушение фиксированной заливки Style Level. |
| BP-QA-13 · desktop.slot | {"Type":"Colored","Skeleton":"False"} | Отвязать существующий цвет fill от токена. | 1 нарушение token binding; visible fill остаётся допустимым. |
| BP-QA-14 · desktop.slot | {"Type":"Colored","Skeleton":"False"} | Удалить fill. | 1 нарушение обязательной видимой заливки. |
| BP-QA-15 · desktop.slot | {"Type":"Colored","Skeleton":"False"} | Добавить видимую stroke с библиотечным токеном. | 1 нарушение запрета stroke; token binding не отменяет запрет. |
| BP-QA-16 · desktop.slot | {"Type":"Border","Skeleton":"False"} | Добавить видимую fill с библиотечным токеном. | 1 нарушение запрета fill. |
| BP-QA-17 · desktop.slot | {"Type":"Border","Skeleton":"False"} | Отвязать существующий stroke color от токена. | 1 нарушение token binding обводки. |
| BP-QA-18 · desktop.slot | {"Type":"Border","Skeleton":"False"} | Сохранить stroke token; изменить weight=4, align=OUTSIDE, dash=[8,4]. | 0 целевых нарушений: параметры stroke разрешены. Не считать это доказательством DS membership. |
| BP-QA-19 · desktop.slot | {"Type":"Primary","Skeleton":"False"} | Padding корня 7/11/13/17; в native Slot Axis=Horizontal, Gap=19, Align=Center, переключить Clip; добавить обычный контент. | 0 исполняемых нарушений; root/Slot сохраняют proof, внешний контент не наследует защиту surface. |
| BP-QA-20 · desktop.slot | {"Type":"Primary","Skeleton":"True"} | Штатный вариант Skeleton=True. | 0 исполняемых нарушений; не проверяет смысл ручного placeholder и исключения паттерна. |

RESET нужен один раз для каждого реально изменённого экземпляра после серии мутаций, а не после каждой строки. Невозможную мутацию без detach помечаем отдельно и не предлагаем пользователю.

Level2→Secondary проверен только контрфактическим synthetic входом: в актуальном native API такого варианта нет. Shadow, blend mode, контекст уровней/страницы, Promo collection, кликабельность и библиотечная принадлежность цветов в эту native приёмку не входят.
