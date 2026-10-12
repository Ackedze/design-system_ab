// Read-only verification of the current r5 package and retained r4 context evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const component=path.resolve(__dirname,'..'),packages=path.resolve(component,'..'),workspace=path.resolve(packages,'../../../..');
const core=require(path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs')),editor=require(path.join(workspace,'projects/ComponentContractEditor/dist/core.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p)),wire=v=>JSON.parse(JSON.stringify(v)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const receipt=read(path.join(__dirname,'r5-package-checks.2026-10-09.json')),zip=fs.readFileSync(path.join(packages,'BenefitCard.component-contract.zip'));
 assert.equal(sha(zip),receipt.zipSha256);const entries=await core.readZip(zip),entry=n=>JSON.parse(Buffer.from(entries.find(e=>e.name===n).data).toString());
 const manual=read(path.join(component,'authoring/contract.manual.json')),compiled=read(path.join(component,'authoring/compiled/component-contract.v2.json'));
 assert.equal(manual.metadata.revision,5);assert.equal(manual.metadata.declaredTargetIdentityVersion,3);assert.deepEqual(entry('contract.manual.json'),manual);assert.deepEqual(entry('compiled/component-contract.v2.json'),compiled);
 assert.equal(core.stableHash(manual),receipt.manualSourceHash);assert.equal(core.stableHash(compiled),receipt.compiledHash);assert.equal(compiled.package.sourceExportVersion,'component-contract-editor@0.2.95');assert.equal(compiled.status,'draft');
 const imported=editor.importWorkspace(entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:Buffer.from(e.data).toString()})),manual.component.contractId);
 assert.deepEqual(wire(editor.buildExportBundle(imported.manual,imported.variantEvidence,[]).compiled),compiled);
 const historical=await core.readZip(fs.readFileSync(path.join(packages,receipt.history,'BenefitCard.component-contract.zip'))),oldManual=JSON.parse(Buffer.from(historical.find(e=>e.name==='contract.manual.json').data).toString());
 const unchanged=wire(manual);unchanged.metadata=oldManual.metadata;assert.deepEqual(unchanged,oldManual);
 for(const name of ['manifest.json','draft-manifest.json']){const row=read(path.join(packages,name)).packages.find(p=>p.name==='BenefitCard');assert.equal(row.revision,5);assert.equal(row.zipSha256,sha(zip));assert.equal(row.manualSourceHash,receipt.manualSourceHash);assert.equal(row.compiledHash,receipt.compiledHash);assert.equal(row.status,'draft');}
 const preview=core.prepareAuthoringPreviewContract(compiled),verdicts=r=>r.evaluations.map(e=>({ruleId:e.ruleId,classification:e.classification}));
 for(const capture of receipt.historicalRetainedContextReplays){const bytes=fs.readFileSync(path.join(component,capture.file));assert.equal(sha(bytes),capture.sha256);const r=JSON.parse(bytes);assert.deepEqual(wire(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract)),r.results.engine);const snapshot=wire(r.snapshot);snapshot.validationIntent=core.createValidationIntent(snapshot,preview,r.snapshot.validationIntent.values);assert.deepEqual(verdicts(core.evaluateCompiledContract(snapshot,preview)),verdicts(r.results.engine));}
 console.log('PASS: r5 exact ZIP/manual/compiled/manifests, unchanged r4 norms/bindings, full Editor roundtrip, 12 historical context replays. Fresh installed r5 live acceptance is pending.');
})().catch(e=>{console.error(e);process.exitCode=1});
