# Code Connect для компонентов лендингов

Обновлено: 04.11.2026. Статус: CC-LND-01, CC-LND-02, CC-LND-03 и CC-LND-04 опубликованы и проверены
через Figma MCP; остальные задачи запланированы. Опубликованный SDK 81.1.0,
полная визуальная эквивалентность и явные source gaps остаются открытыми областями.
Ответственный за Corp/Promo — Code Connect; за Core — команда Core.

Цель — обеспечить перевод библиотечных компонентов лендинга в корректный React
по единому формату Code Connect. Перечень относится к
[навыку лендингов](../apollo/skills/ab-generate-custom-landing/SKILL.md),
[паттерну лендингов](../patterns/p_landing-pages.md),
[каркасу страницы](../patterns/p_draft-layout.md) и
[BentoGrid](../patterns/p_bento-grid.md). Это очередь технических работ,
а не новые нормы компонентов или возобновление прежнего frontend generator.

P0 — основная страница: host, hero, бенефиты, содержательная секция, CTA и FAQ/футер.
P1 — дополнительные форматы и сценарии: таблица, BentoGrid, форма, файлы,
две колонки, модальное окно и отдельная mobile-зона действий.
Приоритет — предложение порядка выполнения внутри этой очереди.
Desktop и Mobile Web проверяются отдельно; наличие desktop-связи не закрывает mobile.

## Corp / Promo: собственные привязки

Пути `src/...` ниже относятся к `arui-private` и служат начальной точкой
проверки реализации. Они не заменяют подтверждённый публичный import.
Задачи открыты, кроме явно отмеченных завершённых этапов. Найденные ранее
`.figma.ts` — материал для проверки, а не автоматически принятые связи нового формата.

| ID | Приоритет | Компонент Figma | Что подготовить | Начальная точка реализации |
| --- | --- | --- | --- | --- |
| CC-LND-01 | P0 | CorporateContent | **D/M Code Connect опубликован и проверен 04.11.2026.** [Файлы и результат](../JSONS/web/components/web-corp/CorporateContent/code-connect/README.md). CLI validation/upload PASS; оба root `hasTemplate=true`, public import и Body → `children` подтверждены фактическим MCP исполнением. Реальные snippets: strict types PASS на локальном distribution 80.7.1. Опубликованный SDK 81.1.0 и browser/полная визуальная эквивалентность ещё не проверены. | `src/corporate-content/`; component-owned `code-connect/` и `mobile-web/code-connect/` |
| CC-LND-02 | P0 | PromoMainBlock | **D/M опубликованы и проверены 04.11.2026.** [Файлы, 20/20 MCP результатов и ограничения](../JSONS/web/components/web-corp-promo/PromoMainBlock/code-connect/README.md). 14 тестов PASS, 576 fixture-состояний; actual snippets проверены по source API 81.1.0. Изображение, callbacks, statuses и Holding требуют typed app context. Secondary-only отклоняется до source fix; полный SDK/browser ещё не проверены. | `src/promo-main-block/`; component-owned `code-connect/` и `mobile-web/code-connect/` |
| CC-LND-03 | P0 | BenefitCard | **D/M опубликованы и проверены 04.11.2026.** [Файлы, 32/32 MCP сниппета и ограничения](../JSONS/web/components/web-corp-promo/BenefitCard/code-connect/README.md). 11 тестов PASS, 144 synthetic nested-state cases, CLI preview 32/32; фактические snippets/imports проверены по source API 81.1.0. Ассеты, href/addons и действие требуют typed app context. Compact Desktop Title расходится с source; SDK/browser ещё не проверены. | `src/benefit-card/`; component-owned `code-connect/` и `mobile-web/code-connect/` |
| CC-LND-04 | P0 | BenefitsBlock | **D/M опубликованы и проверены 04.11.2026.** [Файлы, 20/20 MCP вариантов и ограничения](../JSONS/web/components/web-corp-promo/BenefitsBlock/code-connect/README.md). React exports — BenefitBlockDesktop/Mobile. 11 тестов PASS, 180 synthetic preset/CTA combinations, 20 root + 12 adapted nested native previews; MCP snippets со всеми imports проверены по source API 81.1.0. Изображение, CTA, Colored и числовой HeightCustom требуют app context. TitleAddon=StatusBadge не поддерживается React API; SDK/browser ещё не проверены. | `src/benefit-block/`; component-owned `code-connect/` и `mobile-web/code-connect/` |
| CC-LND-05 | P0 | BackgroundPlate, включая Promo | Разделить семейства и варианты; поверхность, скругления и слот содержимого сопоставлять с фактическим API. | `src/background-plate/` |
| CC-LND-06 | P0 | TitleView | D/M, заголовок/подзаголовок, addons, статусы, действия и loading; определить правильный mobile export. | `src/title-view/`; отдельно проверить `src/title-view-mobile/` |
| CC-LND-07 | P0 | ButtonsGroup / ButtonGroup | Подтвердить identity и название export; порядок и подписи кнопок через настоящий API, addons и overflow. Перепроверить существующий шаблон. | `src/button-group/`; `tools/code-connect/ButtonsGroup.figma.ts` |
| CC-LND-08 | P0 | FAQ, включая Promo | Корень и items; вопрос/ответ, rich content, идентификаторы и раскрытие через настоящий API; вложенный Accordion не заменяет связь FAQ. | `src/faq/` |
| CC-LND-09 | P1 | PromoCard | D/M, графика/текст, размер, CTA и состояния; сохранить связь карточки внутри BentoGrid. | `src/promo-card/` |
| CC-LND-10 | P1 | PromoTableView | D/M, заголовки, строки/ячейки, статусы, цены и действия; данные и callbacks задаются явно. | `src/promo-table-view/` |
| CC-LND-11 | P1 | Section | Content/Isle → реальные `children`/`sidebar`; адаптивный порядок областей; подтвердить Figma identity и платформенную применимость. | `src/section/` |
| CC-LND-12 | P1 | FileUpload | D/M, состояние root и файлов, Attach/Dropzone/FileUploadItem; upload adapter и callbacks — контекст приложения. | `src/file-upload/` |
| CC-LND-13 | P1 | Divider | Подтвердить нужное семейство разделителя лендинга, D/M и публичный API; использовать в композиции футера/модального контента. | `src/divider/` |

