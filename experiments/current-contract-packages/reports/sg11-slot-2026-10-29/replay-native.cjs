const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),crypto=require('crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.resolve(A,'../..'),B=path.join(W,'projects/Apollo');
const window=JSON.parse(fs.readFileSync(W+'/.local/apollo-general-coordination-2026-10-25/sg11-native-slot-B-WRITER-2026-10-29.json')),RT=window.P.immutableRuntime.root;
const core=require(RT+'/packages/component-contract-core/dist/core.cjs'),rt=require(RT+'/dist/runtime.cjs'),read=p=>JSON.parse(fs.readFileSync(p));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sg11-native-'));
require(B+'/node_modules/esbuild').buildSync({entryPoints:[B+'/src/native-slot-diagnostics.ts'],outfile:temp+'/native.cjs',bundle:true,platform:'node',format:'cjs',logLevel:'silent'});
const {scopeNativeSlotCaptureWarnings:scope}=require(temp+'/native.cjs');fs.rmSync(temp,{recursive:true});
const report=read('/Users/alexkukhta/Downloads/apollo-v4-554dec2a439d.json'),base=A+'/experiments/current-contract-packages/reports/nested136-data-2026-10-29/checking46/',manifest=read(base+'manifest.json');
const contracts=new Map(manifest.contracts.map(e=>[e.componentId,rt.loadAuthoringSource(read(base+e.file),{evaluationMode:'authoring-preview'}).contract]));
const sig=x=>x.filter(e=>!['compliant','not-applicable'].includes(e.classification)).map(e=>e.classification+'|'+e.ruleId+'|'+e.subjectNodeId).sort();
const rows=[],owners=new Map();let findings=0,removedWarnings=0;
for(const c of report.components){
 const contract=contracts.get(c.release.contractId);let ownerContext;
 if(c.release.contractId==='web-core.segment'){
  const parent=report.components.find(p=>p.scopeId===c.scopeId.slice(1).split(';')[0]);assert(parent);
  const id=c.scopeId.split(';').slice(1).join(';'),hosts=parent.snapshot.nodes.filter(n=>n.type==='INSTANCE'&&n.component?.sourceIdentity?.sourceNodeId===id&&n.component?.identity?.componentKey===c.snapshot.source.componentKey);assert.equal(hosts.length,1);
  const host=hosts[0],hp=core.snapshotPaths(parent.snapshot),cp=core.snapshotPaths(c.snapshot),prefix=hp.get(host.id),subtree=new Set();function visit(id){subtree.add(id);for(const child of parent.snapshot.nodes.find(n=>n.id===id).childIds)visit(child);}visit(host.id);
  const nodeMap={};for(const child of c.snapshot.nodes){const hits=parent.snapshot.nodes.filter(n=>subtree.has(n.id)&&(n.id===host.id?'':hp.get(n.id).slice(prefix.length+3))===cp.get(child.id));assert.equal(hits.length,1);nodeMap[child.id]=hits[0].id;}
  ownerContext={snapshot:parent.snapshot,contract:contracts.get(parent.release.contractId),nodeId:host.id,nodeMap,evaluationMode:'authoring-preview'};
 }
 if(ownerContext)owners.set(c.scopeId,ownerContext);
 const before=JSON.stringify(c.snapshot),audit=rt.auditContractSnapshot(c.snapshot,contract,{evaluationMode:'authoring-preview'},ownerContext);assert(audit.coverage.executionComplete,c.name);assert.equal(audit.coverage.uncertain,0);assert.deepEqual(sig(audit.engine.evaluations),sig(c.result.engine.evaluations),c.name);
 const captured={snapshot:c.snapshot,warnings:c.baselineDiagnostics.rawWarnings,unmatchedBaselineNodeIds:c.baselineDiagnostics.rawUnmatchedBaselineNodeIds,baselineDiagnostics:c.baselineDiagnostics.producer};
 const scoped=scope(captured);assert.equal(JSON.stringify(c.snapshot),before);
 if(c.name.startsWith('SG-11')){assert.equal(c.warnings.length,1);assert.deepEqual(scoped.warnings,[]);assert.deepEqual(scoped.baselineDiagnostics.externalSlotPayloadNodeIds,['preview:5']);removedWarnings++;}else assert.deepEqual(scoped.warnings,c.warnings,c.name);
 findings+=sig(audit.engine.evaluations).length;rows.push({scopeId:c.scopeId,name:c.name,ownerContext:Boolean(ownerContext),complete:true,significant:sig(audit.engine.evaluations),warningsAfter:scoped.warnings});
}
assert.equal(rows.length,56);assert.equal(findings,12);assert.equal(removedWarnings,1);assert.equal(rows.filter(r=>r.ownerContext).length,30);
const sg=report.components.find(c=>c.name.startsWith('SG-11')),negatives=[];
for(const id of ['preview:0','preview:1','preview:3']){
 let result,subject=id;
 if(id==='preview:0'){const s=structuredClone(sg.snapshot);s.nodes.find(n=>n.id===id).appearance.opacity=.37;result=rt.auditContractSnapshot(s,contracts.get(sg.release.contractId),{evaluationMode:'authoring-preview'});}
 else{const child=report.components.find(c=>c.scopeId.startsWith('I'+sg.scopeId+';')&&owners.get(c.scopeId)?.nodeMap&&Object.values(owners.get(c.scopeId).nodeMap).includes(id));assert(child);const ctx=owners.get(child.scopeId),cs=structuredClone(child.snapshot),ps=structuredClone(ctx.snapshot);subject=Object.keys(ctx.nodeMap).find(k=>ctx.nodeMap[k]===id);cs.nodes.find(n=>n.id===subject).appearance.opacity=.37;ps.nodes.find(n=>n.id===id).appearance.opacity=.37;result=rt.auditContractSnapshot(cs,contracts.get(child.release.contractId),{evaluationMode:'authoring-preview'},{...ctx,snapshot:ps});}
 assert(result.engine.evaluations.some(e=>e.subjectNodeId===subject&&e.classification==='violation'&&e.ruleId.endsWith('.1.13')),id);negatives.push({groupNodeId:id,checkedNodeId:subject,mutation:'opacity=.37',violationRetained:true});
}
const out={status:'PASS_NATIVE_ONLY_DIAGNOSTICS_REPLAY',runtimeId:window.P.immutableRuntime.id,roots:rows,significant:findings,unknown:0,warningsRemoved:removedWarnings,originalSnapshotsUnchanged:true,parentSegmentOwnerContextValidated:30,baselineNegatives:negatives,canonicalDataChanges:0,freshFigma:'NOT_RUN_USER_ONLY'};
fs.writeFileSync(R+'/NATIVE-REPLAY.json',JSON.stringify(out)+'\n');console.log(JSON.stringify({roots:rows.length,violations:findings,unknown:0,warningsRemoved:removedWarnings,ownerContexts:30,baselineNegatives:3}));
