'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const R=__dirname,C=path.resolve(R,'../..'),A=path.resolve(C,'../../../../../..'),W=path.resolve(A,'../..');
const F=W+'/.local/apollo-general-2026-10-16/mcp-pilot276/indicator-2026-10-23/runtime-input';
const core=require(F+'/packages/component-contract-core/dist/core.cjs'),rt=require(F+'/dist/runtime.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>({file:path.relative(A,p),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const write=(n,x)=>fs.writeFileSync(R+'/'+n,JSON.stringify(x)+'\n',{flag:'wx'});
const oldR=C+'/reports/authoring-r1-2026-10-23';
async function main(){
 const reportPath='/Users/alexkukhta/Downloads/apollo-v4-370e617ec6ec.json',bytes=fs.readFileSync(reportPath),report=JSON.parse(bytes);
 const manual=read(C+'/contract.manual.json'),oldFacts=read(C+'/variant-evidence.json'),previous=read(oldR+'/compiled.json');
 const cases=read(oldR+'/test-cases.json').cases,native=read(oldR+'/native-source.json').sets[0];
 assert.equal(manual.metadata.revision,1);assert.equal(rt.contractHash(manual),previous.package.manualSourceHash);
 assert.equal(report.release.id,'8d3248d2735c6819906c914a0d75981dda85850a9a86b58d344099c060c8b3f3');
 assert.deepEqual(report.components.map(c=>c.scopeId),cases.map(c=>c.instanceId));
 fs.writeFileSync(R+'/owner-report.json.gz',zlib.gzipSync(bytes),{flag:'wx'});
 assert.deepEqual(zlib.gunzipSync(fs.readFileSync(R+'/owner-report.json.gz')),bytes);
 const summarize=a=>({counts:a.engine.coverage.byClassification,coverage:a.coverage,violations:a.engine.evaluations.filter(e=>e.classification==='violation').map(e=>({ruleId:e.ruleId,node:e.subjectNodeName,actual:e.trace.actual,expected:e.trace.expected})),unknownGroups:[...new Set(a.engine.evaluations.filter(e=>e.classification==='human-review').map(e=>e.trace.reason))]});
 const before=report.components.map((c,i)=>({id:cases[i].id,...summarize(c.result)}));
 assert.deepEqual(before.map(c=>c.counts.violation||0),[0,0,0,1,1,0,1,0]);
 write('before.json',{status:'FAIL',source:{path:reportPath,sha256:hash(bytes),bytes:bytes.length,archive:pin(R+'/owner-report.json.gz')},release:report.release,cases:before,reason:'Count Size condition reads target rather than host; Size 8 catalog shape omits independently witnessed fixer FRAME.'});
 // Preserve the original failed native evidence before changing canonical inputs.
 write('case.json',{caseId:'indicator-r2-native-applicability-regression',scope:'Indicator data-only correction; no new norms or runtime changes',previousManual:pin(C+'/contract.manual.json'),previousFacts:pin(C+'/variant-evidence.json'),previousZip:pin(C+'/packages/Indicator.r1.draft.component-contract.zip'),core:pin(F+'/packages/component-contract-core/dist/core.cjs'),runtime:pin(F+'/dist/runtime.cjs'),sourceNative:pin(oldR+'/native-source.json'),expectedCounts:cases.map(c=>c.expectedViolations),review:{independent:false}});
 manual.rules[2].applicability.conditionSubject='component-root';
 manual.metadata.revision=2;manual.metadata.updatedAt=new Date().toISOString();
 const size8=oldFacts.variants.filter(v=>v.properties.Size==='8');assert.equal(size8.length,6);
 const anatomy=read(C+'/contract.generated.json'),generated=anatomy.contracts[0];
 for(const v of size8){
  const n=native.variants.find(n=>n.key===v.componentKey);assert(n);assert.deepEqual(n.properties,v.properties);
  assert.deepEqual(n.children.map(c=>({path:c.name,type:c.type})),[{path:'fixer',type:'FRAME'}]);
  const child=n.children[0];
  generated.figma.variantStructures[v.componentKey].push({op:'add',id:child.id,value:{parentId:1,name:child.name,type:child.type}});
 }
 const context=['rules.json','composition-contract.json','contract.overrides.json','agent-context.json','audit-mapping.json'].map(name=>({name,text:fs.readFileSync(C+'/'+name,'utf8')}));
 context.push({name:'variant-anatomy.source.json',text:JSON.stringify(anatomy)},{name:'native-source.json',text:fs.readFileSync(oldR+'/native-source.json','utf8')});
 const facts=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(manual)},...context],manual.component.contractId).variantEvidence;
 assert.equal(facts.variants.length,36);assert.deepEqual(facts.libraryText,oldFacts.libraryText);
 for(const v of facts.variants){const old=oldFacts.variants.find(x=>x.componentKey===v.componentKey);assert.deepEqual(v.properties,old.properties);assert.deepEqual(facts.structures[v.structureId],v.properties.Size==='8'?[{path:'',type:'ROOT'},{path:'fixer',type:'FRAME'}]:oldFacts.structures[old.structureId]);}
 const bundle=core.buildExportBundle(manual,facts,[]);assert(bundle.validation.valid,JSON.stringify(bundle.validation));assert.equal(bundle.compiled.rules.length,23);
 const typography=bundle.compiled.rules.filter(r=>r.source.anchor===manual.rules[2].id);assert.equal(typography.length,9);
 for(const r of typography)assert(r.when.args.some(x=>x.predicate==='one-of'&&x.actual?.fact==='host.component.properties.Size'),'HOST_SIZE_REQUIRED');
 const after=report.components.map((c,i)=>{
  const a=rt.auditContractSnapshot(structuredClone(c.snapshot),structuredClone(bundle.compiled),{evaluationMode:'authoring-preview'}),s=summarize(a),expected=cases[i];
  assert.equal(s.counts.violation||0,expected.expectedViolations,expected.id);assert.equal(a.coverage.executionComplete,true,expected.id);assert.equal(a.coverage.uncertain,0,expected.id);
  assert.deepEqual(s.violations.map(v=>v.ruleId),expected.expectedRuleId?[expected.expectedRuleId]:[],expected.id);
  assert.equal(a.engine.coverage.duplicateEvaluationIds,0);
  return {id:expected.id,instanceId:c.scopeId,expectedViolations:expected.expectedViolations,expectedRuleId:expected.expectedRuleId,...s};
 });
 // Missing proof stays UNKNOWN; the correction is not an absence/baseline bypass.
 const incomplete=structuredClone(report.components[2].snapshot);incomplete.variantReference.complete=false;
 const unknown=rt.auditContractSnapshot(incomplete,structuredClone(bundle.compiled),{evaluationMode:'authoring-preview'});assert(unknown.coverage.uncertain>0);assert.equal(unknown.coverage.executionComplete,false);
 assert.equal(bundle.sourceFactsHash,rt.contractHash(facts),'REPLAY_MUST_PRESERVE_EXPORT_EVIDENCE');
 write('replay.json',{status:'PASS',evidenceKind:'retained-native-snapshot-replay',freshNative:false,cases:after,incompleteReference:{uncertain:unknown.coverage.uncertain,executionComplete:false}});
 write('validation.json',bundle.validation);write('compiled.json',bundle.compiled);
 // Use a bounded native correction of the old generated anatomy; no converter change.
 const zip=core.buildAuthoringZip(bundle,context),pkg=C+'/packages/Indicator.r2.draft.component-contract.zip';fs.writeFileSync(pkg,zip,{flag:'wx'});
 const entries=await core.readZip(zip),reopened=core.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)})),manual.component.contractId);
 const again=core.buildExportBundle(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
 for(const [a,b]of [[manual,reopened.manual],[facts,reopened.variantEvidence],[bundle.compiled,again.compiled]])assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
 fs.writeFileSync(C+'/contract.manual.json',JSON.stringify(manual,null,2)+'\n');fs.writeFileSync(C+'/variant-evidence.json',JSON.stringify(facts)+'\n');fs.writeFileSync(C+'/variant-anatomy.source.json',JSON.stringify(anatomy)+'\n',{flag:'wx'});
 write('technical.json',{valid:true,roundtrip:'PASS',manual:pin(C+'/contract.manual.json'),facts:pin(C+'/variant-evidence.json'),anatomySource:pin(C+'/variant-anatomy.source.json'),package:pin(pkg),compiled:pin(R+'/compiled.json'),constraintsChanged:false,normsChanged:false,sourcePoliciesChanged:false,conditionSubject:'component-root',size8ShapeVerifiedNativeVariants:size8.map(v=>v.componentKey),runtimeUnchanged:true,packageEvidenceRoute:'Existing importer with native-corrected anatomy companion; original generated source and all libraryText preserved.'});
 write('coverage-map.json',{source:pin(oldR+'/coverage-map.json'),entries:read(oldR+'/coverage-map.json').entries,revision:2,changes:['Count condition reads native Size on component root','Size 8 structure includes source-witnessed fixer FRAME'],gaps:read(oldR+'/coverage-map.json').gaps.filter(g=>g.id!=='native-test-pending').concat([{id:'native-r2-pending',reason:'Fresh installed Apollo run remains owner-only; saved snapshots replay PASS.'}])});
 write('lessons.json',[{id:'indicator-host-condition',cause:'Author omitted existing conditionSubject=component-root on descendant VARIANT condition; IR shape assertion did not execute captured conditions.',effect:'All nine typography predicates UNKNOWN; IND-06 false negative.',fix:'Add supported root subject.',protection:'Replay retained native positive and exact font-size violation, assert full execution and zero uncertainty.'},{id:'indicator-size8-structure',cause:'Importer-derived compact anatomy omitted fixer FRAME; author failed to compare complete native topology before handoff.',effect:'All 23 IR UNKNOWN for Size 8.',fix:'Add independently captured fixer to the six exact Size 8 shapes.',protection:'Native complete-reference case and intentionally incomplete-reference UNKNOWN regression.',status:'replay-verified; fresh native pending'}]);
 console.log(JSON.stringify({revision:2,roundtrip:'PASS',counts:after.map(c=>c.counts.violation||0),uncertain:after.map(c=>c.coverage.uncertain),package:pin(pkg)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