- [ ] **CC-LND-02-SOURCE-01 · P0.** Отдельно исправить Secondary-only в
  `arui-private/src/promo-main-block/components/buttons-group/promo-main-block-buttons-group.tsx`:
  Secondary читает `primaryButtonProps.loading`, когда Primary отсутствует.
  Ошибка воспроизведена source-тестом; шаблоны до исправления явно отказывают.
  Эта запись не назначает запись в source или публикацию `arui-private`.

- [ ] **CC-LND-03-SOURCE-01 · P0.** Согласовать Compact Desktop Title в
  `arui-private/src/benefit-card/benefit-card-desktop.tsx` с 8 Figma-вариантами
  Title Secondary. Leaf после `{...props}` задаёт `titleView='primary'`;
  source-тест подтвердил, что `titleView='secondary'` снаружи не действует.
  Code Connect предупреждает о расхождении. Запись не меняет контракт,
  не разрешает правку/публикацию `arui-private` и не подтверждает visual parity.

- [ ] **CC-LND-04-SOURCE-01 · P1.** Согласовать представление TitleAddon=StatusBadge
  из нормы BenefitsBlock с публичным API `arui-private/benefit-block`: сейчас
  доступен только `title: string`, TitleView с addon не используется. Code Connect
  явно отклоняет такую конфигурацию. Запись не разрешает правку/публикацию
  `arui-private` и не меняет норму или Draft/Ready.

## Пресеты и незакрытое соответствие Footer

Для Figma-only пресетов нужен проверяемый рецепт композиции. Отдельный
`.figma.ts` допустим, если он выдаёт код из существующих компонентов и layout;
одноимённый runtime export из названия пресета не выводится.

