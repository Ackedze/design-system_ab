# BenefitCard r5 · обязательность Title и Graphic

Отрицательная часть подтверждена четырьмя отчётами Editor 0.2.98, 09.10.2026 20:01–20:02 UTC: **4/4 целевых нарушения**, exact engine/Editor replay совпал, human-review=0. В скрытом Title отдельно выявлен пробел coverage-диагностики лимита текста. [Разбор и границы приёмки](composition-visibility-negative-live-review.r5.2026-10-09.md). Подготовленные экземпляры предварительно проверены чтением Figma: корни, публичные ключи и target IDs совпали с планом; корни видимы и сохраняют Hug.

В Editor используй текущий `BenefitCard.component-contract.zip`, manualRevision=5. Для каждого кейса выбери **корневой instance BenefitCard**, режим «Проверить инстанс» и контекст из таблицы. Общий `CardPlacement=single`. Параметры корня Figma уже выставлены: `GraphicPosition=Left`, `CardAxis=Vertical`, `Background=True`, `Compact=False`, высота Hug. Остальные свойства не меняй.

| Кейс | ViewportClass в Editor | Подготовленное изменение Figma | Целевой результат |
| --- | --- | --- | --- |
| [BC4-101](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66653) | `desktop` | Вложенный TEXT Title скрыт | `violation`: `component:web.benefit-card.title-required.1.1` |
| [BC4-102](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66678) | `mobile-web` | Вложенный TEXT Title скрыт | `violation`: `component:web.benefit-card.title-required.1.1` |
| [BC4-103](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66704) | `desktop` | Вложенный instance Graphic скрыт | `violation`: `component:web.benefit-card.graphic-required.1.1` |
| [BC4-104](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13607-66729) | `mobile-web` | Вложенный instance Graphic скрыт | `violation`: `component:web.benefit-card.graphic-required.1.1` |

RESET принят по четырём новым отчётам 10.10.2026 01:06–01:07 по Москве (09.10.2026 22:06–22:07 UTC): оба required checks проходят в каждом кейсе, целевые нарушения исчезли. Новые и прежние отрицательные captures прошли восемь exact engine/Editor replays; native sources, те же physical roots и контекст подтверждены. [Закрытие цикла](composition-visibility-resets-live-review.r5.2026-10-10.md). Таблица ниже сохраняет условия воспроизведения; цикл повторять не требуется.

| Кейс | Действие RESET в Figma | ViewportClass / CardPlacement в Editor | Целевой результат |
| --- | --- | --- | --- |
| BC4-101 | Покажи вложенный TEXT `value` внутри `ContentWrapper / Content / Content / Title` | `desktop` / `single` | Title required — compliant, видимый count=1 |
| BC4-102 | Покажи вложенный TEXT `value` внутри `ContentWrapper / Content / Content / Title` | `mobile-web` / `single` | Title required — compliant, видимый count=1 |
| BC4-103 | Покажи вложенный instance `[D] Graphic` внутри `GraphicContainer` | `desktop` / `single` | Graphic required — compliant, видимый count=1 |
| BC4-104 | Покажи вложенный instance `[M] Graphic` внутри `GraphicContainer` | `mobile-web` / `single` | Graphic required — compliant, видимый count=1 |

Сводка всей карточки остаётся incomplete из-за отдельных зависимых/admission правил. Пробел hidden Title coverage сохранён в бэклогах; восстановление видимости не принимает его исправление. Четыре RESET raw JSON сохранены с SHA в reports/live-captures/2026-10-09.

Следующая подготовленная группа: [запрет instance swap Graphic и служебного Bottom=SwapMe](composition-swap-placeholder-tests.r5.md), затем визуальные ограничения. Кейс разрешённого Bottom.Link ожидает зависимый контракт Link.

Подготовка: [Figma readback](composition-visibility-preflight.r5.2026-10-09.json). Полный контракт остаётся Draft.
