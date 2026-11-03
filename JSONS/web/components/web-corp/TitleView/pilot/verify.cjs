'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert/strict'), crypto = require('crypto');
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) => i % 2 ? pairs : pairs.concat([[value, all[i + 1]]]), []));
if (!['--apollo', '--proxy', '--contracts', '--output'].every(k => args[k]))
    throw Error('Usage: node verify.cjs --apollo <repo> --proxy <repo> --contracts <accepted contracts root> --output <new directory>');
const B = path.resolve(args['--apollo']), P = path.resolve(args['--proxy']), R = path.resolve(args['--output']), base = path.resolve(args['--contracts']), read = p => JSON.parse(fs.readFileSync(p)), copy = x => JSON.parse(JSON.stringify(x)), sha = b => crypto.createHash('sha256').update(b).digest('hex');
for (const source of [B, P, base, __dirname])
    assert(!R.startsWith(source + path.sep) && R !== source, 'Output must not overwrite inputs');
const descriptor = read(path.join(__dirname, 'catalog-source.json')), catalogFile = path.join(__dirname, descriptor.catalog.file), catalogBytes = fs.readFileSync(catalogFile);
assert.equal(sha(catalogBytes), descriptor.catalog.sha256);
assert.equal(catalogBytes.length, descriptor.catalog.bytes);
assert.equal(sha(fs.readFileSync(path.resolve(__dirname, descriptor.source.file))), descriptor.source.sha256);
const accepted = read(path.join(base, 'manifest.json')), prior = accepted.contracts.find(e => e.id === descriptor.contractId);
assert(prior && prior.revision === descriptor.revision && prior.manualSourceHash === descriptor.manualSourceHash, 'Contract revision/source mismatch');
const pinPaths = [__filename, path.join(__dirname, 'catalog-source.json'), catalogFile, path.join(base, 'manifest.json'), path.join(B, 'dist/runtime.cjs'), path.join(B, 'packages/component-contract-core/src/catalog-reference.ts'), path.join(B, 'packages/component-contract-core/src/catalog-configuration.ts')], pins = pinPaths.map(p => ({ path: p, sha256: sha(fs.readFileSync(p)) }));
fs.mkdirSync(R);
fs.cpSync(base, path.join(R, 'contracts'), { recursive: true });
const next = copy(accepted), old = next.rawCatalogs?.find(d => d.contractId === descriptor.contractId), destination = 'catalogs/' + descriptor.catalog.sha256 + '.json';
next.rawCatalogs = (next.rawCatalogs || []).filter(d => d.contractId !== descriptor.contractId);
next.rawCatalogs.push({ contractId: descriptor.contractId, componentId: descriptor.componentId, revision: descriptor.revision, representationIds: descriptor.representationIds, catalog: { file: destination, sha256: descriptor.catalog.sha256, bytes: descriptor.catalog.bytes } });
if (old && old.catalog.file !== destination && !next.rawCatalogs.some(d => d.catalog.file === old.catalog.file))
    fs.unlinkSync(path.join(R, 'contracts', old.catalog.file));
