function compactVariant(snapshot, reference, wanted, actualMain, instanceId, modes, nativeNodeIds) {
  const check = (ok, code) => { if (!ok) throw new Error(code + ':' + wanted.componentKey); };
  const hash = BenefitCardCapture.stableHash;
  check(reference.complete === true && snapshot.source.truncated === false && snapshot.source.captureTopology.complete === true, 'INCOMPLETE_CAPTURE');
  check(new Set(snapshot.nodes.map(n => String(n.id))).size === snapshot.nodes.length && snapshot.nodes.length === nativeNodeIds.length && nativeNodeIds.every(id => snapshot.nodes.some(n => String(n.id) === id)), 'HIDDEN_TOPOLOGY_INCOMPLETE');
  check(new Set(reference.nodes.map(n => n.path)).size === reference.nodes.length, 'AMBIGUOUS_SHAPE');
  check(reference.nodes.length === wanted.expectedShape.length && reference.nodes.every((n, i) => n.path === wanted.expectedShape[i].path && n.type === wanted.expectedShape[i].type), 'SOURCE_SHAPE_MISMATCH');
  check(hash(reference.nodes) === wanted.expectedShapeHash, 'SOURCE_SHAPE_HASH_MISMATCH');
  check(hash(reference.properties) === hash(wanted.expectedRootProperties) && hash(reference.propertyTypes) === hash(wanted.expectedRootPropertyTypes), 'TYPED_ROOT_MISMATCH');
  const fresh = wanted.freshness, content = reference.nodeProperties[fresh.path];
  check(content && content.propertyTypes.Title === 'VARIANT' && content.properties.Title === fresh.expectedTitle && content.identity?.componentKey === fresh.expectedContentComponentKey && content.sourceIdentity?.version === 1, 'PUBLISHED_TITLE_NOT_FRESH');
  const targets = wanted.targets.map(t => {
    const matches = reference.nodes.filter(n => n.path === t.referencePath), value = reference.nodeProperties[t.referencePath];
    check(matches.length === 1 && matches[0].type === (t.referencePath === '' ? 'ROOT' : t.nodeType) && value, 'TARGET_PATH_TYPE_MISMATCH:' + t.targetId);
    const source = value.sourceIdentity;
    check(t.referencePath === '' || source?.version === 1 && ['sourceNodeId', 'ownerComponentKey', 'ownerMainComponentId'].every(k => typeof source[k] === 'string' && source[k].length > 0), 'TARGET_SOURCE_UNKNOWN:' + t.targetId);
    return {targetId:t.targetId,semanticRole:t.semanticRole,referencePath:t.referencePath,nodeType:t.nodeType,source:source || null};
  });
  return {componentKey:wanted.componentKey,componentSetKey:wanted.componentSetKey,representationId:wanted.representationId,platform:wanted.platform,sourceVariantId:wanted.sourceNodeId,variantName:wanted.variantName,mainId:actualMain.id,instanceId,modes,properties:reference.properties,propertyTypes:reference.propertyTypes,complete:true,nodeCount:snapshot.nodes.length,hiddenChildrenIncluded:true,instanceSourceIdentityVersion:snapshot.source.instanceSourceIdentityVersion,captureTopology:snapshot.source.captureTopology,referenceHash:hash(reference),portableReferenceHash:BenefitCardCapture.portableDeclaredTargetReferenceHash(reference),shapeHash:hash(reference.nodes),shapeComparison:{status:'EXACT_PATH_TYPE_UNIQUE',expectedCount:wanted.expectedShape.length,actualCount:reference.nodes.length},freshness:{path:fresh.path,property:'Title',type:content.propertyTypes.Title,value:content.properties.Title,contentComponentKey:content.identity.componentKey,source:content.sourceIdentity,expectedTitle:fresh.expectedTitle,expectedContentComponentKey:fresh.expectedContentComponentKey,provenanceHash:fresh.provenanceHash,status:'EXACT_PUBLISHED_SOURCE'},targets};
}
function finishCompactReceipt(receipt) {
  const utf8 = s => encodeURIComponent(s).replace(/%[A-Fa-f0-9]{2}/g, 'x').length;
  receipt.inlineBytes = 0;
  for (let i = 0; i < 5; i++) { const measured = utf8(JSON.stringify(receipt)); if (measured === receipt.inlineBytes) break; receipt.inlineBytes = measured; }
  if (receipt.inlineBytes !== utf8(JSON.stringify(receipt)) || receipt.inlineBytes >= 18000) throw new Error('COMPACT_INLINE_UTF8_LIMIT:' + receipt.inlineBytes);
  return receipt;
}
