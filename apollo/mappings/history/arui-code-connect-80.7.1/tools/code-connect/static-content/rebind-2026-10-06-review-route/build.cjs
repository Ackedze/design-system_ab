// Sequential exact rebind. Writes only this additive snapshot and review report.
const fs=require('node:fs'),path=require('node:path');
const {hash,digest}=require('../../registry/source-inventory.cjs'),bridge=require('../../registry/consumer.cjs');
const repo=path.resolve(__dirname,'../../../..'),workspace=path.dirname(repo),generation=path.join(workspace,'projects/Apollo-v3');
const oldDir=path.join(__dirname,'../rebind-2026-10-06-final');
const requests=[
    {path:'/private/tmp/next03-static-review-route/handoff.json',sha256:'7571b6704683137dbdc5331d007ef708a8056c96ed39b755e33e2e11c5a409f7'},
    {path:'/private/tmp/next03-static-review-route/code-connect-rebind-request.json',sha256:'7842c516853f20e2cea754e0c2e0371a60b76f89941410a3071e5194ab422ab1'},
    {path:'/private/tmp/next03-static-review-route/vector.json',sha256:'857a831e5a20197ec995ac011b64000d89aaedd619b5a1cd19dd9f984f2faf11'},
    {path:'/private/tmp/next03-static-review-route/final-verification.json',sha256:'72537383e97a3d4ba44457514dedcf21645f1f5bff5c035db9615ac04696599b'},
    {path:'/private/tmp/next03-static-review-route/general-static-review-route-verification.json',sha256:'6d532f14d07c149b9bf467dc82435ed3720acae1004d89254229701984019749'},
];
const pin=file=>({path:file,sha256:hash(fs.readFileSync(file))});
function checked(p){if(!fs.existsSync(p.path)||hash(fs.readFileSync(p.path))!==p.sha256)throw Error('REBIND_PIN_STALE: '+p.path);return JSON.parse(fs.readFileSync(p.path));}
function relative(root,file){const s=path.relative(root,file).split(path.sep).join('/');if(s.startsWith('../')||path.isAbsolute(s))throw Error('REBIND_PIN_ROOT');return s;}
function unique(pins){const m=new Map();for(const p of pins){if(m.has(p.path)&&m.get(p.path).sha256!==p.sha256)throw Error('REBIND_PIN_CONFLICT');m.set(p.path,p);}return [...m.values()].sort((a,b)=>a.path.localeCompare(b.path));}
async function main(){
    requests.forEach(checked);const q=checked(requests[1]),v=checked(requests[2]);
    if(q.documentType!=='apollo-next03-07-static-producer-exact-rebind-request'||q.accepted!==false||q.executionAllowed!==false||q.generationPlanHash!==null
        ||digest(q.currentFiles)!==digest(v.files)||q.currentFiles.length!==215||digest(q.sourcePackages)!==digest(v.frozen.inputPackages))throw Error('REBIND_REQUEST_INVALID');
    checked(q.historicalProducerManifest);checked(q.historicalProducerReport);checked(q.historicalProducerReviewBasis);checked(q.historicalProducerGeneralVerification);q.currentFiles.forEach(checkedBytes);
    const old=JSON.parse(fs.readFileSync(q.historicalProducerManifest.path));
    if(hash(fs.readFileSync(path.join(__dirname,'producer.cjs')))!==hash(fs.readFileSync(path.join(oldDir,'producer.cjs'))))throw Error('REBIND_WIRE_CHANGED');
    const historicalFiles=unique([
        ...old.historicalSnapshotFiles.map(p=>({path:path.join(repo,p.path),sha256:p.sha256})),
        ...fs.readdirSync(oldDir).map(f=>pin(path.join(oldDir,f))),q.historicalProducerReport,
        pin(path.join(repo,'tools/code-connect/reports/NEXT-03-static-content-rebind-final.2026-10-06.md')),
    ]).map(p=>({path:relative(repo,p.path),sha256:p.sha256}));
    const r=bridge.loadRegistry(),lock=JSON.parse(fs.readFileSync(path.join(repo,v.frozen.lock.path)));
    bridge.verifyLock(r,lock);bridge.verifySource(r,repo,workspace);
    if(digest(lock.inputPackages)!==digest(q.sourcePackages)||r.registryDigest!==v.frozen.registryDigest||digest(r.currentInputs)!==v.frozen.currentInputsDigest
        ||digest(lock)!==v.frozen.lockDigest||digest(old.frozen)!==digest(v.frozen))throw Error('REBIND_SOURCE_BASIS');
    const consumerFiles=q.currentFiles.filter(p=>p.path.startsWith(generation+'/')).map(p=>({path:relative(generation,p.path),sha256:p.sha256}));
    const workspaceConsumerFiles=q.currentFiles.filter(p=>!p.path.startsWith(generation+'/')&&!p.path.startsWith(repo+'/')).map(p=>({path:relative(workspace,p.path),sha256:p.sha256}));
    const requestProducerPins=q.currentFiles.filter(p=>p.path.startsWith(repo+'/')).map(p=>({path:relative(repo,p.path),sha256:p.sha256}));
    const b=checked(v.buildManifest.file),buildInputs=b.inputs;
    if(b.runtimeVersion!==q.versions.core||b.profileVersion!==q.versions.apolloV4||buildInputs.length!==96||digest(buildInputs)!==digest(v.buildManifest.inputs))throw Error('REBIND_BUILD_IDENTITY');
    for(const p of buildInputs){checkedBytes({path:path.join(generation,p.path),sha256:p.sha256});if(!consumerFiles.some(c=>c.path===p.path&&c.sha256===p.sha256))throw Error('REBIND_BUILD_NOT_IN_VECTOR');}
    const a=JSON.parse(JSON.stringify(old));delete a.artifactDigest;
    a.requestPins=requests;a.consumerVector=q.consumerVector;a.consumerVersions=q.versions;
    a.consumerFiles=unique(consumerFiles);a.workspaceConsumerFiles=unique(workspaceConsumerFiles);a.buildInputs=buildInputs;
    a.producerFiles=unique([...old.producerFiles.filter(p=>!p.path.endsWith('/producer.cjs')&&!p.path.endsWith('/build.cjs')),
        ...requestProducerPins,...['producer.cjs','build.cjs'].map(f=>{const p=pin(path.join(__dirname,f));return {path:relative(repo,p.path),sha256:p.sha256};})]);
    a.apiEvidenceFiles.forEach(p=>checkedBytes({path:path.join(repo,p.path),sha256:p.sha256}));
    a.historicalSnapshotFiles=historicalFiles;
    a.rebind={kind:'exact-consumer-rebind-same-wire',snapshot:'2026-10-06-review-route',previousManifest:q.historicalProducerManifest,previousReport:q.historicalProducerReport,
        producerSourceUnchanged:true,reviewImport:'separate unaccepted inspection; not Generation execution support',sourceObservation:'new strict runtime read; historical observations not reused'};
    const configPin=q.proxyPins.find(p=>p.path.endsWith('/static-review-config.json'));
    if(!configPin||!a.workspaceConsumerFiles.some(p=>p.path===relative(workspace,configPin.path)&&p.sha256===configPin.sha256))throw Error('PROXY_CONFIG_PIN_REQUIRED');
    a.rebind.proxyConfig= configPin;
    a.rebind.panelFreshness='not-claimed; immutable server config still pins previous snapshot';
    a.artifactDigest=digest(a);
    const artifact=path.join(__dirname,'producer.v1-draft.json');fs.writeFileSync(artifact,JSON.stringify(a,null,2)+'\n');
    const producer=require('./producer.cjs'),fixture=require('../v1-draft/synthetic-fixture.cjs');
    const view=fixture(),priority=fixture();view.nodes[1].staticActions.items[1].view='primary';priority.nodes[1].staticActions.priorityOrder.reverse();
    const outputs=[];
    for(const [f,s] of [['synthetic.supported.review.json',fixture()],['synthetic.unsupported-view.review.json',view],['synthetic.unsupported-priority.review.json',priority]]){
        const result=await producer.prepareStatic(s),file=path.join(__dirname,f);fs.writeFileSync(file,await producer.emitStatic(result));
        outputs.push({...pin(file),inputHash:result.inputHash,planHash:result.planHash,contentHash:result.contentHash,observationHash:result.observation.observationHash,
            apiExpressibility:result.apiExpressibility,accepted:false,executionAllowed:false,generationPlanHash:null,targetSupport:result.targetSupport,
            diagnosticCodes:result.diagnostics.map(d=>d.code),generationSourceRead:result.generationSourceRead});
    }
    const report={documentType:'next-03-code-connect-static-source-api-review-handoff',version:1,status:'exact-rebind-basis-for-independent-review-import',
        accepted:false,executionAllowed:false,generationPlanHash:null,producerManifest:{...pin(artifact),artifactDigest:a.artifactDigest},
        consumerVector:a.consumerVector,outputs,sourcePackages:q.sourcePackages};
    const reportFile=path.join(__dirname,'review-report.v1-draft.json');fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
    historicalFiles.forEach(p=>checkedBytes({path:path.join(repo,p.path),sha256:p.sha256}));q.currentFiles.forEach(checkedBytes);requests.forEach(checkedBytes);producer.verifyFresh();
    console.log(JSON.stringify({manifestPin:pin(artifact),reportPin:pin(reportFile),artifactDigest:a.artifactDigest,outputs:outputs.map(p=>({path:p.path,sha256:p.sha256,apiExpressibility:p.apiExpressibility})),
        historicalFiles:historicalFiles.length,consumerFiles:a.consumerFiles.length,workspaceConsumerFiles:a.workspaceConsumerFiles.length,buildInputs:a.buildInputs.length}));
}
function checkedBytes(p){if(!fs.existsSync(p.path)||hash(fs.readFileSync(p.path))!==p.sha256)throw Error('REBIND_PIN_STALE: '+p.path);}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
