# Button — восстановленный пакет r12

Загрузить в ComponentContract Editor 0.2.21: **Button.editor-input.r12-recovered.zip**.
Ожидаемое состояние: **manual r12, 26 правил**.

Перед импортом скачайте текущий контракт, если после последних отчётов внесли новые
правки. Пакет восстанавливает сохранённую r12, но не объединяет более новые изменения.

Источник manual: `button.validation-report.2026-09-25T06-59-32-320Z.json`,
поле `sources.manual`. Восстановлено без изменения ревизии, правил, targets и метаданных.
Manual hash: `70aecf356c862afb1cada1ebcd143aeffb0e777af7647dd6fbec69dad073b4af`.

Содержимое ZIP:

- `contract.manual.json` — точный ручной source из отчёта;
- `evidence/` — восемь неизменённых файлов исходного `Button.editor-input.zip`;
- `compiled/component-contract.v2.json` — результат compiler core 0.2.21, не редактировать;
- `coverage.json` и `validation-report.json` — результаты компиляции, не live-аудит макета;
- `recovery-provenance.json` — происхождение и контрольные суммы.

Исходные ZIP, отчёты и основной manual в папке Button не перезаписаны. Старый
`Button.editor-input.zip` по-прежнему содержит r8 / 24 правила. Это восстановительная
копия, не новая редакция правил и не миграция нормативных источников или ds-ai-hub.
Контракт остаётся Draft, известные пробелы исполнения и прежний pending ledger sync
не закрыты восстановлением.

После импорта повторите проверки обоих инстансов из отчётов 09:55 и скачайте JSON.
Одинаковые baseline-отличия объединяются только на экране, все RuleID остаются в JSON.
