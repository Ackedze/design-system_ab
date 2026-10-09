# ButtonsGroup desktop r60

Локальный Figma-контракт: 17 Reviewed правил, 30 predicate checks, 0 nonExecutable.
Compiled status Ready относится к этой области; code/frontend, полная матрица
размеров, Generation pins и publication имеют отдельную приёмку.

По решению владельца девять контекстных норм сохранены в
[context/recipe-rules.json](context/recipe-rules.json) с прежними RuleID и текстом.
Они описывают приоритет действий, перенос в Overflow, состав меню, соответствие
действий, Disabled/Tooltip и закрытие списка. Уникальность относится к action
identity: одинаковые labels не доказывают дубль. Frontend implementation не
проверена этой редакцией.

Loading дочерних Button исполняется по direct-child зависимости Button r31,
включающей Spinner r8. Сохранение ширины требует двух последовательных снимков
одного instance/context; состояние группы Loading не вводится. Наличие Loading
у OptionListCell принадлежит его API/контракту.

Исходные 30 predicate bodies, Figma facts, ограничения, статусы оставшихся
правил и exact dependency pins сохранены. Один пример про action identity
перенесён вместе с соответствующей нормой. История r59 находится в history.
Реестр Google обновлён и проверен чтением 09.10.2026; общий Predicate остаётся Draft.
