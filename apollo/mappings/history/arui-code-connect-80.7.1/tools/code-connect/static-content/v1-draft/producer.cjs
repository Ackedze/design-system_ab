// Read-only Draft content producer. JSON intent only; no JSX/native writer or
// callback/scenario generator. The interactive producer and its lock are frozen.
const fs=require('node:fs'),path=require('node:path');
const {hash,digest}=require('../../registry/source-inventory.cjs');
const bridge=require('../../registry/consumer.cjs');
const VERSION='apollo.code-connect.static-content.v1-draft';
const ROOT='arui-private.corporate-content.desktop',GROUP='arui-private.buttons-group.desktop';
const repo=path.resolve(__dirname,'../../../..'),workspace=path.dirname(repo),generation=path.join(workspace,'projects/Apollo-v3');
const fail=(code,message)=>{throw Object.assign(new Error(`${code}: ${message}`),{code});};
const copy=v=>JSON.parse(JSON.stringify(v));
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function equal(a,b,code){if(digest(a)!==digest(b))fail(code,'exact content/source binding required');}
function safe(root,relative){if(typeof relative!=='string'||path.isAbsolute(relative)||relative.includes('\\')||relative.split('/').some(p=>!p||p==='.'||p==='..'))fail('STATIC_PIN_PATH','relative path required');return path.join(root,relative);}
function check(root,pin,code){const file=safe(root,pin.path);if(!fs.existsSync(file)||hash(fs.readFileSync(file))!==pin.sha256)fail(code,pin.path);}
function jsonData(value,seen=new Set()) {
    if(value===null||['string','boolean'].includes(typeof value))return;
    if(typeof value==='number'&&Number.isFinite(value))return;
    if(!value||typeof value!=='object'||seen.has(value)||(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value))))fail('STATIC_JSON_REQUIRED','plain acyclic JSON data only');
    if(Array.isArray(value)&&(Object.keys(value).length!==value.length||Object.keys(value).some((k,i)=>k!==String(i))))fail('STATIC_JSON_REQUIRED','dense JSON arrays without extra fields only');
    seen.add(value);for(const k of Reflect.ownKeys(value)){
        if(Array.isArray(value)&&k==='length')continue;
        const d=Object.getOwnPropertyDescriptor(value,k);
        if(typeof k!=='string'||!d.enumerable||!('value' in d))fail('STATIC_JSON_REQUIRED','no hidden fields/accessors/symbols');
        jsonData(d.value,seen);
    }seen.delete(value);
}
function loadArtifact(file=path.join(__dirname,'producer.v1-draft.json')){
    const a=JSON.parse(fs.readFileSync(file));const {artifactDigest,...payload}=a;
    if(a.schemaVersion!=='apollo.code-connect.static-producer.v1-draft'||a.version!==1||a.status!=='draft'||a.accepted!==false||a.executionAllowed!==false
        ||a.targetSupport?.figma!=='not-supported'||a.targetSupport?.frontend!=='not-supported'||artifactDigest!==digest(payload))fail('STATIC_ARTIFACT_INVALID','version/digest/authority');
    return freeze(a);
}
function verifyFresh(a=loadArtifact()){
    // A caller cannot replace the pinned manifest with a smaller invented closure.
    equal(a,loadArtifact(),'STATIC_ARTIFACT_IDENTITY');
    for(const pin of a.producerFiles)check(repo,pin,'STALE_STATIC_PRODUCER');
    for(const pin of a.apiEvidenceFiles)check(repo,pin,'STALE_STATIC_API');
    for(const pin of a.consumerFiles)check(generation,pin,'STALE_STATIC_CONSUMER');
    for(const pin of a.workspaceConsumerFiles)check(workspace,pin,'STALE_STATIC_CONSUMER');
    for(const pin of a.buildInputs)check(generation,pin,'STALE_STATIC_BUILD');
    for(const pin of a.requestPins)if(!fs.existsSync(pin.path)||hash(fs.readFileSync(pin.path))!==pin.sha256)fail('STALE_STATIC_REQUEST',pin.path);
    const r=bridge.loadRegistry(),lock=JSON.parse(fs.readFileSync(path.join(repo,'tools/code-connect/registry/lock.v1.json')));
    check(repo,a.frozen.registry,'STALE_STATIC_REGISTRY');check(repo,a.frozen.lock,'STALE_STATIC_LOCK');
    if(r.registryDigest!==a.frozen.registryDigest||digest(r.currentInputs)!==a.frozen.currentInputsDigest||digest(lock)!==a.frozen.lockDigest
        ||r.authoringBasis.registryDigest!==a.frozen.basisRegistryDigest)fail('STATIC_SOURCE_PIN_MISMATCH','frozen producer basis');
    bridge.verifyLock(r,lock);bridge.verifySource(r,repo,workspace);
    equal(lock.inputPackages,a.frozen.inputPackages,'STATIC_CLOSURE_MISMATCH');
    return {registry:r,lock};
}
let cache;
async function sourceRead(a,r){
    if(cache?.artifactDigest===a.artifactDigest)return cache.result;
    const gen=require(path.join(generation,'packages/generation-core/dist/index.cjs'));
    const runtime=require(path.join(generation,'apps/apollo-v4/dist/runtime.cjs'));
    const core=require(path.join(generation,'packages/component-contract-core/dist/core.cjs'));
    const archives=r.currentInputs.packages.map(p=>({name:path.basename(p.archivePath),bytes:fs.readFileSync(safe(workspace,p.archivePath))}));
    const identity={coreVersion:a.consumerVersions.core,
        profileVersion:runtime.RUNTIME_VERSION,runtimeSha256:hash(fs.readFileSync(path.join(generation,'apps/apollo-v4/dist/runtime.cjs'))),
        buildInputsSha256:hash(fs.readFileSync(path.join(generation,'apps/apollo-v4/dist/build-inputs.json')))};
    let result;
    try {
        await gen.loadContractPackages(archives,{runtime,readZip:core.readZip,identity});
        result={status:'source-loaded',identity,accepted:false,executionAllowed:false};
    } catch(error) {
        if(error.code!=='SOURCE_COMPILE')throw error;
        result={status:'not-supported',identity,code:error.code,message:error.message,accepted:false,executionAllowed:false};
    }
    // Never substitute a relaxed runtime or a cached contract for the Ready gate.
    cache={artifactDigest:a.artifactDigest,result:freeze(result)};return result;
}
function apiIntentFor(content){
    return {kind:'non-executable-public-api-intent',imports:[
        {module:'arui-private/corporate-content',exportName:'CorporateContent'},{module:'arui-private/button-group',exportName:'ButtonGroup'}],
        root:{nodeId:content.ownerNodeId,mappingId:ROOT,props:{},slots:{body:{codeProp:'children',childNodeIds:[content.groupNodeId]}}},
        group:{nodeId:content.groupNodeId,mappingId:GROUP,ownedPort:'button-label',props:{size:56,maxVisibleButtons:4,
            primaryFirst:content.actions[0].view==='primary',showSkeleton:false,elements:content.actions.map(a=>({children:a.label,disabled:a.disabled,loading:false,dataTestId:a.id}))}},
        businessPriorityOrder:content.priorityOrder.slice(),priorityBinding:'semantic-metadata-only; no public business-priority prop',
        actionProvenance:copy(content.provenance)};
}
async function prepareStatic(input,{artifact=loadArtifact(),plan:providedPlan}={}){
    jsonData(input);if(providedPlan!==undefined)jsonData(providedPlan);
    const {registry,lock}=verifyFresh(artifact);
    const gen=require(path.join(generation,'packages/generation-core/dist/index.cjs'));
    const issues=gen.validateStaticScreenSpec(input);
    if(issues.length)throw Object.assign(new Error('STATIC_INPUT_INVALID'),{code:'STATIC_INPUT_INVALID',diagnostics:issues});
    const generationSourceRead=await sourceRead(artifact,registry);
    const root=input.nodes.find(n=>n.mappingId===ROOT),group=input.nodes.find(n=>n.mappingId===GROUP),a=group.staticActions;
    const actions=a.displayOrder.map(id=>copy(a.items.find(item=>item.id===id)));
    const content={ownerNodeId:root.id,slotPort:'body',groupNodeId:group.id,actionPort:'button-label',size:'56',overflow:false,state:'default',
        actions,displayOrder:a.displayOrder.slice(),priorityOrder:a.priorityOrder.slice(),
        provenance:actions.map(item=>({actionId:item.id,ownerNodeId:group.id,port:'button-label',canonicalOccurrenceId:null,symbolId:null}))};
    // This producer-owned review plan is deliberately NOT a Generation plan.
    // The real Generation source loader rejected the frozen Draft source.
    const plan={schemaVersion:'apollo.code-connect.static-review-plan.v1-draft',status:'draft',executionAllowed:false,spec:copy(input),
        pins:{specHash:digest(input),registryDigest:registry.registryDigest,currentInputsDigest:digest(registry.currentInputs),lockDigest:digest(lock),
            artifactDigest:artifact.artifactDigest,consumerFilesDigest:digest(artifact.consumerFiles),workspaceConsumerFilesDigest:digest(artifact.workspaceConsumerFiles),buildInputsDigest:digest(artifact.buildInputs)},
        components:[root,group].map(n=>{const m=registry.mappings.find(m=>m.id===n.mappingId);return {nodeId:n.id,mappingId:n.mappingId,
            pin:{componentId:m.contract.componentId,contractId:m.contract.contractId,revision:m.contract.revision,
                manualSourceHash:m.contract.manualSourceHash,compiledHash:m.contract.compiledHash}};}),
        content,contentHash:digest(content),requirements:{sourceOccurrences:4,visibleProductActions:2,hiddenSourceOccurrences:2,deleteSourceOccurrences:false},
        generationPlanHash:null};
    if(providedPlan!==undefined)equal(providedPlan,plan,'STATIC_PLAN_STALE');
    const ordered=plan.content.actions;
    const diagnostics=[];
    if(ordered.some((a,i)=>i>0&&a.view==='primary'))diagnostics.push({code:'STATIC_VIEW_NOT_SUPPORTED',message:'ButtonGroup forces all later normal text buttons secondary; no per-element View prop.'});
    if(digest(plan.content.displayOrder)!==digest(plan.content.priorityOrder))diagnostics.push({code:'STATIC_PRIORITY_ORDER_MISMATCH',message:'Display and independent highest-first business order conflict; neither order is inferred or silently changed.'});
    const expressible=diagnostics.length===0;
    const apiIntent=expressible?apiIntentFor(content):null;
    const preflight={schemaVersion:'apollo.code-connect.static-review-preflight.v1-draft',status:'draft',executionAllowed:false,
        generationWireSupport:'not-supported',sourceReadiness:generationSourceRead.status==='source-loaded'?'source-loaded':'blocked',
        targets:{figma:'blocked',frontend:'blocked'},diagnostics:[
            {code:'STATIC_PROTOCOL_DRAFT'},{code:'GENERATION_STATIC_SOURCE_REVIEW_UNSUPPORTED'},
            ...(generationSourceRead.code?[{code:generationSourceRead.code,message:generationSourceRead.message}]:[]),
            {code:'SOURCE_NOT_READY'},{code:'CODE_PROFILE_UNACCEPTED'},{code:'FIGMA_NATIVE_BINDING_UNACCEPTED'},
            {code:'STATIC_CANONICAL_CROSSWALK_MISSING'},{code:'STATIC_WIDTH_FACTS_MISSING'},{code:'STATIC_CONTEXT_RECEIPTS_UNACCEPTED'},
            ...input.unresolved.map(()=>({code:'SCREEN_UNRESOLVED'})),...diagnostics]};
    const output={schemaVersion:VERSION,status:'draft',accepted:false,executionAllowed:false,
        apiExpressibility:expressible?'bounded-content-expressible':'not-supported',targetSupport:{figma:'not-supported',frontend:'not-supported'},
        inputHash:digest(input),planHash:digest(plan),plan,contentHash:plan.contentHash,content:copy(plan.content),apiIntent,diagnostics,
        observation:{schemaVersion:'apollo.code-connect.static-source-api-observation.v1-draft',accepted:false,executionAllowed:false,
            scope:'fresh-source-api-and-content-plan-only',artifactDigest:artifact.artifactDigest,inputHash:digest(input),planHash:digest(plan),contentHash:plan.contentHash,
            planSchemaVersion:plan.schemaVersion,generationPlanHash:null,generationSourceReadHash:digest(generationSourceRead),generationWireSupport:'not-supported',
            planPins:copy(plan.pins),consumerVector:artifact.consumerVector,consumerFilesDigest:digest(artifact.consumerFiles),workspaceConsumerFilesDigest:digest(artifact.workspaceConsumerFiles),buildInputsDigest:digest(artifact.buildInputs),
            registryDigest:registry.registryDigest,currentInputsDigest:digest(registry.currentInputs),lockDigest:digest(lock),basisRegistryDigest:registry.authoringBasis.registryDigest,
            inputPackages:copy(lock.inputPackages),mappings:registry.mappings.filter(m=>[ROOT,GROUP].includes(m.id)).map(m=>({id:m.id,representationId:m.code.proposedRepresentationId,
                sourceScopeHash:registry.currentInputs.packages.find(p=>p.componentId===m.contract.componentId).representationScopeHash||null,
                apiAvailability:'confirmed-source-api',representationStatus:'draft',profileId:null,profileAcceptance:'not-accepted',parity:'not-confirmed',acceptance:'not-run'})),
            apiEvidenceDigest:digest(artifact.apiEvidenceFiles)},
        generationSourceRead,generationPreflight:preflight,
        gaps:['BG_SOURCE_DRAFT_NONEXECUTABLE_CONTEXT_RULES','STATIC_PROFILE_UNACCEPTED','NATIVE_CANONICAL_BODY_AND_FOUR_OCCURRENCE_CROSSWALK_MISSING',
            'ACTUAL_ALLOCATED_WIDTH_FONT_LOADING_ADDON_READBACK_MISSING','SCOPED_CHECKER_RECEIPTS_UNACCEPTED','STATIC_TARGET_WRITER_NOT_SUPPORTED','PARITY_LIVE_RELEASE_NOT_ACCEPTED']};
    output.observation.observationHash=digest(output.observation);
    // A concurrent consumer/source edit invalidates the result before return.
    verifyFresh(artifact);return freeze(output);
}
async function emitStatic(prepared,{artifact=loadArtifact()}={}){
    jsonData(prepared);
    if(prepared?.schemaVersion!==VERSION||prepared.status!=='draft'||prepared.accepted!==false||prepared.executionAllowed!==false
        ||!['bounded-content-expressible','not-supported'].includes(prepared.apiExpressibility))fail('STATIC_EMIT_VERSION','Draft output only');
    const actual=await prepareStatic(prepared.plan?.spec,{artifact});
    equal(prepared,actual,'STATIC_EMIT_STALE');
    return JSON.stringify(prepared,null,2)+'\n';
}
module.exports={VERSION,loadArtifact,verifyFresh,prepareStatic,emitStatic};
