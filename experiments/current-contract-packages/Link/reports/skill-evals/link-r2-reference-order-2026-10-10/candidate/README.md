# Link r2 — standalone Draft

Актуальный пакет: `../../Link.component-contract.zip`. Один универсальный Figma set, четыре Size, восемь целей с отдельными native bindings для каждого варианта. Паспорт, публичные BOOLEAN/TEXT/INSTANCE_SWAP/VARIANT и поля правил заполнены автоматически по источникам.

18 source rules → 32 IR: 10 predicate, 5 policy-only, 3 context-only. Полная карта источников и маршрутов — [coverage-map.json](coverage-map.json). Сохранены обе исходные Athena-нормы, пять Hub-документов и 15 RuleID desktop-паттерна. Число IR не означает полную исполнимость всех исходных норм.

Сборка валидна, manual/compiled/variant facts переживают ZIP import/export/reopen без изменений. 32 локальных native-derived counterfactual сценария проходят, включая положительный контроль, отрицательную мутацию, восстановление, числовую границу и UNKNOWN. Обычный runtime сохраняет Draft gate: 32 not-evaluable. Технический eval выполнен также helper нового навыка по текущим исходникам core; его compiled совпадает с рабочим.

Три отчёта установленного Editor 0.2.98 для r1 подтвердили ошибку подготовки reference pin: capture host и Editor по-разному отсортировали пути с разным регистром. Все восемь целей получили `reference-pin-stale`; 31 IR оказался inconclusive. В r2 порядок pinned projection приведён к shared-core runtime, без изменения норм и исходных native captures. [Переигрывание тех же снимков](reports/editor-report-replay.r2.json) даёт 0 нарушений для LINK-03, одно для Gap=11 в LINK-09 и одно для fontSize=18 в LINK-12. Это локальный replay; установленный Editor с r2 и ручные RESET ещё **NOT_RUN_USER_ONLY**.

В лаборатории создано 16 карточек: 15 подготовлены, LINK-13 помечен fixture pending — Plugin API удерживает высоту вложенной иконки 24dp. Синтетическая проверка нарушения >line-height проходит, но это не заменяет живой кейс. Начни с [таблицы тестов](TEST_CASES.ru.md).

Открыты четыре расхождения источников: Custom отсутствует в native API, default Size S вместо M, оба default Addon=true вместо false, исключение для Line=None расходится с desktop-паттерном. Точная матрица токенов View и сквозная проверка icon asset также не закрыты. Вопросы — [owner-questions.r1.json](reports/owner-questions.r1.json). None/inline и редакционная семантика не превращены в фиктивные Figma-предикаты.

Контракт BenefitCard r5 не изменён. Его лимит 32 символа / одна строка остаётся нормой родителя. Pin Link добавим в BenefitCard после приёмки соответствующей области. Следующие зависимые контракты: IconView, BackgroundPlate; отдельная сквозная политика иконок.

Синхронизированы и повторно прочитаны 18 строк «Правила», четыре строки «Леджер» и Predicate Link в Google. Статус остаётся Draft.

Воспроизведение: `node build.cjs`, затем `node verify.cjs` и `node replay-editor-reports.cjs`. Build проверяет source SHA и не перепривязывает изменившиеся источники молча. Reference projection сортируется в runtime shared core; raw capture остаётся точным исходным evidence. Исторический generated JSON хранится в ZIP как `.reference.txt`, чтобы importer не заменил свежую native anatomy старой проекцией. Не импортируй его как активные факты поверх этого пакета.

Результат применения `apollo-contract-authoring` v0.1.3: [текущий eval](../reports/skill-evals/link-r2-reference-order-2026-10-10/eval.json). [Исторический eval r1](../reports/skill-evals/link-r1-2026-10-10/eval.json) сохранён. Overall PARTIAL, независимого reviewer нет. Ready, release и приёмка installed r2 не заявлены.
