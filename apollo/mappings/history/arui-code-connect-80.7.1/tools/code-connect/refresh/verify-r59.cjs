// Independent r59 bridge; prior producer/runtime reports remain immutable.
// Writes only this producer's refresh artifacts/report; never reruns a browser,
// accepts a profile, rebuilds the historical host, or edits an input contract.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const ts = require('typescript');
const {createRequire} = require('node:module');
const bridge = require('../registry/consumer.cjs');
const inputs = require('../registry/contract-inputs.cjs');
const {hash,digest} = require('../registry/source-inventory.cjs');
const root = path.resolve(__dirname,'..'), repo = path.resolve(root,'../..'), workspace = path.dirname(repo);
const out = path.join(__dirname,'2026-10-06');
const relative = file => path.relative(repo,file).split(path.sep).join('/');
const read = file => fs.readFileSync(file);
const requireSame = (actual,expected,note) => {if(digest(actual)!==digest(expected))throw Error(note);};
function pin(file,expected) {
    const sha256=hash(read(file));
    if(expected && sha256!==expected)throw Error(`Historical/current pin mismatch: ${file}`);
    return {path:relative(file),sha256};
}
function loadPinned(file,sha256) {const p=pin(file,sha256);return {pin:p,value:JSON.parse(read(file))};}
function checkFiles(base,pins) {for(const p of pins)pin(path.join(base,p.path),p.sha256);return {status:'pass',count:pins.length,pinsDigest:digest(pins)};}
function filesBelow(dir) {
    return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesBelow(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
function run(name,args) {
    const r=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
    const log=path.join(out,`${name}.log`);fs.writeFileSync(log,(r.stdout || '')+(r.stderr || ''));
    if(r.status!==0)throw Error(`${name} failed: ${r.stderr || r.stdout}`);
    return {status:'pass',executable:process.execPath,args,exitCode:r.status,log:pin(log)};
}
fs.mkdirSync(out,{recursive:true});
const registry=bridge.loadRegistry(),lock=JSON.parse(read(path.join(root,'registry/lock.v1.json')));
bridge.verifyLock(registry,lock);bridge.verifySource(registry,repo,workspace);
const observed=inputs.verifyInputs(registry,repo,workspace);
const history=path.join(repo,inputs.HISTORY),historyIndex=JSON.parse(read(path.join(history,'index.json')));
for(const p of historyIndex.files)pin(path.join(history,p.storedPath || p.path),p.sha256);
const historicalRegistry=bridge.loadRegistry(path.join(history,'registry/arui-private-80.7.1.v1.json'));
const refreshHistory=path.join(repo,inputs.REFRESH_HISTORY);
const previousIndex=JSON.parse(read(path.join(refreshHistory,'index.json')));
for(const p of previousIndex.files)pin(path.join(refreshHistory,p.storedPath),p.sha256);
const previous=bridge.loadRegistry(path.join(refreshHistory,'registry/arui-private-80.7.1.v1.json'));
const previousReport=loadPinned(path.join(root,'reports/NEXT-02-registry-refresh.2026-10-05.json'),'86cb0cad5f20a9e5723956815b3856df7456b0f5c1303339c389c5daa94239c1');
for(const p of previousReport.value.files) {
    const saved=previousIndex.files.find(f=>f.path===path.relative(root,path.join(repo,p.path)).split(path.sep).join('/'));
    pin(saved?path.join(refreshHistory,saved.storedPath):path.join(repo,p.path),p.sha256);
}
for(const current of registry.currentInputs.packages.filter(p=>p.componentId!=='web-corp.buttons-group')) {
    requireSame(current,previous.currentInputs.packages.find(p=>p.componentId===current.componentId),'Unchanged source/transitive pin vector changed');
}
const historicalConsumer=require(path.join(history,'registry/consumer.cjs'));
if(bridge.emit.toString()!==historicalConsumer.emit.toString() || bridge.prepare.toString()!==historicalConsumer.prepare.toString())throw Error('Emit/plan behavior changed; reassess browser proof scope');
for(const mapping of registry.mappings) {
    const old=historicalRegistry.mappings.find(m=>m.id===mapping.id);
    for(const field of ['api','defaults','resolvedDefaults','boundTypeEvidence'])requireSame(mapping.code[field],old.code[field],`${mapping.id}/${field} changed`);
    for(const field of ['figma','platforms','propertyMappings','pilotProfile','internalDependencies'])requireSame(mapping[field],old[field],`${mapping.id}/${field} changed`);
}
const templates=['CorporateContent.figma.ts','CorporateContentMobile.figma.ts','ButtonsGroup.figma.ts'].map(name=>{
    const current=read(path.join(root,name)).toString(),old=read(path.join(history,name+'.snapshot')).toString();
    const metadata="        sourceRevision: 59, sourcePredicateStatus: 'draft', reviewedSourceRules: 26,\n        nonExecutableRules: 9, sourceDraftReason: 'missing-context-runtime-facts-and-checkers',\n";
    if(current.replace(metadata,'').replace("codeRepresentationStatus: 'draft'","codeRepresentationStatus: 'proposed-for-authoring'")!==old)throw Error(`Template behavior changed: ${name}`);
    return {...pin(path.join(root,name)),change:name==='ButtonsGroup.figma.ts'?'r59 / 26 Reviewed / 9 nonExecutable / Source Draft metadata; emitted logic/imports identical':'unchanged from r58 producer'};
});
const base=loadPinned(path.join(root,'reports/NEXT-05-source-build.2026-10-05.json'),'dce4d24a90e7ad8baf34f840d74b7488ea7124599633bb2986e0c923b1a57b34');
const recipe=loadPinned(path.join(root,'reports/NEXT-05-api-recipes.2026-10-05.json'),'7db2310da5d6684d79f21da519edd08cfe929df8578f2b5d287793f58e5f9f8f');
const environment=loadPinned(path.join(root,'frontend-host/artifacts/environment-pins.json'),'e05ad523f903b89860e3e2070cce19bfdc54f927c4d43cda51db4f8b02b47d96');
const b=base.value,p=recipe.value,e=environment.value;
const old67=checkFiles(repo,[...b.files,...b.outputFiles,...b.receiptFiles,...b.source.originalFiles]);
const recipe26=checkFiles(repo,[...p.files,...p.artifacts]);
const distDir=path.join(repo,b.distribution.path);
requireSame(filesBelow(distDir).map(f=>path.relative(distDir,f).split(path.sep).join('/')).sort(),b.distribution.filePins.map(p=>p.path).sort(),'Selective distribution file set changed');
const distribution115=checkFiles(distDir,b.distribution.filePins);
for(const item of e.installed) {
    const filename=path.join(root,'frontend-host',item.path,'package.json');
    pin(filename,item.packageJsonSha256);
    const actual=JSON.parse(read(filename));if(actual.name!==item.name || actual.version!==item.version)throw Error(`Installed manifest changed: ${item.path}`);
}
const environmentPins=[
    pin(path.join(root,'frontend-host/package.json'),e.manifestSha256),
    pin(path.join(root,'frontend-host/package-lock.json'),e.npmLockSha256),
    pin(path.join(repo,'package.json'),e.sourcePackageJsonSha256),pin(path.join(repo,'yarn.lock'),e.sourceYarnLockSha256),
    pin(path.join(root,'package.json'),e.parentTooling.manifestSha256),pin(path.join(root,'package-lock.json'),e.parentTooling.lockSha256),
    pin(e.node.executable,e.node.executableSha256),
];
const browserFile=b.environment.browser.executablePath;
const browserSha=hash(read(browserFile));
const browserObservation={status:browserSha===b.environment.browser.executableSha256?'historical-binary-unchanged':'external-browser-binary-drift',
    executablePath:browserFile,historicalSha256:b.environment.browser.executableSha256,observedSha256:browserSha,
    historicalVersion:b.environment.browser.version,
    observedVersion:cp.execFileSync('python3',['-c','import plistlib;print(plistlib.load(open("/Applications/Google Chrome.app/Contents/Info.plist","rb"))["CFBundleShortVersionString"])'],{encoding:'utf8'}).trim(),
    browserRun:false,installationPerformed:false,historicalReceiptsRepinned:false,
    meaning:'External installed browser binary is observed read-only. Current API/source checks do not claim replay of the historical browser environment.'};
const npmLock=JSON.parse(read(path.join(root,'frontend-host/package-lock.json')));
for(const item of e.installed) {
    const locked=npmLock.packages[item.path];
    if(!locked || locked.version!==item.version || locked.integrity!==item.integrity || locked.resolved!==item.resolved)throw Error(`Installed/lock metadata mismatch: ${item.path}`);
}
const requireHost=createRequire(path.join(root,'frontend-host/package.json'));
const imports=registry.availabilityPolicy.allowedImports.map(specifier=>{
    const result=requireHost.resolve(specifier),expected=b.distribution.cjsResolution.find(r=>r.specifier===specifier);
    if(result!==expected.cjsResolvedPath)throw Error(`Public resolution changed: ${specifier}`);
    return {specifier,cjsResolvedPath:result,cjsFile:pin(result),realDeclaration:pin(expected.typesPath)};
});
const desktop=JSON.parse(read(path.join(root,'examples/pilot.desktop.plan.json')));
const mobileMapping=registry.mappings.find(m=>m.id==='arui-private.corporate-content.mobile-web');
const mobile={mappingId:mobileMapping.id,platform:'mobile-web',figma:{representationId:mobileMapping.figma.representationId,
    componentKey:mobileMapping.figma.componentKey,slotProperty:mobileMapping.figma.bodyProperty},slots:{Body:['Тестовый контент','Второй блок']}};
const results=[desktop,mobile].map(plan=>bridge.preflight(registry,plan,lock,{repo,workspaceRoot:workspace}));
const prior=read(path.join(root,'examples/PilotDesktop.generated.tsx')).toString();
if(!prior.includes(`return (${bridge.emit(results[0].prepared)});`))throw Error('Desktop JSX differs from immutable source');
fs.writeFileSync(path.join(out,'PilotDesktop.generated.tsx'),prior);
fs.writeFileSync(path.join(out,'MobileBody.generated.tsx'),'// Current API projection; source parity and live acceptance are not confirmed.\nimport { CorporateContent } from "arui-private/corporate-content";\nexport function MobileBody() { return ('+bridge.emit(results[1].prepared)+'); }\n');
fs.writeFileSync(path.join(out,'mobile.plan.json'),JSON.stringify(mobile,null,2)+'\n');
fs.writeFileSync(path.join(out,'tsconfig.json'),JSON.stringify({extends:'../../frontend-host/tsconfig.json',compilerOptions:{baseUrl:'.',typeRoots:['../../frontend-host/node_modules/@types'],
    paths:{'arui-private/*':['../../frontend-host/.work/source/dist/esm/*'],react:['../../frontend-host/node_modules/@types/react'],'react/*':['../../frontend-host/node_modules/@types/react/*']}},include:['*.generated.tsx']},null,2)+'\n');
fs.writeFileSync(path.join(out,'preflight.json'),JSON.stringify({registryVersion:registry.registryVersion,registryDigest:registry.registryDigest,
    lockHash:digest(lock),lockFileSha256:hash(read(path.join(root,'registry/lock.v1.json'))),desktopGeneratedFileUnchanged:true,
    results:results.map((r,i)=>({...r,snippet:bridge.emit(r.prepared),platform:i?'mobile-web':'desktop'}))},null,2)+'\n');
const tests={status:'pass',command:'npm test',exitCode:0,log:pin(path.join(out,'tests.log')),
    executedSource:registry.mappingArtifacts,testSource:pin(path.join(root,'tests/refresh.test.cjs'))};
const tap=read(path.join(out,'tests.log')).toString(),count=Number(tap.match(/# tests (\d+)/)?.[1]);
if(!count || !tap.includes(`# pass ${count}\n`) || !tap.includes('# fail 0\n'))throw Error('TAP success evidence missing');
tests.testCount=count;
const templateTypecheck=run('template-typecheck',['node_modules/typescript/bin/tsc','--noEmit','-p','tsconfig.json']);
const generatedTypecheck=run('generated-typecheck',['node_modules/typescript/bin/tsc','-p','refresh/2026-10-06/tsconfig.json']);
const schema=run('registry-schema',['registry/check-schema.cjs','/Users/alexkukhta/node_modules/ajv']);
const parsed=JSON.parse(read(path.join(out,'code-connect.parsed.json')));
if(parsed.length!==3 || new Set(parsed.map(d=>d.figmaNode)).size!==3 || parsed.some(d=>!d.templateData.isParserless || !d.template.includes("codeRepresentationStatus: 'draft'")))throw Error('Current CLI templates incomplete');
const options=ts.parseJsonConfigFileContent(ts.readConfigFile(path.join(out,'tsconfig.json'),ts.sys.readFile).config,ts.sys,out).options;
const declarationResolutions=registry.availabilityPolicy.allowedImports.map(specifier=>{
    const resolution=ts.resolveModuleName(specifier,path.join(out,'PilotDesktop.generated.tsx'),options,ts.sys).resolvedModule;
    if(!resolution || !resolution.resolvedFileName.startsWith(distDir))throw Error(`Generated types do not resolve to the real dist: ${specifier}`);
    return {specifier,resolvedFileName:resolution.resolvedFileName,sha256:hash(read(resolution.resolvedFileName))};
});
const genSource=path.join(workspace,'projects/Apollo-v3/packages/generation-core/src/planning/code-connect.ts');
const genProof=path.join(workspace,'projects/Apollo-v3/packages/generation-core/src/planning/representation-proof.ts');
const genDist=path.join(workspace,'projects/Apollo-v3/packages/generation-core/dist/planning.cjs');
require(genDist).verifyCodeConnectInputs(registry,lock,digest);
const normalization='producer-inputs-and-full-lock-pass';
const paths=[path.join(root,'registry/arui-private-80.7.1.v1.json'),path.join(root,'registry/lock.v1.json')];
const before=paths.map(f=>hash(read(f)));
const rebuilt=cp.execFileSync(process.execPath,['registry/build.cjs'],{cwd:root,encoding:'utf8'});
if(paths.some((f,i)=>hash(read(f))!==before[i]))throw Error('Producer rebuild changed bytes');
fs.writeFileSync(path.join(out,'producer-build.log'),rebuilt);
const report={documentType:'code-connect-r59-producer-handoff',version:1,normative:false,date:'2026-10-06',observedAt:new Date().toISOString(),
    status:'current-input-freshness-api-availability-and-consumer-format-pass',pathBase:repo,
    registry:{path:'tools/code-connect/registry/arui-private-80.7.1.v1.json',version:registry.registryVersion,
        oldProducerDigest:inputs.PREVIOUS_DIGEST,passportBasisDigest:inputs.BASIS,currentProducerDigest:registry.registryDigest,
        file:pin(path.join(root,'registry/arui-private-80.7.1.v1.json')),lock:pin(path.join(root,'registry/lock.v1.json')),
        lockDigest:digest(lock),currentInputsDigest:digest(observed),authoringBasis:registry.authoringBasis,
        basisHistoryIndex:pin(path.join(history,'index.json')),historyIndex:pin(path.join(refreshHistory,'index.json')),staleBeforeRefresh:previousIndex.staleBeforeRefresh,
        authoringManualsRewritten:false,archiveRegistryArchiveCycle:false},
    authorities:observed.authorities,supplementalAuthority:registry.refresh.supplementalAuthority,currentInputPackages:observed.packages,
    exactLock:lock,ownerReviewMetadata:registry.refresh,
    versions:{registrySchema:registry.schemaVersion,registry:['1.0.0','1.1.0'],inputObservation:1,
        manualSchema:'apollo.component-contract.manual.v2-experimental',compiledSchema:'apollo.component-contract.v2.1-experimental',
        editor:observed.authorityVersions.editor,sharedCore:observed.authorityVersions.core,
        codeEvidence:1,codeTransform:1,ownedOccurrence:1,collectionResolver:1,nativeSlotBinding:1,
        runtimeMarkers:observed.packages.map(p=>({componentId:p.componentId,policy:p.runtimePolicy})),
        declarationHandling:'Producer observes/pins these versions; native capture/writer and predicate execution are not provided by this adapter.',
        codeConnect:require('../node_modules/@figma/code-connect/package.json').version,typescript:ts.version,realCore:e.corePeer},
    checks:{loadRegistry:'pass',verifyLock:'pass',verifySource:'pass',preflight:results.map((r,i)=>({platform:i?'mobile-web':'desktop',status:r.status})),
        sourceApiEvidenceRefs:'all actual declared file SHA verified; package/version/commit/import/export/mapping/basis cross-checked',
        archiveAndMainManualFreshness:'all five exact archive/main-manual/manual-entry hashes verified; archive JSON equals main source',
        compiledAndEmbeddedDependencies:'all five canonical compiled hashes and exact embedded direct dependencies verified',
        compilerReproduction:'r59 authoritative handoff records shared compiler parity; actual authoring compiled file bytes and canonical ZIP equality checked for all five sources',
        producerRebuild:'registry and lock byte-identical after rebuild',
        tests,templateTypecheck,generatedTypecheck,schema,
        cliParse:{status:'pass',templates:parsed.length,toolVersion:'2.0.1',artifact:pin(path.join(out,'code-connect.parsed.json')),
            log:pin(path.join(out,'code-connect.parse.log')),command:'node_modules/.bin/figma connect parse --config ../../figma.config.json --dir ../.. --skip-update-check --exit-on-unreadable-files'},
        sourceTrackedDiff:cp.execFileSync('git',['diff','--name-only','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
        oldAndCurrentPrepareEmitFunctions:'byte-identical function source; confirmed API/figma/property mappings/defaults/profile restrictions unchanged',
        templateMetadata:templates,publicImportResolution:imports,generatedDeclarationResolution:declarationResolutions},
    historicalBridge:{previousRefreshReport:previousReport.pin,previousProducerDigest:inputs.PREVIOUS_DIGEST,
        previousRefreshFiles:'all exact hashes verified; intentionally updated producer/test files resolved through their immutable r58 snapshots',
        sourceBuildReport:base.pin,recipeReport:recipe.pin,environmentReceipt:environment.pin,
        originalArtifactSourceOutputPins:old67,recipePins:recipe26,selectiveDistribution:distribution115,
        installedManifests:{status:'pass',count:e.installed.length,pinsDigest:digest(e.installed),lockEntriesMatched:true,
            payloadScope:'Package manifests/version and locked integrity/resolution metadata verified; no historical full installed-package payload hash exists.'},
        environmentPins,browserObservation,oldSourceDigest:inputs.BASIS,oldSourceContracts:b.registry.lock.contracts,
        sourceVersion:registry.source.version,sourceCommit:registry.source.commit,
        desktopGeneratedFileIdenticalToHistorical:true,behaviorChanged:false,newBrowserRun:false,newLiveRun:false,
        receiptMeaning:'Historical browser receipts belong to their original 1.0.0 contract pins. Unchanged code/dist/package environment supports API continuity only. The external Chrome binary differs and is separately observed; historical runtime environment and plan-bound acceptance are not replayed or repinned.',
        recipeAuthority:'baseline and opt-in recipes remain proposed; no accepted profile or receipt was introduced',
        syntheticTestInputScope:'Existing Send/Cancel handlers/labels and mobile text are illustrative API test inputs, not owner product facts or an execution of the content-only pilot'},
    generationHandoff:{status:'producer-compatible-awaiting-consumer-rebuild',
        actualCurrentDistProbe:{scope:'actual Generation verifyCodeConnectInputs on current registry/full lock; no synthetic/native GenerationView or Ready claim',result:normalization,dist:pin(genDist)},
        source:pin(genSource),existingBasisCurrentProof:pin(genProof),
        requestedChanges:[
            'Existing Generation consumer already accepts the unchanged 1.1.0 format and current full lock. Rebuild production and refresh Generation-owned producer/recipe/build/lock observations sequentially against these new exact digests and BG r59 scope/pins.',
            'Previous r58 producer/runtime/native observations remain historical. Passport basis stays bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0; trusted current representation proofs must use the new producer digest, scopeHash, codeHash and verifiedRefs.',
            'All 26 BG norms are Reviewed; nine context-only rules remain nonExecutable and source Draft. Preserve the source/runtime gate; no compiler/core/checker change is authorized by this handoff.',
            'Owner scope is desktop CC native Body + BG Size56/Overflow=false/two text actions/content-only. Real labels/handlers/priority/lifecycle/width and native/profile authority are absent. Existing illustrative Send/Cancel test inputs must not become product facts.',
            'Code representations/profiles/acceptance remain Draft/not-run. No new native/profile authority, mutation, live call, publication or release is granted.',
        ],generationFilesEdited:false,sharedSchemaAdded:false,otherThreadMessaged:false},
    preservedLimits:{buttonsGroup:{source:'draft',reviewedSourceRules:26,contextDraftRules:0,contextOnlyNonExecutableRules:9,compiledChecks:30,
        route:'desktop Size=56, Overflow=false, one to four proven text actions with real handler refs and measured width requirement'},
        corporateContent:{sourceReadyScope:'six Figma rules/seventeen checks per platform; Body→children only',
            desktopRevision:13,mobileRevision:8,geometryPaddingSurfaceParity:'not-confirmed'},
        codeRepresentations:'draft',fullContractParity:'not-confirmed',acceptance:'not-run',nativeCapabilities:'not-declared',
        proposedRecipeAcceptance:'not-granted',newPlanBoundFrontendProof:'Generation-owned, not performed here',
        fullPrivateRootBuild:'not-reproduced',declaredPeerGap:e.peerGap,publication:'not-confirmed',release:'not-released'},
    files:[pin(__filename),pin(path.join(root,'tests/refresh.test.cjs')),...filesBelow(out).sort().map(f=>pin(f))],
};
if(report.checks.sourceTrackedDiff)throw Error('Tracked source changed; explicit review required');
const filename=path.join(root,'reports/NEXT-02-r59-producer-refresh.2026-10-06.json');
fs.writeFileSync(filename,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({report:filename,sha256:hash(read(filename)),registryDigest:registry.registryDigest,
    freshness:'pass',availability:'pass',tests:count,historyPins:old67.count+recipe26.count+distribution115.count+e.installed.length,
    generationCompatibility:normalization},null,2));
