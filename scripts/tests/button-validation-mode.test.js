const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const core=require('../../../../projects/ComponentContractEditor/dist/core.cjs');
const root=path.resolve(__dirname,'../../experiments/web-core/core/Button'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=x=>JSON.parse(JSON.stringify(x));
const m=read('history/r27-editor-0.2.47/contract.manual.json'),c=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r27-editor-0.2.47/component-contract.v2.json.gz')))),active=core.prepareAuthoringPreviewContract(c),prior=read('history/r26-editor-0.2.46/contract.manual.json');
const review=read('qa/block-live-review.2026-09-28.json');
const specIds=['backdrop-blur-maps-to-control-blur','block-maps-to-fill','nowrap-maps-to-figma-layout','text-resizing-maps-to-figma-layout'].map(id=>'component:web-core.button.'+id);
const load=item=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
function run(r,mode,intent=r.snapshot.validationIntent.values){const s=clone(r.snapshot);s.validationRequest={version:1,mode};s.validationIntent=core.createValidationIntent(s,c,intent);const e=core.evaluateCompiledContract(s,active),report=core.buildEditorValidationReport(e,{contract:c,issues:[]},m,s);return{s,e,report};}
test('r27 scopes only four bridge rules; normative constraints, IDs, generated facts and Spinner pin unchanged',()=>{
 assert.equal(m.metadata.revision,27);assert.equal(m.rules.length,22);assert.equal(c.rules.length,55);assert.equal(c.nonExecutableRules.length,3);assert.equal(c.status,'draft');
 assert.deepEqual(m.rules.map(r=>r.id),prior.rules.map(r=>r.id));
 for(const rule of m.rules){const comparable=clone(rule);delete comparable.applicability.validationMode;assert.deepEqual(comparable,prior.rules.find(r=>r.id===rule.id));}
 assert.deepEqual(m.rules.filter(r=>r.applicability.validationMode).map(r=>r.id).sort(),specIds.sort());
 const old=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'history/r26-editor-0.2.46/component-contract.v2.json.gz'))));
 assert.equal(c.package.generatedFactsHash,old.package.generatedFactsHash);assert.deepEqual(c.componentDependencies,old.componentDependencies);
 assert.equal(c.runtimePolicy.validationModeVersion,1);assert.equal(read('runtime/component-contract.index.json').published,false);
});
for(const item of review.reportResults)test(`${item.caseId}: immutable r26 exact replay; r27 audit/specification and intrinsic parity`,()=>{
 const r=load(item),bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile)));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
 const e=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);assert.deepEqual(e,r.results.engine);
 const oldReport=core.buildEditorValidationReport(e,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);assert.deepEqual(JSON.parse(JSON.stringify(oldReport)),r.results.editor);
 assert.deepEqual(JSON.parse(JSON.stringify(core.buildEvaluationDetails(oldReport,r.runtime.evaluatedContract,r.anatomy))),r.results.details);
 const audit=run(r,'component-audit'),spec=run(r,'specification');
 assert.equal(audit.report.scenarioCoverage.complete,true);assert.equal(audit.report.scenarioCoverage.specificationStatus,'not-requested');assert.equal(audit.e.evaluations.filter(e=>e.classification==='violation').length,0);
 assert.equal(spec.report.scenarioCoverage.notExecuted,2);assert.equal(spec.report.scenarioCoverage.complete,false);assert.equal(spec.e.evaluations.filter(e=>e.classification==='violation').length,item.violations);
 const intrinsic=es=>es.filter(e=>!e.ruleId.startsWith('component:web-core.button.block-maps-to-fill.')).map(({evaluationId,ruleRevision,...e})=>e);
 assert.deepEqual(intrinsic(audit.e.evaluations),intrinsic(r.results.engine.evaluations));assert.deepEqual(intrinsic(spec.e.evaluations),intrinsic(r.results.engine.evaluations));
});
test('unset input cannot make specification complete; real opacity violations and coverage gaps survive audit',()=>{
 const r=load(review.reportResults[0]);const spec=run(r,'specification',{});assert.equal(spec.report.scenarioCoverage.complete,false);assert.equal(spec.report.scenarioCoverage.inconclusive,2);
 r.snapshot.nodes[0].appearance.opacity=.5;
 for(const mode of ['component-audit','specification']){const {e,report}=run(r,mode);assert.ok(e.evaluations.some(e=>e.classification==='violation'&&e.trace.factPaths?.includes('appearance.opacity')));assert.equal(report.contractReadiness.status,'draft');}
 r.snapshot.source.truncated=true;assert.equal(run(r,'component-audit').report.scenarioCoverage.complete,false);
});
test('archived Editor ZIP compiles to the same r27 contract; no usage rules restored',async()=>{
 const entries=await core.readZip(new Uint8Array(fs.readFileSync(path.join(root,'history/r27-editor-0.2.47/Button.editor-input.zip'))));const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const bundle=core.buildExportBundle(w.manual,w.variantEvidence,w.dependencyContracts);assert.deepEqual(w.manual,m);assert.equal(bundle.validation.valid,true);assert.equal(core.stableHash(bundle.compiled),core.stableHash(c));
 assert.deepEqual(c.coverage.byOwnership,{component:22,usage:0,unclassified:0});
});
