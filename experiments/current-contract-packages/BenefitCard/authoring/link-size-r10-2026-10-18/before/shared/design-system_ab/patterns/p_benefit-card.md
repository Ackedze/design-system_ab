# Pattern: BenefitCard

- documentType: pattern
- patternType: component
- component: BenefitCard
- patternId: ptrn:components.benefit-card
- patternKey: components.benefit-card
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: active
- updatedAt: 2026-07-20
- sourceType: component-guideline
- tags: benefit-card, benefits, promo, graphic, compact, responsive, web-corp-promo
- figmaLink: none
- relatedPatterns:
  - ptrn:media.images-and-formats
  - ptrn:components.background-plate
  - ptrn:components.link
- sections: 10

## Section 1: Определение

`BenefitCard` показывает преимущество, функцию или ключевое ценностное предложение с помощью короткого текста и графики.

Публичные корни:

- `[D] BenefitCard` для desktop при ширине `768 px` и больше;
- `[M] BenefitCard` для Mobile Web при ширине меньше `768 px`.

`BottomContent`, `ContentWrapper` и `Graphic` являются служебными частями и не используются отдельно.

## Section 2: Когда использовать

Используйте BenefitCard, когда нужно:

- кратко показать преимущество продукта или сервиса;
- объяснить отдельную функцию;
- собрать несколько ценностных предложений в группу карточек;
- дополнить короткий текст изображением, иконкой или `IconView`;
- сделать карточку точкой перехода в связанный сценарий.

Для группы карточек предпочтительно использовать пресет `🔒 Benefits`.

## Section 3: Когда не использовать

Не используйте BenefitCard:

- без `Title` или `Graphic`;
- для длинного текста, сложной формы или произвольной композиции;
- как самостоятельный `Graphic`, `ContentWrapper` или `BottomContent`;
- с графикой вне `Corp :: Image Library`;
- с произвольными визуальными настройками внутренних слоёв;
- для частичного skeleton отдельных областей карточки.

## Section 4: Принципы

1. `Title` и `Graphic` обязательны.
2. `Subtitle` и одна ссылка `BottomContent` опциональны.
3. Состав карточки закрыт для произвольных элементов.
4. Все каталоговые сочетания `CardAxis` и `GraphicPosition` разрешены и выбираются по контексту.
5. Для `[D] BenefitCard` при ширине `1024 px` и меньше обязателен `Compact=True`.
6. Для `[M] BenefitCard` `Compact` не обязателен.
7. При `Compact=True` используется `ContentWrapper.Title=Secondary`.
8. `Background=True` создаёт самостоятельную карточку; `Background=False` разрешён на общей подложке и без неё.
9. Skeleton доступен только при `Background=True` и охватывает всю карточку.
10. Внутренние визуальные свойства следуют effective baseline с явно описанными исключениями.

## Section 5: Структура текста

### Title

- обязателен;
- не длиннее `60` символов;
- занимает не более двух строк;
- использует `Secondary` при `Compact=True`;
- при `Compact=False` может использовать `Primary` или `Secondary`.

### Subtitle

- опционален;
- не длиннее `120` символов;
- занимает не более трёх строк.

### BottomContent.Link

- опционален;
- доступен только через `Presets=Link`;
- содержит не более `32` символов;
- занимает одну строку;
- допускает изменение только текста.

### Graphic

- обязателен;
- поддерживает `Image`, `Icon` и `IconView`;
- использует графику только из `Corp :: Image Library`;
- для `Image` заменяется содержимое `ImageView`, где разрешено менять только `Segment`;
- для `Icon` выбирается glyph из `glyph-26`, а размер и цвет сохраняются по effective baseline;
- для `IconView` доступны все публичные настройки по контракту `IconView`.

## Section 6: Правила

### Rule 1: Используй публичный корень

- ruleId: rule:components.benefit-card.public-roots-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D] BenefitCard` или `[M] BenefitCard`. Не используй служебные части отдельно.

### Rule 2: Выбирай версию по платформе

- ruleId: rule:components.benefit-card.platform-version-must-match
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D] BenefitCard` при ширине `768 px` и больше, `[M] BenefitCard` — при ширине меньше `768 px`.

### Rule 3: Сохраняй обязательный контент

- ruleId: rule:components.benefit-card.title-and-graphic-required
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не скрывай `Title` и `Graphic`. `Subtitle` и `BottomContent.Link` можно скрывать.

### Rule 4: Включай Compact для desktop до 1024 px

