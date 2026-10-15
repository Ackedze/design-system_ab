# IconView r3 — Draft candidate

Исправлена проверка совпадения Form у Shape и Border при Shape=true и Border=true. Исходное context-only правило сохранено как deprecated; существующая норма реализована тремя условными ветками. Form Shape читается через доказанную target.shape как read-only semantic fact; публичный API и разрешения не расширены.

Пакет: `IconView.r3.candidate.component-contract.zip` в корне current-contract-packages. 38 manual / 36 active / 57 IR / 6 context-only. Core schema, ZIP и reopen PASS;15 сохранённых native captures и16 synthetic/Engine checks PASS в указанной области. Одинаковые формы проходят; Circle/Superellipse даёт1 нарушение. Fresh installed r3 pending; полный контракт Draft, Ready=false.

Editor/core/v4/pilot и working manifests не менялись. Реестр38строк/PredicateDraft и существующий typography Ledger readback проверены. Каноническая Hub typography migration и остальные gaps остаются открыты.
