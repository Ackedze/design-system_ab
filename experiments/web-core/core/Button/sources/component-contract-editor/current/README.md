# ComponentContract Editor

Experimental Figma plugin for authoring the manual layer of one component-scoped
`ComponentContract`. Generated Athena/Figma facts are read-only; RuleIR, runtime
policy, capability coverage and hashes are compiler output.

Практическая инструкция: [`docs/USER_GUIDE.ru.md`](docs/USER_GUIDE.ru.md).
Открытые продуктовые задачи: [`docs/BACKLOG.ru.md`](docs/BACKLOG.ru.md).

## MVP workflow

1. Import an Athena agent package (`.zip` or JSON files), a canonical
   `contract.manual.json`, or an existing compiled v2 contract.
2. Render the referenced component in an isolated temporary Figma page and switch
   its main variants and variable modes.
3. Select a node in the anatomy tree. The editor stores a semantic target with
   path, lineage, name and node-id hints, and reports `resolved`, `ambiguous`,
   `missing`, or `unknown` after each preview refresh.
4. Open **Паспорт** and author the stable component identity, semantics,
   Figma/code representations, semantic API bindings, documentation links,
   examples, normative decisions and generation profiles.
5. Author permission, control path, typed constraint, product/channel
   applicability, execution route, severity, source references, rationale,
   owner, status and safe remediation.
6. Compile and run the exact Apollo Predicate Engine embedded from
   `services/apollo-proxy/src/predicate-engine/index.js`.
7. Test one selected document instance against an independently rendered
   effective baseline without replacing the open manual workspace.
8. Export deterministic ZIP containing manual source, compiled contract,
   validation report and coverage report.

The compiled JSON is visible only in a read-only dialog and is never accepted as
a lossless replacement for the manual authoring source.

A standalone manual source intentionally has no generated variant inventory.
The Editor therefore does not call `importComponentByKeyAsync` with its
Component Set key; select a document instance to materialize the test subject,
or import Athena evidence to enable isolated variant preview.

Permission is not overloaded as a routing mechanism: `allowed` is emitted as a
policy-only entry, `forbidden` compiles to an effective-baseline check, and
`constrained` compiles the selected typed constraint. Delegation is expressed by
an `inherited-port` control path, not by a fourth permission state.

Execution is a separate axis. Each rule declares `predicate`, `policy-only`,
`delegated`, or `context-only` (or lets `auto` select the safe default). The
compiler never turns prose or a missing runtime fact into an executable check.

One stable `componentId` may contain multiple Figma and code representations.
Switching desktop/mobile evidence changes preview context without creating a
parallel semantic contract or losing edits to the shared manual source.

## Run locally

```bash
npm run validate
```

Then import `manifest.json` in Figma Desktop via **Plugins → Development → Import
plugin from manifest**.

## MVP boundaries

- One semantic component per session, with multiple representation previews.
- Eight typed constraint families: property domain, presence/absence, forbidden
  property, quantity, position/order, relationship, token binding and layout.
- External ownership is represented only by a component-local control port. A
  later `PatternContract` can bind that port to the real owner.
- Existing compiled v2 files are retained as read-only evidence. They do not
  regenerate missing manual intent.
- No Git publishing, AI rule generation, code mapping editor, pattern/page rules,
  arbitrary RuleIR editor, or automatic mutation of the user document.

The preview and selected-instance reference renderers always remove their
temporary instances and service pages in `finally` blocks, including error
paths. Post-generation validation reuses the same snapshot contract and Apollo
Predicate Engine; generation and automatic repair themselves remain outside the
Editor MVP.
