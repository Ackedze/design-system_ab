const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const W = '/Users/alexkukhta/Desktop/workplace';
const P = path.join(W, 'shared/design-system_ab/experiments/current-contract-packages');
const out = __dirname;
const corePath = path.join(P, 'Link/reports/reading-fixes/public-instance-swap-2026-10-11/runtime/core-after.cjs');
const core = require(corePath);
const wire = v => JSON.parse(JSON.stringify(v));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const pin = p => { const b = fs.readFileSync(p); return {path:p, sha256:sha(b), bytes:b.length}; };
const save = (n,v) => fs.writeFileSync(path.join(out,n), JSON.stringify(v)+'\n', {flag:'wx'});
const texts = z => z.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:Buffer.from(f.data).toString('utf8')}));

(async () => {
  const parentPin = pin(path.join(P,'BenefitCard.component-contract.zip'));
  const childPin = pin(path.join(P,'Link.r5.candidate.component-contract.zip'));
  assert.equal(parentPin.sha256,'d2d93913ac82a7dd08eb8870d35afa4eeeb514dc42aa5eb7d9390ddf76742bed');
  assert.equal(childPin.sha256,'d219318aedb7b634117da62a93aacb6c60071215e1e045315c57862d63501051');
  const protectedScope = JSON.parse(fs.readFileSync(path.join(P,'Link/reports/resume-2026-10-12T16-26-02-757Z/scope.json')));
  for (const p of protectedScope.pilotPins) assert.deepEqual(pin(p.path),p);
  const z = await core.readZip(fs.readFileSync(parentPin.path));
  const imported = core.importWorkspace(texts(z),'benefit-card.desktop');
  const childZip = await core.readZip(fs.readFileSync(childPin.path));
  const child = JSON.parse(Buffer.from(childZip.find(f=>f.name==='compiled/component-contract.v2.json').data));
  const before = wire(imported.manual), manual = wire(before);
  assert.equal(manual.metadata.revision,5);
  assert.equal(child.package.manualRevision ?? child.rules[0].revision,5);
  manual.metadata.revision = 6;
  manual.metadata.updatedAt = new Date().toISOString();
  manual.componentDependencies = [{id:'link',componentId:child.package.componentId,revision:5,
    manualSourceHash:child.package.manualSourceHash,compiledHash:core.stableHash(child),bindings:[{
      kind:'fixed-nested',id:'bottom-link',targetRole:'bottom',relativePath:'',
      ownerComponentSetKeys:['4158b0817d3da15996c620b445d98333276765b1','26c17fc60aaf65818137b58279d23ceae0f8458c'],
      activeVariant:{property:'Presets',values:['Link']},childPath:'Link'
    }]}];
  assert.equal(core.dependencyPinIssue(manual.componentDependencies[0],child),undefined);
  const onlyText = manual.rules.find(r=>r.id==='component:web.benefit-card-bottom-link-text-only');
  const content = manual.rules.find(r=>r.id==='component:web.benefit-card-link-content-limit');
  for (const r of [onlyText,content]) r.applicability = {...r.applicability,
    context:{'semanticApi.BottomEnabled':true},activeDependency:'link'};
  onlyText.execution = {route:'context-only',missingFacts:[
    'Identity-proven parent usage projection of fixed dependency link/bottom-link; compare non-TEXT public configuration and descendants against independent BottomContent Presets=Link reference, without adopting current overrides.'
  ]};
  content.constraints = content.constraints.filter(c=>c.fact==='textContentV1.characterCount');
  content.rationale = content.message = 'Текст BottomContent.Link должен содержать не более 32 символов.';
  content.execution = {route:'context-only',missingFacts:[
    'Parent selector bound to child Link target.label through validated dependency capture; no parent-original TEXT exists in the SwapMe reference.'
  ]};
  const line = wire(content);
  line.id = 'component:web.benefit-card-link-line-limit';
  line.constraints = [{type:'layoutConstraint',fact:'textContentV1.lineCount',min:0,max:1}];
  line.rationale = line.message = 'Текст BottomContent.Link должен занимать не более одной строки.';
  manual.rules.splice(manual.rules.indexOf(content)+1,0,line);
  const bundle = core.buildExportBundle(manual,imported.variantEvidence,[child]);
  assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
  assert.equal(bundle.compiled.componentDependencies[0].issue,undefined);
  assert.equal(bundle.compiled.rules.length,37);
  assert.equal(bundle.compiled.nonExecutableRules.length,5);
  const preserved = before.rules.filter(r=>![onlyText.id,content.id].includes(r.id));
  for(const r of preserved) assert.deepEqual(manual.rules.find(v=>v.id===r.id),r);
  assert.equal(preserved.length,19);
  const historicalCompiled=JSON.parse(Buffer.from(z.find(f=>f.name==='compiled/component-contract.v2.json').data));
  const irBody = r => {const c=wire(r);delete c.revision;delete c.source.checksum;return c;};
  for(const r of historicalCompiled.rules)assert.deepEqual(irBody(bundle.compiled.rules.find(n=>n.ruleId===r.ruleId)),irBody(r));
  const requirementName = z.find(f=>f.name.endsWith('context/dependency-requirements.json')).name;
  const requirements=JSON.parse(Buffer.from(z.find(f=>f.name===requirementName).data));
  const linkReq=requirements.requirements.find(d=>d.component==='Link');
  linkReq.status='exact-draft-pin-prepared';
  linkReq.componentId=child.package.componentId;
  linkReq.revision=5;linkReq.manualSourceHash=child.package.manualSourceHash;linkReq.compiledHash=core.stableHash(child);
  linkReq.rules=[onlyText.id,content.id,line.id];
  linkReq.ready=false;linkReq.parentUsageExecution='pending-reader-binding';
  const replacement = new Map([
    ['contract.manual.json',manual],['compiled/component-contract.v2.json',bundle.compiled],
    ['coverage.json',bundle.coverage],['validation-report.json',bundle.validation],[requirementName,requirements],
    ['dependencies/core.web.link/component-contract.v2.json',child]
  ]);
  const entries=z.filter(f=>!replacement.has(f.name));
  for(const [name,v]of replacement)entries.push(core.textZipEntry(name,v));
  const zip=core.createZip(entries), filename='BenefitCard.r6.candidate.component-contract.zip';
  fs.writeFileSync(path.join(out,filename),zip,{flag:'wx'});
  const reopened=core.importWorkspace(texts(await core.readZip(zip)),'benefit-card.desktop');
  const rebuilt=core.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
  assert.deepEqual(wire(reopened.manual),manual);
  assert.deepEqual(wire(rebuilt.compiled),wire(bundle.compiled));
  assert.deepEqual(reopened.variantEvidence,imported.variantEvidence);
  assert.equal(reopened.dependencyContracts.length,1);
  assert.deepEqual(reopened.dependencyContracts[0],child);
  const replay=[];
  const liveDir=path.join(P,'BenefitCard/reports/live-captures/2026-10-09');
  for(const n of fs.readdirSync(liveDir).filter(n=>n.endsWith('.json'))) {
    const file=path.join(liveDir,n), r=JSON.parse(fs.readFileSync(file));
    const oldContract=r.runtime?.evaluatedContract;
    if(!oldContract || (oldContract.package.manualRevision ?? oldContract.rules[0]?.revision)!==5)continue;
    const scenario=wire(r.snapshot);
    if(scenario.validationIntent) scenario.validationIntent=core.createValidationIntent(scenario,bundle.compiled,r.snapshot.validationIntent.values);
    const result=core.evaluateCompiledContract(scenario,core.prepareAuthoringPreviewContract(bundle.compiled));
    const old=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
    const key=e=>JSON.stringify([e.ruleId,e.subjectNodeId]);
    const oldMap=new Map(old.evaluations.map(e=>[key(e),e]));
    assert.equal(oldMap.size,old.evaluations.length);
    const prior=result.evaluations.filter(e=>oldMap.has(key(e)));
    assert.equal(prior.length,old.evaluations.length);
    for(const e of prior){const a=oldMap.get(key(e));assert.equal(e.classification,a.classification,n+' '+e.ruleId);assert.deepEqual(e.trace,a.trace,n+' '+e.ruleId);}
    replay.push({input:pin(file),evidenceKind:'retained-native-facts-with-new-synthetic-explicit-scenario',
      scenarioValues:r.snapshot.validationIntent?.values,oldEvaluations:old.evaluations.length,unchanged:true,dependencyRuns:result.dependencyRuns});
  }
  assert(replay.length>0);
  save('inputs.json',{scope:'PRIVATE_DRAFT_PREPARATION_ONLY',parent:parentPin,child:childPin,
    core:pin(corePath),pilotScopePin:pin(path.join(P,'Link/reports/resume-2026-10-12T16-26-02-757Z/scope.json')),
    currentContextPath:protectedScope.pilotContext,protectedPilotInputs:protectedScope.pilotPins.length,
    sharedWrites:false,workingPackageWrites:false,nativeCanvasWrites:false});
  save('manual.patch.json',{baseManualHash:core.stableHash(before),metadata:manual.metadata,
    componentDependencies:manual.componentDependencies,replaceRules:[onlyText,content],insertRules:[line],
    dependencyRequirements:linkReq,preservedSourceRules:19,preservedIR:37});
  save('coverage-map.json',{rules:manual.rules.map(r=>({sourceRuleId:r.id,norm:r.rationale,
    owner:r.ownership,target:r.targetId,scope:r.targetScope,platforms:r.applicability.platforms,
    conditions:r.applicability,route:r.execution?.route||'auto',constraints:r.constraints,
    compiledIds:bundle.compiled.rules.filter(x=>x.source.anchor===r.id).map(x=>x.ruleId),
    gap:r.execution?.missingFacts||[]}))});
  save('crosswalk.json',{relation:'split',from:'component:web.benefit-card-link-content-limit',
    to:[content.id,line.id],normChanged:false,reason:'Раздельные лимиты символов и строк одного исходного требования; оба принадлежат BenefitCard.'});
  save('technical.json',{compile:bundle.validation,manualHash:core.stableHash(manual),compiledHash:core.stableHash(bundle.compiled),
    dependencyPin:manual.componentDependencies[0],roundtrip:{manual:true,compiled:true,fullFacts:true,closure:true},
    preserved:{sourceRules:19,IR:37},replay,
    authoring:'PASS',parentUsageExecution:'BLOCKED_CURRENT_READER_BINDING',nativeLive:'NOT_RUN_USER_ONLY',ready:false});
  for(const p of protectedScope.pilotPins)assert.deepEqual(pin(p.path),p);
  assert.deepEqual(pin(parentPin.path),parentPin);assert.deepEqual(pin(childPin.path),childPin);
  fs.copyFileSync(path.join(out,filename),path.join(P,filename),fs.constants.COPYFILE_EXCL);
  console.log(JSON.stringify({candidate:path.join(P,filename),revision:6,claims:manual.rules.length,IR:37,
    nonExecutable:5,preservedReports:replay.length,dependency:'exact Link r5',ready:false}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
