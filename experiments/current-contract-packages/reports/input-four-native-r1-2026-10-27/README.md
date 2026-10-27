# Input / NumberInput / AmountInput / Select — Draft r2

В пользовательском отчёте r1 доставка data14ce подтверждена, но приёмка не пройдена:
11 из 13 ожидаемых нарушений, 1290 human-review, все 25 component runs неполны.
Пропущены NI-05 (две строки Label) и NI-06 (ErrorState=True без ErrorMessage).
Совпадение ожидаемого числа нарушений у остальных 23 кейсов не означает полного PASS.

Причины и исправление данных:

- NumberInput использует occurrence-addressing. Его цели получили явные привязки
  к вариантам; неоднозначные `@catalog`-адреса не угадываются по имени или порядку.
- Native Slot получил точные typed property и ownerTargetId. Baseline ограничен
  `component-owned@1`: сам Slot и собственные детали поля проверяются, открытое
  содержимое Slot принадлежит потребителю. Fixer в этом отчёте находится внутри
  Slot; размещение Fixer вне доказанной границы не получает исключения.
- Нормы r1, лимиты, проверки высоты/типографики/обязательных деталей сохранены.
  Core, SDK, Apollo, Proxy, generation и установка не менялись.

Через SDK фактически установленного main повторены сохранённые 25 снимков:
25/25 точных ожидаемых RuleID, 13 нарушений, uncertain=0, executionComplete=true.
34 отрицательных контроля сохраняют UNKNOWN при нечитаемых/чужих/неоднозначных
привязках и проверку Slot, собственного Field и типографики Label.
Это retained-capture replay; свежая native-проверка r2 ещё не выполнена.

| Контракт | Ожидаемые нарушения r1 | Обнаружено r1 | UNKNOWN r1 | Replay r2 |
| --- | ---: | ---: | ---: | --- |
| Input | 3 | 3 | 264 | 6/6, UNKNOWN=0 |
| NumberInput | 3 | 1 | 542 | 6/6, UNKNOWN=0 |
| AmountInput | 3 | 3 | 264 | 6/6, UNKNOWN=0 |
| Select | 4 | 4 | 220 | 7/7, UNKNOWN=0 |

В исходном area report отдельно остаются 63 `contract-not-found` у вложенных
компонентов. Это не UNKNOWN 25 корневых контрактов и не основание объявлять всю
секцию Ready: собственные нормы незаконтрактованных детей здесь не принимаются.

## Проверка владельцем

1. Commit/push подготовленных файлов `shared/design-system_ab` на main.
2. Обновление данных через меню Proxy. Новая data-версия начинается с `208d30fd`,
   runtime остаётся `7c88c4b4`; четыре контракта должны показывать r2.
3. Повтор той же [секции из 25 экземпляров](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14522-71847).
   Настройки экземпляров менять не требуется. Ожидаем 13 нарушений и полное
   исполнение корневых правил без UNKNOWN. Отдельные contract-not-found учитывать отдельно.

[Параметры и прямые ссылки на все 25 компонентов](../input-four-drafts-2026-10-26/README.md)
сохранены. Для адресной проверки двух пропусков:

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [NI-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14530-72437) | Desktop; Size=56, OuterLabel=True; Label «Название\nполя», высота 36 px при line-height 18 px | 1: `component:web-core.number-input.label-single-line.text-label-label.1.1` |
| [NI-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14534-72644) | Desktop; Size=40, ErrorState=True, OuterLabel=True, ErrorMessage=False, Hint=False | 1: `component:web-core.number-input.error-message-required.1.1` |

## Evidence

- `native-report.json.gz`: исходный report, gzip без изменения распакованных bytes.
- `native-eval.json`: сохранённая ошибка r1 и exact replay исходного результата.
- `INSTALLED-MAIN-REPLAY.json`: r2, 25 случаев и 34 отрицательных контроля.
- `SOURCE-LOAD.json`: четыре фактических source из нового data archive читаются
  установленным main; четыре изменённых projection stamps отвергаются.
- `APPLIED.json`, `DELIVERY.json`: canonical r2 и новый data-only архив.
- `SHEETS-VERIFIED.json`: Правила и Predicate Draft синхронизированы и перечитаны.

Push, установка и активация нового пакета не выполнялись. Ready не повышался.
