# FilterBar — component package

## Статус

- Статус комплекта: `In progress`
- Статус manual-семантики: `Draft`
- Канонический component key: `web-corp.filter-bar`
- Заменяет: `FiltersBlock` на Desktop и Mobile Web
- Платформы: Mobile Web `320–767 px`, Desktop от `768 px`
- Figma: [Web Corp Components](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=151016-27699&p=f&t=RG0TDLM01YcZmfF5-11)
- Public roots: `[D] FilterBar` (`2a247a2c7b2a13618bf76e2d63f29af784e11aa1`) и `[M] FilterBar` (`3b14f314fb1ee7df802d3f55f61cd125a27f9c13`)

Семантика manual-документов подтверждена владельцем в интервью 2026-07-23. Актуальный raw и generated-слой сформированы Athena 2026-07-27T12:58:40.628Z. В семейство входят 22 компонента, включая `[M] ShowAll`; роли всех членов и запрет standalone-use для non-public компонентов подтверждены владельцем 2026-07-30. Runtime-классификация разделяет 2 Apollo-active, 8 future-runtime и 12 agentic-only rules. После этой правки package `rules.json` расходится с опубликованным registry по 20 manual rules, поэтому требуется штатный targeted Athena sync. По решению владельца публикация package выполняется до Athena sync и Apollo/agent regression run; комплект сохраняет статус `In progress`.

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

- Snapshot: raw и generated-слой от `2026-07-27T12:58:40.628Z`, 22 компонента.
- Raw-каталог, `contract.generated.json`, generated composition, Figma component keys, index и registries доступны.
- Manual rules, composition, overrides, examples, agent context и audit mapping заполнены.
- Rules разделены на 2 Apollo-active generated baseline rules, 8 future-runtime и 12 agentic-only.
- Классификация всех 22 членов семейства подтверждена владельцем: 2 public, 6 supporting, 3 preset, 11 service/private, legacy отсутствуют; standalone-use разрешён только public roots.
- В Figma создана страница [FilterBar — Apollo readiness tests](https://www.figma.com/design/Ix36hQwrhom9xIghTTDbtD/MCP-test?node-id=1987-7) с допустимым кейсом, точным `fills` override и разрешённым `Skeleton=True`.
- Структура трёх fixture-кейсов проверена через Figma MCP; фактический Apollo report и соответствующий `*_agent.json` ещё не получены.
- Текущий raw содержит 120 предупреждений `untokenized-paint`: 81 уникальная комбинация и 39 дублей diagnostics. Все 81 уникальное предупреждение классифицированы: 73 относятся к служебным `PaintMe` descendants, 8 — к вложенному `[M] FilterAll` внутри `[M] ShowAll`; прямых безопасных FilterBar-owned paint fixes не найдено.
- Package validator проходит без ошибок и предупреждений; локальная targeted-конвертация raw в generated contract совпадает byte-for-byte.
- Targeted Athena registry sync/check недоступен в текущем checkout; legacy-генератор несовместим с hybrid `rules.json` и не должен использоваться.
- Для paint readiness нужны принятое Athena-исключение/owner attribution для `PaintMe` и upstream-решение по восьми fills `[M] FilterAll`; массово менять вложенные paints в FilterBar нельзя.
- Interaction, persistence, callbacks и responsive state transfer пока остаются agentic-only.
- Опубликованный `apollo-rules-registry.json` отстаёт от package на 20 manual rules.
- Public code exports, Code Connect mapping и статус `Skeleton` как code prop не подтверждены.
- Apollo runtime output, agent response и reviewer approval ещё не выполнены.
- Athena sync и Apollo/agent regression run отложены по решению владельца и не считаются пройденными.
