# Pattern: PromoCard

- documentType: pattern
- patternType: component
- component: PromoCard
- patternId: ptrn:components.promo-card
- patternKey: components.promo-card
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: active
- updatedAt: 2026-07-20
- sourceType: component-guideline
- tags: promo-card, promo, offer, image, bento, web-corp-promo
- figmaLink: none
- relatedPatterns:
  - ptrn:media.images-and-formats
  - ptrn:components.background-plate
  - ptrn:controls.buttons-and-button-groups
- sections: 10

## Section 1: Определение

`PromoCard` показывает отдельное промопредложение, преимущество или акцию с помощью текста, изображения и опционального действия.

Публичные корни:

- `[D] PromoCard` для desktop при ширине `768 px` и больше;
- `[M] PromoCard` для Mobile Web при ширине меньше `768 px`.

`BottomContent`, `ButtonGroup`, `ContentWrapper` и `ImageContainer*` являются служебными частями и отдельно не используются.

## Section 2: Когда использовать

Используйте PromoCard, когда нужно:

- визуально выделить отдельное промопредложение;
- показать преимущество или акцию;
- объединить короткий текст с изображением;
- собрать карточки разных размеров в бенто-композицию;
- дать одно или два действия, связанные с предложением.

## Section 3: Когда не использовать

Не используйте PromoCard:

- без `Title`;
- без изображения вне бенто-композиции;
- как самостоятельную служебную часть;
- для длинного текста или сложной формы;
- с ручными изменениями внутренних стилей и геометрии;
- с несколькими произвольными элементами внутри `BottomContent`.

## Section 4: Принципы

1. `Title` обязателен, `Subtitle`, изображение и `BottomContent` опциональны.
2. `Small`, `Medium` и `Large` выбираются по композиции.
3. Изображение размещается сверху или снизу; `Image=None` разрешён только в бенто-композиции.
4. Изображение заменяется в `ImageView` и берётся из `Corp :: Image Library`.
5. `BottomContent` — открытый slot для одного локального или библиотечного instance.
6. Карточка может быть кликабельной целиком либо содержать до двух кнопок.
7. Внутренние визуальные свойства следуют effective baseline с явно описанными исключениями.
8. Skeleton охватывает всю карточку.

## Section 5: Структура текста

### Title

- обязателен;
- рекомендуется не длиннее `60` символов;
- рекомендуется не более двух строк;
- допускает `ContentWrapper.Title=Primary` и `Secondary`.

### Subtitle

- опционален;
- рекомендуется не длиннее `120` символов;
- рекомендуется не более трёх строк.

### Image

- обязателен вне бенто-композиции;
- заменяется через `ImageView`;
- берётся из `Corp :: Image Library`;
- допускает изменение `ImageView.Segment`;
- использует публичные `PromoCard.ImageCrop` и `PromoCard.Offset` вместо ручной настройки вложенного `ImageView`.

### BottomContent

- опционален;
- принимает один локальный или библиотечный component instance;
- настраивается через instance swap;
- вложенный компонент остаётся instance и следует собственному контракту.

## Section 6: Правила

### Rule 1: Используй публичный корень

- ruleId: rule:components.promo-card.public-roots-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D] PromoCard` или `[M] PromoCard`. Не используй служебные части отдельно.

### Rule 2: Выбирай версию по платформе

- ruleId: rule:components.promo-card.platform-version-must-match
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D] PromoCard` при ширине `768 px` и больше, `[M] PromoCard` — при ширине меньше `768 px`.

### Rule 3: Сохраняй Title

- ruleId: rule:components.promo-card.title-required
- severity: error
- appliesTo: text.Title
- checkType: deterministic
- autofix: partial

Не скрывай `Title`. `Subtitle` можно скрыть.

### Rule 4: Ограничивай длину текста

- ruleId: rule:components.promo-card.content-limits
- severity: warning
- appliesTo: text
- checkType: deterministic
- autofix: no

Рекомендуемые лимиты: `Title` — 60 символов и две строки, `Subtitle` — 120 символов и три строки.

### Rule 5: Используй Image=None только в бенто

