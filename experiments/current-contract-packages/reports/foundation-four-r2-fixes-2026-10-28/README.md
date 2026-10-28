# Text / Slider / SegmentedControl — исправления r2

Исправления внесены в canonical manual/ZIP и исходники Apollo. List не изменён.
На сохранённом пользовательском отчёте все 25 приёмочных кейсов имеют
executionComplete=true, uncertain=0; все 11 ожидаемых violation RuleID сохранены.
Это повторное исполнение native-снимков, а не новый прогон Apollo/Figma.

- Text: из TEXT baseline удалены неприменимые layout.mode и appearance.radius.
- Slider: типографика привязана к Pips. Для всех 24 публичных вариантов явно
  сохранён адрес цели либо независимое доказательство её отсутствия.
- SegmentedControl: явный opt-in исключает из member collection только FRAME
  независимого reference с доказанной native source identity. Посторонние,
  дублированные, отсутствующие и изменившие тип siblings не разрешаются.
- Доказанно неактивная Capacity-ветка не увеличивает неполноту coverage;
  активные/UNKNOWN ветки сохраняют отказ при недостатке evidence.

Проверено: Core TypeScript; 33 focused regressions; 3 ZIP roundtrip с exact raw
source; source/stamp loading трёх пакетов реальным private main в VM; отклонение
подменённых stamp; целостность и exact projection всех 39 текущих пакетов.
Учёт: 20 строк правил и Predicate трёх компонентов обновлены и прочитаны обратно.

**Статус:** Draft r2. Установка рабочей runtime/data пары и fresh Apollo пока не
выполнены. Text/Slider source совместим с прежним reader; SegmentedControl r2
прежний reader корректно отклоняет. Проверочные bundles не установлены;
общий B/dist и работающий Proxy не менялись. Полный validate/build всех модулей
не запускался согласно согласованной границе private checking build.

**Сохраняемый пробел:** SG09 и внутренние нормы вложенного Segment требуют
отдельного контракта Segment. Ноль uncertain текущего контура не подтверждает
исполнение этих норм. Границы генерационного пилота не менялись.

Артефакты: [повторное исполнение](private-replay.json),
[ZIP](package-verification.json), [main loader](main-source-load.json),
[build inventory](checking-build-inventory.json), [учёт](sheets-readback.json).
Исходный пользовательский отчёт сохранён в соседнем frozen live-review.
Большие воспроизводимые bundles/дубликаты ZIP остаются локальными; текущие ZIP
для Git лежат в `JSONS/web/components/web-core/core/<Component>/packages/`.
