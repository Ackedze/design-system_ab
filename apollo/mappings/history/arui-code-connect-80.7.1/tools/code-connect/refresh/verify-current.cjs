// Additive bridge between immutable NEXT-05 receipts and the current producer.
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
const out = path.join(__dirname,'2026-10-05');
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
const historicalConsumer=require(path.join(history,'registry/consumer.cjs'));
if(bridge.emit.toString()!==historicalConsumer.emit.toString() || bridge.prepare.toString()!==historicalConsumer.prepare.toString())throw Error('Emit/plan behavior changed; reassess browser proof scope');
for(const mapping of registry.mappings) {
    const old=historicalRegistry.mappings.find(m=>m.id===mapping.id);
    for(const field of ['api','defaults','resolvedDefaults','boundTypeEvidence'])requireSame(mapping.code[field],old.code[field],`${mapping.id}/${field} changed`);
    for(const field of ['figma','platforms','propertyMappings','pilotProfile','internalDependencies'])requireSame(mapping[field],old[field],`${mapping.id}/${field} changed`);
}
const templates=['CorporateContent.figma.ts','CorporateContentMobile.figma.ts','ButtonsGroup.figma.ts'].map(name=>{
    const current=read(path.join(root,name)).toString(),old=read(path.join(history,name+'.snapshot')).toString();
    if(current.replace("codeRepresentationStatus: 'draft'","codeRepresentationStatus: 'proposed-for-authoring'")!==old)throw Error(`Template behavior changed: ${name}`);
    return {...pin(path.join(root,name)),change:'codeRepresentationStatus: proposed-for-authoring → draft; emitted logic/imports identical'};
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
    pin(e.node.executable,e.node.executableSha256),pin(b.environment.browser.executablePath,b.environment.browser.executableSha256),
];
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
fs.writeFileSync(path.join(out,'preflight.json'),JSON.stringify({registryVersion:registry.registryVersion,registryDigest:registry.registryDigest,
    lockHash:digest(lock),lockFileSha256:hash(read(path.join(root,'registry/lock.v1.json'))),desktopGeneratedFileUnchanged:true,
    results:results.map((r,i)=>({...r,snippet:bridge.emit(r.prepared),platform:i?'mobile-web':'desktop'}))},null,2)+'\n');
const testFiles=fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.test.cjs')).sort().map(n=>`tests/${n}`);
const tests=run('tests',['--test',...testFiles]);
const tap=read(path.join(out,'tests.log')).toString(),count=Number(tap.match(/# tests (\d+)/)?.[1]);
if(!count || !tap.includes(`# pass ${count}\n`) || !tap.includes('# fail 0\n'))throw Error('TAP success evidence missing');
tests.testCount=count;
const templateTypecheck=run('template-typecheck',['node_modules/typescript/bin/tsc','--noEmit','-p','tsconfig.json']);
const generatedTypecheck=run('generated-typecheck',['node_modules/typescript/bin/tsc','-p','refresh/2026-10-05/tsconfig.json']);
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
let normalization;
try {
    require(genDist).normalizeCodeConnect(registry,lock,{lock:{},lockHash:digest({}),components:[]},['arui-private.corporate-content.desktop'],digest);
    normalization='unexpected-success';
} catch(error) {normalization=error.message;}
const report={documentType:'code-connect-current-input-bridge',version:1,normative:false,observedAt:new Date().toISOString(),
    status:'current-input-freshness-and-api-availability-pass-with-integration-gap',pathBase:repo,
    registry:{path:'tools/code-connect/registry/arui-private-80.7.1.v1.json',version:registry.registryVersion,
        oldProducerDigest:inputs.BASIS,currentProducerDigest:registry.registryDigest,
        file:pin(path.join(root,'registry/arui-private-80.7.1.v1.json')),lock:pin(path.join(root,'registry/lock.v1.json')),
        lockDigest:digest(lock),currentInputsDigest:digest(observed),authoringBasis:registry.authoringBasis,
        historyIndex:pin(path.join(history,'index.json')),staleBeforeRefresh:historyIndex.staleBeforeRefresh,
        authoringManualsRewritten:false,archiveRegistryArchiveCycle:false},
    authorities:observed.authorities,currentInputPackages:observed.packages,
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
        compilerReproduction:'NEXT-02 authoritative handoff records shared compiler parity; this adapter does not reimplement the compiler',
        tests,templateTypecheck,generatedTypecheck,schema,
        cliParse:{status:'pass',templates:parsed.length,toolVersion:'2.0.1',artifact:pin(path.join(out,'code-connect.parsed.json')),
            log:pin(path.join(out,'code-connect.parse.log')),command:'node_modules/.bin/figma connect parse --config ../../figma.config.json --dir ../.. --skip-update-check --exit-on-unreadable-files'},
        sourceTrackedDiff:cp.execFileSync('git',['diff','--name-only','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
        oldAndCurrentPrepareEmitFunctions:'byte-identical function source; confirmed API/figma/property mappings/defaults/profile restrictions unchanged',
        templateMetadata:templates,publicImportResolution:imports,generatedDeclarationResolution:declarationResolutions},
    historicalBridge:{sourceBuildReport:base.pin,recipeReport:recipe.pin,environmentReceipt:environment.pin,
        originalArtifactSourceOutputPins:old67,recipePins:recipe26,selectiveDistribution:distribution115,
        installedManifests:{status:'pass',count:e.installed.length,pinsDigest:digest(e.installed),lockEntriesMatched:true,
            payloadScope:'Package manifests/version and locked integrity/resolution metadata verified; no historical full installed-package payload hash exists.'},
        environmentPins,oldSourceDigest:inputs.BASIS,oldSourceContracts:b.registry.lock.contracts,
        sourceVersion:registry.source.version,sourceCommit:registry.source.commit,
        desktopGeneratedFileIdenticalToHistorical:true,behaviorChanged:false,newBrowserRun:false,newLiveRun:false,
        receiptMeaning:'Historical browser receipts belong to their original 1.0.0 contract pins. These unchanged-code/dist/environment checks support API continuity only; they do not upgrade those receipts to current plan-bound acceptance.',
        recipeAuthority:'baseline and opt-in recipes remain proposed; no accepted profile or receipt was introduced'},
    generationHandoff:{status:normalization==='PRODUCER_SCHEMA'?'blocked-by-old-producer-version-gate':'needs-consumer-review',
        actualCurrentDistProbe:{scope:'negative version-gate probe only; empty view is not a generation proof',result:normalization,dist:pin(genDist)},
        source:pin(genSource),existingBasisCurrentProof:pin(genProof),
        requestedChanges:[
            'Update CodeConnectRegistry/normalizeCodeConnect version gate at code-connect.ts:37 to explicitly support 1.1.0 while retaining 1.0.0 history.',
            'Update CodeConnectLock and its exact expected lock at code-connect.ts:26/41: 1.1.0 adds basisRegistryDigest, currentInputsDigest and inputPackages (five complete root/transitive byte and semantic pin records). Validate them; never strip extras or disable freshness.',
            'Read producer authoringBasis/currentInputs and current root compiled/manual pins. Refresh Generation-owned input locks from actual authoritative ZIPs; retain exact dependency closure and independent source/code Draft states.',
            'Generate trusted current representation observations using immutable passport basis and current producer digest plus full evidence scope, codeHash and verifiedRefs. representation-proof.ts already checks basis/current separately. This report and inputObservation are source freshness evidence, not its plan-bound receipt.',
            'Keep native slot/owned occurrence writer capabilities and accepted parity/profile/receipt absent until separately proven. BG Source Draft and all code reps Draft still block Ready; do not infer acceptance from source API availability or proposed recipes.',
        ],generationFilesEdited:false,sharedSchemaAdded:false,otherThreadMessaged:false},
    preservedLimits:{buttonsGroup:{source:'draft',reviewedSourceRules:17,contextDraftRules:9,compiledChecks:30,
        route:'desktop Size=56, Overflow=false, one to four proven text actions with real handler refs and measured width requirement'},
        corporateContent:{sourceReadyScope:'six Figma rules/seventeen checks per platform; Body→children only',
            desktopRevision:13,mobileRevision:8,geometryPaddingSurfaceParity:'not-confirmed'},
        codeRepresentations:'draft',fullContractParity:'not-confirmed',acceptance:'not-run',nativeCapabilities:'not-declared',
        proposedRecipeAcceptance:'not-granted',newPlanBoundFrontendProof:'Generation-owned, not performed here',
        fullPrivateRootBuild:'not-reproduced',declaredPeerGap:e.peerGap,publication:'not-confirmed',release:'not-released'},
    files:[pin(__filename),pin(path.join(root,'tests/refresh.test.cjs')),...filesBelow(out).sort().map(f=>pin(f))],
};
if(report.checks.sourceTrackedDiff)throw Error('Tracked source changed; explicit review required');
const filename=path.join(root,'reports/NEXT-02-registry-refresh.2026-10-05.json');
fs.writeFileSync(filename,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({report:filename,sha256:hash(read(filename)),registryDigest:registry.registryDigest,
    freshness:'pass',availability:'pass',tests:count,historyPins:old67.count+recipe26.count+distribution115.count+e.installed.length,
    generationCompatibility:normalization},null,2));
