# BackgroundPlate r2: BP-QA-21–25

Секция: https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69168

Пакет тот же r2, manualSourceHash `c3aab9b3080f0983983a226c67bb4617b59f1e7d56f130df081f7ab0ff8aa9e3`. Desktop, Skeleton=False (VARIANT), BackgroundColor=base-bg-alt (gray). Все пять исходных состояний уже подготовлены. Запускайте проверку по самому INSTANCE.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [BP-QA-21](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69177) | Legacy, Position=Level 1 (outer), Type=Colored | 0 нарушений |
| [BP-QA-22](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69186) | Legacy, Position=Level 1 (outer), Type=Border | 0 нарушений |
| [BP-QA-23](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69195) | Promo, Position=Level 2 (inner), Type=Primary | 0 нарушений |
| [BP-QA-24](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69205) | Legacy, Position=Level 1 (outer), Type=Colored, без токена Fill; RGB сохранён | 1 нарушений |
| [BP-QA-25](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69214) | Legacy, Position=Level 1 (outer), Type=Border, без токена Stroke; RGB сохранён | 1 нарушений |
| [BP-QA-25 RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=14056-69214) | Восстановить токен Stroke `neutral-translucent/300` во вложенном Style; оставить Type=Border | 0 нарушений |

Сохранить отдельный отчёт для каждой строки. Ноль нарушений у контролей принимается только при активном исполнении перечисленных в case-map.json RuleID; UNKNOWN/notApplicable не считается PASS.

Негативные кейсы:
- BP-QA-24: `component:web-corp.background-plate.colored-and-border-use-color-tokens.surface.fill.1.1`.
- BP-QA-25: `component:web-corp.background-plate.colored-and-border-use-color-tokens.surface.stroke.1.1`.

Сначала 21–23. Если есть UNKNOWN, пропущенные привязки или неожиданное нарушение, остановить серию и сохранить первый отчёт. Проверка механизма токенов Slot переиспользуется отдельно; новые Style bindings не объявлены native PASS до отчётов Editor.
