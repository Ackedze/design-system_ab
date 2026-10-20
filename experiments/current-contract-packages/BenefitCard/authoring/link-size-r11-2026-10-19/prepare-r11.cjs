(function prepareR11(){
const fs=require("fs"),path=require("path"),assert=require("assert/strict"),crypto=require("crypto");
const W="/Users/alexkukhta/Desktop/workplace",P=path.join(W,"shared/design-system_ab/experiments/current-contract-packages"),D=__dirname;
const coreFile=path.join(W,"projects/ComponentContractEditor/dist/core.cjs"),predicateFile=path.join(W,"projects/Apollo-v3/packages/component-contract-core/dist/predicate.cjs");
const core=require(coreFile),predicate=require(predicateFile),wire=x=>JSON.parse(JSON.stringify(x));
const hash=b=>crypto.createHash("sha256").update(b).digest("hex"),pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:hash(b),bytes:b.length};};
const save=(n,x)=>{const p=path.join(D,n);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==="string"?x:JSON.stringify(x,null,2)+"\n",{flag:"wx"});};
const input=path.join(P,"BenefitCard.r10.candidate.component-contract.zip");
const mid="component:web.benefit-card-bottom-link-size-14-20",did="component:web.benefit-card-bottom-link-size-16-24";
const mobileText="В mobile-web BenefitCard у BottomContent.Link разрешён только Size 14–20: S (14-20) или S (14-20) (Size-20 icons). Остальные настройки регулируются контрактом Link r5.";
const desktopText="В desktop BenefitCard у BottomContent.Link разрешён только Size 16–24: M (16-24). Остальные настройки регулируются контрактом Link r5.";
const sourceFiles=["shared/design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/rules.json","shared/design-system_ab/patterns/p_benefit-card.md","ds-ai-hub/products/ab/patterns/benefit-card.md","ds-ai-hub/products/ab/components/benefit-card/instructions.md","shared/design-system_ab/apollo/rule-crosswalk.json","projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md"];
const inputs=[input,coreFile,predicateFile,...sourceFiles.map(p=>path.join(W,p))].map(pin);
const replace=(s,a,b,n=1)=>{assert.equal(s.split(a).length-1,n,"literal count: "+a);return s.split(a).join(b);};
const planned=new Map();
(async()=>{
assert.equal(inputs[0].sha256,"0f43d88103b797d763ea629541f99e8f04a861ee71b22f17a2b4e69785ef632c");
assert.equal(inputs[1].sha256,"0559e9210660a775eb75670198c271fdf05c8f887d70407400353f5b25b69cb0");
for(const f of sourceFiles){const p=path.join(W,f);if(!fs.existsSync(path.join(D,"before",f)))save("before/"+f,fs.readFileSync(p,"utf8"));planned.set(f,fs.readFileSync(p,"utf8"));}
const sr=JSON.parse(planned.get(sourceFiles[0])),sm=sr.manual.rules.find(r=>r.ruleId===mid);assert(sm);
sm.ruleText=mobileText;sm.authority.revision=2;
const sd=wire(sm);sd.ruleId=did;sd.ruleText=desktopText;sd.authority.revision=1;sr.manual.rules.push(sd);planned.set(sourceFiles[0],JSON.stringify(sr,null,2)+"\n");
for(const file of sourceFiles.slice(1,3)){
 let s=planned.get(file);
 s=replace(s,"- использует только `Size=14–20`; остальные настройки регулируются контрактом Link.","- на mobile-web использует только `Size=14–20` (`S (14-20)` или `S (14-20) (Size-20 icons)`), на desktop — только `Size=16–24` (`M (16-24)`); остальные настройки регулируются контрактом Link.");
 s=replace(s,"У Link допустим только `Size=14–20`; остальные настройки регулируются его компонентным контрактом.","У Link на mobile-web допустим только `Size=14–20`, а на desktop — только `Size=16–24`; остальные настройки регулируются его компонентным контрактом.");
 s=replace(s,"- updatedAt: 2026-07-20","- updatedAt: 2026-10-19");
 if(file.startsWith("ds-ai-hub"))s=replace(s,"lastReviewed: 2026-07-20","lastReviewed: 2026-10-19");
 planned.set(file,s);
}
let instructions=planned.get(sourceFiles[3]);
instructions=replace(instructions,"| `BottomContent` | Опционален; только `Presets=Link` и `Size=14–20`, до 32 символов и одной строки. Остальные настройки — по контракту Link. |","| `BottomContent` | Опционален; только `Presets=Link`: mobile-web — `Size=14–20`, desktop — `Size=16–24`; до 32 символов и одной строки. Остальные настройки — по контракту Link. |");
instructions=replace(instructions,"- использовать в BottomContent.Link размер, отличный от `14–20`;","- использовать в BottomContent.Link размер, отличный от `14–20` на mobile-web или `16–24` на desktop;");
instructions=replace(instructions,"lastReviewed: 2026-07-29","lastReviewed: 2026-10-19");planned.set(sourceFiles[3],instructions);
const cw=JSON.parse(planned.get(sourceFiles[4])),cm=cw.entries.find(x=>x.apolloRuleId===mid);
assert(cm,"crosswalk existing entry");
cm.enforcementScope="mobile-web BenefitCard BottomContent.Link: Size14–20 only; independent of other public Link settings";
cm.review={status:"draft",reviewedAt:"2026-10-19",basis:"Owner correction: mobile S14–20, desktop M16–24. Existing dependencyDomain; targeted checks recorded in r11 eval. Full Ready remains open."};
const cd=wire(cm);cd.apolloRuleId=did;cd.enforcementScope="desktop BenefitCard BottomContent.Link: Size16–24 only; independent of other public Link settings";
cw.entries.push(cd);planned.set(sourceFiles[4],JSON.stringify(cw,null,2)+"\n");
let back=planned.get(sourceFiles[5]);
back=replace(back,"- RuleID: `component:web.benefit-card-bottom-link-size-14-20`; допустимы\n  `S (14-20)` и `S (14-20) (Size-20 icons)`. Остальные настройки регулирует Link r5.","- RuleID mobile-web: `component:web.benefit-card-bottom-link-size-14-20` —\n  `S (14-20)` и `S (14-20) (Size-20 icons)`; desktop:\n  `component:web.benefit-card-bottom-link-size-16-24` — `M (16-24)`.\n  Исправление владельца от 19.10.2026, r11; остальные настройки регулирует Link r5.");
back=replace(back,"- Закрытие: оба допустимых Figma варианта имеют доказанное соответствие\n  библиотечной типографике и размеру иконок; M/L отклоняются.","- Закрытие: оба mobile-web варианта S и desktop вариант M имеют доказанное\n  соответствие библиотечной типографике и размеру иконок; остальные размеры\n  отклоняются для соответствующей платформы.");
planned.set(sourceFiles[5],back);
for(const [file,s]of planned)save("planned/"+file,s);
const open=async p=>{const entries=await core.readZip(fs.readFileSync(p));const workspace=core.importWorkspace(entries.filter(e=>e.name.endsWith(".json")).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),"benefit-card.desktop");return{entries,workspace};};
const original=await open(input),old=original.workspace.manual,manual=wire(old);assert.equal(old.metadata.revision,10);
const mr=manual.rules.find(r=>r.id===mid);assert(mr&&mr.status==="draft");mr.applicability.platforms=["mobile-web"];mr.rationale=mobileText;mr.message="Mobile-web BottomContent.Link: используйте только Size 14–20.";mr.remediationMessage="Выберите S (14-20) или S (14-20) (Size-20 icons).";mr.sourceRefs=["owner:2026-10-19-benefit-card-link-size-by-platform"];
const dr=wire(mr);dr.id=did;dr.applicability.platforms=["desktop"];dr.constraints[0].values=["M (16-24)"];dr.rationale=desktopText;dr.message="Desktop BottomContent.Link: используйте только Size 16–24.";dr.remediationMessage="Выберите M (16-24).";manual.rules.push(dr);
manual.metadata.revision=11;manual.metadata.updatedAt=new Date().toISOString();
for(const key of ["targets","componentDependencies","semanticApi","controlPorts","representations"])assert.deepEqual(manual[key],old[key],key);
const bundle=core.buildExportBundle(manual,original.workspace.variantEvidence,original.workspace.dependencyContracts),before=core.buildExportBundle(old,original.workspace.variantEvidence,original.workspace.dependencyContracts).compiled;assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));assert.equal(core.stableHash(before),"795876f09d5acb4d3e056a55fb6d498bb93aa30e5e87d7535eb7cc4028122723");
const ir=bundle.compiled.rules.filter(r=>[mid,did].includes(r.source.anchor));assert.equal(ir.length,2);assert.deepEqual(ir.find(r=>r.source.anchor===mid).scope.platform,["mobile-web"]);assert.deepEqual(ir.find(r=>r.source.anchor===did).scope.platform,["desktop"]);
const norm=r=>{r=wire(r);delete r.revision;delete r.source.checksum;return r;};
for(const r of before.rules.filter(r=>r.source.anchor!==mid))assert.deepEqual(norm(bundle.compiled.rules.find(x=>x.ruleId===r.ruleId)),norm(r));
const review=JSON.parse(fs.readFileSync(path.join(D,"fresh-r10-report-review.json"))),view=core.prepareAuthoringPreviewContract(bundle.compiled),sizeRules=view.rules.filter(r=>[mid,did].includes(r.source.anchor)),retained=[],snapshots=new Map(),expectedOld=[0,0,1,1,0,0,0,0],expectedNew=[1,0,0,1,1,0,1,0];
for(let i=0;i<review.cases.length;i++){
 const row=review.cases[i],b=fs.readFileSync(row.report.path);assert.equal(hash(b),row.report.sha256);const j=JSON.parse(b);assert.equal(row.revision,10);assert.equal(row.manualSourceHash,before.package.manualSourceHash);assert.equal(row.parentViolations.length,expectedOld[i]);const prepared=core.prepareValidationSnapshot(j.snapshot,view);snapshots.set(row.platform,prepared);
 const result=core.evaluateCompiledContract(j.snapshot,view),evaluations=result.evaluations.filter(e=>e.ruleId.startsWith("component:web.benefit-card")),violations=evaluations.filter(e=>e.classification==="violation");assert.equal(violations.length,expectedNew[i],row.componentId);
 const relevant=sizeRules.find(r=>r.scope.platform.includes(row.platform)),e=evaluations.find(x=>x.ruleId===relevant.ruleId);assert(e);
 const expected=row.platform==="desktop"?(row.linkSize==="M (16-24)"?"compliant":"violation"):(row.linkSize.startsWith("S (14-20)")?"compliant":"violation");assert.equal(e.classification,expected);
 retained.push({report:row.report,componentId:row.componentId,platform:row.platform,linkSize:row.linkSize,ruleId:e.ruleId,actual:e.classification,expected,trace:e.trace,parentViolations:violations.map(v=>v.ruleId)});
}
const checks=[];
for(const platform of ["desktop","mobile-web"]){
 const rule=sizeRules.find(r=>r.scope.platform.includes(platform)),binding=rule.presentation.dependency.bindingId;
 for(const value of ["S (14-20)","S (14-20) (Size-20 icons)","M (16-24)","L (18-24)"]){
  const s=wire(snapshots.get(platform)),root=s.nodes.find(n=>s.selection.includes(n.id));root.dependencies[binding].variantProperty=value;
  const result=predicate.evaluateRules({snapshot:s,rules:sizeRules,ruleRelease:bundle.compiled.package.manualSourceHash}),e=result.evaluations.find(x=>x.ruleId===rule.ruleId),other=result.evaluations.find(x=>x.ruleId!==rule.ruleId);
  const expected=platform==="desktop"?(value==="M (16-24)"?"compliant":"violation"):(value.startsWith("S (14-20)")?"compliant":"violation");
  assert.equal(e.classification,expected);assert.equal(other.classification,"not-applicable");checks.push({platform,value,actual:e.classification,expected,otherPlatform:other.classification});
 }
 for(const scenario of ["missing-size","hidden-bottom"]){
  const s=wire(snapshots.get(platform)),root=s.nodes.find(n=>s.selection.includes(n.id));if(scenario==="missing-size")delete root.dependencies[binding].variantProperty;else root.semanticApi.BottomEnabled=false;
  const result=predicate.evaluateRules({snapshot:s,rules:[rule],ruleRelease:bundle.compiled.package.manualSourceHash}),e=result.evaluations[0];const expected=scenario==="missing-size"?"human-review":"not-applicable";assert.equal(e.classification,expected);checks.push({platform,scenario,actual:e.classification,expected});
 }
}
const coverage={revision:11,sourceDecision:"owner-decision.json",rules:ir.map(r=>({manualRuleId:r.source.anchor,compiledRuleId:r.ruleId,platforms:r.scope.platform})),activeRules:manual.rules.filter(r=>r.status!=="deprecated").length,IR:bundle.compiled.rules.length,nonExecutable:bundle.compiled.nonExecutableRules.length,targetsUnchanged:true,dependenciesUnchanged:true,otherParentAssertionsUnchanged:true,semanticUniqueness:"Two disjoint platform scopes with distinct Size domains; no overlapping active rule",Ready:false};
const testPlan={revision:11,status:"NOT_FRESH_R11_NATIVE",mobileWeb:["S (14-20)","S (14-20) (Size-20 icons)"],desktop:["M (16-24)"],negativeDesktop:["S (14-20)","S (14-20) (Size-20 icons)","L (18-24)"],negativeMobile:["M (16-24)","L (18-24)"],targetRules:coverage.rules,existingFreshOwnerReports:"r10 source norm; r11 retained replay separately recorded",Ready:false};
const entries=new Map(original.entries.map(e=>[e.name,e]));
const updates={"contract.manual.json":manual,"compiled/component-contract.v2.json":bundle.compiled,"coverage.json":bundle.coverage,"validation-report.json":bundle.validation,"context/owner-decision.r11.json":JSON.parse(fs.readFileSync(path.join(D,"owner-decision.json"))),"reports/rule-coverage.r11.json":coverage,"reports/test-plan.r11.json":testPlan,"context/current-authoring-status.json":{revision:11,status:"DRAFT_PLATFORM_LINK_SIZE_CORRECTED",mobileWeb:"14–20",desktop:"16–24",Ready:false},"benefit-card/source/rules.json":sr};
for(const[n,x]of Object.entries(updates))entries.set(n,core.textZipEntry(n,x));
const zipPath=path.join(D,"BenefitCard.r11.candidate.component-contract.zip");fs.writeFileSync(zipPath,core.createZip([...entries.values()]),{flag:"wx"});
const reopened=await open(zipPath),rebuilt=core.buildExportBundle(reopened.workspace.manual,reopened.workspace.variantEvidence,reopened.workspace.dependencyContracts);assert.equal(rebuilt.validation.valid,true);assert.deepEqual(reopened.workspace.manual,manual);assert.deepEqual(reopened.workspace.variantEvidence,original.workspace.variantEvidence);assert.deepEqual(reopened.workspace.dependencyContracts,original.workspace.dependencyContracts);assert.deepEqual(wire(rebuilt.compiled),wire(bundle.compiled));
save("contract.manual.json",manual);save("compiled.json",bundle.compiled);save("coverage-map.json",coverage);save("test-plan.json",testPlan);
save("eval.json",{status:"PASS_PLATFORM_NORM_DELTA_AND_ROUNDTRIP",scope:["Current exact r10","Mutually exclusive platform Size norms","Existing canonical Editor import/build/ZIP/reopen","8 fresh r10 reports classified under r10","8 retained native input replays under r11","8 platform domain cases and4 missing/inactive cases"],inputPins:inputs,zip:pin(zipPath),manualSourceHash:bundle.compiled.package.manualSourceHash,compiledHash:core.stableHash(bundle.compiled),coverage,retainedR11:retained,checks,freshR11Native:false,parentChildCompletionAccepted:false,Ready:false});
assert.deepEqual(inputs.map(x=>pin(x.path)),inputs);
console.log(JSON.stringify({status:"PASS",zip:pin(zipPath),manualSourceHash:bundle.compiled.package.manualSourceHash,compiledHash:core.stableHash(bundle.compiled),coverage,retained:retained.map(x=>({id:x.componentId,platform:x.platform,size:x.linkSize,actual:x.actual})),checks:checks.length}));
})().catch(e=>{save(fs.existsSync(path.join(D,"FIRST-FAILURE.json"))?"LATER-FAILURE.json":"FIRST-FAILURE.json",{error:e.stack,Ready:false});console.error(e.stack);process.exitCode=1;});
})();

