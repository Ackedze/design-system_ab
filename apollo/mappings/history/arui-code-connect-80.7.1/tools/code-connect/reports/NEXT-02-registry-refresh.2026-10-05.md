# NEXT-02 Code Connect producer refresh — 2026-10-05

Current ZIP/source freshness and source API availability pass. Producer registry/lock have been refreshed to **1.1.0** for ButtonsGroup desktop r58, CorporateContent desktop r13 and mobile-web r8, including Button r31 and Spinner r8. All code representations remain Draft. Generation integration requires its consumer update; actual existing normalization rejects this producer with `PRODUCER_SCHEMA`.

Authoritative inputs are the NEXT-02 typed-passport summary and authoritative-packaging machine reports. The producer reads these current inputs; historical NEXT-01/05 reports supply history and behavioral evidence only.

- [Current registry](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/arui-private-80.7.1.v1.json)
- [Current full lock](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/lock.v1.json)
- [Machine refresh report, including every root/transitive pin and runtime marker](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/reports/NEXT-02-registry-refresh.2026-10-05.json)
- [History index](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/history/1.0.0-before-next-02-refresh.2026-10-05/index.json)
- [Reproducible bridge verifier](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/refresh/verify-current.cjs)

The `.v1.json` filename and `apollo.arui-private-mappings.v1` schema identify the major format; the producer revision is 1.1.0. The existing producer-owned schema was extended. No Generation/shared schema was created or edited.

## Digests and immutable basis

| Meaning | SHA-256 / canonical digest |
| --- | --- |
| Historical producer / passport basis | `bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0` |
| Current producer digest | `129d129ea3b5b3e4bb112b2cccd1414f59ff8d22cde00721dd58a3dea978fa90` |
| Current input observation digest | `a3c49ed715fd95a83ebd4bc46f11a124aee13258cf2bf696980f5983bdfd3ed6` |
| Current registry file bytes | `c9d12596b43d1051992fa5e624f8e0aab533ebd97f45f0d6ac3586632c28290e` |
| Current lock file bytes | `adaaf649a6767882d5d797047eb094bb7098965a008acc804ec2608c65e1dd00` |
| Current lock canonical digest | `b1e65e9068623e997184d99ce60cff018c45a17a8e487bfead72661a4af3d99c` |
| Machine refresh report bytes | `86cb0cad5f20a9e5723956815b3856df7456b0f5c1303339c389c5daa94239c1` |

Old registry bytes (`4b690c39aa336f258e8a9488115d3b93cf5c84da02675b2a58cd6565b06146d2`) and lock bytes (`303336fc6c4eed02d9a322be600f3985d815d78287680e52a1174ce1d69a7d96`) are retained exactly under history. Historical template bytes have a `.snapshot` suffix so the active Code Connect glob still finds exactly three templates. The pre-refresh `STALE_CONTRACT_PIN: buttons-group.desktop` failure is recorded there.

Passport `locator.registryDigest` and `codeEvidence.sourcePin.registryDigest` remain the historical basis. Neither manuals nor archives were edited by this task. The new digest binds producer metadata, source/mapping artifacts and the full current input observation. No archive→registry→archive cycle was introduced.

## Current closure

| Component | Revision | Archive SHA-256 |
| --- | --- | --- |
| ButtonsGroup desktop | 58 | `c681b49ce0357d70644eed275c7b0e79c4ffc4d80419438cc9453ce859813d32` |
| CorporateContent desktop | 13 | `5848372939d4758635b41d92b4cee94815386507040002f7c2807fd1957955be` |
| CorporateContent mobile-web | 8 | `78a0352a0a2a208f725c94d14ec7f1f4390417d6deaece8edc31592df553727e` |
| Button | 31 | `cd363081f2c8f5cf53d05fa674490e6ba719d46faebc4a7f513130a0f1676330` |
| Spinner | 8 | `8c38d4d3faa9014d7d2ed16e745b0150e9996d576ede807bd87019f441bdbc0f` |

The lock's `inputPackages` records all five exact archive, main-manual, manual-entry, compiled-entry, canonical compiled, manual-source and revision pins, plus direct dependency tuples and embedded dependency entry hashes. Its `currentInputsDigest` additionally locks the complete observation, including authority hashes, statuses, coverage, typed declarations, evidence scopes and runtime markers.

All archive manuals are JSON-equal to their main sources. The ButtonsGroup embedded Button and Button embedded Spinner match the standalone compiled contracts. Button/Spinner archive bytes changed; their revision/manualSourceHash/compiledHash dependency tuples remain unchanged. Full-facts hashes from the authoritative algorithm and narrower compiled generated-facts hashes are recorded separately.

