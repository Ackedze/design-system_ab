# BenefitCard r5

Рабочий manual-first пакет по решениям владельца от 09.10.2026. **Draft**: 21 исходное правило, 37 IR, четыре неисполняемые нормы. Editor 0.2.95 / core 0.1.14.

Обязательные Title и Graphic разделены; запрещён instance swap вне Bottom. Добавлены ограничения текста, ImageView, Compact/Title, viewport, одиночного Hug, LEFT и visual baseline. BackgroundPlate позволяет менять только Type; обязательность paint bindings исполняется, полный библиотечный allowlist и дочерний baseline требуют его контракта.

Рецепты интерактивности, loading, contextual Compact и группы сохранены в context/recipe-rules.json. Рекомендация Secondary и описание Background — в context/guidance.json. Удалённые нормы и связь прежних/новых RuleID отражены в reports/owner-decisions.r4.json. Сквозная проверка иконок — отдельный draft, не локальные правила карточки.

32 native variants, 9 targets, 256 bindings. Все прежние 96 bindings сохранены. Исторические 46 counterfactual проверок r4 D/M прошли; это проверка механизмов на native reference, не полная live-приёмка. Native default D/M возвращает нарушение Hug: эталоны FIXED. Ещё 8 desktop Compact=True содержат Title=Primary вместо Secondary. reports/library-drift.r4.json хранит расхождения.

Неисполняемые пункты: текстовые настройки Link, лимиты Link 32/1, настройки IconView и standalone admission внутренних частей. Нужны точные дочерние контракты и новые живые прогоны. Остальные неполные области: токены разрешённой библиотеки, continuity при смене Type/child variant и общие иконки. Полный список — reports/gaps.json.

Primary source — contract.manual.json; compiled projection, coverage и validation-report получены компилятором. benefit-card/source содержит read-only исторические каталоги/нормы, не текущий нормативный manual. Source.importedFiles сохраняет происхождение экспорта. context/hub — подготовленная изолированная проекция Hub; она не означает merge канонического Hub. Предыдущий ZIP сохранён в history.

Перед новым прогоном перезапусти Editor 0.2.95, загрузи текущий ZIP и задай ViewportClass по ширине экрана и CardPlacement. Сначала PASS, затем одно нарушение за раз. Порядок: reports/live-checklist.md. Draft source используется через authoring preview; статус Reviewed не проставлялся автоматически.

Техническая редакция r5 включает declaredTargetIdentityVersion=3. Независимо подтверждённая смена native variant сохраняет чтение корня occurrence и исходный baseline запрещённых настроек. Graphic=Icon исключает ImageView-проверки; доказанный Background=False исключает surface checks. Источник, owner, hashes и полнота capture обязательны; descendants нового variant сохраняют собственные требования к proof. Нормы, разрешения, targets и 256 bindings r4 не менялись.

Повторный живой прогон: BC4-307–312, BC4-319/320, BC4-V02/V25, контроль BC4-317/318. Борд и номера кейсов прежние. В Editor должна быть версия 0.2.95, в отчёте manualRevision=5. Укажи ViewportClass по платформе и CardPlacement=single. Сначала перезапусти плагин, затем загрузи новый ZIP. Исторические live receipts r4 не подтверждают новую сборку.
