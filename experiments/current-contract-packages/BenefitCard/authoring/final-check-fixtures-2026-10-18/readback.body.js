const request=__READBACK_REQUEST__;
if(figma.fileKey!==request.fileKey)throw new Error('READBACK_FILE_MISMATCH');
const page=await figma.getNodeByIdAsync(request.pageId);if(!page||page.type!=='PAGE')throw new Error('READBACK_PAGE_MISSING');await figma.setCurrentPageAsync(page);
const priorSkip=figma.skipInvisibleInstanceChildren;figma.skipInvisibleInstanceChildren=false;
try{
 const nodes=await Promise.all(request.nodeIds.map(id=>figma.getNodeByIdAsync(id))),byId=new Map(nodes.filter(Boolean).map(n=>[n.id,n]));
 if(nodes.some(n=>!n)||byId.size!==42)throw new Error('READBACK_MISSING_OR_DUPLICATE_NODE');
 const roots=[];
 for(const wanted of request.roots){
  const instance=byId.get(wanted.id);if(instance.type!=='INSTANCE'||instance.parent?.id!==page.id||instance.name!==wanted.name)throw new Error('READBACK_ROOT_NOT_RETAINED');
  const main=await instance.getMainComponentAsync();if(main?.key!==wanted.componentKey||main.parent?.type!=='COMPONENT_SET'||main.parent.key!==wanted.componentSetKey)throw new Error('READBACK_SOURCE_KEY_MISMATCH');
  const properties=instance.componentProperties;for(const [name,value]of Object.entries(wanted.properties))if(properties[name]?.type!==wanted.propertyTypes[name]||properties[name].value!==value)throw new Error('READBACK_PUBLIC_PROPERTIES_CHANGED');
  const actualModes=instance.resolvedVariableModes;if(Object.keys(actualModes).length!==Object.keys(wanted.modes).length||Object.keys(wanted.modes).some(k=>actualModes[k]!==wanted.modes[k]))throw new Error('READBACK_MODES_CHANGED');
  const shape=[],ids=[],at=new Map();function visit(n,p){ids.push(n.id);at.set(p,n);shape.push({path:p,type:p===''?'ROOT':n.type});if('children'in n)for(const c of n.children)visit(c,[p,c.name].filter(Boolean).join(' / '));}visit(instance,'');
  shape.sort((a,b)=>a.path.localeCompare(b.path)||a.type.localeCompare(b.type));if(shape.length!==wanted.expectedShape.length||new Set(shape.map(n=>n.path)).size!==shape.length||shape.some((n,i)=>n.path!==wanted.expectedShape[i].path||n.type!==wanted.expectedShape[i].type)||ids.some(id=>!byId.has(id)))throw new Error('READBACK_SHAPE_CHANGED');
  const content=at.get(wanted.freshness.path);if(content?.type!=='INSTANCE')throw new Error('READBACK_CONTENT_MISSING');const cm=await content.getMainComponentAsync();if(cm?.key!==wanted.freshness.expectedContentComponentKey||content.componentProperties.Title?.type!=='VARIANT'||content.componentProperties.Title.value!==wanted.freshness.expectedTitle)throw new Error('READBACK_TITLE_CHANGED');
  roots.push({id:instance.id,name:instance.name,componentKey:main.key,componentSetKey:main.parent.key,properties:Object.fromEntries(Object.entries(properties).map(([k,v])=>[k,{type:v.type,value:v.value}])),modes:instance.resolvedVariableModes,nodeIds:ids,shapeExact:true,freshness:{contentKey:cm.key,title:content.componentProperties.Title.value}});
 }
 if(new Set(roots.flatMap(r=>r.nodeIds)).size!==request.nodeIds.length)throw new Error('READBACK_NODE_UNION_CHANGED');
 const after=page.children.map(n=>n.id),missing=request.beforePageNodeIds.filter(id=>!after.includes(id)),extra=after.filter(id=>!request.beforePageNodeIds.includes(id)&&!request.roots.some(r=>r.id===id));
 if(missing.length||extra.length)throw new Error('READBACK_PAGE_DISPOSITION_CHANGED');
 const result={status:'PASS_PERSISTENT_FIXTURE_READINESS_ONLY',fileKey:figma.fileKey,pageId:page.id,roots,all42NodeIds:request.nodeIds,allPriorPageIdsRetained:true,onlyTwoNewRoots:true,removedNodeIds:[],readOnly:true,nativeValidationRun:false,Ready:false};
 const utf8=s=>encodeURIComponent(s).replace(/%[A-Fa-f0-9]{2}/g,'x').length;result.inlineBytes=0;for(let i=0;i<5;i++){const size=utf8(JSON.stringify(result));if(size===result.inlineBytes)break;result.inlineBytes=size;}if(result.inlineBytes!==utf8(JSON.stringify(result))||result.inlineBytes>=18000)throw new Error('READBACK_INLINE_LIMIT');return result;
}finally{figma.skipInvisibleInstanceChildren=priorSkip;}
