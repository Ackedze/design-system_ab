const page = await figma.getNodeByIdAsync('3:476');
if (!page || page.type !== 'PAGE') throw new Error('Source page missing');
await figma.setCurrentPageAsync(page);
const priorSkip = figma.skipInvisibleInstanceChildren;
figma.skipInvisibleInstanceChildren = false;
const created = new Set(), rawByProxy = new WeakMap(), proxies = new WeakMap();
const unwrap = value => value && typeof value === 'object' ? rawByProxy.get(value) || value : value;
function record(node) {
  created.add(node.id);
  if ('children' in node) for (const child of node.children) record(child);
}
function wrap(node) {
  if (!node || typeof node !== 'object' || !('type' in node) || !('id' in node)) return node;
  if (proxies.has(node)) return proxies.get(node);
  const proxy = new Proxy(node, {get(target,key) {
    const value = Reflect.get(target,key,target);
    if (key === 'children') return value.map(wrap);
    if (key === 'parent') return wrap(value);
    if (key === 'getMainComponentAsync') return async () => wrap(await target.getMainComponentAsync());
    if (key === 'createInstance' || key === 'clone') return (...args) => {
      const result = value.apply(target,args.map(unwrap));record(result);return wrap(result);
    };
    return typeof value === 'function' ? (...args) => value.apply(target,args.map(unwrap)) : value;
  }});
  proxies.set(node,proxy);rawByProxy.set(proxy,node);return proxy;
}
const api = new Proxy(figma, {get(target,key) {
  if (key === 'getNodeByIdAsync') return async id => wrap(await target.getNodeByIdAsync(id));
  const value = Reflect.get(target,key,target);
  return key === 'currentPage' || key === 'root' ? wrap(value) : typeof value === 'function' ? value.bind(target) : value;
}});
let reference;
try {
  const main = await figma.importComponentByKeyAsync('bb2e85770f194e7bed71f247e82d40d0c4afd1e3');
  if (!main.parent || main.parent.type !== 'COMPONENT_SET' || main.parent.key !== 'c1a788fea95f376b3c344b85ce006493b530db94')
    throw new Error('Link r5 owner missing');
  const fonts = new Map();
  for (const text of main.findAllWithCriteria({types:['TEXT']})) for (const segment of text.getStyledTextSegments(['fontName']))
    fonts.set(JSON.stringify(segment.fontName),segment.fontName);
  for (const font of fonts.values()) await figma.loadFontAsync(font);
  const module = {exports:{}};
  const capture = new Function('figma','module',`/*__SHARED_CAPTURE_BUNDLE__*/\nreturn module.exports;`)(api,module);
  reference = wrap(main).createInstance();
  page.appendChild(unwrap(reference));
  const result = await capture.collectNodes(reference,'universal',{...reference.resolvedVariableModes});
  result.snapshot.source.componentKey = main.key;
  result.snapshot.source.componentSetKey = main.parent.key;
  const defined = Object.keys(main.parent.componentPropertyDefinitions);
  result.snapshot.variantReference = capture.captureVariantReference(result.snapshot,main.key,main.parent.key,defined);
  return {kind:'independent-native-source-preflight',reference:result.snapshot.variantReference,definitionNames:defined,
    createdNodeIds:Array.from(created),mutatedNodeIds:[],temporaryNodesRemoved:true,published:false};
} finally {
  if (reference) reference.remove();
  figma.skipInvisibleInstanceChildren = priorSkip;
}
