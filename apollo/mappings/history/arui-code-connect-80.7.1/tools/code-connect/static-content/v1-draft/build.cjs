// Additive, producer-owned manifest only. Never runs the frozen registry builder.
const fs=require('node:fs'),path=require('node:path');
const {hash,digest}=require('../../registry/source-inventory.cjs');
const bridge=require('../../registry/consumer.cjs');
const repo=path.resolve(__dirname,'../../../..'),workspace=path.dirname(repo),generation=path.join(workspace,'projects/Apollo-v3');
function bytes(file,expected){const b=fs.readFileSync(file);if(expected&&hash(b)!==expected)throw Error(`STALE_REQUEST: ${file}`);return b;}
const requestPins=[
    {path:'/private/tmp/next03-static-content/handoff.json',sha256:'c5ee04f6c6b4c2c527cb2c0dc87d6a2b3e04cda1f5ed76a23f4799503c01de13'},
    {path:'/private/tmp/next03-static-content/vector.json',sha256:'0fdcd9fe297dc90ff5a10a8bc6c8efcd5d7fdd6e5cff2e3526a6df3cc46f9829'},
    {path:'/private/tmp/next03-static-content/code-connect-request.json',sha256:'f5e1af83754fc3c960d58c4784d9b48f245931d18e4e5135b2baa6c058c2082d'},
    {path:path.join(generation,'apps/apollo-v4/docs/GENERATION_STATIC_CODE_CONNECT_REQUEST.md'),sha256:'388ca7e524e318c69a4c687afd4124ce3369d5088dca863e320f50e0ecc4283c'},
];
requestPins.forEach(p=>bytes(p.path,p.sha256));
const vector=JSON.parse(bytes(requestPins[1].path)),registry=bridge.loadRegistry(),lockPath='tools/code-connect/registry/lock.v1.json';
const lock=JSON.parse(bytes(path.join(repo,lockPath),'31304cb886f5371cf8200179911352685a1a4889a8c3e31490383b46771fcd2e'));
bridge.verifyLock(registry,lock);bridge.verifySource(registry,repo,workspace);
const pin=(root,file,expected)=>({path:file,sha256:hash(bytes(path.join(root,file),expected))});
const consumer=Object.fromEntries([...Object.entries(vector.sourcePins),...Object.entries(vector.consumerPins)]);
const proxyPin=consumer['proxy/src/generation-v4/service.js'];
if(!proxyPin)throw Error('PROXY_PIN_REQUIRED');
delete consumer['proxy/src/generation-v4/service.js'];
for(const file of ['packages/component-contract-core/dist/core.cjs','packages/component-contract-core/package.json',
    'packages/generation-core/package.json','apps/apollo-v4/package.json'])consumer[file]=hash(bytes(path.join(generation,file)));
const buildInputs=vector.buildManifest.inputs.map(p=>pin(generation,p.path,p.sha256));
if(buildInputs.length!==95)throw Error('BUILD_INPUT_COUNT');
for(const [file,version] of [['packages/component-contract-core/package.json','0.1.10'],['packages/generation-core/package.json','0.1.1'],['apps/apollo-v4/package.json','0.4.0']]){
    if(JSON.parse(bytes(path.join(generation,file))).version!==version)throw Error('CONSUMER_VERSION_MISMATCH');
}
const apiFiles=[
    'src/button-group/typings.ts','src/button-group/button-group.tsx','src/button-group/index.ts','src/button-group/hooks/use-button-group.ts',
    'src/button-group/utils/calculate-hidden-elements.ts','src/button-group/constants.ts',
    'src/corporate-content/types.ts','src/corporate-content/corporate-content.tsx','src/corporate-content/index.ts',
    'tools/code-connect/frontend-host/.work/source/dist/esm/button-group/typings.d.ts',
    'tools/code-connect/frontend-host/.work/source/dist/esm/button-group/index.d.ts',
    'tools/code-connect/frontend-host/.work/source/dist/esm/corporate-content/types.d.ts',
    'tools/code-connect/frontend-host/.work/source/dist/esm/corporate-content/index.d.ts',
    'tools/code-connect/frontend-host/node_modules/@alfalab/core-components-button/typings.d.ts',
    'tools/code-connect/frontend-host/node_modules/@alfalab/core-components-button/package.json',
    'tools/code-connect/frontend-host/node_modules/@types/react/index.d.ts',
    'tools/code-connect/node_modules/typescript/lib/tsc.js',
];
const manifest={schemaVersion:'apollo.code-connect.static-producer.v1-draft',version:1,status:'draft',accepted:false,executionAllowed:false,
    targetSupport:{figma:'not-supported',frontend:'not-supported'},
    outputVersion:'apollo.code-connect.static-content.v1-draft',planVersion:'apollo.code-connect.static-review-plan.v1-draft',
    generationWireSupport:'not-supported',generationPlanHash:null,
    requestPins,consumerVector:requestPins[1],consumerVersions:{core:'0.1.10',generationCore:'0.1.1',apolloV4:'0.4.0',editor:'0.2.91'},
    producerFiles:['producer.cjs','api-assignability.ts','tsconfig.json','build.cjs','synthetic-fixture.cjs'].map(f=>pin(repo,'tools/code-connect/static-content/v1-draft/'+f)),
    apiEvidenceFiles:apiFiles.map(f=>pin(repo,f)),
    consumerFiles:Object.entries(consumer).sort(([a],[b])=>a.localeCompare(b)).map(([f,h])=>pin(generation,f,h)),
    workspaceConsumerFiles:[pin(workspace,'services/apollo-proxy/src/generation-v4/service.js',proxyPin)],buildInputs,
    frozen:{registry:pin(repo,'tools/code-connect/registry/arui-private-80.7.1.v1.json','349073c8922f8c4437451a086714f08d63dbfd1164218d600610afdfb9eec1a8'),
        lock:pin(repo,lockPath),registryDigest:registry.registryDigest,currentInputsDigest:digest(registry.currentInputs),lockDigest:digest(lock),
        basisRegistryDigest:registry.authoringBasis.registryDigest,inputPackages:lock.inputPackages},
    sourceApiProof:{callback:'optional-not-generated',label:'ButtonElementProps.children: string',loading:'explicit false',disabled:'explicit boolean',
        view:'primaryFirst selects only first displayed primary; all later text elements secondary',
        priority:'separate explicit highest-first metadata; no public priority prop; conflict rejected',
        body:'CorporateContentProps.children',size:'wire string 56 -> public API numeric 56',
        overflow:'fixed requested false; maxVisibleButtons does not prove width-fit or absence of hidden target artifacts',
        generationSourceRead:'real runtime strict Ready gate; no relaxed runtime or cached-source substitution',
        canonical:'four source occurrences required; ActionID is semantic only; occurrence/symbol IDs unknown'},
    acceptance:{profile:'not-accepted',parity:'not-confirmed',native:'not-accepted',scoped:'not-accepted',live:'not-run'},
};
manifest.artifactDigest=digest(manifest);
fs.writeFileSync(path.join(__dirname,'producer.v1-draft.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({artifactDigest:manifest.artifactDigest,producerFiles:manifest.producerFiles.length,apiEvidenceFiles:manifest.apiEvidenceFiles.length,
    consumerFiles:manifest.consumerFiles.length,buildInputs:buildInputs.length,targetSupport:manifest.targetSupport,generationWireSupport:manifest.generationWireSupport}));
