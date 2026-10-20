# Актуальные контрактные пакеты

Эта папка — основное рабочее место для создания, изменения и проверки контрактов по решению владельца от 09.10.2026.

В корне находится один актуальный ZIP каждого компонента/платформы. Работу начинаем с этого ZIP и сохраняем новую версию сюда. Импортируйте ZIP целиком: исходные факты и закреплённые зависимости сохраняются внутри. Если для правки нужна распаковка, используем `<Component>/authoring` внутри этой папки. Прежние authoring-папки и закрытые проверочные артефакты сохраняются как источники происхождения; актуальную рабочую версию выбираем здесь.

Правила дальнейшей работы закреплены в [AGENTS.md](AGENTS.md).

Общий подход к ручной и автоматической подготовке правил и тестов: [инструкция по контрактам](CONTRACT_AUTHORING_GUIDE.ru.md). Версия 0.1 собирает повторяемые способы заполнения; полный накопленный опыт исследуется по [отдельному заданию](reports/authoring-process-research/research-request.md).

| Компонент | Версия | Статус compiled | Пакет | Область статуса |
|---|---|---|---|---|
| Button | r31 | Ready | [Button.component-contract.zip](Button.component-contract.zip) | Заявленная область Figma |
| Spinner | r8 | Ready | [Spinner.component-contract.zip](Spinner.component-contract.zip) | Заявленная область Figma |
| Amount | r5 | Ready | [Amount.component-contract.zip](Amount.component-contract.zip) | Заявленная область Figma |
| AmountStyles | r10 | Ready | [AmountStyles.component-contract.zip](AmountStyles.component-contract.zip) | Заявленная область Figma |
| CorporateContent | r13 | Ready | [CorporateContent.component-contract.zip](CorporateContent.component-contract.zip) | Заявленная область Figma |
| CorporateContent.mobile-web | r8 | Ready | [CorporateContent.mobile-web.component-contract.zip](CorporateContent.mobile-web.component-contract.zip) | Заявленная область Figma |
| ButtonsGroup | r60 | Ready | [ButtonsGroup.component-contract.zip](ButtonsGroup.component-contract.zip) | Локальный Figma compiled scope; recipe/code/live отдельно |
| ButtonsGroup.mobile-web | r3 | Draft | [ButtonsGroup.mobile-web.component-contract.zip](ButtonsGroup.mobile-web.component-contract.zip) | Рабочий контракт; приёмка открыта |
| BenefitCard | r3 | Draft | [BenefitCard.component-contract.zip](BenefitCard.component-contract.zip) | Рабочий контракт; приёмка открыта |
| BenefitsBlock | r4 | Draft | [BenefitsBlock.component-contract.zip](BenefitsBlock.component-contract.zip) | Рабочий контракт; приёмка открыта |
| PromoCard | r3 | Draft | [PromoCard.component-contract.zip](PromoCard.component-contract.zip) | Рабочий контракт; приёмка открыта |

Полный перечень, revision, SHA-256, исходники, representations и зависимости: [manifest.json](manifest.json). Подборка Draft: [draft-manifest.json](draft-manifest.json). Ready относится к заявленным Figma predicates; code, native/code parity, генерация и публикация имеют отдельную приёмку. Перенос не меняет статусы. Изменение ButtonsGroup r60 относится к выделенной области локального Figma-контракта.

## Карточки

PromoCard r3 и BenefitsBlock r4 сохранены из кандидатов C3; оба остаются Draft. BenefitCard r3 исправляет переносимость Root/Title/Graphic: 96 bindings / 32 независимо сверенных варианта. Повтор десяти пользовательских отчётов даёт четыре ожидаемых нарушения и 16 compliant результатов без unknown в двух quantity checks. Остальные 29 context-only норм и fresh Editor/live приёмка открыты; весь BenefitCard Draft. Для PromoCard подтверждён пользовательский desktop/mobile-web цикл проверки видимого Title; остальные 21 норма автоматически не проверяются.

BenefitsBlock r4 сохранён из закрытого C3. Прежняя authoring-папка BenefitsBlock содержит r2 и не используется как текущая рабочая версия. Доработки начинаем с ZIP r4 здесь. Экспорты из Editor, теряющие Markdown/text-вложения, не заменяют исходные полные ZIP.

## Обновление подборки

Новые актуальные рабочие экспорты сохраняем сюда с тем же именем пакета. Перед заменой предыдущую версию сохраняем в `history`, затем обновляем `manifest.json` и `draft-manifest.json`, проверяем ZIP, revision, manual/compiled и закреплённые зависимости. Отчёты остаются в папках компонентов и `reports`.

Исторический `scripts/collect_current_contract_packages.js` собирает только прежний принятый набор и не учитывает все рабочие версии из этого реестра. Его прежняя инструкция удалена из актуального README; он не использовался для этой подборки.

История обновления: [history/2026-10-09T08-29-20+0300](history/2026-10-09T08-29-20+0300).

## Обновление 09.10.2026

Для BenefitCard r3 нужен Editor **0.2.93** (core 0.1.12, declaredTargetIdentityVersion=2). Desktop ButtonsGroup r60: 17 Reviewed правил / 30 predicate checks. Mobile-web r3: 19 Draft правил / 29 checks. Девять контекстных норм каждой платформы с прежними RuleID и текстом сохранены в `context/recipe-rules.json`; Loading исполняется прежним pinned Button r31 / Spinner r8. Нормы не удалены. Общее состояние Predicate в Google остаётся Draft.

Все три ZIP открыты и повторно скомпилированы. Исходные правила/permissions/predicate bodies и pins сохранены. Editor восстанавливает Anatomy compact пакета для первого выбранного варианта; это диагностическое дерево, не runtime proof. Публикация/полная frontend приёмка не выполнялись. Детали: [отчёт обновления](reports/contract-update.2026-10-09.json), [проверка пакетов](reports/final-package-checks.2026-10-09.json), [синхронизация Google](reports/registry-sync.2026-10-09.json).

## BenefitCard r3: fresh user cycle / 09.10.2026

Installed Editor 0.2.93: desktop/mobile baseline, hidden Title, reset and hidden Graphic verified in eight user reports. Four expected violations and 12 compliant evaluations, zero inconclusive; report hashes and engine/editor replay are exact. This closes the fresh quantity-check fix on Vertical/Left/Background=True/Compact=False, in authoring preview. The other 29 norms, full variant coverage and manual review remain open; BenefitCard stays Draft. [Review receipt](BenefitCard/reports/r3-user-runs-review.2026-10-09.json).
