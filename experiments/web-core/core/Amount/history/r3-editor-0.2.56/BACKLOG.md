# Amount — backlog

## Текущий шаг: r3 / Editor 0.2.56 · 29.09.2026

- [x] Решения владельца перенесены в единственный manual source:
  цвет Major/Minor/Currency только через token binding; Custom — любой текст;
  любой native Addon swap допустим, видимый исходный placeholder запрещён.
- [x] Placeholder определяется componentKey, а не синим RGB. Перекраска/переименование
  не заменяют swap. У открытого слота явный contentOwnership=external: дочерние
  baseline/стили/размеры не копируются из placeholder, проверяются граница и порядок.
- [x] Standard Currency проверяется по selected-library Athena text; сохранённый
  host text override не эталон. Custom исключён. Trim касается только краевых пробелов.
- [x] Общие механизмы compiler/core, UI поля и новые регрессии; 28 source /44 IR,
  3 policy-only, 0 excluded. Generated sources и прежние Button/Spinner не менялись.
- [x] Архив r2 сохранён в ../history/r2-editor-0.2.55. Новый расчёт старых18 raw
  snapshots отделён от live-приёмки:10 complete positive,6 complete negative,
  2 incomplete A17. QA: reports/owner-boundaries-r3.2026-09-29.json.
- [x] Реестр Правила:1841,1861–1865; Леджер:67–69 со статусом «Найдено»;
  Core Predicate Draft. Изменённые значения проверены чтением, оформление сохранено.
- [x] Live r3 / Editor0.2.56: восемь отчётов 13:04–13:07 UTC приняты. 8/8 complete,
  0 inconclusive/notExecuted;392 evaluations; engine/editor/details совпали при replay.
  3 положительных,5 отрицательных сценариев;6 violation evaluations (hidden Major
  затрагивает два правила). Manual/compiled/ZIP не изменены. QA и gzip fixtures:
  reports/live-review-r3.2026-09-29.json, reports/fixtures/r3-editor-0.2.56/.
- [x] Подтверждён live native Addon swap по BOOLEAN anchor:7/28 baseline nodes,
  остальные21 — внешняя граница. Ни наследования placeholder baseline, ни проверок
  чужих descendants; полнота только в scope Amount. Проверка placeholder до swap
  тоже принята. Разные токены и шрифтовые размеры14/16 разрешены.
- [ ] **Оставшийся P0:** только непокрытые live-границы из TESTCASES.md: detached
  Major/Minor; Custom empty/RUB; правильный USD; локальная переименованная замена;
  перекрашенный/переименованный исходный placeholder; отказы FRAME/чужого root.
  Присланные8 кейсов не повторять. Не считать офлайн тесты новыми live-отчётами.
- [ ] P2 Editor UX: объяснять capture warning о21 unmatched узле открытого Addon
  как внешнее содержимое. Не скрывать другие correspondence warnings и не заявлять
  валидацию внутренних компонентов. Текущий verdict/complete корректен.
- [ ] P1: A17 подмены Minor/Currency пока fail-closed/неполные; точная диагностика
  должна опираться на реальные anchors, а не разрешения открытого Addon.
- [ ] Отдельно: Hub projections, code bridge и публикация; они не входят в этот патч.

Ниже — история предыдущих этапов; перечисленные там вопросы по токенам/Custom/Addon
решены r3 выше. Старые live-задачи заменены единым r3 прогоном.

## P0 bindings исправлен / Editor 0.2.55 · 29.09.2026

- [x] Общий property identity resolver, использованный в semantic/availability.
  Уникальные aliases, exact stale IDs, типы и неизвестность проверены; raw facts
  неизменны. Definitions reference участвуют в обнаружении коллизий.
- [x] Proven nested variant получает только root semantic target после независимой
  v4 проверки. Same-set без reference не достаточен; descendant roles не наследуются.
- [x] Реальные18 snapshots повторно вычислены:14 complete positives,2 complete
  negatives,2 safe incomplete swaps. A16 теперь также исполняет существующее
  требование видимого состава. QA: reports/binding-fix-0.2.55.2026-09-29.json.
