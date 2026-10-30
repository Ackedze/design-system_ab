# TitleView r2: самостоятельный TitleStatus

Решение владельца: TitleStatus разрешён без верхнего Status. Удалено старое требование Status=true из актуальных источников; разрешение связано с существующей API policy. View-доступность и согласование Type при двух видимых статусах сохранены.

Контракт остаётся Draft: 7 authoring-правил, 42 исполняемых IR с прежней семантикой. Остальные пробелы перечислены в coverage-map.json. Прежние r1 ZIP, отчёты и seals сохранены.

| Компонент | Параметры | Ожидается |
| --- | --- | --- |
| [TV-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78380) | View=xLarge; Skeleton=False; Status=false; TitleStatus=true | 0 нарушений этого условия |

Нативная проверка Apollo: NOT_RUN_USER_ONLY. Остальные 21 кейс прежней партии не изменены; повторный полный прогон не приписан.

Локальный пакет: 1.4.4-data.20261030.2, 51 контракт, обновлён только TitleView. Защищённый consumer PASS; PENDING_PUBLICATION. Публикация, установка и изменения движка не выполнялись.
