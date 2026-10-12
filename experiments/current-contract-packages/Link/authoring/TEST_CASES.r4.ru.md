# Link r4 — native проверка исправления

Перезапусти Editor **0.2.103** и загрузи актуальный
`../../Link.component-contract.zip` (**Link r4**). Режим «Проверить инстанс».
Общие параметры: Size=`M (16-24)`, Left/Right Addon=`true`, Line=`Solid`,
Label=`Label`; default modes. Используем один и тот же экземпляр LINK-15.
Сохраняй отдельный JSON после каждой строки.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-15 · публичные иконки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Через `Left icon 24` выбрать rocket 24, через `Right icon 24` — flag 24. | 0 нарушений, 0 неопределённых проверок, все 8 targets resolved. Политики `component:web-core.link.left-icon-swap` / `right-icon-swap` разрешают выбор asset. |
| [LINK-15 · высота выбранной иконки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Сохранить выбранные иконки; увеличить высоту левой icon INSTANCE до 40 px. | Нарушение `component:web-core.link.left-icon-height.1.1`; 8 targets resolved. Разрешённый swap сохраняет ограничение высоты. |
| [LINK-15 · RESET высоты](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Вернуть высоту левой иконки 24 px, сохранить rocket/flag. | 0 нарушений, 0 неопределённых проверок, 8 targets resolved. |
| [LINK-15 · RESET иконок](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Через те же публичные порты вернуть обе иконки diamonds 24. | 0 нарушений, 0 неопределённых проверок, 8 targets resolved. |

Три ранее известные context-only проверки остаются неисполняемыми в этом
изолированном тесте. Его PASS не означает Ready всего контракта.
