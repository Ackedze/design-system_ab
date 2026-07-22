#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../../..");
const validator = path.join(
  repoRoot,
  ".claude/skills/corp-component-authoring/scripts/validate-component-package.mjs",
);

const result = spawnSync(process.execPath, [validator, ...process.argv.slice(2)], {
  cwd: repoRoot,
  stdio: "inherit",
});

if (result.error) {
  console.error(`Не удалось запустить package validator: ${result.error.message}`);
  process.exit(2);
}

process.exit(result.status ?? 2);
