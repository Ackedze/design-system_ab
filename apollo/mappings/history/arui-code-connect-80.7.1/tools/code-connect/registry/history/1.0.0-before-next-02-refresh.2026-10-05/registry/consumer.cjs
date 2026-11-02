// Read-only, fail-closed adapter for NEXT-03. It does not edit contracts or files.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {hash, digest, publicExport} = require('./source-inventory.cjs');

class MappingError extends Error {
    constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; }
}
const fail = (code, detail) => { throw new MappingError(code, detail); };
function freeze(value) {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
}
function validateRegistry(registry) {
    if (registry.schemaVersion !== 'apollo.arui-private-mappings.v1' || registry.registryVersion !== '1.0.0') fail('UNSUPPORTED_REGISTRY', 'schema/version');
    if (!Array.isArray(registry.mappings) || !registry.mappings.length) fail('INVALID_REGISTRY', 'mappings');
    const ids = new Set();
    for (const mapping of registry.mappings) {
        if (ids.has(mapping.id)) fail('INVALID_REGISTRY', 'duplicate mapping'); ids.add(mapping.id);
        if (mapping.code.package !== 'arui-private' || !mapping.code.subpath.startsWith('arui-private/')) fail('UNAPPROVED_IMPORT', mapping.code.subpath);
        if (!mapping.platforms.length || !mapping.contract.archiveSha256?.match(/^[a-f0-9]{64}$/)) fail('INVALID_REGISTRY', mapping.id);
        if (mapping.status.fullContractParity !== 'not-confirmed') fail('INVALID_REGISTRY', 'parity evidence must be explicit');
    }
    const {registryDigest, ...rest} = registry;
    if (registryDigest !== digest(rest)) fail('REGISTRY_DIGEST_MISMATCH', 'registry modified');
    return registry;
}
function loadRegistry(file = path.join(__dirname, 'arui-private-80.7.1.v1.json')) {
    return freeze(validateRegistry(JSON.parse(fs.readFileSync(file, 'utf8'))));
}
function verifySource(registry, repo, workspaceRoot) {
    const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
    if (pkg.name !== registry.source.package || pkg.version !== registry.source.version) fail('STALE_CODE_VERSION', pkg.version);
    const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim();
    if (head !== registry.source.commit) fail('STALE_CODE_COMMIT', head);
    for (const pin of registry.source.files) {
        const file = path.join(repo, pin.path);
        if (!fs.existsSync(file) || hash(fs.readFileSync(file)) !== pin.sha256) fail('STALE_CODE_HASH', pin.path);
    }
    for (const pin of registry.mappingArtifacts) {
        const file = path.join(repo, pin.path);
        if (!fs.existsSync(file) || hash(fs.readFileSync(file)) !== pin.sha256) fail('STALE_MAPPING_HASH', pin.path);
    }
    for (const mapping of registry.mappings) {
        if (!publicExport(repo, mapping.code.subpath.split('/')[1], mapping.code.export)) fail('MISSING_PUBLIC_EXPORT', mapping.code.subpath);
        const archive = path.join(workspaceRoot, mapping.contract.archivePath);
        if (!fs.existsSync(archive) || hash(fs.readFileSync(archive)) !== mapping.contract.archiveSha256) fail('STALE_CONTRACT_PIN', mapping.contract.contractId);
    }
    return true;
}
function lockFor(registry) {
    return {registryVersion: registry.registryVersion, registryDigest: registry.registryDigest,
        codeVersion: registry.source.version, codeCommit: registry.source.commit,
        contracts: Object.fromEntries(registry.mappings.map(m => [m.id, m.contract.archiveSha256]))};
}
function verifyLock(registry, lock) {
    if (!lock || digest(lock) !== digest(lockFor(registry))) fail('STALE_MAPPING_LOCK', 'exact registry/code/contract lock required');
}
function resolve(registry, mappingId, platform) {
    const mapping = registry.mappings.find(m => m.id === mappingId);
    if (!mapping) fail('UNAVAILABLE_COMPONENT', mappingId);
    if (!mapping.platforms.includes(platform)) fail('UNSUPPORTED_PLATFORM', `${mappingId}/${platform}`);
    return mapping;
}
function assertProps(mapping, props = {}) {
    for (const name of Object.keys(props)) if (!mapping.code.api.some(p => p.name === name)) fail('UNSUPPORTED_PROP', `${mapping.id}.${name}`);
}
function prepare(registry, node, lock) {
    verifyLock(registry, lock);
    if (!node || typeof node !== 'object') fail('INVALID_PLAN_NODE', 'object required');
    const mapping = resolve(registry, node.mappingId, node.platform);
    if (node.import && node.import !== mapping.code.subpath) fail('UNAPPROVED_IMPORT', node.import);
    assertProps(mapping, node.props);
    if (node.figma?.representationId !== mapping.figma.representationId || node.figma?.componentKey !== mapping.figma.componentKey) fail('FIGMA_IDENTITY_MISMATCH', node.mappingId);
    const figmaKeys = mapping.kind === 'corporate-content' ? ['representationId','componentKey','slotProperty'] : ['representationId','componentKey','Size','Overflow'];
    if (Object.keys(node.figma).some(k => !figmaKeys.includes(k))) fail('UNMAPPED_FIGMA_INPUT', node.mappingId);
    if (node.slots && Object.keys(node.slots).some(k => k !== 'Body' || mapping.kind !== 'corporate-content')) fail('UNSUPPORTED_SLOT', Object.keys(node.slots).join(','));
    if (mapping.kind === 'corporate-content') {
        if (node.figma.slotProperty !== mapping.figma.bodyProperty) fail('UNSUPPORTED_SLOT_PROPERTY', node.figma.slotProperty);
        if ('children' in (node.props || {})) fail('AMBIGUOUS_BODY', 'use slots.Body, not a second children input');
        const props = node.props || {};
        if (Object.keys(props).some(k => !['id','className','dataTestId'].includes(k))) fail('UNMAPPED_CODE_PROP', 'theme and padding need explicit parity profile');
        if (Object.values(props).some(v => typeof v !== 'string')) fail('INVALID_PROP_TYPE', 'id/className/dataTestId must be strings');
        const body = node.slots?.Body ?? [];
        if (!Array.isArray(body)) fail('UNSUPPORTED_SLOT_PAYLOAD', 'Body must be an ordered sequence');
        const children = body.map(child => typeof child === 'string' ? child : prepare(registry, child, lock));
        if (body.some(child => child && typeof child === 'object' && child.platform !== node.platform)) fail('PLATFORM_MISMATCH', 'Body');
        return {mappingId: mapping.id, import: mapping.code.subpath, export: mapping.code.export, props, children, gaps: mapping.gaps};
    }
    if (node.slots) fail('UNSUPPORTED_SLOT', 'ButtonGroup has elements, not a Body/children slot');
    if (Object.keys(node.props || {}).length) fail('UNMAPPED_CODE_PROP', 'use size/actions inputs; explicit runtime-only props need a separate profile');
    if (node.figma.Overflow !== 'false') fail('OVERFLOW_PARITY_GAP', 'voluntary overflow has no Boolean code prop');
    if (!['32','40','48','56'].includes(node.figma.Size)) fail('UNSUPPORTED_SIZE', node.figma.Size);
    if (node.figma.Size !== '56') fail('UNVERIFIED_FIGMA_OCCURRENCES', 'non-56 variants require occurrence evidence');
    if (!Array.isArray(node.actions) || node.actions.length < 1 || node.actions.length > 4) fail('UNSUPPORTED_ACTION_COUNT', 'one to four desktop actions');
    const ids = new Set();
    const elements = node.actions.map((action, index) => {
        if (!action || typeof action !== 'object') fail('INVALID_ACTION', String(index));
        const allowed = ['id','label','view','disabled','onClick'];
        if (Object.keys(action).some(k => !allowed.includes(k))) fail('UNSUPPORTED_ACTION_PROP', action.id);
        if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(action.id || '') || ids.has(action.id)) fail('INVALID_ACTION_ID', action.id); ids.add(action.id);
        if (typeof action.label !== 'string' || !action.label.trim()) fail('INVALID_ACTION_LABEL', action.id);
        if (!['primary','secondary'].includes(action.view) || (action.view === 'primary' && index !== 0)) fail('PRIMARY_ORDER_GAP', action.id);
        if (typeof action.disabled !== 'boolean') fail('INVALID_ACTION_DISABLED', action.id);
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(action.onClick?.handlerRef || '')) fail('MISSING_EVENT_BINDING', action.id);
        return {children: action.label, disabled: action.disabled, onClick: action.onClick, dataTestId: action.id};
    });
    return {mappingId: mapping.id, import: mapping.code.subpath, export: mapping.code.export,
        props: {size: Number(node.figma.Size), primaryFirst: node.actions[0].view === 'primary', maxVisibleButtons: 4, elements},
        gaps: mapping.gaps, requiresRuntimeWidthFit: true};
}
function preflight(registry, node, lock, {repo, workspaceRoot}) {
    validateRegistry(registry);
    verifySource(registry, repo, workspaceRoot);
    const prepared = prepare(registry, node, lock);
    return {status:'availability-pass',targetProduct:'apollo-v4',fullContractParity:'not-confirmed',prepared};
}
function emit(prepared) {
    const q = JSON.stringify;
    if (prepared.export === 'CorporateContent') {
        const props = Object.entries(prepared.props).map(([k,v]) => ` ${k}={${q(v)}}`).join('');
        return `<CorporateContent${props}>${prepared.children.map(c => typeof c === 'string' ? `{${q(c)}}` : emit(c)).join('')}</CorporateContent>`;
    }
    const elements = prepared.props.elements.map(e => `{ children: ${q(e.children)}, disabled: ${e.disabled}, onClick: ${e.onClick.handlerRef}, dataTestId: ${q(e.dataTestId)} }`).join(', ');
    return `<ButtonGroup size={${prepared.props.size}} primaryFirst={${prepared.props.primaryFirst}} maxVisibleButtons={4} elements={[${elements}]} />`;
}
module.exports = {MappingError, validateRegistry, loadRegistry, verifySource, lockFor, verifyLock, resolve, assertProps, prepare, preflight, emit};
