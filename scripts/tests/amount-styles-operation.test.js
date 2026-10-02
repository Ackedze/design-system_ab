const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-corp/AmountStyles/authoring'),core=require(path.resolve(__dirname,'../../../../projects/ComponentContractEditor/dist/core.cjs'));
const compiled=require(path.join(root,'compiled/component-contract.v2.json')),manual=require(path.join(root,'contract.manual.json')),runtime=core.prepareAuthoringPreviewContract(compiled),clone=x=>JSON.parse(JSON.stringify(x));
const fixture=()=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures/r6-editor-0.2.63/amount-styles.validation-report.2026-09-29T20-35-50-483Z.json.gz')))).snapshot;
const check=(s,c=runtime)=>core.evaluateCompiledContract(s,c).evaluations.filter(e=>e.ruleId.includes('math-minus-is-required'));
function plus(){
 const s=fixture(),reference=clone(s.instanceContentReferences.base),variant=compiled.facts.variantEvidence.libraryText.find(v=>v.properties.Negative==='False');
 reference.source.rootNodeId='synthetic-operation-plus-reference';
 for(const x of [s,reference]){x.nodes[1].component.properties.Negative='False';x.nodes[1].component.identity.componentKey=variant.componentKey;x.nodes[1].component.identity.mainComponentId='synthetic-plus-master';x.nodes[2].text.characters=variant.characters.Minus;}
 s.instanceContentReferences.attempts.unshift({boundaryNodeId:'preview:1',strategy:'pristine-host-variant-properties',reference});return s;
}
test('both internal Operation variants retain exact pinned library text; not public roots',()=>{
 const variants=compiled.facts.variantEvidence.libraryText.filter(v=>v.componentSetKey==='576418aee5b143662e51e4d8f27d6fcbd57dc540');assert.equal(variants.length,2);
 assert.deepEqual(variants.map(v=>[v.properties.Negative,v.characters.Minus]).sort(),[['False','+'],['True','−']]);
 assert.equal(manual.representations.length,3);assert.equal(manual.rules.find(r=>r.id.endsWith('operation-negative-is-part-property')).execution.route,'policy-only');
 assert.equal(manual.rules.find(r=>r.id.endsWith('math-minus-is-required')).constraints[0].textNormalization,undefined);
});
for(const [negative,create,expected] of [['True',fixture,'−'],['False',plus,'+']]){
 test(`native Negative=${negative} passes selected-key reference`,()=>{const s=create(),raw=JSON.stringify(s),e=check(s);assert.equal(e.length,1);assert.equal(e[0].classification,'compliant');assert.equal(e[0].trace.expected,expected);assert.equal(JSON.stringify(s),raw);const p=core.prepareValidationSnapshot(s,runtime);assert.deepEqual(core.prepareValidationSnapshot(p,runtime),p);});
 for(const text of ['-','—','±','',expected+' ',negative==='True'?'+':'−'])test(`Negative=${negative} manual text ${JSON.stringify(text)} fails`,()=>{const s=create();s.nodes[2].text.characters=text;assert.equal(check(s)[0].classification,'violation');});
 test(`Negative=${negative} hidden Operation skips text rule`,()=>{const s=create();s.nodes[0].component.properties['Operation#57377:0']=false;s.nodes[1].visible=false;s.nodes[2].text.characters='manual';assert.equal(check(s)[0].classification,'not-applicable');});
}
for(const [name,mutate] of [
 ['unknown identity',s=>s.nodes[1].unknownFacts.push('component.identity.componentKey')],
 ['unknown Negative',s=>s.nodes[1].unknownFacts.push('component.properties.Negative')],
 ['unavailable text capture',s=>{delete s.nodes[2].text.characters;s.nodes[2].unknownFacts.push('text.characters');}],
 ['wrong family',s=>s.nodes[1].component.identity.componentSetKey='foreign'],
 ['missing independent reference',s=>s.instanceContentReferences.attempts.shift()],
])test('Operation cannot pass missing evidence: '+name,()=>{const s=plus();mutate(s);const e=check(s);assert(e.length>0);assert(!e.some(v=>v.classification==='compliant'));assert(e.some(v=>v.classification==='human-review'));});
test('a cached or contaminated reference cannot turn actual custom text into expected',()=>{const s=plus();s.nodes[2].text.characters='tampered';s.instanceContentReferences.attempts[0].reference.nodes[2].text.characters='tampered';s.nodes[2].libraryTextV1={characters:'tampered'};const e=check(s)[0];assert.notEqual(e.classification,'compliant');});
test('unknown library text stays incomplete even when live reference exists',()=>{const c=clone(runtime);delete c.facts.variantEvidence.libraryText;assert.equal(check(fixture(),c)[0].classification,'human-review');});
test('40 immutable reports retain exact old replay and all existing verdicts',()=>assert.equal(require('../review_amount_styles_r7').review().results.length,40));
