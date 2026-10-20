const request = __APOLLO_CAPTURE_REQUEST__;
if (figma.fileKey !== request.fileKey) throw new Error('CAPTURE_FILE_MISMATCH');
const page = await figma.getNodeByIdAsync(request.pageId);
if (!page || page.type !== 'PAGE') throw new Error('CAPTURE_PAGE_MISSING');
await figma.setCurrentPageAsync(page);
const before = page.children.map(n => n.id);
const previousSkip = figma.skipInvisibleInstanceChildren;
figma.skipInvisibleInstanceChildren = false;
const created = new Set(), removed = new Set(), roots = [], captures = [], foreign = [];
let container, failure;
function subtree(n) { const list = [n]; if ('children' in n) for (const c of n.children) list.push(...subtree(c)); return list; }
try {
  if (page.children.some(n => n.name === request.ownerName)) throw new Error('OWNED_CONTAINER_NAME_ALREADY_PRESENT');
  const importedMains=await Promise.all(request.variants.map(w=>figma.importComponentByKeyAsync(w.componentKey)));
  const fonts=new Map();
  for(let i=0;i<importedMains.length;i++){const main=importedMains[i],wanted=request.variants[i];if(!main||main.type!=='COMPONENT'||main.key!==wanted.componentKey||main.parent?.type!=='COMPONENT_SET'||main.parent.key!==wanted.componentSetKey)throw new Error('PUBLISHED_MAIN_IDENTITY_MISMATCH:'+wanted.componentKey);for(const text of main.findAllWithCriteria({types:['TEXT']}))for(const seg of text.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(seg.fontName),seg.fontName);}
  await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
  const right = Math.max(0,...page.children.filter(n=>'x' in n&&'width' in n).map(n=>n.x+n.width));
  container = figma.createFrame();created.add(container.id);container.name=request.ownerName;
  container.x=Math.ceil(right)+512;container.y=128;container.resize(1,1);container.fills=[];container.clipsContent=false;
  for (let index=0;index<request.variants.length;index++) {
    const wanted=request.variants[index],main=importedMains[index];
    if (!main || main.type !== 'COMPONENT' || main.key !== wanted.componentKey || main.parent?.type !== 'COMPONENT_SET' || main.parent.key !== wanted.componentSetKey) throw new Error('PUBLISHED_MAIN_IDENTITY_MISMATCH:'+wanted.componentKey);
    const instance = main.createInstance();roots.push(instance);
    for(const n of subtree(instance))created.add(n.id);
    container.appendChild(instance);instance.x=0;instance.y=0;
    const actualMain=await instance.getMainComponentAsync();
    if(actualMain?.key!==wanted.componentKey||actualMain.parent?.type!=='COMPONENT_SET'||actualMain.parent.key!==wanted.componentSetKey)throw new Error('PRISTINE_IDENTITY_MISMATCH:'+wanted.componentKey);
    const modes={...instance.resolvedVariableModes};
    const collected=await BenefitCardCapture.collectNodes(instance,wanted.platform,modes);
    const snapshot=collected.snapshot;
    if(!snapshot.source||snapshot.source.truncated!==false||snapshot.source.captureTopology?.complete!==true||snapshot.source.instanceSourceIdentityVersion!==1)throw new Error('INCOMPLETE_NATIVE_CAPTURE:'+wanted.componentKey);
    snapshot.source.componentKey=wanted.componentKey;snapshot.source.componentSetKey=wanted.componentSetKey;snapshot.source.representationId=wanted.representationId;
    const owner=actualMain.parent?.type==='COMPONENT_SET'?actualMain.parent:actualMain;
    const reference=BenefitCardCapture.captureVariantReference(snapshot,wanted.componentKey,wanted.componentSetKey,Object.keys(owner.componentPropertyDefinitions));
    if(!reference.complete)throw new Error('INCOMPLETE_REFERENCE:'+wanted.componentKey);
    const targets=wanted.targets.map(t=>{const shape=reference.nodes.filter(n=>n.path===t.referencePath);const value=reference.nodeProperties[t.referencePath];if(shape.length!==1||shape[0].type!==(t.referencePath===''?'ROOT':t.nodeType)||!value||t.referencePath!==''&&value.sourceIdentity?.version!==1)throw new Error('SEMANTIC_SOURCE_MISSING_OR_AMBIGUOUS:'+t.targetId+':'+wanted.componentKey);return {targetId:t.targetId,semanticRole:t.semanticRole,referencePath:t.referencePath,nodeType:t.nodeType,source:value.sourceIdentity||null};});
    captures.push({componentKey:wanted.componentKey,componentSetKey:wanted.componentSetKey,representationId:wanted.representationId,platform:wanted.platform,mainId:actualMain.id,instanceId:instance.id,modes,complete:true,referenceHash:BenefitCardCapture.stableHash(reference),portableReferenceHash:BenefitCardCapture.portableDeclaredTargetReferenceHash(reference),shapeHash:BenefitCardCapture.stableHash(reference.nodes),targets,snapshot,reference});
  }
} catch(error) { failure={message:String(error?.message||error),stack:String(error?.stack||'')}; }
finally {
  for(const root of roots.reverse()){
    if(root.removed){if(!removed.has(root.id)&&!failure)failure={message:'OWNED_ROOT_REMOVED_EXTERNALLY:'+root.id};continue;}
    const all=subtree(root),unexpected=all.filter(n=>!created.has(n.id));
    if(unexpected.length){foreign.push(...unexpected.map(n=>n.id));continue;}
    const ids=all.map(n=>n.id);root.remove();for(const id of ids)removed.add(id);
  }
  if(container&&!container.removed){
    const unexpected=subtree(container).filter(n=>!created.has(n.id));
    if(container.children.length||unexpected.length)foreign.push(...unexpected.map(n=>n.id));
    else {const id=container.id;container.remove();removed.add(id);}
  }
  figma.skipInvisibleInstanceChildren=previousSkip;
}
const after=page.children.map(n=>n.id),extra=after.filter(id=>!before.includes(id));
return {status:!failure&&!foreign.length&&!extra.length&&captures.length===request.variants.length&&removed.size===created.size?'CAPTURED_CLEANUP_PENDING_INDEPENDENT_READBACK':'STOP',batchId:request.batchId,fileKey:figma.fileKey,pageId:page.id,requestedKeys:request.variants.map(v=>v.componentKey),beforePageNodeIds:before,afterPageNodeIds:after,createdNodeIds:[...created],removedNodeIds:[...removed],createdRootIds:roots.map(n=>n.id),containerId:container?.id,preservedForeignNodeIds:[...new Set(foreign)],unexpectedPageNodeIds:extra,failure,captures,pristineSourceOnly:true,nativeValidationRun:false,Ready:false};
