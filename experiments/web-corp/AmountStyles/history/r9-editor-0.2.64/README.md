# AmountStyles — единый контракт пресетов, r9

Статус: **Draft**, ожидает live-приёмки оформления; не production-контракт. Editor ≥ 0.2.64.
Старый эксперимент в `../compiled/` и производственные `JSONS/` не изменены.

## Изменения r9 · 2026-09-30

- Ручное оформление теперь исполняется: 18 baseline-проверок на явных semantic roles.
  Фон: root/operation/major/minor/currency. Полные параметры эффектов: эти же роли
  и sign/major-text/minor-text/currency-text. Оформление текста: четыре TEXT-роли.
- `propertyForbidden.targetRoles` и `visibleOnly=true` хранятся в manual и доступны
  в форме Editor. Новые Athena-слои не расширяют список автоматически. Нельзя
  одновременно включать рекурсивный scope или неоднозначные boundary overrides.
- Editor 0.2.64 собирает `text.decoration` по всем диапазонам текста. Подчёркивание
  и зачёркивание сравниваются с независимым reference текущего варианта. Старые
  отчёты без этих фактов дают unknown, а не выдуманное NONE/пройдено.
- Цвет TEXT не блокируется этим правилом: общий библиотечный токен разрешён,
  bindings проверяются отдельно. Addon не включён; корень Core Amount по-прежнему
  проверяет pinned Core Amount r5. Детач/неизвестное сопоставление не считается успехом.
- Состав: 30 source rules, 15 policy-only, 15 predicate → 40 RuleIR,
  0 context-only. Новое правило имеет status=draft до live-приёмки; отсутствие
  context-only не означает автоматическую готовность контракта.
- Приняты r8 Paragraph layout overrides/reset: 13 → 0 нарушений, чистый отчёт
  без предупреждений. Обе исходные выгрузки и r8 package архивированы.
- Перезапустить Editor 0.2.64, импортировать `editor/AmountStyles.editor-input.zip`
  r9 и выполнить AS-D01–AS-D10 из `TESTCASES.md`. Новые узлы Figma не создавались.
- QA: 638 Editor / 342 Amount+Button tests, 36 layout checks, реальный UI roundtrip,
  46 exact replay, детерминированная пересборка. Подробности и ограничения общего
  suite — `reports/qa-r9.2026-09-30.json`. Два старых Spinner tests требуют удалённых
  отчётов; это отдельный технический долг, а не успешная полная регрессия репозитория.

Ниже — история, а не актуальный список блокеров.

## Изменения r8 · 2026-09-30 (история)

- Существующий RuleID `geometry-follows-effective-baseline` исполняет восемь
  точных сравнений: Auto Layout direction, четыре padding, gap, два alignment.
  Используются существующие compiler/Predicate capabilities; Editor остаётся 0.2.63.
- Явная граница `component-owned@1`: собственные узлы пресета проверяются здесь,
  pinned Core Amount — его контрактом. Проверка родителя не дублирует геометрию
  дочернего компонента и не сравнивает заменённый Addon с placeholder.
- Gap/padding/alignment проверяются, когда применимы в actual или независимом
  reference. Например, неиспользуемый gap однодочернего Operation не нарушает правило.
  Неполный capture дочернего компонента не даёт доказанной границы владения: unknown.
- Это проверка настроек Auto Layout, **не всех числовых размеров**. Ширина текста
  зависит от содержимого; bounds, внешняя ширина/клиппинг, sizing и однострочность
  не добавлены в запреты. При дальнейшем расширении размеров нужен отдельный
  содержательно корректный reference, а не сравнение с текстом библиотечного default.
- Приняты четыре live r7 отчёта для Paragraph: ручной `-` при Negative=True —
  нарушение; сохранённый override `-` после Negative=False — нарушение;
  скрытый Operation — разрешён; штатный `+` — пройдено. Captures сохранены в
  `reports/fixtures/r7-editor-0.2.63/`, package — `../history/r7-editor-0.2.63/`.
  Повтор Operation на D/M Headline остаётся отдельным live пунктом.
- Текущий состав: 30 source rules, 15 policy-only, 14 predicate source rules →
  22 RuleIR; один context-only блок — ручное оформление. Полная готовность не заявлена.
- Тесткейсы геометрии описаны в `TESTCASES.md`; в Figma новые узлы этим шагом
  не создавались. Импортировать `editor/AmountStyles.editor-input.zip` r8.

Ниже — история предыдущих этапов; актуальное состояние задаётся разделом r9.

## Изменения r7 · 2026-09-29

