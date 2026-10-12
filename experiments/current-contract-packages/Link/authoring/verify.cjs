const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,workspace=path.resolve(root,'../../../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const copy=v=>JSON.parse(JSON.stringify(v)),read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const compiled=read('compiled/component-contract.v2.json'),contract=core.prepareAuthoringPreviewContract(compiled);
const activity=read('sources/native/Link.property-activity.native-facts.2026-10-10.json');
function snapshot(size){
 const d=read(`sources/native/Link.${size}.native-facts.2026-10-10.json`);
 const a=activity.variants.find(v=>v.componentKey===d.master.key);
 assert(a.complete);assert.equal(a.portableReferenceHash,core.portableDeclaredTargetReferenceHash(d.reference));
 d.reference.nodes.sort((a,b)=>a.path.localeCompare(b.path)||a.type.localeCompare(b.type));
 const nodes=d.nodes.map(row=>{
  const [id,parentId,childIds,order,name,type,visible,p,layout,appearance,text,bounds,bindings,unknownFacts]=row;
  const native=d.reference.nodeProperties[p],component={properties:native.properties,propertyTypes:native.propertyTypes,propertyReferences:native.propertyReferences,
   propertyReferenceBindings:native.propertyReferenceBindings||{},...(native.identity?{identity:native.identity}:{}),...(native.sourceIdentity?{sourceIdentity:native.sourceIdentity}:{})};
  const propertyActivityV1=a.properties.find(n=>n.path===p).propertyActivityV1;
  const effective={layout,appearance,text,bounds,visible,variable:{bindings},component,propertyActivityV1};
  return {id,parentId,childIds,order,name,type,visible,visibility:{local:visible,effective:visible},semantic:{path:'Link'+(p?' / '+p:'')},layout,appearance,text,bounds,variable:{bindings},component,
   baseline:{effective:copy(effective)},baselineProvenance:{status:'matched'},propertyActivityV1,unknownFacts:copy(unknownFacts),resolvedModes:{}};
 });
 return {schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:d.capturedAt,selection:[nodes[0].id],nodes,context:{platform:'universal',modes:{active:[]},unknownFacts:[]},variantReference:copy(d.reference),
  source:{fileKey:d.fileKey,fileName:'Workshop AI',pageId:d.pageId,rootNodeId:nodes[0].id,componentKey:d.master.key,componentSetKey:d.set.key,
   instanceIdentityVersion:1,instanceSourceIdentityVersion:1,occurrenceAddressVersion:1,geometryCaptureVersion:1,truncated:false,nodeLimit:500,captureTopology:{version:1,complete:true,limitReached:false,issues:[]}}};
}
const rows=[];
const result=s=>core.evaluateCompiledContract(s,contract);
const violations=r=>r.evaluations.filter(e=>e.classification==='violation');
const evidence=e=>({ruleId:e.ruleId,subjectNodeId:e.subjectNodeId,classification:e.classification,trace:e.trace});
const baselines=[];
for(const size of ['S','S20','M','L']){
 const base=snapshot(size),good=result(base);
 assert.equal(violations(good).length,0,JSON.stringify(violations(good)));
 const prepared=core.prepareValidationSnapshot(base,contract);
 assert(prepared.declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'),JSON.stringify(prepared.declaredTargetIdentitiesV1));
 baselines.push({size,resolvedTargets:prepared.declaredTargetIdentitiesV1.targets.length,classifications:good.evaluations.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{})});
 const label=base.nodes.find(n=>n.semantic.path==='Link / Content / Label');
 const icon=base.nodes.find(n=>n.component.propertyReferenceBindings.mainComponent?.startsWith('Left icon'));
 const cases=[
  ['gap',s=>s.nodes[0].layout.itemSpacing+=3,'layer-properties-use-effective-baseline','layout.itemSpacing'],
  ['padding',s=>s.nodes[0].layout.padding.left=7,'layer-properties-use-effective-baseline','layout.padding.left'],
  ['opacity',s=>s.nodes[0].appearance.opacity=.5,'layer-properties-use-effective-baseline','appearance.opacity'],
  ['font-size',s=>s.nodes.find(n=>n.id===label.id).text.fontSize+=2,'label-typography','text.fontSize'],
  ['icon-height',s=>s.nodes.find(n=>n.id===icon.id).bounds.height=40,'left-icon-height','bounds.height'],
 ];
 for(const [name,mutate,suffix,fact]of cases){
  const expected=compiled.rules.filter(r=>r.source.anchor==='component:web-core.link.'+suffix && r.assert.actual?.fact===fact).map(r=>r.ruleId);
  assert.equal(expected.length,1);
  const fail=copy(base);mutate(fail);const negative=result(fail),target=negative.evaluations.filter(e=>e.ruleId.startsWith('component:web-core.link.'+suffix+'.')&&e.classification==='violation');
  assert(target.length>0,JSON.stringify({size,name,actual:fail.nodes[0].layout,baseline:fail.nodes[0].baseline.effective.layout,evaluations:negative.evaluations.filter(e=>e.ruleId.startsWith('component:web-core.link.'+suffix+'.')&&e.subjectNodeId===fail.nodes[0].id).map(e=>({id:e.ruleId,classification:e.classification,trace:e.trace}))}));
  const restored=result(copy(base));assert.equal(violations(restored).length,0);
  assert(target.some(e=>e.ruleId===expected[0]));
  rows.push({size,name,kind:'native-derived-counterfactual',expectedRuleIds:expected,negativeTargetViolations:target.length,actual:target.map(evidence),resetViolations:0});
 }
 const text=copy(base);text.nodes.find(n=>n.id===label.id).text.characters='Открыть подробные условия обслуживания';text.nodes[0].component.properties['✎ Label#493:29']='Открыть подробные условия обслуживания';
 assert.equal(violations(result(text)).length,0);
 const uncertain=copy(base);uncertain.nodes.find(n=>n.id===label.id).unknownFacts.push('text.fontSize');
 const unknown=result(uncertain).evaluations.filter(e=>e.ruleId.startsWith('component:web-core.link.label-typography.')&&e.classification==='human-review');
 assert(unknown.length>0);
 rows.push({size,name:'public-label',kind:'native-derived-counterfactual',violations:0});
 rows.push({size,name:'missing-font-size',kind:'native-derived-counterfactual',unknown:unknown.length,actual:unknown.map(evidence)});
 const boundary=copy(base);boundary.nodes.find(n=>n.id===icon.id).bounds.height=label.text.lineHeight.value;
 const br=result(boundary).evaluations.filter(e=>e.ruleId==='component:web-core.link.left-icon-height.1.1');
 assert(br.some(e=>e.classification==='compliant'),JSON.stringify({lineHeight:label.text.lineHeight,actual:br}));
 rows.push({size,name:'icon-at-line-height',kind:'native-derived-counterfactual',expectedRuleIds:['component:web-core.link.left-icon-height.1.1'],actual:br.map(evidence)});
}
const authority=core.evaluateCompiledContract(snapshot('M'),compiled);
assert.equal(violations(authority).length,0);
assert(!authority.evaluations.some(e=>e.classification==='compliant'));
const authorityGate={kind:'ordinary runtime without authoring preview',classifications:authority.evaluations.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{}),liveAcceptance:false};
const revision=read('contract.manual.json').metadata.revision;
const receipt={schemaVersion:'link.scoped-operator-checks.v1',revision,manualSourceHash:compiled.package.manualSourceHash,compiledHash:core.stableHash(compiled),coreVersion:'0.1.14',kind:'native facts plus explicit counterfactual mutations',baselineClaims:'Baseline reconstructed from independent pristine native captures; this is not an installed Editor live run.',omittedCaptureFacts:['hostVariableUsageV1','variable.modes','variable.modeCatalog','textStyleEvidenceV1','textFillEvidenceV1'],allChecksPassed:true,baselines,authorityGate,checks:rows,liveAcceptance:false,wholeReady:false};
fs.writeFileSync(path.join(root,`reports/operator-checks.r${revision}.json`),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({passed:rows.length,liveAcceptance:false,wholeReady:false}));
