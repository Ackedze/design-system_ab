'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const R=__dirname,C=path.resolve(R,'../..'),A=path.resolve(C,'../../../../../..'),W=path.resolve(A,'../..'),F=W+'/.local/apollo-general-2026-10-16/mcp-pilot276/indicator-2026-10-23/runtime-input';
const rt=require(F+'/dist/runtime.cjs'),read=p=>JSON.parse(fs.readFileSync(p)),pin=p=>({path:path.relative(A,p),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
const frozen=read(path.resolve(F,'../RUNTIME-FROZEN-INPUT.json'));
for(const f of frozen.files){const p=pin(F+'/'+f.file);assert.equal(p.sha256,f.sha256);assert.equal(p.bytes,f.bytes);}
const manual=read(C+'/contract.manual.json'),contract=read(R+'/compiled.json'),report=JSON.parse(zlib.gunzipSync(fs.readFileSync(C+'/reports/native-r1-2026-10-23/owner-report.json.gz'))),replay=read(R+'/replay.json');
assert.equal(manual.metadata.revision,2);assert.equal(rt.contractHash(manual),contract.package.manualSourceHash);
for(const [i,c]of report.components.entries()){
 const result=rt.auditContractSnapshot(structuredClone(c.snapshot),contract,{evaluationMode:'authoring-preview'}),violations=result.engine.evaluations.filter(e=>e.classification==='violation');
 assert(result.coverage.executionComplete);assert.equal(violations.length,i<4?0:1);assert.deepEqual(violations.map(e=>e.ruleId),replay.rows[i].violations.map(e=>e.ruleId));
}
const checks=[];function check(name,mutate,expected){const s=structuredClone(report.components[1].snapshot);mutate(s);const r=rt.auditContractSnapshot(s,contract,{evaluationMode:'authoring-preview'}),n=r.engine.evaluations.filter(e=>e.classification==='violation').length;assert.equal(expected==='unknown'?!r.coverage.executionComplete:r.coverage.executionComplete&&n===expected,true,name);checks.push({name,violations:n,uncertain:r.coverage.uncertain});}
check('arbitrary payload appearance',s=>{const n=s.nodes.find(n=>n.name==='Fixer');n.appearance.opacity=.123;n.layout.padding.top=99;},0);
check('arbitrary payload TEXT and typography',s=>{const n=s.nodes.find(n=>n.name==='Fixer');n.type='TEXT';n.text={...s.nodes.find(n=>n.type==='TEXT').text,fontSize:99,characters:'Any object inside native SLOT'};},0);
check('own native SLOT padding',s=>{s.nodes.find(n=>n.type==='SLOT').layout.padding.top=1;},1);
check('same-name FRAME is not native SLOT',s=>{s.nodes.find(n=>n.type==='SLOT').type='FRAME';},'unknown');
check('missing own Label baseline',s=>{delete s.nodes.find(n=>n.type==='TEXT').baseline;delete s.instanceContentReferences;},'unknown');
check('extra object outside native SLOT',s=>{const p=structuredClone(s.nodes.find(n=>n.name==='Fixer')),root=s.nodes[0];p.id='extra:1';p.parentId=root.id;p.name='Other';p.semantic={};p.order=root.childIds.length;root.childIds.push(p.id);s.nodes.push(p);},'unknown');
const current=read(A+'/apollo/data-packages/current.json'),data=read(R+'/data-package.json');assert.equal(current.snapshot.dataId,data.dataId);assert.equal(pin(A+'/'+current.snapshot.path).sha256,current.snapshot.sha256);assert.equal(pin(W+'/services/apollo-proxy/src/data-packages/import.js').sha256,data.producer.sha256);
const result={status:'PASS',runtimePinsVerified:frozen.files.length,retainedCases:8,unknown:0,violations:[0,0,0,0,1,1,1,1],synthetic:checks,repositoryIntegrity:'Separate validate_current_contract_packages.cjs PASS:18 packages/3 dependencySources',freshNativeArea:'NOT_RUN_USER_ONLY',genericOptionalSlotAnchorMaterialization:'NOT_CLAIMED',wholeReady:false};
fs.writeFileSync(R+'/final-verification.json',JSON.stringify(result)+'\n');console.log(JSON.stringify(result));
