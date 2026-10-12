# Проверка Link r3

Перезапусти Editor, проверь версию **0.2.99**, загрузи актуальный
`Link.component-contract.zip` из current-contract-packages. Режим «Проверить
инстанс», representation `core.web.link.figma.universal`, Size=`M (16-24)`,
Line=`Solid`. Каждый URL выбирает конкретный INSTANCE. Скачай JSON после шага.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Label=`Открыть подробные условия обслуживания`; Left/Right Addon=true; fontSize=16 | 0 violations, 0 inconclusive; 8 targets resolved |
| [LINK-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67948) | Left/Right Addon=false; Label=`Label`; fontSize=16 | 0 violations, 0 inconclusive; 8 targets resolved |
| [LINK-05 · нарушение](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Сохрани длинный Label и оба Addon=true; у текстового слоя Label fontSize=18 | violation `component:web-core.link.label-typography.1.2`; 0 inconclusive |
| [LINK-05 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | На том же INSTANCE верни только fontSize=16; длинный Label остаётся | 0 violations, 0 inconclusive; 8 targets resolved |

Три context-only нормы могут оставаться not-executed: это отдельный открытый
scope. Не считай whole contract Ready по этим четырём отчётам. Остальные кейсы
с условиями сохранены в `case-matrix.r3.json`; LINK-13 пока FIXTURE_NOT_PREPARED.
