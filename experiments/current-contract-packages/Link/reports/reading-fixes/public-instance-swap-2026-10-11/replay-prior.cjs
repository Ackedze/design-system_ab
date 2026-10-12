const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const workspace=path.resolve(__dirname,'../../../../../../../..');
const packages=path.join(workspace,'shared/design-system_ab/experiments/current-contract-packages');
const core=require(path.join(__dirname,'runtime/core-after.cjs'));
const editor=require(path.join(__dirname,'runtime/editor-after.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p)),wire=v=>JSON.parse(JSON.stringify(v));
const manual=read(path.join(__dirname,'before/manual.json')),candidate=read(path.join(__dirname,'candidate/compiled.json'));
const candidatePreview=core.prepareAuthoringPreviewContract(candidate),results=[];
for(const input of read(path.join(__dirname,'prior-inputs.json'))){
 const file=input.file,name=path.basename(file),bytes=fs.readFileSync(file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),input.sha256);assert.equal(bytes.length,input.bytes);const d=read(file);
 if(core.stableHash(d.sources?.manual)!==core.stableHash(manual))continue;
 const original=core.prepareAuthoringPreviewContract(d.sources.compiledContract);
 const engine=core.evaluateCompiledContract(d.snapshot,original);
 assert.deepEqual(wire(engine),d.results.engine,name);
 assert.deepEqual(wire(editor.evaluateCompiledContract(d.snapshot,original)),d.results.engine,name);
 const args=[engine,{contract:d.sources.compiledContract,issues:d.sources.compilerIssues},d.sources.manual,d.snapshot,
  {hiddenTargetCoverageVersion:d.summary.hiddenTargetCoverageVersion}];
 assert.deepEqual(wire(core.buildEditorValidationReport(...args)),d.results.editor,name);
 assert.deepEqual(wire(editor.buildEditorValidationReport(...args)),d.results.editor,name);
 const after=core.evaluateCompiledContract(d.snapshot,candidatePreview);
 assert.deepEqual(wire(after),wire(editor.evaluateCompiledContract(d.snapshot,candidatePreview)),name);
 const beforeViolations=engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
 const afterViolations=after.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
 assert.deepEqual(afterViolations,beforeViolations,name);
 const beforeUnknown=engine.evaluations.filter(e=>e.classification==='human-review').length;
 const afterUnknown=after.evaluations.filter(e=>e.classification==='human-review').length;
 assert(afterUnknown<=beforeUnknown,name);
 results.push({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),legacyEngineEditorExact:true,
  newCoreEditorParity:true,violationsPreserved:afterViolations.length,beforeUnknown,afterUnknown,
  resolvedTargets:core.prepareValidationSnapshot(d.snapshot,candidatePreview).declaredTargetIdentitiesV1.targets.filter(t=>t.status==='resolved').length});
}
assert(results.length>=20);
const output=JSON.stringify({schemaVersion:'link.public-swap-prior-replay.v1',reports:results.length,results,
  freshNativeAcceptance:false,wholeReady:false},null,2)+'\n';
if(fs.existsSync(path.join(__dirname,'seal.json')))assert.equal(fs.readFileSync(path.join(__dirname,'prior-replay.json'),'utf8'),output);else fs.writeFileSync(path.join(__dirname,'prior-replay.json'),output);
console.log(JSON.stringify({reports:results.length,legacyEngineEditorExact:true,coreEditorParity:true,violationsPreserved:true}));
