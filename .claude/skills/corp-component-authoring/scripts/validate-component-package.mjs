#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REQUIRED_FILES = [
  "README.md",
  "agent-context.json",
  "audit-mapping.json",
  "composition-contract.json",
  "contract.generated.json",
  "contract.overrides.json",
  "examples.json",
  "rules.json",
];

const JSON_FILES = REQUIRED_FILES.filter((fileName) => fileName.endsWith(".json"));
const PACKAGE_FILE_NAMES = new Set(REQUIRED_FILES);
const ALLOWED_STATUSES = new Set(["draft", "generated-draft", "legacy", "ready"]);
const TEMPLATE_MARKERS = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\[TODO:/i,
  /Generated component contract package/i,
  /Component purpose and usage guidance/i,
  /Context ownership for internal instances/i,
];

const args = process.argv.slice(2);
const changedMode = args.includes("--changed");
const changedFrom = getOptionValue(args, "--changed-from");
const targetArgs = args.filter((arg, index) => {
  if (arg === "--changed") {
    return false;
  }
  if (arg === "--changed-from" || args[index - 1] === "--changed-from") {
    return false;
  }
  return true;
});
const repoRoot = getRepoRoot();

let packageDirs;
if (changedMode && changedFrom) {
  console.error("Используй только один режим: --changed или --changed-from <git-ref>.");
  process.exit(2);
} else if (changedMode || changedFrom) {
  packageDirs = findChangedPackageDirs(repoRoot, changedFrom);
} else if (targetArgs.length > 0) {
  packageDirs = targetArgs.map((target) => resolvePackageTarget(repoRoot, target));
} else {
  printUsage();
  process.exit(2);
}

packageDirs = [...new Set(packageDirs.map((packageDir) => path.resolve(packageDir)))].sort();

if (packageDirs.length === 0) {
  process.exit(0);
}

let errorCount = 0;
let warningCount = 0;

for (const packageDir of packageDirs) {
  const result = validatePackage(repoRoot, packageDir);
  errorCount += result.errors.length;
  warningCount += result.warnings.length;

  if (changedMode && result.errors.length === 0) {
    continue;
  }

  const relativeDir = toPosix(path.relative(repoRoot, packageDir));
  console.log(`\n[package] ${relativeDir}`);

  for (const message of result.errors) {
    console.error(`[error] ${message}`);
  }
  for (const message of result.warnings) {
    console.warn(`[warning] ${message}`);
  }
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("[ok] Структурных ошибок и предупреждений не найдено.");
  }
}

if (errorCount > 0) {
  console.error(
    `\nComponent package validation failed: errors=${errorCount}, warnings=${warningCount}`,
  );
  process.exit(2);
}

if (!changedMode) {
  console.log(`\nComponent package validation passed: warnings=${warningCount}`);
}

