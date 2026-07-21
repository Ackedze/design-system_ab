---
name: figma-b2b-interface
description: Draw or update B2B product interfaces in Figma using the DS AB design system and repository examples as visual references. Use when Codex needs to create screens, pages, sections, widgets, headers, forms, statuses, tables, or other B2B UI using only working files from the `design-system_ab` repository.
---

# Figma B2B Interface

Use this skill to draw B2B interfaces in Figma from the local DS AB source of truth. Treat the skill as a draft operating protocol: prefer correctness against the catalog over visual improvisation.

## Repository Source Gate

All working context must come from one repository root: `$DS_AB_ROOT`.

The canonical skill is the repository-owned file `$DS_AB_ROOT/.codex/skills/figma-b2b-interface/SKILL.md`. Update and use this version. Do not treat a copy under `~/.codex/skills`, plugin cache, or another repository as the working skill source.

Before the first design action, resolve `$DS_AB_ROOT` to the recipient's local clone of `design-system_ab` and verify that it contains `JSONS`, `patterns`, `examples`, and `redpolrules`. If the root is not available, ask for its path and do not start generation.

Allowed sources inside that root only:

- `JSONS`: raw component catalogs, indexes, tokens, styles, component contracts, agent context, rules, and examples.
- `patterns`: UX and composition patterns.
- `examples`: visual references for an already-selected pattern.
- `redpolrules`: editorial rules.

Hard rules:

- Do not read, use, cite, or fall back to files outside `design-system_ab` as design-system working context. In particular, do not use `design-system_agentic`, target-file local components, old exports, cached copies, or other repositories.
- Treat `design-system_ab/JSONS` as the only component-key, lifecycle-status, style, token, and contract source of truth. Resolve `agent-context.json`, `rules.json`, `composition-contract.json`, `contract.generated.json`, `contract.overrides.json`, and component examples inside that same `JSONS` tree.
- If the required catalog, contract, token, style, pattern, or redpolicy file is absent from `design-system_ab`, stop and report the missing source. Do not substitute a look-alike or infer an unrecorded rule.
- Never use arbitrary components, icons, colors, typography, shadows, radii, or copy rules when an equivalent exists in the allowed sources.

Use files from `examples` only as visual and compositional references after selecting the applicable patterns. Do not treat examples as component, token, style, lifecycle-status, contract, or copy source of truth.

## Example Reference Workflow

Search `$DS_AB_ROOT/examples` before composing every generated page or content surface. Reference discovery is mandatory; using a specific example is conditional on finding a relevant match.

1. List available example files with `rg --files "$DS_AB_ROOT/examples"`.
2. Inspect candidate metadata before loading the full artifact. Match in this order: exact `pageType` or surface role, exact platform, exact breakpoint; then page type plus platform; then the closest pattern-compatible example.
3. Prefer reviewed or golden examples over draft candidates when their page type, platform, and current patterns are equally relevant. Treat `requiresManualReview: true` and candidate statuses as lower-confidence references.
4. For responsive generation, inspect the requested breakpoint and available adjacent breakpoints from the same `exampleSetId` to understand reflow, slot availability, and hierarchy.
5. Extract only reference-level decisions: hierarchy, composition, density, relative scale, section order, responsive behavior, and component roles.
6. Resolve every actual component, variant, token, style, property, and slot again from current `JSONS` catalogs and component agent files. Never import a component key, variable id, local instance, or lifecycle state solely because it appears in an example.
7. Apply current patterns and component rules when an example conflicts with them. Record the conflict and the newer rule followed in the generation report.
8. If no relevant example exists, continue from catalogs, agent files, patterns, and redpolicy, and report that the examples search produced no applicable reference.

Do not clone an example mechanically. Reconstruct its valid composition with current active DS components and current contracts.

## Input Contract

Extract or ask for these parameters before drawing:

- `figmaUrl` or `fileKey` plus `nodeId`: exact file and target section/frame.
- `platform`: desktop, mobile-web, iOS, Android, or universal. Default to desktop only when the target file/context clearly uses desktop web components.
- `surface`: page, section, widget, modal, drawer, table, form, status screen, or other B2B surface type. Treat a standalone generated form/screen as `page` unless the user explicitly asks to place a local block inside an existing page section, modal, drawer, widget, or named container.
- `content`: title, labels, statuses, table columns, field names, hints, errors, and action text.
- `state`: default, loading, in-progress, empty, success, warning, error, disabled, or selected.
- `density`: compact, regular, or spacious. Infer from existing surrounding Figma content when possible.

