const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const W='/Users/alexkukhta/Desktop/workplace',P=W+'/shared/design-system_ab/experiments/current-contract-packages',out=__dirname;
const inventory=JSON.parse(fs.readFileSync(path.join(out,'input-inventory.json'))),wire=v=>JSON.parse(JSON.stringify(v));
for(const p of [...inventory.accepted,...inventory.additionalReadonly]){const b=fs.readFileSync(p.path);assert.equal(b.length,p.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);}
const e=require(W+'/projects/ComponentContractEditor/dist/core.cjs');
const save=(n,v)=>fs.writeFileSync(path.join(out,n),JSON.stringify(v)+'\n',{flag:'wx'});
(async()=>{
 const read=async name=>{const z=await e.readZip(fs.readFileSync(P+'/'+name));return JSON.parse(Buffer.from(z.find(x=>x.name==='compiled/component-contract.v2.json').data));};
 const bg=await read('BackgroundPlate.r6.candidate.component-contract.zip'),parent=JSON.parse(fs.readFileSync(path.join(out,'compiled.json'))),manual=JSON.parse(fs.readFileSync(path.join(out,'contract.manual.json')));
 const bindings=[{kind:'fixed-nested',id:'bg-desktop',targetRole:'root',relativePath:'',ownerComponentSetKeys:['61cba21130d5adfd36b798bb4a41f6ccd148c1aa'],activeVariant:{property:'Background',values:['True']},childPath:'BackgroundPlate / [D][Promo] BackgroundPlate'}, {kind:'fixed-nested',id:'bg-mobile',targetRole:'root',relativePath:'',ownerComponentSetKeys:['88ade0c593a37cf9805f43be9eb82c84d07a56f6'],activeVariant:{property:'Background',values:['True']},childPath:'BackgroundPlate / [M][Promo] BackgroundPlate'}];
 const dependency={id:'background-plate',componentId:bg.package.componentId,revision:6,manualSourceHash:bg.package.manualSourceHash,compiledHash:e.stableHash(bg),bindings,contract:bg};
 const result={kind:'existing-core probes on retained native facts, no native mutation',individualSchemas:[],combinedSchema:[],retained:[],unsupportedCases:{BackgroundFalse:'NOT_RUN: accepted current inputs contain Background=True only; no fabricated matching pristine reference.',freshIconViewActive:'NOT_RUN: current host capture uses Graphic Presets=Image; branch identity readback is separate, not a full capture.'},Ready:false};
 for(const b of bindings){const m=wire(manual);m.componentDependencies.push({...dependency,contract:undefined,bindings:[b]});const issues=e.validateComponentDependencies(m);result.individualSchemas.push({binding:b.id,issues});assert.equal(issues.length,0);}
 const dual=wire(manual);dual.componentDependencies.push({...dependency,contract:undefined});result.combinedSchema=e.validateComponentDependencies(dual);assert.ok(result.combinedSchema.some(i=>i.message==='Duplicate nested subject.'));
 const replay=JSON.parse(fs.readFileSync(path.join(out,'checks/retained-replay.json')));
 for(const input of inventory.accepted.filter(x=>/benefit-card\.validation-report/.test(x.path))){
  const report=JSON.parse(fs.readFileSync(input.path)),snapshot=wire(report.snapshot);
  const resolution=bindings.map(b=>{const r=e.resolveFixedNestedBinding(snapshot,dependency,b,false,parent);return {binding:b.id,status:r.status,reason:r.reason,nodeId:r.nodeId,identityValid:r.identityValid};});
  const active=resolution.filter(r=>r.status==='active');assert.equal(active.length,1);assert.equal(active[0].identityValid,true);
  assert.ok(resolution.some(r=>r.status==='unknown'&&r.reason==='dependency-owner-identity-mismatch'));
  const subject=snapshot.nodes.find(n=>n.id===active[0].nodeId);assert.equal(snapshot.nodes.find(n=>n.id===subject.parentId).type,'FRAME');
  const evaluatedSnapshot=wire(snapshot);evaluatedSnapshot.validationIntent=e.createValidationIntent(evaluatedSnapshot,parent,snapshot.validationIntent.values);
  const evaluated=e.evaluateCompiledContract(evaluatedSnapshot,e.prepareAuthoringPreviewContract(parent));
  const link=parent.componentDependencies.find(d=>d.id==='link'),r=e.resolveFixedNestedBinding(snapshot,link,link.bindings[0],false,parent);assert.equal(r.status,'active');
  const paths=e.snapshotPaths(snapshot),linkPath=paths.get(r.nodeId);
  const differences=replay.find(x=>x.input.path===input.path).changes;
  assert.ok(differences.every(d=>d.ruleId.startsWith('component:web.benefit-card.visuals-follow-effective-baseline.')&&(paths.get(d.subjectNodeId)===linkPath||paths.get(d.subjectNodeId)?.startsWith(linkPath+' / '))));
  const run=evaluated.dependencyRuns.find(d=>d.dependencyId==='link');assert.equal(run.status,'incomplete');
  result.retained.push({input,platform:snapshot.context.platform,backgroundResolutions:resolution,intermediateType:'FRAME',ownerBoundaryChanges:{count:differences.length,allWithinValidatedLinkCapture:true,onlyExplicitlyOptedInVisualRule:true,childRunStatus:run.status,parentLinkUsageTruth:'unknown preserved'},nativeLive:'NOT_RUN'});
 }
 save('checks/existing-fixed-nested-probe.json',result);
 const native=JSON.parse(fs.readFileSync(path.join(out,'inputs/native/benefit-card-completion-2026-10-17-native-iconview-branches.json')));
 const branches=JSON.parse(native.content.find(c=>c.type==='text').text).rows,icon=parent.componentDependencies.find(d=>d.id==='icon-view');
 assert.equal(branches.length,2);
 for(const row of branches){assert.ok(icon.bindings[0].ownerComponentSetKeys.includes(row.graphicOwnerKey));assert.equal(row.graphicVariant.properties.Presets,'IconView');assert.equal(row.iconViews.length,1);assert.ok(icon.contract.facts.representations.some(r=>r.locator.componentSetKey===row.iconViews[0].owner.key));}
 save('checks/iconview-identity-correspondence.json',{status:'PASS_IDENTITY_READBACK_ONLY',branches:branches.map(row=>({root:row.root,graphicOwnerKey:row.graphicOwnerKey,selectedBranchKey:row.graphicVariant.key,childKey:row.iconViews[0].main.key,childSetKey:row.iconViews[0].owner.key,Size:row.iconViews[0].properties.Size.value})),notProven:'Full active host capture and child runtime validation require native Editor reports.',Ready:false});
 console.log(JSON.stringify({retained:result.retained.length,individualRoutes:'active with exact BG identity',combinedRoute:'validator refuses duplicate subject; other platform UNKNOWN',Ready:false}));
})().catch(error=>{const file=path.join(out,'checks/FIRST-BINDING-PROBE-FAILURE.json');if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify({error:error.stack,Ready:false})+'\n');console.error(error.stack);process.exitCode=1;});