function validatePackage(rootDir, packageDir) {
  const errors = [];
  const warnings = [];
  const documents = new Map();

  if (!isDirectory(packageDir)) {
    return {
      errors: [`Package directory не найден: ${packageDir}`],
      warnings,
    };
  }

  for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(packageDir, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`Отсутствует обязательный файл ${fileName}.`);
    }
  }

  for (const fileName of JSON_FILES) {
    const filePath = path.join(packageDir, fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    try {
      documents.set(fileName, JSON.parse(fs.readFileSync(filePath, "utf8")));
    } catch (error) {
      errors.push(`${fileName}: невалидный JSON (${error.message}).`);
    }
  }

  const metadataStatuses = new Map();
  const componentKeys = new Map();
  const rawCatalogPaths = new Set();

  for (const [fileName, document] of documents) {
    if (!isPlainObject(document)) {
      errors.push(`${fileName}: корнем должен быть JSON object.`);
      continue;
    }

    if (fileName !== "contract.generated.json") {
      validateOwnedDocument(fileName, document, errors, warnings);
    }

    const status = document.metadata?.status;
    if (typeof status === "string") {
      metadataStatuses.set(fileName, status);
      if (!ALLOWED_STATUSES.has(status.toLowerCase())) {
        errors.push(`${fileName}: неизвестный metadata.status=${JSON.stringify(status)}.`);
      }
    }

    const componentKey = document.metadata?.componentKey;
    if (typeof componentKey === "string" && componentKey.trim()) {
      componentKeys.set(fileName, componentKey);
    }

    const rawCatalogPath = document.generated?.source?.rawCatalogPath;
    if (typeof rawCatalogPath === "string" && rawCatalogPath.trim()) {
      rawCatalogPaths.add(rawCatalogPath);
    }
  }

  const uniqueComponentKeys = new Set(componentKeys.values());
  if (uniqueComponentKeys.size > 1) {
    errors.push(
      `Несогласованные metadata.componentKey: ${formatMap(componentKeys)}.`,
    );
  } else if (uniqueComponentKeys.size === 0) {
    warnings.push("В owned-документах не найден metadata.componentKey.");
  }

  const uniqueStatuses = new Set(
    [...metadataStatuses.values()].map((status) => status.toLowerCase()),
  );
  if (uniqueStatuses.size > 1) {
    warnings.push(`Статусы документов различаются: ${formatMap(metadataStatuses)}.`);
  }

  if (rawCatalogPaths.size > 1) {
    errors.push(`Hybrid-документы ссылаются на разные raw: ${[...rawCatalogPaths].join(", ")}.`);
  }
  for (const rawCatalogPath of rawCatalogPaths) {
    const resolvedRawPath = resolveRepoPath(rootDir, rawCatalogPath);
    if (!fs.existsSync(resolvedRawPath)) {
      errors.push(`Raw-каталог из generated.source не найден: ${rawCatalogPath}.`);
    }
  }

  validateGeneratedContract(documents.get("contract.generated.json"), errors, warnings);
  validateRules(documents.get("rules.json"), errors, warnings);
  validateReadyContent(documents, metadataStatuses, errors, warnings);

  const readmePath = path.join(packageDir, "README.md");
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, "utf8");
    validateTemplateMarkers("README.md", readme, warnings);
    if (!/##\s+Статус/i.test(readme)) {
      warnings.push("README.md: нет явного раздела «Статус».");
    }
  }

  for (const [fileName, document] of documents) {
    if (fileName === "contract.generated.json") {
      continue;
    }
    validateTemplateMarkers(fileName, JSON.stringify(document), warnings);
  }

  if (fs.existsSync(path.join(packageDir, "catalog.raw.json"))) {
    errors.push("Найден запрещённый дубль raw-каталога catalog.raw.json.");
  }

  return { errors: unique(errors), warnings: unique(warnings) };
}

function validateOwnedDocument(fileName, document, errors, warnings) {
  if (typeof document.schemaVersion !== "number") {
    errors.push(`${fileName}: отсутствует numeric schemaVersion.`);
  }
  if (typeof document.documentType !== "string" || !document.documentType.trim()) {
    errors.push(`${fileName}: отсутствует documentType.`);
  }
  if (!isPlainObject(document.metadata)) {
    errors.push(`${fileName}: отсутствует metadata.`);
  }

  if (document.schemaVersion >= 2) {
    if (!isPlainObject(document.generated)) {
      errors.push(`${fileName}: ownership schema v2 требует object generated.`);
    }
    if (!isPlainObject(document.manual)) {
      errors.push(`${fileName}: ownership schema v2 требует object manual.`);
    }
  } else {
    warnings.push(`${fileName}: legacy ownership schema, требуется миграция в v2.`);
  }
}

function validateGeneratedContract(document, errors, warnings) {
  if (!document) {
    return;
  }
  if (!Array.isArray(document.contracts) || document.contracts.length === 0) {
    errors.push("contract.generated.json: contracts должен быть непустым массивом.");
  }
  if (!isPlainObject(document.source)) {
    warnings.push("contract.generated.json: отсутствует source metadata.");
  }
}

function validateRules(document, errors, warnings) {
  if (!document) {
    return;
  }

  const sections = [
    ["rules", document.rules],
    ["generated.rules", document.generated?.rules],
    ["manual.rules", document.manual?.rules],
  ].filter(([, rules]) => Array.isArray(rules));

  if (sections.length === 0) {
    errors.push("rules.json: не найден массив rules ни в одной ownership-секции.");
    return;
  }

  for (const [sectionName, rules] of sections) {
    const ids = new Set();
    for (let index = 0; index < rules.length; index += 1) {
      const rule = rules[index];
      const location = `${sectionName}[${index}]`;
      if (!isPlainObject(rule)) {
        errors.push(`rules.json ${location}: правило должно быть object.`);
        continue;
      }

      for (const field of ["ruleId", "severity", "source", "appliesTo", "checkType", "ruleText"]) {
        if (typeof rule[field] !== "string" || !rule[field].trim()) {
          errors.push(`rules.json ${location}: отсутствует ${field}.`);
        }
      }

      if (typeof rule.ruleId === "string") {
        if (ids.has(rule.ruleId)) {
          errors.push(`rules.json ${sectionName}: duplicate ruleId ${rule.ruleId}.`);
        }
        ids.add(rule.ruleId);
      }
    }
  }

  const manualRules = document.manual?.rules;
  if (Array.isArray(manualRules) && manualRules.length === 0) {
    warnings.push("rules.json: manual.rules пуст; компонент содержит только generated defaults.");
  }
}