If a parameter is missing but can be inferred from the target node or surrounding design, infer it and state the assumption in the final response. Ask the user only when the missing value changes component family, platform, or meaning.

## Required Figma Flow

1. Load `figma-use` before every `use_figma` call.
2. Inspect the target Figma node first with `get_metadata` or a read-only `use_figma` script.
3. Identify the page, section, platform, existing layout, and surrounding density.
4. Read the relevant raw JSON index/catalog files in `design-system_ab/JSONS` before selecting components.
5. Resolve the matching companion folder inside `design-system_ab/JSONS` by package/component family name, then read `agent-context.json` before choosing the component.
6. Read the component's `rules.json`, `composition-contract.json`, `contract.generated.json`, and `contract.overrides.json` when present; apply those rules while using the component.
7. Read the relevant pattern files before composing UI behavior.
8. Search `design-system_ab/examples`, select matching references through the Example Reference Workflow, and inspect every relevant match before composing the layout.
9. Read relevant redpolicy rules before writing visible text.
10. Import DS components by published component key from the raw JSON catalog.
11. Mutate component properties, slot replacements, and instance swaps declared by the contract rather than detaching or manually editing internals.
12. Return every created and mutated node id from write calls.
13. Validate with a screenshot or read-back inspection before finishing.

## Desktop Page Composition

For any desktop Alfa-Business product page, standalone generated form, or full-page screen, use the assembly described by `patterns/p_corporate-page.md`. `CorporatePage` is not a Figma component: never search for it, select it, import it, or report it as a missing catalog component. If the user says "page", "screen", or "form" without naming an existing local section/container, classify the target as a desktop product page and assemble it from active `[D] SideMenu`, `[D] Header`, and `[D] CorporateContent`.

Hard rules:

- The required shell is a horizontal Auto Layout root: `[D] SideMenu` on the left; a right vertical Auto Layout containing `[D] Header` above `[D] CorporateContent` with `0 px` gap. This constrained root scaffold is allowed and required for a desktop page.
- Import the three system parts by active catalog keys. Do not replace them with local components or arbitrary manual UI.
- Add page content through the `Body` slot of `[D] CorporateContent`. Replace and remove `SwapMe`; do not detach `Body`, `CorporateContent`, `Header`, or `SideMenu`.
- Control desktop page resolution through variable mode `[D] Grid & Cols` in Appearance. For `1600+`, the base viewport is `1600 x 900` and max content width is `1248 px`. Do not use manual width changes as a substitute for the grid mode.
- Set the explicit `[D] Grid & Cols` mode only on the generated root page frame. `CorporateContent`, `Body`, `Section`, `Header`, `SideMenu`, and all descendants must inherit that mode; never set the same grid collection explicitly on a nested system instance.
- Before finishing, inspect `explicitVariableModes`: the root page frame must hold the intended `[D] Grid & Cols` mode, while `CorporateContent` and other nested page-family nodes must have no explicit mode for that collection. Clear any nested override with `clearExplicitVariableModeForCollection` and then restore the intended mode on the root if Figma resets it.
- `[D] Header`, `[D] SideMenu`, `Body`, `CorporateContent`, and `Section` must remain system component instances when they are contract-defined parts of the page assembly. Do not detach them and do not recreate them as manual frames.
- A generated desktop product page must visibly include active `[D] SideMenu` on the left and active `[D] Header` above `[D] CorporateContent` on the right.
- Use `Gutter`, column variables, `12 Cols`, or `Fill Container` for page-content widths and block spacing according to `p_corporate-page.md`.
- Inside a `Section` slot on desktop pages, assign column widths through `[D] Grid & Cols` variables: primary `Content` area uses `8 Cols`, right `Isle` area uses `4 Cols`, and the gap follows `Gutter`/pattern rules. Do not hardcode `824 px` / `400 px` or similar pixel widths when the grid variables can be bound or selected through the page mode.
- If a section has only one content area, use the relevant `[D] Grid & Cols` width variable such as `12 Cols` or the component contract's declared column variable instead of manual pixel sizing.
- Only skip the desktop page assembly when the target is clearly a local block, modal, drawer, widget, or another non-page surface. The burden of proof is on the generator: if context is ambiguous, use the `[D] SideMenu` + `[D] Header` + `[D] CorporateContent` assembly. State any non-page assumption in the final response.

