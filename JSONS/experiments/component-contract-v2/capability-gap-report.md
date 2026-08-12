# Component contract v2 capability gap report

This report distinguishes missing runtime vocabulary from missing structured rule authoring.
Candidate capabilities are discovery hints, not executable behavior.

## Current union

- selectors: 9
- facts: 47
- operators: 38
- remediations: 5

## Unsupported classification

- structured-fields-unmapped: 105
- structured-fields-missing-runtime-operator: 7
- prose-existing-operator: 19
- prose-missing-runtime-operator: 8
- prose-unclassified: 155

The classification separates source authoring from runtime support. Structured source fields are
reported independently from prose-only rules; candidate operators remain discovery hints.

## Capability novelty by package

- `web-corp.title-view`: selectors: component-identity, descendant, document-order, page-descendants, selection-root, self-and-descendants, semantic-role, visibility; facts: baseline.effective, component-api.anatomy, component-api.contract, component.editMode, component.identity, component.properties, diff.actual, diff.domain, diff.owner, diff.property, host.component.contract, host.surface.kind, host.variant.Skeleton, host.variant.View, icon.identity, layoutSizingHorizontal, layoutSizingVertical, neighbor.componentIdentity, node.bounds, node.documentOrder, node.visibility, ownership.owner, page.context, prototype.reactions, selector.matches, semanticRole, target.component.contract, target.componentKey, target.documentOrder, target.semanticRole, target.variant.properties, target.variant.Style, target.variant.Type, target.visible, text.characters, text.maxLines, text.overflow, variant.properties; operators: absenceAllowed, allEqual, allMatch, allowedChildrenByHostProperty, changePolicy, classifyDiffDomain, componentApiValid, contentPolicy, countBetween, delegateToContract, interactionByContext, matchesEffectiveBaseline, neighborSpacingByPair, noOverridesOrReactions, oneOf, propertiesEqual, relativeOrder, stringLengthBetween, valueByContext, valuePosition, visibleAndNonEmpty; remediations: remove-reaction, restore-effective-baseline, set-variant-properties
- `web-corp.account-select`: selectors: ancestry; facts: ancestry, effects, layout.properties, opacity, paint.fill, paint.stroke, style.text, variable.binding; operators: author-structured-assertion, classificationPolicy, compositionPolicy, statePolicy; remediations: none
- `web-corp.amount-styles`: selectors: none; facts: none; operators: digitCountBetween, numericFormat, requiredChild, visibilityPolicy; remediations: none
- `web-corp.background-plate`: selectors: none; facts: blendMode; operators: allowedPropertiesByVariant, boundToTokenByVariant, boundToTokenFromSource, noneMatch, notMatches, paintStateEquals; remediations: rule-defined-remediation
- `web-corp.buttons-group`: selectors: none; facts: none; operators: configurationPolicy, equalsFact; remediations: none
- `web-corp.button-stack`: selectors: none; facts: none; operators: sequenceEquals; remediations: none
- `web-corp.card-image`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.card-swiper-mobile`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.corporate-app-header-new`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.corporate-content`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.corporate-system-message`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.corporate-topbar`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.faq`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.file-upload`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.onboarding-tooltip`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.status-property`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.table-basic`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.table-wide`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.table-view`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.tabs-view`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp-promo.benefit-card`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp-promo.benefits`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp-promo.benefits-block`: selectors: none; facts: none; operators: none; remediations: bind-variable
- `web-corp-promo.promo-card`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp-promo.promo-main-block`: selectors: none; facts: none; operators: none; remediations: none
- `web-core.tag-group`: selectors: none; facts: none; operators: none; remediations: none
- `web-corp.payment-masked-number`: selectors: none; facts: none; operators: none; remediations: none
- `web-core.amount`: selectors: none; facts: none; operators: none; remediations: none

## Unsupported deterministic rules

## web-corp.title-view

No unsupported deterministic rules.

## web-corp.account-select

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.account-select.account-info-follows-item-type` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.account-info-preset-defines-visible-values` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.apply-is-always-enabled` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.disabled-account-cannot-be-selected` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.disabled-account-visual-state` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.empty-state-text-is-fixed` | prose-missing-runtime-operator | matchesEffectiveBaseline, statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.group-order-is-fixed` | prose-existing-operator | matchesEffectiveBaseline, relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.legacy-number-forbidden` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.list-content-is-uniform` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.list-height-is-fixed` | structured-fields-unmapped | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.media-mode-is-exclusive-and-uniform` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.public-roots-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.row-visuals-follow-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.select-all-state-machine` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.selected-state-follows-select-type` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.selection-controls-are-fixed` | structured-fields-unmapped | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.selection-type-semantics` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.account-select.swap-me-must-be-replaced` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.amount-styles

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.amount-styles.fixed-part-order` | prose-existing-operator | matchesEffectiveBaseline, relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.locked-components-are-figma-only-presets` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.manual-amount-text-fill-is-layer-property` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.manual-operation-sign-fill-is-layer-property` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.manual-text-style-is-layer-property` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.math-minus-is-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.math-space-is-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.negative-uses-primary` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.operation-is-internal` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.operation-negative-is-part-property` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.optional-parts-can-coexist` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.parts-default-visibility` | prose-missing-runtime-operator | visibilityPolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.round-to-two-minor-digits` | prose-missing-runtime-operator | numericFormat | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.ru-format` | prose-missing-runtime-operator | numericFormat | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.style-is-context-controlled` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.amount-styles.zero-format` | prose-missing-runtime-operator | numericFormat | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.background-plate

No unsupported deterministic rules.

## web-corp.buttons-group

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.buttons-group.built-in-buttons-can-be-hidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.exists-in-code` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.has-no-group-state` | prose-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.horizontal-layout-is-fixed` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.overflow-enables-last-single-icon` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.overflow-is-optional-from-two-buttons` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.root-sizing-is-hug-hug` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.single-icon-icon-is-fixed` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.buttons-group.use-only-built-in-button-slots` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.button-stack

No unsupported deterministic rules.

## web-corp.card-image

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.card-image.custom-cover-preserves-structure` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-image.custom-cover-uses-none` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-image.number-must-stay-masked` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-image.public-root-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-image.shadow-policy` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-image.user-data-by-size` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.card-swiper-mobile

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.card-swiper-mobile.fixed-vertical-spacing` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-swiper-mobile.neighbor-visibility-properties` | prose-missing-runtime-operator | visibilityPolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-swiper-mobile.public-root-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-swiper-mobile.requires-at-least-one-card` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-swiper-mobile.screen-size-follows-viewport` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.card-swiper-mobile.selection-geometry` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.corporate-app-header-new

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.corporate-app-header-new-open-controls-nested-group` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.all-services-is-required` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.detach-is-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.geometry-is-fixed` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.header-buttons-are-fixed` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.header-structure-is-required` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.logo-cell-is-required-and-fixed` | prose-existing-operator | matchesEffectiveBaseline, requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.only-three-public-components` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.single-active-menu-item` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-app-header-new.tablet-property-is-system-owned` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.corporate-content

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.corporate-content.detach-prohibited` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.grid-style-protected` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.platform-breakpoint-selection` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.root-clickability-prohibited` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.section-position-tablet-order` | structured-fields-unmapped | relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.section-root-layout-protected` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-content.transition-version-prohibited` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.corporate-system-message

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.corporate-system-message.built-in-background-plate-protected` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.buttons-axis-large-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.buttons-count-and-views` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.buttons-optional-combinations` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.caption-optional-all-views` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.center-alignment-protected` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.description-override-by-state` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.effective-baseline-protected` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.external-background-plate-slot-allowed` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.graphic-override-base-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.large-required-content` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.no-adaptive-fixed-content` | structured-fields-unmapped | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.platform-breakpoint` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.public-roots-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.root-fill-hug` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.root-interaction-prohibited` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.small-title-required` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.structure-protected` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.subtitle-is-description` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.title-override-by-view` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.transition-components-prohibited` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-system-message.type-by-view` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.corporate-topbar

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.corporate-topbar-allows-one-additional-button` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-divider-follows-control` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-is-desktop-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-protects-structure-and-root-interaction` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-region-order-is-fixed` | prose-existing-operator | matchesEffectiveBaseline, relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-root-uses-fill-hug` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-skeleton-preserves-filtered-state` | prose-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar-visuals-use-effective-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.additional-button-uses-supported-variants` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.counter-is-required` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.filtered-controls-counter-label` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.internal-components-are-not-standalone` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.settings-dropdown-shows-option-list` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.settings-is-optional` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.start-addon-is-optional` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.corporate-topbar.use-topbar-as-public-root` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.faq

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.faq.answer-length-limit` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.family-must-match-host` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.fill-hug-sizing` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.instance-swap-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.maximum-eight-per-category` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.minimum-two-items` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.platform-version-must-match` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.public-roots-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.question-and-answer-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.question-length-limit` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.single-open-item` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.surface-is-fixed-by-family` | prose-existing-operator | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.faq.visuals-follow-effective-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.file-upload

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.file-upload.border-platform-matrix` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.constraints-visible-before-upload` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.counter-counts-all-list-items` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.disable-blocks-new-upload-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.disable-file-upload-at-max-files` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.disable-hides-border` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.empty-state-hides-file-list` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.file-actions-follow-state` | structured-fields-missing-runtime-operator | statePolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.file-list-is-always-expanded` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.file-order-follows-upload` | prose-existing-operator | relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.fill-hug-sizing` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.limit-counts-all-list-items` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.max-three-formats-before-more` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.more-counts-extensions-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.public-roots-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.required-file-block-error` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.retry-on-upload-failure` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.single-file-disables-file-upload` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.slots-use-component-properties` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.text-overrides-are-limited` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.title-required-subtitle-optional` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.uploading-uses-file-item-preset` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.file-upload.visuals-follow-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.onboarding-tooltip

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.onboarding-tooltip.close-is-required-and-fixed` | prose-existing-operator | matchesEffectiveBaseline, requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.content-length-recommendations` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.desktop-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.maximum-ten-steps` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.public-root-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.required-anatomy` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.onboarding-tooltip.visuals-follow-effective-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.status-property

