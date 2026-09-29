# Amount — handoff правил применения

`rules.manual.json` сохраняет два существующих Athena RuleID и точные формулировки
AB-запретов opacity. Владелец — продуктовая политика `ab`, не универсальный Amount.
Смысловая связь с Hub: `rule:components.amount.no-opacity` (два технических ID →
одно человекочитаемое правило); новый параллельный RuleID не создаётся.

Это **не готовый PatternContract**: `runtime.status=not-connected`, published=false.
Не импортировать в ComponentContract Editor и не использовать как будто правило
уже исполняется новым runtime. Старые production правила не удалены/не изменены.
Полные исходные правила вместе с predicateContour закреплены в
`../../web-core/core/Amount/authoring/sources/design-system_ab/JSONS/web/components/web-core/core/Amount/rules.json`.

Дальше: отдельный pattern authoring, явный продуктовый scope, сохранение обеих
проверок (layer opacity и component property), PASS/FAIL tests и осознанная миграция
production ownership. Форматирование сумм, контекст цвета и внешний период тоже
не переносятся в Core Amount автоматически.
