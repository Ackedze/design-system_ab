# Amount — компонентный контракт r5

Статус на 29.09.2026: **Ready для компонентного Figma scope / не опубликован**.
Принят владельцем: «отлично, закрываем контракт». Это третий принятый компонентный
контракт после Button и Spinner; связь с фронтом сюда не входит.

## Рабочий пакет

В **ComponentContract Editor 0.2.57** импортировать
[Amount.editor-input.zip](editor/Amount.editor-input.zip) — финальная ревизия r5.
Обновлять сам Editor не требуется. Старый ZIP r4 остаётся историческим Draft.
Не загружать соседний `../compiled/component-contract.v2.json`: это legacy эксперимент.

Единственный ручной нормативный источник — [contract.manual.json](contract.manual.json).
Правки делаются в Editor; compiled JSON не редактируется. Общий compiler создаёт
[component-contract.v2.json](compiled/component-contract.v2.json), проекции и ZIP.
`sources/` — закреплённые read-only Athena/Hub facts; `reports/` — доказательства
проверки, не параллельный источник правил. Ready не означает публикацию в Apollo.

## Что описывает контракт

Core `core.web.amount`, библиотека Web _ Core, componentKey
`fe3399f71c9e0971646821d935b64657e462c28e`. Не AmountInput и не AmountStyles.

- Библиотечное происхождение Amount/Major/Minor/Currency; Major обязателен.
  Root API: BOOLEAN Minor, Currency, Addon. Фиктивных root Type/Size/Operation/Negative нет.
- Видимость и порядок частей, независимый baseline оформления и Auto Layout корня.
- Цвета Major/Minor/Currency только через токены: активные fill/stroke/gradient stops.
  Совпадение RGB не заменяет привязку. Разные части могут использовать разные токены.
- Major/Minor/Currency должны использовать библиотечный Text Style из закреплённого
  Web _ Typography (56 стилей). Разные библиотечные стили допустимы. Detach и стиль
  вне каталога запрещены; одинаковое имя/шрифт не доказывают принадлежность.
- Currency.Type=Custom допускает любой текст, включая пустой, без regex/domain/длины.
  Standard Type сравнивается с текстом выбранного Athena-варианта, не host override.
  Нормализация trim убирает только краевые Unicode-пробелы.
- Addon — открытый native swap: любой заменяющий компонент без allowlist/размерных
  ограничений. Видимый исходный placeholder запрещён по ключу, даже после перекраски
  или переименования. Скрытый допустим. BOOLEAN reference — якорь, не выдуманный swap API.
- Содержимое заменённого Addon принадлежит его контракту: Amount проверяет свою
  границу/видимость/порядок, не наследует внутренностям baseline placeholder.
- Opacity-варианты разрешены. Продуктовые и канальные ограничения вынесены с прежними
  RuleID в [pattern handoff](../../../../patterns/amount/README.md), здесь не исполняются.
  Единообразие типографики/цвета AmountStyles не добавлено в Core Amount.

**31 reviewed source rules → 47 RuleIR**, 3 явных разрешения policy-only,
0 исключённых/неисполняемых правил, 0 ошибок compiler. Восемь order-записей описывают
одну норму для восьми visibility-комбинаций. r5 меняет только review-статусы и revision;
семантика правил, ключи и pinned generated facts не изменены.

## Доказательства приёмки

[Итоговый QA-манифест](reports/acceptance.json) содержит hashes, свидетельства по
каждому RuleID, шесть новых live-отчётов r4 и границы покрытия.

- Шесть live JSON r4: engine/editor/UI-details воспроизводятся точно; все проверки
  полные, 9/9 узлов, без capture warnings. Major detach, альтернативный библиотечный
  Text Style и небиблиотечный local style различаются корректно; color bindings
  проверяются независимо. Minor/Currency token detach также обнаружены.
- Восемь прежних live r3 подтверждают Custom, стандартную валюту, native Addon swap,
  placeholder, разные токены/типографику, root gap и hidden Major.
- **32 архивных снимка / 1 666 evaluations**: r4→r5 без изменения поведения.
  Это офлайн replay, а не 32 новых ручных прогона. Повреждённые A17 остаются явно
  неполными, а не зелёными. Ready контракта не превращает неизвестность в успех.
- Финальный прогон: **538/538 тестов Editor** вместе с typecheck/build и
  **285/285 тестов Amount, Button и доступных acceptance-наборов Spinner**.
  Исторические Spinner-наборы, зависящие от удалённых пользовательских exports,
  в этот прогон не включены и не объявляются пройденными.
- Дополнительные границы покрыты автотестами: Custom empty/RUB, правильный USD,
  detaches каждой части, renamed/recolored placeholder, произвольный renamed swap,
  foreign/missing identity, отсутствие/неоднозначность фактов и ZIP roundtrip.
  Там, где нет нового live-отчёта, это явно указано в манифесте.
- Частичный детач не подтверждён как ручная операция внутри Amount и **не является
  блокером приёмки**. Синтетическая защита от смешанных/неполных диапазонов остаётся
  внутренним тестом общего валидатора; это не требование создавать невозможный UI-кейс.

Все шесть новых JSON сохранены побайтово в
`reports/fixtures/r4-editor-0.2.57/*.json.gz` с SHA-256. Эти шесть выгрузок из `editor/`
можно удалять: повторные тесты используют архив. r4 сохранён в `../history/r4-editor-0.2.57/`.
Исторические r2/r3 факты не переписаны. Подробная матрица — [TESTCASES](TESTCASES.md).

## Границы Ready и следующий этап

Вне этой приёмки: frontend mapping/value/minority/formatting parity, продуктовые
паттерны, AmountStyles, валидация внутренностей произвольного Addon, обновление
production Hub и переключение runtime routing. Это отдельные работы, не скрытые
неисполняемые правила этого контракта.

A17 разрушительные подмены внутренних частей дают безопасную неполную проверку;
более точная локализация остаётся P1. Предупреждение о внешних узлах Addon — P2 UX.
Hub drift сохраняется в Леджере как «Найдено», не объявлен устранённым. В реестре
Predicate Ready относится только к `authoring/`, не к старому production пакету.

## Сборка и проверка

Из корня design-system_ab:

```sh
node scripts/review_amount_finalization.js
node scripts/build_component_contract_reference.js experiments/web-core/core/Amount/authoring
node --test scripts/tests/amount-*.test.js
node scripts/review_amount_r3_live_reports.js
node scripts/review_amount_r4_styles.js
```

Из ComponentContractEditor: `npm run validate`.
Обычная сборка не обновляет pinned sources и не переписывает manual. Приёмка
проверяется по точным manual/compiled/generated hashes; изменённый пакет не наследует
старую приёмку. `--refresh-sources` допустим только после отдельной сверки библиотеки.

[Бэклог](BACKLOG.md) · [История r4](../history/r4-editor-0.2.57/README.md) ·
[Реестр синхронизации r5](reports/registry-sync-r5.2026-09-29.json).
