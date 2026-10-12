# Ошибки процесса и синхронизации Apollo

Владелец 09.10.2026 поручил фиксировать ошибки и учиться на них. General ведёт
этот журнал; исполнитель устраняет конкретную причину в своей разрешённой
области. Для повторения обновляем существующую запись и отмечаем, какая защита
не сработала. Исторические evidence и receipts сохраняем.

Запись содержит факт и ссылку на доказательство, причину с уровнем уверенности,
последствия, исправление, защиту от повторения, ответственного и проверку.
Причина может оставаться «не установлена». Статусы: **открыта**, **исправлены
последствия / защита проверяется**, **закрыта после проверки защиты**.

Перед handoff проверяем только относящиеся к нему записи. Для ошибки в коде
добавляем минимальную регрессионную проверку; для процесса — конкретное правило
в месте принятия решения и проверяемое свидетельство его применения. Новые
нормы, критерии приёмки и расширение scope требуют решения владельца.

## AP-PROC-001 — накопление полных временных копий

- **Факт и последствия:** /private/tmp вырос до 22,97 GB. Владелец остановил
  оркестрацию; очистка уменьшила объём до 1,80 GB. Удалены 16 неиспользуемых
  материализованных копий, build-кэши и старый Chrome 154 с DMG. Уникальные
  файлы и доказательства сохранены, 1904 защищённых файла не изменились.
  Evidence: [cleanup-plan.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-tmp-disk-usage-2026-10-09/cleanup-plan.json).
- **Причина:** повторные полные копии рабочих областей и накопленные кэши
  подтверждены inventory очистки. Распределение всех байтов между задачами не
  установлено; вывод о единственном виновном процессе не делаем.
- **Исправление:** разрешённая очистка с сохранением unique blobs, patches,
  screenshots и receipts; удалённые executable snapshots отмечены как retired.
- **Защита:** private candidate хранит только изменённые файлы, patch и нужные
  доказательства; существующие зависимости переиспользуются. Полную копию или
  второй dependency tree создаём только при доказанной технической нужде, с
  оценкой размера, владельцем и условием удаления. Перед очисткой проверяем
  активные targets и unique evidence; отсутствие ссылок не доказывает ненужность.
- **Ответственные:** General — lifecycle и проверка; исполнитель — размер своей
  private области. Текущая задача 5+2 использует sparse overlay в
  `workplace/.local/apollo-gen-5plus2-2026-10-09`, без full workspace clones.
- **Статус:** исправлены последствия / защита проверяется. Очистка принята;
  lifecycle текущих candidates ещё не закрыт. Проверка General 09.10: текущая
  private область 5+2 занимает 2,4 MB; preview/node_modules — symlink на
  существующие зависимости. Это текущий замер, не постоянный лимит.

## AP-PROC-002 — текущий registry связан со старым toolchain receipt

- **Факт:** private frontend candidate 5+2 получил
  `FRONTEND_PRODUCER_BRIDGE_STALE`. Loader сравнил текущий producer/registry со
  старым NEXT-02 registry-refresh receipt и отказал в запуске. Это корректный
  отказ freshness guard. Evidence:
  [toolchain-blocker.json](/Users/alexkukhta/Desktop/workplace/.local/apollo-gen-5plus2-2026-10-09/generation/toolchain-blocker.json).
- **Причина:** consumer bridge остался связан с историческим receipt после
  изменения текущего registry; соответствие новой цепочки заранее не было
  подтверждено. Версия установленного Chrome также отличается от старого
  browser receipt; прежний browser PASS не доказывает текущий preview.
- **Последствие:** рабочий frontend-допуск заблокирован; preview ещё требует
  проверки текущих imports, environment и браузера.
- **Исправление в работе:** Code Connect готовит отдельное соответствие текущих
  source/API/producer и selective build; Generation — минимальный private
  consumer patch. Старые receipts и отказ для stale входов сохраняются.
- **Защита:** перед зависимым handoff проверяем точную затронутую цепочку
  producer → registry → source/API → distribution → consumer receipt. При
  изменении любой части прежнюю приёмку считаем исторической до новой сверки;
  текущий browser PASS получаем на фактически используемом бинарнике.
  Новый общий preflight или повторное исследование системы не требуется.
- **Ответственные:** Code Connect — input correspondence; Generation — loader
  и frontend; General — независимая проверка. Задача
  `APV4-GEN-5PLUS2-2026-10-09`.
