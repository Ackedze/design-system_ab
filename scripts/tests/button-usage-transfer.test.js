const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const {collectRuleRelocations,missingSourceRuleIds}=require('../lib/component-rule-relocations');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const old=read('history/r24-editor-0.2.45/contract.manual.json'),manual=read('history/r25-editor-0.2.45/contract.manual.json'),compiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r25-editor-0.2.45/component-contract.v2.json.gz'))));
const oldCompiled=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r24-editor-0.2.45/component-contract.v2.json.gz'))));
const manifest=read('migrations/usage-rules-r25.json'),destination=manifest.transfers[0].destination;
const handoff=JSON.parse(fs.readFileSync(path.join(repo,destination),'utf8')),ids=new Set(manifest.transfers.map(t=>t.ruleId));
const clone=x=>JSON.parse(JSON.stringify(x)),issues=read('reports/validation-report.json').issues;
const collect=(overrides={})=>collectRuleRelocations({repoRoot:repo,componentId:manual.component.componentId,manualRules:manual.rules,manifest,...overrides});

test('five rules transfer losslessly to one pattern authoring source; 22 intrinsic rules are unchanged',()=>{
  assert.equal(manual.metadata.revision,25);assert.equal(handoff.rules.length,5);assert.equal(ids.size,5);
  assert.deepEqual(handoff.rules,old.rules.filter(r=>r.ownership.kind!=='component'));
  assert.deepEqual(manual.rules,old.rules.filter(r=>r.ownership.kind==='component'));
  assert.deepEqual(handoff.controlPorts,old.controlPorts);assert.deepEqual(manual.controlPorts,[]);
  assert.deepEqual(handoff.decisions,old.decisions.filter(d=>/alfa-business-variant-policy|desktop-hint-canonical-rule/.test(d.id)));
  for(const k of Object.keys(old).filter(k=>!['metadata','rules','controlPorts','decisions'].includes(k)))assert.deepEqual(manual[k],old[k],k);
  assert.equal(handoff.rules.find(r=>r.id.endsWith('desktop-hint-restricted')).applicability.scopeStatus,'confirmed');
  assert.equal(handoff.rules.find(r=>r.id.endsWith('desktop-safe-variants')).applicability.scopeStatus,'needs-confirmation');
  assert.deepEqual(handoff.rules.find(r=>r.id.endsWith('desktop-safe-variants')).applicability.products,['alfa-business']);
});

test('compiled component has neither external rules nor delegation stubs; four intrinsic mapping gaps remain',()=>{
  assert.deepEqual(compiled.coverage.byOwnership,{component:22,usage:0,unclassified:0});
  assert.equal(compiled.rules.length,53);assert.equal(compiled.customizationPolicy.length,22);
  assert.equal(compiled.coverage.nonExecutableRules,4);assert.equal(compiled.coverage.byExecutionRoute.delegated,undefined);
  for(const r of compiled.rules)assert.equal(ids.has(r.source.anchor),false);
  const ready=core.buildContractReadiness({contract:compiled,issues},manual);
  assert.equal(ready.ownership.usage.rules,0);assert.equal(ready.ownership.component.unimplementedRuleIds.length,4);
  assert.equal(ready.status,'draft');assert.equal(compiled.status,'draft');assert.equal(read('runtime/component-contract.index.json').published,false);
  assert.ok(read('projections/athena/manual-overlay.json').rules.every(r=>!ids.has(r.id)));
  assert.equal(compiled.package.generatedFactsHash,oldCompiled.package.generatedFactsHash);
  assert.deepEqual(compiled.componentDependencies,oldCompiled.componentDependencies);
  const normalize=r=>{const c=clone(r);delete c.revision;delete c.source.checksum;return c;};
  assert.deepEqual(compiled.rules.map(normalize),oldCompiled.rules.filter(r=>!ids.has(r.source.anchor)).map(normalize));
});

test('build crosswalk accounts for every Athena ID without reactivating transferred rules',()=>{
  const relocated=collect(),crosswalk=read('reports/rule-crosswalk.json');assert.equal(relocated.length,5);
  assert.deepEqual(crosswalk.relocatedRules,relocated);assert.deepEqual(crosswalk.missingAthenaRuleIds,[]);
  assert.deepEqual(missingSourceRuleIds(crosswalk.sourceRuleIds.athena,manual.rules,relocated),[]);
  assert.equal(missingSourceRuleIds(crosswalk.sourceRuleIds.athena,manual.rules,[]).length,4);
  assert.deepEqual(missingSourceRuleIds(['unregistered-rule'],manual.rules,relocated),['unregistered-rule']);
  assert.ok(crosswalk.entries.every(r=>!ids.has(r.ruleId)));
  assert.equal(handoff.runtime.status,'not-connected');assert.equal(handoff.runtime.published,false);
  assert.ok(handoff.rules.find(r=>r.ownership.kind==='editorial-policy').execution.externalRuleIds.length>0);
  for(const ref of handoff.sourceRefs)assert.ok(fs.existsSync(path.join(repo,ref.path)));
  for(const id of handoff.componentBinding.targetRefs)assert.ok(manual.targets.some(t=>t.id===id));
});

