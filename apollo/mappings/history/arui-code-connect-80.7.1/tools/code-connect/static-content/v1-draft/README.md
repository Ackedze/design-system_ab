# Static content source/API review · v1 Draft

Additive helper for the exact NEXT-03 request. This produces a **JSON review
artifact**, with `accepted=false`, `executionAllowed=false` and both targets
`not-supported`. It writes no JSX, Figma nodes or frontend target files. The
registry 1.1.0, full lock and previous interactive emitter remain frozen.

Input is the existing closed
`apollo.screen-spec.static-content.v1-draft`: desktop CorporateContent Body →
ButtonsGroup Size `"56"`, two ordinary text actions with explicit ActionID, label,
View, disabled and `loading:false`. Display and highest-first business priority
orders must both be explicit permutations. No events, handlers, transitions,
callbacks, functions or defaults for missing product decisions are permitted.

The public API can express the labels, disabled flags and `loading:false` without
callbacks. Size maps from the wire string `"56"` to public numeric `56`.
CorporateContent Body maps to `children`. ButtonGroup supplies View through
`primaryFirst`: only the first displayed ordinary button can be primary; later
buttons are secondary. A later primary returns `STATIC_VIEW_NOT_SUPPORTED` and
`apiIntent=null`. An independent priority/display conflict also returns
`not-supported`, retaining both requested orders. Priority remains separate
semantic metadata; it is not inferred from View or item storage order.

`overflow:false` is requested review content. `maxVisibleButtons:4` alone cannot
prove the allocated width, actual fit, fonts or target visibility. The helper
provides no width receipt or target support.

The real Generation loader fails on the frozen BG r59 Draft source:

`SOURCE_COMPILE: Cannot verify web-corp.buttons-group: Runtime requires an accepted ready contract`

The helper records this result. It never substitutes a relaxed runtime, uses
compiled caches to bypass that gate, or creates an authoritative Generation view.
Its `apollo.code-connect.static-review-plan.v1-draft` is a **different,
producer-owned review plan**; `generationPlanHash=null`. It is not
`apollo.composition-plan.static-content.v1-draft` and cannot enter either current
target executor. The preflight is also producer-owned review data.

The bounded observation ties exact input/review-plan/content hashes to the
producer manifest, consumer/runtime/provider/build hashes, frozen registry/lock,
all five current packages and mapping/representation references. Source/API
expressibility does not accept profiles, parity, scoped receipts or native
capabilities. Canonical occurrence and symbol IDs remain null. Four source
occurrences, two visible product actions and two hidden occurrences are required
future verification, not observed mappings or permission to delete nodes.

Use existing installed dependencies; no installation or publication is needed:

```sh
node tools/code-connect/static-content/v1-draft/build.cjs
tools/code-connect/node_modules/.bin/tsc --noEmit -p tools/code-connect/static-content/v1-draft/tsconfig.json
node --test tools/code-connect/tests/static-content.test.cjs
```

`prepareStatic(spec)` returns immutable review data. `emitStatic(prepared)` is
asynchronous JSON serialization; it rechecks the exact pinned source closure and
recomputes the whole result, rejecting changed imports, props, hashes, IDs,
provenance or authority flags. Emit means serialization of review data here.

The fixture uses synthetic labels and dimensions. Actual product View, disabled,
explicit Loading=false, business priority and viewport height remain unresolved;
the owner's current input is unchanged and rejected rather than filled from the
separate unapproved proposal.

See [consumer review request](CONSUMER_REVIEW_REQUEST.md) for the remaining
integration boundary.
