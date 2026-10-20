
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const d=__dirname,W=path.resolve(d,'../../../../../../..'),P=path.dirname(path.dirname(path.dirname(d)));
const coreFile=path.join(W,'projects/ComponentContractEditor/dist/core.cjs'),predicateFile=path.join(W,'projects/Apollo-v3/packages/component-contract-core/dist/predicate.cjs');
const core=require(coreFile),predicate=require(predicateFile),wire=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const save=(n,x)=>fs.writeFileSync(path.join(d,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}};
const input=path.join(d,'../completion-candidate-2026-10-18/BenefitCard.r9.private-candidate.component-contract.zip');
const pins=[input,coreFile,predicateFile].map(pin);
async function open(p){const entries=await core.readZip(fs.readFileSync(p));return{entries,workspace:core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),'benefit-card.desktop')};}
(async()=>{
 assert.equal(pins[0].sha256,'cd0d60598929f4a0b2d72741ee45bf00fc037ad72b76f65f02b0fd3237c49532');
 const original=await open(input),old=original.workspace.manual,manual=wire(old);
 assert.equal(old.metadata.revision,9);
 const oldId='component:web.benefit-card-bottom-link-text-only',newId='component:web.benefit-card-bottom-link-size-14-20';
 const prior=manual.rules.find(r=>r.id===oldId);assert(prior&&prior.status==='draft');
 prior.status='deprecated';
 const rule={...wire(prior),id:newId,status:'draft',constraints:[{type:'dependencyDomain',values:['S (14-20)','S (14-20) (Size-20 icons)'],dependency:{contractDependencyId:'link',subjects:[{targetRole:'bottom',relativePath:''}],field:'variantProperty',property:'Size',baselinePolicy:'require-domain'}}],rationale:'В BottomContent.Link разрешён только Size 14–20: S (14-20) или S (14-20) (Size-20 icons). Остальные настройки Link регулируются его контрактом Link r5.',message:'BottomContent.Link: используйте только Size 14–20.',remediationMessage:'Выберите S (14-20) или S (14-20) (Size-20 icons).',sourceRefs:['owner:2026-10-18-benefit-card-link-size']};
 manual.rules.push(rule);manual.metadata.revision=10;manual.metadata.updatedAt=new Date().toISOString();
 assert.deepEqual(manual.targets,old.targets);assert.deepEqual(manual.componentDependencies,old.componentDependencies);
 const bundle=core.buildExportBundle(manual,original.workspace.variantEvidence,original.workspace.dependencyContracts);
 assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
 const newIR=bundle.compiled.rules.filter(r=>r.source.anchor===newId);assert.equal(newIR.length,1);
 assert(!bundle.compiled.rules.some(r=>r.source.anchor===oldId));
 const before=core.buildExportBundle(old,original.workspace.variantEvidence,original.workspace.dependencyContracts).compiled;
 const normalize=r=>{r=wire(r);delete r.revision;delete r.source.checksum;return r};
 for(const r of before.rules.filter(r=>r.source.anchor!==oldId))assert.deepEqual(normalize(bundle.compiled.rules.find(x=>x.ruleId===r.ruleId)),normalize(r));
 const coverage={revision:10,sourceDecision:'owner-decision.json',replacement:{oldRuleId:oldId,newRuleId:newId,compiledRuleId:newIR[0].ruleId},activeRules:manual.rules.filter(r=>r.status!=='deprecated').length,IR:bundle.compiled.rules.length,nonExecutable:bundle.compiled.nonExecutableRules.length,dependenciesUnchanged:true,targetsUnchanged:true,otherParentAssertionsUnchanged:true,Ready:false};
 const testPlan={revision:10,status:'PREPARED_NOT_FRESH_NATIVE',targetRuleId:newIR[0].ruleId,allowed:['S (14-20)','S (14-20) (Size-20 icons)'],negative:['M (16-24)','L (18-24)'],configuration:'Other public Link settings follow Link r5; RightAddon toggle is no longer a negative case.',limits:{characters:32,lines:1},ownerEditorRuns:'NOT_RUN_USER_ONLY',Ready:false};
 const entries=new Map(original.entries.map(e=>[e.name,e]));
 for(const[n,x]of Object.entries({'contract.manual.json':manual,'compiled/component-contract.v2.json':bundle.compiled,'coverage.json':bundle.coverage,'validation-report.json':bundle.validation,'context/owner-decision.r10.json':JSON.parse(fs.readFileSync(path.join(d,'owner-decision.json'))),'reports/rule-coverage.r10.json':coverage,'reports/test-plan.r10.json':testPlan,'context/current-authoring-status.json':{revision:10,status:'DRAFT_LINK_SIZE_NORM_UPDATED',childAuthority:'Draft dependencies remain unaccepted/incomplete in parent Editor preview',Ready:false}}))entries.set(n,core.textZipEntry(n,x));
 const zip=core.createZip([...entries.values()]),zipPath=path.join(d,'BenefitCard.r10.candidate.component-contract.zip');fs.writeFileSync(zipPath,zip,{flag:'wx'});
 const reopened=await open(zipPath),rebuilt=core.buildExportBundle(reopened.workspace.manual,reopened.workspace.variantEvidence,reopened.workspace.dependencyContracts);
 assert.equal(rebuilt.validation.valid,true);assert.deepEqual(reopened.workspace.manual,manual);assert.deepEqual(reopened.workspace.variantEvidence,original.workspace.variantEvidence);assert.deepEqual(reopened.workspace.dependencyContracts,original.workspace.dependencyContracts);assert.deepEqual(wire(rebuilt.compiled),wire(bundle.compiled));
 const view=core.prepareAuthoringPreviewContract(bundle.compiled),activeIR=view.rules.find(r=>r.ruleId===newIR[0].ruleId);
 const BC=path.resolve(d,'../..'),reports=fs.readdirSync(BC).filter(n=>/^benefit-card.validation-report\.2026-10-18T16-2.*\.json$/.test(n)).sort(),native=[];
 let projected;
 for(const name of reports){const file=path.join(BC,name),j=JSON.parse(fs.readFileSync(file));const prepared=core.prepareValidationSnapshot(j.snapshot,view);const result=core.evaluateCompiledContract(j.snapshot,view);const ev=result.evaluations.find(e=>e.ruleId===newIR[0].ruleId);assert(ev);assert.equal(ev.classification,'compliant',JSON.stringify(ev));native.push({report:pin(file),componentId:j.anatomy[0].figmaNodeId,ruleId:ev.ruleId,classification:ev.classification,trace:ev.trace});projected ||= prepared;}
 assert.equal(native.length,8);
 const binding=activeIR.presentation.dependency.bindingId,checks=[];
 for(const value of ['S (14-20)','S (14-20) (Size-20 icons)','M (16-24)','L (18-24)']){
  const s=wire(projected),root=s.nodes.find(n=>s.selection.includes(n.id));root.dependencies[binding].variantProperty=value;
  const result=predicate.evaluateRules({snapshot:s,rules:[activeIR],ruleRelease:bundle.compiled.package.manualSourceHash}),ev=result.evaluations[0];const expected=value.startsWith('S (14-20)')?'compliant':'violation';assert.equal(ev.classification,expected);checks.push({value,expected,actual:ev.classification});
 }
 save('contract.manual.json',manual);save('compiled.json',bundle.compiled);save('coverage-map.json',coverage);save('test-plan.json',testPlan);
 save('eval.json',{status:'PASS_NORM_DELTA_ROUNDTRIP_AND_TARGETED_REPLAY',scope:['Exact r9 input','Size-only parent constraint','Existing Core compile/ZIP/reopen','Eight retained-native inputs for new Size check','Four projected VARIANT domain checks'],zip:pin(zipPath),inputPins:pins,native,domainChecks:checks,Ready:false,freshNative:false,childParentRunsAccepted:false});
 assert.deepEqual(pins.map(p=>pin(p.path)),pins);
 console.log(JSON.stringify({status:'PASS',candidate:pin(zipPath),manualSourceHash:bundle.compiled.package.manualSourceHash,compiledHash:core.stableHash(bundle.compiled),coverage,newRuleId:newIR[0].ruleId,nativeChecks:native.length,domainChecks:checks}));
})().catch(e=>{save('FIRST-FAILURE.json',{error:e.stack,Ready:false});console.error(e.stack);process.exitCode=1;});