- ruleId: rule:components.promo-card.image-none-bento-only
- severity: error
- appliesTo: variant.Image
- checkType: contextual
- autofix: partial

`Image=None` разрешён только внутри бенто-композиции. При отсутствии изображения используй `ImageCrop=False` и `Offset=False`.

### Rule 6: Настраивай изображение публичными параметрами

- ruleId: rule:components.promo-card.image-view-overrides
- severity: error
- appliesTo: component.ImageView
- checkType: deterministic
- autofix: partial

Можно заменить изображение и изменить `ImageView.Segment`. Не меняй вручную `ImageView.Crop`, `ImageView.Size` и служебный параметр `Image Centred`. Обрезкой управляет `PromoCard.ImageCrop`.

### Rule 7: Используй Offset только сверху

- ruleId: rule:components.promo-card.offset-top-only
- severity: error
- appliesTo: variant.Offset
- checkType: deterministic
- autofix: yes

`Offset` разрешён только при `Image=Top`. Он выводит изображение за границы поверхности и может сочетаться с `ImageCrop`.

### Rule 8: Синхронизируй fade с подложкой

- ruleId: rule:components.promo-card.top-fade-matches-surface
- severity: error
- appliesTo: styles.gradient
- checkType: deterministic
- autofix: partial

При `Image=Top` используется fade. На цветной поверхности градиент должен использовать тот же цветовой токен, что и заливка `[Promo] BackgroundPlate`.

### Rule 9: Используй один instance в BottomContent

- ruleId: rule:components.promo-card.bottom-content-single-instance
- severity: error
- appliesTo: slot.BottomContent
- checkType: deterministic
- autofix: partial

Замени `SwapMe` на один локальный или библиотечный component instance. `SwapMe`, несколько instances и detach запрещены в готовом макете.

### Rule 10: Соблюдай контракт вложенного компонента

- ruleId: rule:components.promo-card.bottom-content-follows-own-contract
- severity: error
- appliesTo: slot.BottomContent
- checkType: deterministic
- autofix: partial

Настраивай вложенный компонент через его публичные свойства. Не меняй вручную внутренние стили.

### Rule 11: Ограничивай число кнопок

- ruleId: rule:components.promo-card.button-composition
- severity: error
- appliesTo: component.ButtonGroup
- checkType: deterministic
- autofix: partial

Используй не более двух кнопок. Для одной кнопки доступны `Primary` и `Secondary`. Для двух — сочетания `Primary / Secondary` и `Secondary / Transparent`. Размеры: `48` на desktop и `56` на Mobile Web.

### Rule 12: Выбирай направление по контексту

- ruleId: rule:components.promo-card.content-alignment-contextual
- severity: info
- appliesTo: layout.alignment
- checkType: contextual
- autofix: no

`ContentWrapper.Centred` выбирается по контексту задачи. При `Centred=True` рекомендуется `ButtonGroup.Axis=Vertical`.

### Rule 13: Согласовывай действие карточки

- ruleId: rule:components.promo-card.click-action-consistency
- severity: error
- appliesTo: interaction
- checkType: contextual
- autofix: no

Один интерактивный элемент в кликабельной карточке должен дублировать действие карточки. Текстовая ссылка внутри текстового блока может открывать отдельное пояснение или Tooltip.

### Rule 14: Отключай клик карточки при двух кнопках

- ruleId: rule:components.promo-card.two-buttons-disable-card-click
- severity: error
- appliesTo: interaction
- checkType: contextual
- autofix: partial

Карточка с двумя кнопками не кликабельна целиком. Каждая кнопка может выполнять собственное действие.

### Rule 15: Не перегружай BottomContent действиями

- ruleId: rule:components.promo-card.avoid-multiple-interactive-elements
- severity: warning
- appliesTo: interaction
- checkType: contextual
- autofix: no

Не рекомендуется одновременно использовать кнопки и другой интерактивный элемент. Исключение — текстовая ссылка внутри текстового блока.

### Rule 16: Настраивай поверхность штатно

- ruleId: rule:components.promo-card.surface-follows-contract
- severity: error
- appliesTo: component.BackgroundPlate
- checkType: deterministic
- autofix: partial

