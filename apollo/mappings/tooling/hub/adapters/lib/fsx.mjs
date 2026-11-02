/**
 * Общие утилиты адаптеров и сборки entities/.
 *
 * Правила записи:
 *  - JSON пишется детерминированно (2 пробела, \n в конце), без временных меток
 *    внутри фасетов — иначе каждый прогон даёт дифф.
 *  - Время импорта и версия источника живут только в entities/sources.lock.json.
 */

import fs from 'node:fs';
import path from 'node:path';

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function tryReadJson(file) {
  try {
    return readJson(file);
  } catch {
    return null;
  }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/**
 * Убирает пустые поля записи (null/''/[]/{}), не заходя внутрь значений.
 * Рекурсия запрещена намеренно: во вложенных авторских данных пустой массив
 * несёт смысл (например, `Primary: []` — «ничего не разрешено»).
 */
export function compact(record) {
  const out = {};
  for (const [k, v] of Object.entries(record)) {
    if (!isEmpty(v)) out[k] = v;
  }
  return out;
}

export function isEmpty(v) {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

export function uniq(arr) {
  return [...new Set(arr.filter((x) => x !== null && x !== undefined))];
}

/**
 * Кириллические буквы, визуально совпадающие с латиницей, встречаются в ключах
 * источников (например, `web-corp.сhat`). В ID хаба допускается только ASCII.
 */
const CONFUSABLES = { 'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'к': 'k', 'м': 'm', 'т': 't', 'н': 'h', 'в': 'b' };

export function asciiSlug(s) {
  return s
    .toLowerCase()
    .replace(/[асеорхукмтнв]/g, (ch) => CONFUSABLES[ch] ?? ch)
    .replace(/_/g, '-')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Реестр файлов, которыми владеет адаптер: пишем, а затем чистим устаревшие. */
export class OwnedFiles {
  /** @param {{ dryRun?: boolean }} [options] dryRun — только учитывать файлы, не записывая их. */
  constructor(root, { dryRun = false } = {}) {
    this.root = root;
    this.dryRun = dryRun;
    this.files = new Set();
  }

  json(rel, data) {
    if (!this.dryRun) writeJson(path.join(this.root, rel), data);
    this.files.add(rel);
  }

  text(rel, text) {
    if (!this.dryRun) writeText(path.join(this.root, rel), text);
    this.files.add(rel);
  }

  /** Удаляет файлы, которые адаптер создавал в прошлый раз, а сейчас — нет. */
  removeStale(previous = []) {
    const removed = [];
    for (const rel of previous) {
      if (this.files.has(rel)) continue;
      const abs = path.join(this.root, rel);
      if (fs.existsSync(abs)) {
        fs.rmSync(abs);
        removed.push(rel);
        pruneEmptyDirs(path.dirname(abs), this.root);
      }
    }
    return removed;
  }

  list() {
    return [...this.files].sort();
  }
}

function pruneEmptyDirs(dir, stopAt) {
  let cur = dir;
  while (cur.startsWith(stopAt) && cur !== stopAt) {
    if (fs.readdirSync(cur).length > 0) return;
    fs.rmdirSync(cur);
    cur = path.dirname(cur);
  }
}
