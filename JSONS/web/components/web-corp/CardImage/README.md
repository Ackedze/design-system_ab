# CardImage

Component package для универсального corp-компонента, который показывает банковскую карту самостоятельно или внутри продуктового host-компонента.

## Статус

**Ready**. Продуктовая семантика и комплект документов подтверждены владельцем 2026-08-03; package validation и targeted Athena checks пройдены.

## Источники

- Figma: `Web _ Corp Components`, page `CardImage`, node `20005:30356`.
- Raw: `../Web _ Corp Components -- CardImage.json`.
- Generated baseline: `contract.generated.json`.
- Связанный pattern: `patterns/p_account-select.md`.
- Решения владельца компонента от 2026-08-03.

Приоритет смысла: подтверждённые решения владельца → exact component/pattern rules → manual package → raw/generated для наблюдаемой структуры.

## Публичная граница

Публичный root только один:

- `CardImage` — `e0b688215640e6280ff9effdbf880ccf248cc65a`.

Технические `🔩 CardItem`, `🔩 Cover`, `🔩 Shadow`, `🔩 SilverLine`, `🔩 State` и `🔩 UserData` принадлежат внутренней композиции, отдельно не вставляются и не detaching.

Компонент универсальный: отдельные desktop/mobile roots и D/M-паритет отсутствуют. CardImage не интерактивен; действия и Loading/Error/Empty принадлежат host-компоненту.

## Основной контракт

- `Size`: `264x164`, `212x132`, `68x42`, `44x28`, `24x16`; только фиксированные размеры без ручного resize.
- `State`: `Active`, `Inactive`, `Locked`; `24x16` поддерживает только `Active`.
- `Stack=True`: только `68x42`, `44x28`, `24x16`, минимум две карты, всегда `Active`.
- `Cover`: три штатные рубашки Альфы и `None` как fallback/custom-cover base.
- `Show Shadow`: опционален у одиночной XL/L/M/S, обязателен у Stack M/S, отсутствует у XS.
- Имя владельца: только XL, uppercase, одна строка с ellipsis.
- Последние четыре цифры: XL/L/M, только в маскированном формате `·· 1234`.
- `SilverLine`: complex для XL/L, simple для M/S, hidden для XS.

## Собственная рубашка

Карты других банков и альтернативные дизайны Альфы поддерживаются без detach:

1. Установи `Cover=None`.
2. В существующем `Details/CardCover / Image Container` добавь новый `Image` fill первым в списке fills.
3. Для карты другого банка обязательно скрой `SilverLine`.
4. Для альтернативной рубашки Альфы скрой `SilverLine`, если полоса уже встроена в изображение или конфликтует с ним.

Это узкое исключение не разрешает добавлять слои, менять структуру, геометрию, радиусы, логотип, платёжную систему или state overlays.

## Ограничения

- Компонент не покрывает состояние доставки карты.
- Сценарий «Добавить новую карту» собирается другим компонентом.
- В runtime изображение выбирается по `cardId` согласно Figma-документации, но точный package/import и Code Connect mapping не подтверждены.
- `Cover=None` — fallback рубашки, а не loading-состояние.

## Известный пробел generated-слоя

Live Figma содержит component properties `Show Shadow`, `Show UserData`, `Show SilverLine`, текст имени и instance swap иконки состояния. Текущий `contract.generated.json` и compact manifest отражают только variants и теряют эти свойства. Manual-секции фиксируют их семантику, но generated-файлы вручную не исправляются.

## Файлы

- `contract.generated.json` — generated baseline Athena; вручную не редактируется.
- `contract.overrides.json` — публичная граница, semantics properties, разрешённые overrides и reset model.
- `composition-contract.json` — ownership внутренних частей и effective baseline.
- `rules.json` — exact component rules для Apollo и агента.
- `agent-context.json` — компактный смысл, evidence policy и anti-hallucination instructions.
- `audit-mapping.json` — ручная классификация content/custom-cover diffs и ограничения runtime.
- `examples.json` — positive, negative и context-dependent regression cases.

## Проверка

```bash
node .codex/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/web-corp/CardImage"
```

Targeted Athena checks запускаются только для `web/components/web-corp/Web _ Corp Components -- CardImage.json`.
