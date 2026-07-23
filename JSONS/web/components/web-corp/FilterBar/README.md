# FilterBar — component package

## Статус

- Статус комплекта: `In progress`
- Статус manual-семантики: `Draft`
- Канонический component key: `web-corp.filter-bar`
- Заменяет: `FiltersBlock` на Desktop и Mobile Web
- Платформы: Mobile Web `320–767 px`, Desktop от `768 px`
- Figma: [Web Corp Components](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=151016-27699&p=f&t=RG0TDLM01YcZmfF5-11)
- Public roots: `[D] FilterBar` (`2a247a2c7b2a13618bf76e2d63f29af784e11aa1`) и `[M] FilterBar` (`3b14f314fb1ee7df802d3f55f61cd125a27f9c13`)

Семантика manual-документов подтверждена владельцем в интервью 2026-07-23. Raw-каталог, generated contract и composition wraps присутствуют. Комплект остаётся `In progress`, пока manual-изменения не синхронизированы с registry через Athena и не проверены в Apollo.

## Назначение

`FilterBar` — панель управления выдачей перед таблицей, списком или другой группой данных. Компонент объединяет поиск, поддерживаемые фильтры, настройку их видимости и порядка, мобильный доступ к расширенному представлению и сброс значений.

## Граница ответственности

Компонент отвечает за:

- компоновку Search, фильтров и платформенных контролов;
- порядок, доступность и применение действий;
- синхронизацию быстрых и расширенных мобильных фильтров;
- передачу изменений продукту через callbacks;
- сброс значений фильтров и поискового запроса.

Продукт отвечает за:

- данные, загрузку всей области, общую ошибку и пустую выдачу;
- локальную загрузку асинхронных значений отдельного фильтра;
- хранение истории поиска и пользовательской конфигурации;
- объединение новой базовой конфигурации с сохранённой;
- поведение взаимосвязанных фильтров;
- подключение метрик через `alfametrics`.

## Файлы

- `contract.generated.json` — Athena-generated структура, variants, defaults и token/style references; вручную не редактируется.
- `contract.overrides.json` — подтверждённые aliases, API-семантика, responsive, reset и ownership.
- `composition-contract.json` — generated wraps и manual-правила композиции.
- `rules.json` — generated baseline и подтверждённые component rules.
- `audit-mapping.json` — generated Apollo classification и manual display/reset semantics.
- `examples.json` — positive, negative и context-dependent regression cases.
- `agent-context.json` — назначение, evidence policy и защита агента от неподтверждённых выводов.

Raw-каталог находится рядом с package:

`../Web _ Corp Components -- FilterBar.json`

## Ключевые правила

- Search опционален для продукта; подключённый Search закреплён первым.
- `FiltersConfig` принимает только `Tag`, `FilterTag`, `Date`, `FilterCompanySelect`, `AccountSelect` и `FilterRange`.
- Desktop использует `Ещё` и `Настройки фильтров`; Mobile — `Все фильтры`.
- Активный фильтр нельзя скрыть; закреплённый нельзя скрыть или переместить.
- `Сбросить` находится в конце, всегда доступен и очищает только значения и Search.
- `Muted` используется на сером фоне, `Field` — на белом.
- Одиночный мобильный выбор применяется сразу; множественный и произвольный период — кнопкой `Применить`.
- `Другой период` находится первым на Desktop и последним на Mobile.
- При пустом фокусе Search можно показать `Недавно искали`; во время ввода автокомплита нет.
- Если история показана, её можно очистить. До трёх запросов — рекомендация, а не лимит.
- Наличие `Skeleton` в Figma не передаёт компоненту ownership продуктовой загрузки.

## Текущая готовность

- Raw-каталог, `contract.generated.json`, generated composition и Figma component keys доступны.
- Manual rules, composition, overrides, examples, agent context и audit mapping заполнены.
- JSON и package validator должны проходить до публикации изменений.
- После изменения package требуется targeted Athena registry sync.
- Interaction, persistence, callbacks и responsive state transfer пока остаются agentic-only.
- Public code exports, Code Connect mapping и статус `Skeleton` как code prop не подтверждены.
- Apollo runtime cases и reviewer approval ещё не выполнены.
