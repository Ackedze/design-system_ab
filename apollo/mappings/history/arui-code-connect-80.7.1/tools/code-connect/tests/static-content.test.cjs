const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('../static-content/v1-draft/producer.cjs'),fixture=require('../static-content/v1-draft/synthetic-fixture.cjs');
const {hash,digest}=require('../registry/source-inventory.cjs');
const copy=v=>JSON.parse(JSON.stringify(v)),actions=s=>s.nodes[1].staticActions;
const repo=path.resolve(__dirname,'../../..');
let prepared;
test.before(async()=>{prepared=await p.prepareStatic(fixture());});
test('static public API projection preserves explicit values without callbacks',()=>{
    assert.equal(prepared.apiExpressibility,'bounded-content-expressible');
    assert.deepEqual(prepared.apiIntent.group.props,{size:56,maxVisibleButtons:4,primaryFirst:true,showSkeleton:false,elements:[
        {children:'Synthetic Alpha',disabled:false,loading:false,dataTestId:'synthetic-a'},
        {children:'Synthetic Beta',disabled:true,loading:false,dataTestId:'synthetic-b'}]});
    assert.equal(prepared.apiIntent.root.slots.body.codeProp,'children');
    assert.equal(prepared.apiIntent.group.ownedPort,'button-label');
    assert.equal(/"(?:events|eventId|onClick|handlerRef|handlers|transitions)"/.test(JSON.stringify(prepared)),false);
    assert.ok(Object.isFrozen(prepared.apiIntent.group.props));
});
test('real Generation Ready gate is preserved and review plan is a different version',()=>{
    assert.equal(prepared.generationSourceRead.code,'SOURCE_COMPILE');
    assert.match(prepared.generationSourceRead.message,/buttons-group.*accepted ready contract/);
    assert.equal(prepared.plan.schemaVersion,'apollo.code-connect.static-review-plan.v1-draft');
    assert.equal(prepared.plan.generationPlanHash,null);
    assert.equal(prepared.generationPreflight.generationWireSupport,'not-supported');
    assert.equal(prepared.generationPreflight.sourceReadiness,'blocked');
    assert.deepEqual(prepared.generationPreflight.targets,{figma:'blocked',frontend:'blocked'});
    assert.equal(prepared.accepted,false);assert.equal(prepared.executionAllowed,false);
});
test('observation binds all hashes and full frozen five-package closure',()=>{
    const o=copy(prepared.observation),h=o.observationHash;delete o.observationHash;
    assert.equal(h,digest(o));assert.equal(prepared.inputHash,digest(fixture()));
    assert.equal(prepared.planHash,digest(prepared.plan));assert.equal(prepared.contentHash,digest(prepared.content));
    assert.equal(o.inputPackages.length,5);
    assert.deepEqual(o.inputPackages.map(p=>[p.componentId,p.revision]),[
        ['core.web.button',31],['core.web.spinner',8],['corporate-content.mobile-web',8],['web-corp.buttons-group',59],['web-corp.corporate-content',13]]);
    assert.ok(o.mappings.every(m=>m.profileId===null&&m.representationStatus==='draft'&&m.parity==='not-confirmed'));
    assert.ok(prepared.content.provenance.every(p=>p.canonicalOccurrenceId===null&&p.symbolId===null));
    assert.deepEqual(prepared.plan.requirements,{sourceOccurrences:4,visibleProductActions:2,hiddenSourceOccurrences:2,deleteSourceOccurrences:false});
});
test('storage order does not supply display or priority order',async()=>{
    const s=fixture();actions(s).items.reverse();s.nodes.reverse();
    const v=await p.prepareStatic(s);assert.equal(v.contentHash,prepared.contentHash);
    assert.notEqual(v.inputHash,prepared.inputHash);assert.notEqual(v.planHash,prepared.planHash);
});
test('all-secondary is expressible without deriving priority from View',async()=>{
    const s=fixture();actions(s).items[0].view='secondary';const v=await p.prepareStatic(s);
    assert.equal(v.apiExpressibility,'bounded-content-expressible');assert.equal(v.apiIntent.group.props.primaryFirst,false);
    assert.deepEqual(v.content.priorityOrder,actions(s).priorityOrder);
});
test('later primary rejects public API intent, preserving requested View',async()=>{
    const s=fixture();actions(s).items[1].view='primary';const v=await p.prepareStatic(s);
    assert.equal(v.apiExpressibility,'not-supported');assert.equal(v.apiIntent,null);
    assert.equal(v.content.actions[1].view,'primary');assert.equal(v.diagnostics[0].code,'STATIC_VIEW_NOT_SUPPORTED');
});
test('independent priority conflict stays explicit and is never reordered',async()=>{
    const s=fixture();actions(s).priorityOrder.reverse();const v=await p.prepareStatic(s);
    assert.equal(v.apiExpressibility,'not-supported');assert.equal(v.apiIntent,null);
    assert.deepEqual(v.content.displayOrder,['synthetic-a','synthetic-b']);assert.deepEqual(v.content.priorityOrder,['synthetic-b','synthetic-a']);
    assert.ok(v.diagnostics.some(d=>d.code==='STATIC_PRIORITY_ORDER_MISMATCH'));
});
test('display order controls View binding independently of item storage',async()=>{
    const s=fixture();actions(s).displayOrder.reverse();actions(s).priorityOrder.reverse();actions(s).items[0].view='secondary';actions(s).items[1].view='primary';
    const v=await p.prepareStatic(s);assert.equal(v.apiExpressibility,'bounded-content-expressible');
    assert.equal(v.apiIntent.group.props.elements[0].dataTestId,'synthetic-b');assert.equal(v.apiIntent.group.props.primaryFirst,true);
});
test('same labels keep separate ActionIDs and semantic provenance',async()=>{
    const s=fixture();actions(s).items[1].label=actions(s).items[0].label;const v=await p.prepareStatic(s);
    assert.equal(new Set(v.content.provenance.map(p=>p.actionId)).size,2);
});
test('required product decisions cannot be omitted or filled from defaults',async()=>{
    for(const field of ['view','disabled','loading']){const s=fixture();delete actions(s).items[0][field];await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});}
    for(const field of ['view','disabled','loading']){const s=fixture();actions(s).items[0][field]=null;await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});}
    const s=fixture();s.viewport.height=null;await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});
});
test('Loading=true, interactive fields and alternative wires are rejected',async()=>{
    for(const key of ['eventId','onClick','handlerRef','handlers']){const s=fixture();actions(s).items[0][key]='synthetic-extra';await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});}
    for(const key of ['events','transitions','accepted']){const s=fixture();s[key]=[];await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});}
    for(const value of [true,0,'false']){const s=fixture();actions(s).items[0].loading=value;await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});}
    const s=fixture();s.schemaVersion='apollo.screen-spec.v1-experimental';await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});
});
test('no function, accessor, cycle, sparse or extended array crosses JSON boundary',async()=>{
    const cases=[s=>{actions(s).items[0].onClick=()=>{};},s=>{Object.defineProperty(s,'id',{get(){throw Error('must not run');},enumerable:true});},
        s=>{s.loop=s;},s=>{actions(s).items.onClick='extra';},s=>{delete actions(s).items[0];}];
    for(const mutate of cases){const s=fixture();mutate(s);await assert.rejects(p.prepareStatic(s),{code:'STATIC_JSON_REQUIRED'});}
});
test('unknown/missing/duplicate identity or order cannot be inferred',async()=>{
    for(const mutate of [s=>{delete actions(s).priorityOrder;},s=>{actions(s).priorityOrder=['synthetic-a','unknown'];},
        s=>{actions(s).items[1].id='synthetic-a';},s=>{actions(s).displayOrder=['synthetic-a','synthetic-a'];}]){
        const s=fixture();mutate(s);await assert.rejects(p.prepareStatic(s),{code:'STATIC_INPUT_INVALID'});
    }
});
test('matching review plan accepted only as Draft; stale plan and Generation version rejected',async()=>{
    assert.equal((await p.prepareStatic(fixture(),{plan:prepared.plan})).planHash,prepared.planHash);
    const plan=copy(prepared.plan);plan.components[1].pin.revision=58;
    await assert.rejects(p.prepareStatic(fixture(),{plan}),{code:'STATIC_PLAN_STALE'});
    plan.schemaVersion='apollo.composition-plan.static-content.v1-draft';await assert.rejects(p.prepareStatic(fixture(),{plan}),{code:'STATIC_PLAN_STALE'});
});
test('Draft JSON emit is deterministic, contains no JSX or target writer',async()=>{
    const emitted=await p.emitStatic(prepared);assert.deepEqual(JSON.parse(emitted),prepared);
    assert.equal(await p.emitStatic(prepared),emitted);assert.equal(emitted.includes('<Button'),false);
});
test('emit revalidates source binding, imports, root props, IDs, priority and authority',async()=>{
    const changes=[v=>{v.apiIntent.root.props.onClick='invented';},v=>{v.apiIntent.imports[0].module='invented';},
        v=>{v.apiIntent.group.props.elements[0].dataTestId='invented';},v=>{v.apiIntent.businessPriorityOrder.reverse();},
        v=>{v.apiIntent.actionProvenance[0].canonicalOccurrenceId='invented';},v=>{v.targetSupport.figma='supported';},
        v=>{v.generationPreflight.targets.frontend='ready';},v=>{v.observation.mappings[0].profileId='invented';}];
    for(const change of changes){const v=copy(prepared);change(v);await assert.rejects(p.emitStatic(v),{code:'STATIC_EMIT_STALE'});}
    for(const key of ['accepted','executionAllowed']){const v=copy(prepared);v[key]=true;await assert.rejects(p.emitStatic(v),{code:'STATIC_EMIT_VERSION'});}
});
test('unsupported result emits only blocked review metadata',async()=>{
    const s=fixture();actions(s).items[1].view='primary';const v=await p.prepareStatic(s);
    assert.equal(JSON.parse(await p.emitStatic(v)).apiIntent,null);
    const forged=copy(v);forged.apiIntent=prepared.apiIntent;await assert.rejects(p.emitStatic(forged),{code:'STATIC_EMIT_STALE'});
});
test('manifest cannot be substituted with invented source, API, consumer or build pins',()=>{
    for(const field of ['producerFiles','apiEvidenceFiles','consumerFiles','workspaceConsumerFiles','buildInputs']){
        const a=copy(p.loadArtifact());a[field][0].sha256='0'.repeat(64);assert.throws(()=>p.verifyFresh(a),{code:'STATIC_ARTIFACT_IDENTITY'});
    }
    const a=copy(p.loadArtifact());a.consumerFiles=[];assert.throws(()=>p.verifyFresh(a),{code:'STATIC_ARTIFACT_IDENTITY'});
});
test('frozen registry and lock bytes are exact, current freshness still verifies',()=>{
    const a=p.loadArtifact();for(const pin of [a.frozen.registry,a.frozen.lock])assert.equal(hash(fs.readFileSync(path.join(repo,pin.path))),pin.sha256);
    assert.equal(p.verifyFresh().registry.registryDigest,'4540c8e955a24f7be6ce70dc43e1729a887d4fa4b065ad24ba91ef0f5ef874eb');
});
