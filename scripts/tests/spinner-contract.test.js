const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const root=path.join(repo,'experiments/web-core/core/Spinner');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const converter=require('../convert_figma_catalogs_to_contracts');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('contract.manual.json'),generated=read('evidence/contract.generated.json');
const evidence=core.extractVariantEvidence(generated.contracts);

// Synthetic captured values, explicitly independent of any mutated instance.
// Topology and variant identities below come from pinned Athena facts, not guessed names.
function scenario(variant=evidence.variants[0]) {
 const shape=evidence.structures[variant.structureId];
 const nodes=shape.map((n,i)=>{
  const appearance={fill:[],stroke:[],opacity:1,radius:0,effects:[],strokeWeight:0};
  if(n.path.endsWith('Head')) appearance.fill=[{type:'SOLID',visible:true,opacity:1,tokenId:'fixture-token-key',color:{r:3,g:3,b:6}}];
  const layout={mode:'NONE',padding:{top:0,right:0,bottom:0,left:0},itemSpacing:0,primaryAxisAlignItems:'MIN',counterAxisAlignItems:'MIN',sizingHorizontal:'FIXED',sizingVertical:'FIXED'};
  const propertyActivityV1={strokePresent:false,gapApplicable:false,paddingApplicable:false,axisAlignmentApplicable:false};
  const bounds={width:Number(variant.properties.Size),height:Number(variant.properties.Size)};
  return {id:`n${i}`,name:n.path.split(' / ').pop()||'Spinner',
   parentId:n.path?`n${shape.findIndex(p=>p.path===n.path.split(' / ').slice(0,-1).join(' / '))}`:null,
   childIds:[],type:n.path?n.type:'INSTANCE',order:i,visible:true,
   semantic:{role:n.path.replace(/[^a-z0-9]/gi,'-').toLowerCase()||'root',path:['Spinner',n.path].filter(Boolean).join(' / ')},
   component:{properties:{},propertyTypes:{},propertyReferences:[]},appearance,layout,bounds,propertyActivityV1,
   baseline:{effective:{appearance:clone(appearance),layout:clone(layout),bounds:clone(bounds),propertyActivityV1:clone(propertyActivityV1)}},unknownFacts:[]};
 });
 nodes.forEach(n=>{if(n.parentId)nodes.find(p=>p.id===n.parentId).childIds.push(n.id)});
 const root=nodes.find(n=>n.parentId===null);
 root.component={properties:{...variant.properties},propertyTypes:Object.fromEntries(Object.keys(variant.properties).map(k=>[k,'VARIANT'])),propertyReferences:[]};
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-26T00:00:00.000Z',source:{fileName:'synthetic Spinner test',pageId:'p',rootNodeId:root.id,componentKey:variant.componentKey,componentSetKey:variant.componentSetKey,truncated:false,nodeLimit:500},selection:[root.id],context:{platform:'universal',modes:{},unknownFacts:[]},nodes};
 snapshot.variantReference=core.captureVariantReference(snapshot,variant.componentKey,variant.componentSetKey);
 const run=()=>{const compiled=core.compileManualSource(manual,evidence),contract=core.prepareAuthoringPreviewContract(compiled.contract);const engine=core.evaluateCompiledContract(snapshot,contract);return {engine,report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};};
 return {root,nodes,snapshot,run};
}
module.exports={scenario};

