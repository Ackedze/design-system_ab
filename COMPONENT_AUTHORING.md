# Наполнение corp-компонентов

Документ описывает командный процесс подготовки component packages для Apollo, Athena CLI и agentic pipeline.

## Доступы и окружение

Автору нужны:

- доступ на чтение Figma library и `file_content:read` token, если требуется свежий export;
- доступ к репозиториям `design-system_ab` и Athena CLI;
- Node.js и установленные зависимости Athena;
- доступ к таблице готовности компонентов;
- Codex или Claude Code с доверенным project configuration.

Рекомендуемая структура checkout:

```text
workspace/
├── design-system_ab/
└── Athena CLI/
```

Запуск Claude Code:

```bash
cd design-system_ab
claude --add-dir "../Athena CLI"
```

Проверь командой `/memory`, что загружен корневой `CLAUDE.md`, а командой `/skills` — что доступен `corp-component-authoring`.

В Codex открой репозиторий `design-system_ab` как workspace и попроси использовать `$corp-component-authoring`. Project skill лежит в `.codex/skills/corp-component-authoring`.

## Координация

1. Выбери компонент со статусом `In progress` и закрепи его за собой в таблице.
2. Создай ветку `contracts/<component-slug>`.
3. Работай только с одним компонентом или неразделимым семейством.
4. Не меняй статус документа на `Ready` до ручного ревью.
5. Не публикуй generated artifacts отдельным commit от manual-документов того же изменения.

## Основной процесс

### 1. Получить актуальный raw

Если Figma-компонент изменился, выбери только нужный каталог в UI Athena и запусти загрузку. Athena должна обновить только выбранный raw, package generated data и связанные indexes/registries.

Если raw актуален, повторный export не нужен.

### 2. Запустить authoring workflow

В Codex:

```text
Используй $corp-component-authoring для BackgroundPlate
```

В Claude Code:

```text
/corp-component-authoring BackgroundPlate
```

Можно передать точный package path:

```text
/corp-component-authoring JSONS/web/components/web-corp/BackgroundPlate
```

Ассистент сначала проводит аудит и затем задаёт вопросы группами до пяти. Ответы владельца являются source of truth для продуктовой семантики.

### 3. Заполнить manual-документы

Подробное назначение файлов и ownership описаны в `AGENTIC_FILES.md`.

Ключевое правило:

- Athena обновляет generated;
- дизайнер и AI-ассистент обновляют manual;
- pattern хранит межкомпонентные сценарные правила;
- неизвестное остаётся открытым вопросом, а не заполняется предположением.

### 4. Проверить package

```bash
node .codex/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/web-corp/BackgroundPlate"
```

Validator проверяет обязательные файлы, JSON, ownership schema, component key, rules и признаки незаполненного шаблона. Warnings требуют ручной оценки; errors блокируют готовность.

### 5. Выполнить targeted Athena checks

Из checkout Athena CLI:

```bash
JSONS_ROOT="$(cd ../design-system_ab && pwd)/JSONS"
CATALOG="web/components/web-corp/Web _ Corp Components -- BackgroundPlate.json"

npm run catalogs:sync-apollo -- \
  --check \
  --jsons-root "$JSONS_ROOT" \
  --catalog-path "$CATALOG"

npm run contracts:check-apollo -- \
  --jsons-root "$JSONS_ROOT" \
  --catalog-path "$CATALOG"
```

Не используй full-tree `contracts:sync-apollo` для одного компонента: он может создать несвязанный generated churn по всему репозиторию.

### 6. Проверить Apollo и агента

Минимальный ручной тест:

1. Один штатный кейс, который не должен создавать нарушение.
2. Один exact violation из `rules.json`.
3. Один допустимый customization/info case.
4. Проверка состава `*_agent.json`.
5. Проверка рекомендации агента и отсутствия утверждений из `mustNotSay`.

### 7. Создать PR

PR должен содержать:

- один component package;
- связанный raw/generated diff, если был export;
- связанные patterns;
- результаты validator и targeted checks;
- список подтверждённых решений;
- открытые вопросы;
- evidence ручного теста Apollo.

После merge владелец или reviewer обновляет таблицу готовности.

Для PR, затрагивающих `JSONS/web/components/**`, GitHub Actions автоматически запускает тот же validator для packages, изменённых относительно base branch. Успешный локальный запуск не заменяет CI check.

## Эталонные комплекты

- `BackgroundPlate` — сложная composition и token/surface rules.
- `TitleView` — платформенные версии и вложенные DS-компоненты.
- `FAQ` — компактный самостоятельный компонент.

Используй эталоны только для структуры документов. Их продуктовые правила нельзя копировать в другой компонент.