fs.mkdirSync(path.join(R, 'contracts/catalogs'), { recursive: true });
fs.writeFileSync(path.join(R, 'contracts', destination), catalogBytes);
next.id = require(path.join(P, 'src/data-release')).idOf(next);
fs.writeFileSync(path.join(R, 'contracts/manifest.json'), JSON.stringify(next, null, 2) + '\n');
require(B + '/node_modules/esbuild').buildSync({ absWorkingDir: B, entryPoints: ['packages/component-contract-core/src/catalog-reference.ts'], outfile: R + '/catalog.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node18' });
const catalog = require(R + '/catalog.cjs'), runtime = require(B + '/dist/runtime.cjs'), root = R + '/contracts', index = read(root + '/manifest.json'), entry = index.contracts.find(e => e.id === 'web-corp.title-view'), contract = runtime.loadAuthoringSource(read(root + '/' + entry.file), { evaluationMode: 'authoring-preview' }).contract, raw = read(root + '/' + index.rawCatalogs.find(d => d.contractId === entry.id).catalog.file), resolve = require(P + '/src/contracts/catalog').readCatalogReference;
const cases = [], inputs = [];
for (const component of raw.components.filter(c => ['[D] TitleView', '[M] TitleView'].includes(c.name)))
    for (const variant of component.variants) {
        const rep = contract.facts.representations.find(r => r.locator.componentKey === component.key), selection = { contractId: entry.id, componentId: entry.componentId, revision: entry.revision, representationId: rep.id, componentKey: variant.key, variantKey: variant.key };
        try {
            const response = resolve({ releaseId: index.id, selection }, root), prepared = catalog.buildCatalogReference(response, contract, { releaseId: index.id, selection }), witnesses = prepared.resourceRequirements.map(r => Object.assign({ kind: r.kind, sourceId: r.sourceId, sourceKey: r.sourceKey, consumerId: r.sourceId, consumerKey: r.sourceKey }, r.kind === 'collection' ? { consumerModes: prepared.sourceResources.collection[r.sourceId].modes } : {})), baseline = catalog.applyCatalogResourceRemap(prepared, witnesses), actual = copy(baseline.snapshot);
            actual.variantReference = copy(baseline.variantReference);
            const materialized = catalog.materializeCatalogBaseline(actual, baseline.snapshot), result = runtime.auditContractSnapshot(materialized.snapshot, contract, { evaluationMode: 'authoring-preview' });
            const row = { id: rep.platform + '-' + variant.name, platform: rep.platform, variant: variant.name, key: variant.key, nodes: actual.nodes.length, evaluations: result.engine.evaluations.length, classifications: result.engine.evaluations.reduce((m, e) => (m[e.classification] = (m[e.classification] || 0) + 1, m), {}), violations: result.engine.evaluations.filter(e => e.classification === 'violation').map(e => ({ rule: e.ruleId, node: e.subjectNodeId, trace: e.trace })), unknown: result.engine.evaluations.filter(e => e.classification === 'human-review').map(e => ({ rule: e.ruleId, node: e.subjectNodeId, trace: e.trace })) };
            cases.push(row);
            inputs.push({ selection, response, prepared, witnesses, baseline, actual: materialized.snapshot, result });
        }
        catch (e) {
            cases.push({ platform: rep.platform, variant: variant.name, key: variant.key, error: e.code || e.message, details: e.details });
        }
    }
fs.writeFileSync(R + '/BASE-CASES.json', JSON.stringify(cases, null, 2) + '\n');
fs.writeFileSync(R + '/RULE-INVENTORY.json', JSON.stringify(contract.rules, null, 2) + '\n');
assert.equal(inputs.length, 16, 'All16 references must resolve');
assert(cases.every(c => !c.violations.length), 'Source defaults must not violate own contract');
function get(n, p) { return p.split('.').reduce((v, k) => v?.[k], n); }
function set(n, p, v) { const keys = p.split('.'), last = keys.pop(); let o = n; for (const k of keys)
    o = o[k] ??= {}; o[last] = v; }
function different(v, fact) { if (fact.endsWith('styleId') || fact.endsWith('StyleId'))
    return v ? '' : 'local-style:pilot'; if (typeof v === 'number')
    return v + 7; if (typeof v === 'boolean')
    return !v; if (typeof v === 'string')
    return ({ 'HORIZONTAL': 'VERTICAL', 'VERTICAL': 'HORIZONTAL', 'NONE': 'HORIZONTAL', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'TOP': 'BOTTOM', 'BOTTOM': 'TOP', 'MIN': 'MAX', 'MAX': 'MIN', 'PASS_THROUGH': 'NORMAL', 'NORMAL': 'MULTIPLY', 'INSIDE': 'OUTSIDE', 'OUTSIDE': 'INSIDE', 'NONE': 'UPPER' })[v] || 'UPPER'; if (Array.isArray(v)) {
    if (fact === 'appearance.effects')
        return [{ type: 'DROP_SHADOW', radius: 8, offset: { x: 0, y: 4 }, color: { r: 0, g: 0, b: 0, a: .4 }, visible: true, blendMode: 'NORMAL' }];
    if (fact === 'appearance.dashPattern')
        return [2, 3];
    return v.length ? [] : [{ type: 'SOLID', visible: true, opacity: 1, tokenId: null, color: { r: 255, g: 0, b: 255 } }];
} if (v && typeof v === 'object') {
    const x = copy(v);
    if ('family' in x)
        x.family = 'Arial';
    else if ('value' in x)
        x.value += 3;
    else
        return null;
    return x;
} return null; }
const results = [];
for (const platform of ['desktop', 'mobile-web'])
    for (const rule of contract.rules) {
        let result = { platform, ruleId: rule.ruleId, rule: rule.presentation.title, status: 'NO_ELIGIBLE_CONTROL' }, attempts = [];
        const options = inputs.filter(i => i.actual.context.platform === platform).sort((a, b) => Number(a.actual.nodes[0].component.properties.Skeleton === 'True') - Number(b.actual.nodes[0].component.properties.Skeleton === 'True') || a.actual.nodes.length - b.actual.nodes.length);
        outer: for (const input of options) {
            const eligible = input.result.engine.evaluations.filter(e => e.ruleId === rule.ruleId && (e.classification === 'compliant' || rule.assert.actual?.fact === 'appearance.strokeWeight' && e.classification === 'not-applicable'));
            for (const e of eligible) {
                const changed = copy(input.actual), node = changed.nodes.find(n => n.id === e.subjectNodeId);
                let fact = rule.assert.actual?.fact;
                if (rule.assert.predicate === 'count-between') {
                    const title = changed.nodes.find(n => n.name === 'Title' && n.type === 'TEXT');
                    if (!title)
                        continue;
                    title.visible = false;
                    fact = 'visible';
                }
                else if (fact === 'textContentV1.characterCount') {
                    node.text.characters = '';
                    fact = 'text.characters';
                }
                else if (fact) {
                    if (fact === 'appearance.strokeWeight') {
                        node.propertyActivityV1.strokePresent = true;
                        node.appearance.stroke = [{ type: 'SOLID', visible: true, opacity: 1, tokenId: null, color: { r: 0, g: 0, b: 0 } }];
                    }
                    const value = different(get(node, fact), fact);
                    if (value === null)
                        continue;
                    set(node, fact, value);
                }
                else
                    continue;
                const evaluated = runtime.auditContractSnapshot(changed, contract, { evaluationMode: 'authoring-preview' }), found = evaluated.engine.evaluations.find(v => v.ruleId === rule.ruleId && v.subjectNodeId === e.subjectNodeId), violation = found?.classification === 'violation';
                attempts.push({ variant: input.selection.componentKey, node: node.name, fact, classification: found?.classification });
                if (violation) {
                    result = { platform, ruleId: rule.ruleId, rule: rule.presentation.title, status: 'VIOLATION_DETECTED', variantKey: input.selection.componentKey, subject: node.name, fact };
                    break outer;
                }
                if (attempts.length >= 6)
                    break outer;
            }
        }
        if (result.status !== 'VIOLATION_DETECTED')
            result.attempts = attempts;
        results.push(result);
    }