Следуй контракту `[Promo] BackgroundPlate`. Для `Colored` разрешена токенизированная заливка, для `Border` — токенизированная обводка.

### Rule 17: Избегай Secondary

- ruleId: rule:components.promo-card.secondary-surface-not-recommended
- severity: warning
- appliesTo: variant.Type
- checkType: deterministic
- autofix: partial

`Type=Secondary` разрешён, но не рекомендуется для PromoCard.

### Rule 18: Применяй Skeleton ко всей карточке

- ruleId: rule:components.promo-card.skeleton-covers-entire-card
- severity: error
- appliesTo: variant.Skeleton
- checkType: deterministic
- autofix: partial

`Skeleton=True` доступен для любого `Type` поверхности, скрывает весь контент и блокирует всю карточку. Частичный skeleton запрещён.

### Rule 19: Сохраняй effective baseline

- ruleId: rule:components.promo-card.visuals-follow-effective-baseline
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй вручную внутренние padding, gap, radius, typography, opacity и effects. Корень обычно использует `Hug` по высоте, `Stopper` — `Fill`.

## Section 7: Шаблоны

### Стандартная карточка

```text
[D] PromoCard
  Size=Medium
  Image=Top
  ImageCrop=False
  ContentWrapper.Centred=False
  Title
  Subtitle
```

### Карточка без изображения в бенто

```text
Bento composition
  PromoCard Image=None ImageCrop=False Offset=False
```

### Две кнопки

```text
PromoCard clickable=False
  BottomContent=ButtonGroup
  Primary action=open-offer
  Secondary action=show-terms
```

### Состояние загрузки

```text
PromoCard
  [Promo] BackgroundPlate Skeleton=True
  Content hidden
  Interaction blocked
```

## Section 8: Примеры

### Верхнее изображение с Offset

```text
Image=Top
ImageCrop=True
Offset=True
```

### Произвольный BottomContent

```text
BottomContent
  Swap to one local component instance
  Configure by nested component contract
```

### Кликабельная карточка со ссылкой-пояснением

```text
Card action=open-offer
Inline text link action=open-tooltip
```

## Section 9: Антипримеры

### Image=None вне бенто

```text
Standalone PromoCard Image=None
```

### Offset снизу

```text
Image=Bottom Offset=True
```

### Незаменённый slot

```text
BottomContent.Presets=SwapMe
```

### Кликабельная карточка с двумя кнопками

```text
PromoCard clickable=True
PrimaryButton=True
SecondaryButton=True
```

### Ручная типографика

```text
Title styles.text=custom
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять публичный корень и платформенную версию.
- Проверять наличие `Title`.
- Проверять допустимые `Size`, `Image` и `ImageCrop`.
- Проверять `Offset` только при `Image=Top`.
- Проверять `ImageCrop=False` и `Offset=False` при `Image=None`.
- Проверять настройки `ImageView` и effective baseline служебного `ImageContainer`.
- Проверять один instance в `BottomContent`, отсутствие `SwapMe` и detach.
- Проверять число, сочетание и размеры кнопок.
- Проверять токены поверхности и fade.
- Проверять полный skeleton.
- Проверять внутренние стили по effective baseline.

### Словарные проверки

- Проверять источник изображения `Corp :: Image Library`, когда доступна metadata источника.

### LLM-проверки

- Определять, находится ли `Image=None` внутри бенто-композиции.
- Оценивать выбор `Small`, `Medium` или `Large` по композиции.
- Оценивать `ContentWrapper.Centred` и направление кнопок.
- Проверять согласованность действий карточки и вложенных интерактивных элементов.
- Проверять необходимость нескольких интерактивных элементов.

### Не проверяется автоматически

- Фактическая навигация без интерактивного прототипа.
- Смысловая уместность изображения и текста.
- Принадлежность к бенто без контекста родительской композиции.
- Источник изображения без metadata библиотеки.

### Автоисправления

- Сбросить `Offset` при `Image=Bottom` или `Image=None`.
- Сбросить `ImageCrop` при `Image=None`.
- Вернуть внутренние стили к effective baseline.
- Отключить клик всей карточки при двух кнопках.
- Предложить заменить `SwapMe` на один component instance.
