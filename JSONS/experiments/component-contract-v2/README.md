# Component contract v2 capability experiments

These packages are isolated research artifacts. Athena production discovery and Apollo's default
runtime do not use them. The bootstrap manifest exposes only `runtime-index.json`, which Apollo
loads lazily after the user manually enables the Contract v2 test contour. The contour is disabled
on every plugin start and never falls back to prose or production schema-v1 decisions.

Only rules published as `enforcement=enforced` and fully supported by the versioned runtime
selector/operator vocabulary may produce a violation. Unsupported rules, missing evidence and
unknown evaluations are reported as diagnostics and never become violations.

Each Component API publishes `componentKeys` containing its canonical component-set key and every
known variant key. `runtime-index.json` indexes the complete union; package routing by a displayed
name or heuristic alias is forbidden.

The package inventory is a read-only snapshot of Google Sheets tab `Corp components`, range
`A2:F101`, filtered by `Общий статус=Ready` and `Ready=10`. It contains
28 packages. The spreadsheet selects the sample only; executable
semantics always come from the local component-package JSON files.

| Package | Deterministic coverage | Unsupported deterministic |
| --- | ---: | ---: |
| web-corp.title-view | 27/27 | 0 |
| web-corp.account-select | 4/22 | 18 |
| web-corp.amount-styles | 12/28 | 16 |
| web-corp.background-plate | 22/22 | 0 |
| web-corp.buttons-group | 7/16 | 9 |
| web-corp.button-stack | 7/7 | 0 |
| web-corp.card-image | 8/14 | 6 |
| web-corp.card-swiper-mobile | 3/9 | 6 |
| web-corp.corporate-app-header-new | 3/13 | 10 |
| web-corp.corporate-content | 17/24 | 7 |
| web-corp.corporate-system-message | 6/24 | 18 |
| web-corp.corporate-topbar | 2/18 | 16 |
| web-corp.faq | 2/15 | 13 |
| web-corp.file-upload | 3/26 | 23 |
| web-corp.onboarding-tooltip | 6/13 | 7 |
| web-corp.status-property | 11/11 | 0 |
| web-corp.table-basic | 10/34 | 24 |
| web-corp.table-wide | 13/36 | 23 |
| web-corp.table-view | 5/15 | 10 |
| web-corp.tabs-view | 7/22 | 15 |
| web-corp-promo.benefit-card | 2/22 | 20 |
| web-corp-promo.benefits | 14/14 | 0 |
| web-corp-promo.benefits-block | 3/18 | 15 |
| web-corp-promo.promo-card | 2/18 | 16 |
| web-corp-promo.promo-main-block | 2/20 | 18 |
| web-core.tag-group | 3/3 | 0 |
| web-corp.payment-masked-number | 3/3 | 0 |
| web-core.amount | 4/4 | 0 |

The union and per-package novelty of selectors, facts, operators and remediations is stored in
`capability-matrix.json`. Across the sample, 208
of 498 deterministic rules compile (0.4177);
290 remain unsupported. A source rule is executable only when its assertion
parameters are structured; prose is never promoted into runtime behavior.

`ready-package-rule-profile.json` separates runtime vocabulary from descriptive override-policy
paths and provides greedy saturation orders for both dimensions.