## Component Selection

Use JSON indexes first:

```bash
rg --files "$DS_AB_ROOT/JSONS/indexes"
rg -n "Button|Status|Plate|Input|Table|Header" "$DS_AB_ROOT/JSONS/indexes"
```

Then read the relevant raw component index/catalog and matching companion folder inside `design-system_ab`, and read only the relevant `agent-context.json`, `rules.json`, `composition-contract.json`, `contract.generated.json`, or `contract.overrides.json`.

Selection rules:

- Match the target platform exactly: desktop `[D]`, mobile-web `[M]`, iOS, Android, or universal.
- If a `web-corp` component exists for the same role as a `web-core` component, prefer `web-corp`.
- Use `web-core` when there is no corp analogue or when the requested element is truly a core control.
- Do not use deprecated components or components from deprecated folders.
- Prefer catalog entries with `status: active`. A `scheduled` component is forbidden as a standalone selection when an `active` component or variant can satisfy the same role, platform, and pattern contract.
- Use a `scheduled` component only as an explicit fallback after checking the relevant indexes and confirming that no `active` analogue exists for the required role/platform/variant. Report that fallback.
- Do not apply the standalone `scheduled` prohibition blindly to service parts required by a component family's composition contract. If `composition-contract.json` requires a scheduled slot/body/helper inside the same family, it may be used only in that contract-defined context and must be reported as a contract-required part, not as a free component choice.
- Do not use promo components for work-focused B2B product UI unless the requested screen is explicitly promo/marketing.
- Do not use local components from the target Figma file, even if their names look like DS components.
- Do not use existing local instances as the source for new UI. They are reference context only.
- Import published DS component variants by key from the JSON catalog.
- Before importing a component key, record the catalog `status` and reject deprecated or disallowed scheduled entries.
- Before selecting a component, read its `agent-context.json` from `design-system_ab`; if it is missing, read the closest available component `README.md`, `contract.generated.json`, and `rules.json` from the same repository, then report the fallback.
- When applying a component, follow its `rules.json`, `contract.overrides.json`, `composition-contract.json`, `contract.generated.json`, and `agent-context.json`.
- Prefer component properties and instance swaps declared by the component contract over manual edits to nested layers.

## Tokens And Styles

Use tokens/styles from `JSONS/tokens` and `JSONS/styles`.

Rules:

- Bind Figma variables when available; use catalog values as fallback only when binding is technically unavailable after trying to import the token by catalog key.
- Use DS typography variables/styles for every visible text node. Do not set final text appearance with manual `fontName`, `fontSize`, `fontWeight`, `lineHeight`, or `letterSpacing` values when a DS text style exists.
- Use DS color tokens for every visible fill/stroke/text color. Do not set final visible color with raw RGB/hex/opacity values when a DS variable exists.
- For manual scaffold text, import the remote typography style from `JSONS/styles` by key and assign `textStyleId`; import the remote color variable from `JSONS/tokens` by key and bind it with `setBoundVariableForPaint`.
- For manual scaffold surfaces, strokes, dividers, icons, and decorative elements, bind the corresponding color/elevation/radius token or use an imported DS component that already carries those bindings.
- Manual typography or raw color values are allowed only as a temporary construction step inside a `use_figma` script. Before returning, the same script or the next validation/fix pass must replace them with DS style ids and variable bindings.
- If a needed style/token cannot be imported or bound, stop and report the missing style/token instead of leaving raw values in the final mockup.
- Use DS radius and elevation patterns; do not choose decorative radii manually.
- Use DS spacing tokens or component-defined spacing. If a spacing token is not directly available, use the closest catalog-confirmed spacing value and note it.

Validation requirements:

- After drawing, inspect visible non-instance text created by the agent. Every such text node must have a non-empty `textStyleId` from DS typography and a text fill bound to a DS color variable.
- Inspect manual visible fills/strokes created by the agent. Each color must be bound to a DS variable unless it is inside an imported DS component instance.
- Treat missing `textStyleId`, missing `fills[0].boundVariables.color`, visible `Inter` fallback text, or raw RGB/hex values on visible manual nodes as violations to fix before finishing.

