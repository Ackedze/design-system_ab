# Exact static producer rebind · final consumer · 06.10.2026

New additive snapshot for the General-reviewed final Draft source-review
consumer. All previous `v1-draft` files, report JSON/MD and static test bytes stay
unchanged. The copied `producer.cjs` is byte-identical to the previous helper;
the output, review-plan and observation wire versions and semantics are unchanged.

This snapshot contains a new producer manifest, three synthetic review JSONs and
an independently pinned basis report. `review-harness.cjs` contains the explicit
caller manifest/report pins for the current and historical snapshots. Imported
JSON cannot choose these pins.

Current bindings: shared core 0.1.10 / generation-core 0.1.1 / Apollo v4 0.4.0 /
Editor 0.2.91. Consumer vector SHA256
`cc4a90e4c49400f66ab018c2ef560b52c55c10390c7a99be1cf80490d477729c`.
The rebind rereads all 188 requested files, 165 consumer files, the proxy file,
95 build inputs, actual source/API files and the full CC desktop13/mobile8 /
BG59 / Button31 / Spinner8 source/main/ZIP/dependency closure. Frozen registry
1.1.0, full lock and immutable passport basis remain byte-identical.

The new `loadStaticProducerReview` can inspect this snapshot using a separate
read-only authoring metadata compiler path. Fresh correspondence is **source/API
and review import only**. `inspected` is not execution/profile acceptance.
The real strict source loader still rejects BG59 Draft with `SOURCE_COMPILE`.
Neither source review hash nor producer review-plan hash is a Generation plan
hash: `generationPlanHash=null`, `accepted=false`, `executionAllowed=false` and
both targets blocked. The original closed preflight wire is retained; its
unsupported Generation route does not describe the separate review-only port.

The supported synthetic output preserves labels, explicit disabled and
`loading:false`, Body → `children`, owned `button-label` and Size `"56"` → numeric
56, without callbacks. A primary View after the first displayed ordinary button
is unsupported. Conflicting explicit display/priority orders are unsupported.
Both negative outputs retain their requested values and `apiIntent=null`.
Priority is separate metadata; canonical occurrence/symbol IDs stay null.
Requested Overflow=false still needs real width/font/target visibility evidence.

The historical three outputs must inspect as `stale`, retaining old observations
and 13 unique consumer mismatches. They are not relabelled as current; the old
helper's current freshness check fails `STALE_STATIC_CONSUMER` by design.

Targeted regression commands from the arui-private repository:

```sh
node --test tools/code-connect/tests/corporate-content.test.cjs tools/code-connect/tests/mappings.test.cjs tools/code-connect/tests/refresh.test.cjs tools/code-connect/static-content/rebind-2026-10-06-final/regression.test.cjs tools/code-connect/static-content/rebind-2026-10-06-final/inspection.test.cjs
tools/code-connect/node_modules/.bin/tsc --noEmit -p tools/code-connect/static-content/v1-draft/tsconfig.json
tools/code-connect/node_modules/.bin/tsc --noEmit -p tools/code-connect/tsconfig.json
```

`regression.test.cjs` runs the 19 frozen static assertions with an explicit module
binding to this snapshot. The historical suite and source file remain untouched.
`inspection.test.cjs` verifies actual current and historical imports, independent
source/consumer/content/authority rejection, and post-async freshness failures.
I/O fault tests modify bytes returned in memory; they edit no protected files.

The actual product input remains unchanged and unresolved. No owner proposal is
copied into View/disabled/Loading/priority/height. Actual width is measured in a
separate future step. No JSX/native target files, events/no-op handlers, Figma or
browser execution, installs, publishing, source Ready/profile/scoped/native/live
acceptance or overall five-goal completion is claimed here.
