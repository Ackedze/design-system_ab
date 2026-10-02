# Amount — компонентный контракт r4

Статус на 29.09.2026: **Draft / не опубликован / r4 проверен офлайн,
повторная live-проверка Text Style ожидается**. В r3 найдены два пропуска отвязки
Text Style: прежнее `complete=true` не означало покрытия этого ограничения.
Core компонент `core.web.amount` из Web _ Core; не AmountInput и не AmountStyles.
Корневой Figma componentKey: `fe3399f71c9e0971646821d935b64657e462c28e`.

## Что загрузить

Перезапустите **ComponentContract Editor 0.2.57** и импортируйте
[`editor/Amount.editor-input.zip`](editor/Amount.editor-input.zip).
Это пакет r4 с manual и pinned Athena evidence; компиляция выполняется общим core.
Не загружайте старый соседний `../compiled/component-contract.v2.json`.

Единственный редактируемый нормативный источник — [contract.manual.json](contract.manual.json).
Editor позволяет менять все добавленные поля: typed constraints, semantic conditions,
источник текстового эталона, нормализацию, якорь и владение содержимым слота,
а также `styleBinding.styleCatalog` — каталог обязательных библиотечных Text Style.
Сохраняйте manual из Editor и пересобирайте пакет. `compiled/`, `evidence/`,
`reports/`, `projections/`, `runtime/` и ZIP — производные артефакты.
`sources/` — закреплённые read-only документы с SHA-256. Не правьте generated JSON вручную.

## Нормы компонента

- **Text Style обязателен** для каждого видимого текстового диапазона Major,
  Minor и Currency. Допустимые ключи берутся из закреплённого Athena-каталога
  `sources/design-system_ab/JSONS/styles/Web _ Typography.json` (56 стилей).
  Можно выбирать разные библиотечные стили. Detach и кастомный стиль вне каталога
  запрещены; сходство шрифта/размера/имени не доказывает привязку.
  Проверка общая, `styleBinding` компилируется в Predicate Engine `binding-satisfies`.
  Capture-facts `textStyleEvidenceV1` изолированы от baseline; проверяются смешанные
  диапазоны, file-local ID разрешается через BaseStyle.key. Недостаток сведений —
  unknown/неполная проверка, не успех. Внешнее содержимое Addon не затронуто.
- Amount — одиночный компонент; root API — BOOLEAN Minor, Currency, Addon.
  Major обязателен. Нет выдуманных root Type, Size, Operation, Negative.
- Проверяются происхождение Amount/Major/Minor/Currency, видимость, порядок частей
  и независимый baseline оформления/Auto Layout корня.
- **Цвет Major, Minor и Currency — только токены:** каждая активная заливка,
  обводка и цветовая точка градиента. Совпадение RGB с токеном не заменяет binding.
  Разные части могут иметь разные токены и Text Style; требование единообразия
  относится к AmountStyles, не к этому Core контракту.
- **Currency.Type=Custom — любой текст**, включая пустую строку: без regex,
  допустимого алфавита, списка валют или ограничений длины.
- При стандартном Type содержимое соответствует выбранному библиотечному варианту
  из pinned Athena facts. `textNormalization=trim` убирает только краевые Unicode-пробелы;
  не меняет регистр, символы или внутренние пробелы. Сохранённый текстовый override
  исходного Amount не является эталоном выбранной USD/CNY.
- **Addon — открытый слот:** разрешён любой native instance swap без allowlist,
  требования размера или унаследованных стилей placeholder.
  Ошибка — видимый исходный placeholder по ключу
  `b95166da66ad15ecad14244d670ab1b66db66f80`.
  Перекраска/переименование синего квадрата не считается заменой. Скрытый допустим.
- BOOLEAN reference `Addon#100902:0` — якорь соответствия, не выдуманный INSTANCE_SWAP
  property. `contentOwnership=external` оставляет внутренности замены её собственному
  контракту; Amount по-прежнему проверяет корень слота, видимость и порядок.
  Отсутствующий/неоднозначный anchor или неизвестный ключ не превращаются в pass.
- Opacity варианты Minor/Currency сами по себе допустимы. Продуктовые ограничения
  вынесены с прежними RuleID в [отдельный pattern handoff](../../../../patterns/amount/README.md)
  и здесь не исполняются.

r4: **31 source rules → 47 RuleIR**, три явных разрешения policy-only, без исключённых
исполняемых правил. Восемь order-записей — одна норма для visibility-комбинаций.
Все статусы пока Draft. Проверка токенов реализована в общем core, но не включается
автоматически во всех остальных компонентах.

## Проверки и границы готовности

R4: **538 Editor tests + 290 package tests**, typecheck, 18 responsive layouts,
18 dialog layouts и семь реальных UI-roundtrip правил. Пакет проходит проверку
схем; полноценный live-прогон новой версии не подменяется этими результатами.

Новый [QA r4](reports/text-style-binding-r4.2026-09-29.json) повторяет восемь сохранённых
снимков r3: все прежние нарушения сохранены, добавлены два ранее пропущенных detach.
На `13129:64610` — Major Text Style вместе с Currency color binding;
на `13129:64751` — Currency Text Style вместе с неверным USD-текстом.
Это офлайн replay, не новая live-приёмка. Разные библиотечные Text Style, скрытые
части и внешний Addon не получают ложных запретов. Исторический r3 доступен в
`../history/r3-editor-0.2.56/`; его артефакты не переписываются.

