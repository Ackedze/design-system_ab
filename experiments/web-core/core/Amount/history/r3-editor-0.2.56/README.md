# Amount — компонентный контракт r3

Статус на 29.09.2026: **Draft / не опубликован / восемь live-сценариев r3 приняты,
граничная матрица проверена частично**.
Core компонент `core.web.amount` из Web _ Core; не AmountInput и не AmountStyles.
Корневой Figma componentKey: `fe3399f71c9e0971646821d935b64657e462c28e`.

## Что загрузить

Перезапустите **ComponentContract Editor 0.2.56** и импортируйте
[`editor/Amount.editor-input.zip`](editor/Amount.editor-input.zip).
Это пакет r3 с manual и pinned Athena evidence; компиляция выполняется общим core.
Не загружайте старый соседний `../compiled/component-contract.v2.json`.

Единственный редактируемый нормативный источник — [contract.manual.json](contract.manual.json).
Editor позволяет менять все добавленные поля: typed constraints, semantic conditions,
источник текстового эталона, нормализацию, якорь и владение содержимым слота.
Сохраняйте manual из Editor и пересобирайте пакет. `compiled/`, `evidence/`,
`reports/`, `projections/`, `runtime/` и ZIP — производные артефакты.
`sources/` — закреплённые read-only документы с SHA-256. Не правьте generated JSON вручную.

## Нормы компонента

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

r3: **28 source rules → 44 RuleIR**, три явных разрешения policy-only, без исключённых
исполняемых правил. Восемь order-записей — одна норма для visibility-комбинаций.
Все статусы пока Draft. Проверка токенов реализована в общем core, но не включается
автоматически во всех остальных компонентах.

## Проверки и границы готовности

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

Оставшийся P0 — [непокрытые границы live-прогона r3](TESTCASES.md#остаток-live-приёмки-r3).
Присланные восемь кейсов повторять не нужно. Только после закрытия остатка можно принять
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
```

Из ComponentContractEditor: `npm run typecheck && npm test`.
Обычная сборка сохраняет pinned sources и проверяет hashes; manual не переписывается.
`--refresh-sources` — только отдельное осознанное обновление после сверки библиотеки.

История и прежние инструкции:
[r2 / Editor 0.2.55](../history/r2-editor-0.2.55/README.md),
[r1](../history/r1-editor-0.2.53/), [BACKLOG](BACKLOG.md).
Архивы исходных live JSON сохранены как `reports/fixtures/r2-editor-0.2.54/*.json.gz`
и `reports/fixtures/r3-editor-0.2.56/*.json.gz`. Все восемь новых JSON архивированы
и проверены по SHA-256; пользовательские выгрузки из editor теперь можно удалять.

## Синхронизация знаний

Правила1841 и1861–1865, Леджер67–69 и Core Predicate обновлены и проверены чтением.
Predicate остаётся Draft. Расхождения Hub по token-only, открытому Addon и свободному
Custom зафиксированы как «Найдено»; Hub не изменён молча. Проекции из r3 локальные,
не опубликованные. `contract.manual.json` остаётся единственным ручным источником.
