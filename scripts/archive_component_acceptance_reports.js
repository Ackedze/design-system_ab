// Preserve original report bytes outside the user export folder; never replace fixtures.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const manifestPath = path.resolve(process.argv[2] || '');
assert.ok(process.argv[2], 'Usage: node scripts/archive_component_acceptance_reports.js <component>/qa/<acceptance.json>');
const root = path.resolve(path.dirname(manifestPath), '..');
const acceptance = JSON.parse(fs.readFileSync(manifestPath));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const resolve = relative => {
  assert.equal(typeof relative, 'string');
  const absolute = path.resolve(root, relative);
  assert.ok(absolute.startsWith(root + path.sep), 'Fixture path must stay in its component package');
  return absolute;
};
const entries = acceptance.reportResults.map(item => {
  const target = resolve(item.fixtureFile);
  if (fs.existsSync(target)) {
    assert.equal(sha(zlib.gunzipSync(fs.readFileSync(target))), item.sha256, 'Existing fixture hash mismatch');
    return { target };
  }
  const bytes = fs.readFileSync(resolve(item.file));
  assert.equal(sha(bytes), item.sha256, 'Original report hash mismatch');
  return { target, bytes };
});
for (const { target, bytes } of entries) if (bytes) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, zlib.gzipSync(bytes, { level: 9 }), { flag: 'wx' });
  assert.equal(sha(zlib.gunzipSync(fs.readFileSync(target))), sha(bytes));
}
console.log(`Verified ${entries.length} immutable report fixtures; original exports unchanged.`);
