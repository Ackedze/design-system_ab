const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {root,W,pin,guard}=require('./guard.cjs');
const fixture=W+'/projects/Apollo-v3/packages/component-contract-core/tests/helpers/native-occurrence-capture.cjs';
const {runNativeOccurrenceCapture}=require(fixture);
const original=fs.readFileSync(root+'/compact-receipt.js','utf8').split('\n').find(l=>l.includes("'HIDDEN_TOPOLOGY_INCOMPLETE'"));
const corrected=fs.readFileSync(root+'/compact-receipt-r3.js','utf8').split('\n').find(l=>l.includes("'HIDDEN_TOPOLOGY_INCOMPLETE'"));
const check=(ok,reason)=>assert.ok(ok,reason),run=line=>new Function('snapshot','anatomy','nativeNodeIds','check',line);
const oldGuard=run(original),newGuard=run(corrected);
(async()=>{
 const before=guard('id-bridge331-before');let evidence;
 await runNativeOccurrenceCapture(async(figma,actual)=>{
  actual.children[1].children[0].visible=false;
  const context={figma,Uint8Array,TextEncoder};vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/collector.js','utf8'),context);
  const collected=await context.BenefitCardCapture.collectNodes(actual,'desktop',{});
  const native=[];function visit(n){native.push(n);for(const c of n.children||[])visit(c);}visit(actual);
  const snapshot=JSON.parse(JSON.stringify(collected.snapshot)),anatomy=JSON.parse(JSON.stringify(collected.anatomy)),ids=native.map(n=>n.id);
  assert.equal(snapshot.source.captureTopology.complete,true);assert.equal(snapshot.source.truncated,false);assert.equal(snapshot.nodes.length,9);
  assert.match(ids[0],/^\d+:\d+$/);assert.ok(ids.some(id=>/^I\d+:\d+;/.test(id)));assert.ok(snapshot.nodes.every(n=>/^preview:\d+$/.test(n.id)));
  assert.throws(()=>oldGuard(snapshot,anatomy,ids,check),/HIDDEN_TOPOLOGY_INCOMPLETE/);newGuard(snapshot,anatomy,ids,check);
  const hidden=anatomy.filter(n=>n.visible===false);assert.equal(hidden.length,1);assert.ok(hidden.every(n=>snapshot.nodes.some(x=>x.id===n.id)&&ids.includes(n.figmaNodeId)));
  let refused=0;for(const mutation of [x=>x.anatomy.pop(),x=>x.anatomy[1].figmaNodeId=x.anatomy[0].figmaNodeId,x=>x.anatomy[1].figmaNodeId='999:foreign',x=>x.anatomy[0].id='preview:999',x=>x.snapshot.nodes.pop(),x=>x.ids.pop(),x=>{const h=x.anatomy.find(n=>n.visible===false);x.anatomy=x.anatomy.filter(n=>n!==h);},x=>{const h=x.anatomy.find(n=>n.visible===false);x.ids=x.ids.filter(id=>id!==h.figmaNodeId);},x=>x.snapshot.nodes[1].id=x.snapshot.nodes[0].id]){const x=JSON.parse(JSON.stringify({snapshot,anatomy,ids}));mutation(x);assert.throws(()=>newGuard(x.snapshot,x.anatomy,x.ids,check),/HIDDEN_TOPOLOGY_INCOMPLETE/);refused++;}
  evidence={status:'PASS_UNCHANGED_CANONICAL_COLLECTOR_OUTPUT',fixture:pin(fixture),collector:pin(root+'/collector.js'),oldGuardReproducedFailure:true,newGuardAcceptedActualNamespaces:true,nativeIds:ids,anatomyMappings:anatomy.map(n=>({id:n.id,figmaNodeId:n.figmaNodeId,type:n.type,visible:n.visible})),snapshotIds:snapshot.nodes.map(n=>n.id),hiddenNodes:1,negativeCases:refused,canonicalSnapshotHash:context.BenefitCardCapture.stableHash(collected.snapshot),nativeCalls:0,Ready:false};
  return collected;
 });
 evidence.before=before;evidence.after=guard('id-bridge331-after');evidence.driver=pin(__filename);const out=root+'/ID-BRIDGE331-REGRESSION.json';fs.writeFileSync(out,JSON.stringify(evidence)+'\n',{flag:'wx'});console.log(JSON.stringify({status:evidence.status,report:pin(out),negativeCases:evidence.negativeCases,hiddenNodes:1}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
