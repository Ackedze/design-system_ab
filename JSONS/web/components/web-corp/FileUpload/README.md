# FileUpload

Комплект машиночитаемых документов компонента FileUpload из библиотеки `Web _ Corp Components`.

## Источник

- Raw-каталог: `../Web _ Corp Components -- FileUpload.json`
- Платформы: desktop, mobile-web
- Канал: b2b
- Публичные компоненты: `[D] FileUpload`, `[M] FileUpload`
- `[D] Attach` и `[M] Attach` являются служебными частями и не используются отдельно.
- Детальные правила `FileUploadItem` должны быть описаны в отдельном компонентном пакете.

## Документы

- `contract.generated.json` — автоматически сгенерированные Athena варианты, структура, ключи и базовые свойства компонентов.
- `contract.overrides.json` — ручная семантика состояний, платформ, лимитов, публичной границы и допустимых override.
- `composition-contract.json` — effective baseline вложенных компонентов и правила композиции FileUpload.
- `rules.json` — exact component rules для Apollo и агента.
- `audit-mapping.json` — классификация отклонений и контекст их отображения в отчёте Apollo.
- `agent-context.json` — компактный контекст для интерпретации отчёта агентом.
- `examples.json` — валидные и ошибочные сценарии с ожидаемым результатом аудита.
- `README.md` — назначение и состав комплекта.

Компонентный паттерн расположен в `patterns/p_file-upload.md`.

## Ownership

Документы используют `apollo.artifact-ownership.v2`:

- `generated` формируется Athena CLI;
- `manual` заполняется авторами дизайн-системы;
- runtime-индексы и registry собираются Athena из актуального комплекта.

Raw-каталог и `contract.generated.json` не редактируются вручную. Повторная генерация не должна удалять секции `manual`.

## Runtime

Apollo получает пакет через `componentContractIndex.json`, а exact rules — через `apollo-rules-registry.json`. После изменения документов необходимо выполнить:

```bash
npm run contracts:sync-apollo -- --catalog-path "web/components/web-corp/Web _ Corp Components -- FileUpload.json"
npm run contracts:check-apollo -- --catalog-path "web/components/web-corp/Web _ Corp Components -- FileUpload.json"
```

## Готовность

Статус комплекта: `Ready`.

Внутренние presets и состояния `FileUploadItem` не должны трактоваться агентом без отдельного пакета документов этого компонента.