- ruleId: rule:components.benefit-card.compact-required-at-1024
- severity: error
- appliesTo: variant.Compact
- checkType: deterministic
- autofix: yes

Для `[D] BenefitCard` при ширине `1024 px` и меньше используй `Compact=True`. Также включай Compact, когда контент не помещается в стандартный формат. Для `[M] BenefitCard` Compact не обязателен.

### Rule 5: Используй Secondary в Compact

- ruleId: rule:components.benefit-card.compact-uses-secondary-title
- severity: error
- appliesTo: variant.Title
- checkType: deterministic
- autofix: yes

При `Compact=True` используй `ContentWrapper.Title=Secondary`. При `Compact=False` разрешены `Primary` и `Secondary`.

### Rule 6: Ограничивай длину текста

- ruleId: rule:components.benefit-card.content-limits
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: no

Соблюдай лимиты: `Title` — 60 символов и две строки, `Subtitle` — 120 символов и три строки, `Link` — 32 символа и одна строка.

### Rule 7: Используй графику из библиотеки

- ruleId: rule:components.benefit-card.graphic-library-required
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Бери изображения, иконки и `IconView` из `Corp :: Image Library`. Для `Icon` используй набор `glyph-26`.

### Rule 8: Ограничивай настройки ImageView

- ruleId: rule:components.benefit-card.image-view-segment-only
- severity: error
- appliesTo: component.ImageView
- checkType: deterministic
- autofix: partial

В `ImageView` можно менять только `Segment`. `Crop`, `Size` и остальные свойства следуют effective baseline.

### Rule 9: Сохраняй визуальные параметры Icon

- ruleId: rule:components.benefit-card.icon-visuals-follow-baseline
- severity: error
- appliesTo: component.Icon
- checkType: deterministic
- autofix: partial

Можно заменить glyph в пределах `glyph-26`. Размер, цвет и остальные визуальные свойства иконки менять нельзя.

### Rule 10: Используй только Link

- ruleId: rule:components.benefit-card.bottom-content-link-only
- severity: error
- appliesTo: component.BottomContent
- checkType: deterministic
- autofix: partial

В готовом макете `BottomContent` допускает только `Presets=Link`. `SwapMe` является placeholder. У Link можно менять только текст.

### Rule 11: Не добавляй произвольный контент

- ruleId: rule:components.benefit-card.content-is-closed
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Состав ограничен обязательными `Title` и `Graphic`, опциональным `Subtitle` и одной ссылкой `BottomContent`.

### Rule 12: Выравнивай по количеству строк

- ruleId: rule:components.benefit-card.content-alignment-follows-lines
- severity: error
- appliesTo: layout.alignment
- checkType: manual
- autofix: partial

Центрируй контент, когда `Title` и `Subtitle` занимают по одной строке. При скрытом `Subtitle` центрируй однострочный `Title`. Если отображаемый текст переносится, выравнивай контент по верхнему краю.

### Rule 13: Соблюдай вертикальный resizing

- ruleId: rule:components.benefit-card.vertical-resizing-policy
- severity: error
- appliesTo: layout.sizing.vertical
- checkType: deterministic
- autofix: partial

Одиночная карточка использует `Hug`. Для выравнивания карточек в группе разрешён `Fill`. `Stopper` использует `Fill`; `Fixed` допустим, когда контент должен оставаться визуально цельным.

### Rule 14: Применяй skeleton ко всей карточке

- ruleId: rule:components.benefit-card.skeleton-covers-entire-card
- severity: error
- appliesTo: variant.Skeleton
- checkType: deterministic
- autofix: partial

Skeleton разрешён только при `Background=True`. Он скрывает весь контент и блокирует взаимодействие всей BenefitCard. Частичный skeleton и skeleton при `Background=False` запрещены.

### Rule 15: Настраивай поверхность штатно

- ruleId: rule:components.benefit-card.background-plate-overrides
- severity: error
- appliesTo: component.BackgroundPlate
- checkType: deterministic
- autofix: partial

Разрешены все штатные `Type` вложенного `[Promo] BackgroundPlate`. Для `Colored` можно менять токенизированный цвет заливки, для `Border` — токенизированный цвет обводки. Остальные свойства следуют контракту BackgroundPlate.

### Rule 16: Избегай Secondary

- ruleId: rule:components.benefit-card.secondary-surface-not-recommended
- severity: warning
- appliesTo: variant.Type
- checkType: deterministic
- autofix: partial

`Type=Secondary` разрешён, но не рекомендуется для BenefitCard.

