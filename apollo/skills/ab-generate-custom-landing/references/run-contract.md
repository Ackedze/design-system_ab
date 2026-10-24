# Контракт прогона и отчёт

Папка прогона находится вне активного навыка. Не перезаписывай закрытые прогоны.
Минимальные артефакты:

- `brief.txt`: исходный запрос без изменений;
- `spec.json`: структурированные требования и открытые решения;
- `run.json`: журнал источников и оценка текстового объёма;
- `result.json`: фактический результат, проверки, проблемы;
- `readback.json`, скриншоты: только реально полученные evidence;
- `REPORT.md`: итог со всеми файлами, токенами и гэпами.

## spec.json

```json
{
  "version": 1,
  "briefFile": "brief.txt",
  "target": {"fileKey": "from user/tool", "pageId": "from user/tool", "rootId": null},
  "facts": [{"id": "fact-1", "quote": "дословный фрагмент", "source": "brief.txt"}],
  "decisions": [{"id": "decision-1", "value": "ответ", "source": "user message"}],
  "questions": [{"id": "question-1", "question": "вопрос", "dependsOn": ["hero"], "status": "open"}],
  "sections": [{"id": "hero", "role": "оффер", "factIds": ["fact-1"], "component": null, "props": {}, "assets": [], "rules": [], "nodeId": null}],
  "customBlocks": []
}
```

Это пример формы, а не утверждённая структура страницы. Добавляй сведения,
которые нужны текущему прогону. В `questions` нет фиксированного списка.
Композиционные предложения не записываются как ответы пользователя.

## Учёт файлов по мере работы

Из корня навыка (пути файлов могут быть абсолютными):

```sh
python3 scripts/run_report.py start /path/to/RUN --brief /path/to/brief.txt
python3 scripts/run_report.py read /path/to/RUN --role norms /path/to/landing-pages.md
python3 scripts/run_report.py read /path/to/RUN --role mapping --lines 1:120 /path/to/adapter.figma.md
python3 scripts/run_report.py track /path/to/RUN --role assets --mode inspect /path/to/image.png
python3 scripts/run_report.py track /path/to/RUN --role tooling --mode execute /path/to/build-section.js
python3 scripts/run_report.py track /path/to/RUN --role pins --mode hash-only /path/to/catalog.json
```

`read` действительно читает и выводит указанный текст, записывает pin и диапазон.
`track` регистрирует другое использование; это не доказательство чтения норм.
Для JSON, прочитанного программно и выведенного частично, сохрани extract и
зарегистрируй исходник как `inspect`, extract — как `read`. Не загружай многомегабайтный
каталог в модель ради отчёта. Метка `inherited-context` допустима для уже
прочитанного до начала журнала файла с явной оговоркой; не называй её автоматическим
capture. Binary asset не считается текстовым входом модели.

Не включай токены/ключи доступа, полные environment dumps, auth headers или
историю чужих задач. Скрипт отчёта не читает журнал Codex автоматически.

## result.json и статусы

```json
{
  "figmaUrl": null,
  "rootId": null,
  "summary": "что получилось",
  "checks": [{"name": "instance identity", "verdict": "PASS", "evidence": "readback.json"}],
  "issues": [{"kind": "gap", "description": "что отсутствует", "impact": "какое решение ограничено", "status": "open"}],
  "questions": [],
  "limits": ["что не проверялось"]
}
```

`completed`: достигнут согласованный результат; `needs-input`: для продолжения
нужен ответ; `interrupted`: остановка/ошибка. Оба последних тоже выпускают отчёт.
`issues=[]` допустимо только если проблем не было; исправленные ошибки сохраняются
со статусом resolved и источником проверки. Не скрывай blockers из финального отчёта.

## Токены

Если host предоставляет реальные usage, передай файл с **дельтой текущего прогона**:

```json
{"scope": "run-delta", "source": "host usage for this run", "input_tokens": 1200, "cached_input_tokens": 800, "output_tokens": 300, "reasoning_output_tokens": 100}
```

Значения примера не являются бенчмарком. `cached_input_tokens` входят во входящие,
`reasoning_output_tokens` — в исходящие; итог = входящие + исходящие, без двойного
сложения подмножеств. Накопительные totals сессии сначала преобразуй в дельту
по baseline именно текущего прогона; одинаковые snapshots нельзя складывать.
Сохрани происхождение usage и время последнего снимка. Если в нём нет части
полей — это UNKNOWN, не ноль. Счётчик аккаунта не заменяет usage операции.

Без реального usage скрипт даёт лишь приблизительную оценку зарегистрированного
текстового объёма (UTF-8 bytes / 4, с обозначенным диапазоном /6…/2), а не полный
расход модели. Она не учитывает скрытый/system контекст, изображения, reasoning
и не заменяет счётчик host. Если точность недоступна, честно показывай UNKNOWN
для полного расхода и отдельную оценку учтённой части.

```sh
python3 scripts/run_report.py finish /path/to/RUN --status completed --result /path/to/result.json --usage /path/to/usage.json
```

Без `--usage` сработает обозначенная оценка. После целевой правки создай новую
версию spec/evidence; новый отчёт относится только к этому прогону и не стирает
предыдущие результаты.
