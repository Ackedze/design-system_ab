// Immutable component/usage baseline before the r25 ownership transfer.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
for (const [source, destination, expected, gzip] of [
  ['contract.manual.json', 'contract.manual.json', 'c5a6b4bd494ad5e6bbae900ab6384bec5bfb23a1ceda8e53fd4d453f3b804753', false],
  ['compiled/component-contract.v2.json', 'component-contract.v2.json.gz', '846a1be4379d019dde5be330fb2b5ccf70f119e296dca7ee7506778d776d8cdf', true],
  ['editor/Button.editor-input.zip', 'Button.editor-input.zip', '6dfef586461f4c1f361eb88824865bc356f8eb1960ab18c982582393a507190e', false],
]) {
  const target = path.join(root, 'history/r24-editor-0.2.45', destination), exists = fs.existsSync(target);
  const bytes = exists ? (gzip ? zlib.gunzipSync(fs.readFileSync(target)) : fs.readFileSync(target)) : fs.readFileSync(path.join(root, source));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('Baseline mismatch: '+source);
  if (!exists) { fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,gzip?zlib.gzipSync(bytes):bytes,{flag:'wx'}); }
  console.log((exists?'Verified ':'Archived ')+destination);
}
