# Contract v2 rule execution classification

This report classifies source rules without normalizing them or inferring executable semantics from prose.

## Ready Corp summary

- packages: 25
- rules: 844
- deterministic: 354
- agent-required: 135
- human-review: 202
- policy-only: 1
- unresolved: 152

`deterministic` means either executable now or backed by explicit structured assertion fields.
`agent-required` is used only for rules explicitly authored as `llm` or `contextual`.
Prose-only rules labelled deterministic remain `unresolved` until an owner chooses typed authoring or an agent route.

## First migration wave

The first wave requires no new runtime operators and is ready only for shadow parity:

- `web-corp-promo.benefits`
- `web-corp.background-plate`
- `web-corp.button-stack`
- `web-corp.status-property`
- `web-corp.title-view`

## Ready packages

| Package | Executable deterministic | Deterministic decision | Agent | Human | Unresolved | Eligibility |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `web-corp-promo.benefit-card` | 11/22 | 15 | 0 | 10 | 7 | blocked-by-authoring-or-capabilities |
| `web-corp-promo.benefits` | 14/14 | 14 | 4 | 3 | 0 | ready-no-new-operators |
| `web-corp-promo.benefits-block` | 3/18 | 4 | 10 | 5 | 14 | blocked-by-authoring-or-capabilities |
| `web-corp-promo.promo-card` | 2/18 | 2 | 6 | 0 | 16 | blocked-by-authoring-or-capabilities |
| `web-corp-promo.promo-main-block` | 2/20 | 2 | 6 | 1 | 18 | blocked-by-authoring-or-capabilities |
| `web-corp.account-select` | 4/23 | 19 | 0 | 20 | 4 | blocked-by-authoring-or-capabilities |
| `web-corp.amount-styles` | 12/29 | 16 | 20 | 0 | 13 | blocked-by-authoring-or-capabilities |
| `web-corp.background-plate` | 22/24 | 24 | 6 | 0 | 0 | ready-production-predicate-bridge |
| `web-corp.button-stack` | 7/7 | 7 | 5 | 5 | 0 | ready-no-new-operators |
| `web-corp.buttons-group` | 4/17 | 7 | 1 | 16 | 10 | blocked-by-authoring-or-capabilities |
| `web-corp.card-image` | 8/14 | 8 | 3 | 5 | 6 | blocked-by-authoring-or-capabilities |
| `web-corp.card-swiper-mobile` | 3/9 | 4 | 8 | 4 | 5 | blocked-by-authoring-or-capabilities |
| `web-corp.corporate-app-header-new` | 3/14 | 5 | 0 | 34 | 9 | blocked-by-authoring-or-capabilities |
| `web-corp.corporate-content` | 17/24 | 20 | 7 | 1 | 4 | blocked-by-authoring-or-capabilities |
| `web-corp.corporate-system-message` | 6/24 | 20 | 9 | 1 | 4 | blocked-by-authoring-or-capabilities |
| `web-corp.corporate-topbar` | 2/18 | 5 | 0 | 21 | 13 | blocked-by-authoring-or-capabilities |
| `web-corp.faq` | 2/15 | 6 | 0 | 4 | 9 | blocked-by-authoring-or-capabilities |
| `web-corp.file-upload` | 3/26 | 21 | 6 | 10 | 5 | blocked-by-authoring-or-capabilities |
| `web-corp.onboarding-tooltip` | 6/16 | 10 | 0 | 19 | 6 | blocked-by-authoring-or-capabilities |
| `web-corp.status-property` | 11/12 | 12 | 10 | 5 | 0 | ready-production-predicate-bridge |
| `web-corp.table-basic` | 10/34 | 34 | 3 | 7 | 1 | blocked-by-authoring-or-capabilities |
| `web-corp.table-view` | 7/20 | 18 | 14 | 9 | 2 | blocked-by-authoring-or-capabilities |
| `web-corp.table-wide` | 13/36 | 35 | 3 | 7 | 1 | blocked-by-authoring-or-capabilities |
| `web-corp.tabs-view` | 7/23 | 18 | 0 | 15 | 5 | blocked-by-authoring-or-capabilities |
| `web-corp.title-view` | 27/28 | 28 | 14 | 0 | 0 | ready-production-predicate-bridge |
