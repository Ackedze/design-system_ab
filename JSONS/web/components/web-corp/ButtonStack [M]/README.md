# ButtonStack [M]

Комплект машиночитаемых документов Figma-only пресета нижней зоны действий mobile-web из библиотеки `Web _ Corp Components`.

## Источник

- Raw-каталог: `../Web _ Corp Components -- ButtonStack [M].json`.
- Figma fileKey: `NrzEFUSTXgzOUmsfYym0xD`.
- Страница: `1215:82248` (`ButtonStack [M]`).
- Public root: `🔒 [M] ButtonStack`.
- Component set key: `1e9261fa9df082fa82b6ec3b42b429797f906cd9`.
- Платформа: mobile-web.
- Канал: b2b.

Raw и `contract.generated.json` подтверждают структуру, варианты и keys. Product semantics подтверждены владельцем и записаны только в manual-секциях.

## Назначение

ButtonStack — абсолютная нижняя зона действий mobile-web:

- располагается у нижнего края экрана с `bottom=0`;
- не прокручивается вместе с контентом;
- требует зарезервированного места в содержимом страницы;
- занимает всю ширину mobile-контейнера;
- использует фиксированные композиции одной или двух кнопок.

Знак `🔒` означает Figma-only preset. Отдельного runtime-компонента и Code Connect mapping для корня не требуется; вложенные `[M] Button` реализуются своими runtime-компонентами.

## Presets

| Presets | Композиция |
|---|---|
| `Primary` | Одна Primary-кнопка |
| `Secondary` | Одна Secondary-кнопка |
| `Group Horizontal` | Secondary слева, Primary справа; равные ширины |
| `Group Vertical` | Primary сверху, Secondary снизу; обе Fill |
| `Primary + Icon` | Primary занимает остаток ширины, icon-only действие справа |

Горизонтальная группа допустима только для однострочных labels. Иначе используется `Group Vertical`.

## Опциональная настройка

Над действиями может находиться `CheckboxLabel_24` с контекстной опцией:

- label редактируется;
- рекомендуемый предел — 80 символов и две строки, если актуальный Checkbox contract не задаёт другое;
- `DisabledLabel`, `ErrorMessage` и `Hint` не используются;
- допускается опциональный `StatusBadge View=NeutralInformation` с information-иконкой;
- связь checkbox с доступностью Primary определяется контекстом.

## Background

`Background=False` и `Background=True` доступны. Сценарное правило выбора пока не подтверждено. Это открытый вопрос `Q-001`, который не блокирует готовность пакета. Агент не должен придумывать обязательное значение.

## Документы

- `contract.generated.json` — generated variants, keys, structure и baseline.
- `contract.overrides.json` — public boundary, semantics свойств и reset model.
- `composition-contract.json` — ownership вложенных Button/Checkbox и effective baseline.
- `rules.json` — exact rules для Apollo и агента.
- `audit-mapping.json` — классификация diff и ограничения текущего runtime.
- `agent-context.json` — компактный смысловой контекст и anti-hallucination guidance.
- `examples.json` — positive, negative и contextual regression cases.
- `README.md` — назначение, источники и статус комплекта.

## Ownership

Документы используют `apollo.artifact-ownership.v2`:

- `generated` обновляет Athena;
- `manual` обновляют авторы дизайн-системы;
- raw, `contract.generated.json`, indexes и registries вручную не редактируются.

## Проверка

```bash
node .codex/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/web-corp/ButtonStack [M]"
```

Targeted Athena checks выполняются по каталогу:

`web/components/web-corp/Web _ Corp Components -- ButtonStack [M].json`

## Статус

**Ready.** Manual-семантика подтверждена владельцем AB-слоя 2026-07-29. Package validator, targeted checks и сверка корректного и ошибочного кейсов пройдены. Открытый вопрос о выборе `Background=True` или `Background=False` зафиксирован отдельно и по решению владельца не блокирует Ready.
