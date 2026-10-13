# BenefitCard r6 candidate

Точная Draft-зависимость Link r5 добавлена с fixed-nested binding на Bottom и
полным compiled closure. Лимиты Link для карточки разделены: ≤32 символа и ≤1
строки. Норма «менять только текст» сохранена. Все три нормы принадлежат
BenefitCard; глобальный Link не менялся.

Текущая schema/core компиляция и ZIP reopen прошли. 19 незатронутых source
правил и все прежние 37 IR сохранены. На 57 сохранённых native captures повторены
старые проверки с новым synthetic explicit scenario для r6: classifications
и traces совпали по [RuleID, subjectNodeId]. Это не fresh native приёмка r6.

Автоматическое исполнение трёх требований ещё не подготовлено: reader не
проецирует доказанные цели child Link в parent usage scope. Route=context-only,
5 non-executable claims (три Link и два прежних пробела), Ready=false.
Описание исправления и будущих кейсов — READER_FIX_PLAN.ru.md.

Расположение полного пакета: корень current-contract-packages /
BenefitCard.r6.candidate.component-contract.zip. Рабочий BenefitCard r5, Link r4,
Link r5 candidate и manifests неизменны. Общие source/build/config, пилот и
Figma canvas не изменялись.
