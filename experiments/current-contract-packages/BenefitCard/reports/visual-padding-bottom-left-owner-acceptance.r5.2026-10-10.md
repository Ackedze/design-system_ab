# BenefitCard r5 — принятие bottom/left padding

**BC4-405–408 приняты по решению владельца:** «это аналогичные правила, их сразу можно отметить как принятые». Отдельные отрицательные прогоны и RESET для этих четырёх экземпляров больше не требуются.

Обоснование: четыре padding IR используют одинаковые selector, applicability, scope, baseline predicate и UNKNOWN policy; различаются RuleID и fact path стороны. Цикл top/right уже проверен на desktop/mobile-web; сохранённые RESET дополнительно содержат восемь compliant проверок bottom/left на корнях. Для BC4-405–408 независимое чтение Figma подтвердило native identity, параметры, факты и baseline.

Основание приёмки записано как owner-decision-by-analogy. Новых live-отчётов для BC4-405–408 нет. ZIP, нормы и статусы правил не менялись; полный компонент остаётся Draft.

Доказательства: [visual-padding-bottom-left-owner-acceptance.r5.2026-10-10.json](visual-padding-bottom-left-owner-acceptance.r5.2026-10-10.json). Прежние [условия теста](visual-padding-bottom-left-tests.r5.md) сохранены как история подготовки; решение в этом документе отменяет необходимость их отдельного выполнения.
