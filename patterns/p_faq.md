# Pattern: FAQ

- documentType: pattern
- patternType: component
- component: FAQ, FAQItem
- patternId: ptrn:components.faq
- patternKey: components.faq
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: ready
- updatedAt: 2026-07-20
- sourceType: component-guideline
- tags: faq, accordion, questions, answers, promo, adaptive, web-corp
- figmaLink: none
- relatedPatterns:
  - ptrn:components.link
- sections: 10

## Section 1: Определение

`FAQ` — компонент для показа списка часто задаваемых вопросов в формате аккордеона. Каждый вопрос представлен служебным `FAQItem`, который содержит обязательные вопрос и ответ.

В библиотеке доступны три публичных корня:

- `[D][Promo] FAQ` для desktop promo-страниц;
- `[M][Promo] FAQ` для Mobile Web promo-страниц;
- `FAQ` для продуктовых desktop и Mobile Web страниц.

Все варианты `FAQItem` являются служебными частями и не используются отдельно.

## Section 2: Когда использовать

Используйте FAQ, когда нужно:

- собрать повторяющиеся вопросы и ответы в одном компактном блоке;
- дать пользователю возможность раскрывать подробности по одному вопросу;
- показать от двух до восьми тематически связанных вопросов;
- разделить большой набор вопросов на категории и вывести категории в отдельных табах;
- разместить в ответе ссылку на подробную информацию.

Выбирайте promo- или универсальное семейство по типу страницы и платформе.

## Section 3: Когда не использовать

Не используйте FAQ:

- для одного вопроса;
- для несвязанных между собой материалов без общей темы;
- как замену основной навигации или полноценной странице документации;
- для интерактивного контента, форм и сложных действий внутри ответа;
- как одиночный `FAQItem` вне публичного корня FAQ;
- с компонентами из другого семейства или другой платформы.

## Section 4: Принципы

1. В FAQ должно быть не меньше двух вопросов.
2. Рекомендуется не больше восьми вопросов в одной категории.
3. По умолчанию все вопросы закрыты.
4. Одновременно может быть открыт только один вопрос.
5. Открытие нового вопроса закрывает предыдущий.
6. Повторный клик по открытому вопросу закрывает его.
7. Вся строка вопроса является областью раскрытия.
8. Вопрос и ответ обязательны и не могут быть пустыми.
9. Ссылки разрешены только внутри ответа.
10. Визуальные параметры и поверхности следуют effective baseline выбранного семейства.

## Section 5: Структура текста

### Вопрос

- обязателен;
- не длиннее 120 символов;
- может переноситься на несколько строк;
- не содержит ссылок.

### Ответ

- обязателен;
- не длиннее 800 символов;
- поддерживает текстовые абзацы, списки и ссылки;
- ссылки оформляются по правилам компонента `Link`.

Если подробное объяснение не помещается в 800 символов, оставьте краткий ответ и добавьте ссылку на отдельную страницу.

## Section 6: Правила

### Rule 1: Используй только публичные корни

- ruleId: rule:components.faq.public-roots-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D][Promo] FAQ`, `[M][Promo] FAQ` или `FAQ`. Не используй `FAQItem` отдельно.

#### Правильно

```text
FAQ
  FAQItem 01
  FAQItem 02
```

#### Неправильно

```text
FAQItem
```

#### Почему

FAQItem — служебная часть, поведение и геометрия которой определяются публичным FAQ.

### Rule 2: Не смешивай семейства

- ruleId: rule:components.faq.family-must-match-host
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Вкладывай в каждый FAQ только FAQItem соответствующего семейства.

#### Правильно

```text
[D][Promo] FAQ
  [D][Promo] FAQItem
```

#### Неправильно

```text
[D][Promo] FAQ
  FAQItem