test('relocation gate rejects missing, duplicate, wrong-owner or unsafe destinations',()=>{
  assert.throws(()=>collect({readFile:()=>{throw Error('missing source');}}),/missing source/);
  const patched=edit=>{const h=clone(handoff);edit(h);return ()=>JSON.stringify(h);};
  assert.throws(()=>collect({readFile:patched(h=>h.rules.shift())}),/missing/);
  assert.throws(()=>collect({readFile:patched(h=>h.rules.push(h.rules[0]))}),/Duplicate/);
  assert.throws(()=>collect({manualRules:[...manual.rules,handoff.rules[0]]}),/multiple owners/);
  assert.throws(()=>collect({readFile:patched(h=>h.rules[0].ownership.ownerId='wrong-owner')}),/ownership mismatch/);
  assert.throws(()=>collect({readFile:patched(h=>h.runtime.status='ready')}),/Invalid pattern handoff/);
  const escaped=clone(manifest);escaped.transfers[0].destination='../outside.json';
  assert.throws(()=>collect({manifest:escaped}),/outside repository/);
  const duplicate=clone(manifest);duplicate.transfers.push(duplicate.transfers[0]);
  assert.throws(()=>collect({manifest:duplicate}),/multiple owners/);
});

test('Editor ZIP import/export keeps only 22 intrinsic rules despite legacy usage rules in evidence',async()=>{
  const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r25-editor-0.2.45/Button.editor-input.zip'))));
  assert.ok(!entries.some(e=>/patterns|handoff|migrations/.test(e.name)));
  const workspace=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
  assert.deepEqual(workspace.manual,manual);
  const bundle=core.buildExportBundle(workspace.manual,workspace.variantEvidence,compiled.componentDependencies.map(d=>d.contract));
  assert.equal(bundle.validation.valid,true);assert.equal(bundle.compiled.rules.length,53);
  assert.deepEqual(bundle.compiled.coverage.byOwnership,compiled.coverage.byOwnership);
  assert.deepEqual(bundle.manual.rules,manual.rules);
});

const live=read('qa/rule-ownership-live-review.2026-09-28.json');
for(const item of live.reportResults)test(`r25 on archived ${item.product}: all 93 intrinsic outcomes exact, external policy not evaluated`,()=>{
  const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
  const engine=core.evaluateCompiledContract(report.snapshot,core.prepareAuthoringPreviewContract(compiled));
  const comparable=({evaluationId,ruleRevision,...e})=>e;
  assert.equal(engine.evaluations.length,93);
  assert.deepEqual(engine.evaluations.map(comparable),report.results.engine.evaluations.filter(e=>!e.ruleId.startsWith('component:web-core.button.desktop-hint-restricted.')).map(comparable));
  const result=core.buildEditorValidationReport(engine,{contract:compiled,issues},manual,report.snapshot);
  assert.equal(result.ownershipCoverage.usage.status,'not-evaluated');assert.equal(result.ownershipCoverage.usage.evaluations,0);
  assert.equal(result.ownershipCoverage.component.violations,0);assert.equal(result.ownershipCoverage.component.notExecuted,3);
  assert.equal(result.scenarioCoverage.notExecuted,3);assert.equal(result.scenarioCoverage.complete,false);
  assert.ok(result.evaluations.every(e=>!ids.has(e.ruleId)));
});

test('intrinsic opacity violation survives migration regardless of Product',()=>{
  const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,live.reportResults[0].fixtureFile))));
  const snapshot=clone(report.snapshot);snapshot.nodes[0].appearance.opacity=0.5;
  const contract=core.prepareAuthoringPreviewContract(compiled);
  const run=product=>{snapshot.context.product=product;return core.evaluateCompiledContract(snapshot,contract).evaluations.filter(e=>e.classification==='violation');};
  const a=run('ab'),b=run('ao'),comparable=({evaluationId,...e})=>e;
  assert.equal(a.length,2);assert.deepEqual(a.map(comparable),b.map(comparable));
  assert.ok(a.every(e=>!e.ruleId.startsWith('component:web-core.button.desktop-hint-restricted')));
});