fs.writeFileSync(R + '/RULE-CONTROLS.json', JSON.stringify({ evidenceKind: 'offline-engine-controls-not-live-Figma-parity', results }, null, 2) + '\n');
assert.equal(results.filter(r => r.status === 'VIOLATION_DETECTED').length, 84, 'Every condition needs a negative control on both platforms');
const rows = [];
for (const input of inputs) {
    const props = input.baseline.snapshot.nodes[0].component, booleans = Object.keys(props.propertyTypes).filter(k => props.propertyTypes[k] === 'BOOLEAN'), total = 2 ** booleans.length, errors = new Map();
    let passed = 0;
    for (let mask = 0; mask < total; mask++) {
        const config = Object.assign({}, props.properties);
        booleans.forEach((key, bit) => config[key] = Boolean(mask & (1 << bit)));
        const prepared = Object.assign({}, input.prepared, { configuration: Object.assign({}, input.prepared.configuration, { config }) });
        try {
            catalog.applyCatalogResourceRemap(prepared, input.witnesses);
            passed++;
        }
        catch (e) {
            const key = e.code || e.message;
            if (!errors.has(key))
                errors.set(key, { code: key, count: 0, details: e.details, firstConfig: config });
            errors.get(key).count++;
        }
    }
    rows.push({ platform: input.actual.context.platform, variantKey: input.selection.componentKey, variant: input.response.variant.name, booleans, total, configured: passed, errors: Array.from(errors.values()), evidence: 'offline-independent-source-configuration-only; live geometry and audit parity unclaimed' });
}
fs.writeFileSync(R + '/STATE-CONTROLS.json', JSON.stringify(rows, null, 2) + '\n');
assert(rows.every(r => r.configured === r.total), 'All finite BOOLEAN configurations must project');
for (const pin of pins)
    assert.equal(sha(fs.readFileSync(pin.path)), pin.sha256, 'Input changed: ' + pin.path);
const report = { status: 'OFFLINE_CONTROLS_PASS_OWNER_FIELD_PARITY_PENDING', contract: entry.id, revision: entry.revision, sourceVariants: inputs.length, negativeControls: results.length, booleanConfigurations: rows.reduce((n, r) => n + r.total, 0), unknownSourceCases: cases.filter(c => c.unknown.length).map(c => ({ platform: c.platform, variant: c.variant, count: c.unknown.length })), pins, manualFigma: false, publication: false, limits: ['Synthetic actual snapshots exercise the existing engine; they do not prove native capture or live-library parity.', 'Skeleton and mixed-paint uncertainty remain explicit.', 'Other mode/slot/nested-variant configurations need separate independent evidence.'] };
fs.writeFileSync(R + '/RESULT.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, sourceVariants: report.sourceVariants, negativeControls: report.negativeControls, booleanConfigurations: report.booleanConfigurations, unknownSourceCases: report.unknownSourceCases.length }));
