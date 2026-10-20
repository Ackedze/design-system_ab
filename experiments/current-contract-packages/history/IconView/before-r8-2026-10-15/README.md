# Контракты компонентов

В корне — один актуальный рабочий ZIP для каждого компонента и платформы. Ready относится только к области, указанной в manifest. Draft остаётся в работе.

| Компонент | Версия | Статус | Пакет |
| --- | --- | --- | --- |
| Button | r31 | Ready | [ZIP](Button.component-contract.zip) |
| Spinner | r8 | Ready | [ZIP](Spinner.component-contract.zip) |
| Amount | r5 | Ready | [ZIP](Amount.component-contract.zip) |
| AmountStyles | r10 | Ready | [ZIP](AmountStyles.component-contract.zip) |
| CorporateContent | r13 | Ready | [ZIP](CorporateContent.component-contract.zip) |
| CorporateContent mobile-web | r8 | Ready | [ZIP](CorporateContent.mobile-web.component-contract.zip) |
| ButtonsGroup desktop | r60 | Ready | [ZIP](ButtonsGroup.component-contract.zip) |
| ButtonsGroup mobile-web | r3 | Draft | [ZIP](ButtonsGroup.mobile-web.component-contract.zip) |
| BenefitCard | r7 | Draft | [ZIP](BenefitCard.r7.editor-candidate.component-contract.zip) |
| BenefitsBlock | r4 | Draft | [ZIP](BenefitsBlock.component-contract.zip) |
| PromoCard | r3 | Draft | [ZIP](PromoCard.component-contract.zip) |
| Link | r5 | Draft | [ZIP](Link.r5.candidate.component-contract.zip) |
| IconView | r6 | Draft | [ZIP](IconView.r6.candidate.component-contract.zip) |

BackgroundPlate находится в подготовке: [план](BackgroundPlate/authoring/PREPARATION_PLAN.ru.md). ZIP ещё не выпущен. IconView r7 готовится в [authoring](IconView/authoring/candidates/r7-unique-2026-10-15/); текущий пакет — r6.

- [manifest.json](manifest.json) — актуальные версии, точные хеши и область статуса. [draft-manifest.json](draft-manifest.json) — рабочие Draft.
- `<Component>/authoring` — подготовка контрактов; `<Component>/reports` и `reports` — отчёты и тесты.
- [history](history/) — предыдущие версии. [Карта переноса](reports/housekeeping-2026-10-15/RESULT.json) позволяет найти старый файл по исходному пути и хешу; закрытые receipts не переписаны.
- [Материалы генерации](reports/generation-archive-2026-10-15/) — прежние планы и screen spec.
- [AGENTS.md](AGENTS.md) и [инструкция авторинга](CONTRACT_AUTHORING_GUIDE.ru.md) — правила дальнейшей работы.

BenefitCard r7 ждёт отложенного библиотечного обновления Link r5 и проверки родительского компонента. Link r5 и IconView r6 имеют приёмку отдельных проверок; весь контракт каждого остаётся Draft. Перемещение файлов не меняет Ready, публикацию или границы генерационного пилота.

Временное исключение: `apollo-v4-a884b111d842.json` остаётся в корне, поскольку его точный путь закреплён в отложенной проверке Spinner r9. Его перенос выполняется отдельно после проверки этой зависимости.
