const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),m=read('history/r30-editor-0.2.52/contract.manual.json'),c=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r30-editor-0.2.52/component-contract.v2.json.gz'))));
const old=read('history/r29-editor-0.2.51/contract.manual.json'),oldC=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r29-editor-0.2.51/component-contract.v2.json.gz'))));
const changed=['component:web-core.button.loading-spinner-style-follows-view','component:web-core.button.backdrop-blur-maps-to-control-blur'];
test('r30 changes only the two accepted RuleIDs; rules remain component-scoped and unpublished',()=>{
 assert.equal(m.metadata.revision,30);assert.equal(m.rules.length,22);assert.equal(c.rules.length,60);assert.equal(c.nonExecutableRules.length,0);assert.equal(c.status,'draft');
 assert.deepEqual(m.rules.map(r=>r.id),old.rules.map(r=>r.id));assert.deepEqual(m.rules.filter(r=>!changed.includes(r.id)),old.rules.filter(r=>!changed.includes(r.id)));
 assert.deepEqual(c.coverage.byOwnership,{component:22,usage:0,unclassified:0});assert.equal(c.coverage.byExecutionRoute['context-only'],undefined);
 assert.equal(read('runtime/component-contract.index.json').published,false);
});
test('Athena facts, pinned Spinner, and independently archived r29 compile identically',()=>{
 assert.deepEqual(c.facts.variantEvidence,oldC.facts.variantEvidence);assert.deepEqual(c.componentDependencies,oldC.componentDependencies);
 for(const [manual,compiled] of [[m,c],[old,oldC]])assert.equal(core.stableHash(core.compileManualSource(manual,compiled.facts.variantEvidence,[compiled.componentDependencies[0].contract]).contract),core.stableHash(compiled));
 assert.equal(c.package.sourceExportVersion,'component-contract-editor@0.2.52');
});
test('ControlBlur owner decision selects exact library variant; previous disabled generalization is not executable',()=>{
 const r=m.rules.find(r=>r.id===changed[1]);assert.deepEqual(r.constraints,[{type:'propertyForbidden',fact:'appearance.effectDetailsV1'}]);
 assert.deepEqual(r.applicability,{variants:'all',modes:'all',platforms:['desktop','mobile-web']});
 const ir=c.rules.find(r=>r.source.anchor===changed[1]);assert.equal(ir.assert.predicate,'matches-effective-baseline');
 assert.equal(ir.assert.expected.fact,'baseline.effective.appearance.effectDetailsV1');assert.equal(ir.assert.missingPolicy,'unknown');
 assert.equal(m.decisions.find(d=>d.id==='decision:core.web.button.control-blur-library-baseline').status,'accepted');
});
test('r30 schemas accept typed case contexts; wrong shape is rejected',async()=>{
 const {validateJsonSchema}=await import('../../../../ds-ai-hub/tools/lib/json-schema-lite.mjs');
 const schema=JSON.parse(fs.readFileSync(path.resolve(root,'../../../schemas/apollo-component-contract-manual-v2.schema.json')));
 assert.deepEqual(validateJsonSchema(m,schema),[]);
 const bad=structuredClone(m);bad.rules.find(r=>r.id===changed[0]).constraints[0].dependency.cases[0].context=[];
 assert.ok(validateJsonSchema(bad,schema).length);
});
test('archived r30 ZIP preserves the two accepted manual rules without parallel IDs',async()=>{
 const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r30-editor-0.2.52/Button.editor-input.zip'))));
 const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(w.manual,m);assert.equal(core.stableHash(core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts).compiled),core.stableHash(c));
});
