# SpotlightPage — MVP component contract

Папка содержит сгенерированный слой component-contract для **Web _ Corp Limited Components (не подключать) / SpotlightPage**.

Raw Figma catalog остаётся source of truth:

`../../../../web/components/web-corp-limited-components-не-подключать/Web _ Corp Limited Components (не подключать) -- SpotlightPage.json`

## Файлы

- `contract.generated.json` — сгенерированный compact contract, извлечённый из raw Figma catalog.
- `contract.overrides.json` — ownership v2: generated inventory и manual semantic layer.
- `composition-contract.json` — ownership v2: generated wraps и manual composition knowledge.
- `rules.json` — ownership v2: generated baseline rules и manual expert rules.
- `audit-mapping.json` — ownership v2: generated mapping и manual presentation overrides.
- `examples.json` — ownership v2: manual approved examples и optional generated fixtures.
- `agent-context.json` — ownership v2: generated inventory и manual agent guidance.

`metadata`, `generated`, `manual` и optional `runtime` имеют единственного владельца. Athena обновляет только `generated`; Apollo читает файл через public compiler.

## Источник

- Библиотека: `Web _ Corp Limited Components (не подключать)`
- Сгенерировано: `2026-07-27T13:33:04.130Z`
- Компонентов: `8`