## Layout And Auto Layout

Prefer Figma Auto Layout for every manually created container that represents interface structure: pages, content slots, sections, islands, cards, headers, toolbars, button groups, form rows, table wrappers, and repeated lists.

Rules:

- Use plain `FRAME` with absolute positioning only for top-level placement on the canvas, non-interface annotations, screenshots/references, or tightly controlled demo matrices where fixed coordinates are the intended artifact.
- Once a container holds related UI children, set `layoutMode`, `itemSpacing`, padding, sizing modes, and alignment instead of manually assigning child `x`/`y` positions.
- Prefer content-driven sizing: use `primaryAxisSizingMode='AUTO'`, `counterAxisSizingMode='AUTO'`, and child `layoutSizingHorizontal`/`layoutSizingVertical` values such as `HUG` or `FILL` where the Figma API and parent context allow them.
- For content placed inside a `Section` slot, set inner structural blocks to horizontal `FILL` after appending them to their Auto Layout parent: section-block wrappers, form rows, table wrappers, island stacks, repeated groups, and action containers should resize with their `8 Cols`, `4 Cols`, or `12 Cols` parent. Use fixed width only when the component contract or grid variable explicitly defines that fixed width.
- Do not set fixed heights on structural containers or imported DS instances by default. Fixed height is allowed only when the component contract, pattern, viewport, table row, thumbnail/demo frame, or explicit user requirement defines that height.
- Avoid resizing imported DS instances in a way that changes their vertical proportions or internal paddings. Prefer preserving the component's intrinsic height, setting width only when the variant is designed to stretch horizontally, or using Auto Layout fill/hug behavior around it.
- Use component-defined layout when a DS component provides it; do not detach or rebuild the internals just to add Auto Layout.
- For imported DS instances inside a manual scaffold, place the instance as a child of an Auto Layout container whenever the instance participates in page/content flow.
- Use absolute positioning inside an Auto Layout parent only for intentional overlays allowed by the component or pattern contract.
- Preserve deterministic pattern spacing through Auto Layout properties: gaps and padding must come from pattern rules, component rules, or catalog-confirmed spacing values.
- If Auto Layout cannot be used because of a Figma API limitation or a fixed illustrative matrix, report that exception and keep it outside the product UI surface.
- When generating a component variant matrix or examples, each preview cell must model the component's required surface context. Do not place all variants on one shared background if the component rules map variants to different page/modal or gray/white surface contexts.

Validation requirements:

- Inspect agent-created non-instance frames that contain two or more visible UI children. They should use Auto Layout unless they are top-level canvas placement, annotations, references, or a reported fixed demo matrix.
- Treat avoidable manual child coordinates inside product UI containers as a layout violation to fix before finishing.
- Inspect agent-created structural frames and imported DS instances for avoidable fixed heights. If height is not contract-defined, viewport-defined, or an explicit fixed demo thumbnail, switch the container to hug/fill sizing or preserve the DS instance's intrinsic height.
- For generated component matrices, inspect every preview surface against the selected variant's rules. Background/context tokens must match the variant's required page or modal surface.

## BackgroundPlateSlot Content Composition

For new product content use the active `[D] BackgroundPlateSlot` / `[M] BackgroundPlateSlot`. It is the content container; `BackgroundPlate` without a slot is legacy for new generation unless a component contract explicitly requires it.

Simple single-surface recipe:

- Put `BackgroundPlateSlot` directly into the final contract-defined parent slot, for example `Section.Content`, `Section.Isle`, or a page-content stack. Do not add a one-child manual Auto Layout wrapper merely to host the plate.
- Place normal content directly in the component's `Slot`. Create inner Auto Layout groups only when they describe real content structure, such as a text stack, list, or toolbar.
- Assign all exterior padding exactly once to the root `BackgroundPlateSlot`. Bind every nonzero root padding side to a `Spacing` token.
- Set every `Slot` padding side to `Spacing/0` when the root already provides the required padding. Do not split the same exterior inset between the root, the `Slot`, and a first content wrapper.
- Keep manual structural frames transparent. A white or colored fill belongs to a DS surface component or to a token-bound surface explicitly required by a pattern, never to an otherwise transparent Auto Layout scaffold.
- Use a manual wrapper only when the plate must genuinely participate with sibling objects in a larger composition that the plate cannot contain itself. The wrapper must have no duplicate exterior padding and no visible raw fill.

