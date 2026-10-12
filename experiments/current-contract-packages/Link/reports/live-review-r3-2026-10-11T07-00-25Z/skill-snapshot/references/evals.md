# Evals контрактного авторинга

Eval выполняется при заполнении каждого нового контракта и при существенном
исправлении. Это проверка результата агента по источникам, с отдельной
технической проверкой, а не самооценка по числу PASS.

## Сохранённый запуск

Используй новый durable run directory. Для реального компонента:
`current-contract-packages/<Component>/reports/skill-evals/<run-id>/` либо
разрешённый private candidate root до применения. Для development eval:
workspace `.local/apollo-contract-authoring-evals/<run-id>/`.
Храни только нужные файлы/patches и metadata; большие источники связывай
точными path/revision/SHA. Не создавай копию репозитория или dependency tree.

Сохраняй:

- `case.json`: запрос, scope, raw inputs с pins, seed/current package, ожидаемое
  поведение и основания, необходимые представления/условия; synthetic отдельно.
- `skill-snapshot/`: точную небольшую версию SKILL.md, references и helpers,
  включая SHA; версия без bytes/pins недостаточна.
- `candidate/`: manual, coverage-map, вопросы, diff и case matrix автора;
- `technical/`: actual compiler diagnostics, compiled, core ZIP/reopen receipts;
- `eval.json`: оценки ниже с evidence, автор/проверяющий и actual gaps;
- `lessons.json`: подтверждённые ошибки и решения по ним, либо пустой список;
- `seal.json`: final pins после закрытия записи, без самого seal в vector.

На forward eval автор видит запрос/raw inputs/skill, но не эталонный contract,
private rubric или выводы reviewer. Reviewer сверяет источники и artifact.
Если независимый reviewer недоступен, пометь `review.independent=false`;
повторное чтение тем же автором не становится независимой приёмкой.

## Проверяемые критерии

Для каждого критерия запиши `PASS|FAIL|PARTIAL|BLOCKED|NOT_RUN`, evidence и gaps.
Разделяй:

1. **Нормативный смысл:** точные значения, native типы/регистр, исключения,
   permission/ownership и applicability совпадают с источником. Нет выдуманных
   лимитов, generic defaults или неразрешённых публичных настроек.
2. **Полнота источников:** каждая исходная норма сохранена в карте. Покажи
   source → actual IR/policy/delegated/context/manual-review/unresolved.
   Неучтённая норма — FAIL; явно неподдержанная — честный gap, а не AUTO.
3. **Привязки и prerequisites:** canonical identity, platform/variant/modes,
   target/scope, dependency pins/closure и независимый baseline. Unknown не
   выдаётся за absence, resolved или notApplicable.
4. **Схема и компиляция:** actual shared-core diagnostics сохранены. Draft с
   пустым constrained body может иметь обычную RULE_CONSTRAINT; статус Draft
   не разрешает скрыть ошибку. Число IR не является оценкой семантики.
5. **Сохранность и roundtrip:** незатронутые нормы/данные не потеряны;
   import/export/reopen воспроизводит exact manual/compiled/full facts.
   Core roundtrip и проверка установленного Editor UI отмечаются отдельно.
6. **Поведение кейсов:** positive, violation, restoration, boundaries,
   active/inactive и insufficient evidence применяются по смыслу нормы.
   Храни ожидаемое и фактическое по конкретному compiled RuleID. Невозможный
   negative case не придумывай; singleton order — такой пример.
7. **Статусы и scope:** candidate/working, schema, source/API, coverage,
   synthetic/browser/native-live, Ready/release и synchronization различаются.
   Необязательная проверка не выдумывается; обязательная непроведённая — gap.

