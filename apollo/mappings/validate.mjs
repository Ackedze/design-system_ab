import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildCodeConnect } from './tooling/hub/tools/lib/code-connect.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

export function readPinned(root, record) {
  assert(record && typeof record.path === 'string' && !path.isAbsolute(record.path), 'relative path required');
  assert(!record.path.includes('\\') && !record.path.split('/').includes('..'), 'unsafe path');
  const file = path.resolve(root, record.path);
  assert(file.startsWith(path.resolve(root) + path.sep), 'path outside repository');
  assert.equal(fs.realpathSync(file), file, 'symlink forbidden');
  assert(fs.lstatSync(file).isFile(), 'regular file required');
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.length, record.bytes, `size mismatch: ${record.path}`);
  assert.equal(sha(bytes), record.sha256, `hash mismatch: ${record.path}`);
  return bytes;
}

export function validate(root) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'apollo/mappings/catalog.json')));
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.documentType, 'component-mapping-workspace');
  assert.equal(catalog.runtimeAdoption, false, 'authoring inventory must not imply runtime adoption');
  const copies = new Map();
  for (const record of catalog.copiedFiles) {
    assert(!copies.has(record.path), `duplicate file: ${record.path}`);
    copies.set(record.path, readPinned(root, record));
  }
  const ids = new Set();
  let tables = 0;
  for (const entry of catalog.entries) {
    assert(!ids.has(entry.id), `duplicate entity: ${entry.id}`);
    ids.add(entry.id);
    const data = {};
    for (const [name, ref] of Object.entries(entry.files)) {
      assert(copies.has(ref.path), `unlisted facet: ${ref.path}`);
      assert(ref.path.startsWith(entry.mappingRoot + '/'), `wrong owner: ${ref.path}`);
      data[name] = JSON.parse(readPinned(root, ref));
    }
    if (!data['code-connect']) continue;
    const rebuilt = buildCodeConnect({
      entity: { id: entry.id, name: entry.name },
      figma: data.figma, code: data.code, semantics: data.semantics,
      overrides: data['code-connect.overrides'],
    });
    // Draft overrides remain proposals; upstream builds do not consume them.
    assert.deepEqual(rebuilt, data['code-connect'], `table replay mismatch: ${entry.id}`);
    assert.equal(entry.sourceMappingStatus, data['code-connect'].status, `status mismatch: ${entry.id}`);
    tables++;
  }
  const counts = {
    entities: catalog.entries.length,
    componentFolders: catalog.entries.filter(e => e.ownerPath !== null).length,
    apiOnly: catalog.entries.filter(e => e.ownerPath === null).length,
    apiFacets: catalog.entries.filter(e => e.files.code).length,
    codeConnectTables: tables,
    acceptedOverrideFiles: catalog.entries.filter(e => e.files['code-connect.overrides']).length,
    draftOverrideFiles: catalog.entries.filter(e => e.files['code-connect.overrides.draft']).length,
    historicalToolFiles: catalog.copiedFiles.filter(f => f.role === 'historical-engineering-evidence').length,
  };
  assert.deepEqual(counts, catalog.counts, 'catalog counts mismatch');
  return { status: 'PASS', ...counts, pinnedCopies: copies.size, runtimeAdoption: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(validate(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'))));
}
