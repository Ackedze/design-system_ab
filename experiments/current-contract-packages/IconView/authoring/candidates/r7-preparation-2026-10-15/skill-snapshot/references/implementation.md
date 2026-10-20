# Источники и существующая реализация

Пути ниже относительно корня workplace. Прочитай нужные разделы текущих
файлов; номера версий и поддержанные поля проверяй при каждом запуске.

| Источник | Что из него брать |
| --- | --- |
| `shared/design-system_ab/experiments/current-contract-packages/manifest.json` и корневой ZIP | Актуальную версию и SHA, полный source/build/dependency inventory |
| `…/CONTRACT_AUTHORING_GUIDE.ru.md` | Классификацию норм, способы записи, условия корректности и тестовую матрицу |
| manual компонента, source rules, решения владельца | Нормы, параметры, исключения, ответственность и source RuleID |
| Доказанная структура/native API/catalog/readback | Представления, native типы/значения, canonical keys, bindings и доступность фактов |
| `projects/ComponentContractEditor/docs/USER_GUIDE.ru.md` | Действующие поля Editor и пользовательский импорт/сохранение/проверку |
| `projects/Apollo-v3/packages/component-contract-core/src/types.ts` | Actual manual/constraint/target/dependency/applicability schema |
| `…/src/validator.ts`, `compiler.ts`, `capabilities.ts` | Принимаемые поля, diagnostics, facts и фактически выпускаемый IR |
| `…/src/importer.ts`, `exporter.ts`, `zip.ts` | Поддержанный import/compile/export/reopen, сохранение facts и dependency closure |
| `…/src/runtime.ts` и нужные `tests/*` | Семантику операторов и synthetic actual verdict; тестовые примеры не являются нормой нового компонента |
| `docs/APOLLO_PROCESS_LESSONS.md` | Относящиеся к задаче подтверждённые ошибки и проверенную защиту |

Из аналитики ASA-013 используй классификацию способов и разбор известных
рисков при необходимости. Она не меняет нормы компонентов, не устанавливает
новые presets и не подтверждает проведённый A/B-пилот.

## Маршруты записи

Основной редактируемый объект — manual текущей схемы. Generated facts/readbacks
остаются отдельными исходниками, compiled строится из manual + exact facts +
dependency contracts. Cached projection не является новым нормативным входом.
Проверяй `ManualRule.id`, `RuleIr.ruleId`, `source.anchor` по actual структуре,
а не по догадке о названиях полей. Используй existing core API:

- `importWorkspace(files, contractId)` → manual/variantEvidence/dependencyContracts;
- `buildExportBundle(manual, variantEvidence, dependencyContracts)` → diagnostics и compiled;
- `buildAuthoringZip(bundle, files)` → authoring ZIP;
- `readZip` + `importWorkspace` + повторная компиляция → core reopen.

Сравнивай одинаковые представления. Два результата core в памяти можно
сверять напрямую; persisted JSON сверяй с JSON-представлением повторной
компиляции. `undefined`-поля объектов исчезают при сериализации — различие
такого объекта и JSON само по себе не означает потерю контрактных данных.
Не удаляй произвольные поля и не ослабляй проверку настоящих JSON значений,
pins или полного facts inventory ради совпадения.

Для синтетического runtime Draft допустим только явно подписанный существующий
authoring-preview путь. Его преобразование authority не сохраняется в исходном
manual/ZIP и не переносится в working/Ready. Live и execution gate не обходятся.
Сверяй actual classification с текущим gate в predicate/runtime. Например,
неактивная Draft authority сейчас даёт `not-evaluable` с UNKNOWN и причиной
`rule authority is not active`; недостаточные runtime facts могут дать
`human-review`. Эти причины неполноты не взаимозаменяемы.

## Локальный helper

`scripts/check_contract.cjs` принимает явный inventory, а не ищет произвольные
JSON по папкам. Paths могут быть абсолютными или относительно inventory.
`name` — исходное имя файла внутри пакета. SHA относится к точным bytes.

```json
{
  "schemaVersion": "apollo.contract-authoring-inputs.v1",
  "contractId": "exact-contract-id",
  "files": [
    {
      "name": "contract.manual.json",
      "path": "./candidate/contract.manual.json",
      "sha256": "<actual 64 hex SHA-256>"
    }
  ]
}
```

Добавь все фактически необходимые facts/catalogs и зависимости. Helper
проверяет pins, вызывает существующий core, выпускает validation/compiled и,
при отсутствии compiler errors, ZIP с core reopen. Он сохраняет tool/source
inventory и равенство manual, compiled и полного variantEvidence при reopen.
Новый output directory обязан отсутствовать: прежние результаты не затираются.
Exit 0 — только успешная техническая проверка указанного набора; exit 1 —
compiler error, drift или сбой. Отчёт остаётся доступен при compiler errors.

Этот helper не проверяет смысл текста, не доказывает достаточность выбранных
входов, не синхронизирует рабочие manifest и не заменяет Editor UI/live тест.
Пропущенный источник отмечается в eval, даже если компиляция прошла.
