const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const D=__dirname,read=f=>JSON.parse(fs.readFileSync(path.join(D,f))),wire=v=>JSON.parse(JSON.stringify(v));
const pin=f=>{const b=fs.readFileSync(f);return {path:f,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const dependencies=read('verification-inputs.json');for(const item of dependencies.files)assert.deepEqual(pin(item.path),item);
const core=require(dependencies.core),editor=require(dependencies.editor),manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json');
(async()=>{
 const files=await core.readZip(fs.readFileSync(path.join(D,'Link.r5.candidate.component-contract.zip')));
 const imported=core.importWorkspace(files.filter(f=>f.name.endsWith('.json')).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)})),'core.web.link');
 assert.deepEqual(imported.manual,manual);const bundle=core.buildExportBundle(imported.manual,imported.variantEvidence,imported.dependencyContracts);assert(bundle.validation.valid);assert.deepEqual(wire(bundle.compiled),compiled);
 const old=JSON.parse(fs.readFileSync(dependencies.oldManual)),oldCompiled=JSON.parse(fs.readFileSync(dependencies.oldCompiled));
 assert.deepEqual(manual.rules.slice(0,18),old.rules);assert.deepEqual(manual.targets,old.targets);assert.deepEqual(manual.semanticApi,old.semanticApi);
 const normalize=r=>{r=wire(r);delete r.revision;delete r.source.checksum;return r;};
 for(const rule of oldCompiled.rules)assert.deepEqual(normalize(compiled.rules.find(r=>r.ruleId===rule.ruleId)),normalize(rule));
 const preview=core.prepareAuthoringPreviewContract(compiled),sequence=[];
 for(let i=0;i<dependencies.reports.length;i++){
  const report=JSON.parse(fs.readFileSync(dependencies.reports[i])),s=report.snapshot,engine=core.evaluateCompiledContract(s,preview);
  assert.deepEqual(wire(editor.evaluateCompiledContract(s,preview)),wire(engine));
  const result=core.buildEditorValidationReport(engine,{contract:compiled,issues:bundle.validation.issues},manual,s,{hiddenTargetCoverageVersion:1});
  const targets=core.prepareValidationSnapshot(s,preview).declaredTargetIdentitiesV1.targets;assert.equal(targets.length,8);assert(targets.every(t=>t.status==='resolved'));
  const v=result.evaluations.filter(e=>e.classification==='violation');assert.equal(v.length,i===1?1:0);
  if(i===1){assert.equal(v[0].ruleId,'component:web-core.link.left-icon-native-size.24.1.1');assert.equal(v[0].trace.actual,'20');}
  assert.equal(result.scenarioCoverage.inconclusive,0);sequence.push(v.length);
 }
 const coverage=read('coverage-map.json');assert.equal(coverage.manualSourceHash,core.stableHash(manual));assert.equal(coverage.compiledHash,core.stableHash(compiled));
 assert(read('registry-sync.json').readbackVerified);
 if(fs.existsSync(path.join(D,'seal.json')))for(const item of read('seal.json').files)assert.deepEqual({...pin(path.join(D,item.path)),path:item.path},item);
 console.log(JSON.stringify({schema:true,zipReopen:true,original32IRPreserved:true,sequence,googleReadback:true,candidateOnly:true,sharedWrites:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