Table exception:

- For a `BackgroundPlateSlot` that hosts a table, keep table insets on the plate root and set the inner `Slot` padding to `Spacing/0`. Preserve table-specific gaps and row geometry from the table pattern.

Validation requirements:

- Treat a one-child manual wrapper around `BackgroundPlateSlot`, duplicate exterior padding across its root and `Slot`, or padding repeated again on the immediate content wrapper as a composition violation.
- Treat any raw visible white fill on an agent-created structural Auto Layout frame as a token/style violation. Remove it unless the component or pattern explicitly requires a token-bound surface.
- Verify that normal content is a direct child of the `Slot`, the slot width is `FILL`, the slot height is `HUG`, and padding bindings resolve to `Spacing` variables.

## Table And Modal Workflows

For desktop data scenarios, read the companion contracts for `Table Wide [D]`, `CorporateTopbar [D]`, and `UniversalModal` before drawing.

- `[D] TopBar` and the table `BackgroundPlateSlot` are siblings in the same Level-0 Auto Layout parent. The TopBar precedes the plate and is never appended to its `Slot`. The plate contains `[D] HeadRow :: Universal`, all required `[D] BodyRow :: Wide`, and `[D] StickyPagination`; append each to its Auto Layout parent before assigning `FILL`.
- For a `Table Wide [D]` plate, bind the root/slot insets to `top=Spacing/0` and `right/bottom/left=Spacing/16`. Do not add table padding to rows, wrappers, or cells.
- When a header cell contains title text and interactive controls, preserve its minimum width and make the `Title` area `FILL` with vertical `HUG`. Apply end truncation to the title so it yields to `Sorting`, `HeaderAddon`, and `ColumnControl`; never hide or overlap those controls or leave its height `FIXED` after changing width.
- If a published `Table Wide [D]` row prevents a contract-required column-width change, detach only `[D] HeadRow :: Universal` and the matching `[D] BodyRow :: Wide` rows, as permitted by that family’s composition contract. Keep the library cell instances, resize the same column in head and body equally, and do not rebuild cells manually.
- Do not use `Holding` in `TitleView` unless the brief explicitly names a company group, holding, or group-level context. Set `Holding=false` otherwise.
- A confirmation modal must use the active desktop `UniversalModal` family (`[D] UniversalModalHeader`, `[D] UniversalModalBody`, `[D] UniversalModalFooter`) and their declared slots. Do not assemble a confirmation modal from `BackgroundPlate`, manual modal surfaces, or scheduled `🔄 [D][Corporate] UniversalModalFooter` parts.
- Put the modal title into the declared title configuration of `[D] UniversalModalHeader`, not into `BodyContent` as a manual text node. Use `BodyContent` for the modal message and form content only.
- After modal content is assembled, set `BodyContent` to `FILL` width and `HUG` height. Disable `Scrollbar` when it fits. Set `Overlap=false` on Header and Footer unless a real scroll area moves beneath those fixed regions.
- Before importing any `UniversalModal` part, obtain its exact active component key from the current catalog or Figma library search; do not hand-copy, infer, or reuse a stale key. If import fails, re-query the active library and agent context. Do not replace a failed active part with a scheduled component, a local component, or a manually drawn surrogate.
- To populate `BodyContent` or `FooterContent`, find the actual node with `findAllWithCriteria({ types: ['SLOT'] })`; do not target an identically named internal frame. For `Custom=True` variants, remove the default slot placeholder after appending the intended DS content, otherwise it creates duplicate vertical space or a visible `CUSTOM` placeholder.
- Keep the modal grouping wrapper transparent and Auto Layout. Append it to the page layout before setting `layoutPositioning='ABSOLUTE'`, then position it above the overlay. Use hug sizing for the wrapper and intrinsic sizing for active modal parts; only the page overlay itself may be absolute and viewport-sized.
- For a multi-step business action, draw each meaningful state: an active library menu/popover opened from the row `ActionButton` and showing the named action, the confirmation state, and the result state after the operation. The result must visibly show the completed mutation or an explicit system result; duplicating the entry-state data is invalid. A bare ellipsis and a modal alone are not a complete interaction scenario.

Validation requirements:

