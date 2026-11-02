// Read-only reference usage. No Figma write, publication, or file generation.
const path = require('node:path');
const bridge = require('../registry/consumer.cjs');
const registry = bridge.loadRegistry();
const lock = require('../registry/lock.v1.json');
const node = require('./pilot.desktop.plan.json');
const repo = path.resolve(__dirname, '../../..');
const receipt = bridge.preflight(registry, node, lock, {repo, workspaceRoot: path.dirname(repo)});
console.log(JSON.stringify({...receipt, lock, snippet: bridge.emit(receipt.prepared)}, null, 2));
