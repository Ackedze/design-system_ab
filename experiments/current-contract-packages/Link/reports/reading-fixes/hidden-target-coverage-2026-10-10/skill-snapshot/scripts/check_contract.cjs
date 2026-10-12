const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { loadCore, sourcePins, sha256 } = require('./core.cjs');

function readInventory(inventoryPath) {
  const bytes = fs.readFileSync(inventoryPath);
  const inventory = JSON.parse(bytes);
  assert.equal(inventory.schemaVersion, 'apollo.contract-authoring-inputs.v1', 'INPUT_SCHEMA');
  assert.ok(typeof inventory.contractId === 'string' && inventory.contractId.trim(), 'CONTRACT_ID_REQUIRED');
  assert.ok(Array.isArray(inventory.files) && inventory.files.length, 'INPUT_FILES_REQUIRED');
  const names = new Set();
  const inputs = inventory.files.map(entry => {
    assert.ok(typeof entry.name === 'string' && entry.name.endsWith('.json')
      && !entry.name.startsWith('/') && !entry.name.includes('\\')
      && !entry.name.split('/').some(part => !part || part === '.' || part === '..'), 'INPUT_NAME_INVALID');
    assert.ok(!names.has(entry.name), `DUPLICATE_INPUT_NAME: ${entry.name}`);
    names.add(entry.name);
    assert.match(entry.sha256 || '', /^[a-f0-9]{64}$/, 'INPUT_SHA_REQUIRED');
    assert.ok(typeof entry.path === 'string' && entry.path, 'INPUT_PATH_REQUIRED');
    const file = path.resolve(path.dirname(inventoryPath), entry.path);
    const data = fs.readFileSync(file);
    assert.equal(sha256(data), entry.sha256, `INPUT_PIN_MISMATCH: ${entry.name}`);
    return { name: entry.name, path: file, sha256: entry.sha256, bytes: data.length, text: data.toString('utf8') };
  });
  const manuals = inputs.filter(entry => JSON.parse(entry.text).documentType === 'component-contract-manual');
  assert.equal(manuals.length, 1, 'EXACTLY_ONE_MANUAL_REQUIRED');
  return { inventory, inventoryPin: { path: inventoryPath, sha256: sha256(bytes) }, inputs, manual: JSON.parse(manuals[0].text) };
}

async function checkContract(inventoryPath, outputDir) {
  inventoryPath = path.resolve(inventoryPath);
  outputDir = path.resolve(outputDir);
  assert.ok(!fs.existsSync(outputDir), 'OUTPUT_EXISTS: use a new directory');
  const input = readInventory(inventoryPath);
  const { core, toolchain, sourceSnapshot } = loadCore();
  const files = input.inputs.map(({ name, text }) => ({ name, text }));
  const imported = core.importWorkspace(files, input.inventory.contractId);
  assert.equal(imported.manual.schemaVersion, core.MANUAL_SCHEMA_VERSION, 'CURRENT_MANUAL_SCHEMA_REQUIRED');
  assert.equal(imported.manual.component.contractId, input.inventory.contractId, 'WRONG_CONTRACT');
  assert.deepEqual(imported.manual, input.manual, 'IMPORT_CHANGED_MANUAL: review migration separately');
  const bundle = core.buildExportBundle(imported.manual, imported.variantEvidence, imported.dependencyContracts);
  const writeJson = (name, value) => fs.writeFileSync(path.join(outputDir, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  fs.mkdirSync(outputDir, { recursive: true });
  writeJson('validation-report.json', bundle.validation);
  writeJson('component-contract.v2.json', bundle.compiled);
  const report = {
    schemaVersion: 'apollo.contract-authoring-technical.v1', valid: bundle.validation.valid,
    scope: ['shared-core-import', 'shared-core-compile', 'shared-core-zip-reopen'],
    inventory: input.inventoryPin, inputs: input.inputs.map(({ text, ...pin }) => pin), toolchain,
    compilerIssues: bundle.validation.issues, importWarnings: imported.warnings,
    roundtrip: 'NOT_RUN', editorUi: 'NOT_RUN_USER_ONLY', nativeLive: 'NOT_RUN_USER_ONLY',
    readyAdmission: false, releaseAdmission: false,
  };
  try {
    if (bundle.validation.valid) {
      const zip = core.buildAuthoringZip(bundle, files);
      const entries = await core.readZip(zip);
      const reopened = core.importWorkspace(entries.filter(entry => entry.name.endsWith('.json'))
        .map(entry => ({ name: entry.name, text: core.zipEntryText(entry) })), input.inventory.contractId);
      assert.deepEqual(reopened.manual, imported.manual, 'REOPEN_MANUAL_MISMATCH');
      assert.deepEqual(reopened.variantEvidence, imported.variantEvidence, 'REOPEN_FULL_FACTS_MISMATCH');
      const second = core.buildExportBundle(reopened.manual, reopened.variantEvidence, reopened.dependencyContracts);
      assert.deepEqual(second.compiled, bundle.compiled, 'REOPEN_COMPILED_MISMATCH');
      assert.deepEqual(second.validation, bundle.validation, 'REOPEN_VALIDATION_MISMATCH');
      fs.writeFileSync(path.join(outputDir, 'candidate.component-contract.zip'), zip, { flag: 'wx' });
      report.roundtrip = 'PASS';
      report.zip = { sha256: sha256(zip), bytes: zip.length, entries: entries.map(entry => entry.name) };
    }
    for (const pin of input.inputs) assert.equal(sha256(fs.readFileSync(pin.path)), pin.sha256, `INPUT_DRIFT: ${pin.name}`);
    assert.equal(sha256(fs.readFileSync(inventoryPath)), input.inventoryPin.sha256, 'INVENTORY_DRIFT');
    assert.deepEqual(sourcePins(), sourceSnapshot, 'CORE_SOURCE_DRIFT');
  } catch (error) {
    report.valid = false;
    report.failure = error.message;
    report.roundtrip = 'FAIL';
  }
  writeJson('technical-report.json', report);
  return report;
}

module.exports = { checkContract, readInventory };
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node check_contract.cjs <input-inventory.json> <new-output-directory>');
    process.exitCode = 1;
  } else checkContract(args[0], args[1]).then(report => {
    console.log(JSON.stringify({ valid: report.valid, roundtrip: report.roundtrip,
      report: path.resolve(args[1], 'technical-report.json') }));
    if (!report.valid) process.exitCode = 1;
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
