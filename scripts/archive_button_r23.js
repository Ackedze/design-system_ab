// Immutable source baseline before explicit normative ownership (r24).
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
for (const [source, destination, expected, gzip] of [
  ['contract.manual.json', 'contract.manual.json', '37d34b80a5be53d99a6dbfdefaa75d50a7a77ac45f7f2c9abef3b683b7e96fc1', false],
  ['compiled/component-contract.v2.json', 'component-contract.v2.json.gz', '2f06061ccce50f7653ad383d77fc93406e2a6004f635452e1f8a83c2ecdd5c26', true],
  ['editor/Button.editor-input.zip', 'Button.editor-input.zip', '6b40de6e7458c3988612948912d9633b6a7e46db27ea5d23c1ea5a734dca8ce0', false],
]) {
  const target = path.join(root, 'history/r23-editor-0.2.44', destination), exists = fs.existsSync(target);
  const bytes = exists ? (gzip ? zlib.gunzipSync(fs.readFileSync(target)) : fs.readFileSync(target)) : fs.readFileSync(path.join(root, source));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('Baseline mismatch: '+source);
  if (!exists) { fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'}); }
  console.log((exists?'Verified ':'Archived ')+destination);
}
