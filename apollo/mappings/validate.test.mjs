import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { readPinned } from './validate.mjs';

test('mapping pins reject tampering, traversal and symlinks', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'mapping-pins-')));
  try {
    const bytes = Buffer.from('{"mapping":"fixture"}\n');
    fs.writeFileSync(path.join(root, 'mapping.json'), bytes);
    const pin = { path: 'mapping.json', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    assert.deepEqual(readPinned(root, pin), bytes);
    assert.throws(() => readPinned(root, { ...pin, sha256: '0'.repeat(64) }), /hash mismatch/);
    assert.throws(() => readPinned(root, { ...pin, bytes: bytes.length + 1 }), /size mismatch/);
    assert.throws(() => readPinned(root, { ...pin, path: '../mapping.json' }), /unsafe path/);
    assert.throws(() => readPinned(root, { ...pin, path: path.join(root, 'mapping.json') }), /relative path/);
    fs.symlinkSync(path.join(root, 'mapping.json'), path.join(root, 'linked.json'));
    assert.throws(() => readPinned(root, { ...pin, path: 'linked.json' }), /symlink forbidden/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