- Operation проверяется существующим `propertyForbidden` / `baselineSource: library-text`.
  Ожидаемый текст берётся из pinned Athena evidence по ключу выбранного внутреннего
  варианта Operation: Negative=True → U+2212, False → `+`. Нет новой таблицы знаков
  в manual или отдельного runtime для AmountStyles; Editor остаётся **0.2.63**.
- `target.sign.variantContinuity` явно ссылается на `target.operation`, чтобы штатная
  смена Negative сохраняла смысл цели. Неизвестная/чужая identity не сопоставляется по имени.
- Ручная замена текста, включая пробелы, запрещена; trim не включён. Штатные
  Negative и Operation=False разрешены. При скрытом пресете или Operation=False
  проверка текста не применяется. Policy штатного Negative больше не считается
  неисполненной проверкой: это разрешённый API, а не второй дублирующий Predicate.
- Два отчёта r6 приняты и архивированы: 24 > 20 — нарушение; 24 ≤ 24 — пройдено.
  Это подтверждает превышение, границу и смену Style; не подменяет все остальные live кейсы.
- Остались **два context-only правила**: внутренняя геометрия и ручное оформление.
  Новому правилу Operation ещё нужна live-приёмка по `TESTCASES.md`; статус Draft.

Далее — описание предыдущих этапов и общих границ. Текущий статус задаётся разделом r7.

## Изменения r6 · 2026-09-29

- Однострочность полностью отменена владельцем. Правило отсутствует в активных
  manual rules, compiled policy и RuleIR. Исторический RuleID записан только в
  `decisions[].retiredRuleIds` и generated crosswalk; пересборка не восстановит его.
- Исполняется Addon.height ≤ эталонного line-height роли `major-text` выбранного
  Style. Это `layoutConstraint` / `at-most-line-height`, настраиваемый в Editor.
  Используется подтверждённый effective baseline, не текущая изменённая типографика.
  PIXELS поддержан прямо, PERCENT — с известным эталонным fontSize;
  AUTO, неоднозначный или отсутствующий reference означают неполную проверку.
  Скрытый Addon не проверяется; замена не отменяет ограничение высоты.
- Приняты три live r5 отчёта: разрешённый IconView, запрещённый Button и скрытый Addon.
  Архив `../history/r5-editor-0.2.62`, captures — `reports/fixtures/r5-editor-0.2.62`.
- Остались **четыре context-only правила**: два про Operation, одно про внутреннюю
  геометрию, одно про ручное оформление. Это три следующих блока реализации.
  У Operation запрещается изменение текста, но не штатный Negative/visibility.
  У оформления удалено условие «для обозначения кликабельности»; исполнение пока не реализовано.
  Внешняя ширина/клиппинг — паттерн; однострочность не возвращается через геометрию.
- Live-приёмка нового ограничения высоты r6 ещё нужна; пакет остаётся Draft.

## Что открыть

- Редактирование: `editor/AmountStyles.editor-input.zip` — импорт целого ZIP в Editor.
- Единственный ручной источник: `contract.manual.json`.
- Для чтения машиной: `compiled/component-contract.v2.json` — не редактировать.
- Исходники Athena и ds-ai-hub с hashes: `sources/`, `reports/source-inventory.json`.
- Свежий read-only REST capture: `../input/athena-rest/`.
- Сверка живой матрицы типографики: `input/live-figma-matrix.json` (19 публичных variants).

## Границы

Один контракт описывает `🔒 AmountParagraph`, `🔒 [D] AmountHeadline`,
`🔒 [M] AmountHeadline`. Внутренний `Operation` не является публичным root.
21 структуры в facts = 19 публичных вариантов + 2 внутренних Operation.
`metadata.publicRepresentationBoundaryVersion: 1` фиксирует закрытый список трёх
публичных представлений; новые Athena facts не расширяют его автоматически.
Вложенный `Core Amount r5` подключён по revision/manualSourceHash/compiledHash.
Его правила не копируются в manual пресета. Родитель сужает допустимую настройку,
но не переписывает контракт дочернего компонента.

Решения владельца 29.09.2026:

- Addon: только Core IconView/StatusBadge, высота не больше line-height текста.
- Minor/Currency: запрещены и Opacity=True, и ручная прозрачность слоя.
- Currency.Type=Custom: произвольный текст. Старое ограничение «только валюты вне
  списка» полностью отменено владельцем, не перенесено в паттерн.
- Это ограничения самого пресета, а не продуктового паттерна.
- Общая типографика и цвет текста не распространяются на содержимое Addon.
- Operation опционален: штатное выключение не является нарушением. Порядок
  Operation → Amount проверяется структурно, включая скрытые части
  (`positionOrder.orderScope=structural`), а не только видимые узлы.

