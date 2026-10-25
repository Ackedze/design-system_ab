# IconButton r2 — восстановление из Athena

[Пакет](../../packages/IconButton.r2.draft.component-contract.zip) · [Manual](../../contract.manual.json) · [Проверки](test-cases.json)

Нужные данные уже были в сохранённых Athena REST-снимках. Новая выгрузка Figma не выполнялась.
Восстановлена проекция существующим normalizer/converter; их рабочий код, Core и Proxy не менялись.

Публичных вариантов: 160. Исполняемых IR: 22. Compile/ZIP-reopen и целевые synthetic IR проверки прошли.
Старые r1 отчёты и пакет сохранены без изменений. Причина исправления — [source-correction.json](source-correction.json).

Источник: историческая версия 2383886194780301611 от 04.08.2026. Это не свежая native-приёмка.
Статус — Draft. Остаётся установленный Figma-прогон новых bindings/условий. Экземпляры новых кейсов ещё не созданы.
