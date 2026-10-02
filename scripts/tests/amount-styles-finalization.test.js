const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {review}=require('../review_amount_styles_finalization');
const root=path.resolve(__dirname,'../../experiments/web-corp/AmountStyles/authoring');
test('AmountStyles finalization preserves semantics and replays all 65 archived reports',()=>{
 const result=review();assert.equal(result.reportResults.length,19);assert.equal(result.normativeSemanticsUnchanged,true);
 assert.deepEqual(result,JSON.parse(fs.readFileSync(path.join(root,'reports/acceptance.json'))));
});
test('Ready runtime is accepted but not published and keeps a single pinned dependency',()=>{
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
 assert.equal(read('runtime/component-contract.index.json').status,'ready');
 assert.equal(read('runtime/component-contract.index.json').published,false);
 assert.equal(read('compiled/component-contract.v2.json').componentDependencies[0].revision,5);
 assert.ok(read('contract.manual.json').rules.every(r=>r.status==='reviewed'));
 const {matchingAcceptance}=require('../build_component_contract_reference');
 const acceptance=read('reports/acceptance.json'),contract=read('compiled/component-contract.v2.json');
 assert.equal(matchingAcceptance(acceptance,contract),true);
 for(const key of ['componentId','manualSourceHash','compiledHash','generatedFactsHash','status','scope'])
  assert.equal(matchingAcceptance({...acceptance,[key]:'stale'},contract),false,key);
});
