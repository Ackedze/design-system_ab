# Finite consumer binding: stage1 tooling

This directory prepares one future additive static-review snapshot. Stage1 does not authorize a freeze, snapshot build, config repin or receipt sealing. `producer.cjs` is a byte-identical v1 helper copy. No production manifest, output, basis, V0/V1 vector, C0 archive, request or receipt is present here.

All results remain Draft, `accepted:false`, `executionAllowed:false`, `generationPlanHash:null`. Byte binding does not accept source rules, profiles, parity, native/scoped providers, coverage, live execution or release. The original v1 output has no top-level `generationPlanHash` or `observationHash`; those live in `plan`/`observation`. Do not add them to v1 to accommodate a consumer validator.

## Trust and order

Finish and review all Code Connect tooling and Generation source/tests/docs/build before V0. The finite sequence is:

1. Sources and standard build; immutable raw C0 archive, without changing C0.
2. V0, covering every baseline file, every original build-input path, reviewed source deltas and additions, all tooling and C0/archive. V0 excludes its own file and every downstream request/P/O/B/R/D/G.
3. Independently reviewed external request containing the exact V0 pin. Its raw SHA comes from local operator context, not from the request itself. It declares every baseline-to-V0 delta and addition and three actual static v1 specs.
4. P, three O outputs, then B, written once. P covers the whole V0 inventory, external request and historical basis. No future hashes are embedded in frozen source.
5. One C1 write selecting the exact P/B pins. Only the four selector string values change, preserving C0 formatting. C1 retains the closed v1 config schema and has no receipt field.
6. V1 with all V0 paths, config-only delta and the exact downstream additions. No code/docs/build edits occur after V0.
7. Generation seals detached R after independent checks. The local receipt trust pin is supplied outside all hashed artifacts. D and General proof G may reference R; R and earlier artifacts cannot reference D/G.

The local context is outside V0/P/V1/R, HTTP, imported JSON and UI bundles. Its raw pin must be independently trusted for every invocation. No fallback computes expected request or receipt hashes from imported bytes. Hashes provide byte identity relative to that trust; they are not signatures and do not prove an arbitrary operator context is authorized.

## Modules and future invocation

- `protocol.cjs`: closed pins/request/vector/config checks, full baseline/build/source closure, exact deltas, config transition and phase graph.
- `builder.cjs`: read-only candidate/preflight, guarded asynchronous reads, exclusive-create C0 archive and future P/O/B writer. Actual writing calls the unchanged v1 producer and strict registry/source bridge.
- `verifier.cjs`: structural output hash/provenance inspection and detached receipt validation; preserves every original mismatch row. It does not run Generation DTO/source/API evaluation.
- `caller.cjs`: operator-only CLI. Roots are anchored to this checkout. All source/test/doc/schema files and all 42 historical snapshot/handoff files must be pinned. No importing of the CLI performs work.
- `interface.schema.json`: structural interface definitions, without real pins or specs.
- `structural-fixture.cjs`, `protocol.test.cjs`: artificial in-memory bytes. They do not contain valid source packages or runtime specs and do not call the actual build, source reader, API, HTTP or Figma.

The following commands document future operations only; do not run archive/build/receipt operations in stage1:

```sh
node caller.cjs preflight /absolute/operator/context.json <independently-trusted-context-sha256>
node caller.cjs build /absolute/operator/context.json <independently-trusted-context-sha256>
node caller.cjs inspect /absolute/operator/context.json <independently-trusted-context-sha256>
node caller.cjs verify-receipt /absolute/operator/context.json <independently-trusted-context-sha256>
```

Before V0, `archive-c0` takes an independently pinned context whose `requestPin`, `manifestPin`, `reportPin`, `receiptPin` are null. It copies baseline C0 bytes to `preselection-config.json` using exclusive creation. The archive pin is then included among V0 additions. V0/request/P/O/B/R are produced only after the separately authorized handoff. `preflight` computes a candidate in memory and writes nothing. `build` refuses any existing output path; a partial failure is stopped and reviewed, never overwritten or silently rebound. Reusing an output helper from another directory is invalid because v1 loads its manifest next to the helper.

The local context has exactly: `schemaVersion`, `roots`, `requestPin`, `baselineVectorPin`, `baselineManifestPin`, `baselineReportPin`, `toolPins`, `immutablePins`, `manifestPin`, `reportPin`, `receiptPin`. `roots` are absolute `workspace`, `producer`, `generation`. Each pin is exactly `{path,sha256}`; absent future pins are null. Before build, P/B/R pins are null. At readback all three are independently selected pins. Updating this external context after sealing does not change hashed sources.

## Generation interface

V0/V1 match the consumer vector schema `apollo.static-review-consumer-vector.v1-draft` with exactly `{schemaVersion,phase,files,buildInputs}`. `phase` is `preselection` or `final`. Both lists use absolute unique raw pins. The downstream builder request additionally supplies the config/build-manifest pins and reviewed versions; they are checked against V0 and the standard manifest. Preserve all baseline build-input paths and check all actual manifest inputs, including new inputs. No fixed 96-file sample replaces this check. Runtime/main/UI/reader/provider are included even if they are build outputs rather than build inputs.

R uses `apollo.static-review-consumer-binding.v1-draft` and exactly:

| Field | Contents |
| --- | --- |
| `schemaVersion,status,accepted,executionAllowed,generationPlanHash` | Receipt version, `draft`, false, false, null |
| `baselineVectorPin` | Independently reviewed original baseline vector |
| `producer` | `{manifestPin,basisPin,artifactDigest,outputs}`; output rows are exactly path/raw SHA/inputHash/planHash/contentHash/observationHash |
| `preselection` | `{vectorPin,configArchivePin,configPath,configSha256}` with archived C0 |
| `selection` | `{configPin,manifestPin,reportPin}` with actual C1 and independently selected P/B |
| `final` | `{vectorPin,buildManifestPin,runtimePins}`; six required runtime/main/UI/reader/core/provider pins |
| `closurePins` | Exact deduplicated P producer/API/consumer/workspace/build/request/frozen-package closure, retaining the original C0 pin |
| `additions` | Exact `{role,pin}` rows for downstream artifacts absent from V0: producer, basis, output, request, config-archive, preselection-vector |

The original P freshness at C1 remains stale with the actual config mismatch. The separate consumer binding result may become `matches` only through Generation's validated receipt. This verifier returns `structurally-verified`, never a runtime acceptance result. It checks the historical P basis using archived C0 and requires all other bytes to match current files. Its `assertCurrent()` rechecks the complete observed final inventory before and after any caller await.

## Checks and remaining dependencies

Run the owned structural suite with `node --test protocol.test.cjs`. N01–N09 cover raw config formatting/selectors, wrong or missing independent pins, closed receipt fields, archive/baseline omission, every artificial original/new build input, all five artificial package ZIP/manual pairs, registry/lock/API drift, output hashes/content/provenance, unsupported structural cases, asynchronous drift, rollback and forbidden graph edges.

These tests do not validate actual static v1 specs, public API projection/assignability, missing product fields, strict SOURCE_COMPILE behavior, v2 request/input/build/result DTO hashing or actual Node/Proxy/UI transport. Generation owns those tests and the consumer integration. General must review both complete source inventories and standard build evidence before V0. Consumer checks must read v1 `document.observation.observationHash` and `document.plan.generationPlanHash`/`document.observation.generationPlanHash`; a check against nonexistent top-level fields would reject every unchanged v1 output. Keep that integration dependency explicit.

Stage1 handoff remains private and outside the new source inventory. Production freeze/request/snapshot/config/receipt/readback are outstanding stages.
