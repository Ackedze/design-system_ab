---
id: BenefitCard.instructions
layer: product
product: ab
platforms: [web]
targets: [figma, code]
status: draft
lastReviewed: 2026-10-09
---

# BenefitCard

BenefitCard показывает преимущество коротким текстом и обязательной графикой. Актуальная классификация норм согласована владельцем 09.10.2026. Контракт r4 остаётся Draft до проверки нового пакета в Editor и закрытия зависимостей.

## Публичная граница

### rule:components.benefit-card.public-roots-only

Используй только `[D] BenefitCard` на desktop при ширине viewport от 768 px и `[M] BenefitCard` на mobile-web при ширине меньше 768 px. Ширина карточки не заменяет ширину viewport. `BottomContent`, `ContentWrapper` и `Graphic` — внутренние части, отдельно их не размещают. Точные опубликованные ключи: [figma-keys.json](figma-keys.json).

## Обязательный контент

### rule:components.benefit-card.title-required

Title обязателен и видим.

### rule:components.benefit-card.graphic-required

Graphic обязателен и видим.

### rule:components.benefit-card.content-is-closed

Instance swap вложенных элементов запрещён. Единственное исключение — Bottom. Изменение публичного свойства вложенного компонента не является instance swap.

### rule:components.benefit-card.bottom-content-link-only

Если Bottom включён, в готовом макете разрешён только `BottomContent.Presets=Link`. `SwapMe` — placeholder. У Link меняют только текст; остальные настройки определяет [контракт Link](../../../../core/web/components/link/cookbook.md).

### rule:components.benefit-card.content-limits

| Текст | Максимум символов | Максимум строк |
|---|---:|---:|
| Title | 60 | 2 |
| Subtitle | 120 | 3 |
| Link в Bottom | 32 | 1 |

Subtitle и Bottom опциональны. Ограничение Link требует собственного контракта Link и точной привязки его текстового слоя. В текущем Draft это открытая зависимость.

## Настройки вложенных компонентов

### rule:components.benefit-card.image-view-segment-only

В ImageView меняют только Segment. `Size=80`, `Crop=Center`; прочие настройки сохраняют по эталону. Сам ImageView не заменяют через instance swap.

### rule:components.benefit-card.compact-uses-secondary-title

При `Compact=True` у Content используется `Title=Secondary`. При `Compact=False` допустимы `Primary` и `Secondary`. Выбор Compact по ширине ≤1024 px или по вместимости контента относится к [рецепту](cookbook/05-sizing-loading-and-actions.md).

### rule:components.benefit-card.background-plate-overrides

У вложенного BackgroundPlate в контексте BenefitCard меняют только Type. Остальные настройки определяет [контракт BackgroundPlate](../background-plate/cookbook/01-overview.md); изменения Type проверяют по эталону выбранного Type. Снятые исключения для ручного fill у Colored и stroke у Border не применяются.

### rule:components.benefit-card.color-tokens

Для цветов обязательны токены библиотеки. Обязательность binding проверяется в r4; принадлежность разрешённой библиотеке требует каталога токенов BackgroundPlate. Raw color запрещён.

Публичные настройки IconView определяет отдельный контракт IconView. Размер, цвет и принадлежность glyph нужному набору относятся к общей проверке иконок; локальное правило BenefitCard не подменяет её.

## Размер и внешний вид

### rule:components.benefit-card.vertical-resizing-policy

Одиночная карточка использует Hug по высоте. Сборка равновысокой группы, Fill и Stopper относятся к рецепту группы.

### rule:components.benefit-card.text-alignment-protected

Видимые текстовые слои используют горизонтальное выравнивание LEFT; ручные изменения запрещены. Правило выбора вертикального выравнивания по числу строк удалено.

### rule:components.benefit-card.visuals-follow-effective-baseline

Запрещены ручные изменения padding, gap, radius, typography, fill, stroke, opacity и effects относительно effective baseline выбранной конфигурации. Разрешённые публичные настройки дочерних компонентов проверяют по их контрактам. Пока точная дочерняя зависимость отсутствует, такой участок остаётся неполной проверкой.

## Рекомендации и описание API

Type=Secondary у BackgroundPlate разрешён, но не рекомендуется. Это рекомендация, не нарушение.

Background=True включает собственную поверхность, False убирает её. Это описание параметра. Доступные CardAxis/GraphicPosition и варианты Graphic описывают API; сам перечень вариантов не является правилом.

## Рецепты и интерактивность

[Рецепт сборки](cookbook/05-sizing-loading-and-actions.md) хранит требования к полному skeleton, выбору Compact по контексту и группе карточек. Совпадение действий карточки и ссылки проверяют в интерактивном рецепте и коде. Предпочтение пресета Benefits относится к паттерну лендинга.

## Проверка и ограничения

[Порядок проверки](cookbook/06-verify.md). В r4 есть 21 исходное правило и 37 технических проверок; четыре нормы ожидают Link, IconView или admission gate внутренних частей. Native bindings закреплены для 32 вариантов. Локальные проверки не подтверждают полную live-приёмку или code parity.

Библиотечные эталоны по высоте FIXED расходятся с нормой одиночной карточки Hug. У desktop Compact=True захвачен Title=Primary, хотя норма требует Secondary. Эти расхождения не отменяют принятые нормы и требуют отдельной правки библиотеки.

## Evidence

Решения владельца: 09.10.2026. Рабочий источник: current-contract-packages/BenefitCard/authoring/contract.manual.json, r4. Историческая проверка библиотеки 29.07.2026 сохраняется как происхождение; новая полная приёмка не заявлена. Code API и generation parity остаются по существующему evidence и требуют отдельной проверки.
