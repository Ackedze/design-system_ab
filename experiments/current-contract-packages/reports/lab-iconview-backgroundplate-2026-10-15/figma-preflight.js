const page = await figma.getNodeByIdAsync(CONFIG.pageId);
if (!page || page.type !== 'PAGE') throw new Error('Lab page missing');
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = false;
const masters = [];
for (const key of [...new Set(SPECS.map(s => s.variantKey))]) {
  const main = await figma.importComponentByKeyAsync(key);
  const owner = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : main;
  const parts = [];
  for (const n of main.findAll(n => n.type === 'INSTANCE')) {
    const p = n.componentProperties;
    if (!Object.keys(p).some(k => ['Type', 'Form', 'Size'].includes(k.split('#')[0]))) continue;
    const m = await n.getMainComponentAsync();
    let a = n; const path = [];
    while (a && a.id !== main.id) { path.unshift(a.name); a = a.parent; }
    parts.push({path: path.join(' / '), key: m ? m.key : null,
      setKey: m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.key : null,
      properties: p, width: n.width, height: n.height});
  }
  masters.push({key: main.key, name: main.name, setKey: owner.key,
    definitions: owner.componentPropertyDefinitions, parts});
}
return {status: 'IMPORT_API_PREFLIGHT_ONLY', createdNodeIds: [], mutatedNodeIds: [], masters,
  pageId: page.id, rightmost: Math.max(...page.children.map(n => n.x + n.width)),
  existingBoards: page.children.filter(n => Object.values(CONFIG.boardNames).includes(n.name)).map(n => ({id:n.id,name:n.name}))};
