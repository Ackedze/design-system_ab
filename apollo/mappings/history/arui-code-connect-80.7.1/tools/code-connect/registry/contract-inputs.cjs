// Producer-owned, read-only NEXT-02 observations. No shared runtime/compiler or
// native capture authority is implemented here. Canonical compiled hashes are
// checked against authoritative packaging, alongside exact archive byte pins.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {hash, digest} = require('./source-inventory.cjs');
const BASIS = 'bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0';
const HISTORY = 'tools/code-connect/registry/history/1.0.0-before-next-02-refresh.2026-10-05';
const REPORTS = 'shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports';
const TYPED_AUTHORITY = `${REPORTS}/next-02.typed-passport-summary.2026-10-05.json`;
const PACKAGING_AUTHORITY = `${REPORTS}/next-02.authoritative-packaging.2026-10-05.json`;
const R59_AUTHORITY = `${REPORTS}/NEXT-02.owner-review-r59-handoff.2026-10-06.json`;
// Keep the existing two-authority wire format understood by Generation.
// Stable typed declarations come from NEXT-02 and r59 history. The exact
// current catalog handoff proves the unchanged BG/CC five-input closure.
const AUTHORITIES = [R59_AUTHORITY,TYPED_AUTHORITY];
const CURRENT_AUTHORITY = 'arui-private/tools/code-connect/reports/current-catalog-producer-handoff.editor-0.2.94-core-0.1.13.2026-10-09.json';
const CURRENT_AUTHORITY_SHA = 'b271a238126649645111bdad22779fcfde67237c8a91b7deea2835a4e21869f8';
const CURRENT_HISTORY='tools/code-connect/registry/history/1.1.0-r60-before-benefit-r4-catalog.2026-10-09';
const R59_HISTORY='tools/code-connect/registry/history/1.1.0-r59-before-current-source-root.2026-10-09';
const REFRESH_HISTORY = 'tools/code-connect/registry/history/1.1.0-r58-before-owner-review-r59.2026-10-06';
const PREVIOUS_DIGEST = '129d129ea3b5b3e4bb112b2cccd1414f59ff8d22cde00721dd58a3dea978fa90';
const RUNTIME_VERSIONS = new Set(['rootTargetAliasesVersion','dependencySubjectConditionsVersion','assetIdentityLockVersion',
    'instanceMainComponentAliasesVersion','memberCollectionsVersion','occurrenceAddressVersion','directChildDependenciesVersion',
    'ruleOwnershipVersion','gradientPaintFactsVersion','ruleScopeFactsVersion','semanticTargetVisibilityVersion',
    'representationEvidenceVersion','crossRepresentationBindingsVersion','slotTargetFactsVersion','nativeSlotTargetsVersion',
    'validationModeVersion','validationIntentVersion','transitionFactsVersion']);
