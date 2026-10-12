# BenefitCard r5 · сброс лимита символов

**4/4 текстовых сброса корректны; 3/4 полных условий сценария подтверждены.** Title=60 и Subtitle=120 латинских `i` проходят лимиты символов и строк на desktop/mobile-web. Editor 0.2.98, core 0.1.14; exact engine/Editor replay четырёх свежих отчётов совпал. ZIP/manual/compiled/runtime/snapshot hashes проверены; capture complete, warnings=0, девять targets resolved. Нормы, пакет и статусы не менялись.

| Кейс | Платформа | Текст | Символы / строки | Контекст | Результат |
| --- | --- | --- | --- | --- | --- |
| [BC4-201](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67093) | desktop | title | 60 / 2 | пусто | text limits + alignment compliant; 2 context UNKNOWN |
| [BC4-202](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67118) | mobile-web | title | 60 / 1 | ViewportClass + CardPlacement=single | text limits + alignment compliant; UNKNOWN=0 |
| [BC4-205](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67195) | desktop | subtitle | 120 / 2 | ViewportClass + CardPlacement=single | text limits + alignment compliant; UNKNOWN=0 |
| [BC4-206](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-67220) | mobile-web | subtitle | 120 / 2 | ViewportClass + CardPlacement=single | text limits + alignment compliant; UNKNOWN=0 |

**Повторить только BC4-201.** Сохрани текущие 60 латинских `i`, Left/Auto height у Title и Hug корня. В Editor задай `ViewportClass=desktop` и `CardPlacement=single`, повтори проверку и выгрузи отчёт. Пустые values в отчёте 19:08:45 UTC дают UNKNOWN у `component:web.benefit-card-platform-version-must-match.desktop.1.1` (expectedInput.ViewportClass) и `component:web.benefit-card.vertical-resizing-policy.1.1` (expectedInput.CardPlacement). Это подтверждённая неполнота входа, не текстовое нарушение и не основание угадывать контекст из платформы Figma.

В 24 целевых оценках — 22 compliant и два context human-review; восемь оценок обоих текстовых лимитов — compliant. Violations=0. Для BC4-202/205/206 физический корень, explicit context, параметры и Hug совпали с прежними отрицательными review receipts. У BC4-201 совпали корень и параметры, но контекст пуст. Negative raw captures отсутствуют: fresh negative replay и before/after native source continuity не заявляются. Четыре новых raw captures сохранены с SHA в reports/live-captures/2026-10-09.

Положительные/отрицательные границы, alignment, Fixed→UNKNOWN и предыдущие сбросы сохраняют собственные receipts. Полный текстовый цикл пока открыт из-за одного context retest. Все полные сценарии incomplete с тремя nonExecutable rules; весь компонент, Source Reviewed/Ready, установленный Apollo и release не приняты.

Доказательства: [text-character-resets-live-review.r5.2026-10-09.json](text-character-resets-live-review.r5.2026-10-09.json). [Условия тестов](reading-fix-retest.r5.md).
