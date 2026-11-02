#!/usr/bin/env node
/**
 * Адаптер core-components → entities/.
 *
 *   tokens/tokens-flat.json        CSS-переменные набора, который подключает arui-private
 *                                  (packages/vars/src/bundle/corp.css): реальные имена,
 *                                  значения с разрешёнными var(), флаг deprecated
 *   primitives/<id>/code.json      npm-пакет, путь импорта, версия, описание и пропсы примитива
 *                                  (пропсы — из данных официального MCP core-components)
 *
 *   node adapters/core-components/index.mjs [--source <path>] [--dry-run]
 *
 * --source  путь к клону core-components (по умолчанию $CORE_COMPONENTS_ROOT или ../core-components)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readJson, tryReadJson, compact, OwnedFiles } from '../lib/fsx.mjs';
import { readLock, readPriority, filesOfHigherPriority, commitLock } from '../lib/lock.mjs';

const SOURCE = 'core-components';
const ADAPTER_VERSION = '1.0.0';

const HUB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENTITIES = path.join(HUB_ROOT, 'entities');

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes('--dry-run');
const sourceRoot = path.resolve(option('--source') ?? process.env.CORE_COMPONENTS_ROOT ?? path.join(HUB_ROOT, '..', 'core-components'));
const packagesDir = path.join(sourceRoot, 'packages');
const varsDir = path.join(packagesDir, 'vars', 'src');

const config = tryReadJson(path.join(ENTITIES, 'sources.json'))?.sources?.[SOURCE]?.tokens ?? {};
const BUNDLE = config.bundle ?? 'corp';
const EXTRA_FILES = config.extraFiles ?? [];

if (!fs.existsSync(path.join(varsDir, 'bundle', `${BUNDLE}.css`))) {
  console.error(`core-components не найден: ${sourceRoot}\nУкажи --source <path> или CORE_COMPONENTS_ROOT.`);
  process.exit(1);
}

const lock = readLock(ENTITIES);
const blocked = filesOfHigherPriority(lock, readPriority(ENTITIES), SOURCE);
const out = new OwnedFiles(ENTITIES, { dryRun });
const warnings = [];
const write = (rel, data) => {
  if (blocked.has(rel)) warnings.push(`${rel}: принадлежит более приоритетному источнику — пропущен`);
  else out.json(rel, data);
};

// ── Токены ─────────────────────────────────────────────────────────────────

const ZONE_BY_FILE = [
  [/^colors-/, 'color'],
  [/^gaps\.css$/, 'spacing'],
  [/^border-radius\.css$/, 'borderRadius'],
  [/^shadows-/, 'shadow'],
  [/^typography/, 'typography'],
];

function bundleFiles(file, seen = new Set()) {
  if (seen.has(file)) return [];
  seen.add(file);
  const text = fs.readFileSync(file, 'utf8');
  const imports = [...text.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => path.resolve(path.dirname(file), m[1]));
  return [file, ...imports.flatMap((f) => bundleFiles(f, seen))];
}

/** Объявления custom properties внутри :root { … }. Комментарий "deprecated" после значения — флаг. */
function parseRootVars(text) {
  const vars = [];
  for (const block of text.matchAll(/:root\s*\{([\s\S]*?)\n\}/g)) {
    for (const m of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);[ \t]*(\/\*([^*]*)\*\/)?/g)) {
      vars.push({ name: m[1], value: m[2].replace(/\s+/g, ' ').trim(), deprecated: /deprecated/i.test(m[4] ?? '') });
    }
  }
  return vars;
}

const declared = new Map();
const files = [
  ...bundleFiles(path.join(varsDir, 'bundle', `${BUNDLE}.css`)),
  ...EXTRA_FILES.map((f) => path.join(varsDir, f)).filter((f) => fs.existsSync(f)),
];
for (const f of EXTRA_FILES) if (!fs.existsSync(path.join(varsDir, f))) warnings.push(`tokens: файл ${f} из sources.json не найден`);
for (const file of [...new Set(files)]) {
  const base = path.basename(file);
  const zone = ZONE_BY_FILE.find(([re]) => re.test(base))?.[1] ?? 'misc';
  for (const v of parseRootVars(fs.readFileSync(file, 'utf8'))) {
    // Первое объявление побеждает: бандл продукта приоритетнее дополнительных палитр.
    if (!declared.has(v.name)) declared.set(v.name, { ...v, zone: v.name.startsWith('--size-') ? 'size' : zone, file: base });
  }
}

