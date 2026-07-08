# TitleView contract package

## Назначение

TitleView описывает сценарий header with title, status and action buttons. Это готовая DS-композиция для заголовка страницы/секции: Title, Status, Button group, RightAddon, TitleAddon и Subtitle должны настраиваться через встроенные slots и nested DS instances, а не через внешнюю ручную композицию.

## Источник raw catalog

`JSONS/web/components/web-corp/Web _ Corp Components -- TitleView.json`

Папка содержит экспериментальный Apollo contract package. Он не заменяет raw catalog, который используется текущим Apollo audit.

## Файлы

- `contract.generated.json` — compact generated baseline из raw catalog.
- `contract.overrides.json` — public API, aliases и reset model.
- `composition-contract.json` — composition и nested ownership model.
- `rules.json` — draft machine-readable rules.
- `audit-mapping.json` — mapping от diff properties к Apollo audit categories.
- `examples.json` — regression examples для ожидаемого поведения Apollo.
- `agent-context.json` — compact context для Apollo agent.

## Источник

- Библиотека: `Web _ Corp Components`
- Файл: `Web _ Corp Components`
- Сгенерировано: `2026-06-05T16:07:39.725Z`

## Примечания

- Nested [D]/[M] Button instances внутри Button group являются частью TitleView baseline; variant changes дизайнером нужно показывать относительно TitleView effective baseline.
- StatusPreset и Status внутри MainContent / Status являются ожидаемыми nested structures; использование preset нормально, если preset не изменён за пределами его variant API.
- View и Skeleton являются public TitleView component properties.
- Title, Subtitle, Button labels и Status label меняются как text content overrides.
- Для встроенного статуса допустимый пример настройки: `Type=Processing`, `Style=Muted`, `Size=32`, label `В работе`.
- Для встроенных кнопок используй primary/secondary, labels, addons off и hint off/hidden, если нет отдельного design rule.
- Nested DS instances внутри TitleView не считаются локальными компонентами и предпочтительнее внешней ручной композиции.