- [x]29 новых Editor regressions, полный suite473, typecheck;244 Button/27 доступных
  Spinner/19 Amount package tests. Synthetic Amount fixtures сохраняют real #IDs
  и instanceIdentityVersion=1. Два старых Spinner suites недоступны из-за удалённых
  JSON, не считаются passed; задача восстановления fixtures записана в Editor backlog.
- [x] Manual r2/compiled/input ZIP/generated facts неизменны, правила не ослаблены,
  продуктовые/канальные запреты не переносились в компонент.
- [ ] Короткий live smoke0.2.55: A02,A09,A12,A14B,A15,A16,A17A. Подтверждение
  отказов A18A/B пока также отсутствует. Стенд тот же; инструкция в TESTCASES.
- [ ] Весь Amount остаётся Draft: live smoke не закрывает внутренние styles/tokens,
  Currency text boundary и Addon ownership.

## Первый live-прогон r2: неполная проверка · 29.09.2026

- [x] Получить все 18 JSON A02–A17B; сверить package/snapshot hashes, исходные ключи
  и повторить engine/editor/details: 18/18 точное совпадение, 630 evaluations.
  Сохранить gzip fixtures с SHA-256. QA: reports/live-review-r2.2026-09-29.json.
- [x] Подтвердить исправление standalone импорта Amount; A15 gap и A16 hidden Major
  дают ожидаемые нарушения. Это не полная приёмка: complete=false у всех 18.
- [x] **P0 — общий binding публичных свойств.** Manual Minor/Currency/Addon не
  разрешаются в live `Name#propertyId`: 6 visibility и 8 order checks неопределённы.
  Единый evidence-backed resolver для semantic/availability: точный ID приоритетен,
  алиас допустим только при единственном совпадении и совместимом типе. Коллизии,
  неизвестность и stale ID не считать false/pass; raw facts не переписывать.
  Конечный результат: 8 реальных BOOLEAN-комбинаций полностью проверяются.
- [x] **P0 — semantic target при допустимой смене nested variant.** A12/A13/A14B/C:
  независимый host reference и lineage подтверждены, но boundary root остаётся
  unknown вместе с внутренностями. Разделить привязку цели/её видимость и право
  наследовать baseline. Подтверждённый same-set не разрешает любые overrides.
  Конечный результат: Opacity/Currency варианты не порождают лишнюю неопределённость.
- [x] **P0 — реалистичные regression fixtures.** Прежние Amount offline fixtures
  удаляют `#propertyId` и не задают `instanceIdentityVersion=1`, поэтому пропустили
  live-дефекты. Добавить tests на сохранённых raw snapshots, неоднозначные алиасы,
  вложенные variants; сохранить parity Button/Spinner. Не тестировать только
  отсутствие violations: проверять scenarioCoverage.complete и inconclusive.
- [ ] После этих исправлений повторно принять матрицу на том же стенде; новые
  экземпляры пока не нужны. Отдельно получить подтверждение A18A/B (отказ до JSON).
- [ ] **P1 — локализовать remap подмен A17A/B.** Текущий безопасный отказ принят
  только как защита от ложного pass. Два Major без swap port делают correspondence
  неоднозначным: 0/9 baseline nodes и 35 human-review. Улучшать локальную диагностику
  только с подтверждёнными anchors; не сопоставлять чужой компонент по имени/порядку.

Разбор не меняет правил, compiled JSON, ZIP, production runtime или нормативных
статусов. Новые продуктовые/канальные ограничения сюда не добавляются.

## r2 / Editor 0.2.54: одиночные компоненты · 29.09.2026

- [x] Удалить фиктивный root `componentSetKey`; Major проверять по `componentKey`.
  RuleID сохранён; Minor/Currency остаются привязаны к реальным наборам вариантов.
- [x] Общий identity gate используется в capture, variant evidence и semantic target
  facts. Отсутствие set у standalone допустимо; неизвестность, чужой ключ и
  несовпадение identity не дают complete/pass. Исходный snapshot не изменяется.
- [x] Compiler preflight отвергает доказанную ошибочную привязку standalone как set.
- [x] 19 Amount tests, включая реальные standalone identity; preview/selection с
  actual ZIP проверены в plugin VM. Typecheck,444 Editor и244 Button tests проходят.