Неверная норма, потеря правила/данных, fabricated identity/receipt, gate bypass
или false Ready — критическая ошибка; её не скрывает средний балл. Eval
`PASS` относится только к явно перечисленной выполненной области. Overall
`PARTIAL` — оставшиеся обязательные проверки; `BLOCKED` — отсутствующий вход;
`FAIL` — подтверждённое несоответствие. Время/число действий записывай только
при реальном измерении, не выводи ускорение из размера файла или тестов.

Минимальный `eval.json`:

```json
{
  "schemaVersion": "apollo.contract-authoring-eval.v1",
  "runId": "unique-run-id",
  "caseId": "stable-case-id",
  "skill": {"version": "0.1.0", "sealPath": "skill snapshot seal path"},
  "evidenceKind": "synthetic",
  "review": {"author": "agent", "reviewer": "reviewer", "independent": true},
  "criteria": [{"id": "semantic-fidelity", "status": "PASS", "evidence": ["path + SHA"], "gaps": []}],
  "overall": "PARTIAL",
  "acceptedScope": ["explicitly checked scope"],
  "gaps": ["Editor UI NOT_RUN_USER_ONLY"],
  "errors": [],
  "learning": {"skillChange": false, "reason": "No demonstrated skill defect"}
}
```

## Цикл обучения

### Переиспользование проверок

Для повторяющегося механизма сначала сопоставь текущую реализацию и scope с
сохранёнными проверками: exact pins, runtime/capture policy, оператор и факты,
native типы, binding/control path, actual constraint/IR, условия и исключения.
Сохрани отдельно reused evidence с его исходной областью, проверенные отличия
нового контракта и оставшиеся кейсы. Проверка механизма не доказывает новую
native привязку и не вводит лимиты другого компонента.

Подтверждённые positive/violation/RESET для той же привязки позволяют снять
повтор только с другим разрешённым текстом, если нового ограничения нет.
Запиши его как `NOT_RUN_NOT_REQUIRED_OPTIONAL_REPEAT` с основанием, а не PASS.
Новый лимит/условие/исключение требует проверки отличия; изменение реализации,
capture или привязки и неполное evidence требуют повторить затронутую область.
Reused evidence и свежие native результаты учитывай раздельно; сами по себе
они не меняют Draft/Ready gates. Конкретный разбор Link/BenefitCard находится
в разделе тестирования актуальной инструкции авторинга.

### Изменение навыка по подтверждённой ошибке

1. Сохрани первый результат и actual error до исправления. Определи, где
   причина: skill instruction, недостаточный input, validator/runtime defect,
   source conflict или ошибка процесса. «Не установлена» допустима.
2. Добавь воспроизводимый regression case с подтверждённым ожидаемым поведением
   и pins исходников. Если повторилось известное, обнови запись о повторении.
3. Исправь узкую инструкцию/helper/reference, если причина там. Норму компонента
   не превращай в общее правило. Shared core/Editor defect фиксируй отдельным
   конкретным backlog/handoff; skill не получает право менять product engine.
4. Повтори неудачный case на новом snapshot и затронутые прежние кейсы. Прогон
   исходной версии на том же input доказывает regression, когда он сохранён.
   Для неоднозначного текстового решения полезен fresh forward case; не считай
   заученный эталон достаточным доказательством переноса на новый компонент.
5. Сохрани before/after, результаты, причины изменений, новый skill version
   и final seal. Только после проверки отмечай lesson `verified`. При FAIL
   сохрани candidate patch; не объявляй скилл исправленным.

Журнал локальных evals ведётся в `evals/registry.json`: стабильный case ID,
raw-input/prompt paths, purpose, regression/forward, версии и ссылки на runs.
Реальные private данные и нормы не копируй в public synthetic fixtures.
Process/synchronization ошибки дополнительно фиксируй по workspace AGENTS.
Если центральный журнал pinned активным consumer, сохрани durable lesson
отдельно и deferred sync; не переписывай закрытые snapshots ради обновления.

Установка новой skill version не требует продуктового Ready. Для применения
изменений контракта соблюдай обычные source/owner/synchronization gates.
