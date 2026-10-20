const fs=require('node:fs'),assert=require('node:assert/strict');
const {root,base,pin,load,exact,guard}=require('./guard.cjs');
const core=require('/Users/alexkukhta/Desktop/workplace/projects/ComponentContractEditor/dist/core.cjs');
const wire=x=>JSON.parse(JSON.stringify(x));
function parsed(name){const raw=load(root+'/'+name);assert.notEqual(raw.isError,true,name);assert.equal(raw.content.filter(c=>c.type==='text').length,1);return {raw,value:JSON.parse(raw.content.find(c=>c.type==='text').text)};}
function validateBatch(batchId,requireCleanup=true){
  const preparation=load(root+'/COMPACT-PREPARATION-r3.json');for(const p of preparation.pins)exact(p);exact(preparation.grant);exact(preparation.canonicalCollector);
  const schema=load(root+'/compact-schema-r3.json'),request=load(root+'/'+batchId+'.request.json'),{value:r}=parsed(batchId+'.tool-result.json');
  for(const k of schema.batchRequired)assert.ok(Object.hasOwn(r,k),k);
  assert.equal(r.inlineBytes,Buffer.byteLength(JSON.stringify(r)));assert.ok(r.inlineBytes<18000);assert.ok(request.variants.length<=2);
  assert.equal(r.status,'CAPTURED_CLEANUP_PENDING_INDEPENDENT_READBACK');assert.equal(r.fileKey,request.fileKey);assert.equal(r.pageId,request.pageId);assert.equal(r.batchId,batchId);
  assert.equal(r.pristineSourceOnly,true);assert.equal(r.nativeValidationRun,false);assert.equal(r.Ready,false);assert.equal(r.failure,null);
  assert.deepEqual(r.requestedKeys,request.variants.map(v=>v.componentKey));assert.deepEqual([...r.beforePageNodeIds].sort(),[...r.afterPageNodeIds].sort());
  for(const k of ['preservedForeignNodeIds','unexpectedPageNodeIds'])assert.deepEqual(r[k],[]);
  for(const k of ['createdNodeIds','mutatedNodeIds','removedNodeIds'])assert.equal(new Set(r[k]).size,r[k].length);
  assert.deepEqual([...r.createdNodeIds].sort(),[...r.removedNodeIds].sort());assert.deepEqual([...r.createdNodeIds].sort(),[...r.mutatedNodeIds].sort());
  assert.ok(r.createdNodeIds.includes(r.containerId));assert.equal(r.createdRootIds.length,request.variants.length);assert.ok(r.createdRootIds.every(id=>r.createdNodeIds.includes(id)));
  assert.equal(r.captures.length,request.variants.length);
  for(const [i,c] of r.captures.entries()){
    const v=request.variants[i];for(const k of schema.variantRequired)assert.ok(Object.hasOwn(c,k),k);
    for(const k of ['componentKey','componentSetKey','representationId','platform','variantName'])assert.equal(c[k],v[k]);assert.equal(c.sourceVariantId,v.sourceNodeId);
    assert.equal(c.complete,true);assert.equal(c.hiddenChildrenIncluded,true);assert.equal(c.instanceSourceIdentityVersion,1);assert.equal(c.captureTopology.complete,true);assert.equal(c.captureTopology.limitReached,false);assert.deepEqual(c.captureTopology.issues,[]);
    assert.deepEqual(c.properties,v.expectedRootProperties);assert.deepEqual(c.propertyTypes,v.expectedRootPropertyTypes);assert.ok(c.modes&&typeof c.modes==='object'&&!Array.isArray(c.modes));
    assert.deepEqual(c.nativeIdCorrespondence,{status:'EXACT_CANONICAL_ANATOMY_NATIVE_SUBTREE',nativeCount:c.nodeCount,anatomyCount:c.nodeCount,snapshotCount:c.nodeCount});assert.equal(c.nodeCount,v.expectedShape.length);assert.equal(c.shapeHash,v.expectedShapeHash);assert.deepEqual(c.shapeComparison,{status:'EXACT_PATH_TYPE_UNIQUE',expectedCount:v.expectedShape.length,actualCount:v.expectedShape.length});
    for(const k of ['referenceHash','portableReferenceHash','shapeHash'])assert.match(c[k],/^[0-9a-f]{64}$/);
    assert.ok(r.createdRootIds.includes(c.instanceId));assert.equal(c.freshness.status,'EXACT_PUBLISHED_SOURCE');assert.equal(c.freshness.provenanceHash,v.freshness.provenanceHash);assert.equal(c.freshness.path,v.freshness.path);assert.equal(c.freshness.type,'VARIANT');assert.equal(c.freshness.value,v.freshness.expectedTitle);assert.equal(c.freshness.contentComponentKey,v.freshness.expectedContentComponentKey);
    assert.equal(c.targets.length,v.targets.length);for(const [j,t] of c.targets.entries()){const wanted=v.targets[j];for(const k of schema.targetRequired)assert.ok(Object.hasOwn(t,k),k);for(const k of ['targetId','semanticRole','referencePath','nodeType'])assert.equal(t[k],wanted[k]);if(t.referencePath!==''){assert.equal(t.source.version,1);for(const k of ['sourceNodeId','ownerComponentKey','ownerMainComponentId'])assert.ok(typeof t.source[k]==='string'&&t.source[k].length>0);}}
  }
  let cleanup;
  if(requireCleanup){cleanup=parsed(batchId+'.cleanup.tool-result.json').value;assert.equal(cleanup.status,'PASS');assert.equal(cleanup.batchId,batchId);assert.deepEqual(cleanup.missingPreexistingPageNodeIds,[]);assert.ok(cleanup.ownedRootDispositions.every(x=>x.present===false));assert.deepEqual(cleanup.ownedRootDispositions.map(x=>x.id).sort(),[r.containerId,...r.createdRootIds].sort());assert.equal(cleanup.readOnly,true);}
  return {request,receipt:r,cleanup};
}
module.exports={validateBatch};
if(require.main===module){const batchId=process.argv[2];assert.match(batchId,/^compact-r3-\d{2}$/);const before=guard(batchId+'-accept-before'),r=validateBatch(batchId,process.argv[3]!=='--before-cleanup');if(process.argv[3]==='--before-cleanup'){console.log(JSON.stringify({status:'PASS_COMPACT_RECEIPT_CLEANUP_PENDING',batchId,captures:r.receipt.captures.length,bytes:r.receipt.inlineBytes}));}else{const after=guard(batchId+'-accept-after');const acceptance={status:'PASS_SOURCE_IDENTITY_AND_CLEANUP',batchId,toolResult:pin(root+'/'+batchId+'.tool-result.json'),cleanupToolResult:pin(root+'/'+batchId+'.cleanup.tool-result.json'),request:pin(root+'/'+batchId+'.request.json'),driver:pin(root+'/'+batchId+'.js'),inlineBytes:r.receipt.inlineBytes,variants:r.receipt.captures.length,targets:r.receipt.captures.reduce((n,c)=>n+c.targets.length,0),createdRemoved:r.receipt.createdNodeIds.length,before,after,nativeValidationRun:false,Ready:false};fs.writeFileSync(root+'/'+batchId+'.accepted.json',JSON.stringify(acceptance)+'\n',{flag:'wx'});console.log(JSON.stringify({status:acceptance.status,batchId,variants:acceptance.variants,targets:acceptance.targets,inlineBytes:acceptance.inlineBytes}));}}