- [x] Пакет пересобран из manual r2; r1 сохранён в history, generated sources и
  legacy runtime не изменены. QA: reports/standalone-identity-r2.2026-09-29.json.
- [x] Реестр: Major rule в Правила1844, Core Predicate Draft;109 ячеек и327 полей
  форматирования/validation/chips сверены чтением. Другие нормы не изменены.
- [x] Подтвердить исправленный импорт в Figma по 18 live reports.
- [ ] Принять live-матрицу: заблокирована общими дефектами выше. Статус Draft.
- [x] Подготовлен отдельный стенд Amount:20 кейсов,14 позитивных/4 негативных/
  2 identity gates. Страница8701:32684,секция13129:64553. Прямые ссылки и порядок
  проверки — TESTCASES.md. Подмена Minor/Currency и скрытие Major оказались доступны
  без detach корня. В USD/CNY очищен сохранённый ₽ override с помощью точного main;
  правила ради fixtures не менялись. Screenshot и структурная проверка пройдены.
- [x] Получить 18 JSON из Editor и выполнить независимый replay.
- [ ] Для двух отказов A18A/B получить сообщение. Подготовка кейсов и наличие
  отчётов не закрывают приёмку и оставшиеся policy gaps.

## r1: базовый компонентный контур · 29.09.2026

- [x] Сверить Core Amount с ds-ai-hub/Athena и свежей read-only библиотекой.
- [x] Изолированный manual → общий compiler → compiled/ZIP; 23/23 generated structures.
- [x] Сохранить четыре прежних Athena RuleID: два в компоненте, два во внешнем AB handoff.
- [x] Библиотечные ключи, обязательность Major, три BOOLEAN, видимость, порядок,
  baseline корня; configurable typography не заблокирована blanket-правилом.
- [x] Общая диагностика скрытых целей: Editor 0.2.53, false root condition исключает
  правило; неизвестные условия, target scope и повреждённая структура не дают pass.
- [x] 16 Amount offline regressions; ZIP сохраняет manual; legacy runtime не изменён.
- [x] 441 Editor /244 Button regressions и typecheck. Реестр обновлён:25 правил,
  4 записи леджера, Predicate Draft;438 ячеек проверены чтением. Три новых drift
  имеют статус «Найдено». Доказательства:reports/initial-qa.2026-09-29.json.
- [ ] P0: один live-прогон по TESTCASES.md и сверка exported JSON с независимым replay.
  Итог: принятая матрица, а не серия несвязанных ручных экспериментов.
- [ ] P0: уточнить внутренние styles/token overrides. Text Style поддерживается;
  это не означает разрешение ручных fill/opacity/radius на любом внутреннем слое.
- [ ] P0: оформить Currency.Type → допустимость ручного текста: Custom допускает;
  для стандартных валют нужен независимый baseline и отрицательный live-кейс.
- [ ] P0: определить контракт границы Addon: допустимые категории/компоненты,
  управление размерами и ответственность вложенного компонента. Не создавать allowlist
  из одного placeholder и не считать произвольный swap автоматически корректным.
- [ ] После этих шагов — review всех правил, coverage gate, Ready для объявленного
  Figma scope. До этого manual и реестр Predicate остаются Draft.

## Расхождения источников / отдельная работа

- [ ] P1: AB pattern описывает Operation/Negative, которых нет в актуальном Core Amount.
  Уточнить адресата (например, внешняя композиция); не добавлять фантомное Core API.
- [ ] P1: перенести blanket style policy в согласованную матрицу allowed/forbidden;
  синхронизировать человекочитаемые Hub projections после принятия manual.
- [ ] P1: ownership AB Opacity в production-источниках; новый handoff не меняет
  действующие production правила и не является готовым PatternContract.
- [ ] Следующий самостоятельный этап: code bridge/value/minority/formatting parity.
- [ ] P2: компактный авторинг условного порядка вместо восьми однотипных manual
  записей, только через общий compiler и после parity gate (не Amount-адаптер).
- [ ] Публикация и переключение legacy runtime-index — отдельная миграция.

Человеческие решения нужны по Addon и внутренним стилям; сборка, hashes, ZIP,
компиляция и regression выполняются автоматически. Необязательные UI-состояния,
которые Figma не позволяет создать через API, не выдаём за реальные негативные кейсы.