- **Статус:** открыта. Для закрытия нужны актуальная цепочка, реальный frontend
  и доказанный отказ при подмене одного из текущих inputs; fake rebind запрещён.

## AP-PROC-003 — актуальный monitor state недоступен

- **Факт:** при начале задачи 5+2 файл
  `/tmp/apollo-v4-orchestration-monitor-state.json` отсутствовал. Сохранённая
  workspace-копия от 07.10 историческая и не была использована для dispatch.
  Evidence: [plan.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-gen-5plus2-2026-10-09/plan.json)
  и запись возобновления в [APOLLO_ORCHESTRATION.md](APOLLO_ORCHESTRATION.md).
- **Причина:** не установлена. Хранение единственной актуальной копии в tmp
  делает её недолговечной; удаление именно нашей очисткой не доказано.
- **Последствие и исправление:** прежняя очередь не восстановлена автоматически.
  Использованы последние прямые указания владельца и конкретные чаты; для 5+2
  создан отдельный bounded plan. Heartbeat остаётся PAUSED.
- **Защита:** актуальные owner decisions, pause, pending questions, handoffs и
  cursors храним в durable task root; tmp служит только временной копией.
  Сохраняем атомарно через temporary file + rename, с временем и ссылкой на
  источник решения. При потере state сначала сверяем последние инструкции;
  historical state, idle/completed и отсутствие ответа не разрешают dispatch.
- **Ответственный:** General.
- **Статус:** исправлены последствия / защита проверяется. Durable plan создан;
  cursors, owner decisions, partial pause и handoffs сохранены отдельно в
  [state.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-gen-5plus2-2026-10-09/state.json).
  General проверил атомарную запись и полный JSON readback без изменения
  pinned plan. Возобновление старого heartbeat и проверка его восстановления
  не назначены.

## AP-PROC-004 — промежуточный handoff прочитан до закрытия записи

- **Факт:** General начал читать HANDOFF внешней зависимости 5+2, пока
  Contract Creation ещё работал. Прочитанный expected/actual перечислял
  16 проверок, а текущий verify.cjs уже содержал 18. Evidence — external
  dependency candidate и active handoff в durable state; промежуточные
  значения не являются final receipt.
- **Причина:** наличие файла было использовано как повод начать финальный
  review до подтверждения закрытия записи. Автор продолжал свою работу;
  это ошибка синхронизации на стороне General.
- **Последствия и исправление:** независимая приёмка не выдана, input не
  передан следующему исполнителю. Review отложен до final handoff/seal.
- **Защита:** исполнитель явно подтверждает закрытие записи после последней
  проверки и выпускает согласованный final seal. General сверяет handoff,
  verifier, evidence и все final pins до review и повторно перед передачей.
  Completed — сигнал к проверке, а не доказательство результата. Любая новая
  правка требует нового handoff/seal и повторной проверки затронутой части.
- **Ответственные:** General — порядок review; исполнитель — final seal и
  закрытие записи своей области.
- **Статус:** открыта до проверки согласованного final handoff внешней
  зависимости. Защита добавлена в workspace AGENTS.md.


### Повтор в Link r3 handoff · 10.10.2026

- **Факт:** закрытый Link r3 `HANDOFF.json` указывал четыре build receipts как
  `checks/...`, хотя файлы находятся в `technical/checks/...`. General остановил
  intake: ссылки не открывались, при этом sealed bytes/hash всех логов совпадали.
- **Причина, подтверждена:** блок скопирован из `technical/validation.json` в
  корневой HANDOFF без пересчёта относительной базы пути.
- **Последствия и исправление:** исправляются только метаданные в отдельном
  `HANDOFF.corrected.json`; исходные закрытые HANDOFF, seal, логи, код, нормы,
  пакет и результаты сохранены. Исторический pin журнала сохранён в sealed
  source snapshot; новый pin журнала явно отражён в дополнении.
- **Защита:** перед final seal каждый receipt открывается по заявленному
  абсолютному пути и сверяется по SHA256/bytes. `guard.py` отклоняет старую
  относительную ссылку, отсутствующий файл, неверные hash/bytes; после seal
  проверяет закрытие и весь вектор дополнения. Это bounded metadata check,
  не новый product preflight и не independent acceptance.
- **Ответственный:** Contract Creation — исправление ссылок и guard;
  General — независимая проверка и закрытие повторного случая AP-PROC-004.
- **Evidence:** `shared/design-system_ab/experiments/current-contract-packages/Link/reports/metadata-corrections/link-r3-receipt-paths-2026-10-10/`:
  `incident.json`, `guard-checks.json`, `HANDOFF.corrected.json`, `seal.json`.
