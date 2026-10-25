# Контракты компонентов

Актуальные ZIP хранятся рядом с manual в `JSONS/web/components/.../packages`. Единственный список текущих пакетов — [manifest.json](manifest.json); прошлые версии из `history` автоматически не подбираются.

| Компонент | Версия | Изменён manual | Статус | Пакет |
| --- | --- | --- | --- | --- |
| Button | r31 | 2026-09-29T12:00:00.000Z | Ready | [ZIP](<../../JSONS/web/components/web-core/core/Button/packages/Button.component-contract.zip>) |
| Spinner | r8 | 2026-09-27T11:05:00.000Z | Ready | [ZIP](<../../JSONS/web/components/web-core/core/Spinner/packages/Spinner.component-contract.zip>) |
| Amount | r5 | 2026-09-29 | Ready | [ZIP](<../../JSONS/web/components/web-core/core/Amount/packages/Amount.component-contract.zip>) |
| AmountStyles | r10 | 2026-09-30 | Ready | [ZIP](<../../JSONS/web/components/web-corp/AmountStyles/packages/AmountStyles.component-contract.zip>) |
| CorporateContent | r13 | 2026-10-05T19:54:22.102Z | Ready | [ZIP](<../../JSONS/web/components/web-corp/CorporateContent/packages/CorporateContent.component-contract.zip>) |
| CorporateContent.mobile-web | r8 | 2026-10-05T19:54:22.102Z | Ready | [ZIP](<../../JSONS/web/components/web-corp/CorporateContent/mobile-web/packages/CorporateContent.mobile-web.component-contract.zip>) |
| ButtonsGroup | r60 | 2026-10-09T06:55:36.591Z | Ready | [ZIP](<../../JSONS/web/components/web-corp/ButtonGroup%20%5BD%5D/packages/ButtonsGroup.component-contract.zip>) |
| ButtonsGroup.mobile-web | r3 | 2026-10-09T06:55:36.591Z | Draft | [ZIP](<../../JSONS/web/components/web-corp/ButtonGroup%20%5BD%5D/mobile-web/packages/ButtonsGroup.mobile-web.component-contract.zip>) |
| BenefitCard | r16 | 2026-10-20T21:20:30.429Z | Draft | [ZIP](<../../JSONS/web/components/web-corp-promo/BenefitCard/packages/BenefitCard.r16.candidate.component-contract.zip>) |
| BenefitsBlock | r4 | 2026-10-08T17:46:31.559536+00:00 | Draft | [ZIP](<../../JSONS/web/components/web-corp-promo/BenefitsBlock/packages/BenefitsBlock.component-contract.zip>) |
| PromoCard | r3 | 2026-10-07T13:01:12.597Z | Draft | [ZIP](<../../JSONS/web/components/web-corp-promo/PromoCard/packages/PromoCard.component-contract.zip>) |
| Link | r8 | 2026-10-20T21:20:30.319Z | Ready | [ZIP](<../../JSONS/web/components/web-core/core/Link/packages/Link.r8.candidate.component-contract.zip>) |
| IconView | r11 | 2026-10-20T20:14:08.002Z | Ready | [ZIP](<../../JSONS/web/components/web-core/core/IconView/packages/IconView.r11.candidate.component-contract.zip>) |
| BackgroundPlate | r7 | 2026-10-20T11:41:14.000Z | Ready | [ZIP](<../../JSONS/web/components/web-corp/BackgroundPlate/packages/BackgroundPlate.r7.component-contract.zip>) |
| PaymentMaskedNumber | r4 | 2026-10-21T12:23:12.203Z | Draft | [ZIP](<../../JSONS/web/components/web-corp/PaymentMaskedNumber/packages/PaymentMaskedNumber.r4.draft.component-contract.zip>) |
| Indicator | r2 | 2026-10-22T21:46:36.826Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/Indicator/packages/Indicator.r2.draft.component-contract.zip>) |
| Switch | r1 | 2026-10-22T22:21:47.096Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/Switch/packages/Switch.r1.draft.component-contract.zip>) |
| Status | r3 | 2026-10-23T20:24:43.172Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/Status/packages/Status.r3.draft.component-contract.zip>) |
| Status & Property | r4 | 2026-10-24T06:20:56.140839+00:00 | Draft | [ZIP](<../../JSONS/web/components/web-corp/Status%20&%20Property/packages/StatusProperty.r4.draft.component-contract.zip>) |
| StatusBadge | r2 | 2026-10-25T11:34:54.320Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/StatusBadge/packages/StatusBadge.r2.draft.component-contract.zip>) |
| Checkbox | r2 | 2026-10-25T11:34:54.320Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/Checkbox/packages/Checkbox.r2.draft.component-contract.zip>) |
| Radio | r2 | 2026-10-25T11:34:54.320Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/Radio/packages/Radio.r2.draft.component-contract.zip>) |
| IconButton | r2 | 2026-10-25T11:34:54.320Z | Draft | [ZIP](<../../JSONS/web/components/web-core/core/IconButton/packages/IconButton.r2.draft.component-contract.zip>) |

Ready относится только к `statusScope` конкретного пакета. Размещение файлов не меняет нормы, версии, готовность или область приёмки.

- [Индекс исходников](../../JSONS/indexes/component-contracts.index.json) выбирает manual и факты в `JSONS/web/components/<library>/<component>`; мобильные версии — в `mobile-web`. ZIP — производная поставка.
- Прежние `<Component>/authoring`, reports и точные ZIP по старым адресам сохранены как историческое происхождение и frozen compatibility inputs; они не выбираются текущим manifest. Новые правки выполняются в основных папках компонентов.
- `<Component>/mobile-web` — отдельный пакет мобильной платформы, когда он существует.
- Дата берётся из `metadata.updatedAt` manual. Revision и hashes определяют точную версию; перенос, экспорт и сохранение без изменений не меняют дату.
- [draft-manifest.json](draft-manifest.json) — производный список Draft из основного индекса.
- [history](history/) — неизменяемые прежние пакеты и evidence; старые пути остаются историческим происхождением.
- [AGENTS.md](AGENTS.md) и [инструкция авторинга](CONTRACT_AUTHORING_GUIDE.ru.md) — порядок работы.
- `node ../../scripts/validate_current_contract_packages.cjs` проверяет целостность репозитория без Apollo build.
- `APOLLO_ROOT=/absolute/path/to/accepted/Apollo node ../../scripts/collect_current_contract_packages.js --check` проверяет ZIP, исходники и compiled projection принятой сборкой; без `--check` обновляет только производные список Draft и эту страницу.
