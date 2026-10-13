

## CC-COMPAT-DEPENDENCY-USAGE-01 — parent usage rules на fixed child (12.10.2026)

**PREPARED_HELD; реализация не начата.** BenefitCard r6 candidate закрепляет Link r5
через exact pin/closure. Parent reference BottomContent=SwapMe не содержит
Link/Label; current core проверяет child отдельно и не переносит доказанную
child target identity в parent constraints. Нужна explicit opt-in привязка
`dependencyId + bindingId + childTargetId` для parent-owned правил: только текст,
≤32 символа, ≤1 строки. Не переносить эти лимиты в глобальный Link.

Использовать fixed-nested resolver, validated independent child capture/nodeMap
и child target ledger; сравнение запрета настроек — с pristine BottomContent.Link,
без принятия actual overrides. Missing/foreign/stale/ambiguous proof, отсутствующий
closure или line evidence → UNKNOWN; Bottom=false → notApplicable. Child Draft
authority не повышается parent preview. Нужны D/M positive/negative/RESET, hidden,
unknown и 37 прежних IR regressions. Exact pins и план: [BenefitCard r6](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/authoring/candidates/link-r5-integration-r6-2026-10-12/READER_FIX_PLAN.ru.md).

Парная запись Editor/Apollo v4. Общие core/compiler/runtime/build/config не менять
до sole-writer окна General по docs/APOLLO_SYNC_WORKFLOW.md. Generation pilot
не расширяется; native r6 и Ready не приняты.