- **Статус:** metadata correction выполнена; 4 receipts проверены,
  7 ошибочных метаданных отклонены. Независимое закрытие General не заявлено.
  Новая запись с отдельным ID не создана.


## AP-PROC-005 — cached delta не доказывает полный Label tree

- **Факт:** raw plain-Label delta CellContent добавляет Label и удаляет
  baseline Wrapper с одинаковым локальным ID 2. Generated machine delta
  сохраняет remove, но не add Label; descriptive operations сохраняют add.
  Evidence: [source-contract.candidate.json](/Users/alexkukhta/Desktop/workplace/.local/apollo-gen-5plus2-2026-10-09/contracts/external-dependency/source-contract.candidate.json),
  поле structureGap. Это подтверждённое расхождение представлений; отсутствие
  Label в настоящей библиотеке им не доказано.
- **Причина:** не установлена. Исправление shared источника/конвертера этим
  bounded handoff не назначено.
- **Последствие и защита:** cached projection не даёт полного native source
  tree или права записи Label. Сохраняем обе версии, отдельные node identity
  scopes, UNKNOWN и пустые accepted write operations; перед native writer
  нужны canonical source-tree correspondence и фактический пользовательский
  readback. Локальный числовой ID каталога не используем как Figma sourceNodeId.
- **Ответственные:** Contract Creation — исходный evidence и source input;
  Generation — отказ без принятой Label-привязки; General — проверка конкретного
  необходимого следующего handoff.
- **Статус:** открыта. Молчаливое восстановление дерева и вывод нормы из
  повреждённой projection запрещены.


## Проверка защиты в агентском MVP — 10.10.2026

Этот раздел фиксирует новый проверенный случай и применение защиты. Он не
заменяет исторические receipts и не закрывает отложенные продуктовые линии.

- **AP-PROC-001:** MVP использует sparse области и существующий dependency
  tree arui-private; полных workspace-копий и новой установки зависимостей
  нет. Объём фиксируется в итоговой приёмке. Lifecycle старых candidates
  остаётся отдельным вопросом.
- **AP-PROC-002, повторение класса stale consumer:** после принятого рабочего
  v4 build агент отказал с `AGENT_MAPPING_INPUT_STALE`. Из 187 прямых refs
  изменился один: `figma-mapping.json /context/sourceAPIBuildPins/2`, hash и
  размер build inventory. Guard отказал корректно. Code Connect создал новый
  закрытый consumer root с изменением только этих двух полей; три остальных
  payload побайтно прежние. General проверил все refs и original seal, затем
  Proxy переключил только server config. Старый consumer отвергается, новый
  принимается неизменённым SDK; сквозной frontend затем выполнен. Evidence:
  [mapping-working-consumer-review.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-agent-mvp-2026-10-10/mapping-working-consumer-review.json)
  и [consumer-guard-before-after.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-agent-mvp-2026-10-10/consumer-guard-before-after.json).
  Защита проверена для нового MVP consumer; это не fake rebind старого receipt
  и не приёмка исторической линии 5+2.
- **AP-PROC-003, предотвращённый случай:** после compaction Proxy трижды
  рассматривал старый запрос ASA-012 как возможный текущий. Сверка durable
  state и прямого human message остановила повторный dispatch. Исследование
  не возобновлено. Проверено применение защиты, дефекта guard нет. Evidence:
  `proxy-integration/PROCESS-LESSONS.json`; текущая авторизация хранится в
  `state.json`, cursors и состояния сохраняются атомарно.
  Третий повтор показал, что прежней памятки роли недостаточно. General
  восстановил scope до нового dispatch; Proxy явно сверил
  `state.ownerAuthorizationEvidence` с direct human message перед closure.
  Эта сверка обязательна до routing после compaction; полагаться только на
  последнюю видимую строку старой истории нельзя.
- **AP-PROC-004:** независимая приёмка рабочих Generation, нового consumer
  mapping и Proxy начата только после явного CLOSED и final seal. Pins
  проверены перед приёмкой и передачей. Это проверка защиты на MVP; прежняя
  внешняя зависимость и её продуктовый допуск не приняты автоматически.

## AP-PROC-006 — dispatch после неуспешной записи назначения

- **Факт:** начальная shell-запись трёх назначений завершилась SyntaxError,
  но цикл отправил разрешённые задания. Короткое время durable файлов не
  было. Evidence: `process-dispatch-persistence.json`.