const fail = (code, detail) => { const e = new Error(`${code}: ${detail}`); e.code = code; throw e; };
const same = (actual, expected, code, detail) => { if (digest(actual) !== digest(expected)) fail(code, detail); };
function safeFile(root, relative) {
    if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => !p || p === '.' || p === '..')) fail('INVALID_INPUT_PATH', relative);
    const requested = path.join(root, relative);
    const catalog = 'shared/design-system_ab/experiments/current-contract-packages';
    if (!fs.existsSync(requested) && relative.startsWith(catalog + '/') && path.dirname(relative) === catalog) {
        const base = path.join(root, catalog);
        const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
        const matches = manifest.packages.filter(p => typeof p.file === 'string' && path.basename(p.file) === path.basename(relative));
        if (matches.length !== 1 || typeof matches[0].file !== 'string') fail('INVALID_INPUT_PATH', relative);
        const repositoryPaths = manifest.archivePathBase === 'design-system_ab', file = matches[0].file;
        if (manifest.archivePathBase !== undefined && !repositoryPaths) fail('INVALID_INPUT_PATH', relative);
        const parts = file.split('/');
        if (path.isAbsolute(file) || file.includes('\\') || parts.some(p => !p || p === '.' || p === '..' || (repositoryPaths ? /[<>:"|?*\x00-\x1f\x7f]/.test(p) : !/^[-\w.]+$/.test(p)))) fail('INVALID_INPUT_PATH', relative);
        if (repositoryPaths && (!file.startsWith('JSONS/web/components/') || path.basename(path.dirname(file)) !== 'packages')) fail('INVALID_INPUT_PATH', relative);
        const resolved = path.join(repositoryPaths ? path.resolve(base, '../..') : base, file);
        if (fs.realpathSync(resolved) !== resolved || !fs.lstatSync(resolved).isFile()) fail('INVALID_INPUT_PATH', relative);
        return resolved;
    }
    return requested;
}
function bytes(root, relative, expected, code) {
    const file = safeFile(root, relative);
    if (!fs.existsSync(file)) fail(code, relative);
    const value = fs.readFileSync(file);
    if (expected && hash(value) !== expected) fail(code, relative);
    return value;
}
function readArchive(root, relative) {
    const file = safeFile(root, relative);
    const result = cp.spawnSync('python3', ['-c',
        'import zipfile,json,hashlib,sys\nz=zipfile.ZipFile(sys.argv[1]);names=z.namelist();assert len(names)==len(set(names)),"duplicate ZIP entries"\nread=lambda n:{"sha256":hashlib.sha256(z.read(n)).hexdigest(),"json":json.loads(z.read(n))}\nprint(json.dumps({"manual":read("contract.manual.json"),"compiled":read("compiled/component-contract.v2.json"),"dependencies":{n:read(n) for n in names if n.startswith("dependencies/") and n.endswith("component-contract.v2.json")}}))', file],
        {encoding:'utf8', maxBuffer:64*1024*1024});
    if (result.status !== 0) fail('INVALID_CONTRACT_ARCHIVE', `${relative}: ${result.stderr.trim()}`);
    return JSON.parse(result.stdout);
}
function declarations(workspace) {
    const producerRaw=bytes(workspace,CURRENT_AUTHORITY,CURRENT_AUTHORITY_SHA,'STALE_CURRENT_AUTHORITY');
    const producer=JSON.parse(producerRaw),decision=producer.authorityDecision;
    if (producer.kind!=='exact-current-contract-package-handoff' || producer.fullAcceptance!==false
        || producer.normative!==false || producer.registryRefreshApplied!==false || producer.productionPublication!==false
        || producer.editorVersion!=='0.2.94' || producer.coreVersion!=='0.1.13'
        || producer.inputs?.length!==5 || producer.currentCatalogValidation?.allFivePackageBytesUnchanged!==true
        || producer.currentCatalogValidation?.BenefitCardMappingAdded!==false
        || producer.currentCatalogValidation?.sourceCodeTypedBindingsChanged!==false
        || producer.currentCatalogValidation?.sourceStatusPromoted!==false
        || producer.currentCatalogValidation?.representationStatusPromoted!==false
        || producer.currentCatalogValidation?.liveAcceptancePromoted!==false
        || decision?.status!=='CONFIRMED_FROM_EXPLICIT_OWNER_INSTRUCTION' || decision.workingRoot!==producer.workingRoot
        || !producer.sourcePredicateStatus?.ButtonsGroup?.startsWith('Draft:')) fail('INVALID_CURRENT_AUTHORITY','scope does not grant source/code/live acceptance');
    const authoringHost=path.resolve(producer.workingRoot,'../../../..');
    const relative=file=>{const p=path.relative(authoringHost,file).split(path.sep).join('/');safeFile(workspace,p);return p;};
    if (relative(producer.workingRoot)!=='shared/design-system_ab/experiments/current-contract-packages') fail('INVALID_CURRENT_AUTHORITY','explicit current source root required');
    for (const ref of producer.authorities) bytes(workspace,relative(ref.path),ref.sha256,'STALE_CURRENT_AUTHORITY_REF');
    const catalog='shared/design-system_ab/experiments/current-contract-packages';
    const manifest=JSON.parse(bytes(workspace,`${catalog}/manifest.json`,null,'MISSING_CURRENT_CATALOG'));
    const drafts=JSON.parse(bytes(workspace,`${catalog}/draft-manifest.json`,null,'MISSING_CURRENT_CATALOG'));
    if (manifest.schemaVersion!=='component-contract-package-collection.v1' || manifest.normative!==false
        || manifest.productionPublication!==false || manifest.workingRoot!==producer.workingRoot
        || manifest.sourcePathsAreProvenanceOnly!==true || !Array.isArray(manifest.packages)
        || drafts.schemaVersion!=='component-contract-package-drafts.v1' || drafts.normative!==false
        || drafts.sourceManifest!=='manifest.json' || !Array.isArray(drafts.packages)) fail('INVALID_CURRENT_CATALOG','schema/root/publication policy');
    const files=producer.inputs.map(p=>path.basename(relative(p.file)));
    if (new Set(files).size!==5) fail('INVALID_CURRENT_AUTHORITY','exact five distinct archive identities');
    const rows=files.map(file=>{
        const found=manifest.packages.filter(p=>path.basename(p.file)===file).map(p=>({...p,file:path.basename(p.file)}));
        if (found.length!==1) fail('STALE_CURRENT_CATALOG_CLOSURE',file);
        return found[0];
    });
    const draftRows=drafts.packages.filter(p=>files.includes(path.basename(p.file))).map(p=>({...p,file:path.basename(p.file)}));
    if (new Set(draftRows.map(p=>p.file)).size!==draftRows.length) fail('STALE_CURRENT_CATALOG_CLOSURE','duplicate draft archive identity');
    const sort=rows=>rows.slice().sort((a,b)=>a.file.localeCompare(b.file));
    const closure={manifest:{schemaVersion:manifest.schemaVersion,normative:manifest.normative,productionPublication:manifest.productionPublication,
        workingRoot:manifest.workingRoot,sourcePathsAreProvenanceOnly:manifest.sourcePathsAreProvenanceOnly,packages:sort(rows)},
        draftManifest:{schemaVersion:drafts.schemaVersion,normative:drafts.normative,sourceManifest:drafts.sourceManifest,packages:sort(draftRows)}};
    same(closure,producer.currentCatalogValidation.manifestClosure,'STALE_CURRENT_CATALOG_CLOSURE','exact mapped package records; no global timestamp or unrelated package adoption');
    const raw = AUTHORITIES.map(p => bytes(workspace, p, null, 'MISSING_INPUT_AUTHORITY'));
    const [handoff, summary] = raw.map(b => JSON.parse(b));
    const packagingRaw = bytes(workspace, PACKAGING_AUTHORITY, null, 'MISSING_INPUT_AUTHORITY');
    const packaging = JSON.parse(packagingRaw);
    if (summary.basisRegistryDigest !== BASIS || summary.versions?.editor !== '0.2.91' || summary.versions?.core !== '0.1.10') fail('UNSUPPORTED_INPUT_AUTHORITY', 'NEXT-02 basis/producer versions');
    if (summary.changes?.length !== 3 || packaging.checks?.length !== 2) fail('INVALID_INPUT_AUTHORITY', 'exact three roots and two transitive inputs');
    if (handoff.documentType !== 'next-02-owner-review-r59-producer-handoff' || handoff.sourcePins?.length !== 5
        || handoff.rootChange?.newRevision !== 59 || handoff.reviewedRules !== 26 || handoff.changedStatuses !== 9
        || handoff.nonExecutableContextRules !== 9 || handoff.predicateChecks !== 30 || handoff.sourceStatus !== 'draft'
        || handoff.codeRepresentationStatus !== 'draft' || handoff.codeParity !== 'not-confirmed' || handoff.codeAcceptance !== 'not-run'
        || handoff.pilot?.status !== 'owner-confirmed-scope-only' || handoff.pilot.confirmedRuntimeProfile !== false
        || !handoff.normTextsIdsRefsConditionsOwnersRoutesConstraintsUnchanged) fail('INVALID_R59_AUTHORITY', 'norm review cannot grant execution/profile authority');
    const expected = [
        ...summary.changes.map(c => ({...c, role:'root', revision:c.newRevision, archiveSha256:c.newArchiveSha256,
            manualSha256:c.newManualEntrySha256, manualSourceHash:c.newManualSourceHash, compiledHash:c.newCompiledHash,
            authoritativeFullFactsHash:c.sourceFactsHash})),
        ...packaging.checks.map(c => ({...c, role:'transitive', archiveSha256:c.newArchiveSha256,
            manualSha256:c.newManualEntrySha256, compiledHash:c.compiledHashAfter, authoritativeFullFactsHash:c.fullFactsHashAfter})),
    ];
    if (new Set(expected.map(c => c.archivePath)).size !== 5) fail('INVALID_INPUT_AUTHORITY', 'duplicate archive');
    const current = expected.map(e => {
        const source = handoff.sourcePins.find(p => relative(p.archivePath) === e.archivePath);
        if (!source || relative(source.manualPath) !== e.manualPath) fail('INVALID_R59_AUTHORITY', e.archivePath);
        const changed = source.name === 'ButtonsGroup';
        if (!changed && (source.revision !== e.revision || source.archiveSha256 !== e.archiveSha256
            || source.manualFileSha256 !== e.mainManualSha256 || source.manualSourceHash !== e.manualSourceHash
            || source.compiledHash !== e.compiledHash)) fail('UNEXPECTED_OTHER_INPUT_CHANGE', source.name);
        if (changed && (source.previousRevision !== e.revision || source.previousManualSourceHash !== e.manualSourceHash
            || source.previousCompiledHash !== e.compiledHash || source.previousArchiveSha256 !== e.archiveSha256)) fail('INVALID_R59_AUTHORITY', 'r58 provenance');
        return {...e,revision:source.revision,archiveSha256:source.archiveSha256,mainManualSha256:source.manualFileSha256,
            manualSourceHash:source.manualSourceHash,compiledHash:source.compiledHash,
            compiledPath:relative(source.compiledPath),compiledFileSha256:source.compiledFileSha256,
            ...(changed ? {manualSha256:handoff.rootChange.newManualEntrySha256,
                representationScopeHash:handoff.rootChange.newRepresentationScopeHash,
                authoritativeFullFactsHash:handoff.rootChange.sourceFactsHash} : {})};
    });
    const updated=current.map(e=>{
        const p=producer.inputs.find(p=>relative(p.file)===e.archivePath);
        if (!p) fail('INVALID_CURRENT_AUTHORITY',e.archivePath);
        if (e.component!=='ButtonsGroup') {
            if (p.revision!==e.revision || p.archiveSha256!==e.archiveSha256 || p.manualSourceHash!==e.manualSourceHash)
                fail('UNEXPECTED_OTHER_INPUT_CHANGE',e.archivePath);
            return e;
        }
        const manualRaw=bytes(workspace,relative(p.manual.path),p.manual.sha256,'STALE_MANUAL_PIN');
        const compiledRaw=bytes(workspace,relative(p.compiled.path),p.compiled.sha256,'STALE_COMPILED_SOURCE_PIN');
        const manual=JSON.parse(manualRaw),compiled=JSON.parse(compiledRaw);
        const recipeRef={path:relative(p.recipe.path),sha256:p.recipe.sha256};
        const recipe=JSON.parse(bytes(workspace,recipeRef.path,recipeRef.sha256,'STALE_RECIPE_PIN'));
        if (p.revision!==60 || p.componentId!=='web-corp.buttons-group' || p.contractId!=='buttons-group.desktop'
            || manual.metadata.revision!==60 || compiled.status!=='ready' || recipe.rules?.length!==9
            || recipe.status!=='draft' || recipe.runtimeAcceptance!=='not-run' || recipe.frontendImplementationVerified!==false
            || recipe.normsDeleted!==false) fail('CURRENT_SCOPE_MISMATCH','17 Figma rules do not accept nine recipe rules');
        if (digest(compiled.facts.variantEvidence)!==e.authoritativeFullFactsHash) fail('CURRENT_FACTS_MISMATCH',e.archivePath);
        return {...e,revision:p.revision,archiveSha256:p.archiveSha256,manualPath:relative(p.manual.path),
            mainManualSha256:p.manual.sha256,manualSha256:p.manual.sha256,manualSourceHash:p.manualSourceHash,
            compiledHash:digest(compiled),compiledPath:relative(p.compiled.path),compiledFileSha256:p.compiled.sha256,
            representationScopeHash:'4f6db7d6977175dd30d39c27b59c1f98e5c8c3e34021b7ce65236276cf36ca68',
            recipeRef,recipe,statuses:{...e.statuses,sourcePredicate:'draft'}};
    });
    return {summary,handoff,producer,expected:updated,authorities:[{path:CURRENT_AUTHORITY,sha256:hash(producerRaw)},{path:TYPED_AUTHORITY,sha256:hash(raw[1])}],
        historicalAuthority:{path:R59_AUTHORITY,sha256:hash(raw[0])},
        supplementalAuthority:{path:PACKAGING_AUTHORITY,sha256:hash(packagingRaw)}};
}
function dependencyPin(d) {
    return {componentId:d.componentId, revision:d.revision, manualSourceHash:d.manualSourceHash, compiledHash:d.compiledHash};
}
function observe(workspace) {
    const {producer, expected, authorities} = declarations(workspace);
    const loaded = expected.map(e => {
        bytes(workspace, e.archivePath, e.archiveSha256, 'STALE_CONTRACT_PIN');
        const main = bytes(workspace, e.manualPath, e.mainManualSha256, 'STALE_MANUAL_PIN');
        const archive = readArchive(workspace, e.archivePath), manual = archive.manual.json, compiled = archive.compiled.json;
        const projection = bytes(workspace,e.compiledPath,e.compiledFileSha256,'STALE_COMPILED_SOURCE_PIN');
        same(JSON.parse(projection),compiled,'COMPILED_SOURCE_MISMATCH',e.compiledPath);
        if (archive.manual.sha256 !== e.manualSha256) fail('STALE_MANUAL_ENTRY_PIN', e.archivePath);
        same(manual, JSON.parse(main), 'MANUAL_SOURCE_MISMATCH', e.manualPath);
        if (manual.schemaVersion !== 'apollo.component-contract.manual.v2-experimental'
            || manual.metadata.revision !== e.revision || compiled.package.id !== manual.component.contractId
            || compiled.package.componentId !== manual.component.componentId) fail('CONTRACT_IDENTITY_MISMATCH', e.archivePath);
        if (compiled.package.manualSourceHash !== e.manualSourceHash || digest(compiled) !== e.compiledHash) fail('STALE_COMPILED_PIN', e.archivePath);
        if (compiled.schemaVersion !== 'apollo.component-contract.v2.1-experimental' || compiled.runtimePolicy.engine !== 'apollo-predicate-engine'
            || compiled.runtimePolicy.unknownPolicy !== 'fail-closed' || compiled.runtimePolicy.compiledIsSourceOfTruth !== false) fail('UNSUPPORTED_CONTRACT_RUNTIME', e.archivePath);
        for (const [field, version] of Object.entries(compiled.runtimePolicy)) {
            if (field.endsWith('Version') && (!RUNTIME_VERSIONS.has(field)
                || version !== (field === 'validationIntentVersion' ? 2 : 1))) fail('UNSUPPORTED_CONTRACT_RUNTIME', field);
        }
        const pin = {role:e.role, componentId:manual.component.componentId, familyId:manual.component.familyId,
            contractId:manual.component.contractId, revision:e.revision, archivePath:e.archivePath, archiveSha256:e.archiveSha256,
            manualPath:e.manualPath, mainManualSha256:e.mainManualSha256, manualSha256:e.manualSha256,
            manualSourceHash:e.manualSourceHash, compiledHash:e.compiledHash, compiledEntrySha256:archive.compiled.sha256,
            compiledSchemaVersion:compiled.schemaVersion, compiledStatus:compiled.status,
            producer:compiled.package.sourceExportVersion, runtimePolicy:compiled.runtimePolicy, coverage:compiled.coverage,
            // Full facts/scope use the authority's algorithm; generatedFactsHash
            // can be a narrower projection and is deliberately recorded separately.
            authoritativeFullFactsHash:e.authoritativeFullFactsHash,
            compiledGeneratedFactsHash:compiled.package.generatedFactsHash,
            ...(e.representationScopeHash ? {representationScopeHash:e.representationScopeHash} : {}),
            dependencyPins:(manual.componentDependencies || []).map(dependencyPin),
            embeddedDependencies:Object.entries(archive.dependencies).map(([entry,value]) => ({entry, sha256:value.sha256,
                componentId:value.json.package.componentId, compiledHash:digest(value.json)})).sort((a,b) => a.entry.localeCompare(b.entry)),
        };
        if (e.role === 'root') {
            const representation = manual.representations.find(r => r.id === e.codeRepresentationId);
            if (!representation || representation.kind !== 'code' || representation.status !== 'draft'
                || representation.codeEvidence?.version !== 1) fail('CODE_EVIDENCE_INVALID', e.archivePath);
            same(representation.codeEvidence, e.codeEvidence, 'CODE_EVIDENCE_INVALID', e.archivePath);
            if (representation.locator.registryDigest !== BASIS || representation.codeEvidence.sourcePin.registryDigest !== BASIS) fail('CODE_BASIS_MISMATCH', e.archivePath);
            pin.codeRepresentation = {id:representation.id, status:representation.status, locator:representation.locator, codeEvidence:representation.codeEvidence};
            pin.sourcePredicateStatus = e.statuses.sourcePredicate;
            pin.authoritativeTypedBindingChanges = e.typedBindingChanges;
            pin.typedBindings = manual.semanticApi.flatMap(p => (p.bindings || []).filter(b => b.representationId === representation.id).map(b => ({portId:p.id,...b})));
            for (const binding of pin.typedBindings) for (const field of ['codeTransform','ownedOccurrence','nativeSlotBinding']) {
                if (binding[field] && binding[field].version !== 1) fail('UNSUPPORTED_TYPED_BINDING', field);
            }
            for (const binding of pin.typedBindings) if (binding.ownedOccurrence?.collectionResolver?.version !== undefined
                && binding.ownedOccurrence.collectionResolver.version !== 1) fail('UNSUPPORTED_TYPED_BINDING', 'collectionResolver');
            if (e.component === 'ButtonsGroup' && (manual.rules.length!==17 || manual.rules.some(r=>r.status!=='reviewed')
                || compiled.status!=='ready' || compiled.coverage.sourceRules!==17 || compiled.coverage.compiledRules!==30
                || compiled.coverage.nonExecutableRules!==0 || compiled.nonExecutableRules.length!==0
                || pin.sourcePredicateStatus!=='draft')) fail('CURRENT_SCOPE_MISMATCH','Figma compiled Ready does not promote Source Draft');
        }
        return {pin, archive};
    });
    const byId = new Map(loaded.map(c => [c.pin.componentId,c]));
    if (byId.size !== 5) fail('CONTRACT_IDENTITY_MISMATCH', 'duplicate component');
    for (const {pin,archive} of loaded) {
        if (pin.dependencyPins.length !== pin.embeddedDependencies.length) fail('DEPENDENCY_PIN_MISMATCH', pin.componentId);
        for (const dep of pin.dependencyPins) {
            const target = byId.get(dep.componentId);
            if (!target) fail('MISSING_TRANSITIVE_INPUT', dep.componentId);
            same(dependencyPin(target.pin), dep, 'DEPENDENCY_PIN_MISMATCH', dep.componentId);
            const embedded = Object.values(archive.dependencies).filter(v => v.json.package.componentId === dep.componentId);
            if (embedded.length !== 1 || digest(embedded[0].json) !== target.pin.compiledHash) fail('EMBEDDED_DEPENDENCY_MISMATCH', dep.componentId);
        }
    }
    return {version:1, basisRegistryDigest:BASIS, authorityVersions:{editor:producer.editorVersion,core:producer.coreVersion}, authorities,
        packages:loaded.map(c => c.pin).sort((a,b) => a.componentId.localeCompare(b.componentId))};
}
function verifyInputs(registry, repo, workspace) {
    const actual = observe(workspace);
    same(registry.currentInputs, actual, 'STALE_CURRENT_INPUTS', 'exact roots/transitive closure and authority required');
    const priorPath = `${HISTORY}/registry/arui-private-80.7.1.v1.json`;
    const prior = bytes(repo, priorPath, registry.authoringBasis.registrySha256, 'STALE_BASIS_REGISTRY');
    const historical = JSON.parse(prior), {registryDigest,...rest} = historical;
    if (registryDigest !== BASIS || digest(rest) !== BASIS || registry.authoringBasis.registryDigest !== BASIS
        || registry.authoringBasis.registryVersion !== '1.0.0'
        || registry.authoringBasis.registryPath !== priorPath) fail('CODE_BASIS_MISMATCH', 'history/registry basis');
    same(registry.refresh,refreshMetadata(repo,workspace),'STALE_REFRESH_METADATA','r59 provenance and owner scope');
    for (const mapping of registry.mappings) {
        const pin = actual.packages.find(p => p.componentId === mapping.contract.componentId && p.role === 'root');
        if (!pin) fail('MISSING_ROOT_INPUT', mapping.id);
        const c = mapping.contract;
        for (const field of ['contractId','revision','archivePath','archiveSha256','manualSha256','manualSourceHash','compiledHash','manualPath','mainManualSha256']) {
            if (c[field] !== pin[field]) fail('STALE_MAPPING_CONTRACT', `${mapping.id}.${field}`);
        }
        same(c.dependencyPins, pin.dependencyPins, 'DEPENDENCY_PIN_MISMATCH', mapping.id);
        same(c.coverage, pin.coverage, 'CONTRACT_STATUS_MISMATCH', mapping.id);
        if (c.compiledStatus !== pin.compiledStatus || c.sourcePredicateStatus !== pin.sourcePredicateStatus
            || mapping.status.sourcePredicate !== pin.sourcePredicateStatus || mapping.status.codeRepresentation !== 'draft'
            || mapping.status.apiMapping !== 'confirmed-source-api' || mapping.status.liveAcceptance !== 'not-run'
            || mapping.status.publication !== 'not-confirmed' || mapping.status.release !== 'not-released') fail('CONTRACT_STATUS_MISMATCH', mapping.id);
        if (mapping.kind === 'buttons-group') same(c.sourceReview,registry.refresh.sourceReview,'CONTRACT_STATUS_MISMATCH',mapping.id);
        same(mapping.code.codeEvidence, pin.codeRepresentation.codeEvidence, 'CODE_EVIDENCE_INVALID', mapping.id);
        same(mapping.code.typedBindings, pin.typedBindings, 'CODE_EVIDENCE_INVALID', mapping.id);
        const previous = historical.mappings.find(m => m.id === mapping.id);
        if (!previous) fail('CODE_BASIS_MISMATCH', mapping.id);
        for (const field of ['figma','platforms','propertyMappings','pilotProfile']) same(mapping[field], previous[field], 'MAPPING_COVERAGE_CHANGED', `${mapping.id}.${field}`);
        for (const field of ['api','defaults','resolvedDefaults','boundTypeEvidence']) same(mapping.code[field], previous.code[field], 'MAPPING_COVERAGE_CHANGED', `${mapping.id}.${field}`);
        const {locator,codeEvidence,id,status} = pin.codeRepresentation, source = codeEvidence.sourcePin;
        if (id !== mapping.code.proposedRepresentationId || status !== mapping.code.representationStatus
            || locator.mappingId !== mapping.id || source.mappingId !== mapping.id || locator.importPath !== mapping.code.subpath
            || locator.exportName !== mapping.code.export || locator.packageName !== registry.source.package
            || locator.packageVersion !== registry.source.version || locator.sourceCommit !== registry.source.commit
            || source.packageName !== registry.source.package || source.packageVersion !== registry.source.version
            || source.commit !== registry.source.commit || locator.registryDigest !== BASIS || source.registryDigest !== BASIS
            || locator.sourceIndex !== `arui-private/${mapping.code.source.index}`
            || locator.sourceImplementation !== `arui-private/${mapping.code.source.implementation}`) fail('CODE_BASIS_MISMATCH', mapping.id);
        if (codeEvidence.availability.status !== 'confirmed-source-api' || codeEvidence.parity.status !== 'not-confirmed'
            || codeEvidence.parity.profileIds.length || codeEvidence.acceptance.status !== 'not-run'
            || codeEvidence.acceptance.receiptRefs.length || codeEvidence.publication.status !== 'not-confirmed') fail('UNCONFIRMED_CODE_STATUS', mapping.id);
        for (const ref of codeEvidence.availability.evidenceRefs) bytes(repo, ref.path, ref.sha256, 'STALE_CODE_EVIDENCE_REF');
    }
    return actual;
}
function refreshMetadata(repo,workspace) {
    const {producer,expected,historicalAuthority,supplementalAuthority} = declarations(workspace);
    const file = `${REFRESH_HISTORY}/registry/arui-private-80.7.1.v1.json`;
    const oldRaw = bytes(repo,file,'c9d12596b43d1051992fa5e624f8e0aab533ebd97f45f0d6ac3586632c28290e','STALE_PREVIOUS_REGISTRY');
    const previous = JSON.parse(oldRaw),{registryDigest,...rest} = previous;
    if (registryDigest !== PREVIOUS_DIGEST || digest(rest) !== PREVIOUS_DIGEST) fail('STALE_PREVIOUS_REGISTRY',file);
    same(supplementalAuthority,previous.currentInputs.authorities.find(a=>a.path===PACKAGING_AUTHORITY),'STALE_SUPPLEMENTAL_AUTHORITY',PACKAGING_AUTHORITY);
    const r60Path=`${CURRENT_HISTORY}/registry/arui-private-80.7.1.v1.json`,r60LockPath=`${CURRENT_HISTORY}/registry/lock.v1.json`;
    const r60Raw=bytes(repo,r60Path,'e4f28c09256b575e3c0a3a03dadf94bd62cfb80df1e12e1416760a705d6d9179','STALE_PREVIOUS_R60_REGISTRY');
    const r60LockRaw=bytes(repo,r60LockPath,'70f03f36b74c2712228b0c1cd7c04bcfc871457eadf8b007bef27299b8922021','STALE_PREVIOUS_R60_LOCK');
    const r60=JSON.parse(r60Raw),bridge=require('./consumer.cjs');
    bridge.validateRegistry(r60);bridge.verifyLock(r60,JSON.parse(r60LockRaw));
    if (r60.registryDigest!=='0dde661d9cee57a76f3b1753b8ba62e87a329902af4738bf1d75552e55f131b4') fail('STALE_PREVIOUS_R60_REGISTRY','exact predecessor required');
    const r59Path=`${R59_HISTORY}/registry/arui-private-80.7.1.v1.json`,r59LockPath=`${R59_HISTORY}/registry/lock.v1.json`;
    const r59Raw=bytes(repo,r59Path,'349073c8922f8c4437451a086714f08d63dbfd1164218d600610afdfb9eec1a8','STALE_PREVIOUS_R59_REGISTRY');
    const r59LockRaw=bytes(repo,r59LockPath,'31304cb886f5371cf8200179911352685a1a4889a8c3e31490383b46771fcd2e','STALE_PREVIOUS_R59_LOCK');
    const r59=JSON.parse(r59Raw);bridge.validateRegistry(r59);bridge.verifyLock(r59,JSON.parse(r59LockRaw));
    const bg=expected.find(e=>e.component==='ButtonsGroup');
    return {id:'2026-10-09-current-catalog-editor-0.2.94-core-0.1.13',date:'2026-10-09',formatUnchanged:true,
        previousProducer:{registryVersion:r60.registryVersion,registryDigest:r60.registryDigest,registryPath:r60Path,registrySha256:hash(r60Raw),lockPath:r60LockPath,lockSha256:hash(r60LockRaw)},
        historicalR59Producer:{registryVersion:r59.registryVersion,registryDigest:r59.registryDigest,registryPath:r59Path,registrySha256:hash(r59Raw),lockPath:r59LockPath,lockSha256:hash(r59LockRaw)},
        historicalPreviousProducer:{registryVersion:previous.registryVersion,registryDigest:PREVIOUS_DIGEST,registryPath:file,registrySha256:hash(oldRaw)},
        supplementalAuthority,historicalAuthority,currentAuthority:{path:CURRENT_AUTHORITY,sha256:CURRENT_AUTHORITY_SHA},
        currentSourceRoot:'shared/design-system_ab/experiments/current-contract-packages',fullAcceptance:false,
        sourceReview:{reviewedRules:17,contextOnlyRules:9,nonExecutableRules:0,predicateChecks:30,
            executionStatus:'draft',compiledFigmaStatus:'ready',reason:producer.sourcePredicateStatus.ButtonsGroup},
        recipe:{...bg.recipeRef,rules:9,status:'draft',runtimeAcceptance:'not-run'},ownerPilotScope:JSON.parse(bytes(workspace,R59_AUTHORITY,historicalAuthority.sha256,'STALE_HISTORICAL_AUTHORITY')).pilot,
        scopeAuthority:'current desktop Figma predicates only; recipe/source/code/live acceptance remains separate'};
}
module.exports = {resolveInputFile:safeFile,BASIS,HISTORY,AUTHORITIES,REFRESH_HISTORY,PREVIOUS_DIGEST,readArchive,observe,verifyInputs,dependencyPin,refreshMetadata};
