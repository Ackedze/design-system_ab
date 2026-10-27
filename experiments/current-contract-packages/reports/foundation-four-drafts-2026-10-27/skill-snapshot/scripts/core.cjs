const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

function apolloRoot() {
  assert.ok(process.env.APOLLO_ROOT?.trim(), 'APOLLO_ROOT_REQUIRED: set the path to your Apollo checkout');
  return path.resolve(process.env.APOLLO_ROOT);
}
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function sourcePins() {
  const coreRoot = path.join(apolloRoot(), 'packages/component-contract-core');
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
  const projectRoot = apolloRoot();
  const coreRoot = path.join(projectRoot, 'packages/component-contract-core');
  const before = sourcePins();
  const esbuildPath = path.join(projectRoot, 'node_modules/esbuild');
  const esbuild = require(esbuildPath);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'apollo-contract-skill-core-'));
  try {
    const outfile = path.join(scratch, 'core.cjs');
    const build = esbuild.buildSync({ absWorkingDir: projectRoot, entryPoints: [path.join(coreRoot, 'src/index.ts')],
      outfile, bundle: true, platform: 'node', format: 'cjs', target: ['node18'], metafile: true });
    assert.deepEqual(sourcePins(), before, 'CORE_SOURCE_DRIFT');
    const pins = new Map(before.map(pin => [pin.path, pin]));
    const inputs = Object.keys(build.metafile.inputs).map(file => {
      const pin = pins.get(path.resolve(projectRoot, file));
      assert.ok(pin, `UNPINNED_CORE_INPUT: ${file}`);
      return pin;
    });
    return { core: require(outfile), toolchain: {
      apolloRoot: projectRoot,
      coreVersion: JSON.parse(fs.readFileSync(path.join(coreRoot, 'package.json'), 'utf8')).version,
      esbuildVersion: esbuild.version, bundleSha256: sha256(fs.readFileSync(outfile)), inputs,
    }, sourceSnapshot: before };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

module.exports = { loadCore, sourcePins, sha256 };