- **Причина:** зависимая отправка не проверяла `exec_command.exit_code`.
  Причина исходной ошибки кодировки не установлена.
- **Исправление и последствия:** точные назначения восстановлены structured
  patch, pins и JSON readback сверены; расширения scope не было.
- **Защита:** неуспешная запись блокирует зависимый dispatch; перед отправкой
  проверяются exit code, JSON identity и реальные hash/bytes. Следующие
  передачи закрытых interface/mapping применили этот порядок.
  При повторной ошибке кодировки guide не публиковался; structured patch
  сохранил русский текст, ASCII-only script выполнил преобразование и readback.
  Причина транспортной ошибки кодировки по-прежнему не установлена.
- **Ответственный:** General. **Статус:** закрыта после проверки защиты.

## AP-PROC-007 — сравнение двух каталогов вместо Git diff проекта

- **Факт:** Git из workspace, не являющегося корнем этих репозиториев,
  выполнил no-index сравнение двух разных каталогов: 18692 файла, большой
  ненужный stat. Контент файлов не печатался, записей не было. Evidence:
  `process-review-command-scope.json`.
- **Причина:** корень репозитория не проверен до команды с двумя путями.
- **Исправление:** результат исключён из приёмки; review ограничен четырьмя
  объявленными targets, preimages, 70 sealed outputs и 21 проверкой.
- **Защита:** проверять Git root перед Git-командами; для sparse handoff
  использовать объявленные targets и pins, не сравнение разных деревьев.
- **Ответственный:** General. **Статус:** закрыта после проверки защиты.

## AP-PROC-008 — RegExp принимал ID после приведения типа

- **Факт:** private interface-v1 принимал null/number/undefined в runId из-за
  string coercion `RegExp.test`. General обнаружил это до рабочего применения.
  Evidence: `process-typed-id-general-closure.json` и `interface-review-before.json`.
- **Причина:** перед regexp не было явной проверки типа string.
- **Исправление:** interface-v2 проверяет типы ID/hash/color/nonce/path;
  v1 и before evidence сохранены. Зависимая приёмка была задержана.
- **Защита и проверка:** негативные typed counterexamples вместе с позитивными
  controls; 50 авторских assertions, 21 независимая проверка private и 21
  проверка фактического рабочего `dist/agent-protocol.cjs` прошли.
- **Ответственные:** Generation — код; General — проверка.
  **Статус:** закрыта после проверки защиты; native live этим не подтверждён.

## AP-PROC-009 — виртуальный build input считался физическим файлом

- **Факт:** обычный v4 build с native config завершился ENOENT для виртуального
  esbuild define. Затем normal test выявил fixture с `/var` alias вместо
  canonical temp root. Evidence: `process-normal-build.json` и сохранённые
  before/after/final validate logs.
- **Причина:** virtual define перечислялся как физический input; fixture
  использовал os.tmpdir без realpath на macOS.
- **Исправление:** исключён только известный virtual define; сам config
  отдельно hash-pinned. Исправлен только путь fixture, runtime guard сохранён.
- **Защита и проверка:** regression проверяет читаемость всех emitted physical
  inputs и точный hash действующего native config. Отсутствие env в позднем
  запуске не доказывает, что прошлый dist собран без config. Normal root 81,
  v4 type/build/610 tests, generation-core 198 и standalone 8 прошли.
- **Ответственные:** Generation — код; General — CAS и независимая проверка.
  **Статус:** закрыта после проверки защиты.

### Повтор при UI-пересборке — 10.10.2026

- **Факт и evidence:** первая сборка упрощённой Generation-панели выполнена без
  `APOLLO_AGENT_NATIVE_SCOPE_PATH`; её inventory содержала
  `agentNativeScopeInput=null`. Принятый рабочий receipt отдельно подтверждает
  конфигурацию с SHA-256 `1b15b9285b9ebf9eee6cef82fb5bfe5f367dfa8ff3fed3ff5c278c6a3869fd96`.
  Evidence: `/private/tmp/apollo-generation-chat-2026-10-10/build-configuration.json`,
  `validate.log` и `validate-final.log`. Состояние dist непосредственно перед
  первой командой не было сохранено и не реконструируется как факт.
- **Причина:** исполнитель запустил обычный validate до сверки принятого receipt
  и параметра приватной конфигурации сборки.
