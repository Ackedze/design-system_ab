const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W=path.resolve(__dirname,'../../../../../../../..'),P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages');
const E=path.join(P,'Link/reports/skill-evals/link-r4-public-swap-2026-10-11');
const core=require(path.join(W,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read=f=>JSON.parse(fs.readFileSync(f)),wire=v=>JSON.parse(JSON.stringify(v));
const pin=f=>{const b=fs.readFileSync(f);return {path:f,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
const copy=(a,b)=>{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b);};
assert(!fs.existsSync(path.join(__dirname,'seal.json')),'Closed writer');
const versions={core:'0.1.17',editor:'0.2.103',apolloProfile:'0.4.1'};
const build=read(path.join(W,'projects/Apollo-v3/apps/apollo-v4/dist/build-inputs.json'));
assert.equal(build.runtimeVersion,versions.core);
assert.deepEqual(build.agentNativeScopeInput,{path:'/Users/alexkukhta/.codex/visualizations/2026/09/30/01a0f452-31de-7692-b7bc-29c73c03acc4/apollo-agent-mvp-2026-10-10/native-read-scope.json',sha256:'1b15b9285b9ebf9eee6cef82fb5bfe5f367dfa8ff3fed3ff5c278c6a3869fd96'});
assert.equal(pin(build.agentNativeScopeInput.path).sha256,build.agentNativeScopeInput.sha256);
for(const [name,count] of [['core-validate-final.log',333],['editor-validate-final.log',829],['apollo-v4-validate-preserved-scope.log',655]]){
 const log=fs.readFileSync(path.join(__dirname,name),'utf8');assert(log.includes('# pass '+count)&&log.includes('# fail 0'),name);
}
assert(fs.readFileSync(path.join(__dirname,'apollo-root-validate-final.log'),'utf8').includes('81 regression tests passed'));
const compiled=read(path.join(P,'Link/authoring/compiled/component-contract.v2.json'));
assert.throws(()=>require(path.join(W,'projects/Apollo-v3/apps/apollo-v4/dist/runtime.cjs')).loadRuntimeContract(compiled),{code:'APOLLO_V4_CONTRACT_INCOMPATIBLE'});
const prior=path.join(P,'Link/reports/live-review-r3-2026-10-11T07-00-25Z'),priorSeal=read(path.join(prior,'seal.json'));
for(const item of priorSeal.files){const current=pin(path.join(prior,item.path));assert.equal(current.sha256,item.sha256);assert.equal(current.bytes,item.bytes);}
write(path.join(__dirname,'checks.json'),{versions,coreTests:333,editorTests:829,apolloV4Tests:655,apolloRootRegressionFiles:81,
 previousClosedReceiptFilesVerified:priorSeal.files.length,draftAdmissionRejected:true,preservedReadonlyCallback:build.agentNativeScopeInput,
 freshNativeAcceptance:false,workingConsumerFreshness:'NEW_SOURCE_BUILD_REQUIRES_INDEPENDENT_REFRESH',wholeReady:false});
copy(path.join(W,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'),path.join(__dirname,'runtime/core-after.cjs'));
copy(path.join(W,'projects/ComponentContractEditor/dist/core.cjs'),path.join(__dirname,'runtime/editor-after.cjs'));
copy(path.join(W,'projects/Apollo-v3/apps/apollo-v4/dist/build-inputs.json'),path.join(__dirname,'runtime/apollo-v4-build-inputs.json'));
write(path.join(__dirname,'runtime/versions.json'),versions);
for(const size of ['S','S20','M','L'])copy(path.join(P,`Link/authoring/sources/native/Link.${size}.native-facts.2026-10-10.json`),path.join(__dirname,`before/native/Link.${size}.json`));
const previous=read(path.join(__dirname,'prior-replay.json'));
write(path.join(__dirname,'prior-inputs.json'),previous.results.map(r=>({file:r.file,sha256:r.sha256,bytes:fs.statSync(r.file).size})));
const lesson={schemaVersion:'apollo.process-lessons-receipt.v1',independentClosure:false,items:[
 {id:'AP-PROC-015',cause:'whole configuration hash coupled slot identity to the selected public asset',fix:'explicit v2 external native slot projection and independently proved correspondence',checks:['declared-public-swap.test.js','technical-replay.json','prior-replay.json'],status:'LOCAL_FIX_VERIFIED_NATIVE_AND_GENERAL_PENDING'},
 {id:'AP-PROC-006',cause:'unverified command paths, hard-coded IR suffixes and runtime object vs persisted JSON assumptions in helper preparation',consequence:'helper checks stopped before canonical package mutation',fix:'exact path preflight, source.anchor plus actual fact selects one RuleIR, JSON wire equality, publication prereqs',status:'CORRECTED_AUTHOR_VERIFIED_INDEPENDENT_PENDING'},
 {id:'AP-PROC-009',cause:'normal Apollo v4 validate omitted the previously admitted native scope build environment',consequence:'intermediate build inventory had agentNativeScopeInput=null; immediate pre-build state was not saved and is not claimed',fix:'verified exact accepted scope file/hash, rebuilt with APOLLO_AGENT_NATIVE_SCOPE_PATH, final inventory and all 655 tests checked',status:'CORRECTED_AUTHOR_VERIFIED_INDEPENDENT_PENDING'}]};
write(path.join(__dirname,'lessons.json'),lesson);
const summary='Исправлено чтение разрешённых внешних INSTANCE_SWAP в core 0.1.17 / Editor 0.2.103. Link r4 сохраняет все нормы Draft; exact/portable provenance и новый configuration v2 pin согласованы. Core333 / Editor829 / Apollo v4655 / root81 проходят. 27 historical r3 Engine/Editor replays exact; retained swap/RESET на r4 имеют 8 resolved и 0 inconclusive/violations; 8 counterfactual violations подтверждены. Это offline evidence. Fresh installed r4 cycle, независимая General приёмка и обновление working consumer ещё открыты. Readonly callback config восстановлена по exact прежнему принятому pin; её final build inventory проверена.\n';
fs.writeFileSync(path.join(__dirname,'SUMMARY.ru.md'),summary);
fs.mkdirSync(E,{recursive:true});
for(const name of ['SKILL.md','references/evals.md','references/implementation.md'])copy(path.join(W,'.codex/skills/apollo-contract-authoring',name),path.join(E,'skill-snapshot',name));
const skillFiles=['SKILL.md','references/evals.md','references/implementation.md'].map(n=>pin(path.join(E,'skill-snapshot',n)));
write(path.join(E,'skill-snapshot/seal.json'),{version:'0.1.4',files:skillFiles});
for(const [a,b] of [['contract.manual.json','manual.json'],['coverage-map.r4.json','coverage-map.json'],['case-matrix.r4.json','case-matrix.json']])copy(path.join(P,'Link/authoring',a),path.join(E,'candidate',b));
copy(path.join(P,'Link/authoring/compiled/component-contract.v2.json'),path.join(E,'technical/compiled.json'));
copy(path.join(__dirname,'package-checks.json'),path.join(E,'technical/package-checks.json'));
write(path.join(E,'candidate/questions.json'),{newNormativeQuestions:[],inheritedSourceContextGapsRemain:true,wholeReady:false});
write(path.join(E,'case.json'),{caseId:'EDITOR-DECLARED-TARGET-CONFIGURATION-001',request:'Implement shared public icon swap reader fix; preserve contracts and other checks',
 currentRevision:4,seed:pin(path.join(__dirname,'before/Link.r3.zip')),inputs:previous.results.map(r=>({path:r.file,sha256:r.sha256})),
 expected:{allowedPublicSwap:{resolvedTargets:8,inconclusive:0,violations:0},slotAndHostViolationsPreserved:true,legacyReplayExact:true},freshNativeAcceptance:false});
const evidence=['technical/package-checks.json',path.relative(E,path.join(__dirname,'technical-replay.json')),path.relative(E,path.join(__dirname,'prior-replay.json')),path.relative(E,path.join(__dirname,'checks.json'))];
const evalResult={schemaVersion:'apollo.contract-authoring-eval.v1',runId:'link-r4-public-swap-2026-10-11',caseId:'EDITOR-DECLARED-TARGET-CONFIGURATION-001',
 skill:{version:'0.1.4',sealPath:'skill-snapshot/seal.json'},evidenceKind:'synthetic-and-retained-native-replay',review:{author:'Contract Creation',reviewer:'same author',independent:false},
 criteria:[{id:'semantic-fidelity',status:'PASS',evidence:['candidate/manual.json'],gaps:['existing source/context conflicts remain outside this technical change']},
 {id:'source-coverage',status:'PASS',evidence:['candidate/coverage-map.json'],gaps:[]},
 {id:'bindings-prerequisites',status:'PARTIAL',evidence,gaps:['fresh installed v2 binding cycle NOT_RUN_USER_ONLY']},
 {id:'schema-compilation',status:'PASS',evidence:['technical/package-checks.json'],gaps:[]},
 {id:'preservation-roundtrip',status:'PASS',evidence:['technical/package-checks.json'],gaps:['installed Editor reopen NOT_RUN_USER_ONLY']},
 {id:'case-behavior',status:'PARTIAL',evidence,gaps:['fresh native public swap/height violation/RESET pending']},
 {id:'statuses-scope',status:'PASS',evidence,gaps:[]}],overall:'PARTIAL',acceptedScope:['local shared reader and consumers','core ZIP roundtrip','27 exact historical Engine/Editor replays','retained public swap positive and counterfactual slot/host negative'],
 gaps:['fresh native installed cycle','independent technical review','current working consumer refresh','full source/context/dependency and Ready gates'],errors:lesson.items,
 learning:{skillChange:false,guideChange:true,reason:'verified reusable public swap recipe documented; specific norms and dimensions kept in Link'},wholeReady:false};
write(path.join(E,'eval.json'),evalResult);write(path.join(E,'lessons.json'),lesson);
for(const name of ['manifest.json','draft-manifest.json']){
 const file=path.join(P,name),m=read(file),before=wire(m),entry=m.packages.find(e=>e.componentId==='core.web.link');assert.equal(entry.revision,4);
 entry.previousSkillEval=entry.skillEval;entry.skillEval=path.relative(P,path.join(E,'eval.json'));
 entry.previousEditorReplay=entry.editorReplay;entry.editorReplay=path.relative(P,path.join(__dirname,'prior-replay.json'));
 entry.statusNotes=path.relative(P,path.join(__dirname,'SUMMARY.ru.md'));
 for(let i=0;i<m.packages.length;i++)if(m.packages[i].componentId!=='core.web.link')assert.deepEqual(m.packages[i],before.packages[i]);
 write(file,m);
}
const journal='\nДополнение AP-PROC-015 / AP-PROC-006 / AP-PROC-009 — Link public swap fix, 11.10.2026.\nCore0.1.17 / Editor0.2.103 / Link r4: explicit native external public slot projection реализована; 333/829/655 тестов и81 root regression files PASS, 27 historical r3 Engine/Editor replays exact, retained swap/RESET 8 resolved/0 UNKNOWN. Нормы и Draft сохранены; fresh native/General/working consumer refresh открыты. Helper path/IR suffix/JSON-wire ошибки остановили подготовку до canonical writes; исправлены exact preflight, source.anchor+fact и JSON equality. Повтор AP-PROC-009: validate был выполнен без принятого scope env, промежуточный inventory=null; непосредственно предшествующая inventory не сохранена. Exact accepted config1b15b928… восстановлена в final configured validate, её path/SHA и655 checks подтверждены; права не расширены, native действия и model calls не выполнялись. Защита — перед final build проверить accepted scope pin и после проверить inventory, а stale consumer не считать current. Авторская проверка не закрывает General acceptance. Evidence: '+path.join(__dirname,'HANDOFF.json')+' и lessons.json.\n';
fs.appendFileSync(path.join(W,'docs/APOLLO_PROCESS_LESSONS.md'),journal);
write(path.join(__dirname,'HANDOFF.json'),{schemaVersion:'apollo.public-swap-fix-handoff.v1',writesClosed:true,continuedWritesAllowed:false,independentAcceptance:false,
 versions,currentPackage:pin(path.join(P,'Link.component-contract.zip')),manual:pin(path.join(P,'Link/authoring/contract.manual.json')),
 compiled:pin(path.join(P,'Link/authoring/compiled/component-contract.v2.json')),checks:pin(path.join(__dirname,'checks.json')),eval:pin(path.join(E,'eval.json')),
 normsUnchanged:true,scope:'unconditional declared external root-owned public INSTANCE_SWAP identity; host/slot constraints preserved',
 sourceBuildConsumerRefreshRequired:true,nativeLive:'NOT_RUN_USER_ONLY',wholeReady:false,tests:path.join(P,'Link/authoring/TEST_CASES.r4.ru.md'),closedAt:new Date().toISOString()});
console.log(JSON.stringify({versions,package:pin(path.join(P,'Link.component-contract.zip')),eval:path.join(E,'eval.json'),freshNativeAcceptance:false,writerPreparedForSeal:true}));