- Reject a wide-table assembly unless `[D] TopBar` is a Level-0 sibling of the plate, `[D] StickyPagination` is inside the plate, and every row is `FILL`.
- Reject a table plate unless its insets are `top=Spacing/0`, `right/bottom/left=Spacing/16` and no descendant duplicates them.
- Reject a HeadCell whose title needs `FILL` but has a fixed height.
- Reject a `TitleView` with `Holding=true` when no group-company context is in the request.
- Reject a confirmation surface that lacks active `UniversalModal` family parts.
- Reject a non-overflowing modal with `Scrollbar=true`, Header/Footer `Overlap=true`, a fixed-height `BodyContent`, or a body-level manual duplicate of the header title.
- Reject a task flow that omits either the actionable entry point or the post-action state.

## Pattern Checks

Read pattern files based on the UI being drawn. Common mappings:

- Buttons and action groups: `patterns/p_buttons-and-buttons-group.md`
- Status labels, process states, colors: `patterns/p_status-model.md`
- Status screens: `patterns/p_status-screen.md`
- Inputs and forms: `patterns/p_input-fields.md`
- Islands, plates, surfaces: `patterns/p_islands.md`
- Desktop product pages/page shell: `patterns/p_corporate-page.md`
- Tables: `patterns/p_table-view.md` and `patterns/p_table_format.md`
- Links: `patterns/p_link.md`
- Tooltip and hints: `patterns/p_tooltip_hint.md`
- Border radius: `patterns/p_border-radius.md`

Apply the pattern rules before drawing. For example: desktop buttons must avoid forbidden variants, primary actions go left of secondary actions, process statuses use short process-form text, and working desktop surfaces use the correct surface/radius level.

Do not copy pattern values into this skill. For each requested surface, derive a compact pattern contract from the applicable pattern files:

- source pattern files and applicable rule ids;
- component role -> required DS component, variant, size, or state;
- page shell role -> required `[D] SideMenu` + `[D] Header` + `[D] CorporateContent` assembly, `Body` slot usage, `[D] Grid & Cols` mode, and `Gutter` / column variable constraints;
- section slot role -> required `[D] Grid & Cols` column variables: `Content` = `8 Cols`, `Isle` = `4 Cols`, single full-width content = `12 Cols` or contract-defined equivalent;
- spacing/layout role -> required value from deterministic rules or template snippets;
- title hierarchy role -> required `TitleView` role and variant;
- validation checks needed after drawing.

If a surface-specific pattern and a generic component pattern both apply, the surface pattern controls composition-level decisions such as placement, size, spacing, title hierarchy, and action grouping. Component `agent-context.json` and `rules.json` control whether a component variant is valid and how to configure it.
- For forms, `patterns/p_form-construction-rules.md` controls the lower `Buttons & Controls` group: primary form actions must be placed at the bottom of the form, use `Button` size `56`, and use `16 px` spacing between buttons unless a stricter form-specific pattern overrides it.
- For full-page forms, keep the gap from `TitleView :: xLarge` to the content area at `32 px` and the gap from the last content block or sections stack to the form action group at `32 px`.
- When an active `ButtonsGroup`/`ButtonGroup` component exists for the platform, use it for related form actions instead of a manually assembled row of separate buttons. Configure its nested buttons through component properties/allowed overrides and preserve the group baseline gap.
- For right-column form islands, use the active `IsleBlock` preset/component and `patterns/p_islands.md`. Do not build right-column islands manually from arbitrary frames, text, or plates when `IsleBlock` can satisfy the role.

Treat every pattern rule with `checkType: deterministic` as a numeric/property contract, not a visual suggestion. After drawing, inspect the created Figma nodes and compare actual variants, sizes, gaps, padding, and positions against the derived contract. Fix violations before finishing, or report why a rule could not be satisfied.

## Redpolicy Checks

Before writing Russian UI text, inspect relevant files in:

`$DS_AB_ROOT/redpolrules`

Useful entry points:

- General redpolicy overview: `redpol_rules_context.md`
- Dates: `llm_dates_context.json`
- Numbers and amounts: `llm_numbers_context.json`
- Currency semantics: `llm_currency_semantic.json`
- Navigation wording: `llm_navigation_context.json`
- Particles, dashes, quotes, and letter `ё`: `llm_general_particles.json`, `llm_dash_context.json`, `llm_signs_quotes.json`, `llm_yo_context.json`
- Address wording: `llm_adress_context.json`
- Dictionary checks: `dictionary.json`

