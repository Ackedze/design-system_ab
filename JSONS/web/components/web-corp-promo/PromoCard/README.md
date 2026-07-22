# PromoCard

Машиночитаемый комплект компонента `Web _ Сorp Promo Components / PromoCard` для Apollo и агента.

## Назначение

PromoCard показывает отдельное промопредложение, преимущество или акцию. Публичные корни: `[D] PromoCard` для desktop и `[M] PromoCard` для Mobile Web.

Raw Figma catalog остаётся источником структуры и effective baseline:

`../Web _ Сorp Promo Components -- PromoCard.json`

## Файлы

- `contract.generated.json` — сгенерированная структура, варианты, токены и baseline.
- `contract.overrides.json` — семантика публичных корней, разрешённых и запрещённых изменений.
- `composition-contract.json` — правила композиции, slot `BottomContent`, изображение, поверхность и взаимодействия.
- `rules.json` — точные компонентные правила для Apollo и агента.
- `audit-mapping.json` — классификация изменений и reset surfaces Apollo.
- `examples.json` — положительные и отрицательные сценарии трактовки.
- `agent-context.json` — компактный нормативный контекст для агента.
- `patterns/p_promo-card.md` — человекочитаемый компонентный паттерн.

## Ключевые правила

- `Title` обязателен; `Subtitle` опционален.
- `Image=None` разрешён только в бенто-композиции.
- `Offset` используется только при `Image=Top`.
- `BottomContent` принимает один локальный или библиотечный component instance.
- До двух кнопок; при двух кнопках карточка не кликабельна целиком.
- Skeleton скрывает и блокирует всю карточку.
- Внутренние визуальные свойства сохраняются по effective baseline.

## Статус

Комплект проверен и имеет статус `ready`.
