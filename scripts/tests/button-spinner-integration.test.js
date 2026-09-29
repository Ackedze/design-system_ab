const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Button');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json'),old=read('history/r15-editor-0.2.33/contract.manual.json');

test('Button r16 preserves all 26 source RuleIDs and seven icon constraints; Spinner is a separate owner',()=>{
 const manual=read('history/r16-editor-0.2.34/contract.manual.json');
 assert.equal(manual.metadata.revision,16);assert.deepEqual(manual.rules.map(r=>r.id),old.rules.map(r=>r.id));
 for(const rule of manual.rules){const prior=old.rules.find(r=>r.id===rule.id);
  if(!rule.id.endsWith('addon-size-follows-button-size'))assert.deepEqual(rule,prior);
  else {assert.deepEqual(rule.constraints.slice(0,7),prior.constraints);assert.equal(rule.constraints.length,8);assert.equal(rule.status,'draft');
   const n=clone(rule);for(const key of ['constraints','status','rationale','message'])n[key]=prior[key];assert.deepEqual(n,prior);}
 }
 assert.ok(manual.rules.every(r=>!r.id.includes('.spinner.')));
 const n=clone(manual);delete n.componentDependencies;n.rules=old.rules;n.metadata=old.metadata;assert.deepEqual(n,old);
});
test('dependency pin links exact accepted Spinner r8 without a mutable copy of child manual',()=>{
 const dep=compiled.componentDependencies[0],child=read('../Spinner/compiled/component-contract.v2.json');
 assert.equal(dep.componentId,'core.web.spinner');assert.equal(dep.revision,8);assert.equal(core.stableHash(child),dep.compiledHash);
 assert.deepEqual(dep.contract,child);assert.equal(dep.issue,undefined);assert.deepEqual(read('compiled/dependencies/core.web.spinner/component-contract.v2.json'),child);
 assert.equal(dep.contract.rules.length,31);assert.equal(compiled.rules.length,60);assert.equal(compiled.package.manualSourceHash,core.stableHash(manual));
 assert.equal(compiled.package.manualRevision,31);assert.equal(compiled.package.sourceExportVersion,'component-contract-editor@0.2.52');
});
test('Button r17 only opts five existing rules into explicit applicability/ownership; generated facts and child are unchanged',()=>{
 const manual=read('history/r17-editor-0.2.36/contract.manual.json');
 const prior=read('history/r16-editor-0.2.34/contract.manual.json');
 assert.equal(manual.metadata.revision,17);assert.deepEqual(manual.rules.map(r=>r.id),prior.rules.map(r=>r.id));
 const changed=manual.rules.filter(r=>JSON.stringify(r)!==JSON.stringify(prior.rules.find(p=>p.id===r.id)));
 assert.equal(changed.length,5);assert.ok(changed.every(r=>r.status==='draft'));
 assert.equal(changed.filter(r=>r.boundaryPolicy==='component-owned@1').length,3);
 assert.equal(changed.filter(r=>r.targetApplicability==='visible-target@1').length,2);
 assert.equal(changed.filter(r=>r.propertyApplicability?.['layout.itemSpacing']==='flow-gap-either@1').length,2);
 for(const r of changed){const before=prior.rules.find(p=>p.id===r.id),n=clone(r);delete n.boundaryPolicy;delete n.targetApplicability;delete n.propertyApplicability;n.status=before.status;assert.deepEqual(n,before);}
 const n=clone(manual);n.metadata=prior.metadata;n.rules=prior.rules;assert.deepEqual(n,prior);
 const archived=JSON.parse(require('node:zlib').gunzipSync(fs.readFileSync(path.join(root,'history/r16-editor-0.2.34/component-contract.v2.json.gz'))));
 assert.deepEqual(compiled.facts.variantEvidence,archived.facts.variantEvidence);
 assert.deepEqual(compiled.componentDependencies,archived.componentDependencies);
 assert.equal(compiled.runtimePolicy.ruleScopeFactsVersion,1);
});
test('Button ZIP imports only parent anatomy and reproduces dependency-aware compiled output',async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/Button.editor-input.zip')));
 const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(w.manual,manual);assert.equal(w.dependencyContracts.length,1);
 assert.ok(w.variants.every(v=>v.componentSetKey!=='44d3c426be11cb5bb6edbb3d80e6bf8ec9d8cf02'));
 const bundle=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);
 assert.equal(bundle.validation.valid,true);assert.deepEqual(clone(bundle.compiled),compiled);
});
test('derived projections keep reference ownership; ready Figma package is not production publication',()=>{
 for(const p of ['projections/athena/manual-overlay.json','projections/ds-ai-hub/component.json'])assert.deepEqual(read(p).componentDependencies,manual.componentDependencies);
 assert.equal(read('runtime/component-contract.index.json').published,false);
 assert.equal(read('runtime/component-contract.index.json').status,'ready');
 assert.equal(manual.rules.find(r=>r.id.endsWith('loading-preserves-width')).execution.route,'predicate');
 assert.equal(manual.rules.find(r=>r.id.endsWith('loading-uses-addon-spinner')).execution.route,'predicate');
 assert.equal(manual.rules.find(r=>r.id.endsWith('loading-spinner-style-follows-view')).execution.route,'predicate');
 assert.deepEqual(read('reports/rule-crosswalk.json').missingAthenaRuleIds,[]);
});
test('seven prepared Figma cases remain pending live reports; Scale is real host Scale',()=>{
 const qa=read('qa/spinner-integration-test-cases.2026-09-27.json');assert.equal(qa.status,'prepared-not-accepted');assert.equal(qa.cases.length,7);
 assert.equal(qa.cases[2].spinnerProperties.Size.value,'24');assert.equal(qa.cases[2].buttonSize,40);
 assert.equal(qa.cases[3].bounds.width,30);assert.equal(qa.cases[3].spinnerProperties.Size.value,'24');
 assert.equal(qa.cases[4].opacity,.5);assert.equal(qa.cases[6].spinnerId,undefined);
});
