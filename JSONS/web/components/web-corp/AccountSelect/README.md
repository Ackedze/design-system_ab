# AccountSelect

Комплект машиночитаемых документов компонента AccountSelect из библиотеки `Web _ Corp Components`.

## Источник

- Raw-каталог: `../Web _ Corp Components -- AccountSelect.json`
- Платформы: desktop, mobile-web
- Канал: b2b
- Публичные компоненты: `[D] AccountOptionListContent`, `[M] AccountOptionListContent`
- Остальные компоненты семейства являются служебными и не используются отдельно.

## Документы

- `contract.generated.json` — автоматически сгенерированные Athena варианты, структура, ключи и базовые свойства компонентов.
- `contract.overrides.json` — ручная семантика, публичная граница, состояния, платформенные контейнеры и допустимые композиции.
- `composition-contract.json` — effective baseline вложенных компонентов и правила сборки AccountSelect.
- `rules.json` — exact component rules для Apollo и агента.
- `audit-mapping.json` — классификация отклонений и контекст их отображения в отчёте Apollo.
- `agent-context.json` — компактный контекст для интерпретации отчёта агентом.
- `examples.json` — валидные и ошибочные сценарии с ожидаемым результатом аудита.
- `README.md` — назначение и состав комплекта.

Компонентный паттерн расположен в `patterns/p_account-select.md`.

## Ownership

Документы используют `apollo.artifact-ownership.v2`:

- `generated` формируется Athena CLI;
- `manual` заполняется авторами дизайн-системы;
- runtime-индексы и registry собираются Athena из актуального комплекта.

Raw-каталог и `contract.generated.json` не редактируются вручную. Повторная генерация не должна удалять секции `manual`.

## Runtime

Apollo получает пакет через `componentContractIndex.json`, а exact rules — через `apollo-rules-registry.json`. После изменения документов необходимо выполнить:

```bash
npm run contracts:sync-apollo -- --catalog-path "web/components/web-corp/Web _ Corp Components -- AccountSelect.json"
npm run contracts:check-apollo -- --catalog-path "web/components/web-corp/Web _ Corp Components -- AccountSelect.json"
```

## Готовность

Статус комплекта: `Ready`.

Loading-state и семантика `StatusBadge` пока не регламентированы. Это явно зафиксированные ограничения текущей версии и не должны интерпретироваться агентом как нарушения.
