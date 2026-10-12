# Link r4 — исправление чтения публичных иконок

Актуальный пакет: `../../Link.component-contract.zip`. Editor 0.2.103, общий
core 0.1.17; явный `declaredTargetConfigurationVersion=2`, identity policy v3.
Все 18 норм, API, ограничения и статусы Draft сохранены из r3. Изменены только
техническая версия и configuration pins всех четырёх native Size.

Reference projection выделяет только явно разрешённый внешний swap-слот,
подтверждённый source address, owner, типом INSTANCE и точным публичным портом.
Выбранный asset и его внутренности не определяют identity слота. Host structure,
native cardinality и собственные ограничения высоты/типографики/layout остаются
проверяемыми. Старый opt-in v1 сохраняет прежние hash и replay semantics.

Локальная проверка: core 333/333, Editor 829/829; Apollo v4 и root проверены
обычным validate. 27 прежних r3 Engine/Editor результатов воспроизводятся точно;
нарушения сохраняются. На двух последних retained captures candidate r4 даёт
8 resolved / 0 inconclusive / 0 violations; восемь counterfactual проверок
подтверждают ошибки размеров, fontSize и gap. Это offline replay, свежая native
проверка новой сборки ещё не выполнена.

Следующие действия: [короткий тест](TEST_CASES.r4.ru.md). Полный контракт
остаётся Draft: отдельные source/context/dependency и независимые gates открыты.
Предыдущий ZIP сохранён в `../../history`.

Evidence: `../reports/reading-fixes/public-instance-swap-2026-10-11/HANDOFF.json`.
