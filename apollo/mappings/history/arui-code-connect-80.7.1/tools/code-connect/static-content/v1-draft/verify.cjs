// Producer-owned evidence writer. It writes review JSON/report only, no target.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const p=require('./producer.cjs'),fixture=require('./synthetic-fixture.cjs');
const {hash,digest}=require('../../registry/source-inventory.cjs');
const repo=path.resolve(__dirname,'../../../..'),workspace=path.dirname(repo),generation=path.join(workspace,'projects/Apollo-v3');
const clone=v=>JSON.parse(JSON.stringify(v));
const filePin=file=>({path:file,sha256:hash(fs.readFileSync(file))});
function checkPins(pins,root){for(const p of pins)if(hash(fs.readFileSync(path.join(root,p.path)))!==p.sha256)throw Error('STALE_VERIFICATION_PIN: '+p.path);return {count:pins.length,digest:digest(pins)};}
async function main(){
    const a=p.loadArtifact(),fresh=p.verifyFresh(),r=fresh.registry;
    const testLog='/private/tmp/next03-code-connect-all-tests.log',log=fs.readFileSync(testLog,'utf8');
    if(!/^# tests 62$/m.test(log)||!/^# pass 62$/m.test(log)||!/^# fail 0$/m.test(log))throw Error('TEST_RECEIPT_REQUIRED');
    const apiProofSourceDigest=digest(a.producerFiles.filter(p=>['api-assignability.ts','tsconfig.json'].some(f=>p.path.endsWith(f))));
    const typeChecks=['tools/code-connect/tsconfig.json','tools/code-connect/static-content/v1-draft/tsconfig.json'].map(config=>{
        const result=cp.spawnSync(path.join(repo,'tools/code-connect/node_modules/.bin/tsc'),['--noEmit','-p',config],{cwd:repo,encoding:'utf8'});
        if(result.status!==0)throw Error(result.stderr+result.stdout);return {config,exitCode:result.status,outputHash:hash(result.stdout+result.stderr)};
    });
    const sources=[['synthetic.supported.review.json',fixture()]],view=fixture(),priority=fixture();
    view.nodes[1].staticActions.items[1].view='primary';priority.nodes[1].staticActions.priorityOrder.reverse();
    sources.push(['synthetic.unsupported-view.review.json',view],['synthetic.unsupported-priority.review.json',priority]);
    const outputs=[];
    for(const [name,spec] of sources){const result=await p.prepareStatic(spec),file=path.join(__dirname,name);
        fs.writeFileSync(file,await p.emitStatic(result));outputs.push({...filePin(file),inputHash:result.inputHash,planHash:result.planHash,
            contentHash:result.contentHash,observationHash:result.observation.observationHash,apiExpressibility:result.apiExpressibility,
            accepted:false,executionAllowed:false,targetSupport:result.targetSupport,diagnosticCodes:result.diagnostics.map(d=>d.code),
            generationSourceRead:result.generationSourceRead});}
    const productFile=path.join(generation,'apps/apollo-v4/docs/desktop-content-actions-pilot.static-v1.input-draft.json'),productBefore=filePin(productFile);
    if(productBefore.sha256!=='7f79e78a3defd9575ab50c421e452139d6a3e0710a27c44c57d961f49480fb25')throw Error('PRODUCT_INPUT_CHANGED');
    let productRejection;try{await p.prepareStatic(JSON.parse(fs.readFileSync(productFile)));throw Error('UNEXPECTED_PRODUCT_ACCEPTANCE');}
    catch(error){if(error.code!=='STATIC_INPUT_INVALID')throw error;productRejection={code:error.code,diagnosticCodes:error.diagnostics.map(d=>d.code)};}
    if(filePin(productFile).sha256!==productBefore.sha256)throw Error('PRODUCT_INPUT_MUTATION');
    // Check existing source/dist/package-manifest continuity without replaying or
    // repinning any old browser receipt. No full installed payload proof claimed.
    const prior=JSON.parse(fs.readFileSync(path.join(repo,'tools/code-connect/reports/NEXT-02-r59-producer-refresh.2026-10-06.json'))).historicalBridge;
    for(const key of ['sourceBuildReport','recipeReport','environmentReceipt'])checkPins([prior[key]],repo);
    const build=JSON.parse(fs.readFileSync(path.join(repo,prior.sourceBuildReport.path))),recipe=JSON.parse(fs.readFileSync(path.join(repo,prior.recipeReport.path))),
        env=JSON.parse(fs.readFileSync(path.join(repo,prior.environmentReceipt.path)));
    const artifactSource=[...build.source.originalFiles,...build.files,...build.outputFiles,...build.receiptFiles];
    const dist=build.distribution.filePins.map(pin=>({path:path.join(build.distribution.path,pin.path),sha256:pin.sha256}));
    const installed=env.installed.map(pin=>({path:'tools/code-connect/frontend-host/'+pin.path+'/package.json',sha256:pin.packageJsonSha256}));
    const continuity={sourceArtifacts:checkPins(artifactSource,repo),recipes:checkPins([...recipe.files,...recipe.artifacts],repo),
        selectiveDistribution:checkPins(dist,repo),installedManifests:checkPins(installed,repo),
        scope:'source/API byte and package-manifest continuity only; no old live/profile receipt acceptance; full installed payload hash unavailable'};
    p.verifyFresh();
    const ownFiles=['producer.cjs','api-assignability.ts','tsconfig.json','build.cjs','synthetic-fixture.cjs','verify.cjs','producer.v1-draft.json',
        'README.md','CONSUMER_REVIEW_REQUEST.md'].map(f=>filePin(path.join(__dirname,f)));
    ownFiles.push(filePin(path.join(repo,'tools/code-connect/tests/static-content.test.cjs')));
    const report={documentType:'next-03-code-connect-static-source-api-review-handoff',version:1,observedAt:new Date().toISOString(),
        status:'Draft-source-api-review-complete-Generation-wire-not-supported',accepted:false,executionAllowed:false,normative:false,
        targetSupport:a.targetSupport,generationWireSupport:a.generationWireSupport,generationPlanHash:null,
        producerManifest:{...filePin(path.join(__dirname,'producer.v1-draft.json')),artifactDigest:a.artifactDigest},
        requestPins:a.requestPins,consumerVector:a.consumerVector,versions:{...a.consumerVersions,aruiPrivate:r.source.version,registry:r.registryVersion},
        frozen:{...a.frozen,source:r.source,sourceFilesVerified:r.source.files.length,mappingArtifactsVerified:r.mappingArtifacts.length},
        closure:{producerFiles:a.producerFiles.length,apiEvidenceFiles:a.apiEvidenceFiles.length,consumerFiles:a.consumerFiles.length,
            workspaceConsumerFiles:a.workspaceConsumerFiles.length,buildInputs:a.buildInputs.length,
            consumerFilesDigest:digest(a.consumerFiles),workspaceConsumerFilesDigest:digest(a.workspaceConsumerFiles),buildInputsDigest:digest(a.buildInputs),
            sourceApiFilesDigest:digest(a.apiEvidenceFiles)},
        checks:{tests:{...filePin(testLog),total:62,legacy:43,static:19,passed:62,failed:0},typeChecks,apiProofSourceDigest,
            sourceFreshness:'pass; full frozen registry/lock/source/mapping/current-input dependency closure',continuity},
        outputs,files:ownFiles,productInput:{...productBefore,unchanged:true,rejection:productRejection,
            pending:['explicit per-action View','explicit disabled flags','explicit Loading=false','independent business priorityOrder','viewport height','actual allocated BG width']},
        consumerReviewRequest:filePin(path.join(__dirname,'CONSUMER_REVIEW_REQUEST.md')),
        limits:{sourceApiExpressibility:'bounded labels/View/disabled/Loading=false/order projection only',generationPlan:'not-created: real strict Ready source loader rejects BG59 Draft',
            sourceStatus:'BG59 Draft; nine nonExecutable context rules retained',profile:'not-accepted',parity:'not-confirmed',native:'not-accepted',scoped:'not-accepted',live:'not-run',
            canonical:'CC Body/all-four BG occurrence and symbol crosswalk absent; semantic ActionID is not canonical identity',
            width:'Overflow=false requested only; actual width/font/Addon/Spinner/readback unknown',installedPayload:'not-fully-hashed',
            registryLockWrites:0,sourceImplementationWrites:0,DSManualRuleCompilerZipWrites:0,sharedConsumerSchemaAdapterWrites:0,
            JSXTargetWrites:0,nativeTargetWrites:0,actualFigmaToolCalls:0,browserLiveRuns:0,newHandlersOrNoOpScenarios:0,installsOrPublication:0}};
    const reportFile=path.join(repo,'tools/code-connect/reports/NEXT-03-static-content-producer.2026-10-06.json');
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({report:filePin(reportFile),artifactDigest:a.artifactDigest,tests:62,outputs:outputs.map(p=>({path:p.path,sha256:p.sha256,
        apiExpressibility:p.apiExpressibility,generationSourceCode:p.generationSourceRead.code})),continuity}));
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