No unsupported deterministic rules.

## web-corp.table-basic

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.table-basic-d.action-cell-content` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.assembly-width-fill` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.bulk-actions-use-pagination-preset` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.cell-alignment-editable` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.column-control-visible` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.column-resize-without-horizontal-scroll` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.column-width-reset-actions` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.desktop-from-768` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.internal-parts-not-standalone` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.keep-control-and-action-cells` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.manual-visual-styles-forbidden` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.no-arbitrary-cell-instance-swap` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.no-column-grouping` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.no-column-pinning` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.no-horizontal-scroll` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.pagination-by-row-count` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.reset-all-restores-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.row-height-uses-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.select-all-current-page` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.single-active-sorting-column` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.sorting-menu-by-column-capability` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.supported-presets-allowed` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.supports-two-text-slots` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-basic-d.visual-states-use-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.table-wide

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.table-wide-d.action-cell-content` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.assembly-width-fill` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.bulk-actions-use-pagination-preset` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.cell-alignment-editable` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.column-width-reset-actions` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.column-widths-match` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.desktop-from-768` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.head-cell-column-control-visible` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.internal-parts-not-standalone` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.keep-control-and-action-cells` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.keep-one-visible-column` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.manual-visual-styles-forbidden` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.no-arbitrary-cell-instance-swap` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.pagination-by-row-count` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.pinning-wide-only` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.reset-all-restores-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.row-height-uses-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.select-all-current-page` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.single-active-sorting-column` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.sorting-menu-by-column-capability` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.supported-presets-allowed` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.use-wide-component-for-extended-view` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-wide-d.visual-states-use-effective-baseline` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.table-view

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.table-view.compact-is-consistent-across-rows` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.divider-visibility-only-last-row` | structured-fields-missing-runtime-operator | visibilityPolicy | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.horizontal-compact-width` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.internal-parts-not-standalone` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.last-row-divider` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.manual-column-width-changes-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.manual-visual-overrides-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.multi-column-width` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.no-single-hidden-row` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.table-view.title-subtitle-instance-swap-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp.tabs-view

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web-corp.tabs-view.active-tab-cannot-be-disabled` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.fixed-external-spacing` | structured-fields-unmapped | matchesEffectiveBaseline | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.indicator-digit-maximum` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.label-maximum-ten-characters` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.labels-are-unique-within-level` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.manual-primary-tabs-layer-override` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.manual-secondary-tabs-layer-override` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.manual-visual-overrides-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.maximum-two-levels` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.minimum-one-enabled-active-tab` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.one-active-tab-per-visible-level` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.primary-addon-active-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.primary-addon-types` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.root-skeleton-presentation` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web-corp.tabs-view.wrapper-owned-primary-tabs-overrides` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp-promo.benefit-card

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web.benefit-card-bottom-content-link-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-bottom-link-text-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-content-is-closed` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-icon-visuals-follow-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-image-view-segment-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-link-content-limit` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-platform-version-must-match` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-secondary-surface-not-recommended` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-skeleton-covers-entire-card` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-subtitle-content-limit` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card-title-content-limit` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.background-plate-colors-use-tokens` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.background-plate-style-overrides` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.compact-required-at-1024` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.compact-uses-secondary-title` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.icon-uses-glyph-26` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.public-roots-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.title-and-graphic-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.vertical-resizing-policy` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefit-card.visuals-follow-effective-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp-promo.benefits

No unsupported deterministic rules.

## web-corp-promo.benefits-block

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web.benefits-block.allowed-background-types` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.background-false-uses-host-surface` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.button-group-is-optional` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.container-is-not-clickable` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.image-source-and-swap` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.image-view-settings` | structured-fields-unmapped | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.layout-is-component-owned` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.mobile-height-follows-content` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.only-platform-roots-are-public` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.raw-colors-forbidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.right-addon-must-be-hidden` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.steps-count-recommendation` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.surface-color-overrides` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.title-addon-status-badge-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.benefits-block.title-and-image-are-required` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp-promo.promo-card

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web.promo-card-bottom-content-follows-own-contract` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-bottom-content-single-instance` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-image-none-disables-image-effects` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-image-view-overrides` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-internal-image-alignment-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-offset-top-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-secondary-surface-not-recommended` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-skeleton-covers-entire-card` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-surface-follows-contract` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-top-fade-matches-surface` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card-visuals-follow-effective-baseline` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card.button-composition` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card.content-limits` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card.platform-version-must-match` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card.public-roots-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-card.title-required` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-corp-promo.promo-main-block

| Source rule | Gap kind | Candidate operator | Blocking reason |
| --- | --- | --- | --- |
| `component:web.promo-main-block.actions-optional` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.container-is-not-clickable` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.content-order-is-fixed` | prose-existing-operator | matchesEffectiveBaseline, relativeOrder | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.desktop-compact-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.desktop-view-context` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.first-and-single-on-page` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.image-source-and-settings` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.layout-is-component-owned` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.loading-is-not-supported` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.mobile-background-must-be-true` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.multiple-statuses-warning` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.overlay-is-derived-from-appearance` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.page-background-must-be-false` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.page-blur-required` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.public-roots-only` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.required-content` | prose-existing-operator | requiredChild | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.status-count-and-contract` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |
| `component:web.promo-main-block.status-platform-casing-is-preset-owned` | prose-unclassified | author-structured-assertion | The source declares a deterministic rule but contains no structured assertion parameters. |

## web-core.tag-group

No unsupported deterministic rules.

## web-corp.payment-masked-number

No unsupported deterministic rules.

## web-core.amount

No unsupported deterministic rules.

## Interpretation

- A rule with a structured assertion and known facts is compiled into RuleIR.
- A rule expressed only as prose remains unsupported even if its likely operator is known.
- Normalize `structured-fields-unmapped` rules before adding runtime capabilities.
- Specify and fixture every `*-missing-runtime-operator` rule before implementing its operator.
- Triage `prose-unclassified` rules into typed assertions, `manual` or `llm`; never infer
  enforcement from prose.
- Candidate operators must not be added to Apollo until at least one source rule defines their
  exact inputs, unknown-evidence behavior and violation output.
- The sample now covers every package marked Ready in the Corp components sheet. The next step is
  to normalize recurring structured assertion fields into a smaller versioned operator vocabulary,
  then re-author or downgrade unsupported deterministic rules explicitly.
