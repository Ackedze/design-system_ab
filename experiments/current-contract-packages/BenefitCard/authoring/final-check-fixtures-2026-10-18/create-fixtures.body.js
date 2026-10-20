const request=__FIXTURE_REQUEST__;
if(figma.fileKey!==request.fileKey)throw new Error('FIXTURE_FILE_MISMATCH');
const page=await figma.getNodeByIdAsync(request.pageId);if(!page||page.type!=='PAGE')throw new Error('FIXTURE_PAGE_MISSING');
await figma.setCurrentPageAsync(page);
const before=page.children.map(n=>n.id),priorSkip=figma.skipInvisibleInstanceChildren;
figma.skipInvisibleInstanceChildren=false;
const created=new Set(),removed=new Set(),roots=[],captures=[],foreign=[];let failure=null,success=false;
function subtree(n){return [n,...('children'in n?n.children.flatMap(subtree):[])];}
try{
 if(request.variants.length!==2||request.names.some(name=>page.children.some(n=>n.name===name)))throw new Error('FIXTURE_SCOPE_OR_NAME_CONFLICT');
 const mains=await Promise.all(request.variants.map(v=>figma.importComponentByKeyAsync(v.componentKey))),fonts=new Map();
 for(let i=0;i<mains.length;i++){const m=mains[i],v=request.variants[i];if(m.type!=='COMPONENT'||m.key!==v.componentKey||m.parent?.type!=='COMPONENT_SET'||m.parent.key!==v.componentSetKey)throw new Error('FIXTURE_PUBLISHED_IDENTITY_MISMATCH');for(const t of m.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);}
 await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
 let right=Math.max(0,...page.children.filter(n=>'x'in n&&'width'in n).map(n=>n.x+n.width))+512;
 for(let i=0;i<mains.length;i++){
  const main=mains[i],wanted=request.variants[i],instance=main.createInstance();roots.push(instance);for(const n of subtree(instance))created.add(n.id);
  instance.x=Math.ceil(right);instance.y=128;right+=instance.width+96;
  const actualMain=await instance.getMainComponentAsync();if(actualMain?.key!==wanted.componentKey||actualMain.parent?.type!=='COMPONENT_SET'||actualMain.parent.key!==wanted.componentSetKey)throw new Error('FIXTURE_PRISTINE_IDENTITY_MISMATCH');
  const modes={...instance.resolvedVariableModes},collected=await BenefitCardCapture.collectNodes(instance,wanted.platform,modes),snapshot=collected.snapshot;
  snapshot.source.componentKey=wanted.componentKey;snapshot.source.componentSetKey=wanted.componentSetKey;snapshot.source.representationId=wanted.representationId;
  const reference=BenefitCardCapture.captureVariantReference(snapshot,wanted.componentKey,wanted.componentSetKey,Object.keys(actualMain.parent.componentPropertyDefinitions));
  const captured=compactVariant(snapshot,reference,wanted,actualMain,instance.id,modes,subtree(instance).map(n=>n.id),collected.anatomy);
  if(captured.portableReferenceHash!==wanted.expectedPortableReferenceHash)throw new Error('FIXTURE_R9_PORTABLE_PIN_MISMATCH');
  instance.name=request.names[i];captures.push({...captured,fixtureName:instance.name,sourceProofBeforeLabel:true,ownerValidation:'NOT_RUN_USER_ONLY'});
 }
 success=true;
}catch(e){failure={message:String(e?.message||e),stack:String(e?.stack||'')};}
finally{
 if(!success)for(const r of roots){if(r.removed)continue;const all=subtree(r),unknown=all.filter(n=>!created.has(n.id));if(unknown.length){foreign.push(...unknown.map(n=>n.id));continue;}const ids=all.map(n=>n.id);r.remove();ids.forEach(id=>removed.add(id));}
 figma.skipInvisibleInstanceChildren=priorSkip;
}
const after=page.children.map(n=>n.id),unexpected=after.filter(id=>!before.includes(id)&&!roots.some(r=>r.id===id)),missing=before.filter(id=>!after.includes(id));
return finishCompactReceipt({status:success&&!foreign.length&&!unexpected.length&&!missing.length?'FIXTURES_PREPARED_DRAFT_NOT_VALIDATED':'STOP',fileKey:figma.fileKey,pageId:page.id,beforePageNodeIds:before,afterPageNodeIds:after,createdNodeIds:[...created],mutatedNodeIds:[...created],removedNodeIds:[...removed],retainedNodeIds:[...created].filter(id=>!removed.has(id)),createdRootIds:roots.map(r=>r.id),preservedForeignNodeIds:[...new Set(foreign)],unexpectedPageNodeIds:unexpected,missingPreexistingPageNodeIds:missing,failure,captures,nativeValidationRun:false,Ready:false});
