'use strict';

// Synthetic evidence only; does not create or edit Figma nodes.
const path = require('node:path');
const core = require(path.resolve(__dirname,
  '../../../../../../projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));

function snapshot(uniqueNames) {
  const componentFacts = { propertyReferences: [], propertyReferenceBindings: {} };
  const nodes = [{
    id: 'root', parentId: null, childIds: ['b1', 'b2', 'b3', 'b4'],
    name: 'ButtonsGroup', type: 'INSTANCE', visible: true, order: 0,
    component: Object.assign({}, componentFacts, {
      identity: { componentKey: 'group-56', componentSetKey: 'group-set', mainComponentId: 'group-main' },
      properties: { Size: '56', Overflow: 'false' },
      propertyTypes: { Size: 'VARIANT', Overflow: 'VARIANT' },
    }),
    semantic: { role: 'root', path: 'ButtonsGroup' },
  }];
  for (let i = 1; i <= 4; i++) {
    const name = uniqueNames ? 'Button ' + i : '[D] Button';
    nodes.push({
      id: 'b' + i, parentId: 'root', childIds: [], name, type: 'INSTANCE', visible: true, order: i,
      component: Object.assign({}, componentFacts, {
        identity: { componentKey: i === 1 ? 'primary-56' : 'secondary-56', componentSetKey: 'button-set',
          mainComponentId: i === 1 ? 'primary-main' : 'secondary-main' },
        properties: { View: i === 1 ? 'Primary' : 'Secondary', Size: '56' },
        propertyTypes: { View: 'VARIANT', Size: 'VARIANT' },
        sourceIdentity: { version: 1, ownerComponentKey: 'group-56', ownerMainComponentId: 'group-main',
          sourceNodeId: '900:' + i },
      }),
      semantic: { role: 'button-' + i, path: 'ButtonsGroup / ' + name },
    });
  }
  return {
    selection: ['root'], nodes, context: { platform: 'desktop', modes: {} },
    source: { componentKey: 'group-56', componentSetKey: 'group-set', truncated: false,
      instanceIdentityVersion: 1, instanceSourceIdentityVersion: 1,
      captureTopology: { version: 1, complete: true, limitReached: false, issues: [] } },
  };
}

const results = [false, true].map(uniqueNames => {
  const actual = snapshot(uniqueNames);
  const result = core.materializeEffectiveBaseline(actual, JSON.parse(JSON.stringify(actual)));
  return { uniqueNames, snapshotShapeAvailable: Boolean(core.snapshotShape(actual)),
    matchedNodes: result.matchedNodes, unmatchedNodes: result.unmatchedNodeIds.length };
});
process.stdout.write(JSON.stringify({ date: '2026-10-01', kind: 'synthetic-diagnostic', results }, null, 2) + '\n');
