const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages';
const core=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const shared=require(P+'/Link/reports/reading-fixes/public-instance-swap-2026-10-11/runtime/core-after.cjs');
const wire=v=>JSON.parse(JSON.stringify(v)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const save=(name,v)=>fs.writeFileSync(__dirname+'/'+name,JSON.stringify(v)+'\n',{flag:'wx'});
(async()=>{
 const file=P+'/BenefitCard.r7.editor-candidate.component-contract.zip',record=JSON.parse(fs.readFileSync(__dirname+'/candidate-r7.json'));
 assert.equal(pin(file).sha256,record.candidate.sha256);
 const zip=await core.readZip(fs.readFileSync(file)),json=name=>JSON.parse(Buffer.from(zip.find(f=>f.name===name).data));
 const manual=json('contract.manual.json'),compiled=json('compiled/component-contract.v2.json');
 const map={revision:7,manualHash:core.stableHash(manual),compiledHash:core.stableHash(compiled),status:'Draft',
  entries:manual.rules.map(r=>({sourceRuleId:r.id,norm:r.rationale,sourceRefs:r.sourceRefs,targetId:r.targetId,targetScope:r.targetScope,
   ownership:r.ownership,applicability:r.applicability,controlPaths:r.controlPaths,constraints:r.constraints,execution:r.execution,
   compiledRuleIds:compiled.rules.filter(ir=>ir.source.anchor===r.id).map(ir=>ir.ruleId),
   deferred:compiled.nonExecutableRules.filter(n=>n.sourceRuleId===r.id)})),
  contextArtifacts:['context/recipe-rules.json','context/guidance.json','context/dependency-requirements.json'],
  nativeLive:'NOT_RUN_USER_ONLY',childAuthority:'Draft preserved',v4Integration:'HELD_UNTIL_CONTRACT_ACCEPTANCE'};
 assert.equal(map.entries.length,22);assert.equal(map.entries.flatMap(e=>e.compiledRuleIds).length,40);
 const readme='# BenefitCard r7 — кандидат для Editor\n\nТребуется Editor **0.2.104**. Пакет **Draft**: 22 исходные нормы, 40 IR, 2 deferred. Рабочий r5 не заменён. Apollo v4 переносит reader только после приёмки работоспособности контракта.\n\nТри parent-owned нормы BottomContent.Link исполняются через явную fixed-nested привязку к Link r5: только текст (конфигурация, layout, стили и устройство сверяются с независимым BottomContent.Link), не более 32 символов, не более одной строки. Derived bounds/позиции после изменения текста не сравниваются этой нормой; собственные проверки геометрии Link сохраняют его Draft authority. Факты без полного native proof остаются UNKNOWN.\n\nТехническая проверка: compile/reopen и closure PASS; 37 прежних IR сохранены, 57 прежних captures воспроизведены с новым synthetic scenario. Новые native D/M прогоны ещё не выполнены. Глобальные Ready и child authority не повышены.\n\nАктуальная карта: reports/rule-coverage.r7.json. Исторические отчёты r2–r5 и historical/README.r5.md сохраняют исходные сведения и не являются приёмкой r7. context/dependency-requirements.json хранит оставшиеся gaps.\n';
 const entries=zip.filter(f=>f.name!=='README.md');
 entries.push({name:'historical/README.r5.md',data:zip.find(f=>f.name==='README.md').data},core.textZipEntry('README.md',readme),core.textZipEntry('reports/rule-coverage.r7.json',map));
 const bytes=core.createZip(entries),parsed=await core.readZip(bytes);
 const workspace=core.importWorkspace(parsed.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:Buffer.from(f.data).toString()})),'benefit-card.desktop');
 const bundle=core.buildExportBundle(workspace.manual,workspace.variantEvidence,workspace.dependencyContracts);
 assert(bundle.validation.valid);assert.deepEqual(wire(bundle.compiled),compiled);
 assert.equal(core.stableHash(workspace.manual),record.manualHash);
 const replayRoot=P+'/BenefitCard/reports/live-captures/2026-10-09';let count=0;
 for(const input of record.replays){
  assert.equal(pin(input.input.path).sha256,input.input.sha256);const r=JSON.parse(fs.readFileSync(input.input.path)),snapshot=wire(r.snapshot);
  if(snapshot.validationIntent)snapshot.validationIntent=core.createValidationIntent(snapshot,bundle.compiled,r.snapshot.validationIntent.values);
  const next=core.evaluateCompiledContract(snapshot,core.prepareAuthoringPreviewContract(bundle.compiled)),old=shared.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  const key=e=>JSON.stringify([e.ruleId,e.subjectNodeId]),prior=new Map(old.evaluations.map(e=>[key(e),e]));
  const matched=next.evaluations.filter(e=>prior.has(key(e)));assert.equal(matched.length,old.evaluations.length);
  assert.equal(new Set(matched.map(key)).size,old.evaluations.length);
  for(const e of matched){const p=prior.get(key(e));assert.equal(e.classification,p.classification);assert.deepEqual(e.trace,p.trace);}count++;
 }
 assert.equal(count,57);
 save('packaging-correction.json',{before:record.candidate,reason:'Inherited r5 README was stale for this open r7 candidate; preserved inside historical. Added current 22-claim coverage map.',normativeInputsUnchanged:true});
 fs.writeFileSync(file,bytes);record.candidate=pin(file);record.editorCore=pin(W+'/projects/ComponentContractEditor/dist/core.cjs');
 fs.writeFileSync(__dirname+'/candidate-r7.json',JSON.stringify(record)+'\n');
 save('coverage-map.json',map);
 save('final-technical-review.json',{candidate:record.candidate,reader:record.editorCore,manualHash:record.manualHash,compiledHash:record.compiledHash,
  roundtrip:true,coverageEntries:22,IR:40,oldIRPreserved:37,oldResultsPreserved:count,oldEvaluationCardinality:true,childClosureUnchanged:true,nativeLive:'NOT_RUN_USER_ONLY',ready:false});
 console.log(JSON.stringify({candidate:record.candidate,roundtrip:true,replays:count,coverage:22}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
