const page=await figma.getNodeByIdAsync('8701:32684');await figma.setCurrentPageAsync(page);
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
try{
 const main=await figma.importComponentByKeyAsync('__VARIANT_KEY__');
 if(main.parent?.type!=='COMPONENT_SET'||main.parent.key!=='f188fb1de981b2f32966f4844a4b10cffdb81c35')throw Error('Missing IconView');
 const fonts=new Map();for(const n of main.findAllWithCriteria({types:['TEXT']}))for(const s of n.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);for(const f of fonts.values())await figma.loadFontAsync(f);
 const c=__CAPTURE_FACTORY__(api);
 reference=wrap(main).createInstance();page.appendChild(unwrap(reference));
 const s=(await c.collectNodes(reference,'universal',{...reference.resolvedVariableModes})).snapshot;s.source.componentKey=main.key;s.source.componentSetKey=main.parent.key;
 const defs=Object.fromEntries(Object.entries(main.parent.componentPropertyDefinitions).map(([k,v])=>[k,{type:v.type,defaultValue:v.defaultValue,variantOptions:v.variantOptions}]));
 const result={fileKey:figma.fileKey,master:{key:main.key,properties:main.variantProperties},set:{key:main.parent.key},definitions:defs,reference:c.captureVariantReference(s,main.key,main.parent.key,Object.keys(defs))};
 result.createdNodeIds=Array.from(created);const json=JSON.stringify(result).replace(/[^\x20-\x7e]/g,x=>'\\u'+x.charCodeAt(0).toString(16).padStart(4,'0')),input=Uint8Array.from(json,x=>x.charCodeAt(0)),z=new c.ZStream();
 if(c.deflateInit2(z,9,8,-15,8,0)!==0)throw Error('init');z.input=input;z.next_in=0;z.avail_in=input.length;z.output=new Uint8Array(input.length+Math.ceil(input.length/16383)*5+256);z.next_out=0;z.avail_out=z.output.length;
 if(c.deflate(z,4)!==1)throw Error('end');const bytes=z.output.slice(0,z.next_out);c.deflateEnd(z);let binary='';for(const n of bytes)binary+=String.fromCharCode(n);
 return{encoding:'deflate-raw-base64',data:btoa(binary),createdNodeIdsInData:true,mutatedNodeIds:[],temporaryNodesRemoved:true};
}finally{if(reference)reference.remove();figma.skipInvisibleInstanceChildren=priorSkip;}
