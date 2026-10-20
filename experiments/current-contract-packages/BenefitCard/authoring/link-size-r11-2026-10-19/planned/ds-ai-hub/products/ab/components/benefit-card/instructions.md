---
id: BenefitCard.instructions
layer: product
product: ab
platforms: [web]
targets: [figma, code]
status: verified
lastReviewed: 2026-10-19
---

# BenefitCard

`BenefitCard` показывает отдельное преимущество, функцию или ценностное предложение через короткий текст и обязательную графику. Компонент относится к promo-слою AB, но может использоваться как самостоятельная карточка или как элемент группы преимуществ.

Полный паттерн: [`../../patterns/benefit-card.md`](../../patterns/benefit-card.md). Точные Figma keys: [`figma-keys.json`](figma-keys.json).

## Публичная граница

Для генерации разрешены только:

- `[D] BenefitCard` — desktop при ширине `768 px` и больше;
- `[M] BenefitCard` — Mobile Web при ширине меньше `768 px`.

`[D]/[M] BottomContent`, `ContentWrapper` и `Graphic` — внутренние части. Не импортируй и не размещай их отдельно.

`🔒 Benefits` — Figma-only preset для группы карточек, а не третий public root BenefitCard.

## Когда использовать

Используй BenefitCard, чтобы:

- кратко показать преимущество продукта или сервиса;
- объяснить одну функцию;
- дополнить короткий текст небольшим изображением, иконкой или `IconView`;
- собрать несколько преимуществ в группу;
- сделать карточку точкой перехода в связанный сценарий.

Для группы карточек предпочитай preset `🔒 Benefits`. Ручная группа допустима, но требует проверки одинаковой высоты и responsive-поведения.

## Когда не использовать

Не используй BenefitCard:

- без `Title` или `Graphic`;
- для длинного текста, сложной формы или произвольного контента;
- как отдельный `Graphic`, `ContentWrapper` или `BottomContent`;
- с графикой вне `Corp :: Image Library`;
- для частичного skeleton;
- с ручными padding, gap, radius, typography, fill, stroke, opacity или effects.

## Модель контента

| Часть | Требование |
|---|---|
| `Title` | Обязателен; до 60 символов и двух строк |
| `Subtitle` | Опционален; до 120 символов и трёх строк |
| `Graphic` | Обязателен; `Image`, `Icon` или `IconView` |
| `BottomContent` | Опционален; только `Presets=Link`: mobile-web — `Size=14–20`, desktop — `Size=16–24`; до 32 символов и одной строки. Остальные настройки — по контракту Link. |

Произвольный пятый слот не добавляй. `SwapMe` — служебный placeholder и не должен оставаться в готовом макете.

## Платформа и Compact

- `[D]` используется от `768 px`, `[M]` — ниже `768 px`.
- Для `[D] BenefitCard` при viewport `1024 px` и меньше обязательно `Compact=True`.
- Включай `Compact=True`, если контент не помещается в стандартный формат.
- Для `[M] BenefitCard` допустимы оба значения Compact.
- При `Compact=True` используй `ContentWrapper.Title=Secondary`.
- При `Compact=False` разрешены `Primary` и `Secondary`.

## Композиция

Все каталоговые сочетания разрешены:

- `CardAxis=Horizontal | Vertical`;
- `GraphicPosition=Left | Right`;
- `Background=True | False`;
- `Compact=True | False` с учётом правила desktop ≤1024 px.

Выбирай ось и позицию графики по контексту. Если видимые Title и Subtitle однострочные, центрируй контент; если Subtitle скрыт, однострочный Title также центрируется. При переносе Title или Subtitle выравнивай контент по верхнему краю.

## Графика

- Источник графики — только `Corp :: Image Library`.
- При `Graphic.Presets=Image` заменяй содержимое `ImageView`; разрешён только override `Segment`.
- `Crop`, `Size` и остальные свойства ImageView сохраняй по effective baseline.
- При `Graphic.Presets=Icon` используй glyph из `glyph-26`; размер и цвет не меняй.
- При `Graphic.Presets=IconView` используй только публичные свойства по контракту IconView.

## Поверхность и loading

`Background=True` создаёт самостоятельную карточку. `Background=False` разрешён на общей подложке и без дополнительной поверхности.

Поверхность настраивается через вложенный `[Promo] BackgroundPlate`:

- все штатные `Type` разрешены;
- `Type=Secondary` разрешён, но не рекомендуется;
- у `Colored` можно менять только токенизированный fill;
- у `Border` можно менять только токенизированный stroke;
- остальные настройки — по [`BackgroundPlate`](../background-plate/cookbook/01-overview.md).

Skeleton разрешён только при `Background=True`, включается на вложенном BackgroundPlate и охватывает всю карточку: контент скрыт, взаимодействие заблокировано. Частичный skeleton запрещён.

## Sizing и взаимодействие

- Одиночная BenefitCard: vertical resizing `Hug`.
- Равновысокая группа: vertical resizing `Fill`.
- `Stopper`: по умолчанию `Fill`; `Fixed` допустим, когда контент должен оставаться визуально цельным.
- Вся карточка может быть кликабельной.
- Карточка и `BottomContent.Link` могут быть активны одновременно только для одного и того же действия.

## Запрещено

- скрывать Title или Graphic;
- использовать internal parts отдельно;
- оставлять `BottomContent.Presets=SwapMe`;
- использовать в BottomContent.Link размер, отличный от `14–20` на mobile-web или `16–24` на desktop;
- использовать произвольную графику или icon не из `glyph-26`;
- менять ImageView Crop/Size;
- задавать raw colors;
- делать разные действия у карточки и ссылки;
- cross-family instance swap;
- вручную менять visual baseline.

## Lifecycle dependency

Связанный продуктовый паттерн [`benefit-card.md`](../../patterns/benefit-card.md) пока имеет
`status: draft`. Verified-статус этого component package подтверждает описанные здесь границы и
исполняемую механику, но не повышает статус паттерна целиком. Правило паттерна, которое не повторено
в verified-файлах пакета, применяй с меткой `[VERIFY dependency]`.

## Evidence

- Curated source: `design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/README.md` и manual-секции соседних JSON-контрактов.
- Raw structure: `Web _ Сorp Promo Components -- BenefitCard.json`.
- Source SHA: `9043406327519a98adcc99b2c7cbd9c8f5dcb04d`.
- Live Figma checked: 2026-07-29, page `3:476`.
- Прямой Code Connect BenefitCard не найден; runtime существование Corp components подтверждено владельцем. Точные import/props остаются `[VERIFY]`.

## Текущий Editor authoring

С 2026-10-06 primary authoring source находится в `design-system_ab/experiments/web-corp-promo/BenefitCard/authoring/contract.manual.json`. Family package содержит desktop и mobile-web; внутренние семейства сохраняются как части компонента.

Новый пакет имеет статус **Draft**: текущие native bindings, dependency closure, code API и live acceptance ещё не подтверждены. Исторические статусы и проверки выше не означают готовность нового manual. В нём сохранены 30 исходных норм; 1 имеют типизированный исполняемый contour, остальные сопровождаются явными missingFacts. Перед автоматической сборкой нужно пройти coverage/gaps и актуальные проверки.
