/**
 * Владение файлами entities/ между адаптерами.
 *
 * entities/sources.json      AUTH  приоритет источников (первый — главный)
 * entities/sources.lock.json GEN   какой источник каким файлом владеет
 *
 * Правило: файлом владеет ровно один источник. Источник с меньшим приоритетом
 * не пишет файлы, которыми владеет более приоритетный, — только дополняет данные
 * в собственных файлах (например, rules.supplement.json).
 */

import path from 'node:path';
import { tryReadJson, writeJson } from './fsx.mjs';

export function readLock(entitiesRoot) {
  return tryReadJson(path.join(entitiesRoot, 'sources.lock.json')) ?? { $schema: 'hub/sources-lock@1', sources: {} };
}

export function readPriority(entitiesRoot) {
  return tryReadJson(path.join(entitiesRoot, 'sources.json'))?.priority ?? [];
}

/** Файлы, которыми владеют источники приоритетнее source. Источник вне списка приоритета — самый младший. */
export function filesOfHigherPriority(lock, priority, source) {
  const rank = (s) => {
    const i = priority.indexOf(s);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const mine = rank(source);
  const out = new Set();
  for (const [s, info] of Object.entries(lock.sources ?? {})) {
    if (s !== source && rank(s) < mine) for (const f of info.files ?? []) out.add(f);
  }
  return out;
}

/** Записывает владение source и снимает эти файлы с других источников. */
export function commitLock(entitiesRoot, lock, source, info, files) {
  const own = new Set(files);
  for (const [s, other] of Object.entries(lock.sources ?? {})) {
    if (s === source || !other.files) continue;
    other.files = other.files.filter((f) => !own.has(f));
  }
  lock.sources[source] = { ...info, files: [...own].sort() };
  lock.sources = Object.fromEntries(Object.entries(lock.sources).sort(([a], [b]) => a.localeCompare(b)));
  writeJson(path.join(entitiesRoot, 'sources.lock.json'), lock);
}