- **Последствия:** промежуточная сборка имела callback без принятой конфигурации
  и могла вернуть UNKNOWN при Figma-чтении. Права и guards не расширены; actual
  native run и передача этой сборки пользователю не выполнялись.
- **Исправление:** финальный validate выполняется с точной конфигурацией из
  принятого рабочего receipt, без изменения её содержимого.
- **Защита:** в README v4 добавлена сверка inventory/receipt перед UI-пересборкой
  и сравнение пути/hash после неё. Существующий normal test проверяет exact env
  path, SHA-256 конфигурации и все физические build inputs.
- **Ответственный:** Design Check — пересборка и проверка; General — независимое
  закрытие повторного случая. **Проверка:** configured type/build/610 tests и шесть
  UI-сценариев 800 × 860 прошли; точный config path/SHA-256 и все физические inputs
  сверены с новой inventory. **Статус:** исправлено исполнителем; ожидает
  независимого закрытия General. Actual native live не выполнялся.

## AP-PROC-010 — исключение при чтении native context могло оборвать ответ

- **Факт:** context getters/observer могли бросить исключение до формирования
  native observation. Исправление принято в рабочем MVP. Evidence:
  `native-guard-check.json` и `generation-working-review.json`.
- **Причина:** чтение контекста не полностью покрывалось обработкой отказа.
- **Исправление и защита:** исключения fileKey/page/epoch/observer дают ровно
  один UNKNOWN callback с evidence hash, без чтения nodes и без writes.
  General проверил четыре throwing-context случая и совпадение рабочего
  source с проверенным postimage.
- **Ответственные:** Generation — код; General — проверка.
  **Статус:** закрыта после проверки защиты. Случаи synthetic; actual PluginAPI
  live выполняет пользователь.

## AP-PROC-011 — planner получал неполные ограничения direct props

- **Факт:** реальная модель записала native STRING `Overflow=true/false` в
  executable props, хотя сама указала отсутствие code binding. Guard корректно
  вернул `PROMPT_SPEC_PORT_UNSUPPORTED`. Evidence:
  `planner-port-diagnosis.json`, captured actual output и `planner-fix-review.json`.
- **Причина:** prompt отдельно описывал Boolean Overflow и не перечислял
  ограничения `unsupported-direct-prop` из текущего mapping.
- **Исправление:** тот же неизменённый predicate формирует явный PROP_ADMISSION
  для модели; уточнён STRING native VARIANT. Ни guard, ни нормы не ослаблены.
- **Защита и проверка:** persistent regression в существующем prompt test;
  реальные STRING/state counterexamples остаются 422, spec с пропуском только
  запрещённых props сохраняет 5+2. Независимые 15 и обычные relevant 53/agent21
  проверки прошли; реальный planner после исправления дал 200 и две агентские
  сборки. Полный Proxy остаётся 468/470: те же два исторических сбоя доказаны
  на before/after и не переписаны.
- **Ответственные:** Proxy — код; General — приёмка.
  **Статус:** закрыта после проверки защиты.

## AP-PROC-012 — ожидание успеха скрывало уже полученный typed failure

- **Факт:** private UI harness ждал 330 секунд после planner HTTP422.
  Ранние model outputs удалялись legacy adapter и не сохранились. Кроме того,
  позднее отсутствие child PID ошибочно трактовалось как отсутствие CLI,
  а stale mapping сначала связывался с manifest без проверки точного pointer.
  Эти выводы отозваны. Evidence: `proxy-integration/INTEGRATION-LESSONS.json`,
  `attempt-1`, `attempt-2`, captured third output и direct-ref review.
- **Причина:** wait predicate искал только успех; моментальный process snapshot
  использовался как история, предположение — до сравнения точных refs.
- **Исправление и защита:** fail fast при typed UI/HTTP failure; сохранять
  диагностический output до cleanup в test scope; выводы основывать на actual
  output и точном изменённом ref. Утерянные первые outputs не реконструируются
  как факт. Следующий отказ сохранён сразу; direct pin проверка установила
  единственную причину stale. Test preload удалён обычным restart до handoff.
- **Ответственные:** Proxy — harness; General и Proxy — точность вывода.
  **Статус:** закрыта после проверки защиты.

Evidence root: [apollo-agent-mvp-2026-10-10](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-agent-mvp-2026-10-10). Final review: [final-pin-review.json](/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-agent-mvp-2026-10-10/final-pin-review.json).


### AP-PROC-003 — повтор в Generation при переходе к Figma, 10.10.2026

