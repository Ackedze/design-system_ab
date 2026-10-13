const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const P='/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages';
const core=require(P+'/Link/reports/reading-fixes/public-instance-swap-2026-10-11/runtime/core-after.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const wire=v=>JSON.parse(JSON.stringify(v));
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
(async()=>{
  const inputs=JSON.parse(fs.readFileSync(path.join(__dirname,'inputs.json')));
  for(const p of [inputs.parent,inputs.child,inputs.core,inputs.pilotScopePin])assert.deepEqual(pin(p.path),p);
  const pilot=JSON.parse(fs.readFileSync(inputs.pilotScopePin.path));
  for(const p of pilot.pilotPins)assert.deepEqual(pin(p.path),p);
  const file=P+'/BenefitCard.r6.candidate.component-contract.zip', bytes=fs.readFileSync(file);
  assert(bytes.equals(fs.readFileSync(path.join(__dirname,'BenefitCard.r6.candidate.component-contract.zip'))));
  const z=await core.readZip(bytes),files=z.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:Buffer.from(f.data).toString()}));
  const imported=core.importWorkspace(files,'benefit-card.desktop');
  const bundle=core.buildExportBundle(imported.manual,imported.variantEvidence,imported.dependencyContracts);
  const saved=JSON.parse(files.find(f=>f.name==='compiled/component-contract.v2.json').text);
  assert.deepEqual(wire(bundle.compiled),saved);assert(bundle.validation.valid);
  assert.equal(imported.manual.metadata.revision,6);
  assert.equal(bundle.compiled.rules.length,37);
  assert.equal(bundle.compiled.nonExecutableRules.length,5);
  const changed=['component:web.benefit-card-bottom-link-text-only','component:web.benefit-card-link-content-limit','component:web.benefit-card-link-line-limit'];
  for(const id of changed){const r=imported.manual.rules.find(r=>r.id===id);assert.equal(r.status,'draft');assert.equal(r.execution.route,'context-only');assert.equal(r.applicability.activeDependency,'link');assert(!bundle.compiled.rules.some(r=>r.source.anchor===id));}
  const dependency=imported.manual.componentDependencies[0];
  assert.equal(core.dependencyPinIssue(dependency,imported.dependencyContracts[0]),undefined);
  assert.equal(core.dependencyPinIssue({...dependency,revision:4},imported.dependencyContracts[0]),'dependency-pin-mismatch');
  assert.equal(core.dependencyPinIssue(dependency,undefined),'dependency-contract-missing');
  const bindings=JSON.parse(fs.readFileSync(path.join(__dirname,'native-binding-read.json')));
  const catalog=JSON.parse(files.find(f=>f.name.endsWith('Web _ Сorp Promo Components -- BenefitCard.json')).text);
  for(const row of bindings.rows){assert.equal(row.bottom.length,1);const b=row.bottom[0];assert(dependency.bindings[0].ownerComponentSetKeys.includes(b.setKey));assert(catalog.components.some(c=>c.key===b.setKey));assert.equal(b.link.length,1);assert.equal(b.link[0].componentSetKey,'c1a788fea95f376b3c344b85ce006493b530db94');assert.equal(b.label.length,1);}
  const technical=JSON.parse(fs.readFileSync(path.join(__dirname,'technical.json')));
  assert.equal(technical.replay.length,57);assert(technical.replay.every(r=>r.unchanged));
  const oldScenario=JSON.parse(fs.readFileSync(technical.replay[0].input.path));
  const stale=core.evaluateCompiledContract(oldScenario.snapshot,core.prepareAuthoringPreviewContract(bundle.compiled));
  assert(stale.evaluations.some(e=>e.classification==='human-review'&&(e.trace.factPaths||[]).includes('expectedInput.ViewportClass')));
  const result={status:'PASS_SCOPE',roundtrip:true,dependencyPin:true,missingAndStalePinsRefused:true,
    nativeReadBindingPairs:2,oldScenarioIntentRefused:true,oldResultsPreserved:57,
    sharedPilotInputsUnchanged:pilot.pilotPins.length,parentUsageReady:false,nativeLive:'NOT_RUN_USER_ONLY',ready:false,
    candidate:pin(file),manualHash:core.stableHash(imported.manual),compiledHash:core.stableHash(bundle.compiled)};
  fs.writeFileSync(path.join(__dirname,'final-readback.json'),JSON.stringify(result)+'\n',{flag:'wx'});
  console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
