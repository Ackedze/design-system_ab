# BenefitCard r4

Рабочий manual-first пакет по решениям владельца от 09.10.2026. **Draft**: 21 исходное правило, 37 IR, четыре неисполняемые нормы. Editor 0.2.94 / core 0.1.13.

Обязательные Title и Graphic разделены; запрещён instance swap вне Bottom. Добавлены ограничения текста, ImageView, Compact/Title, viewport, одиночного Hug, LEFT и visual baseline. BackgroundPlate позволяет менять только Type; обязательность paint bindings исполняется, полный библиотечный allowlist и дочерний baseline требуют его контракта.

Рецепты интерактивности, loading, contextual Compact и группы сохранены в context/recipe-rules.json. Рекомендация Secondary и описание Background — в context/guidance.json. Удалённые нормы и связь прежних/новых RuleID отражены в reports/owner-decisions.r4.json. Сквозная проверка иконок — отдельный draft, не локальные правила карточки.

32 native variants, 9 targets, 256 bindings. Все прежние 96 bindings сохранены. 46 counterfactual проверки D/M прошли; это проверка механизмов на native reference, не полная live-приёмка. Native default D/M возвращает нарушение Hug: эталоны FIXED. Ещё 8 desktop Compact=True содержат Title=Primary вместо Secondary. reports/library-drift.r4.json хранит расхождения.

Неисполняемые пункты: текстовые настройки Link, лимиты Link 32/1, настройки IconView и standalone admission внутренних частей. Нужны точные дочерние контракты и новые живые прогоны. Остальные неполные области: токены разрешённой библиотеки, continuity при смене Type/child variant и общие иконки. Полный список — reports/gaps.json.

Primary source — contract.manual.json; compiled projection, coverage и validation-report получены компилятором. benefit-card/source содержит read-only исторические каталоги/нормы, не текущий нормативный manual. Source.importedFiles сохраняет происхождение экспорта. context/hub — подготовленная изолированная проекция Hub; она не означает merge канонического Hub. Предыдущий ZIP сохранён в history.

Перед новым прогоном перезапусти Editor 0.2.94, загрузи текущий ZIP и задай ViewportClass по ширине экрана и CardPlacement. Сначала PASS, затем одно нарушение за раз. Порядок: reports/live-checklist.md. Draft source используется через authoring preview; статус Reviewed не проставлялся автоматически.
