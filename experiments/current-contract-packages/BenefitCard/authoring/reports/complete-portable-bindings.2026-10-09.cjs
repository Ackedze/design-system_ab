const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..'),workspace=path.resolve(root,'../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const manual=read(path.join(dir,'contract.manual.json')),compiled=read(path.join(dir,'compiled/component-contract.v2.json'));
assert.equal(manual.metadata.revision,3);
const capture=read(path.join(__dirname,'native-portable-capture.2026-10-09.json'));
const variants=capture.captures.flatMap(c=>c.variants),byKey=new Map(variants.map(v=>[v.componentKey,v]));assert.equal(byKey.size,32);
for(const v of variants){
 assert.equal(v.complete,true);const expected=compiled.facts.variantEvidence.variants.filter(x=>x.componentKey===v.componentKey&&x.componentSetKey===v.componentSetKey);assert.equal(expected.length,1);
 assert.equal(v.shapeHash,core.stableHash(compiled.facts.variantEvidence.structures[expected[0].structureId]));assert.deepEqual(v.properties,expected[0].properties);
}
let migrated=0;
for(const target of manual.targets)for(const binding of target.identityBindingsV1){
 const v=byKey.get(binding.componentKey);assert(v);assert.equal(v.componentSetKey,binding.componentSetKey);
 if(binding.nativeSource){const actual=v.targets.find(t=>t.path===binding.referencePath);assert(actual);assert.equal(actual.type,binding.nodeType);assert.equal(actual.source?.sourceNodeId,binding.nativeSource.sourceNodeId);assert.equal(actual.source?.ownerComponentKey,binding.nativeSource.ownerComponentKey);}
 if(binding.portableReferenceHash)assert.equal(binding.portableReferenceHash,v.portableReferenceHash);
 binding.portableReferenceHash=v.portableReferenceHash;migrated++;
}
assert.equal(migrated,96);
const decision=manual.decisions.find(d=>d.id==='benefit-card.portable-target-identity.r3');decision.summary='Переносимые привязки Root, Title и Graphic всех 32 вариантов desktop/mobile-web по published componentKey/sourceNodeId.';
decision.rationale='Независимые pristine captures подтверждают полный anatomy/properties и точные source addresses всех 32 вариантов. File-local mainComponentId исключён только из portable hash; actual/reference владельцы внутри текущего документа проверяются точно. Все нормы и ограничения прежние; свежий пользовательский прогон новой сборки остаётся отдельной приёмкой.';
const evidence=read(path.join(__dirname,'portable-reference-bindings.r3.json'));Object.assign(evidence,{migratedBindings:96,portableVariants:32,totalVariants:32,exactHashesPreservedAsProvenance:true,allPortablePinsIndependentlyCaptured:true,captureReceipt:'reports/native-portable-capture.2026-10-09.json'});delete evidence.exactOtherVariantsPreserved;
const bundle=core.buildExportBundle(manual,compiled.facts.variantEvidence,[]);assert.equal(bundle.validation.valid,true);
const receipt=read(path.join(__dirname,'update.2026-10-09.json'));Object.assign(receipt,{portableVariants:32,migratedBindings:96,allVariantAnatomyAndSourceAddressesVerified:true,manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(bundle.compiled)});
receipt.replays=[];
for(const file of fs.readdirSync(path.join(root,'BenefitCard')).filter(n=>/^benefit-card\.validation-report\..*\.json$/.test(n)).sort()){
 const report=read(path.join(root,'BenefitCard',file)),c=core.prepareAuthoringPreviewContract(bundle.compiled),prepared=core.prepareValidationSnapshot(report.snapshot,c),result=core.evaluateCompiledContract(report.snapshot,c);
 assert(prepared.declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'));assert.equal(result.evaluations.length,2);assert(result.evaluations.every(e=>e.classification!=='human-review'));
 const expected=prepared.declaredTargetIdentitiesV1.targets.filter(t=>t.semanticRole!=='root'&&t.effectiveVisible===false).length;assert.equal(result.evaluations.filter(e=>e.classification==='violation').length,expected);
 receipt.replays.push({file,platform:report.snapshot.context.platform,targets:prepared.declaredTargetIdentitiesV1.targets,classifications:result.evaluations.map(e=>({ruleId:e.ruleId,classification:e.classification}))});
}
assert.equal(receipt.replays.length,10);assert.equal(receipt.replays.flatMap(r=>r.classifications).filter(c=>c.classification==='violation').length,4);
write(path.join(dir,'contract.manual.json'),manual);write(path.join(dir,'compiled/component-contract.v2.json'),bundle.compiled);write(path.join(dir,'coverage.json'),bundle.coverage);write(path.join(dir,'validation-report.json'),bundle.validation);write(path.join(__dirname,'portable-reference-bindings.r3.json'),evidence);write(path.join(__dirname,'update.2026-10-09.json'),receipt);
const update=read(path.join(root,'reports/contract-update.2026-10-09.json'));update.receipts[0]=receipt;write(path.join(root,'reports/contract-update.2026-10-09.json'),update);
console.log('PASS: 96 portable bindings / 32 independent variants; 10 report replays / 4 expected violations / 0 unknown.');