```

#### Почему

Семейства имеют разные поверхности и геометрию.

### Rule 3: Выбирай версию по платформе

- ruleId: rule:components.faq.platform-version-must-match
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

На promo-странице используй `[D][Promo] FAQ` на desktop и `[M][Promo] FAQ` на Mobile Web. Универсальный `FAQ` используй на продуктовых desktop и Mobile Web страницах.

#### Правильно

```text
Platform=mobile-web
Component=[M][Promo] FAQ
```

#### Неправильно

```text
Platform=mobile-web
Component=[D][Promo] FAQ
```

#### Почему

Promo-версии имеют платформенную геометрию и соответствующие поверхности.

### Rule 4: Показывай минимум два вопроса

- ruleId: rule:components.faq.minimum-two-items
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В FAQ должно быть не менее двух отображаемых вопросов.

#### Правильно

```text
Visible FAQItem=2
```

#### Неправильно

```text
Visible FAQItem=1
```

#### Почему

Одиночный раскрывающийся блок не формирует сценарий FAQ.

### Rule 5: Ограничивай категорию восемью вопросами

- ruleId: rule:components.faq.maximum-eight-per-category
- severity: warning
- appliesTo: component
- checkType: deterministic
- autofix: no

Рекомендуется использовать не более восьми вопросов в одном FAQ или одной категории. Больший набор разделяй по категориям и показывай в отдельных табах.

#### Правильно

```text
Категория «Платежи»: 8 вопросов
Категория «Счета»: 6 вопросов
```

#### Неправильно

```text
Одна категория: 14 вопросов
```

#### Почему

Длинный аккордеон сложно просматривать и в нём трудно найти нужную тему.

### Rule 6: Открывай только один вопрос

- ruleId: rule:components.faq.single-open-item
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Одновременно может быть открыт только один FAQItem. При открытии нового вопроса закрывай предыдущий.

#### Правильно

```text
FAQItem 01 Open=False
FAQItem 02 Open=True
FAQItem 03 Open=False
```

#### Неправильно

```text
FAQItem 01 Open=True
FAQItem 02 Open=True
```

#### Почему

Один открытый пункт сохраняет компактность и фокус пользователя.

### Rule 7: Начинай с закрытого состояния

- ruleId: rule:components.faq.default-state-is-closed
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

В начальном состоянии все FAQItem должны иметь `Open=False`. Для демонстрации конкретного сценария можно открыть один вопрос.

#### Правильно

```text
Initial state: all Open=False
```

#### Неправильно

```text
Initial state: FAQItem 01 Open=True
```

#### Почему

Пользователь самостоятельно выбирает интересующий вопрос.

### Rule 8: Заполняй вопрос и ответ

- ruleId: rule:components.faq.question-and-answer-required
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Каждый отображаемый FAQItem должен содержать непустые вопрос и ответ.

#### Правильно

```text
Вопрос: Как изменить реквизиты?
Ответ: Откройте настройки компании и выберите раздел «Реквизиты».
```

#### Неправильно

```text
Вопрос: Как изменить реквизиты?
Ответ: 
```

#### Почему

Пустой пункт создаёт ложную точку взаимодействия.

### Rule 9: Ограничивай длину вопроса

- ruleId: rule:components.faq.question-length-limit
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Текст вопроса не должен превышать 120 символов. Перенос на несколько строк допустим.

#### Правильно

```text
Как изменить реквизиты компании?
```

#### Неправильно

```text
Вопрос длиннее 120 символов
```

#### Почему

Короткий вопрос легче найти при сканировании списка.

### Rule 10: Ограничивай длину ответа

- ruleId: rule:components.faq.answer-length-limit
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Текст ответа в одном FAQItem не должен превышать 800 символов.

#### Правильно

```text
Краткий ответ и ссылка на подробную инструкцию.
```

#### Неправильно

```text
Ответ длиннее 800 символов без ссылки на отдельную страницу.
```

#### Почему

FAQ должен давать компактный ответ, а не заменять страницу документации.

### Rule 11: Размещай ссылки только в ответе

- ruleId: rule:components.faq.links-only-in-answer
- severity: error
- appliesTo: text
- checkType: manual
- autofix: partial

Не добавляй ссылку в вопрос. Ссылки внутри ответа оформляй по правилам компонента `Link`.

#### Правильно

```text
Вопрос: Где посмотреть тарифы?
Ответ: Откройте страницу «Тарифы» по ссылке.
```

#### Неправильно

```text
Вопрос-ссылка: Где посмотреть тарифы?
```

#### Почему

Строка вопроса уже является контролом раскрытия и не должна содержать конкурирующее действие.

### Rule 12: Сохраняй effective baseline

- ruleId: rule:components.faq.visuals-follow-effective-baseline
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй вручную отступы, интервалы, скругления, заливки, обводки, разделители, типографику, opacity, эффекты и иконку раскрытия.

#### Правильно

```text
Layout and styles = effective baseline
```

#### Неправильно

```text
FAQItem gap: 12 -> 20
Question text style changed manually
```

#### Почему

Визуальная модель определяется выбранным семейством FAQ.

### Rule 13: Сохраняй поверхность семейства

- ruleId: rule:components.faq.surface-is-fixed-by-family
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не отключай и не заменяй встроенный Promo BackgroundPlate. В универсальном FAQ сохраняй штатные разделители и не добавляй BackgroundPlate внутрь FAQItem.

#### Правильно

```text
[D][Promo] FAQ -> [D][Promo] BackgroundPlate
FAQ -> built-in dividers
```

#### Неправильно

```text
[D][Promo] FAQ without BackgroundPlate
```

#### Почему

Поверхность является частью визуальной модели семейства.

### Rule 14: Сохраняй Fill и Hug

- ruleId: rule:components.faq.fill-hug-sizing
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй Fill по ширине и Hug по высоте. Внешнюю ширину FAQ можно ограничивать контейнером по сетке страницы.

#### Правильно

```text
FAQ: Fill/Hug
Container: width by page grid
```

#### Неправильно

```text
FAQ: Fixed/Fixed
```

#### Почему

Высота зависит от числа вопросов и состояния раскрытия.

### Rule 15: Делай кликабельной всю строку

- ruleId: rule:components.faq.entire-question-row-is-clickable
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Вся строка вопроса должна открывать и закрывать FAQItem. Не ограничивай область действия только иконкой.

#### Правильно

```text
Click target = entire question row
```

#### Неправильно

```text
Click target = chevron only
```

#### Почему

Широкая область действия упрощает взаимодействие на desktop и Mobile Web.

### Rule 16: Не заменяй вложенные части

- ruleId: rule:components.faq.instance-swap-forbidden
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не заменяй FAQItem, AccordionHeader, AccordionControl, AccordionBody, иконку и поверхности через instance swap.

#### Правильно

```text
Nested instances = matching family baseline
```

#### Неправильно

```text
AccordionControl swapped manually
```

#### Почему

Вложенные части обеспечивают согласованное поведение аккордеона.

## Section 7: Шаблоны

### Универсальный FAQ

```text
FAQ
  FAQItem 01 Open=False
    Вопрос: Как изменить реквизиты компании?
    Ответ: Откройте настройки компании и выберите раздел «Реквизиты».
  FAQItem 02 Open=False
    Вопрос: Где посмотреть историю операций?
    Ответ: История доступна на странице счёта.
