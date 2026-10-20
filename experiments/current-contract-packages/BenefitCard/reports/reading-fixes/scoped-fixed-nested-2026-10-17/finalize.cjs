const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,guard,pin}=require('./guard.cjs');
const before=guard('final-historical-prototype-readback'),builds=[];
for(const name of fs.readdirSync(root).filter(n=>/^BUILD-.*\.json$/.test(n)).sort()){
 const p=path.join(root,name),d=JSON.parse(fs.readFileSync(p));
 for(const job of d.metafiles){for(const input of job.closure)assert.deepEqual(pin(input.path),input);assert.deepEqual(pin(job.output.path),job.output);}
 builds.push({receipt:pin(p),bundles:d.metafiles.map(j=>({name:j.name,inputs:j.closure.length,output:j.output}))});
}
const checks=JSON.parse(fs.readFileSync(root+'/REGRESSION-03.json')),roundtrip=JSON.parse(fs.readFileSync(root+'/ROUNDTRIP-CAPTURE.json')),
 retained=JSON.parse(fs.readFileSync(root+'/RETAINED-PROBES.json')),gap=JSON.parse(fs.readFileSync(root+'/ADMISSION-GAP.json'));
assert.equal(checks.passed,35);assert.equal(checks.failed,0);assert.equal(roundtrip.checks.length,3);assert.equal(retained.probes.length,4);
assert.equal(gap.status,'ADMISSION_REQUIREMENT_UNSATISFIED');assert.equal(gap.outcome.rootEvaluation,'DID_NOT_REFUSE');
assert.deepEqual(pin(retained.fullEvidence.path),retained.fullEvidence);
const sourceFix=path.join(W,'shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/catalog-refresh-2026-10-17T18-38-43Z');
const closedReferences=[
 {path:sourceFix+'/HANDOFF.json',sha256:'74c0035c6ff1e98c776a2d82e75c59239f164663f21265bd02f6f9ba0226364f',bytes:1755},
 {path:sourceFix+'/SEAL.json',sha256:'9eec7c204e83916db3ed07c46ad4ba413683d3e974ec3ee53bc5cf9810b25b7b',bytes:668},
 {path:W+'/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/authoring/completion-candidate-2026-10-17/HANDOFF.json',sha256:'ba60267d814d1880713b141713afc6f62484277eb42d9166fc463ba3537c41ea',bytes:5978},
 {path:W+'/shared/design-system_ab/experiments/current-contract-packages/BenefitCard/authoring/completion-candidate-2026-10-17/SEAL.json',sha256:'7925598b880eece0f19bf6a3fc825d0faf96f961b7d02e4d82915662712f3be1',bytes:663},
];
for(const p of closedReferences)assert.deepEqual(pin(p.path),p);
const rootPackage=JSON.parse(fs.readFileSync(root+'/SUPPLEMENTAL-INPUTS.json')).inputs.find(x=>x.path.endsWith('/BenefitCard.r7.editor-candidate.component-contract.zip'));
assert.deepEqual(pin(rootPackage.path),rootPackage);
const safety={at:new Date().toISOString(),mode:'READ_ONLY_PACKAGE_AND_CLOSED_REFERENCE_CONTINUITY',rootPackage,closedReferences,
 currentRuntimeAcceptance:false,sourceBuildCurrentReadback:'NOT_CLAIMED: execution uses the granted isolated historical snapshot'};
fs.writeFileSync(root+'/SAFETY-READBACK.json',JSON.stringify(safety,null,2)+'\n',{flag:'wx'});
const finalGuard=guard('after-final-historical-prototype-readback');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const entries=files(root).filter(p=>!['INVENTORY.json','HANDOFF.json','SEAL.json'].includes(path.basename(p))).sort().map(pin);
const inventory={status:'CLOSED_HISTORICAL_PRIVATE_INVENTORY',before,after:finalGuard,builds,files:entries};
fs.writeFileSync(root+'/INVENTORY.json',JSON.stringify(inventory)+'\n',{flag:'wx'});
const handoff={status:'CLOSED_PRIVATE_HISTORICAL_PROTOTYPE_WITH_UNRESOLVED_ADMISSION',writesClosed:true,
 writerThreadId:'01a0f77a-11c9-7c10-bd21-e3e5d100feae',grant:pin(W+'/.local/apollo-general-2026-10-17/benefitcard-private-prototype309/GRANT.json'),
 root,inventory:pin(root+'/INVENTORY.json'),proposal:pin(root+'/PROPOSAL.json'),historicalMode:pin(root+'/HISTORICAL-MODE.json'),
 patch:pin(root+'/prototype.patch'),notes:pin(root+'/REVIEW-NOTES.json'),
 checks:{synthetic:{passed:35,failed:0,receipt:pin(root+'/REGRESSION-03.json')},roundtripAndMock:{passed:3,receipt:pin(root+'/ROUNDTRIP-CAPTURE.json')},
  legacyCompiledHashesExact:2,historicalReports:4,retainedProbes:pin(root+'/RETAINED-PROBES.json'),
  oldCompiledRootReaders:'REFUSE as required',oldEditorAuthoringAdmission:'UNSATISFIED',admissionGap:pin(root+'/ADMISSION-GAP.json')},
 sourceFix:{status:'8 desktop Compact=True Title baselines corrected to Secondary, unpublished',closedHandoff:closedReferences[0],closedSeal:closedReferences[1]},
 limitations:['Current shared source/runtime not accepted by this historical run.','No fresh native/UI/model/generation test.','No BackgroundPlate child capture in retained reports; missing evidence remains UNKNOWN.','Patch is not ready for shared apply because old Editor authoring admission is unresolved.'],
 next:'General independent historical review and decision on the legitimate authoring admission boundary. Shared Stage B requires a new exact writer grant after the active source window closes. Owner publication/Workshop update/fresh Athena export precede native BenefitCard acceptance.',
 sharedSourceWrites:0,sharedBuilds:0,rootPackageWrites:0,manifestHubSheetsWrites:0,proxyRestarts:0,nativeModelCalls:0,currentRuntimeAcceptance:false,Ready:false};
fs.writeFileSync(root+'/HANDOFF.json',JSON.stringify(handoff,null,2)+'\n',{flag:'wx'});
const seal={status:'CLOSED',writesClosed:true,at:new Date().toISOString(),handoff:pin(root+'/HANDOFF.json'),inventory:pin(root+'/INVENTORY.json'),
 scope:'Private historical prototype evidence only; shared apply and final component acceptance are not granted',Ready:false};
fs.writeFileSync(root+'/SEAL.json',JSON.stringify(seal,null,2)+'\n',{flag:'wx'});
for(const p of entries)assert.deepEqual(pin(p.path),p);assert.deepEqual(pin(handoff.inventory.path),handoff.inventory);assert.deepEqual(pin(seal.handoff.path),seal.handoff);
console.log(JSON.stringify({status:handoff.status,files:entries.length,handoff:pin(root+'/HANDOFF.json'),seal:pin(root+'/SEAL.json'),sharedWrites:0,Ready:false}));