Use these rules for labels, statuses, headers, empty states, errors, hints, table text, and action copy.

Text rules:

- Keep button labels action-oriented and short.
- Keep statuses one or two words where possible.
- Do not duplicate the entity name inside a status when the context already provides it.
- Use process forms for in-progress states, such as `В работе`, `Загружается`, or `Отправляется`.
- Avoid bureaucratic or abstract wording when a simpler DS-approved phrase exists.

## Drawing Workflow

1. Parse the request into: platform, target node, purpose, component roles, required states, and copy.
2. If the surface is a desktop product page or full-page screen, read `patterns/p_corporate-page.md`, read the active `[D] SideMenu`, `[D] Header`, and `[D] CorporateContent` catalogs and contracts, set the intended `[D] Grid & Cols` mode on the generated root frame, and plan content insertion through `CorporateContent.Body` before choosing page content components.
3. Discover the matching raw component catalog entries in `design-system_ab/JSONS/indexes`.
4. Resolve each candidate's companion folder in `design-system_ab/JSONS` and read the agent context/rules/contracts.
5. For each candidate component, compare catalog `status` values and reject deprecated entries and disallowed standalone scheduled entries before deciding to use it.
6. Read the component rules and contracts needed to apply it correctly.
7. Prefer `web-corp` over `web-core` for matching B2B roles.
8. Read patterns and redpolicy rules for the requested UI.
9. Search `$DS_AB_ROOT/examples`, inspect matching metadata, and load every relevant page/surface reference according to the Example Reference Workflow. For responsive work, inspect the matching example set across relevant breakpoints.
10. Create a compact implementation plan listing selected components, variants, catalog statuses, tokens, component rules, patterns, composition slots, selected examples, and the derived pattern contract. Track every context file actually read for the generation; this list is required in the final report after each generation.
11. Use `use_figma` incrementally:
   - import components by key from the JSON catalog;
   - create Auto Layout containers for structural layout scaffolding;
   - assign `Section` slot widths from `[D] Grid & Cols` variables (`8 Cols` for `Content`, `4 Cols` for `Isle`, `12 Cols` for full-width content) before placing inner content;
   - append inner section blocks to their Auto Layout parent before setting `layoutSizingHorizontal='FILL'`, so they resize with the selected grid column instead of keeping stale fixed widths;
   - for new plate content, place `BackgroundPlateSlot` directly in its contract-defined parent slot, assign exterior padding only to the plate root through `Spacing` variables, and keep the inner `Slot` padding at `Spacing/0`;
   - place DS components;
   - preserve component intrinsic height unless a contract or pattern explicitly requires fixed height;
   - set component properties;
   - bind variables/styles before considering any visible manual node finished;
   - write final text.
