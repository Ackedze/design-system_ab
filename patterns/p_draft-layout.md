# Pattern: Черновой лейаут страницы

- documentType: pattern
- patternType: layout
- patternId: ptrn:layout.draft-layout
- patternKey: layout.draft-layout
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System / Product Design
- status: draft
- updatedAt: 2026-11-02
- sourceType: owner-guideline
- tags: draft-layout, grid-and-cols, corporate-content, body, section
- figmaLink: none
- relatedPatterns:
  - ptrn:components.corporate-page
  - ptrn:landing-pages.alfa-business
- sections: 10

## Section 1: Определение

Черновой лейаут — базовая структура страницы до детального наполнения: контейнер, области контента, колонки и отступы. Даже черновик собирается на системных компонентах и переменных.

## Section 2: Когда использовать

Для первого макета страницы или лендинга Альфа-Бизнеса: одна колонка, несколько последовательных блоков либо основная область с дополнительным Isle.

## Section 3: Когда не использовать

Локальная правка внутри готовой страницы не требует нового CorporateContent. Модальные окна и другие самостоятельные поверхности собираются по своим паттернам.

## Section 4: Принципы

Сначала выбери сценарий и платформу, затем контейнер и режим сетки, затем композицию Body. Продуктовая обвязка определяется [CorporatePage](p_corporate-page.md), промо-композиция — [правилами лендингов](p_landing-pages.md). Этот базовый паттерн не заменяет их и не добавляет навигацию банка к лендингу автоматически.

## Section 5: Структура текста

В описании черновика достаточно указать сценарий, платформу, режим сетки и смысловые названия областей. Бизнес-тексты и условия предложения не меняются ради компоновки.

## Section 6: Правила

### Rule 1: Размещай содержимое страницы в CorporateContent.Body

- ruleId: rule:layout.draft-layout.corporate-content-host
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Используй один [CorporateContent](../JSONS/web/components/web-corp/CorporateContent/README.md): `[D]` на ширинах от 768, `[M]` на 320–767. Всё содержимое страницы или лендинга размещай в его Body. Замени SwapMe; сохрани библиотечные связи root и слота.

#### Правильно

```text
CorporateContent → Body → блоки страницы
```

#### Неправильно

```text
Произвольный Frame вместо CorporateContent
CorporateContent рядом с основным содержимым лендинга
```

#### Почему

Системный контейнер задаёт сетку, фон и отступы уже на стадии черновика.

### Rule 2: Управляй размерами через сетку

- ruleId: rule:layout.draft-layout.grid-modes-and-widths
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Выбери режим `[D] Grid & Cols` или `[M] Grid & Cols` на внешнем корне макета; вложенные системные компоненты наследуют его. Для ширины областей используй переменные колонок и Content, для горизонтальных промежутков — Gutter. Не подменяй сетку вручную заданными размерами и padding. Ширина viewport и ширина Content — разные величины.

CorporateContent сохраняет штатный `Fill / Hug`; ширина внутренних областей и его отступы следуют режиму сетки. Порядок и вертикальный ритм Body задаются композицией; Gutter не является обязательным вертикальным отступом.

#### Правильно

```text
Root: Grid & Cols → нужный режим
Полная область: 12 Cols
Две области: переменные колонок + Gutter
```

#### Неправильно

```text
Ручной padding у CorporateContent
Независимые режимы сетки у каждой вложенной секции
```

#### Почему

Изменение разрешения должно перестраивать черновик по общей сетке.

### Rule 3: Выбирай Section по составу областей

- ruleId: rule:layout.draft-layout.section-when-needed
- severity: error
- appliesTo: screen
- checkType: llm
- autofix: partial

Для одной колонки или последовательных блоков достаточно Body. Когда нужны системные области Content и Isle, используй `[D] Section` и наполни оба слота. Их колонки, Gutter и перестроение определяются [контрактом Section](../JSONS/web/components/web-corp/CorporateContent/README.md). На узких ширинах следуй его штатному режиму; не имитируй desktop-композицию ручными размерами.

#### Правильно

```text
Body → блок → блок
Body → Section → Content + Isle
```

#### Неправильно

```text
Section обязателен вокруг любого блока
Content и Isle собраны вручную вместо подходящего Section
```

#### Почему

Section решает конкретную композиционную задачу и не нужен для простой вертикальной последовательности.

### Rule 4: Отделяй фон страницы от оформления блока

- ruleId: rule:layout.draft-layout.page-background-scope
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: partial

Фон страницы задаётся разрешённым mode `BackgroundPlate Color` у CorporateContent; без отдельного указания сохраняй default `base-bg-alt (grey)`. Не меняй его fill вручную. Внешние Auto Layout-каркасы остаются прозрачными.

Палитра, Appearance и заливка конкретного блока действуют только в его границе. Например, правило `promo-classic` для главного блока КИБ не означает чёрный фон всей страницы и не разрешает перекрашивать CorporateContent.

#### Правильно

```text
CorporateContent: системный page background
PromoMainBlock: оформление по собственному паттерну
```

#### Неправильно

```text
Hero использует promo-classic → весь page root залит чёрным
```

#### Почему

Оформление одного компонента не определяет фон остальных областей страницы.

## Section 7: Шаблоны

```text
Одна колонка: CorporateContent → Body → полный блок
Несколько блоков: CorporateContent → Body → блок → блок
Content + Isle: CorporateContent → Body → Section → два слота
```

## Section 8: Примеры

Черновик лендинга: в Body последовательно расположены главный блок, преимущества и форма. Черновик продуктовой страницы с дополнительной областью: в Body расположен Section с Content и Isle; обвязка страницы берётся из CorporatePage.

## Section 9: Антипримеры

Контент расположен рядом с пустым CorporateContent; оставлен SwapMe; ширины колонок заданы случайными числами; фон страницы скопирован из палитры промо-блока.

## Section 10: Машинная обработка

### Детерминированные проверки

Один подходящий CorporateContent; контент в Body; нет SwapMe и detach; общий режим сетки; размеры и отступы на переменных. Для Section — оба слота, колонки и Gutter. Фон страницы проверяется отдельно от фонов блоков.

### Словарные проверки

Не предусмотрены.

### LLM-проверки

Соответствие выбранного шаблона сценарию; необходимость Section и продуктовой обвязки.

### Не проверяется автоматически

Визуальное качество композиции, читаемость и фактическое перестроение на непроверенных разрешениях.

### Автоисправления

Не менять сценарий, вложенные компоненты, режим сетки или фон без чтения применимого контракта. Перемещение содержимого в Body требует сохранения его фактов и библиотечных связей.