test('converter preserves rename-only and explicit-empty variants; absent remains absent',()=>{
 const p=converter.buildRuntimeVariantStructures({empty:[],rename:[{op:'update',id:1,value:{name:'Size=16'}}]});
 assert.deepEqual(p,{empty:[],rename:[{op:'update',id:1,value:{name:'Size=16'}}]});
 assert.equal(p.missing,undefined);
 assert.throws(()=>converter.buildRuntimeVariantStructures({bad:null}));
 assert.throws(()=>converter.buildRuntimeVariantStructures({bad:[{op:'unknown'}]}));
 const add=converter.buildRuntimeVariantStructures({a:[{op:'add',node:{id:2,parentId:1,name:'Child',type:'FRAME'}}]});
 assert.equal(add.a[0].value.name,'Child');
});
test('fresh REST generation proves 12/12; old r1 collision is still rejected, not repaired by inference',()=>{
 assert.equal(generated.contracts[0].figma.variants.variantKeys.length,12);
 assert.equal(evidence.variants.length,12);
 const missing='27dc6ae2903dd50d301c9c01fe009724f1f8cfa9';
 assert.equal(evidence.variants.some(v=>v.componentKey===missing),true);
 const legacy=converter.convertCatalog(read('history/r1/catalog.json'),'legacy').file;
 assert.equal(core.extractVariantEvidence(legacy.contracts).variants.some(v=>v.componentKey===missing),false);
 const coverage=read('reports/generated-facts.json');
 assert.equal(coverage.complete,true);assert.deepEqual(coverage.missingVariants,[]);
 for(const size of ['16','24','48']) assert.ok(evidence.variants.some(v=>v.properties.Size===size&&v.properties.Static==='False'&&v.properties.Inverted==='False'));
});
test('all 12 valid standard variants pass without encoding Button/product constraints',()=>{
 for(const variant of evidence.variants){const f=scenario(variant),before=JSON.stringify(f.snapshot),r=f.run();
  assert.ok(r.engine.evaluations.every(e=>e.classification==='compliant'||e.classification==='not-applicable'),JSON.stringify(r.engine.evaluations.filter(e=>e.classification!=='compliant').slice(0,2)));
  assert.equal(r.report.scenarioCoverage.complete,true);
  assert.equal(r.report.contractReadiness.status,'ready');
  assert.equal(JSON.stringify(f.snapshot),before);
 }
 assert.ok(manual.rules.every(r=>!r.applicability.products?.length&&!r.applicability.channels?.length));
});
test('intrinsic size and paint token identity are independent violations',()=>{
 const f=scenario();f.root.bounds.width+=8;
 let violations=f.run().engine.evaluations.filter(e=>e.classification==='violation');
 assert.equal(violations.length,1);assert.match(violations[0].ruleId,/intrinsic-size-required/);
 const g=scenario(),head=g.nodes.find(n=>n.name==='Head');head.appearance.fill[0].tokenId=null;
 violations=g.run().engine.evaluations.filter(e=>e.classification==='violation');
 assert.equal(violations.length,2);
 assert.ok(violations.some(v=>v.ruleId.includes('layer-properties-use-effective-baseline')));
 assert.ok(violations.some(v=>v.ruleId.includes('visual-style-1')));
});
test('missing baseline/reference, ambiguous identity and structure drift never pass as full checks',()=>{
 for(const mutate of [f=>{delete f.snapshot.variantReference},f=>{delete f.root.baseline},f=>{f.snapshot.source.componentKey='other'},f=>{f.snapshot.source.truncated=true},f=>{f.snapshot.variantReference.nodes[1].path+=' drift'}]){
  const f=scenario();mutate(f);assert.equal(f.run().report.scenarioCoverage.complete,false);
 }
});
test('every compiled variant topology matches fresh Figma REST; r5 retains all six user r4 rules with explicit applicability changes',()=>{
 const manual=read('history/r5/contract.manual.json');
 const response=read('input/athena-rest/response.json'),catalog=read('input/athena-rest/catalog.json');
 const nodes=response.nodes['24:19668'].document.children;
 const shape=(node,p='')=>[{path:p,type:p?node.type:'ROOT'},...(node.children||[]).flatMap(n=>shape(n,[p,n.name].filter(Boolean).join(' / ')))];
 const sorted=a=>a.slice().sort((a,b)=>a.path.localeCompare(b.path)||a.type.localeCompare(b.type));
 for(const v of catalog.components[0].variants){const raw=nodes.find(n=>n.id===v.id);assert.ok(raw);const fact=evidence.variants.find(e=>e.componentKey===v.key);assert.deepEqual(sorted(evidence.structures[fact.structureId]),sorted(shape(raw)));}
 const previous=read('history/r4/contract.manual.json'),r2=read('history/r2/contract.manual.json');
 for(const key of Object.keys(manual).filter(k=>!['source','metadata','rules','decisions'].includes(k)))assert.deepEqual(manual[key],previous[key]);
 assert.deepEqual(manual.source,r2.source);
 assert.deepEqual(manual.decisions.slice(0,-1),previous.decisions);
 assert.equal(manual.decisions.at(-1).id,'spinner.property-applicability-v1');
 assert.deepEqual(manual.rules.map(r=>r.id),previous.rules.map(r=>r.id));
 for(const rule of manual.rules){
  const old=previous.rules.find(r=>r.id===rule.id),actual=clone(rule);
  if(rule.id.endsWith('auto-layout-1')){assert.deepEqual(rule.propertyApplicability,{'layout.itemSpacing':'flow-gap-either@1'});assert.equal(rule.status,'draft');actual.status=old.status;delete actual.propertyApplicability;}
  if(rule.id.endsWith('layer-properties-use-effective-baseline')){assert.deepEqual(rule.propertyApplicability,{'appearance.strokeWeight':'stroke-present-either@1','layout.itemSpacing':'flow-gap-either@1'});delete actual.propertyApplicability;}
  assert.deepEqual(actual,old);
 }
 assert.equal(manual.metadata.revision,5);
});
test('Spinner ZIP imports and export roundtrip preserves manual and evidence without mutation',async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/Spinner.editor-input.zip')));
 const files=entries.map(e=>({name:e.name,text:core.zipEntryText(e)}));
 const loaded=core.importWorkspace(files);
 assert.deepEqual(loaded.manual,manual);assert.equal(loaded.variants.length,12);
 const bundle=core.buildExportBundle(loaded.manual,loaded.variantEvidence);
 assert.equal(bundle.validation.valid,true);assert.equal(bundle.coverage.compiledRules,31);
 assert.equal(core.stableHash(loaded.manual),core.stableHash(manual));
 const fresh=clone(bundle.compiled),accepted=read('compiled/component-contract.v2.json');
 // Keep the accepted r8 package immutable. A newer compiler may change only
 // its provenance stamp; every normative field must still round-trip exactly.
 assert.equal(accepted.package.sourceExportVersion,'component-contract-editor@0.2.33');
 // Accepted child stays immutable; only new compiler provenance advances.
 assert.equal(fresh.package.sourceExportVersion,'component-contract-editor@0.2.37');
 fresh.package.sourceExportVersion=accepted.package.sourceExportVersion;
 assert.deepEqual(fresh,accepted);
});
test('all Athena rule IDs preserved; source snapshots match sha256 inventory; package unpublished',()=>{
 const crypto=require('node:crypto');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
 const inventory=read('reports/source-inventory.json');
 for(const s of inventory.sources)assert.equal(sha(fs.readFileSync(path.join(root,'sources',s.path))),s.sha256);
 assert.equal(read('runtime/component-contract.index.json').published,false);
 assert.deepEqual(read('reports/rule-crosswalk.json').missingAthenaRuleIds,[]);
 assert.equal(read('reports/readiness.json').liveAcceptance,'pending');
 assert.deepEqual(manual.rules.filter(r=>r.status==='draft').map(r=>r.id),[]);
 assert.equal(manual.metadata.revision,8);
 assert.equal(manual.rules.filter(r=>r.status==='reviewed').length,6);
 assert.equal(manual.rules.find(r=>r.id.endsWith('visual-style-1')).status,'reviewed');
});
