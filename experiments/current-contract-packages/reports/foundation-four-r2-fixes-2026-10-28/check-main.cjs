const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const R = __dirname, A = path.resolve(R, '../../../..'), B = path.resolve(A, '../../.local/apollo-main');
const fixture = require(B + '/tests/document-audit.test.js').fixture(), code = fs.readFileSync(R + '/checking-build/code.js', 'utf8');
const close = code.lastIndexOf('\n})();'); assert(close > 0);
const context = {figma: fixture.api, __html__: '', TextEncoder, setTimeout, clearTimeout};
vm.runInNewContext(code.slice(0, close) + '\nglobalThis.__runtime = runtime;' + code.slice(close), context);
const rows = [], oldRuntime = require(B + '/dist/runtime.cjs');
try {
  for (const name of ['Text', 'Slider', 'SegmentedControl']) {
    const source = JSON.parse(fs.readFileSync(R + '/candidate/' + name + '/source.json'));
    const expected = JSON.parse(fs.readFileSync(R + '/candidate/' + name + '/compiled.json'));
    const loaded = context.__runtime.loadAuthoringSource(source, {evaluationMode: 'authoring-preview'});
    assert.equal(context.__runtime.contractHash(loaded.contract), context.__runtime.contractHash(expected));
    const tamper = structuredClone(source); tamper.projectionStamp.compiledHash = '0'.repeat(64);
    assert.throws(() => context.__runtime.loadAuthoringSource(tamper, {evaluationMode: 'authoring-preview'}), /не воспроизводят/);
    let previousReader;
    if (name === 'SegmentedControl') {
      assert.throws(() => oldRuntime.loadAuthoringSource(source, {evaluationMode: 'authoring-preview'}));
      previousReader = 'REJECTS_NEW_OPT_IN_AS_EXPECTED';
    } else {
      assert.equal(oldRuntime.contractHash(oldRuntime.loadAuthoringSource(source, {evaluationMode: 'authoring-preview'}).contract), oldRuntime.contractHash(expected));
      previousReader = 'SOURCE_LOAD_COMPATIBLE';
    }
    rows.push({name, privateMainSourceLoad: 'PASS', tamperedStampRejected: true, previousReader, installed: false});
  }
  fs.writeFileSync(R + '/main-source-load.json', JSON.stringify({evidenceKind: 'private configured main in VM', rows}, null, 2) + '\n');
  console.log(rows);
} finally { fixture.emit('close'); }