| ID | Приоритет | Сущность | Задача |
| --- | --- | --- | --- |
| CC-LND-14 | P0 | Benefits | Композиция BenefitCard: количество, порядок, общие настройки и адаптив. У пресета нет подтверждённого отдельного runtime export. |
| CC-LND-15 | P1 | BentoGrid | Композиция PromoCard по выбранному D/M-пресету; сохранить сообщения и порядок. Не создавать вымышленный компонент `BentoGrid`. Известные ограничения вариантов брать из паттерна. |
| CC-LND-16 | P1 | ButtonStack [M] | Нижняя зона действий из mobile-кнопок и допустимых дополнений; позиционирование, резерв места и сценарий приложения задаются явно. Отдельный runtime export не подтверждён. |
| CC-LND-17 | P0 | Footer страницы / модального лендинга | Установить, что соответствует Figma-футеру: поддерживаемый компонент или композиция формы, FAQ, файлов и разделителей. Найденный `src/footer/footer.tsx` помечен deprecated; его нельзя автоматически связать с `🔒 [D] Footer`. После проверки выбрать компонентный шаблон либо рецепт композиции. |

## Core: переиспользование командного Code Connect

Задача — проверить применимость и вложение командных шаблонов, а пробелы
согласовать с Core. Копировать их реализации в `design-system_ab` не требуется.

