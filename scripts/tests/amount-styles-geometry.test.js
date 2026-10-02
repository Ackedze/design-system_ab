const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../experiments/web-corp/AmountStyles/authoring'),core=require(path.resolve(__dirname,'../../../../projects/ComponentContractEditor/dist/core.cjs'));
const compiled=require(path.join(root,'compiled/component-contract.v2.json')),manual=require(path.join(root,'contract.manual.json')),runtime=core.prepareAuthoringPreviewContract(compiled);
const id='component:web-corp.amount-styles.geometry-follows-effective-baseline';
const fixture=()=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures/r7-editor-0.2.63/amount-styles.validation-report.2026-09-30T05-56-48-842Z.json.gz')))).snapshot;
const check=s=>core.evaluateCompiledContract(s,runtime).evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
const failures=s=>check(s).filter(e=>['violation','human-review'].includes(e.classification));
// Synthetic mutations must mirror the same actual evidence in the independently
// captured child. A stale child capture is correctly rejected by the runtime.
function syncChildActual(s){for(const c of s.componentDependencyCaptures||[])for(const n of c.snapshot.nodes){const host=s.nodes.find(h=>h.id===c.nodeMap[n.id]);for(const field of ['layout','appearance','text','bounds','visible'])if(field in host)n[field]=JSON.parse(JSON.stringify(host[field]));}}
test('geometry has a finite editable fact list, native gates and explicit dependency boundary',()=>{
 const r=manual.rules.find(r=>r.id===id);assert.equal(r.execution.route,'predicate');assert.equal(r.boundaryPolicy,'component-owned@1');assert.equal(r.constraints.length,8);
 assert(!r.constraints.some(c=>/bounds|sizing|wrap|clip|text/.test(c.fact)));
 assert.equal(compiled.customizationPolicy.find(r=>r.id===id).boundaryPolicy,'component-owned@1');
});
test('captured native plus is clean and evaluation does not mutate evidence',()=>{const s=fixture(),raw=JSON.stringify(s);assert.deepEqual(failures(s),[]);assert.equal(JSON.stringify(s),raw);});
for(const subject of ['preview:0','preview:1'])for(const [fact,value] of [['mode','VERTICAL'],['padding.top',4],['padding.right',4],['padding.bottom',4],['padding.left',4],['primaryAxisAlignItems','MAX'],['counterAxisAlignItems','MAX']]){
 test(`${subject} ${fact} override is detected; reset passes`,()=>{const s=fixture(),n=s.nodes.find(n=>n.id===subject),parts=fact.split('.'),o=parts.length===1?n.layout:n.layout[parts[0]],key=parts.at(-1),before=o[key];o[key]=value;assert(failures(s).some(e=>e.subjectNodeId===subject&&e.classification==='violation'),JSON.stringify(failures(s)));o[key]=before;assert.deepEqual(failures(s),[]);});
}
test('visible root gap is checked but unused one-child Operation gap is not',()=>{const s=fixture();s.nodes[0].layout.itemSpacing=12;assert(failures(s).some(e=>e.subjectNodeId==='preview:0'));s.nodes[0].layout.itemSpacing=0;s.nodes[1].layout.itemSpacing=99;assert.deepEqual(failures(s),[]);});
test('hidden Operation remains allowed',()=>{const s=fixture();s.nodes[0].component.properties['Operation#57377:0']=false;s.nodes[1].visible=false;assert.equal(failures(s).length,0);});
test('external width, clipping and arbitrary content are not compared to library sample size',()=>{const s=fixture();s.nodes[0].bounds.width=1000;s.nodes[0].layout.sizingHorizontal='FIXED';s.nodes[0].clipsContent=true;s.nodes[5].text.characters='12345678901234567890';s.nodes[5].bounds.width=800;syncChildActual(s);assert.equal(failures(s).length,0);});
test('changed layout of an externally swapped Addon is outside preset geometry',()=>{const s=fixture();for(const n of s.nodes.slice(10)){n.layout.mode='VERTICAL';n.layout.itemSpacing=999;n.layout.padding={top:99,right:99,bottom:99,left:99};}syncChildActual(s);assert.equal(failures(s).length,0);});
test('Core Amount boundary is not rechecked as a preset-owned layout',()=>{const s=fixture();s.nodes[3].layout.padding.left=8;syncChildActual(s);assert.equal(failures(s).length,0);const child=core.evaluateCompiledContract(s,runtime).evaluations.filter(e=>e.dependency);assert(child.some(e=>e.classification==='violation'),'child contract retains layout enforcement');});
test('missing dependency capture never grants proven ownership',()=>{const s=fixture();delete s.componentDependencyCaptures;assert(check(s).some(e=>e.classification==='human-review'));});
test('unknown actual layout does not pass',()=>{const s=fixture();s.nodes[0].unknownFacts.push('layout.mode');assert(check(s).some(e=>e.subjectNodeId==='preview:0'&&e.classification==='human-review'));});
test('44 archived reports preserve exact old replay and all unrelated verdicts',()=>{const r=require('../review_amount_styles_r8').review();assert.equal(r.results.length,44);for(const result of r.results)assert.equal(result.geometry['human-review']||0,0,result.file);});
