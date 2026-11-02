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
const AUTHORITIES = [`${REPORTS}/next-02.typed-passport-summary.2026-10-05.json`, `${REPORTS}/next-02.authoritative-packaging.2026-10-05.json`];
const RUNTIME_VERSIONS = new Set(['rootTargetAliasesVersion','dependencySubjectConditionsVersion','assetIdentityLockVersion',
    'instanceMainComponentAliasesVersion','memberCollectionsVersion','occurrenceAddressVersion','directChildDependenciesVersion',
    'ruleOwnershipVersion','gradientPaintFactsVersion','ruleScopeFactsVersion','semanticTargetVisibilityVersion',
    'representationEvidenceVersion','crossRepresentationBindingsVersion','slotTargetFactsVersion','nativeSlotTargetsVersion',
    'validationModeVersion','validationIntentVersion','transitionFactsVersion']);
const fail = (code, detail) => { const e = new Error(`${code}: ${detail}`); e.code = code; throw e; };
const same = (actual, expected, code, detail) => { if (digest(actual) !== digest(expected)) fail(code, detail); };
function safeFile(root, relative) {
    if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => !p || p === '.' || p === '..')) fail('INVALID_INPUT_PATH', relative);
    return path.join(root, relative);
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
    const raw = AUTHORITIES.map(p => bytes(workspace, p, null, 'MISSING_INPUT_AUTHORITY'));
    const [summary, packaging] = raw.map(b => JSON.parse(b));
    if (summary.basisRegistryDigest !== BASIS || summary.versions?.editor !== '0.2.91' || summary.versions?.core !== '0.1.10') fail('UNSUPPORTED_INPUT_AUTHORITY', 'NEXT-02 basis/producer versions');
    if (summary.changes?.length !== 3 || packaging.checks?.length !== 2) fail('INVALID_INPUT_AUTHORITY', 'exact three roots and two transitive inputs');
    const expected = [
        ...summary.changes.map(c => ({...c, role:'root', revision:c.newRevision, archiveSha256:c.newArchiveSha256,
            manualSha256:c.newManualEntrySha256, manualSourceHash:c.newManualSourceHash, compiledHash:c.newCompiledHash,
            authoritativeFullFactsHash:c.sourceFactsHash})),
        ...packaging.checks.map(c => ({...c, role:'transitive', archiveSha256:c.newArchiveSha256,
            manualSha256:c.newManualEntrySha256, compiledHash:c.compiledHashAfter, authoritativeFullFactsHash:c.fullFactsHashAfter})),
    ];
    if (new Set(expected.map(c => c.archivePath)).size !== 5) fail('INVALID_INPUT_AUTHORITY', 'duplicate archive');
    return {summary, expected, authorities: AUTHORITIES.map((p,i) => ({path:p,sha256:hash(raw[i])}))};
}
function dependencyPin(d) {
    return {componentId:d.componentId, revision:d.revision, manualSourceHash:d.manualSourceHash, compiledHash:d.compiledHash};
}
function observe(workspace) {
    const {summary, expected, authorities} = declarations(workspace);
    const loaded = expected.map(e => {
        bytes(workspace, e.archivePath, e.archiveSha256, 'STALE_CONTRACT_PIN');
        const main = bytes(workspace, e.manualPath, e.mainManualSha256, 'STALE_MANUAL_PIN');
        const archive = readArchive(workspace, e.archivePath), manual = archive.manual.json, compiled = archive.compiled.json;
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
    return {version:1, basisRegistryDigest:BASIS, authorityVersions:summary.versions, authorities,
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
module.exports = {BASIS,HISTORY,AUTHORITIES,readArchive,observe,verifyInputs,dependencyPin};
