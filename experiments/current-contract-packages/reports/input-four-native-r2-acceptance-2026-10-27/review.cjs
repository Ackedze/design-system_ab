const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const R=__dirname,A=path.resolve(R,'../../../..'),source='/Users/alexkukhta/Downloads/apollo-v4-ad5f56333d93.json';
const bytes=fs.readFileSync(source),report=JSON.parse(bytes),read=p=>JSON.parse(fs.readFileSync(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length};};
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const prior=read(path.join(R,'../input-four-native-r1-2026-10-27/INSTALLED-MAIN-REPLAY.json'));
const indexPath=A+'/JSONS/indexes/component-contracts.index.json',index=read(indexPath),cases=[],contracts=[];
assert.equal(report.release.id,'208d30fd7e2485aa4840b1df50d0c920e024be326dea82961a542abe092e68d5');
assert.equal(report.components.length,25);assert.equal(report.result.coverage.scanComplete,true);
for(const expected of prior.cases){
  const matches=report.components.filter(c=>c.scopeId===read(path.join(R,'../input-four-native-r1-2026-10-27/native-eval.json')).cases.find(r=>r.caseId===expected.caseId).nodeId);
  assert.equal(matches.length,1,expected.caseId);const c=matches[0],coverage=c.result.coverage;
  const entry=index.entries.find(e=>e.componentId===c.release.contractId);assert(entry);assert.equal(entry.revision,2);
  assert.equal(c.release.contractHash,entry.compiledHash);assert.equal(c.release.manualSourceHash,entry.manualSourceHash);
  const es=c.result.engine.evaluations,actual=es.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
  assert.deepEqual(actual,[...expected.expectedRuleIds].sort(),expected.caseId);assert.equal(coverage.executionComplete,true);
  assert.equal(coverage.uncertain,0);assert.equal(coverage.captureIncomplete,false);assert.equal(coverage.incompleteDependencies,0);
  assert(!es.some(e=>['human-review','unknown','not-evaluable','not-executed'].includes(e.classification)));
  cases.push({caseId:expected.caseId,component:expected.component,nodeId:c.scopeId,name:c.name,status:'PASS_SCOPED_NATIVE',expectedRuleIds:expected.expectedRuleIds,actualRuleIds:actual,executionComplete:true,uncertain:0});
}
for(const name of ['Input','NumberInput','AmountInput','Select']){
  const entry=index.entries.find(e=>e.name===name);assert(entry);
  contracts.push({component:name,componentId:entry.componentId,revision:2,compiledHash:entry.compiledHash,manualSourceHash:entry.manualSourceHash,
    cases:cases.filter(c=>c.component===name).length,violations:cases.filter(c=>c.component===name).reduce((n,c)=>n+c.actualRuleIds.length,0),uncertain:0});
}
assert.equal(cases.reduce((n,c)=>n+c.actualRuleIds.length,0),13);
const gaps=Object.entries(report.notChecked.reduce((o,c)=>{assert.equal(c.reason,'contract-not-found');o[c.name]=(o[c.name]||0)+1;return o;},{})).map(([name,count])=>({name,count,reason:'contract-not-found'}));
assert.equal(report.notChecked.length,24);assert.equal(report.result.coverage.incompleteComponents,0);
const archive=R+'/native-report.json.gz';fs.writeFileSync(archive,zlib.gzipSync(bytes,{level:9,mtime:0}));assert.equal(sha(zlib.gunzipSync(fs.readFileSync(archive))),sha(bytes));
const out={schemaVersion:'apollo.contract-authoring-eval.v1',runId:'input-four-native-r2-acceptance-2026-10-27',savedAt:new Date().toISOString(),
  review:{author:'Contract Creation',independent:false},evidenceKind:'fresh-user-native-apollo-report',overall:'PASS_SCOPED',
  acceptedScope:'25 prepared root-component cases for Input, NumberInput, AmountInput, Select r2; exact expected violations and complete predicate execution',
  report:pin(source),retainedReport:pin(archive),release:report.release,index:pin(indexPath),contracts,cases,
  totals:{cases:25,expectedViolations:13,actualViolations:13,uncertain:0,incompleteRootComponents:0},
  areaCoverage:report.result.coverage,remainingCoverage:gaps,wholeAreaComplete:false,
  readyPromoted:false,canonicalContractsChanged:false,runtimeChanged:false,previousSealsChanged:false};
write(R+'/eval.json',out);write(R+'/SEAL.json',{schemaVersion:'apollo.native-acceptance-seal.v1',writesClosed:true,files:[pin(R+'/review.cjs'),pin(R+'/eval.json'),pin(archive)]});
console.log(JSON.stringify({status:out.overall,totals:out.totals,contracts,gaps,reportArchiveBytes:fs.statSync(archive).size}));
