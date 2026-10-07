# CorporateContent desktop — главный manual r12

05.10.2026 главный источник восстановлен побайтно из закреплённого owner ZIP r12. История предыдущего main r11, рабочего ZIP и проекций сохранена в `history/r11-primary-before-owner-r12-2026-10-05`.

Шесть нормативных правил, 17 Predicate checks, targets, control ports и Figma facts совпали с прежней принятой областью. Добавленных норм нет. Body semantic API, паспорт, Figma generation fields и metadata теперь соответствуют owner export. Code fields из NEXT-02 остаются предложениями и не применены.

Текущий редактируемый источник: `contract.manual.json`. Рабочий ZIP: `corporate-content.component-contract.zip` — точная копия текущего owner ZIP. Принятый ZIP в current-contract-packages не изменён; его manual/facts/compiled hashes сохранены. Predicate Ready остаётся только для шести Figma норм; code, layout parity, внешнее Body содержимое и публикация вне этой приёмки.

Проверки и полный diff: `reports/next-02.primary-source-reconciliation.2026-10-05.json`. Оригинальная `reports/acceptance.json` сохранена как историческое доказательство приёмки r11; новых live проверок этим переносом не заявляется.

---

## Историческое описание до восстановления main

# CorporateContent — принятый ручной контракт r11

Владелец принял проверки **01.10.2026**: **[D] CorporateContent**, шесть
созданных в Editor правил, 17 исполняемых RuleIR checks. Это scoped Figma
acceptance, не приёмка Section/mobile, паттернов страницы или фронта.
Пакет экспериментальный, production publication не выполнена.

## Рабочие файлы

- `contract.manual.json` — единственный редактируемый нормативный источник;
  извлечён без изменения содержимого из авторского ZIP r11.
- `corporate-content.component-contract.zip` — сохранённый исходный экспорт
  владельца и вход в **Editor 0.2.71**. Импортировать один ZIP. Архив при
  финализации не изменялся. После правок экспортировать новый ZIP и пересобрать
  проекции: две независимо редактируемые копии manual не допускаются.
- `src/*.json` — восемь read-only Athena файлов из этого ZIP.
- `compiled/component-contract.v2.json` — read-only результат общего compiler core.
- `runtime/component-contract.index.json` — индекс принятой desktop-проекции.
- `reports/acceptance.json` — область приёмки, hashes, доказательства, ограничения.
- `reports/readiness.json`, `coverage.json` — compiler validation и покрытие.
- `reports/rule-crosswalk.json` — ненормативные связи с legacy и ds-ai-hub,
  не второй источник правил и не заявление полной миграции 32 старых правил.
- `reports/fixtures/r10-r11/*.json.gz` — пять отчётов для exact replay.
  Исходные JSON можно удалять из рабочей папки: эти тесты используют архивы.
- `reports/registry-sync-r11.2026-10-01.json` — синхронизация реестра и drift.
- `reports/code-connect.json` — состояние отдельного моста с React.

## Что принято

| Ручное правило | Поведение |
|---|---|
| Body / composition.content | Открытое внешнее содержимое native SLOT; проверяется граница, не payload |
| auto-layout@1 | Девять выбранных root capabilities защищены от прямых overrides |
| clipsContent | Library baseline false |
| gridStyleId | Системную сетку нельзя менять или отвязывать |
| BackgroundPlate Color | Page modes 136853:0 / 136853:1 допустимы, modal modes запрещены |
| visual-style@1 | Fill, stroke, opacity, radius, effects защищены library baseline |

Авторские RuleID сохранены. Новые параллельные ID ради сходства с legacy
не создаются. Owner — `web-corp.corporate-content`.
Выбор grey/white для конкретной страницы и применение компонента — паттерн.

Автор исключил `layout.sizingVertical` из locked selection:
HUG не запрещён; **режим высоты вообще не ограничен этим правилом**.
Это не domain «только FIXED/HUG». Другие девять layout capabilities сохранены.

## Приёмка и воспроизводимость

Отчёты r11 от 30.09 (UTC): 17:22:48 — HUG, padding top 50, одно нарушение
(baseline 40); 17:23:35 — HUG, padding 40, 17/17 пройдено.
В обоих 2/2 host/SLOT nodes matched, topology complete,
0 notExecuted/inconclusive. Воспроизводится **весь результат engine**.
Body-матрица принята по заявлению владельца 01.10, без дополнительных JSON:
owner-attested, не выдуманные live captures.

Исторические r10 отчёты 14:58/14:59 остаются неполными и воспроизводятся
без исправления verdict; negative 16:23 также архивирован.
Причина alias IDs в Figma API при полном capture не объявляется устранённой.
В текущем scope применяется доказанный bounded native SLOT capture.

Из корня design-system_ab:

```sh
node scripts/review_corporate_content_finalization.js
node --test scripts/tests/corporate-content-finalization.test.js
node scripts/review_corporate_content_finalization.js --record
```

Используется общий core Editor, параллельный compiler не создаётся.
Manual hash:
`8c014c78a0163b7d32b9a79e957bebc7cc3f6f85ff0036d4aa60f37f0e666b9f`.

## Границы готовности

Blank `semantics.purpose` остаётся compiler warning. Новые проверки
padding token bindings, placeholder и clickability не добавлялись.
32 legacy правила не импортированы целиком: Section, паттерны и infrastructure
разбираются отдельно по `RULE-OWNERSHIP.md`. Компоненты в Body не получают
автоматическую приёмку своих контрактов.
Ready — согласованная область выше, не универсальный generation/code-validation profile.

## Code Connect

Источник моста: `arui-private/tools/code-connect/CorporateContent.figma.ts`.
Published component `89622:29551` в файле `NrzEFUSTXgzOUmsfYym0xD`,
key `a8d13cb6e1ae67a7296709f669238f41971c7197`.
Native `[D] Body` → React `children`, public named import.
Background/grid/width/platform не превращаются в несуществующие React props.

Официальный CLI parse, typecheck и 5 tests прошли повторно. После отключения
указателя владельцем Figma подтвердила пустую mapping. Connector получил полный
исполняемый parserless template и вернул success, но два readback снова дали
**hasTemplate=false**, без named import и authored Body payload. Source/name
указатель создан заново; полный мост не подтверждён. Доказательства сохранены в
`reports/code-connect-retry.2026-10-01.json`; fallback не считается готовым мостом.
CLI умеет overwrite UI mapping через `--force`, но `FIGMA_ACCESS_TOKEN` в текущем
окружении отсутствует; секреты не запрашивались.
Следующие действия — в `BACKLOG.md` и README моста в arui-private.

React responsive geometry/theme API отличаются от Figma. Code Connect не
доказывает визуальный parity и не заменяет проверки фронта.
Сначала полный template/readback, затем тест сборки по промпту.