## Validation and scope

`loadRegistry`, `verifyLock`, `verifySource`, desktop/mobile `preflight` and `emit` pass against actual current inputs. **40 tests pass**, including rejection of transitive repacking, byte-changed main passports, forged observation metadata, incomplete locks and Draft promotion. Schema QA passes with existing Ajv 6.15.0. All three parserless templates parse with Code Connect 2.0.1 and pass TypeScript 5.3.3 checks.

Generated desktop and mobile files typecheck against genuine selective arui-private declarations and installed Core 50.26.1-alfasans. The two public imports remain `arui-private/button-group` and `arui-private/corporate-content`; mapping IDs, source API/defaults, Figma/property mappings and route restrictions are unchanged. Desktop generated file bytes are identical to the historical file. Template logic/imports are identical; their metadata now describes the actual Draft code representations.

The producer rebuild was checked separately: registry and lock file bytes are identical after rerunning `node registry/build.cjs`.

Observed versions: editor 0.2.91, shared core 0.1.10, manual v2-experimental, compiled v2.1-experimental; codeEvidence/codeTransform/ownedOccurrence/collectionResolver/nativeSlotBinding version 1. Runtime markers are recorded per package in the JSON report and reject unknown versions; `validationIntentVersion` is 2, other observed markers are 1. These observations provide no native writer/capture or predicate-execution capability.

## Historical NEXT-05 bridge

- Source-build report stays exact: `dce4d24a90e7ad8baf34f840d74b7488ea7124599633bb2986e0c923b1a57b34`.
- Recipe report stays exact: `7db2310da5d6684d79f21da519edd08cfe929df8578f2b5d287793f58e5f9f8f`.
- Environment receipt stays exact: `e05ad523f903b89860e3e2070cce19bfdc54f927c4d43cda51db4f8b02b47d96`.
- Verified **694** historical pins: 67 source/artifact/output pins, 26 recipe pins, 115 distribution files and 486 installed package manifests. The distribution file set is also unchanged. Host/tooling manifests and locks, Node and Chrome executable hashes match the historical records.

Environment verification covers manifests/version and locked integrity/resolution metadata. Historical full installed-package payload hashes and the system font file hash do not exist. The declared bem-react-classname/React peer conflict and unreproduced full private root build remain documented gaps.

Browser receipts belong to their original 1.0.0 contract inputs. They remain historical behavioral evidence; current source freshness is newly verified here. No browser, Figma, publication or release run was repeated. Baseline and opt-in recipes remain proposed. New plan-bound frontend proofs belong to Generation.

## Handoff to Generation

Existing `packages/generation-core/src/planning/code-connect.ts:37` admits only producer 1.0.0. Its lock type at line 26 and expected lock at line 41 contain only the original five fields. The existing built `dist/planning.cjs` actually rejects this 1.1.0 producer with `PRODUCER_SCHEMA`; the probe is a negative compatibility check, not a generation proof.

1. Explicitly support 1.1.0 while retaining historical 1.0.0. Extend the existing producer types/consumer, preserving exact digest/freshness checks.
2. Validate the added lock fields `basisRegistryDigest`, `currentInputsDigest`, `inputPackages` and their complete five-package byte/semantic closure. Do not drop extra lock fields to pass the old comparison.
3. Refresh Generation-owned locks from actual authoritative ZIPs. Preserve the source/code status split: BG Draft; CC Source Ready covers its existing Figma rules only; all code representations Draft.
4. Create trusted current representation observations with the passport basis, current producer digest, full evidence scope, codeHash and verifiedRefs. `representation-proof.ts` already separates basis and current digests. This producer's `inputObservation` and bridge report are freshness evidence, not that plan-bound receipt.
5. Keep native slot/owned occurrence capabilities, accepted profiles and acceptance receipts absent until independently proven.

ButtonsGroup remains 17 Reviewed source rules + 9 context Draft rules / 30 compiled checks. Its route remains desktop Size=56, Overflow=false, one to four proven text actions, real handler references and measured width fit. Each CorporateContent remains six source Figma rules / seventeen checks; Body→children is confirmed, geometry/padding/surface parity is unconfirmed. Full parity is `not-confirmed`, acceptance `not-run`, native capabilities `not-declared`, publication `not-confirmed`, release `not-released`.

No Generation/Proxy/shared schema, source implementation, DS manual, historical frontend host or historical receipt was edited. No other thread was messaged by this refresh task.
