# CorporateContent — разбор владения старых правил

Это **ненормативная карта миграции**, а не новый набор правил. Источник —
`JSONS/web/components/web-corp/CorporateContent/rules.json`, `manual.rules`.
В таблице сохранены суффиксы существующих RuleID; полный ID начинается с
`component:web-corp.corporate-content.`. Никакое правило ниже не считается
перенесённым, пока его новый владелец, наблюдаемость и тесты не утверждены.
`contract.manual.json` остаётся единственным ручным нормативным источником
для принятых component-scoped правил.

| # | Суффикс исходного RuleID | Владелец | Решение |
|---:|---|---|---|
| 1 | component-properties-are-first-class | Инфраструктура проверки | Классификация результата, не правило компонента |
| 2 | layer-properties-use-effective-baseline | Compiler / Predicate Engine | Общий алгоритм сравнения, не правило компонента |
| 3 | lifecycle-context-is-informational | Каталог / документация | Метаданные, не нарушение |
| 4 | transition-version-prohibited | Каталог / lifecycle | Фильтр активных представлений, не локальное правило экземпляра |
| 5 | required-on-product-page | CorporatePage pattern | Проверяет состав страницы, не экземпляр CorporateContent |
| 6 | body-allows-arbitrary-composition | CorporateContent | Декларация открытого Body slot; содержимое проверяется своими владельцами |
| 7 | background-mode-only | CorporateContent | Нужны доказанные mode и binding; отсутствие факта = unknown |
| 8 | grid-style-protected | CorporateContent | Отдельное правило для `layout.gridStyleId`, не расширять `auto-layout@1` |
| 9 | spacing-uses-grid-cols-mode | CorporateContent | Разделить: root padding/binding и mobile Top/Bottom margin; сверить с библиотекой |
| 10 | page-background-modes-only | CorporateContent | Domain разрешённых BackgroundPlate Color modes; сначала подтвердить источник mode |
| 11 | root-fill-hug-sizing | CorporateContent | Локальная геометрия root; проверить покрытие уже существующим правилом |
| 12 | root-visual-overrides-prohibited | CorporateContent | Визуальный baseline уже частично покрыт; clipping выделить отдельно |
| 13 | body-layout-delegated | CorporateContent | Описать границу Body slot; не проверять внутреннюю композицию как root |
| 14 | platform-breakpoint-selection | CorporatePage pattern | Условие применения по ширине страницы |
| 15 | default-page-background | CorporatePage pattern | Выбор поверхности зависит от контекста страницы |
| 16 | root-clickability-prohibited | CorporateContent | Только если Figma-экземпляр даёт проверяемый факт интерактивности |
| 17 | detach-prohibited | CorporateContent | Защита идентичности root/Body; проверить, что Figma позволяет наблюдать нарушение |
| 18 | gutter-horizontal-composition | Horizontal-composition pattern | Правило вложенной композиции |
| 19 | nesting-prohibited | CorporatePage pattern | Отношение нескольких экземпляров на странице |
| 20 | swapme-must-be-replaced | CorporateContent | Проверять только доказанную placeholder-семантику Body; не угадывать по имени |
| 21 | header-adjacency | CorporatePage pattern | Отношение Header и CorporateContent |
| 22 | root-layout-protected | CorporateContent | Уже частично покрыт root `auto-layout@1`; без дубля |
| 23 | clips-content-disabled | CorporateContent | Отдельное правило для `layout.clipsContent=false` |
| 24 | section-horizontal-column-group | Каталог / документация | Описание необязательной композиционной возможности |
| 25 | section-position-tablet-order | Section | Собственное правило вложенного компонента |
| 26 | section-tablet-isle-auto | Section | Собственное правило; доказать связь с mode |
| 27 | section-root-layout-protected | Section | Собственная геометрия root |
| 28 | section-slot-content-policy | Section | Собственные Content/Isle slot API и граница swap |
| 29 | section-gutter-required | Section | Собственный binding Gutter |
| 30 | section-column-widths-variable-only | Section | Собственные column bindings |
| 31 | section-placeholders-replaced | Section | Собственные placeholders Content/Isle |
| 32 | section-detach-and-style-overrides-prohibited | Section | Собственные identity/style boundaries |

## Очерёдность

1. Сохранить текущий CorporateContent manual без автоматического импорта этих
   32 старых текстов. Не создавать параллельные RuleID без решения о переносе.
2. На живом экземпляре проверить новые факты `layout.gridStyleId` и
   `layout.clipsContent`; негативные кейсы — снятый grid style и включённый
   clipping. Проверка должна быть полной, иначе результат не принимать.
3. Для BackgroundPlate Color установить, откуда в Figma приходит
   **выбранный** mode, включая режим по умолчанию. Нельзя выводить mode из fill
   и считать это доказательством. До этого правила #7 и #10 остаются pending.
4. Отдельно подтвердить native SLOT `Body` и его внешнее содержимое; не
   объявлять произвольные дочерние объекты нарушением root-контракта.
5. После живых тестов авторить только локальные правила в Editor, синхронизируя
   нормативные изменения с rule ledger. Section оформить самостоятельным
   owner ID/пакетом; page/pattern правила — на следующем этапе.

Текущий `section.component-contract.zip` требует исправления ownership:
`componentId`, `familyId` и `ownership.ownerId` пока указывают на
`web-corp.corporate-content`, несмотря на отдельный `contractId=section.desktop`.
До исправления его нельзя принимать как независимый контракт Section.
