# Status & Property r2 — исправление native привязок

Draft r2 сохраняет все 28 authoring правил / 27 исходных норм и 15 IR. Добавлены только 8 source addresses владельца Label и 4 адреса TEXT. NativeSourceContinuity v1 проверяет ближайшего native owner и независимый matched lineage; имена слоёв не являются identity. Текущие значения, видимость и baseline не подменяются.

Core source: `cb421242d5bc1455ad43645ed6bfc29bfbecb1e3`. Переносимая среда: `a8cbee5faaa7ee019e99075aabfbf9ff7be6562d5b884324d61c70451406a3ae`. На сохранённых12 снимках все8 ожидаемых нарушений остались,10 human-review SP05–08 исчезли. Отдельный SP09 coverage uncertain=1 остаётся как в исходном отчёте;140 child UNKNOWN/цвет/типографика и11 контекстных норм не входят в этот fix. Core typecheck,116 целевых тестов (18 новых переносимых), ZIP/import/recompile и штатный data consumer прошли. Нового native прогона не было.

Подготовленный data snapshot: `12a4636cda77344e264291ceb81699cb955308e12707ad6b369e5f51b3850c40`. Остальные15 delivered entries и все generation refs точны;216 mapping files и18 других collection rows сохранены. Skills ref не изменён. [Candidate Git index](git-data-index.candidate.json) не активирован: текущий `apollo/data-packages/current.json`, установленный runtime и данные остались прежними.

Применение требует парной установки runtime и данных существующим installer/repack, затем отдельного решения о переключении канала. Обычное Git data update исполняемый runtime не заменяет. Apollo UI/Editor/Proxy/native build не выполнялся. EditorUI/integration и fresh native acceptance не заявлены; весь контракт остаётся Draft/PARTIAL.

Проверяемые экземпляры остаются теми же: [матрица12](../authoring-r1-2026-10-23/README.ru.md). Исторические r1 ZIP, отчёты и seals сохранены; сырые пользовательские отчёты в этой ревизии не добавлены.
