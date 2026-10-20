const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const B=__dirname,W='/Users/alexkukhta/Desktop/workplace',corePath=path.join(W,'.local/apollo-general-2026-10-15/coordination271/core.cjs');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(corePath)).digest('hex'),'11c1e30cea4a19d4d1f8693a4ee3326df552d76c6359bad453767c1ec4eb9a48');
const c=require(corePath),j=n=>JSON.parse(fs.readFileSync(path.join(B,n),'utf8')),copy=x=>JSON.parse(JSON.stringify(x));
const manual=j('contract.manual.json'),compiled=j('component-contract.v2.json'),contract=c.prepareAuthoringPreviewContract(compiled),fixtures=j('synthetic-fixtures.json').fixtures,results=[];
const write=(n,v)=>fs.writeFileSync(path.join(B,n),JSON.stringify(v)+'\n');
const root=s=>s.nodes.find(n=>s.selection.includes(n.id));
const surface=s=>s.nodes.find(n=>n.parentId===root(s).id && n.type==='INSTANCE');
const slot=s=>s.nodes.find(n=>n.type==='SLOT' && n.parentId===root(s).id);
const rule=(suffix,part)=>manual.rules.find(r=>r.id===`component:web-corp.background-plate.${suffix}${part?'.'+part:''}`);
const ir=(suffix,part,index=0)=>compiled.rules.filter(r=>r.source.anchor===rule(suffix,part).id)[index].ruleId;
const solid=(token=true)=>({type:'SOLID',visible:true,opacity:1,color:{r:21,g:22,b:23},...(token?{tokenId:'synthetic-color-token'}:{})});
function run(name,fixture,mutate,expected,notes){
  const snapshot=copy(fixture.snapshot);mutate?.(snapshot);
  const prepared=c.prepareValidationSnapshot(snapshot,contract),out=c.evaluateCompiledContract(snapshot,contract);
  const actual=Object.fromEntries(Object.keys(expected).map(id=>[id,[...new Set(out.evaluations.filter(e=>e.ruleId===id).map(e=>e.classification))].sort()]));
  const record={name,variantId:fixture.variantId,status:'PASS',scope:'synthetic-only',expected,actual,notes,violations:out.evaluations.filter(e=>e.classification==='violation').map(e=>({ruleId:e.ruleId,nodeId:e.subjectNodeId})),unknown:out.evaluations.filter(e=>['human-review','not-evaluable'].includes(e.classification)).map(e=>({ruleId:e.ruleId,classification:e.classification,reason:e.trace?.reason})),targets:prepared.declaredTargetIdentitiesV1.targets};
  results.push(record);
  try{for(const [id,value]of Object.entries(expected))assert.deepEqual(actual[id],[value],name+':'+id);}catch(error){record.status='FAIL';write('synthetic-results.first-failure.json',{results,error:String(error)});throw error;}
  return {prepared,out,record};
}
for(const f of fixtures){
  const r=run('captured-public-definition-baseline',f,null,{},'Definition-derived reconstruction, not fresh installed native acceptance.');
  assert.equal(r.record.violations.length,0);assert.equal(r.record.unknown.length,0);
  assert.equal(r.prepared.declaredTargetIdentitiesV1.targets.find(t=>t.targetId==='target.root').status,'resolved');
}
const legacy=fixtures[0],level2=fixtures[1],slotFixtures=fixtures.filter(f=>slot(f.snapshot)),primary=slotFixtures.find(f=>root(f.snapshot).component.properties.Type==='Primary'&&root(f.snapshot).component.properties.Skeleton==='False'),colored=slotFixtures.find(f=>root(f.snapshot).component.properties.Type==='Colored'),border=slotFixtures.find(f=>root(f.snapshot).component.properties.Type==='Border');
for(const [fixture,getNode,part]of [[primary,root,'root'],[legacy,surface,'surface']])for(const [suffix,fact]of [['radius-is-fixed-by-component-baseline','radius'],['opacity-is-fixed','opacity']]){
  const id=ir(suffix,part);run('baseline-'+part+'-'+fact,fixture,null,{[id]:'compliant'});run('mutate-'+part+'-'+fact,fixture,s=>getNode(s).appearance[fact]=fact==='radius'?91:.37,{[id]:'violation'});run('missing-'+part+'-'+fact,fixture,s=>{delete getNode(s).appearance[fact];getNode(s).unknownFacts.push('appearance.'+fact);},{[id]:'human-review'});
}
for(const [fixture,getNode,part]of [[primary,root,'slot'],[legacy,surface,'surface']])for(const [index,fact]of ['fill','fillStyleId','stroke','strokeStyleId'].entries()){
  const id=ir('primary-secondary-paint-is-fixed',part,index);
  run('fixed-paint-'+part+'-'+fact,fixture,s=>{getNode(s).appearance[fact]=fact.endsWith('Id')?'synthetic-new-style':[solid()];},{[id]:'violation'});
}
for(const [fixture,getNode,part]of [[colored,root,'slot'],[legacy,surface,'surface']]){
  const token=ir('colored-and-border-use-color-tokens',part+'.fill'),presence=ir('colored-uses-fill-without-stroke',part,0),stroke=ir('colored-uses-fill-without-stroke',part,1);
  const configure=s=>{getNode(s).component.properties.Type='Colored';getNode(s).appearance.fill=[solid()];getNode(s).appearance.stroke=[];};
  const note=part==='surface'?'Counterfactual typed-property fixture exercises compiled predicates; no native nested Type actuation/parity claim.':undefined;
  run('colored-valid-'+part,fixture,s=>configure(s),{[token]:'compliant',[presence]:'compliant',[stroke]:'compliant'},note);
  run('colored-raw-fill-'+part,fixture,s=>{configure(s);getNode(s).appearance.fill=[solid(false)];},{[token]:'violation',[presence]:'compliant',[stroke]:'compliant'},note);
  run('colored-no-fill-'+part,fixture,s=>{configure(s);getNode(s).appearance.fill=[];},{[presence]:'violation',[stroke]:'compliant'},note);
  run('colored-tokenized-stroke-'+part,fixture,s=>{configure(s);getNode(s).appearance.stroke=[solid()];},{[stroke]:'violation'},note);
}
for(const [fixture,getNode,part]of [[border,root,'slot'],[legacy,surface,'surface']]){
  const token=ir('colored-and-border-use-color-tokens',part+'.stroke'),fill=ir('border-has-no-visible-fill',part);
  const configure=s=>{getNode(s).component.properties.Type='Border';getNode(s).appearance.fill=[];getNode(s).appearance.stroke=[solid()];};
  run('border-valid-'+part,fixture,s=>configure(s),{[token]:'compliant',[fill]:'compliant'});
  run('border-raw-stroke-'+part,fixture,s=>{configure(s);getNode(s).appearance.stroke=[solid(false)];},{[token]:'violation',[fill]:'compliant'});
  run('border-tokenized-fill-'+part,fixture,s=>{configure(s);getNode(s).appearance.fill=[solid()];},{[fill]:'violation'});
  run('border-hidden-fill-'+part,fixture,s=>{configure(s);getNode(s).appearance.fill=[{...solid(),visible:false}];},{[fill]:'compliant'});
  run('border-zero-opacity-fill-'+part,fixture,s=>{configure(s);getNode(s).appearance.fill=[{...solid(),opacity:0}];},{[fill]:'compliant'});
  run('border-designer-stroke-'+part,fixture,s=>{configure(s);getNode(s).appearance.strokeWeight=4;getNode(s).appearance.strokeAlign='OUTSIDE';getNode(s).appearance.dashPattern=[8,4];},{[token]:'compliant',[fill]:'compliant'});
}
const domain=ir('no-secondary-for-level-2');run('level2-allowed-primary',level2,null,{[domain]:'compliant'});run('level2-secondary-counterfactual',level2,s=>surface(s).component.properties.Type='Secondary',{[domain]:'violation'},'Counterfactual typed-property fixture; native UI has no Secondary variant for Style Level2. No impossible manual mutation is prescribed.');run('level1-secondary-inactive',legacy,s=>surface(s).component.properties.Type='Secondary',{[domain]:'not-applicable'});
const permissive=run('slot-free-layout-padding-clipping',primary,s=>{root(s).layout.padding={top:7,right:11,bottom:13,left:17,horizontal:11,vertical:7};slot(s).layout.mode='HORIZONTAL';slot(s).layout.itemSpacing=19;slot(s).layout.primaryAxisAlignItems='CENTER';slot(s).layout.clipsContent=!slot(s).layout.clipsContent;},{});assert.equal(permissive.record.violations.length,0);assert.equal(permissive.record.unknown.length,0);
const unknown=run('missing-native-root-identity',primary,s=>{delete root(s).component.identity;s.nodes[0].unknownFacts.push('component.identity');},{});assert(unknown.record.unknown.length>0);assert.equal(unknown.record.violations.length,0);
const radius=ir('radius-is-fixed-by-component-baseline','root');
run('unknown-independent-baseline',primary,s=>{delete root(s).baseline;root(s).unknownFacts.push('baseline');},{[radius]:'human-review'});
const unmarked=run('unmarked-absent-baseline-characterization',primary,s=>{delete root(s).baseline;},{[radius]:'not-applicable'},'Known absence and explicit unknown are different inputs. Not a passing normative absence-of-evidence test; actual Editor baseline failure remains native acceptance scope.');
write('missing-baseline-characterization.json',{status:'OBSERVATION_NOT_NATIVE_ACCEPTANCE',firstFailure:'first-attempt/MISSING-BASELINE-FIRST-FAILURE.json',unmarkedMissing:unmarked.record.actual,explicitUnknown:'human-review',cause:'Initial synthetic fixture omitted baseline without an unknownFacts marker and expected the explicit-unknown verdict. Current selector fact-present distinguishes absence from unknown.',guardChange:false,remainingQuestion:'Verify actual Editor capture failure reporting before claiming native missing-baseline coverage.'});
run('missing-independent-reference',primary,s=>{delete s.variantReference;},{[radius]:'human-review'});
const borderFill=ir('border-has-no-visible-fill','slot'),coloredFill=ir('colored-uses-fill-without-stroke','slot',0);
run('border-transparent-gradient',border,s=>root(s).appearance.fill=[{type:'GRADIENT_LINEAR',visible:true,opacity:1,gradientStops:[{position:0,color:{r:1,g:2,b:3,a:0},tokenId:null},{position:1,color:{r:4,g:5,b:6,a:0},tokenId:null}]}],{[borderFill]:'compliant'});
run('colored-transparent-gradient',colored,s=>root(s).appearance.fill=[{type:'GRADIENT_LINEAR',visible:true,opacity:1,gradientStops:[{position:0,color:{r:1,g:2,b:3,a:0},tokenId:null},{position:1,color:{r:4,g:5,b:6,a:0},tokenId:null}]}],{[coloredFill]:'violation'});
run('missing-paint-evidence',border,s=>{delete root(s).appearance.fill;root(s).unknownFacts.push('appearance.fill');},{[borderFill]:'human-review'});
const draft=c.evaluateCompiledContract(primary.snapshot,compiled);assert(draft.evaluations.every(e=>e.classification==='not-evaluable'));assert(manual.rules.every(r=>r.status==='draft'));

