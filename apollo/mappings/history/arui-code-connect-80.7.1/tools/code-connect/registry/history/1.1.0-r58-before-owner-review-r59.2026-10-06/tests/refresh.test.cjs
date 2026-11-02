const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bridge = require('../registry/consumer.cjs');
const inputs = require('../registry/contract-inputs.cjs');
const {hash,digest} = require('../registry/source-inventory.cjs');
const root = path.resolve(__dirname,'..'), repo = path.resolve(root,'../..'), workspace = path.dirname(repo);
const registry = bridge.loadRegistry(), lock = JSON.parse(fs.readFileSync(path.join(root,'registry/lock.v1.json')));
const clone = value => JSON.parse(JSON.stringify(value));
function edited(edit) {const r=clone(registry);edit(r);delete r.registryDigest;r.registryDigest=digest(r);return r;}
function temporaryWorkspace(t) {
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'code-connect-current-inputs-'));
    t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
    const files=new Set([...registry.currentInputs.authorities.map(p=>p.path),...registry.currentInputs.packages.flatMap(p=>[p.archivePath,p.manualPath])]);
    for(const file of files){const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(workspace,file),target);}
    return dir;
}
test('current producer verifies full root/transitive closure while preserving passport basis',()=>{
    assert.equal(registry.registryVersion,'1.1.0');
    assert.notEqual(registry.registryDigest,inputs.BASIS);
    assert.equal(registry.authoringBasis.registryDigest,inputs.BASIS);
    assert.deepEqual(registry.currentInputs.packages.map(p=>[p.componentId,p.revision]),[
        ['core.web.button',31],['core.web.spinner',8],['corporate-content.mobile-web',8],['web-corp.buttons-group',58],['web-corp.corporate-content',13],
    ]);
    bridge.verifyLock(registry,lock);
    assert.equal(inputs.verifyInputs(registry,repo,workspace).packages.length,5);
    for(const m of registry.mappings){assert.equal(m.code.representationStatus,'draft');assert.equal(m.code.codeEvidence.sourcePin.registryDigest,inputs.BASIS);}
});
test('historical registry/lock bytes and canonical digest are retained',()=>{
    const history=path.join(repo,inputs.HISTORY), index=JSON.parse(fs.readFileSync(path.join(history,'index.json')));
    for(const pin of index.files)assert.equal(hash(fs.readFileSync(path.join(history,pin.storedPath || pin.path))),pin.sha256);
    const old=bridge.loadRegistry(path.join(history,'registry/arui-private-80.7.1.v1.json'));
    bridge.verifyLock(old,JSON.parse(fs.readFileSync(path.join(history,'registry/lock.v1.json'))));
    assert.equal(old.registryDigest,inputs.BASIS);
    assert.equal(index.staleBeforeRefresh.code,'STALE_CONTRACT_PIN');
    assert.throws(()=>bridge.verifyLock(registry,bridge.lockFor(old)),e=>e.code==='STALE_MAPPING_LOCK');
});
test('repacking a transitive ZIP with an identical semantic contract invalidates byte freshness',t=>{
    const temp=temporaryWorkspace(t), pin=registry.currentInputs.packages.find(p=>p.componentId==='core.web.spinner');
    // ZIP readers accept trailing bytes; byte-level freshness must still reject.
    fs.appendFileSync(path.join(temp,pin.archivePath),'\n');
    assert.throws(()=>bridge.verifySource(registry,repo,temp),e=>e.code==='STALE_CONTRACT_PIN'&&e.message.includes('Spinner'));
});
test('a JSON-equivalent but byte-changed main passport cannot reuse the source pin',t=>{
    const temp=temporaryWorkspace(t), pin=registry.currentInputs.packages.find(p=>p.componentId==='web-corp.corporate-content');
    fs.appendFileSync(path.join(temp,pin.manualPath),'\n');
    assert.throws(()=>inputs.verifyInputs(registry,repo,temp),e=>e.code==='STALE_MANUAL_PIN');
});
test('redigesting forged dependency, scope or basis metadata does not attest current inputs',()=>{
    for(const field of ['compiledHash','representationScopeHash']) {
        const r=edited(v=>v.currentInputs.packages.find(p=>p.componentId==='web-corp.buttons-group')[field]='0'.repeat(64));
        bridge.validateRegistry(r);
        assert.throws(()=>inputs.verifyInputs(r,repo,workspace),e=>e.code==='STALE_CURRENT_INPUTS');
    }
    const r=edited(v=>v.authoringBasis.registrySha256='0'.repeat(64));
    assert.throws(()=>inputs.verifyInputs(r,repo,workspace),e=>e.code==='STALE_BASIS_REGISTRY');
});
test('new lock covers all five archive/manual/compiled inputs, not only mapping roots',()=>{
    assert.equal(lock.inputPackages.length,5);
    const bad=clone(lock);bad.inputPackages.find(p=>p.componentId==='core.web.button').manualSha256='0'.repeat(64);
    assert.throws(()=>bridge.verifyLock(registry,bad),e=>e.code==='STALE_MAPPING_LOCK');
    const incomplete=edited(r=>r.currentInputs.packages.pop());
    assert.throws(()=>bridge.validateRegistry(incomplete),e=>e.code==='INVALID_CURRENT_INPUTS');
});
test('draft source observations keep availability separate from profile/acceptance and unchanged JSX',()=>{
    const plan=JSON.parse(fs.readFileSync(path.join(root,'examples/pilot.desktop.plan.json')));
    const result=bridge.preflight(registry,plan,lock,{repo,workspaceRoot:workspace});
    assert.equal(result.status,'availability-pass');
    assert.equal(result.inputObservation.acceptance,'not-run');
    assert.equal(result.inputObservation.codeRepresentations,'draft');
    assert.equal(result.inputObservation.basisRegistryDigest,inputs.BASIS);
    assert.equal(result.inputObservation.currentRegistryDigest,registry.registryDigest);
    assert.ok(fs.readFileSync(path.join(root,'examples/PilotDesktop.generated.tsx'),'utf8').includes(`return (${bridge.emit(result.prepared)});`));
    assert.equal(registry.mappings.find(m=>m.kind==='buttons-group').contract.sourcePredicateStatus,'draft');
});
test('refresh supports observations of typed declarations without broadening the Size=56 route',()=>{
    const mapping=registry.mappings.find(m=>m.kind==='buttons-group');
    assert.deepEqual(mapping.code.typedBindings.find(b=>b.portId==='size').codeTransform.entries,
        [{from:'32',to:32},{from:'40',to:40},{from:'48',to:48},{from:'56',to:56}]);
    const group=JSON.parse(fs.readFileSync(path.join(root,'examples/pilot.desktop.plan.json'))).slots.Body[0];
    group.figma.Size='40';
    assert.throws(()=>bridge.prepare(registry,group,lock),e=>e.code==='UNVERIFIED_FIGMA_OCCURRENCES');
});
test('producer cannot promote Draft source metadata or fabricate typed mappings after redigesting',()=>{
    const promoted=edited(r=>r.mappings.find(m=>m.kind==='buttons-group').status.sourcePredicate='ready');
    assert.throws(()=>inputs.verifyInputs(promoted,repo,workspace),e=>e.code==='CONTRACT_STATUS_MISMATCH');
    const invented=edited(r=>r.mappings.find(m=>m.kind==='corporate-content').code.typedBindings[0].nativeSlotBinding.proof='accepted');
    assert.throws(()=>inputs.verifyInputs(invented,repo,workspace),e=>e.code==='CODE_EVIDENCE_INVALID');
});