- **Факт:** текущий AGFIGMA-GEN-01 начат, но final в turn
  `01a1248d-b33f-7a32-b474-996674c88298` вернулся к исторической передаче
  ASA-014 аналитику. Запрошенный interface/native candidate не выпущен;
  General проверил отсутствие нового private root и не принял completed.
  Evidence: `apollo-agent-figma-2026-10-10/PROCESS-LESSONS-AP003-Generation.json`
  в durable task root General. Текущее прямое поручение — human message
  `01a12489-a592-7570-9e13-3da6268cc989`, а не historical analyst routing.
- **Причина:** точная причина не установлена. Подтверждён переход области
  ответа после чтения истории; compaction, порядок доставки или новое
  человеческое поручение не объявляются причиной без доказательств.
- **Последствия и исправление:** interface не готов, зависимая запись Proxy
  остаётся закрыта. General возвращает Generation к тому же невыполненному
  этапу; новый dispatch аналитику и изменение shared/native объектов не нужны.
- **Защита:** перед маршрутизацией и terminal ответом сверять
  `plan/state.ownerAuthorizationEvidence.messageId`, ID текущего задания и
  наличие его required outputs. Исторический final или последнее прочитанное
  человеческое сообщение другой задачи не заменяют текущую authority.
  При несовпадении области продолжать действующее задание, не закрывать его.
- **Ответственные:** Generation — применение защиты и текущий output;
  General — сверка authority/artifacts и независимая проверка.
- **Статус:** открыта. Для закрытия нужны реальный current interface/candidate
  и проверяемое evidence применения защиты; recovery сообщение само по себе
  не закрывает повтор.


## AP-PROC-013 — порядок reference nodes различался между capture host и Editor

- **Факт:** три Link r1 отчёта Editor 0.2.98 от 10.10.2026 имели 31 human-review и одну compliant проверку. Все восемь targets получили `reference-pin-stale`; реальные Gap=11 и fontSize=18 остались inconclusive. Evidence: `shared/design-system_ab/experiments/current-contract-packages/Link/authoring/reports/editor-report-replay.r2.json`.
- **Причина, подтверждена:** независимые references совпадают по native структуре, source addresses и компонентам; локальные main IDs допустимо отличаются. Capture host отсортировал `Placeholder` до `diamonds`, runtime Editor — после. Portable hash сохраняет порядок массива, поэтому guard правильно отклонил stale producer pin. Это ошибка подготовки capture projection, а не дефект guard.
- **Исправление:** Link r2 вычисляет reference projection в runtime shared core. Raw captures и все 18 норм сохранены. На исходных трёх снимках локальный replay r2 разрешает восемь targets и даёт 0/1/1; точные отрицательные RuleID совпадают. Исторические r1 ZIP/eval/seal сохранены.
- **Защита:** перед передачей проверять parity с независимым снимком установленного Editor; ноль violations при inconclusive не считается PASS. Producer regression включает stale reference и missing fact. Инструкция добавлена в `CONTRACT_AUTHORING_GUIDE.ru.md`.
- **Ответственный:** авторинг контрактов — producer и replay; General — независимая проверка защиты.
- **Статус:** исправлены последствия / защита проверяется. Installed Editor r2 и два ручных RESET ещё не выполнены; whole contract Draft.

## AP-PROC-015 — native default PASS не покрывает публичную конфигурацию

- **Факт:** после scoped PASS Link r2 для native M и отрицательных Gap/fontSize тестов два следующих допустимых API кейса (Label и BOOLEAN Addon) дали по 31 human-review / восемь `reference-pin-stale`. S/S20/L эталоны проходят. Evidence: `shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r2-2026-10-10T09-05-05Z/review.json`.
- **Причина, подтверждена:** full portable reference pin включает current public root values. Selection capture правильно производит независимый effective baseline после разрешённой настройки, но identity pin сравнивает его с default reference. Portable diff содержит только Label либо два BOOLEAN в двух root property maps. Прежняя приёмка была ограничена M default/Gap/fontSize и не объявляла полный API PASS.
- **Последствия:** две разрешённые настройки блокируют исполнение правил; отсутствие violations не является успешным тестом. Пользователь не должен менять норму или текст ради совпадения pin.
- **Исправление:** core 0.1.15 / Editor 0.2.99 / Link r3 отделяют typed root TEXT/BOOLEAN configuration values явным marker и configuration pin. Нормы не менялись, historical policies сохранены; пять unchanged r2 snapshots replay на r3 разрешают все targets без human-review. Nested Line/icon остаются отдельным scope. Evidence: `Link/reports/skill-evals/link-r3-root-configuration-2026-10-10/eval.json`.
- **Защита:** до полного признания API обязательны разрешённая конфигурация, negative и RESET; каждый прогон проверяет targets и inconclusive. `verify.cjs` в сохранённом review воспроизводит пять actual reports exact, отдельно изолирует причину и проверяет сохранение stale-structure/fontSize guards. Counterfactual не помечается как fix/live PASS.
- **Ответственный:** Contract Creation — evidence, scope и текущие статусы; General — bounded shared-core/capture handoff и независимая проверка защиты.
- **Статус:** root TEXT/BOOLEAN fix реализован и локально проверен; installed r3 и независимая проверка защиты General не выполнены. General не закрывал запись. Skill 0.1.3 не изменялся; новая версия eval сохранена отдельно.

