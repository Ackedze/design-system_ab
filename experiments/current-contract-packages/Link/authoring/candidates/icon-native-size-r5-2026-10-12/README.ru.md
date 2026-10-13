# Link r5 — проверка размера выбранной иконки

Это отдельный Draft candidate. Рабочий корневой Link r4, общие core/Editor,
registry, сборки, конфигурация и контракты пилота не изменялись.

Источник уже задаёт соответствие: обычный S — icon16, специальный S — icon20,
M/L — icon24. В r4 это соответствие было описано в policy и документации,
но не имело собственного predicate. Проверка `bounds.height ≤ line-height`
сохраняет свой смысл: она не устанавливает размер выбранного asset.

R5 добавляет по три условных проверки `component.properties.Size` для каждой
стороны. Условия читают Size Link и BOOLEAN Addon у корня. Native VARIANT
значения остаются строками: `16`/`20`/`24`; `s`/`m` подтверждены отдельными
native references как 16/24. Эти алиасы не являются общим правилом всех
компонентов. Содержимое и категория внешнего asset по-прежнему относятся к
сквозному контракту иконок; missing Size даёт UNKNOWN.

На четырёх фактических r4 captures candidate даёт 0/1/0/0 нарушений. Второй
снимок содержит rocket Size=20 при активном слоте24 и получает
`component:web-core.link.left-icon-native-size.24.1.1`. Все 8 целей resolved,
inconclusive=0; три context-only нормы сохранены. Прежние 18 manual rules и
32 RuleIR не изменились; добавлены 6 conditional rules / 6 IR. Core ZIP reopen
и parity с Editor reader проходят. Новый installed r5 ещё не проверен.

Правила, coverage, вопросы и eval имеют отдельные candidate paths. В таблице
учёта добавлены строки Правила1910–1915, Леджер504; Predicate Link остаётся Draft.
Глобальный crosswalk и рабочие manifests не менялись; section mapping сохранён
в candidate/crosswalk.json для отдельного применения вне пилота.

Предыдущий ручной шаг H=40 отозван: владелец подтвердил, что без detach он
недоступен. Отрицательный кейс использует публичный выбор размера asset.
Проверка: NEXT_TESTS.ru.md. Полный контракт остаётся Draft.
