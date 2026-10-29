# OptionsList и Segment · пакет для Apollo

Подготовлены **OptionsList r2**, **OptionListCell / OptionListFrame / OptionListText r1** и **SegmentedControl r3**. Сам **Segment r1 не изменён**. Код и рабочие сборки Apollo / Proxy не менялись.

## Что исправлено

- Header/Body/Footer Slot принадлежат только контейнеру OptionList. У Cell, Header/Footer и текстовых частей отдельные, непересекающиеся области проверки.
- Типографика проверяется у GroupTitle и EmptyState, где есть собственный TEXT. У частей без TEXT не запрашивается несуществующий текст.
- Для стандартного Control placeholder связь Athena `Control` → независимый `🔩 SwapControl` подтверждена exact source identity и typed INSTANCE_SWAP портом. Это доказательство стандартного placeholder; произвольные замены остаются открытой областью.
- В SegmentedControl записаны 96 существующих вариантов и привязки Selected вложенных Segment. Действующий Core получает эталон ширины внутри группы. Ширина не исключена из проверки.

## Результат автоматических проверок

Повторное исполнение сохранённых native-отчётов: **13 OptionsList — complete, UNKNOWN=0; два намеренных нарушения opacity найдены**. **30 вложенных Segment — complete; две ложные ошибки ширины исчезли; SG-09 сохранил одно нарушение текста**. Семь отрицательных контролей подтверждают сохранение opacity, типографики и ширины; отсутствие независимого эталона родителя отвергается.

Пять ZIP повторно импортированы; manual, факты и compiled projection совпали. Проверены реальный source loader и отказ на подменённый stamp. Индекс / manifest / Draft-индекс согласованы: 47 текущих исходных пакетов в репозитории. Это число отличается от состава конкретного устанавливаемого выпуска.

## Поставка

Локальный пакет данных **1.4.4-data.20261029.2** содержит **44 контракта**: пять подготовленных пакетов заменяют два прежних; 39 прежних контрактов сохранены точно. Знания, навыки и данные генерации сохранены. Protected consumer проверил пакет в изолированном хранилище.

- [Пакет данных для Proxy](prepared/1.4.4-data.20261029.2/apollo-data-1.4.4-data.20261029.2.tgz)
- [Подготовленный descriptor](prepared/1.4.4-data.20261029.2/current.json)
- [Результат упаковки](prepared/last-build.json)

**PENDING_PUBLICATION**: пакет не опубликован, Git-канал обновлений не переключён, рабочая установка не менялась. Descriptor с будущим release URL подготовлен отдельно. Его активация допустима после публикации соответствующего архива. После установки владельцем в Apollo должны отображаться указанные выше ревизии; прежняя версия данных их не содержит. Пересборка плагина или Proxy для этого исправления не требуется.

Текущие ZIP для ручного импорта:

- [OptionsList r2](../../../../JSONS/web/components/web-core/core/OptionsList/packages/OptionsList.r2.draft.component-contract.zip)
- [Cell r1](../../../../JSONS/web/components/web-core/core/OptionsList/parts/Cell/packages/OptionListCell.r1.draft.component-contract.zip)
- [Frame r1](../../../../JSONS/web/components/web-core/core/OptionsList/parts/Frame/packages/OptionListFrame.r1.draft.component-contract.zip)
- [Text r1](../../../../JSONS/web/components/web-core/core/OptionsList/parts/Text/packages/OptionListText.r1.draft.component-contract.zip)
- [SegmentedControl r3](../../../../JSONS/web/components/web-core/core/SegmentedControl/packages/SegmentedControl.r3.draft.component-contract.zip)

## Целевой прогон владельца

В Apollo: **Desktop**, канал **b2b**, источник **прокси** после установки нового пакета либо соответствующие новые ZIP. Выделять компонент по ссылке. Ожидания ниже относятся к контрактам компонента; общие проверки токенов оцениваются отдельно.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [SG-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75409) | Capacity=2, Shape=Rectangular, Resize=Fill; у обоих Segment Selected=True | 1 нарушение выбора; **0 ошибок ширины**. RuleID `component:web-core.segmented-control.single-selected.capacity-2.1.1`. |
| [SG-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14552-75458) | Capacity=2, Shape=Rectangular, Resize=Fill; у обоих Segment Selected=False | 1 нарушение выбора; **0 ошибок ширины**. Тот же RuleID. |
| [OL-02 · Cell](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77888) | Left=True, Right=False; стандартный Control | 0 локальных нарушений, 0 UNKNOWN. |
| [OL-04 · Header](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77906) | Оставить подготовленную конфигурацию | 0 локальных нарушений; нет требований отсутствующих Slot/TEXT. |
| [OL-11 · Body Slot](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77946) | FixedHeight=False; произвольный FRAME в Body уже подготовлен | 0 локальных нарушений, 0 UNKNOWN; содержимое Slot разрешено. |
| [OL-13 · Cell opacity](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77970) | **MobileWeb** в Apollo; opacity корня Cell=55% | 1 нарушение `component:web-core.option-list-cell.layer-properties-use-effective-baseline.1.13`, 0 UNKNOWN. |

Эти кейсы не требуют повторного RESET: их уже подготовленные состояния не меняются. Свежие прогоны выполняет владелец; здесь статус **NOT_RUN_USER_ONLY**.

## Границы

Контракты остаются Draft. Произвольный Control swap пока не принят. В полном отчёте новой секции остаются **136 вложенных экземпляров без собственных контрактов/атрибуции**; данное исправление не заявляет их покрытие. Причина первого таймаута чтения общего фрейма не установлена этим завершённым отчётом.

[Eval](eval.json), [переисполнение](REPLAY.json), [ZIP и отрицательные контроли](PACKAGES.json), [реестр Google Sheets](sheet-sync.json), [перенос нормы типографики](scope-migration.json), [final pins](seal.json).
