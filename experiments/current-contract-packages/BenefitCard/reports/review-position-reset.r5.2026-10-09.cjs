const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const component=path.resolve(__dirname,'..'),packages=path.resolve(component,'..'),workspace=path.resolve(packages,'../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),wire=v=>JSON.parse(JSON.stringify(v)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manual=read(path.join(component,'authoring/contract.manual.json')),compiled=read(path.join(component,'authoring/compiled/component-contract.v2.json')),evaluated=wire(core.prepareAuthoringPreviewContract(compiled));
const planPath=path.join(__dirname,'figma-test-plan.r5.json'),plan=read(planPath),byInstance=new Map(plan.cases.map(c=>[c.figma.instanceId,c]));
const row=read(path.join(packages,'manifest.json')).packages.find(p=>p.name==='BenefitCard');
assert.equal(manual.metadata.revision,5);assert.equal(compiled.runtimePolicy.declaredTargetIdentityVersion,3);
assert.equal(sha(path.join(packages,row.file)),row.zipSha256);assert.equal(row.zipSha256,'d2d93913ac82a7dd08eb8870d35afa4eeeb514dc42aa5eb7d9390ddf76742bed');
const style='component:web.benefit-card.background-plate-style-overrides',tokens='component:web.benefit-card.background-plate-colors-use-tokens';
const positionId=style+'.position.1.1',plateIds=[tokens+'.1.1',tokens+'.1.2',style+'.1.1',style+'.1.2',positionId],hugId='component:web.benefit-card.vertical-resizing-policy.1.1';
const specs=[
 ['16-46-23-528','BC4-311','negative',true],
 ['16-46-53-840','BC4-312','negative',true],
 ['16-47-31-464','BC4-312','reset',true],
 ['16-48-02-961','BC4-311','reset',false],
 ['16-58-20-390','BC4-311','reset',true],
 ['16-58-51-013','BC4-311','negative',true],
];
const checks=[];
for(const [stamp,caseId,state,explicitContext]of specs){
 const file=`benefit-card.validation-report.2026-10-09T${stamp}Z.json`,report=read(path.join(component,file)),s=report.snapshot,c=byInstance.get(s.source.rootNodeId);
 assert.equal(c.id,caseId);assert.equal(report.editorVersion,'component-contract-editor@0.2.95');assert.equal(report.run.manualRevision,5);
 assert.deepEqual(report.sources.manual,manual);assert.deepEqual(report.sources.compiledContract,compiled);assert.deepEqual(report.runtime.evaluatedContract,evaluated);assert.deepEqual(report.sources.compilerIssues,[]);
 assert.equal(core.stableHash(manual),report.run.manualSourceHash);assert.equal(core.stableHash(s),report.run.snapshotHash);assert.equal(core.stableHash(evaluated),report.run.evaluatedContractHash);assert.equal(core.validationSnapshotHash(s,evaluated),report.run.engineSnapshotHash);
 assert.equal(s.source.truncated,false);assert.equal(s.source.captureTopology.complete,true);assert.deepEqual(report.run.capture.warnings,[]);assert.deepEqual(report.run.capture.unmatchedBaselineNodeIds,[]);assert.equal(report.run.capture.matchedBaselineNodes,s.nodes.length);
 assert.equal(s.source.componentKey,c.key);assert.equal(s.context.platform,c.platform);assert.deepEqual(s.validationIntent.values,explicitContext?c.testConditions.editorContext:{});assert.equal(s.validationIntent.manualSourceHash,report.run.manualSourceHash);assert.equal(s.validationIntent.subject.rootNodeId,c.figma.instanceId);assert.equal(s.validationIntent.subject.componentKey,c.key);assert.equal(s.validationIntent.subject.pageId,plan.pageId);
 const nodes=new Map(s.nodes.map(n=>[n.id,n])),root=nodes.get(s.selection[0]),ledger=s.declaredTargetIdentitiesV1.targets;
 const target=id=>{const t=ledger.find(t=>t.targetId===id);assert(t);return t;};
 const props=id=>{const t=target(id);assert.equal(t.status,'resolved');return nodes.get(t.nodeId).component.properties;};
 for(const [key,value]of Object.entries(c.testConditions.figmaRoot))if(key!=='heightSizing')assert.equal(root.component.properties[key],value);assert.equal(root.layout.sizingVertical,'HUG');assert.equal(props('target.graphic').Presets,'Image');
 const position=props('target.surface-owner').Position;assert.equal(position,state==='reset'?'Level 1 (outer)':'Level 2 (inner)');
 if(state==='reset'){
  assert.equal(ledger.length,9);assert(ledger.every(t=>t.status==='resolved'));
  assert.equal(props('target.surface').BackgroundColor,c.platform==='desktop'?'base-bg-alt (gray)':'base-bg (white)');assert.equal(props('target.surface').Skeleton,'False');assert.equal(props('target.surface').Type,'Primary');
 }else{
  assert.equal(target('target.surface').status,'unknown');assert.equal(target('target.surface').reason,'native-cardinality-unresolved');
  assert(s.instanceContentResults.some(r=>r.boundaryNodeId===target('target.surface-owner').nodeId&&r.lineageProven===true&&r.status==='matched'));
 }
 const result=core.evaluateCompiledContract(s,evaluated);assert.deepEqual(wire(result),report.results.engine);assert.deepEqual(wire(core.buildEditorValidationReport(result,{contract:compiled,issues:report.sources.compilerIssues},manual,s)),report.results.editor);
 const viewportId=`component:web.benefit-card-platform-version-must-match.${c.platform}.1.1`,expected={};
 for(const id of plateIds)expected[id]=state==='reset'?'compliant':id===positionId?'violation':'human-review';
 for(const id of [viewportId,hugId])expected[id]=explicitContext?'compliant':'human-review';
 const targeted=Object.entries(expected).map(([id,classification])=>{const es=result.evaluations.filter(e=>e.ruleId===id);assert.equal(es.length,1);assert.equal(es[0].classification,classification,`${file}: ${id}`);return es[0];});
 for(const classification of ['violation','human-review'])assert.deepEqual(result.evaluations.filter(e=>e.classification===classification).map(e=>e.ruleId).sort(),Object.keys(expected).filter(id=>expected[id]===classification).sort());
 assert.equal(report.summary.complete,false);assert.equal(report.summary.notExecuted,3);assert.equal(report.summary.inconclusive,Object.values(expected).filter(v=>v==='human-review').length);assert.equal(report.summary.contractReadiness.status,'draft');assert.deepEqual([...report.runtime.activatedDraftRuleIds].sort(),compiled.rules.map(r=>r.ruleId).sort());
 checks.push({caseId,platform:c.platform,state,file,sha256:sha(path.join(component,file)),instanceId:c.figma.instanceId,componentKey:c.key,figmaUrl:c.figma.url,position,explicitContext,observedEditorContext:s.validationIntent.values,requiredEditorContext:c.testConditions.editorContext,hashesVerified:true,exactEngineReplay:true,exactEditorReplay:true,captureComplete:true,captureWarnings:[],declaredTargets:ledger,targetedEvaluations:targeted,summary:{complete:false,notExecuted:3,inconclusive:report.summary.inconclusive,violations:report.summary.ownershipCoverage.component.violations},requiredPositionOutcomeMatched:true,plateResetAccepted:state==='reset',level2ChildIdentityGapClosed:false,contextOutcomeAccepted:explicitContext,fullComponentAcceptance:false});
}
for(const id of ['BC4-311','BC4-312']){
 const cs=checks.filter(c=>c.caseId===id);assert.equal(new Set(cs.map(c=>c.instanceId)).size,1);assert.equal(new Set(cs.map(c=>c.componentKey)).size,1);assert(cs.some(c=>c.state==='negative'));assert(cs.some(c=>c.state==='reset'&&c.explicitContext));
}
const count=es=>es.reduce((out,e)=>{out[e.classification]=(out[e.classification]||0)+1;return out;},{});
const plate=checks.flatMap(c=>c.targetedEvaluations.filter(e=>plateIds.includes(e.ruleId))),context=checks.flatMap(c=>c.targetedEvaluations.filter(e=>!plateIds.includes(e.ruleId)));
assert.deepEqual(count(plate),{'human-review':12,violation:3,compliant:15});assert.deepEqual(count(context),{compliant:10,'human-review':2});
const stem='position-reset-live-review.r5.2026-10-09';
const receipt={schemaVersion:'benefit-card.live-test-review.v1',date:'2026-10-09',status:'PASS_INSTALLED_EDITOR_R5_POSITION_NEGATIVE_RESET_WITH_LEVEL2_CHILD_GAP',revision:5,editorVersion:'0.2.95',replayCoreVersion:read(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/package.json')).version,archiveSha256:row.zipSha256,manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(compiled),totals:{reports:6,negativeReports:3,resetReports:3,plateEvaluations:plate.length,plateClassifications:count(plate),contextEvaluations:context.length,contextClassifications:count(context),resetPlateCompliant:15,unexpectedViolations:0,fullScenariosComplete:0},scope:'Installed Editor: exact BC4-311/312 roots, Position Level 2 negative and Level 1 reset on desktop/mobile-web; desktop missing context captured separately and corrected by fresh live report.',resetAcceptedPlatforms:['desktop','mobile-web'],desktopContextCorrectionAccepted:true,level2ChildIdentityGapClosed:false,sourceRulesChanged:false,contractChanged:false,ruleReviewStatusChanged:false,authoringPreview:true,draftRulesActivated:true,fullComponentAcceptance:false,installedApolloAcceptance:false,productionPublication:false,remainingGates:['BackgroundPlate child contract/native identity scope for Style Level 2; no name/order substitution','Remaining board coverage and child Link/IconView/pins','Source Reviewed/Ready, installed Apollo and release'],pairedBacklogId:'CC-COMPAT-NATIVE-CARD-FACTS-03',reports:checks};
fs.writeFileSync(path.join(__dirname,stem+'.json'),JSON.stringify(receipt,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,stem+'.md'),[
 '# BenefitCard r5 · Position: нарушение, сброс и повтор','',
 '**Сброс Position подтверждён на desktop и mobile-web.** Все пять surface checks возвращаются в compliant; все девять declared targets resolved. У desktop в свежем повторе 16:58:20 UTC выбран explicit ViewportClass=desktop / CardPlacement=single: нарушений и UNKNOWN нет.','',
 'Проверены шесть отчётов установленного Editor 0.2.95. Exact ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали; capture complete, warnings=0. Пакет r5 и исходные Draft-статусы не менялись.','',
 '| Кейс | Время UTC | Position | Пять surface checks | Контекст viewport/Hug | Отчёт |','| --- | --- | --- | --- | --- | --- |',
 ...checks.map(c=>`| [${c.caseId}](${c.figmaUrl}) | ${c.file.match(/T(.*)Z/)[1]} | ${c.position} | ${c.state==='reset'?'5 compliant':'1 violation + 4 UNKNOWN'} | ${c.explicitContext?'2 compliant':'2 UNKNOWN: поля не выбраны'} | [JSON](../${c.file}) |`),'',
 'Level 2 повторно даёт ожидаемое нарушение Position. Четыре UNKNOWN связаны с новым native Style Level 2 и недоказанной target.surface identity; это отдельный открытый gap, не PASS. Reset восстанавливает исходный Style Level 1 и его точную identity. Нельзя наследовать identity от родителя либо подставлять её по имени или порядку.','',
 'Старый desktop reset 16:48:02 UTC подтверждает только пять surface checks: его два контекстных UNKNOWN вызваны пустыми inputs. Свежий desktop reset 16:58:20 UTC закрывает этот повтор с явным контекстом.','',
 'Все полные сценарии остаются incomplete с тремя nonExecutable rules. Полный контракт, Source Reviewed/Ready, дочерние контракты, установленный Apollo и release не приняты.','',
 `Полные доказательства: [${stem}.json](${stem}.json). [Условия тестов](reading-fix-retest.r5.md).`,''
].join('\n'));
plan.livePositionResetReview={date:receipt.date,evidence:stem+'.json',status:receipt.status,totals:receipt.totals,resetAcceptedPlatforms:receipt.resetAcceptedPlatforms,desktopContextCorrectionAccepted:true,level2ChildIdentityGapClosed:false,fullComponentAcceptance:false,installedApolloAcceptance:false};
plan.pendingResetCases=[];plan.currentLiveAccepted=false;
for(const c of plan.cases){const cs=checks.filter(r=>r.caseId===c.id);if(cs.length)c.livePositionResetEvidence={review:stem+'.json',reports:cs.map(r=>({file:r.file,sha256:r.sha256,state:r.state,explicitContext:r.explicitContext})),scopedPlateResetAccepted:true,contextConfirmedByFreshReset:true,level2ChildIdentityGapClosed:false,fullCardAcceptance:false};}
fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,totals:receipt.totals,exactReplay:true,resetAcceptedPlatforms:receipt.resetAcceptedPlatforms,contractChanged:false}));
