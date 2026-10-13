const page = await figma.getNodeByIdAsync('3:476');
if (!page || page.type !== 'PAGE') throw new Error('Source page missing');
await figma.setCurrentPageAsync(page);
const priorSkip = figma.skipInvisibleInstanceChildren;
figma.skipInvisibleInstanceChildren = false;
const clone = value => JSON.parse(JSON.stringify(value));
const mutated = new Set(), created = new Set(), removed = new Set();
const layoutOf = n => ({mode:n.layoutMode,gap:n.itemSpacing,padding:[n.paddingTop,n.paddingRight,n.paddingBottom,n.paddingLeft],
  primary:n.primaryAxisAlignItems,counter:n.counterAxisAlignItems,sizingH:n.layoutSizingHorizontal,sizingV:n.layoutSizingVertical,visible:n.visible,opacity:n.opacity});
const textOf = n => clone({characters:n.characters,fontName:n.fontName,fontSize:n.fontSize,lineHeight:n.lineHeight,letterSpacing:n.letterSpacing,align:n.textAlignHorizontal});
try {
  // Published keys survive calls; freshly imported hidden node IDs do not.
  const main = await figma.importComponentByKeyAsync('bb2e85770f194e7bed71f247e82d40d0c4afd1e3');
  if (main.key !== 'bb2e85770f194e7bed71f247e82d40d0c4afd1e3' || !main.parent || main.parent.type !== 'COMPONENT_SET'
      || main.parent.key !== 'c1a788fea95f376b3c344b85ce006493b530db94') throw new Error('Pinned Link source mismatch');
  const defs = main.parent.componentPropertyDefinitions;
  const expected = ['S (14-20)','S (14-20) (Size-20 icons)','M (16-24)','L (18-24)'];
  if (JSON.stringify(defs.Size.variantOptions) !== JSON.stringify(expected) || !defs['Left icon 20#145985:35']
      || !defs['Right icon 20#145985:40']) throw new Error('Link r5 API mismatch');
  const subjects = [];
  for (const item of [
    {id:'17:12838',parent:'45fab9c74986fadb8af330a70c6503f1a0815aaa',owner:'4158b0817d3da15996c620b445d98333276765b1'},
    {id:'17:12843',parent:'73d7406d6e7fce569983edd4466eb52485d5e416',owner:'26c17fc60aaf65818137b58279d23ceae0f8458c'},
  ]) {
    const n = await figma.getNodeByIdAsync(item.id);
    if (!n || n.type !== 'INSTANCE' || !n.parent || n.parent.type !== 'COMPONENT' || n.parent.key !== item.parent
        || !n.parent.parent || n.parent.parent.type !== 'COMPONENT_SET' || n.parent.parent.key !== item.owner)
      throw new Error('Source ownership mismatch');
    const old = await n.getMainComponentAsync();
    if (!old || old.key !== main.key) throw new Error('Unexpected source Link family');
    const underline = await figma.getNodeByIdAsync('I'+n.id+';493:7848');
    const label = await figma.getNodeByIdAsync('I'+n.id+';493:10618');
    if (!underline || underline.type !== 'INSTANCE' || !label || label.type !== 'TEXT') throw new Error('Declared source parts missing');
    const props = {};
    for (const [key,p] of Object.entries(n.componentProperties)) {
      if (!defs[key] || defs[key].type !== p.type || !['string','boolean'].includes(typeof p.value))
        throw new Error('Source property migration mismatch');
      props[key] = p.value;
    }
    const line = underline.componentProperties.Line;
    if (!line || line.type !== 'VARIANT') throw new Error('Typed Underline.Line unavailable');
    subjects.push({node:n,old,props,layout:clone(layoutOf(n)),text:textOf(label),line:line.value,
      beforeIds:new Set([n.id,...n.findAll(()=>true).map(c=>c.id)]),
      before:{id:n.id,mainId:old.id,properties:clone(n.componentProperties),layout:clone(layoutOf(n)),text:textOf(label),underlineLine:line.value}});
  }
  const fonts = new Map();
  for (const node of [...main.findAllWithCriteria({types:['TEXT']}),...subjects.flatMap(s=>s.node.findAllWithCriteria({types:['TEXT']}))])
    for (const segment of node.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(segment.fontName),segment.fontName);
  for (const font of fonts.values()) await figma.loadFontAsync(font);
  const results = [];
  try {
    for (const s of subjects) {
      s.node.swapComponent(main); mutated.add(s.node.id);
      s.node.setProperties(s.props);
      const u = await figma.getNodeByIdAsync('I'+s.node.id+';493:7848');
      if (!u || u.type !== 'INSTANCE' || u.componentProperties.Line?.type !== 'VARIANT') throw new Error('Underline lost after migration');
      if (u.componentProperties.Line.value !== s.line) {u.setProperties({Line:s.line});mutated.add(u.id);}
      const label = await figma.getNodeByIdAsync('I'+s.node.id+';493:10618');
      if (!label || label.type !== 'TEXT') throw new Error('Label lost after migration');
      const layout = clone(layoutOf(s.node)), text = textOf(label);
      if (JSON.stringify(layout) !== JSON.stringify(s.layout) || JSON.stringify(text) !== JSON.stringify(s.text))
        throw new Error('Layout or label typography changed');
      for (const [key,value] of Object.entries(s.props)) if (s.node.componentProperties[key]?.value !== value)
        throw new Error('Authored source setting changed');
      const selected = await s.node.getMainComponentAsync();
      if (!selected || selected.id !== main.id || Object.keys(s.node.componentProperties).length !== 10) throw new Error('New source not selected');
      const afterIds = new Set([s.node.id,...s.node.findAll(()=>true).map(c=>c.id)]);
      for (const id of afterIds) if (!s.beforeIds.has(id)) created.add(id);
      for (const id of s.beforeIds) if (!afterIds.has(id)) removed.add(id);
      results.push({before:s.before,after:{id:s.node.id,mainId:selected.id,mainKey:selected.key,properties:clone(s.node.componentProperties),layout,text,underlineLine:u.componentProperties.Line.value},
        checks:{rootPropertiesPreserved:true,layoutPreserved:true,labelTypographyPreserved:true,version4Selected:true}});
    }
  } catch (error) {
    for (const s of subjects) {
      s.node.swapComponent(s.old);s.node.setProperties(s.props);
      const u = await figma.getNodeByIdAsync('I'+s.node.id+';493:7848');
      if (u && u.type === 'INSTANCE') u.setProperties({Line:s.line});
    }
    return {status:'ROLLED_BACK',error:String(error),createdNodeIds:Array.from(created),removedNodeIds:Array.from(removed),
      mutatedNodeIds:Array.from(mutated),sourceInstancesRestored:true,published:false};
  }
  await subjects[0].node.parent.screenshot({scale:2});
  await subjects[1].node.parent.screenshot({scale:2});
  return {status:'DRAFT_UPGRADE_PASS',results,createdNodeIds:Array.from(created),removedNodeIds:Array.from(removed),
    mutatedNodeIds:Array.from(mutated),published:false,libraryFileKey:'IgMTjHSWHjRKY5HyQrDtbA'};
} finally {
  figma.skipInvisibleInstanceChildren = priorSkip;
}