20 правил применения сохранены с исходными RuleID в
`../../../patterns/amount-styles/rules.manual.json`.
Точный путь — `experiments/patterns/amount-styles/rules.manual.json`.
Манифест `migrations/usage-rules.json` проверяет, что ни один из 49 Athena RuleID
не потерян и не принадлежит двум ручным источникам. Handoff не подключён к runtime.
Документы Hub пока являются снимками evidence, а не автоматически обновлённой проекцией.

## Что уже проверяет r7

13 source rules компилируются в 14 RuleIR: публичный root, обязательный Major,
семейство Addon, Opacity на Minor и Currency, корневой порядок Operation → Amount.
Дополнительно: общий токен заливки видимых текстовых частей, общий Text Style и
соответствие Text Style выбранному библиотечному варианту. Проверяются sign,
major-text, minor-text, currency-text, включая диапазоны текста; Addon не входит.
Ключи привязок нормализуются: локальные ID разрешаются по captured key, суффиксы
импортированных ID не считаются изменениями. RGB и названия не заменяют привязку.
Общий недефолтный токен разрешён. Общий неверный Text Style не допускается:
равенство частей и соответствие выбранному варианту — две отдельные проверки.
Также исполняются ограничение высоты Addon и неизменность текста Operation.
15 разрешений/классификаций представлены явно как policy-only, не как успешные тесты.
2 правила остаются context-only с конкретными missingFacts. Проверка не должна
показывать полную готовность, пока они исключены.

Три проверки привязок подтверждены 29 live r2 отчётами: 87/87 ожидаемых результатов.
31 присланный r2 capture повторно проверен против r3: ложное нарушение Operation=False
удалено, остальные нарушения сохранены. Это offline replay, не новая live-приёмка r3.
Исходные отчёты сохранены с SHA-256 в `reports/fixtures/r2-editor-0.2.59/`;
результаты — `reports/live-review-r3.2026-09-29.json`. Можно удалять исходные копии
из `editor/`, не затрагивая фикстуры.
Вложенная проверка Core Amount теперь не помечается incomplete из-за скрытого
опционального Addon. Отсутствующие captures и неизвестные факты остаются неполной проверкой.
В отчёте 18:26 сохранены 4 проверки запрещённой прозрачности Minor/Currency
и нарушение привязки Text Style Major. В r3 три проверки привязок оставались unknown
при смене внутренних вариантов Opacity; r4 устраняет именно этот разрыв сопоставления.
Следующий P0 — live-приёмка Operation, геометрия/оформление, затем интеграционные live-тесты
вложенного Amount. План в BACKLOG.md. Кроме live-отчётов сохранены отдельные
синтетические тесты привязок 19 вариантов. Старый Core Amount r5 не меняется.

Для live-приёмки подготовлены [29 экземпляров в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13161-64719):
19 чистых библиотечных вариантов и 10 специальных кейсов привязок. Инструкция —
`TESTCASES.md`, node IDs и ожидания — `reports/figma-testcases-r2.2026-09-29.json`.
Создание кейсов не является прохождением проверки Editor.

## Расхождения источников

- Все 19 живых variants имеют Operation=True по умолчанию; старый текст утверждает
  False. Default — факт генерации, а не запрет переключения. Не исправляем Hub молча.
- Старые документы ограничивают Custom валютами вне списка. Владелец полностью
  отменил это ограничение; Hub предстоит обновить, source snapshot не переписывается.
- Продуктовые правила ещё находятся в документации компонента Hub. Их перенос —
  отдельная синхронизация, а не удаление знаний.

## Сборка и проверки

Из корня design-system_ab:

```sh
node scripts/build_component_contract_reference.js experiments/web-corp/AmountStyles/authoring
node --test scripts/tests/amount-styles-contract.test.js
```

Повторная сборка использует сохранённые sources и не меняет manual.
Новые facts требуют явного refresh, review sourceHash и повторной приёмки.
Зависимость также закреплена в source snapshot: новая версия Amount не подхватывается молча.

Проверено 29.09.2026: typecheck/build Editor, 575/575 тестов Editor (включая 34
новых теста bindingConsistency) и 272/272 теста пакетов Amount/Button (включая
6 тестов AmountStyles). Детали и hashes: `reports/qa-r2.2026-09-29.json`.
Повторная сборка дала идентичные manual, compiled и ZIP. Это offline QA, не live-приёмка.
Три изменённых правила реестра и Predicate-статус Draft синхронизированы с
проверкой обратным чтением: `reports/registry-sync-r2.2026-09-29.json`.
Леджер расхождений r1 сохранён; новых нормативных расхождений в r2 не выявлено.

