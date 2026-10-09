# Актуальные контрактные пакеты

Эта папка — основное рабочее место для создания, изменения и проверки контрактов по решению владельца от 09.10.2026.

В корне находится один актуальный ZIP каждого компонента/платформы. Работу начинаем с этого ZIP и сохраняем новую версию сюда. Импортируйте ZIP целиком: исходные факты и закреплённые зависимости сохраняются внутри. Если для правки нужна распаковка, используем `<Component>/authoring` внутри этой папки. Прежние authoring-папки и закрытые проверочные артефакты сохраняются как источники происхождения; актуальную рабочую версию выбираем здесь.

Правила дальнейшей работы закреплены в [AGENTS.md](AGENTS.md).

| Компонент | Версия | Статус compiled | Пакет | Область статуса |
|---|---|---|---|---|
| Button | r31 | Ready | [Button.component-contract.zip](Button.component-contract.zip) | Заявленная область Figma |
| Spinner | r8 | Ready | [Spinner.component-contract.zip](Spinner.component-contract.zip) | Заявленная область Figma |
| Amount | r5 | Ready | [Amount.component-contract.zip](Amount.component-contract.zip) | Заявленная область Figma |
| AmountStyles | r10 | Ready | [AmountStyles.component-contract.zip](AmountStyles.component-contract.zip) | Заявленная область Figma |
| CorporateContent | r13 | Ready | [CorporateContent.component-contract.zip](CorporateContent.component-contract.zip) | Заявленная область Figma |
| CorporateContent.mobile-web | r8 | Ready | [CorporateContent.mobile-web.component-contract.zip](CorporateContent.mobile-web.component-contract.zip) | Заявленная область Figma |
| ButtonsGroup | r59 | Draft | [ButtonsGroup.component-contract.zip](ButtonsGroup.component-contract.zip) | Рабочий контракт; приёмка открыта |
| ButtonsGroup.mobile-web | r2 | Draft | [ButtonsGroup.mobile-web.component-contract.zip](ButtonsGroup.mobile-web.component-contract.zip) | Рабочий контракт; приёмка открыта |
| BenefitCard | r2 | Draft | [BenefitCard.component-contract.zip](BenefitCard.component-contract.zip) | Рабочий контракт; приёмка открыта |
| BenefitsBlock | r4 | Draft | [BenefitsBlock.component-contract.zip](BenefitsBlock.component-contract.zip) | Рабочий контракт; приёмка открыта |
| PromoCard | r3 | Draft | [PromoCard.component-contract.zip](PromoCard.component-contract.zip) | Рабочий контракт; приёмка открыта |

Полный перечень, revision, SHA-256, исходники, representations и зависимости: [manifest.json](manifest.json). Подборка Draft: [draft-manifest.json](draft-manifest.json). Ready относится к заявленным Figma predicates; code, native/code parity, генерация и публикация имеют отдельную приёмку. Перенос не меняет эти статусы.

## Карточки

BenefitCard r2, PromoCard r3 и BenefitsBlock r4 — точные исходные полные ZIP кандидатов C3. Их импорт/экспорт/повторное открытие проверены, но весь контракт остаётся Draft. Для PromoCard подтверждён пользовательский desktop/mobile-web цикл проверки видимого Title; остальные 21 норма автоматически не проверяются.

BenefitsBlock r4 сохранён из закрытого C3. Прежняя authoring-папка BenefitsBlock содержит r2 и не используется как текущая рабочая версия. Доработки начинаем с ZIP r4 здесь. Экспорты из Editor, теряющие Markdown/text-вложения, не заменяют исходные полные ZIP.

## Обновление подборки

Новые актуальные рабочие экспорты сохраняем сюда с тем же именем пакета. Перед заменой предыдущую версию сохраняем в `history`, затем обновляем `manifest.json` и `draft-manifest.json`, проверяем ZIP, revision, manual/compiled и закреплённые зависимости. Отчёты остаются в папках компонентов и `reports`.

Исторический `scripts/collect_current_contract_packages.js` собирает только прежний принятый набор и не учитывает все рабочие версии из этого реестра. Его прежняя инструкция удалена из актуального README; он не использовался для этой подборки.

История обновления: [history/2026-10-09T08-29-20+0300](history/2026-10-09T08-29-20+0300).
