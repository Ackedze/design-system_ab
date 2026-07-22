# Redpol Markdown Format Spec

## Источник канона

Канон собран по текущему корпусу файлов в Redpol-каталогах:

- `context`: 16 файлов из `standards/redpol/textgrabber-cases`
- `snapshot`: 87 файлов из `standards/redpol/textgrabber-cases`
- `pattern`: актуальные `p_*.md` в `patterns`

Репрезентативные примеры:

- `context`: `standards/redpol/textgrabber-cases/.../about-context-2026-03-23T18-15-38.md`
- `snapshot`: `standards/redpol/textgrabber-cases/.../Selection [10287_620534].md`
- `pattern`: `patterns/p_input-fields.md`
- `pattern` c `relatedPatterns`: `patterns/p_interruption-scenario.md`

Общий принцип: для `context` и `snapshot` нормализуй структуру, а не содержание. Для `pattern` сохраняй исходный смысл, но приводи материал к текущему 10-секционному формату с атомарными правилами.

## Общие правила

- Документ начинается с одного `H1`.
- `H1` всегда однострочный.
- После `H1` идёт одна пустая строка.
- Метаданные оформлены только как плоский markdown-список `- key: value`.
- После метаданных идёт одна пустая строка.
- Секции и фрагменты нумеруются подряд: `1, 2, 3...` без пропусков.
- Не использовать YAML frontmatter внутри самих `snapshot/context/pattern` файлов.
- Не использовать таблицы, HTML и декоративные разделители, если они не были частью исходного содержимого.

## Context

### Заголовок

```md
# Context: <человеческое название>
```

### Метаданные

Порядок фиксированный:

```text
documentType
contextId
productType
flowName
platforms
pageId
pageName
selectionId
selectionName
exportedAt
sourceType
sections
figmaPageUrl
```

### Шаблон секции

```md
## Section 1: Задача

- sectionKey: task

Текст секции
```

### Что сохранять

- Оригинальные названия секций: в корпусе встречаются `Задача`, `Проблема`, `User Story`, `Аудитория`, `Для инфо`, `ВАЖНО`, `Поменялось`.
- Оригинальные `sectionKey`: `task`, `problema`, `user_story`, `audience`, `auditoriya_klient`, `dlya_info`, `vazhno`, `description`, `dannye`, `chto_sdelano`, `chto_bylo_sdelano`, `osobennosti`, `pomenyalos`.
- Содержательные огрехи в тексте не чинить, если задача только про форматирование.

### Допустимые правки

- Склеить случайно разорванный `H1` в одну строку.
- Вернуть метаполя в канонический порядок.
- Привести секции к шаблону `heading -> sectionKey -> body`.

## Snapshot

### Заголовок

```md
# Snapshot: Context <pageId> · Selection <selectionId>
```

### Метаданные

Порядок фиксированный:

```text
documentType
contextId
snapshotId
pageId
pageName
selectionId
selectionName
exportedAt
platforms
pageType
itemsCount
figmaSelectionUrl
```

### Шаблон фрагмента

```md
## Fragment 1

- fragmentId: ...
- contextId: ...
- snapshotId: ...
- orderIndex: 1
- location: ...
- contentType: ...
- typographyRole: ...
- layerName: ...
- componentName: ...
- componentKey: ...
- path: ...
- shortPath: ...

Текст фрагмента
```

### Инварианты

- `itemsCount` должен совпадать с числом блоков `## Fragment N`.
- Порядок fragment-метаполей фиксированный и не должен плавать.
- Значения `path`, `shortPath`, `selectionName` и текст фрагмента не нормализуются по смыслу, только по разметке.
- Имена snapshot-файлов лучше сохранять как есть; без явного запроса не переименовывай.

## Pattern

### Заголовок

```md
# Pattern: <название паттерна>
```

### Метаданные

Порядок фиксированный для обычного `pattern`:

```text
documentType
patternType
patternId
patternKey
productType
platforms
locale
owner
status
updatedAt
sourceType
tags
figmaLink
sections
```

Для компонентного `pattern` используйте `patternType: component`. Поле `component` обязательно и ставится сразу после `patternType`:

```text
documentType
patternType
component
patternId
patternKey
productType
platforms
locale
owner
status
updatedAt
sourceType
tags
figmaLink
sections
```

Между `figmaLink` и `sections` допускается опциональный блок:

```md
- relatedPatterns:
  - ptrn:...
```

### Шаблон секции

```md
## Section 1: Определение

Текст секции
```

### Инварианты

- `patternType` обязателен для всех `pattern` и ставится сразу после `documentType`.
- Рекомендуемые значения `patternType`: `component`, `layout`, `forms`, `media`, `controls`, `visual`, `flow`, `ux`, `table`.
- Компонентным считается `pattern` с `patternType: component`. Для совместимости аудит также распознаёт старые признаки компонентности: `component`, `ptrn:components.*` и `sourceType: component-guideline`.
- В компонентном `pattern` значение `component` не должно быть пустым. Если паттерн описывает несколько компонентов, перечисляй их через запятую.
- Поле `component` не используется в паттернах с `patternType`, отличным от `component`.
- `sections` должен совпадать с числом `## Section N: ...`.
- Для актуального pattern-формата `sections` обычно равно `10`.
- `tags` оформляются строкой через запятую и пробел.
- В секциях `pattern` не используется `- sectionKey:`.
- Раздел `## Section 6: Правила` содержит `### Rule N:` с обязательными метаполями `ruleId`, `severity`, `appliesTo`, `checkType`, `autofix`.
- Примеры UI-текста оформляются fenced-блоками `text`.
- В `## Section 10: Машинная обработка` должны быть подзаголовки `Детерминированные проверки`, `Словарные проверки`, `LLM-проверки`, `Не проверяется автоматически`, `Автоисправления`.

### Обязательные секции pattern

```text
Section 1: Определение
Section 2: Когда использовать
Section 3: Когда не использовать
Section 4: Принципы
Section 5: Структура текста
Section 6: Правила
Section 7: Шаблоны
Section 8: Примеры
Section 9: Антипримеры
Section 10: Машинная обработка
```

## Финальный чек-лист

- `documentType` соответствует фактическому типу документа.
- `H1` однострочный и с правильным префиксом.
- Метаполя полные и стоят в каноническом порядке.
- `sections` или `itemsCount` совпадают с фактическим количеством блоков.
- Между логическими блоками нет лишних пустых строк.
- После форматирования файл проходит `audit_redpol_markdown.py`.