## AP-PROC-014 — нечисловая граница строки расширила Google updateCells

- **Факт:** при repin Link r2 четыре записи Леджера были ошибочно обработаны как объекты с `rowIndex`, хотя это массивы значений. `NaN` стал `null`; отсутствие row bounds распространило `updateCells` на M:O всего листа. Потеря значений обнаружена обязательным readback. Evidence: `shared/design-system_ab/experiments/current-contract-packages/Link/reports/ledger-range-recovery.r2.json`.
- **Причина, подтверждена:** shape входа не был проверен, request не проверял конечные целые координаты и точные размеры rectangle. Google принял диапазон без границ строк.
- **Исправление:** из точной предыдущей Drive revision 528 восстановлены M1:O499; M500:O503 обновлены только для Link r2. Перед восстановлением 6036 сохранившихся A:L ячеек совпали с revision 528. После восстановления прочитаны и сверены все 1509 затронутых ячеек и 23 целевые строки реестра. Потери не осталось; остальные вкладки и форматирование не заменялись.
- **Защита:** до отправки требовать `Number.isSafeInteger` для всех bounds и sheetId, положительный размер внутри metadata grid и точное соответствие rows/values rectangle; сохранять исходные CellData всего записываемого диапазона. Исполняемый regression `Link/authoring/reports/registry-write-preflight.r2.cjs` отклоняет undefined/NaN/null/string/negative, несовпадение размеров и выход за grid; проверяет реальный recovery request. Инструкция добавлена в `CONTRACT_AUTHORING_GUIDE.ru.md`.
- **Ответственный:** авторинг контрактов — проверка формы/координат и восстановление; General — независимая проверка защиты.
- **Статус:** исправлены последствия / защита проверяется. Самостоятельная сверка выполнена; независимая проверка General не заявлена.

### AP-PROC-003 — проверка защиты в Generation, 10.10.2026

- **Исправление последствий:** выпущен current `interface-v3`, General сверил
  закрытый writer, 22 output и 8 input pins и независимо принял interface.
  Только после этого Proxy получил конкретный implementation input.
  Native broker/UI и сама генерация остаются отдельными незакрытыми этапами.
- **Проверяемая защита:** `guard.py` перед handoff сверяет текущий owner message,
  ID задания, активный scope и private root; перед чтением закрытого output
  проверяет final seal и текущие source pins. Author verification содержит
  фактические `currentScopeCheck` receipts. General воспроизвёл принятие
  текущего scope и отклонение шести случаев: неверная authority в state, plan
  или assignment, отсутствующий active handoff, paused plan и чужой root.
- **Evidence:** `apollo-agent-figma-2026-10-10/process-guard-review.json`,
  `interface-v3-review.json`; author package
  `.local/apollo-agent-figma-2026-10-10/generation/interface-v3`.
- **Статус повтора:** закрыт General после независимой проверки защиты.
  Причина первоначального перехода к исторической задаче остаётся
  неустановленной; native/live приёмка этим закрытием не объявляется.


### AP-PROC-002 — неточный metadata pin в operational state General, 10.10.2026

Факт: при обновлении текущего `AGFIGMA-PROXY-01` в General state размер закрытого
`interface-v5/seal.json` был введён вручную как 16925 вместо физических 20656 bytes.
SHA256 и path были правильными. Немедленная сверка файла обнаружила расхождение.
Причина установлена: размер не был получен из файла, а был вручную перенесён в state.
Последствие: кратковременная неточность operational metadata; зависимый handoff по
ней не выполнялся. Исторические seals, immutable plan и рабочий source не менялись.