```

### FAQ с раскрытым вопросом

```text
FAQItem 01 Open=False
FAQItem 02 Open=True
FAQItem 03 Open=False
```

### Категории

```text
TabsView
  Tab «Платежи» -> FAQ, 8 вопросов
  Tab «Счета» -> FAQ, 6 вопросов
```

## Section 8: Примеры

### Пример 1: Ответ со ссылкой

```text
Вопрос: Как изменить тариф?
Ответ: Сравните условия на странице «Тарифы» и отправьте заявку по ссылке.
```

### Пример 2: Перенос длинного вопроса

```text
Как получить справку об оборотах по счёту за выбранный период?
```

Текст укладывается в 120 символов и может переноситься на несколько строк.

### Пример 3: Promo FAQ

```text
[D][Promo] FAQ
  [D][Promo] FAQItem 01
  [D][Promo] FAQItem 02
```

## Section 9: Антипримеры

### Антипример 1: Один вопрос

```text
FAQ
  FAQItem 01
```

### Антипример 2: Два открытых вопроса

```text
FAQItem 01 Open=True
FAQItem 02 Open=True
```

### Антипример 3: Смешанные семейства

```text
[M][Promo] FAQ
  FAQItem
```

### Антипример 4: Ссылка в вопросе

```text
Вопрос-ссылка: Где посмотреть тарифы?
```

### Антипример 5: Ручная стилизация

```text
Question fill changed manually
FAQItem padding changed manually
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять публичный корень FAQ и запрещать самостоятельный FAQItem.
- Проверять соответствие семейств FAQ и FAQItem.
- Проверять платформу promo-версии.
- Проверять минимум два отображаемых FAQItem.
- Показывать warning при количестве больше восьми в одной категории.
- Проверять, что одновременно открыт не более чем один FAQItem.
- Проверять непустые вопрос и ответ.
- Проверять длину вопроса до 120 символов и ответа до 800 символов.
- Проверять visual/layout параметры по effective baseline.
- Проверять сохранение поверхности семейства.
- Проверять Fill по ширине и Hug по высоте.
- Проверять отсутствие instance swap вложенных частей.

### Словарные проверки

- Не требуются.

### LLM-проверки

- Проверять уместность разделения большого FAQ на тематические категории.
- Проверять, что содержимое ответа остаётся текстовым.
- Проверять, что ссылка находится в ответе и оформлена по контракту Link.
- Проверять кликабельность всей строки вопроса по данным сценария.
- Проверять, что начальное состояние закрыто, если макет не демонстрирует конкретный раскрытый сценарий.

### Не проверяется автоматически

- Фактическое закрытие предыдущего вопроса во frontend-реализации.
- Повторное закрытие открытого вопроса по клику.
- Работа ссылок внутри ответа.
- Реальная область клика без интерактивного прототипа.

### Автоисправления

- Предложить закрыть лишние открытые вопросы.
- Предложить заменить FAQItem на публичный FAQ.
- Предложить подобрать платформенную promo-версию.
- Предложить вынести подробный ответ на отдельную страницу и добавить ссылку.
