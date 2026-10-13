const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const D=__dirname,W=fs.realpathSync(process.cwd()),P=path.join(W,'shared/design-system_ab/experiments/current-contract-packages');
const fix=path.join(P,'Link/reports/reading-fixes/public-instance-swap-2026-10-11');
assert(fs.existsSync(path.join(P,'Link.component-contract.zip'))&&fs.existsSync(path.join(fix,'runtime/core-after.cjs')),'Run from the exact workplace root');
const core=require(path.join(fix,'runtime/core-after.cjs')),editor=require(path.join(fix,'runtime/editor-after.cjs'));
const read=f=>JSON.parse(fs.readFileSync(f)),wire=v=>JSON.parse(JSON.stringify(v));
const pin=f=>{const b=fs.readFileSync(f);return {path:f,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const write=(name,value)=>{fs.mkdirSync(path.dirname(path.join(D,name)),{recursive:true});fs.writeFileSync(path.join(D,name),JSON.stringify(value,null,2)+'\n');};
assert(!fs.existsSync(path.join(D,'seal.json')));assert(!fs.existsSync(path.join(D,'contract.manual.json')));
(async()=>{
 const zipPath=path.join(P,'Link.component-contract.zip'),seedPin=pin(zipPath);
 assert.equal(seedPin.sha256,'d1c71d8b9e92acf49582ee9b25290c87e29c56e1791f15944697f24550548abd');
 const seedFiles=await core.readZip(fs.readFileSync(zipPath));
 const imported=core.importWorkspace(seedFiles.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)})),'core.web.link');
 const manual=wire(imported.manual),previous=wire(imported.manual),newRules=[];
 manual.metadata.revision=5;manual.metadata.updatedAt=new Date().toISOString();
 const domains=[
  {id:'16',hosts:['S (14-20)'],values:['16','s']},
  {id:'20',hosts:['S (14-20) (Size-20 icons)'],values:['20']},
  {id:'24',hosts:['M (16-24)','L (18-24)'],values:['24','m']},
 ];
 for(const side of ['left','right'])for(const d of domains){
  const rule={id:`component:web-core.link.${side}-icon-native-size.${d.id}`,targetId:`target.${side}-icon`,targetScope:'self',capability:'component-property.Size',permission:'constrained',
   constraints:[{type:'propertyDomain',fact:'component.properties.Size',values:d.values}],controlPaths:[],
   applicability:{variants:{Size:d.hosts},modes:'all',platforms:[],scopeStatus:'confirmed',conditionSubject:'component-root',context:{[`semanticApi.${side}-addon`]:true}},
   severity:'error',rationale:`Размер выбранной ${side==='left'?'левой':'правой'} иконки соответствует публичному слоту ${d.id} dp выбранного Size Link. Масштабирование контейнера не заменяет выбор нужного размера asset.`,
   status:'draft',owner:'design-system-authors',ownership:{kind:'component',ownerId:'core.web.link'},
   sourceRefs:['hub.link.bridge.addon-size','hub.link.cookbook.matching-swap'],execution:{route:'predicate'}};
  newRules.push(rule);manual.rules.push(rule);
 }
 assert.deepEqual(manual.rules.slice(0,previous.rules.length),previous.rules);assert.deepEqual(manual.semanticApi,previous.semanticApi);assert.deepEqual(manual.targets,previous.targets);
 const bundle=core.buildExportBundle(manual,imported.variantEvidence,imported.dependencyContracts);
 write('validation-report.json',bundle.validation);assert(bundle.validation.valid,JSON.stringify(bundle.validation));
 const oldBundle=core.buildExportBundle(previous,imported.variantEvidence,imported.dependencyContracts);
 const normalize=r=>{r=wire(r);delete r.revision;delete r.source.checksum;return r;};
 for(const rule of oldBundle.compiled.rules)assert.deepEqual(normalize(bundle.compiled.rules.find(r=>r.ruleId===rule.ruleId)),normalize(rule));
 const preview=core.prepareAuthoringPreviewContract(bundle.compiled),replays=[];
 for(const [time,count] of [['18-33-59-039',0],['18-34-57-754',1],['18-35-17-374',0],['18-35-27-955',0]]){
  const f=path.join(P,`Link/link.validation-report.2026-10-12T${time}Z.json`),report=read(f),s=report.snapshot;
  const engine=core.evaluateCompiledContract(s,preview);assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),wire(engine));
  const r=core.buildEditorValidationReport(engine,{contract:bundle.compiled,issues:bundle.validation.issues},manual,s,{hiddenTargetCoverageVersion:1});
  const targets=core.prepareValidationSnapshot(s,preview).declaredTargetIdentitiesV1.targets;
  assert.equal(targets.length,8);assert(targets.every(t=>t.status==='resolved'));
  const violations=r.evaluations.filter(e=>e.classification==='violation');assert.equal(violations.length,count,JSON.stringify(violations));
  assert.equal(r.scenarioCoverage.inconclusive,0);assert.equal(r.scenarioCoverage.notExecuted,3);
  if(count)assert.equal(violations[0].ruleId,'component:web-core.link.left-icon-native-size.24.1.1');
  replays.push({input:pin(f),kind:'candidate-r5-replay-on-owner-r4-capture',violations:violations.map(e=>({ruleId:e.ruleId,trace:e.trace})),resolvedTargets:8,inconclusive:0,freshInstalledR5:false});
 }
 const files=seedFiles.map(f=>({name:f.name,data:['contract.manual.json','compiled/component-contract.v2.json','validation-report.json','coverage.json'].includes(f.name)
  ?new TextEncoder().encode(JSON.stringify({'contract.manual.json':manual,'compiled/component-contract.v2.json':bundle.compiled,'validation-report.json':bundle.validation,'coverage.json':bundle.coverage}[f.name])):f.data}));
 const zip=core.createZip(files),reopened=core.importWorkspace((await core.readZip(zip)).filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)})),'core.web.link');
 assert.deepEqual(reopened.manual,manual);assert.deepEqual(reopened.variantEvidence,imported.variantEvidence);assert.deepEqual(wire(core.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts).compiled),wire(bundle.compiled));
 write('contract.manual.json',manual);write('compiled/component-contract.v2.json',bundle.compiled);write('replay.json',{replays,sequence:replays.map(r=>r.violations.length),original32IRPreserved:true,newIR:bundle.compiled.rules.length-oldBundle.compiled.rules.length,wholeReady:false});
 fs.writeFileSync(path.join(D,'Link.r5.candidate.component-contract.zip'),zip);
 write('inputs.json',{seed:seedPin,core:pin(path.join(fix,'runtime/core-after.cjs')),editor:pin(path.join(fix,'runtime/editor-after.cjs')),
 sources:['bridge.md','cookbook.md','adapter.figma.md'].map(f=>pin(path.join(P,'Link/authoring/sources/ds-ai-hub/core/web/components/link',f))),
 native:['S','S20','M','L'].map(z=>pin(path.join(P,`Link/authoring/sources/native/Link.${z}.native-facts.2026-10-10.json`))),
 reuse:'Typed string native Size aliases s=16 and m=24 are confirmed only by these pinned native references; other icon families remain outside icon-contract coverage',sharedWrites:0,canonicalWrites:0});
 write('crosswalk.json',{norm:'Selected icon intrinsic Size matches active public slot: S16 / S20 / M24 / L24',source:'hub.link.bridge.addon-size + hub.link.cookbook.matching-swap',
 newRules:newRules.map(r=>({sourceRuleId:r.id,fullNorm:r.rationale,constraints:r.constraints,applicability:r.applicability,compiledRuleIds:bundle.compiled.rules.filter(ir=>ir.source.anchor===r.id).map(ir=>ir.ruleId)})),
 previousRulesUnchanged:true,publication:'CANDIDATE_ONLY_GOOGLE_SYNC_PENDING',installedR5:'NOT_RUN_USER_ONLY'});
 console.log(JSON.stringify({candidate:path.join(D,'Link.r5.candidate.component-contract.zip'),sourceRules:manual.rules.length,ruleIR:bundle.compiled.rules.length,sequence:replays.map(r=>r.violations.length),oldRulesPreserved:true,sharedWrites:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
