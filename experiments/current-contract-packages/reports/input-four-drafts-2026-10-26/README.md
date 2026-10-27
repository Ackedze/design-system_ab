# Input / NumberInput / AmountInput / Select · Draft r1

Подготовлены четыре контракта на Core 0.1.24 без изменений движка. Четыре source-пакета читаются установленным Apollo main в VM; подмена stamp отклоняется. 35 текущих пакетов проверены. Обновление содержит 32 checking-контракта: прежние 28 и generation сохранены.

## Публикация и обновление

1. Закоммитить и запушить подготовленные данные из shared/design-system_ab.
2. В AP:On выполнить «Проверить обновление» и установить обновление данных.
3. В текущем Apollo выбрать контракты из Proxy и проверить борд ниже.

Сейчас пакет подготовлен локально: push и установка не выполнялись.

[Борд в лаборатории](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14522-71847).

## Проверки

Экземпляры уже настроены. Для desktop-кейсов выбери платформу Desktop, для кейсов 02 — Mobile-web.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [IN-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14522-72918) | Desktop; Size=56, OuterLabel=False; штатный пустой вариант. | 0 |
| [IN-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14525-72917) | Mobile-web; Size=48, OuterLabel=True, FilledState=True. | 0 |
| [IN-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14525-72953) | Desktop; Size=40, OuterLabel=True, ErrorState=True, Hint=False; сообщение видно. | 0 |
| [IN-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14529-72348) | Desktop; как 01, Opacity=55%. | 1 · `component:web-core.input.layer-properties-use-effective-baseline.1.13` |
| [IN-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14529-72371) | Desktop; OuterLabel=True; Label занимает две строки: textTruncation=DISABLED, maxLines=null. | 1 · `component:web-core.input.label-single-line.text-label-label.1.1` |
| [IN-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14534-72618) | Desktop; ErrorState=True, ErrorMessage=False. | 1 · `component:web-core.input.error-message-required.1.1` |
| [NI-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14526-72984) | Desktop; Size=56, OuterLabel=False; штатный пустой вариант. | 0 |
| [NI-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14526-74072) | Mobile-web; Size=48, OuterLabel=True, FilledState=True. | 0 |
| [NI-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14526-74130) | Desktop; Size=40, OuterLabel=True, ErrorState=True, Hint=False; сообщение видно. | 0 |
| [NI-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14530-72403) | Desktop; как 01, Opacity=55%. | 1 · `component:web-core.number-input.layer-properties-use-effective-baseline.1.13` |
| [NI-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14530-72437) | Desktop; OuterLabel=True; Label занимает две строки: textTruncation=DISABLED, maxLines=null. | 1 · `component:web-core.number-input.label-single-line.text-label-label.1.1` |
| [NI-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14534-72644) | Desktop; ErrorState=True, ErrorMessage=False. | 1 · `component:web-core.number-input.error-message-required.1.1` |
| [AI-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14527-73207) | Desktop; Size=56, OuterLabel=False; штатный пустой вариант. | 0 |
| [AI-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14527-74261) | Mobile-web; Size=48, OuterLabel=True, FilledState=True. | 0 |
| [AI-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14527-74312) | Desktop; Size=40, OuterLabel=True, ErrorState=True, Hint=False; сообщение видно. | 0 |
| [AI-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14531-72491) | Desktop; как 01, Opacity=55%. | 1 · `component:web-core.amount-input.layer-properties-use-effective-baseline.1.13` |
| [AI-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14531-72514) | Desktop; OuterLabel=True; Label занимает две строки: textTruncation=DISABLED, maxLines=null. | 1 · `component:web-core.amount-input.label-single-line.text-label-label.1.1` |
| [AI-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14534-72681) | Desktop; ErrorState=True, ErrorMessage=False. | 1 · `component:web-core.amount-input.error-message-required.1.1` |
| [SE-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14528-73330) | Desktop; Size=56, OuterLabel=False; штатный пустой вариант. | 0 |
| [SE-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14528-74479) | Mobile-web; Size=48, OuterLabel=True, FilledState=True. | 0 |
| [SE-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14528-74517) | Desktop; Size=40, OuterLabel=True, ErrorState=True, Hint=False; сообщение видно. | 0 |
| [SE-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14532-72546) | Desktop; как 01, Opacity=55%. | 1 · `component:web-core.select.layer-properties-use-effective-baseline.1.13` |
| [SE-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14532-72570) | Desktop; OuterLabel=True; Label занимает две строки: textTruncation=DISABLED, maxLines=null. | 1 · `component:web-core.select.label-single-line.text-label-label.1.1` |
| [SE-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14532-72631) | Desktop; RightAddons#45699:0=False, шеврон скрыт. | 1 · `component:web-core.select.chevron-required.1.1` |
| [SE-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14535-72695) | Desktop; ErrorState=True, ErrorMessage=False. | 1 · `component:web-core.select.error-message-required.1.1` |

## Границы результата

- 87 целевых synthetic-проверок: positive/negative/unknown/restoration, применимость ErrorState, уникальность IR.
- Статус Draft; свежий пользовательский прогон Apollo ожидается.
- Выбор поля, продуктовые defaults, смысл текстов, формат суммы и интерактивное поведение сохранены в coverage-map как контекст/паттерны.
- MasterInput — свежий read-only источник общих частей; самостоятельный пятый контракт не создавался.
- Исходные Athena-файлы не редактировались. Старые контракты и receipts сохранены.
- Отрицательные Label исправлены после readback: штатное обрезание оставляло высоту 18; теперь высота 36 при line-height 18.
- Прямой запуск Core через Figma MCP не выполнялся: эксперимент остановился на ограничении кода инструмента 50k. Он не подменяет пользовательский прогон Apollo.

[Техническая проверка](VERIFICATION.json) · [Загрузка source](SOURCE-LOAD.json) · [Поставка](DELIVERY.json) · [Учёт правил](SHEETS-PLAN.json)

## Что включить в коммит

- Свежие Athena raw/generated/indexes, загруженные владельцем.
- JSONS/web/components/web-core/core/{Input,NumberInput,AmountInput,Select}/contract.manual.json, variant-evidence.json, packages и reports/draft-r1-2026-10-26.
- JSONS/indexes/component-contracts.index.json и обновлённые manifest/draft-manifest/README в experiments/current-contract-packages.
- Архив и runtime-specific current.json из DELIVERY.json.
- Этот отчёт.

Старый default index apollo/data-packages/current.json сохранён. Пакет предназначен для текущего runtime 7c88.

