# arui-private-ai-hub

AI-слой дизайн-системы **arui-private** (корпоративные компоненты Альфа-Бизнеса).
Хаб собирает знания о дизайн-системе в одном месте и отдаёт их AI-агентам через MCP-сервер и скилы.

Хаб нужен для пяти задач:

| # | Задача | Что должен уметь агент |
|---|---|---|
| 1 | **Консультация** | ответить, какой компонент выбрать, как он работает, какие у него правила и чем заменить устаревший |
| 2 | **Проверка макета** | распознать компоненты в Figma-выгрузке и проверить их по правилам и паттернам |
| 3 | **Шаблон страницы по дизайну** | превратить Figma-макет в JSX на компонентах arui-private |
| 4 | **Проверка кода** | проверить JSX/TSX: устаревшие компоненты, пропсы, токены, правила |
| 5 | **Генерация макета в Figma** | собрать макет из правильных Figma-компонентов и вариантов по правилам |

---

## Содержание

1. [Как всё устроено](#1-как-всё-устроено)
2. [Принципы](#2-принципы)
3. [Структура репозитория](#3-структура-репозитория)
4. [Сущности и связи между ними](#4-сущности-и-связи-между-ними)
5. [Файлы сущности: что в них и зачем](#5-файлы-сущности-что-в-них-и-зачем)
6. [Паттерны](#6-паттерны)
7. [Токены](#7-токены)
8. [Индексы](#8-индексы)
9. [Служебные файлы entities/](#9-служебные-файлы-entities)
10. [Источники и адаптеры](#10-источники-и-адаптеры)
11. [Сборка, проверка, черновики](#11-сборка-проверка-черновики)
12. [MCP-сервер](#12-mcp-сервер)
13. [Какие данные работают на какую задачу](#13-какие-данные-работают-на-какую-задачу)
14. [Скилы](#14-скилы)
15. [Типовые операции](#15-типовые-операции)
16. [Покрытие и известные пробелы](#16-покрытие-и-известные-пробелы)
17. [Документы и решения](#17-документы-и-решения)

---

## 1. Как всё устроено

```
 ИСТОЧНИКИ (чужие репозитории)          АДАПТЕРЫ                 ДАННЫЕ ХАБА                ПОТРЕБИТЕЛИ
 ─────────────────────────────          ────────                 ───────────                ───────────
 design-system_ab  (Figma, правила) ─► adapters/design-system-ab ─┐
 ds-ai-hub         (паттерны)       ─► adapters/ds-ai-hub        ─┤
 core-components   (токены, API)    ─► adapters/core-components  ─┼─► entities/  ──► tools/build ──► entities/ (meta, индексы)
 arui-private      (код компонентов)─► adapters/arui-private     ─┘   (фасеты)                          │
                                                                                                         ├─► mcp-server ──► агенты
                          entities/taxonomy.json, *.overrides.json  (правишь ты) ──────────────┘         └─► skills/
```

1. **Источники** — чужие репозитории. Хаб их не меняет и в работе от них не зависит.
2. **Адаптеры** один раз переводят данные источника в формат хаба и раскладывают по файлам-фасетам в `entities/`.
3. **Авторские файлы** (`taxonomy.json`, `*.overrides.json`, `templates/`) — решения, которые принимает команда хаба. Адаптеры их не трогают.
4. **Сборка** (`tools/build-entities.mjs`) соединяет фасеты и авторские файлы: строит карточку каждой сущности (`meta.json`), связи, Code Connect и индексы.
5. **MCP-сервер и скилы** читают только `entities/`. Ни одного внешнего репозитория в рантайме.

Одна команда обновляет всё: `node tools/sync.mjs`.

---

## 2. Принципы

| Принцип | Что это значит | Зачем |
|---|---|---|
| **Автономность** | MCP и скилы читают только `entities/` | хаб работает без клонов других репозиториев; смена источника не ломает агентов |
| **Свой формат** | ID, поля и схемы определяет хаб; термины источников (Apollo baseline, reset model) не переносятся | формат не зависит от того, как устроен источник сегодня |
| **Один файл — один владелец** | каждым файлом владеет ровно один адаптер, сборка или человек; владение записано в `sources.lock.json` | адаптеры не перетирают чужие данные и ручные правки |
| **Приоритет источников** | `design-system_ab` → `ds-ai-hub` → `core-components` → `arui-private` | при конфликте понятно, кто прав; младший источник только дополняет |
| **Ручное решение побеждает** | `overrides` перекрывают собранное автоматически | автоматика ускоряет, но последнее слово за человеком |
| **Детерминизм** | импорт без LLM; повторный прогон без изменений источника не меняет ни одного файла | дифф в git показывает только реальные изменения |
| **Ничего не выдумывать** | нет данных — пробел явно помечен (`figma-only`, `TODO`, предупреждение валидатора) | агент не генерирует уверенный, но неверный ответ |

Каждый файл в `entities/` относится к одному из трёх типов:

| Тип | Кто пишет | Можно править руками? |
|---|---|---|
| **GEN** | адаптер источника | нет, перезапишется при следующем импорте |
| **BUILD** | `tools/build-entities.mjs` | нет, пересобирается из GEN и AUTH |
| **AUTH** | человек | да, это и есть место для ручных решений |

---

## 3. Структура репозитория

```
arui-private-ai-hub/
├── entities/                      ДАННЫЕ ДИЗАЙН-СИСТЕМЫ — единственный источник для MCP
│   ├── taxonomy.json              AUTH   кто есть кто: ID, уровень, библиотека, ключи в источниках
│   ├── sources.json               AUTH   источники, их приоритет, настройки адаптеров
│   ├── sources.lock.json          GEN    какой адаптер каким файлом владеет, из какого коммита
│   ├── primitives/core.<slug>/    сущности по уровням (по папке на сущность, внутри — фасеты)
│   ├── components/<lib>.<slug>/
│   ├── composites/<lib>.<slug>/
│   ├── helpers/helper.<slug>/
│   ├── patterns/<id>/             UX-паттерны и их правила
│   ├── templates/<id>/            AUTH   шаблоны экранов (пока не созданы — папка появится с первым шаблоном)
│   ├── tokens/                    токены кода и Figma Variables
│   └── indexes/                   BUILD  быстрые индексы для MCP
│
├── adapters/                      ИМПОРТ ИЗ ИСТОЧНИКОВ (Node ≥ 18, без зависимостей)
│   ├── design-system-ab/          Figma-контракты, правила, кейсы, паттерны, Figma Variables
│   ├── ds-ai-hub/                 паттерны и правила, которых нет в design-system_ab
│   ├── core-components/           CSS-токены и API примитивов
│   ├── arui-private/              код corp/promo-компонентов
│   └── lib/                       общее: запись файлов, владение (lock), парсер паттернов
│
├── tools/
│   ├── sync.mjs                   всё сразу: адаптеры по приоритету → сборка → проверка
│   ├── build-entities.mjs         сборка meta.json, связей, Code Connect, индексов
│   ├── validate-entities.mjs      проверка ссылок, ID и ручных маппингов (для CI)
│   ├── code-connect-drafts.mjs    обзор, отчёт и принятие черновиков Code Connect
│   └── lib/code-connect.mjs       сопоставление Figma ↔ React
│
├── mcp-server/                    MCP-сервер (TypeScript, Node ≥ 20), читает только entities/
├── skills/                        инструкции для агентов под конкретные задачи
└── docs/                          ADR, исследования, отчёт по черновикам Code Connect
```

---

## 4. Сущности и связи между ними

### 4.1. Какие бывают сущности

```
Token ─────────────── дизайн-значение (цвет, отступ, радиус, тень)
  │                    Figma Variable ⇄ CSS-переменная
  ▼
Primitive  core.*     атомарный компонент @alfalab/core-components (Button, Input, Tag)
  ▼
Component  corp.* · promo.* · limited.*   самостоятельный компонент arui-private (TitleView, BackgroundPlate)
  ▼
Composite  corp.* · promo.* · preset.*    собирается из нескольких компонентов (FilterBar, AccountSelect)
  ▼
Template              структурная схема экрана (пока не созданы)

Сквозные сущности — относятся к любому уровню:
  Pattern      UX-руководство по сценарию (BackgroundPlate, формы, таблицы, адаптив)
  Rule         одно проверяемое правило — у компонента или у паттерна
  Code Connect связь Figma-компонента и React-компонента одной сущности
  Case         пример ожидаемого поведения (материал для тестов агента)

Вне иерархии:
  Helper  helper.*    служебные Figma-компоненты (сетка, отступы, документация)
```

| Сущность | Где лежит | Кто наполняет | Зачем нужна |
|---|---|---|---|
| **Token** | `tokens/` | core-components (код), design-system_ab (Figma) | чтобы агент писал `var(--gap-16)`, а не `16px`, и узнавал токен по Figma-переменной в макете |
| **Primitive** | `primitives/core.<slug>/` | design-system_ab + core-components | arui-private собран из примитивов; без них не распознать половину макета и не проверить их использование |
| **Component** | `components/<lib>.<slug>/` | design-system_ab + arui-private | основная единица: назначение, Figma-варианты, пропсы, правила |
| **Composite** | `composites/<lib>.<slug>/` | то же | отдельно от Component, потому что важно, из чего он собран и какие ограничения на вложенные части |
| **Helper** | `helpers/helper.<slug>/` | design-system_ab | в макетах их много (`SpacingVertical` — отступ); их нужно распознавать, но в код они не переходят |
| **Pattern** | `patterns/<id>/` | design-system_ab, затем ds-ai-hub | отвечает на вопрос «как правильно использовать», а не «что это»; основа консультации и проверок |
| **Rule** | `rules.json` у сущности и паттерна | design-system_ab, ds-ai-hub | атомарное проверяемое утверждение с текстом, серьёзностью и способом проверки |
| **Code Connect** | `code-connect.json` у сущности | сборка + ручные маппинги | переводит `View=Primary, Size=56` в `view="primary" size={56}` |
| **Case** | `cases.json` у сущности | design-system_ab | готовые eval-тесты: вход и ожидаемый ответ агента |
| **Template** | `templates/<id>/` | вручную | будет описывать зоны экрана и допустимые компоненты; нужен для задач 3 и 5 |

### 4.2. Идентификаторы

| Что | Формат | Пример | Почему так |
|---|---|---|---|
| Сущность | `<library>.<slug>` | `corp.title-view`, `core.button` | ID хаба не зависит от ключей источника: `web-corp.buttons-group` стал `corp.button-group` и не изменится, если источник сменится |
| Правило сущности | `<entityId>#<slug>` | `corp.background-plate#blend-mode-is-fixed` | по ID сразу видно владельца |
| Правило паттерна | `pattern:<patternId>#<slug>` | `pattern:background-plate#level-1-outer` | отличается от правил компонентов префиксом |
| Паттерн | `<slug>` | `filter-bar` | короткий, по имени файла источника |

Библиотеки в ID: `core` — @alfalab/core-components; `corp` — корпоративные компоненты arui-private; `promo` — промо-компоненты; `preset` — Figma-пресеты экранов; `limited` — «не подключать в новые продукты»; `helper` — служебные Figma-компоненты.

Исходные ключи никуда не пропадают: они лежат в `sources` (у сущности) и `sourceId` (у правила). По ним всегда можно найти данные в источнике.

### 4.3. Как сущности связаны

```
                    ┌──────────── patterns[] / entities[] ────────────┐
                    ▼                                                  ▼
   Pattern ── rules.json ◄── patternRules[] ── Rule сущности ── Entity (meta.json)
                                                                   │   ▲
                                         uses[] (из anatomy.json)  │   │ usedBy[]
                                                                   ▼   │
                                                               Entity ─┘
   Entity ── figma.json ── key / variants[].key ──► indexes/figma-keys.json ◄── Figma-выгрузка макета
      │           └── variableKeys ──► tokens/figma-variables.json ──► indexes/token-map.json ──► tokens-flat.json
      └── code.json ──┐
      figma.json ─────┼──► code-connect.json  (свойство Figma → проп React)
      overrides ──────┘
```

| Связь | Где записана | Как появляется | Для чего |
|---|---|---|---|
| сущность → из чего состоит | `meta.uses`, подробно в `anatomy.uses` | адаптер: прямые вложенные инстансы Figma-компонента | понять состав, проверить вложение, собрать шаблон |
| сущность → где используется | `meta.usedBy` | сборка: обратная к `uses` | оценить последствия изменения компонента |
| сущность ↔ паттерн | `meta.patterns`, `patterns/<id>/meta.entities` | сборка: из ссылок правил, `semantics.patternRefs` и имён компонентов в паттерне | от компонента к руководству и обратно |
| правило компонента → правило паттерна | `rules[].patternRules` | адаптер: из ссылок источника | показать человеческое объяснение технического правила |
| Figma-ключ → сущность и вариант | `indexes/figma-keys.json` | сборка из `figma.json` | распознать любой инстанс из выгрузки макета |
| Figma-переменная → CSS-переменная | `indexes/token-map.json` | сборка по правилам имён | перевести цвет и отступ из макета в код |
| Figma-компонент → React-компонент | `code-connect.json` | сборка + ручные маппинги | генерация кода по макету, проверка кода |
| сущность → ключи в источниках | `taxonomy.json → sources`, `meta.sources` | вручную в таксономии | связать одну сущность в четырёх репозиториях |

---

## 5. Файлы сущности: что в них и зачем

Папка сущности: `entities/<level>/<id>/`. Набор файлов зависит от того, что есть в источниках. Например, у Figma-only частей нет `code.json`, а у примитивов без Figma-пакета нет `figma.json`.

| Файл | Тип | Кто пишет | Зачем |
|---|---|---|---|
| `meta.json` | BUILD | сборка | карточка сущности: всё главное в одном месте, без чтения остальных файлов |
| `figma.json` | GEN | design-system-ab | Figma-компоненты семейства, свойства, варианты, ключи |
| `semantics.json` | GEN | design-system-ab | назначение и правила применения словами: когда использовать, что ставить в новый макет |
| `anatomy.json` | GEN | design-system-ab | состав и ограничения на вложенные части |
| `rules.json` | GEN | design-system-ab | правила компонента с текстом и способом проверки |
| `cases.json` | GEN | design-system-ab | примеры ожидаемого поведения для тестов |
| `code.json` | GEN | core-components / arui-private | React-сторона: импорт, пропсы, статус в коде |
| `code-connect.json` | BUILD | сборка | таблица «свойство Figma → проп React» |
| `overrides.json` | AUTH | человек | ручные поля поверх `meta.json` (например, замена для deprecated) |
| `code-connect.overrides.json` | AUTH | человек | ручной маппинг Figma → React |
| `code-connect.overrides.draft.json` | черновик | агент / человек | предложенный маппинг на ревью; сборка его не читает |

### 5.1. `meta.json` — карточка сущности

С неё начинается любой ответ MCP о компоненте.

| Поле | Пример | Зачем |
|---|---|---|
| `id` | `corp.background-plate` | постоянный ключ сущности во всём хабе |
| `name` | `BackgroundPlate` | имя для поиска и ответов |
| `level` | `component` | уровень в иерархии: primitive / component / composite / helper |
| `library` | `corp` | библиотека: от неё зависят правила подключения (например, `limited` нельзя в новые продукты) |
| `restricted` | `true` | только у `limited.*`: агент предупреждает «не подключать» |
| `summary` | «семейство surface-компонентов…» | краткое назначение для консультации и поиска |
| `platforms` | `["desktop","mobile-web"]` | где компонент доступен |
| `status.lifecycle` | `active` / `scheduled` / `deprecated` | жизненный цикл в Figma: `scheduled` ещё не опубликован, `deprecated` нельзя ставить |
| `status.knowledge` | `ready` / `draft` / `generated-draft` | насколько проработаны знания: на `generated-draft` агент отвечает осторожнее |
| `status.figmaComponents` | `{"active": 14}` | статусы отдельных Figma-компонентов: семейство живо, но его часть может быть deprecated |
| `code.package` / `code.import` | `arui-private` / `arui-private/background-plate` | как импортировать в коде |
| `code.component`, `code.exports` | `BackgroundPlate`, `[…]` | какие имена экспортирует пакет: по ним MCP находит сущность по JSX |
| `code.lifecycle`, `code.deprecatedSince` | `deprecated`, `2024-04-18` | статус в коде отдельно от Figma: компонент может быть жив в Figma и устареть в коде, и наоборот |
| `codeConnect` | `{status, mapped, …}` | насколько полон перевод Figma → код |
| `patterns` | `["background-plate"]` | какие паттерны описывают компонент |
| `uses` / `usedBy` | `["core.button"]` | состав и обратные связи |
| `counts` | `{figmaComponents, variants, rules, cases}` | быстрый профиль без чтения фасетов |
| `facets` | `["figma","rules",…]` | какие файлы есть у сущности |
| `sources` | `{"design-system-ab": "web-corp.background-plate", …}` | ключи в источниках |
| `replacement`, `migrationNotes` | из `overrides.json` | чем заменить и как мигрировать: используют `check_deprecated` и `get_migration_path` |

### 5.2. `figma.json` — Figma-сторона

| Поле | Зачем |
|---|---|
| `family`, `library` | семейство и Figma-библиотека: распознавание по имени |
| `platforms`, `channels` | платформы и каналы (b2b) |
| `knowledgeStatus` | зрелость знаний в источнике (переходит в `meta.status.knowledge`) |
| `components[].name`, `key` | Figma-компонент и его ключ: по ключу из выгрузки находится сущность |
| `components[].platform`, `status`, `role` | платформа ([D]/[M]), lifecycle и роль (`main` — публичный) |
| `components[].description`, `useWhen`, `doNotUseWhen` | описание из Figma, если оно есть |
| `components[].properties` | свойства и допустимые значения, например `{"Size": ["32","40","48"]}`: проверка макета и генерация |
| `components[].defaultVariantKey`, `variants[]` | ключ каждого варианта и его значения: чтобы вставить в Figma нужный вариант и распознать вариант в выгрузке |
| `components[].variableKeys` | какие Figma Variables применены (fills, strokes, …): связь с токенами |
| `components[].layers` | именованные части (TEXT, вложенные инстансы): что заполняется контентом |

### 5.3. `semantics.json` — как применять

| Поле | Зачем |
|---|---|
| `summary`, `includes`, `replaces` | назначение семейства, что в него входит, что оно заменяет |
| `components[]` | по каждому Figma-компоненту: `purpose`, `useWhen`, `doNotUseWhen`, `relationship`. Главный материал для «какой компонент выбрать» |
| `generation` | политика для **новых** макетов: что ставить по умолчанию, какие компоненты legacy и чем их заменить (`migrationTarget`). Без неё агент поставит устаревший `[D] BackgroundPlate` вместо `BackgroundPlateSlot` |
| `publicApi` | публичные свойства и их смысл |
| `code.exports[]` | известные источнику кодовые экспорты и их соответствие Figma (например, `BackgroundPlateView` — алиас) |
| `patternRefs` | паттерны, на которые ссылается источник |
| `guidance[]` | прочие авторские политики `{area, topic, body}`: использование, API, композиция. Отдаются агенту как контекст |

### 5.4. `anatomy.json` — состав

| Поле | Зачем |
|---|---|
| `uses[]` | прямые вложенные компоненты **других** сущностей: `entity`, `figmaName`, `roles`, в каких хостах, сколько раз. Из этого строятся `meta.uses` и `meta.usedBy` |
| `parts[]` | собственные внутренние части семейства и нераспознанные вложения |
| `constraints[]` | ограничения на вложенные части: какие сущности выбираются (`select`), что проверяется (`checks`: операция, свойство, допустимые значения, сообщение, ссылка на правило), политики (`policies`). Пример: Status внутри TitleView только `Size=24` |

### 5.5. `rules.json` — правила

Одинаковый формат у сущностей и у паттернов.

| Поле | Пример | Зачем |
|---|---|---|
| `id` | `corp.title-view#external-spacing` | постоянный ID правила |
| `title` | «Используй Level 1 как внешний слой» | заголовок (у правил паттернов) |
| `text` | полный текст правила | то, что агент цитирует и проверяет; без текста правило бесполезно |
| `severity` | `error` / `warning` / `info` / `recommendation` | насколько серьёзно нарушение: `error` блокирует |
| `checks` | `["deterministic"]`, `["llm"]`, `["manual"]` | как проверять: алгоритмом, моделью или человеком |
| `surface` | `["figma"]` / `["design"]` | **где применимо**: `figma` — свойства слоёв Figma (это проверяет Figma-линтер, к коду не относится); `design` — дизайн-решение, проверяется и в макете, и в коде |
| `appliesTo` | `["layout.itemSpacing"]`, `["screen"]` | к чему относится правило |
| `target` | `{entity, layers}` | точная цель внутри компонента |
| `when` | условия | когда правило действует |
| `constraint` | `{"requiredValue": "…"}` | машинное ограничение: какое значение обязательно или запрещено |
| `remediation` | «Сбросьте blend mode…» | как исправить нарушение |
| `patternRules` | `["pattern:background-plate#…"]` | ссылка на человеческое объяснение в паттерне |
| `correct`, `incorrect`, `why` | примеры и обоснование | у правил паттернов: лучший материал для консультации |
| `autofix` | `partial` | можно ли исправить автоматически |
| `status`, `provenance` | `active`, `pattern-link` | статус и происхождение правила в источнике |
| `sourceId` | `component:web-corp.…` | исходный ID, чтобы найти правило в источнике |

### 5.6. `cases.json` — примеры поведения

`{ id, title, type, rule, input, expected }` — вход (изменение в макете, состояние) и ожидаемый результат (что найти, что сказать, чего не говорить). Нужны для автоматических тестов качества агента.

### 5.7. `code.json` — код

| Поле | Зачем |
|---|---|
| `package`, `import`, `version` | что и откуда импортировать: `import { X } from 'arui-private/background-plate'` |
| `component`, `exports` | главный компонент и все экспорты пакета |
| `description` | описание компонента из кода |
| `props[]` | пропсы: `name`, `type`, `values` (допустимые значения enum), `required`, `default`, `description`, `from` (если проп унаследован, например от `@alfalab/core-components-select`). Основа проверки кода и Code Connect |
| `propsSource` | откуда взяты пропсы у примитивов (данные core-components-mcp) |
| `status` | `lifecycle` и `since` из `component-lifecycle.json` arui-private |

### 5.8. `code-connect.json` — Figma ↔ React

Собирается, когда у сущности есть и `figma.json`, и `code.json`.

| Поле | Зачем |
|---|---|
| `react` | React-компонент и путь импорта |
| `status` | `complete` — всё переведено или явно объяснено; `partial` — есть пробелы; `none` — ничего не сопоставлено; `no-properties` — у Figma-компонентов нет свойств |
| `coverage` | сколько свойств: всего / переведено / частично / только в Figma / состояния взаимодействия |
| `components[].figma`, `key` | для какого Figma-компонента таблица |
| `components[].fixedProps` | пропсы, которые задаёт сам выбор компонента: `[D][Promo] FAQ` → `promo` |
| `components[].properties[]` | по свойству: `figma`, `react`, `kind` (enum / boolean / number / props), `values` (значение Figma → значение React; `null` — перевода нет), `status`, `origin` (auto / manual), `note` |
| `reactOnly` | пропсы без пары в Figma: их агент заполняет из контекста |

Статусы свойства: `mapped` — переведено; `partial` — часть значений не переведена; `figma-only` — в коде нет такого пропа (ручная запись объясняет, как это выражается); `interaction-state` — hover, pressed, focus: в коде это поведение, а не проп.

Как строится сопоставление:
1. Ручной маппинг из `code-connect.overrides.json`.
2. Совпадение имени: `Size` → `size`, `DisabledState` → `disabled`.
3. Синонимы: `Type`/`View` → `view`, `Skeleton` → `showSkeleton`, `Position` → `level`.

Значения переводятся по точному совпадению, числу, булеву значению или вхождению: `Level 1 (outer)` → `outer`.

### 5.9. Ручные файлы

**`overrides.json`** — любые поля, которые перекрывают собранный `meta.json`. Чаще всего `replacement` и `migrationNotes` для устаревших компонентов.

**`code-connect.overrides.json`** — три вида ручного маппинга:

```jsonc
{
  "properties": [
    // свойство → проп с переводом значений
    { "figma": "OuterLabel", "react": "labelView", "values": { "True": "outer", "False": "inner" } },
    // значение → набор пропсов (react не указан)
    { "figma": "State", "values": { "Default": {}, "Disable": { "disabled": true }, "Error": { "error": "Текст" } } }
  ],
  // выбор Figma-компонента задаёт пропсы
  "components": [{ "figma": "TableView :: Vertical", "props": { "direction": "vertical" } }],
  // свойство есть только в Figma — объясняем, как это выражается в коде
  "figmaOnly": [{ "property": "Overflow", "workaround": "Кнопка «Ещё» появляется сама, когда elements > maxVisibleButtons" }]
}
```

Любую запись можно ограничить одним Figma-компонентом через `figmaComponent`.

**`code-connect.overrides.draft.json`** — тот же формат плюс `confidence` (high / medium / low) и `reason` у каждой записи. Это предложение, сборка его не читает до принятия (см. [раздел 11](#11-сборка-проверка-черновики)).

---

## 6. Паттерны

Папка `entities/patterns/<id>/`:

| Файл | Тип | Зачем |
|---|---|---|
| `guidance.md` | GEN | полный текст паттерна без изменений: агент отдаёт его целиком на `get_pattern` |
| `info.json` | GEN | метаданные из шапки паттерна |
| `rules.json` | GEN | правила паттерна, извлечённые из текста («Rule N: …»): с примерами «правильно / неправильно / почему» |
| `rules.supplement.json` | GEN | правила менее приоритетного источника (ds-ai-hub), которых нет в основной версии паттерна. В `guidance.md` их текста нет, MCP помечает их «дополнение из ds-ai-hub» |
| `meta.json` | BUILD | карточка паттерна со связями |

`info.json`: `id`, `title`, `kind` (component / layout / flow …), `key`, `status`, `platforms`, `product`, `owner`, `updatedAt`, `tags`, `aliases` (как паттерн называют люди: «фоновая подложка»), `categories`, `figmaNames` (какие Figma-компоненты описывает: по ним паттерн связывается с сущностями), `relatedPatternKeys`, `figmaLink`.

`meta.json`: `entities` (связанные сущности), `relatedPatterns`, `rules` (число правил вместе с дополнительными), `orphan` (паттерн ни с чем не связан, нужна проверка), `sources` (кто дал текст и кто дополнительные правила), плюс поля поиска из `info.json`.

Зачем паттерну отдельные правила, если есть текст: правило с ID можно проверить, сослаться на него из правила компонента и показать отдельно (`get_pattern(mode="rules")`), не пересказывая весь документ.

---

## 7. Токены

| Файл | Тип | Что внутри | Зачем |
|---|---|---|---|
| `tokens/tokens-flat.json` | GEN (core-components) | CSS-переменные набора, который подключает arui-private (`vars/bundle/corp.css` + палитры из `sources.json`) | проверка и генерация кода: только существующие переменные |
| `tokens/figma-variables.json` | GEN (design-system-ab) | Figma Variables: коллекции, режимы (Light/Dark), значения, алиасы | распознать токен в макете, сгенерировать макет на переменных |
| `indexes/token-map.json` | BUILD | Figma Variable → CSS-переменная (light/dark) | перевод «Interface Dynamic/base-bg-alt/primary» в `--color-light-base-bg-alt-primary` |

Поля токена кода:

| Поле | Зачем |
|---|---|
| `id` | путь из имени: `color/light/base/bg/alt/primary` |
| `cssVar` | точное имя переменной: `--gap-16` |
| `value` | итоговое значение (ссылки `var()` разрешены) |
| `ref` | на какую переменную ссылается алиас: `--gap-16` → `--gap-m` |
| `zone` | color / spacing / borderRadius / shadow / typography / size / misc |
| `theme` | light / dark / static (у цветов) |
| `deprecated` | помечен устаревшим в источнике: не использовать в новом коде |

Поля Figma-переменной: `name`, `key` (по нему переменная находится в выгрузке макета), `type`, `scopes`, `values` по режимам, `aliases` (на какую переменную ссылается в каждом режиме).

---

## 8. Индексы

`entities/indexes/` (BUILD) — уже посчитанные выборки, чтобы MCP не обходил сотни папок на каждый запрос.

| Файл | Структура | Кто использует |
|---|---|---|
| `entities.json` | краткая карточка каждой сущности: id, name, level, library, lifecycle, platforms, patterns, figmaNames, summary | поиск (`search_component`), поиск сущности по имени |
| `figma-keys.json` | ключ Figma-компонента или варианта → `{entity, component, variant}` | `resolve_figma`, `figma_to_code`: распознавание выгрузки макета |
| `figma-names.json` | однозначное имя Figma-компонента → сущность | распознавание по имени, когда ключа нет |
| `code-connect.json` | статус и покрытие Code Connect по каждой сущности | аудит пробелов, приоритизация ручной работы |
| `token-map.json` | Figma Variable → CSS-переменная | `get_tokens`, перевод макета в код |

---

## 9. Служебные файлы entities/

### `taxonomy.json` (AUTH) — кто есть кто

Единственное место, где хаб сам решает, что такое сущность.

| Поле | Зачем |
|---|---|
| `libraries`, `levels`, `categories` | словари: какие бывают библиотеки, уровни, категории и что они значат |
| `entities[].id` | постоянный ID сущности |
| `entities[].level` | уровень: решение хаба, в источниках его нет |
| `entities[].library` | библиотека |
| `entities[].category` | категория примитива (action, input, layout, …) |
| `entities[].name` | имя, если имя из источника неудобное (эмодзи, `[D]`, кириллица в латинском слове) |
| `entities[].restricted` | «не подключать в новые продукты» |
| `entities[].sources` | ключ сущности в каждом источнике: `design-system-ab` → `web-corp.title-view`, `core-components` → npm-пакет, `arui-private` → папка в `src/` |

Зачем нужна:
1. **Связывает одну сущность в разных источниках.** Без этой таблицы адаптеры не знают, что `web-core.button`, `@alfalab/core-components-button` и `button` — это одно и то же.
2. **Держит ID стабильными.** Источник переименовал ключ — меняется одна строка, а не все ссылки.
3. **Хранит решения хаба,** которых нет ни в одном источнике.
4. **Работает как фильтр:** новый пакет источника не попадёт в хаб, пока его не опишут здесь (адаптер сообщит о нём).

### `sources.json` (AUTH) — источники

`priority` — порядок источников: кто главнее. `sources.<имя>` — адаптер, что он даёт и его настройки. Например, у core-components это набор токенов: бандл `corp` и дополнительные палитры.

### `sources.lock.json` (GEN) — кто чем владеет

По каждому источнику: адаптер и версия, путь и **коммит источника**, время импорта, статистика, число предупреждений и **список файлов, которыми владеет адаптер**.

Зачем:
- адаптер удаляет только свои устаревшие файлы;
- младший источник не пишет в файлы старшего;
- всегда видно, из какой версии источника получены данные.

---

## 10. Источники и адаптеры

| Приоритет | Источник | Адаптер | Что даёт | Как получает |
|---|---|---|---|---|
| 1 | **design-system_ab** | `adapters/design-system-ab` | Figma-компоненты и варианты, правила с текстом, назначение, политику для новых макетов, состав, кейсы, паттерны, Figma Variables | опубликованный индекс пакетов Apollo, `patterns/p_*.md`, `JSONS/tokens` |
| 2 | **ds-ai-hub** | `adapters/ds-ai-hub` | паттерны, которых нет в design-system_ab, и недостающие правила паттернов | `products/ab/patterns/*.md` |
| 3 | **core-components** | `adapters/core-components` | CSS-токены; npm-пакеты, импорт и пропсы примитивов | `packages/vars/src`, `packages/*/package.json`, данные `packages/mcp` |
| 4 | **arui-private** | `adapters/arui-private` | импорт, экспорты и пропсы corp/promo-компонентов, статус в коде | `src/*/index.ts(x)` через `react-docgen-typescript` из node_modules arui-private, `component-lifecycle.json` |

Что из источников **не переносится** и почему:
- служебные структуры Figma-линтера Apollo (effective baseline, reset model, audit mapping). Детерминированную проверку слоёв Figma делает сам Apollo, агенту эти данные не нужны;
- неопубликованные папки design-system_ab (адаптер о них предупреждает);
- демо и changelog core-components: они есть в официальном MCP core-components.

### Контракт адаптера

1. Импортирует только сущности, описанные в `taxonomy.json`. О неизвестных пакетах сообщает.
2. Пишет только фасеты. `meta.json` и индексы строит сборка.
3. Переводит все ссылки в ID хаба. Исходные ID сохраняет только как `sourceId` / `sources`.
4. Не пишет время в фасеты, чтобы повторный импорт давал пустой дифф.
5. Регистрирует свои файлы в `sources.lock.json`, удаляет только свои устаревшие и не трогает файлы старших источников.
6. Работает без LLM и без зависимостей хаба.

### Как заменить источник

Новый адаптер пишет те же фасеты из другого места. Шаги:
1. Добавить ключ нового источника в `sources` нужных сущностей `taxonomy.json`.
2. Добавить источник в `sources.json`.
3. Запустить `tools/sync.mjs`.

MCP, скилы и формат при этом не меняются.

---

## 11. Сборка, проверка, черновики

```bash
node tools/sync.mjs                        # всё: адаптеры по приоритету → сборка → проверка
node tools/sync.mjs --only arui-private    # один источник (+ сборка и проверка)
node adapters/<источник>/index.mjs --dry-run   # отчёт адаптера без записи

node tools/build-entities.mjs              # только сборка (после ручных правок)
node tools/validate-entities.mjs           # только проверка
```

Пути к клонам источников по умолчанию — соседние папки (`../design-system_ab`, `../ds-ai-hub`, `../core-components`, `../arui-private`). Переопределяются через `DS_AB_ROOT`, `DS_AI_HUB_ROOT`, `CORE_COMPONENTS_ROOT`, `ARUI_PRIVATE_ROOT` или флаг `--source`. Адаптеру arui-private нужен выполненный `yarn install` в arui-private.

**Валидатор** проверяет:
- **ошибки:** дубли ID, папки вне таксономии, ссылки на несуществующие сущности и паттерны, файлы из lock, которых нет на диске;
- **предупреждения:** битые ссылки правил на паттерны, сущности без данных, ручные маппинги и черновики, которые ссылаются на несуществующие Figma-свойства, компоненты или пропсы.

**Черновики Code Connect:**

```bash
node tools/code-connect-drafts.mjs                          # обзор и прогноз покрытия после принятия
node tools/code-connect-drafts.mjs --report                 # docs/code-connect-drafts.md для ревью
node tools/code-connect-drafts.mjs --accept corp.filter-bar # принять черновик одной сущности
node tools/code-connect-drafts.mjs --accept all --min high  # принять всё с уверенностью high
node tools/build-entities.mjs
```

Принятые записи переходят в `code-connect.overrides.json` без служебных полей. Непринятые остаются в черновике.

---

## 12. MCP-сервер

### Установка

```bash
cd mcp-server
npm install
npm run build
```

Подключить к Claude Code для своего проекта (в git не попадает):

```bash
claude mcp add --scope local arui-ds -- node <path-to>/arui-private-ai-hub/mcp-server/dist/index.js
claude mcp list        # arui-ds: … ✔ Connected
```

Или для всей команды — в `.mcp.json` проекта:

```json
{
  "mcpServers": {
    "arui-ds": {
      "command": "node",
      "args": ["<path-to>/arui-private-ai-hub/mcp-server/dist/index.js"]
    }
  }
}
```

`DS_ENTITIES_ROOT` позволяет указать другой путь к `entities/` (например, для тестов).

### Инструменты

| Инструмент | Что делает | На каких данных |
|---|---|---|
| `search_component` | поиск по имени, имени Figma-компонента, паттерну, описанию | `indexes/entities.json` |
| `get_component_api` | карточка сущности: назначение, политика для новых макетов, Figma-компоненты, состав, код и пропсы, Code Connect, правила (фильтр `surface`), паттерны | все фасеты сущности |
| `resolve_figma` | ключи и имена из Figma-выгрузки → сущности, варианты, lifecycle | `indexes/figma-keys.json`, `figma-names.json` |
| `figma_to_code` | Figma-инстансы → JSX с импортами; непереводимое уходит в `TODO` | `code-connect.json`, `code.json` |
| `get_pattern` / `list_patterns` | паттерн целиком или только правила с примерами | `patterns/*` |
| `check_deprecated` | lifecycle сущности или Figma-компонента, legacy для новых макетов | `meta.json`, `figma.json`, `semantics.generation` |
| `get_migration_path` | путь замены deprecated / legacy | `overrides.json`, `semantics.generation` |
| `validate_composition` | проверка JSX: есть ли в каталоге, deprecated, ограниченные библиотеки, применимые правила | индекс, `meta.json`, правила |
| `get_tokens` | CSS-переменные с флагом deprecated и парными Figma-переменными | `tokens-flat.json`, `token-map.json` |

Ресурсы: `ds://components/<id>`, `ds://patterns/<id>`, `ds://tokens`, `ds://deprecated`.

---

## 13. Какие данные работают на какую задачу

| Задача | Инструменты | Данные, без которых не работает |
|---|---|---|
| **1. Консультация** | `search_component`, `get_component_api`, `get_pattern`, `check_deprecated` | `semantics` (когда использовать), `rules` с текстом, паттерны, `generation` (что legacy), `code.json` (импорт, пропсы) |
| **2. Проверка макета** | `resolve_figma`, `get_component_api(surface="design")`, `get_pattern(mode="rules")`, `check_deprecated` | `figma-keys` (распознавание), `figma.properties` (допустимые значения), `anatomy.constraints`, правила `surface=design`, lifecycle, `token-map` |
| **3. Шаблон по дизайну** | `resolve_figma`, `figma_to_code` | `figma-keys`, `code-connect` (перевод свойств), `code.json` (импорт), `token-map` (отступы, цвета); шаблоны экранов — в планах |
| **4. Проверка кода** | `validate_composition`, `get_component_api`, `get_tokens` | `code.json` (пропсы и значения, статус в коде), правила `surface=design`, `tokens-flat` (существующие и deprecated переменные) |
| **5. Генерация макета** | `search_component`, `get_component_api`, `check_deprecated`, `get_pattern` | `generation` (что ставить в новый макет), `figma.variants` (ключи вариантов), `semantics`, паттерны, `figma-variables` |

Правила с `surface=figma` (свойства слоёв Figma) MCP показывает, но проверять их — задача Figma-линтера Apollo. MCP отвечает за дизайн-решения и паттерны.

---

## 14. Скилы

Скил — инструкция для агента: какие инструменты вызвать и в каком порядке для конкретной задачи.

| Скил | Задача |
|---|---|
| `ds-consultation` | 1 — ответы о компонентах и правилах |
| `ds-layout-review` | 2 — проверка макета |
| `ds-template-generator` | 3 — шаблон страницы и JSX по макету |
| `ds-code-review` | 4 — проверка кода |
| `ds-figma-generator` | 5 — спецификация макета для Figma |
| `ds-ab-adapter` | обслуживание: обновление entities/, таксономия, аудит |
| `arui-private-coding` | разработка компонентов arui-private |
| `adr-presentation` | презентация по ADR |

---

## 15. Типовые операции

**Обновить данные после изменений в источниках**
```bash
node tools/sync.mjs
git diff --stat entities/
```

**В источнике появился новый компонент.** Адаптер сообщит: «пакет … отсутствует в taxonomy.json». Добавь запись:
```json
{ "id": "corp.<slug>", "level": "component", "library": "corp",
  "sources": { "design-system-ab": "<ключ>", "arui-private": "<папка в src>" } }
```
Затем `node tools/sync.mjs`. Уровень (`component` или `composite`) — решение хаба. Подсказка — `uses` в `anatomy.json` после первого импорта.

**Указать замену для устаревшего компонента.** Создай `entities/<level>/<id>/overrides.json`:
```json
{ "replacement": "corp.button-stack", "migrationNotes": "…" }
```
Затем `node tools/build-entities.mjs`.

**Закрыть пробел Code Connect.** Найди пробелы в `entities/indexes/code-connect.json` или карточке `get_component_api`. Добавь запись в `code-connect.overrides.json` сущности (формат — раздел 5.9) и запусти сборку и валидатор.

**Принять черновики.** Ревью — `docs/code-connect-drafts.md`, принятие — `tools/code-connect-drafts.mjs --accept …`.

**Не править руками:** любые GEN- и BUILD-файлы. Они перезапишутся. Ручные решения — только в `taxonomy.json`, `sources.json`, `*overrides.json`, `templates/`.

---

## 16. Покрытие и известные пробелы

Состояние на 2026-10-13:

| Что | Сколько |
|---|---|
| Сущности | 185: 110 primitive (76 с Figma-данными, 106 с кодом), 34 component, 34 composite, 7 helper |
| Figma-компоненты / варианты / ключи в индексе | 1525 / 13 462 / 14 605 |
| Правила | 2075: 1413 у компонентов, 662 у паттернов (из них 24 — дополнение из ds-ai-hub) |
| Паттерны | 37: 34 из design-system_ab, 3 из ds-ai-hub |
| Кейсы для тестов | 785 |
| Токены кода | 2867 (687 deprecated) |
| Figma Variables | 1321 (272 связаны с CSS-переменными) |
| Код | 157 сущностей: 106 примитивов, 51 corp/promo (1050 пропсов) |
| Code Connect | 123 сущности. Corp/promo: 12 complete, 12 partial. Примитивы: 6 complete, 32 partial |

**Пробелы:**
- **Шаблоны экранов** ещё не созданы. Без них задачи 3 и 5 работают на уровне отдельных компонентов, без структуры страницы.
- **Code Connect** — 31 черновик ручных маппингов corp/promo ждёт ревью (`docs/code-connect-drafts.md`). Примитивы черновиков не имеют: это зона core-components.
- **17 сущностей без кода** в arui-private: Figma-only части и пресеты (`holding-plate`, `status-property`, `button-stack`, `preset.*` и др.).
- **4 правила** design-system_ab ссылаются на правила паттернов, которых нет ни в одном источнике (видно в валидаторе).

---

## 17. Документы и решения

| Документ | О чём |
|---|---|
| `docs/decisions/ADR-007-unified-ds-schema.md` | единая модель сущностей ДС |
| `docs/decisions/ADR-008-entities-independent-source-of-truth.md` | entities/ — единственный источник для MCP |
| `docs/decisions/ADR-009-source-adapters.md` | адаптеры источников и собственный формат хаба |
| `docs/code-connect-drafts.md` | черновики Code Connect на ревью (генерируется) |
| `docs/ds-llm-integration-research.md` | исследование DS + LLM |
| `docs/analysis-ai-integration-plan.md` | анализ и план AI-интеграции |
