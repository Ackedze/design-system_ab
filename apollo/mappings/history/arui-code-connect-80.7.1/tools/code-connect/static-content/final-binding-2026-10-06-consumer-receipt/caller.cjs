'use strict';
const fs = require('node:fs');
const path = require('node:path');
const p = require('./protocol.cjs');
const builder = require('./builder.cjs');
const verifier = require('./verifier.cjs');
const producerRoot = path.resolve(__dirname, '../../../..');
const workspace = path.dirname(producerRoot);
function context(contextPin) {
  // This pin must come from the operator, outside HTTP/imported JSON and the hash closure.
  const c = p.jsonPin(contextPin);
  p.closed(c, ['schemaVersion', 'roots', 'requestPin', 'baselineVectorPin', 'baselineManifestPin', 'baselineReportPin',
    'toolPins', 'immutablePins', 'manifestPin', 'reportPin', 'receiptPin'], 'BINDING_CONTEXT');
  if (c.schemaVersion !== 'apollo.static-final-binding-local-context.v1-draft') p.fail('BINDING_CONTEXT');
  p.exact(c.roots, { workspace, producer: producerRoot, generation: path.join(workspace, 'projects/Apollo-v3') }, 'BINDING_PATH');
  const tooling = fs.readdirSync(__dirname).filter(n => /\.(?:cjs|md|schema\.json)$/.test(n)).map(n => path.join(__dirname, n)).sort();
  const declared = Array.from(p.pins(c.toolPins).keys()).sort();
  p.exact(tooling, declared, 'BINDING_TOOL_COVERAGE');
  const immutable = p.pins(c.immutablePins);
  const oldPaths = ['v1-draft', 'rebind-2026-10-06-final', 'rebind-2026-10-06-review-route']
    .flatMap(dir => fs.readdirSync(path.join(__dirname, '..', dir)).map(name => path.join(__dirname, '..', dir, name)))
    .concat(['NEXT-03-static-content-producer', 'NEXT-03-static-content-rebind-final', 'NEXT-03-static-review-route-rebind']
      .flatMap(name => ['json', 'md'].map(ext => path.join(producerRoot, `tools/code-connect/reports/${name}.2026-10-06.${ext}`))))
    .map(file => path.normalize(file));
  if (oldPaths.length !== 42 || oldPaths.some(file => !immutable.has(file))) p.fail('BINDING_IMMUTABLE');
  for (const pin of [...c.toolPins, ...c.immutablePins]) p.readPin(pin);
  return c;
}
async function main(args = process.argv.slice(2)) {
  const [operation, file, sha256] = args;
  if (args.length !== 3 || !['preflight', 'build', 'inspect', 'verify-receipt', 'archive-c0'].includes(operation))
    p.fail('BINDING_USAGE', 'caller.cjs preflight|build|inspect|verify-receipt|archive-c0 <external-context-path> <independently-trusted-sha256>');
  const c = context({ path: file, sha256 });
  if (c.requestPin) {
    const request = p.jsonPin(c.requestPin), vector = p.jsonPin(request.vectorPin);
    if (vector.files.some(pin => pin.path === file)) p.fail('BINDING_BACKREFERENCE', 'local trust context is inside V0');
  }
  if (operation === 'archive-c0') {
    // Archive precedes V0; context.requestPin is null at this point.
    if ([c.requestPin, c.manifestPin, c.reportPin, c.receiptPin].some(pin => pin !== null)) p.fail('BINDING_BACKREFERENCE');
    const baseline = p.jsonPin(c.baselineVectorPin);
    const file = path.join(workspace, 'services/apollo-proxy/src/generation-v4/static-review-config.json');
    const pin = baseline.files.find(p => p.path === file);
    return builder.archiveConfig({ configPin: { path: pin.path, sha256: pin.sha256 }, archivePath: path.join(__dirname, 'preselection-config.json') });
  }
  if (operation === 'preflight') {
    const { ctx, manifest } = builder.preflight(c);
    return { operation, checkedFiles: ctx.inventory.size, candidateDigest: manifest.artifactDigest,
      writes: 0, accepted: false, executionAllowed: false, generationPlanHash: null };
  }
  if (operation === 'build') {
    if (c.manifestPin !== null || c.reportPin !== null || c.receiptPin !== null) p.fail('BINDING_CONTEXT');
    return builder.build(c);
  }
  if (operation === 'verify-receipt') {
    const result = verifier.receipt(c); result.assertCurrent(); delete result.assertCurrent; return result;
  }
  const result = verifier.inspect(c);
  return { producerFreshness: result.producerFreshness, mismatches: result.mismatches,
    scope: result.scope, accepted: false, executionAllowed: false, generationPlanHash: null };
}
if (require.main === module) main().then(v => process.stdout.write(JSON.stringify(v, null, 2) + '\n')).catch(e => { process.stderr.write(e.message + '\n'); process.exitCode = 1; });
module.exports = { context, main };