12. Validate:
   - desktop product pages use the required `[D] SideMenu` + `[D] Header` + `[D] CorporateContent` assembly; no `CorporatePage` component was searched, selected, or imported;
   - page content is inserted through the `Body` slot and `SwapMe` is removed;
   - page resolution is controlled through `[D] Grid & Cols`, not manual shell resizing;
   - the intended `[D] Grid & Cols` variable mode is explicit only on the root page frame; `CorporateContent`, `Body`, `Section`, `Header`, `SideMenu`, and their descendants inherit it without nested explicit overrides;
   - `Section` slot widths are controlled through `[D] Grid & Cols` variables: `Content` uses `8 Cols`, `Isle` uses `4 Cols`, and full-width content uses `12 Cols` or a contract-defined equivalent;
   - inner blocks inside each section use horizontal `FILL` where the parent Auto Layout and component contract allow it, rather than stale fixed widths that break page resize;
   - `Header`, `SideMenu`, `Content`, and `Body` remain non-detached system instances;
   - desktop product pages visibly include active `[D] Header` and `[D] SideMenu` in the page shell;
   - the right work area keeps `Header` and `CorporateContent` in one vertical Auto Layout with `0 px` gap;
   - component platform matches the target;
   - no deprecated components were used;
   - no scheduled component was used when an active analogue exists;
   - corp/core preference was applied;
   - no local Figma components were used;
   - `agent-context.json` and component rules were considered for each selected component;
   - the examples directory was searched, relevant references were inspected, and any absence or mismatch was recorded;
   - no component key, variable id, style, lifecycle status, or copy was taken from an example without re-resolving it in current `JSONS` and component agent files;
   - no detached or arbitrary replacement for an available DS component;
   - form content starts `32 px` below the main `TitleView :: xLarge`;
   - the form action group starts `32 px` below the last content block/sections stack;
   - form actions use active `ButtonsGroup` when available, not a manual button row;
   - right-column islands use active `IsleBlock` and satisfy `p_islands.md`;
   - every visible manual text node has a DS `textStyleId` and DS text color variable binding;
   - every visible manual fill/stroke color is bound to a DS variable or replaced by a DS component;
   - agent-created structural containers use Auto Layout, with exceptions only for top-level canvas placement, annotations, references, or reported fixed demo matrices;
   - avoidable fixed heights are absent from structural containers and DS instances; sizing uses hug/fill or component intrinsic height where appropriate;
   - each standalone `BackgroundPlateSlot` is a direct child of its final parent slot, without a redundant one-child manual Auto Layout wrapper;
   - plate exterior padding is assigned once on the `BackgroundPlateSlot` root through `Spacing` variables, and its inner `Slot` padding is `Spacing/0` unless a component contract explicitly requires otherwise;
   - manual structural Auto Layout frames are transparent; no raw white or other visible raw fill is used as an improvised surface;
   - no visible manual text uses fallback typography such as `Inter` or raw `fontSize`/`fontName` as its final styling;
   - all visible text follows redpolicy;
   - form `Buttons & Controls` use `Button` size `56` with `16 px` gap for main form actions;
   - deterministic pattern contract values match the actual Figma nodes;
   - screenshot/read-back shows no overlap and the intended hierarchy.

## Allowed Manual Construction

Manual Figma nodes are allowed only as layout scaffolding or when no DS component exists for the role. For desktop Alfa-Business pages, the root and right-work-area Auto Layout frames are required shell scaffolding around active `[D] SideMenu`, `[D] Header`, and `[D] CorporateContent`; do not treat this as permission to manually recreate system UI.

When manual nodes are necessary:

- Name them as layout/scaffold nodes.
- Use Auto Layout for structural containers and related child groups; avoid manual `x`/`y` child positioning in product UI flow.
- Prefer hug/fill sizing and intrinsic DS component height over fixed heights. Do not vertically squash DS instances to fit a scaffold; let the scaffold grow.
- Use DS tokens/styles for all visible properties. For text this means assigning DS `textStyleId` and binding the text fill to a DS color variable; for colors this means variable-bound paints, not raw RGB values.
- Do not draw custom buttons, inputs, statuses, icons, tags, tables, or plates if DS components exist.
- Keep manual containers transparent unless a DS surface component is unavailable.

## Local Component Restriction

Never use component definitions that live only inside the target Figma file as product UI. Existing local components and instances may be inspected to understand surrounding layout, but they must not be duplicated, instantiated, or treated as the source of truth.

Use only components selected from `$DS_AB_ROOT/JSONS`, interpreted through the matching contract in that same repository, and imported by their catalog key. If importing a required catalog component fails, stop and report the missing component instead of substituting a local look-alike.

## Reporting

After every generation or regeneration, the final response must include a context-file report. This is a hard rule: do not summarize only components; list the concrete local files used to form the layout and component choices.

In the final response, include:

- The Figma node ids created or updated.
- The main DS components/variants used.
- The exact context files used, grouped under these four Russian headings only:
  - `Каталоги`: raw `design-system_ab/JSONS` indexes/catalogs, token/style catalogs, and other raw catalog files used for component keys, statuses, variants, tokens, or styles.
  - `Агентские файлы`: `design-system_ab/JSONS` files such as `agent-context.json`, `rules.json`, `composition-contract.json`, `contract.generated.json`, `contract.overrides.json`, `examples.json`, and related component-agent files.
  - `Паттерны`: files from `design-system_ab/patterns` and visual references from `design-system_ab/examples` when used.
  - `Редполитика`: files from `design-system_ab/redpolrules`.
- Put every used local file in exactly one of these categories. If a category was not used, write `не использовались` under that heading instead of omitting it.
- The key pattern and redpolicy checks applied, including deterministic values such as grid mode, content width, section gaps, padding, and form button size/gap.
- Any fallback or compromise, especially if a DS component could not be imported or did not exist for the requested role.