Основание: [Core PR #2280](https://github.com/core-ds/core-components/pull/2280),
проверенный head `0250cce31906f9ca4307a4a3f0f3470884fdbc05`.
На 03.11.2026 PR открыт. «Есть в PR» означает наличие исходника `.figma.ts`
в этом head, а не принятие PR, публикацию связи или совместимость с нашим SDK.
Строка может объединять несколько компонентов одной задачи интеграции.

| ID | Приоритет | Компоненты / API | Для чего нужны | Покрытие указанного PR / действие |
| --- | --- | --- | --- | --- |
| CC-LND-18 | P0 | Button, IconButton | CTA, addons, закрытие и действия | Есть D/M-шаблоны; проверить нужные обычные/инвертированные семейства и вложенность. |
| CC-LND-19 | P0 | Typography, отдельный Text | Заголовки, подписи, rich content и цены | Есть `typography/code-connect/Text.figma.ts`. Установить, какой публичный API он выдаёт; отдельно закрыть используемые heading/Text API. Совпадение имени файла не доказывает покрытие standalone Text. |
| CC-LND-20 | P0 | Link | Текстовые ссылки и кликабельный контент | Есть; URL и обработчик — явный контекст приложения. |
| CC-LND-21 | P0 | IconView | Графика карточек и иконок | Есть; проверить shape exports, передачу SVG/изображения и ограничения вложения. |
| CC-LND-22 | P0 | List, PureCell | Списки и вложенный контент BenefitsBlock | Есть; проверить compound-части, порядок, addons и отсутствие повторных обёрток. |
| CC-LND-23 | P0 | Steps | «Как это работает» внутри BenefitsBlock | В списке изменённых `.figma.ts` этого PR нет `packages/steps/`. Проверить другие действующие связи; при отсутствии оформить пробел Core. |
| CC-LND-24 | P0 | Status, StatusBadge, Tag | Метки, статусы, теги оффера/таблицы | Есть; проверить точные enum transforms и применимые семейства. |
| CC-LND-25 | P0 | Skeleton, Spinner | Loading и вложенные состояния | Есть; проверить передачу состояния через родительский компонент. |
| CC-LND-26 | P0 | Accordion | Внутренняя основа FAQ | Есть; проверить композицию в Corp FAQ и применимый способ управления раскрытием. |
| CC-LND-27 | P1 | Input, Textarea | Форма заявки | Input D/M есть. Отдельный Textarea не найден в изменённых шаблонах PR: проверить действующее покрытие и оформить пробел при необходимости. |
| CC-LND-28 | P1 | Select, SelectWithTags | Выбор условий в форме | Есть D/M; options, ID, selected, callbacks и сценарий вводятся явно. |
| CC-LND-29 | P1 | Checkbox, CheckboxGroup, Radio, RadioGroup, TagGroup | Согласия и выбор условий | Есть; одиночный/множественный выбор и связь с CTA задаёт приложение. TagGroup находится в пакете `radio-group` этого PR. |
| CC-LND-30 | P1 | Attach, Dropzone, FileUploadItem | Прикрепление и состояния файлов | Есть; проверить использование через Corp FileUpload и API списка файлов. |
| CC-LND-31 | P1 | UniversalModal | Контейнер модального лендинга | Есть отдельные Content/Header/Footer D/M; проверить сборку родителя, закрытие и Body, не путать Core Footer с промо-футером. |
| CC-LND-32 | P1 | Tabs | Переключаемый контент, если он предусмотрен брифом | Есть Primary/Secondary; подтвердить нужную identity, данные и controlled state. |
| CC-LND-33 | P1 | Amount | Стоимость и тарифные значения, если используется этот API | Есть; денежная модель и формат берутся из реального API и документов лендинга. |
| CC-LND-34 | P1 | PickerButton, Tooltip | Дополнения TitleView и overflow ButtonGroup | Tooltip есть; PickerButton не найден среди изменённых `.figma.ts`. Установить, нужен ли отдельный шаблон, либо его полностью покрывает родительская композиция. |

## Ассеты и порядок закрытия

- [ ] **CC-LND-35 · P0.** Проверить вложение опубликованных иконок `glyph-26`
  и иллюстраций Corp Image Library: владелец, Figma identity, настоящий import
  или ресурс, размеры/crop и передача в родителя. Внешние ассеты Core выделяет
  в [UI Primitives #1236](https://github.com/core-ds/ui-primitives/pull/1236);
  не приписывать их Core и не подменять библиотечную иллюстрацию заглушкой.
- [ ] **CC-LND-36 · P0.** Проверить один вертикальный срез:
  CorporateContent → PromoMainBlock → Benefits/BenefitCard → BenefitsBlock →
  FAQ/подтверждённый Footer. Затем подключать P1 по конкретному брифу.

Для каждой закрываемой задачи сохранить точные Figma URL/identity и платформу,
реализацию/public import и версию SDK, прочитанные свойства и SLOT paths,
transforms, дочерние шаблоны, контекст приложения и проверенный пример результата.
Использовать единый parserless `.figma.ts` формат Core; не заводить параллельную
JSON-таблицу props, повторяющую шаблон. Наши файлы размещать рядом с данными
соответствующего компонента в `code-connect/`; Core остаётся у команды Core.

Минимальная проверка — официальный parse и preview с непустым snippet,
типизация полученного примера с
выбранным опубликованным SDK, проверки вложенности и отрицательные случаи
для неподдерживаемых свойств/контента. Публикация и фактическое чтение связи
в Figma/MCP отмечаются отдельно. Наличие файла, успешный parse и локальные
типы сами по себе не означают опубликованную связь или Ready контракта.

## Источники перечня и границы

Помимо ссылок выше использованы `ds-ai-hub/products/ab/components/`:
`promo-main-block`, `benefit-card`, `benefits`, `benefits-block`, `button-stack`,
`faq`, `file-upload`, `title-view` — соответствующие `adapter.code.md`;
а также `products/ab/patterns/{landing-pages,bento-grid,draft-layout}.md`.
Прочитанная версия Hub: `a06b00fa9cc9c660e1324d43547b68c134ca68b8`.
Начальные реализации и imports просмотрены в локальном `arui-private`
(HEAD `4bf38e2be8589da705f991b4dcac0d41975dff3d`, checkout содержит локальные
изменения). Это ориентиры для последующей проверки, не принятый runtime pin.

Для полного актуального API перед реализацией требуются повторная проверка
источника, пакета и Figma. Число строк бэклога не равно числу компонентов или
будущих `.figma.ts`: D/M и семейства могут требовать отдельных шаблонов.
Продуктовая навигация банка, произвольные компоненты вне брифа и восстановление
удалённой попытки frontend mapping в эту очередь не входят. `ds-ai-hub`,
контракты, runtime, Proxy и публикация этой записью не изменяются.
