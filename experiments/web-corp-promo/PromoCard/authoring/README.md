# PromoCard — contract r3

Primary source: `contract.manual.json`. Статус **Draft**. Desktop/mobile-web: 36 вариантов и 72 прежние native bindings.

Исправлен только производный inventory: 30 скрытых Offset/BlurEffect слоёв в 9 вариантах. Все 22 правила, их формулировки, constraints, routes и semantic API сохранены. Offset/Image=None остаются context-only.

r2 прошла пользовательский ретест исполняемого subset. r3 повторно оценена на всех 12 свежих snapshots; PC-D04/PC-M06 теперь имеют resolved root/Title. Нужен короткий live-ретест этих двух кейсов. Parity, полное coverage и release не приняты.

Raw каталоги сохранены байт-в-байт; старые generated inputs находятся в ZIP как historical/*.json.txt. Runtime использует source/contract.generated.r3.json. Подробности: reports/hidden-anatomy-repair.r3.json и reports/validation-summary.r3.json.
