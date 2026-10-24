const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadCore, sha256 } = require('./core.cjs');
const { checkContract, readInventory } = require('./check_contract.cjs');

function input(dir, core, invalid = false) {
  const manual = core.createWorkspaceFromPreview({ componentId: 'synthetic.check', familyId: 'synthetic.check',
    contractId: 'synthetic.check.desktop', family: 'SyntheticCheck', layer: 'component', library: 'synthetic',
    platform: 'desktop', platforms: ['desktop'], lifecycle: 'active', componentKey: 'synthetic-check' }, []).manual;
  manual.semantics.purpose = 'Synthetic helper test';
  manual.targets = [{ id: 'root', semanticRole: 'root', label: 'Root', lineage: [], pathHint: 'SyntheticCheck', resolution: 'resolved' }];
  manual.rules = [{ id: 'synthetic.check.quantity', targetId: 'root', targetScope: 'self', capability: 'structure.presence',
    permission: 'constrained', controlPaths: [], constraints: invalid ? [] : [{ type: 'quantity', min: 1, max: 1 }],
    applicability: { variants: 'all', modes: 'all', platforms: ['desktop'] },
    severity: 'error', rationale: 'Exactly one declared root', status: 'draft', owner: 'synthetic-test' }];
  const file = path.join(dir, 'contract.manual.json');
  fs.writeFileSync(file, JSON.stringify(manual));
  const inventory = { schemaVersion: 'apollo.contract-authoring-inputs.v1', contractId: manual.component.contractId,
    files: [{ name: 'contract.manual.json', path: './contract.manual.json', sha256: sha256(fs.readFileSync(file)) }] };
  const list = path.join(dir, 'inputs.json');
  fs.writeFileSync(list, JSON.stringify(inventory));
  return { manual, inventory, list, file };
}

test('real core roundtrip preserves Draft manual, compiler output and statuses', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-test-'));
  try {
    const { core } = loadCore();
    const f = input(dir, core);
    const report = await checkContract(f.list, path.join(dir, 'technical'));
    assert.equal(report.valid, true, JSON.stringify(report.compilerIssues));
    assert.equal(report.roundtrip, 'PASS');
    assert.equal(report.readyAdmission, false);
    assert.equal(report.nativeLive, 'NOT_RUN_USER_ONLY');
    assert.ok(report.toolchain.inputs.some(pin => pin.path.endsWith('/vendor/sha256.ts')));
    assert.ok(report.toolchain.inputs.some(pin => pin.path.endsWith('/schemas/apollo-predicate-capabilities.v1.json')));
    const zip = fs.readFileSync(path.join(dir, 'technical/candidate.component-contract.zip'));
    const entries = await core.readZip(zip);
    const reopened = core.importWorkspace(entries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: core.zipEntryText(e) })));
    assert.deepEqual(reopened.manual, f.manual);
    assert.equal(reopened.manual.rules[0].status, 'draft');
    await assert.rejects(checkContract(f.list, path.join(dir, 'technical')), /OUTPUT_EXISTS/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('incomplete constrained Draft reports real RULE_CONSTRAINT and exports no successful ZIP', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-test-'));
  try {
    const f = input(dir, loadCore().core, true);
    const report = await checkContract(f.list, path.join(dir, 'technical'));
    assert.equal(report.valid, false);
    assert.ok(report.compilerIssues.some(issue => issue.level === 'error' && issue.code === 'RULE_CONSTRAINT'));
    assert.equal(report.roundtrip, 'NOT_RUN');
    assert.equal(fs.existsSync(path.join(dir, 'technical/candidate.component-contract.zip')), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('stale pins and duplicate package names fail before any output write', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-test-'));
  try {
    const f = input(dir, loadCore().core);
    fs.appendFileSync(f.file, '\n');
    await assert.rejects(checkContract(f.list, path.join(dir, 'technical')), /INPUT_PIN_MISMATCH/);
    assert.equal(fs.existsSync(path.join(dir, 'technical')), false);
    f.inventory.files[0].sha256 = sha256(fs.readFileSync(f.file));
    f.inventory.files.push(f.inventory.files[0]);
    fs.writeFileSync(f.list, JSON.stringify(f.inventory));
    assert.throws(() => readInventory(f.list), /DUPLICATE_INPUT_NAME/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('an explicit Apollo checkout is required before any output write', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-test-'));
  const configuredRoot = process.env.APOLLO_ROOT;
  try {
    const f = input(dir, loadCore().core);
    delete process.env.APOLLO_ROOT;
    assert.throws(() => loadCore(), /APOLLO_ROOT_REQUIRED/);
    await assert.rejects(checkContract(f.list, path.join(dir, 'technical')), /APOLLO_ROOT_REQUIRED/);
    assert.equal(fs.existsSync(path.join(dir, 'technical')), false);
  } finally {
    if (configuredRoot === undefined) delete process.env.APOLLO_ROOT;
    else process.env.APOLLO_ROOT = configuredRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
