# Apollo component authoring

Этот репозиторий хранит raw-каталоги Figma, component packages, паттерны и runtime-индексы Apollo.

## Обязательный контекст

Перед работой с компонентным комплектом прочитай:

- `AGENTIC_FILES.md` — назначение и ownership документов;
- `COMPONENT_AUTHORING.md` — командный workflow;
- raw-каталог компонента;
- существующий package компонента;
- связанные документы из `patterns/`.

Для наполнения или ревью corp-компонента используй skill `/corp-component-authoring`.

## Источники истины

Используй источники в таком порядке:

1. Явно подтверждённое решение владельца компонента.
2. Exact component rule или точная нормативная формулировка паттерна.
3. Manual-секции component package.
4. Raw-каталог и `contract.generated.json` — только для наблюдаемых фактов Figma.
5. `examples.json` — иллюстрация, а не самостоятельное правило.

Не выводи продуктовую семантику из названия слоя, варианта, токена или примера. Не превращай рекомендацию в запрет.

## Рабочий режим

- Задавай вопросы владельцу компонента группами не более пяти.
- Отделяй подтверждённые правила от предположений и открытых вопросов.
- Пиши документы на русском; имена компонентов, properties, variants, tokens и другие технические термины сохраняй без перевода.
- Обрабатывай один компонент или одно связанное семейство в одной ветке и одном PR.
- Не меняй статус на `ready` без ручного подтверждения владельца компонента.
- Не выполняй commit, push, merge или публикацию без явного запроса.

## Ownership

Athena владеет:

- raw-каталогами;
- `indexes/**/*.index.json`;
- `contract.generated.json`;
- секциями `generated` hybrid-документов;
- `referenceSourcesMVP.json`;
- `componentContractIndex.json`;
- Apollo registries.

Дизайнер и AI-ассистент могут редактировать:

- секции `manual` в `rules.json`, `composition-contract.json`, `agent-context.json`, `audit-mapping.json`, `contract.overrides.json` и `examples.json`;
- package `README.md`;
- связанные документы в `patterns/`.

Не редактируй generated-секции вручную. Ошибку generated-данных исправляй через raw-каталог или Athena CLI.

## Проверка

После изменения component package выполни:

```bash
node .claude/skills/corp-component-authoring/scripts/validate-component-package.mjs \
  "JSONS/web/components/<group>/<ComponentName>"
```

Targeted Athena checks выполняй только для текущего raw-каталога. Не запускай полную синхронизацию всего дерева ради одного компонента.
