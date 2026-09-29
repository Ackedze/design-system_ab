// Preserve exact Button inputs before finalization; never overwrite an archive.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
const revision = Number(process.argv[2]);
const editorVersion = process.argv[3];
assert(Number.isInteger(revision) && revision > 0 && /^\d+\.\d+\.\d+$/.test(editorVersion || ''));
const dest = path.join(root, `history/r${revision}-editor-${editorVersion}`);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sources = [
  ['contract.manual.json', 'contract.manual.json', false],
  ['compiled/component-contract.v2.json', 'component-contract.v2.json.gz', true],
  ['editor/Button.editor-input.zip', 'Button.editor-input.zip', false],
];
if (!fs.existsSync(dest)) {
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, sources[0][0]))).metadata.revision, revision);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, sources[1][0]))).package.sourceExportVersion, `component-contract-editor@${editorVersion}`);
}
fs.mkdirSync(dest, { recursive: true });
const entries = sources.map(([source, file, gzip]) => {
  const target = path.join(dest, file);
  const bytes = fs.existsSync(target)
    ? (gzip ? zlib.gunzipSync(fs.readFileSync(target)) : fs.readFileSync(target))
    : fs.readFileSync(path.join(root, source));
  if (!fs.existsSync(target)) fs.writeFileSync(target, gzip ? zlib.gzipSync(bytes) : bytes, { flag: 'wx' });
  return { source, file, sha256: sha(bytes) };
});
assert.equal(JSON.parse(fs.readFileSync(path.join(dest, 'contract.manual.json'))).metadata.revision, revision);
const manifest = path.join(dest, 'manifest.json');
if (fs.existsSync(manifest)) assert.deepEqual(JSON.parse(fs.readFileSync(manifest)), entries);
else fs.writeFileSync(manifest, JSON.stringify(entries, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ archive: dest, entries }, null, 2));