Регрессия r3: `node scripts/review_amount_styles_r3.js` (не меняет manual).
Итоговая QA r3: 585/585 Editor, 272/272 пакетных тестов, typecheck/build и
детерминированная пересборка ZIP; `reports/qa-r3.2026-09-29.json`.
Реестр правила и Predicate Draft сверены: `reports/registry-sync-r3.2026-09-29.json`.
Обновление только из ручного источника, затем штатная сборка ZIP и compiled.
## r4 — текстовые цели после смены Opacity

В manual у `target.minor-text` и `target.currency-text` записаны явные
`variantContinuity: { kind: "same-family-text", anchorTargetId: … }`.
Связи редактируются в паспорте Editor, раздел «Текстовые цели при смене вложенного
варианта». Это не разрешение на swap или override. Runtime требует подтверждённых
ключей семейства, однозначной структуры и независимого host reference выбранного
варианта. Одного совпадения имени недостаточно; неизвестные факты остаются unknown.
Actual цвет и Text Style не подменяются эталоном. Compiler включает версию этой
логики только для контрактов с явными связями; старые compiled воспроизводятся точно.

33 архивных capture проверены против r4. В проблемном `18-47-36-079` теперь
8 исходных нарушений: четыре Opacity, три проверки привязок пресета и Text Style
Major во вложенном Amount. Три прежних unknown стали реальными нарушениями:
у Major другой токен и отвязан Text Style. В чистом `18-47-56-009` нарушений нет.
Live-приёмка r4 подтверждена отчётами 19:07:54 и 19:08:01: соответственно
0 и 8 нарушений, 12/12 узлов, без предупреждений, точный replay. Сами JSON
сохранены в `reports/fixtures/r4-editor-0.2.61/`. Шесть context-only правил не закрыты.
Core Amount r5 и production не изменены.

QA: 602/602 Editor, 272/272 пакетов, typecheck/build; 18 responsive и 18 dialog
layout checks. Replay: `node scripts/review_amount_styles_r4.js` из корня репозитория.
Свидетельства: `reports/live-review-r4.2026-09-29.json`, `reports/qa-r4.2026-09-29.json`.
Реестр сверён обратным чтением: `reports/registry-sync-r4.2026-09-29.json`.
r3 сохранён в `../history/r3-editor-0.2.60/`; исходные JSON можно удалять из editor,
не удаляя архивные fixtures. Перезапустите Editor 0.2.61 и импортируйте свежий ZIP:
старая сессия не обновляется автоматически. Сценарии — TESTCASES.md.

## r5 — Addon принадлежит вложенному Core Amount

Предыдущий backlog неточно называл этот gap «TEXT targets после Addon swap».
Текстовые проверки уже проходили; неопределёнными были две проверки самого Addon:
тип INSTANCE и допустимое семейство. Старый resolver искал слот непосредственно
под корнем пресета, хотя BOOLEAN-якорь принадлежит вложенному Core Amount.

В существующем правиле `addon-uses-supported-components` записано
`controlPaths[].ownerTargetId: "target.amount"`. Поле редактируется в форме
«Control path → Владелец свойства слота». Пустое поле сохраняет прежнюю семантику
слота прямо под корнем; это не неявный поиск по имени.
Runtime подтверждает владельца по ключу, точный native BOOLEAN-якорь и единственного
потребителя свойства. Восстанавливается только роль корня Addon, не baseline/роли
placeholder внутри замены. Семейства IconView/StatusBadge проверяются отдельно:
чужое семейство даёт нарушение, неизвестная identity — неполную проверку.
Цвета Addon по-прежнему не входят в проверки текста суммы.

Архивный AS-B08c (`13161:65182`) теперь проходит обе проверки Addon без human-review.
35 архивных capture сохраняют прочие результаты; старые compiled воспроизводятся
точно. r4 архивирован в `../history/r4-editor-0.2.61/`. r5 требует живого повтора
AS-B08c, это не полная приёмка пресета. Следующий P0 — высота Addon относительно
line-height, затем оставшиеся ограничения Operation/layout.
Сборка и replay: `node scripts/review_amount_styles_r5.js` из корня design-system_ab.
Импортируйте свежий ZIP после перезапуска Editor 0.2.62.

QA r5: 617/617 Editor, 272/272 пакетов Amount/Button, typecheck/build и 36 layout
checks. `reports/qa-r5.2026-09-29.json`, `reports/replay-r5.2026-09-29.json` и
`reports/registry-sync-r5.2026-09-29.json` сохраняют результаты и hashes.
Приёмка предыдущего исправления: `reports/live-acceptance-r4.2026-09-29.json`.
