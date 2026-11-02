const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const root = __dirname, host = path.resolve(root, '../..'), tool = path.dirname(host), repo = path.resolve(host, '../../..');
const artifacts = path.join(root, 'artifacts');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const pin = file => ({path: path.relative(repo, file), sha256: hash(file)});
const check = (file, expected) => assert.equal(hash(file), expected, 'STALE_PIN: ' + file);
const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name); return entry.isDirectory() ? walk(file) : [file];
});
const baseFile = path.join(tool, 'reports/NEXT-05-source-build.2026-10-05.json');
check(baseFile, 'dce4d24a90e7ad8baf34f840d74b7488ea7124599633bb2986e0c923b1a57b34');
const previous = json(baseFile);
let inherited = 0;
for (const p of [...previous.files, ...previous.outputFiles, ...previous.receiptFiles, ...previous.source.originalFiles]) {
    check(path.join(repo, p.path), p.sha256); inherited++;
}
for (const p of previous.distribution.filePins) check(path.join(repo, previous.distribution.path, p.path), p.sha256);
const consumer = require(path.join(tool, 'registry/consumer.cjs'));
const registry = consumer.loadRegistry(), lock = json(path.join(tool, 'registry/lock.v1.json'));
consumer.verifyLock(registry, lock); consumer.verifySource(registry, repo, path.dirname(repo));
const environmentFile = path.join(host, 'artifacts/environment-pins.json'), environment = json(environmentFile);
for (const p of environment.installed) check(path.join(host, p.path, 'package.json'), p.packageJsonSha256);
check(process.execPath, environment.node.executableSha256); assert.equal(process.version, environment.node.version);
assert.equal(cp.execFileSync('git', ['diff', '--name-only', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim(), '');
const browserFile = path.join(artifacts, 'browser-receipt.json'), browser = json(browserFile);
assert.equal(browser.status, 'public-api-browser-checks-pass-proposed-for-review');
assert.equal(browser.observations.length, 9); assert.deepEqual(browser.pageErrors, []);
assert.equal(browser.commandProofs.length, 6);
assert.deepEqual(browser.consoleMessages, []); assert.deepEqual(browser.failedRequests, []);
check(path.join(root, 'browser-check.cjs'), browser.checkerSha256);
for (const p of [...browser.recipeInputPins, ...browser.bundlePins]) check(path.join(root, p.path), p.sha256);
check(browser.browser.executablePath, browser.browser.executableSha256);
check(path.join(root, browser.environmentReceipt.path), browser.environmentReceipt.sha256);
check(path.join(root, browser.sourceBuildReceipt.path), browser.sourceBuildReceipt.sha256);
assert.equal(fs.readFileSync(path.join(artifacts, 'typecheck.log'), 'utf8').trim(), '');
assert.match(fs.readFileSync(path.join(artifacts, 'build.log'), 'utf8'), /built in/);
const doctorFile = path.join(artifacts, 'react-doctor-full.log');
assert.match(fs.readFileSync(doctorFile, 'utf8'), /Score: 100 \/ 100/);
assert.match(fs.readFileSync(doctorFile, 'utf8'), /Scanned 5 files/);
const doctorRoot = '/private/tmp/apollo-code-connect-host-public-npm-cache/_npx/81e833f6d16d6127/node_modules/react-doctor';
const doctor = json(path.join(doctorRoot, 'package.json'));
const verified = {status: 'pins-pass', acceptedBaseReport: pin(baseFile), inheritedArtifactSourceOutputPins: inherited,
    selectiveDistributionPins: previous.distribution.filePins.length, installedManifestPins: environment.installed.length,
    registry: {digest: registry.registryDigest, file: pin(path.join(tool, 'registry/arui-private-80.7.1.v1.json')), lock: pin(path.join(tool, 'registry/lock.v1.json'))},
    originalSourcePins: previous.source.originalFiles, sourceVersion: previous.source.version, sourceCommit: previous.source.commit,
    frozenMappingPins: registry.mappingArtifacts, frozenContractPins: registry.mappings.map(m => ({
        mappingId: m.id, archivePath: m.contract.archivePath, archiveSha256: m.contract.archiveSha256})), protectedTrackedChanges: []};
fs.writeFileSync(path.join(artifacts, 'verification-receipt.json'), JSON.stringify(verified, null, 2) + '\n');
const evidenceFiles = [
    path.join(repo, 'src/button-group/button-group.tsx'), path.join(repo, 'src/button-group/typings.ts'),
    path.join(repo, 'src/button-group/hooks/use-button-group.ts'), path.join(repo, 'src/button-group/utils/get-picker-button-options.ts'),
    path.join(repo, 'src/button-group/utils/calculate-hidden-elements.ts'), path.join(repo, 'src/corporate-content/corporate-content.tsx'),
    path.join(host, 'node_modules/@alfalab/core-components-select/typings.d.ts'),
    path.join(host, 'node_modules/@alfalab/core-components-picker-button/desktop/Component.desktop.d.ts'),
    path.join(host, 'node_modules/@alfalab/core-components-picker-button/desktop/Component.desktop.js'),
];
const recipePins = ['src/recipe.tsx', 'src/application.ts', 'src/probe.tsx', 'src/probe.css', 'tsconfig.json', 'vite.config.mjs', 'index.html']
    .map(file => pin(path.join(root, file)));
const limitations = [
    {id:'EVENT_CONTEXT', repro:'real picker callbacks contain initiator OptionShape key and no MouseEvent<HTMLButtonElement>',
        requirement:'business command accepts Invocation union; Button-event-dependent handlers require caller adaptation',
        proposedOwnerChange:'document a keyed onActionSelect/command context if broader integration is required'},
    {id:'PRIMARY_RESERVATION', repro:'routing-two allocation 64: no visible actions, PRIMARY_HIDDEN and PICKER_CLIPPED',
        requirement:'block commands and reject profile; public API cannot reserve first primary below measured limit',
        proposedOwnerChange:'source algorithm reserves primary or exposes an official minimum/refusal outcome'},
    {id:'HIDDEN_MENU_ORDER', repro:'routing-four menu follows ascending input hidden indexes; after input reorder it follows cancel/defer/approve',
        requirement:'preserve input order; do not claim normative hidden-menu ordering parity',
        proposedOwnerChange:'document a public full hidden-options/order API if a different menu-only order is required'},
    {id:'DOM_MEASUREMENT', repro:'public ButtonGroupProps has no controlled visibility/measurement receipt',
        requirement:'exact source-pinned DOM observation; unknown shape fails closed',
        proposedOwnerChange:'document onOverflowChange or public measurement/controlled visibility API'},
    {id:'STALE_PORTAL_PROOF', repro:'open Picker menu closes after resize to 64; no surviving option for a real pointer event',
        requirement:'dispatch rechecks layout but surviving stale-portal denial is not browser-proven',
        proposedOwnerChange:null},
];
const profile = {schemaVersion:'local.desktop-action-proposal.v1', version:'1.0.0', date:'2026-10-05',
    pathBase:repo,
    status:'proposed-for-review', automaticAdoptionAllowed:false, normativeWidthAccepted:false,
    scopedReady:false, fullContractParity:'not-confirmed', normativeSourceCompile:'pending',
    apolloV4ProxyExecution:'not-run', liveFigmaOrPublication:'not-run',
    source:{package:'arui-private',version:previous.source.version,commit:previous.source.commit,
        distribution:'genuine selective build of button-group/corporate-content closures',completePrivateDistribution:false,
        acceptedBuildReport:pin(baseFile),buildReceipt:pin(path.join(host,'artifacts/subpath-build.json')),
        registry:verified.registry,contractPins:verified.frozenContractPins,criticalApiEvidence:evidenceFiles.map(pin)},
    environment:{...previous.environment,browser:browser.browser,fontEvidence:browser.buttonFonts,
        systemFontFileHashAvailable:false,measurementRequiredPerConsumerFontEnvironment:true,
        detailsReceipt:pin(environmentFile),verifiedInstalledManifests:environment.installed.length,
        reactDoctor:{version:doctor.version,score:100,scope:'full proposal folder',packageJson:pin(path.join(doctorRoot,'package.json')),
            executable:pin(path.join(doctorRoot,'bin/react-doctor.js')),receipt:pin(doctorFile)}},
    recipePins,
    application:{type:'ProposalApplication',adapter:'src/application.ts#materializeProposal',component:'src/recipe.tsx#ProposedDesktopActions',
        fields:{profileId:'exact selected profile ID',platform:'desktop',size:56,groupId:'unique stable identifier',mode:'profile-specific mode',
            inlineSize:'finite positive caller allocation, constrained by Body maxInlineSize; measured, not normative',
            actions:'ordered immutable records {id,label,view,disabled,commandRef}'},
        commandBank:'own-key lookup commandRef -> (Invocation) => void; missing reference blocks materialization',
        invocation:{button:['groupId','actionId','source=button','real React MouseEvent<HTMLButtonElement>'],
            picker:['groupId','actionId','source=picker']},
        primaryPolicy:'primary only at input index 0; optional; first action must remain visible in opt-in overflow mode',
        sourceResponsiveModePrecondition:'consumer confirms actual Source desktop mode; this browser proof uses viewport 1600 and default Core configuration',
        excluded:['mobile','nested Picker elements','React-node action children','icons/addons','non-56 sizes'],
        example:{profileId:'desktop-size56.baseline-no-overflow.v1',groupId:'feedback-actions',platform:'desktop',size:56,
            mode:'baseline-no-overflow',inlineSize:640,allocationBasis:'laboratory example only; caller measures its own context',
            actions:[{id:'send',label:'Отправить',view:'primary',disabled:false,commandRef:'feedback.send'},
                {id:'cancel',label:'Отменить',view:'secondary',disabled:false,commandRef:'feedback.cancel'}]}},
    structuralBody:{owner:'caller composition proposal',style:{flex:'1 1 0%',minWidth:0,display:'flex',flexDirection:'column',alignItems:'stretch'},
        actionAllocation:{inlineSize:'caller-provided',maxInlineSize:'100%',minInlineSize:0},
        corporateContentSourceGeometryChanged:false,minimumWidthTokenCreated:false},
    guard:{statusSemantics:'pass means local measured recipe eligibility only',
        beforeEveryCommand:'readLayoutObservation rechecks current DOM/font state; reject unknown/disabled/non-pass',
        observation:'native ResizeObserver/MutationObserver and fonts.ready; source DOM identity via dataTestId',
        baselineRequired:['two visible actions','56 px button height','no clipping','no Picker','width sum <= actual allocation','protected source DOM identity'],
        overflowRequired:['leading action visible','primary visible if requested','Picker inside allocation when present','visible button heights 56'],
        onFailure:'allocation inert, command denied; source library rendering is preserved',
        requiredInlineSize:'sum of actual current wrapper widths and margins, not intrinsic minimum'},
    profiles:[
        {id:'desktop-size56.baseline-no-overflow.v1',mode:'baseline-no-overflow',actionCount:2,figmaIntent:{Size:'56',Overflow:'false'},
            routing:'native elements.onClick only',mapElementToPickerOption:false,pickerButtonProps:false,
            sourceAutoOverflowDisabled:false,requiresMeasuredNoOverflowGuard:true},
        {id:'desktop-size56.opt-in-overflow-commands.v1',mode:'opt-in-auto-overflow-commands',actionCount:[1,4],
            figmaOverflowFalseAutomaticMapping:false,routing:'real mapElementToPickerOption + pickerButtonProps.onChange',
            optionIdentity:'action.id mapped from exact element identity; runtime dispatch from payload.initiator.key',
            disabled:'source native disabled option plus command-side current action.disabled guard',
            menuOrder:'source input action order, no separate normative menu-order acceptance',
            independentOwnerReviewRequired:true}
    ],
    proofs:{browserReceipt:pin(browserFile),verificationReceipt:pin(path.join(artifacts,'verification-receipt.json')),
        observations:browser.observations.length,commandProofs:browser.commandProofs.length,tests:browser.tests,consoleErrorsOrWarnings:0,pageErrors:0,requestFailures:0,
        staleMenu:browser.staleMenu,codeAndBundlePinsRecordedAtBrowserLaunch:true},
    publicApiLimitations:limitations,
    inheritedRemainingGaps:previous.remainingGaps,
    remainingIntegration:['owner accepts profile/width/command semantics','Generation integrates explicit external profile port',
        'actual Apollo v4/Proxy executor applies DTO and command bank and emits measurement/action receipts',
        'normative SOURCE_COMPILE and scoped parity/Ready evaluated separately'],
};
const profileFile = path.join(root, 'profile.v1.json');
fs.writeFileSync(profileFile, JSON.stringify(profile, null, 2) + '\n');
const ownFiles = walk(root).filter(file => !file.startsWith(artifacts + path.sep)).sort().map(pin);
const ownArtifacts = walk(artifacts).filter(file => path.basename(file) !== 'failure.png').sort().map(pin);
const report = {schemaVersion:1,task:'NEXT-05-public-api-recipes',date:'2026-10-05',
    pathBase:repo,
    status:'recipe-checks-pass-proposed-for-review',profile:pin(profileFile),entryPath:path.relative(repo,root),
    checkResults:{typecheck:'pass',productionBuild:'pass-with-existing-chunk-size-warning',browser:browser.status,
        browserObservations:browser.observations.length,reactDoctor:{version:doctor.version,scope:'full',score:100,scannedFiles:5},
        changedScope:'untracked source skipped; covered by full scan',inheritedPins:verified},
    source:profile.source,environment:profile.environment,files:ownFiles,artifacts:ownArtifacts,
    publicApiLimitations:limitations,inheritedRemainingGaps:previous.remainingGaps,
    sourceImplementationEdits:false,frozenRegistryOrMappingEdits:false,normativeContractEdits:false,
    generationProxyOrSharedSchemaEdits:false,newLiveFigmaWrites:false,
    readyOrParityAccepted:false,actualApolloV4Execution:false,
    next:profile.remainingIntegration};
const reportFile = path.join(tool,'reports/NEXT-05-api-recipes.2026-10-05.json');
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status:report.status,profile:pin(profileFile),report:pin(reportFile),
    verifiedInheritedPins:inherited,selectiveDistributionPins:verified.selectiveDistributionPins,
    installedManifestPins:verified.installedManifestPins,recipeFiles:ownFiles.length,artifacts:ownArtifacts.length,
    browserObservations:browser.observations.length,reactDoctorScore:100}));