Исправление: General заново получил path/SHA256/bytes из `read_bytes`, заменил state
атомарно и сверил readback. Защита: pins выводятся из физических bytes;
`state-interface-pins.py` сверяет current stage interface pins перед передачей
входа/приёмкой. Ручной ввод размера не используется. Независимые проверки General:
актуальный state принят; неправильные bytes и SHA256 отклонены (3/3).
Ответственный: General. Статус: **закрыто после проверки защиты**.

Evidence и проверка:
`apollo-agent-figma-2026-10-10/PROCESS-LESSONS-AP002-General-state-pin.json` и
`apollo-agent-figma-2026-10-10/state-interface-pins.py` в General visualization root.
Нормы, source/Draft/Ready/live gates и права записи этим не меняются.

### AP-PROC-003 — повтор routing drift в Proxy, 10.10.2026

Факт: в текущем `AGFIGMA-PROXY-01`, turn `01a124ee-6662-7562-8b5c-6821749ab724`,
после context compaction Proxy назначил новый разбор ASA-015 System Analysis.
Основанием ошибочно стало историческое сообщение владельца
`msg_01a121c0-a99c-71e1-852a-9939e18d828e` от 09.10 17:40:36 UTC.
Актуальный task основан на `01a12489-a592-7570-9e13-3da6268cc989` и назначает
Proxy private implementation, а не новый аналитический этап. Proxy признал
неверную интерпретацию старого текста; механизм context drift не установлен.
После первой отмены аналитик также сообщил повторное возобновление от Proxy
без свежих exact human IDs. General направил явную остановку System Analysis.

Последствия: начаты лишние read-only чтения, задержано внедрение. Новая приёмка,
правка норм или подтверждённый новый scope этим не созданы. Исправление:
General остановил побочную маршрутизацию, передал reviewed v6 для исходного
implementation handoff, начал отдельную запись повторного случая. Начатые
незавершённые заметки сохраняются; historical ASA receipts не перепривязываются.

Защита для проверки: после смены контекста и перед dependent dispatch/apply/closure
сверять **текущие role/task/phase/allowed actions**, а не лишь наличие старой
human-фразы. Under current PROXY-01 новый analyst dispatch должен быть отклонён.
Ответственный: Proxy; независимая проверка и закрытие — General.
Статус: **открыто до проверки защиты и фактического продолжения исходного scope**.
Evidence: `apollo-agent-figma-2026-10-10/PROCESS-LESSONS-AP003-Proxy.json`
в General visualization root, raw Proxy user-message timestamp и текущие turns
Proxy/System Analysis. Инструкция сама по себе не считается исправлением.


### AP-PROC-004 — преждевременная передача review General, 10.10.2026

Факт: General направил Generation/Proxy ссылку на `interface-v7-review.json`,
хотя предшествующая команда записи завершилась `AssertionError` до создания
review и обновления state. Closed v7 pins и независимый provider/property replay
были проверены, но сообщение ошибочно представило несохранённый review как
действующий. Evidence: команда записи с `AssertionError`, следующие
две передачи и немедленные сообщения коррекции; исходная причина assertion —
сравнение pin целиком с input record, который также содержит `classification`.

Причина ошибки процесса установлена: General не остановил последовательность
dependent tool calls после ненулевого exit code. Classification оставалась
в seal; физические path/hash/bytes не расходились. Последствия: исполнители
получили ссылку на отсутствующий review, затем были явно остановлены до его
сохранения. Working apply и финальная приёмка не выполнялись.

Исправление: преждевременная передача отозвана, raw pins повторно сверены по
path/hash/bytes с сохранением sealed classification. Review и state сохранены
и перечитаны; только после этого выдан действующий review.

Проверяемая защита: `review-relay-guard.py` до dependent relay читает реально
сохранённый review, проверяет status/writesClosed/Ready/workingApply и все его
physical pins. Orchestration прекращает последовательность при ненулевом
exit code; сообщение допускается только после успешного guard. General
проверил missing review, pending status и неправильный pin: relay не выполнялся.
Сохранённый accepted review с текущими pins принят, фактическая передача
выполнена после guard. Ответственный: General.

Статус: **закрыто после проверки защиты в текущей передаче**.
Evidence: `apollo-agent-figma-2026-10-10/review-relay-guard.py`,
`review-relay-guard-tests.json`, `interface-v7-review.json` и
`PROCESS-LESSONS-AP004-General-review-relay.json` в General visualization root.
Эта запись не меняет нормы, scope, source/Draft/Ready/live gates или права записи.
