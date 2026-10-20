const page=await figma.getNodeByIdAsync('8701:32684');await figma.setCurrentPageAsync(page);
const priorSkip=figma.skipInvisibleInstanceChildren;figma.skipInvisibleInstanceChildren=false;
const created=new Set(),temporaryRoots=[],removedRoots=[],sourceTrees=[],rawByProxy=new WeakMap(),proxies=new WeakMap();
const unwrap=v=>v&&typeof v==='object'?rawByProxy.get(v)||v:v;
function record(n){created.add(n.id);if('children'in n)for(const ch of n.children)record(ch);}
function wrap(n){if(!n||typeof n!=='object'||!('id'in n)||!('type'in n))return n;if(proxies.has(n))return proxies.get(n);const p=new Proxy(n,{get(t,k){const v=Reflect.get(t,k,t);if(k==='children')return v.map(wrap);if(k==='parent')return wrap(v);if(k==='getMainComponentAsync')return async()=>wrap(await t.getMainComponentAsync());if(k==='createInstance')return(...a)=>{const r=v.apply(t,a.map(unwrap));record(r);temporaryRoots.push(r.id);const entries=[];function visit(n,parentIndex){const i=entries.length;entries.push({figmaNodeId:n.id,name:n.name,type:n.type,parentIndex,childIndexes:[]});if(parentIndex!==null)entries[parentIndex].childIndexes.push(i);if('children'in n)for(const ch of n.children)visit(ch,i);}visit(r,null);sourceTrees.push({rootId:r.id,mainComponentId:t.id,componentKey:t.key,remote:t.remote,entries});return wrap(r);};if(k==='remove')return()=>{removedRoots.push(t.id);return v.call(t);};return typeof v==='function'? (...a)=>v.apply(t,a.map(unwrap)):v;}});proxies.set(n,p);rawByProxy.set(p,n);return p;}
const api=new Proxy(figma,{get(t,k){if(k==='getNodeByIdAsync')return async id=>wrap(await t.getNodeByIdAsync(id));const v=Reflect.get(t,k,t);return k==='currentPage'||k==='root'?wrap(v):typeof v==='function'?v.bind(t):v;}});
const c=__FACTORY__(api),batch=__BATCH__,results=[],retained=[];let stop=false;
try{const section=await figma.getNodeByIdAsync('14018:68787');if(section?.type!=='SECTION')throw Error('QA section missing');
for(const b of batch){let reference,keep=false;try{const main=await figma.importComponentByKeyAsync(b.componentKey);
if(main.parent?.type!=='COMPONENT_SET'||main.parent.key!==b.componentSetKey)throw Error('Published root set identity unavailable');
for(const n of main.findAllWithCriteria({types:['TEXT']}))for(const f of n.getStyledTextSegments(['fontName']))await figma.loadFontAsync(f.fontName);
reference=wrap(main).createInstance();section.appendChild(unwrap(reference));
const s=(await c.collectNodes(reference,b.representationId.includes('mobile-web')?'mobile-web':'desktop',{...reference.resolvedVariableModes})).snapshot;
s.source.componentKey=main.key;s.source.componentSetKey=main.parent.key;
const definitions=Object.fromEntries(Object.entries(main.parent.componentPropertyDefinitions).map(([k,v])=>[k,{type:v.type,defaultValue:v.defaultValue,variantOptions:v.variantOptions}]));
const ref=c.captureVariantReference(s,main.key,main.parent.key,Object.keys(definitions));const portable=c.portableDeclaredTargetReferenceHash(ref),configuration=c.configurationDeclaredTargetReferenceHash(ref);
const pass=portable===b.portableReferenceHash&&configuration===b.configurationReferenceHash;
keep=pass&&b.retain;const rootId=unwrap(reference).id;
results.push({status:pass?'PASS':'REFERENCE_DRIFT',componentKey:main.key,componentSetKey:main.parent.key,mainId:main.id,mainRemote:main.remote,representationId:b.representationId,rootId,definitions,reference:ref,portableReferenceHash:portable,configurationReferenceHash:configuration,sourceTopologyComplete:s.source.captureTopology.complete,sourceOwners:s.source.instanceSourceIdentityCapture?.owners,retained:keep});
if(keep)retained.push({id:rootId,componentKey:main.key,representationId:b.representationId});
if(!pass){stop=true;break;}
}catch(e){results.push({status:'CAPTURE_FAILED',componentKey:b.componentKey,error:String(e)});stop=true;break;}finally{if(reference&&!keep)reference.remove();}}
}finally{figma.skipInvisibleInstanceChildren=priorSkip;}
return {status:stop?'STOPPED':'PRISTINE_BATCH_PASS',results,sourceTrees,retained,createdNodeIds:[...created],mutatedNodeIds:['14018:68787'],temporaryRoots,removedRoots,remainingCreatedRoots:temporaryRoots.filter(id=>!removedRoots.includes(id))};
