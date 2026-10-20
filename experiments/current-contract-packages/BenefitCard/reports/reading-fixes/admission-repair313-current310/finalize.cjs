const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,pin,guard,grant}=require('./guard.cjs');
const before=guard('before-final-private314-closure'),buildReadback=[];
for(const name of fs.readdirSync(root).filter(n=>/^BUILD-.*\.json$/.test(n)).sort()){
 const d=JSON.parse(fs.readFileSync(root+'/'+name));
 for(const job of d.metafiles||d.jobs)for(const p of [...job.closure,job.output])assert.deepEqual(pin(p.path),p,p.path);
 if(d.html)assert.deepEqual(pin(d.html.path),d.html);
 buildReadback.push(pin(root+'/'+name));
}
const delta=JSON.parse(fs.readFileSync(root+'/SOURCE-DELTA.json'));assert.equal(delta.files.length,21);
for(const row of delta.files){assert.deepEqual(pin(row.candidate.path),row.candidate);if(row.before)assert.deepEqual(pin(row.path),row.before);else assert.equal(fs.existsSync(row.path),false);}
const inputs=JSON.parse(fs.readFileSync(root+'/INPUTS.json'));
const repairFiles=new Set(['projects/ComponentContractEditor/src/ui.ts','projects/Apollo-v3/packages/component-contract-core/src/owned-code-collection.ts','projects/Apollo-v3/packages/component-contract-core/tests/code-passport.test.js','projects/ComponentContractEditor/tests/authoring-admission.browser.cjs','projects/ComponentContractEditor/docs/BACKLOG.ru.md','projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md']);
for(const row of inputs.candidateFiles)if(!repairFiles.has(row.relative)){const p=pin(root+'/workspace/candidate/'+row.relative);assert.equal(p.sha256,row.input.sha256);assert.equal(p.bytes,row.input.bytes);}
const E=root+'/workspace/candidate/projects/ComponentContractEditor',C=root+'/workspace/candidate/projects/Apollo-v3/packages/component-contract-core';
assert.equal(JSON.parse(fs.readFileSync(E+'/package.json')).version,'0.2.106');assert.equal(JSON.parse(fs.readFileSync(C+'/package.json')).version,'0.1.19');
const lock=JSON.parse(fs.readFileSync(E+'/package-lock.json'));assert.equal(lock.version,'0.2.106');assert.equal(lock.packages[''].version,'0.2.106');
assert.match(fs.readFileSync(E+'/src/version.ts','utf8'),/@0\.2\.106/);assert.match(fs.readFileSync(E+'/src/ui.html','utf8'),/v0\.2\.106/);
const checks=JSON.parse(fs.readFileSync(root+'/REPAIR-CHECKS-02.json'));assert.equal(checks.checks.length,9);assert.ok(checks.checks.every(x=>x.status==='PASS'));
for(const [name,n]of [['scoped-node',25],['owned-code-node',9]])assert.ok(fs.readFileSync(root+'/CHECK-'+name+'-02.log','utf8').includes('# pass '+n+'\n'));
const compat=JSON.parse(fs.readFileSync(root+'/REGRESSION-02.json'));assert.equal(compat.passed,35);assert.equal(compat.failed,0);
const ui=JSON.parse(fs.readFileSync(root+'/workspace/portable-ui-01/UI-ADMISSION-candidate-01.json'));assert.equal(ui.checks.length,10);assert.ok(ui.checks.every(x=>x.status==='PASS'));
assert.equal(JSON.parse(fs.readFileSync(root+'/REPRODUCED-313.json')).status,'BOTH_REVIEW_FAILURES_REPRODUCED');
const closure={before,after:guard('after-final-private314-closure'),buildReadback,sourceDelta:pin(root+'/SOURCE-DELTA.json'),patch:pin(root+'/candidate.patch'),checks:pin(root+'/REPAIR-CHECKS-02.json'),browser:pin(root+'/workspace/portable-ui-01/UI-ADMISSION-candidate-01.json'),sharedWrites:0,Ready:false};
fs.writeFileSync(root+'/CLOSURE-READBACK.json',JSON.stringify(closure,null,2)+'\n',{flag:'wx'});
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(['tmp','browser-cache'].includes(e.name))return [];const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Unexpected owned symlink: '+p);return e.isDirectory()?walk(p):[p];});}
const files=walk(root).filter(p=>!['INVENTORY.json','HANDOFF.json','SEAL.json'].includes(path.basename(p))).sort().map(pin);
fs.writeFileSync(root+'/INVENTORY.json',JSON.stringify({status:'CLOSED_PRIVATE314_INVENTORY',files,excluded:'Transient tmp/browser-cache only; reports, first failures, source, builds and downloads retained'})+'\n',{flag:'wx'});
const handoff={status:'CLOSED_PRIVATE_REVIEW313_P2_REPAIRED',writesClosed:true,writerThreadId:'01a0f77a-11c9-7c10-bd21-e3e5d100feae',grant:pin(W+'/.local/apollo-general-2026-10-18/benefitcard-private-repair314/GRANT.json'),currentRuntimeDescriptor:grant.currentRuntimeDescriptor,currentAcceptance:grant.currentAcceptance,freshCatalog:grant.freshCatalog,closedCandidate:grant.closedCandidate,priorReview:grant.review,
 inventory:pin(root+'/INVENTORY.json'),closure:pin(root+'/CLOSURE-READBACK.json'),sourceDelta:pin(root+'/SOURCE-DELTA.json'),patch:pin(root+'/candidate.patch'),stageBProposal:pin(root+'/STAGE-B-PROPOSAL.json'),callerAudit:pin(root+'/CALLER-AUDIT.json'),processNote:pin(root+'/PROCESS-NOTE.json'),notes:pin(root+'/REVIEW-NOTES.md'),
 versions:{core:'0.1.19',editor:'0.2.106'},checks:{reviewFailuresReproduced:2,scopedNode:25,ownedCodeNode:9,compatibility:35,actualBrowserController:10,typecheck:'PASS',legacyProjection:'exact including evidenceHash',legacyImport:'exact controlled clock',legacyBenefitCardHashes:2,canonicalMixedV4Profile:'PASS; pure-code forged2 and scoped missing/mismatched/future versions refused'},
 oldAuthoring:'DID_NOT_REFUSE historical evidence retained; no universal old-editor refusal claim',adoptionBoundary:'Exact accepted Editor0.2.106 UI/core pair with Core0.1.19; a core-only replacement is insufficient',closedProducer:'Code Connect producer/registry still version1-only; no mixed version2 producer adoption claim',
 stageBAuthority:'NOT_GRANTED; General independent private review then separate writer window',fullRepositoryValidate:'NOT_RUN; Core/Editor full validate and separately coordinated V4/current consumer/runtime acceptance remain',sourceIntake:'Fresh Athena catalog accepted; no owner re-upload/update action required',next:'General independent review and exact shared apply window; then BenefitCard package refresh and focused native fixtures/tests',sharedSourceWrites:0,sharedBuilds:0,contractZipWrites:0,manifestHubSheetsWrites:0,proxyChanges:0,nativeModelCalls:0,generationPilotExpanded:false,Ready:false};
fs.writeFileSync(root+'/HANDOFF.json',JSON.stringify(handoff,null,2)+'\n',{flag:'wx'});
const seal={status:'CLOSED',writesClosed:true,at:new Date().toISOString(),handoff:pin(root+'/HANDOFF.json'),inventory:pin(root+'/INVENTORY.json'),scope:'Private repair314 only; no shared install/adoption authority',Ready:false};
fs.writeFileSync(root+'/SEAL.json',JSON.stringify(seal,null,2)+'\n',{flag:'wx'});
for(const p of files)assert.deepEqual(pin(p.path),p);assert.deepEqual(pin(seal.handoff.path),seal.handoff);assert.deepEqual(pin(seal.inventory.path),seal.inventory);
console.log(JSON.stringify({status:handoff.status,files:files.length,sourceFiles:21,handoff:pin(root+'/HANDOFF.json'),seal:pin(root+'/SEAL.json'),stageBProposal:handoff.stageBProposal,sharedWrites:0,Ready:false}));