const resolve = (value, depth = 0) => {
  if (depth > 10) return value;
  return value.replace(/var\((--[\w-]+)\)/g, (m, name) => (declared.has(name) ? resolve(declared.get(name).value, depth + 1) : m));
};

const tokens = [...declared.values()].map((v) => {
  const theme = /^--color-(light|dark|static)-/.exec(v.name)?.[1];
  const ref = /^var\((--[\w-]+)\)$/.exec(v.value)?.[1];
  return compact({
    id: v.name.slice(2).replace(/-/g, '/'),
    cssVar: v.name,
    value: resolve(v.value),
    ref,
    zone: v.zone,
    theme,
    deprecated: v.deprecated || undefined,
  });
});

const varsVersion = tryReadJson(path.join(packagesDir, 'vars', 'package.json'))?.version;
write('tokens/tokens-flat.json', {
  $schema: 'TokensFlat/2.0',
  $source: `@alfalab/core-components-vars@${varsVersion} bundle/${BUNDLE}.css + ${EXTRA_FILES.length} палитр`,
  $totalCount: tokens.length,
  tokens,
});

// ── Примитивы ──────────────────────────────────────────────────────────────

const taxonomy = readJson(path.join(ENTITIES, 'taxonomy.json'));
const mcpDataDir = latestMcpData(path.join(packagesDir, 'mcp', 'src', 'data'));
let primitives = 0;

for (const e of taxonomy.entities.filter((x) => x.level === 'primitive')) {
  const npm = e.sources?.[SOURCE];
  const dir = npm ? npm.replace(/^@alfalab\/core-components-/, '') : e.id.split('.')[1];
  const pkgJson = tryReadJson(path.join(packagesDir, dir, 'package.json'));
  if (!pkgJson) {
    if (npm) warnings.push(`${e.id}: пакет ${npm} не найден в core-components`);
    continue;
  }
  if (!npm) warnings.push(`${e.id}: найден пакет packages/${dir} — добавь sources.core-components в taxonomy.json`);

  const data = mcpDataDir ? tryReadJson(path.join(mcpDataDir, `${dir}.json`)) : null;
  write(`primitives/${e.id}/code.json`, compact({
    $schema: 'hub/facet.code@1',
    package: pkgJson.name,
    import: `@alfalab/core-components/${dir}`,
    version: pkgJson.version,
    component: data?.displayName ?? dir.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(''),
    description: data?.description,
    props: data ? propsOf(data.props) : undefined,
    propsSource: data ? `core-components-mcp ${path.basename(mcpDataDir)}` : undefined,
  }));
  primitives += 1;
}

// ── Lock ───────────────────────────────────────────────────────────────────

const stats = { tokens: tokens.length, deprecatedTokens: tokens.filter((t) => t.deprecated).length, primitives };
if (dryRun) {
  console.log('[dry-run] файлы не записаны');
} else {
  const removed = out.removeStale(lock.sources[SOURCE]?.files ?? []);
  if (removed.length) console.log(`Удалено устаревших файлов: ${removed.length}`);
  commitLock(ENTITIES, lock, SOURCE, {
    adapter: `adapters/core-components@${ADAPTER_VERSION}`,
    sourcePath: path.relative(HUB_ROOT, sourceRoot),
    sourceCommit: gitCommit(sourceRoot),
    importedAt: new Date().toISOString(),
    stats,
  }, out.list());
}

console.log(`core-components → entities/: ${JSON.stringify(stats)}`);
for (const w of warnings) console.log(`  - ${w}`);

// ── helpers ────────────────────────────────────────────────────────────────

function propsOf(props = {}) {
  return Object.values(props).map((p) => compact({
    name: p.name,
    type: p.type?.name?.replace(/ \| undefined$/, ''),
    required: p.required || undefined,
    default: p.defaultValue?.value,
    description: p.description,
  }));
}

/** Последняя версия данных core-components-mcp (каталоги vMAJOR.MINOR.PATCH). */
function latestMcpData(dir) {
  if (!fs.existsSync(dir)) return null;
  const versions = fs.readdirSync(dir).filter((d) => /^v\d+\.\d+\.\d+$/.test(d));
  versions.sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number);
    const pb = b.slice(1).split('.').map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
  });
  return versions.length ? path.join(dir, versions[versions.length - 1]) : null;
}

function gitCommit(dir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}