Предыдущий регрессионный baseline r3:

510 Editor tests и 290 package regressions (244 Button, 27 доступных Spinner, 19 Amount),
typecheck; 18 адаптивных UI-сценариев и 18 размеров диалога.
Четыре roundtrip через реальный UI: Addon, standard Currency, Custom и token rule;
повреждённый JSON условий не сохраняется и не теряет manual. Новые поля сохранены.
Два прежних Spinner suites с удалёнными источниками не включены в эти числа.
Новые синтетические случаи проверяют raw/token цвета, несколько paints, градиенты,
Custom/standard текст, свободный slot swap, unknown, повреждённые anchors и ZIP roundtrip.

[QA r3](reports/owner-boundaries-r3.2026-09-29.json) повторяет 18 неизменённых raw
отчётов r2: **10 полных положительных, 6 полных отрицательных, 2 неполных**.
A06–A09 теперь правильно отрицательные: в них показан незаменённый Addon.
A15 gap и A16 hidden Major остаются ошибками; A17A/B подмены защищены fail-closed.
Это новый расчёт старых снимков, **не новые live-тесты Figma**.

### Live r3: восемь отчётов 13:04–13:07 UTC

[Разбор и контрольные суммы](reports/live-review-r3.2026-09-29.json):
**8/8 полных проверок**, 392 engine evaluations, `notExecuted=0`, `inconclusive=0`.
Все используют r3 / Editor0.2.56; manual, compiled и snapshot hashes сверены.
Повторный расчёт engine/editor/details совпал во всех восьми случаях.

| Сценарий | Подтверждённый результат |
|---|---|
| Видимый исходный Addon | Ошибка по componentKey placeholder |
| Разные токены и типографика Major/Minor (14/16) | Разрешено; скрытый placeholder не мешает |
| Custom «баллов» | Разрешено |
| Type=USD, фактический текст «UD» | Ошибка; эталон именно USD, не ₽ |
| Native swap Addon на другой библиотечный компонент | Разрешено; проверка Amount полная |
| Gap 0 → 8 | Ошибка baseline |
| Скрытый Major | Обнаружен; два связанных правила, один дефект |
| Отвязанный цвет Currency при прежнем RGB/opacity | Ошибка token binding |

У swap отчёт сохраняет техническое предупреждение о21 несопоставленном узле
внешнего содержимого. Это ожидаемая граница:7 узлов Amount сопоставлены,
новый slot root привязан по `Addon#100902:0`, baseline placeholder не унаследован.
Полнота относится к правилам Amount, **не** к внутренностям заменённого компонента.
Уточнение текста предупреждения записано в backlog как P2, не блокер семантики.

Оставшийся P0 — [проверка Text Style r4 и прежние непокрытые границы](TESTCASES.md).
Два случая с пропущенными стилями нужно повторить на новом пакете. После закрытия остатка можно принять
контракт для объявленного Figma scope. Code mapping, продуктовые паттерны,
проверка произвольного содержимого Addon и production migration не объявлены готовыми.
Button/Spinner, production routing и действующие каталоги не изменены.

## Сборка и воспроизведение

Из корня design-system_ab:

```sh
node scripts/build_component_contract_reference.js experiments/web-core/core/Amount/authoring
node --test scripts/tests/amount-contract.test.js
node scripts/review_amount_r3_boundaries.js
node scripts/review_amount_r3_live_reports.js
node scripts/review_amount_r4_styles.js
```

Из ComponentContractEditor: `npm run typecheck && npm test`.
Обычная сборка сохраняет pinned sources и проверяет hashes; manual не переписывается.
`--refresh-sources` — только отдельное осознанное обновление после сверки библиотеки.
`--add-sources` разрешает добавить новый явный source, не обновляя остальные pins;
manual.source.sourceHash должен заранее соответствовать проверенному набору.

История и прежние инструкции:
[r2 / Editor 0.2.55](../history/r2-editor-0.2.55/README.md),
[r1](../history/r1-editor-0.2.53/), [BACKLOG](BACKLOG.md).
Архивы исходных live JSON сохранены как `reports/fixtures/r2-editor-0.2.54/*.json.gz`
и `reports/fixtures/r3-editor-0.2.56/*.json.gz`. Все восемь новых JSON архивированы
и проверены по SHA-256; пользовательские выгрузки из editor теперь можно удалять.

## Синхронизация знаний

R4: Правила1840 и1866–1868, Леджер70 и Core Predicate обновлены. Новый drift —
отсутствие обязательной привязки Text Style и рекомендация ручного веса в Hub bridge.
Отдельный readback-отчёт: `reports/registry-sync-r4.2026-09-29.json`.

История r3:

Правила1841 и1861–1865, Леджер67–69 и Core Predicate обновлены и проверены чтением.
Predicate остаётся Draft. Расхождения Hub по token-only, открытому Addon и свободному
Custom зафиксированы как «Найдено»; Hub не изменён молча. Проекции из r3 локальные,
не опубликованные. `contract.manual.json` остаётся единственным ручным источником.
