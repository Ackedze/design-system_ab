# CorporateContent — Code Connect

Текущая передача для Apollo v4: [NEXT-01](NEXT-01.md), включая ButtonsGroup,
CorporateContent desktop/mobile-web, versioned registry и ограничения маршрутов.
Ниже сохранены история desktop bridge и publication evidence от 01.10.2026.

Parserless source: `CorporateContent.figma.ts`. Единственный редактируемый
источник этого моста; generated CLI JSON — проекция, не второй source of truth.
Runtime React API и production dependencies не изменены.

## Mapping

- Contract componentId: `web-corp.corporate-content`.
- Representation: `web-corp.corporate-content.figma.desktop`.
- Published Figma file: `NrzEFUSTXgzOUmsfYym0xD`, node `89622:29551`.
- Component key: `a8d13cb6e1ae67a7296709f669238f41971c7197`.
- Native SLOT friendly name `[D] Body`, exact API key `[D] Body#135096:3`.
- SLOT payload maps to React `children`, including empty or mixed content.
- Public import: `import { CorporateContent } from "arui-private/corporate-content";`.
- React source: `src/corporate-content/corporate-content.tsx`.

No fabricated background, grid, width, platform or breakpoint props.
No mandatory Section, placeholder markup or generated div/Tailwind substitute.
Nested payload must have its own component mappings to produce meaningful code;
this mapping alone does not validate every child's contract.

## Проверка

Из этого каталога:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm test
npx --no-install figma connect parse --config ../../figma.config.json --dir ../.. --skip-update-check --exit-on-unreadable-files
```

Official CLI 2.0.1 pinned in this isolated tooling package; root project dependencies
and runtime source files were not changed. Five local tests cover exact SLOT lookup,
dynamic payload/empty content, supported props and named public import.
CLI parse/typecheck pass. Full application/browser visual parity was not tested.

## Publication status · 2026-10-01

The owner disconnected the previous pointer. Before retry, actual Figma readback
was `{}` and Code Connect suggestions reported this component as unmapped.
The connector then received the full executable template produced by official
CLI 2.0.1 (739 characters) with `isParserless: true` and `nestable: true`.
It returned success, but both labelled and unlabelled readbacks still returned
`hasTemplate=false`, no snippet imports and the generated fallback without
the authored Body payload. The source/name pointer has been recreated; the
executable template has not been confirmed as persisted.

Retry evidence is saved in design-system_ab:
`experiments/web-corp/CorporateContent/authoring/reports/code-connect-retry.2026-10-01.json`.
Parse, typecheck and all five tests passed again; the template hash is unchanged.
Repeating a UI disconnect plus the same connector publication did not resolve
the problem. No secret was requested or recovered from other applications.

Next publication route: with an authorized Figma CLI environment, publish the
local template using `--force` to replace the recreated UI pointer:

```sh
npx --no-install figma connect publish --config ../../figma.config.json --dir ../.. --skip-update-check --exit-on-unreadable-files --force
```

This command has NOT been run: `FIGMA_ACCESS_TOKEN` is absent from the current
CLI environment. Configure it locally; never paste tokens into a chat or commit them.
Completion gate: persisted executable template, named import and Body payload
must survive actual Figma readback; empty Body must not generate placeholders.

## Contract vs code parity

Accepted Figma manual r11 covers six desktop rules / 17 RuleIR checks.
This source is a separate code bridge, not an automatic modification of that manual.
React uses row flex layout, responsive padding and a theme API that do not map
one-to-one to the Figma geometry/background collection.
Do not claim full frontend generation/validation parity or rewrite React CSS
until a separate parity profile has been agreed.
