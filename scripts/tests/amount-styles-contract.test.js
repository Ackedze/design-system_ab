const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-corp/AmountStyles/authoring');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json');
const prefix='component:web-corp.amount-styles.';
test('one Ready family, three public representations, Operation stays internal',()=>{
 assert.equal(manual.representations.length,3);assert.equal(compiled.status,'ready');
 assert.equal(compiled.facts.variantEvidence.variants.length,19);
 assert.equal(read('reports/generated-facts.json').verifiedVariantStructures,21);
 assert.throws(()=>core.resolveCaptureRepresentation(manual.representations,'d258cf8358d424d1bc03a4aabf8e363e403bb9b7','576418aee5b143662e51e4d8f27d6fcbd57dc540'));
});
test('pinned Core Amount is linked once and not copied into parent manual',()=>{
 const d=compiled.componentDependencies[0];assert.equal(d.issue,undefined);assert.equal(d.revision,5);
 assert.equal(d.compiledHash,core.stableHash(d.contract));
 assert.deepEqual(d.contract,JSON.parse(fs.readFileSync(path.join(repo,'experiments/web-core/core/Amount/authoring/compiled/component-contract.v2.json'))));
 assert.ok(manual.rules.every(r=>r.id.startsWith(prefix)));
 assert.equal(d.bindings[0].relativePath,'');assert.equal(d.bindings[0].childPath,'Amount');
});
test('owner decisions stay preset-scoped and unknown checks cannot claim Ready',()=>{
 for(const id of ['addon-uses-supported-components','addon-does-not-exceed-text-line-height','opacity-is-forbidden','opacity-property-is-forbidden']){
  const r=manual.rules.find(r=>r.id===prefix+id);assert.equal(r.ownership.ownerId,manual.component.componentId);
 }
 for(const role of ['minor','currency']){
  const r=manual.rules.find(r=>r.targetId==='target.'+role&&r.capability==='opacity-property-is-forbidden');
  assert.deepEqual(r.constraints,[{type:'propertyDomain',fact:'component.properties.Opacity',values:['False']}]);
 }
 assert.equal(read('reports/coverage.json').nonExecutableRules,0);
  assert.equal(manual.metadata.revision,10);
 assert.equal(manual.rules.find(r=>r.id===prefix+'fixed-part-order').constraints[0].orderScope,'structural');
 assert.equal(compiled.runtimePolicy.dependencyCompletionVersion,1);
 for(const suffix of ['parts-share-color','parts-share-text-style','manual-text-style-is-layer-property']){
  const r=manual.rules.find(r=>r.id===prefix+suffix);assert.equal(r.execution.route,'predicate');
  assert.equal(r.constraints[0].type,'bindingConsistency');assert.deepEqual(r.constraints[0].targetRoles,['sign','major-text','minor-text','currency-text']);
 }
 assert.equal(read('reports/readiness.json').status,'ready');
 assert.equal(read('runtime/component-contract.index.json').published,false);
 const custom=manual.rules.find(r=>r.id===prefix+'currency-type-is-component-property');
 assert.equal(custom.permission,'allowed');assert.equal(custom.execution.route,'policy-only');
 assert.equal(custom.constraints.length,0);
});
test('49 original RuleIDs are accounted for, 20 usage rules have a single external owner',()=>{
 const x=read('reports/rule-crosswalk.json');assert.deepEqual(x.missingAthenaRuleIds,[]);assert.equal(x.relocatedRules.length,20);
 const source=read('sources/design-system_ab/JSONS/web/components/web-corp/AmountStyles/rules.json');
 const ids=[...source.generated.rules,...source.manual.rules].map(r=>r.ruleId);
 for(const id of ids)assert.equal(Number(manual.rules.some(r=>r.id===id))+Number(x.relocatedRules.some(r=>r.ruleId===id))+Number(x.retiredRules.some(r=>r.ruleId===id)),1,id);
 assert.equal(x.retiredRules.length,1);assert.equal(x.retiredRules[0].ruleId,prefix+'amount-stays-on-one-line');
 assert.ok(manual.rules.every(r=>r.ownership.kind==='component'&&!r.applicability.products.length&&!r.applicability.channels.length));
});
test('source snapshot hashes verify, current Operation default is evidence not a prohibition',()=>{
 for(const s of read('reports/source-inventory.json').sources)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'sources',s.path))).digest('hex'),s.sha256);
 assert.equal(read('input/live-figma-matrix.json').rows.filter(r=>r.operationVisible).length,19);
 assert.equal(manual.rules.find(r=>r.id===prefix+'parts-default-visibility').execution.route,'policy-only');
});
test('Editor ZIP roundtrip keeps the manual, read-only child and deterministic compiler output',async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/AmountStyles.editor-input.zip')));
 const imported=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(imported.manual,manual);assert.equal(imported.dependencyContracts.length,1);
 assert.equal(imported.componentChoices.length,3);
 assert.ok(imported.componentChoices.every(c=>c.label!=='Operation'));
 assert.throws(()=>core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})),'operation.universal'),/internal/);
 assert.deepEqual(JSON.parse(JSON.stringify(core.buildExportBundle(imported.manual,imported.variantEvidence,imported.dependencyContracts).compiled)),compiled);
});
