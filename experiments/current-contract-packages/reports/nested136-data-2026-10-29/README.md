# Вложенные экземпляры: 136 пробелов

Подготовлены изменения данных на существующем runtime d058. Из 136 экземпляров 131 привязан к родителям; 3 Scrollbar и 2 SwapControl получили отдельные технические контракты. Публичные ограничения Tag/Slider не перенесены на их служебные части.

| Родитель | Привязка к родителю | Отдельная проверка |
|---|---:|---:|
| PureCell | 38 | 0 |
| OptionsList | 0 | 3 ScrollBar |
| OptionListCell | 3 CellContent | 2 SwapControl |
| OptionListFrame | 3 HeaderContent/FooterContent | 0 |
| SelectWithTags | 40 | 0 |
| SliderInput | 47 | 0 |
| Всего | 131 | 5 |

Обновлены PureCell, OptionListCell, OptionListFrame, SelectWithTags и SliderInput до r2. Добавлены ScrollBar r1 и SwapControl r1. Нормы пяти родителей и OptionsList r2 не менялись. Внешние Slot/INSTANCE_SWAP остаются внешними. Реестры, crosswalk и Predicate Draft синхронизированы; Ready не присваивался.

Локально: 35 сохранённых native captures исполняются полностью, прежние 9 нарушений сохранены, UNKNOWN=0. Проверены opacity-мутации всех 131 новых привязок; чужой key и отсутствие независимого reference отвергаются. Пять внешних детей проверены проекцией из отдельного сохранённого библиотечного эталона, включая отрицательные контроли. Это не свежая standalone Figma-приёмка. 37 скрытых узлов полного snapshot не входят в видимую область; они не добавлены к числу пробелов.

Пакет **1.4.4-data.20261029.3**, 46 контрактов: штатный protected consumer PASS. Сохранены остальные 39 контрактов и generation/knowledge/skills. Путь и SHA находятся в [delivery.json](delivery.json). Архив локальный, публикация и установка не выполнялись. В исходном authoring-реестре 49 пакетов; состав поставки для Proxy — 46.

После публикации и установки достаточно одного общего прогона [PureCell / OptionsList / SelectWithTags / SliderInput](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14604-77707), Desktop, без изменения подготовленных кейсов. Ожидаем 40 самостоятельно проверенных и 194 покрытых родителями экземпляра, 0 без контракта, 9 намеренных нарушений и 0 UNKNOWN. Свежий ручной прогон: NOT_RUN_USER_ONLY. Дополнительные RESET на неизменных кейсах не требуются.

Воспроизводимость: [case.json](case.json), [eval.json](eval.json), [input-inventory.json](input-inventory.json), [AREA-REPLAY.json](AREA-REPLAY.json), [REPLAY.json](REPLAY.json), [PACKAGES.json](PACKAGES.json), [lessons.json](lessons.json). Первые отказы сохранены отдельно; старые receipts/seals не переписаны.
