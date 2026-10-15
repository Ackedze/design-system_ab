const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',S=P+'/IconView/authoring/candidates/r2-2026-10-13',D=P+'/IconView/authoring/candidates/r3-2026-10-13';
const c=require(W+'/projects/ComponentContractEditor/dist/core.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>JSON.parse(fs.readFileSync(p)),write=(n,v)=>fs.writeFileSync(D+'/'+n,JSON.stringify(v)+'\n',{flag:'wx'}),pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length};};
const check=p=>{const b=fs.readFileSync(p.path);assert.equal(sha(b),p.sha256,p.path);if(p.bytes!==undefined)assert.equal(b.length,p.bytes,p.path);};
const seal=read(S+'/seal.json');assert.equal(seal.writerStatus,'CLOSED');[...seal.files,...seal.inputPins].forEach(check);
const times=['18-13-51-210','18-14-07-180','18-14-36-881','18-26-28-716','18-26-54-083','18-49-10-383','18-49-29-269','18-55-08-114','19-12-42-499','19-12-59-929'];
const reportPaths=times.map(t=>P+'/IconView/icon-view.validation-report.2026-10-13T'+t+'Z.json');
const reports=reportPaths.map(read),m=read(S+'/contract.manual.json'),v=read(S+'/variant-evidence.json'),old=read(S+'/coverage-map.json'),originalId='component:web-core.icon-view.shape-border-form-match';
const original=m.rules.find(r=>r.id===originalId);assert.equal(original.execution.route,'context-only');
assert.equal(reports[9].summary.classifications.violation||0,0);assert(reports[9].results.editor.evaluations.some(e=>e.ruleId===originalId&&e.classification==='not-executed'));
write('owner-decision.json',{date:'2026-10-13',existingNorm:original.rationale,confirmation:'Owner: при разных шейпах нарушение должно быть.',scope:'Equality when both root Shape and Border are true. No change to shape domains, permissions, public Figma API, generation, or pilot.',reports:reportPaths.slice(-2).map(pin)});
original.status='deprecated';
m.semanticApi.push({id:'shape-form',kind:'variant',valueType:'enum',domain:['Superellipse','Circle','Rectangle'],description:'Read-only Form of the identity-proven Shape target. Not a root Figma property or generation setter.',bindings:[{representationId:'web-core.icon-view.figma.universal',targetId:'target.shape',path:'component.properties.Form',transform:'identity'}]});
const forms=['Superellipse','Circle','Rectangle'];
for(const form of forms){
  const r=structuredClone(original);r.id=originalId+'.'+form.toLowerCase();r.status='draft';r.targetId='target.border';r.targetScope='self';r.capability='component-property.Form';r.permission='constrained';r.controlPaths=[];
  r.constraints=[{type:'propertyDomain',fact:'component.properties.Form',values:[form]}];
  r.applicability={variants:'all',modes:'all',platforms:[],scopeStatus:'confirmed',conditionSubject:'component-root',context:{'semanticApi.shape':true,'semanticApi.border':true,'semanticApi.shape-form':form}};
  r.execution={route:'auto'};r.rationale=original.rationale+' Ветка '+form+': Form у Border должен быть '+form+'.';r.sourceRefs=[...r.sourceRefs,'owner.form-match.2026-10-13'];m.rules.push(r);
}
m.metadata.revision=3;m.metadata.updatedAt=new Date().toISOString();
m.documentation.push({id:'owner.form-match.2026-10-13',kind:'owner-decision',path:D+'/owner-decision.json',status:'draft'});
const inputs=[...read(S+'/source-inventory.json').inputs,pin(S+'/seal.json'),pin(S+'/contract.manual.json'),pin(S+'/component-contract.v2.json'),pin(S+'/variant-evidence.json'),pin(P+'/IconView.r2.candidate.component-contract.zip'),pin(W+'/projects/ComponentContractEditor/dist/core.cjs'),pin(D+'/owner-decision.json'),...reportPaths.map(pin)];
inputs.forEach(check);m.source={...m.source,importedAt:new Date().toISOString(),importedFiles:inputs.map(p=>p.path),sourceHash:c.stableHash(inputs)};
write('contract.manual.json',m);write('variant-evidence.json',v);write('source-inventory.json',{inputs});const b=c.buildExportBundle(m,v);write('validation-report.json',b.validation);assert(b.validation.valid,JSON.stringify(b.validation));write('component-contract.v2.json',b.compiled);
assert.equal(m.rules.length,38);assert.equal(m.rules.filter(r=>r.status!=='deprecated').length,36);assert.equal(b.compiled.rules.length,57);assert.equal(b.compiled.nonExecutableRules.length,6);assert.equal(b.compiled.runtimePolicy.semanticTargetVisibilityVersion,1);
const replacement={from:originalId,status:'deprecated',to:forms.map(f=>originalId+'.'+f.toLowerCase()),relation:'1:N',reason:'Replace nonexecuted equality with three exhaustive conditional native Form domains. Existing norm unchanged.'};
write('coverage-map.json',{...old,ruleReplacements:[old.ruleReplacement,replacement],rules:m.rules.map(r=>({id:r.id,status:r.status,norm:r.rationale,route:r.execution.route,target:r.targetId,applicability:r.applicability,constraints:r.constraints,sourceRefs:r.sourceRefs,compiledRuleIds:b.compiled.rules.filter(ir=>ir.source.anchor===r.id).map(ir=>ir.ruleId)})),readOnlyProjection:{id:'shape-form',targetId:'target.shape',fact:'component.properties.Form',publicSetter:false},Ready:false});
write('inputs.json',{schemaVersion:'apollo.contract-authoring-inputs.v1',contractId:m.component.contractId,files:[{name:'contract.manual.json',path:'contract.manual.json',sha256:sha(fs.readFileSync(D+'/contract.manual.json'))},{name:'component-contract.v2.json',path:'component-contract.v2.json',sha256:sha(fs.readFileSync(D+'/component-contract.v2.json'))},{name:'Web _ Typography.json',path:W+'/shared/design-system_ab/JSONS/styles/Web _ Typography.json',sha256:sha(fs.readFileSync(W+'/shared/design-system_ab/JSONS/styles/Web _ Typography.json'))}]});
const ec=c.prepareAuthoringPreviewContract(b.compiled),rows=[];
for(const [i,r] of reports.entries()){
  const expected=r.results.engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId);if(i===9)expected.push(originalId+'.circle.1.1');
  const actual=c.evaluateCompiledContract(r.snapshot,ec),viol=actual.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId);assert.deepEqual(viol.sort(),expected.sort(),times[i]);assert.equal(actual.evaluations.filter(e=>e.classification==='human-review').length,0,times[i]);
  rows.push({input:pin(reportPaths[i]),kind:'retained native capture replay on r3; not fresh installed r3',expectedViolations:expected,actualViolations:viol,projection:c.prepareValidationSnapshot(r.snapshot,ec).nodes[0].semanticBindingEvidence['shape-form']});
}
const synthetic=[];
for(const shape of forms)for(const border of forms){
  const s=structuredClone(reports[8].snapshot),root=s.nodes[0];s.nodes.find(n=>n.id===root.relations.shape).component.properties.Form=shape;s.nodes.find(n=>n.id===root.relations.border).component.properties.Form=border;
  const actual=c.evaluateCompiledContract(s,ec),viol=actual.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId),expected=shape===border?[]:[originalId+'.'+shape.toLowerCase()+'.1.1'];assert.deepEqual(viol,expected);assert.equal(actual.evaluations.filter(e=>e.classification==='human-review').length,0);
  synthetic.push({kind:'controlled property-value-only matrix; no native Rectangle capture or new identity proof claimed',shape,border,expected,actual:viol});
}
for(const [shape,border] of [[false,true],[true,false],[false,false]]){
  const s=structuredClone(reports[9].snapshot);s.nodes[0].component.properties['Shape#88323:0']=shape;s.nodes[0].component.properties['Border#70244:67']=border;const actual=c.evaluateCompiledContract(s,ec),matches=actual.evaluations.filter(e=>e.ruleId.startsWith(originalId+'.'));assert(matches.every(e=>e.classification==='not-applicable'));
  synthetic.push({kind:'controlled configured BOOLEAN condition, not native inactivity PASS',shape,border,ruleClassifications:matches.map(e=>e.classification)});
}
for(const role of ['shape','border']){
  const s=structuredClone(reports[9].snapshot),root=s.nodes[0];delete s.nodes.find(n=>n.id===root.relations[role]).component.properties.Form;const actual=c.evaluateCompiledContract(s,ec),matches=actual.evaluations.filter(e=>e.ruleId.startsWith(originalId+'.'));assert(matches.some(e=>e.classification==='human-review'));assert(!matches.some(e=>e.classification==='violation'));
  synthetic.push({kind:'controlled missing native property evidence',missingRole:role,ruleClassifications:matches.map(e=>e.classification)});
}
write('controlled-replay.json',{rows,synthetic,status:'PASS_SCOPED',before:{candidate:pin(P+'/IconView.r2.candidate.component-contract.zip'),mismatchReport:pin(reportPaths[9]),violations:0,matchRule:'not-executed'},after:{mismatchViolations:1,equalViolations:0},nativeR3:'NOT_RUN_USER_ONLY',Ready:false});
const cross=read(S+'/hub-norm-crosswalk.json');for(const entry of cross.entries)if(entry.rules?.includes(originalId)){entry.rules=entry.rules.flatMap(id=>id===originalId?replacement.to:[id]);entry.route='auto';entry.status='IMPLEMENTED_NATIVE_R3_PENDING';entry.replacement=replacement;}write('hub-norm-crosswalk.json',cross);
write('diff-summary.json',{fromRevision:2,toRevision:3,changedOriginalRule:{id:originalId,from:'context-only draft',to:'deprecated; norm preserved by three branches'},newRuleIds:replacement.to,newSemanticFact:'shape-form',targetBindingsUnchanged:true,unrelatedRulesUnchanged:true,publicPermissionsUnchanged:true,sourceBuildWrites:0,pilotChanges:false,manifestChanges:false,Ready:false});
write('skill-snapshot-pins.json',read(S+'/skill-snapshot-pins.json'));write('case.json',{caseId:'iconview-shape-border-form-match-r3',request:'Different Shape and Border forms must produce a violation',inputs,replacement,expected:'Circle/Circle0; Circle/Superellipse1; all3 equal pairs accepted,6 mismatches rejected; false root gates notApplicable; missing Form unknown',scope:'Private candidate only; no shared Editor/core/v4/pilot writes',Ready:false});
[...seal.files,...seal.inputPins].forEach(check);inputs.forEach(check);console.log(JSON.stringify({rules:m.rules.length,active:36,compiledChecks:57,contextOnly:6,retainedReplays:rows.length,syntheticCases:synthetic.length,manualSourceHash:b.compiled.package.manualSourceHash,Ready:false}));
