// Final bounded evidence writer. No consumer edits, target operations or replay.
const fs=require('node:fs'),path=require('node:path');
const {hash,digest}=require('../../registry/source-inventory.cjs'),p=require('./producer.cjs'),h=require('./review-harness.cjs');
const filePin=file=>({path:file,sha256:hash(fs.readFileSync(file))});
function checked(pin){if(hash(fs.readFileSync(pin.path))!==pin.sha256)throw Error('STALE_HANDOFF_PIN: '+pin.path);}
function relativeChecked(pins,root){for(const pin of pins)checked({path:path.join(root,pin.path),sha256:pin.sha256});return {count:pins.length,digest:digest(pins)};}
async function main(){
    const a=p.loadArtifact(),fresh=p.verifyFresh(),basis=JSON.parse(fs.readFileSync(h.config().reportPin.path));
    checked(h.config().manifestPin);checked(h.config().reportPin);
    const request=JSON.parse(fs.readFileSync(a.requestPins[1].path));request.currentFiles.forEach(checked);
    relativeChecked(a.historicalSnapshotFiles,h.repo);
    const log='/private/tmp/next03-static-rebind-tests.log',text=fs.readFileSync(log,'utf8');
    if(!/^# tests 76$/m.test(text)||!/^# pass 76$/m.test(text)||!/^# fail 0$/m.test(text))throw Error('REBIND_TEST_RECEIPT_REQUIRED');
    const probePin=filePin('/private/tmp/next03-static-rebind/reader-probes.json'),probes=JSON.parse(fs.readFileSync(probePin.path));
    if(probes.current.length!==3||probes.historical.length!==3||probes.faults.length!==2)throw Error('REBIND_PROBE_COUNT');
    for(const row of probes.current){if(row.importStatus!=='inspected'||row.accepted!==false||row.executionAllowed!==false||row.generationPlanHash!==null
        ||row.consumerMismatches.length||row.strictRuntimeProbe.code!=='SOURCE_COMPILE'||row.targets.figma!=='blocked'||row.targets.frontend!=='blocked'
        ||digest(row.callerPins.manifest)!==digest(h.config().manifestPin)||digest(row.callerPins.report)!==digest(h.config().reportPin))throw Error('REBIND_CURRENT_PROBE_INVALID');
        const output=basis.outputs.find(o=>o.path===row.reviewPath);checked(output);
        if(row.producerPlanHash!==output.planHash||row.producerContentHash!==output.contentHash||row.producerObservationHash!==output.observationHash)throw Error('REBIND_OUTPUT_PROBE_MISMATCH');}
    for(const row of probes.historical)if(row.importStatus!=='stale'||row.consumerMismatches.length!==13||row.accepted!==false||row.executionAllowed!==false||row.generationPlanHash!==null)throw Error('REBIND_HISTORY_RELABELLED');
    const bg=probes.current[0].sourceCoverage.find(s=>s.componentId==='web-corp.buttons-group');
    if(bg.revision!==59||bg.compiledStatus!=='draft'||bg.nonExecutable!==9)throw Error('REBIND_SOURCE_PROMOTED');
    const apiLog='/private/tmp/next03-static-rebind-api-typecheck.log',legacyLog='/private/tmp/next03-static-rebind-legacy-typecheck.log';
    for(const log of [apiLog,legacyLog])if(fs.readFileSync(log,'utf8')!=='')throw Error('TYPECHECK_DIAGNOSTICS');
    const productFile=path.join(h.generation,'apps/apollo-v4/docs/desktop-content-actions-pilot.static-v1.input-draft.json'),product=filePin(productFile);
    if(product.sha256!=='7f79e78a3defd9575ab50c421e452139d6a3e0710a27c44c57d961f49480fb25')throw Error('PRODUCT_CHANGED');
    let rejection;try{await p.prepareStatic(JSON.parse(fs.readFileSync(productFile)));throw Error('PRODUCT_UNEXPECTEDLY_ACCEPTED');}
    catch(e){if(e.code!=='STATIC_INPUT_INVALID')throw e;rejection={code:e.code,diagnosticCodes:e.diagnostics.map(d=>d.code)};}
    const previous=JSON.parse(fs.readFileSync(path.join(h.repo,'tools/code-connect/reports/NEXT-02-r59-producer-refresh.2026-10-06.json'))).historicalBridge;
    for(const key of ['sourceBuildReport','recipeReport','environmentReceipt'])relativeChecked([previous[key]],h.repo);
    const build=JSON.parse(fs.readFileSync(path.join(h.repo,previous.sourceBuildReport.path))),recipe=JSON.parse(fs.readFileSync(path.join(h.repo,previous.recipeReport.path))),env=JSON.parse(fs.readFileSync(path.join(h.repo,previous.environmentReceipt.path)));
    const continuity={sourceArtifacts:relativeChecked([...build.source.originalFiles,...build.files,...build.outputFiles,...build.receiptFiles],h.repo),
        recipes:relativeChecked([...recipe.files,...recipe.artifacts],h.repo),selectiveDistribution:relativeChecked(build.distribution.filePins.map(p=>({path:path.join(build.distribution.path,p.path),sha256:p.sha256})),h.repo),
        installedManifests:relativeChecked(env.installed.map(p=>({path:'tools/code-connect/frontend-host/'+p.path+'/package.json',sha256:p.packageJsonSha256})),h.repo),
        meaning:'byte/API and installed-manifest continuity only; no historical live acceptance or full installed payload hash'};
    // Recheck all asynchronous-read-sensitive files immediately before handoff.
    p.verifyFresh();request.currentFiles.forEach(checked);relativeChecked(a.historicalSnapshotFiles,h.repo);checked(probePin);
    checked(h.config().manifestPin);checked(h.config().reportPin);basis.outputs.forEach(checked);checked(product);
    const ownFiles=fs.readdirSync(__dirname).map(f=>filePin(path.join(__dirname,f)));
    const report={documentType:'next-01-03-static-producer-exact-rebind-handoff',version:1,observedAt:new Date().toISOString(),
        status:'local-exact-rebind-and-independent-review-import-complete',accepted:false,executionAllowed:false,generationPlanHash:null,normative:false,
        reviewCallerConfig:{producerRoot:h.repo,workspaceRoot:h.workspace,manifestPin:h.config().manifestPin,reportPin:h.config().reportPin},
        producerManifest:{...h.config().manifestPin,artifactDigest:a.artifactDigest},independentBasisReport:h.config().reportPin,
        requestPins:a.requestPins,consumerVector:a.consumerVector,versions:{...a.consumerVersions,aruiPrivate:fresh.registry.source.version,registry:fresh.registry.registryVersion},
        frozen:a.frozen,currentSourcePackages:request.sourcePackages,historicalFiles:a.historicalSnapshotFiles,
        currentVectorProof:{requestedUniqueFiles:request.currentFiles.length,requestedFilesDigest:digest(request.currentFiles),consumerFiles:a.consumerFiles.length,
            workspaceConsumerFiles:a.workspaceConsumerFiles.length,buildInputs:a.buildInputs.length,producerFiles:a.producerFiles.length,apiEvidenceFiles:a.apiEvidenceFiles.length,
            consumerFilesDigest:digest(a.consumerFiles),workspaceConsumerFilesDigest:digest(a.workspaceConsumerFiles),buildInputsDigest:digest(a.buildInputs),apiEvidenceDigest:digest(a.apiEvidenceFiles)},
        finalConsumer:{runtime:filePin(path.join(h.generation,'apps/apollo-v4/dist/runtime.cjs')),main:filePin(path.join(h.generation,'apps/apollo-v4/dist/code.js')),
            UI:filePin(path.join(h.generation,'apps/apollo-v4/dist/ui.html')),manifest:filePin(path.join(h.generation,'apps/apollo-v4/dist/build-inputs.json'))},
        outputs:basis.outputs,readerProof:probePin,readResults:{current:probes.current,historical:probes.historical,faults:probes.faults},
        checks:{tests:{...filePin(log),total:76,legacyInteractive:43,existingStaticRetargeted:19,newInspection:14,passed:76,failed:0},
            typeChecks:[{config:'tools/code-connect/static-content/v1-draft/tsconfig.json',exitCode:0,log:filePin(apiLog)},
                {config:'tools/code-connect/tsconfig.json',exitCode:0,log:filePin(legacyLog)}],
            currentClosure:'reread/pass',postAsyncDrift:'producer and consumer rejected; no physical file mutation',
            historicalPreservation:'15 files byte-identical; old observations unchanged and explicitly stale',continuity},
        statusBoundaries:{freshness:'current producer/consumer/source/API/build correspond; historical snapshot stale',
            sourceApi:'bounded supported intent; unsupported View/priority preserved without callbacks',
            sourceCompilerMetadata:'fresh separate read-only standard compiler; BG59 Draft, nine nonExecutable rules; strict runtime SOURCE_COMPILE',
            coverage:'actual metadata counts preserved; predicates not evaluated; nine scoped checker receipts not accepted',
            GenerationExecution:'not-supported; producer/review hash is not a Generation CompositionPlan',
            profile:'not-accepted',native:'not-accepted',scoped:'not-accepted',targets:{figma:'blocked',frontend:'blocked'},parity:'not-confirmed',live:'not-run',release:'not-accepted',allFiveGoals:'unfinished'},
        productInput:{...product,unchanged:true,rejection,pending:['View','disabled','explicit Loading=false','independent priorityOrder','viewport height','actual BG allocated width']},
        effects:{frozenRegistryLockWrites:0,historicalSnapshotWrites:0,DSManualRuleCompilerZipWrites:0,sourceImplementationWrites:0,sharedConsumerSchemaAdapterWrites:0,
            JSXTargetWrites:0,nativeTargetWrites:0,FigmaToolCalls:0,browserLiveRuns:0,newHandlersOrNoOpScenarios:0,installsOrPublication:0,profileOrNativeScopedActivation:0},
        files:ownFiles,nextTechnicalStep:'General independently reads three new outputs with the exact caller-pinned manifest/basis report in this handoff and reviews bounded correspondence. Product decisions remain in General; canonical CC Body/all-four BG crosswalk, actual width/font readback, scoped receipts and exact static profile/native capability need separate evidence before target execution.'};
    const file=path.join(h.repo,'tools/code-connect/reports/NEXT-03-static-content-rebind-final.2026-10-06.json');fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({handoff:filePin(file),artifactDigest:a.artifactDigest,manifestPin:h.config().manifestPin,reportPin:h.config().reportPin,tests:76,
        currentImport:'three inspected / zero mismatches',historicalImport:'three stale / 13 mismatches each',source:'BG59 Draft / strict SOURCE_COMPILE',generationPlanHash:null}));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
