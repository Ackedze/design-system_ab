// Read-only verification by default. --archive preserves evidence; --record writes acceptance only.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring');
const history=path.resolve(root,'../history/r9-editor-0.2.64');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
const read=f=>JSON.parse(fs.readFileSync(f));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const decoration='component:web-corp.amount-styles.manual-interactive-decoration-is-forbidden';
const height='component:web-corp.amount-styles.addon-does-not-exceed-text-line-height.1.1';
const placeholder=['component:web-corp.amount-styles.addon-uses-supported-components.1.2','component:web-core.amount.addon-content-is-configurable.1.2'];
const cases=[
 ['07-10-14-082',['.1.1.root','.1.2.root','.1.3.major-text','.1.3.minor-text','.1.3.currency-text'].map(s=>decoration+s)],
 ['07-11-59-503',[]],['07-14-49-636',[]],['07-15-00-274',[]],['07-15-15-777',[]],
 ['07-15-43-206',placeholder],['07-15-51-602',placeholder],['07-16-20-678',[height]],['07-16-42-403',[height]],
 ['07-17-01-290',[]],['07-17-18-486',[]],['07-26-54-050',[height]],['07-26-59-921',[height]],
 ['07-28-42-107',[]],['07-28-48-210',[]],['07-29-09-318',[]],['07-29-15-256',[]],['07-32-41-656',[]],['07-35-24-022',[]],
];
const name=t=>`amount-styles.validation-report.2026-09-30T${t}Z.json`;
const fixture=t=>`reports/fixtures/r9-editor-0.2.64/${name(t)}.gz`;
function immutable(file,bytes){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(bytes),file);else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});}}
function archive(){
 for(const file of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip','README.md','BACKLOG.md','TESTCASES.md','reports/readiness.json','runtime/component-contract.index.json']){
  if(!fs.existsSync(path.join(history,file))){assert.equal(read(path.join(root,'contract.manual.json')).metadata.revision,9);immutable(path.join(history,file),fs.readFileSync(path.join(root,file)));}
 }
 for(const [time] of cases){const source=path.join(root,'editor',name(time)),target=path.join(root,fixture(time));
  if(fs.existsSync(target)){if(fs.existsSync(source))assert(zlib.gunzipSync(fs.readFileSync(target)).equals(fs.readFileSync(source)));}
  else immutable(target,zlib.gzipSync(fs.readFileSync(source),{level:9}));
 }
}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function semanticRule(rule){const r=structuredClone(rule);delete r.revision;delete r.source.checksum;delete r.authority.status;return r;}
function comparable({evaluationId,ruleRevision,...e}){return e;}
function review(){
 const prior=read(path.join(history,'compiled/component-contract.v2.json')),manual=read(path.join(root,'contract.manual.json')),contract=read(path.join(root,'compiled/component-contract.v2.json'));
 const expected=read(path.join(history,'contract.manual.json'));expected.metadata.revision=10;expected.rules.find(r=>r.id===decoration).status='reviewed';
 assert.deepEqual(manual,expected,'Finalization must not change normative semantics');
 assert.equal(contract.status,'ready');assert.equal(contract.package.manualSourceHash,core.stableHash(manual));
 assert.deepEqual(contract.rules.map(semanticRule),prior.rules.map(semanticRule));
 for(const key of ['facts','runtimePolicy','coverage','componentDependencies'])assert.deepEqual(contract[key],prior[key],key);
 const snapshots=[],live=[],previous=core.prepareAuthoringPreviewContract(prior);
 for(const file of files(path.join(root,'reports/fixtures')).filter(f=>f.endsWith('.json.gz')).sort()){
  const bytes=zlib.gunzipSync(fs.readFileSync(file)),r=JSON.parse(bytes),original=JSON.stringify(r.snapshot);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract),r.run.evaluatedContractHash);
  const engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.deepEqual(JSON.parse(JSON.stringify(engine)),r.results.engine,file);
  const before=core.evaluateCompiledContract(r.snapshot,previous),after=core.evaluateCompiledContract(r.snapshot,contract);
  assert.deepEqual(after.evaluations.map(comparable),before.evaluations.map(comparable),file);
  assert.deepEqual(after.coverage,before.coverage);assert.equal(JSON.stringify(r.snapshot),original);
  snapshots.push({file:path.relative(root,file),sha256:sha(bytes),exactOriginalEngineReplay:true,behaviorParity:true,evaluations:after.evaluations.length});
  const c=cases.find(([t])=>file.endsWith(name(t)+'.gz'));
  if(c){
   assert.equal(core.stableHash(r.sources.manual),prior.package.manualSourceHash);
   assert.equal(core.stableHash(r.sources.compiledContract),core.stableHash(prior));
   const editor=core.buildEditorValidationReport(engine,{contract:prior,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
   assert.equal(core.stableHash(editor),core.stableHash(r.results.editor));
   assert.equal(core.stableHash(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),core.stableHash(r.results.details));
   assert.equal(editor.scenarioCoverage.complete,true);
   assert.deepEqual(engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort(),[...c[1]].sort(),file);
   live.push({file:path.relative(root,file),sha256:sha(bytes),rootNodeId:r.snapshot.source.rootNodeId,complete:true,exactEngineEditorDetailsReplay:true,violations:c[1],captureWarnings:r.run.capture.warnings});
  }
 }
 assert.equal(live.length,19);assert.equal(snapshots.length,65);
 return {schemaVersion:'apollo.component-contract.acceptance.v1',componentId:manual.component.componentId,date:'2026-09-30',status:'accepted',scope:'figma-component',published:false,
  manualRevision:10,priorRevision:9,manualSourceHash:core.stableHash(manual),compiledHash:core.stableHash(contract),generatedFactsHash:contract.package.generatedFactsHash,
  editorVersion:'0.2.64',ownerAcceptance:{source:'user-message',quote:'оформляй и финалим процесс',date:'2026-09-30'},
  liveAcceptance:'accepted-with-offline-boundaries',normativeSemanticsUnchanged:true,ruleIRCount:contract.rules.length,dependency:'Core Amount r5, unchanged and hash-pinned',
  reportResults:live,historicalSnapshots:snapshots.length,comparedEvaluations:snapshots.reduce((n,r)=>n+r.evaluations,0),snapshotComparisons:snapshots,
  offlineOnlyBoundaries:['Range-level decoration and missing/ambiguous facts: automated tests, not new live captures.','Not every Style/Negative/representation cross-product was tested live.','Nested wrapper backgrounds and individual text-effect overrides rely on targeted automated coverage.'],
  limitations:['Ready is limited to declared Figma component rules, not frontend mapping or production publication.','Geometry checks cover declared Auto Layout properties, not arbitrary bounds/sizing. External width/clipping belongs to patterns; one-line rule was retired.','External Addon contents are outside this contract. Unmatched-node capture warnings within swapped Addon remain UI diagnostic debt, not a new prohibition.','Old captures without text.decoration remain unknown under current rules; historical parity does not turn them into complete checks.','Hub drift stays open in the ledger; production catalogs and Hub documents were not changed.','Two unrelated Spinner test files still depend on deleted raw reports; repository-wide all-green is not claimed.']};
}
function recordQA(){
 const paths=['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip','runtime/component-contract.index.json','reports/readiness.json','reports/coverage.json'];
 const hashes=()=>Object.fromEntries(paths.map(p=>[p,sha(fs.readFileSync(path.join(root,p)))]));
 const before=hashes();
 require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'build_component_contract_reference.js'),root],{stdio:'pipe'});
 assert.deepEqual(hashes(),before,'Rebuild must be deterministic');
 const tests={};for(const [key,file,count] of [['contracts','/tmp/amount-styles-r10-ds-tests.log',344],['editor','/tmp/amount-styles-r10-editor-tests.log',638]]){
  const bytes=fs.readFileSync(file),log=bytes.toString();assert(log.includes(`# tests ${count}\n`));assert(log.includes(`# pass ${count}\n`));assert(log.includes('# fail 0\n'));
  tests[key]={tests:count,passed:count,failed:0,logSha256:sha(bytes)};
 }
 const typecheck=fs.readFileSync('/tmp/amount-styles-r10-typecheck.log');assert(typecheck.toString().includes('tsc --noEmit'));assert(!typecheck.toString().includes('error TS'));
 const result={date:'2026-09-30',manualRevision:10,editorVersion:'0.2.64',tests,typecheck:'passed',typecheckLogSha256:sha(typecheck),deterministicRebuild:true,filesSha256:before,acceptanceReport:'reports/acceptance.json',scope:'Targeted contracts and Editor regression; repository-wide suite not claimed (two historical Spinner fixture failures tracked separately).'};
 fs.writeFileSync(path.join(root,'reports/final-qa-r10.2026-09-30.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(require.main===module){if(process.argv.includes('--archive')){archive();console.log('Archived r9 package and 19 live reports');}else if(process.argv.includes('--qa'))console.log(JSON.stringify(recordQA()));else{const r=review();if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/acceptance.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({status:r.status,revision:r.manualRevision,live:r.reportResults.length,replayed:r.historicalSnapshots,evaluations:r.comparedEvaluations,compiledHash:r.compiledHash}));}}
module.exports={archive,review,cases};
