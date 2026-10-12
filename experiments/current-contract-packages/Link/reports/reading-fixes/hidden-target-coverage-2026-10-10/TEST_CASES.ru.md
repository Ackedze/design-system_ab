# Проверка Editor 0.2.100: Link r3

Перезапусти Editor **0.2.100**, загрузи существующий
`current-contract-packages/Link.component-contract.zip`. Режим «Проверить инстанс»,
representation `core.web.link.figma.universal`, Size=`M (16-24)`, Line=`Solid`.
После каждого шага скачай отдельный JSON. Три context-only пункта остаются.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67948) | Left/Right Addon=false; Label=`Label`; типографика эталонная | 0 violations, 0 inconclusive, 8 resolved; 3 not-executed. Четыре скрытые цели не названы потерянными |
| [LINK-06 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67948) | На том же экземпляре Left/Right Addon=true | 0 violations, 0 inconclusive, 8 resolved; 3 not-executed |
| [LINK-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Label=`Открыть подробные условия обслуживания`; Left/Right Addon=true; fontSize=16, tracking≈−0.24, line-height=24 | 0 violations, 0 inconclusive, 8 resolved; 3 not-executed |

Следующие блоки после этого receipt: nested Line/Pseudo; public icon swap/height
negative+RESET. LINK-13 всё ещё FIXTURE_NOT_PREPARED: не выдавать его как готовый тест.
BenefitCard Title D/M hidden/visible installed control остаётся отдельным блоком;
12 offline replays не заменяют новые live отчёты.
