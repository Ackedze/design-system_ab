# IconView r10: финальная проверка TopAddon

Пакет: `../../IconView.r10.candidate.component-contract.zip`.
Результаты ниже получены текущим Core0.1.22 и фактическим установленным reader
Apollo на неизменённых снимках из трёх отчётов владельца от 20.10.2026.
Снимки и исходные отчёты не исправлялись.
Новых native-прогонов нет; повторять вручную эти кейсы не требуется.

Общие параметры корня: `Size=64`, `Shape=true`, `Border=true`, `TopAddon=true`,
`BottomAddon=false`, `Indicator=false`. Последний параметр — встроенный boolean
корня, а не компонент Indicator, которым заменён верхний аддон.

| Компонент | Параметры | Ожидаем / получено при replay r10 |
| --- | --- | --- |
| [IV-RDY-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14213-59252) | Исходный TopAddon: IconView `Size=24` | 0 нарушений / 0 |
| [IV-RDY-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14213-59255) | TopAddon заменён на Indicator `Size=24`, `Border=False` | 0 нарушений / 0 |
| [IV-RDY-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14213-59258) | TopAddon заменён на Indicator `Size=16`, `Border=False` | 1 нарушение / 1 |

В третьем кейсе проверяется
`component:web-core.icon-view.top-addon-indicator-replacement.1.1`.
Native `Size` и `Border` у Indicator — строки VARIANT, у корня boolean-параметры
передаются как boolean. Правильная замена не подчиняется внутреннему baseline
другого семейства; собственные ограничения карточки IconView сохраняются.

Доказательства, exact pins и scope: [EVAL.json](EVAL.json).
Admission исправлен; r10 установлен и доступен в Apollo для локальной проверки
Figma. Reader подтвердил exact compiled hash, 81 IR, 0 nonExecutable и полное
исполнение трёх кейсов. Статус Ready ограничен этой областью. Пять внешних
обязательств паспорта/контекста/общих библиотек, frontend и генерация остаются
отдельными. После обновления кода плагина следует заново открыть Apollo.
