const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages'),A=path.join(__dirname,'../candidate');
const core=require('./runtime/core-0.1.15.cjs'),old=require('./runtime/core-0.1.14.cjs');
const editor=require('./runtime/editor-0.2.99-core.cjs'),v4=require('./runtime/apollo-v4-runtime.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),clone=x=>JSON.parse(JSON.stringify(x)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const compiled=read(path.join(A,'compiled/component-contract.v2.json')),manual=read(path.join(A,'contract.manual.json'));
const preview=core.prepareAuthoringPreviewContract(compiled),previous=read(path.join(__dirname,'../inputs/r2.compiled.json')),oldPreview=old.prepareAuthoringPreviewContract(previous);
const signatures=r=>r.evaluations.map(e=>JSON.stringify([e.ruleId,e.subjectNodeId,e.classification,e.trace])).sort(),counts=r=>r.evaluations.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{});
const files=fs.readdirSync(path.join(P,'Link/reports/live-review-r2-2026-10-10T09-05-05Z/inputs')).filter(n=>n.endsWith('.json')).sort(),rows=[];
for(const name of files){
 const file=path.join(P,'Link/reports/live-review-r2-2026-10-10T09-05-05Z/inputs',name),d=read(file),snapshot=d.snapshot;
 assert.equal(d.editorVersion,'component-contract-editor@0.2.98');assert.equal(core.stableHash(d.sources.compiledContract),core.stableHash(previous));
 const before=old.evaluateCompiledContract(snapshot,oldPreview),historical=core.evaluateCompiledContract(snapshot,oldPreview);
 assert.deepEqual(signatures(before),signatures(d.results.engine));assert.deepEqual(historical,before);
 const current=core.evaluateCompiledContract(snapshot,preview);assert.equal(current.evaluations.filter(e=>['violation','human-review'].includes(e.classification)).length,0);
 assert.deepEqual(editor.evaluateCompiledContract(snapshot,preview),current);
 assert(core.prepareValidationSnapshot(snapshot,preview).declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'));
 const label=snapshot.nodes.find(n=>n.type==='TEXT'&&n.name==='Label'),negative=clone(snapshot);negative.nodes.find(n=>n.id===label.id).text.fontSize=label.text.fontSize+2;
 const failure=core.evaluateCompiledContract(negative,preview);assert(failure.evaluations.some(e=>e.ruleId==='component:web-core.link.label-typography.1.2'&&e.classification==='violation'));
 negative.nodes.find(n=>n.id===label.id).text.fontSize=label.text.fontSize;assert.deepEqual(core.evaluateCompiledContract(negative,preview),current);
 const guards=[];
 for(const [name,edit] of [['stale-structure',s=>s.variantReference.nodes.push({path:'Foreign',type:'FRAME'})],['missing-reference',s=>{delete s.variantReference;}],['foreign-source',s=>{s.nodes[0].component.identity.componentKey='foreign';}],['missing-root-type',s=>{delete s.variantReference.nodeProperties[''].propertyTypes['Left Addon#60204:0'];}]]){const s=clone(snapshot);edit(s);const r=core.evaluateCompiledContract(s,preview);assert(r.evaluations.some(e=>e.classification==='human-review'),name);guards.push(name);}
 rows.push({input:{path:path.relative(P,file),sha256:sha(file)},instanceId:snapshot.source.rootNodeId,before:counts(before),after:counts(current),historicalExact:true,editorParity:true,resolvedTargets:8,negativeRuleId:'component:web-core.link.label-typography.1.2',localNegativeAndReset:'PASS_COUNTERFACTUAL',guards});
}
assert.equal(rows.length,5);assert.throws(()=>v4.loadRuntimeContract(compiled),{code:'APOLLO_V4_CONTRACT_INCOMPATIBLE'});
const compatibility=[];
(async()=>{
 for(const name of ['Button','CorporateContent','CorporateContent.mobile-web','ButtonsGroup','ButtonsGroup.mobile-web','Spinner']){
  const file=path.join(P,name+'.component-contract.zip'),entries=await core.readZip(fs.readFileSync(file)),contracts=entries.filter(e=>e.name.endsWith('.json')).map(e=>{try{return JSON.parse(core.zipEntryText(e));}catch{return null;}}).filter(d=>d?.schemaVersion===v4.CONTRACT_SCHEMA);
  assert(contracts.length,name);const c=JSON.parse(core.zipEntryText(entries.find(e=>e.name==='compiled/component-contract.v2.json')));assert.equal(c.runtimePolicy.declaredTargetConfigurationVersion,undefined);
  core.assertDeclaredTargetContract(c);const all=entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)}));
  const oldImported=old.importWorkspace(all,c.facts.component.contractId),newImported=core.importWorkspace(all,c.facts.component.contractId);assert.deepEqual(newImported,oldImported);
  const oldBuilt=old.buildExportBundle(oldImported.manual,oldImported.variantEvidence,oldImported.dependencyContracts),newBuilt=core.buildExportBundle(newImported.manual,newImported.variantEvidence,newImported.dependencyContracts);assert.deepEqual(newBuilt,oldBuilt);
  let profile;try{v4.loadRuntimeContract(c);profile='ACCEPTED';}catch(e){assert.equal(e.code,'APOLLO_V4_CONTRACT_INCOMPATIBLE');profile={status:'REJECTED_EXISTING_SCOPE',reason:e.message};}
  compatibility.push({name,sha256:sha(file),contractId:c.facts.component.contractId,status:c.status,profile,exactOldNewImportAndCompile:'PASS'});
 }
 const receipt={schemaVersion:'link.configuration-fix-replay.v1',revision:3,manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(compiled),coreVersion:'0.1.15',editorVersion:'0.2.99',actualInstalledR3:'NOT_RUN_USER_ONLY',normativeChanges:false,ruleStatusesChanged:false,wholeReady:false,review:{independent:false},cases:rows,historicalPackageCompatibility:compatibility,apolloV4SyntheticPolicyParity:'PASS_STANDARD_VALIDATE',apolloV4DraftGate:'PASS_REJECTED_UNCHANGED',scope:'Local exact historical replay and candidate replay of untouched installed r2 captures; negative/RESET mutations synthetic only'};
 assert.deepEqual(read(path.join(__dirname,'replay.json')),receipt);console.log(JSON.stringify({captures:rows.length,currentAllConclusive:true,compatibility:compatibility.length,draftGate:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