// Native SLOT omission is an optimization, not permission to omit unproved content.
const fullEmpty=run('slot-full-empty-capture',primary,null,{});
const payload=run('slot-full-external-payload',primary,s=>{const n=slot(s),id='synthetic:external-content';n.childIds.push(id);s.nodes.push({id,parentId:n.id,childIds:[],type:'FRAME',name:'External content',visible:true,visibility:{effective:true},component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{}},appearance:{fill:[],stroke:[]},unknownFacts:[]});},{});
const forged=run('slot-unconfirmed-omission',primary,s=>{s.source.nativeSlotCaptureScope={version:1,manualSourceHash:compiled.package.manualSourceHash,omissions:[{nodeId:slot(s).id,targetId:'target.slot',property:'Slot#136328:0',path:c.snapshotPaths(s).get(slot(s).id)}]};},{});
assert.equal(c.nativeSlotCapturePlan(compiled),undefined);
assert.equal(fullEmpty.prepared.source.truncated,false);
assert.equal(payload.record.unknown.length,0);assert.equal(payload.record.violations.length,0);
assert.equal(forged.prepared.source.truncated,true);
write('native-slot-admission.json',{status:'EXACT_CORE_SYNTHETIC_PROBE',optimizationPlan:c.nativeSlotCapturePlan(compiled)||null,emptyFullCapture:{truncated:fullEmpty.prepared.source.truncated,root:fullEmpty.record.targets.find(t=>t.targetId==='target.root')},populatedFullCapture:{truncated:payload.prepared.source.truncated,root:payload.record.targets.find(t=>t.targetId==='target.root'),unknownCount:payload.record.unknown.length},unconfirmedOmission:{truncated:forged.prepared.source.truncated,issues:forged.prepared.source.captureTopology?.issues},conclusion:payload.record.targets.find(t=>t.targetId==='target.root').status==='resolved'?'Full payload capture retains identity in this synthetic profile.':'Current full populated SLOT capture does not establish independent root correspondence. No omission optimization is granted for this contextual Draft. Named reader/profile gap remains.',nativeLive:'NOT_RUN',guardRelaxation:false});
const signatures=new Map();for(const r of manual.rules){const signature=c.stableHash({target:r.targetId,scope:r.targetScope,capability:r.capability,capabilitySet:r.capabilitySet,selection:r.capabilitySelection,permission:r.permission,constraints:r.constraints,applicability:r.applicability,route:r.execution?.route});const ids=signatures.get(signature)||[];ids.push(r.id);signatures.set(signature,ids);}
const duplicates=[...signatures.values()].filter(ids=>ids.length>1);
// Deferred prose policies have distinct missing inputs and semantic requirements.
const activeDuplicates=duplicates.filter(ids=>ids.some(id=>{const r=manual.rules.find(x=>x.id===id);return !['context-only','policy-only'].includes(r.execution?.route);}));assert.equal(activeDuplicates.length,0);
write('uniqueness.json',{status:'PASS_ACTIVE_ASSERTIONS',activeDuplicates,sourceRows:30,merge:{strokePermission:['border-stroke-weight-is-context-controlled','border-stroke-is-designer-controlled']},recipe:'adaptive-level-2-becomes-level-1-without-outer remediates level-2-requires-level-1, no duplicate IR',deferredPolicies:'Each has unique full source text and missingFacts; not separate runtime baseline assertions.'});
write('synthetic-results.json',{status:'PASS',cases:results.length,manualHash:compiled.package.manualSourceHash,compiledHash:c.stableHash(compiled),authority:'Existing authoring-preview only; all42 persisted manual statuses remain Draft.',scope:'Definition-derived and counterfactual synthetic fixtures. No fresh native, Editor UI, Ready or code mapping acceptance.',results});
console.log(JSON.stringify({status:'PASS',cases:results.length,slot:JSON.parse(fs.readFileSync(path.join(B,'native-slot-admission.json'),'utf8')).conclusion}));
