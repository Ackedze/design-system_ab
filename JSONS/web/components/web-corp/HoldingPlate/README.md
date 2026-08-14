# HoldingPlate — component contract

Папка содержит generated- и manual-слои component contract для **Web _ Corp Components / HoldingPlate**.

## Статус

**In progress.** Семантика, платформа, размещение, варианты ширины, anatomy, visual baseline, lifecycle, overflow и отсутствие interaction/states подтверждены владельцем AB-слоя 2026-08-14. Все нарушения подтверждённого контракта имеют severity `error`. Переход в Ready заблокирован до обновления устаревшей версии Plate внутри исходного Figma-компонента и повторного targeted export через Athena.

## Назначение

`🔒 HoldingPlate` — desktop-only Figma-пресет информационной плашки режима холдинга. Он показывает, от лица какой компании сейчас работает пользователь. Используйте его, только когда страница или действие относятся к одной выбранной компании и нужна дополнительная идентификация, от какой компании отображаются данные. В общем multi-company контексте плашка не используется.

На странице HoldingPlate располагается сразу под `TitleView` и перед основным контентом. Он не используется одновременно с `TitleView.Holding`: это взаимоисключающие способы отображения контекста компании.

Знак `🔒` означает Figma-only preset. Компонент используется целиком как библиотечный instance: detach, ручная пересборка и instance swap вложенных частей запрещены.

Вариант `width=12 col` или `width=8 col` выбирается по ширине родительского grid-контейнера, а не по breakpoint. Произвольно изменять ширину нельзя.

Обязательная текстовая конструкция: `Вы работаете от лица [Название компании]`. Меняется только название компании. Текст остаётся в одну строку и при переполнении сокращается через ellipsis; tooltip для полного названия не предусмотрен. `Caption`, `StatusBadge` и `Controls` остаются скрытыми. Плашка не является селектором компании и не имеет действия.

Visual baseline неизменяем: вложенный Plate использует `Border=True`, `BorderRadius=16` и padding 12 px; fill, stroke, typography и цвета остаются token-bound. Собственных loading, skeleton, disabled, error, hover и focus-состояний нет.

## Известный блокер

Текущий Figma-компонент HoldingPlate использует устаревшую версию `[D] Plate`. Владелец AB-компонента обновит вложенный компонент в Figma. После этого нужно через Athena выполнить targeted export raw-каталога HoldingPlate и пересобрать generated contracts и indexes. До этого пакет остаётся `In progress`.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- HoldingPlate.json`

## Файлы

- `contract.generated.json` — generated compact contract из raw Figma catalog.
- `contract.overrides.json` — manual semantic layer поверх generated baseline.
- `composition-contract.json` — ownership вложенных instances и composition rules.
- `rules.json` — component-level classification и подтверждённые design rules.
- `audit-mapping.json` — модель группировки Apollo.
- `examples.json` — regression-примеры трактовки.
- `agent-context.json` — compact context для агента.

## Источник

- Библиотека: `Web _ Corp Components`
- Raw обновлён: `2026-07-27T12:58:40.628Z`
- Компонентов: `1`
