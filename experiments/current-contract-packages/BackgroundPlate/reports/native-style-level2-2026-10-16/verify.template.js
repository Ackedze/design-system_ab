const input=__INPUT__,page=figma.root.children.find(p=>p.id==='8701:32684');
await figma.setCurrentPageAsync(page);figma.skipInvisibleInstanceChildren=false;
const section=page.children.find(n=>n.id===input.sectionId),old=page.children.find(n=>n.id==='14018:68787');
if(section?.type!=='SECTION'||old?.type!=='SECTION')throw Error('QA section missing');
const clean=x=>typeof x==='symbol'?'MIXED':Array.isArray(x)?x.map(clean):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clean(v)])):x;
const protectedNodes=[];
function visitOld(n){const x={id:n.id,type:n.type,name:n.name,parentId:n.parent?.id,x:n.x,y:n.y,width:n.width,height:n.height,visible:n.visible};if(n.type==='TEXT'){x.characters=n.characters;x.textStyleId=n.textStyleId;}if('fills'in n)x.fills=clean(n.fills);if('strokes'in n)x.strokes=clean(n.strokes);if(n.type==='INSTANCE')x.properties=clean(n.componentProperties);protectedNodes.push(x);if('children'in n)for(const c of n.children)visitOld(c);}
visitOld(old);const serialized=JSON.stringify(protectedNodes);let h=2166136261,d=5381;
for(let i=0;i<serialized.length;i++){h=Math.imul(h^serialized.charCodeAt(i),16777619)>>>0;d=(Math.imul(d,33)^serialized.charCodeAt(i))>>>0;}
const protectedFingerprint={sectionId:old.id,nodeCount:protectedNodes.length,serializedLength:serialized.length,fnv1a32:h.toString(16),djb2xor32:d.toString(16)};
if(JSON.stringify(protectedFingerprint)!==JSON.stringify(input.protected))throw Error('Historical section state drift');
const owned=new Map();function visit(n){owned.set(n.id,n);if('children'in n)for(const ch of n.children)visit(ch);}visit(section);
if(owned.size!==input.createdNodeIds.length||input.createdNodeIds.some(id=>!owned.has(id)))throw Error('Owned creation inventory mismatch');
const styleIds=new Set(Object.values(input.styles).map(s=>s.id)),manualText=[],results=[];
const visible=paints=>Array.isArray(paints)?paints.filter(p=>p.visible!==false&&(p.opacity??1)>0):[];
for(const n of owned.values()){
  if(n.type==='TEXT'){
    if(!styleIds.has(n.textStyleId)||visible(n.fills).some(p=>!p.boundVariables?.color))throw Error('Unstyled QA label');
    manualText.push({id:n.id,textStyleId:n.textStyleId,colorTokenIds:visible(n.fills).map(p=>p.boundVariables.color.id)});
  }
  if(n.type==='FRAME')for(const key of ['fills','strokes'])if(visible(n[key]).some(p=>p.type==='SOLID'&&!p.boundVariables?.color))throw Error('Raw scaffold paint');
}
for(const c of input.cases){
  const root=owned.get(c.nodeId),surface=owned.get(c.surfaceNodeId),card=owned.get(c.cardId),host=owned.get(c.hostId),caption=owned.get(c.captionId),parameters=owned.get(c.parameterTextId),expectation=owned.get(c.expectationTextId);
  if(root?.type!=='INSTANCE'||surface?.type!=='INSTANCE'||caption?.type!=='TEXT'||parameters?.type!=='TEXT'||expectation?.type!=='TEXT')throw Error('Case type mismatch');
  if(root.parent!==host||host.parent!==card||surface.parent!==root)throw Error('Case hierarchy mismatch');
  if(!caption.characters.startsWith(c.id+' · '+c.styleType)||!parameters.characters.includes('Position='+c.position)||!parameters.characters.includes('Type='+c.styleType)||!expectation.characters.includes('Ожидаем: '+c.expectedViolationCount+' нарушений.'))throw Error('Visible annotation mismatch');
  if(root.componentProperties.Position?.value!==c.position||root.componentProperties.Position.type!=='VARIANT')throw Error('Position mismatch');
  for(const [k,value]of Object.entries({Type:c.styleType,Skeleton:c.skeleton,BackgroundColor:c.backgroundColor}))if(surface.componentProperties[k]?.value!==value||surface.componentProperties[k].type!=='VARIANT')throw Error('Typed Style parameter mismatch');
  const main=await root.getMainComponentAsync(),styleMain=await surface.getMainComponentAsync();
  if(main?.key!==c.componentKey||main.parent?.type!=='COMPONENT_SET'||main.parent.key!==c.componentSetKey||styleMain?.key!==c.surfaceComponentKey||styleMain.parent?.type!=='COMPONENT_SET'||styleMain.parent.key!==c.surfaceComponentSetKey)throw Error('Committed source identity mismatch');
  const fills=visible(surface.fills),strokes=visible(surface.strokes);
  if(c.styleType==='Colored'&&(fills.length!==1||strokes.length!==0))throw Error('Colored appearance mismatch');
  if(c.styleType==='Border'&&(fills.length!==0||strokes.length!==1))throw Error('Border appearance mismatch');
  const field=c.styleType==='Border'?'strokes':'fills',paint=visible(surface[field])[0];
  if(!paint||Boolean(paint.boundVariables?.color)===c.negative)throw Error('Token detach mismatch');
  if(JSON.stringify(clean(surface.fills))!==JSON.stringify(c.after.fills)||JSON.stringify(clean(surface.strokes))!==JSON.stringify(c.after.strokes))throw Error('Committed paint drift');
  if(c.negative){const before=c.before[field][0];if(JSON.stringify(before.color)!==JSON.stringify(paint.color)||before.opacity!==paint.opacity)throw Error('Detach changed paint appearance');}
  if(root.width>host.width-host.paddingLeft-host.paddingRight+.01)throw Error('Preview overflows host');
  results.push({id:c.id,nodeId:root.id,surfaceNodeId:surface.id,rootComponentKey:main.key,surfaceComponentKey:styleMain.key,surfaceComponentSetKey:styleMain.parent.key,rootProperties:clean(root.componentProperties),styleProperties:clean(surface.componentProperties),fills:clean(surface.fills),strokes:clean(surface.strokes),cardCaption:caption.characters,parameterText:parameters.characters,expectationText:expectation.characters,requiredCompliantRules:c.requiredCompliantRules,expectedViolations:c.expectedViolations,url:c.url,status:'FIXTURE_STATE_AND_LABEL_PASS'});
}
return {status:'COMMITTED_FIXTURE_READBACK_PASS',sectionId:section.id,boardId:input.boardId,protectedFingerprint,oldSectionUnchanged:true,caseCount:results.length,ownedNodeCount:owned.size,manualText,results,createdNodeIds:[],mutatedNodeIds:[],EditorValidation:'NOT_RUN_USER_ONLY'};
