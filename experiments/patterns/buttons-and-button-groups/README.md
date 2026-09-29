# Buttons and button groups — ручной источник будущего паттерна

Статус: **Draft, runtime не подключён**. Это место хранения перенесённых знаний,
а не завершённый PatternContract, новый движок или пакет для ComponentContract Editor.

## Источник истины

[rules.manual.json](rules.manual.json) — единственный текущий редактируемый источник
пяти правил применения, перенесённых из Button r24 в ходе сборки Button r25.
Существующий формат записей ManualRule сохранён без изменения ID, условий,
ограничений, severity и статусов. Обёртка `apollo.pattern-rule-handoff.v1` служит
только учёту переноса; пока у неё нет compiler/runtime-адаптера.

Префикс старого RuleID `component:web-core.button.*` сохранён ради трассировки.
Он не определяет владельца. Контейнер паттерна —
`ptrn:controls.buttons-and-button-groups`; точная ответственность каждой записи
остаётся в `ownership`: product-policy, pattern или editorial-policy.

| Суффикс существующего RuleID | Сохранённое требование / решение |
|---|---|
| `desktop-hint-restricted` | Подтверждённый запрет видимого Hint в desktop для Product=ab |
| `desktop-safe-variants` | Ссылка на ограничения View/Size/Shape продуктового паттерна; область требует подтверждения |
| `mobile-hint-only-size-56` | Продуктовое сужение Hint до Size=56; область требует подтверждения |
| `button-group-pattern-delegated` | Делегация количества, порядка, приоритета и размещения кнопок |
| `text-follows-editorial-pattern` | Ссылка на общую редакционную политику; её собственные правила сюда не копируются |

`ab` и `alfa-business` намеренно не склеены. Перенос не подтверждает спорные
ограничения, не заполняет отсутствующие значения desktop-safe-variants и не делает
draft-правила reviewed. `execution` внутри записей сохраняет исходный маршрут,
но **не означает, что сейчас правило исполняется**: `runtime.status=not-connected`.

Два `controlPorts` и два продуктовых решения перенесены вместе с правилами.
`componentBinding` ссылается на semantic targets/API Button, не копируя anatomy,
Figma facts или контракт Spinner. Binding будущего паттерна ещё предстоит оформить.
`sourceRefs` ведут на read-only evidence; Hub пока не перегенерирован.

## Граница с Button

В [Button manual](../../web-core/core/Button/contract.manual.json) этих пяти правил,
их делегаций и заглушек «Не выполнено» больше нет. Там остаются intrinsic API,
Hint/Size, SingleIcon, Loading, размер/палитра Spinner и локальные ограничения слотов.

Button r25 проверяет только компонент. Отсутствие продуктового finding не означает
разрешения Hint политикой Альфа-Бизнес. Полнота применения не проверяется до
подключения соответствующего паттерна.

Сборщик Button проверяет [реестр переноса](../../web-core/core/Button/migrations/usage-rules-r25.json):
каждый перенесённый ID должен существовать здесь и отсутствовать в component manual.
Потеря, двойное владение и неожиданный owner останавливают сборку.
Производный [crosswalk](../../web-core/core/Button/reports/rule-crosswalk.json)
содержит пути и SHA источника, но не вторую нормативную копию правил.
Исторический r24 и исходные live-отчёты неизменяемы и не являются активными источниками.

## Следующий этап — отдельная работа над паттерном

- Подтвердить продуктовый scope и конкретные ограничения desktop/mobile.
- Определить binding паттерна к component API, группе и внешнему контексту.
- Подключить authoring и общий compiler core; использовать существующий Predicate Engine.
- Вынести декларации применения редакционной политики в ссылки на её владельца,
  не плодя копии редакционных норм.
- Проверить отсутствие двойного исполнения, missing/unknown policies, продуктовые
  позитивные/негативные кейсы; только затем подключать runtime и Hub-проекции.

Не импортировать `rules.manual.json` как ComponentContract. Для проверки самого
Button используется только [Button.editor-input.zip](../../web-core/core/Button/editor/Button.editor-input.zip).
