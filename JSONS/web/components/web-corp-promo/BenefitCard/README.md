# BenefitCard — component contract

Готовый комплект машиночитаемых документов для **Web _ Сorp Promo Components / BenefitCard**.

Raw Figma catalog остаётся source of truth для структуры и effective baseline:

`../Web _ Сorp Promo Components -- BenefitCard.json`

Компонентный паттерн:

`../../../../../patterns/p_benefit-card.md`

## Публичные компоненты

- `[D] BenefitCard` — desktop, ширина `768 px` и больше.
- `[M] BenefitCard` — mobile-web, ширина меньше `768 px`.

`BottomContent`, `ContentWrapper` и `Graphic` являются служебными частями и не используются отдельно.

## Файлы

- `contract.generated.json` — сгенерированный compact contract из raw-каталога.
- `contract.overrides.json` — ручная семантика, разрешённые и запрещённые overrides.
- `composition-contract.json` — структура, слоты, responsive-поведение и effective baseline.
- `rules.json` — exact component rules и ссылки на `p_benefit-card.md`.
- `audit-mapping.json` — группировка и reset-модель Apollo.
- `examples.json` — положительные и отрицательные сценарии аудита.
- `agent-context.json` — компактный контекст для интерпретации агентом.

## Применимость

- Канал: `b2b`.
- Платформы: `desktop`, `mobile-web`.
- Статус комплекта: `ready`.
- Обновлено: `2026-07-20`.

## Генерация

`contract.generated.json`, generated-секции и индекс формируются Athena CLI. Ручные секции документов сохраняются при повторной генерации.
