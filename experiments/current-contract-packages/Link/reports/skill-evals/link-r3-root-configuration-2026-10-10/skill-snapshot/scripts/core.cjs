const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const workspace = path.resolve(__dirname, '../../../..');
const coreRoot = path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function sourcePins() {
  const pins = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) pins.push({ path: file, sha256: sha256(fs.readFileSync(file)) });
    }
  }
  walk(path.join(coreRoot, 'src'));
  walk(path.join(coreRoot, 'predicate'));
  walk(path.join(coreRoot, 'vendor'));
  walk(path.join(coreRoot, 'schemas'));
  pins.push({ path: path.join(coreRoot, 'package.json'), sha256: sha256(fs.readFileSync(path.join(coreRoot, 'package.json'))) });
  return pins;
}

function loadCore() {
  const before = sourcePins();
  const esbuildPath = path.join(workspace, 'projects/ComponentContractEditor/node_modules/esbuild');
  const esbuild = require(esbuildPath);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-core-'));
  try {
    const outfile = path.join(scratch, 'core.cjs');
    const build = esbuild.buildSync({ absWorkingDir: workspace, entryPoints: [path.join(coreRoot, 'src/index.ts')],
      outfile, bundle: true, platform: 'node', format: 'cjs', target: ['node18'], metafile: true });
    assert.deepEqual(sourcePins(), before, 'CORE_SOURCE_DRIFT');
    const pins = new Map(before.map(pin => [pin.path, pin]));
    const inputs = Object.keys(build.metafile.inputs).map(file => {
      const pin = pins.get(path.resolve(workspace, file));
      assert.ok(pin, `UNPINNED_CORE_INPUT: ${file}`);
      return pin;
    });
    return { core: require(outfile), toolchain: {
      coreVersion: JSON.parse(fs.readFileSync(path.join(coreRoot, 'package.json'), 'utf8')).version,
      esbuildVersion: esbuild.version, bundleSha256: sha256(fs.readFileSync(outfile)), inputs,
    }, sourceSnapshot: before };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

module.exports = { loadCore, sourcePins, sha256, workspace };
