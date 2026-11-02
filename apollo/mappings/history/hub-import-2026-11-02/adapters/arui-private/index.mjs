#!/usr/bin/env node
/**
 * Адаптер arui-private → entities/: кодовая сторона corp/promo-компонентов.
 *
 *   <level>/<id>/code.json   пакет и путь импорта, экспортируемые компоненты, пропсы
 *                            (react-docgen-typescript), статус из component-lifecycle.json
 *
 * Связь сущности с папкой src/ — taxonomy.json → sources["arui-private"].
 * Пропсы извлекаются инструментами самого arui-private (его node_modules),
 * поэтому у хаба по-прежнему нет зависимостей. Нужен установленный arui-private (yarn install).
 *
 *   node adapters/arui-private/index.mjs [--source <path>] [--dry-run]
 *
 * --source  путь к клону arui-private (по умолчанию $ARUI_PRIVATE_ROOT или ../arui-private)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readJson, tryReadJson, compact, uniq, OwnedFiles } from '../lib/fsx.mjs';
import { readLock, readPriority, filesOfHigherPriority, commitLock } from '../lib/lock.mjs';

const SOURCE = 'arui-private';
const ADAPTER_VERSION = '1.0.0';
const LEVEL_DIR = { primitive: 'primitives', component: 'components', composite: 'composites', helper: 'helpers' };

const HUB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENTITIES = path.join(HUB_ROOT, 'entities');

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes('--dry-run');
const sourceRoot = path.resolve(option('--source') ?? process.env.ARUI_PRIVATE_ROOT ?? path.join(HUB_ROOT, '..', 'arui-private'));

const pkgJson = tryReadJson(path.join(sourceRoot, 'package.json'));
if (!pkgJson || !fs.existsSync(path.join(sourceRoot, 'src'))) {
  console.error(`arui-private не найден: ${sourceRoot}\nУкажи --source <path> или ARUI_PRIVATE_ROOT.`);
  process.exit(1);
}

let docgen;
try {
  docgen = createRequire(path.join(sourceRoot, 'package.json'))('react-docgen-typescript');
} catch {
  console.error('В arui-private нет react-docgen-typescript. Выполни yarn install в arui-private.');
  process.exit(1);
}

// ── Сущности, связанные с кодом ────────────────────────────────────────────

const taxonomy = readJson(path.join(ENTITIES, 'taxonomy.json'));
const lifecycle = tryReadJson(path.join(sourceRoot, 'component-lifecycle.json')) ?? {};
const warnings = [];

const targets = taxonomy.entities
  .filter((e) => e.sources?.[SOURCE])
  .map((e) => {
    const dir = e.sources[SOURCE];
    const index = ['index.ts', 'index.tsx'].map((f) => path.join(sourceRoot, 'src', dir, f)).find((f) => fs.existsSync(f));
    return { entity: e, dir, index };
  })
  .filter((t) => {
    if (t.index) return true;
    warnings.push(`${t.entity.id}: нет src/${t.dir}/index.ts(x)`);
    return false;
  });

// Один TypeScript-проект на все файлы — так быстрее, чем по компоненту.
const parser = docgen.withCustomConfig(path.join(sourceRoot, 'tsconfig.json'), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  propFilter: (p) => !p.parent || !/node_modules\/(@types\/react|typescript)\//.test(p.parent.fileName),
});
const docs = parser.parse(uniq(targets.map((t) => t.index)));
const docsByDir = new Map();
for (const d of docs) {
  const dir = path.relative(path.join(sourceRoot, 'src'), d.filePath).split(path.sep)[0];
  if (!docsByDir.has(dir)) docsByDir.set(dir, []);
  docsByDir.get(dir).push(d);
}

// ── code.json ──────────────────────────────────────────────────────────────

const lock = readLock(ENTITIES);
const blocked = filesOfHigherPriority(lock, readPriority(ENTITIES), SOURCE);
const out = new OwnedFiles(ENTITIES, { dryRun });
const stats = { entities: 0, components: 0, props: 0, deprecated: 0 };

for (const { entity, dir } of targets) {
  const components = docsByDir.get(dir) ?? [];
  if (!components.length) {
    warnings.push(`${entity.id}: в src/${dir} не найдено React-компонентов`);
    continue;
  }
  const main = pickMain(components, entity, dir);
  const events = lifecycle[dir]?.events ?? [];
  const deprecated = events.find((e) => e.type === 'deprecated');

  const rel = `${LEVEL_DIR[entity.level]}/${entity.id}/code.json`;
  if (blocked.has(rel)) {
    warnings.push(`${rel}: принадлежит более приоритетному источнику — пропущен`);
    continue;
  }
  out.json(rel, compact({
    $schema: 'hub/facet.code@1',
    package: pkgJson.name,
    import: `${pkgJson.name}/${dir}`,
    version: pkgJson.version,
    component: main.displayName,
    description: main.description?.trim() || undefined,
    exports: components.map((c) => c.displayName).sort(),
    props: propsOf(main),
    status: compact({ lifecycle: deprecated ? 'deprecated' : 'active', since: deprecated?.date }),
  }));

  stats.entities += 1;
  stats.components += components.length;
  stats.props += Object.keys(main.props).length;
  if (deprecated) stats.deprecated += 1;
}

if (dryRun) {
  console.log('[dry-run] файлы не записаны');
} else {
  const removed = out.removeStale(lock.sources[SOURCE]?.files ?? []);
  if (removed.length) console.log(`Удалено устаревших файлов: ${removed.length}`);
  commitLock(ENTITIES, lock, SOURCE, {
    adapter: `adapters/arui-private@${ADAPTER_VERSION}`,
    sourcePath: path.relative(HUB_ROOT, sourceRoot),
    sourceCommit: gitCommit(sourceRoot),
    sourceVersion: pkgJson.version,
    importedAt: new Date().toISOString(),
    stats,
  }, out.list());
}

console.log(`arui-private → entities/: ${JSON.stringify(stats)}`);
for (const w of warnings) console.log(`  - ${w}`);

// ── helpers ────────────────────────────────────────────────────────────────

/** Главный компонент пакета: имя совпадает с сущностью или папкой, иначе — объявленный в <dir>.tsx. */
function pickMain(components, entity, dir) {
  const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const wanted = [entity.name, dir, `corporate${dir}`].map(norm);
  return components.find((c) => wanted.includes(norm(c.displayName)))
    ?? components.find((c) => path.basename(c.filePath, path.extname(c.filePath)) === dir)
    ?? components[0];
}

function propsOf(doc) {
  return Object.values(doc.props)
    .map((p) => {
      const values = p.type?.name === 'enum' ? (p.type.value ?? []).map((v) => literal(v.value)).filter((v) => v !== undefined) : undefined;
      const from = p.parent && /node_modules\//.test(p.parent.fileName)
        ? p.parent.fileName.split('node_modules/')[1].split('/').slice(0, 2).join('/')
        : undefined;
      return compact({
        name: p.name,
        type: p.type?.name === 'enum' ? p.type.raw : p.type?.name,
        values: values?.length ? values : undefined,
        required: p.required || undefined,
        default: p.defaultValue?.value ?? undefined,
        description: p.description?.trim() || undefined,
        from,
      });
    })
    .sort((a, b) => Number(Boolean(a.from)) - Number(Boolean(b.from)) || a.name.localeCompare(b.name));
}

/** Литерал из исходника: "\"outer\"" → "outer", "16" → 16, "true" → true; не-литералы → undefined. */
function literal(raw) {
  try {
    const v = JSON.parse(raw);
    return ['string', 'number', 'boolean'].includes(typeof v) ? v : undefined;
  } catch {
    return undefined;
  }
}

function gitCommit(dir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}
