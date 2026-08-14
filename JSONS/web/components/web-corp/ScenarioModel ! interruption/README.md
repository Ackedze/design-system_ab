# ScenarioModel ! interruption

Component package семейства **Web _ Corp Components / ScenarioModel ! interruption** для Apollo, Athena CLI и agentic pipeline.

## Статус

**In progress**. Публичная граница, lifecycle, платформенная применимость, anatomy, content, visual, interaction и runtime intent подтверждены владельцем AB-слоя 2026-08-13. Package validator проходит без ошибок и предупреждений. До общего статуса `Ready` остаётся ручная проверка корректного, нарушающего и допустимого customization-кейсов в Figma/Apollo; её выполнит владелец AB-слоя.

## Назначение

`🔒 ScenarioModel ! interruption` — Figma-only desktop-пресет для предупреждения о прерывании незавершённого сценария, когда пользователь действительно рискует потерять данные или изменения.

Компонент полностью наследует [`ptrn:flow.interruption-scenario`](../../../patterns/p_interruption-scenario.md): паттерн определяет условия показа, тексты, действия, автосохранение и mobile-web альтернативу.

## Публичная граница

- `🔒 ScenarioModel ! interruption` — единственный public root, разрешённый для генерации.
- `🔒 ModalDesktopHeader ! interruption`, `🔒 ModalDesktopBody ! interruption` и `🔒 ModalDesktopFooter ! interruption` — служебные секции; отдельно не используются.
- `❌ ScenarioModel ! interruption` — deprecated root; в новых макетах запрещён и заменяется активным public root.
- Пресет предназначен только для desktop. На mobile-web используй `PopUpSheet` по паттерну прерывания сценария.
- Это Figma-only пресет без реализации в коде; Code Connect неприменим.
- Public root уже является готовой модальной поверхностью и не требует дополнительного Modal-контейнера.

## Семантика Type

- `Default` — выход без сохранения: короткое последствие и действия `Выйти` / `Остаться`.
- `SaveAs` — сохранение перед выходом: последствие, опциональный чекбокс `Запомнить выбор` и действия `Сохранить и выйти` / `Выйти без сохранения`.
- Header, Body и Footer внутри public root всегда используют одинаковый `Type`.
- Исходное состояние — `Default`. У public root нет собственного `Type`: генератор переключает это свойство синхронно у трёх вложенных секций.

## Anatomy и кастомизация

- Header, Body и Footer обязательны; скрывать или удалять секции нельзя.
- Крестик в Header обязателен. Он отменяет прерывание и возвращает пользователя в текущий сценарий, как действие `Остаться`.
- В текстах разрешено менять только placeholder-фрагменты, заключённые в `[]`; остальной текст и подписи кнопок фиксированы.
- Placeholder допускают другие действия и сущности: конструкция `Придётся [создавать]+[сущность] / [вносить изменения] заново` адаптируется к контексту появления модального окна и сохраняет грамматическое согласование. Например: `Придётся создавать платёж заново` или `Придётся редактировать заявку заново`.
- Для `SaveAs` действуют шаблоны `Сохранить [сущность]?` и `Вы сможете вернуться к [ней] позже`; подписи кнопок фиксированы.
- Чекбокс `Запомнить выбор` в `SaveAs` опционален: текст фиксирован, по умолчанию чекбокс скрыт, при отображении — не выбран. Видимый или предвыбранный initial state даёт `warning`; сохранённый выбор должен быть обратимым.
- Отдельных loading и error состояний у пресета нет.
- Footer всегда содержит две кнопки. Для `Default`: Primary `Выйти`, затем Secondary `Остаться`; для `SaveAs`: Primary `Сохранить и выйти`, затем Secondary `Выйти без сохранения`.
- Клик вне модального окна и `Escape`, если продукт их поддерживает, работают как крестик и `Остаться` — отменяют прерывание.
- Внешнюю ширину и sizing менять запрещено; высота растёт только вслед за контентом.
- Специальных лимитов символов или строк нет; действует требование краткости из паттерна.

## Рецепт текстов

Machine-readable рецепт: `recipe:web-corp.scenario-model-interruption.texts` в `contract.overrides.json` и `agent-context.json`.

- `Default`: фиксированный заголовок `Выйти без сохранения?`; последствия `Придётся [создавать] [сущность] заново` или `Придётся [вносить изменения] заново`; действия `Выйти` / `Остаться`.
- `SaveAs`: `Сохранить [сущность]?`; `Вы сможете вернуться к [ней] позже`; действия `Сохранить и выйти` / `Выйти без сохранения`.
- Изменение заголовка `Default` или несоответствие конструкции текста — `error`.
- Запрещены instance swap, изменение состава секций, типов и стилей кнопок, layout, отступов, цветов и типографики.

## Источники

- Raw-каталог: `../Web _ Corp Components -- ScenarioModel ! interruption.json`.
- Generated baseline: `contract.generated.json`.
- Сценарная семантика: `patterns/p_interruption-scenario.md`.
- Подтверждение владельца: сессия authoring от `2026-08-13`.

Raw и generated-файлы подтверждают структуру, variants и effective baseline, но не являются самостоятельным доказательством продуктовой семантики.

## Состав пакета

- `contract.generated.json` — generated baseline Athena; вручную не редактируется.
- `contract.overrides.json` — public boundary, lifecycle и семантика variants.
- `composition-contract.json` — ownership служебных секций и effective baseline.
- `rules.json` — exact component rules и ссылки на правила паттерна.
- `examples.json` — regression-кейсы для Apollo и агента.
- `agent-context.json` — назначение, critical baselines и anti-hallucination guidance.
- `audit-mapping.json` — generated audit classification и manual-границы deterministic, LLM и runtime-проверок.