### Rule 17: Объединяй действия карточки и ссылки

- ruleId: rule:components.benefit-card.card-and-link-actions-match
- severity: error
- appliesTo: interaction
- checkType: manual
- autofix: partial

BenefitCard может быть целиком кликабельной и одновременно содержать `BottomContent.Link`, но оба элемента должны выполнять одно действие.

### Rule 18: Сохраняй effective baseline

- ruleId: rule:components.benefit-card.visuals-follow-effective-baseline
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй внутренние отступы, интервалы, скругления, типографику, opacity и эффекты. Исключения перечислены в правилах `ImageView`, `IconView`, resizing и BackgroundPlate.

### Rule 19: Используй Benefits для группы

- ruleId: rule:components.benefit-card.use-benefits-preset-for-groups
- severity: warning
- appliesTo: composition
- checkType: manual
- autofix: partial

Для группы карточек предпочтительно используй пресет `🔒 Benefits`. Ручная группировка допустима, но требует проверки размеров и поведения карточек.

## Section 7: Шаблоны

### Самостоятельная карточка

```text
[D] BenefitCard
  Background=True
  Compact=False
  Graphic=Image
  Title
  Subtitle
```

### Группа карточек

```text
🔒 Benefits
  BenefitCard Background=False VerticalResizing=Fill
  BenefitCard Background=False VerticalResizing=Fill
  BenefitCard Background=False VerticalResizing=Fill
```

### Compact desktop

```text
[D] BenefitCard
  viewport=1024
  Compact=True
  ContentWrapper.Title=Secondary
```

### Состояние загрузки

```text
BenefitCard Background=True
  [Promo] BackgroundPlate Skeleton=True
  Content hidden
  Interaction blocked
```

## Section 8: Примеры

### Изображение

```text
Graphic.Presets=Image
ImageView.Segment=MMB
Source=Corp :: Image Library
```

### Иконка

```text
Graphic.Presets=Icon
Glyph=glyph-26
Size and color=effective baseline
```

### Кликабельная карточка со ссылкой

```text
Card action=open-details
BottomContent.Link action=open-details
```

## Section 9: Антипримеры

### Служебная часть отдельно

```text
[D] Graphic
```

### Не компактная desktop-карточка при 1024 px

```text
[D] BenefitCard Compact=False viewport=1024
```

### Произвольный контент

```text
BenefitCard
  Title
  Graphic
  Custom form
```

### Частичный skeleton

```text
Background=False
Graphic Skeleton=True
```

### Разные действия

```text
Card action=open-details
Link action=open-application
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять публичный корень и платформенную версию.
- Проверять обязательные `Title` и `Graphic`.
- Проверять `Compact=True` у `[D]` при ширине до `1024 px`.
- Проверять `Title=Secondary` при `Compact=True`.
- Проверять длину и число строк текстов.
- Проверять отсутствие `SwapMe` и произвольного контента.
- Проверять `ImageView`: разрешён только override `Segment`.
- Проверять glyph из `glyph-26`, неизменные размер и цвет иконки.
- Проверять sizing BenefitCard и `Stopper`.
- Проверять skeleton всей карточки только при `Background=True`.
- Проверять токенизацию цветов `Colored` и `Border`.
- Показывать warning для `Type=Secondary`.
- Проверять визуальные свойства по effective baseline.

### Словарные проверки

- Проверять наличие графического источника `Corp :: Image Library` по metadata источника, когда она доступна.

### LLM-проверки

- Проверять уместность `CardAxis` и `GraphicPosition` в контексте композиции.
- Проверять выбор `Image`, `Icon` или `IconView` по смыслу контента.
- Проверять согласованность действия кликабельной карточки и ссылки.
- Проверять необходимость ручной группировки вместо `🔒 Benefits`.
- Проверять выбор будущей сегментной палитры после появления правил ММБ, СБ и КИБ.

### Не проверяется автоматически

- Фактическая навигация без интерактивного прототипа.
- Происхождение изображения без metadata библиотеки.
- Реальный viewport, если он не передан в контекст аудита.
- Смысловая уместность текста и графики.

### Автоисправления

- Включить `Compact=True` у `[D]` на ширине до `1024 px`.
- Установить `ContentWrapper.Title=Secondary` для Compact.
- Сбросить визуальные изменения к effective baseline.
- Заменить `SwapMe` на `Link` или скрыть `BottomContent`.
- Предложить собрать группу через `🔒 Benefits`.
