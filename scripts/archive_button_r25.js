// Immutable baseline before independent expected-input validation in r26.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../experiments/web-core/core/Button');
for (const [source, destination, expected, gzip] of [
  ['contract.manual.json', 'contract.manual.json', '8de6208cd7f74b6edab87407f279e81e900e6c3567cd873f54724a5375054215', false],
  ['compiled/component-contract.v2.json', 'component-contract.v2.json.gz', 'af74cca5f107b57832158fba45e401c23f92ce159f2dd03bb46b95631068f953', true],
  ['editor/Button.editor-input.zip', 'Button.editor-input.zip', 'dee4d4459a0993efc69a1406541855f2b0354c491a6ba9790746af8b54676a48', false],
]) {
  const target = path.join(root, 'history/r25-editor-0.2.45', destination), exists = fs.existsSync(target);
  const bytes = exists ? (gzip ? zlib.gunzipSync(fs.readFileSync(target)) : fs.readFileSync(target)) : fs.readFileSync(path.join(root, source));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('Baseline mismatch: '+source);
  if (!exists) { fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, gzip ? zlib.gzipSync(bytes) : bytes, {flag:'wx'}); }
  console.log((exists ? 'Verified ' : 'Archived ')+destination);
}
