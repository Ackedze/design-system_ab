const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../..'),root=path.join(repo,'experiments/web-core/core/Amount/authoring');
const core=require(path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const manual=read('contract.manual.json'),generated=read('evidence/contract.generated.json');
const evidence=core.extractVariantEvidence(generated.contracts),key=manual.component.componentKey;
evidence.textStyleCatalogs=core.extractTextStyleCatalogs([{name:'Web _ Typography.json',data:read('sources/design-system_ab/JSONS/styles/Web _ Typography.json')}]);
const response=read('sources/design-system_ab/experiments/web-core/core/Amount/input/athena-rest/response.json');
const rawRoot=response.nodes['485:67101'].document;
const meta=Object.assign({},...Object.values(response.nodes).map(r=>r.components||{}));
const sets=Object.assign({},...Object.values(response.nodes).map(r=>r.componentSets||{}));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');

// Offline fixtures: pinned REST topology and independent baseline, not a live Editor report.
function scenario(){
 const nodes=[];
 function walk(raw,parentId=null,p='Amount'){
  const properties={},propertyTypes={};
  for(const [name,v] of Object.entries(raw.componentProperties||raw.componentPropertyDefinitions||{})){
   properties[name]=v.value??v.defaultValue;propertyTypes[name]=v.type;
  }
  const own=parentId===null?{key}:meta[raw.componentId];
  const identity=own?{componentKey:own.key,...(sets[own.componentSetId]?.key?{componentSetKey:sets[own.componentSetId].key}:{})}:undefined;
  const layout={mode:raw.layoutMode||'NONE',padding:{top:raw.paddingTop||0,right:raw.paddingRight||0,bottom:raw.paddingBottom||0,left:raw.paddingLeft||0},itemSpacing:raw.itemSpacing||0,primaryAxisAlignItems:raw.primaryAxisAlignItems||'MIN',counterAxisAlignItems:raw.counterAxisAlignItems||'MIN'};
  const paints=values=>(values||[]).map(p=>({...clone(p),visible:p.visible!==false,opacity:p.opacity??1,tokenId:p.boundVariables?.color?.id||null}));
  const appearance={fill:paints(raw.fills),stroke:paints(raw.strokes),opacity:raw.opacity??1,radius:raw.cornerRadius||0,effects:clone(raw.effects||[])};
  if(raw.type==='TEXT') appearance.typography={styleId:'S:'+response.nodes['485:67101'].styles[raw.styles.text].key+',local-copy'};
  const propertyActivityV1={strokePresent:!!raw.strokes?.length,gapApplicable:!!raw.layoutMode&&(raw.children||[]).filter(c=>c.visible!==false).length>=2,paddingApplicable:!!raw.layoutMode,axisAlignmentApplicable:!!raw.layoutMode};
  const n={id:raw.id,parentId,name:raw.name,type:parentId===null?'INSTANCE':raw.type,order:parentId?nodes.find(n=>n.id===parentId).childIds.length:0,childIds:[],visible:raw.visible!==false,
   semantic:{path:p,role:''},component:{properties,propertyTypes,propertyReferences:Object.values(raw.componentPropertyReferences||{}),...(identity?{identity}:{})},
   appearance,layout,propertyActivityV1,paintEvidenceV1:{fill:true,stroke:true},text:{characters:raw.characters||'',fontSize:raw.style?.fontSize||16},bounds:{width:raw.absoluteBoundingBox?.width||1,height:raw.absoluteBoundingBox?.height||1},unknownFacts:[],
   baseline:{effective:{appearance:clone(appearance),layout:clone(layout),propertyActivityV1:clone(propertyActivityV1)}},baselineProvenance:{status:'matched',referencePath:p.split(' / ').slice(1).join(' / ')}};
  if(parentId)nodes.find(n=>n.id===parentId).childIds.push(raw.id);
  nodes.push(n);for(const child of raw.children||[])walk(child,raw.id,p+' / '+child.name);
 }
 walk(rawRoot);
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-29T00:00:00Z',source:{fileName:'Amount offline fixture',pageId:'p',rootNodeId:rawRoot.id,componentKey:key,componentSetKey:'',instanceIdentityVersion:1,truncated:false,nodeLimit:500},selection:[rawRoot.id],context:{platform:'universal',modes:{},unknownFacts:[]},nodes};
 snapshot.variantReference=core.captureVariantReference(snapshot,key,'',Object.keys(nodes[0].component.properties));
 const node=role=>nodes.find(n=>n.semantic.path==='Amount'+(role?' / '+role:''));
 const compiled=core.compileManualSource(manual,evidence);
 const run=()=>{const engine=core.evaluateCompiledContract(snapshot,core.prepareAuthoringPreviewContract(compiled.contract));return {engine,report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};};
 return {nodes,snapshot,node,run};
}
const violations=r=>r.engine.evaluations.filter(e=>e.classification==='violation');
test('r4 compiles but remains Draft, no excluded rules',()=>{
 const r=core.compileManualSource(manual,evidence);assert.deepEqual(r.issues,[]);assert.equal(r.contract.status,'draft');assert.equal(r.contract.rules.length,47);assert.equal(r.contract.nonExecutableRules.length,0);assert.equal(manual.rules.length,31);assert.ok(manual.rules.every(r=>r.status==='draft'));
});
test('23 proven library variants; only Amount is a root',()=>{
 assert.equal(evidence.variants.length,23);assert.equal(read('reports/generated-facts.json').complete,true);const c=core.compileManualSource(manual,evidence).contract;assert.equal(c.facts.variantEvidence.variants.length,1);assert.deepEqual(c.facts.variantEvidence.variants[0].properties,{});
});
test('standalone Amount/Major facts match real Figma identity, not a synthetic set',()=>{
 const f=scenario();assert.equal(rawRoot.type,'COMPONENT');
 assert.equal(manual.representations[0].locator.componentSetKey,undefined);
 assert.equal(core.resolveCaptureRepresentation(manual.representations,key,'').id,manual.representations[0].id);
 assert.equal(f.node('').component.identity.componentSetKey,undefined);
 assert.equal(f.node('Major').component.identity.componentSetKey,undefined);
 assert.ok(manual.rules.find(r=>r.id.endsWith('major-library-part-required')).constraints.some(c=>c.fact==='component.identity.componentKey'));
 assert.equal(core.prepareValidationSnapshot(f.snapshot,core.compileManualSource(manual,evidence).contract).nodes[0].variantAvailability.status,'verified');
});
test('preview omitted set and selected-instance empty set both verify; capture facts remain unchanged',()=>{
 for(const set of [undefined,'']){const f=scenario();f.snapshot.source.componentSetKey=set;const before=JSON.stringify(f.snapshot);assert.equal(f.run().report.scenarioCoverage.complete,true);assert.equal(JSON.stringify(f.snapshot),before);}
});
test('standalone support never accepts a fabricated set, foreign key or reference identity mismatch',()=>{
 for(const mutate of [f=>f.snapshot.source.componentSetKey='unexpected-set',f=>f.snapshot.variantReference.componentKey='foreign',f=>f.snapshot.variantReference.componentSetKey=key]){const f=scenario();mutate(f);assert.equal(f.run().report.scenarioCoverage.complete,false);}
 assert.throws(()=>core.resolveCaptureRepresentation(manual.representations,'foreign',''));
 const wrong=clone(manual);wrong.representations[0].locator.componentSetKey=key;
 assert.throws(()=>core.resolveCaptureRepresentation(wrong.representations,key,''));
 assert.ok(core.compileManualSource(wrong,evidence).issues.some(i=>i.code==='STANDALONE_COMPONENT_AS_SET'));
});
test('independent library fixture passes included checks',()=>{
 const r=scenario().run();assert.deepEqual(violations(r),[]);assert.equal(r.report.scenarioCoverage.complete,true,JSON.stringify(r.report.scenarioCoverage));assert.equal(r.report.contractReadiness.status,'draft');
});
test('all eight visibility combinations checked; visible unswapped Addon is now an error',()=>{
 for(let mask=0;mask<8;mask++){const f=scenario();['Minor','Currency','Addon'].forEach((name,i)=>{const v=Boolean(mask&(1<<i)),key=Object.keys(f.node('').component.properties).find(k=>k.startsWith(name+'#'));assert(key);f.node('').component.properties[key]=v;f.node(name).visible=v;});const r=f.run();assert.deepEqual(violations(r).map(e=>e.ruleId),mask&4?['component:web-core.amount.addon-content-is-configurable.1.2']:[],String(mask));assert.equal(r.report.scenarioCoverage.complete,true,JSON.stringify({mask,coverage:r.report.scenarioCoverage,uncertain:r.engine.evaluations.filter(e=>!['compliant','not-applicable'].includes(e.classification)).map(e=>({id:e.ruleId,reason:e.trace?.reason,classification:e.classification}))}));}
});
test('Currency/Opacity variants are not universal product prohibitions',()=>{
 const currency=generated.contracts.find(c=>c.componentKey==='33bfa9e278712759a5ea601d87135003599c98f2');
 for(const v of currency.figma.variants.variantKeys)for(const opacity of ['True','False']){const f=scenario();Object.assign(f.node('Currency').component.properties,v.properties);f.node('Currency').component.identity.componentKey=v.key;f.node('Currency / Currency').text.characters=evidence.libraryText.find(e=>e.componentKey===v.key).characters.Currency;f.node('Minor').component.properties.Opacity=opacity;f.snapshot.context.product='ab';assert.deepEqual(violations(f.run()),[]);}
});
test('text, Text Style and content-dependent dimensions stay editable',()=>{
 const f=scenario(),n=f.node('Major / Major');n.text.characters='123 456 789';n.text.fontSize=32;n.appearance.typography.styleId='S:'+evidence.textStyleCatalogs[0].styles[0].key+',local-copy';n.bounds.width=250;f.node('').bounds.width=300;assert.deepEqual(violations(f.run()),[]);
});
test('hidden Major violates a visible Amount, hidden root does not',()=>{
 const f=scenario();f.node('Major').visible=false;assert.ok(violations(f.run()).some(e=>e.ruleId.includes('major-required')));const g=scenario();g.node('').visible=false;assert.deepEqual(violations(g.run()),[]);
});
test('each visibility mismatch caught both ways',()=>{
 for(const part of ['Minor','Currency','Addon'])for(const enabled of [false,true]){const f=scenario(),key=Object.keys(f.node('').component.properties).find(k=>k.startsWith(part+'#'));assert(key);f.node('').component.properties[key]=enabled;f.node(part).visible=!enabled;assert.ok(violations(f.run()).some(e=>e.ruleId.includes(part.toLowerCase()+'-visibility-')),part+enabled);}
});
test('changed part order cannot pass',()=>{
 const f=scenario(),root=f.node('');root.childIds.reverse();root.childIds.forEach((id,i)=>f.nodes.find(n=>n.id===id).order=i);const r=f.run();assert.ok(violations(r).some(e=>e.ruleId.includes('fixed-part-order'))||!r.report.scenarioCoverage.complete);
});
test('substituted same-name internal component cannot pass',()=>{
 for(const name of ['Major','Minor','Currency']){const f=scenario();f.node(name).component.identity[name==='Major'?'componentKey':'componentSetKey']='other';const r=f.run();assert.ok(violations(r).length||!r.report.scenarioCoverage.complete,name);}
});
test('changed root gap violates independent baseline',()=>{
 const f=scenario();f.node('').layout.itemSpacing=8;assert.ok(violations(f.run()).some(e=>e.ruleId.includes('layer-properties-use-effective-baseline')));
});
test('missing evidence never becomes a complete check',()=>{
 for(const mutate of [f=>delete f.snapshot.variantReference,f=>delete f.node('').baseline,f=>f.snapshot.source.componentKey='other',f=>f.snapshot.source.truncated=true]){const f=scenario();mutate(f);assert.equal(f.run().report.scenarioCoverage.complete,false);}
});
test('deterministic evaluation preserves manual and snapshot',()=>{
 const f=scenario(),before=JSON.stringify(f.snapshot),source=JSON.stringify(manual);assert.deepEqual(f.run(),f.run());assert.equal(JSON.stringify(f.snapshot),before);assert.equal(JSON.stringify(manual),source);
});
test('Editor ZIP roundtrip retains manual and exact compiled output',async()=>{
 const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/Amount.editor-input.zip')));const imported=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));assert.deepEqual(imported.manual,manual);assert.deepEqual(clone(core.buildExportBundle(imported.manual,imported.variantEvidence).compiled),read('compiled/component-contract.v2.json'));
});
test('source hashes and four legacy IDs accounted for; no product rule in component',()=>{
 for(const s of read('reports/source-inventory.json').sources)assert.equal(sha(fs.readFileSync(path.join(root,'sources',s.path))),s.sha256);const cross=read('reports/rule-crosswalk.json');assert.deepEqual(cross.missingAthenaRuleIds,[]);assert.equal(cross.relocatedRules.length,2);assert.ok(manual.rules.every(r=>r.ownership.kind==='component'&&!r.applicability.products.length&&!r.applicability.channels.length));assert.equal(read('runtime/component-contract.index.json').published,false);
});
test('legacy runtime is byte-identical and not routed to the authoring package',()=>{
 const legacy=path.dirname(root),m=JSON.parse(fs.readFileSync(path.join(legacy,'history/pre-manual-v2/manifest.json')));for(const s of m.files.filter(s=>s.path!=='README.md'))assert.equal(sha(fs.readFileSync(path.join(legacy,s.path))),s.sha256);const idx=JSON.parse(fs.readFileSync(path.join(repo,'experiments/runtime-index.json')));assert.equal(idx.packages.find(p=>p.id==='web-core.amount').contractPath,'web-core/core/Amount/compiled/component-contract.v2.json');
});
