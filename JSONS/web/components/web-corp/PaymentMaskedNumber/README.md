# PaymentMaskedNumber — component package

## Статус

`In progress`. Generated-слой обновлён Athena 2026-08-31. Полная семантика и документация компонента подтверждены владельцем 2026-09-01. PASS/FAIL fixture подготовлена; до `Ready` остаётся прогнать её в Apollo и зафиксировать фактические результаты.

## Назначение

PaymentMaskedNumber отображает номер банковского счёта или карты на desktop и mobile-web.

Единственный публичный root — `PaymentMaskedNumber`. `Major`, `Minor`, `RightAddon` и `SwapMe` являются внутренними частями и не используются самостоятельно.

## Human source

Канонический человекочитаемый источник правил:

`core-ds/ds-ai-hub/products/ab/patterns/payment-masked-number.md`

Текущий `rules.json` является Apollo-проекцией подтверждённой части human source. Связи human RuleID ↔ Apollo RuleID фиксируются в `apollo/rule-crosswalk.json`.

## Источники данных

- Raw Figma catalog: `../Web _ Corp Components -- PaymentMaskedNumber.json`.
- Athena export: `2026-08-31T19:46:53.652Z`.
- Live Figma: `https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=23241-258413`.

## Файлы

- `contract.generated.json` — generated Figma baseline;
- `contract.overrides.json` — подтверждённая manual-семантика;
- `composition-contract.json` — internal ownership и effective baseline;
- `rules.json` — Apollo rules, скомпилированные из human rules;
- `audit-mapping.json` — классификация audit diff;
- `examples.json` — regression cases;
- `agent-context.json` — компактный контекст и anti-hallucination правила.

## Подтверждённые правила

- Только PaymentMaskedNumber является public root.
- Номер счёта и карты использует фиксированную группировку с математическим пробелом U+205F.
- Обычный пробел в номере является error.
- Mask Number=True использует `·· ` и сохраняет последние четыре цифры.
- Major и Minor могут использовать любой общий color token; разные токены и raw-цвет являются error.
- Addon скрыт по умолчанию; при показе SwapMe заменяется подходящим контексту компонентом.
- Gap до Addon равен 4 px, высота Addon не превышает line-height номера.
- Major и Minor сохраняют effective-baseline text styles как пару; raw typography запрещена.
- В узком контейнере используется одна строка и ellipsis с сохранением последних четырёх цифр.
- Собственных loading, disabled и error состояний нет; кликабельность определяется контекстом.

## Runtime coverage

Формат, маска, последние четыре цифры, public boundary, общий цветовой токен и типографика имеют Predicate-проекцию. Addon swap/geometry, узкий overflow и interaction остаются context-only до появления необходимых runtime facts.

## PASS/FAIL fixture

Figma: [Мастерская — AI, PaymentMaskedNumber](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/%E2%9D%87%EF%B8%8F-%D0%9C%D0%B0%D1%81%D1%82%D0%B5%D1%80%D1%81%D0%BA%D0%B0%D1%8F----AI?node-id=12609-59546).

| Node | Кейс | Ожидание Apollo |
| --- | --- | --- |
| `12609:59550` | Account baseline | Нет нарушений |
| `12705:52022` | Общий альтернативный color token | Нет нарушений |
| `12609:59555` | Raw fill у Major | `parts-share-color-token` |
| `12609:59560` | Raw fill у Minor | `parts-share-color-token` |
| `12710:62045` | Card format | Нет нарушений |
| `12710:62050` | Mask Number=True | Нет нарушений |
| `12710:62055` | Обычные пробелы U+0020 | `unmasked-major-format` |
| `12710:62060` | Minor содержит пять цифр | `minor-last-four-digits` |
| `12711:62065` | Нештатные символы маски | `mask-format` |
| `12711:62070` | Raw typography у Major | `typography-follows-effective-pair`, `text-style-binding-required` |
| `12711:62075` | Raw typography у Minor | `typography-follows-effective-pair`, `text-style-binding-required` |
| `12711:62080` | Отдельно вставлен внутренний Major | `public-root-only` |

Context-only правила Addon, geometry, overflow и interaction не входят в автоматическое ожидание этой fixture и проверяются отдельно вручную.