function validateReadyContent(documents, metadataStatuses, errors, warnings) {
  const isReady = [...metadataStatuses.values()].some(
    (status) => status.toLowerCase() === "ready",
  );
  if (!isReady) {
    return;
  }

  const rules = documents.get("rules.json");
  const manualRules = rules?.manual?.rules ?? rules?.rules;
  if (!Array.isArray(manualRules) || manualRules.length === 0) {
    errors.push("Ready package: отсутствуют manual rules.");
  }

  const examples = documents.get("examples.json");
  const manualExamples = examples?.manual?.examples ?? examples?.examples;
  if (!Array.isArray(manualExamples) || manualExamples.length === 0) {
    errors.push("Ready package: отсутствуют manual regression examples.");
  }

  for (const fileName of [
    "composition-contract.json",
    "contract.overrides.json",
    "agent-context.json",
    "audit-mapping.json",
  ]) {
    const manual = documents.get(fileName)?.manual;
    if (!isPlainObject(manual) || Object.keys(manual).length === 0) {
      warnings.push(`Ready package: ${fileName} содержит пустую manual-секцию.`);
    }
  }
}

function validateTemplateMarkers(fileName, content, warnings) {
  for (const marker of TEMPLATE_MARKERS) {
    if (marker.test(content)) {
      warnings.push(`${fileName}: найден признак шаблонного содержимого ${marker}.`);
    }
  }
}

function findChangedPackageDirs(rootDir, baseRef) {
  const changedPaths = new Set(
    baseRef
      ? gitLines(rootDir, [
          "diff",
          "--name-only",
          "--diff-filter=ACMR",
          `${baseRef}...HEAD`,
          "--",
          "JSONS/web/components",
        ])
      : [
          ...gitLines(rootDir, [
            "diff",
            "--name-only",
            "HEAD",
            "--",
            "JSONS/web/components",
          ]),
          ...gitLines(rootDir, [
            "ls-files",
            "--others",
            "--exclude-standard",
            "--",
            "JSONS/web/components",
          ]),
        ],
  );

  const packageDirs = [];
  for (const relativePath of changedPaths) {
    if (!PACKAGE_FILE_NAMES.has(path.basename(relativePath))) {
      continue;
    }
    const packageDir = path.join(rootDir, path.dirname(relativePath));
    if (isDirectory(packageDir)) {
      packageDirs.push(packageDir);
    }
  }
  return packageDirs;
}

function resolvePackageTarget(rootDir, target) {
  const directCandidates = [path.resolve(process.cwd(), target), path.resolve(rootDir, target)];
  for (const candidate of directCandidates) {
    if (isDirectory(candidate)) {
      return candidate;
    }
  }

  const packagesRoot = path.join(rootDir, "JSONS", "web", "components");
  const matches = [];
  walkDirectories(packagesRoot, 4, (directory) => {
    if (
      path.basename(directory).toLowerCase() === target.toLowerCase() &&
      REQUIRED_FILES.some((fileName) => fs.existsSync(path.join(directory, fileName)))
    ) {
      matches.push(directory);
    }
  });

  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error(
      `Имя ${JSON.stringify(target)} неоднозначно:\n${matches.map((item) => `- ${item}`).join("\n")}`,
    );
  }
  throw new Error(`Component package не найден: ${target}`);
}

function walkDirectories(directory, depth, visitor) {
  if (depth < 0 || !isDirectory(directory)) {
    return;
  }
  visitor(directory);
  if (depth === 0) {
    return;
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      walkDirectories(path.join(directory, entry.name), depth - 1, visitor);
    }
  }
}

function getRepoRoot() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error("Validator нужно запускать внутри Git checkout design-system_ab.");
    process.exit(2);
  }
  return result.stdout.trim();
}

function getOptionValue(values, optionName) {
  const index = values.indexOf(optionName);
  if (index < 0) {
    return undefined;
  }
  const value = values[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`Отсутствует значение для ${optionName}.`);
    process.exit(2);
  }
  return value;
}

function gitLines(rootDir, commandArgs) {
  const result = spawnSync("git", commandArgs, {
    cwd: rootDir,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${commandArgs.join(" ")} failed.`);
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveRepoPath(rootDir, filePath) {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.join(rootDir, filePath.replace(/^\.\//, ""));
}

function formatMap(values) {
  return [...values.entries()].map(([key, value]) => `${key}=${value}`).join(", ");
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unique(values) {
  return [...new Set(values)];
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function printUsage() {
  console.error(
    "Usage: node validate-component-package.mjs <package-path|component-name> [...] | --changed | --changed-from <git-ref>",
  );
}
