# Контракты компонентов

Актуальные ZIP хранятся в папках компонентов. Единственный список текущих пакетов — [manifest.json](manifest.json); прошлые версии из `history` автоматически не подбираются.

| Компонент | Версия | Статус | Пакет |
| --- | --- | --- | --- |
| Button | r31 | Ready | [ZIP](Button/Button.component-contract.zip) |
| Spinner | r8 | Ready | [ZIP](Spinner/Spinner.component-contract.zip) |
| Amount | r5 | Ready | [ZIP](Amount/Amount.component-contract.zip) |
| AmountStyles | r10 | Ready | [ZIP](AmountStyles/AmountStyles.component-contract.zip) |
| CorporateContent | r13 | Ready | [ZIP](CorporateContent/CorporateContent.component-contract.zip) |
| CorporateContent.mobile-web | r8 | Ready | [ZIP](CorporateContent/mobile-web/CorporateContent.mobile-web.component-contract.zip) |
| ButtonsGroup | r60 | Ready | [ZIP](ButtonsGroup/ButtonsGroup.component-contract.zip) |
| ButtonsGroup.mobile-web | r3 | Draft | [ZIP](ButtonsGroup/mobile-web/ButtonsGroup.mobile-web.component-contract.zip) |
| BenefitCard | r12 | Draft | [ZIP](BenefitCard/BenefitCard.r12.candidate.component-contract.zip) |
| BenefitsBlock | r4 | Draft | [ZIP](BenefitsBlock/BenefitsBlock.component-contract.zip) |
| PromoCard | r3 | Draft | [ZIP](PromoCard/PromoCard.component-contract.zip) |
| Link | r6 | Draft | [ZIP](Link/Link.r6.candidate.component-contract.zip) |
| IconView | r9 | Draft | [ZIP](IconView/IconView.r9.candidate.component-contract.zip) |
| BackgroundPlate | r7 | Ready | [ZIP](BackgroundPlate/BackgroundPlate.r7.component-contract.zip) |

Ready относится только к `statusScope` конкретного пакета. Размещение файлов не меняет нормы, версии, готовность или область приёмки.

- [Индекс исходников](../../JSONS/indexes/component-contracts.index.json) выбирает manual и факты в `JSONS/web/components/<library>/<component>`; мобильные версии — в `mobile-web`. ZIP — производная поставка.
- Прежние `<Component>/authoring` и reports сохранены как историческое происхождение; новые правки manual выполняются в основных папках компонентов.
- `<Component>/mobile-web` — отдельный пакет мобильной платформы, когда он существует.
- [draft-manifest.json](draft-manifest.json) — производный список Draft из основного индекса.
- [history](history/) — неизменяемые прежние пакеты и evidence; старые пути остаются историческим происхождением.
- [AGENTS.md](AGENTS.md) и [инструкция авторинга](CONTRACT_AUTHORING_GUIDE.ru.md) — порядок работы.
- `node ../../scripts/collect_current_contract_packages.js --check` проверяет текущие архивы и индексы; без `--check` обновляет только производные список Draft и эту страницу.
